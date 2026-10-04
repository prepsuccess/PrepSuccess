# Phase 2 — Interview Prep (Question Bank): Build Plan

**Jira:** Interview Prep (Question Bank) epic (SCRUM-115) · **Fix version:** v0.2
**Tickets:** SCRUM-31, 32, 43, 44, 50, 51, 52, 68–72, 91
**Depends on:** Phase 1 shipped — the `Skill` table, auth, and the dashboard
**Sources:** [PRD-02](prds/PRD-02-interview-prep.md), [PRD-04](prds/PRD-04-admin-platform-ops.md) §3.1,
[PRD-OVERALL](prds/PRD-OVERALL.txt) §8 and §11, [PRODUCTION_STANDARDS](PRODUCTION_STANDARDS.md)

This document turns PRD-02 into a concrete plan against the code as it exists
today: the data model, API, screens, tests, and the order to build them in.

---

## 1. Goal

Phase 1 tells a student **where their gaps are**. Phase 2 gives them
**interview questions to practise on exactly those gaps**, and shows
whether they are improving over time.

**Phase 2 succeeds when** a student can find, bookmark and solve interview
questions relevant to their weakest skills, and see their improvement as a
trend rather than a single number (PRD-OVERALL §15).

## 2. Scope at a glance

| # | Feature | Who |
|---|---|---|
| 1 | Interview question bank, tagged by company, role, topic, difficulty and **skill** | Students read, admins write |
| 2 | Browse and search with combinable filters, pagination, filters kept in the URL | Students |
| 3 | Question detail page with inline bookmark / solve | Students |
| 4 | Bookmarks page | Students |
| 5 | Progress over time: readiness history plus questions solved, on the dashboard | Students |
| 6 | Curated prep PDFs (e.g. "SDE interview guide", "Aptitude quick reference") | Students download, admins manage |
| 7 | Admin tools for questions and PDFs | Admins |

### Out of scope (per PRD-02 §6)
- AI-generated or AI-curated questions (Phase 4)
- Mentor-assigned practice sets (not planned)
- Personalized readiness PDF (Phase 4; only the *curated* PDFs are Phase 2)

## 3. What already exists to build on

| Existing piece | Where | Used for |
|---|---|---|
| 36-skill catalogue (`Skill`) | `backend/prisma/schema.prisma`, `backend/src/modules/skills/catalogue.ts` | Every question links to one skill |
| Readiness history (score after each check) | `GET /dashboard` → `readiness.history`; chart in `frontend/components/app/dashboard/Charts.tsx` | Half of the progress chart already exists |
| Pagination meta in the response envelope | `PaginationMeta` in `backend/src/lib/http.ts` (`page`, `limit`, `total`) | Question listing |
| Admin content manager | `backend/src/modules/admin/*`, `frontend/components/admin/ContentManager.tsx` | Question and PDF CRUD |
| `requireAuth("ADMIN")`, rate limiting, zod + OpenAPI docs | `backend/src/middleware/*`, `backend/src/docs/*` | Admin-only writes, documented routes |
| Weak skills (gaps) | `GET /dashboard` → `gaps` | "Practise questions for your weak skills" links |
| Notifications, toasts, analytics `track()` | `notifications.service.ts`, `AppToaster.tsx`, `frontend/lib/analytics.ts` | Events and feedback |

> **Naming note:** `check_questions` (Phase 1) are the multiple-choice
> questions used inside skill checks. Phase 2's questions are a separate,
> open-ended **interview** question bank for browsing and practice. They
> live in a different table and the two must not be mixed.

## 4. Data model

Follows PRODUCTION_STANDARDS §2.2 (RLS on) and §2.3 (base fields). One
migration, e.g. `prisma/migrations/2026XXXX_interview_question_bank`, ending
with `ALTER TABLE … ENABLE ROW LEVEL SECURITY;` for each new table.

```prisma
enum QuestionStatus {
  BOOKMARKED
  SOLVED
}

/// Interview questions for practice (Phase 2). Not the skill-check MCQs (check_questions).
model QuestionBank {
  id          String     @id @default(uuid()) @db.Uuid
  skillId     String     @map("skill_id") @db.Uuid
  title       String     @db.VarChar(200)
  /// Same light formatting as task briefs: blank line = paragraph, "- " = list, ``` = code.
  body        String
  /// Optional model answer / hints, shown after the student chooses to reveal it.
  answer      String?
  company     String?    @db.VarChar(100)   // e.g. "TCS", "Infosys"
  role        String?    @db.VarChar(100)   // e.g. "SDE", "Data Analyst"
  topic       String     @db.VarChar(100)   // e.g. "Arrays", "Joins"
  difficulty  Difficulty                    // reuse the Phase 1 enum (EASY/MEDIUM/HARD)
  createdById String     @map("created_by") @db.Uuid
  isActive    Boolean    @default(true) @map("is_active")
  isDeleted   Boolean    @default(false) @map("is_deleted")
  createdAt   DateTime   @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime   @updatedAt @map("updated_at") @db.Timestamptz(6)

  skill     Skill                  @relation(fields: [skillId], references: [id], onDelete: Restrict)
  createdBy User                   @relation("QuestionAuthor", fields: [createdById], references: [id])
  progress  UserQuestionProgress[]

  @@index([skillId])
  @@index([company])
  @@index([role])
  @@index([topic])
  @@map("question_bank")
}

/// One row per student per question (unique), so bookmark/solve are idempotent.
model UserQuestionProgress {
  id           String    @id @default(uuid()) @db.Uuid
  userId       String    @map("user_id") @db.Uuid
  questionId   String    @map("question_id") @db.Uuid
  bookmarked   Boolean   @default(false)
  solvedAt     DateTime? @map("solved_at") @db.Timestamptz(6)
  createdAt    DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt    DateTime  @updatedAt @map("updated_at") @db.Timestamptz(6)

  user     User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  question QuestionBank @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([userId, questionId])
  @@index([userId, solvedAt])
  @@map("user_question_progress")
}

/// Curated prep guides (Phase 2). Metadata only; the file lives in storage (see §9, open question 1).
model PrepPdf {
  id          String   @id @default(uuid()) @db.Uuid
  title       String   @db.VarChar(200)       // "SDE interview guide"
  description String?  @db.VarChar(500)
  skillId     String?  @map("skill_id") @db.Uuid
  role        String?  @db.VarChar(100)
  company     String?  @db.VarChar(100)
  fileUrl     String   @map("file_url") @db.VarChar(500)
  fileSize    Int?     @map("file_size")
  downloads   Int      @default(0)
  isActive    Boolean  @default(true) @map("is_active")
  isDeleted   Boolean  @default(false) @map("is_deleted")
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  skill Skill? @relation(fields: [skillId], references: [id], onDelete: SetNull)

  @@map("prep_pdfs")
}
```

**Deviation from PRD-02, on purpose:** PRD-02 lists a single `status`
(bookmarked *or* solved). A student will often want a question both
bookmarked **and** solved, so the plan stores `bookmarked` and `solvedAt`
separately on the one unique row. It is still one row per student and
question, so the "no duplicate rows" criterion holds, and `solvedAt` gives
the progress chart its dates for free.

## 5. Backend API

New module `backend/src/modules/questions/` (`questions.logic.ts`,
`.schemas.ts`, `.service.ts`, `.controller.ts`, `.routes.ts`, `.docs.ts`),
mounted at `/api/v1/questions`. Admin routes go in the existing admin module.
Every route is documented (`tests/docs.test.ts` fails otherwise) and uses
the standard envelope.

### 5.1 Student routes (`requireAuth("STUDENT")`)

| Method | Path | Notes |
|---|---|---|
| GET | `/questions?company=&role=&topic=&skill=&difficulty=&q=&status=&page=&limit=` | All filters combine (AND). `q` searches title and body. `status=bookmarked\|solved\|unsolved`. `limit` max 50. Returns `meta.pagination`. Each item carries `bookmarked` and `solved` for the current student. |
| GET | `/questions/filters` | Distinct companies, roles and topics (with counts) for the filter dropdowns. |
| GET | `/questions/{id}` | Full question (answer hidden until requested; see open question 3). |
| POST | `/questions/{id}/bookmark` | Idempotent upsert, returns the progress. |
| DELETE | `/questions/{id}/bookmark` | Idempotent; no error if not bookmarked. |
| POST | `/questions/{id}/solve` | Idempotent: sets `solvedAt` only if empty (first solve date is kept). |
| DELETE | `/questions/{id}/solve` | Undo "solved". |
| GET | `/questions/bookmarks?page=&limit=` | The student's bookmarked questions, newest first. |
| GET | `/progress` | See 5.3. |
| GET | `/prep-pdfs` | Active PDFs (title, description, size, tags). |
| GET | `/prep-pdfs/{id}/download` | Counts the download (for admin analytics), then redirects (302) to the file. |

### 5.2 Admin routes (`requireAuth("ADMIN")`, under `/api/v1/admin`)

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/questions?…filters…` | Includes inactive and soft-deleted. |
| POST | `/admin/questions` | Create (sets `created_by`). |
| PATCH | `/admin/questions/{id}` | Edit; `is_active` hides it from students. |
| DELETE | `/admin/questions/{id}` | Soft delete (`is_deleted = true`). |
| POST | `/admin/questions/import` | Optional: bulk CSV/JSON import for seeding (see §7, step 2). |
| GET/POST/PATCH/DELETE | `/admin/prep-pdfs[/{id}]` | Same pattern for PDFs. |

PRD-02 names the write routes `POST/PATCH/DELETE /api/v1/questions`. Putting
them under `/admin` matches how Phase 1 already did skills, resources and
tasks. Either way, students must get **403** on every write (acceptance
criterion 1).

### 5.3 Progress endpoint

`GET /api/v1/progress` returns data pre-bucketed for charting, so the
frontend does no maths (Phase 1 rule: numbers come from the backend):

```json
{
  "readiness": [{ "date": "2026-10-03", "score": 48 }],
  "solved_by_week": [{ "week_start": "2026-09-28", "solved": 6, "total_solved": 14 }],
  "totals": { "solved": 14, "bookmarked": 5, "by_skill": [{ "skill_id": "…", "name": "SQL", "solved": 4 }] }
}
```

- `readiness` reuses Phase 1's `readinessHistory()` (`dashboard.logic.ts`).
- Weeks start on Monday, IST (`lib/time.ts` has `startOfIndianDay`).
- With one data point it returns one point; the frontend shows a dot plus
  a hint ("solve more questions to see a trend"), never a broken chart.

### 5.4 Rules (pure `questions.logic.ts`, unit-tested without a database)
- Filter builder: query params → Prisma `where` (AND of all present filters).
- Search: case-insensitive `contains` on title/body (Postgres full-text can
  come later if the bank grows).
- Bucketing solved dates into IST weeks, and the running total.
- Validation: title 5–200 chars, body ≤ 10,000, topic required, company/role
  trimmed, with consistent capitalisation ("tcs" → "TCS") so filters don't split.

## 6. Frontend

| Route | Screen |
|---|---|
| `/questions` | **Question bank.** Filter bar (skill, company, role, topic, difficulty, status) plus search, synced to the URL (`?skill=sql&company=TCS`) so a filtered view can be shared. Cards show title, tags, difficulty bars, and bookmark/solved state. Paginated. Empty state with "clear filters". |
| `/questions/[id]` | **Question detail.** Body (rendered by the existing `Prose`), tags, **Bookmark** and **Mark solved** buttons that update instantly (optimistic, rolled back on error), "Show answer / hints", and "More questions on {skill}". |
| `/questions/bookmarks` | **My bookmarks** with a remove action. |
| `/prep-guides` | **Prep PDFs**: list with title, description and size; download button. |
| `/dashboard` | **Progress over time**: the existing readiness line chart gets a second series or tab for questions solved per week. |
| `/learn/[slug]` | New "Interview questions" section: the top 5 questions for that skill, linking to `/questions?skill=…`. |
| `/admin/content` | New **Questions** and **Prep PDFs** tabs in `ContentManager`: table, create/edit form, toggle active, soft delete. |

Other frontend work:
- **Sidebar:** add "Interview prep" (questions) between Learn and Profile.
- **Dashboard gaps:** each weak skill gets a "Practise questions" link to `/questions?skill=<slug>`.
- **AI coach:** add the question bank to `APP_GUIDE` in `coach.logic.ts` so the coach can point students to it.
- **API:** new RTK Query endpoints in `lib/api/endpoints/questions.ts`; regenerate types (`npm run api:types`).
- **Analytics** (PRD-04 §3.5, each fired once): `question_bookmarked`, `question_solved`, `prep_pdf_downloaded`.
- **Accessibility:** filters are labelled controls; bookmark/solve are toggle buttons with `aria-pressed`; status is shown by text and icon, never colour alone.

## 7. Build order

Each step ends with lint, types, tests and docs green, and can be its own PR.

1. **Data model.** Migration, Prisma models, RLS, and an update to `docs/DATA_MODEL.md`.
2. **Seed content.** About 20 questions per skill for the 36 skills (~700 questions; a curated starter set, since AI-generated questions are out of scope), plus 3–5 starter PDFs. Seeded idempotently by `prisma/seed.ts`, matched by skill and title.
3. **Student read API.** List with filters, pagination and search; filter options; detail. Tests.
4. **Bookmark / solve API.** Idempotent upserts, bookmarks list. Tests for idempotency.
5. **Admin API.** Question CRUD and soft delete; 403 for students. Tests.
6. **Question bank UI.** `/questions` with URL-synced filters, cards, pagination, empty and loading states.
7. **Detail and bookmarks UI.** `/questions/[id]` with optimistic toggles; `/questions/bookmarks`.
8. **Progress.** `GET /progress` and the dashboard chart (1-point and many-point states).
9. **Prep PDFs.** Storage decision (§9), admin upload/metadata, `/prep-guides`, download counting.
10. **Connections.** Learn page section, dashboard gap links, sidebar item, coach guide, analytics events.
11. **Admin UI.** Questions and PDFs tabs in the content manager.
12. **E2E and polish.** Playwright journeys (§8), dark mode and phone checks, docs.

## 8. Testing (PRD-OVERALL §11)

**Backend (Vitest, mocked Prisma like the Phase 1 tests):**
- Admin-only writes: student and mentor get 403 on every write route; no token gets 401.
- Filtering: each filter alone, all combined, an empty result, and pagination totals.
- Idempotency: bookmark ×2 → one row; solve ×2 → one row and the first `solvedAt` kept; un-bookmark when not bookmarked → 200.
- Progress: no data, one point, many points; week bucketing across an IST day boundary, checked against hand-computed values.
- Every new route documented (`docs.test.ts`).

**Frontend (Vitest + MSW):** filters update the URL and the request; bookmark toggles optimistically and rolls back on error; the chart renders with 1 and many points.

**E2E (Playwright, mocked API):**
1. Student filters by skill and company → opens a question → bookmarks it → marks it solved → sees it under Bookmarks.
2. A dashboard gap link opens the question bank pre-filtered to that skill.
3. A student visiting an admin question route is redirected.

## 9. Open questions (decide before step 9)

1. **Where do PDFs live?** *Decided:* the 5 starter guides ship with the app. Their
   source is `frontend/guides/*.html`; `npm run guides:build` (in `frontend/`) prints
   them to `frontend/public/guides/*.pdf`, and `prisma/seed.ts` links them via
   `FRONTEND_URL` (`backend/src/modules/questions/guides.ts`). Admins add more by
   pasting public links. The options were:
   - Supabase Storage. Needs `SUPABASE_URL` and a service key on Render, and signed download URLs.
   - Any public URL (e.g. Google Drive), with admins pasting links. No new infrastructure. **Recommended to start.**
   - Store files in Postgres. Not recommended for multi-MB PDFs.
2. **Where do ~700 starter questions come from?** Options: hand-written by the team, sourced from public interview-experience posts (rewritten, not copied), or written with AI help and **human-reviewed** before seeding. PRD-02 forbids only *AI-curated questions at runtime*, not authoring help.
3. **Show answers?** Recommendation: optional "Show hints / model answer", hidden by default so the student tries first.
4. **Company names:** free text, or a fixed list so "TCS" and "Tata Consultancy" don't split? Recommendation: a small fixed list that admins can extend.
5. **Role taxonomy:** Phase 1 left "target role → skills" open (PROJECT_CONTEXT §12). Phase 2's `role` tag is a chance to settle it: one shared role list used by both the profile and questions.

## 10. Acceptance criteria (definition of done)

- [x] Only admins can create, edit or delete questions and PDFs; students get **403** on every write.
- [x] Company, role, topic, skill and difficulty filters **combine correctly**, with correct pagination totals.
- [x] Bookmarking or solving the same question twice **never creates a duplicate row**.
- [x] The progress chart renders sensibly with **one** data point and with **many**.
- [x] Filtered views are shareable by URL.
- [x] Each weak skill on the dashboard links to matching questions.
- [x] All new routes documented in OpenAPI; frontend types regenerated; CI green (lint, types, tests, migrations, e2e).
- [x] Works in light and dark mode and at phone width; meets the accessibility rules in §6.

## 11. Ticket mapping (to confirm in Jira)

| Area | Tickets |
|---|---|
| Data model (QuestionBank, UserQuestionProgress) | SCRUM-43, 44 |
| Backend: question CRUD, filters, bookmark/solve, progress | SCRUM-50, 51, 52 |
| Frontend: browse, detail, bookmarks, progress chart, prep PDFs | SCRUM-68–72 |
| Design: question bank and detail screens | SCRUM-31, 32 |
| Tests / QA | SCRUM-91 |

This mapping is inferred from the ticket ranges in PRD-02 §7; confirm the
exact ticket per item in Jira before starting.

## 12. Built beyond the plan

Added after a student walkthrough showed where practice stalled:

| Feature | Where | Notes |
|---|---|---|
| Filters toggle | `/questions` | The filter panel opens from a **Filters** button (with a count of active filters); search stays outside it. |
| My skills | `/questions?mine=1`, `GET /questions/mine` | Questions for the profile's skills, plus skills named in goals ("get better at DSA") and questions tagged with the target role. Per-skill chips show solved / total and filter by skill. |
| Practise your answer | `/questions/[id]`, `POST /questions/{id}/attempt` | The student writes an answer; the AI scores it 0–10 and lists what they covered, what to add and one tip. Counts toward the daily AI limit, rate-limited per user, latest attempt saved (migration `20261011000000_question_attempts`). Never marks the question solved. |
| Coach on a question | `/questions/[id]`, `POST /ai/coach/messages` `context.question_id` | "Ask coach about this question" opens the coach with that question attached for the reply. |
| Check result → questions | Skill-check result page | Links to that skill's interview questions when it has any. |
| Bulk import | Admin → Questions, `POST /admin/questions/import` | CSV or JSON, with a dry run that reports what would be created, restored, skipped or rejected before anything is written. |

This is a step towards PRD-02's "AI-curated practice" only in feedback on the
student's own answer; questions are still the curated bank, not generated.
