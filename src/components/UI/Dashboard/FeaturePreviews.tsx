import Box from '@mui/material/Box';
import { motion } from 'framer-motion';
import { MdAccessTime, MdSearch } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { ACCENT_COLORS, type AccentColor } from '@/styles/themes/accents';

/** Small animated mock-ups for the "What's coming next" feature cards. */

const lineSx = { bgcolor: 'text.primary', opacity: 0.15 };

const CALENDAR_DAYS = 14;
const BOOKED_DAYS: Partial<Record<number, AccentColor>> = { 2: 'rose', 5: 'violet', 9: 'amber', 11: 'rose' };
const PULSING_DAY = 9;

/** Two weeks of days with a few booked interviews and a floating time slot. */
export function CalendarPreview() {
  const { formatTime } = useIntl();

  return (
    <Box className="relative h-full">
      <Box className="grid grid-cols-7 gap-1">
        {Array.from({ length: CALENDAR_DAYS }, (_, day) => {
          const booked = BOOKED_DAYS[day];
          return (
            <Box
              key={day}
              className="relative aspect-square rounded-md"
              sx={{ bgcolor: booked ? ACCENT_COLORS[booked] : 'background.paper', opacity: booked ? 1 : 0.8 }}
            >
              {day === PULSING_DAY && (
                <Box
                  className="absolute inset-0 animate-ping rounded-md"
                  sx={{ bgcolor: ACCENT_COLORS[booked ?? 'amber'], opacity: 0.5 }}
                />
              )}
            </Box>
          );
        })}
      </Box>
      <motion.div
        className="absolute -bottom-1 end-1"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Box
          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
          sx={{ bgcolor: 'background.paper', color: ACCENT_COLORS.rose, boxShadow: 3 }}
        >
          <MdAccessTime size={14} />
          {formatTime(new Date(2026, 0, 1, 10, 0), { hour: 'numeric', minute: '2-digit' })}
        </Box>
      </motion.div>
    </Box>
  );
}

/** A search bar with results sliding in underneath. */
export function SearchPreview() {
  return (
    <Box className="flex h-full flex-col gap-2">
      <Box
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5"
        sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
      >
        <MdSearch size={14} color={ACCENT_COLORS.sky} />
        <motion.div
          className="h-1.5 rounded-full"
          style={{ backgroundColor: ACCENT_COLORS.sky, opacity: 0.5 }}
          animate={{ width: ['0%', '45%', '45%'] }}
          transition={{ duration: 3, repeat: Infinity, times: [0, 0.35, 1] }}
        />
      </Box>
      {[ACCENT_COLORS.amber, ACCENT_COLORS.pink].map((color, index) => (
        <motion.div
          key={color}
          animate={{ opacity: [0, 0, 1, 1], x: [12, 12, 0, 0] }}
          transition={{ duration: 3, repeat: Infinity, times: [0, 0.4 + index * 0.1, 0.55 + index * 0.1, 1] }}
        >
          <Box
            className="flex w-full items-center gap-2 rounded-lg p-1.5"
            sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
          >
            <Box className="h-4 w-4 shrink-0 rounded" sx={{ bgcolor: color }} />
            <Box className="h-1.5 flex-1 rounded-full" sx={lineSx} />
            <Box className="h-3.5 w-8 rounded-full" sx={{ bgcolor: ACCENT_COLORS.sky }} />
          </Box>
        </motion.div>
      ))}
    </Box>
  );
}
