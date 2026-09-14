import { createFileRoute } from '@tanstack/react-router';

import { withPermission } from '@/components/shared/withPermission';
import { JobDetails } from '@/containers/candidate/jobs/JobDetails';
import { Permission } from '@/enum/permissions';

function JobDetailsRoute() {
  const { jobId } = Route.useParams();
  // Keyed by id so moving between jobs starts with fresh dialog and panel state.
  return <JobDetails key={jobId} jobId={jobId} />;
}

export const Route = createFileRoute('/_authenticated/candidate/jobs/$jobId')({
  component: withPermission(JobDetailsRoute, Permission.ApplyToJobs),
});
