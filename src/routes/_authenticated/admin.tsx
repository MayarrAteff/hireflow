import { createFileRoute, Outlet } from '@tanstack/react-router';

import { requireRole } from '@/utils/authCheck';

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: requireRole('admin'),
  component: Outlet,
});
