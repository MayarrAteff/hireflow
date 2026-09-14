import Chip, { type ChipProps } from '@mui/material/Chip';
import { useIntl } from 'react-intl';

import { APPLICATION_STAGE_COLOR } from '@/constants/applications';
import { ACCENT_COLORS } from '@/styles/themes/accents';
import type { ApplicationStage } from '@/types/application.types';

type StageChipProps = Omit<ChipProps, 'label' | 'color'> & {
  stage: ApplicationStage;
};

/** Application stage in its pipeline colour; "not selected" stays neutral. */
export function StageChip({ stage, sx, ...rest }: StageChipProps) {
  const { $t } = useIntl();

  return (
    <Chip
      size="small"
      {...rest}
      label={$t({ id: `application.stage.${stage}` })}
      sx={[
        stage === 'rejected' ? {} : { bgcolor: ACCENT_COLORS[APPLICATION_STAGE_COLOR[stage]], color: '#fff' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}
