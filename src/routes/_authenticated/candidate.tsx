import { createFileRoute, Outlet } from '@tanstack/react-router';

import { requireRole } from '@/utils/authCheck';

export const Route = createFileRoute('/_authenticated/candidate')({
  beforeLoad: requireRole('candidate'),
  component: Outlet,
});
