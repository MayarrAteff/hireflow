# HireFlow

A multi-portal hiring platform built with React, TypeScript and Supabase.

- **Recruiters** post jobs, move applicants across a drag-and-drop hiring board, schedule interviews and track hiring analytics.
- **Candidates** build a profile, upload a CV, apply to jobs and follow their application status in real time.
- **Admins** manage users, companies and feature flags, and see platform-wide stats.

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
| UI           | MUI v6, Tailwind CSS (`tw-` prefix), tw-colors per-portal themes, framer-motion      |
| Forms        | react-hook-form + yup                                                                |
| i18n         | react-intl, stylis-plugin-rtl, tailwindcss-rtl                                       |
| Data display | material-react-table, ApexCharts, @dnd-kit, MUI X Date Pickers                       |
| Quality      | ESLint, Prettier                                                                    |

## Getting started

1. Install dependencies (Node 22, see `.nvmrc`):
   ```bash
   npm install
   ```
2. Create a free project at [supabase.com](https://supabase.com), then open **SQL Editor** and run
   [`supabase/migrations/20260914000000_init.sql`](supabase/migrations/20260914000000_init.sql).
3. Copy the environment file and fill in **Project URL** and **anon public key** from _Project Settings → API_:
   ```bash
   cp .env.example .env
   ```
4. Start the app at http://localhost:3004:
   ```bash
   npm run dev
   ```

> Tip: while developing, turn off _Authentication → Sign In / Providers → Email → Confirm email_ in Supabase so new accounts can sign in immediately.
>
> To make a user an admin, run in the SQL editor: `update profiles set role = 'admin' where email = 'you@example.com';`

## Scripts

| Script                      | What it does                                        |
| --------------------------- | --------------------------------------------------- |
| `npm run dev`               | Start the dev server                                |
| `npm run build`             | Generate routes, typecheck and build for production |
| `npm run lint` / `lint:fix` | ESLint (zero warnings allowed)                      |
| `npm run typecheck`         | TypeScript without emitting                         |
| `npm run format`            | Prettier                                            |

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
  utils/         auth context, guards, event emitter, helpers
  validations/   yup schemas
  i18n/          en.json, ar.json
supabase/migrations/  database schema, RLS policies, storage and realtime
```

## Roadmap

- [x] Project foundation, theming (portal colours, dark mode, RTL), auth with role-based portals
- [ ] Candidate: profile + CV upload, job search, apply, my applications
- [ ] Recruiter: company setup, multi-step job form, jobs table, hiring board, interviews
- [ ] Real-time notifications
- [ ] Dashboards with charts
- [ ] Admin: users, companies, feature flags
- [ ] Onboarding tour and polish
