import type { LinkProps } from '@tanstack/react-router';
import type { IconType } from 'react-icons';
import { MdDashboard } from 'react-icons/md';

import { Permission } from '@/enum/permissions';
import type { UserRole } from '@/types/auth.types';

export type MenuItem = {
  labelId: string;
  to: LinkProps['to'];
  icon: IconType;
  permission?: Permission;
};

export const menuItems: Record<UserRole, MenuItem[]> = {
  recruiter: [{ labelId: 'menu.dashboard', to: '/recruiter/dashboard', icon: MdDashboard }],
  candidate: [{ labelId: 'menu.dashboard', to: '/candidate/dashboard', icon: MdDashboard }],
  admin: [
    {
      labelId: 'menu.dashboard',
      to: '/admin/dashboard',
      icon: MdDashboard,
      permission: Permission.ViewPlatformAnalytics,
    },
  ],
};
