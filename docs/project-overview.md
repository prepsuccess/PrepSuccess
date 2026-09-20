# Placement Readiness Platform — Project Overview

## 1. Problem Statement

College students (starting with BCA and similar backgrounds) often don't know where they stand when it comes to placement readiness. They face:
- Lack of clarity on technical and soft skill gaps
- No structured way to prepare for interviews
- No guidance on "what to do next" in their career journey

## 2. Vision

A platform that helps a student answer: **"Where do I stand, and where can I go?"**

Starting point: college students.
Future expansion: freshers, then working employees.

## 3. Target Users (Phased Rollout)

| Order | Segment | Status |
|-------|---------|--------|
| 1 | College students (BCA and similar) | Primary focus (MVP) |
| 2 | Freshers | Future phase |
| 3 | Employees | Future phase |

## 4. Tech Stack

- **Frontend:** Next.js
- **Backend:** FastAPI
- **Database:** PostgreSQL
- **Auth:** Email + Password, and Google OAuth

## 5. High-Level Architecture

```
Next.js (frontend) → FastAPI (backend) → PostgreSQL (database)
                    ↳ Google OAuth for login
```

## 6. Product Roadmap (Phases)

### Phase 1 — Core MVP
- Auth: signup/login (email + password, Google)
- Student profile: college, branch, year, target role
- Self-assessment: **technical + soft skills** (communication, resume, aptitude)
- Dashboard: shows readiness score and skill gaps

### Phase 2 — Interview Prep
- Question bank (by company/role/topic)
- Track solved/bookmarked questions
- Progress tracking over time

### Phase 3 — Mentorship
- 1:1 developer session booking
- Mentor profiles and scheduling
- Possibly payments

### Phase 4 — Expansion
- Onboard freshers and employees as new segments
- Personalized recommendations
- Deeper analytics, possibly AI-driven feedback

> **MVP scope = Phase 1 only.** Students can sign up, complete an assessment, and see a dashboard of where they stand. This alone is a usable, launchable product.

## 7. Phase 1 — Core Entities (Conceptual)

- **User** — id, name, email, password_hash / google_id, college, branch, year
- **Skill** — id, name, category (technical / soft)
- **Assessment** — id, user_id, type (technical / soft / aptitude), taken_at
- **AssessmentResult** — id, assessment_id, skill_id, score
- **ReadinessSummary** — derived/computed from results, shown on dashboard (not a stored table)

*(Phase 2 adds Question Bank tables tied to Skill; Phase 3 adds a Session table tied to User for mentorship.)*

## 8. Phase 1 — User Flow

1. Student signs up (email/password or Google)
2. Fills basic profile (college, branch, year)
3. Takes assessment (technical + soft skills + aptitude)
4. Dashboard shows scores by category and overall readiness

## 9. Project Structure

### Backend (FastAPI)
```
backend/
├── app/
│   ├── main.py
│   ├── core/              # config, security, settings
│   ├── db/                # database session, base models
│   ├── models/             # SQLAlchemy models (User, Assessment, Skill, Score)
│   ├── schemas/             # Pydantic request/response schemas
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py        # signup, login, google auth
│   │       ├── users.py       # profile CRUD
│   │       ├── assessment.py  # take/submit assessment
│   │       └── dashboard.py   # readiness score, summary
│   └── services/            # business logic (scoring, etc.)
├── alembic/                 # DB migrations
└── requirements.txt
```

### Frontend (Next.js)
```
frontend/
├── app/
│   ├── (auth)/login, /signup
│   ├── dashboard/            # readiness dashboard
│   ├── assessment/           # take assessment flow
│   └── profile/
├── components/
├── lib/                      # api client, auth helpers
└── styles/
```

## 10. Decisions Made So Far

| Decision | Choice |
|----------|--------|
| Assessment scope | Technical + soft skills (communication, resume, aptitude) |
| Login method | Email + Password, and Google Auth |
| Database | PostgreSQL |
| MVP scope | Phase 1 only |

## 11. Open / Next Steps

- Design detailed database schema (tables, columns, relationships)
- Scaffold actual FastAPI + Next.js project folders and starter code
- Define scoring logic for the readiness dashboard
- Decide hosting/deployment approach (e.g., Postgres on Supabase/Railway/Neon)

## 12. Jira Project Tracking

All work is tracked in the **SCRUM** project on Jira
(`preparationssuccess.atlassian.net`, board: "SCRUM board"). The ticket
structure mirrors the phase roadmap in §6:

### Epics (one per feature area, all tickets re-parented under these)
| Epic | Covers |
|------|--------|
| Platform Infrastructure & DevOps | Repo, env config, CI/CD, staging/prod, monitoring |
| Auth & Onboarding | Signup/login, Google OAuth, onboarding email |
| Student Profile & Assessment | Profile CRUD, assessment submission, readiness scoring |
| Design System & UX | Tokens, component library, wireframes, mockups, a11y |
| Backend Foundation & Data Model | FastAPI/Next.js scaffolds, SQLAlchemy/Alembic, core models |
| Admin & Notifications | Admin APIs/UI, notification service |
| Platform Ops, QA & Compliance | Security review, API docs, ToS/Privacy, analytics instrumentation |
| Interview Prep (Question Bank) | Phase 2 question bank, bookmarks, progress tracking |
| Mentorship Platform | Phase 3 booking, video, chat, payments |
| AI & Personalization | Phase 4 AI services, personalized PDF |

### Fix Versions (one per phase)
`v0.1 - Phase 1 MVP`, `v0.2 - Phase 2 Interview Prep`,
`v0.3 - Phase 3 Mentorship`, `v0.4 - Phase 4 AI & Expansion`.

### Sprints
Phase 1 is split into three timeboxed sprints (its ticket volume was too
large for one sprint):
1. **Phase 1 Sprint 1 — Foundation** (Sep 22–Oct 6): infra, scaffolds, core
   schemas, design tokens.
2. **Phase 1 Sprint 2 — Core Build** (Oct 7–21): auth, profile, assessment,
   dashboard, wireframes/mockups.
3. **Phase 1 Sprint 3 — Launch Prep** (Oct 22–Nov 5): admin, notifications,
   CI/CD, QA, compliance.

Phases 2–4 each currently run as one dated sprint (Phase 3's is oversized
and will likely need splitting once real velocity data exists after Phase 1
ships).

### Team & Assignment
- **Ayush Kumar** — backend, schema, and DevOps/QA-heavy tickets.
- **Garv** — frontend, design, and UI-facing QA/product tickets.

Every ticket carries a story-point estimate (`Story point estimate` field)
and a label matching its area (`backend`, `frontend`, `design`, `devops`,
`qa`, `admin`, `product`) — used in place of Jira Components, which aren't
enabled on this (team-managed) project yet.
