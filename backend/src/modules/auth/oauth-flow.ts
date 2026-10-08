import type { CookieOptions, Response } from "express";

import { env, isProduction } from "../../config/env.js";

/**
 * Pieces shared by the browser-facing OAuth sign-ins (Google, GitHub). Both
 * routes of each flow are full-page navigations, so the callback always ends
 * in a redirect to the frontend — tokens in the URL fragment on success
 * (fragments never reach a server or a Referer header), `/login?error=<code>`
 * on failure.
 */

/** The one-time flow cookie, scoped to one provider's routes and valid for 10 minutes. */
export function flowCookieOptions(path: string): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    // "lax" lets the cookie ride along on the provider's top-level redirect back to us.
    sameSite: "lax",
    path,
    maxAge: 10 * 60_000,
  };
}

const NEXT_BASE = "http://x.local";

/**
 * Same-site paths only, never another origin (mirrors safeNext in the
 * frontend). Resolved with the URL parser, so tricks like `/\evil.com` or
 * `/%09/evil.com` can't turn into an absolute URL in a browser.
 */
export function safeNext(value: unknown): string | null {
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

export function redirectWithError(res: Response, code: string) {
  res.redirect(`${env.FRONTEND_URL}/login?error=${encodeURIComponent(code)}`);
}

/** Hands a new session to the frontend's /auth/callback in the URL fragment. */
export function redirectWithSession(
  res: Response,
  session: { access_token: string; refresh_token: string },
  flow: { next: string | null; nonce: string | null },
) {
  const fragment = new URLSearchParams({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    ...(flow.next ? { next: flow.next } : {}),
    // Echoed back so the frontend can check it started this sign-in.
    ...(flow.nonce ? { nonce: flow.nonce } : {}),
  });
  res.redirect(`${env.FRONTEND_URL}/auth/callback#${fragment.toString()}`);
}
