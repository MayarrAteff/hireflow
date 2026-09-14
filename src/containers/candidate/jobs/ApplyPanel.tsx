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
import { createLink, Link as RouterLink } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { MdCelebration, MdCheck, MdOpenInNew, MdSchedule, MdSend, MdTimeline, MdUndo } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { OfferStatusChip } from '@/components/Offers/OfferStatusChip';
import { APPLICATION_PIPELINE, APPLICATION_STAGE_COLOR } from '@/constants/applications';
import { getNextInterview, INTERVIEW_TYPE_VISUALS, isMeetingUrl } from '@/constants/interviews';
import { getCurrentOffer, getOfferDisplayStatus } from '@/constants/offers';
import { applicationsQueryKey, useCandidateApplicationForJob } from '@/hooks/useApplications';
import { withdrawApplication } from '@/services/applications.service';
import { ACCENT_COLORS } from '@/styles/themes/accents';
import type { ApplicationStage, JobApplication } from '@/types/application.types';
import type { Interview } from '@/types/interview.types';
import type { JobWithCompany } from '@/types/job.types';
import type { Offer } from '@/types/offer.types';
import { useAuth } from '@/utils/hooks/useAuth';
import { useFormMutation } from '@/utils/hooks/useFormMutation';
import { useJobFormatters } from '@/utils/hooks/useJobFormatters';

const ButtonLink = createLink(Button);

/** Segmented bar showing how far along the pipeline the application is. */
function StageProgress({ stage }: { stage: ApplicationStage }) {
  const { $t } = useIntl();
  const currentIndex = APPLICATION_PIPELINE.indexOf(stage);
  const color = ACCENT_COLORS[APPLICATION_STAGE_COLOR[stage]];
  const stageLabel = $t({ id: `application.stage.${stage}` });

  return (
    <Box>
      <Box className="mb-1.5 flex items-center justify-between gap-2">
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
        className="grid gap-1"
        sx={{ gridTemplateColumns: `repeat(${APPLICATION_PIPELINE.length}, minmax(0, 1fr))` }}
      >
        {APPLICATION_PIPELINE.map((pipelineStage, index) => (
          <Box
            key={pipelineStage}
            className="h-1.5 rounded-full"
            sx={{ bgcolor: index <= currentIndex ? color : 'divider' }}
          />
        ))}
      </Box>
    </Box>
  );
}

/** The candidate's next interview, with a join button for online meetings. */
function InterviewNotice({ interview }: { interview: Interview }) {
  const { $t, formatDate } = useIntl();
  const { icon: Icon, color } = INTERVIEW_TYPE_VISUALS[interview.type];

  return (
    <Box
      className="flex flex-col gap-2 rounded-xl p-3"
      sx={(theme) => ({ bgcolor: alpha(ACCENT_COLORS[color], theme.palette.mode === 'dark' ? 0.18 : 0.1) })}
    >
      <Box className="flex items-center gap-2.5">
        <Box
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
          sx={{ bgcolor: ACCENT_COLORS[color] }}
        >
          <Icon size={20} />
        </Box>
        <Box className="min-w-0">
          <Typography variant="caption" color="text.secondary" className="block leading-tight">
            {$t({ id: 'apply.interview.title' })}
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            {formatDate(interview.scheduled_at, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Typography>
          <Typography variant="caption" color="text.secondary" className="block">
            {$t({ id: `interview.type.${interview.type}` })} ·{' '}
            {$t({ id: 'interview.minutes' }, { minutes: interview.duration_minutes })}
            {interview.location_or_link &&
              !isMeetingUrl(interview.location_or_link) &&
              ` · ${interview.location_or_link}`}
          </Typography>
        </Box>
      </Box>
      {isMeetingUrl(interview.location_or_link) && (
        <Button
          size="small"
          variant="contained"
          startIcon={<MdOpenInNew />}
          href={interview.location_or_link as string}
          target="_blank"
          rel="noopener noreferrer"
        >
          {$t({ id: 'interview.join' })}
        </Button>
      )}
    </Box>
  );
}

/** A pending offer gets a prominent call to action; an answered or closed one a quiet status line. */
function OfferNotice({ offer }: { offer: Offer }) {
  const { $t, formatDate } = useIntl();
  const status = getOfferDisplayStatus(offer);
  const link = { to: '/candidate/offers/$offerId', params: { offerId: offer.id } } as const;

  if (status !== 'sent') {
    return (
      <Box
        className="flex items-center justify-between gap-2 rounded-xl p-3"
        sx={{ bgcolor: 'action.hover' }}
      >
        <Box className="flex min-w-0 items-center gap-2">
          <Typography variant="body2" fontWeight={600} noWrap>
            {$t({ id: 'apply.offer.title' })}
          </Typography>
          <OfferStatusChip offer={offer} />
        </Box>
        <ButtonLink size="small" {...link}>
          {$t({ id: 'apply.offer.view' })}
        </ButtonLink>
      </Box>
    );
  }

  return (
    <Box
      className="flex flex-col gap-2 rounded-xl p-3"
      sx={(theme) => ({ bgcolor: alpha(ACCENT_COLORS.emerald, theme.palette.mode === 'dark' ? 0.18 : 0.1) })}
    >
      <Box className="flex items-center gap-2.5">
        <Box
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
          sx={{ bgcolor: ACCENT_COLORS.emerald }}
        >
          <MdCelebration size={20} />
        </Box>
        <Box className="min-w-0">
          <Typography variant="body2" fontWeight={700}>
            {$t({ id: 'apply.offer.received' })}
          </Typography>
          <Typography variant="caption" color="text.secondary" className="block">
            {$t({ id: 'apply.offer.respondBy' }, { date: formatDate(offer.expires_at, { dateStyle: 'medium' }) })}
          </Typography>
        </Box>
      </Box>
      <ButtonLink size="small" variant="contained" color="success" {...link}>
        {$t({ id: 'apply.offer.view' })}
      </ButtonLink>
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
  const nextInterview = getNextInterview(application.interviews);
  const offer = getCurrentOffer(application.offers);
  // Withdrawing only makes sense before the recruiter has started reviewing.
  const canWithdraw = application.stage === 'applied';

  return (
    <Box
      className="flex w-full flex-col gap-4 rounded-2xl p-4 md:w-80"
      sx={(theme) => ({
        border: `1px solid ${alpha(ACCENT_COLORS.emerald, 0.35)}`,
        bgcolor: alpha(ACCENT_COLORS.emerald, theme.palette.mode === 'dark' ? 0.12 : 0.06),
      })}
    >
      <Box className="flex items-center gap-3">
        <Box
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
          sx={{ bgcolor: ACCENT_COLORS.emerald, boxShadow: `0 8px 18px -8px ${ACCENT_COLORS.emerald}` }}
        >
          <MdCheck size={24} />
        </Box>
        <Box className="min-w-0">
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
        <Typography variant="body2" className="rounded-xl p-3" sx={{ bgcolor: 'action.hover' }}>
          {$t({ id: 'apply.status.rejected' })}
        </Typography>
      ) : (
        <StageProgress stage={application.stage} />
      )}

      {offer && <OfferNotice offer={offer} />}
      {nextInterview && <InterviewNotice interview={nextInterview} />}

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
          <Typography variant="caption" color="text.secondary" className="mt-1 block text-center">
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
        <DialogActions className="px-6 pb-4">
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
    return <Skeleton variant="rounded" height={48} className="w-full rounded-xl md:w-44" />;
  }

  if (applicationQuery.data) {
    return <ApplicationStatusCard application={applicationQuery.data} />;
  }

  if (job.deadline !== null && daysFromToday(job.deadline) < 0) {
    return <Chip icon={<MdSchedule />} label={$t({ id: 'apply.status.closed' })} className="h-10 px-2" />;
  }

  return (
    <Button
      variant="contained"
      size="large"
      endIcon={<MdSend className="rtl:rotate-180" />}
      onClick={onApply}
      className="w-full px-8 py-3 text-base md:w-auto"
    >
      {$t({ id: 'apply.cta' })}
    </Button>
  );
}
