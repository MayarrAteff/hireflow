import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useIntl } from 'react-intl';

import { ACCENT_COLORS } from '@/styles/themes/accents';

/** Green for a strong match, amber for partial, rose for little overlap. */
export function matchColor(percent: number) {
  if (percent >= 70) return ACCENT_COLORS.emerald;
  if (percent >= 40) return ACCENT_COLORS.amber;
  return ACCENT_COLORS.rose;
}

export function SkillMatchBar({ percent }: { percent: number }) {
  const { $t, formatNumber } = useIntl();
  const color = matchColor(percent);

  return (
    <Box
      className="tw-flex tw-min-w-0 tw-items-center tw-gap-2"
      aria-label={$t({ id: 'applicants.match' }, { percent })}
    >
      <Box className="tw-h-1.5 tw-flex-1 tw-overflow-hidden tw-rounded-full" sx={{ bgcolor: alpha(color, 0.16) }}>
        <Box className="tw-h-full tw-rounded-full" sx={{ width: `${percent}%`, bgcolor: color }} />
      </Box>
      <Typography variant="caption" fontWeight={700} sx={{ color }} className="tw-w-9 tw-text-end">
        {formatNumber(percent / 100, { style: 'percent' })}
      </Typography>
    </Box>
  );
}
