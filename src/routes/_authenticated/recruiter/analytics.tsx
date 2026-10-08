import { createFileRoute } from '@tanstack/react-router';

import { withPermission } from '@/components/shared/withPermission';
import { HiringAnalytics } from '@/containers/recruiter/analytics/HiringAnalytics';
import { Permission } from '@/enum/permissions';

export const Route = createFileRoute('/_authenticated/recruiter/analytics')({
  component: withPermission(HiringAnalytics, Permission.ViewCompanyAnalytics),
});
