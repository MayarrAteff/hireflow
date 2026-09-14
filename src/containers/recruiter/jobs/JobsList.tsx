import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
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
import { createLink, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { MdAdd, MdEdit } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { EmptyJobsIllustration } from '@/components/UI/Illustrations';
import { JOB_STATUS_COLOR } from '@/constants/jobs';
import { useCompanyJobs } from '@/hooks/useJobs';
import { JOB_FORM_STEPS } from '@/store/features/jobFormStepsSlice';
import { accentFor, accentSoftSx } from '@/styles/themes/accents';
import type { JobStatus } from '@/types/job.types';
import { useAuth } from '@/utils/hooks/useAuth';

import { CompanySetupCard } from './CompanySetupCard';

const IconButtonLink = createLink(IconButton);

type StatusFilter = JobStatus | 'all';
const STATUS_FILTERS: StatusFilter[] = ['all', 'published', 'draft', 'closed'];

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
    <Button variant="contained" size="large" startIcon={<MdAdd />} component={Link} to="/recruiter/jobs/new">
      {$t({ id: 'jobs.list.postJob' })}
    </Button>
  );

  return (
    <Box className="tw-mx-auto tw-max-w-6xl">
      <Box className="tw-mb-6 tw-flex tw-flex-wrap tw-items-end tw-justify-between tw-gap-4">
        <Box>
          <Typography variant="h2" className="tw-mb-1">
            {$t({ id: 'jobs.list.title' })}
          </Typography>
          <Typography color="text.secondary">{$t({ id: 'jobs.list.subtitle' })}</Typography>
        </Box>
        {jobs.length > 0 && postJobButton}
      </Box>

      {isPending && (
        <Card>
          <CardContent className="tw-space-y-3">
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} height={56} />
            ))}
          </CardContent>
        </Card>
      )}

      {!isPending && jobs.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="tw-flex tw-flex-col tw-items-center tw-px-6 tw-py-12 tw-text-center">
              <EmptyJobsIllustration className="tw-mb-4 tw-w-52" />
              <Typography variant="h3" className="tw-mb-2">
                {$t({ id: 'jobs.list.empty.title' })}
              </Typography>
              <Typography color="text.secondary" className="tw-mb-6 tw-max-w-md">
                {$t({ id: 'jobs.list.empty.body' })}
              </Typography>
              <Box className="tw-mb-8 tw-flex tw-flex-wrap tw-justify-center tw-gap-2">
                {JOB_FORM_STEPS.map((step, index) => (
                  <Chip
                    key={step}
                    variant="outlined"
                    avatar={<Avatar sx={{ bgcolor: 'primary.main', color: '#fff !important' }}>{index + 1}</Avatar>}
                    label={$t({ id: `jobs.step.${step}` })}
                  />
                ))}
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
            className="tw-mb-4 tw-flex-wrap"
          >
            {STATUS_FILTERS.map((status) => (
              <ToggleButton key={status} value={status} className="tw-gap-2 tw-px-4">
                {$t({ id: status === 'all' ? 'jobs.list.filter.all' : `jobs.status.${status}` })}
                <Chip size="small" label={countFor(status)} className="tw-h-5" />
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Card>
            <Box className="tw-overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{$t({ id: 'jobs.list.column.title' })}</TableCell>
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
                        <Box className="tw-flex tw-items-center tw-gap-3">
                          <Avatar
                            variant="rounded"
                            sx={(theme) => ({ ...accentSoftSx(theme, accentFor(job.title)), fontWeight: 600 })}
                          >
                            {job.title.slice(0, 1).toUpperCase()}
                          </Avatar>
                          <Box className="tw-min-w-0">
                            <Typography fontWeight={600}>{job.title}</Typography>
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
                      <TableCell>{$t({ id: `jobs.employmentType.${job.employment_type}` })}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={JOB_STATUS_COLOR[job.status]}
                          label={$t({ id: `jobs.status.${job.status}` })}
                        />
                      </TableCell>
                      <TableCell className="tw-whitespace-nowrap">
                        {formatDate(job.created_at, { dateStyle: 'medium' })}
                      </TableCell>
                      <TableCell align="right">
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
                      <TableCell colSpan={5} align="center" className="tw-py-10">
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
