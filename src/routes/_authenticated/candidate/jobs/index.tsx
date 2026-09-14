import { createFileRoute } from '@tanstack/react-router';

import { withPermission } from '@/components/shared/withPermission';
import { BrowseJobs } from '@/containers/candidate/jobs/BrowseJobs';
import { Permission } from '@/enum/permissions';

export const Route = createFileRoute('/_authenticated/candidate/jobs/')({
  component: withPermission(BrowseJobs, Permission.ApplyToJobs),
});
