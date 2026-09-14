import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import { JOB_FORM_STEPS } from '@/store/features/jobFormStepsSlice';
import { ACCENT_COLORS } from '@/styles/themes/accents';

import { JOB_STEP_VISUALS } from './jobStepVisuals';

/** The four job form steps drawn as a connected path, to show how quick posting a job is. */
export function JobStepsJourney() {
  const { $t } = useIntl();

  return (
    <Box
      component="ol"
      className="tw-m-0 tw-grid tw-w-full tw-max-w-3xl tw-list-none tw-gap-4 tw-p-0 sm:tw-grid-cols-4"
    >
      {JOB_FORM_STEPS.map((step, index) => {
        const { icon, color } = JOB_STEP_VISUALS[step];
        const isLast = index === JOB_FORM_STEPS.length - 1;

        return (
          <motion.li
            key={step}
            className="tw-relative"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + index * 0.12, type: 'spring', stiffness: 260, damping: 22 }}
          >
            {!isLast && (
              <Box
                aria-hidden
                className="tw-absolute tw-hidden sm:tw-block"
                sx={{
                  top: 40,
                  insetInlineStart: 'calc(50% + 36px)',
                  width: 'calc(100% - 72px + 16px)',
                  borderTop: `2px dashed ${alpha(ACCENT_COLORS[color], 0.45)}`,
                }}
              />
            )}

            <Box
              className="tw-flex tw-h-full tw-items-center tw-gap-3 tw-rounded-2xl tw-p-3 tw-transition-transform hover:-tw-translate-y-1 sm:tw-flex-col sm:tw-p-4 sm:tw-text-center"
              sx={{
                border: `1px solid ${alpha(ACCENT_COLORS[color], 0.25)}`,
                background: `linear-gradient(180deg, ${alpha(ACCENT_COLORS[color], 0.1)} 0%, transparent 100%)`,
              }}
            >
              <Box className="tw-relative">
                <IconTile icon={icon} color={color} size="lg" />
                <Box
                  className="tw-absolute -tw-end-2 -tw-top-2 tw-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-full tw-text-xs tw-font-bold tw-text-white"
                  sx={{ bgcolor: ACCENT_COLORS[color], border: 2, borderColor: 'background.paper' }}
                >
                  {index + 1}
                </Box>
              </Box>
              <Box className="tw-min-w-0">
                <Typography fontWeight={700}>{$t({ id: `jobs.step.${step}` })}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {$t({ id: `jobs.step.${step}.description` })}
                </Typography>
              </Box>
            </Box>
          </motion.li>
        );
      })}
    </Box>
  );
}
