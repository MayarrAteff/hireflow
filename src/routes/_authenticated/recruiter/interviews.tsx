import { createFileRoute } from '@tanstack/react-router';

import { withPermission } from '@/components/shared/withPermission';
import { InterviewsPage } from '@/containers/recruiter/interviews/InterviewsPage';
import { Permission } from '@/enum/permissions';

export const Route = createFileRoute('/_authenticated/recruiter/interviews')({
  component: withPermission(InterviewsPage, Permission.ScheduleInterviews),
});
