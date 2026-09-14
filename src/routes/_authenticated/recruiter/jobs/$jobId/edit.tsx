import { createFileRoute } from '@tanstack/react-router';

import { withPermission } from '@/components/shared/withPermission';
import { EditJob } from '@/containers/recruiter/jobs/EditJob';
import { Permission } from '@/enum/permissions';

function EditJobRoute() {
  const { jobId } = Route.useParams();
  return <EditJob jobId={jobId} />;
}

export const Route = createFileRoute('/_authenticated/recruiter/jobs/$jobId/edit')({
  component: withPermission(EditJobRoute, Permission.ManageJobs),
});
