# HireFlow

Personal portfolio project: a hiring platform with recruiter, candidate and admin portals.

## Git identity (important)

This is a **personal** project. Commits and pushes must use `Mayar Atef <mayar.ateffff@gmail.com>` only, never a work email.
The repo-local git config sets this. Remote uses the `github-personal` SSH host alias (`~/.ssh/id_ed25519_personal`).

## Commands

- `npm run dev` (port 3004), `npm run build`, `npm run lint`, `npm run typecheck`, `npm run format`
- No test framework on purpose.
- Commit messages follow Conventional Commits (commitlint + husky pre-commit runs typecheck and lint-staged).

## Architecture

- Data flow: route file → container → React Query hook → service (`src/services/*.service.ts`) → request (`src/network/requests/*`) → `axiosInstance` (`src/network/interceptor.ts`) → Supabase REST (`/rest/v1`, PostgREST).
- Supabase JS client (`src/network/supabase.ts`) is used directly only for auth, storage and realtime.
- PostgREST single-row reads use the `SINGLE_OBJECT_HEADERS` Accept header.
- Auth: `src/utils/context/AuthProvider.tsx` (session + profile via React Query). Router context gets `auth`; guards in `src/utils/authCheck.ts` (`requireRole`, `_authenticated`, `_visitor`).
- Permissions: role → permissions map in `src/constants/permissions.ts`; `PermissionGuard` / `withPermission`.
- Redux holds UI state only (`appConfig`: locale/dir/themeMode/portalTheme/sidebar, `loading`, `featureFlags`, `jobFormSteps`).
- Database schema, RLS and storage live in `supabase/migrations/`. Add a new timestamped migration file for schema changes.

## Conventions

- Named exports only (`import/no-default-export`), function declarations for components.
- `@/` alias for imports; imports sorted by `simple-import-sort`.
- MUI path imports only (`import Button from '@mui/material/Button'`), never the barrel.
- Tailwind classes use the `tw-` prefix; portal colours via `tw-bg-primary` etc.
- All user-facing text through react-intl; add keys to both `src/i18n/en.json` and `ar.json`. Yup messages are i18n ids.
- Use logical CSS (`tw-ms-*`, `tw-text-start`, `paddingInline`) so RTL works.
