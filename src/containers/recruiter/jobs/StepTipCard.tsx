import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion } from 'framer-motion';
import { MdLightbulb } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import type { JobFormStep } from '@/store/features/jobFormStepsSlice';

type StepTipCardProps = {
  step: JobFormStep;
};

export function StepTipCard({ step }: StepTipCardProps) {
  const { $t } = useIntl();

  return (
    <Card>
      <CardContent className="tw-flex tw-gap-3">
        <IconTile icon={MdLightbulb} color="amber" size="sm" />
        <Box className="tw-min-w-0">
          <Typography fontWeight={600} className="tw-mb-0.5">
            {$t({ id: 'jobs.tip.title' })}
          </Typography>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Typography variant="body2" color="text.secondary">
                {$t({ id: `jobs.tip.${step}` })}
              </Typography>
            </motion.div>
          </AnimatePresence>
        </Box>
      </CardContent>
    </Card>
  );
}
