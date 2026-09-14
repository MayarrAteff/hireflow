import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { MdAccessTime, MdAutoAwesome, MdCalendarMonth, MdViewKanban } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import { ACCENT_COLORS, type AccentColor } from '@/styles/themes/accents';

import { TipCard } from './TipCard';

const BOARD_COLUMNS: AccentColor[] = ['sky', 'amber', 'emerald'];
const CALENDAR_DAYS = 14;
const BOOKED_DAYS: Partial<Record<number, AccentColor>> = { 2: 'rose', 5: 'violet', 9: 'amber', 11: 'rose' };
const PULSING_DAY = 9;

function MockCandidate({ color }: { color: AccentColor }) {
  return (
    <Box
      className="tw-flex tw-items-center tw-gap-1.5 tw-rounded-md tw-p-1.5"
      sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
    >
      <Box className="tw-h-3.5 tw-w-3.5 tw-shrink-0 tw-rounded-full" sx={{ bgcolor: ACCENT_COLORS[color] }} />
      <Box className="tw-h-1.5 tw-flex-1 tw-rounded-full" sx={{ bgcolor: 'text.primary', opacity: 0.15 }} />
    </Box>
  );
}

/** Three pipeline columns with a candidate card sliding from the first stage to the second. */
function BoardPreview() {
  const { direction } = useTheme();

  return (
    <Box className="tw-relative tw-grid tw-h-full tw-grid-cols-3">
      {BOARD_COLUMNS.map((color, column) => (
        <Box key={color} className="tw-flex tw-flex-col tw-gap-1.5 tw-px-1">
          <Box className="tw-h-1.5 tw-rounded-full" sx={{ bgcolor: ACCENT_COLORS[color] }} />
          {/* The top slot of the first two columns stays free for the card sliding between them. */}
          {column < 2 && <Box className="tw-h-[26px] tw-shrink-0" />}
          {Array.from({ length: column < 2 ? 1 : 2 }, (_, index) => (
            <MockCandidate key={index} color={BOARD_COLUMNS[(column + index + 1) % BOARD_COLUMNS.length]} />
          ))}
        </Box>
      ))}
      <motion.div
        className="tw-absolute tw-start-0 tw-top-3 tw-w-1/3 tw-px-1"
        animate={{ x: ['0%', direction === 'rtl' ? '-100%' : '100%'], rotate: [0, 3, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, repeatType: 'reverse', repeatDelay: 1.2, ease: 'easeInOut' }}
      >
        <MockCandidate color="pink" />
      </motion.div>
    </Box>
  );
}

/** Two weeks of days with a few booked interviews and a floating time slot. */
function CalendarPreview() {
  const { formatTime } = useIntl();

  return (
    <Box className="tw-relative tw-h-full">
      <Box className="tw-grid tw-grid-cols-7 tw-gap-1">
        {Array.from({ length: CALENDAR_DAYS }, (_, day) => {
          const booked = BOOKED_DAYS[day];
          return (
            <Box
              key={day}
              className="tw-relative tw-aspect-square tw-rounded-md"
              sx={{ bgcolor: booked ? ACCENT_COLORS[booked] : 'background.paper', opacity: booked ? 1 : 0.8 }}
            >
              {day === PULSING_DAY && (
                <Box
                  className="tw-absolute tw-inset-0 tw-animate-ping tw-rounded-md"
                  sx={{ bgcolor: ACCENT_COLORS[booked ?? 'amber'], opacity: 0.5 }}
                />
              )}
            </Box>
          );
        })}
      </Box>
      <motion.div
        className="tw-absolute -tw-bottom-1 tw-end-1"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Box
          className="tw-flex tw-items-center tw-gap-1 tw-rounded-full tw-px-2.5 tw-py-1 tw-text-xs tw-font-semibold"
          sx={{ bgcolor: 'background.paper', color: ACCENT_COLORS.rose, boxShadow: 3 }}
        >
          <MdAccessTime size={14} />
          {formatTime(new Date(2026, 0, 1, 10, 0), { hour: 'numeric', minute: '2-digit' })}
        </Box>
      </motion.div>
    </Box>
  );
}

type UpcomingFeatureProps = {
  icon: IconType;
  color: AccentColor;
  titleId: string;
  bodyId: string;
  preview: ReactNode;
};

function UpcomingFeature({ icon, color, titleId, bodyId, preview }: UpcomingFeatureProps) {
  const { $t } = useIntl();

  return (
    <Card className="tw-h-full tw-transition-transform hover:-tw-translate-y-1">
      <Box
        aria-hidden
        className="tw-h-32 tw-p-4"
        sx={(theme) => ({
          background: `linear-gradient(135deg, ${alpha(ACCENT_COLORS[color], theme.palette.mode === 'dark' ? 0.22 : 0.16)} 0%, ${alpha(ACCENT_COLORS[color], 0.04)} 100%)`,
        })}
      >
        {preview}
      </Box>
      <CardContent className="tw-flex tw-gap-3">
        <IconTile icon={icon} color={color} size="sm" />
        <Box className="tw-min-w-0">
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

export function ComingNextSection() {
  const { $t } = useIntl();

  return (
    <Box
      component="section"
      className="tw-relative tw-overflow-hidden tw-rounded-3xl tw-p-5 sm:tw-p-7"
      sx={(theme) => ({
        border: `1px solid ${theme.palette.divider}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
      })}
    >
      <Box
        aria-hidden
        className="tw-absolute -tw-end-10 -tw-top-10 tw-h-40 tw-w-40 tw-rounded-full tw-blur-2xl"
        sx={(theme) => ({ bgcolor: alpha(theme.palette.secondary.main, 0.2) })}
      />

      <Box className="tw-relative tw-mb-5 tw-flex tw-flex-wrap tw-items-center tw-gap-3">
        <IconTile icon={MdAutoAwesome} />
        <Box className="tw-min-w-0 tw-flex-1">
          <Typography variant="h4">{$t({ id: 'dashboard.section.upNext' })}</Typography>
          <Typography variant="body2" color="text.secondary">
            {$t({ id: 'dashboard.upNext.subtitle' })}
          </Typography>
        </Box>
        <Box
          className="tw-flex tw-items-center tw-gap-2 tw-rounded-full tw-px-3 tw-py-1 tw-text-sm tw-font-semibold"
          sx={{ bgcolor: 'background.paper', color: 'primary.main', boxShadow: 1 }}
        >
          <Box className="tw-relative tw-flex tw-h-2.5 tw-w-2.5">
            <Box
              className="tw-absolute tw-inset-0 tw-animate-ping tw-rounded-full"
              sx={{ bgcolor: 'secondary.main', opacity: 0.6 }}
            />
            <Box className="tw-relative tw-h-2.5 tw-w-2.5 tw-rounded-full" sx={{ bgcolor: 'secondary.main' }} />
          </Box>
          {$t({ id: 'dashboard.comingSoon' })}
        </Box>
      </Box>

      <Box className="tw-relative tw-grid tw-gap-4 sm:tw-grid-cols-2 lg:tw-grid-cols-3">
        <motion.div {...appear(0)}>
          <UpcomingFeature
            icon={MdViewKanban}
            color="sky"
            titleId="dashboard.upNext.board.title"
            bodyId="dashboard.upNext.board.body"
            preview={<BoardPreview />}
          />
        </motion.div>
        <motion.div {...appear(1)}>
          <UpcomingFeature
            icon={MdCalendarMonth}
            color="rose"
            titleId="dashboard.upNext.interviews.title"
            bodyId="dashboard.upNext.interviews.body"
            preview={<CalendarPreview />}
          />
        </motion.div>
        <motion.div className="sm:tw-col-span-2 lg:tw-col-span-1" {...appear(2)}>
          <TipCard />
        </motion.div>
      </Box>
    </Box>
  );
}
