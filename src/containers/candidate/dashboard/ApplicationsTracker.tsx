import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import Skeleton from '@mui/material/Skeleton';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { createLink } from '@tanstack/react-router';
import { MdCelebration, MdTimeline } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import { EmptyJobsIllustration } from '@/components/UI/Illustrations';
import { APPLICATION_PIPELINE, APPLICATION_STAGE_COLOR } from '@/constants/applications';
import { getCurrentOffer, getOfferDisplayStatus } from '@/constants/offers';
import { ACCENT_COLORS, accentFor, accentSoftSx } from '@/styles/themes/accents';
import type { CandidateApplication } from '@/types/application.types';
import { dayjs } from '@/utils/dayjs';

const ListItemLink = createLink(ListItemButton);
const RECENT_APPLICATIONS_LIMIT = 3;

type ApplicationsTrackerProps = {
  applications: CandidateApplication[];
  loading: boolean;
};

/** Where the candidate's applications stand: a count per pipeline stage plus the latest updates. */
export function ApplicationsTracker({ applications, loading }: ApplicationsTrackerProps) {
  const { $t, formatRelativeTime } = useIntl();
  const recent = applications.slice(0, RECENT_APPLICATIONS_LIMIT);

  const countFor = (stage: string) => applications.filter((application) => application.stage === stage).length;

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <Box className="mb-5 flex items-center gap-3">
          <IconTile icon={MdTimeline} />
          <Box className="min-w-0 flex-1">
            <Typography variant="h5">{$t({ id: 'candidate.applications.title' })}</Typography>
            <Typography variant="body2" color="text.secondary">
              {$t({ id: 'candidate.applications.subtitle' })}
            </Typography>
          </Box>
        </Box>

        <Box component="ol" className="m-0 mb-5 grid list-none grid-cols-5 gap-1.5 p-0">
          {APPLICATION_PIPELINE.map((stage) => {
            const color = ACCENT_COLORS[APPLICATION_STAGE_COLOR[stage]];
            const count = countFor(stage);
            return (
              <Box
                component="li"
                key={stage}
                className="flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-center"
                sx={(theme) => ({
                  bgcolor: alpha(color, count ? (theme.palette.mode === 'dark' ? 0.22 : 0.14) : 0.05),
                  borderTop: `3px solid ${count ? color : alpha(color, 0.3)}`,
                })}
              >
                <Typography variant="h4" component="span" sx={{ color: count ? color : 'text.disabled' }}>
                  {loading ? <Skeleton width={20} /> : count}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap className="w-full">
                  {$t({ id: `application.stage.${stage}` })}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {loading && [0, 1].map((row) => <Skeleton key={row} height={52} />)}

        {!loading && applications.length === 0 && (
          <Box
            className="flex flex-col items-center rounded-2xl py-4 text-center"
            sx={{ bgcolor: 'action.hover' }}
          >
            <EmptyJobsIllustration className="mb-1 w-32" />
            <Typography fontWeight={600}>{$t({ id: 'candidate.applications.empty.title' })}</Typography>
            <Typography variant="body2" color="text.secondary" className="max-w-sm px-4">
              {$t({ id: 'candidate.applications.empty.body' })}
            </Typography>
          </Box>
        )}

        <Box className="flex flex-col gap-1">
          {recent.map((application) => {
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
              <ListItemLink key={application.id} {...link} className="gap-3 p-2">
                <Avatar
                  variant="rounded"
                  sx={(theme) => ({ ...accentSoftSx(theme, accentFor(company ?? title)), fontWeight: 600 })}
                >
                  {(company ?? title).slice(0, 1).toUpperCase()}
                </Avatar>
                <Box className="min-w-0 flex-1">
                  <Typography fontWeight={600} noWrap>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {[company, formatRelativeTime(daysAgo, 'day', { numeric: 'auto' })].filter(Boolean).join(' · ')}
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
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
