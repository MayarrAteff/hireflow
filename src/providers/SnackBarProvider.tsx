import { SnackbarProvider as NotistackSnackbarProvider } from 'notistack';

import { AppSnackbar } from '@/components/UI/AppSnackbar';
import { SNACKBAR_MAX } from '@/constants/app';
import { useAppSelector } from '@/store/hooks';
import type { ChildProp } from '@/types/general.types';

const components = {
  default: AppSnackbar,
  success: AppSnackbar,
  error: AppSnackbar,
  warning: AppSnackbar,
  info: AppSnackbar,
};

export function SnackbarProvider({ children }: Readonly<ChildProp>) {
  const dir = useAppSelector((state) => state.appConfig.dir);

  return (
    <NotistackSnackbarProvider
      maxSnack={SNACKBAR_MAX}
      Components={components}
      autoHideDuration={5000}
      // Toasts sit in the top corner on the reading-end side, so it flips for Arabic.
      anchorOrigin={{ vertical: 'top', horizontal: dir === 'rtl' ? 'left' : 'right' }}
    >
      {children}
    </NotistackSnackbarProvider>
  );
}
