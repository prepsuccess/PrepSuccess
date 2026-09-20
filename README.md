# PrepSuccess

Placement-readiness platform for college students: **"Where do I stand, and where can I go?"**

Monorepo containing the Next.js frontend, the FastAPI backend, and all product docs.

## Repository layout

```
PrepSuccess/
├── frontend/   # Next.js (App Router, TypeScript) web app
├── backend/    # FastAPI service + SQLAlchemy/Alembic (PostgreSQL)
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
| Backend  | FastAPI (Python 3.11+)                  |
| Database | PostgreSQL (SQLAlchemy + Alembic)       |
| Auth     | Email + password, Google OAuth          |

## Getting started

Clone the repo and set up each app separately. Both apps read config from a
local `.env` file — copy the `.env.example` in each folder and fill in values
(never commit a real `.env`).

### Backend (FastAPI)

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate   |   macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # then edit values
alembic upgrade head          # run DB migrations
uvicorn app.main:app --reload # http://localhost:8000  (docs at /docs)
```

### Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.example .env.local    # then edit values
npm run dev                   # http://localhost:3000
```

> The backend and frontend scaffolds are tracked in SCRUM-8 and SCRUM-16.
> Until those land, the folders are placeholders.

## Contributing

- Work is tracked in Jira: project **SCRUM** (`preparationssuccess.atlassian.net`).
- `main` is protected — no direct pushes. Open a branch, raise a PR, and get
  at least one review.
- Branch naming: `SCRUM-<id>-short-description` (e.g. `SCRUM-8-fastapi-scaffold`).
- Fill in the PR template; link the Jira ticket in the PR title or body.
