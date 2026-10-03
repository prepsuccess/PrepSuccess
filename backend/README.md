# PrepSuccess — Backend

Node.js + Express 5 + TypeScript API, PostgreSQL (Supabase) via Prisma 7.

## Run locally

```bash
cd backend
npm install
cp .env.example .env     # fill in DATABASE_URL / DIRECT_URL (Supabase or local Postgres)
npm run db:generate      # generate the Prisma client into src/generated/
npm run db:deploy        # apply migrations
npm run db:seed          # skills, learning resources and practical tasks (safe to re-run)
npm run dev              # http://localhost:8000
```

Check it's up: `GET /health/live` (process) and `GET /health/ready` (database reachable).

**API docs:** http://localhost:8000/docs (Swagger UI — try requests in the browser; use **Authorize** with an
`access_token` from `/api/v1/auth/login`). Raw spec: `/docs/openapi.json`. On by default outside production;
set `API_DOCS_ENABLED=true|false` to override.

## Scripts

| Script                                  | What it does                                             |
| --------------------------------------- | -------------------------------------------------------- |
| `npm run dev`                           | Start with hot reload (tsx)                              |
| `npm run build` / `npm start`           | Compile to `dist/` and run it                            |
| `npm test`                              | Vitest + supertest                                       |
| `npm run lint` / `typecheck` / `format` | ESLint, `tsc --noEmit`, Prettier                         |
| `npm run db:migrate`                    | Create + apply a migration from `prisma/schema.prisma`   |
| `npm run db:deploy`                     | Apply pending migrations (staging/prod)                  |
| `npm run db:studio`                     | Browse the database                                      |
| `npm run db:seed`                       | Upsert the skill, resource and task catalogues           |
| `npm run admin:promote -- <email>`      | Make an existing account an admin (first admin)          |
| `npm run sentry:test`                   | Send a test error to Sentry (needs `SENTRY_DSN`)         |
| `npm run openapi:export`                | Write `openapi.json` (the frontend's types come from it) |

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
│   ├── docs/                # OpenAPI document + Swagger UI route; helpers.ts for module docs
│   ├── lib/                 # logger (pino), response envelope + AppError, crypto, Sentry (monitoring.ts)
│   ├── middleware/          # request ID, auth guard, rate limits, 404 + error handler
│   ├── routes/v1.ts         # mounts every module under /api/v1
│   ├── modules/             # one folder per feature
│   │   ├── health/          # /health/live, /health/ready
│   │   ├── auth/            # signup + OTP, login, refresh, password reset, Google OAuth (SCRUM-11/12)
│   │   ├── users/           # /users/me profile (SCRUM-13)
│   │   ├── ai/              # /ai routes: AI status, and mounts onboarding, assessment, insight
│   │   ├── onboarding/      # AI onboarding conversation
│   │   ├── skills/          # skill catalogue (catalogue.ts) + "my skills"
│   │   ├── assessment/      # AI adaptive skill checks (SCRUM-14)
│   │   ├── resources/       # learning resources per skill (catalogue.ts) (SCRUM-126)
│   │   ├── tasks/           # practical tasks (catalogue.ts) + AI-reviewed submissions (SCRUM-125)
│   │   ├── dashboard/       # readiness scoring, next steps, AI coach's take (SCRUM-15)
│   │   ├── notifications/   # in-app notifications (SCRUM-48)
│   │   └── admin/           # users, aggregate analytics, content management (PRD-04)
│   ├── services/            # cross-module logic, no HTTP
│   │   ├── ai-agent/        # provider-agnostic AI layer (Gemini first) — see "AI calls"
│   │   ├── notifications/   # notify(): never blocks the action that triggered it
│   │   └── email/           # Gmail SMTP (OTP emails)
│   └── types/               # Express type augmentations
├── scripts/                 # export-openapi, promote-admin, sentry-test
└── tests/                   # Vitest + supertest (Prisma mocked in memory)
```

### Module convention

Each module keeps its HTTP layer thin and its logic testable:

```
modules/<feature>/
├── <feature>.routes.ts      # Express Router — wires paths to controller functions
├── <feature>.controller.ts  # parse/validate input (zod), call service, sendSuccess()
├── <feature>.service.ts     # business logic + Prisma calls; throws AppError
├── <feature>.logic.ts       # pure rules (scoring, prompts) — unit-tested without a database
├── <feature>.schemas.ts     # zod request/response schemas (+ .meta() examples)
└── <feature>.docs.ts        # OpenAPI paths built from those schemas
```

Then mount the router in `src/routes/v1.ts`, add its paths in `src/docs/openapi.ts`, and add it to
`MOUNTED` in `tests/docs.test.ts`. **Every endpoint ships with docs** — that test fails CI for any
mounted route missing from the OpenAPI document.

## AI calls

All AI goes through `src/services/ai-agent/ai.service.ts` — never call a provider SDK directly:

- `generateText({ userId, feature, system, messages })` for chat replies.
- `generateJson(request, zodSchema)` for structured output: the schema is sent to the model and the
  reply is validated against it (another try if it doesn't match).

Every call checks the user's trial + daily limit, tries `GEMINI_MODEL` twice and then
`GEMINI_FALLBACK_MODEL`, and records each attempt in `ai_usage` (tokens, latency, errors). Tests run
with `AI_PROVIDER=fake` (`providers/fake.provider.ts`) and never call Gemini. **Grounding rule:** put
the student's real data in the prompt and never ask the model to invent skills or scores.

## Conventions

- Every response uses the envelope in `src/lib/http.ts` (`success`, `data` / `error`,
  `request_id`, `timestamp`) — see `docs/PRODUCTION_STANDARDS.md`.
- Throw `AppError(status, CODE, message)` for expected failures; anything else becomes a
  logged 500. Express 5 forwards errors from async handlers automatically.
- Use `req.log` / `logger`, never `console.log`.
- The frontend never talks to Supabase directly — only this API does. Never expose
  database URLs or keys to `frontend/`.

## Content catalogues

Skills, learning resources and practical tasks start life as code —
`modules/skills/catalogue.ts`, `modules/resources/catalogue.ts` and
`modules/tasks/catalogue.ts` — and `npm run db:seed` upserts them. A test checks
every skill has at least one resource and one task, every link is https, and every
rubric totals 10 points. Admins can then edit, hide or add content from the admin
panel; the seed never deletes or un-hides anything an admin changed.

## Practical task scoring

The AI only scores each rubric criterion and writes feedback
(`tasks.logic.ts → buildReviewPrompt`). The server clamps each score to the
criterion's points and computes the percentage and pass/fail (60%), so a
submission that asks for full marks can't get more than the rubric allows.
