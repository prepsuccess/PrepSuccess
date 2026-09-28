# PrepSuccess frontend

Next.js 16 (App Router) + Tailwind CSS v4. The marketing site, auth, the student app and the admin panel all live here and share one design system.

## Getting started

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE_URL → the FastAPI backend
npm install
npm run dev                  # http://localhost:3000
```

| Script              | What it does                           |
| ------------------- | -------------------------------------- |
| `npm run dev`       | Dev server                             |
| `npm run build`     | Production build                       |
| `npm run lint`      | ESLint                                 |
| `npm run typecheck` | `tsc --noEmit`                         |
| `npm run test`      | Vitest + Testing Library               |
| `npm run format`    | Prettier (with Tailwind class sorting) |

CI (`.github/workflows/frontend-ci.yml`) runs format check, lint, typecheck, test and build on every PR.

## Structure

```
app/
  (marketing)/      Public site: home, how-it-works, skill-tracks, mentors, trust,
                    roadmap, pricing, about, story. Layout adds Navbar, Footer, smooth scroll.
  (auth)/           /login, /signup — minimal layout with the logo and a paper card.
  (app)/            Student area: /dashboard, /assessment, /profile. Guarded (student, mentor).
  admin/            Admin panel: /admin, /admin/users, /mentors, /content, /analytics. Guarded (admin).
  layout.tsx        Root: fonts, global CSS, accent-colour boot script, pencil SVG filter.
  globals.css       Design tokens (colours, type scale, radii) and the few global classes.

components/
  ui/               Reusable primitives — use these before writing new markup.
    form/           Field, Input, PasswordInput, Textarea, Select, Checkbox
    Button, Alert, Spinner, EmptyState, StatCard, DataTable, Chip/MiniUI,
    Container, Section, Panel, SectionTitle, Logo, LineIcon, Annotation (pencil marks), …
  motion/           GSAP-driven animation wrappers (Reveal, SplitHeading, CountUp, …)
  shell/            AppShell (sidebar + top bar), PageHeader, RequireAuth, nav config
  auth/             AuthCard, LoginForm, SignupForm
  app/              Student-area components
  marketing/        Navbar, Footer, sections/ (page sections), previews/ (product mock-ups)

lib/
  api/              client.ts (fetch wrapper, bearer token, error parsing), auth.ts (endpoints + types)
  auth/             session.ts (token storage, redirects), useSession.ts (shared session store)
  content/          All marketing copy, one file per area — edit words here, not in components
  hooks/            useDismiss, useReducedMotion
  utils/            cn, validation
  gsap.ts, themes.ts
```

## Conventions

- **Colours and type come from tokens** in `app/globals.css` (`text-heading`, `bg-surface-3`, `text-h2`, `border-border-strong`, `text-danger`…). Don't hard-code hex values.
- **Forms**: compose `components/ui/form` controls; each wires up its label, hint and error (`aria-describedby`, `aria-invalid`) for you. `Button` renders a `<button>` without `href` and supports `loading`.
- **Admin/app pages** start with `PageHeader`, then `StatCard` / `DataTable` / `EmptyState`. Add new sidebar links in `components/shell/nav.ts`.
- **Auth**: the backend returns bearer tokens, stored in `localStorage` and sent by `lib/api/client.ts`. `RequireAuth` is a UX guard only — every role check must also be enforced by the API.
