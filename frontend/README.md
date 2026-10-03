# PrepSuccess frontend

Next.js 16 (App Router) + Tailwind CSS v4. The marketing site, auth, the student app and the admin panel all live here and share one design system.

## Getting started

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE_URL → the Node.js backend (http://localhost:8000)
npm install
npm run dev                  # http://localhost:3000
```

| Script              | What it does                                                         |
| ------------------- | -------------------------------------------------------------------- |
| `npm run dev`       | Dev server                                                           |
| `npm run build`     | Production build                                                     |
| `npm run lint`      | ESLint                                                               |
| `npm run typecheck` | `tsc --noEmit`                                                       |
| `npm run test`      | Vitest + Testing Library (API mocked with MSW)                       |
| `npm run e2e`       | Playwright journeys against the production build (run `build` first) |
| `npm run api:types` | Regenerate `lib/api/schema.d.ts` from `../backend/openapi.json`      |
| `npm run format`    | Prettier (with Tailwind class sorting)                               |

CI (`.github/workflows/frontend-ci.yml`) runs the API-types drift check, format check, lint, typecheck, tests, build and the Playwright journeys on every PR.

## Structure

```
app/
  (marketing)/      Public site: home, how-it-works, skill-tracks, mentors, trust, roadmap,
                    pricing, about, story, terms, privacy.
  (auth)/           /login, /signup, /forgot-password, /auth/callback (Google).
  (app)/            Student area: /dashboard, /onboarding, /assessment, /learn, /learn/[slug],
                    /tasks/[id], /profile. Guarded (student, mentor).
  admin/            Admin panel: /admin, /admin/users, /admin/content, /admin/analytics,
                    /admin/mentors (Phase 3). Guarded (admin).
  global-error.tsx  Last-resort error page (reports to Sentry).

components/
  ui/               Marketing/auth primitives (Button, form controls, Annotation pencil marks…)
  shadcn/           shadcn/ui (Radix) primitives used by the logged-in app and admin
  shell/            AppShell (sidebar + top bar), NotificationBell, PageHeader, RequireAuth, nav
  auth/             AuthCard, LoginForm, SignupForm, ForgotPasswordForm, Google sign-in
  app/              Student area: dashboard/, skill-checks/, learning/ (resources, tasks), onboarding
  admin/            Users table, analytics, content manager
  marketing/        Navbar, Footer, LegalPage, sections/, previews/
  motion/           GSAP-driven animation wrappers

lib/
  api/              baseApi.ts (RTK Query: bearer token, envelope unwrapping, silent refresh),
                    endpoints/*.ts (one file per backend area), types.ts (from schema.d.ts)
  auth/             session (token storage, redirects), authSlice, useSession
  content/          Marketing and legal copy — edit words here, not in components
  analytics.ts      Product analytics (PostHog, off unless configured)
  hooks/, utils/, theme/, store/

e2e/                Playwright journeys + the mock API they run against
instrumentation*.ts Sentry (off unless NEXT_PUBLIC_SENTRY_DSN is set)
```

## Conventions

- **API calls** go through RTK Query endpoints in `lib/api/endpoints/`. Types come from the backend's OpenAPI spec — never hand-write a response shape; run `npm run api:types` after the backend changes.
- **Colours and type come from tokens** in `app/globals.css`. Don't hard-code hex values.
- **Forms**: compose `components/ui/form` (marketing/auth) or shadcn controls (app/admin); every control has a label, and errors are wired with `aria-describedby`.
- **App/admin pages** start with `PageHeader`; data regions render through `QueryState` (skeleton → error with retry → empty → data).
- **Text from users or the AI** is rendered with `RichText` / `Prose` — never as HTML.
- **Analytics**: call `track()` from the handler of a successful action, never during render, so each event fires once.
- **Auth**: tokens live in `localStorage`. `RequireAuth` is a UX guard only — every role check is enforced by the API.
