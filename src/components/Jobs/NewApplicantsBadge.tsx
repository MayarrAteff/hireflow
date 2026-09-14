import Box from '@mui/material/Box';
import { useIntl } from 'react-intl';

import { APPLICATION_STAGE_COLOR } from '@/constants/applications';
import { accentSoftSx } from '@/styles/themes/accents';

type NewApplicantsBadgeProps = {
  /** Applicants nobody at the company has opened yet; nothing renders for 0. */
  count: number;
};

export function NewApplicantsBadge({ count }: NewApplicantsBadgeProps) {
  const { $t, formatNumber } = useIntl();

  if (count <= 0) return null;

  return (
    <Box
      component="span"
      className="shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold"
      sx={(theme) => accentSoftSx(theme, APPLICATION_STAGE_COLOR.applied)}
    >
      {$t({ id: 'jobs.list.applicants.new' }, { count: formatNumber(count) })}
    </Box>
  );
}

/** Unseen applicants on a job from the company jobs query. */
export function countNewApplicants(applications: { viewed_at: string | null }[] | undefined) {
  return (applications ?? []).filter((application) => !application.viewed_at).length;
}
