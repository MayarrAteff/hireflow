import { yupResolver } from '@hookform/resolvers/yup';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { type FieldErrors, FormProvider, useForm } from 'react-hook-form';
import { MdEditNote, MdPostAdd } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import { JOB_DRAFT_FIELDS, JOB_STEP_FIELDS } from '@/constants/jobs';
import { jobsQueryKey } from '@/hooks/useJobs';
import { createJob, toJobFields, toJobFormValues, updateJob } from '@/services/jobs.service';
import { goToStep, JOB_FORM_STEPS, nextStep, previousStep, resetJobForm } from '@/store/features/jobFormStepsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { Job, JobFormValues, JobStatus } from '@/types/job.types';
import { useAuth } from '@/utils/hooks/useAuth';
import { useFormMutation } from '@/utils/hooks/useFormMutation';
import { jobSchema } from '@/validations/job.validation.schema';

import { JobPreviewCard } from './JobPreviewCard';
import { BasicsStep } from './steps/BasicsStep';
import { CompensationStep } from './steps/CompensationStep';
import { DetailsStep } from './steps/DetailsStep';
import { ReviewStep } from './steps/ReviewStep';
import { StepTipCard } from './StepTipCard';

const stepComponents = {
  basics: BasicsStep,
  details: DetailsStep,
  compensation: CompensationStep,
  review: ReviewStep,
};

type JobFormProps = {
  /** Present when editing an existing job. */
  job?: Job;
};

export function JobForm({ job }: JobFormProps) {
  const { $t } = useIntl();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { profile } = useAuth();
  const dispatch = useAppDispatch();
  const { activeStep, completedSteps } = useAppSelector((state) => state.jobFormSteps);

  const methods = useForm<JobFormValues>({
    resolver: yupResolver(jobSchema),
    defaultValues: toJobFormValues(job),
    mode: 'onTouched',
  });

  // Step progress is global UI state, so start fresh each time the form opens and clean up on leave.
  useEffect(() => {
    dispatch(resetJobForm());
    return () => {
      dispatch(resetJobForm());
    };
  }, []);

  const isPublished = job?.status === 'published';
  const step = JOB_FORM_STEPS[activeStep];
  const isLastStep = activeStep === JOB_FORM_STEPS.length - 1;
  const StepContent = stepComponents[step];

  const { mutate, isPending, variables, serverErrors } = useFormMutation({
    mutationKey: ['saveJob'],
    mutationFn: (status: JobStatus) => {
      const fields = toJobFields(methods.getValues(), status);
      if (job) return updateJob(job.id, fields);
      return createJob({ ...fields, company_id: profile?.company_id as string, created_by: profile?.id as string });
    },
    onSuccess: (_savedJob, status) => {
      queryClient.invalidateQueries({ queryKey: jobsQueryKey });
      const messageId =
        status === 'draft' ? 'jobs.form.draftSaved' : isPublished ? 'jobs.form.updated' : 'jobs.form.published';
      enqueueSnackbar($t({ id: messageId }), { variant: 'success' });
      navigate({ to: '/recruiter/jobs' });
    },
  });

  const handleNext = async () => {
    if (await methods.trigger(JOB_STEP_FIELDS[step])) dispatch(nextStep());
  };

  const handleSaveDraft = async () => {
    if (await methods.trigger(JOB_DRAFT_FIELDS)) mutate('draft');
  };

  // Publishing validates everything; jump back to the first step that has an error.
  const handleInvalidPublish = (errors: FieldErrors<JobFormValues>) => {
    const firstInvalid = JOB_FORM_STEPS.findIndex((key) => JOB_STEP_FIELDS[key].some((field) => errors[field]));
    if (firstInvalid >= 0) dispatch(goToStep(firstInvalid));
  };

  const handlePublish = methods.handleSubmit(() => mutate('published'), handleInvalidPublish);

  const canOpenStep = (index: number) =>
    Boolean(job) || index <= activeStep || completedSteps.includes(JOB_FORM_STEPS[index]);

  return (
    <Box className="mx-auto max-w-6xl">
      <Box className="mb-8 flex items-center gap-4">
        <IconTile icon={job ? MdEditNote : MdPostAdd} size="lg" />
        <Box className="min-w-0 flex-1">
          <Typography variant="h2" className="mb-1">
            {$t({ id: job ? 'jobs.form.editTitle' : 'jobs.form.newTitle' })}
          </Typography>
          <Typography color="text.secondary">{$t({ id: 'jobs.form.subtitle' })}</Typography>
        </Box>
        <Chip
          color="primary"
          className="hidden sm:flex"
          label={$t({ id: 'jobs.form.stepCount' }, { current: activeStep + 1, total: JOB_FORM_STEPS.length })}
        />
      </Box>

      <Stepper nonLinear activeStep={activeStep} alternativeLabel className="mb-6">
        {JOB_FORM_STEPS.map((key, index) => (
          <Step key={key} completed={completedSteps.includes(key) && index !== activeStep}>
            <StepButton disabled={!canOpenStep(index)} onClick={() => dispatch(goToStep(index))}>
              <StepLabel
                optional={
                  <Typography variant="caption" color="text.secondary" className="hidden sm:block">
                    {$t({ id: `jobs.step.${key}.description` })}
                  </Typography>
                }
              >
                {$t({ id: `jobs.step.${key}` })}
              </StepLabel>
            </StepButton>
          </Step>
        ))}
      </Stepper>

      <FormProvider {...methods}>
        <Box className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card component="form" noValidate onSubmit={(event) => event.preventDefault()}>
            <CardContent className="p-5 sm:p-8">
              {serverErrors.general && (
                <Alert severity="error" className="mb-5">
                  {serverErrors.general}
                </Alert>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <StepContent />
                </motion.div>
              </AnimatePresence>
            </CardContent>

            <Divider />

            <Box className="flex flex-wrap items-center gap-2 p-4 sm:px-8">
              <Button disabled={activeStep === 0 || isPending} onClick={() => dispatch(previousStep())}>
                {$t({ id: 'jobs.form.back' })}
              </Button>
              <Box className="flex-1" />
              {!isPublished && (
                <Button
                  variant="outlined"
                  disabled={isPending}
                  loading={isPending && variables === 'draft'}
                  onClick={handleSaveDraft}
                >
                  {$t({ id: 'jobs.form.saveDraft' })}
                </Button>
              )}
              {isLastStep ? (
                <Button
                  variant="contained"
                  disabled={isPending}
                  loading={isPending && variables === 'published'}
                  onClick={handlePublish}
                >
                  {$t({ id: isPublished ? 'jobs.form.saveChanges' : 'jobs.form.publish' })}
                </Button>
              ) : (
                <Button variant="contained" disabled={isPending} onClick={handleNext}>
                  {$t({ id: 'jobs.form.next' })}
                </Button>
              )}
            </Box>
          </Card>

          <Box component="aside" className="flex flex-col gap-4 lg:sticky lg:top-24">
            <JobPreviewCard />
            {/* The review step runs its own readiness check, so the tip would only repeat it. */}
            {!isLastStep && <StepTipCard step={step} />}
          </Box>
        </Box>
      </FormProvider>
    </Box>
  );
}
