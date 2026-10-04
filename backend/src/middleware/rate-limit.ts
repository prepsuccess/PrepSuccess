import type { Request } from "express";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";

import { env } from "../config/env.js";
import { AppError } from "../lib/http.js";

export interface RateLimitOptions {
  /**
   * "ip" (default) throttles per client IP. "user" throttles per signed-in
   * user (`req.user.id`), falling back to the IP when there's no user — use
   * it after requireAuth on costly per-user endpoints such as AI calls, so a
   * shared campus IP doesn't lock out a whole class and one user can't dodge
   * the limit by switching networks.
   */
  by?: "ip" | "user";
}

const ipKey = (req: Request) => ipKeyGenerator(req.ip ?? "");

/** Rate-limit key for the signed-in user, falling back to the client IP. */
export const userKey = (req: Request) => (req.user?.id ? `user:${req.user.id}` : ipKey(req));

/**
 * Per-IP (or per-user) throttle for sensitive endpoints (PRODUCTION_STANDARDS §3.3).
 * In-memory store: fine for one instance; switch to a Redis store if we scale out.
 */
export function rateLimitPerMinute(limit: number, { by = "ip" }: RateLimitOptions = {}) {
  return rateLimit({
    windowMs: 60_000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    ...(by === "user" ? { keyGenerator: userKey } : {}),
    skip: () => env.NODE_ENV === "test",
    handler: (_req, _res, next) => {
      next(new AppError(429, "TOO_MANY_REQUESTS", "Too many attempts. Please wait a minute."));
    },
  });
}

/** Shorthand for a per-user throttle (see RateLimitOptions.by). */
export const rateLimitPerUserPerMinute = (limit: number) =>
  rateLimitPerMinute(limit, { by: "user" });
