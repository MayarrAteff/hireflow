import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { useIntl } from 'react-intl';

import { APPLICATION_STAGE_COLOR } from '@/constants/applications';
import { ACCENT_COLORS } from '@/styles/themes/accents';

const NEW_COLOR = ACCENT_COLORS[APPLICATION_STAGE_COLOR.applied];

/** Marks an applicant nobody at the company has opened yet. */
export function NewApplicantDot() {
  const { $t } = useIntl();
  const label = $t({ id: 'applicants.new' });

  return (
    <Tooltip title={label}>
      <Box
        role="img"
        aria-label={label}
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        sx={{ bgcolor: NEW_COLOR, boxShadow: `0 0 0 3px ${NEW_COLOR}33` }}
      />
    </Tooltip>
  );
}
