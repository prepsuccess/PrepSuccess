# PrepSuccess — System Architecture & Systematic Project Flow

This document defines the **end-to-end systematic engineering flow** and architectural blueprints for the entire PrepSuccess platform, with specific depth on the Authentication, Registration, and Email OTP verification workflows.

---

## 1. Master System Lifecycle (Phased Progression)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    PREPSUCCESS PLATFORM FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: BENCHMARK & READINESS (Current MVP - Target: November Launch)                           │
│ 1. Identity & Auth: Email OTP Verification OR 1-Click Google OAuth (Default Role = STUDENT)      │
│ 2. Profile Setup: Student details (College, Branch, Year, Target Role)                          │
│ 3. Self-Assessment: Multi-dimensional test (Technical DSA/CS + Soft Skills + Aptitude)          │
│ 4. Readiness Dashboard: 0–100 Placement Readiness Score, Category Sub-scores, Ranked Gaps       │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: TARGETED INTERVIEW PRACTICE                                                            │
│ 1. Question Bank: Searchable/Filterable by Company, Role, Topic, Difficulty (Tagged by Skill)   │
│ 2. Progress Tracking: Bookmarking, solve-tracking, and progress-over-time trend chart            │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: 1:1 DEVELOPER SESSIONS & MENTORSHIP                                                    │
│ 1. Mentor Onboarding & Approval: Admin-reviewed developer profiles                              │
│ 2. Booking & Sessions: 1:1 Video Calls (WebRTC) & Real-time WebSocket Chat                      │
│ 3. Session Notes: Mentor leaves action items that feed into the student's Dashboard Next Steps │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: AI GUIDANCE & ECOSYSTEM EXPANSION                                                      │
│ 1. AI Skill Gap Explanation: Plain-language analysis of weakest areas                           │
│ 2. Resume Feedback & PDF Export: Role-tuned resume score & downloadable readiness report        │
│ 3. Audience Expansion: Onboarding Freshers & Working Professionals                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Comprehensive User Schema & Data Models

### 2.1 `users` Entity (Single Source of Truth)

All user types (Students, Mentors, Admins) and both authentication methods (Local Email vs Google OAuth) share this table:

| Column Name | Type | Modifiers / Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key (UUIDv4) |
| `first_name` | `VARCHAR(100)` | Mandatory |
| `last_name` | `VARCHAR(100)` | Optional / Mandatory |
| `email` | `VARCHAR(255)` | Unique, Indexed, Always Normalized (lowercased & trimmed) |
| `mobile_no` | `VARCHAR(20)` | Nullable (Captured during registration or Google onboarding) |
| `age` | `INTEGER` | Nullable |
| `gender` | `VARCHAR(20)` | `MALE`, `FEMALE`, `OTHER`, `PREFER_NOT_TO_SAY` |
| `student_year` | `INTEGER` | `1`, `2`, `3`, `4` (College Year) |
| `profile_image_url`| `VARCHAR(500)` | Nullable (Auto-populated from Google OAuth or uploaded) |
| `role` | `VARCHAR(20)` | **Default: `STUDENT`**, `MENTOR`, `ADMIN` |
| `auth_provider` | `VARCHAR(20)` | `LOCAL`, `GOOGLE` |
| `password_hash` | `VARCHAR(255)` | Nullable (Null for Google-only signups, bcrypt-hashed for local) |
| `google_id` | `VARCHAR(255)` | Unique, Indexed, Nullable |
| `is_verified` | `BOOLEAN` | Default `False` for local signups (set to `True` on OTP verification), `True` for Google |
| `is_profile_completed`| `BOOLEAN`| Default `False` (used to prompt Google users for mobile/year) |
| `is_active` | `BOOLEAN` | Default `True` (Soft-delete & suspension support) |
| `created_at` / `updated_at`| `TIMESTAMPTZ` | Auto UTC timestamps |

---

### 2.2 `email_otps` Entity (Email Verification Engine)

Stores cryptographically hashed, short-lived one-time passwords for email verification:

| Column Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key |
| `email` | `VARCHAR(255)` | Indexed, Normalized |
| `otp_hash` | `VARCHAR(255)` | SHA-256 / bcrypt hash of the 6-digit OTP code |
| `purpose` | `VARCHAR(30)` | `SIGNUP`, `PASSWORD_RESET`, `LOGIN` |
| `expires_at` | `TIMESTAMPTZ` | 10 minutes from generation |
| `is_used` | `BOOLEAN` | Default `False`, marked `True` immediately upon successful verification |
| `attempts` | `INTEGER` | Default `0`, max 3 failed attempts allowed |
| `created_at` | `TIMESTAMPTZ` | Generation timestamp |

---

## 3. Systematic Auth & Registration Flows

### 3.1 Flow A: Email + Password Registration with Free Gmail OTP

```
[ Frontend: User enters Email ]
              │
              ▼ (POST /api/v1/auth/send-otp)
    [ Backend API Controller ]
              │
              ├── 1. Check: Email already exists in `users`?
              │      └── YES ──▶ Return 409 Conflict ("Email already registered")
              │
              ├── 2. Rate-Limiting: Check recent OTP sent in last 60 seconds?
              │      └── YES ──▶ Return 429 ("Please wait 60s before requesting a new OTP")
              │
              ├── 3. Generate 6-digit secure numeric OTP (e.g. 749215)
              ├── 4. Store hashed OTP in `email_otps` with 10-minute expiry
              │
              ▼ (Dispatched via Async FastAPI BackgroundTasks)
    [ Send HTML Email via Free Gmail SMTP ]
              │
              ▼
    [ Student receives OTP in Gmail Inbox ]

─────────────────────────────────────────────────────────────────────────────

[ Frontend: User enters Form Details + 6-digit OTP ]
(first_name, last_name, email, password, mobile_no, age, gender, student_year, profile_image_url, otp)
              │
              ▼ (POST /api/v1/auth/register)
    [ Backend API Controller ]
              │
              ├── 1. Validate OTP from `email_otps`:
              │      ├── Expired? ──▶ Return 400 Bad Request ("OTP expired")
              │      ├── Invalid Code? ──▶ Increment `attempts`. If attempts > 3, invalidate OTP.
              │      └── Already Used? ──▶ Return 400 Bad Request ("Invalid OTP")
              │
              ├── 2. Invalidate OTP: Mark `is_used = True`
              ├── 3. Hash Password using bcrypt (12 rounds)
              ├── 4. Insert into `users` table:
              │      - role = STUDENT (default)
              │      - auth_provider = LOCAL
              │      - is_verified = True
              │      - is_profile_completed = True
              │
              ▼
    [ Issue Dual JWT Tokens: Access Token (30m) + Refresh Token (7d) ]
              │
              ▼
    [ Return 201 Created with sanitized UserResponse + Tokens ]
```

---

### 3.2 Flow B: 1-Click Google OAuth 2.0 (SSO)

```
[ Frontend: Student clicks "Continue with Google" ]
              │
              ▼
[ Google OAuth 2.0 Consent Screen ]
              │
              ▼ Google returns authorization code
[ Backend: POST /api/v1/auth/google ]
              │
              ▼ Verify ID Token with Google APIs
    Extract: `google_id`, `email`, `given_name`, `family_name`, `picture`
              │
              ├── Case 1: User with `google_id` exists?
              │     └── YES ──▶ Issue JWT Tokens & Log in immediately.
              │
              ├── Case 2: User with `email` exists (registered via password)?
              │     └── YES ──▶ Link `google_id` to existing user, mark verified, Issue JWTs.
              │
              └── Case 3: Brand New User
                    ├── Create `users` record:
                    │   - first_name, last_name, email from Google
                    │   - profile_image_url = picture
                    │   - role = STUDENT
                    │   - auth_provider = GOOGLE
                    │   - is_verified = True
                    │   - is_profile_completed = False  (Prompt for mobile/year on first login)
                    │   - password_hash = None
                    └── Issue JWT Tokens & Return 200 OK.
```

---

### 3.3 Flow C: Email + Password Login

```
[ POST /api/v1/auth/login ] with { email, password }
              │
              ▼
1. Normalize email & query `users` table.
2. If user NOT found OR `user.password_hash` is None (Google-only user):
   └── Return 401 Unauthorized ("Invalid email or password").
3. Verify password via `bcrypt.checkpw(password, user.password_hash)`.
   └── Invalid? ──▶ Return 401 Unauthorized ("Invalid email or password").
4. If `user.is_active` is False:
   └── Return 403 Forbidden ("Account is deactivated").
5. Issue fresh Access Token (30 mins) + Refresh Token (7 days).
6. Return 200 OK with User details & tokens.
```

---

## 4. Jira SCRUM Ticket Breakdown for Auth & Models

| Ticket ID | Epic | Task Description |
| :--- | :--- | :--- |
| **`SCRUM-10`** | Backend Foundation | Implement Core Database Models (`User`, `Skill`, `Assessment`, `AssessmentResult`, `EmailOTP`). |
| **`SCRUM-11`** | Auth & Onboarding | Email + Password Authentication API (`/send-otp`, `/register`, `/login`, `/me`). |
| **`SCRUM-12`** | Auth & Onboarding | Google OAuth 2.0 Integration Endpoint (`/auth/google`). |
| **`SCRUM-13`** | Student Profile | Profile Management API (`GET/PATCH /api/v1/users/me`). |
| **`SCRUM-14`** | Student Assessment | Assessment Submission & Storage API (`/assessment/start`, `/assessment/{id}/submit`). |
| **`SCRUM-15`** | Readiness Dashboard | Scoring Service & Placement Readiness Dashboard API (`/dashboard`). |
