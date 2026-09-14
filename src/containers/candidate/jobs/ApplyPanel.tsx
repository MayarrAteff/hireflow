import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Skeleton from '@mui/material/Skeleton';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { MdCheck, MdSchedule, MdSend, MdTimeline, MdUndo } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { APPLICATION_PIPELINE, APPLICATION_STAGE_COLOR } from '@/constants/applications';
import { applicationsQueryKey, useCandidateApplicationForJob } from '@/hooks/useApplications';
import { withdrawApplication } from '@/services/applications.service';
import { ACCENT_COLORS } from '@/styles/themes/accents';
import type { ApplicationStage, JobApplication } from '@/types/application.types';
import type { JobWithCompany } from '@/types/job.types';
import { useAuth } from '@/utils/hooks/useAuth';
import { useFormMutation } from '@/utils/hooks/useFormMutation';
import { useJobFormatters } from '@/utils/hooks/useJobFormatters';

/** Segmented bar showing how far along the pipeline the application is. */
function StageProgress({ stage }: { stage: ApplicationStage }) {
  const { $t } = useIntl();
  const currentIndex = APPLICATION_PIPELINE.indexOf(stage);
  const color = ACCENT_COLORS[APPLICATION_STAGE_COLOR[stage]];
  const stageLabel = $t({ id: `application.stage.${stage}` });

  return (
    <Box>
      <Box className="tw-mb-1.5 tw-flex tw-items-center tw-justify-between tw-gap-2">
        <Typography variant="caption" color="text.secondary">
          {$t({ id: 'apply.status.stage' })}
        </Typography>
        <Typography variant="caption" fontWeight={700} sx={{ color }}>
          {stageLabel}
        </Typography>
      </Box>
      <Box
        role="img"
        aria-label={$t(
          { id: 'apply.status.stageProgress' },
          { current: currentIndex + 1, total: APPLICATION_PIPELINE.length, stage: stageLabel },
        )}
        className="tw-grid tw-gap-1"
        sx={{ gridTemplateColumns: `repeat(${APPLICATION_PIPELINE.length}, minmax(0, 1fr))` }}
      >
        {APPLICATION_PIPELINE.map((pipelineStage, index) => (
          <Box
            key={pipelineStage}
            className="tw-h-1.5 tw-rounded-full"
            sx={{ bgcolor: index <= currentIndex ? color : 'divider' }}
          />
        ))}
      </Box>
    </Box>
  );
}

function ApplicationStatusCard({ application }: { application: JobApplication }) {
  const { $t, formatDate } = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { formatRelativeDay } = useJobFormatters();
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  const withdraw = useFormMutation({
    mutationKey: ['withdraw', application.id],
    mutationFn: (applicationId: string) => withdrawApplication(applicationId),
    onSuccess: () => {
      setConfirmWithdraw(false);
      queryClient.invalidateQueries({ queryKey: applicationsQueryKey });
      enqueueSnackbar($t({ id: 'apply.withdraw.done' }), { variant: 'success' });
    },
  });

  const isRejected = application.stage === 'rejected';
  // Withdrawing only makes sense before the recruiter has started reviewing.
  const canWithdraw = application.stage === 'applied';

  return (
    <Box
      className="tw-flex tw-w-full tw-flex-col tw-gap-4 tw-rounded-2xl tw-p-4 md:tw-w-80"
      sx={(theme) => ({
        border: `1px solid ${alpha(ACCENT_COLORS.emerald, 0.35)}`,
        bgcolor: alpha(ACCENT_COLORS.emerald, theme.palette.mode === 'dark' ? 0.12 : 0.06),
      })}
    >
      <Box className="tw-flex tw-items-center tw-gap-3">
        <Box
          className="tw-flex tw-h-10 tw-w-10 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-xl tw-text-white"
          sx={{ bgcolor: ACCENT_COLORS.emerald, boxShadow: `0 8px 18px -8px ${ACCENT_COLORS.emerald}` }}
        >
          <MdCheck size={24} />
        </Box>
        <Box className="tw-min-w-0">
          <Typography fontWeight={700}>{$t({ id: 'apply.status.sent' })}</Typography>
          <Typography variant="body2" color="text.secondary">
            {$t(
              { id: 'apply.status.sentOn' },
              {
                date: formatDate(application.created_at, { dateStyle: 'medium' }),
                when: formatRelativeDay(application.created_at),
              },
            )}
          </Typography>
        </Box>
      </Box>

      {isRejected ? (
        <Typography variant="body2" className="tw-rounded-xl tw-p-3" sx={{ bgcolor: 'action.hover' }}>
          {$t({ id: 'apply.status.rejected' })}
        </Typography>
      ) : (
        <StageProgress stage={application.stage} />
      )}

      {canWithdraw ? (
        <Box>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<MdUndo />}
            onClick={() => setConfirmWithdraw(true)}
          >
            {$t({ id: 'apply.withdraw.cta' })}
          </Button>
          <Typography variant="caption" color="text.secondary" className="tw-mt-1 tw-block tw-text-center">
            {$t({ id: 'apply.withdraw.hint' })}
          </Typography>
        </Box>
      ) : (
        <Button
          fullWidth
          variant="outlined"
          startIcon={<MdTimeline />}
          component={RouterLink}
          to="/candidate/dashboard"
        >
          {$t({ id: 'apply.status.track' })}
        </Button>
      )}

      <Dialog open={confirmWithdraw} onClose={() => setConfirmWithdraw(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{$t({ id: 'apply.withdraw.title' })}</DialogTitle>
        <DialogContent>
          <DialogContentText>{$t({ id: 'apply.withdraw.body' })}</DialogContentText>
        </DialogContent>
        <DialogActions className="tw-px-6 tw-pb-4">
          <Button onClick={() => setConfirmWithdraw(false)}>{$t({ id: 'profile.cancel' })}</Button>
          <Button
            color="error"
            variant="contained"
            loading={withdraw.isPending}
            onClick={() => withdraw.mutate(application.id)}
          >
            {$t({ id: 'apply.withdraw.cta' })}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

type ApplyPanelProps = {
  job: JobWithCompany;
  onApply: () => void;
};

/** The job hero's call to action: apply, the application's status, or a closed notice. */
export function ApplyPanel({ job, onApply }: ApplyPanelProps) {
  const { $t } = useIntl();
  const { profile } = useAuth();
  const { daysFromToday } = useJobFormatters();
  const applicationQuery = useCandidateApplicationForJob(profile?.id, job.id);

  if (applicationQuery.isPending) {
    return <Skeleton variant="rounded" height={48} className="tw-w-full tw-rounded-xl md:tw-w-44" />;
  }

  if (applicationQuery.data) {
    return <ApplicationStatusCard application={applicationQuery.data} />;
  }

  if (job.deadline !== null && daysFromToday(job.deadline) < 0) {
    return <Chip icon={<MdSchedule />} label={$t({ id: 'apply.status.closed' })} className="tw-h-10 tw-px-2" />;
  }

  return (
    <Button
      variant="contained"
      size="large"
      endIcon={<MdSend className="rtl:tw-rotate-180" />}
      onClick={onApply}
      className="tw-w-full tw-px-8 tw-py-3 tw-text-base md:tw-w-auto"
    >
      {$t({ id: 'apply.cta' })}
    </Button>
  );
}
