# HireFlow

A multi-portal hiring platform built with React, TypeScript and Supabase.

- **Recruiters** set up their company, post jobs with a multi-step form, review and compare applicants, move them across a drag-and-drop hiring board (live-updated), schedule interviews and send offers.
- **Candidates** build a profile, upload a CV, search and apply to jobs, track their applications and accept or decline offers.
- **Admins** have a portal with a placeholder dashboard; user, company and feature-flag management are on the roadmap.

Fully bilingual (English / Arabic with RTL) with light and dark mode.

## Tech stack

| Area         | Tools                                                                                |
| ------------ | ------------------------------------------------------------------------------------ |
| Core         | React 18, TypeScript, Vite                                                           |
| Routing      | TanStack Router (file-based, typed search params, auto code splitting, route guards) |
| Server state | TanStack Query                                                                       |
| UI state     | Redux Toolkit                                                                        |
| Backend      | Supabase (Postgres + row-level security, Auth, Storage, Realtime)                    |
| HTTP         | axios instance with interceptors over the Supabase REST API                          |
| UI           | MUI v6, Tailwind CSS (no prefix), tw-colors per-portal themes, framer-motion         |
| Forms        | react-hook-form + yup                                                                |
| i18n         | react-intl, stylis-plugin-rtl, tailwindcss-rtl                                       |
| Data display | @dnd-kit, MUI X Date Pickers                                                         |
| Quality      | ESLint, Prettier                                                                     |

## Getting started

1. Install dependencies (Node 22, see `.nvmrc`):
   ```bash
   npm install
   ```
2. Create a free project at [supabase.com](https://supabase.com), then open **SQL Editor** and run every file in
   [`supabase/migrations/`](supabase/migrations/) in filename order.
3. Create a `.env` file in the project root with your **Project URL** and **anon public key** from _Project Settings → API_:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Start the app at http://localhost:3004:
   ```bash
   npm run dev
   ```

> Tip: while developing, turn off _Authentication → Sign In / Providers → Email → Confirm email_ in Supabase so new accounts can sign in immediately.
>
> To make a user an admin, run in the SQL editor: `update profiles set role = 'admin' where email = 'you@example.com';`

## Scripts

| Script                      | What it does                                            |
| --------------------------- | ------------------------------------------------------- |
| `npm run dev`               | Start the dev server                                    |
| `npm run build`             | Generate routes, typecheck and build for production     |
| `npm run lint` / `lint:fix` | ESLint (zero warnings allowed); `lint:fix` also formats |
| `npm run typecheck`         | TypeScript without emitting                             |
| `npm run format`            | Prettier (`src/`)                                       |

## Project structure

```
src/
  routes/        file-based routes (_visitor = signed-out pages, _authenticated/<role> = portals)
  containers/    page-level feature components
  components/    shared, Form and UI components
  layout/        MainLayout (sidebar + header) and AuthLayout
  network/       supabase client, axios interceptor, raw requests
  services/      thin wrappers over requests (unwrap data, throw errors)
  hooks/         feature hooks built on React Query
  store/         Redux Toolkit slices (UI state only)
  providers/     MUI, Intl and Snackbar providers
  utils/         auth context, guards, event emitter, matching/scoring helpers
  validations/   yup schemas
  i18n/          en.json, ar.json
supabase/migrations/  database schema, RLS policies, storage and realtime
```

## Styling

Tailwind utilities are used without a prefix (`flex gap-2 bg-primary`) alongside MUI, with `important: 'body'` so they win over MUI styles.

- **Portal colours:** tw-colors generates a theme per role; the active one is set as `theme-<role>` (`theme-recruiter`, `theme-candidate`, `theme-admin`) on `<body>`, so `bg-primary`, `text-accent` etc. follow the signed-in portal.
- **RTL:** use logical utilities (`ms-*`, `pe-*`, `text-start`) so layouts flip correctly in Arabic.

## Auth and routing

- `_visitor` routes (login, register) redirect signed-in users away; `_authenticated` routes redirect signed-out users to `/login?redirect=<page>`.
- Each portal (`/recruiter`, `/candidate`, `/admin`) is guarded by `requireRole`; other roles get the 403 page.
- After sign-in the user returns to the `redirect` page only if it is a same-origin path their role can open. Otherwise they go to their own dashboard. This way, signing in with a different account never lands on another portal's 403 page.

## Roadmap

- [x] Project foundation, theming (portal colours, dark mode, RTL), auth with role-based portals
- [x] Candidate: profile + CV upload, job search, apply, application tracker, offers
- [x] Recruiter: company setup, multi-step job form, jobs table, applicant review and comparison, hiring board, interviews, offers
- [ ] Real-time notifications
- [ ] Dashboard analytics and charts
- [ ] Admin: users, companies, feature flags
- [ ] Onboarding tour and polish
