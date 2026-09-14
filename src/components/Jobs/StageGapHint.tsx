import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { MdErrorOutline } from 'react-icons/md';
import { useIntl } from 'react-intl';

import type { RecruiterApplication } from '@/types/application.types';
import { getStageGap } from '@/utils/stageGaps';

type StageGapHintProps = {
  application: Pick<RecruiterApplication, 'stage' | 'interviews' | 'offers'>;
};

/**
 * One-line nudge under an applicant's stage when that stage is missing its next step ("Needs scheduling").
 * Worded as the action so it never reads as contradicting the stage chip next to it.
 */
export function StageGapHint({ application }: StageGapHintProps) {
  const { $t } = useIntl();
  const gap = getStageGap(application);

  if (!gap) return null;

  return (
    <Tooltip title={$t({ id: `applicants.gap.${gap}.title` })}>
      <Typography
        variant="caption"
        className="flex items-center gap-1 whitespace-nowrap"
        sx={(theme) => ({ color: theme.palette.mode === 'dark' ? 'warning.light' : 'warning.dark', fontWeight: 600 })}
      >
        <MdErrorOutline aria-hidden className="shrink-0" />
        {$t({ id: `applicants.gap.${gap}.hint` })}
      </Typography>
    </Tooltip>
  );
}
