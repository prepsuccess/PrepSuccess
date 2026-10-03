# PrepSuccess

Placement-readiness platform for college students: **"Where do I stand, and where can I go?"**

Monorepo containing the Next.js frontend, the Node.js (Express) backend, and all product docs.

## Repository layout

```
PrepSuccess/
├── frontend/    # Next.js (App Router, TypeScript) web app
├── backend/     # Node.js + Express + TypeScript API (Prisma, PostgreSQL)
├── docs/        # Product, architecture and operations docs
│   └── prds/    # One PRD per phase / feature area
├── .github/     # PR template, CI, uptime check
├── .githooks/   # pre-commit (Prettier + ESLint on staged files)
└── render.yaml  # Render blueprint for the backend (staging + production)
```

## Docs

| Read | For |
|------|-----|
| [`docs/project-overview.md`](docs/project-overview.md) | Roadmap and phases |
| [`docs/PROJECT_CONTEXT.md`](docs/PROJECT_CONTEXT.md) | Why this exists, decisions so far |
| [`docs/prds/`](docs/prds/) | What each phase builds |
| [`docs/SYSTEM_ARCHITECTURE_FLOW.md`](docs/SYSTEM_ARCHITECTURE_FLOW.md) | Auth flows in detail |
| [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) | Entity-relationship diagram and data decisions |
| [`docs/PRODUCTION_STANDARDS.md`](docs/PRODUCTION_STANDARDS.md) | Engineering rules |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Environments, deploys, monitoring, operations |
| [`docs/SECURITY_REVIEW.md`](docs/SECURITY_REVIEW.md) | Pre-launch security review |

## Tech stack

| Layer    | Choice                                                    |
|----------|-----------------------------------------------------------|
| Frontend | Next.js 16 + TypeScript, Tailwind, shadcn/ui, RTK Query   |
| Backend  | Node.js 22 + Express 5 + TypeScript                       |
| Database | PostgreSQL on Supabase (Prisma ORM)                       |
| AI       | Gemini (free tier) behind a provider-agnostic layer       |
| Auth     | Email + password with OTP, Google OAuth                   |
| Hosting  | Vercel (frontend), Render (backend), Supabase (database)  |

## Getting started

Clone the repo and set up both applications. Config is read from local env files —
copy `.env.example` to `.env.local` in `frontend/` and to `.env` in `backend/`, then
fill in values (never commit a real `.env`).

### Backend (Node.js)

```bash
cd backend
npm install                   # also installs the pre-commit hook
cp .env.example .env          # then add your Supabase connection strings
npm run db:generate
npm run db:deploy             # apply migrations
npm run db:seed               # skills, learning resources, practical tasks
npm run dev                   # http://localhost:8000 (API docs at /docs)
```

To use the admin panel, sign up and then run `npm run admin:promote -- you@example.com`.

### Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.example .env.local    # then edit values
npm run dev                   # http://localhost:3000
```

See [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md)
for structure, scripts and conventions.

## Contributing

- Work is tracked in Jira: project **SCRUM** (`preparationssuccess.atlassian.net`).
- `main` is protected — no direct pushes. Open a branch, raise a PR, and get
  at least one review. CI must pass (format, lint, types, tests, build, migrations, e2e).
- Branch naming: `Prep-<ticket-no>-<short-description>` (e.g. `Prep-8-node-scaffold`).
- Fill in the PR template; link the Jira ticket in the PR title or body.
- Releasing: merge `main` into `production` through a reviewed PR (see `docs/DEPLOYMENT.md`).
