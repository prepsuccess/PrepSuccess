# PrepSuccess

Placement-readiness platform for college students: **"Where do I stand, and where can I go?"**

Monorepo containing the Next.js frontend, the Node.js (Express) backend, and all product docs.

## Repository layout

```
PrepSuccess/
├── frontend/   # Next.js (App Router, TypeScript) web app
├── backend/    # Node.js + Express + TypeScript API (Prisma, PostgreSQL)
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
| Backend  | Node.js 22 + Express 5 + TypeScript     |
| Database | PostgreSQL on Supabase (Prisma ORM)     |
| Auth     | Email + password, Google OAuth          |

## Getting started

Clone the repo and set up both applications. Config is read from local env files —
copy `.env.example` to `.env.local` in `frontend/` and to `.env` in `backend/`, then
fill in values (never commit a real `.env`).

### Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.example .env.local    # then edit values
npm run dev                   # http://localhost:3000
```

### Backend (Node.js)

```bash
cd backend
npm install
cp .env.example .env          # then add your Supabase connection strings
npm run db:generate
npm run dev                   # http://localhost:8000
```

See [`backend/README.md`](backend/README.md) for the folder structure and conventions.

## Contributing

- Work is tracked in Jira: project **SCRUM** (`preparationssuccess.atlassian.net`).
- `main` is protected — no direct pushes. Open a branch, raise a PR, and get
  at least one review.
- Branch naming: `Prep-<ticket-no>-<short-description>` (e.g. `Prep-8-node-scaffold`).
- Fill in the PR template; link the Jira ticket in the PR title or body.
