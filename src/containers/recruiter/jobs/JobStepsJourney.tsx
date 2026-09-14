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
      className="m-0 grid w-full max-w-3xl list-none gap-4 p-0 sm:grid-cols-4"
    >
      {JOB_FORM_STEPS.map((step, index) => {
        const { icon, color } = JOB_STEP_VISUALS[step];
        const isLast = index === JOB_FORM_STEPS.length - 1;

        return (
          <motion.li
            key={step}
            className="relative"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + index * 0.12, type: 'spring', stiffness: 260, damping: 22 }}
          >
            {!isLast && (
              <Box
                aria-hidden
                className="absolute hidden sm:block"
                sx={{
                  top: 40,
                  insetInlineStart: 'calc(50% + 36px)',
                  width: 'calc(100% - 72px + 16px)',
                  borderTop: `2px dashed ${alpha(ACCENT_COLORS[color], 0.45)}`,
                }}
              />
            )}

            <Box
              className="flex h-full items-center gap-3 rounded-2xl p-3 transition-transform hover:-translate-y-1 sm:flex-col sm:p-4 sm:text-center"
              sx={{
                border: `1px solid ${alpha(ACCENT_COLORS[color], 0.25)}`,
                background: `linear-gradient(180deg, ${alpha(ACCENT_COLORS[color], 0.1)} 0%, transparent 100%)`,
              }}
            >
              <Box className="relative">
                <IconTile icon={icon} color={color} size="lg" />
                <Box
                  className="absolute -end-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                  sx={{ bgcolor: ACCENT_COLORS[color], border: 2, borderColor: 'background.paper' }}
                >
                  {index + 1}
                </Box>
              </Box>
              <Box className="min-w-0">
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
