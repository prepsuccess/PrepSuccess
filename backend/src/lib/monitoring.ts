import * as Sentry from "@sentry/node";
import type { Request } from "express";

import { env } from "../config/env.js";

/**
 * Error tracking (PRODUCTION_STANDARDS §4.2). Sentry is only switched on when
 * SENTRY_DSN is set, so local development and tests never send anything.
 * Only unexpected errors (500s) are reported — an AppError is an expected
 * outcome, not a bug. No request bodies or personal data are sent.
 */
export const monitoringEnabled = Boolean(env.SENTRY_DSN);

export function initMonitoring() {
  if (!monitoringEnabled) return;
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT ?? env.NODE_ENV,
    tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE,
    sendDefaultPii: false,
  });
}

export function captureError(error: unknown, req?: Request) {
  if (!monitoringEnabled) return;
  Sentry.withScope((scope) => {
    if (req) {
      scope.setTag("request_id", String(req.id));
      scope.setContext("request", { method: req.method, path: req.path });
      if (req.user) scope.setUser({ id: req.user.id });
    }
    Sentry.captureException(error);
  });
}

/** Sends anything queued before the process exits. */
export const flushMonitoring = (timeoutMs = 2000) =>
  monitoringEnabled ? Sentry.flush(timeoutMs) : Promise.resolve(true);
