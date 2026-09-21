# PrepSuccess — Product Requirements Document (PRD)

## 1. Product Summary

**PrepSuccess** is a placement readiness and preparation platform for
college students. It gives a student a clear, scored picture of where they
stand (technical skills, soft skills, aptitude), tells them what to work on
next, and — as the product grows — connects them to AI-guided preparation,
downloadable interview material, and real developers/mentors for 1:1
support. The name reflects the core promise: **prepare well, and succeed at
placements.**

This document extends `project-overview.md` (roadmap/phases) and
`PROJECT_CONTEXT.md` (why this exists) with a deeper look at the
AI-assisted, mentorship, and content features, the student dashboard, and
how roles are managed across the platform. It does not contradict the
phase numbering or MVP scope already defined in those two files — Phase 1
is still the only in-scope build today; everything AI/mentorship-related
below is a **future-phase** feature described here so it's designed
consistently from day one.

## 2. What PrepSuccess Covers

| Area | What it means for the student |
|------|-------------------------------|
| Self-assessment | Technical + soft skills + aptitude, scored |
| Readiness dashboard | One place to see overall and category-wise readiness |
| AI guidance *(future)* | Personalized "what to improve next" and resume feedback |
| Interview prep material *(future)* | Question banks + downloadable prep PDFs |
| Mentorship *(future)* | 1:1 video calls and chat with developers/mentors |
| Progress tracking | See improvement over time, not just a one-time score |

PrepSuccess is built in phases (see `project-overview.md` §6). This PRD
focuses on making Phases 1–4 fit together as one coherent product rather
than four disconnected features.

## 3. How AI Helps Students (Future Capability)

AI is not part of the Phase 1 MVP, but the platform is designed so AI can
be layered in without redesigning the core data model. Planned AI-assisted
features:

- **Skill-gap analysis**: After an assessment, AI reviews the student's
  per-skill scores (from `AssessmentResult`) and produces a plain-language
  explanation of their weakest areas — not just a number, but *why* it
  matters and *what* to do about it.
- **Personalized "next steps"**: Instead of a generic tip list, AI
  generates a short, ranked action plan tailored to the student's target
  role (e.g., "SDE" vs. "QA Engineer") and current gaps.
- **Resume feedback**: AI reviews an uploaded resume against the student's
  target role and flags missing sections, weak phrasing, or formatting
  issues — feeding into the "soft skills" readiness category.
- **Interview question curation**: AI selects or generates practice
  questions relevant to the student's target role/company, drawing from
  the Phase 2 Question Bank.
- **Mock interview feedback** *(later)*: AI-assisted feedback on written or
  recorded mock answers (tone, clarity, structure) as a lightweight
  complement to human mentor sessions, not a replacement for them.

**Guiding principle**: AI augments the dashboard and prep material with
personalization; it never replaces the human mentor connection in Phase 3 —
the two are complementary (AI for scale/instant feedback, mentors for
depth/judgment).

## 4. One-to-One Developer/Mentor Connect (Future Capability)

Once a student knows their gaps, some of those gaps (soft skills, career
direction, real interview experience) are best closed with a real person.
Planned features:

- **Video calls**: Students book 1:1 video sessions with verified
  developers/mentors, scheduled around mentor availability.
- **Chat**: Lightweight in-app messaging for quick questions or
  async follow-up between sessions (not a general social feed — scoped to
  a student-mentor relationship or an active session).
- **Session context**: Before a call, the mentor sees only the relevant
  slice of the student's readiness data (their target role, weak skill
  areas, and notes from prior sessions) — not the student's full account
  history.
- **Session notes & follow-ups**: After a session, the mentor can leave
  notes/recommended actions, which show up back on the student's dashboard
  as new "next step" items — tying mentorship directly into the same
  readiness loop as the AI suggestions.
- **Learning from mentors**: Session history and notes accumulate over
  time, so a student's dashboard reflects both self-assessment progress
  *and* mentor-guided progress in one place.

## 5. Interview Preparation PDFs

Two kinds of downloadable material, both future-phase, both tied to the
Skill/Question Bank data introduced in Phase 2:

1. **Curated prep guides** — static-ish PDFs organized by company, role, or
   topic (e.g., "SDE interview guide," "Aptitude quick reference"),
   authored/maintained by Admins.
2. **Personalized readiness PDF** — auto-generated per student, summarizing
   their current readiness score, category breakdown, top skill gaps, and
   AI-suggested next steps. This is the most direct product of the AI +
   assessment data combined into one shareable document (useful for a
   student to review offline or share with a mentor before a session).

## 6. Student Dashboard — What a Student Actually Sees

The dashboard is the single home screen tying every feature together. Over
the product's phases, it grows to include:

| Dashboard section | Introduced in | What it shows |
|--------------------|---------------|----------------|
| Overall readiness score | Phase 1 | One number summarizing placement readiness |
| Category breakdown | Phase 1 | Technical / soft / aptitude sub-scores |
| Skill-gap highlights | Phase 1 | Weakest specific skills, ranked |
| Progress over time | Phase 2 | Score history / trend as the student retakes assessments and solves questions |
| Bookmarked/solved questions | Phase 2 | Interview question bank progress |
| AI-suggested next steps | Phase 4 (AI) | Personalized action list, refreshed as data changes |
| Downloadable prep PDFs | Phase 2–4 | Curated guides + personalized readiness PDF |
| Upcoming mentor sessions | Phase 3 | Scheduled 1:1 calls, chat access |
| Mentor session notes/follow-ups | Phase 3 | Notes and action items from past sessions |

The dashboard is designed to always answer the same question the platform
exists for: **"Where do I stand, and what should I do next?"** — every new
feature adds to that answer rather than becoming a separate destination.

## 7. Role Management

PrepSuccess has three core roles at this stage:

### Student
- Takes assessments and views their own dashboard only.
- Books mentor sessions and chats with assigned/booked mentors.
- Downloads prep PDFs and their personalized readiness PDF.
- Cannot see other students' data, mentor internals, or admin tools.

### Mentor / Developer
- Sets their own availability for sessions.
- Conducts video calls and chat with students who have booked them.
- Sees only the session-relevant slice of a student's data (target role,
  key gaps, prior notes with that mentor) — not the student's full
  assessment history or other mentors' sessions.
- Leaves session notes/follow-up actions that feed the student's dashboard.
- Cannot see other mentors' schedules, sessions, or students.

### Admin
- Manages user accounts (students and mentors), including mentor
  onboarding/approval.
- Manages the Skill taxonomy and Question Bank content.
- Manages/authors curated interview-prep PDFs.
- Views platform-wide analytics (aggregate, not individual private data
  beyond what's needed for support/moderation).
- Handles moderation of chat/session reports.

### Permissions at a Glance

| Capability | Student | Mentor/Developer | Admin |
|------------|:-------:|:-----------------:|:-----:|
| Take assessments | ✅ | ❌ | ❌ |
| View own dashboard | ✅ | ❌ | ❌ |
| View another user's dashboard | ❌ | Limited (session context only) | ✅ (support/analytics only) |
| Book/conduct mentor sessions | Book | Conduct | ❌ |
| Chat (scoped to relationship) | ✅ | ✅ | Moderation only |
| Download prep PDFs | ✅ | ❌ | Author/manage |
| Manage Skill/Question Bank content | ❌ | ❌ | ✅ |
| Approve mentor accounts | ❌ | ❌ | ✅ |
| View platform-wide analytics | ❌ | ❌ | ✅ |

## 8. How We Manage All of This (Operational View)

- **Content management**: Admins own the Skill taxonomy, the Question
  Bank, and the curated PDF library. Nothing here is student- or
  mentor-editable, keeping prep content consistent and vetted.
- **Mentor vetting**: New mentor/developer accounts go through an Admin
  approval step before they can appear as bookable — protecting the quality
  of the 1:1 sessions.
- **Data boundaries between roles**: The platform deliberately limits what
  each role can see — a mentor gets only what's needed for their session, a
  student never sees another student's data, and Admins see aggregate
  analytics rather than browsing individual accounts casually. This keeps
  the mentorship feature trustworthy as it scales.
- **Feedback loop ownership**: Both AI suggestions and mentor session notes
  write into the *same* "next steps" surface on the student dashboard, so
  the student always has one unified list rather than juggling separate AI
  and mentor recommendations.

## 9. Relationship to Existing Docs

This PRD builds on:
- `project-overview.md` — keeps the same Phase 1–4 roadmap and MVP scope;
  does not change what's in Phase 1 today.
- `PROJECT_CONTEXT.md` — keeps the same problem statement and target-user
  ordering (students → freshers → employees); this PRD adds feature depth
  for Phases 2–4 (AI, mentorship, PDFs) without redefining Phase 1.

All documents should be read together: overview for roadmap,
context for the "why," this PRD for the "what it looks like in detail," and `PRODUCTION_STANDARDS.md` for production architecture, security, and engineering rules.

