import { MdAssignmentInd, MdSearch, MdTimeline } from 'react-icons/md';

import { DashboardWelcome } from '@/components/UI/Dashboard/DashboardWelcome';

export function CandidateDashboard() {
  return (
    <DashboardWelcome
      subtitleId="dashboard.candidate.subtitle"
      nextSteps={[
        { icon: MdAssignmentInd, labelId: 'dashboard.candidate.next.profile' },
        { icon: MdSearch, labelId: 'dashboard.candidate.next.search' },
        { icon: MdTimeline, labelId: 'dashboard.candidate.next.track' },
      ]}
    />
  );
}
