# PRD 02 — Interview Prep / Question Bank (Phase 2)

**Jira Epic:** Interview Prep (Question Bank) (SCRUM-115)
**Fix Version:** v0.2 — Phase 2 Interview Prep
**Owner:** Ayush Kumar (backend), Garv (frontend/design)
**Depends on:** Phase 1 shipped (Skill model, Auth, Dashboard)

## 1. Purpose

Once a student knows their gaps (Phase 1 dashboard), give them targeted
practice material: a searchable interview question bank tagged by
company/role/topic, with bookmarking and solve-tracking that feeds a
progress-over-time view.

## 2. Problem It Solves

Knowing you're weak in "Data Structures" isn't actionable on its own.
Phase 2 turns that gap into concrete practice questions and lets the
student track improvement over time instead of guessing.

## 3. Scope

### 3.1 Data Model
| Table | Key fields |
|---|---|
| `QuestionBank` | id, title, body, company (nullable), role (nullable), topic, difficulty, skill_id (FK → Skill), created_by |
| `UserQuestionProgress` | id, user_id, question_id, status (bookmarked/solved), updated_at |

`QuestionBank` reuses the Phase 1 `Skill` taxonomy rather than duplicating
it — a question tagged with a skill directly ties back to a student's
weak-skill list on the dashboard.

### 3.2 Backend
- Admin-only CRUD: `POST/PATCH/DELETE /api/v1/questions`
- Public/student read with filters: `GET /api/v1/questions?company=&role=&topic=&skill=`
- Bookmark/solve: `POST/DELETE /api/v1/questions/{id}/bookmark`,
  `POST /api/v1/questions/{id}/solve` (idempotent — no duplicate rows)
- Progress: `GET /api/v1/progress` — score history + solved-question counts,
  pre-bucketed for charting

### 3.3 Frontend
- Question bank browsing UI: filter/search, pagination, bookmark/solved
  indicators, shareable filter state via URL
- Question detail & solve UI
- Bookmarked-questions list page
- Progress-over-time chart on the dashboard (readiness score history +
  solve activity)
- Curated prep PDF download list (admin-authored, see PRD 04)

## 4. User Flow

1. Student browses/searches the question bank from their dashboard
2. Bookmarks questions to revisit, marks questions solved
3. Dashboard now shows a trend line of readiness score + solved-question
   count over time, not just a single snapshot

## 5. Acceptance Criteria

- Only admins can create/edit/delete questions; students get 403 on write
  routes
- Filtering by company + role + topic + skill can all combine correctly
- Bookmarking/solving twice does not create duplicate progress rows
- Progress-over-time chart renders sensibly with 1 data point and with many

## 6. Explicitly Out of Scope

- AI-curated or AI-generated questions (Phase 4)
- Mentor-assigned practice sets (Phase 3 territory, not planned)

## 7. Related Jira Tickets

SCRUM-31, 32, 43, 44, 50, 51, 52, 68–72, 80 (duplicate, closed), 91.
