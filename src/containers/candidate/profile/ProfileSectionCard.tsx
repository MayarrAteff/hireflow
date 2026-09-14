import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import type { FormEventHandler, ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import type { AccentColor } from '@/styles/themes/accents';
import { type ProfileSection, profileSectionId } from '@/utils/profileCompleteness';

type ProfileSectionCardProps = {
  section: ProfileSection;
  icon: IconType;
  color: AccentColor;
  titleId: string;
  subtitleId: string;
  children: ReactNode;
  /** Sections with a form get a footer with a save button; upload sections save as they go. */
  form?: {
    onSubmit: FormEventHandler<HTMLFormElement>;
    isDirty: boolean;
    isPending: boolean;
    serverError?: string;
  };
};

export function ProfileSectionCard({
  section,
  icon,
  color,
  titleId,
  subtitleId,
  children,
  form,
}: ProfileSectionCardProps) {
  const { $t } = useIntl();

  return (
    <Card
      id={profileSectionId(section)}
      component={form ? 'form' : 'section'}
      noValidate={form ? true : undefined}
      onSubmit={form?.onSubmit}
      // Leave room for the sticky header when the checklist scrolls here.
      sx={{ scrollMarginTop: 96 }}
    >
      <Box className="tw-flex tw-items-center tw-gap-3 tw-px-5 tw-pt-5 sm:tw-px-6">
        <IconTile icon={icon} color={color} />
        <Box className="tw-min-w-0">
          <Typography variant="h5">{$t({ id: titleId })}</Typography>
          <Typography variant="body2" color="text.secondary">
            {$t({ id: subtitleId })}
          </Typography>
        </Box>
      </Box>

      <CardContent className="tw-p-5 sm:tw-p-6">
        {form?.serverError && (
          <Alert severity="error" className="tw-mb-4">
            {form.serverError}
          </Alert>
        )}
        {children}
      </CardContent>

      {form && (
        <>
          <Divider />
          <Box className="tw-flex tw-items-center tw-justify-end tw-gap-3 tw-px-5 tw-py-3 sm:tw-px-6">
            {form.isDirty && (
              <Typography variant="body2" color="text.secondary">
                {$t({ id: 'profile.unsaved' })}
              </Typography>
            )}
            <Button type="submit" variant="contained" disabled={!form.isDirty} loading={form.isPending}>
              {$t({ id: 'profile.save' })}
            </Button>
          </Box>
        </>
      )}
    </Card>
  );
}
