import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useIntl } from 'react-intl';

import { HiringIllustration } from '@/components/UI/Illustrations';
import { brandGradient } from '@/styles/themes/accents';
import { useAuth } from '@/utils/hooks/useAuth';

type DashboardHeroProps = {
  subtitleId: string;
  actions?: ReactNode;
};

function greetingId() {
  const hour = new Date().getHours();
  if (hour < 12) return 'dashboard.greeting.morning';
  if (hour < 18) return 'dashboard.greeting.afternoon';
  return 'dashboard.greeting.evening';
}

/** Gradient welcome banner with a time-of-day greeting and an illustration. */
export function DashboardHero({ subtitleId, actions }: DashboardHeroProps) {
  const { $t } = useIntl();
  const { profile } = useAuth();
  const firstName = profile?.full_name.split(' ')[0] || profile?.email;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Box
        className="tw-relative tw-grid tw-items-center tw-gap-6 tw-overflow-hidden tw-rounded-3xl tw-p-6 tw-text-white sm:tw-p-10 md:tw-grid-cols-[1fr_auto]"
        sx={(theme) => ({ background: brandGradient(theme) })}
      >
        <Box aria-hidden className="tw-absolute -tw-end-16 -tw-top-24 tw-h-64 tw-w-64 tw-rounded-full tw-bg-white/10" />
        <Box
          aria-hidden
          className="tw-absolute -tw-bottom-20 tw-start-1/3 tw-h-48 tw-w-48 tw-rounded-full tw-bg-white/10"
        />

        <Box className="tw-relative">
          <Typography variant="h2" className="tw-mb-2">
            {$t({ id: greetingId() }, { name: firstName })}
          </Typography>
          <Typography className="tw-mb-6 tw-max-w-lg tw-text-white/85">{$t({ id: subtitleId })}</Typography>
          {actions && <Box className="tw-flex tw-flex-wrap tw-gap-3">{actions}</Box>}
        </Box>

        <HiringIllustration className="tw-relative tw-hidden tw-w-72 md:tw-block lg:tw-w-80" />
      </Box>
    </motion.div>
  );
}
