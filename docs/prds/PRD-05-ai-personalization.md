# PRD 05 — Advanced AI, Resume Feedback & Job Portal (Phase 4–5)

**Jira Epic:** AI & Personalization (SCRUM-117, Phase 4 slice); Job Portal
(new epic, Phase 5, no tickets yet)
**Fix Version:** v0.4 — Phase 4 Expansion & Advanced AI; v0.5 — Phase 5 Job
Portal (future placeholder)
**Owner:** Ayush Kumar (backend), Garv (frontend)
**Depends on:** Phase 1 (AI agent layer, readiness/adaptive-assessment
data — see `PRD-01-core-mvp.md`), Phase 3 (shared "next steps" surface
established by mentor notes)

> **Revision note (2026-09-27):** Skill-gap analysis and personalized
> next-steps generation are **no longer Phase 4** — they were pulled
> forward into Phase 1 because they're inseparable from the AI
> onboarding/adaptive-assessment agent itself (see `PRD-01-core-mvp.md`
> §3.4–3.6). This PRD now covers what's genuinely still later-phase: resume
> feedback, the personalized readiness PDF, and — newly added — the future
> job portal direction (Phase 5).

## 1. Purpose

Layer deeper AI-assisted personalization on top of the assessment +
mentorship data already collected (by Phase 1's AI agent and Phase 3's
mentors), without ever replacing the human mentor connection. AI is for
scale and instant feedback; mentors are for depth and judgment — the two
are explicitly complementary, not competing. Phase 5 (job portal) is noted
here as the long-term direction so the data model isn't designed to
preclude it, even though it isn't ticketed yet.

## 2. Problem It Solves

A resume with vague phrasing or missing sections is hard for a student to
self-diagnose, and once a student is actually "ready," there's currently no
way to act on that inside PrepSuccess — they'd have to leave for a job
board. This PRD closes both gaps at zero marginal cost per student for the
AI parts, and describes the job-portal direction for later.

## 3. Scope

### 3.1 Skill-Gap Analysis & Next Steps — MOVED

These are now Phase 1 capabilities, built directly into the onboarding/
adaptive-assessment AI agent. See `PRD-01-core-mvp.md` §3.4–3.6 and Jira
tickets SCRUM-60/61/79 (moved to fix version v0.1).

### 3.3 Resume Feedback
- `POST /api/v1/ai/resume-feedback` — accepts PDF/text resume, returns
  structured feedback (sections found, issues, suggestions) tuned to the
  student's target role
- Feeds a resume-quality signal into the "soft skills" readiness category

### 3.4 Personalized Readiness PDF
- `GET /api/v1/pdf/readiness` — auto-generated PDF: overall score, category
  breakdown, top skill gaps, AI-suggested next steps
- Regenerates on data change, otherwise serves a cached version; renders
  correctly with zero, partial, or full assessment data

### 3.5 Frontend
- AI-suggested next steps panel on the dashboard (loading/empty states
  while generating; visually coexists with mentor-authored items)
- Resume upload & AI feedback UI (structured checklist, not a text wall)
- Personalized readiness PDF download button

### 3.5 Job Portal (Phase 5 — future direction, not yet ticketed)

Once a student's dashboard shows they're interview-ready, the natural next
step — not yet built anywhere — is applying to real roles without leaving
PrepSuccess:

- Integrated job/internship listings, filterable by the same target-role
  taxonomy already used for the Phase 1 profile and Phase 2 question bank
- Applications tracked against the student's own `User`/`UserProfile`
  record, so "interview readiness" from the dashboard can eventually gate
  or recommend which listings to apply to
- No API/data-model design has been committed yet — this section exists so
  Phase 1–4 entities (`User`, `Skill`, target-role taxonomy) aren't
  designed in a way that would block it later

## 4. User Flow

1. Student has completed the Phase 1 AI onboarding/assessment loop and
   optionally had mentor sessions (Phase 3)
2. Student uploads a resume for AI feedback, downloads a personalized
   readiness PDF to review offline or share with a mentor
3. *(Phase 5, future)* Student browses integrated job listings once their
   dashboard shows they're interview-ready

## 5. Acceptance Criteria

- Resume feedback handles at minimum PDF and plain-text input
- Readiness PDF renders sensibly for a student with no assessment data yet
- Readiness PDF includes the AI-generated next steps that now originate in
  Phase 1, not duplicated logic

## 6. Explicitly Out of Scope (for this phase)

- Mock interview AI feedback (described in the product PRD as a later,
  lightweight complement to mentors — not yet ticketed)
- AI-generated interview questions (would extend PRD 02's Question Bank,
  not currently scoped)
- Any concrete job-portal API/schema work (Phase 5 is direction-only for
  now)

## 7. Related Jira Tickets

SCRUM-62, 63, 81, 82 (resume feedback + personalized PDF, backend and
frontend). SCRUM-60/61/79 have moved to `PRD-01-core-mvp.md` (fix version
v0.1). Job Portal (Phase 5) has no tickets yet — only a placeholder epic.
