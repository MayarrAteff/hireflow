import Box from '@mui/material/Box';
import { alpha, darken, lighten, type Theme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { useIntl } from 'react-intl';

import type { JobDisplayStatus } from '@/constants/jobs';
import { ACCENT_COLORS } from '@/styles/themes/accents';

/** Tint, text and dot colours for each status, following the portal brand instead of stock MUI colours. */
function statusColors(theme: Theme, status: JobDisplayStatus) {
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
  if (status === 'expired') {
    const rose = ACCENT_COLORS.rose;
    return {
      bg: alpha(rose, isDark ? 0.2 : 0.1),
      border: alpha(rose, 0.35),
      text: isDark ? lighten(rose, 0.3) : darken(rose, 0.2),
      dot: rose,
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
  /** Pass `getJobDisplayStatus(job)` so a published job past its deadline reads as Expired. */
  status: JobDisplayStatus;
  size?: 'small' | 'medium';
};

export function JobStatusChip({ status, size = 'small' }: JobStatusChipProps) {
  const { $t } = useIntl();
  const isMedium = size === 'medium';

  const chip = (
    <Box
      component="span"
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full font-semibold ${
        isMedium ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs'
      }`}
      sx={(theme) => {
        const colors = statusColors(theme, status);
        return { bgcolor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` };
      }}
    >
      <Box component="span" className="relative flex h-2 w-2">
        {/* A soft pulse signals the job is live and accepting applications. */}
        {status === 'published' && (
          <Box
            component="span"
            className="absolute inset-0 animate-ping rounded-full motion-reduce:hidden"
            sx={(theme) => ({ bgcolor: statusColors(theme, status).dot, opacity: 0.6 })}
          />
        )}
        <Box
          component="span"
          className="relative h-2 w-2 rounded-full"
          sx={(theme) => ({ bgcolor: statusColors(theme, status).dot })}
        />
      </Box>
      {$t({ id: `jobs.status.${status}` })}
    </Box>
  );

  // Expired is the one status the recruiter did not choose, so it explains itself.
  return status === 'expired' ? <Tooltip title={$t({ id: 'jobs.status.expired.hint' })}>{chip}</Tooltip> : chip;
}
