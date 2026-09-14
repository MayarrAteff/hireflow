import { MdAssignmentInd, MdSearch, MdTimeline } from 'react-icons/md';

import { DashboardWelcome } from '@/components/UI/Dashboard/DashboardWelcome';

export function CandidateDashboard() {
  return (
    <DashboardWelcome
      subtitleId="dashboard.candidate.subtitle"
      features={[
        { icon: MdAssignmentInd, labelId: 'dashboard.candidate.next.profile', color: 'violet' },
        { icon: MdSearch, labelId: 'dashboard.candidate.next.search', color: 'amber' },
        { icon: MdTimeline, labelId: 'dashboard.candidate.next.track', color: 'emerald' },
      ]}
    />
  );
}
