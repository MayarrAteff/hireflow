import Box from '@mui/material/Box';
import { motion } from 'framer-motion';
import { MdCheck, MdSearch } from 'react-icons/md';

import { ACCENT_COLORS } from '@/styles/themes/accents';

const lineSx = { bgcolor: 'text.primary', opacity: 0.15 };

/** A CV page filling an upload bar, then ticked off. */
export function CvPreview() {
  return (
    <Box className="tw-flex tw-h-full tw-items-center tw-gap-4">
      <Box
        className="tw-relative tw-flex tw-h-full tw-w-16 tw-shrink-0 tw-flex-col tw-gap-1.5 tw-rounded-lg tw-p-2"
        sx={{ bgcolor: 'background.paper', boxShadow: 2 }}
      >
        <Box className="tw-mb-1 tw-h-4 tw-w-4 tw-rounded-full" sx={{ bgcolor: ACCENT_COLORS.violet }} />
        {[100, 80, 90, 60, 75].map((width) => (
          <Box key={width} className="tw-h-1 tw-rounded-full" sx={{ ...lineSx, width: `${width}%` }} />
        ))}
        <motion.div
          className="tw-absolute -tw-end-2 -tw-top-2 tw-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-full tw-text-white"
          style={{ backgroundColor: ACCENT_COLORS.emerald }}
          animate={{ scale: [0, 0, 1.15, 1, 1] }}
          transition={{ duration: 3, repeat: Infinity, times: [0, 0.55, 0.65, 0.72, 1] }}
        >
          <MdCheck size={14} />
        </motion.div>
      </Box>
      <Box className="tw-flex tw-min-w-0 tw-flex-1 tw-flex-col tw-gap-2">
        <Box className="tw-h-2 tw-w-3/4 tw-rounded-full" sx={lineSx} />
        <Box className="tw-h-2 tw-w-1/2 tw-rounded-full" sx={lineSx} />
        <Box className="tw-mt-1 tw-h-2.5 tw-overflow-hidden tw-rounded-full" sx={{ bgcolor: 'background.paper' }}>
          <motion.div
            className="tw-h-full tw-rounded-full"
            style={{ background: `linear-gradient(90deg, ${ACCENT_COLORS.violet}, ${ACCENT_COLORS.emerald})` }}
            animate={{ width: ['0%', '100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, times: [0, 0.55, 1], ease: 'easeInOut' }}
          />
        </Box>
      </Box>
    </Box>
  );
}

/** A search bar with results sliding in underneath. */
export function SearchPreview() {
  return (
    <Box className="tw-flex tw-h-full tw-flex-col tw-gap-2">
      <Box
        className="tw-flex tw-items-center tw-gap-1.5 tw-rounded-full tw-px-2.5 tw-py-1.5"
        sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
      >
        <MdSearch size={14} color={ACCENT_COLORS.sky} />
        <motion.div
          className="tw-h-1.5 tw-rounded-full"
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
            className="tw-flex tw-w-full tw-items-center tw-gap-2 tw-rounded-lg tw-p-1.5"
            sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
          >
            <Box className="tw-h-4 tw-w-4 tw-shrink-0 tw-rounded" sx={{ bgcolor: color }} />
            <Box className="tw-h-1.5 tw-flex-1 tw-rounded-full" sx={lineSx} />
            <Box className="tw-h-3.5 tw-w-8 tw-rounded-full" sx={{ bgcolor: ACCENT_COLORS.sky }} />
          </Box>
        </motion.div>
      ))}
    </Box>
  );
}
