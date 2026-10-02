# PrepSuccess

Placement-readiness platform for college students: **"Where do I stand, and where can I go?"**

Monorepo containing the Next.js frontend, the FastAPI backend, and all product docs.

## Repository layout

```
PrepSuccess/
├── frontend/   # Next.js (App Router, TypeScript) web app
├── backend/    # Backend placeholder (service pending scaffold)
├── docs/       # Product docs — PRDs, project overview, context
│   └── prds/   # One PRD per phase / feature area
└── .github/    # PR template, CI workflows
```

All PRDs and planning documents live in `docs/`. Start with
[`docs/project-overview.md`](docs/project-overview.md), then the phase PRDs in
[`docs/prds/`](docs/prds/).

## Tech stack

| Layer    | Choice                                  |
|----------|-----------------------------------------|
| Frontend | Next.js + TypeScript                    |
| Backend  | FastAPI (Python 3.11+) *(Pending)*       |
| Database | PostgreSQL (SQLAlchemy + Alembic)       |
| Auth     | Email + password, Google OAuth          |

## Getting started

Clone the repo and set up the active application. Config is read from a
local `.env` file — copy `.env.example` to `.env.local` in `frontend/` and fill in values
(never commit a real `.env`).

### Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.example .env.local    # then edit values
npm run dev                   # http://localhost:3000
```

### Backend (FastAPI)

> The `backend/` directory is currently a placeholder pending re-scaffold.

## Contributing

- Work is tracked in Jira: project **SCRUM** (`preparationssuccess.atlassian.net`).
- `main` is protected — no direct pushes. Open a branch, raise a PR, and get
  at least one review.
- Branch naming: `Prep-<ticket-no>-<short-description>` (e.g. `Prep-8-fastapi-scaffold`).
- Fill in the PR template; link the Jira ticket in the PR title or body.
