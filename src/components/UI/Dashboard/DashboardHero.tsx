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
        className="relative grid items-center gap-6 overflow-hidden rounded-3xl p-6 text-white sm:p-10 md:grid-cols-[1fr_auto]"
        sx={(theme) => ({ background: brandGradient(theme) })}
      >
        <Box aria-hidden className="absolute -end-16 -top-24 h-64 w-64 rounded-full bg-white/10" />
        <Box
          aria-hidden
          className="absolute -bottom-20 start-1/3 h-48 w-48 rounded-full bg-white/10"
        />

        <Box className="relative">
          <Typography variant="h2" className="mb-2">
            {$t({ id: greetingId() }, { name: firstName })}
          </Typography>
          <Typography className="mb-6 max-w-lg text-white/85">{$t({ id: subtitleId })}</Typography>
          {actions && <Box className="flex flex-wrap gap-3">{actions}</Box>}
        </Box>

        <HiringIllustration className="relative hidden w-72 md:block lg:w-80" />
      </Box>
    </motion.div>
  );
}
