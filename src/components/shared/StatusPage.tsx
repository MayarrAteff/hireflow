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
    <Box className="flex min-h-[70vh] flex-col items-center justify-center gap-3 p-6 text-center">
      {code && (
        <Typography variant="h1" color="primary" className="text-7xl font-bold">
          {code}
        </Typography>
      )}
      <Typography variant="h3">{$t({ id: titleId })}</Typography>
      <Typography color="text.secondary" className="max-w-md">
        {$t({ id: bodyId })}
      </Typography>
      <Box className="mt-4 flex gap-2">
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
