import Box from '@mui/material/Box';
import { alpha, darken, lighten, type Theme } from '@mui/material/styles';
import { useIntl } from 'react-intl';

import { ACCENT_COLORS } from '@/styles/themes/accents';
import type { JobStatus } from '@/types/job.types';

/** Tint, text and dot colours for each status, following the portal brand instead of stock MUI colours. */
function statusColors(theme: Theme, status: JobStatus) {
  const isDark = theme.palette.mode === 'dark';
  if (status === 'published') {
    const main = theme.palette.primary.main;
    return { bg: alpha(main, isDark ? 0.22 : 0.1), border: alpha(main, 0.3), text: main, dot: main };
  }
  if (status === 'draft') {
    const amber = ACCENT_COLORS.amber;
    return {
      bg: alpha(amber, isDark ? 0.2 : 0.14),
      border: alpha(amber, 0.35),
      text: isDark ? lighten(amber, 0.3) : darken(amber, 0.3),
      dot: amber,
    };
  }
  return {
    bg: theme.palette.action.selected,
    border: theme.palette.divider,
    text: theme.palette.text.secondary,
    dot: theme.palette.text.disabled,
  };
}

type JobStatusChipProps = {
  status: JobStatus;
  size?: 'small' | 'medium';
};

export function JobStatusChip({ status, size = 'small' }: JobStatusChipProps) {
  const { $t } = useIntl();
  const isMedium = size === 'medium';

  return (
    <Box
      component="span"
      className={`tw-inline-flex tw-shrink-0 tw-items-center tw-gap-1.5 tw-whitespace-nowrap tw-rounded-full tw-font-semibold ${
        isMedium ? 'tw-px-3 tw-py-1 tw-text-sm' : 'tw-px-2.5 tw-py-0.5 tw-text-xs'
      }`}
      sx={(theme) => {
        const colors = statusColors(theme, status);
        return { bgcolor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` };
      }}
    >
      <Box component="span" className="tw-relative tw-flex tw-h-2 tw-w-2">
        {/* A soft pulse signals the job is live and accepting applications. */}
        {status === 'published' && (
          <Box
            component="span"
            className="tw-absolute tw-inset-0 tw-animate-ping tw-rounded-full motion-reduce:tw-hidden"
            sx={(theme) => ({ bgcolor: statusColors(theme, status).dot, opacity: 0.6 })}
          />
        )}
        <Box
          component="span"
          className="tw-relative tw-h-2 tw-w-2 tw-rounded-full"
          sx={(theme) => ({ bgcolor: statusColors(theme, status).dot })}
        />
      </Box>
      {$t({ id: `jobs.status.${status}` })}
    </Box>
  );
}
