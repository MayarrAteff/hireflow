import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  MdAdd,
  MdCalendarMonth,
  MdEditNote,
  MdHourglassBottom,
  MdPublic,
  MdViewKanban,
  MdWorkOutline,
} from 'react-icons/md';
import { useIntl } from 'react-intl';

import { ComingNextSection } from '@/components/UI/Dashboard/ComingNextSection';
import { DashboardHero } from '@/components/UI/Dashboard/DashboardHero';
import { BoardPreview, CalendarPreview } from '@/components/UI/Dashboard/FeaturePreviews';
import { StatCard } from '@/components/UI/Dashboard/StatCard';
import { useCompanyJobs } from '@/hooks/useJobs';
import { dayjs } from '@/utils/dayjs';
import { useAuth } from '@/utils/hooks/useAuth';

import { GettingStartedCard } from './dashboard/GettingStartedCard';
import { RecentJobsCard } from './dashboard/RecentJobsCard';

const CLOSING_SOON_DAYS = 7;
const RECRUITER_TIP_IDS = ['dashboard.tip.1', 'dashboard.tip.2', 'dashboard.tip.3'];

const appear = (index: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.1 + index * 0.06 },
});

export function RecruiterDashboard() {
  const { $t } = useIntl();
  const { profile } = useAuth();
  const { data: jobs = [], isLoading } = useCompanyJobs(profile?.company_id);

  const today = dayjs().startOf('day');
  const published = jobs.filter((job) => job.status === 'published');
  const stats = [
    { icon: MdWorkOutline, color: 'violet', labelId: 'dashboard.stats.totalJobs', value: jobs.length },
    { icon: MdPublic, color: 'emerald', labelId: 'dashboard.stats.published', value: published.length },
    {
      icon: MdEditNote,
      color: 'amber',
      labelId: 'dashboard.stats.drafts',
      value: jobs.filter((job) => job.status === 'draft').length,
    },
    {
      icon: MdHourglassBottom,
      color: 'pink',
      labelId: 'dashboard.stats.closingSoon',
      value: published.filter((job) => {
        const daysLeft = job.deadline ? dayjs(job.deadline).diff(today, 'day') : -1;
        return daysLeft >= 0 && daysLeft <= CLOSING_SOON_DAYS;
      }).length,
    },
  ] as const;

  return (
    <Box className="tw-mx-auto tw-flex tw-max-w-6xl tw-flex-col tw-gap-6">
      <DashboardHero
        subtitleId="dashboard.recruiter.subtitle"
        actions={
          <>
            <Button
              component={Link}
              to="/recruiter/jobs/new"
              size="large"
              color="inherit"
              startIcon={<MdAdd />}
              sx={{ bgcolor: 'common.white', color: 'primary.main', '&:hover': { bgcolor: alpha('#fff', 0.9) } }}
            >
              {$t({ id: 'jobs.list.postJob' })}
            </Button>
            <Button
              component={Link}
              to="/recruiter/jobs"
              size="large"
              variant="outlined"
              color="inherit"
              sx={{ borderColor: alpha('#fff', 0.6), '&:hover': { borderColor: '#fff', bgcolor: alpha('#fff', 0.1) } }}
            >
              {$t({ id: 'dashboard.hero.viewJobs' })}
            </Button>
          </>
        }
      />

      <Box className="tw-grid tw-gap-4 sm:tw-grid-cols-2 lg:tw-grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.labelId} {...appear(index)}>
            <StatCard {...stat} loading={isLoading} />
          </motion.div>
        ))}
      </Box>

      <Box className="tw-grid tw-gap-6 lg:tw-grid-cols-5">
        <motion.div className="lg:tw-col-span-2" {...appear(4)}>
          <GettingStartedCard jobs={jobs} />
        </motion.div>
        <motion.div className="lg:tw-col-span-3" {...appear(5)}>
          <RecentJobsCard jobs={jobs} loading={isLoading} />
        </motion.div>
      </Box>

      <ComingNextSection
        subtitleId="dashboard.upNext.subtitle"
        tipIds={RECRUITER_TIP_IDS}
        features={[
          {
            icon: MdViewKanban,
            color: 'sky',
            titleId: 'dashboard.upNext.board.title',
            bodyId: 'dashboard.upNext.board.body',
            preview: <BoardPreview />,
          },
          {
            icon: MdCalendarMonth,
            color: 'rose',
            titleId: 'dashboard.upNext.interviews.title',
            bodyId: 'dashboard.upNext.interviews.body',
            preview: <CalendarPreview />,
          },
        ]}
      />
    </Box>
  );
}
