import Avatar, { type AvatarProps } from '@mui/material/Avatar';

import { accentFor, accentSoftSx } from '@/styles/themes/accents';

type CompanyLogoProps = Omit<AvatarProps, 'src' | 'children' | 'variant'> & {
  name: string;
  logoUrl?: string | null;
  size?: number;
};

/** The company's uploaded logo, or its initial on a stable accent colour when it has none. */
export function CompanyLogo({ name, logoUrl, size = 48, sx, ...rest }: CompanyLogoProps) {
  return (
    <Avatar
      variant="rounded"
      src={logoUrl ?? undefined}
      alt={name}
      {...rest}
      sx={[
        (theme) => ({
          ...accentSoftSx(theme, accentFor(name)),
          width: size,
          height: size,
          fontSize: size * 0.42,
          fontWeight: 700,
          borderRadius: `${Math.round(size * 0.26)}px`,
          ...(logoUrl && { bgcolor: '#fff' }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {name.slice(0, 1).toUpperCase()}
    </Avatar>
  );
}
