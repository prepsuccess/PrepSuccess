# Security Review — Phase 1

**Date:** 3 October 2026 · **Scope:** backend API, frontend app, dependencies,
deployment config, as of branch `Prep-phase1-completion` · PRD-04 §3.4.

A pre-launch review of authentication, role checks, data boundaries and common
vulnerability classes. Re-run the dependency audit and this checklist before
each production release.

## Summary

| Area | Result |
|---|---|
| Dependencies (production) | **0 known vulnerabilities** in either app after fixes below |
| Authentication | Sound; one accepted risk (stateless access tokens) |
| Role checks & data boundaries | Enforced server-side on every route; covered by tests |
| Injection / XSS | No raw SQL with input; no HTML rendered from user or AI text |
| Secrets | None in the repository; production secrets live in Render/Vercel |
| Rate limiting | On every auth, AI and admin route |

## Fixed in this review

| # | Finding | Severity | Fix |
|---|---|---|---|
| 1 | `next` 16.3.5 — remote code execution in `next/og` ImageResponse (16.2.0–16.3.5) | Critical | Upgraded to 16.3.8. |
| 2 | Prisma CLI pulled `mysql2` <3.22 (credential leak, zlib DoS) and `deepmerge-ts` <8 (stack exhaustion) | High | npm `overrides` to `mysql2 ^3.22`, `deepmerge-ts ^8`; verified `prisma generate`, `validate`, `migrate diff`, tests. |
| 3 | `shadcn` CLI listed as a runtime dependency (brings `fast-glob`/`braces` advisories) | High (tooling) | Moved to `devDependencies` — only its CSS is used, at build time. |
| 4 | Frontend served no security headers | Medium | `next.config.ts`: `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS; `X-Powered-By` removed. |
| 5 | No error tracking | Medium | Sentry in both apps (DSN-gated; no PII, no request bodies). |

## Accepted risks / follow-ups

| # | Item | Why accepted | Follow-up |
|---|---|---|---|
| A | Dev-only `braces` advisory (all versions) via shadcn/eslint tooling | Never runs in production or on user input. | Re-check when a fixed release exists. |
| B | Access tokens are stateless JWTs: a deactivated user or changed role takes effect at the next refresh (≤ 30 min). Refresh tokens are revoked immediately. | Short TTL; deactivation is rare. | If needed, check `is_active` in `requireAuth` (one indexed read per request). |
| C | Tokens are kept in `localStorage`, so an XSS bug could read them. | No HTML is rendered from untrusted text (see below); headers added. | Move the refresh token to an httpOnly cookie. |
| D | No full Content-Security-Policy on the frontend. | Inline theme script and Next runtime need nonces. | Add a nonce-based CSP via middleware. |
| E | `POST /auth/send-otp` answers `409 EMAIL_ALREADY_REGISTERED`, which reveals whether an email has an account. | Required by the signup UX in SYSTEM_ARCHITECTURE_FLOW §3.1; rate-limited to 5/min/IP. | `forgot-password` was built enumeration-safe. |
| F | Rate limiting is in-memory per instance. | One instance per environment today. | Redis store if we scale out. |

## Checklist

### Authentication
- [x] Passwords hashed with bcrypt, 12 rounds; min 8 chars; login uses a dummy hash for unknown emails (no timing-based enumeration).
- [x] OTPs: 6 digits, stored as HMAC, 10-minute expiry, 3 attempts, newest-only, consumed atomically; separate purposes (`SIGNUP`, `PASSWORD_RESET`) can't be swapped (tested).
- [x] Password reset answers identically for unknown, deactivated and rate-limited emails; revokes every refresh token on success (tested).
- [x] Refresh tokens stored hashed and rotated; reuse of a rotated token revokes all of that user's sessions.
- [x] JWTs reject the `none` algorithm and foreign secrets (tested).
- [x] Google OAuth uses `state` + PKCE; the client secret never reaches the frontend.

### Role checks & data boundaries (PRD-04 §4)
- [x] Every `/api/v1/admin/*` route is behind `requireAuth("ADMIN")` at the router; a test calls **every** admin route as a student and as a mentor and expects 403.
- [x] Admins can't change their own role or status (no self-lockout or self-escalation via the UI).
- [x] `GET /admin/users` returns account fields only — never results; a test asserts no password hash leaks.
- [x] `GET /admin/analytics` returns aggregates only; a test asserts no user ids or emails appear.
- [x] Students only ever read their own rows: assessments, task submissions and notifications are all queried with `userId` from the token; another user's id looks like a 404.
- [x] Dashboard, skill checks and tasks are student-only routes.

### AI safety
- [x] All AI goes through one service with per-user daily limits and metering.
- [x] Grounding: insight gaps about skills the student wasn't checked on are dropped server-side (tested).
- [x] Prompt injection: task submissions are wrapped as data and the prompt says to ignore instructions inside; per-criterion scores are clamped to the rubric and totals computed by the server, so "give me full marks" can't exceed the rubric (tested).
- [x] Correct answers (`answer_index`) never leave the server before a question is answered.

### Injection & XSS
- [x] All database access through Prisma; the only raw query is the fixed `SELECT 1` health check.
- [x] Request bodies, params and queries are validated with zod; JSON body limit 1 MB.
- [x] The frontend never renders HTML from users or the AI: `RichText` and `Prose` turn text into React elements (tested with an `<img onerror>` payload). The two `dangerouslySetInnerHTML` uses render static, app-controlled strings (theme boot script, chart CSS).
- [x] Admin-entered resource links must be `http(s)` — `javascript:` URLs are rejected (tested). Outside links open with `rel="noopener noreferrer"`.

### Transport, headers, CORS
- [x] API: `helmet` defaults, CORS locked to `CORS_ORIGINS` (no `*` in production), `trust proxy` set for Render.
- [x] Frontend: security headers listed above.
- [x] HTTPS everywhere via Render and Vercel.

### Secrets & data
- [x] No `.env` or keys committed (checked `git ls-files` and key patterns).
- [x] Supabase tables have RLS enabled with no policies; the frontend has no Supabase keys.
- [x] Sentry and PostHog are configured not to send personal data.
- [x] Terms of Service and Privacy Policy published and linked from signup and the footer.

## How to re-run

```bash
cd backend  && npm audit --omit=dev && npm test
cd frontend && npm audit --omit=dev && npm test && npm run build && npm run e2e
```
