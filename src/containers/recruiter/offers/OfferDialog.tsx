import { yupResolver } from '@hookform/resolvers/yup';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { MdClose, MdPictureAsPdf, MdSend } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { FileDropzone } from '@/components/Form/FileDropzone';
import { FormDateField } from '@/components/Form/FormDateField';
import { FormTextField } from '@/components/Form/FormTextField';
import { IconTile } from '@/components/UI/IconTile';
import { CURRENCIES } from '@/constants/jobs';
import { MAX_OFFER_LETTER_BYTES, OFFER_LETTER_TYPES, OFFER_MESSAGE_MAX } from '@/constants/offers';
import { jobApplicationsQueryKey } from '@/hooks/useApplications';
import { useFileUpload } from '@/hooks/useFileUpload';
import { getOfferLetterFileName, saveOffer, withdrawOffer } from '@/services/offers.service';
import type { Job } from '@/types/job.types';
import type { Offer, OfferStatus } from '@/types/offer.types';
import { dayjs } from '@/utils/dayjs';
import { useAuth } from '@/utils/hooks/useAuth';
import { useFormMutation } from '@/utils/hooks/useFormMutation';
import { type OfferFormValues, offerSchema } from '@/validations/offer.validation.schema';

const BYTES_IN_MB = 1024 * 1024;
const DEFAULT_START_IN_DAYS = 30;
const DEFAULT_RESPOND_WITHIN_DAYS = 7;

/** Who the offer is for, and the offer they already have (if any). */
export type OfferTarget = {
  applicationId: string;
  candidateName: string;
  current: Offer | undefined;
};

function defaultValues(job: Job, current: Offer | undefined): OfferFormValues {
  // A draft is edited as it is; a sent or answered offer is the starting point for a revision.
  if (current) {
    const expiresAt = dayjs(current.expires_at);
    return {
      salary: String(current.salary),
      currency: current.currency,
      startDate: dayjs(current.start_date),
      expiresAt: expiresAt.isBefore(dayjs(), 'day') ? dayjs().add(DEFAULT_RESPOND_WITHIN_DAYS, 'day') : expiresAt,
      message: current.message ?? '',
    };
  }
  const salary = job.salary_max ?? job.salary_min;
  return {
    salary: salary == null ? '' : String(salary),
    currency: job.currency,
    startDate: dayjs().add(DEFAULT_START_IN_DAYS, 'day'),
    expiresAt: dayjs().add(DEFAULT_RESPOND_WITHIN_DAYS, 'day'),
    message: '',
  };
}

type OfferDialogProps = {
  job: Job;
  target: OfferTarget | null;
  onClose: () => void;
};

export function OfferDialog({ job, target, onClose }: OfferDialogProps) {
  const { $t, formatDate } = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { validateFile } = useFileUpload({ maxBytes: MAX_OFFER_LETTER_BYTES, allowedTypes: OFFER_LETTER_TYPES });
  const [letter, setLetter] = useState<File | null>(null);
  const [removeLetter, setRemoveLetter] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  const current = target?.current;
  const isDraft = current?.status === 'draft';
  const isPending = current?.status === 'sent';
  const isRevision = Boolean(current) && !isDraft;

  const { control, handleSubmit, reset } = useForm<OfferFormValues>({
    resolver: yupResolver(offerSchema),
    defaultValues: defaultValues(job, current),
  });
  const expiresAt = useWatch({ control, name: 'expiresAt' });

  useEffect(() => {
    if (target) {
      reset(defaultValues(job, target.current));
      setLetter(null);
      setRemoveLetter(false);
      setConfirmWithdraw(false);
    }
  }, [target]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: jobApplicationsQueryKey(job.id) });

  const save = useFormMutation({
    mutationKey: ['offer', 'save'],
    mutationFn: ({ values, status }: { values: OfferFormValues; status: OfferStatus }) =>
      saveOffer({
        current,
        companyId: profile?.company_id as string,
        letter,
        removeLetter,
        payload: {
          application_id: target?.applicationId as string,
          salary: Number(values.salary),
          currency: values.currency,
          start_date: (values.startDate as NonNullable<OfferFormValues['startDate']>).format('YYYY-MM-DD'),
          expires_at: (values.expiresAt as NonNullable<OfferFormValues['expiresAt']>).format('YYYY-MM-DD'),
          message: values.message || null,
          status,
        },
      }),
    onSuccess: (_offer, { status }) => {
      refresh();
      const messageId =
        status === 'draft' ? 'offer.dialog.draftSaved' : isRevision ? 'offer.dialog.revisedSent' : 'offer.dialog.sent';
      enqueueSnackbar($t({ id: messageId }, { name: target?.candidateName }), { variant: 'success' });
      onClose();
    },
  });

  const withdraw = useFormMutation({
    mutationKey: ['offer', 'withdraw'],
    mutationFn: () => withdrawOffer(current?.id as string),
    onSuccess: () => {
      refresh();
      enqueueSnackbar($t({ id: 'offer.dialog.withdrawn' }), { variant: 'success' });
      onClose();
    },
  });

  const isBusy = save.isPending || withdraw.isPending;
  const serverError = save.serverErrors.general ?? withdraw.serverErrors.general;
  const keptLetterPath = !letter && !removeLetter ? current?.letter_path : null;

  const pickLetter = (file: File) => {
    if (!validateFile(file)) return;
    setLetter(file);
    setRemoveLetter(false);
  };

  const submitAs = (status: OfferStatus) => handleSubmit((values) => save.mutate({ values, status }));

  return (
    <Dialog open={Boolean(target)} onClose={isBusy ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="flex items-center gap-3">
        <Box className="min-w-0 flex-1">
          <Typography variant="h4" component="span" className="block">
            {$t({
              id: isRevision ? 'offer.dialog.reviseTitle' : isDraft ? 'offer.dialog.editTitle' : 'offer.dialog.title',
            })}
          </Typography>
          <Typography color="text.secondary" component="span" className="block">
            {$t({ id: 'offer.dialog.for' }, { name: target?.candidateName, job: job.title })}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent className="flex flex-col gap-5 pt-2">
        {serverError && <Alert severity="error">{serverError}</Alert>}
        {isPending && <Alert severity="info">{$t({ id: 'offer.dialog.revisionNote' })}</Alert>}

        <Box className="grid gap-4 pt-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <FormTextField
            name="salary"
            control={control}
            labelId="offer.field.salary"
            type="number"
            slotProps={{ htmlInput: { inputMode: 'decimal', min: 0 } }}
            helperText={$t({ id: 'offer.field.salary.hint' })}
          />
          <FormTextField select name="currency" control={control} labelId="jobs.field.currency">
            {[...new Set([job.currency, ...CURRENCIES])].map((currency) => (
              <MenuItem key={currency} value={currency}>
                {currency}
              </MenuItem>
            ))}
          </FormTextField>
        </Box>

        <Box className="grid gap-4 sm:grid-cols-2">
          <FormDateField name="startDate" control={control} labelId="offer.field.startDate" disablePast />
          <FormDateField name="expiresAt" control={control} labelId="offer.field.expiresAt" disablePast />
        </Box>
        {expiresAt?.isValid() && (
          <Typography variant="body2" color="text.secondary" className="-mt-3">
            {$t(
              { id: 'offer.field.expiresAt.preview' },
              { date: formatDate(expiresAt.toDate(), { weekday: 'long', month: 'long', day: 'numeric' }) },
            )}
          </Typography>
        )}

        <FormTextField
          name="message"
          control={control}
          labelId="offer.field.message"
          placeholder={$t({ id: 'offer.field.message.placeholder' })}
          multiline
          minRows={4}
          slotProps={{ htmlInput: { maxLength: OFFER_MESSAGE_MAX } }}
        />

        <Box>
          <Typography variant="body2" fontWeight={600} className="mb-2">
            {$t({ id: 'offer.field.letter' })}
          </Typography>
          {letter || keptLetterPath ? (
            <Box
              className="flex items-center gap-3 rounded-2xl p-3"
              sx={{ border: 1, borderColor: 'divider', bgcolor: 'action.hover' }}
            >
              <IconTile icon={MdPictureAsPdf} color="rose" size="sm" />
              <Typography fontWeight={600} className="min-w-0 flex-1 break-all">
                {letter?.name ?? getOfferLetterFileName(keptLetterPath as string)}
              </Typography>
              <IconButton
                size="small"
                aria-label={$t({ id: 'offer.field.letter.remove' })}
                onClick={() => {
                  setLetter(null);
                  setRemoveLetter(true);
                }}
              >
                <MdClose />
              </IconButton>
            </Box>
          ) : (
            <FileDropzone
              compact
              accept={OFFER_LETTER_TYPES}
              onFile={pickLetter}
              titleId="offer.field.letter.drop"
              captionId="offer.field.letter.formats"
              captionValues={{ size: MAX_OFFER_LETTER_BYTES / BYTES_IN_MB }}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions className="flex-wrap gap-2 px-6 pb-5">
        {isPending &&
          (confirmWithdraw ? (
            <Button color="error" variant="contained" onClick={() => withdraw.mutate()} loading={withdraw.isPending}>
              {$t({ id: 'offer.dialog.withdrawConfirm' })}
            </Button>
          ) : (
            <Button color="error" onClick={() => setConfirmWithdraw(true)} disabled={isBusy}>
              {$t({ id: 'offer.dialog.withdraw' })}
            </Button>
          ))}
        <Box className="flex-1" />
        <Button onClick={onClose} disabled={isBusy}>
          {$t({ id: 'profile.cancel' })}
        </Button>
        {!isRevision && (
          <Button
            variant="outlined"
            onClick={submitAs('draft')}
            disabled={isBusy}
            loading={save.isPending && save.variables?.status === 'draft'}
          >
            {$t({ id: 'offer.dialog.saveDraft' })}
          </Button>
        )}
        <Button
          variant="contained"
          startIcon={<MdSend className="rtl:rotate-180" />}
          onClick={submitAs('sent')}
          disabled={isBusy}
          loading={save.isPending && save.variables?.status === 'sent'}
        >
          {$t({ id: isRevision ? 'offer.dialog.sendRevised' : 'offer.dialog.send' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
