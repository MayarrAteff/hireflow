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

type FormSectionCardProps = {
  /** DOM id, so checklists can scroll to the section. */
  id?: string;
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

/** A titled settings card; with `form` it becomes a form with a save footer. */
export function FormSectionCard({ id, icon, color, titleId, subtitleId, children, form }: FormSectionCardProps) {
  const { $t } = useIntl();

  return (
    <Card
      id={id}
      component={form ? 'form' : 'section'}
      noValidate={form ? true : undefined}
      onSubmit={form?.onSubmit}
      // Leave room for the sticky header when the checklist scrolls here.
      sx={{ scrollMarginTop: 96 }}
    >
      <Box className="flex items-center gap-3 px-5 pt-5 sm:px-6">
        <IconTile icon={icon} color={color} />
        <Box className="min-w-0">
          <Typography variant="h5">{$t({ id: titleId })}</Typography>
          <Typography variant="body2" color="text.secondary">
            {$t({ id: subtitleId })}
          </Typography>
        </Box>
      </Box>

      <CardContent className="p-5 sm:p-6">
        {form?.serverError && (
          <Alert severity="error" className="mb-4">
            {form.serverError}
          </Alert>
        )}
        {children}
      </CardContent>

      {form && (
        <>
          <Divider />
          <Box className="flex items-center justify-end gap-3 px-5 py-3 sm:px-6">
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
