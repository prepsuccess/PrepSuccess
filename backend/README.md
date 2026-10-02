# PrepSuccess — Backend

Node.js + Express 5 + TypeScript API, PostgreSQL (Supabase) via Prisma 7.

## Run locally

```bash
cd backend
npm install
cp .env.example .env     # fill in DATABASE_URL / DIRECT_URL (Supabase or local Postgres)
npm run db:generate      # generate the Prisma client into src/generated/
npm run dev              # http://localhost:8000
```

Check it's up: `GET /health/live` (process) and `GET /health/ready` (database reachable).

## Scripts

| Script                                  | What it does                                           |
| --------------------------------------- | ------------------------------------------------------ |
| `npm run dev`                           | Start with hot reload (tsx)                            |
| `npm run build` / `npm start`           | Compile to `dist/` and run it                          |
| `npm test`                              | Vitest + supertest                                     |
| `npm run lint` / `typecheck` / `format` | ESLint, `tsc --noEmit`, Prettier                       |
| `npm run db:migrate`                    | Create + apply a migration from `prisma/schema.prisma` |
| `npm run db:deploy`                     | Apply pending migrations (staging/prod)                |
| `npm run db:studio`                     | Browse the database                                    |

## Folder structure

```
backend/
├── prisma/
│   ├── schema.prisma        # models (added per ticket) — migrations land in prisma/migrations/
├── prisma.config.ts         # Prisma CLI config; migrations use DIRECT_URL
├── src/
│   ├── server.ts            # boots the HTTP server + graceful shutdown
│   ├── app.ts               # Express app: middleware, routes, error handling
│   ├── config/env.ts        # zod-validated environment (app won't boot with bad config)
│   ├── db/prisma.ts         # single PrismaClient (pooled DATABASE_URL)
│   ├── generated/prisma/    # generated Prisma client (git-ignored)
│   ├── lib/                 # logger (pino), response envelope + AppError
│   ├── middleware/          # request ID, 404 + error handler (auth guard goes here)
│   ├── routes/v1.ts         # mounts every module under /api/v1
│   ├── modules/             # one folder per feature
│   │   ├── health/          # /health/live, /health/ready
│   │   ├── auth/            # signup, OTP, login, Google OAuth (SCRUM-11/12)
│   │   ├── users/           # /users/me profile (SCRUM-13)
│   │   ├── onboarding/      # AI onboarding conversation
│   │   ├── assessment/      # AI adaptive assessment (SCRUM-14)
│   │   ├── tasks/           # practical tasks + submissions
│   │   ├── resources/       # learning resources
│   │   ├── dashboard/       # readiness dashboard (SCRUM-15)
│   │   └── admin/           # admin users/content/analytics
│   ├── services/            # cross-module logic, no HTTP
│   │   ├── ai-agent/        # provider-agnostic AI layer (Gemini first)
│   │   ├── scoring/         # mastery threshold + readiness scoring
│   │   └── email/           # Gmail SMTP (OTP emails)
│   └── types/               # Express type augmentations
└── tests/                   # Vitest + supertest
```

### Module convention

Each module keeps its HTTP layer thin and its logic testable:

```
modules/<feature>/
├── <feature>.routes.ts      # Express Router — wires paths to controller functions
├── <feature>.controller.ts  # parse/validate input (zod), call service, sendSuccess()
├── <feature>.service.ts     # business logic + Prisma calls; throws AppError
└── <feature>.schemas.ts     # zod request/response schemas
```

Then mount the router in `src/routes/v1.ts`.

## Conventions

- Every response uses the envelope in `src/lib/http.ts` (`success`, `data` / `error`,
  `request_id`, `timestamp`) — see `docs/PRODUCTION_STANDARDS.md`.
- Throw `AppError(status, CODE, message)` for expected failures; anything else becomes a
  logged 500. Express 5 forwards errors from async handlers automatically.
- Use `req.log` / `logger`, never `console.log`.
- The frontend never talks to Supabase directly — only this API does. Never expose
  database URLs or keys to `frontend/`.
