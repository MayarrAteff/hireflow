import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { createLink } from '@tanstack/react-router';
import { Fragment } from 'react';
import { MdEdit } from 'react-icons/md';
import { PiFunnelDuotone, PiKanbanDuotone } from 'react-icons/pi';
import { useIntl } from 'react-intl';

import { JobPostingSections } from '@/components/Jobs/JobPostingSections';
import { IconTile } from '@/components/UI/IconTile';
import { EmptyJobsIllustration } from '@/components/UI/Illustrations';
import { APPLICATION_STAGE_COLOR } from '@/constants/applications';
import { ACCENT_COLORS } from '@/styles/themes/accents';
import type { ApplicationStage, RecruiterApplication } from '@/types/application.types';
import type { Job } from '@/types/job.types';

const ButtonLink = createLink(Button);

const FUNNEL_STAGES: ApplicationStage[] = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

type OverviewTabProps = {
  job: Job;
  applications: RecruiterApplication[];
  onOpenBoard: () => void;
};

export function OverviewTab({ job, applications, onOpenBoard }: OverviewTabProps) {
  const { $t, formatNumber } = useIntl();
  const hasPostingContent = Boolean(
    job.description.trim() || job.requirements.some((requirement) => requirement.trim()) || job.skills.length,
  );
  const stageCounts = FUNNEL_STAGES.map((stage) => ({
    stage,
    count: applications.filter((application) => application.stage === stage).length,
    color: ACCENT_COLORS[APPLICATION_STAGE_COLOR[stage]],
  }));
  const total = applications.length;

  return (
    <Box className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Box className="flex flex-col gap-6">
        {hasPostingContent ? (
          <JobPostingSections job={job} />
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <EmptyJobsIllustration className="mb-3 w-40" />
              <Typography variant="h4" className="mb-1">
                {$t({ id: 'jobs.details.noContent.title' })}
              </Typography>
              <Typography color="text.secondary" className="mb-5 max-w-md">
                {$t({ id: 'jobs.details.noContent.body' })}
              </Typography>
              <ButtonLink
                variant="contained"
                startIcon={<MdEdit />}
                to="/recruiter/jobs/$jobId/edit"
                params={{ jobId: job.id }}
              >
                {$t({ id: 'jobs.details.noContent.cta' })}
              </ButtonLink>
            </CardContent>
          </Card>
        )}
      </Box>

      <Card className="lg:sticky lg:top-24">
        <CardContent className="flex flex-col gap-5 p-5">
          <Box className="flex items-center justify-between gap-3">
            <Box className="flex items-center gap-2.5">
              <IconTile icon={PiFunnelDuotone} size="sm" />
              <Typography variant="h6">{$t({ id: 'jobs.details.pipeline' })}</Typography>
            </Box>
            <Box className="text-end">
              <Typography variant="h4" component="p" className="leading-none">
                {formatNumber(total)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {$t({ id: 'jobs.details.pipeline.total' }, { count: total })}
              </Typography>
            </Box>
          </Box>

          <Box
            aria-hidden
            className="flex h-2.5 gap-0.5 overflow-hidden rounded-full"
            sx={(theme) => ({ bgcolor: alpha(theme.palette.text.primary, 0.06) })}
          >
            {stageCounts
              .filter(({ count }) => count > 0)
              .map(({ stage, count, color }) => (
                <Box
                  key={stage}
                  className="h-full transition-all duration-500"
                  sx={{ flexGrow: count, bgcolor: color }}
                />
              ))}
          </Box>

          {total === 0 ? (
            <Typography variant="body2" color="text.secondary" className="text-center">
              {$t({ id: 'jobs.details.pipeline.empty' })}
            </Typography>
          ) : (
            <Box component="ul" className="m-0 flex list-none flex-col gap-1 p-0">
              {stageCounts.map(({ stage, count, color }) => (
                <Fragment key={stage}>
                  {/* Rejected sits outside the forward pipeline, so it gets its own group. */}
                  {stage === 'rejected' && <Divider component="li" aria-hidden className="my-1" />}
                  <Box
                    component="li"
                    className="rounded-xl px-2.5 py-2"
                    sx={(theme) => ({
                      opacity: count ? 1 : 0.55,
                      transition: theme.transitions.create('background-color'),
                      '&:hover': { bgcolor: alpha(color, 0.08) },
                    })}
                  >
                    <Box className="mb-1.5 flex items-center gap-2.5">
                      <Box
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        sx={{ bgcolor: color, boxShadow: `0 0 0 3px ${alpha(color, 0.2)}` }}
                      />
                      <Typography variant="body2" className="flex-1">
                        {$t({ id: `application.stage.${stage}` })}
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {formatNumber(count)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" className="w-10 text-end tabular-nums">
                        {formatNumber(count / total, { style: 'percent' })}
                      </Typography>
                    </Box>
                    <Box className="ms-5 h-1 overflow-hidden rounded-full" sx={{ bgcolor: alpha(color, 0.14) }}>
                      <Box
                        className="h-full rounded-full transition-all duration-500"
                        sx={{ width: `${(count / total) * 100}%`, bgcolor: color }}
                      />
                    </Box>
                  </Box>
                </Fragment>
              ))}
            </Box>
          )}

          <Button
            fullWidth
            variant="contained"
            disableElevation
            size="large"
            startIcon={<PiKanbanDuotone />}
            onClick={onOpenBoard}
          >
            {$t({ id: 'jobs.details.openBoard' })}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
