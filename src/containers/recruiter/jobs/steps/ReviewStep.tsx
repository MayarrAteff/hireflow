import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { MdEdit } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { goToStep, JOB_FORM_STEPS, type JobFormStep } from '@/store/features/jobFormStepsSlice';
import { useAppDispatch } from '@/store/hooks';
import type { JobFormValues } from '@/types/job.types';

type Row = { labelId: string; value: ReactNode };

export function ReviewStep() {
  const { $t, formatNumber, formatDate } = useIntl();
  const dispatch = useAppDispatch();
  const values = useFormContext<JobFormValues>().getValues();

  const notSet = (
    <Typography component="span" color="text.disabled">
      {$t({ id: 'jobs.review.notSet' })}
    </Typography>
  );

  const chips = (items: string[]) =>
    items.length ? (
      <Box className="tw-flex tw-flex-wrap tw-gap-1.5">
        {items.map((item) => (
          <Chip key={item} size="small" label={item} />
        ))}
      </Box>
    ) : (
      notSet
    );

  const salary = () => {
    const [min, max] = [values.salaryMin, values.salaryMax].map((amount) => amount && formatNumber(Number(amount)));
    const currency = values.currency;
    if (min && max) return $t({ id: 'jobs.review.salary.range' }, { min, max, currency });
    if (min) return $t({ id: 'jobs.review.salary.from' }, { min, currency });
    if (max) return $t({ id: 'jobs.review.salary.upTo' }, { max, currency });
    return notSet;
  };

  const sections: Record<Exclude<JobFormStep, 'review'>, Row[]> = {
    basics: [
      { labelId: 'jobs.field.title', value: values.title || notSet },
      { labelId: 'jobs.field.employmentType', value: $t({ id: `jobs.employmentType.${values.employmentType}` }) },
      { labelId: 'jobs.field.workMode', value: $t({ id: `jobs.workMode.${values.workMode}` }) },
      { labelId: 'jobs.field.location', value: values.location || notSet },
    ],
    details: [
      {
        labelId: 'jobs.field.description',
        value: values.description ? <span className="tw-whitespace-pre-line">{values.description}</span> : notSet,
      },
      { labelId: 'jobs.field.requirements', value: chips(values.requirements) },
      { labelId: 'jobs.field.skills', value: chips(values.skills) },
    ],
    compensation: [
      { labelId: 'jobs.review.salary', value: salary() },
      {
        labelId: 'jobs.field.deadline',
        value: values.deadline?.isValid() ? formatDate(values.deadline.toDate(), { dateStyle: 'medium' }) : notSet,
      },
    ],
  };

  return (
    <Box className="tw-flex tw-flex-col tw-gap-6">
      {Object.entries(sections).map(([key, rows]) => (
        <Box key={key}>
          <Box className="tw-mb-3 tw-flex tw-items-center tw-justify-between">
            <Typography variant="h6">{$t({ id: `jobs.step.${key}` })}</Typography>
            <Button
              size="small"
              startIcon={<MdEdit />}
              onClick={() => dispatch(goToStep(JOB_FORM_STEPS.indexOf(key as JobFormStep)))}
            >
              {$t({ id: 'jobs.edit' })}
            </Button>
          </Box>
          <Box
            component="dl"
            className="tw-m-0 tw-grid tw-gap-x-6 tw-gap-y-3 tw-rounded-xl tw-p-4 sm:tw-grid-cols-[180px_1fr]"
            sx={{ bgcolor: 'action.hover' }}
          >
            {rows.map(({ labelId, value }) => (
              <Box key={labelId} className="tw-contents">
                <Typography component="dt" variant="body2" color="text.secondary">
                  {$t({ id: labelId })}
                </Typography>
                <Typography component="dd" className="tw-m-0 tw-break-words">
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
