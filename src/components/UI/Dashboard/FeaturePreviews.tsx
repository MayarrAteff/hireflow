import Box from '@mui/material/Box';
import { motion } from 'framer-motion';
import { MdAccessTime } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { ACCENT_COLORS, type AccentColor } from '@/styles/themes/accents';

/** Small animated mock-ups for the "What's coming next" feature cards. */

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
