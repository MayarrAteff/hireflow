import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ListItemButton from '@mui/material/ListItemButton';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { createLink, Link } from '@tanstack/react-router';
import { MdArrowForward } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { JobStatusChip } from '@/components/Jobs/JobStatusChip';
import { EmptyJobsIllustration } from '@/components/UI/Illustrations';
import { accentFor, accentSoftSx } from '@/styles/themes/accents';
import type { Job } from '@/types/job.types';

const ListItemLink = createLink(ListItemButton);
const RECENT_JOBS_LIMIT = 4;

type RecentJobsCardProps = {
  jobs: Job[];
  loading: boolean;
};

export function RecentJobsCard({ jobs, loading }: RecentJobsCardProps) {
  const { $t, formatDate } = useIntl();
  const recent = jobs.slice(0, RECENT_JOBS_LIMIT);

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <Box className="mb-3 flex items-center justify-between gap-2">
          <Typography variant="h5">{$t({ id: 'dashboard.recentJobs.title' })}</Typography>
          {jobs.length > 0 && (
            <Button
              size="small"
              component={Link}
              to="/recruiter/jobs"
              endIcon={<MdArrowForward className="rtl:rotate-180" />}
            >
              {$t({ id: 'dashboard.recentJobs.viewAll' })}
            </Button>
          )}
        </Box>

        {loading && [0, 1, 2].map((row) => <Skeleton key={row} height={56} />)}

        {!loading && recent.length === 0 && (
          <Box className="flex flex-col items-center py-4 text-center">
            <EmptyJobsIllustration className="mb-2 w-40" />
            <Typography color="text.secondary">{$t({ id: 'dashboard.recentJobs.empty' })}</Typography>
          </Box>
        )}

        <Box className="flex flex-col gap-1">
          {recent.map((job) => (
            <ListItemLink
              key={job.id}
              to="/recruiter/jobs/$jobId"
              params={{ jobId: job.id }}
              className="gap-3 px-2"
            >
              <Avatar
                variant="rounded"
                sx={(theme) => ({ ...accentSoftSx(theme, accentFor(job.title)), fontWeight: 600 })}
              >
                {job.title.slice(0, 1).toUpperCase()}
              </Avatar>
              <Box className="min-w-0 flex-1">
                <Typography fontWeight={600} noWrap>
                  {job.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {$t({ id: `jobs.workMode.${job.work_mode}` })} · {formatDate(job.created_at, { dateStyle: 'medium' })}
                </Typography>
              </Box>
              <JobStatusChip status={job.status} />
            </ListItemLink>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
