import { Permission } from '@/enum/permissions';
import type { UserRole } from '@/types/auth.types';

export const rolePermissions: Record<UserRole, Permission[]> = {
  recruiter: [
    Permission.ManageJobs,
    Permission.ManagePipeline,
    Permission.ScheduleInterviews,
    Permission.ViewCompanyAnalytics,
    Permission.ManageOwnProfile,
  ],
  candidate: [Permission.ApplyToJobs, Permission.ManageOwnProfile],
  admin: [
    Permission.ManageUsers,
    Permission.ManageCompanies,
    Permission.ManageFeatureFlags,
    Permission.ViewPlatformAnalytics,
    Permission.ManageOwnProfile,
  ],
};
