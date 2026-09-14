import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { MdAccessTime } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { ACCENT_COLORS, type AccentColor } from '@/styles/themes/accents';

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
export function BoardPreview() {
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
export function CalendarPreview() {
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
