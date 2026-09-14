import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { MdEditNote, MdLocalOffer, MdPictureAsPdf, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { OfferStatusChip } from '@/components/Offers/OfferStatusChip';
import { getOfferDisplayStatus } from '@/constants/offers';
import { useOpenOfferLetter } from '@/hooks/useOpenCv';
import type { Offer } from '@/types/offer.types';

type OfferSummaryProps = {
  offer: Offer | undefined;
  onOpenDialog: () => void;
};

/** The applicant's current offer at a glance in the drawer, with the next thing the recruiter can do. */
export function OfferSummary({ offer, onOpenDialog }: OfferSummaryProps) {
  const { $t, formatDate, formatNumber, formatRelativeTime } = useIntl();
  const { openLetter, openingPath } = useOpenOfferLetter();

  if (!offer) {
    return (
      <Box className="flex flex-wrap items-center justify-between gap-2">
        <Typography variant="body2" color="text.disabled">
          {$t({ id: 'offer.summary.none' })}
        </Typography>
        <Button size="small" variant="outlined" startIcon={<MdLocalOffer />} onClick={onOpenDialog}>
          {$t({ id: 'offer.action.make' })}
        </Button>
      </Box>
    );
  }

  const status = getOfferDisplayStatus(offer);
  const actionId = {
    draft: 'offer.action.editDraft',
    sent: 'offer.action.manage',
    accepted: null,
    declined: 'offer.action.revise',
    withdrawn: 'offer.action.revise',
    expired: 'offer.action.revise',
  }[status];
  const minutesSinceViewed = offer.viewed_at
    ? Math.round((new Date(offer.viewed_at).getTime() - Date.now()) / 60_000)
    : null;

  return (
    <Box className="flex flex-col gap-3 rounded-2xl p-3.5" sx={{ border: 1, borderColor: 'divider' }}>
      <Box className="flex items-start justify-between gap-2">
        <Box className="min-w-0">
          <Typography variant="h5" component="p">
            {formatNumber(offer.salary)} {offer.currency}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {$t(
              { id: 'offer.summary.dates' },
              {
                start: formatDate(offer.start_date, { dateStyle: 'medium' }),
                deadline: formatDate(offer.expires_at, { dateStyle: 'medium' }),
              },
            )}
          </Typography>
        </Box>
        <OfferStatusChip offer={offer} />
      </Box>

      {status === 'sent' && (
        <Typography variant="body2" color="text.secondary" className="flex items-center gap-1.5">
          {minutesSinceViewed === null ? <MdVisibilityOff /> : <MdVisibility />}
          {minutesSinceViewed === null
            ? $t({ id: 'offer.summary.notViewed' })
            : $t(
                { id: 'offer.summary.viewed' },
                {
                  when:
                    Math.abs(minutesSinceViewed) < 60 * 24
                      ? formatRelativeTime(Math.round(minutesSinceViewed / 60), 'hour', { numeric: 'auto' })
                      : formatRelativeTime(Math.round(minutesSinceViewed / (60 * 24)), 'day', { numeric: 'auto' }),
                },
              )}
        </Typography>
      )}

      {offer.status === 'declined' && (
        <Box className="rounded-xl p-2.5" sx={{ bgcolor: 'action.hover' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600} className="block">
            {$t({ id: 'offer.summary.declineReason' })}
          </Typography>
          <Typography variant="body2" className="whitespace-pre-line">
            {offer.decline_reason || $t({ id: 'offer.summary.noReason' })}
          </Typography>
        </Box>
      )}

      <Box className="flex flex-wrap gap-2">
        {offer.letter_path && (
          <Button
            size="small"
            startIcon={<MdPictureAsPdf />}
            onClick={() => openLetter(offer.letter_path as string)}
            loading={openingPath === offer.letter_path}
          >
            {$t({ id: 'offer.letter.view' })}
          </Button>
        )}
        {actionId && (
          <Button size="small" variant="outlined" startIcon={<MdEditNote />} onClick={onOpenDialog}>
            {$t({ id: actionId })}
          </Button>
        )}
      </Box>
    </Box>
  );
}
