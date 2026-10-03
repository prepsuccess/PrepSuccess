# PrepSuccess — Production Engineering Standards & Architecture Guidelines

This document specifies the **production-grade engineering standards** required for the PrepSuccess backend and platform.
Backend stack: **Node.js 22 + Express 5 + TypeScript**, **Prisma** ORM, **PostgreSQL on Supabase**. These standards must be adhered to across all implementations, APIs, database models, and deployments.

---

## 1. API Design & Response Consistency

### 1.1 Unified API Response Envelope
All API endpoints must return a predictable, standardized JSON envelope.

#### Success Response Format:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  },
  "request_id": "c6a2b8e4-8f12-4c91-b34e-0a56821fa79e",
  "timestamp": "2026-09-21T22:40:00.000Z"
}
```

#### Error Response Format:
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Assessment with id 123 was not found.",
    "details": []
  },
  "request_id": "c6a2b8e4-8f12-4c91-b34e-0a56821fa79e",
  "timestamp": "2026-09-21T22:40:00.000Z"
}
```

### 1.2 Request Tracing (Correlation ID)
- Every incoming HTTP request must be tagged with a unique `X-Request-ID` (generated via UUIDv4 if not provided in header).
- `X-Request-ID` must be included in:
  - All log entries produced during that request lifecycle.
  - The outgoing HTTP response headers (`X-Request-ID`).
  - The response payload envelope.

### 1.3 Health & Readiness Probes
Production orchestrators (Kubernetes / ECS / Railway / Render) require two separate health checks:
- **`GET /health/live` (Liveness)**: Returns 200 if the Node.js process is running.
- **`GET /health/ready` (Readiness)**: Returns 200 only if DB connection ping succeeds and external dependencies are healthy.

---

## 2. Database & Data Integrity Standards

### 2.1 Primary Keys: UUID vs Integer
- **Standard**: Use **UUIDv4** (or UUIDv7) as primary keys for all public-facing entities (`User`, `Assessment`, `QuestionBank`, etc.).
- **Reasoning**: Avoid sequential auto-incrementing integer IDs to prevent enumeration attacks and exposure of total student/assessment volume.

### 2.2 Prisma & Connection Pooling (Supabase)
- Use **Prisma** with the `@prisma/adapter-pg` driver adapter; a **single** `PrismaClient` per process (`src/db/prisma.ts`).
- **Two connection strings**:
  - `DATABASE_URL` — Supabase **pooled** connection (Supavisor, port `6543`), used by the running app.
  - `DIRECT_URL` — Supabase **direct/session** connection (port `5432`), used only by Prisma migrations.
- Schema changes go through `prisma migrate` only — never edit tables by hand in the Supabase dashboard.
- **Supabase Data API lockdown**: every table must have Row Level Security enabled with no policies
  (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY` in its migration). The backend connects as the table
  owner and is unaffected; Supabase's auto-generated REST API is blocked.

### 2.3 Base Model Fields (Auditing & Soft Deletion)
Every table must include these fields (Prisma has no model inheritance, so they are repeated per model):
- `id`: UUID (`@id @default(uuid()) @db.Uuid`)
- `created_at`: `timestamptz`, `@default(now())`
- `updated_at`: `timestamptz`, `@updatedAt`
- `is_active`: `Boolean` default `True`
- `is_deleted`: `Boolean` default `False` (for soft deletion where applicable)

### 2.4 Transaction Management
- Multi-step writes use `prisma.$transaction(async (tx) => { ... })`.
- Any error thrown inside the callback rolls the whole transaction back before the error handler returns HTTP 500.

---

## 3. Security & Authentication Hardening

### 3.1 Dual-Token JWT Strategy
1. **Access Token**: Short-lived (15–30 minutes) containing minimal claims (`sub` = user_id, `role`, `exp`).
2. **Refresh Token**: Long-lived (7–30 days) stored hashed in DB/Redis with token rotation (revoked immediately on reuse or logout).

### 3.2 Password Hashing & Validation
- Standard: `bcrypt` (via the `bcryptjs` package) or `argon2id`, with minimum 12 work rounds.
- Validation: Minimum 8 characters, requiring mixed case, numbers, and symbols. Reject common breached passwords.

### 3.3 Rate Limiting & Abuse Prevention
- Rate limit sensitive endpoints (e.g. `/api/v1/auth/login`, `/api/v1/auth/signup`, `/api/v1/auth/forgot-password`) to max 5–10 requests/minute per IP.
- Rate limiting implemented via `express-rate-limit` (in-memory to start; Redis store if we run multiple instances).

### 3.4 Security Headers & CORS
- Lock CORS strictly to allowed origins (no wildcard `*` with credentials in production).
- `helmet` middleware for standard security headers, including:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`

---

## 4. Observability & Logging

### 4.1 Structured JSON Logging
- Never use `console.log` in application code (ESLint enforces this).
- Use structured logging (`pino` + `pino-http`) outputting JSON logs in production with keys: `timestamp`, `level`, `request_id`, `user_id`, `path`, `method`, `status_code`, `duration_ms`.

### 4.2 Error Tracking
- Integrate the **Sentry** Node SDK (`@sentry/node`), initialized at startup only when `SENTRY_DSN` is set (`src/instrument.ts`, `src/lib/monitoring.ts`).
- Capture unhandled exceptions with full stack trace and correlation `request_id`. Expected failures (`AppError`) are not reported.
- Frontend: `@sentry/nextjs` via `instrumentation*.ts`, only when `NEXT_PUBLIC_SENTRY_DSN` is set. See `docs/DEPLOYMENT.md` §2 for alerting.

---

## 5. Project Tooling & Code Quality

### 5.1 Linting, Formatting & Type Checking
- **ESLint** (`typescript-eslint`) for linting and **Prettier** for formatting.
- **TypeScript `strict` mode** (`tsc --noEmit`) for type-checking; **zod** validates every request body and the environment.
- **Vitest + supertest** for unit and API tests.
- CI (`.github/workflows/backend-ci.yml`, `frontend-ci.yml`) runs format, lint, typecheck, tests and build on every PR, applies every migration to a fresh Postgres and seeds it, checks the OpenAPI spec and frontend API types aren't stale, and runs the Playwright journeys.
- **Pre-commit hooks**: `.githooks/pre-commit` runs Prettier and ESLint on staged files of each app. `npm install` in either app installs it (the `prepare` script sets `core.hooksPath`).

### 5.2 Containerization
- Optional for now (Render deploys Node apps directly). If added: multi-stage `Dockerfile` based on `node:22-slim`, running as the non-root `node` user.
- Optional `docker-compose.yml` with `postgres` for fully offline local development.
