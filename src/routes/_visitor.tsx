import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { homePathFor, isAuthenticated, safeRedirectPath } from '@/utils/authCheck';

/** Pages for signed-out users only (login, register). */
export const Route = createFileRoute('/_visitor')({
  beforeLoad: ({ context, location }) => {
    if (isAuthenticated(context.auth)) {
      const requested = safeRedirectPath((location.search as { redirect?: unknown }).redirect);
      throw redirect({ href: requested ?? homePathFor(context.auth) });
    }
  },
  component: Outlet,
});
