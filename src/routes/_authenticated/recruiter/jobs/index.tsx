import { createFileRoute } from '@tanstack/react-router';

import { withPermission } from '@/components/shared/withPermission';
import { JobsList } from '@/containers/recruiter/jobs/JobsList';
import { Permission } from '@/enum/permissions';

export const Route = createFileRoute('/_authenticated/recruiter/jobs/')({
  component: withPermission(JobsList, Permission.ManageJobs),
});
