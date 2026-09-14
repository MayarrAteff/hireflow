import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { createLink, Link as RouterLink } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { MdAdd, MdEdit } from 'react-icons/md';
import { PiKanbanDuotone } from 'react-icons/pi';
import { useIntl } from 'react-intl';

import { JobStatusChip } from '@/components/Jobs/JobStatusChip';
import { countNewApplicants, NewApplicantsBadge } from '@/components/Jobs/NewApplicantsBadge';
import { EmptyJobsIllustration } from '@/components/UI/Illustrations';
import { APPLICATION_STAGE_COLOR } from '@/constants/applications';
import { useCompanyJobs } from '@/hooks/useJobs';
import { ACCENT_COLORS, accentFor, accentSoftSx } from '@/styles/themes/accents';
import type { ApplicationStage } from '@/types/application.types';
import type { JobStatus, JobWithApplicantStages } from '@/types/job.types';
import { useAuth } from '@/utils/hooks/useAuth';

import { CompanySetupCard } from './CompanySetupCard';
import { JobStepsJourney } from './JobStepsJourney';

const IconButtonLink = createLink(IconButton);
const MuiRouterLink = createLink(Link);
const BoxLink = createLink(Box);

type StatusFilter = JobStatus | 'all';
const STATUS_FILTERS: StatusFilter[] = ['all', 'published', 'draft', 'closed'];
const BREAKDOWN_STAGES: ApplicationStage[] = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

/** Total applicants, how many nobody has opened yet, and a mini stage bar that opens the hiring board. */
function ApplicantsCell({ job }: { job: JobWithApplicantStages }) {
  const { $t, formatNumber } = useIntl();
  const applications = job.applications ?? [];
  const total = applications.length;

  if (total === 0) {
    return (
      <Typography variant="body2" color="text.disabled" className="whitespace-nowrap">
        {$t({ id: 'jobs.list.applicants.none' })}
      </Typography>
    );
  }

  const stageCounts = BREAKDOWN_STAGES.map((stage) => ({
    stage,
    count: applications.filter((application) => application.stage === stage).length,
    color: ACCENT_COLORS[APPLICATION_STAGE_COLOR[stage]],
  })).filter(({ count }) => count > 0);

  const breakdown = (
    <Box component="ul" className="m-0 flex list-none flex-col gap-1 p-1">
      {stageCounts.map(({ stage, count, color }) => (
        <Box component="li" key={stage} className="flex items-center gap-2">
          <Box className="h-2 w-2 shrink-0 rounded-full" sx={{ bgcolor: color }} />
          <span className="flex-1">{$t({ id: `application.stage.${stage}` })}</span>
          <span className="ms-4 font-semibold tabular-nums">{formatNumber(count)}</span>
        </Box>
      ))}
    </Box>
  );

  return (
    <Tooltip title={breakdown} placement="bottom-start">
      <BoxLink
        to="/recruiter/jobs/$jobId"
        params={{ jobId: job.id }}
        search={{ tab: 'board' }}
        aria-label={$t({ id: 'jobs.list.applicants.view' }, { count: total })}
        className="-mx-2 flex w-36 flex-col gap-1.5 rounded-lg px-2 py-1.5 no-underline"
        sx={(theme) => ({
          color: 'text.primary',
          transition: theme.transitions.create('background-color'),
          '&:hover, &:focus-visible': { bgcolor: 'action.hover' },
        })}
      >
        <Box className="flex items-center gap-2">
          <Typography fontWeight={700} className="tabular-nums">
            {formatNumber(total)}
          </Typography>
          <NewApplicantsBadge count={countNewApplicants(applications)} />
        </Box>
        <Box aria-hidden className="flex h-1.5 gap-px overflow-hidden rounded-full">
          {stageCounts.map(({ stage, count, color }) => (
            <Box key={stage} sx={{ flexGrow: count, bgcolor: color }} />
          ))}
        </Box>
      </BoxLink>
    </Tooltip>
  );
}

export function JobsList() {
  const { $t, formatDate } = useIntl();
  const { profile } = useAuth();
  const { data: jobs = [], isPending } = useCompanyJobs(profile?.company_id);
  const [filter, setFilter] = useState<StatusFilter>('all');

  if (!profile?.company_id) return <CompanySetupCard />;

  const countFor = (status: StatusFilter) =>
    status === 'all' ? jobs.length : jobs.filter((job) => job.status === status).length;
  const visibleJobs = filter === 'all' ? jobs : jobs.filter((job) => job.status === filter);

  const postJobButton = (
    <Button variant="contained" size="large" startIcon={<MdAdd />} component={RouterLink} to="/recruiter/jobs/new">
      {$t({ id: 'jobs.list.postJob' })}
    </Button>
  );

  return (
    <Box className="mx-auto max-w-6xl">
      <Box className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <Box>
          <Typography variant="h2" className="mb-1">
            {$t({ id: 'jobs.list.title' })}
          </Typography>
          <Typography color="text.secondary">{$t({ id: 'jobs.list.subtitle' })}</Typography>
        </Box>
        {jobs.length > 0 && postJobButton}
      </Box>

      {isPending && (
        <Card>
          <CardContent className="space-y-3">
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} height={56} />
            ))}
          </CardContent>
        </Card>
      )}

      {!isPending && jobs.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="flex flex-col items-center px-6 py-12 text-center">
              <EmptyJobsIllustration className="mb-4 w-52" />
              <Typography variant="h3" className="mb-2">
                {$t({ id: 'jobs.list.empty.title' })}
              </Typography>
              <Typography color="text.secondary" className="mb-6 max-w-md">
                {$t({ id: 'jobs.list.empty.body' })}
              </Typography>
              <Box className="mb-8 flex w-full justify-center">
                <JobStepsJourney />
              </Box>
              {postJobButton}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {jobs.length > 0 && (
        <>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={filter}
            onChange={(_event, value: StatusFilter | null) => value && setFilter(value)}
            className="mb-4 flex-wrap"
          >
            {STATUS_FILTERS.map((status) => (
              <ToggleButton key={status} value={status} className="gap-2 px-4">
                {$t({ id: status === 'all' ? 'jobs.list.filter.all' : `jobs.status.${status}` })}
                <Chip size="small" label={countFor(status)} className="h-5" />
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Card>
            <Box className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{$t({ id: 'jobs.list.column.title' })}</TableCell>
                    <TableCell>{$t({ id: 'jobs.list.column.applicants' })}</TableCell>
                    <TableCell>{$t({ id: 'jobs.list.column.type' })}</TableCell>
                    <TableCell>{$t({ id: 'jobs.list.column.status' })}</TableCell>
                    <TableCell>{$t({ id: 'jobs.list.column.created' })}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleJobs.map((job) => (
                    <TableRow key={job.id} hover>
                      <TableCell>
                        <Box className="flex items-center gap-3">
                          <Avatar
                            variant="rounded"
                            sx={(theme) => ({ ...accentSoftSx(theme, accentFor(job.title)), fontWeight: 600 })}
                          >
                            {job.title.slice(0, 1).toUpperCase()}
                          </Avatar>
                          <Box className="min-w-0">
                            <MuiRouterLink
                              to="/recruiter/jobs/$jobId"
                              params={{ jobId: job.id }}
                              underline="hover"
                              color="text.primary"
                              fontWeight={600}
                            >
                              {job.title}
                            </MuiRouterLink>
                            <Typography variant="body2" color="text.secondary">
                              {[
                                $t({ id: `jobs.workMode.${job.work_mode}` }),
                                job.location,
                                job.deadline &&
                                  $t(
                                    { id: 'jobs.list.closes' },
                                    { date: formatDate(job.deadline, { dateStyle: 'medium' }) },
                                  ),
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <ApplicantsCell job={job} />
                      </TableCell>
                      <TableCell>{$t({ id: `jobs.employmentType.${job.employment_type}` })}</TableCell>
                      <TableCell>
                        <JobStatusChip status={job.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(job.created_at, { dateStyle: 'medium' })}
                      </TableCell>
                      <TableCell align="right" className="whitespace-nowrap">
                        <Tooltip title={$t({ id: 'jobs.list.openBoard' })}>
                          <IconButtonLink
                            to="/recruiter/jobs/$jobId"
                            params={{ jobId: job.id }}
                            search={{ tab: 'board' }}
                            aria-label={$t({ id: 'jobs.list.openBoard' })}
                          >
                            <PiKanbanDuotone />
                          </IconButtonLink>
                        </Tooltip>
                        <Tooltip title={$t({ id: 'jobs.edit' })}>
                          <IconButtonLink
                            to="/recruiter/jobs/$jobId/edit"
                            params={{ jobId: job.id }}
                            aria-label={$t({ id: 'jobs.edit' })}
                          >
                            <MdEdit />
                          </IconButtonLink>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {visibleJobs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" className="py-10">
                        <Typography color="text.secondary">{$t({ id: 'jobs.list.filter.empty' })}</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Card>
        </>
      )}
    </Box>
  );
}
