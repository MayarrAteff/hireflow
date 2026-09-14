import { MdFlag, MdInsights, MdPeople } from 'react-icons/md';

import { DashboardWelcome } from '@/components/UI/Dashboard/DashboardWelcome';

export function AdminDashboard() {
  return (
    <DashboardWelcome
      subtitleId="dashboard.admin.subtitle"
      nextSteps={[
        { icon: MdPeople, labelId: 'dashboard.admin.next.users' },
        { icon: MdFlag, labelId: 'dashboard.admin.next.flags' },
        { icon: MdInsights, labelId: 'dashboard.admin.next.stats' },
      ]}
    />
  );
}
