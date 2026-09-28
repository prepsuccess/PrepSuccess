# PRD 01 — AI-First Core MVP (Phase 1)

**Jira Epics:** Platform Infrastructure & DevOps (SCRUM-108), Auth & AI
Onboarding (SCRUM-109), AI Profile & Adaptive Assessment (SCRUM-110), Design
System & UX (SCRUM-111), Backend Foundation & Data Model (SCRUM-112), AI &
Personalization (SCRUM-117, Phase-1 core slice)
**Fix Version:** v0.1 — Phase 1 MVP (AI-First)
**Owner:** Ayush Kumar (backend/infra/AI services), Garv (frontend/design)

> **Revision note (2026-09-27):** this PRD supersedes the original static
> "form profile + multiple-choice quiz" MVP. Phase 1 is now built around an
> AI agent that conversationally onboards the student and adaptively
> assesses their real skill level. The core AI capabilities originally
> planned for Phase 4 (skill-gap analysis, personalized next steps) have
> been pulled forward into Phase 1, since they are now inseparable from the
> onboarding/assessment loop itself.

## 1. Purpose

Ship the smallest usable version of PrepSuccess: a student signs up, is
conversationally onboarded by an AI agent, is adaptively assessed
skill-by-skill by that same agent, and sees a personalized AI dashboard
showing where they stand and what to do next. This is the entire value
proposition validated end-to-end before any other feature is built.

## 2. Problem It Solves

College students don't know where they stand for placements, or what
guidance to trust. Phase 1 answers **"Where do I stand right now, and what
should I do next?"** through an AI agent that actually diagnoses the
student's real level (not a generic quiz) and points them at the exact
material they're missing — nothing about the Phase 2 question bank,
mentors, payments, or a job portal yet.

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
| `User` | id, name, email, password_hash (nullable), google_id (nullable), role |
| `UserProfile` | id, user_id, `profile_data` (JSONB — college/branch/year, target_role, age, location, education, skills claimed, experience, interests, goals) |
| `AIConversation` | id, user_id, agent_type (onboarding/assessment/dashboard), messages (JSON), created_at |
| `Skill` | id, name, category (technical/soft), topic/subtopic |
| `Assessment` | id, user_id, skill_id, mode (diagnostic/task), status |
| `AssessmentResult` | id, assessment_id, score, max_score, threshold, mastery_status (mastered/needs_revision) |
| `PracticalTask` | id, skill_id, title, description, difficulty, evaluation_criteria |
| `UserTaskSubmission` | id, user_id, task_id, submission_content, ai_feedback, passed |
| `LearningResource` | id, skill_id, title, type (reference/example/lecture/practice), content_or_url, source |

`Skill` is designed for reuse by the Phase 2 Question Bank. `User` is
designed for reuse by the Phase 3 Mentor/Session tables. `UserProfile`'s
JSON shape is deliberately schemaless — the AI agent's collected fields are
expected to evolve without needing a migration every time.

### 3.3 Auth
- Email + password signup/login (bcrypt-hashed, JWT-issued)
- Google OAuth login (redirect → callback → JWT)
- `get_current_user` dependency protecting all authenticated routes

### 3.4 AI Onboarding (replaces the static profile form)
- `POST /api/v1/ai/onboarding/message` — turn-by-turn conversation endpoint;
  the AI agent asks for age, location, education, current skills,
  experience, interests, and goals, and extracts each answer into
  `UserProfile.profile_data` as it goes
- `GET/PATCH /api/v1/users/me/profile` — read/manually-correct the
  structured profile after the conversation (fallback/edit path, not the
  primary entry point)
- Every conversation turn is persisted to `AIConversation` for
  auditability and so the agent has memory across sessions

### 3.5 AI Adaptive Assessment (replaces the static quiz)
- `POST /api/v1/ai/assessment/start` — starts a diagnostic on one claimed
  skill; the agent generates questions and/or a small practical task for
  that skill/topic
- `POST /api/v1/ai/assessment/{id}/answer` — submits an answer/task result;
  the agent scores it and compares against that skill's mastery threshold
  (e.g. below ~40% flags `needs_revision`, at/above flags `mastered`)
- `GET /api/v1/resources?skill=` — serves curated `LearningResource`
  entries for any topic flagged `needs_revision`, so a gap always comes
  with material to fix it, not just a label
- `POST /api/v1/tasks/{id}/submit` — submits a `PracticalTask` attempt;
  agent evaluates and records `UserTaskSubmission`
- Retaking a skill's assessment creates a new `Assessment` row (supports
  Phase 2 progress-over-time, same as the original design)

### 3.6 Dashboard
- `GET /api/v1/dashboard` — overall readiness score (0–100), per-skill
  mastery status, learning progress, topics completed, topics needing
  revision, AI-recommended next steps (grounded in the student's actual
  `AssessmentResult` rows — never a skill absent from their real data),
  linked learning resources, practical tasks, and an interview-readiness
  rollup
- Empty state for a user with no assessments yet
- Scoring + next-steps logic is unit-testable in isolation from both the
  HTTP layer and the LLM call (mock the AI provider in tests)

### 3.7 Design System
- Color/typography/spacing tokens, component library (buttons, inputs,
  cards, modals)
- Wireframes → high-fidelity mockups for: landing page, auth, profile setup,
  assessment flow, dashboard
- Responsive pass + WCAG AA accessibility audit

### 3.8 AI Agent & Provider Layer
- `services/ai_agent/` — provider-agnostic interface; the onboarding
  conversation, adaptive assessment scoring, and next-steps generation all
  call through this layer rather than directly against one vendor's SDK
- Starts on **Gemini's free tier**; interface must support swapping to or
  load-balancing across other providers later without touching callers
- Usage is tracked per request even while free, so a **3–5 month free
  trial** window can be enforced later without a rebuild (see PRD 04 for
  the feature-flag/tracking ticket)
- Every AI-generated claim shown to a student (skill-gap explanation, next
  steps, mastery verdict) must be grounded strictly in that student's own
  `AssessmentResult`/`UserProfile` data — no hallucinated skills or scores

### 3.9 Production-Grade Engineering Standards (Backend & Infra)
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
2. AI agent conversationally onboards the student — profile captured as
   structured JSON (age, location, education, skills, experience,
   interests, goals), not a static form
3. For each claimed skill, AI runs an adaptive assessment: diagnostic
   question/task → score → mastered or flagged `needs_revision`
4. Below-threshold topics get curated learning resources; student studies
   and resumes the loop at their own pace
5. Sees dashboard: skill levels, learning progress, topics
   completed/needing revision, AI-recommended next steps, resources, tasks,
   interview readiness, overall progress

## 5. Acceptance Criteria

- A new user can go from signup through the AI onboarding conversation to
  a populated, personalized dashboard with zero manual intervention
- Duplicate signup emails are rejected with a clear error
- The AI never references a skill or score absent from the student's
  actual `AssessmentResult`/`UserProfile` data (no hallucinated content)
- Mastery threshold logic is deterministic and unit-testable independent
  of the LLM call itself
- Dashboard numbers always come from the backend scoring service — never
  recomputed client-side

## 6. Explicitly Out of Scope

- Interview question banks (Phase 2), mentor booking/payments (Phase 3)
- Resume feedback, auto-generated personalized readiness PDF, and
  AI-assisted mock-interview feedback (Phase 4 — deeper AI, not the core
  onboarding/assessment agent)
- A job portal integration (Phase 5 — direction only, no tickets yet)
- Enforcing payment for AI usage (free trial for now; only usage tracking
  needs to exist)
- Multi-role support beyond Student (Admin/Mentor roles arrive with their
  own epics, see PRD 04 and PRD 03)

## 7. Dependencies / Sequencing

Infra (SCRUM-5/6/7) → Backend + Frontend scaffolds (SCRUM-8/16) →
SQLAlchemy/Alembic (SCRUM-9) → Core models incl. AI-first entities
(SCRUM-10 + new schema tickets) → Auth (SCRUM-11/12) → AI provider/agent
layer → AI onboarding conversation (rescoped SCRUM-13) → AI adaptive
assessment engine (rescoped SCRUM-14) → Scoring/next-steps/Dashboard
(rescoped SCRUM-15). Design tokens/component library (SCRUM-22/23) block
every wireframe and mockup ticket.

## 8. Related Jira Tickets

SCRUM-5 to SCRUM-30 (SCRUM-13, 14, 15, 19, 20, 21 rescoped for AI — see
per-ticket description), SCRUM-36 to SCRUM-42 (SCRUM-39/41/42 amended for
AI-first fields), SCRUM-48, SCRUM-49, plus SCRUM-60/61 (AI skill-gap +
next-steps, moved to fix version v0.1) and SCRUM-79 (marked duplicate,
folded into SCRUM-21).

New tickets added 2026-09-27: SCRUM-118 (Job Portal epic, Phase 5
placeholder, no fixVersion), SCRUM-119 (AIConversation schema), SCRUM-120
(PracticalTask schema), SCRUM-121 (UserTaskSubmission schema), SCRUM-122
(LearningResource schema), SCRUM-123 (UserProfile schema), SCRUM-124 (AI
provider & agent service layer), SCRUM-125 (Practical task submission & AI
evaluation API), SCRUM-126 (Learning resource content API), SCRUM-127
(Practical task submission & feedback UI), SCRUM-128 (Learning resource
viewer UI), SCRUM-129 (AI free-trial window & usage tracking).
