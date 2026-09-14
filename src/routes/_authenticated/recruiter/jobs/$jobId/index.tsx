import { createFileRoute } from '@tanstack/react-router';

import { withPermission } from '@/components/shared/withPermission';
import {
  JOB_DETAIL_TABS,
  type JobDetailTab,
  RecruiterJobDetails,
} from '@/containers/recruiter/jobs/details/RecruiterJobDetails';
import { Permission } from '@/enum/permissions';

/** `applicant` opens that applicant's drawer on load, e.g. from the dashboard's new applicants. */
type JobDetailsSearch = { tab?: JobDetailTab; applicant?: string };

function JobDetailsRoute() {
  const { jobId } = Route.useParams();
  const { tab = 'overview', applicant } = Route.useSearch();
  return <RecruiterJobDetails key={jobId} jobId={jobId} tab={tab} initialApplicantId={applicant} />;
}

export const Route = createFileRoute('/_authenticated/recruiter/jobs/$jobId/')({
  validateSearch: (search: Record<string, unknown>): JobDetailsSearch => ({
    tab: JOB_DETAIL_TABS.includes(search.tab as JobDetailTab) ? (search.tab as JobDetailTab) : undefined,
    applicant: typeof search.applicant === 'string' ? search.applicant : undefined,
  }),
  component: withPermission(JobDetailsRoute, Permission.ManageJobs),
});
