import type { LinkProps } from '@tanstack/react-router';
import type { IconType } from 'react-icons';
import { MdBusiness, MdDashboard, MdEventAvailable, MdPerson, MdSearch, MdWorkOutline } from 'react-icons/md';

import { Permission } from '@/enum/permissions';
import type { UserRole } from '@/types/auth.types';

export type MenuItem = {
  labelId: string;
  to: LinkProps['to'];
  icon: IconType;
  permission?: Permission;
};

export const menuItems: Record<UserRole, MenuItem[]> = {
  recruiter: [
    { labelId: 'menu.dashboard', to: '/recruiter/dashboard', icon: MdDashboard },
    { labelId: 'menu.jobs', to: '/recruiter/jobs', icon: MdWorkOutline, permission: Permission.ManageJobs },
    {
      labelId: 'menu.interviews',
      to: '/recruiter/interviews',
      icon: MdEventAvailable,
      permission: Permission.ScheduleInterviews,
    },
    {
      labelId: 'menu.company',
      to: '/recruiter/company',
      icon: MdBusiness,
      permission: Permission.ManageCompanyProfile,
    },
  ],
  candidate: [
    { labelId: 'menu.dashboard', to: '/candidate/dashboard', icon: MdDashboard },
    { labelId: 'menu.findJobs', to: '/candidate/jobs', icon: MdSearch, permission: Permission.ApplyToJobs },
    { labelId: 'menu.profile', to: '/candidate/profile', icon: MdPerson, permission: Permission.ManageOwnProfile },
  ],
  admin: [
    {
      labelId: 'menu.dashboard',
      to: '/admin/dashboard',
      icon: MdDashboard,
      permission: Permission.ViewPlatformAnalytics,
    },
  ],
};
