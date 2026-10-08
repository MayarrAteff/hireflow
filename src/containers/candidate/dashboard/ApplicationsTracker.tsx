import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Link } from '@tanstack/react-router';
import { MdArrowForward, MdTimeline } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import { EmptyJobsIllustration } from '@/components/UI/Illustrations';
import { APPLICATION_PIPELINE, APPLICATION_STAGE_COLOR } from '@/constants/applications';
import { ACCENT_COLORS } from '@/styles/themes/accents';
import type { CandidateApplication } from '@/types/application.types';

import { ApplicationRow } from '../components/ApplicationRow';

const RECENT_APPLICATIONS_LIMIT = 3;

type ApplicationsTrackerProps = {
  applications: CandidateApplication[];
  loading: boolean;
};

/** Where the candidate's applications stand: a count per pipeline stage plus the latest updates. */
export function ApplicationsTracker({ applications, loading }: ApplicationsTrackerProps) {
  const { $t } = useIntl();
  const recent = applications.slice(0, RECENT_APPLICATIONS_LIMIT);

  const countFor = (stage: string) => applications.filter((application) => application.stage === stage).length;

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <Box className="mb-5 flex flex-wrap items-center gap-3">
          <IconTile icon={MdTimeline} />
          <Box className="min-w-0 flex-1">
            <Typography variant="h5">{$t({ id: 'candidate.applications.title' })}</Typography>
            <Typography variant="body2" color="text.secondary">
              {$t({ id: 'candidate.applications.subtitle' })}
            </Typography>
          </Box>
          {applications.length > 0 && (
            <Button
              component={Link}
              to="/candidate/applications"
              endIcon={<MdArrowForward className="rtl:rotate-180" />}
            >
              {$t({ id: 'candidate.applications.viewAll' })}
            </Button>
          )}
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
          <Box className="flex flex-col items-center rounded-2xl py-4 text-center" sx={{ bgcolor: 'action.hover' }}>
            <EmptyJobsIllustration className="mb-1 w-32" />
            <Typography fontWeight={600}>{$t({ id: 'candidate.applications.empty.title' })}</Typography>
            <Typography variant="body2" color="text.secondary" className="max-w-sm px-4">
              {$t({ id: 'candidate.applications.empty.body' })}
            </Typography>
          </Box>
        )}

        <Box className="flex flex-col gap-1">
          {recent.map((application) => (
            <ApplicationRow key={application.id} application={application} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
