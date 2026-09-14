import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useIntl } from 'react-intl';

import { DashboardHero } from './DashboardHero';
import { type Feature, FeatureCard } from './FeatureCard';

type DashboardWelcomeProps = {
  subtitleId: string;
  features: Feature[];
};

/** Hero banner plus a colourful grid of what the portal offers. */
export function DashboardWelcome({ subtitleId, features }: DashboardWelcomeProps) {
  const { $t } = useIntl();

  return (
    <Box className="mx-auto flex max-w-6xl flex-col gap-8">
      <DashboardHero subtitleId={subtitleId} />

      <Box>
        <Typography variant="h4" className="mb-4">
          {$t({ id: 'dashboard.section.explore' })}
        </Typography>
        <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.labelId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.08 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
