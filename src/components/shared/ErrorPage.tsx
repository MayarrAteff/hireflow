import Button from '@mui/material/Button';
import { type ErrorComponentProps, useRouter } from '@tanstack/react-router';
import { useIntl } from 'react-intl';

import { StatusPage } from './StatusPage';

/** Route-level error boundary (`errorComponent`). */
export function ErrorPage({ reset }: ErrorComponentProps) {
  const router = useRouter();
  const { $t } = useIntl();

  const retry = () => {
    reset();
    router.invalidate();
  };

  return (
    <StatusPage
      titleId="error.generic.title"
      bodyId="error.generic.body"
      action={
        <Button variant="outlined" onClick={retry}>
          {$t({ id: 'error.retry' })}
        </Button>
      }
    />
  );
}
