import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { MdCheckCircle, MdEvent, MdPlace } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { ACCENT_COLORS } from '@/styles/themes/accents';
import type { JobFormValues } from '@/types/job.types';
import { dayjs } from '@/utils/dayjs';

import { getJobReadiness } from './review/jobReadiness';
import { ReadinessBanner } from './review/ReadinessBanner';
import { type ReviewRow, ReviewSection } from './review/ReviewSection';

/** Descriptions longer than this start collapsed. */
const DESCRIPTION_PREVIEW_LENGTH = 280;

export function ReviewStep() {
  const { $t, formatNumber, formatDate, formatRelativeTime } = useIntl();
  const values = useFormContext<JobFormValues>().getValues();
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const notSet = (
    <Typography color="text.disabled" fontStyle="italic">
      {$t({ id: 'jobs.review.notSet' })}
    </Typography>
  );

  const description = values.description.trim();
  const isLongDescription = description.length > DESCRIPTION_PREVIEW_LENGTH;
  const requirements = values.requirements.map((item) => item.trim()).filter(Boolean);
  const deadline = values.deadline?.isValid() ? values.deadline : null;

  const salaryText = () => {
    const [min, max] = [values.salaryMin, values.salaryMax].map((amount) => amount && formatNumber(Number(amount)));
    const currency = values.currency;
    if (min && max) return $t({ id: 'jobs.review.salary.range' }, { min, max, currency });
    if (min) return $t({ id: 'jobs.review.salary.from' }, { min, currency });
    if (max) return $t({ id: 'jobs.review.salary.upTo' }, { max, currency });
    return null;
  };
  const salary = salaryText();

  const basics: ReviewRow[] = [
    {
      labelId: 'jobs.field.title',
      value: values.title ? <Typography variant="h6">{values.title}</Typography> : notSet,
    },
    {
      labelId: 'jobs.review.jobType',
      value: (
        <Box className="tw-flex tw-flex-wrap tw-gap-1.5">
          <Chip size="small" color="primary" label={$t({ id: `jobs.employmentType.${values.employmentType}` })} />
          <Chip size="small" color="secondary" label={$t({ id: `jobs.workMode.${values.workMode}` })} />
        </Box>
      ),
    },
    {
      labelId: 'jobs.field.location',
      value: values.location ? (
        <Typography className="tw-flex tw-items-center tw-gap-1.5">
          <Box component={MdPlace} className="tw-shrink-0" sx={{ color: 'text.secondary' }} />
          {values.location}
        </Typography>
      ) : (
        notSet
      ),
    },
  ];

  const details: ReviewRow[] = [
    {
      labelId: 'jobs.field.description',
      value: description ? (
        <Box>
          <Typography
            className={`tw-whitespace-pre-line ${isLongDescription && !descriptionExpanded ? 'tw-line-clamp-4' : ''}`}
          >
            {description}
          </Typography>
          {isLongDescription && (
            <Button size="small" className="-tw-ms-2 tw-mt-1" onClick={() => setDescriptionExpanded((open) => !open)}>
              {$t({ id: descriptionExpanded ? 'jobs.review.showLess' : 'jobs.review.showMore' })}
            </Button>
          )}
        </Box>
      ) : (
        notSet
      ),
    },
    {
      labelId: 'jobs.field.requirements',
      value: requirements.length ? (
        <Box component="ul" className="tw-m-0 tw-flex tw-list-none tw-flex-col tw-gap-1.5 tw-p-0">
          {requirements.map((item, index) => (
            <Box component="li" key={index} className="tw-flex tw-items-start tw-gap-2">
              <Box component={MdCheckCircle} className="tw-mt-1 tw-shrink-0" sx={{ color: ACCENT_COLORS.amber }} />
              <Typography>{item}</Typography>
            </Box>
          ))}
        </Box>
      ) : (
        notSet
      ),
    },
    {
      labelId: 'jobs.field.skills',
      value: values.skills.length ? (
        <Box className="tw-flex tw-flex-wrap tw-gap-1.5">
          {values.skills.map((skill) => (
            <Chip key={skill} size="small" variant="outlined" label={skill} />
          ))}
        </Box>
      ) : (
        notSet
      ),
    },
  ];

  const compensation: ReviewRow[] = [
    {
      labelId: 'jobs.review.salary',
      value: salary ? (
        <Typography
          component="span"
          fontWeight={700}
          className="tw-inline-block tw-rounded-lg tw-px-2.5 tw-py-1 tw-text-lg"
          sx={(theme) => ({
            bgcolor: alpha(ACCENT_COLORS.emerald, theme.palette.mode === 'dark' ? 0.2 : 0.12),
            color: theme.palette.mode === 'dark' ? '#6EE7B7' : '#047857',
          })}
        >
          {salary}
        </Typography>
      ) : (
        notSet
      ),
    },
    {
      labelId: 'jobs.field.deadline',
      value: deadline ? (
        <Typography className="tw-flex tw-flex-wrap tw-items-center tw-gap-x-1.5">
          <Box component={MdEvent} className="tw-shrink-0" sx={{ color: 'text.secondary' }} />
          {formatDate(deadline.toDate(), { dateStyle: 'medium' })}
          <Typography component="span" variant="body2" color="text.secondary">
            (
            {formatRelativeTime(deadline.startOf('day').diff(dayjs().startOf('day'), 'day'), 'day', {
              numeric: 'auto',
            })}
            )
          </Typography>
        </Typography>
      ) : (
        notSet
      ),
    },
  ];

  return (
    <Box className="tw-flex tw-flex-col tw-gap-4">
      <ReadinessBanner readiness={getJobReadiness(values)} />
      <ReviewSection step="basics" rows={basics} />
      <ReviewSection step="details" rows={details} />
      <ReviewSection step="compensation" rows={compensation} />
    </Box>
  );
}
