import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Link, type LinkProps } from '@tanstack/react-router';
import { MdCheck, MdRocketLaunch } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import { ACCENT_COLORS } from '@/styles/themes/accents';
import type { Job } from '@/types/job.types';
import { useAuth } from '@/utils/hooks/useAuth';

type GettingStartedCardProps = {
  jobs: Job[];
};

/** Onboarding checklist that nudges a new recruiter from company setup to a first published job. */
export function GettingStartedCard({ jobs }: GettingStartedCardProps) {
  const { $t } = useIntl();
  const { profile } = useAuth();

  const tasks: { labelId: string; done: boolean; to: LinkProps['to'] }[] = [
    { labelId: 'dashboard.gettingStarted.company', done: Boolean(profile?.company_id), to: '/recruiter/jobs' },
    { labelId: 'dashboard.gettingStarted.draft', done: jobs.length > 0, to: '/recruiter/jobs/new' },
    {
      labelId: 'dashboard.gettingStarted.publish',
      done: jobs.some((job) => job.status === 'published'),
      to: '/recruiter/jobs',
    },
  ];
  const doneCount = tasks.filter((task) => task.done).length;
  const allDone = doneCount === tasks.length;
  // Only the first unfinished task gets a button, so there is always one clear next action.
  const nextTask = tasks.find((task) => !task.done);

  return (
    <Card className="tw-h-full">
      <CardContent className="tw-p-6">
        <Box className="tw-mb-4 tw-flex tw-items-center tw-gap-3">
          <IconTile icon={MdRocketLaunch} />
          <Box className="tw-min-w-0 tw-flex-1">
            <Typography variant="h5">{$t({ id: 'dashboard.gettingStarted.title' })}</Typography>
            <Typography variant="body2" color="text.secondary">
              {$t({ id: 'dashboard.gettingStarted.progress' }, { done: doneCount, total: tasks.length })}
            </Typography>
          </Box>
        </Box>

        <LinearProgress variant="determinate" value={(doneCount / tasks.length) * 100} className="tw-mb-5" />

        {allDone ? (
          <Typography className="tw-rounded-xl tw-p-4" sx={{ bgcolor: alpha(ACCENT_COLORS.emerald, 0.12) }}>
            {$t({ id: 'dashboard.gettingStarted.allDone' })}
          </Typography>
        ) : (
          <Box component="ol" className="tw-m-0 tw-flex tw-list-none tw-flex-col tw-gap-2 tw-p-0">
            {tasks.map((task, index) => (
              <Box
                component="li"
                key={task.labelId}
                className="tw-flex tw-items-center tw-gap-3 tw-rounded-xl tw-p-2"
                sx={task === nextTask ? { bgcolor: 'primary.light' } : undefined}
              >
                <Box
                  className="tw-flex tw-h-8 tw-w-8 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-full tw-text-sm tw-font-semibold"
                  sx={
                    task.done
                      ? { bgcolor: ACCENT_COLORS.emerald, color: '#fff' }
                      : { border: 2, borderColor: 'divider', color: 'text.secondary' }
                  }
                >
                  {task.done ? <MdCheck size={18} /> : index + 1}
                </Box>
                <Typography
                  className="tw-flex-1"
                  color={task.done ? 'text.secondary' : 'text.primary'}
                  sx={task.done ? { textDecoration: 'line-through' } : undefined}
                >
                  {$t({ id: task.labelId })}
                </Typography>
                {task === nextTask && (
                  <Button size="small" variant="contained" component={Link} to={task.to}>
                    {$t({ id: 'dashboard.gettingStarted.go' })}
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
