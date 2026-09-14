import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { MdArrowForward, MdWhatshot } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import { EmptyJobsIllustration } from '@/components/UI/Illustrations';
import type { JobWithCompany } from '@/types/job.types';

import { JobCard } from '../components/JobCard';

type FreshJobsCardProps = {
  jobs: JobWithCompany[];
  loading: boolean;
  appliedJobIds: Set<string>;
};

/** The newest published roles, so there is always something to explore. */
export function FreshJobsCard({ jobs, loading, appliedJobIds }: FreshJobsCardProps) {
  const { $t } = useIntl();

  return (
    <Card>
      <CardContent className="tw-p-6">
        <Box className="tw-mb-5 tw-flex tw-flex-wrap tw-items-center tw-gap-3">
          <IconTile icon={MdWhatshot} color="rose" />
          <Box className="tw-min-w-0 tw-flex-1">
            <Typography variant="h5">{$t({ id: 'candidate.freshJobs.title' })}</Typography>
            <Typography variant="body2" color="text.secondary">
              {$t({ id: 'candidate.freshJobs.subtitle' })}
            </Typography>
          </Box>
          {jobs.length > 0 && (
            <Button component={Link} to="/candidate/jobs" endIcon={<MdArrowForward className="rtl:tw-rotate-180" />}>
              {$t({ id: 'candidate.freshJobs.viewAll' })}
            </Button>
          )}
        </Box>

        {loading && (
          <Box className="tw-grid tw-gap-3 sm:tw-grid-cols-2 lg:tw-grid-cols-3">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} variant="rounded" height={140} />
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
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.06 }}
            >
              <JobCard job={job} applied={appliedJobIds.has(job.id)} />
            </motion.div>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
