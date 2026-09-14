import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { createLink } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import type { IconType } from 'react-icons';
import {
  MdCelebration,
  MdEdit,
  MdEvent,
  MdEventAvailable,
  MdGroups,
  MdLock,
  MdLockOpen,
  MdPlace,
  MdRocketLaunch,
  MdSchedule,
  MdSearch,
} from 'react-icons/md';
import { useIntl } from 'react-intl';

import { JobStatusChip } from '@/components/Jobs/JobStatusChip';
import { IconTile } from '@/components/UI/IconTile';
import { jobsQueryKey } from '@/hooks/useJobs';
import { updateJobStatus } from '@/services/jobs.service';
import { type AccentColor, brandGradient } from '@/styles/themes/accents';
import type { RecruiterApplication } from '@/types/application.types';
import type { Job, JobStatus } from '@/types/job.types';
import { useFormMutation } from '@/utils/hooks/useFormMutation';
import { useJobFormatters } from '@/utils/hooks/useJobFormatters';

const ButtonLink = createLink(Button);

type JobHeaderProps = {
  job: Job;
  applications: RecruiterApplication[];
  loadingApplications: boolean;
};

export function JobHeader({ job, applications, loadingApplications }: JobHeaderProps) {
  const { $t, formatDate, formatNumber } = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { formatSalary, formatRelativeDay, daysFromToday } = useJobFormatters();
  const [confirmClose, setConfirmClose] = useState(false);

  const statusMutation = useFormMutation({
    mutationKey: ['job', 'status', job.id],
    mutationFn: (status: JobStatus) => updateJobStatus(job.id, status),
    onSuccess: (_job, status) => {
      setConfirmClose(false);
      queryClient.invalidateQueries({ queryKey: jobsQueryKey });
      enqueueSnackbar($t({ id: status === 'closed' ? 'jobs.details.closed' : 'jobs.details.reopened' }), {
        variant: 'success',
      });
    },
  });

  const countStage = (...stages: string[]) =>
    applications.filter((application) => stages.includes(application.stage)).length;
  const stats: { icon: IconType; color: AccentColor; labelId: string; value: number }[] = [
    { icon: MdGroups, color: 'violet', labelId: 'jobs.details.stats.applicants', value: applications.length },
    { icon: MdSearch, color: 'sky', labelId: 'jobs.details.stats.screening', value: countStage('screening') },
    { icon: MdEventAvailable, color: 'amber', labelId: 'jobs.details.stats.interview', value: countStage('interview') },
    { icon: MdCelebration, color: 'emerald', labelId: 'jobs.details.stats.hired', value: countStage('offer', 'hired') },
  ];

  const salary = formatSalary(job.salary_min, job.salary_max, job.currency);
  const daysLeft = job.deadline ? daysFromToday(job.deadline) : null;

  return (
    <Card className="overflow-hidden">
      <Box className="h-2" sx={(theme) => ({ background: brandGradient(theme, 90) })} />
      <CardContent className="flex flex-col gap-6 p-5 sm:p-8">
        <Box className="flex flex-col gap-3">
          <Box className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <Box className="flex min-w-0 flex-wrap items-center gap-3">
              <Typography variant="h2" className="break-words">
                {job.title}
              </Typography>
              <JobStatusChip status={job.status} size="medium" />
            </Box>
            <Box className="flex shrink-0 flex-wrap gap-2">
              {job.status !== 'draft' && (
                <ButtonLink
                  variant="outlined"
                  startIcon={<MdEdit />}
                  to="/recruiter/jobs/$jobId/edit"
                  params={{ jobId: job.id }}
                >
                  {$t({ id: 'jobs.edit' })}
                </ButtonLink>
              )}
              {job.status === 'draft' && (
                <ButtonLink
                  variant="contained"
                  startIcon={<MdRocketLaunch />}
                  to="/recruiter/jobs/$jobId/edit"
                  params={{ jobId: job.id }}
                >
                  {$t({ id: 'jobs.details.finishAndPublish' })}
                </ButtonLink>
              )}
              {job.status === 'published' && (
                <Button variant="outlined" color="error" startIcon={<MdLock />} onClick={() => setConfirmClose(true)}>
                  {$t({ id: 'jobs.details.close' })}
                </Button>
              )}
              {job.status === 'closed' && (
                <Button
                  variant="contained"
                  startIcon={<MdLockOpen />}
                  onClick={() => statusMutation.mutate('published')}
                  loading={statusMutation.isPending}
                >
                  {$t({ id: 'jobs.details.reopen' })}
                </Button>
              )}
            </Box>
          </Box>
          <Box className="flex flex-wrap gap-1.5">
            <Chip variant="outlined" label={$t({ id: `jobs.employmentType.${job.employment_type}` })} />
            <Chip variant="outlined" label={$t({ id: `jobs.workMode.${job.work_mode}` })} />
            {salary && <Chip variant="outlined" label={salary} />}
          </Box>
          <Box className="flex flex-wrap gap-x-5 gap-y-1">
            {job.location && (
              <Typography variant="body2" color="text.secondary" className="flex items-center gap-1.5">
                <MdPlace /> {job.location}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" className="flex items-center gap-1.5">
              <MdSchedule /> {$t({ id: 'jobs.details.posted' }, { when: formatRelativeDay(job.created_at) })}
            </Typography>
            {job.deadline && (
              <Typography
                variant="body2"
                className="flex items-center gap-1.5"
                sx={{ color: daysLeft !== null && daysLeft <= 7 ? 'warning.main' : 'text.secondary' }}
              >
                <MdEvent />
                {$t(
                  { id: 'jobs.details.deadlineRecruiter' },
                  { date: formatDate(job.deadline, { dateStyle: 'medium' }), when: formatRelativeDay(job.deadline) },
                )}
              </Typography>
            )}
          </Box>
        </Box>

        <Box className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(({ icon, color, labelId, value }) => (
            <Box
              key={labelId}
              className="flex items-center gap-3 rounded-2xl p-3"
              sx={{ bgcolor: 'action.hover' }}
            >
              <IconTile icon={icon} color={color} />
              <Box className="min-w-0">
                <Typography variant="h4" component="p">
                  {loadingApplications ? '–' : formatNumber(value)}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {$t({ id: labelId })}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>

      <Dialog open={confirmClose} onClose={() => setConfirmClose(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{$t({ id: 'jobs.details.closeTitle' })}</DialogTitle>
        <DialogContent>
          <DialogContentText>{$t({ id: 'jobs.details.closeBody' })}</DialogContentText>
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={() => setConfirmClose(false)}>{$t({ id: 'profile.cancel' })}</Button>
          <Button
            color="error"
            variant="contained"
            loading={statusMutation.isPending}
            onClick={() => statusMutation.mutate('closed')}
          >
            {$t({ id: 'jobs.details.close' })}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
