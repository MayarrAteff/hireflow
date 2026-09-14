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
        <CardContent className="p-5">
          <Box className="mb-4 flex items-center gap-2">
            <IconTile icon={MdInsights} size="sm" />
            <Typography variant="h6">{$t({ id: 'jobs.details.pipeline' })}</Typography>
          </Box>
          <Box component="ul" className="m-0 flex list-none flex-col gap-3 p-0">
            {FUNNEL_STAGES.map((stage) => {
              const count = applications.filter((application) => application.stage === stage).length;
              const color = ACCENT_COLORS[APPLICATION_STAGE_COLOR[stage]];
              return (
                <li key={stage}>
                  <Box className="mb-1 flex justify-between gap-2">
                    <Typography variant="body2">{$t({ id: `application.stage.${stage}` })}</Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {formatNumber(count)}
                    </Typography>
                  </Box>
                  <Box className="h-2 overflow-hidden rounded-full" sx={{ bgcolor: alpha(color, 0.14) }}>
                    <Box
                      className="h-full rounded-full transition-all"
                      sx={{ width: `${(count / maxCount) * 100}%`, bgcolor: color }}
                    />
                  </Box>
                </li>
              );
            })}
          </Box>
          <Button fullWidth variant="outlined" startIcon={<MdViewKanban />} onClick={onOpenBoard} className="mt-5">
            {$t({ id: 'jobs.details.openBoard' })}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
