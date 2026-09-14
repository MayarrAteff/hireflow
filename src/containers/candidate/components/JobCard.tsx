import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { createLink } from '@tanstack/react-router';
import { MdCheckCircle, MdPlace, MdSchedule } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { CompanyLogo } from '@/components/Jobs/CompanyLogo';
import type { JobWithCompany } from '@/types/job.types';
import { useJobFormatters } from '@/utils/hooks/useJobFormatters';

const CardActionLink = createLink(CardActionArea);

/** Deadlines this close are called out on the card. */
const CLOSING_SOON_DAYS = 7;

type JobCardProps = {
  job: JobWithCompany;
  applied?: boolean;
};

export function JobCard({ job, applied }: JobCardProps) {
  const { $t } = useIntl();
  const { formatSalary, daysFromToday, formatRelativeDay } = useJobFormatters();

  const company = job.company?.name ?? '';
  const salary = formatSalary(job.salary_min, job.salary_max, job.currency);
  const isNew = daysFromToday(job.created_at) === 0;
  const daysLeft = job.deadline ? daysFromToday(job.deadline) : null;
  const closingSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= CLOSING_SOON_DAYS;

  return (
    <Card className="h-full transition-transform hover:-translate-y-1">
      <CardActionLink
        to="/candidate/jobs/$jobId"
        params={{ jobId: job.id }}
        className="flex h-full flex-col items-stretch gap-3 p-4"
      >
        <Box className="flex items-center gap-3">
          <CompanyLogo name={company || job.title} logoUrl={job.company?.logo_url} size={40} />
          <Box className="min-w-0 flex-1">
            <Typography fontWeight={700} noWrap>
              {job.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {company}
            </Typography>
          </Box>
          {applied ? (
            <Chip size="small" color="success" icon={<MdCheckCircle />} label={$t({ id: 'jobs.browse.applied' })} />
          ) : (
            isNew && <Chip size="small" color="secondary" label={$t({ id: 'candidate.freshJobs.new' })} />
          )}
        </Box>

        <Box className="flex flex-wrap gap-1.5">
          <Chip size="small" variant="outlined" label={$t({ id: `jobs.employmentType.${job.employment_type}` })} />
          <Chip size="small" variant="outlined" label={$t({ id: `jobs.workMode.${job.work_mode}` })} />
          {closingSoon && (
            <Chip
              size="small"
              color="warning"
              variant="outlined"
              icon={<MdSchedule />}
              label={$t({ id: 'jobs.browse.closes' }, { when: formatRelativeDay(job.deadline as string) })}
            />
          )}
        </Box>

        <Box className="mt-auto flex items-center justify-between gap-2">
          <Typography variant="body2" color="text.secondary" noWrap className="flex items-center gap-1">
            {job.location && <MdPlace className="shrink-0" />}
            {job.location || formatRelativeDay(job.created_at)}
          </Typography>
          {salary && (
            <Typography variant="body2" fontWeight={700} color="primary" noWrap>
              {salary}
            </Typography>
          )}
        </Box>
      </CardActionLink>
    </Card>
  );
}
