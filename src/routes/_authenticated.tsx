import { createFileRoute, redirect } from '@tanstack/react-router';

import { MainLayout } from '@/layout/MainLayout';
import { isAuthenticated } from '@/utils/authCheck';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!isAuthenticated(context.auth)) {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }
  },
  component: MainLayout,
});
