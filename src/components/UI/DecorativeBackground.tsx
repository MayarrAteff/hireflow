import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

import { ACCENT_COLORS } from '@/styles/themes/accents';

/** Soft, blurred colour blobs behind the app content. Purely decorative. */
export function DecorativeBackground() {
  return (
    <Box aria-hidden className="tw-pointer-events-none tw-fixed tw-inset-0 tw-overflow-hidden" sx={{ zIndex: 0 }}>
      <Box
        className="tw-absolute tw-rounded-full tw-blur-3xl"
        sx={(theme) => ({
          width: 560,
          height: 560,
          top: -220,
          insetInlineEnd: -140,
          bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.16),
        })}
      />
      <Box
        className="tw-absolute tw-rounded-full tw-blur-3xl"
        sx={(theme) => ({
          width: 480,
          height: 480,
          bottom: -240,
          insetInlineStart: '25%',
          bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.14 : 0.1),
        })}
      />
      <Box
        className="tw-absolute tw-rounded-full tw-blur-3xl"
        sx={{ width: 280, height: 280, top: '38%', insetInlineEnd: '12%', bgcolor: alpha(ACCENT_COLORS.amber, 0.08) }}
      />
    </Box>
  );
}
