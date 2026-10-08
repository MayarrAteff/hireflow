import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { createLink } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import type { IconType } from 'react-icons';
import {
  MdArrowBack,
  MdArrowDownward,
  MdBusiness,
  MdCategory,
  MdEvent,
  MdGroups,
  MdOpenInNew,
  MdTimeline,
  MdWorkOutline,
} from 'react-icons/md';
import { useIntl } from 'react-intl';

import { CompanyLogo } from '@/components/Jobs/CompanyLogo';
import { SectionCard } from '@/components/Jobs/SectionCard';
import { IconTile } from '@/components/UI/IconTile';
import { EmptyJobsIllustration } from '@/components/UI/Illustrations';
import { useCandidateApplications } from '@/hooks/useApplications';
import { useCompany } from '@/hooks/useCompany';
import { useCompanyPublishedJobs } from '@/hooks/useJobs';
import { type AccentColor, brandGradient } from '@/styles/themes/accents';
import { useAuth } from '@/utils/hooks/useAuth';
import { useJobFormatters } from '@/utils/hooks/useJobFormatters';

import { ApplicationRow } from '../components/ApplicationRow';
import { JobCard } from '../components/JobCard';

const ButtonLink = createLink(Button);

type CompanyDetailsProps = {
  companyId: string;
};

/** A company as candidates see it: who they are, what they are hiring for, and the candidate's history with them. */
export function CompanyDetails({ companyId }: CompanyDetailsProps) {
  const { $t, formatDate, formatNumber } = useIntl();
  const { profile } = useAuth();
  const { daysFromToday } = useJobFormatters();
  const companyQuery = useCompany(companyId);
  const jobsQuery = useCompanyPublishedJobs(companyId);
  const applicationsQuery = useCandidateApplications(profile?.id);
  const rolesRef = useRef<HTMLDivElement>(null);

  if (companyQuery.isPending) {
    return (
      <Box className="mx-auto flex max-w-6xl flex-col gap-6">
        <Skeleton variant="rounded" height={340} className="rounded-3xl" />
        <Skeleton variant="rounded" height={200} className="rounded-3xl" />
        <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} variant="rounded" height={150} className="rounded-2xl" />
          ))}
        </Box>
      </Box>
    );
  }

  // PostgREST answers 406 for a single-row request that matches nothing, and 400 for an id that is not a uuid.
  if (companyQuery.isError || !companyQuery.data) {
    return (
      <Box className="mx-auto flex max-w-3xl flex-col gap-6">
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <EmptyJobsIllustration className="mb-3 w-44" />
            <Typography variant="h3" className="mb-2">
              {$t({ id: 'company.public.unavailable.title' })}
            </Typography>
            <Typography color="text.secondary" className="mb-6 max-w-md">
              {$t({ id: 'company.public.unavailable.body' })}
            </Typography>
            <ButtonLink variant="contained" to="/candidate/jobs">
              {$t({ id: 'jobs.details.browse' })}
            </ButtonLink>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const company = companyQuery.data;
  // A published job past its deadline no longer takes applications, so it is not listed as an open role.
  const openJobs = (jobsQuery.data ?? []).filter((job) => job.deadline === null || daysFromToday(job.deadline) >= 0);
  const applications = (applicationsQuery.data ?? []).filter(
    (application) => application.job?.company_id === company.id,
  );
  const appliedJobIds = new Set(applicationsQuery.data?.map((application) => application.job_id));
  const about = company.about?.trim();
  const hasOpenJobs = openJobs.length > 0;

  const stats = [
    {
      icon: MdWorkOutline,
      color: 'sky',
      labelId: 'company.public.jobs.title',
      value: jobsQuery.isPending ? null : formatNumber(openJobs.length),
    },
    company.industry && {
      icon: MdCategory,
      color: 'violet',
      labelId: 'company.strength.item.industry',
      value: company.industry,
    },
    company.size && {
      icon: MdGroups,
      color: 'amber',
      labelId: 'company.field.size',
      value: $t({ id: 'jobs.details.companySize' }, { size: company.size }),
    },
    {
      icon: MdEvent,
      color: 'emerald',
      labelId: 'company.public.glance.joined',
      value: formatDate(company.created_at, { month: 'long', year: 'numeric' }),
    },
  ].filter(Boolean) as { icon: IconType; color: AccentColor; labelId: string; value: string | null }[];

  return (
    <Box className="mx-auto flex max-w-6xl flex-col gap-6">
      <ButtonLink to="/candidate/jobs" startIcon={<MdArrowBack className="rtl:rotate-180" />} className="self-start">
        {$t({ id: 'jobs.details.back' })}
      </ButtonLink>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden">
          <Box className="relative h-32 overflow-hidden sm:h-40" sx={(theme) => ({ background: brandGradient(theme) })}>
            <Box aria-hidden className="absolute -end-10 -top-16 h-56 w-56 rounded-full bg-white/10" />
            <Box aria-hidden className="absolute -bottom-16 start-1/4 h-40 w-40 rounded-full bg-white/10" />
            <Box aria-hidden className="absolute -top-10 start-10 h-24 w-24 rounded-full bg-white/10" />
          </Box>

          <CardContent className="relative flex flex-col gap-6 px-5 pb-6 pt-0 sm:px-8 sm:pb-8">
            <Box className="-mt-12 flex flex-col gap-4 sm:-mt-14 md:flex-row md:items-end md:justify-between">
              <Box className="flex min-w-0 flex-col gap-4">
                <CompanyLogo
                  name={company.name}
                  logoUrl={company.logo_url}
                  size={104}
                  sx={{
                    border: 4,
                    borderColor: 'background.paper',
                    boxShadow: `0 12px 28px -12px ${alpha('#000', 0.45)}`,
                  }}
                />
                <Box className="min-w-0">
                  <Typography variant="h2" className="break-words">
                    {company.name}
                  </Typography>
                  {(company.industry || company.size) && (
                    <Typography color="text.secondary" className="mt-1">
                      {[
                        company.industry,
                        company.size && $t({ id: 'jobs.details.companySize' }, { size: company.size }),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box className="flex shrink-0 flex-wrap gap-2">
                {company.website && (
                  <Button
                    variant="outlined"
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<MdOpenInNew />}
                  >
                    {$t({ id: 'company.public.visitWebsite' })}
                  </Button>
                )}
                {hasOpenJobs && (
                  <Button
                    variant="contained"
                    endIcon={<MdArrowDownward />}
                    onClick={() => rolesRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {$t({ id: 'company.public.seeRoles' })}
                  </Button>
                )}
              </Box>
            </Box>

            <Box className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map(({ icon, color, labelId, value }) => (
                <Box key={labelId} className="flex items-center gap-3 rounded-2xl p-3" sx={{ bgcolor: 'action.hover' }}>
                  <IconTile icon={icon} color={color} />
                  <Box className="min-w-0">
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {$t({ id: labelId })}
                    </Typography>
                    <Typography fontWeight={700} noWrap>
                      {value ?? <Skeleton width={28} />}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      <Box className={`grid items-start gap-6 ${applications.length > 0 ? 'lg:grid-cols-[minmax(0,1fr)_340px]' : ''}`}>
        <SectionCard icon={MdBusiness} color="violet" titleId="jobs.details.company">
          {about ? (
            <Typography className="max-w-3xl whitespace-pre-line leading-relaxed">{about}</Typography>
          ) : (
            <Typography color="text.secondary">
              {$t({ id: 'company.public.about.empty' }, { company: company.name })}
            </Typography>
          )}
        </SectionCard>

        {applications.length > 0 && (
          <SectionCard icon={MdTimeline} color="emerald" titleId="company.public.applications.title">
            <Box className="-mx-2 flex flex-col gap-1">
              {applications.map((application) => (
                <ApplicationRow key={application.id} application={application} showCompany={false} />
              ))}
            </Box>
          </SectionCard>
        )}
      </Box>

      <Box ref={rolesRef} className="flex scroll-mt-24 flex-col gap-4">
        <Box className="flex items-center gap-3">
          <IconTile icon={MdWorkOutline} color="sky" />
          <Typography variant="h4" component="h2">
            {$t({ id: 'company.public.jobs.title' })}
          </Typography>
          {hasOpenJobs && <Chip size="small" color="primary" label={formatNumber(openJobs.length)} />}
        </Box>

        {jobsQuery.isPending && (
          <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} variant="rounded" height={150} className="rounded-2xl" />
            ))}
          </Box>
        )}

        {!jobsQuery.isPending && !hasOpenJobs && (
          <Card>
            <CardContent className="flex flex-col items-center py-10 text-center">
              <EmptyJobsIllustration className="mb-3 w-40" />
              <Typography color="text.secondary" className="mb-5 max-w-md">
                {$t({ id: 'company.public.jobs.empty' }, { company: company.name })}
              </Typography>
              <ButtonLink variant="outlined" to="/candidate/jobs">
                {$t({ id: 'jobs.details.browse' })}
              </ButtonLink>
            </CardContent>
          </Card>
        )}

        {hasOpenJobs && (
          <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {openJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index, 8) * 0.04 }}
              >
                <JobCard job={job} applied={appliedJobIds.has(job.id)} />
              </motion.div>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
