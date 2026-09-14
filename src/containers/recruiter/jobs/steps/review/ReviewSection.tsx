import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { MdEdit } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import { goToStep, JOB_FORM_STEPS, type JobFormStep } from '@/store/features/jobFormStepsSlice';
import { useAppDispatch } from '@/store/hooks';
import { ACCENT_COLORS } from '@/styles/themes/accents';

import { JOB_STEP_VISUALS } from '../../jobStepVisuals';

export type ReviewRow = { labelId: string; value: ReactNode };

type ReviewSectionProps = {
  step: Exclude<JobFormStep, 'review'>;
  rows: ReviewRow[];
};

export function ReviewSection({ step, rows }: ReviewSectionProps) {
  const { $t } = useIntl();
  const dispatch = useAppDispatch();
  const { icon, color } = JOB_STEP_VISUALS[step];

  return (
    <Box
      component="section"
      className="tw-overflow-hidden tw-rounded-2xl"
      sx={{ border: 1, borderColor: 'divider', borderInlineStart: `4px solid ${ACCENT_COLORS[color]}` }}
    >
      <Box
        className="tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-3"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <IconTile icon={icon} color={color} size="sm" />
        <Typography variant="h6" className="tw-flex-1">
          {$t({ id: `jobs.step.${step}` })}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<MdEdit />}
          onClick={() => dispatch(goToStep(JOB_FORM_STEPS.indexOf(step)))}
        >
          {$t({ id: 'jobs.edit' })}
        </Button>
      </Box>

      <Box component="dl" className="tw-m-0 tw-grid tw-gap-x-6 tw-gap-y-4 tw-p-4 sm:tw-grid-cols-[160px_minmax(0,1fr)]">
        {rows.map(({ labelId, value }) => (
          <Box key={labelId} className="tw-contents">
            <Typography component="dt" variant="body2" color="text.secondary" className="sm:tw-pt-0.5">
              {$t({ id: labelId })}
            </Typography>
            <Box component="dd" className="tw-m-0 tw-min-w-0 tw-break-words">
              {value}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
