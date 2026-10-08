import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { MdAdd, MdEditNote, MdHourglassBottom, MdPublic, MdWorkOutline } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { countNewApplicants } from '@/components/Jobs/NewApplicantsBadge';
import { DashboardHero } from '@/components/UI/Dashboard/DashboardHero';
import { StatCard } from '@/components/UI/Dashboard/StatCard';
import { TipCard } from '@/components/UI/Dashboard/TipCard';
import { getJobDisplayStatus } from '@/constants/jobs';
import { useCompanyJobs } from '@/hooks/useJobs';
import { dayjs } from '@/utils/dayjs';
import { useAuth } from '@/utils/hooks/useAuth';

import { AnalyticsTeaserCard } from './dashboard/AnalyticsTeaserCard';
import { GettingStartedCard } from './dashboard/GettingStartedCard';
import { NewApplicantsCard } from './dashboard/NewApplicantsCard';
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
  // Live jobs only: a published job past its deadline no longer takes applications.
  const published = jobs.filter((job) => getJobDisplayStatus(job) === 'published');
  const hasGoneLive = jobs.some((job) => job.status !== 'draft');
  const newApplicantsTotal = jobs.reduce((sum, job) => sum + countNewApplicants(job.applications), 0);
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
    <Box className="mx-auto flex max-w-6xl flex-col gap-6">
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

      <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.labelId} {...appear(index)}>
            <StatCard {...stat} loading={isLoading} />
          </motion.div>
        ))}
      </Box>

      {/* Applications only arrive once a job has gone live; until then onboarding is the more useful card. */}
      {hasGoneLive ? (
        <Box className="grid gap-6 lg:grid-cols-5">
          <motion.div className="lg:col-span-3" {...appear(4)}>
            <NewApplicantsCard total={newApplicantsTotal} loading={isLoading} />
          </motion.div>
          <motion.div className="lg:col-span-2" {...appear(5)}>
            <RecentJobsCard jobs={jobs} loading={isLoading} />
          </motion.div>
        </Box>
      ) : (
        <Box className="grid gap-6 lg:grid-cols-5">
          <motion.div className="lg:col-span-2" {...appear(4)}>
            <GettingStartedCard jobs={jobs} />
          </motion.div>
          <motion.div className="lg:col-span-3" {...appear(5)}>
            <RecentJobsCard jobs={jobs} loading={isLoading} />
          </motion.div>
        </Box>
      )}

      {hasGoneLive && (
        <motion.div {...appear(6)}>
          <AnalyticsTeaserCard />
        </motion.div>
      )}

      <TipCard tipIds={RECRUITER_TIP_IDS} />
    </Box>
  );
}
