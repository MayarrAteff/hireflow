import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useId } from 'react';
import type { IconType } from 'react-icons';
import { MdLock } from 'react-icons/md';
import { useIntl } from 'react-intl';

type ReadOnlyFieldProps = {
  labelId: string;
  value: string;
  icon: IconType;
  /** Short label on the lock badge, e.g. why it can't be edited. */
  badgeId: string;
  hintId?: string;
};

/**
 * A value the user can see but not change, styled as an info tile rather than a disabled input
 * so it isn't mistaken for an empty field's placeholder.
 */
export function ReadOnlyField({ labelId, value, icon: Icon, badgeId, hintId }: ReadOnlyFieldProps) {
  const { $t } = useIntl();
  const hintElementId = useId();

  return (
    <Box>
      <Box
        role="group"
        aria-describedby={hintId ? hintElementId : undefined}
        className="flex min-h-14 items-center gap-3 rounded-xl px-3.5 py-2"
        sx={(theme) => ({
          bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.06),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        })}
      >
        <Box
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          sx={{ bgcolor: 'primary.light', color: 'primary.main' }}
        >
          <Icon size={18} />
        </Box>
        <Box className="min-w-0 flex-1">
          <Typography
            variant="caption"
            color="text.secondary"
            component="p"
            className="flex items-center gap-1.5 leading-tight"
          >
            {$t({ id: labelId })}
            <Box
              component="span"
              className="inline-flex items-center gap-0.5 rounded-full px-1.5"
              sx={{ bgcolor: 'background.paper', color: 'text.secondary' }}
            >
              <MdLock size={11} />
              {$t({ id: badgeId })}
            </Box>
          </Typography>
          <Typography fontWeight={600} noWrap title={value}>
            {value}
          </Typography>
        </Box>
      </Box>
      {hintId && (
        <FormHelperText id={hintElementId} className="mx-3.5">
          {$t({ id: hintId })}
        </FormHelperText>
      )}
    </Box>
  );
}
