import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { MdAttachFile, MdLanguage, MdPlace, MdVisibility, MdWorkHistory } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { brandGradient } from '@/styles/themes/accents';
import type { Profile } from '@/types/auth.types';

const PREVIEW_SKILLS_LIMIT = 8;

type ProfilePreviewCardProps = {
  profile: Profile;
};

/** The saved profile as a recruiter would see it next to an application. */
export function ProfilePreviewCard({ profile }: ProfilePreviewCardProps) {
  const { $t } = useIntl();
  const skills = profile.skills ?? [];
  const links = [
    { url: profile.linkedin_url, labelId: 'profile.field.linkedin', icon: <FaLinkedin /> },
    { url: profile.github_url, labelId: 'profile.field.github', icon: <FaGithub /> },
    { url: profile.portfolio_url, labelId: 'profile.field.portfolio', icon: <MdLanguage /> },
  ].filter((link) => link.url);

  return (
    <Card className="tw-overflow-hidden">
      <Box className="tw-relative tw-h-20" sx={(theme) => ({ background: brandGradient(theme) })}>
        <Chip
          size="small"
          icon={<MdVisibility />}
          label={$t({ id: 'profile.preview.title' })}
          className="tw-absolute tw-end-3 tw-top-3"
          sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff', '& .MuiChip-icon': { color: '#fff' } }}
        />
      </Box>
      <CardContent className="-tw-mt-12 tw-flex tw-flex-col tw-gap-3">
        <Avatar
          src={profile.avatar_url ?? undefined}
          sx={{
            width: 80,
            height: 80,
            fontSize: 30,
            fontWeight: 700,
            border: 4,
            borderColor: 'background.paper',
            bgcolor: 'primary.light',
            color: 'primary.main',
          }}
        >
          {(profile.full_name || profile.email).slice(0, 1).toUpperCase()}
        </Avatar>

        <Box>
          <Typography variant="h5" className="tw-break-words">
            {profile.full_name || profile.email}
          </Typography>
          <Typography color={profile.headline ? 'text.secondary' : 'text.disabled'}>
            {profile.headline || $t({ id: 'profile.preview.noHeadline' })}
          </Typography>
        </Box>

        {(profile.location || profile.years_of_experience != null) && (
          <Box className="tw-flex tw-flex-wrap tw-gap-x-4 tw-gap-y-1">
            {profile.location && (
              <Typography variant="body2" color="text.secondary" className="tw-flex tw-items-center tw-gap-1">
                <MdPlace /> {profile.location}
              </Typography>
            )}
            {profile.years_of_experience != null && (
              <Typography variant="body2" color="text.secondary" className="tw-flex tw-items-center tw-gap-1">
                <MdWorkHistory />
                {$t({ id: 'profile.preview.experience' }, { years: profile.years_of_experience })}
              </Typography>
            )}
          </Box>
        )}

        {profile.bio && (
          <Typography variant="body2" className="tw-line-clamp-3 tw-whitespace-pre-line">
            {profile.bio}
          </Typography>
        )}

        {skills.length > 0 && (
          <Box className="tw-flex tw-flex-wrap tw-gap-1.5">
            {skills.slice(0, PREVIEW_SKILLS_LIMIT).map((skill) => (
              <Chip key={skill} size="small" color="primary" variant="outlined" label={skill} />
            ))}
            {skills.length > PREVIEW_SKILLS_LIMIT && (
              <Chip size="small" label={`+${skills.length - PREVIEW_SKILLS_LIMIT}`} />
            )}
          </Box>
        )}

        <Box className="tw-flex tw-items-center tw-justify-between tw-gap-2">
          <Chip
            size="small"
            icon={<MdAttachFile />}
            color={profile.cv_path ? 'success' : 'default'}
            variant={profile.cv_path ? 'filled' : 'outlined'}
            label={$t({ id: profile.cv_path ? 'profile.preview.cvAttached' : 'profile.preview.noCv' })}
          />
          <Box className="tw-flex">
            {links.map((link) => (
              <Tooltip key={link.labelId} title={$t({ id: link.labelId })}>
                <IconButton
                  size="small"
                  component="a"
                  href={link.url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={$t({ id: link.labelId })}
                >
                  {link.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
