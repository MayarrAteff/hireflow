import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { MdPlace, MdWhatshot } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import { EmptyJobsIllustration } from '@/components/UI/Illustrations';
import { accentFor, accentSoftSx } from '@/styles/themes/accents';
import type { JobWithCompany } from '@/types/job.types';
import { dayjs } from '@/utils/dayjs';

type FreshJobsCardProps = {
  jobs: JobWithCompany[];
  loading: boolean;
};

/** The newest published roles, so there is always something to explore. */
export function FreshJobsCard({ jobs, loading }: FreshJobsCardProps) {
  const { $t, formatNumber, formatRelativeTime } = useIntl();

  const salaryFor = (job: JobWithCompany) => {
    const [min, max] = [job.salary_min, job.salary_max].map((amount) => (amount == null ? null : formatNumber(amount)));
    if (min && max) return $t({ id: 'jobs.review.salary.range' }, { min, max, currency: job.currency });
    if (min) return $t({ id: 'jobs.review.salary.from' }, { min, currency: job.currency });
    if (max) return $t({ id: 'jobs.review.salary.upTo' }, { max, currency: job.currency });
    return null;
  };

  return (
    <Card>
      <CardContent className="tw-p-6">
        <Box className="tw-mb-5 tw-flex tw-items-center tw-gap-3">
          <IconTile icon={MdWhatshot} color="rose" />
          <Box className="tw-min-w-0 tw-flex-1">
            <Typography variant="h5">{$t({ id: 'candidate.freshJobs.title' })}</Typography>
            <Typography variant="body2" color="text.secondary">
              {$t({ id: 'candidate.freshJobs.subtitle' })}
            </Typography>
          </Box>
        </Box>

        {loading && (
          <Box className="tw-grid tw-gap-3 sm:tw-grid-cols-2 lg:tw-grid-cols-3">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} variant="rounded" height={132} />
            ))}
          </Box>
        )}

        {!loading && jobs.length === 0 && (
          <Box className="tw-flex tw-flex-col tw-items-center tw-py-4 tw-text-center">
            <EmptyJobsIllustration className="tw-mb-2 tw-w-36" />
            <Typography color="text.secondary">{$t({ id: 'candidate.freshJobs.empty' })}</Typography>
          </Box>
        )}

        <Box className="tw-grid tw-gap-3 sm:tw-grid-cols-2 lg:tw-grid-cols-3">
          {jobs.map((job, index) => {
            const company = job.company?.name ?? '';
            const salary = salaryFor(job);
            const daysAgo = dayjs(job.created_at).startOf('day').diff(dayjs().startOf('day'), 'day');
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.06 }}
              >
                <Box
                  className="tw-flex tw-h-full tw-flex-col tw-gap-3 tw-rounded-2xl tw-p-4 tw-transition-transform hover:-tw-translate-y-1"
                  sx={{ border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
                >
                  <Box className="tw-flex tw-items-center tw-gap-3">
                    <Avatar
                      variant="rounded"
                      sx={(theme) => ({ ...accentSoftSx(theme, accentFor(company || job.title)), fontWeight: 700 })}
                    >
                      {(company || job.title).slice(0, 1).toUpperCase()}
                    </Avatar>
                    <Box className="tw-min-w-0 tw-flex-1">
                      <Typography fontWeight={700} noWrap>
                        {job.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {company}
                      </Typography>
                    </Box>
                    {daysAgo === 0 && (
                      <Chip size="small" color="secondary" label={$t({ id: 'candidate.freshJobs.new' })} />
                    )}
                  </Box>

                  <Box className="tw-flex tw-flex-wrap tw-gap-1.5">
                    <Chip
                      size="small"
                      variant="outlined"
                      label={$t({ id: `jobs.employmentType.${job.employment_type}` })}
                    />
                    <Chip size="small" variant="outlined" label={$t({ id: `jobs.workMode.${job.work_mode}` })} />
                  </Box>

                  <Box className="tw-mt-auto tw-flex tw-items-center tw-justify-between tw-gap-2">
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                      className="tw-flex tw-items-center tw-gap-1"
                    >
                      {job.location && <MdPlace className="tw-shrink-0" />}
                      {job.location || formatRelativeTime(daysAgo, 'day', { numeric: 'auto' })}
                    </Typography>
                    {salary && (
                      <Typography variant="body2" fontWeight={700} color="primary" noWrap>
                        {salary}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </motion.div>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
