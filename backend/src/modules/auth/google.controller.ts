import type { CookieOptions, Request, Response } from "express";
import { z } from "zod";

import { env, isProduction } from "../../config/env.js";
import { randomToken, safeEqual } from "../../lib/crypto.js";
import { AppError } from "../../lib/http.js";
import { googleStartQuerySchema } from "./auth.schemas.js";
import { loginWithGoogle } from "./auth.service.js";
import {
  createGoogleAuthRequest,
  exchangeGoogleCode,
  isGoogleConfigured,
} from "./google.client.js";

/**
 * Browser-facing Google sign-in. Both routes are full-page navigations, so the
 * callback always ends in a redirect to the frontend — tokens in the URL
 * fragment on success (fragments never reach a server or a Referer header),
 * `/login?error=<code>` on failure.
 */

const COOKIE = "ps_google_oauth";
const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  // "lax" lets the cookie ride along on Google's top-level redirect back to us.
  sameSite: "lax",
  path: "/api/v1/auth/google",
  maxAge: 10 * 60_000,
};

const flowSchema = z.object({
  state: z.string(),
  verifier: z.string(),
  next: z.string().nullable(),
  // Absent in cookies set before nonces existed.
  nonce: z.string().nullable().default(null),
});

const NEXT_BASE = "http://x.local";

/**
 * Same-site paths only, never another origin (mirrors safeNext in the
 * frontend). Resolved with the URL parser, so tricks like `/\evil.com` or
 * `/%09/evil.com` can't turn into an absolute URL in a browser.
 */
function safeNext(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/") || value.includes("\\")) return null;
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    if (c < 0x20 || c === 0x7f) return null;
  }
  try {
    const url = new URL(value, NEXT_BASE);
    if (url.origin !== NEXT_BASE || !url.pathname.startsWith("/")) return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}

function redirectWithError(res: Response, code: string) {
  res.redirect(`${env.FRONTEND_URL}/login?error=${encodeURIComponent(code)}`);
}

/** GET /api/v1/auth/google?next=/dashboard&nonce=… — sends the browser to Google's consent screen. */
export async function startGoogleLogin(req: Request, res: Response) {
  // A full-page navigation, so failures go back to the login page, not to JSON.
  if (!isGoogleConfigured()) return redirectWithError(res, "google_not_configured");

  const query = googleStartQuerySchema.safeParse(req.query);
  if (!query.success) return redirectWithError(res, "google_failed");

  const state = randomToken(24);
  const { url, codeVerifier } = await createGoogleAuthRequest(state);
  const flow = {
    state,
    verifier: codeVerifier,
    next: safeNext(query.data.next),
    nonce: query.data.nonce ?? null,
  };

  res.cookie(COOKIE, JSON.stringify(flow), cookieOptions);
  res.redirect(url);
}

/** GET /api/v1/auth/google/callback — Google redirects here with ?code&state (or ?error). */
export async function googleCallback(req: Request, res: Response) {
  const raw: unknown = req.cookies?.[COOKIE];
  res.clearCookie(COOKIE, { ...cookieOptions, maxAge: undefined });

  if (typeof req.query.error === "string") {
    // e.g. access_denied when the user closes the consent screen.
    return redirectWithError(
      res,
      req.query.error === "access_denied" ? "google_cancelled" : "google_failed",
    );
  }

  let flow: z.infer<typeof flowSchema>;
  try {
    flow = flowSchema.parse(JSON.parse(typeof raw === "string" ? raw : ""));
  } catch {
    // Cookie missing (expired, different browser) — restart the flow.
    return redirectWithError(res, "google_session_expired");
  }

  const { code, state } = req.query;
  if (typeof code !== "string" || typeof state !== "string" || !safeEqual(state, flow.state)) {
    return redirectWithError(res, "google_failed");
  }

  try {
    const identity = await exchangeGoogleCode(code, flow.verifier);
    const session = await loginWithGoogle(identity);

    const fragment = new URLSearchParams({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      ...(flow.next ? { next: flow.next } : {}),
      // Echoed back so the frontend can check it started this sign-in.
      ...(flow.nonce ? { nonce: flow.nonce } : {}),
    });
    res.redirect(`${env.FRONTEND_URL}/auth/callback#${fragment.toString()}`);
  } catch (error) {
    if (error instanceof AppError) {
      return redirectWithError(res, error.code.toLowerCase());
    }
    req.log.error({ err: error }, "Google sign-in failed");
    return redirectWithError(res, "google_failed");
  }
}
