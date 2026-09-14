import { SnackbarProvider as NotistackSnackbarProvider } from 'notistack';

import { SNACKBAR_MAX } from '@/constants/app';
import type { ChildProp } from '@/types/general.types';

export function SnackbarProvider({ children }: Readonly<ChildProp>) {
  return (
    <NotistackSnackbarProvider maxSnack={SNACKBAR_MAX} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      {children}
    </NotistackSnackbarProvider>
  );
}
