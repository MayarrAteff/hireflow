import { createFileRoute } from '@tanstack/react-router';

import { RecruiterDashboard } from '@/containers/recruiter/RecruiterDashboard';

export const Route = createFileRoute('/_authenticated/recruiter/dashboard')({
  component: RecruiterDashboard,
});
