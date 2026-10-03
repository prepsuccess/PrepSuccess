import * as Sentry from "@sentry/nextjs";

// Server-side error tracking for pages Next renders on the server. Off unless
// NEXT_PUBLIC_SENTRY_DSN is set.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

export function register() {
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: 0,
    sendDefaultPii: false,
  });
}

export const onRequestError = Sentry.captureRequestError;
