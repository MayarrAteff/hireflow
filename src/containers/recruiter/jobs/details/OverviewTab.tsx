import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { createLink } from '@tanstack/react-router';
import { MdEdit, MdInsights, MdViewKanban } from 'react-icons/md';
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
  const maxCount = Math.max(1, ...FUNNEL_STAGES.map((stage) => applications.filter((a) => a.stage === stage).length));

  return (
    <Box className="tw-grid tw-items-start tw-gap-6 lg:tw-grid-cols-[minmax(0,1fr)_320px]">
      <Box className="tw-flex tw-flex-col tw-gap-6">
        {hasPostingContent ? (
          <JobPostingSections job={job} />
        ) : (
          <Card>
            <CardContent className="tw-flex tw-flex-col tw-items-center tw-py-12 tw-text-center">
              <EmptyJobsIllustration className="tw-mb-3 tw-w-40" />
              <Typography variant="h4" className="tw-mb-1">
                {$t({ id: 'jobs.details.noContent.title' })}
              </Typography>
              <Typography color="text.secondary" className="tw-mb-5 tw-max-w-md">
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

      <Card className="lg:tw-sticky lg:tw-top-24">
        <CardContent className="tw-p-5">
          <Box className="tw-mb-4 tw-flex tw-items-center tw-gap-2">
            <IconTile icon={MdInsights} size="sm" />
            <Typography variant="h6">{$t({ id: 'jobs.details.pipeline' })}</Typography>
          </Box>
          <Box component="ul" className="tw-m-0 tw-flex tw-list-none tw-flex-col tw-gap-3 tw-p-0">
            {FUNNEL_STAGES.map((stage) => {
              const count = applications.filter((application) => application.stage === stage).length;
              const color = ACCENT_COLORS[APPLICATION_STAGE_COLOR[stage]];
              return (
                <li key={stage}>
                  <Box className="tw-mb-1 tw-flex tw-justify-between tw-gap-2">
                    <Typography variant="body2">{$t({ id: `application.stage.${stage}` })}</Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {formatNumber(count)}
                    </Typography>
                  </Box>
                  <Box className="tw-h-2 tw-overflow-hidden tw-rounded-full" sx={{ bgcolor: alpha(color, 0.14) }}>
                    <Box
                      className="tw-h-full tw-rounded-full tw-transition-all"
                      sx={{ width: `${(count / maxCount) * 100}%`, bgcolor: color }}
                    />
                  </Box>
                </li>
              );
            })}
          </Box>
          <Button fullWidth variant="outlined" startIcon={<MdViewKanban />} onClick={onOpenBoard} className="tw-mt-5">
            {$t({ id: 'jobs.details.openBoard' })}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
