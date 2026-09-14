import { MdCalendarMonth, MdPostAdd, MdViewKanban } from 'react-icons/md';

import { DashboardWelcome } from '@/components/UI/Dashboard/DashboardWelcome';

export function RecruiterDashboard() {
  return (
    <DashboardWelcome
      subtitleId="dashboard.recruiter.subtitle"
      nextSteps={[
        { icon: MdPostAdd, labelId: 'dashboard.recruiter.next.jobs' },
        { icon: MdViewKanban, labelId: 'dashboard.recruiter.next.board' },
        { icon: MdCalendarMonth, labelId: 'dashboard.recruiter.next.interviews' },
      ]}
    />
  );
}
