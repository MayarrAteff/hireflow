import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { MdArticle, MdGroups, MdViewKanban } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { EmptyJobsIllustration } from '@/components/UI/Illustrations';
import { getCurrentOffer } from '@/constants/offers';
import { useJobApplications, useJobApplicationsRealtime } from '@/hooks/useApplications';
import { useJob } from '@/hooks/useJobs';
import type { RecruiterApplication } from '@/types/application.types';
import type { Interview } from '@/types/interview.types';

import { type InterviewTarget, ScheduleInterviewDialog } from '../../interviews/ScheduleInterviewDialog';
import { OfferDialog, type OfferTarget } from '../../offers/OfferDialog';
import { ApplicantDrawer } from './applicants/ApplicantDrawer';
import { ApplicantsTab } from './applicants/ApplicantsTab';
import { HiringBoard } from './board/HiringBoard';
import { JobHeader } from './JobHeader';
import { OverviewTab } from './OverviewTab';

export const JOB_DETAIL_TABS = ['overview', 'applicants', 'board'] as const;
export type JobDetailTab = (typeof JOB_DETAIL_TABS)[number];

const TAB_ICONS = { overview: MdArticle, applicants: MdGroups, board: MdViewKanban };

type RecruiterJobDetailsProps = {
  jobId: string;
  tab: JobDetailTab;
};

export function RecruiterJobDetails({ jobId, tab }: RecruiterJobDetailsProps) {
  const { $t } = useIntl();
  const navigate = useNavigate();
  const jobQuery = useJob(jobId);
  const applicationsQuery = useJobApplications(jobId);
  useJobApplicationsRealtime(jobId);

  const [drawerApplicationId, setDrawerApplicationId] = useState<string | null>(null);
  const [interviewTarget, setInterviewTarget] = useState<InterviewTarget | null>(null);
  const [offerTarget, setOfferTarget] = useState<OfferTarget | null>(null);

  const applications = applicationsQuery.data ?? [];
  // Looked up by id so the drawer always shows the latest cached data after edits.
  const drawerApplication = applications.find((application) => application.id === drawerApplicationId) ?? null;

  const setTab = (next: JobDetailTab) =>
    navigate({ to: '/recruiter/jobs/$jobId', params: { jobId }, search: { tab: next }, replace: true });

  const scheduleFor = (application: RecruiterApplication, interview?: Interview) =>
    setInterviewTarget({
      applicationId: application.id,
      jobId,
      candidateName: application.candidate.full_name || application.candidate.email,
      stage: application.stage,
      interview,
    });

  const makeOfferFor = (application: RecruiterApplication) =>
    setOfferTarget({
      applicationId: application.id,
      candidateName: application.candidate.full_name || application.candidate.email,
      current: getCurrentOffer(application.offers),
    });

  if (jobQuery.isPending) {
    return (
      <Box className="tw-mx-auto tw-flex tw-max-w-7xl tw-flex-col tw-gap-6">
        <Skeleton variant="rounded" height={260} className="tw-rounded-3xl" />
        <Skeleton variant="rounded" height={320} className="tw-rounded-3xl" />
      </Box>
    );
  }

  if (jobQuery.isError || !jobQuery.data) {
    return (
      <Box className="tw-mx-auto tw-flex tw-max-w-3xl tw-flex-col tw-gap-6">
        <Card>
          <CardContent className="tw-flex tw-flex-col tw-items-center tw-py-12 tw-text-center">
            <EmptyJobsIllustration className="tw-mb-3 tw-w-44" />
            <Typography variant="h3">{$t({ id: 'jobs.form.loadError' })}</Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const job = jobQuery.data;

  return (
    <Box className="tw-mx-auto tw-flex tw-max-w-7xl tw-flex-col tw-gap-5">
      <JobHeader job={job} applications={applications} loadingApplications={applicationsQuery.isPending} />

      <Tabs
        value={tab}
        onChange={(_event, next: JobDetailTab) => setTab(next)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        {JOB_DETAIL_TABS.map((key) => {
          const Icon = TAB_ICONS[key];
          return (
            <Tab
              key={key}
              value={key}
              icon={<Icon size={20} />}
              iconPosition="start"
              label={
                key === 'applicants'
                  ? `${$t({ id: 'jobs.details.tab.applicants' })} (${applications.length})`
                  : $t({ id: `jobs.details.tab.${key}` })
              }
              className="tw-min-h-12"
            />
          );
        })}
      </Tabs>

      {tab === 'overview' && <OverviewTab job={job} applications={applications} onOpenBoard={() => setTab('board')} />}
      {tab === 'applicants' && (
        <ApplicantsTab
          job={job}
          applications={applications}
          loading={applicationsQuery.isPending}
          onOpenApplicant={setDrawerApplicationId}
          onSchedule={scheduleFor}
          onMakeOffer={makeOfferFor}
        />
      )}
      {tab === 'board' &&
        (applicationsQuery.isPending ? (
          <Box className="tw-flex tw-gap-3 tw-overflow-hidden">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} variant="rounded" width={272} height={320} className="tw-shrink-0 tw-rounded-2xl" />
            ))}
          </Box>
        ) : (
          <HiringBoard
            job={job}
            applications={applications}
            onOpenApplicant={setDrawerApplicationId}
            onSuggestInterview={(application) => scheduleFor(application)}
            onSuggestOffer={makeOfferFor}
          />
        ))}

      <ApplicantDrawer
        application={drawerApplication}
        job={job}
        onClose={() => setDrawerApplicationId(null)}
        onSchedule={scheduleFor}
        onMakeOffer={makeOfferFor}
      />
      <ScheduleInterviewDialog target={interviewTarget} onClose={() => setInterviewTarget(null)} />
      <OfferDialog job={job} target={offerTarget} onClose={() => setOfferTarget(null)} />
    </Box>
  );
}
