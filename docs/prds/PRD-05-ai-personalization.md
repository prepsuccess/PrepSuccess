# PRD 05 — AI & Personalization (Phase 4)

**Jira Epic:** AI & Personalization (SCRUM-117)
**Fix Version:** v0.4 — Phase 4 Expansion & AI
**Owner:** Ayush Kumar (backend), Garv (frontend)
**Depends on:** Phase 1 (Readiness scoring API), Phase 3 (shared "next
steps" surface established by mentor notes)

## 1. Purpose

Layer AI-assisted personalization on top of the assessment + mentorship
data already collected, without ever replacing the human mentor connection
established in Phase 3. AI is for scale and instant feedback; mentors are
for depth and judgment — the two are explicitly complementary, not
competing.

## 2. Problem It Solves

A raw score ("62% technical readiness") doesn't tell a student *why* it
matters or *what* to do next. AI turns that number into plain-language
explanation and a ranked, personalized action plan — instantly, at zero
marginal cost per student.

## 3. Scope

### 3.1 Skill-Gap Analysis
- `GET /api/v1/ai/skill-gap` — LLM-generated plain-language explanation of
  a student's weakest areas, grounded strictly in their actual
  `AssessmentResult` rows (no hallucinated skills not present in their data)
- Regenerates only when underlying assessment data changes, not on every
  page view (cached)

### 3.2 Personalized Next Steps
- `GET /api/v1/ai/next-steps` — 3–5 ranked, specific action items combining
  skill-gap output + the student's target role
- Writes into the **same shared "next steps" list** mentor notes populate
  (Phase 3) — the student always sees one unified list, never two
  fragmented sources of advice

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

## 4. User Flow

1. Student has completed at least one assessment (Phase 1) and optionally
   had mentor sessions (Phase 3)
2. Dashboard's "next steps" panel shows AI-generated + mentor-authored items
   together
3. Student uploads a resume for AI feedback, downloads a personalized
   readiness PDF to review offline or share with a mentor

## 5. Acceptance Criteria

- AI skill-gap output never references a skill absent from the student's
  actual scores
- Next steps are specific (name a skill/topic) — never generic advice
- Resume feedback handles at minimum PDF and plain-text input
- Readiness PDF renders sensibly for a student with no assessment data yet

## 6. Explicitly Out of Scope (for this phase)

- Mock interview AI feedback (described in the product PRD as a later,
  lightweight complement to mentors — not yet ticketed)
- AI-generated interview questions (would extend PRD 02's Question Bank,
  not currently scoped)

## 7. Related Jira Tickets

SCRUM-60–63, 79, 81, 82.
