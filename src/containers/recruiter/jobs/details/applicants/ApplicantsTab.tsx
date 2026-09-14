import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MdCompareArrows, MdEventAvailable, MdSearch } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { StageChip } from '@/components/Jobs/StageChip';
import { EmptyJobsIllustration } from '@/components/UI/Illustrations';
import { getNextInterview } from '@/constants/interviews';
import type { ApplicationStage, RecruiterApplication } from '@/types/application.types';
import type { Job } from '@/types/job.types';
import { useJobFormatters } from '@/utils/hooks/useJobFormatters';
import { getSkillMatch } from '@/utils/skillMatch';

import { ApplicantAvatar } from './ApplicantAvatar';
import { CompareDialog } from './CompareDialog';
import { SkillMatchBar } from './SkillMatchBar';

export const MAX_COMPARE = 3;

type SortKey = 'newest' | 'match' | 'rating';
const SORT_KEYS: SortKey[] = ['newest', 'match', 'rating'];
const STAGE_FILTERS: (ApplicationStage | 'all')[] = [
  'all',
  'applied',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
];

type ApplicantsTabProps = {
  job: Job;
  applications: RecruiterApplication[];
  loading: boolean;
  onOpenApplicant: (applicationId: string) => void;
};

export function ApplicantsTab({ job, applications, loading, onOpenApplicant }: ApplicantsTabProps) {
  const { $t, formatDate } = useIntl();
  const { formatRelativeDay } = useJobFormatters();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<ApplicationStage | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const matchById = useMemo(
    () =>
      new Map(
        applications.map((application) => [
          application.id,
          getSkillMatch(job.skills, application.candidate.skills ?? []),
        ]),
      ),
    [applications, job.skills],
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = applications.filter(
      (application) =>
        (stageFilter === 'all' || application.stage === stageFilter) &&
        (!term ||
          [application.candidate.full_name, application.candidate.headline, application.candidate.email]
            .filter(Boolean)
            .some((value) => (value as string).toLowerCase().includes(term))),
    );
    const sorters: Record<SortKey, (a: RecruiterApplication, b: RecruiterApplication) => number> = {
      newest: (a, b) => b.created_at.localeCompare(a.created_at),
      match: (a, b) => (matchById.get(b.id)?.percent ?? 0) - (matchById.get(a.id)?.percent ?? 0),
      rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
    };
    return [...filtered].sort(sorters[sort]);
  }, [applications, search, stageFilter, sort, matchById]);

  const selected = selectedIds
    .map((id) => applications.find((application) => application.id === id))
    .filter(Boolean) as RecruiterApplication[];

  const stageLabel = (stage: ApplicationStage | 'all') =>
    $t({ id: stage === 'all' ? 'jobs.list.filter.all' : 'application.stage.' + stage });

  const toggleSelected = (applicationId: string) =>
    setSelectedIds((current) =>
      current.includes(applicationId)
        ? current.filter((id) => id !== applicationId)
        : current.length < MAX_COMPARE
          ? [...current, applicationId]
          : current,
    );

  if (!loading && applications.length === 0) {
    return (
      <Card>
        <CardContent className="tw-flex tw-flex-col tw-items-center tw-py-12 tw-text-center">
          <EmptyJobsIllustration className="tw-mb-3 tw-w-44" />
          <Typography variant="h4" className="tw-mb-1">
            {$t({ id: 'applicants.empty.title' })}
          </Typography>
          <Typography color="text.secondary" className="tw-max-w-md">
            {$t({ id: job.status === 'published' ? 'applicants.empty.published' : 'applicants.empty.notPublished' })}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box className="tw-flex tw-flex-col tw-gap-4">
      <Card>
        <CardContent className="tw-flex tw-flex-col tw-gap-3 tw-p-4">
          <Box className="tw-flex tw-flex-col tw-gap-3 sm:tw-flex-row">
            <TextField
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={$t({ id: 'applicants.search' })}
              className="tw-flex-1"
              slotProps={{
                htmlInput: { 'aria-label': $t({ id: 'applicants.search' }) },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MdSearch />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              select
              size="small"
              label={$t({ id: 'applicants.sort' })}
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="sm:tw-w-52"
            >
              {SORT_KEYS.map((key) => (
                <MenuItem key={key} value={key}>
                  {$t({ id: `applicants.sort.${key}` })}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box className="tw-flex tw-flex-wrap tw-gap-1.5">
            {STAGE_FILTERS.map((stage) => {
              const count =
                stage === 'all' ? applications.length : applications.filter((a) => a.stage === stage).length;
              const active = stageFilter === stage;
              return (
                <Chip
                  key={stage}
                  size="small"
                  color={active ? 'primary' : 'default'}
                  variant={active ? 'filled' : 'outlined'}
                  label={`${stageLabel(stage)} · ${count}`}
                  onClick={() => setStageFilter(stage)}
                />
              );
            })}
          </Box>
        </CardContent>
      </Card>

      <Typography variant="body2" color="text.secondary" className="tw-flex tw-items-center tw-gap-1.5 tw-px-1">
        <MdCompareArrows />
        {$t({ id: 'applicants.compareHint' }, { max: MAX_COMPARE })}
      </Typography>

      <Card>
        {visible.length === 0 ? (
          <CardContent className="tw-py-10 tw-text-center">
            <Typography color="text.secondary">{$t({ id: 'applicants.noMatches' })}</Typography>
          </CardContent>
        ) : (
          <Box component="ul" className="tw-m-0 tw-list-none tw-p-0">
            {visible.map((application, index) => {
              const { candidate } = application;
              const isSelected = selectedIds.includes(application.id);
              const selectionFull = selectedIds.length >= MAX_COMPARE && !isSelected;
              const nextInterview = getNextInterview(application.interviews);
              return (
                <Box
                  component="li"
                  key={application.id}
                  className="tw-flex tw-items-center tw-gap-2 tw-px-2 sm:tw-px-3"
                  sx={{
                    borderTop: index === 0 ? 0 : 1,
                    borderColor: 'divider',
                    bgcolor: isSelected ? 'action.selected' : undefined,
                  }}
                >
                  <Tooltip title={selectionFull ? $t({ id: 'applicants.compareFull' }, { max: MAX_COMPARE }) : ''}>
                    <span>
                      <Checkbox
                        checked={isSelected}
                        disabled={selectionFull}
                        onChange={() => toggleSelected(application.id)}
                        slotProps={{
                          input: {
                            'aria-label': $t({ id: 'applicants.selectForCompare' }, { name: candidate.full_name }),
                          },
                        }}
                      />
                    </span>
                  </Tooltip>
                  <ButtonBase
                    onClick={() => onOpenApplicant(application.id)}
                    className="tw-grid tw-min-w-0 tw-flex-1 tw-items-center tw-gap-x-4 tw-gap-y-1 tw-rounded-xl tw-py-3 tw-text-start md:tw-grid-cols-[minmax(0,2fr)_140px_110px_120px]"
                    sx={{ '&:hover': { bgcolor: 'action.hover' }, px: 1 }}
                  >
                    <Box className="tw-flex tw-min-w-0 tw-items-center tw-gap-3">
                      <ApplicantAvatar candidate={candidate} />
                      <Box className="tw-min-w-0">
                        <Typography fontWeight={600} noWrap>
                          {candidate.full_name || candidate.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {[
                            candidate.headline,
                            candidate.years_of_experience != null &&
                              $t({ id: 'applicants.years' }, { years: candidate.years_of_experience }),
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </Typography>
                      </Box>
                    </Box>
                    <Box className="tw-hidden md:tw-block">
                      <SkillMatchBar percent={matchById.get(application.id)?.percent ?? 0} />
                    </Box>
                    <Box className="tw-hidden md:tw-flex md:tw-flex-col md:tw-items-start md:tw-gap-0.5">
                      <StageChip stage={application.stage} />
                      {nextInterview && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          className="tw-flex tw-items-center tw-gap-1"
                        >
                          <MdEventAvailable />
                          {formatDate(nextInterview.scheduled_at, { month: 'short', day: 'numeric' })}
                        </Typography>
                      )}
                    </Box>
                    <Box className="tw-hidden md:tw-block">
                      {application.rating ? (
                        <Rating value={application.rating} readOnly size="small" />
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          {$t({ id: 'applicants.notRated' })}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" className="tw-block">
                        {formatRelativeDay(application.created_at)}
                      </Typography>
                    </Box>
                    <Box className="tw-flex tw-items-center tw-gap-2 md:tw-hidden">
                      <StageChip stage={application.stage} />
                      <Box className="tw-w-28">
                        <SkillMatchBar percent={matchById.get(application.id)?.percent ?? 0} />
                      </Box>
                    </Box>
                  </ButtonBase>
                </Box>
              );
            })}
          </Box>
        )}
      </Card>

      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="tw-sticky tw-bottom-4 tw-z-10 tw-flex tw-justify-center"
          >
            <Paper elevation={8} className="tw-flex tw-items-center tw-gap-3 tw-rounded-full tw-py-2 tw-pe-2 tw-ps-4">
              <Box className="tw-flex -tw-space-x-2 rtl:tw-space-x-reverse">
                {selected.map((application) => (
                  <ApplicantAvatar
                    key={application.id}
                    candidate={application.candidate}
                    size={32}
                    sx={{ border: 2, borderColor: 'background.paper' }}
                  />
                ))}
              </Box>
              <Typography variant="body2" fontWeight={600} className="tw-hidden sm:tw-block">
                {$t({ id: 'applicants.selected' }, { count: selected.length, max: MAX_COMPARE })}
              </Typography>
              <Button size="small" onClick={() => setSelectedIds([])}>
                {$t({ id: 'applicants.clearSelection' })}
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<MdCompareArrows />}
                disabled={selected.length < 2}
                onClick={() => setCompareOpen(true)}
                className="tw-rounded-full"
              >
                {$t({ id: 'applicants.compare' })}
              </Button>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      <CompareDialog
        open={compareOpen && selected.length >= 2}
        job={job}
        applications={selected}
        onClose={() => setCompareOpen(false)}
        onOpenApplicant={(applicationId) => {
          setCompareOpen(false);
          onOpenApplicant(applicationId);
        }}
      />
    </Box>
  );
}
