import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MdAdd, MdAutoAwesome, MdClose, MdCompareArrows, MdEventAvailable, MdSearch } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { StageChip } from '@/components/Jobs/StageChip';
import { EmptyJobsIllustration } from '@/components/UI/Illustrations';
import { getNextInterview } from '@/constants/interviews';
import type { ApplicationStage, RecruiterApplication } from '@/types/application.types';
import type { Job } from '@/types/job.types';
import { getCandidateFits } from '@/utils/candidateFit';
import { useJobFormatters } from '@/utils/hooks/useJobFormatters';
import { getSkillMatch } from '@/utils/skillMatch';

import { ApplicantAvatar } from './ApplicantAvatar';
import { CompareDialog, MAX_COMPARE } from './compare/CompareDialog';
import { SkillMatchBar } from './SkillMatchBar';

/** How many applicants "Compare top matches" picks. */
const TOP_MATCHES = 3;

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
  onSchedule: (application: RecruiterApplication) => void;
  onMakeOffer: (application: RecruiterApplication) => void;
};

export function ApplicantsTab({
  job,
  applications,
  loading,
  onOpenApplicant,
  onSchedule,
  onMakeOffer,
}: ApplicantsTabProps) {
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

  const compareTopMatches = () => {
    const fits = getCandidateFits(job.skills, visible);
    const top = visible
      .map((application, index) => ({ id: application.id, score: fits[index].score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_MATCHES)
      .map(({ id }) => id);
    setSelectedIds(top);
    setCompareOpen(true);
  };

  if (!loading && applications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <EmptyJobsIllustration className="mb-3 w-44" />
          <Typography variant="h4" className="mb-1">
            {$t({ id: 'applicants.empty.title' })}
          </Typography>
          <Typography color="text.secondary" className="max-w-md">
            {$t({ id: job.status === 'published' ? 'applicants.empty.published' : 'applicants.empty.notPublished' })}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          <Box className="flex flex-col gap-3 sm:flex-row">
            <TextField
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={$t({ id: 'applicants.search' })}
              className="flex-1"
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
              className="sm:w-52"
            >
              {SORT_KEYS.map((key) => (
                <MenuItem key={key} value={key}>
                  {$t({ id: `applicants.sort.${key}` })}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box className="flex flex-wrap gap-1.5">
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

      <Box className="flex flex-wrap items-center justify-between gap-2 px-1">
        <Typography variant="body2" color="text.secondary" className="flex items-center gap-1.5">
          <MdCompareArrows className="shrink-0" />
          {$t({ id: 'applicants.compareHint' }, { max: MAX_COMPARE })}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<MdAutoAwesome />}
          disabled={visible.length < 2}
          onClick={compareTopMatches}
        >
          {$t({ id: 'applicants.compareTopMatches' })}
        </Button>
      </Box>

      <Card>
        {visible.length === 0 ? (
          <CardContent className="py-10 text-center">
            <Typography color="text.secondary">{$t({ id: 'applicants.noMatches' })}</Typography>
          </CardContent>
        ) : (
          <Box component="ul" className="m-0 list-none p-0">
            {visible.map((application, index) => {
              const { candidate } = application;
              const isSelected = selectedIds.includes(application.id);
              const selectionFull = selectedIds.length >= MAX_COMPARE && !isSelected;
              const nextInterview = getNextInterview(application.interviews);
              return (
                <Box
                  component="li"
                  key={application.id}
                  className="flex items-center gap-2 px-2 sm:px-3"
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
                    className="grid min-w-0 flex-1 items-center gap-x-4 gap-y-1 rounded-xl py-3 text-start md:grid-cols-[minmax(0,2fr)_140px_110px_120px]"
                    sx={{ '&:hover': { bgcolor: 'action.hover' }, px: 1 }}
                  >
                    <Box className="flex min-w-0 items-center gap-3">
                      <ApplicantAvatar candidate={candidate} />
                      <Box className="min-w-0">
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
                    <Box className="hidden md:block">
                      <SkillMatchBar percent={matchById.get(application.id)?.percent ?? 0} />
                    </Box>
                    <Box className="hidden md:flex md:flex-col md:items-start md:gap-0.5">
                      <StageChip stage={application.stage} />
                      {nextInterview && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          className="flex items-center gap-1"
                        >
                          <MdEventAvailable />
                          {formatDate(nextInterview.scheduled_at, { month: 'short', day: 'numeric' })}
                        </Typography>
                      )}
                    </Box>
                    <Box className="hidden md:block">
                      {application.rating ? (
                        <Rating value={application.rating} readOnly size="small" />
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          {$t({ id: 'applicants.notRated' })}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" className="block">
                        {formatRelativeDay(application.created_at)}
                      </Typography>
                    </Box>
                    <Box className="flex items-center gap-2 md:hidden">
                      <StageChip stage={application.stage} />
                      <Box className="w-28">
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
            className="sticky bottom-4 z-10 flex justify-center"
          >
            <Paper elevation={8} className="flex items-center gap-3 rounded-full py-2 pe-2 ps-3">
              <Box className="flex gap-1.5">
                {Array.from({ length: MAX_COMPARE }, (_, slot) => {
                  const application = selected[slot];
                  if (!application) {
                    return (
                      <Box
                        key={`empty-${slot}`}
                        aria-hidden
                        className="flex h-9 w-9 items-center justify-center rounded-full"
                        sx={{ border: 2, borderStyle: 'dashed', borderColor: 'divider', color: 'text.disabled' }}
                      >
                        <MdAdd />
                      </Box>
                    );
                  }
                  const name = application.candidate.full_name || application.candidate.email;
                  return (
                    <Box key={application.id} className="relative">
                      <Tooltip title={name}>
                        <Box component="span" className="block">
                          <ApplicantAvatar candidate={application.candidate} size={36} />
                        </Box>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={() => toggleSelected(application.id)}
                        aria-label={$t({ id: 'compare.remove' }, { name })}
                        className="absolute -end-1.5 -top-1.5 h-[18px] w-[18px] p-0"
                        sx={{
                          bgcolor: 'text.primary',
                          color: 'background.paper',
                          '&:hover': { bgcolor: 'text.secondary' },
                        }}
                      >
                        <MdClose size={12} />
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>
              <Typography variant="body2" fontWeight={600} className="hidden sm:block">
                {selected.length < 2
                  ? $t({ id: 'applicants.pickMore' }, { count: 2 - selected.length })
                  : $t({ id: 'applicants.selected' }, { count: selected.length, max: MAX_COMPARE })}
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
                className="rounded-full"
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
        applications={applications}
        selectedIds={selected.map((application) => application.id)}
        onSelectionChange={setSelectedIds}
        onClose={() => setCompareOpen(false)}
        onOpenApplicant={onOpenApplicant}
        onSchedule={onSchedule}
        onMakeOffer={onMakeOffer}
      />
    </Box>
  );
}
