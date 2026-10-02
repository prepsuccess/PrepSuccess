# Placement Readiness Platform — Full Project Context

## 1. What Is This Project?

The **Placement Readiness Platform** is a web application that helps college
students figure out one simple but very hard question:

> **"Where do I stand for placements, and what should I do next to improve?"**

Every year, thousands of college students — especially from BCA, B.Tech, and
similar backgrounds — start preparing for campus placements or off-campus job
hunting without any real sense of their own readiness. They don't know:

- Whether their technical skills (DSA, coding, core subjects) are strong
  enough for the roles they're targeting.
- Whether their soft skills (communication, resume quality, aptitude) will
  hold them back in interviews even if their technical skills are fine.
- What to actually **do next** — which skill to improve, which topic to
  revise, which mock test to take.

Today, this gap is usually filled by scattered, disconnected sources: college
seniors' advice, YouTube playlists, random online test series, and generic
resume templates. There is no single place that tells a student, in one
glance, "here is your current readiness score, here is where you're weak,
and here is what to do about it."

This platform exists to be that single place — starting small (a self
assessment + dashboard) and growing into a full placement preparation and
mentorship ecosystem.

## 2. Who Is It For?

### Primary user (MVP): College Students
Specifically students from BCA and similar computer-science-adjacent degree
programs who are 1–2 years away from campus placements or job hunting. They
are the primary and only focus of the MVP release.

### Future users (later phases)
- **Freshers** — people who have graduated but haven't landed a job yet, and
  need continued guidance and sharper interview prep.
- **Working employees** — people already employed who want to benchmark
  their skills, prepare for a job switch, or level up for a promotion.

The rollout is deliberately phased. We are **not** trying to serve all three
groups at once. Building for students first keeps the problem narrow enough
to solve well, and gives us a foundation (assessment engine, scoring logic,
dashboard) that later user types can reuse.

## 3. Why Does This Problem Matter?

- **Information asymmetry**: Students from smaller colleges or non-tier-1
  institutions often don't have access to structured placement cells,
  experienced mentors, or peer benchmarks. They genuinely don't know if
  they're behind or on track.
- **Fragmented preparation**: Technical prep, soft-skill prep, and aptitude
  prep are usually treated as three separate, unrelated efforts (a DSA
  sheet here, a communication course there, a mock aptitude test somewhere
  else). Nothing ties them into a single readiness picture.
- **No feedback loop**: Students rarely get an honest, structured signal on
  "how ready am I, really?" until they're already failing interviews.
- **Confidence and direction**: A clear score and skill-gap breakdown gives
  students a concrete next action instead of vague anxiety about the future.

## 4. What Does the Platform Actually Do? (Product Behavior)

> **Revision note (2026-09-27):** The MVP is now **AI-first**. The original
> plan (static form profile → static multiple-choice quiz → numeric
> dashboard) has been replaced by a conversational, adaptive loop driven by
> an AI agent, described below. This supersedes the "AI is Phase 4 only"
> framing that appears elsewhere in this document's history — AI is now
> core to Phase 1.

At a high level, in the MVP:

1. A student **signs up** (email/password or Google OAuth).
2. An **AI agent has an onboarding conversation** with the student instead
   of a static form — collecting age, location, education, current skills,
   experience, interests, and goals through natural back-and-forth. Every
   answer is structured and persisted as JSON on the student's profile so it
   can be reused by every later feature.
3. Based on the skills the student claims (e.g., "I know HTML, CSS and
   JavaScript"), the AI runs an **adaptive skill assessment**: it does not
   hand out a fixed quiz, it generates diagnostic questions and small
   practical tasks per skill/topic, scores the responses, and compares the
   score against a **mastery threshold** (e.g. scoring below ~40% on a
   40/50-style benchmark flags the topic as "needs revision" rather than
   "mastered").
4. For any topic below threshold, the platform serves **curated learning
   resources** (references, explanations, examples — W3Schools-style
   material) instead of just labeling the student "weak." The student
   studies, then returns to continue the assessment/progress loop.
5. The student sees a **personalized AI dashboard** showing: current skill
   level per topic, learning progress, assessment scores, topics completed,
   topics needing revision, AI-recommended next steps, learning resources,
   practical tasks, interview readiness, and overall progress — all derived
   from the student's own data, continuously updated as they keep
   interacting with the AI.

That's the MVP loop: **sign up → AI onboarding conversation → adaptive
assessment (question/task → score → revise-or-advance) → personalized AI
dashboard.** Interview question bank browsing, mentorship booking, and
payments still come later (Phases 2–3); a future job portal is now on the
long-term roadmap too (see §5).

**Business model for now:** the platform and the AI features are **free**.
The AI usage specifically is planned as a **free trial for the first 3–5
months**, after which a paid tier may be introduced — the AI provider layer
should be built so usage can be metered/flagged even while it's free.

## 5. Product Roadmap in Context

| Phase | Focus | Why it comes at this point |
|-------|-------|------------------------------|
| **1 — AI-First Core MVP** | Auth, AI conversational onboarding (JSON profile), AI adaptive skill assessment, learning resources for weak topics, personalized AI dashboard | Validates the core value prop — "tell me where I stand and what to do next" — with an AI agent doing the diagnosis instead of a static quiz. |
| **2 — Interview Prep** | Question bank by company/role/topic, progress tracking | Once a student knows their gaps (from Phase 1's AI assessment), the natural next step is targeted practice material. |
| **3 — Mentorship** | 1:1 developer session booking, mentor profiles, possibly payments | Some gaps (especially soft skills, career direction) are best closed with human guidance, not just content. |
| **4 — Expansion & Advanced AI** | Onboard freshers and employees at full depth, resume feedback, personalized readiness PDF, mock-interview AI feedback | Once the core AI assessment + prep engine is proven on students, it generalizes to adjacent user segments and grows deeper AI features beyond onboarding/assessment. |
| **5 — Job Portal** *(future, not yet ticketed)* | Integrated job/internship listings and applications inside the same PrepSuccess ecosystem | So a student doesn't have to leave the platform to go from "ready" to "applying." Direction only — no tickets yet. |

Note: the three long-term audiences (students, freshers, working
professionals) are all part of the vision from the start — the phased
rollout above is about *feature depth*, not about hiding the product from
freshers/professionals. Phase 1 is built and tested against the student
segment first because it's the narrowest, fastest segment to validate the
AI agent and adaptive-assessment loop on.

The guiding principle: **each phase should stand on its own as a usable
product**, and each phase's data/infrastructure should make the next phase
easier to build (e.g., the Skill model from Phase 1 is reused directly by
the Question Bank in Phase 2).

## 6. Tech Stack & Why

| Layer | Choice | Reasoning |
|-------|--------|-----------|
| Frontend | **Next.js** | Modern React framework, good DX, easy to deploy, supports both static and server-rendered pages (useful for a dashboard-heavy app). |
| Backend | **Node.js 22 + Express 5 + TypeScript** | One language (TypeScript) across frontend and backend, so both developers can work on either side; huge ecosystem; zod for request validation. |
| Database | **PostgreSQL on Supabase**, accessed via **Prisma** | Relational data (users, assessments, scores, sessions) fits a relational model, and constraints/transactions enforce the PRD rules (no duplicates, no double booking). JSONB covers the schemaless parts (AI profile, chat logs). Supabase's free tier keeps cost at ₹0. Prisma gives typed queries and migrations. |
| Auth | **Email + Password, and Google OAuth** | Covers the two most common signup paths for students — quick Google sign-in for convenience, email/password as a fallback. |

## 7. Architecture at a Glance

```
Next.js (frontend)
      │  REST calls (JSON over HTTPS)
      ▼
Node.js / Express (backend)
      │  SQL (via Prisma)
      ▼
PostgreSQL (database, hosted on Supabase)

Google OAuth ──▶ backend auth endpoints ──▶ issues session/JWT to frontend
```

- The frontend never talks to the database directly — everything goes
  through the Node.js backend. Supabase is used **only as a Postgres host**:
  not Supabase Auth, not its auto-generated REST API (blocked with RLS), and
  no Supabase keys in the frontend.
- Google OAuth is handled on the backend so secrets/tokens never sit
  exposed in frontend code.

## 8. Core Data Model (Phase 1 — AI-First)

| Entity | Purpose | Key fields |
|--------|---------|-----------|
| **User** | Identity + authentication only (all roles) | id, first_name, last_name, email, password_hash / google_id, auth_provider, role, profile_image_url, is_verified, is_active, timestamps — nothing descriptive about the student; that lives in `UserProfile` |
| **UserProfile** | AI-collected profile data from the onboarding conversation | id, user_id, `profile_data` (JSONB: age, location, education, skills claimed, experience, interests, goals — schemaless, evolves without migrations) |
| **AIConversation** | Turn-by-turn log of an AI chat (onboarding or assessment) | id, user_id, agent_type (onboarding / assessment / dashboard), messages (JSON), created_at |
| **Skill** | A trackable skill/topic (technical or soft) | id, name, category, topic/subtopic |
| **Assessment** | One adaptive assessment attempt on a skill | id, user_id, skill_id, mode (diagnostic / task), status |
| **AssessmentResult** | Score + mastery outcome for that attempt | id, assessment_id, score, max_score, threshold, mastery_status (mastered / needs_revision) |
| **PracticalTask** | A small hands-on task tied to a skill | id, skill_id, title, description, difficulty, evaluation_criteria |
| **UserTaskSubmission** | A student's attempt at a practical task | id, user_id, task_id, submission_content, ai_feedback, passed |
| **LearningResource** | Curated reference material for a skill/topic | id, skill_id, title, type (reference/example/lecture/practice), content_or_url, source |
| **ReadinessSummary** | Computed, not stored — overall progress, interview readiness, next steps, derived from the above for the dashboard | (calculated on read) |

`Skill` is still designed to be reused later by the Phase 2 Question Bank
(questions tagged by skill), and `User` is still designed to be reused by
the Phase 3 mentorship `Session` table. The assessment side of the model is
no longer a single static quiz — it's a repeatable, per-skill, adaptive loop
that both the AI agent and (later) a human mentor can write into.

## 9. Project Structure

### Backend (Node.js + Express + TypeScript)
```
backend/
├── prisma/
│   ├── schema.prisma        # all tables (Prisma models)
│   └── migrations/          # SQL migrations, applied to Supabase
├── prisma.config.ts         # Prisma CLI config (migrations use DIRECT_URL)
├── src/
│   ├── server.ts            # boots the HTTP server
│   ├── app.ts               # Express app: middleware, routes, error handling
│   ├── config/env.ts        # zod-validated environment variables
│   ├── db/prisma.ts         # single Prisma client (pooled DATABASE_URL)
│   ├── lib/                 # logger (pino), response envelope + AppError
│   ├── middleware/          # request ID, error handler, auth guard
│   ├── routes/v1.ts         # mounts every module under /api/v1
│   ├── modules/             # one folder per feature: routes → controller → service
│   │   ├── health/          # /health/live, /health/ready
│   │   ├── auth/            # signup, OTP, login, Google OAuth
│   │   ├── users/           # /users/me profile
│   │   ├── onboarding/      # AI onboarding conversation
│   │   ├── assessment/      # AI adaptive assessment
│   │   ├── tasks/           # practical tasks + submissions
│   │   ├── resources/       # learning resources
│   │   ├── dashboard/       # readiness dashboard
│   │   └── admin/           # admin users/content/analytics
│   └── services/            # cross-module logic, no HTTP
│       ├── ai-agent/        # provider-agnostic AI layer (Gemini first):
│       │                    # onboarding, adaptive assessment, next steps
│       ├── scoring/         # mastery threshold + readiness scoring
│       └── email/           # Gmail SMTP (OTP emails)
└── tests/                   # Vitest + supertest
```
See `backend/README.md` for the module convention.

### Frontend (Next.js)
```
frontend/
├── app/
│   ├── (marketing)/          # public landing + marketing pages
│   ├── (auth)/login, signup
│   ├── (app)/dashboard, assessment, profile   # signed-in student area
│   └── admin/                # admin panel
├── components/               # ui/, shell/, auth/, marketing/, motion/
└── lib/                      # api client, auth/session helpers, content
```

## 10. Decisions Locked In So Far

| Decision | Choice | Why it's settled |
|----------|--------|-------------------|
| Assessment scope | Technical + soft skills (communication, resume) + aptitude | Covers the three axes that actually determine placement outcomes, not just coding ability. |
| Assessment style | **AI-driven, conversational and adaptive** — questions/tasks generated per skill, scored against a mastery threshold — not a static multiple-choice quiz | A fixed quiz can't personalize follow-up or explain *why* a gap matters; an AI agent can. |
| Onboarding | **AI conversation**, not a static form, collecting age/location/education/skills/experience/interests/goals as structured JSON | Matches how a student would actually describe themselves, and captures richer signal than dropdowns. |
| AI provider | Start with a **free-tier LLM (Gemini)** behind a provider-agnostic interface so other providers can be swapped in | Keeps cost at zero during the free-trial window and avoids lock-in. |
| Pricing | Platform is **free**; AI usage specifically is a **free trial for the first 3–5 months** | Lets the team validate the loop before deciding on monetization. |
| Login method | Email + Password, and Google Auth | Balances convenience with a no-dependency fallback. |
| Backend | Node.js + Express + TypeScript (decided 2026-10-02, replacing FastAPI) | Same language as the frontend; the team works in one stack. |
| Database | PostgreSQL on Supabase (free tier) via Prisma; local Postgres optional for dev | Relational fit, constraints enforce PRD rules, JSONB for AI data, ₹0 cost. |
| User vs profile split | `users` = identity/auth only; everything else in `UserProfile.profile_data` (JSONB) | The AI onboarding decides what to collect, so profile fields shouldn't need migrations. |
| MVP scope | Phase 1 only, now AI-first | Keeps first release small, shippable, and testable with real students quickly — but the AI agent is part of that first release, not deferred. |

## 11. What's Explicitly Out of Scope for MVP

To keep Phase 1 focused, the following are **intentionally not built yet**:

- Interview question banks or practice problems (Phase 2)
- Mentor booking or any payments (Phase 3)
- Resume feedback, auto-generated personalized readiness PDF, and
  AI-assisted mock-interview feedback (Phase 4 — deeper AI features, not
  the core onboarding/assessment agent, which *is* in Phase 1 now)
- Dedicated onboarding/dashboard flows for freshers or working
  professionals as distinct user types (Phase 4 — the AI agent's
  architecture should not preclude this later, but no tickets exist yet)
- A job portal / listings integration (Phase 5 — direction only, not
  ticketed)
- Enforcing payment for AI usage (it's a free trial for now; only the
  metering/flagging needs to exist, not a paywall)
- Any analytics beyond the basic readiness dashboard

These are valuable, but building them now would delay validating the core
idea: *does a simple self-assessment + dashboard actually help a student
understand and improve their placement readiness?*

## 12. Open Questions / Next Steps

- Design the detailed database schema (tables, columns, relationships,
  constraints) for the AI-first entities above (`UserProfile`,
  `AIConversation`, `PracticalTask`, `UserTaskSubmission`,
  `LearningResource`) alongside the original Phase 1 tables.
- Define exact mastery thresholds per skill/topic (e.g. is "below 40%"
  universal, or does it vary by topic difficulty?).
- Decide the source of curated learning resources (hand-authored by admins
  vs. AI-generated on the fly vs. links to existing sites like W3Schools)
  and how `LearningResource` content gets seeded before real students
  arrive.
- Design the AI provider abstraction (Gemini first) including fallback
  behavior if the free-tier API is rate-limited or unavailable.
- ~~Decide on a hosting approach~~ — decided 2026-10-02, all free tiers:
  Postgres on Supabase, frontend on Vercel, backend on Render.
- Decide the trigger/mechanism for the AI free-trial window (time-boxed
  from signup? from platform launch date?) and what happens after it ends.

## 13. One-Line Summary (for quick recall)

> An AI-first platform that gives college students (and eventually
> freshers and professionals) a clear, continuously-updated picture of
> their placement readiness — via a conversational AI agent that onboards
> them, adaptively assesses their real skill level, serves them the exact
> learning material they're missing, and personalizes their entire
> dashboard and journey — then grows into interview prep, mentorship, and
> eventually a built-in job portal.
