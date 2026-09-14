import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { IconType } from 'react-icons';
import { MdCheckCircle, MdErrorOutline, MdInfoOutline, MdTipsAndUpdates } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { goToStep, JOB_FORM_STEPS } from '@/store/features/jobFormStepsSlice';
import { useAppDispatch } from '@/store/hooks';
import { ACCENT_COLORS } from '@/styles/themes/accents';

import type { JobReadiness, ReadinessHint } from './jobReadiness';

const states: Record<'ready' | 'almost' | 'missing', { icon: IconType; color: string }> = {
  ready: { icon: MdCheckCircle, color: ACCENT_COLORS.emerald },
  almost: { icon: MdTipsAndUpdates, color: ACCENT_COLORS.amber },
  missing: { icon: MdErrorOutline, color: ACCENT_COLORS.rose },
};

type ReadinessBannerProps = {
  readiness: JobReadiness;
};

/** Final check before publishing: required gaps first, then optional suggestions, each linking to its step. */
export function ReadinessBanner({ readiness }: ReadinessBannerProps) {
  const { $t } = useIntl();
  const dispatch = useAppDispatch();

  const stateKey = readiness.missing.length ? 'missing' : readiness.suggestions.length ? 'almost' : 'ready';
  const { icon: StateIcon, color } = states[stateKey];

  const renderHint = (hint: ReadinessHint, required: boolean) => (
    <Box component="li" key={hint.id} className="tw-flex tw-items-center tw-gap-2">
      <Box
        component={required ? MdErrorOutline : MdInfoOutline}
        className="tw-shrink-0"
        sx={{ color: required ? ACCENT_COLORS.rose : 'text.secondary' }}
      />
      <Typography variant="body2" className="tw-flex-1">
        {$t({ id: `jobs.readiness.hint.${hint.id}` })}
      </Typography>
      <Button
        size="small"
        color={required ? 'error' : 'primary'}
        onClick={() => dispatch(goToStep(JOB_FORM_STEPS.indexOf(hint.step)))}
      >
        {$t({ id: required ? 'jobs.readiness.action.fix' : 'jobs.readiness.action.add' })}
      </Button>
    </Box>
  );

  return (
    <Box
      role="status"
      className="tw-rounded-2xl tw-p-4 sm:tw-p-5"
      sx={(theme) => ({
        border: `1px solid ${alpha(color, 0.35)}`,
        bgcolor: alpha(color, theme.palette.mode === 'dark' ? 0.14 : 0.08),
      })}
    >
      <Box className="tw-flex tw-items-start tw-gap-3">
        <Box
          className="tw-flex tw-h-10 tw-w-10 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-xl"
          sx={{ bgcolor: color, color: '#fff' }}
        >
          <StateIcon size={22} />
        </Box>
        <Box className="tw-min-w-0">
          <Typography fontWeight={700}>{$t({ id: `jobs.readiness.${stateKey}.title` })}</Typography>
          <Typography variant="body2" color="text.secondary">
            {$t({ id: `jobs.readiness.${stateKey}.body` })}
          </Typography>
        </Box>
      </Box>

      {stateKey !== 'ready' && (
        <Box component="ul" className="tw-m-0 tw-mt-3 tw-flex tw-list-none tw-flex-col tw-gap-1 tw-p-0 sm:tw-ps-[52px]">
          {readiness.missing.map((hint) => renderHint(hint, true))}
          {readiness.suggestions.map((hint) => renderHint(hint, false))}
        </Box>
      )}
    </Box>
  );
}
