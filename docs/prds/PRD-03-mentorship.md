# PRD 03 — Mentorship Platform (Phase 3)

**Jira Epic:** Mentorship Platform (SCRUM-116)
**Fix Version:** v0.3 — Phase 3 Mentorship
**Owner:** Ayush Kumar (backend), Garv (frontend/design)
**Depends on:** Phase 1 (User/Auth), Phase 2 recommended but not required

## 1. Purpose

Some gaps — soft skills, career direction, real interview experience — are
best closed by a real person, not content. Phase 3 lets students book 1:1
video sessions with verified developer/mentors, chat with them, and receive
follow-up notes that feed back into the same dashboard "next steps" list
used by AI suggestions (Phase 4).

## 2. Problem It Solves

A student can know exactly what they're weak at and still not know *how* to
fix it. A mentor session converts a diagnosed gap into personalized, human
guidance — and the notes from that session become another actionable item
on the dashboard.

## 3. Scope

### 3.1 Data Model
| Table | Key fields |
|---|---|
| `MentorProfile` | id, user_id (FK → User, unique), bio, expertise_tags, years_experience, approval_status (pending/approved/rejected) |
| `Session` | id, student_id, mentor_id, scheduled_at, duration_minutes, status (booked/completed/cancelled), notes |
| `ChatMessage` | id, sender_id, recipient_id, session_id (nullable), body, sent_at, read_at |

`MentorProfile` extends `User` rather than duplicating identity fields —
any user can apply to become a mentor.

### 3.2 Mentor Lifecycle
- A user applies (`POST /api/v1/mentors/apply`) → pending `MentorProfile`
- Admin approves/rejects (`POST /api/v1/admin/mentors/{id}/approve|reject`)
- Only approved mentors appear in `GET /api/v1/mentors` (public listing)
- Mentor sets availability windows; overlapping windows rejected or merged

### 3.3 Booking
- `POST /api/v1/sessions` books an open slot; double-booking rejected
- On booking, the mentor sees only the **session-relevant slice** of the
  student's data (target role, key gaps) — never the full assessment
  history, per the platform's role-based data boundaries
- `POST /api/v1/sessions/{id}/cancel`

### 3.4 Video + Chat
- Video provider integration (Twilio/Daily/Agora/Google Meet) — join token
  valid only for the two participants, only within the scheduled window
- WebSocket chat scoped strictly to users who share a booking relationship
  — never an open social feed

### 3.5 Session Notes
- Mentor adds notes/follow-ups after a session
  (`POST /api/v1/sessions/{id}/notes`)
- Notes surface on the student's dashboard "next steps" list — the same
  surface AI suggestions write to (Phase 4), so the student sees one
  unified list, not two competing ones

### 3.6 Payments (if required by the mentorship model)
- Stripe/Razorpay one-off session payments
- A session is not confirmed as booked until payment succeeds (or is
  explicitly marked free)
- Webhook signature verification required

### 3.7 Frontend
- Mentor listing & search, mentor profile page, booking calendar UI
- Video call UI integration ("Join call" active only in the valid window)
- Chat UI (real-time via WebSocket)
- Session notes view UI, payment checkout UI

## 4. User Flow

1. Student browses approved mentors, filtered by expertise/relevance to
   target role
2. Books an open slot on a mentor's calendar (pays if required)
3. Joins the video call at the scheduled time; chats before/after as needed
4. Mentor leaves notes after the session → appears on student's dashboard

## 5. Acceptance Criteria

- Unapproved mentors never appear publicly
- A mentor's view of a student is always scoped — never the full
  assessment history
- Double-booking the same slot is impossible
- A failed payment leaves the slot unbooked and retryable
- Chat is only ever possible between users with an existing booking
  relationship

## 6. Explicitly Out of Scope

- Group sessions or webinars
- Mentor ratings/reviews (not currently scoped; revisit post-launch)
- AI-assisted session prep (Phase 4 territory, separate from this epic)

## 7. Related Jira Tickets

SCRUM-33–35, 45–47, 53–59, 73–78, 92, 98, 107.
