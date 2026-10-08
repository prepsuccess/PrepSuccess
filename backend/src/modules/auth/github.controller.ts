import type { Request, Response } from "express";
import { z } from "zod";

import { randomToken, safeEqual } from "../../lib/crypto.js";
import { AppError } from "../../lib/http.js";
import { githubStartQuerySchema } from "./auth.schemas.js";
import { loginWithGithub } from "./auth.service.js";
import { createGithubAuthUrl, exchangeGithubCode, isGithubConfigured } from "./github.client.js";
import {
  flowCookieOptions,
  redirectWithError,
  redirectWithSession,
  safeNext,
} from "./oauth-flow.js";

/**
 * Browser-facing GitHub sign-in, the same shape as the Google flow
 * (google.controller.ts): tokens in the URL fragment on success,
 * `/login?error=<code>` on failure.
 */

const COOKIE = "ps_github_oauth";
const cookieOptions = flowCookieOptions("/api/v1/auth/github");

const flowSchema = z.object({
  state: z.string(),
  next: z.string().nullable(),
  nonce: z.string().nullable(),
});

/** GET /api/v1/auth/github?next=/dashboard&nonce=… — sends the browser to GitHub's consent screen. */
export function startGithubLogin(req: Request, res: Response) {
  // A full-page navigation, so failures go back to the login page, not to JSON.
  if (!isGithubConfigured()) return redirectWithError(res, "github_not_configured");

  const query = githubStartQuerySchema.safeParse(req.query);
  if (!query.success) return redirectWithError(res, "github_failed");

  const state = randomToken(24);
  const flow = { state, next: safeNext(query.data.next), nonce: query.data.nonce ?? null };

  res.cookie(COOKIE, JSON.stringify(flow), cookieOptions);
  res.redirect(createGithubAuthUrl(state));
}

/** GET /api/v1/auth/github/callback — GitHub redirects here with ?code&state (or ?error). */
export async function githubCallback(req: Request, res: Response) {
  const raw: unknown = req.cookies?.[COOKIE];
  res.clearCookie(COOKIE, { ...cookieOptions, maxAge: undefined });

  if (typeof req.query.error === "string") {
    // access_denied when the user cancels on GitHub's consent screen.
    return redirectWithError(
      res,
      req.query.error === "access_denied" ? "github_cancelled" : "github_failed",
    );
  }

  let flow: z.infer<typeof flowSchema>;
  try {
    flow = flowSchema.parse(JSON.parse(typeof raw === "string" ? raw : ""));
  } catch {
    // Cookie missing (expired, different browser) — restart the flow.
    return redirectWithError(res, "github_session_expired");
  }

  const { code, state } = req.query;
  if (typeof code !== "string" || typeof state !== "string" || !safeEqual(state, flow.state)) {
    return redirectWithError(res, "github_failed");
  }

  try {
    const identity = await exchangeGithubCode(code);
    const session = await loginWithGithub(identity);
    redirectWithSession(res, session, flow);
  } catch (error) {
    if (error instanceof AppError) {
      return redirectWithError(res, error.code.toLowerCase());
    }
    // Errors from github.client carry only an HTTP status or GitHub's error code.
    req.log.error({ err: error }, "GitHub sign-in failed");
    return redirectWithError(res, "github_failed");
  }
}
