import { yupResolver } from '@hookform/resolvers/yup';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { createLink } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { IconType } from 'react-icons';
import {
  MdArrowBack,
  MdCelebration,
  MdCheckCircle,
  MdEventAvailable,
  MdHourglassBottom,
  MdPayments,
  MdPictureAsPdf,
  MdThumbDown,
} from 'react-icons/md';
import { useIntl } from 'react-intl';

import { FormTextField } from '@/components/Form/FormTextField';
import { OfferStatusChip } from '@/components/Offers/OfferStatusChip';
import { IconTile } from '@/components/UI/IconTile';
import { EmptyJobsIllustration } from '@/components/UI/Illustrations';
import { getOfferDisplayStatus, OFFER_DECLINE_REASON_MAX } from '@/constants/offers';
import { applicationsQueryKey } from '@/hooks/useApplications';
import { offerQueryKey, useCandidateOffer, useOfferRealtime } from '@/hooks/useOffers';
import { useOpenOfferLetter } from '@/hooks/useOpenCv';
import { getOfferLetterFileName, markOfferViewed, respondToOffer } from '@/services/offers.service';
import { type AccentColor, brandGradient } from '@/styles/themes/accents';
import { useFormMutation } from '@/utils/hooks/useFormMutation';
import { useJobFormatters } from '@/utils/hooks/useJobFormatters';
import { type DeclineOfferFormValues, declineOfferSchema } from '@/validations/offer.validation.schema';

const ButtonLink = createLink(Button);

type OfferViewProps = {
  offerId: string;
};

/** The candidate's offer: the terms, the letter, and accepting or declining it. */
export function OfferView({ offerId }: OfferViewProps) {
  const { $t, formatDate, formatNumber } = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { daysFromToday } = useJobFormatters();
  const { openLetter, openingPath } = useOpenOfferLetter();
  const offerQuery = useCandidateOffer(offerId);
  useOfferRealtime(offerId);
  const [dialog, setDialog] = useState<'accept' | 'decline' | null>(null);
  const markedViewed = useRef(false);

  const { control, handleSubmit, reset } = useForm<DeclineOfferFormValues>({
    resolver: yupResolver(declineOfferSchema),
    defaultValues: { reason: '' },
  });

  const offer = offerQuery.data;

  // Lets the recruiter see the offer was opened; once per visit is enough.
  useEffect(() => {
    if (offer?.status === 'sent' && !offer.viewed_at && !markedViewed.current) {
      markedViewed.current = true;
      markOfferViewed(offer.id).catch(() => undefined);
    }
  }, [offer]);

  const respond = useFormMutation({
    mutationKey: ['offer', 'respond', offerId],
    mutationFn: ({ accept, reason }: { accept: boolean; reason: string | null }) =>
      respondToOffer(offerId, accept, reason),
    onSuccess: (_offer, { accept }) => {
      setDialog(null);
      reset();
      queryClient.invalidateQueries({ queryKey: offerQueryKey(offerId) });
      queryClient.invalidateQueries({ queryKey: applicationsQueryKey });
      enqueueSnackbar($t({ id: accept ? 'offer.view.accepted.toast' : 'offer.view.declined.toast' }), {
        variant: 'success',
      });
    },
  });

  if (offerQuery.isPending) {
    return (
      <Box className="tw-mx-auto tw-flex tw-max-w-3xl tw-flex-col tw-gap-5">
        <Skeleton variant="rounded" height={420} className="tw-rounded-3xl" />
      </Box>
    );
  }

  if (offerQuery.isError || !offer) {
    return (
      <Box className="tw-mx-auto tw-max-w-3xl">
        <Card>
          <CardContent className="tw-flex tw-flex-col tw-items-center tw-py-12 tw-text-center">
            <EmptyJobsIllustration className="tw-mb-3 tw-w-44" />
            <Typography variant="h3" className="tw-mb-1">
              {$t({ id: 'offer.view.notFound.title' })}
            </Typography>
            <Typography color="text.secondary" className="tw-mb-5 tw-max-w-md">
              {$t({ id: 'offer.view.notFound.body' })}
            </Typography>
            <ButtonLink variant="contained" to="/candidate/dashboard">
              {$t({ id: 'offer.view.backToDashboard' })}
            </ButtonLink>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const status = getOfferDisplayStatus(offer);
  const job = offer.application.job;
  const company = job?.company?.name;
  const daysLeft = daysFromToday(offer.expires_at);
  const canRespond = status === 'sent';

  const tiles: { icon: IconType; color: AccentColor; labelId: string; value: string; hint?: string }[] = [
    {
      icon: MdPayments,
      color: 'emerald',
      labelId: 'offer.field.salary',
      value: `${formatNumber(offer.salary)} ${offer.currency}`,
    },
    {
      icon: MdEventAvailable,
      color: 'violet',
      labelId: 'offer.field.startDate',
      value: formatDate(offer.start_date, { dateStyle: 'medium' }),
    },
    {
      icon: MdHourglassBottom,
      color: canRespond && daysLeft <= 2 ? 'rose' : 'amber',
      labelId: 'offer.view.respondBy',
      value: formatDate(offer.expires_at, { dateStyle: 'medium' }),
      hint: canRespond ? $t({ id: 'offer.view.daysLeft' }, { days: daysLeft }) : undefined,
    },
  ];

  const headline = {
    draft: null,
    sent: $t({ id: 'offer.view.sent.headline' }, { company: company ?? '', job: job?.title ?? '' }),
    accepted: $t({ id: 'offer.view.accepted.headline' }),
    declined: $t({ id: 'offer.view.declined.headline' }),
    withdrawn: $t({ id: 'offer.view.withdrawn.headline' }),
    expired: $t({ id: 'offer.view.expired.headline' }),
  }[status];

  return (
    <Box className="tw-mx-auto tw-flex tw-max-w-3xl tw-flex-col tw-gap-4">
      {job && (
        <ButtonLink
          to="/candidate/jobs/$jobId"
          params={{ jobId: offer.application.job_id }}
          startIcon={<MdArrowBack className="rtl:tw-rotate-180" />}
          className="tw-self-start"
        >
          {$t({ id: 'offer.view.backToJob' })}
        </ButtonLink>
      )}

      <Card className="tw-overflow-hidden">
        <Box className="tw-h-2" sx={(theme) => ({ background: brandGradient(theme, 90) })} />
        <CardContent className="tw-flex tw-flex-col tw-gap-6 tw-p-5 sm:tw-p-8">
          <Box className="tw-flex tw-flex-wrap tw-items-start tw-gap-4">
            <motion.div
              initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16 }}
            >
              <IconTile
                icon={status === 'accepted' ? MdCheckCircle : MdCelebration}
                color={status === 'sent' || status === 'accepted' ? 'emerald' : 'primary'}
                size="lg"
              />
            </motion.div>
            <Box className="tw-min-w-0 tw-flex-1">
              <Typography variant="overline" color="text.secondary" className="tw-leading-none">
                {$t({ id: 'offer.view.overline' })}
              </Typography>
              <Typography variant="h2" className="tw-break-words">
                {job?.title ?? $t({ id: 'candidate.applications.unavailableJob' })}
              </Typography>
              {company && <Typography color="text.secondary">{company}</Typography>}
            </Box>
            <OfferStatusChip offer={offer} size="medium" />
          </Box>

          {headline && <Typography className="tw-text-lg">{headline}</Typography>}

          <Box className="tw-grid tw-gap-3 sm:tw-grid-cols-3">
            {tiles.map(({ icon, color, labelId, value, hint }) => (
              <Box
                key={labelId}
                className="tw-flex tw-items-center tw-gap-3 tw-rounded-2xl tw-p-3"
                sx={{ bgcolor: 'action.hover' }}
              >
                <IconTile icon={icon} color={color} />
                <Box className="tw-min-w-0">
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {$t({ id: labelId })}
                  </Typography>
                  <Typography fontWeight={700}>{value}</Typography>
                  {hint && (
                    <Typography variant="caption" sx={{ color: daysLeft <= 2 ? 'error.main' : 'text.secondary' }}>
                      {hint}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>

          {offer.message && (
            <Box className="tw-rounded-2xl tw-p-4" sx={{ border: 1, borderColor: 'divider' }}>
              <Typography variant="overline" color="text.secondary" className="tw-mb-2 tw-block tw-leading-none">
                {$t({ id: 'offer.view.message' }, { company: company ?? '' })}
              </Typography>
              <Typography className="tw-whitespace-pre-line">{offer.message}</Typography>
            </Box>
          )}

          {offer.letter_path && (
            <Box
              className="tw-flex tw-flex-wrap tw-items-center tw-gap-3 tw-rounded-2xl tw-p-3"
              sx={{ border: 1, borderColor: 'divider', bgcolor: 'action.hover' }}
            >
              <IconTile icon={MdPictureAsPdf} color="rose" />
              <Box className="tw-min-w-0 tw-flex-1">
                <Typography fontWeight={600} className="tw-break-all">
                  {getOfferLetterFileName(offer.letter_path)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {$t({ id: 'offer.letter.caption' })}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={() => openLetter(offer.letter_path as string)}
                loading={openingPath === offer.letter_path}
              >
                {$t({ id: 'offer.letter.view' })}
              </Button>
            </Box>
          )}

          {offer.status === 'declined' && offer.decline_reason && (
            <Typography variant="body2" color="text.secondary" className="tw-whitespace-pre-line">
              {$t({ id: 'offer.view.yourReason' }, { reason: offer.decline_reason })}
            </Typography>
          )}

          {canRespond && (
            <Box className="tw-flex tw-flex-col-reverse tw-gap-2 sm:tw-flex-row sm:tw-justify-end">
              <Button
                variant="outlined"
                color="error"
                size="large"
                startIcon={<MdThumbDown />}
                onClick={() => setDialog('decline')}
              >
                {$t({ id: 'offer.view.decline' })}
              </Button>
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<MdCheckCircle />}
                onClick={() => setDialog('accept')}
                className="sm:tw-px-8"
              >
                {$t({ id: 'offer.view.accept' })}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialog === 'accept'} onClose={() => setDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{$t({ id: 'offer.view.acceptTitle' })}</DialogTitle>
        <DialogContent>
          {respond.serverErrors.general && (
            <Alert severity="error" className="tw-mb-3">
              {respond.serverErrors.general}
            </Alert>
          )}
          <DialogContentText>{$t({ id: 'offer.view.acceptBody' }, { company: company ?? '' })}</DialogContentText>
        </DialogContent>
        <DialogActions className="tw-px-6 tw-pb-4">
          <Button onClick={() => setDialog(null)}>{$t({ id: 'profile.cancel' })}</Button>
          <Button
            variant="contained"
            color="success"
            loading={respond.isPending}
            onClick={() => respond.mutate({ accept: true, reason: null })}
          >
            {$t({ id: 'offer.view.accept' })}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialog === 'decline'} onClose={() => setDialog(null)} maxWidth="sm" fullWidth>
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit((values) => respond.mutate({ accept: false, reason: values.reason || null }))}
        >
          <DialogTitle>{$t({ id: 'offer.view.declineTitle' })}</DialogTitle>
          <DialogContent className="tw-flex tw-flex-col tw-gap-4">
            {respond.serverErrors.general && <Alert severity="error">{respond.serverErrors.general}</Alert>}
            <DialogContentText>{$t({ id: 'offer.view.declineBody' }, { company: company ?? '' })}</DialogContentText>
            <FormTextField
              name="reason"
              control={control}
              labelId="offer.view.declineReason"
              multiline
              minRows={3}
              slotProps={{ htmlInput: { maxLength: OFFER_DECLINE_REASON_MAX } }}
            />
          </DialogContent>
          <DialogActions className="tw-px-6 tw-pb-4">
            <Button onClick={() => setDialog(null)}>{$t({ id: 'profile.cancel' })}</Button>
            <Button type="submit" variant="contained" color="error" loading={respond.isPending}>
              {$t({ id: 'offer.view.decline' })}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
