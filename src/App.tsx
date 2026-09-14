import { RouterProvider } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';

import { LoadingPage } from '@/components/shared/LoadingPage';
import { router } from '@/router';
import { setPortalTheme } from '@/store/features/appConfigSlice';
import { useAppDispatch } from '@/store/hooks';
import type { SnackbarEvent } from '@/types/general.types';
import { eventEmitter } from '@/utils/eventEmitter';
import { useAuth } from '@/utils/hooks/useAuth';

export function App() {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  // Snackbars requested from outside React (e.g. the axios interceptor).
  useEffect(() => {
    const showSnackbar = ({ message, variant }: SnackbarEvent) => enqueueSnackbar(message, { variant });
    eventEmitter.on('snackbar', showSnackbar);
    return () => eventEmitter.off('snackbar', showSnackbar);
  }, []);

  // Portal colours follow the signed-in role; visitors see the recruiter brand.
  useEffect(() => {
    dispatch(setPortalTheme(auth.role ?? 'recruiter'));
  }, [auth.role]);

  // Re-run route guards when the user signs in/out so they get redirected.
  useEffect(() => {
    if (auth.isReady) router.invalidate();
  }, [auth.isReady, auth.isAuthenticated, auth.role]);

  if (!auth.isReady) {
    return <LoadingPage fullScreen />;
  }

  return <RouterProvider router={router} context={{ auth }} />;
}
