import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { MdCalendarMonth, MdNotificationsActive } from 'react-icons/md';
import { PiKanbanDuotone } from 'react-icons/pi';
import { useIntl } from 'react-intl';

import { LanguageSwitcher } from '@/components/UI/LanguageSwitcher';
import { ThemeModeToggle } from '@/components/UI/ThemeModeToggle';
import { isSupabaseConfigured } from '@/network/supabase';
import { brandGradient } from '@/styles/themes/accents';
import type { ChildProp } from '@/types/general.types';

const highlights = [
  { icon: PiKanbanDuotone, id: 'dashboard.recruiter.next.board' },
  { icon: MdCalendarMonth, id: 'dashboard.recruiter.next.interviews' },
  { icon: MdNotificationsActive, id: 'dashboard.candidate.next.track' },
];

export function AuthLayout({ children }: Readonly<ChildProp>) {
  const { $t } = useIntl();

  return (
    <Box className="grid min-h-screen lg:grid-cols-2" sx={{ bgcolor: 'background.default' }}>
      <Box
        className="hidden flex-col justify-between p-12 text-white lg:flex"
        sx={(theme) => ({ background: brandGradient(theme) })}
      >
        <Box className="flex items-center gap-3">
          <img src="/logo.svg" alt="" className="h-10 w-10 rounded-xl ring-2 ring-white/30" />
          <Typography variant="h4" component="span">
            {$t({ id: 'app.name' })}
          </Typography>
        </Box>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Typography variant="h1" className="mb-4 max-w-lg">
            {$t({ id: 'app.tagline' })}
          </Typography>
          <Typography className="mb-10 max-w-lg text-white/80">{$t({ id: 'app.subtitle' })}</Typography>
          <Box className="flex flex-col gap-4">
            {highlights.map(({ icon: Icon, id }) => (
              <Box key={id} className="flex items-center gap-3">
                <Box className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                  <Icon size={22} />
                </Box>
                <Typography>{$t({ id })}</Typography>
              </Box>
            ))}
          </Box>
        </motion.div>

        <Typography variant="body2" className="text-white/60">
          © {new Date().getFullYear()} {$t({ id: 'app.name' })}
        </Typography>
      </Box>

      <Box className="flex flex-col p-6">
        <Box className="flex justify-end gap-1">
          <LanguageSwitcher />
          <ThemeModeToggle />
        </Box>
        <Box className="flex flex-1 items-center justify-center">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {!isSupabaseConfigured && (
              <Alert severity="warning" className="mb-6">
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
