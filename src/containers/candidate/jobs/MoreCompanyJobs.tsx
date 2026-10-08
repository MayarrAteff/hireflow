import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { createLink } from '@tanstack/react-router';
import { MdArrowForward, MdWorkOutline } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { SectionCard } from '@/components/Jobs/SectionCard';
import { useCandidateApplications } from '@/hooks/useApplications';
import { useCompanyPublishedJobs } from '@/hooks/useJobs';
import { useAuth } from '@/utils/hooks/useAuth';
import { useJobFormatters } from '@/utils/hooks/useJobFormatters';

import { JobCard } from '../components/JobCard';

const ButtonLink = createLink(Button);
const MORE_JOBS_LIMIT = 4;

type MoreCompanyJobsProps = {
  companyId: string;
  currentJobId: string;
};

/** Other roles the same company is still hiring for; renders nothing when this is its only open job. */
export function MoreCompanyJobs({ companyId, currentJobId }: MoreCompanyJobsProps) {
  const { $t } = useIntl();
  const { profile } = useAuth();
  const { daysFromToday } = useJobFormatters();
  const jobsQuery = useCompanyPublishedJobs(companyId);
  const applicationsQuery = useCandidateApplications(profile?.id);

  const jobs = (jobsQuery.data ?? [])
    .filter((job) => job.id !== currentJobId && (job.deadline === null || daysFromToday(job.deadline) >= 0))
    .slice(0, MORE_JOBS_LIMIT);
  const appliedJobIds = new Set(applicationsQuery.data?.map((application) => application.job_id));

  if (jobs.length === 0) return null;

  return (
    <SectionCard
      icon={MdWorkOutline}
      color="sky"
      titleId="jobs.details.moreJobs.title"
      action={
        <ButtonLink
          size="small"
          to="/candidate/companies/$companyId"
          params={{ companyId }}
          endIcon={<MdArrowForward className="rtl:rotate-180" />}
        >
          {$t({ id: 'jobs.details.moreJobs.viewAll' })}
        </ButtonLink>
      }
    >
      <Box className="grid gap-3 sm:grid-cols-2">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} applied={appliedJobIds.has(job.id)} />
        ))}
      </Box>
    </SectionCard>
  );
}
