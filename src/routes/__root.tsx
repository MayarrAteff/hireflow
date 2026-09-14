import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { ErrorPage } from '@/components/shared/ErrorPage';
import { LoadingPage } from '@/components/shared/LoadingPage';
import { NotFound } from '@/components/shared/StatusPage';
import type { RouterContext } from '@/types/router.types';

// Devtools are only bundled in development.
const Devtools = import.meta.env.DEV
  ? lazy(() =>
      Promise.all([import('@tanstack/react-router-devtools'), import('@tanstack/react-query-devtools')]).then(
        ([router, query]) => ({
          default: function DevtoolsPanel() {
            return (
              <>
                <router.TanStackRouterDevtools position="bottom-right" />
                <query.ReactQueryDevtools buttonPosition="bottom-left" />
              </>
            );
          },
        }),
      ),
    )
  : () => null;

function RootComponent() {
  return (
    <>
      <Outlet />
      <Suspense fallback={null}>
        <Devtools />
      </Suspense>
    </>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  pendingComponent: LoadingPage,
  errorComponent: ErrorPage,
  notFoundComponent: NotFound,
});
