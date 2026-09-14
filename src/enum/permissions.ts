export enum Permission {
  // Recruiter
  ManageJobs = 'jobs.manage',
  ManagePipeline = 'pipeline.manage',
  ScheduleInterviews = 'interviews.schedule',
  ViewCompanyAnalytics = 'analytics.company',
  // Candidate
  ApplyToJobs = 'jobs.apply',
  ManageOwnProfile = 'profile.manage',
  // Admin
  ManageUsers = 'users.manage',
  ManageCompanies = 'companies.manage',
  ManageFeatureFlags = 'flags.manage',
  ViewPlatformAnalytics = 'analytics.platform',
}
