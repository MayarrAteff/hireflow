import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { MdDragIndicator, MdEventAvailable, MdOpenInFull } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { OfferStatusChip } from '@/components/Offers/OfferStatusChip';
import { getNextInterview } from '@/constants/interviews';
import { getCurrentOffer } from '@/constants/offers';
import type { RecruiterApplication } from '@/types/application.types';
import { useJobFormatters } from '@/utils/hooks/useJobFormatters';

import { ApplicantAvatar } from '../applicants/ApplicantAvatar';
import { matchColor } from '../applicants/SkillMatchBar';

type BoardCardContentProps = {
  application: RecruiterApplication;
  matchPercent: number;
  onOpen?: () => void;
  /** Rendered in the drag overlay: lifted look, no buttons. */
  overlay?: boolean;
};

export function BoardCardContent({ application, matchPercent, onOpen, overlay }: BoardCardContentProps) {
  const { $t, formatDate, formatNumber } = useIntl();
  const { formatRelativeDay } = useJobFormatters();
  const { candidate } = application;
  const nextInterview = getNextInterview(application.interviews);
  const color = matchColor(matchPercent);
  const offer = getCurrentOffer(application.offers);

  return (
    <Paper
      elevation={overlay ? 12 : 0}
      className="tw-flex tw-flex-col tw-gap-2 tw-rounded-xl tw-p-3"
      sx={{
        border: 1,
        borderColor: 'divider',
        cursor: overlay ? 'grabbing' : 'grab',
        transform: overlay ? 'rotate(2deg)' : undefined,
        '&:hover .board-card-open': { opacity: 1 },
      }}
    >
      <Box className="tw-flex tw-items-center tw-gap-2.5">
        <ApplicantAvatar candidate={candidate} size={36} />
        <Box className="tw-min-w-0 tw-flex-1">
          <Typography variant="body2" fontWeight={700} noWrap>
            {candidate.full_name || candidate.email}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap className="tw-block">
            {candidate.headline || formatRelativeDay(application.created_at)}
          </Typography>
        </Box>
        {!overlay && onOpen && (
          <Tooltip title={$t({ id: 'board.openApplicant' })}>
            <IconButton
              size="small"
              className="board-card-open tw-opacity-60"
              aria-label={$t({ id: 'board.openApplicant' })}
              // Keep clicks and key presses on the button from starting a drag.
              onPointerDown={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              onClick={onOpen}
            >
              <MdOpenInFull size={16} />
            </IconButton>
          </Tooltip>
        )}
        <Box component={MdDragIndicator} className="tw-shrink-0" sx={{ color: 'text.disabled' }} aria-hidden />
      </Box>

      <Box className="tw-flex tw-flex-wrap tw-items-center tw-gap-1.5">
        <Chip
          size="small"
          label={$t({ id: 'board.match' }, { percent: formatNumber(matchPercent / 100, { style: 'percent' }) })}
          sx={{ bgcolor: `${color}22`, color, fontWeight: 700 }}
        />
        {application.rating ? <Rating value={application.rating} readOnly size="small" /> : null}
        {offer && ['offer', 'hired'].includes(application.stage) && <OfferStatusChip offer={offer} />}
      </Box>

      {nextInterview && (
        <Typography
          variant="caption"
          className="tw-flex tw-items-center tw-gap-1"
          sx={{ color: 'warning.main', fontWeight: 600 }}
        >
          <MdEventAvailable />
          {formatDate(nextInterview.scheduled_at, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Typography>
      )}
    </Paper>
  );
}

type BoardCardProps = {
  application: RecruiterApplication;
  matchPercent: number;
  onOpen: () => void;
};

export function BoardCard({ application, matchPercent, onOpen }: BoardCardProps) {
  const { $t } = useIntl();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: application.id });

  return (
    <Box
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      aria-roledescription={$t({ id: 'board.a11y.card' })}
      // Opening with Enter would clash with the keyboard sensor, which uses Space/Enter to pick up.
      onDoubleClick={onOpen}
      className="tw-touch-manipulation tw-rounded-xl tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-primary"
      style={{ transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.35 : 1 }}
    >
      <BoardCardContent application={application} matchPercent={matchPercent} onOpen={onOpen} />
    </Box>
  );
}
