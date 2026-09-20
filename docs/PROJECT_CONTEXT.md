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

At a high level, in the MVP:

1. A student **signs up** (email/password or Google OAuth).
2. They **fill in a basic profile** — college, branch, year, and target role
   (e.g., "SDE", "Data Analyst", "QA Engineer").
3. They **take a self-assessment** covering:
   - **Technical skills** (e.g., DSA, programming fundamentals, core CS
     subjects)
   - **Soft skills** (communication, resume quality)
   - **Aptitude** (quantitative/logical reasoning, common in campus tests)
4. The platform **computes a readiness score** from their answers/results.
5. The student sees a **dashboard**: overall readiness score, a breakdown by
   category (technical / soft / aptitude), and where their biggest gaps are.

That's the entire MVP loop: **sign up → profile → assess → see where you
stand.** No interview question bank, no mentorship booking, no payments —
those come later.

## 5. Product Roadmap in Context

| Phase | Focus | Why it comes at this point |
|-------|-------|------------------------------|
| **1 — Core MVP** | Auth, profile, self-assessment, readiness dashboard | Validates the core value prop — "tell me where I stand" — with the least amount of built infrastructure. |
| **2 — Interview Prep** | Question bank by company/role/topic, progress tracking | Once a student knows their gaps (from Phase 1), the natural next step is targeted practice material. |
| **3 — Mentorship** | 1:1 developer session booking, mentor profiles, possibly payments | Some gaps (especially soft skills, career direction) are best closed with human guidance, not just content. |
| **4 — Expansion** | Onboard freshers and employees, personalized/AI-driven recommendations | Once the core assessment + prep engine is proven on students, it generalizes to adjacent user segments. |

The guiding principle: **each phase should stand on its own as a usable
product**, and each phase's data/infrastructure should make the next phase
easier to build (e.g., the Skill model from Phase 1 is reused directly by
the Question Bank in Phase 2).

## 6. Tech Stack & Why

| Layer | Choice | Reasoning |
|-------|--------|-----------|
| Frontend | **Next.js** | Modern React framework, good DX, easy to deploy, supports both static and server-rendered pages (useful for a dashboard-heavy app). |
| Backend | **FastAPI** | Fast to build REST APIs in Python, automatic OpenAPI docs, good async support, plays well with SQLAlchemy/Pydantic. |
| Database | **PostgreSQL** | Relational data (users, assessments, scores) fits a relational model well; mature, reliable, widely supported by hosting providers. |
| Auth | **Email + Password, and Google OAuth** | Covers the two most common signup paths for students — quick Google sign-in for convenience, email/password as a fallback. |

## 7. Architecture at a Glance

```
Next.js (frontend)
      │  REST calls (JSON over HTTPS)
      ▼
FastAPI (backend)
      │  SQL (via SQLAlchemy)
      ▼
PostgreSQL (database)

Google OAuth ──▶ FastAPI auth endpoints ──▶ issues session/JWT to frontend
```

- The frontend never talks to the database directly — everything goes
  through the FastAPI backend.
- Google OAuth is handled on the backend so secrets/tokens never sit
  exposed in frontend code.

## 8. Core Data Model (Phase 1)

| Entity | Purpose | Key fields |
|--------|---------|-----------|
| **User** | A registered student | id, name, email, password_hash / google_id, college, branch, year |
| **Skill** | A trackable skill (technical or soft) | id, name, category |
| **Assessment** | An instance of a student taking a test | id, user_id, type (technical / soft / aptitude), taken_at |
| **AssessmentResult** | A per-skill score within an assessment | id, assessment_id, skill_id, score |
| **ReadinessSummary** | Computed, not stored — derived from results for the dashboard | (calculated on read) |

This model is intentionally simple in Phase 1. `Skill` is designed to be
reused later by the Phase 2 Question Bank (questions tagged by skill), and
`User` is designed to be reused by the Phase 3 mentorship `Session` table.

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

## 10. Decisions Locked In So Far

| Decision | Choice | Why it's settled |
|----------|--------|-------------------|
| Assessment scope | Technical + soft skills (communication, resume) + aptitude | Covers the three axes that actually determine placement outcomes, not just coding ability. |
| Login method | Email + Password, and Google Auth | Balances convenience with a no-dependency fallback. |
| Database | PostgreSQL | Relational fit + hosting maturity. |
| MVP scope | Phase 1 only | Keeps first release small, shippable, and testable with real students quickly. |

## 11. What's Explicitly Out of Scope for MVP

To keep Phase 1 focused, the following are **intentionally not built yet**:

- Interview question banks or practice problems
- Mentor booking or any payments
- AI-generated feedback or personalized recommendations
- Support for freshers or working employees as user types
- Any analytics beyond the basic readiness dashboard

These are valuable, but building them now would delay validating the core
idea: *does a simple self-assessment + dashboard actually help a student
understand and improve their placement readiness?*

## 12. Open Questions / Next Steps

- Design the detailed database schema (tables, columns, relationships,
  constraints) from the conceptual entities above.
- Scaffold the actual FastAPI and Next.js project folders with starter code.
- Define the concrete scoring logic that turns raw assessment answers into
  the readiness score shown on the dashboard.
- Decide on a hosting/deployment approach for Postgres (e.g., Supabase,
  Railway, Neon) and for the frontend/backend apps themselves.

## 13. One-Line Summary (for quick recall)

> A phased platform that starts by giving college students a clear, scored
> picture of their placement readiness (technical + soft + aptitude), then
> grows into interview prep, mentorship, and eventually serves freshers and
> employees too.
