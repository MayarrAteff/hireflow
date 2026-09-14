import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useIntl } from 'react-intl';

type StatusPageProps = {
  code?: string;
  titleId: string;
  bodyId: string;
  action?: ReactNode;
};

export function StatusPage({ code, titleId, bodyId, action }: StatusPageProps) {
  const { $t } = useIntl();

  return (
    <Box className="tw-flex tw-min-h-[70vh] tw-flex-col tw-items-center tw-justify-center tw-gap-3 tw-p-6 tw-text-center">
      {code && (
        <Typography variant="h1" color="primary" className="tw-text-7xl tw-font-bold">
          {code}
        </Typography>
      )}
      <Typography variant="h3">{$t({ id: titleId })}</Typography>
      <Typography color="text.secondary" className="tw-max-w-md">
        {$t({ id: bodyId })}
      </Typography>
      <Box className="tw-mt-4 tw-flex tw-gap-2">
        {action}
        <Button variant="contained" component={Link} to="/">
          {$t({ id: 'error.goHome' })}
        </Button>
      </Box>
    </Box>
  );
}

export function Forbidden() {
  return <StatusPage code="403" titleId="error.forbidden.title" bodyId="error.forbidden.body" />;
}

export function NotFound() {
  return <StatusPage code="404" titleId="error.notFound.title" bodyId="error.notFound.body" />;
}
