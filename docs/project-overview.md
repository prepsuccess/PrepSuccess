# Placement Readiness Platform — Project Overview

## 1. Problem Statement

College students (starting with BCA and similar backgrounds) often don't know where they stand when it comes to placement readiness. They face:
- Lack of clarity on technical and soft skill gaps
- No structured way to prepare for interviews
- No guidance on "what to do next" in their career journey

## 2. Vision

A platform that helps a student answer: **"Where do I stand, and where can I go?"**

> **Revision note (2026-09-27):** the platform is now **AI-first** from
> Phase 1 onward — an AI agent conversationally onboards the user, adaptively
> assesses their real skill level, and personalizes their dashboard and
> learning journey. This replaces the earlier plan where AI was deferred to
> Phase 4. See §6 and §8 below for the updated scope.

Audiences: students, freshers, and working professionals all sit within the
long-term vision from day one — the phased rollout is about feature depth,
not about excluding two of the three segments. Phase 1 is validated on
college students first because it's the fastest segment to prove the AI
agent and adaptive-assessment loop on.

## 3. Target Users (Phased Rollout)

| Order | Segment | Status |
|-------|---------|--------|
| 1 | College students (BCA and similar) | Primary focus (MVP) |
| 2 | Freshers | Future phase |
| 3 | Employees | Future phase |

## 4. Tech Stack

- **Frontend:** Next.js
- **Backend:** Node.js 22 + Express 5 + TypeScript
- **Database:** PostgreSQL on Supabase (via Prisma ORM)
- **Auth:** Email + Password, and Google OAuth

## 5. High-Level Architecture

```
Next.js (frontend) → Node.js/Express (backend) → PostgreSQL on Supabase (database)
                    ↳ Google OAuth for login
```

## 6. Product Roadmap (Phases)

### Phase 1 — AI-First Core MVP
- Auth: signup/login (email + password, Google)
- **AI conversational onboarding**: an AI agent (Gemini first, pluggable)
  chats with the student and collects age, location, education, skills,
  experience, interests, goals — stored as structured JSON, not a static
  form
- **AI adaptive skill assessment**: per skill/topic, the AI generates
  diagnostic questions and small practical tasks, scores the response, and
  compares against a mastery threshold to decide "mastered" vs. "needs
  revision" — not a fixed multiple-choice quiz
- **Learning resources for weak topics**: curated references/examples
  (W3Schools-style) served for anything below threshold, so a gap comes
  with a fix, not just a label
- **Personalized AI dashboard**: current skill level, learning progress,
  assessment scores, topics completed, topics needing revision,
  AI-recommended next steps, learning resources, practical tasks, interview
  readiness, overall progress
- Platform and AI are **free**; AI specifically as a **3–5 month free
  trial**

### Phase 2 — Interview Prep
- Question bank (by company/role/topic)
- Track solved/bookmarked questions
- Progress tracking over time

### Phase 3 — Mentorship
- 1:1 developer session booking
- Mentor profiles and scheduling
- Possibly payments

### Phase 4 — Expansion & Advanced AI
- Onboard freshers and employees as new segments, at full depth
- Resume feedback, personalized readiness PDF, AI-assisted mock-interview
  feedback (deeper AI features beyond the Phase 1 onboarding/assessment
  agent)
- Deeper analytics

### Phase 5 — Job Portal *(future, not yet ticketed)*
- Integrated job/internship listings and applications inside the same
  PrepSuccess ecosystem, so a student never has to leave the platform to go
  from "ready" to "applying"

> **MVP scope = Phase 1 only, and Phase 1 is now AI-first.** Students can
> sign up, be conversationally onboarded and adaptively assessed by the AI
> agent, and see a personalized AI dashboard of where they stand and what to
> do next. This alone is a usable, launchable product.

## 7. Phase 1 — Core Entities (Conceptual)

- **User** — identity/auth only: id, first_name, last_name, email, password_hash / google_id, auth_provider, role, is_verified
- **UserProfile** — id, user_id, profile_data (JSONB: college/branch/year,
  target role, age, location, education, skills, experience, interests,
  goals — collected by the AI onboarding conversation)
- **AIConversation** — id, user_id, agent_type, messages (JSON), created_at
- **Skill** — id, name, category (technical / soft), topic/subtopic
- **Assessment** — id, user_id, skill_id, mode (diagnostic/task), status
- **AssessmentResult** — id, assessment_id, score, max_score, threshold,
  mastery_status (mastered / needs_revision)
- **PracticalTask** — id, skill_id, title, description, difficulty
- **UserTaskSubmission** — id, user_id, task_id, submission_content,
  ai_feedback, passed
- **LearningResource** — id, skill_id, title, type, content_or_url, source
- **ReadinessSummary** — derived/computed from results, shown on dashboard (not a stored table)

*(Phase 2 adds Question Bank tables tied to Skill; Phase 3 adds a Session table tied to User for mentorship.)*

## 8. Phase 1 — User Flow

1. Student signs up (email/password or Google)
2. AI agent conversationally onboards the student — profile captured as
   structured JSON, not a static form
3. AI runs an adaptive skill assessment per claimed skill: diagnostic
   question/task → score → mastered or flagged for revision
4. Below-threshold topics get curated learning resources; student studies
   and resumes the loop
5. Dashboard shows skill levels, progress, completed/revision topics,
   AI-recommended next steps, resources, tasks, and interview readiness

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

## 10. Decisions Made So Far

| Decision | Choice |
|----------|--------|
| Assessment scope | Technical + soft skills (communication, resume, aptitude) |
| Assessment style | AI-driven, conversational, adaptive (question/task → score → threshold) — not a static quiz |
| Onboarding | AI conversation collecting structured JSON profile, not a static form |
| AI provider | Gemini first, behind a pluggable provider interface |
| Pricing | Platform free; AI free for a 3–5 month trial window |
| Login method | Email + Password, and Google Auth |
| Backend | Node.js + Express + TypeScript (replaced FastAPI, 2026-10-02) |
| Database | PostgreSQL on Supabase, via Prisma |
| User vs profile | `users` = identity only; profile data in `UserProfile` JSONB |
| MVP scope | Phase 1 only, now AI-first |

## 11. Open / Next Steps

- Design detailed database schema for the AI-first entities (`UserProfile`,
  `AIConversation`, `PracticalTask`, `UserTaskSubmission`,
  `LearningResource`) alongside the original tables
- Define mastery thresholds per skill/topic and the AI provider
  abstraction/fallback behavior
- Decide the source of curated learning resources (admin-authored vs.
  AI-generated vs. external links)
- Hosting (decided, all free tiers): Postgres on Supabase, frontend on Vercel, backend on Render

## 12. Jira Project Tracking

All work is tracked in the **SCRUM** project on Jira
(`preparationssuccess.atlassian.net`, board: "SCRUM board"). The ticket
structure mirrors the phase roadmap in §6:

### Epics (one per feature area, all tickets re-parented under these)
| Epic | Covers |
|------|--------|
| Platform Infrastructure & DevOps | Repo, env config, CI/CD, staging/prod, monitoring |
| Auth & AI Onboarding | Signup/login, Google OAuth, **AI conversational onboarding + JSON profile capture** |
| AI Profile & Adaptive Assessment *(renamed from "Student Profile & Assessment")* | **AI adaptive assessment engine, practical tasks, learning resources**, readiness scoring |
| Design System & UX | Tokens, component library, wireframes, mockups, a11y |
| Backend Foundation & Data Model | Node.js/Next.js scaffolds, Prisma + migrations, core models, **AI agent/provider integration layer** |
| Admin & Notifications | Admin APIs/UI, notification service |
| Platform Ops, QA & Compliance | Security review, API docs, ToS/Privacy, analytics instrumentation, **AI free-trial/usage tracking** |
| Interview Prep (Question Bank) | Phase 2 question bank, bookmarks, progress tracking |
| Mentorship Platform | Phase 3 booking, video, chat, payments |
| AI & Personalization | **Phase 1 core AI services (skill-gap analysis, next-steps) now live here with fixVersion v0.1**; resume feedback + personalized PDF remain Phase 4 (v0.4) |
| Job Portal *(new, future, no tickets yet)* | Phase 5 direction — job/internship listings integrated into the platform |

### Fix Versions (one per phase)
`v0.1 - Phase 1 MVP (AI-First)`, `v0.2 - Phase 2 Interview Prep`,
`v0.3 - Phase 3 Mentorship`, `v0.4 - Phase 4 Expansion & Advanced AI`,
`v0.5 - Phase 5 Job Portal (future, placeholder)`.

### Sprints
Phase 1 is split into three timeboxed sprints (its ticket volume was too
large for one sprint):
1. **Phase 1 Sprint 1 — Foundation** (Sep 22–Oct 6): infra, scaffolds, core
   schemas (including the new AI-first entities), design tokens.
2. **Phase 1 Sprint 2 — Core Build** (Oct 7–21): auth, **AI onboarding
   conversation, AI adaptive assessment engine**, dashboard, wireframes/mockups.
3. **Phase 1 Sprint 3 — Launch Prep** (Oct 22–Nov 5): admin, notifications,
   CI/CD, QA, compliance, **AI free-trial/usage tracking**.

Phases 2–4 each currently run as one dated sprint (Phase 3's is oversized
and will likely need splitting once real velocity data exists after Phase 1
ships). Phase 5 (Job Portal) has no sprint yet — it's roadmap-only.

### Team & Assignment
- **Ayush Kumar** — backend, schema, and DevOps/QA-heavy tickets.
- **Garv** — frontend, design, and UI-facing QA/product tickets.

Every ticket carries a story-point estimate (`Story point estimate` field)
and a label matching its area (`backend`, `frontend`, `design`, `devops`,
`qa`, `admin`, `product`) — used in place of Jira Components, which aren't
enabled on this (team-managed) project yet.
