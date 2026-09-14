import { yupResolver } from '@hookform/resolvers/yup';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { FormTextField } from '@/components/Form/FormTextField';
import { IconTile } from '@/components/UI/IconTile';
import { INTERVIEW_TYPE_VISUALS } from '@/constants/interviews';
import { jobApplicationsQueryKey } from '@/hooks/useApplications';
import { interviewsQueryKey } from '@/hooks/useInterviews';
import { updateApplication } from '@/services/applications.service';
import { cancelInterview, saveInterview } from '@/services/interviews.service';
import type { ApplicationStage, RecruiterApplication } from '@/types/application.types';
import type { Interview } from '@/types/interview.types';
import { dayjs } from '@/utils/dayjs';
import { useAuth } from '@/utils/hooks/useAuth';
import { useFormMutation } from '@/utils/hooks/useFormMutation';
import {
  combineDateAndTime,
  INTERVIEW_DURATIONS,
  INTERVIEW_NOTES_MAX,
  INTERVIEW_TYPES,
  type InterviewFormValues,
  interviewSchema,
} from '@/validations/interview.validation.schema';

/** Who the interview is with; enough to schedule from the board, the drawer or the Interviews page. */
export type InterviewTarget = {
  applicationId: string;
  jobId: string;
  candidateName: string;
  stage: ApplicationStage;
  /** Present when rescheduling. */
  interview?: Interview;
};

const STAGES_BEFORE_INTERVIEW: ApplicationStage[] = ['applied', 'screening'];

function defaultValues(target: InterviewTarget | null): InterviewFormValues {
  const interview = target?.interview;
  const scheduled = interview ? dayjs(interview.scheduled_at) : dayjs().add(1, 'day').hour(10).minute(0);
  return {
    date: scheduled,
    time: scheduled,
    durationMinutes: interview?.duration_minutes ?? 30,
    type: interview?.type ?? 'video',
    locationOrLink: interview?.location_or_link ?? '',
    notes: interview?.notes ?? '',
    moveToInterviewStage: Boolean(target && !interview && STAGES_BEFORE_INTERVIEW.includes(target.stage)),
  };
}

type ScheduleInterviewDialogProps = {
  target: InterviewTarget | null;
  onClose: () => void;
};

export function ScheduleInterviewDialog({ target, onClose }: ScheduleInterviewDialogProps) {
  const { $t } = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { control, handleSubmit, reset, formState } = useForm<InterviewFormValues>({
    resolver: yupResolver(interviewSchema),
    defaultValues: defaultValues(target),
  });
  const type = useWatch({ control, name: 'type' });

  useEffect(() => {
    if (target) {
      reset(defaultValues(target));
      setConfirmCancel(false);
    }
  }, [target]);

  const refresh = () => {
    if (target) queryClient.invalidateQueries({ queryKey: jobApplicationsQueryKey(target.jobId) });
    queryClient.invalidateQueries({ queryKey: interviewsQueryKey });
  };

  const save = useFormMutation({
    mutationKey: ['interview', 'save'],
    mutationFn: async (values: InterviewFormValues) => {
      if (!target || !values.date || !values.time) return;
      await saveInterview(target.interview?.id ?? null, {
        application_id: target.applicationId,
        scheduled_at: combineDateAndTime(values.date, values.time).toISOString(),
        duration_minutes: values.durationMinutes,
        type: values.type,
        location_or_link: values.locationOrLink || null,
        notes: values.notes || null,
        created_by: target.interview?.created_by ?? (profile?.id as string),
      });
      if (values.moveToInterviewStage) {
        // Land at the end of the Interview column so existing priorities stay put.
        const applications = queryClient.getQueryData<RecruiterApplication[]>(jobApplicationsQueryKey(target.jobId));
        const position = applications?.filter((application) => application.stage === 'interview').length ?? 0;
        await updateApplication(target.applicationId, { stage: 'interview', position });
      }
    },
    onSuccess: () => {
      refresh();
      enqueueSnackbar(
        $t(
          { id: target?.interview ? 'interview.rescheduled' : 'interview.scheduled' },
          { name: target?.candidateName },
        ),
        { variant: 'success' },
      );
      onClose();
    },
  });

  const cancel = useFormMutation({
    mutationKey: ['interview', 'cancel'],
    mutationFn: () => cancelInterview(target?.interview?.id as string),
    onSuccess: () => {
      refresh();
      enqueueSnackbar($t({ id: 'interview.cancelled' }), { variant: 'success' });
      onClose();
    },
  });

  const serverError = save.serverErrors.general ?? cancel.serverErrors.general;
  const isBusy = save.isPending || cancel.isPending;
  const errorText = (message?: string) => (message ? $t({ id: message }) : undefined);

  return (
    <Dialog open={Boolean(target)} onClose={isBusy ? undefined : onClose} maxWidth="sm" fullWidth>
      <Box component="form" noValidate onSubmit={handleSubmit((values) => save.mutate(values))}>
        <DialogTitle>
          <Typography variant="h4" component="span" className="tw-block">
            {$t({ id: target?.interview ? 'interview.dialog.rescheduleTitle' : 'interview.dialog.title' })}
          </Typography>
          <Typography color="text.secondary" component="span" className="tw-block">
            {$t({ id: 'interview.dialog.with' }, { name: target?.candidateName })}
          </Typography>
        </DialogTitle>

        <DialogContent className="tw-flex tw-flex-col tw-gap-5 tw-pt-2">
          {serverError && <Alert severity="error">{serverError}</Alert>}

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={field.value}
                onChange={(_event, value) => value && field.onChange(value)}
                aria-label={$t({ id: 'interview.field.type' })}
              >
                {INTERVIEW_TYPES.map((interviewType) => {
                  const { icon, color } = INTERVIEW_TYPE_VISUALS[interviewType];
                  return (
                    <ToggleButton key={interviewType} value={interviewType} className="tw-gap-2 tw-py-2.5">
                      <IconTile icon={icon} color={color} size="sm" />
                      {$t({ id: `interview.type.${interviewType}` })}
                    </ToggleButton>
                  );
                })}
              </ToggleButtonGroup>
            )}
          />

          <Box className="tw-grid tw-gap-4 sm:tw-grid-cols-3">
            <Controller
              name="date"
              control={control}
              render={({ field, fieldState }) => (
                <DatePicker
                  label={$t({ id: 'interview.field.date' })}
                  value={field.value}
                  onChange={field.onChange}
                  disablePast
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(fieldState.error),
                      helperText: errorText(fieldState.error?.message),
                    },
                  }}
                />
              )}
            />
            <Controller
              name="time"
              control={control}
              render={({ field, fieldState }) => (
                <TimePicker
                  label={$t({ id: 'interview.field.time' })}
                  value={field.value}
                  onChange={field.onChange}
                  minutesStep={5}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(fieldState.error),
                      helperText: errorText(fieldState.error?.message),
                    },
                  }}
                />
              )}
            />
            <Controller
              name="durationMinutes"
              control={control}
              render={({ field }) => (
                <TextField select fullWidth label={$t({ id: 'interview.field.duration' })} {...field}>
                  {INTERVIEW_DURATIONS.map((minutes) => (
                    <MenuItem key={minutes} value={minutes}>
                      {$t({ id: 'interview.minutes' }, { minutes })}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Box>

          <FormTextField
            name="locationOrLink"
            control={control}
            labelId={`interview.field.location.${type}`}
            placeholder={$t({ id: `interview.field.location.${type}.placeholder` })}
          />
          <FormTextField
            name="notes"
            control={control}
            labelId="interview.field.notes"
            placeholder={$t({ id: 'interview.field.notes.placeholder' })}
            multiline
            minRows={3}
            slotProps={{ htmlInput: { maxLength: INTERVIEW_NOTES_MAX } }}
          />

          {target && !target.interview && STAGES_BEFORE_INTERVIEW.includes(target.stage) && (
            <Controller
              name="moveToInterviewStage"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />
                  }
                  label={$t({ id: 'interview.field.moveStage' })}
                />
              )}
            />
          )}
        </DialogContent>

        <DialogActions className="tw-flex-wrap tw-gap-2 tw-px-6 tw-pb-5">
          {target?.interview &&
            (confirmCancel ? (
              <Button
                color="error"
                variant="contained"
                onClick={() => cancel.mutate(undefined)}
                loading={cancel.isPending}
              >
                {$t({ id: 'interview.cancel.confirm' })}
              </Button>
            ) : (
              <Button color="error" onClick={() => setConfirmCancel(true)} disabled={isBusy}>
                {$t({ id: 'interview.cancel' })}
              </Button>
            ))}
          <Box className="tw-flex-1" />
          <Button onClick={onClose} disabled={isBusy}>
            {$t({ id: 'profile.cancel' })}
          </Button>
          <Button
            type="submit"
            variant="contained"
            loading={save.isPending}
            disabled={cancel.isPending || (target?.interview && !formState.isDirty)}
          >
            {$t({ id: target?.interview ? 'interview.dialog.saveChanges' : 'interview.dialog.schedule' })}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
