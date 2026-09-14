import Box from '@mui/material/Box';
import { motion } from 'framer-motion';
import { MdAccessTime, MdNotificationsActive, MdSearch } from 'react-icons/md';
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

const CHART_BARS = [38, 62, 48, 80, 66, 92];

/** Bars growing in turn, like a weekly hiring chart. */
export function AnalyticsPreview() {
  return (
    <Box className="flex h-full items-end gap-2 px-1">
      {CHART_BARS.map((height, index) => (
        <motion.div
          key={height}
          className="flex-1 rounded-t-md"
          style={{
            backgroundColor: index === CHART_BARS.length - 1 ? ACCENT_COLORS.emerald : ACCENT_COLORS.violet,
            opacity: 0.45 + index * 0.1,
          }}
          animate={{ height: ['12%', `${height}%`, `${height}%`, '12%'] }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            times: [0, 0.35, 0.8, 1],
            delay: index * 0.12,
            ease: 'easeOut',
          }}
        />
      ))}
    </Box>
  );
}

/** A bell with notifications sliding in beside it. */
export function NotificationsPreview() {
  return (
    <Box className="flex h-full items-center gap-3">
      <motion.div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
        style={{ backgroundColor: ACCENT_COLORS.pink }}
        animate={{ rotate: [0, -14, 12, -8, 0, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.1, 0.2, 0.3, 0.4, 1] }}
      >
        <MdNotificationsActive size={26} />
      </motion.div>
      <Box className="flex min-w-0 flex-1 flex-col gap-2">
        {[ACCENT_COLORS.emerald, ACCENT_COLORS.amber].map((color, index) => (
          <motion.div
            key={color}
            animate={{ opacity: [0, 0, 1, 1, 0], x: [16, 16, 0, 0, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.2 + index * 0.1, 0.35 + index * 0.1, 0.85, 1] }}
          >
            <Box
              className="flex items-center gap-2 rounded-lg p-1.5"
              sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
            >
              <Box className="h-3.5 w-3.5 shrink-0 rounded-full" sx={{ bgcolor: color }} />
              <Box className="h-1.5 flex-1 rounded-full" sx={lineSx} />
            </Box>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
}
