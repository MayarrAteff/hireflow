import Chip, { type ChipProps } from '@mui/material/Chip';
import { useIntl } from 'react-intl';

import { getOfferDisplayStatus, OFFER_STATUS_COLOR } from '@/constants/offers';
import { accentSoftSx } from '@/styles/themes/accents';
import type { Offer } from '@/types/offer.types';

type OfferStatusChipProps = Omit<ChipProps, 'label' | 'color'> & {
  offer: Pick<Offer, 'status' | 'expires_at'>;
};

/** Offer status in a soft accent colour; a sent offer past its deadline reads as Expired. */
export function OfferStatusChip({ offer, sx, ...rest }: OfferStatusChipProps) {
  const { $t } = useIntl();
  const status = getOfferDisplayStatus(offer);
  const color = OFFER_STATUS_COLOR[status];

  return (
    <Chip
      size="small"
      {...rest}
      label={$t({ id: `offer.status.${status}` })}
      sx={[
        (theme) => (color ? { ...accentSoftSx(theme, color), fontWeight: 600 } : { fontWeight: 600 }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}
