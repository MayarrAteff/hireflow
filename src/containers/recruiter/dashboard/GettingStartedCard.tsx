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
    <Card className="h-full">
      <CardContent className="p-6">
        <Box className="mb-4 flex items-center gap-3">
          <IconTile icon={MdRocketLaunch} />
          <Box className="min-w-0 flex-1">
            <Typography variant="h5">{$t({ id: 'dashboard.gettingStarted.title' })}</Typography>
            <Typography variant="body2" color="text.secondary">
              {$t({ id: 'dashboard.gettingStarted.progress' }, { done: doneCount, total: tasks.length })}
            </Typography>
          </Box>
        </Box>

        <LinearProgress variant="determinate" value={(doneCount / tasks.length) * 100} className="mb-5" />

        {allDone ? (
          <Typography className="rounded-xl p-4" sx={{ bgcolor: alpha(ACCENT_COLORS.emerald, 0.12) }}>
            {$t({ id: 'dashboard.gettingStarted.allDone' })}
          </Typography>
        ) : (
          <Box component="ol" className="m-0 flex list-none flex-col gap-2 p-0">
            {tasks.map((task, index) => (
              <Box
                component="li"
                key={task.labelId}
                className="flex items-center gap-3 rounded-xl p-2"
                sx={task === nextTask ? { bgcolor: 'primary.light' } : undefined}
              >
                <Box
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                  sx={
                    task.done
                      ? { bgcolor: ACCENT_COLORS.emerald, color: '#fff' }
                      : { border: 2, borderColor: 'divider', color: 'text.secondary' }
                  }
                >
                  {task.done ? <MdCheck size={18} /> : index + 1}
                </Box>
                <Typography
                  className="flex-1"
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
