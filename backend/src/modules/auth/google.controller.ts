import type { Request, Response } from "express";
import { z } from "zod";

import { randomToken, safeEqual } from "../../lib/crypto.js";
import { AppError } from "../../lib/http.js";
import { googleStartQuerySchema } from "./auth.schemas.js";
import { loginWithGoogle } from "./auth.service.js";
import {
  createGoogleAuthRequest,
  exchangeGoogleCode,
  isGoogleConfigured,
} from "./google.client.js";
import {
  flowCookieOptions,
  redirectWithError,
  redirectWithSession,
  safeNext,
} from "./oauth-flow.js";

/**
 * Browser-facing Google sign-in. Both routes are full-page navigations, so the
 * callback always ends in a redirect to the frontend — tokens in the URL
 * fragment on success, `/login?error=<code>` on failure (see oauth-flow.ts).
 */

const COOKIE = "ps_google_oauth";
const cookieOptions = flowCookieOptions("/api/v1/auth/google");

const flowSchema = z.object({
  state: z.string(),
  verifier: z.string(),
  next: z.string().nullable(),
  // Absent in cookies set before nonces existed.
  nonce: z.string().nullable().default(null),
});

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
    redirectWithSession(res, session, flow);
  } catch (error) {
    if (error instanceof AppError) {
      return redirectWithError(res, error.code.toLowerCase());
    }
    req.log.error({ err: error }, "Google sign-in failed");
    return redirectWithError(res, "google_failed");
  }
}
