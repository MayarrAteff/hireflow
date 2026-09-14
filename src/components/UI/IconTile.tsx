import Box from '@mui/material/Box';
import type { IconType } from 'react-icons';

import { type AccentColor, accentSoftSx } from '@/styles/themes/accents';

const sizes = {
  sm: { box: 'tw-h-9 tw-w-9 tw-rounded-lg', icon: 18 },
  md: { box: 'tw-h-11 tw-w-11 tw-rounded-xl', icon: 22 },
  lg: { box: 'tw-h-14 tw-w-14 tw-rounded-2xl', icon: 28 },
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
      className={`tw-flex tw-shrink-0 tw-items-center tw-justify-center ${box}`}
      sx={(theme) =>
        color === 'primary' ? { bgcolor: 'primary.light', color: 'primary.main' } : accentSoftSx(theme, color)
      }
    >
      <Icon size={icon} />
    </Box>
  );
}
