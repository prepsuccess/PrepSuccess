import { rateLimit } from "express-rate-limit";

import { env } from "../config/env.js";
import { AppError } from "../lib/http.js";

/**
 * Per-IP throttle for sensitive endpoints (PRODUCTION_STANDARDS §3.3).
 * In-memory store: fine for one instance; switch to a Redis store if we scale out.
 */
export function rateLimitPerMinute(limit: number) {
  return rateLimit({
    windowMs: 60_000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: () => env.NODE_ENV === "test",
    handler: (_req, _res, next) => {
      next(new AppError(429, "TOO_MANY_REQUESTS", "Too many attempts. Please wait a minute."));
    },
  });
}
