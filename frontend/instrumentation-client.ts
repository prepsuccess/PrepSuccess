import * as Sentry from "@sentry/nextjs";

// Browser error tracking (PRD-04 §3.3). Off unless NEXT_PUBLIC_SENTRY_DSN is
// set at build time. No session replay and no personal data are sent.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: 0,
    sendDefaultPii: false,
  });
}

export const onRouterTransitionStart = dsn ? Sentry.captureRouterTransitionStart : undefined;
