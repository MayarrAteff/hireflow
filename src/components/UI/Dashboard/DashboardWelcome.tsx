import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';
import { useIntl } from 'react-intl';

import { useAuth } from '@/utils/hooks/useAuth';

export type NextStep = {
  icon: IconType;
  labelId: string;
};

type DashboardWelcomeProps = {
  subtitleId: string;
  nextSteps: NextStep[];
};

export function DashboardWelcome({ subtitleId, nextSteps }: DashboardWelcomeProps) {
  const { $t } = useIntl();
  const { profile } = useAuth();
  const firstName = profile?.full_name.split(' ')[0] || profile?.email;

  return (
    <Box className="tw-mx-auto tw-max-w-6xl">
      <Typography variant="h2" className="tw-mb-1">
        {$t({ id: 'dashboard.greeting' }, { name: firstName })}
      </Typography>
      <Typography color="text.secondary" className="tw-mb-8">
        {$t({ id: subtitleId })}
      </Typography>

      <Box className="tw-grid tw-gap-4 sm:tw-grid-cols-2 lg:tw-grid-cols-3">
        {nextSteps.map(({ icon: Icon, labelId }, index) => (
          <motion.div
            key={labelId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="tw-h-full">
              <CardContent className="tw-flex tw-flex-col tw-gap-3">
                <Box
                  className="tw-flex tw-h-11 tw-w-11 tw-items-center tw-justify-center tw-rounded-xl"
                  sx={{ bgcolor: 'primary.light', color: 'primary.main' }}
                >
                  <Icon size={22} />
                </Box>
                <Typography fontWeight={600}>{$t({ id: labelId })}</Typography>
                <Chip size="small" variant="outlined" label={$t({ id: 'dashboard.comingSoon' })} className="tw-w-fit" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
}
