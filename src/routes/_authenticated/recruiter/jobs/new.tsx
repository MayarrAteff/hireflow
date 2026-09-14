import { createFileRoute } from '@tanstack/react-router';

import { withPermission } from '@/components/shared/withPermission';
import { JobForm } from '@/containers/recruiter/jobs/JobForm';
import { Permission } from '@/enum/permissions';

export const Route = createFileRoute('/_authenticated/recruiter/jobs/new')({
  component: withPermission(JobForm, Permission.ManageJobs),
});
