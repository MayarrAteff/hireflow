import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { IconType } from 'react-icons';
import { MdAutoAwesome, MdBusiness, MdEvent, MdLanguage, MdPayments, MdPlace, MdSchedule } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { JobPostingSections } from '@/components/Jobs/JobPostingSections';
import { IconTile } from '@/components/UI/IconTile';
import { EmptyJobsIllustration } from '@/components/UI/Illustrations';
import { ProgressRing } from '@/components/UI/ProgressRing';
import { usePublishedJob } from '@/hooks/useJobs';
import { ACCENT_COLORS, accentFor, accentSoftSx, brandGradient } from '@/styles/themes/accents';
import { useAuth } from '@/utils/hooks/useAuth';
import { useJobFormatters } from '@/utils/hooks/useJobFormatters';
import { getSkillMatch } from '@/utils/skillMatch';

import { ApplyDialog } from './ApplyDialog';
import { ApplyPanel } from './ApplyPanel';

type JobDetailsProps = {
  jobId: string;
};

export function JobDetails({ jobId }: JobDetailsProps) {
  const { $t, formatDate, formatNumber } = useIntl();
  const { profile } = useAuth();
  const { formatSalary, daysFromToday, formatRelativeDay } = useJobFormatters();
  const jobQuery = usePublishedJob(jobId);
  const [applyOpen, setApplyOpen] = useState(false);

  if (jobQuery.isPending) {
    return (
      <Box className="tw-mx-auto tw-flex tw-max-w-6xl tw-flex-col tw-gap-6">
        <Skeleton variant="rounded" height={240} className="tw-rounded-3xl" />
        <Box className="tw-grid tw-gap-6 lg:tw-grid-cols-[minmax(0,1fr)_320px]">
          <Skeleton variant="rounded" height={320} className="tw-rounded-3xl" />
          <Skeleton variant="rounded" height={220} className="tw-rounded-3xl" />
        </Box>
      </Box>
    );
  }

  // PostgREST answers 406 for a single-row request that matches nothing: the job is closed, a draft, or gone.
  if (jobQuery.isError || !jobQuery.data) {
    return (
      <Box className="tw-mx-auto tw-flex tw-max-w-3xl tw-flex-col tw-gap-6">
        <Card>
          <CardContent className="tw-flex tw-flex-col tw-items-center tw-py-12 tw-text-center">
            <EmptyJobsIllustration className="tw-mb-3 tw-w-44" />
            <Typography variant="h3" className="tw-mb-2">
              {$t({ id: 'jobs.details.unavailable.title' })}
            </Typography>
            <Typography color="text.secondary" className="tw-mb-6 tw-max-w-md">
              {$t({ id: 'jobs.details.unavailable.body' })}
            </Typography>
            <Button variant="contained" component={RouterLink} to="/candidate/jobs">
              {$t({ id: 'jobs.details.browse' })}
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const job = jobQuery.data;
  const company = job.company;
  const companyName = company?.name ?? '';
  const salary = formatSalary(job.salary_min, job.salary_max, job.currency);
  const skillMatch = getSkillMatch(job.skills, profile?.skills ?? []);
  const daysLeft = job.deadline ? daysFromToday(job.deadline) : null;

  const meta = [
    job.location && { icon: MdPlace, text: job.location },
    { icon: MdSchedule, text: $t({ id: 'jobs.details.posted' }, { when: formatRelativeDay(job.created_at) }) },
    job.deadline && {
      icon: MdEvent,
      text: $t(
        { id: 'jobs.details.deadline' },
        { date: formatDate(job.deadline, { dateStyle: 'medium' }), when: formatRelativeDay(job.deadline) },
      ),
      highlight: daysLeft !== null && daysLeft >= 0 && daysLeft <= 7,
    },
  ].filter(Boolean) as { icon: IconType; text: string; highlight?: boolean }[];

  return (
    <Box className="tw-mx-auto tw-flex tw-max-w-6xl tw-flex-col tw-gap-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="tw-overflow-hidden">
          <Box
            className="tw-relative tw-flex tw-items-center tw-gap-4 tw-overflow-hidden tw-px-5 tw-py-6 tw-text-white sm:tw-px-8"
            sx={(theme) => ({ background: brandGradient(theme) })}
          >
            <Box
              aria-hidden
              className="tw-absolute -tw-end-10 -tw-top-16 tw-h-48 tw-w-48 tw-rounded-full tw-bg-white/10"
            />
            <Box
              aria-hidden
              className="tw-absolute -tw-bottom-12 tw-start-1/3 tw-h-32 tw-w-32 tw-rounded-full tw-bg-white/10"
            />
            <Avatar
              variant="rounded"
              className="tw-relative tw-shrink-0"
              sx={(theme) => ({
                ...accentSoftSx(theme, accentFor(companyName || job.title)),
                width: 72,
                height: 72,
                fontSize: 30,
                fontWeight: 700,
                borderRadius: '18px',
                bgcolor: 'background.paper',
                boxShadow: `0 10px 24px -10px ${alpha('#000', 0.45)}`,
              })}
            >
              {(companyName || job.title).slice(0, 1).toUpperCase()}
            </Avatar>
            <Box className="tw-relative tw-min-w-0">
              <Typography variant="h5" component="p" noWrap>
                {companyName}
              </Typography>
              {company?.industry && (
                <Typography className="tw-text-white/80" noWrap>
                  {company.industry}
                </Typography>
              )}
            </Box>
          </Box>
          <CardContent className="tw-flex tw-flex-col tw-gap-5 tw-px-5 tw-py-6 sm:tw-px-8 md:tw-flex-row md:tw-items-start md:tw-justify-between">
            <Box className="tw-min-w-0">
              <Typography variant="h2" className="tw-mb-3 tw-break-words">
                {job.title}
              </Typography>
              <Box className="tw-mb-3 tw-flex tw-flex-wrap tw-gap-1.5">
                <Chip color="primary" label={$t({ id: `jobs.employmentType.${job.employment_type}` })} />
                <Chip color="secondary" label={$t({ id: `jobs.workMode.${job.work_mode}` })} />
                {salary && (
                  <Chip
                    icon={<MdPayments />}
                    label={salary}
                    sx={(theme) => ({
                      fontWeight: 700,
                      bgcolor: alpha(ACCENT_COLORS.emerald, theme.palette.mode === 'dark' ? 0.2 : 0.14),
                      color: theme.palette.mode === 'dark' ? '#6EE7B7' : '#047857',
                      '& .MuiChip-icon': { color: 'inherit' },
                    })}
                  />
                )}
              </Box>
              <Box className="tw-flex tw-flex-wrap tw-gap-x-5 tw-gap-y-1">
                {meta.map(({ icon: Icon, text, highlight }) => (
                  <Typography
                    key={text}
                    variant="body2"
                    className="tw-flex tw-items-center tw-gap-1.5"
                    sx={{ color: highlight ? 'warning.main' : 'text.secondary', fontWeight: highlight ? 600 : 400 }}
                  >
                    <Icon className="tw-shrink-0" />
                    {text}
                  </Typography>
                ))}
              </Box>
            </Box>
            <Box className="tw-shrink-0">
              <ApplyPanel job={job} onApply={() => setApplyOpen(true)} />
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      <Box className="tw-grid tw-items-start tw-gap-6 lg:tw-grid-cols-[minmax(0,1fr)_320px]">
        <Box className="tw-flex tw-flex-col tw-gap-6">
          <JobPostingSections job={job} matchedSkills={skillMatch.matched} />
        </Box>

        <Box component="aside" className="tw-flex tw-flex-col tw-gap-4 lg:tw-sticky lg:tw-top-24">
          {job.skills.length > 0 && (
            <Card>
              <CardContent className="tw-p-5">
                <Box className="tw-mb-3 tw-flex tw-items-center tw-gap-2">
                  <IconTile icon={MdAutoAwesome} size="sm" />
                  <Typography variant="h6">{$t({ id: 'jobs.details.match.title' })}</Typography>
                </Box>
                <Box className="tw-flex tw-items-center tw-gap-4">
                  <Box className="tw-relative tw-shrink-0">
                    <ProgressRing value={skillMatch.percent} size={88} stroke={8} />
                    <Typography
                      variant="h5"
                      component="span"
                      className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center"
                    >
                      {formatNumber(skillMatch.percent / 100, { style: 'percent' })}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {$t(
                      {
                        id:
                          skillMatch.percent >= 70
                            ? 'jobs.details.match.strong'
                            : skillMatch.percent > 0
                              ? 'jobs.details.match.partial'
                              : 'jobs.details.match.none',
                      },
                      { matched: skillMatch.matchedCount, total: skillMatch.total },
                    )}
                  </Typography>
                </Box>
                {!profile?.skills?.length && (
                  <Link
                    component={RouterLink}
                    to="/candidate/profile"
                    variant="body2"
                    fontWeight={600}
                    className="tw-mt-3 tw-block"
                  >
                    {$t({ id: 'jobs.details.match.addSkills' })}
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {company && (
            <Card>
              <CardContent className="tw-flex tw-flex-col tw-gap-3 tw-p-5">
                <Box className="tw-flex tw-items-center tw-gap-2">
                  <IconTile icon={MdBusiness} color="sky" size="sm" />
                  <Typography variant="h6">{$t({ id: 'jobs.details.company' })}</Typography>
                </Box>
                <Box>
                  <Typography fontWeight={700}>{company.name}</Typography>
                  {(company.industry || company.size) && (
                    <Typography variant="body2" color="text.secondary">
                      {[
                        company.industry,
                        company.size && $t({ id: 'jobs.details.companySize' }, { size: company.size }),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                  )}
                </Box>
                {company.about && (
                  <Typography variant="body2" className="tw-line-clamp-6 tw-whitespace-pre-line">
                    {company.about}
                  </Typography>
                )}
                {company.website && (
                  <Link
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                    fontWeight={600}
                    className="tw-flex tw-items-center tw-gap-1.5"
                  >
                    <MdLanguage />
                    {company.website.replace(/^https?:\/\//, '')}
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      <ApplyDialog job={job} open={applyOpen} onClose={() => setApplyOpen(false)} />
    </Box>
  );
}
