# PRD 04 — Admin, Notifications & Platform Ops

**Jira Epics:** Admin & Notifications (SCRUM-113), Platform Ops, QA &
Compliance (SCRUM-114)
**Fix Version:** v0.1 — Phase 1 MVP (ships alongside core MVP, cross-cutting)
**Owner:** Ayush Kumar (backend/DevOps/QA), Garv (frontend/product pages)

## 1. Purpose

Everything that keeps the platform *operable* and *governable* but isn't a
student-facing feature on its own: admin tooling to manage users/content,
notifications tying features together, and the DevOps/QA/legal work needed
to launch responsibly.

## 2. Problem It Solves

Without this epic, there's no way to approve mentors, moderate content,
see platform health, deploy safely, or meet basic legal requirements before
onboarding real users.

## 3. Scope

### 3.1 Admin
- **User management**: `GET/PATCH /api/v1/admin/users` — list/search/filter,
  deactivate accounts; mentor approval queue
- **Content management**: CRUD for `Skill`, `QuestionBank`, curated PDF
  metadata — the *only* role allowed to touch this content (students/mentors
  get 403)
- **Analytics**: `GET /api/v1/admin/analytics` — aggregate-only numbers
  (signups, assessments taken, avg readiness, session volume, question
  engagement). No endpoint ever exposes one student's raw results by
  browsing — this is a hard platform boundary, not just a UI convention.
- Admin dashboard shell (nav, route guard enforced server-side, not just
  hidden UI)

### 3.2 Notifications
- `Notification` table: type, payload (JSON), read_at
- Service dispatches email (SendGrid/SES) + in-app for events: session
  booked, AI suggestion ready, mentor note added, etc.
- Email failures never block the triggering action — logged/retried instead
- Notification bell UI with unread count, real-time-ish updates

### 3.3 DevOps
- CI: lint + test + build on every PR (backend & frontend)
- CD: automated deploy to staging on merge to `main`, DB migrations run
  automatically as part of deploy
- Staging environment: isolated DB, seeded with representative test data
- Production: real hosting, HTTPS, custom domain, deploy is a deliberate
  reviewed action (not automatic on every merge)
- Monitoring: error tracking (e.g. Sentry) in both apps + uptime checks

### 3.4 QA
- Unit tests per module (auth, assessment/scoring, question bank,
  mentorship) as each ships
- E2E tests for critical journeys: signup/login, assessment-to-dashboard,
  booking flow
- Security review: dependency audit, manual review of role checks/data
  boundaries, common vulnerability classes (SQLi via ORM misuse, XSS,
  exposed secrets, missing rate limits)
- API documentation: every endpoint has a description + example in the
  auto-generated OpenAPI docs

### 3.5 Compliance & Product Ops
- Terms of Service & Privacy Policy pages, linked from signup
- Target-role taxonomy definition (SDE, Data Analyst, QA Engineer, etc.)
  mapped to skills — feeds both the profile form and later AI next-steps
- Rate limiting & security hardening on sensitive endpoints (login, signup,
  AI routes); CORS locked to known origins
- Product analytics instrumentation (signup completed, assessment
  submitted, dashboard viewed, PDF downloaded, session booked) — each event
  fires exactly once per real occurrence

## 4. Acceptance Criteria

- Every admin route enforces the role check server-side; hiding a nav link
  is never sufficient
- A student never sees another student's data; an admin never browses
  individual assessment history casually — only aggregates
- CI blocks a PR with a failing test or lint error
- A failed staging migration blocks the deploy rather than leaving it
  half-updated
- No high/critical dependency vulnerabilities outstanding before launch

## 5. Explicitly Out of Scope

- Fine-grained permission roles beyond Student/Mentor/Admin
- Multi-tenant/organization admin (not needed at this stage)

## 6. Related Jira Tickets

SCRUM-64–67, 83–90, 93–106 (excluding the Phase-2/3-tagged QA tickets which
live in their own PRDs).
