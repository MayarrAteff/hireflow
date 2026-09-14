import { createFileRoute } from '@tanstack/react-router';

import { CandidateDashboard } from '@/containers/candidate/CandidateDashboard';

export const Route = createFileRoute('/_authenticated/candidate/dashboard')({
  component: CandidateDashboard,
});
