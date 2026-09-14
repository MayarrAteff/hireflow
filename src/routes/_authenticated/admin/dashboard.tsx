import { createFileRoute } from '@tanstack/react-router';

import { withPermission } from '@/components/shared/withPermission';
import { AdminDashboard } from '@/containers/admin/AdminDashboard';
import { Permission } from '@/enum/permissions';

export const Route = createFileRoute('/_authenticated/admin/dashboard')({
  component: withPermission(AdminDashboard, Permission.ViewPlatformAnalytics),
});
