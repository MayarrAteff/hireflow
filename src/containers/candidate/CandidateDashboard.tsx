import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { MdAssignmentInd, MdCelebration, MdEventAvailable, MdSearch, MdSend, MdWorkOutline } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { ComingNextSection } from '@/components/UI/Dashboard/ComingNextSection';
import { DashboardHero } from '@/components/UI/Dashboard/DashboardHero';
import { StatCard } from '@/components/UI/Dashboard/StatCard';
import { useCandidateApplications } from '@/hooks/useApplications';
import { useLatestPublishedJobs, usePublishedJobsCount } from '@/hooks/useJobs';
import { useAuth } from '@/utils/hooks/useAuth';

import { ApplicationsTracker } from './dashboard/ApplicationsTracker';
import { CvPreview, SearchPreview } from './dashboard/ComingNextPreviews';
import { FreshJobsCard } from './dashboard/FreshJobsCard';
import { ProfileStrengthCard } from './dashboard/ProfileStrengthCard';

const FRESH_JOBS_LIMIT = 6;
const CANDIDATE_TIP_IDS = ['dashboard.candidate.tip.1', 'dashboard.candidate.tip.2', 'dashboard.candidate.tip.3'];

const appear = (index: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.1 + index * 0.06 },
});

export function CandidateDashboard() {
  const { $t } = useIntl();
  const { profile } = useAuth();
  const applicationsQuery = useCandidateApplications(profile?.id);
  const freshJobsQuery = useLatestPublishedJobs(FRESH_JOBS_LIMIT);
  const openJobsQuery = usePublishedJobsCount();

  const applications = applicationsQuery.data ?? [];
  const openJobs = openJobsQuery.data ?? 0;
  const countStages = (...stages: string[]) =>
    applications.filter((application) => stages.includes(application.stage)).length;

  const stats = [
    {
      icon: MdWorkOutline,
      color: 'sky',
      labelId: 'candidate.stats.openJobs',
      value: openJobs,
      loading: openJobsQuery.isLoading,
    },
    {
      icon: MdSend,
      color: 'violet',
      labelId: 'candidate.stats.applications',
      value: applications.length,
      loading: applicationsQuery.isLoading,
    },
    {
      icon: MdEventAvailable,
      color: 'amber',
      labelId: 'candidate.stats.interviews',
      value: countStages('interview'),
      loading: applicationsQuery.isLoading,
    },
    {
      icon: MdCelebration,
      color: 'emerald',
      labelId: 'candidate.stats.offers',
      value: countStages('offer', 'hired'),
      loading: applicationsQuery.isLoading,
    },
  ] as const;

  return (
    <Box className="tw-mx-auto tw-flex tw-max-w-6xl tw-flex-col tw-gap-6">
      <DashboardHero
        subtitleId="dashboard.candidate.subtitle"
        actions={
          openJobs > 0 && (
            <Box
              className="tw-flex tw-items-center tw-gap-2 tw-rounded-full tw-px-4 tw-py-2 tw-font-semibold"
              sx={{ bgcolor: alpha('#fff', 0.18), border: `1px solid ${alpha('#fff', 0.35)}` }}
            >
              🔥 {$t({ id: 'candidate.hero.openRoles' }, { count: openJobs })}
            </Box>
          )
        }
      />

      <Box className="tw-grid tw-gap-4 sm:tw-grid-cols-2 lg:tw-grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.labelId} {...appear(index)}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </Box>

      <Box className="tw-grid tw-gap-6 lg:tw-grid-cols-5">
        <motion.div className="lg:tw-col-span-3" {...appear(4)}>
          <ApplicationsTracker applications={applications} loading={applicationsQuery.isLoading} />
        </motion.div>
        <motion.div className="lg:tw-col-span-2" {...appear(5)}>
          <ProfileStrengthCard />
        </motion.div>
      </Box>

      <motion.div {...appear(6)}>
        <FreshJobsCard jobs={freshJobsQuery.data ?? []} loading={freshJobsQuery.isLoading} />
      </motion.div>

      <ComingNextSection
        subtitleId="candidate.upNext.subtitle"
        tipIds={CANDIDATE_TIP_IDS}
        features={[
          {
            icon: MdAssignmentInd,
            color: 'violet',
            titleId: 'candidate.upNext.profile.title',
            bodyId: 'candidate.upNext.profile.body',
            preview: <CvPreview />,
          },
          {
            icon: MdSearch,
            color: 'sky',
            titleId: 'candidate.upNext.search.title',
            bodyId: 'candidate.upNext.search.body',
            preview: <SearchPreview />,
          },
        ]}
      />
    </Box>
  );
}
