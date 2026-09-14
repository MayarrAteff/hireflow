import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MdClose, MdSearch } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { EmptyJobsIllustration } from '@/components/UI/Illustrations';
import { EMPLOYMENT_TYPES, WORK_MODES } from '@/constants/jobs';
import { useCandidateApplications } from '@/hooks/useApplications';
import { usePublishedJobsCount, usePublishedJobsSearch } from '@/hooks/useJobs';
import { brandGradient } from '@/styles/themes/accents';
import type { EmploymentType, WorkMode } from '@/types/job.types';
import { useAuth } from '@/utils/hooks/useAuth';
import { useDebouncedValue } from '@/utils/hooks/useDebouncedValue';

import { JobCard } from '../components/JobCard';

type FilterChipsProps<T extends string> = {
  labelId: string;
  options: T[];
  optionLabelPrefix: string;
  value: T | null;
  onChange: (value: T | null) => void;
};

function FilterChips<T extends string>({ labelId, options, optionLabelPrefix, value, onChange }: FilterChipsProps<T>) {
  const { $t } = useIntl();

  return (
    <Box className="tw-flex tw-flex-wrap tw-items-center tw-gap-1.5" role="group" aria-label={$t({ id: labelId })}>
      <Typography variant="body2" color="text.secondary" className="tw-me-1">
        {$t({ id: labelId })}
      </Typography>
      <Chip
        label={$t({ id: 'jobs.list.filter.all' })}
        color={value === null ? 'primary' : 'default'}
        variant={value === null ? 'filled' : 'outlined'}
        onClick={() => onChange(null)}
      />
      {options.map((option) => (
        <Chip
          key={option}
          label={$t({ id: `${optionLabelPrefix}.${option}` })}
          color={value === option ? 'primary' : 'default'}
          variant={value === option ? 'filled' : 'outlined'}
          onClick={() => onChange(value === option ? null : option)}
        />
      ))}
    </Box>
  );
}

export function BrowseJobs() {
  const { $t } = useIntl();
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType | null>(null);
  const [workMode, setWorkMode] = useState<WorkMode | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const filters = useMemo(
    () => ({ search: debouncedSearch, employmentType, workMode }),
    [debouncedSearch, employmentType, workMode],
  );
  const jobsQuery = usePublishedJobsSearch(filters);
  const openJobsQuery = usePublishedJobsCount();
  const applicationsQuery = useCandidateApplications(profile?.id);

  const jobs = jobsQuery.data?.pages.flat() ?? [];
  const appliedJobIds = new Set(applicationsQuery.data?.map((application) => application.job_id));
  const hasFilters = Boolean(search.trim() || employmentType || workMode);

  const clearFilters = () => {
    setSearch('');
    setEmploymentType(null);
    setWorkMode(null);
  };

  return (
    <Box className="tw-mx-auto tw-flex tw-max-w-6xl tw-flex-col tw-gap-6">
      <Box
        className="tw-relative tw-overflow-hidden tw-rounded-3xl tw-p-6 tw-text-white sm:tw-p-10"
        sx={(theme) => ({ background: brandGradient(theme) })}
      >
        <Box aria-hidden className="tw-absolute -tw-end-16 -tw-top-24 tw-h-64 tw-w-64 tw-rounded-full tw-bg-white/10" />
        <Box className="tw-relative tw-max-w-2xl">
          <Typography variant="h2" className="tw-mb-2">
            {$t({ id: 'jobs.browse.title' })}
          </Typography>
          <Typography className="tw-mb-6 tw-text-white/85">
            {$t({ id: 'jobs.browse.subtitle' }, { count: openJobsQuery.data ?? 0 })}
          </Typography>
          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={$t({ id: 'jobs.browse.searchPlaceholder' })}
            fullWidth
            slotProps={{
              htmlInput: { 'aria-label': $t({ id: 'jobs.browse.searchPlaceholder' }) },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MdSearch size={22} />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearch('')}
                      aria-label={$t({ id: 'jobs.browse.clearSearch' })}
                    >
                      <MdClose />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: `0 10px 30px -12px ${alpha('#000', 0.35)}`,
              },
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            }}
          />
        </Box>
      </Box>

      <Card>
        <CardContent className="tw-flex tw-flex-col tw-gap-3 lg:tw-flex-row lg:tw-items-center lg:tw-gap-8">
          <FilterChips
            labelId="jobs.field.employmentType"
            options={EMPLOYMENT_TYPES}
            optionLabelPrefix="jobs.employmentType"
            value={employmentType}
            onChange={setEmploymentType}
          />
          <FilterChips
            labelId="jobs.field.workMode"
            options={WORK_MODES}
            optionLabelPrefix="jobs.workMode"
            value={workMode}
            onChange={setWorkMode}
          />
          {hasFilters && (
            <Button size="small" onClick={clearFilters} className="lg:tw-ms-auto">
              {$t({ id: 'jobs.browse.clearFilters' })}
            </Button>
          )}
        </CardContent>
      </Card>

      {jobsQuery.isPending && (
        <Box className="tw-grid tw-gap-4 sm:tw-grid-cols-2 lg:tw-grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={150} className="tw-rounded-2xl" />
          ))}
        </Box>
      )}

      {!jobsQuery.isPending && jobs.length === 0 && (
        <Card>
          <CardContent className="tw-flex tw-flex-col tw-items-center tw-py-12 tw-text-center">
            <EmptyJobsIllustration className="tw-mb-3 tw-w-44" />
            <Typography variant="h4" className="tw-mb-1">
              {$t({ id: hasFilters ? 'jobs.browse.noMatches.title' : 'jobs.browse.empty.title' })}
            </Typography>
            <Typography color="text.secondary" className="tw-mb-5 tw-max-w-md">
              {$t({ id: hasFilters ? 'jobs.browse.noMatches.body' : 'jobs.browse.empty.body' })}
            </Typography>
            {hasFilters && (
              <Button variant="outlined" onClick={clearFilters}>
                {$t({ id: 'jobs.browse.clearFilters' })}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {jobs.length > 0 && (
        <Box className="tw-grid tw-gap-4 sm:tw-grid-cols-2 lg:tw-grid-cols-3">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              // Only stagger the first screenful; later pages appear without a long delay.
              transition={{ delay: Math.min(index, 8) * 0.04 }}
            >
              <JobCard job={job} applied={appliedJobIds.has(job.id)} />
            </motion.div>
          ))}
        </Box>
      )}

      {jobsQuery.hasNextPage && (
        <Box className="tw-flex tw-justify-center">
          <Button
            variant="outlined"
            size="large"
            onClick={() => jobsQuery.fetchNextPage()}
            loading={jobsQuery.isFetchingNextPage}
          >
            {$t({ id: 'jobs.browse.loadMore' })}
          </Button>
        </Box>
      )}
    </Box>
  );
}
