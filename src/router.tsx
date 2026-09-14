import { createRouter } from '@tanstack/react-router';

import { LoadingPage } from '@/components/shared/LoadingPage';
import { queryClient } from '@/network/queryClient';

import { routeTree } from './routeTree.gen';

export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // provided by <App /> from the AuthProvider
    queryClient,
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  defaultPendingComponent: LoadingPage,
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
