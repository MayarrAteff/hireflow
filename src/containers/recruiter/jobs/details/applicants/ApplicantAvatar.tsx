import Avatar, { type AvatarProps } from '@mui/material/Avatar';

import { accentFor, accentSoftSx } from '@/styles/themes/accents';
import type { ApplicantProfile } from '@/types/application.types';

type ApplicantAvatarProps = Omit<AvatarProps, 'src' | 'children'> & {
  candidate: Pick<ApplicantProfile, 'full_name' | 'email' | 'avatar_url'>;
  size?: number;
};

export function ApplicantAvatar({ candidate, size = 40, sx, ...rest }: ApplicantAvatarProps) {
  const name = candidate.full_name || candidate.email;

  return (
    <Avatar
      src={candidate.avatar_url ?? undefined}
      alt={name}
      {...rest}
      sx={[
        (theme) => ({ ...accentSoftSx(theme, accentFor(name)), width: size, height: size, fontWeight: 700 }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {name.slice(0, 1).toUpperCase()}
    </Avatar>
  );
}
