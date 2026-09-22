# PRD 01 — Core MVP (Phase 1)

**Jira Epics:** Platform Infrastructure & DevOps (SCRUM-108), Auth & Onboarding
(SCRUM-109), Student Profile & Assessment (SCRUM-110), Design System & UX
(SCRUM-111), Backend Foundation & Data Model (SCRUM-112)
**Fix Version:** v0.1 — Phase 1 MVP
**Owner:** Ayush Kumar (backend/infra), Garv (frontend/design)

## 1. Purpose

Ship the smallest usable version of PrepSuccess: a student can sign up, fill
in a profile, take a self-assessment, and see a readiness dashboard. This is
the entire value proposition validated end-to-end before any other feature
is built.

## 2. Problem It Solves

College students don't know where they stand for placements. Phase 1 answers
exactly one question for them: **"Where do I stand right now?"** — nothing
about prep material, mentors, or AI yet.

## 3. Scope

### 3.1 Infrastructure
- GitHub monorepo (`frontend/`, `backend/`) with branch protection and PR
  templates
- PostgreSQL instance (dev + staging)
- Environment variable / secrets convention (`.env.example` for both apps)
- FastAPI backend scaffold (`main.py`, `core/`, `db/`, `models/`, `schemas/`,
  `api/v1/`, `services/`)
- Next.js frontend scaffold (App Router, `(auth)/`, `dashboard/`,
  `assessment/`, `profile/`)
- SQLAlchemy + Alembic wired to Postgres

### 3.2 Data Model
| Table | Key fields |
|---|---|
| `User` | id, name, email, password_hash (nullable), google_id (nullable), college, branch, year, target_role |
| `Skill` | id, name, category (technical/soft) |
| `Assessment` | id, user_id, type (technical/soft/aptitude), taken_at |
| `AssessmentResult` | id, assessment_id, skill_id, score |

`Skill` is designed for reuse by the Phase 2 Question Bank. `User` is
designed for reuse by the Phase 3 Mentor/Session tables.

### 3.3 Auth
- Email + password signup/login (bcrypt-hashed, JWT-issued)
- Google OAuth login (redirect → callback → JWT)
- `get_current_user` dependency protecting all authenticated routes

### 3.4 Profile
- `GET/PATCH /api/v1/users/me` — college, branch, year, target_role
- Profile setup page shown right after signup

### 3.5 Assessment
- `POST /api/v1/assessment/start` / `POST /api/v1/assessment/{id}/submit`
- Covers three categories: technical, soft skills (communication, resume),
  aptitude
- One submission per assessment instance; retaking creates a new row
  (supports Phase 2 progress-over-time)

### 3.6 Dashboard
- `GET /api/v1/dashboard` — overall readiness score (0–100), category
  breakdown, top skill gaps
- Empty state for a user with no assessments yet
- Scoring logic is unit-testable in isolation from the HTTP layer

### 3.7 Design System
- Color/typography/spacing tokens, component library (buttons, inputs,
  cards, modals)
- Wireframes → high-fidelity mockups for: landing page, auth, profile setup,
  assessment flow, dashboard
- Responsive pass + WCAG AA accessibility audit

### 3.8 Production-Grade Engineering Standards (Backend & Infra)
- **Primary Keys**: UUIDv4 across all models (`User`, `Skill`, `Assessment`, `AssessmentResult`) to prevent enumeration attacks.
- **Async Architecture**: Async SQLAlchemy 2.0 with `asyncpg` driver and robust connection pooling (`pool_pre_ping=True`, `pool_recycle=1800`).
- **Standardized API Envelope**: Unified response format (`success`, `data`, `error`, `request_id`, `timestamp`).
- **Correlation ID Tracking**: `X-Request-ID` attached to all requests, logs, and outgoing responses.
- **Dual Health Probes**: `/health/live` (process health) & `/health/ready` (DB ping & dependency check).
- **Security & Rate Limiting**: Token rotation for Refresh tokens, strict password complexity, rate-limiting on auth endpoints via `slowapi`/Redis.
- **Structured Logging & Sentry**: JSON-formatted logs with request context; Sentry integration for uncaught exception tracking.
- (See `docs/PRODUCTION_STANDARDS.md` for full implementation specifications).

## 4. User Flow


1. Student signs up (email/password or Google)
2. Fills profile (college, branch, year, target role)
3. Takes assessment (technical + soft + aptitude)
4. Sees dashboard: overall score, category breakdown, weakest skills

## 5. Acceptance Criteria

- A new user can go from signup to a populated dashboard with zero manual
  intervention
- Duplicate signup emails are rejected with a clear error
- Assessment cannot be submitted twice for the same instance
- Dashboard numbers always come from the backend scoring service — never
  recomputed client-side

## 6. Explicitly Out of Scope

- Interview question banks, mentor booking, payments, AI feedback (all
  later phases)
- Multi-role support beyond Student (Admin/Mentor roles arrive with their
  own epics, see PRD 04 and PRD 03)

## 7. Dependencies / Sequencing

Infra (SCRUM-5/6/7) → Backend + Frontend scaffolds (SCRUM-8/16) →
SQLAlchemy/Alembic (SCRUM-9) → Core models (SCRUM-10) → Auth (SCRUM-11/12)
→ Profile (SCRUM-13) → Assessment (SCRUM-14) → Scoring/Dashboard (SCRUM-15).
Design tokens/component library (SCRUM-22/23) block every wireframe and
mockup ticket.

## 8. Related Jira Tickets

SCRUM-5 to SCRUM-30, SCRUM-36 to SCRUM-42, SCRUM-48, SCRUM-49 (see Jira for
full per-ticket acceptance criteria).
