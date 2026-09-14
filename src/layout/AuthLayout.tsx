import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { MdCalendarMonth, MdNotificationsActive, MdViewKanban } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { LanguageSwitcher } from '@/components/UI/LanguageSwitcher';
import { ThemeModeToggle } from '@/components/UI/ThemeModeToggle';
import { isSupabaseConfigured } from '@/network/supabase';
import type { ChildProp } from '@/types/general.types';

const highlights = [
  { icon: MdViewKanban, id: 'dashboard.recruiter.next.board' },
  { icon: MdCalendarMonth, id: 'dashboard.recruiter.next.interviews' },
  { icon: MdNotificationsActive, id: 'dashboard.candidate.next.track' },
];

export function AuthLayout({ children }: Readonly<ChildProp>) {
  const { $t } = useIntl();

  return (
    <Box className="tw-grid tw-min-h-screen lg:tw-grid-cols-2" sx={{ bgcolor: 'background.default' }}>
      <Box
        className="tw-hidden tw-flex-col tw-justify-between tw-p-12 tw-text-white lg:tw-flex"
        sx={{ background: 'linear-gradient(135deg, #4338CA 0%, #4F46E5 45%, #0EA5E9 100%)' }}
      >
        <Box className="tw-flex tw-items-center tw-gap-3">
          <img src="/logo.svg" alt="" className="tw-h-10 tw-w-10 tw-rounded-xl tw-ring-2 tw-ring-white/30" />
          <Typography variant="h4" component="span">
            {$t({ id: 'app.name' })}
          </Typography>
        </Box>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Typography variant="h1" className="tw-mb-4 tw-max-w-lg">
            {$t({ id: 'app.tagline' })}
          </Typography>
          <Typography className="tw-mb-10 tw-max-w-lg tw-text-white/80">{$t({ id: 'app.subtitle' })}</Typography>
          <Box className="tw-flex tw-flex-col tw-gap-4">
            {highlights.map(({ icon: Icon, id }) => (
              <Box key={id} className="tw-flex tw-items-center tw-gap-3">
                <Box className="tw-flex tw-h-10 tw-w-10 tw-items-center tw-justify-center tw-rounded-xl tw-bg-white/15">
                  <Icon size={22} />
                </Box>
                <Typography>{$t({ id })}</Typography>
              </Box>
            ))}
          </Box>
        </motion.div>

        <Typography variant="body2" className="tw-text-white/60">
          © {new Date().getFullYear()} {$t({ id: 'app.name' })}
        </Typography>
      </Box>

      <Box className="tw-flex tw-flex-col tw-p-6">
        <Box className="tw-flex tw-justify-end tw-gap-1">
          <LanguageSwitcher />
          <ThemeModeToggle />
        </Box>
        <Box className="tw-flex tw-flex-1 tw-items-center tw-justify-center">
          <motion.div
            className="tw-w-full tw-max-w-md"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {!isSupabaseConfigured && (
              <Alert severity="warning" className="tw-mb-6">
                {$t({ id: 'config.missingEnv' })}
              </Alert>
            )}
            {children}
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}
