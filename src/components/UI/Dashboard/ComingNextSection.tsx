import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { MdAutoAwesome } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import { ACCENT_COLORS, type AccentColor } from '@/styles/themes/accents';

import { TipCard } from './TipCard';

export type UpcomingFeature = {
  icon: IconType;
  color: AccentColor;
  titleId: string;
  bodyId: string;
  preview: ReactNode;
};

function UpcomingFeatureCard({ icon, color, titleId, bodyId, preview }: UpcomingFeature) {
  const { $t } = useIntl();

  return (
    <Card className="h-full transition-transform hover:-translate-y-1">
      <Box
        aria-hidden
        className="h-32 p-4"
        sx={(theme) => ({
          background: `linear-gradient(135deg, ${alpha(ACCENT_COLORS[color], theme.palette.mode === 'dark' ? 0.22 : 0.16)} 0%, ${alpha(ACCENT_COLORS[color], 0.04)} 100%)`,
        })}
      >
        {preview}
      </Box>
      <CardContent className="flex gap-3">
        <IconTile icon={icon} color={color} size="sm" />
        <Box className="min-w-0">
          <Typography fontWeight={700}>{$t({ id: titleId })}</Typography>
          <Typography variant="body2" color="text.secondary">
            {$t({ id: bodyId })}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

const appear = (index: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.5 + index * 0.08 },
});

type ComingNextSectionProps = {
  subtitleId: string;
  features: UpcomingFeature[];
  /** Tip ids rotated daily in the card next to the features. */
  tipIds: string[];
};

/** Showcase of upcoming features with animated previews, shared by the portal dashboards. */
export function ComingNextSection({ subtitleId, features, tipIds }: ComingNextSectionProps) {
  const { $t } = useIntl();

  return (
    <Box
      component="section"
      className="relative overflow-hidden rounded-3xl p-5 sm:p-7"
      sx={(theme) => ({
        border: `1px solid ${theme.palette.divider}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
      })}
    >
      <Box
        aria-hidden
        className="absolute -end-10 -top-10 h-40 w-40 rounded-full blur-2xl"
        sx={(theme) => ({ bgcolor: alpha(theme.palette.secondary.main, 0.2) })}
      />

      <Box className="relative mb-5 flex flex-wrap items-center gap-3">
        <IconTile icon={MdAutoAwesome} />
        <Box className="min-w-0 flex-1">
          <Typography variant="h4">{$t({ id: 'dashboard.section.upNext' })}</Typography>
          <Typography variant="body2" color="text.secondary">
            {$t({ id: subtitleId })}
          </Typography>
        </Box>
        <Box
          className="flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold"
          sx={{ bgcolor: 'background.paper', color: 'primary.main', boxShadow: 1 }}
        >
          <Box className="relative flex h-2.5 w-2.5">
            <Box
              className="absolute inset-0 animate-ping rounded-full"
              sx={{ bgcolor: 'secondary.main', opacity: 0.6 }}
            />
            <Box className="relative h-2.5 w-2.5 rounded-full" sx={{ bgcolor: 'secondary.main' }} />
          </Box>
          {$t({ id: 'dashboard.comingSoon' })}
        </Box>
      </Box>

      <Box className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <motion.div key={feature.titleId} {...appear(index)}>
            <UpcomingFeatureCard {...feature} />
          </motion.div>
        ))}
        <motion.div className="sm:col-span-2 lg:col-span-1" {...appear(features.length)}>
          <TipCard tipIds={tipIds} />
        </motion.div>
      </Box>
    </Box>
  );
}
