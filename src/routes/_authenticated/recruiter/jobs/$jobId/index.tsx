import { createFileRoute } from '@tanstack/react-router';

import { withPermission } from '@/components/shared/withPermission';
import {
  JOB_DETAIL_TABS,
  type JobDetailTab,
  RecruiterJobDetails,
} from '@/containers/recruiter/jobs/details/RecruiterJobDetails';
import { Permission } from '@/enum/permissions';

type JobDetailsSearch = { tab?: JobDetailTab };

function JobDetailsRoute() {
  const { jobId } = Route.useParams();
  const { tab = 'overview' } = Route.useSearch();
  return <RecruiterJobDetails key={jobId} jobId={jobId} tab={tab} />;
}

export const Route = createFileRoute('/_authenticated/recruiter/jobs/$jobId/')({
  validateSearch: (search: Record<string, unknown>): JobDetailsSearch => ({
    tab: JOB_DETAIL_TABS.includes(search.tab as JobDetailTab) ? (search.tab as JobDetailTab) : undefined,
  }),
  component: withPermission(JobDetailsRoute, Permission.ManageJobs),
});
