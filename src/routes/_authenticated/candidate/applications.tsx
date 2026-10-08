import { createFileRoute } from '@tanstack/react-router';

import { withPermission } from '@/components/shared/withPermission';
import { MyApplications } from '@/containers/candidate/applications/MyApplications';
import { Permission } from '@/enum/permissions';

export const Route = createFileRoute('/_authenticated/candidate/applications')({
  component: withPermission(MyApplications, Permission.ApplyToJobs),
});
