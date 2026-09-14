import Box from '@mui/material/Box';
import type { IconType } from 'react-icons';

import { type AccentColor, accentSoftSx } from '@/styles/themes/accents';

const sizes = {
  sm: { box: 'h-9 w-9 rounded-lg', icon: 18 },
  md: { box: 'h-11 w-11 rounded-xl', icon: 22 },
  lg: { box: 'h-14 w-14 rounded-2xl', icon: 28 },
};

type IconTileProps = {
  icon: IconType;
  /** An accent colour, or `primary` to follow the portal brand. */
  color?: AccentColor | 'primary';
  size?: keyof typeof sizes;
};

export function IconTile({ icon: Icon, color = 'primary', size = 'md' }: IconTileProps) {
  const { box, icon } = sizes[size];

  return (
    <Box
      className={`flex shrink-0 items-center justify-center ${box}`}
      sx={(theme) =>
        color === 'primary' ? { bgcolor: 'primary.light', color: 'primary.main' } : accentSoftSx(theme, color)
      }
    >
      <Icon size={icon} />
    </Box>
  );
}
