import { MdFlag, MdInsights, MdPeople } from 'react-icons/md';

import { DashboardWelcome } from '@/components/UI/Dashboard/DashboardWelcome';

export function AdminDashboard() {
  return (
    <DashboardWelcome
      subtitleId="dashboard.admin.subtitle"
      features={[
        { icon: MdPeople, labelId: 'dashboard.admin.next.users', color: 'sky' },
        { icon: MdFlag, labelId: 'dashboard.admin.next.flags', color: 'amber' },
        { icon: MdInsights, labelId: 'dashboard.admin.next.stats', color: 'violet' },
      ]}
    />
  );
}
