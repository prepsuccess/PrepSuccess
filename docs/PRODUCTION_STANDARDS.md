# PrepSuccess — Production Engineering Standards & Architecture Guidelines

This document specifies the **production-grade engineering standards** required for the PrepSuccess backend and platform. These standards must be adhered to across all implementations, APIs, database models, and deployments.

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
- **`GET /health/live` (Liveness)**: Returns 200 if FastAPI process is running.
- **`GET /health/ready` (Readiness)**: Returns 200 only if DB connection ping succeeds and external dependencies are healthy.

---

## 2. Database & Data Integrity Standards

### 2.1 Primary Keys: UUID vs Integer
- **Standard**: Use **UUIDv4** (or UUIDv7) as primary keys for all public-facing entities (`User`, `Assessment`, `QuestionBank`, etc.).
- **Reasoning**: Avoid sequential auto-incrementing integer IDs to prevent enumeration attacks and exposure of total student/assessment volume.

### 2.2 Modern Async SQLAlchemy 2.0+ & Connection Pooling
- Use `asyncpg` driver with SQLAlchemy 2.0 `AsyncEngine` and `async_sessionmaker`.
- **Pool Configuration for Production**:
  - `pool_size`: 10–20 (tunable based on deployment tier).
  - `max_overflow`: 10.
  - `pool_pre_ping=True`: Detect and recycle disconnected DB sockets gracefully.
  - `pool_recycle=1800`: Recycle connections periodically (crucial for AWS RDS / Supabase connection limits).

### 2.3 Base Model Fields (Auditing & Soft Deletion)
Every table must inherit from a common `BaseModel` containing:
- `id`: UUID (Primary Key, indexed)
- `created_at`: `DateTime(timezone=True)` with `server_default=func.now()`
- `updated_at`: `DateTime(timezone=True)` with `onupdate=func.now()`
- `is_active`: `Boolean` default `True`
- `is_deleted`: `Boolean` default `False` (for soft deletion where applicable)

### 2.4 Transaction Management
- Explicit transaction boundaries using `async with session.begin():`.
- Auto-rollback on any uncaught exception before raising HTTP 500.

---

## 3. Security & Authentication Hardening

### 3.1 Dual-Token JWT Strategy
1. **Access Token**: Short-lived (15–30 minutes) containing minimal claims (`sub` = user_id, `role`, `exp`).
2. **Refresh Token**: Long-lived (7–30 days) stored hashed in DB/Redis with token rotation (revoked immediately on reuse or logout).

### 3.2 Password Hashing & Validation
- Standard: `bcrypt` (or `argon2id`) with minimum 12 work rounds.
- Validation: Minimum 8 characters, requiring mixed case, numbers, and symbols. Reject common breached passwords.

### 3.3 Rate Limiting & Abuse Prevention
- Rate limit sensitive endpoints (e.g. `/api/v1/auth/login`, `/api/v1/auth/signup`, `/api/v1/auth/forgot-password`) to max 5–10 requests/minute per IP.
- Rate limiting implemented via `slowapi` or Redis token bucket.

### 3.4 Security Headers & CORS
- Lock CORS strictly to allowed origins (no wildcard `*` with credentials in production).
- Middleware for standard security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`

---

## 4. Observability & Logging

### 4.1 Structured JSON Logging
- Never use raw `print()` statements in application code.
- Use structured logging (`structlog` or `loguru`) outputting JSON logs in production with keys: `timestamp`, `level`, `request_id`, `user_id`, `path`, `method`, `status_code`, `duration_ms`.

### 4.2 Error Tracking
- Integrate **Sentry** SDK in `core/config.py` initialized conditionally when `SENTRY_DSN` is set.
- Capture unhandled exceptions with full stack trace and correlation `request_id`.

---

## 5. Project Tooling & Code Quality

### 5.1 Linting, Formatting & Type Checking
- **Ruff**: Blazing fast linter & code formatter (replaces Flake8, Black, isort).
- **Mypy**: Strict type-checking across all schemas and services.
- **Pre-commit hooks**: Ensure clean code before every commit.

### 5.2 Containerization
- Multi-stage `Dockerfile` based on `python:3.11-slim` running as non-root user `appuser`.
- `docker-compose.yml` defining `backend`, `postgres`, and `redis` for one-command local environment bootstrap.
