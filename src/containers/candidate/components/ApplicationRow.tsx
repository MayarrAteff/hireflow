import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { createLink } from '@tanstack/react-router';
import { MdCelebration } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { APPLICATION_STAGE_COLOR } from '@/constants/applications';
import { getCurrentOffer, getOfferDisplayStatus } from '@/constants/offers';
import { ACCENT_COLORS, accentFor, accentSoftSx } from '@/styles/themes/accents';
import type { CandidateApplication } from '@/types/application.types';
import { dayjs } from '@/utils/dayjs';

const ListItemLink = createLink(ListItemButton);

type ApplicationRowProps = {
  application: CandidateApplication;
  /** Off where the company is already clear from the page: drops its name and initial for a stage-coloured dot. */
  showCompany?: boolean;
};

/** One of the candidate's applications: the job, its last update and where it stands. */
export function ApplicationRow({ application, showCompany = true }: ApplicationRowProps) {
  const { $t, formatRelativeTime } = useIntl();

  const title = application.job?.title ?? $t({ id: 'candidate.applications.unavailableJob' });
  const company = application.job?.company?.name;
  const isRejected = application.stage === 'rejected';
  const daysAgo = dayjs(application.updated_at).startOf('day').diff(dayjs().startOf('day'), 'day');
  const offer = getCurrentOffer(application.offers);
  const pendingOffer = offer && getOfferDisplayStatus(offer) === 'sent' ? offer : undefined;
  // A pending offer is the most useful place to land, so the whole row goes straight to it.
  const link = pendingOffer
    ? ({ to: '/candidate/offers/$offerId', params: { offerId: pendingOffer.id } } as const)
    : ({ to: '/candidate/jobs/$jobId', params: { jobId: application.job_id } } as const);

  return (
    <ListItemLink {...link} className="gap-3 p-2">
      {showCompany ? (
        <Avatar
          variant="rounded"
          sx={(theme) => ({ ...accentSoftSx(theme, accentFor(company ?? title)), fontWeight: 600 })}
        >
          {(company ?? title).slice(0, 1).toUpperCase()}
        </Avatar>
      ) : (
        <Box
          aria-hidden
          className="ms-1 h-2.5 w-2.5 shrink-0 rounded-full"
          sx={{ bgcolor: isRejected ? 'text.disabled' : ACCENT_COLORS[APPLICATION_STAGE_COLOR[application.stage]] }}
        />
      )}
      <Box className="min-w-0 flex-1">
        <Tooltip title={title} placement="top-start" enterDelay={400}>
          <Typography fontWeight={600} noWrap>
            {title}
          </Typography>
        </Tooltip>
        <Typography variant="body2" color="text.secondary" noWrap>
          {[showCompany && company, formatRelativeTime(daysAgo, 'day', { numeric: 'auto' })]
            .filter(Boolean)
            .join(' · ')}
        </Typography>
      </Box>
      {pendingOffer ? (
        <Chip
          size="small"
          icon={<MdCelebration />}
          label={$t({ id: 'candidate.applications.offerReceived' })}
          sx={(theme) => ({
            ...accentSoftSx(theme, 'emerald'),
            fontWeight: 700,
            '& .MuiChip-icon': { color: 'inherit' },
          })}
        />
      ) : (
        <Chip
          size="small"
          label={$t({ id: `application.stage.${application.stage}` })}
          sx={
            isRejected
              ? undefined
              : {
                  bgcolor: ACCENT_COLORS[APPLICATION_STAGE_COLOR[application.stage]],
                  color: '#fff',
                }
          }
        />
      )}
    </ListItemLink>
  );
}
