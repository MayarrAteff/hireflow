import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Rating from '@mui/material/Rating';
import { alpha, useTheme } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import { type ReactNode, useState } from 'react';
import type { IconType } from 'react-icons';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import {
  MdAdd,
  MdAssignment,
  MdCheckCircle,
  MdClose,
  MdCompareArrows,
  MdDifference,
  MdErrorOutline,
  MdEventNote,
  MdLanguage,
  MdOpenInNew,
  MdPlace,
  MdPsychology,
  MdTrendingUp,
  MdViewAgenda,
  MdWorkHistory,
} from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import { getNextInterview, INTERVIEW_TYPE_VISUALS } from '@/constants/interviews';
import { useApplicationMoves } from '@/hooks/useApplicationMutations';
import { useOpenCv } from '@/hooks/useOpenCv';
import { accentSoftSx, brandGradient } from '@/styles/themes/accents';
import type { ApplicationStage, RecruiterApplication } from '@/types/application.types';
import type { Job } from '@/types/job.types';
import { getCandidateFits, getLeaders } from '@/utils/candidateFit';
import { useJobFormatters } from '@/utils/hooks/useJobFormatters';

import { ApplicantAvatar } from '../ApplicantAvatar';
import { SkillMatchBar } from '../SkillMatchBar';
import { CompareActions } from './CompareActions';
import { CompareAddCandidate } from './CompareAddCandidate';
import { CompareSectionTitle, ExpandableText, LeaderMark } from './CompareBits';
import { CompareCandidateHeader } from './CompareCandidateHeader';

export const MAX_COMPARE = 4;

type SectionKey = 'skills' | 'background' | 'application' | 'pipeline';

type CompareRow = {
  key: string;
  label: string;
  hidden?: boolean;
  render: (application: RecruiterApplication, index: number) => ReactNode;
};

type GridRow =
  | { key: string; kind: 'title'; section: CompareSection; open: boolean }
  | { key: string; kind: 'note'; node: ReactNode }
  | { key: string; kind: 'cells'; divided: boolean; render: CompareRow['render'] };

type CompareSection = {
  key: SectionKey;
  icon: IconType;
  title: string;
  /** Shown once across all columns, under the section title. */
  note?: ReactNode;
  rows: CompareRow[];
};

const normalize = (value: string) => value.trim().toLowerCase();
const allSame = (values: unknown[]) => values.every((value) => value === values[0]);

type CompareDialogProps = {
  open: boolean;
  job: Job;
  /** Every application on the job; the compared ones are picked by `selectedIds`. */
  applications: RecruiterApplication[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onClose: () => void;
  onOpenApplicant: (applicationId: string) => void;
  onSchedule: (application: RecruiterApplication) => void;
};

/** Full-screen workspace for weighing 2–4 applicants against each other and deciding on the spot. */
export function CompareDialog({
  open,
  job,
  applications,
  selectedIds,
  onSelectionChange,
  onClose,
  onOpenApplicant,
  onSchedule,
}: CompareDialogProps) {
  const { $t, formatDate, formatList } = useIntl();
  const theme = useTheme();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { formatRelativeDay } = useJobFormatters();
  const { openCv, openingPath } = useOpenCv();
  const moves = useApplicationMoves(job.id);
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [collapsed, setCollapsed] = useState<SectionKey[]>([]);

  // Looked up from the live list so stage and rating changes show immediately.
  const compared = selectedIds
    .map((id) => applications.find((application) => application.id === id))
    .filter(Boolean) as RecruiterApplication[];
  const others = applications.filter((application) => !selectedIds.includes(application.id));
  const canAdd = compared.length < MAX_COMPARE && others.length > 0;

  const fits = getCandidateFits(job.skills, compared);
  const years = compared.map((application) => application.candidate.years_of_experience);
  const maxYears = Math.max(0, ...years.map((value) => value ?? 0));
  const skillLeaders = getLeaders(fits.map((fit) => fit.match.percent));
  const experienceLeaders = getLeaders(years);
  const ratingLeaders = getLeaders(compared.map((application) => application.rating));
  const scoreLeaders = getLeaders(fits.map((fit) => fit.score));
  const topIndex = scoreLeaders.size === 1 ? [...scoreLeaders][0] : -1;

  const sharedSkills = job.skills.filter((skill) => fits.every((fit) => fit.match.matched.has(skill)));
  const missingForAll = job.skills.filter((skill) => fits.every((fit) => !fit.match.matched.has(skill)));
  const shownSkills = onlyDifferences
    ? job.skills.filter((skill) => !sharedSkills.includes(skill) && !missingForAll.includes(skill))
    : job.skills;
  const jobSkillSet = new Set(job.skills.map(normalize));
  const extraSkills = compared.map((application) =>
    (application.candidate.skills ?? []).filter((skill) => !jobSkillSet.has(normalize(skill))),
  );
  const linksFor = (application: RecruiterApplication) =>
    [
      { url: application.candidate.linkedin_url, labelId: 'profile.field.linkedin', icon: <FaLinkedin /> },
      { url: application.candidate.github_url, labelId: 'profile.field.github', icon: <FaGithub /> },
      { url: application.candidate.portfolio_url, labelId: 'profile.field.portfolio', icon: <MdLanguage /> },
    ].filter((link) => link.url);

  const nameOf = (application: RecruiterApplication) => application.candidate.full_name || application.candidate.email;

  const moveTo = (application: RecruiterApplication, stage: ApplicationStage) => {
    const previous = application.stage;
    moves.mutate([{ id: application.id, payload: { stage } }]);
    enqueueSnackbar(
      $t({ id: 'compare.moved' }, { name: nameOf(application), stage: $t({ id: `application.stage.${stage}` }) }),
      {
        variant: stage === 'rejected' ? 'default' : 'success',
        action: (key) => (
          <Button
            size="small"
            onClick={() => {
              moves.mutate([{ id: application.id, payload: { stage: previous } }]);
              closeSnackbar(key);
            }}
          >
            {$t({ id: 'compare.undo' })}
          </Button>
        ),
      },
    );
  };

  const highlightsFor = (application: RecruiterApplication, index: number) => {
    const { match } = fits[index];
    const strengths: string[] = [];
    if (match.total > 0 && match.matchedCount === match.total) strengths.push($t({ id: 'compare.strength.allSkills' }));
    else if (skillLeaders.has(index)) strengths.push($t({ id: 'compare.strength.topMatch' }));
    if (experienceLeaders.has(index)) strengths.push($t({ id: 'compare.strength.mostExperienced' }));
    if (ratingLeaders.has(index)) strengths.push($t({ id: 'compare.strength.topRated' }));
    if (getNextInterview(application.interviews)) strengths.push($t({ id: 'compare.strength.interviewBooked' }));

    const missing = job.skills.filter((skill) => !match.matched.has(skill));
    const gaps: string[] = [];
    if (missing.length) {
      gaps.push(
        $t(
          { id: 'compare.gap.missingSkills' },
          { skills: formatList(missing.slice(0, 2)), more: Math.max(0, missing.length - 2) },
        ),
      );
    }
    if (!application.cv_path) gaps.push($t({ id: 'compare.gap.noCv' }));
    if (!application.cover_letter) gaps.push($t({ id: 'compare.gap.noCoverLetter' }));
    if (!application.rating) gaps.push($t({ id: 'compare.gap.notRated' }));

    return { strengths: strengths.slice(0, 3), gaps: gaps.slice(0, 3) };
  };

  const empty = (text = '—') => (
    <Typography variant="body2" color="text.disabled">
      {text}
    </Typography>
  );

  const sections: CompareSection[] = [
    {
      key: 'skills',
      icon: MdPsychology,
      title: $t({ id: 'compare.section.skills' }),
      note: onlyDifferences && (sharedSkills.length > 0 || missingForAll.length > 0) && (
        <Typography
          variant="body2"
          color="text.secondary"
          className="tw-sticky tw-start-3 tw-w-fit tw-max-w-[80vw] tw-px-4"
        >
          {[
            sharedSkills.length > 0 && $t({ id: 'compare.sharedByAll' }, { skills: formatList(sharedSkills) }),
            missingForAll.length > 0 && $t({ id: 'compare.missingByAll' }, { skills: formatList(missingForAll) }),
          ]
            .filter(Boolean)
            .join(' · ')}
        </Typography>
      ),
      rows: [
        {
          key: 'match',
          label: $t({ id: 'compare.skillMatch' }),
          hidden: job.skills.length === 0,
          render: (_application, index) => (
            <>
              <Box className="tw-flex tw-items-center tw-gap-2">
                <Box className="tw-min-w-0 tw-flex-1">
                  <SkillMatchBar percent={fits[index].match.percent} />
                </Box>
                {skillLeaders.has(index) && <LeaderMark label={$t({ id: 'compare.strength.topMatch' })} />}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {$t(
                  { id: 'jobs.details.skillsMatched' },
                  { matched: fits[index].match.matchedCount, total: fits[index].match.total },
                )}
              </Typography>
            </>
          ),
        },
        {
          key: 'required',
          label: $t({ id: 'compare.requiredSkills' }),
          hidden: shownSkills.length === 0,
          render: (_application, index) => (
            <Box className="tw-flex tw-flex-wrap tw-gap-1.5">
              {shownSkills.map((skill) =>
                fits[index].match.matched.has(skill) ? (
                  <Chip key={skill} size="small" color="success" icon={<MdCheckCircle />} label={skill} />
                ) : (
                  <Chip
                    key={skill}
                    size="small"
                    variant="outlined"
                    label={skill}
                    aria-label={`${skill}: ${$t({ id: 'compare.missingSkill' })}`}
                    sx={{ borderStyle: 'dashed', color: 'text.disabled', textDecoration: 'line-through' }}
                  />
                ),
              )}
            </Box>
          ),
        },
        {
          key: 'extras',
          label: $t({ id: 'compare.alsoKnows' }),
          hidden: extraSkills.every((skills) => skills.length === 0),
          render: (_application, index) =>
            extraSkills[index].length ? (
              <Box className="tw-flex tw-flex-wrap tw-gap-1.5">
                {extraSkills[index].slice(0, 6).map((skill) => (
                  <Chip key={skill} size="small" variant="outlined" label={skill} />
                ))}
                {extraSkills[index].length > 6 && (
                  <Chip size="small" variant="outlined" label={`+${extraSkills[index].length - 6}`} />
                )}
              </Box>
            ) : (
              empty()
            ),
        },
      ],
    },
    {
      key: 'background',
      icon: MdWorkHistory,
      title: $t({ id: 'compare.section.background' }),
      rows: [
        {
          key: 'experience',
          label: $t({ id: 'compare.experience' }),
          hidden: onlyDifferences && allSame(years),
          render: (application, index) => {
            const value = application.candidate.years_of_experience;
            if (value == null) return empty($t({ id: 'compare.notShared' }));
            return (
              <>
                <Box className="tw-flex tw-items-center tw-gap-1.5">
                  <Typography fontWeight={700}>{$t({ id: 'applicants.years' }, { years: value })}</Typography>
                  {experienceLeaders.has(index) && (
                    <LeaderMark label={$t({ id: 'compare.strength.mostExperienced' })} />
                  )}
                </Box>
                {maxYears > 0 && (
                  <Box
                    className="tw-mt-1.5 tw-h-1.5 tw-overflow-hidden tw-rounded-full"
                    sx={(theme) => ({ bgcolor: alpha(theme.palette.primary.main, 0.12) })}
                  >
                    <Box
                      className="tw-h-full tw-rounded-full"
                      sx={{ width: `${(value / maxYears) * 100}%`, bgcolor: 'primary.main' }}
                    />
                  </Box>
                )}
              </>
            );
          },
        },
        {
          key: 'location',
          label: $t({ id: 'profile.field.location' }),
          hidden:
            compared.every((application) => !application.candidate.location) ||
            (onlyDifferences && allSame(compared.map((application) => application.candidate.location))),
          render: (application) =>
            application.candidate.location ? (
              <Typography variant="body2" className="tw-flex tw-items-center tw-gap-1">
                <MdPlace className="tw-shrink-0" /> {application.candidate.location}
              </Typography>
            ) : (
              empty()
            ),
        },
        {
          key: 'links',
          label: $t({ id: 'compare.links' }),
          hidden: compared.every((application) => linksFor(application).length === 0),
          render: (application) => {
            const links = linksFor(application);
            if (!links.length) return empty();
            return (
              <Box className="-tw-ms-2 tw-flex tw-gap-0.5">
                {links.map((link) => (
                  <Tooltip key={link.labelId} title={$t({ id: link.labelId })}>
                    <IconButton
                      size="small"
                      component="a"
                      href={link.url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={$t({ id: link.labelId })}
                    >
                      {link.icon}
                    </IconButton>
                  </Tooltip>
                ))}
              </Box>
            );
          },
        },
        {
          key: 'about',
          label: $t({ id: 'profile.section.about.title' }),
          hidden: compared.every((application) => !application.candidate.bio),
          render: (application) =>
            application.candidate.bio ? <ExpandableText text={application.candidate.bio} lines={3} /> : empty(),
        },
      ],
    },
    {
      key: 'application',
      icon: MdAssignment,
      title: $t({ id: 'compare.section.application' }),
      rows: [
        {
          key: 'applied',
          label: $t({ id: 'compare.applied' }),
          render: (application) => (
            <Typography variant="body2">
              {formatDate(application.created_at, { dateStyle: 'medium' })}
              <Typography component="span" variant="body2" color="text.secondary">
                {' · '}
                {formatRelativeDay(application.created_at)}
              </Typography>
            </Typography>
          ),
        },
        {
          key: 'cv',
          label: $t({ id: 'profile.section.cv.title' }),
          hidden: onlyDifferences && allSame(compared.map((application) => Boolean(application.cv_path))),
          render: (application) =>
            application.cv_path ? (
              <Button
                size="small"
                variant="outlined"
                startIcon={<MdOpenInNew />}
                onClick={() => openCv(application.cv_path as string)}
                loading={openingPath === application.cv_path}
              >
                {$t({ id: 'applicants.viewCv' })}
              </Button>
            ) : (
              empty($t({ id: 'compare.gap.noCv' }))
            ),
        },
        {
          key: 'coverLetter',
          label: $t({ id: 'apply.coverLetter' }),
          hidden: onlyDifferences && compared.every((application) => !application.cover_letter),
          render: (application) =>
            application.cover_letter ? (
              <ExpandableText text={application.cover_letter} lines={4} />
            ) : (
              empty($t({ id: 'compare.noCoverLetter' }))
            ),
        },
      ],
    },
    {
      key: 'pipeline',
      icon: MdEventNote,
      title: $t({ id: 'compare.section.pipeline' }),
      rows: [
        {
          key: 'interview',
          label: $t({ id: 'compare.interview' }),
          render: (application) => {
            const next = getNextInterview(application.interviews);
            if (!next) {
              return (
                <Button size="small" startIcon={<MdAdd />} onClick={() => onSchedule(application)} className="-tw-ms-1">
                  {$t({ id: 'interview.dialog.title' })}
                </Button>
              );
            }
            const { icon, color } = INTERVIEW_TYPE_VISUALS[next.type];
            return (
              <Box className="tw-flex tw-items-center tw-gap-2.5">
                <IconTile icon={icon} color={color} size="sm" />
                <Box className="tw-min-w-0">
                  <Typography variant="body2" fontWeight={600}>
                    {formatDate(next.scheduled_at, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {$t({ id: `interview.type.${next.type}` })} ·{' '}
                    {$t({ id: 'interview.minutes' }, { minutes: next.duration_minutes })}
                  </Typography>
                </Box>
              </Box>
            );
          },
        },
        {
          key: 'rating',
          label: $t({ id: 'compare.rating' }),
          render: (application, index) => (
            <Box className="tw-flex tw-items-center tw-gap-2">
              <Rating
                value={application.rating}
                name={`rating-${application.id}`}
                onChange={(_event, rating) => moves.mutate([{ id: application.id, payload: { rating } }])}
              />
              {ratingLeaders.has(index) && <LeaderMark label={$t({ id: 'compare.strength.topRated' })} />}
            </Box>
          ),
        },
      ],
    },
  ];

  const renderHighlights = (application: RecruiterApplication, index: number) => {
    const { strengths, gaps } = highlightsFor(application, index);
    return (
      <>
        <Typography variant="caption" color="text.secondary" fontWeight={600} className="tw-mb-1.5 tw-block">
          {$t({ id: 'compare.atAGlance' })}
        </Typography>
        {strengths.length + gaps.length === 0 ? (
          empty($t({ id: 'compare.nothingStandsOut' }))
        ) : (
          <Box className="tw-flex tw-flex-col tw-items-start tw-gap-1.5">
            {[
              ...strengths.map((text) => ({ text, icon: MdTrendingUp, color: 'emerald' as const })),
              ...gaps.map((text) => ({ text, icon: MdErrorOutline, color: 'amber' as const })),
            ].map(({ text, icon: Icon, color }) => (
              <Box
                key={text}
                className="tw-flex tw-max-w-full tw-items-center tw-gap-1.5 tw-rounded-lg tw-px-2 tw-py-1"
                sx={(theme) => accentSoftSx(theme, color)}
              >
                <Icon className="tw-shrink-0" />
                <Typography variant="body2" fontWeight={600} className="tw-truncate">
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </>
    );
  };

  // Every item gets an explicit row so each candidate reads as one continuous column, top to bottom.
  const gridRows: GridRow[] = [
    { key: 'highlights', kind: 'cells', divided: false, render: renderHighlights },
    ...sections.flatMap((section): GridRow[] => {
      const rows = section.rows.filter((row) => !row.hidden);
      if (rows.length === 0) return [];
      const isOpen = !collapsed.includes(section.key);
      if (!isOpen) return [{ key: `${section.key}-title`, kind: 'title', section, open: false }];
      return [
        { key: `${section.key}-title`, kind: 'title', section, open: true },
        ...(section.note ? [{ key: `${section.key}-note`, kind: 'note' as const, node: section.note }] : []),
        ...rows.map((row, rowIndex): GridRow => ({
          key: `${section.key}-${row.key}`,
          kind: 'cells',
          divided: rowIndex > 0,
          render: (application, index) => (
            <>
              <Typography variant="caption" color="text.secondary" fontWeight={600} className="tw-mb-1 tw-block">
                {row.label}
              </Typography>
              {row.render(application, index)}
            </>
          ),
        })),
      ];
    }),
  ];
  // Row 1 is the candidate header, then the content rows, then the actions.
  const actionsRow = gridRows.length + 2;

  const columnDivider = `1px solid ${theme.palette.divider}`;
  const columnSx = (index: number, row: number) => ({
    gridColumn: index + 1,
    gridRow: row,
    borderInlineStart: index > 0 ? columnDivider : 'none',
  });

  const toggleSection = (key: SectionKey) =>
    setCollapsed((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));

  const closeButton = (
    <IconButton
      onClick={onClose}
      aria-label={$t({ id: 'profile.cancel' })}
      className="tw-shrink-0 tw-rounded-xl"
      sx={{ bgcolor: 'action.hover' }}
    >
      <MdClose />
    </IconButton>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      aria-labelledby="compare-title"
      slotProps={{ paper: { sx: { bgcolor: 'background.default', backgroundImage: 'none' } } }}
    >
      <Box
        component="header"
        className="tw-shrink-0"
        sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}
      >
        <Box className="tw-h-1" sx={(theme) => ({ background: brandGradient(theme, 90) })} />
        <Box className="tw-flex tw-flex-wrap tw-items-center tw-gap-x-4 tw-gap-y-3 tw-px-4 tw-py-3 sm:tw-px-6 sm:tw-py-4">
          <Box className="tw-flex tw-min-w-0 tw-flex-1 tw-items-center tw-gap-3">
            <Box className="tw-hidden sm:tw-block">
              <IconTile icon={MdCompareArrows} />
            </Box>
            <Box className="tw-min-w-0 tw-flex-1">
              <Typography id="compare-title" variant="h3" component="h2" noWrap>
                {$t({ id: 'compare.title' })}
              </Typography>
              <Box className="tw-mt-0.5 tw-flex tw-min-w-0 tw-items-center tw-gap-2">
                <Box className="tw-flex tw-shrink-0 -tw-space-x-1.5 rtl:tw-space-x-reverse">
                  {compared.map((application) => (
                    <ApplicantAvatar
                      key={application.id}
                      candidate={application.candidate}
                      size={22}
                      sx={{ border: 2, borderColor: 'background.paper', fontSize: 11 }}
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {$t({ id: 'compare.subtitle' }, { job: job.title, count: compared.length })}
                </Typography>
              </Box>
            </Box>
            <Box className="sm:tw-hidden">{closeButton}</Box>
          </Box>

          <Box className="tw-flex tw-w-full tw-flex-wrap tw-items-center tw-gap-2 sm:tw-w-auto">
            <ToggleButtonGroup
              exclusive
              size="small"
              value={onlyDifferences ? 'differences' : 'all'}
              onChange={(_event, value: 'all' | 'differences' | null) =>
                value && setOnlyDifferences(value === 'differences')
              }
              aria-label={$t({ id: 'compare.view' })}
            >
              <ToggleButton value="all" className="tw-gap-1.5 tw-px-3">
                <MdViewAgenda />
                {$t({ id: 'compare.view.all' })}
              </ToggleButton>
              <ToggleButton value="differences" className="tw-gap-1.5 tw-px-3">
                <MdDifference />
                {$t({ id: 'compare.view.differences' })}
              </ToggleButton>
            </ToggleButtonGroup>
            <CompareAddCandidate
              jobSkills={job.skills}
              options={others}
              max={MAX_COMPARE}
              canAdd={canAdd}
              onAdd={(applicationId) => onSelectionChange([...selectedIds, applicationId])}
            />
            <Box className="tw-hidden sm:tw-block">{closeButton}</Box>
          </Box>
        </Box>
      </Box>

      <Box
        className="tw-min-h-0 tw-flex-1 tw-overflow-auto tw-px-3 tw-py-4 sm:tw-px-6 sm:tw-py-6"
        sx={{ scrollSnapType: { xs: 'x mandatory', md: 'none' }, scrollPaddingInline: 12 }}
      >
        <Card
          className="tw-mx-auto tw-grid"
          sx={{
            width: 'fit-content',
            // `clip` keeps the rounded corners without breaking the sticky header and actions.
            overflow: 'clip',
            gridTemplateColumns: `repeat(${compared.length}, minmax(min(80vw, 280px), 380px))`,
          }}
        >
          {/* One unbroken line between columns, running through the section title bands too. */}
          {compared.slice(1).map((application, index) => (
            <Box
              key={`divider-${application.id}`}
              aria-hidden
              className="tw-pointer-events-none"
              sx={{ gridColumn: index + 2, gridRow: `1 / span ${actionsRow}`, borderInlineStart: columnDivider }}
            />
          ))}

          {compared.map((application, index) => (
            <Box
              key={application.id}
              className="tw-sticky tw-top-0 tw-z-[2]"
              sx={{
                ...columnSx(index, 1),
                bgcolor: 'background.paper',
                borderBottom: 1,
                borderBottomColor: 'divider',
                boxShadow: '0 10px 16px -16px rgba(0,0,0,0.35)',
                scrollSnapAlign: 'start',
              }}
            >
              <CompareCandidateHeader
                application={application}
                fit={fits[index]}
                isTopPick={index === topIndex}
                canRemove={compared.length > 2}
                onRemove={() => onSelectionChange(selectedIds.filter((id) => id !== application.id))}
                onOpenProfile={() => onOpenApplicant(application.id)}
              />
            </Box>
          ))}

          {gridRows.map((row, rowIndex) => {
            const gridRow = rowIndex + 2;
            if (row.kind === 'title') {
              return (
                <Box
                  key={row.key}
                  className="tw-px-3 tw-pb-1 tw-pt-4"
                  sx={{ gridColumn: '1 / -1', gridRow, borderTop: 1, borderColor: 'divider' }}
                >
                  <CompareSectionTitle
                    icon={row.section.icon}
                    title={row.section.title}
                    open={row.open}
                    onToggle={() => toggleSection(row.section.key)}
                  />
                </Box>
              );
            }
            if (row.kind === 'note') {
              return (
                <Box key={row.key} className="tw-pb-1" sx={{ gridColumn: '1 / -1', gridRow }}>
                  {row.node}
                </Box>
              );
            }
            return compared.map((application, index) => (
              <Box
                key={`${row.key}-${application.id}`}
                className="tw-relative tw-px-4 tw-py-3"
                sx={{
                  ...columnSx(index, gridRow),
                  ...(row.divided && {
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      insetInline: 16,
                      height: '1px',
                      bgcolor: 'divider',
                    },
                  }),
                }}
              >
                {row.render(application, index)}
              </Box>
            ));
          })}

          {compared.map((application, index) => (
            <Box
              key={application.id}
              className="tw-sticky tw-bottom-0 tw-z-[2]"
              sx={{
                ...columnSx(index, actionsRow),
                bgcolor: 'background.paper',
                borderTop: 1,
                borderTopColor: 'divider',
                boxShadow: '0 -10px 16px -16px rgba(0,0,0,0.35)',
              }}
            >
              <CompareActions
                application={application}
                onMove={(stage) => moveTo(application, stage)}
                onOpenProfile={() => onOpenApplicant(application.id)}
                onSchedule={() => onSchedule(application)}
                onViewCv={() => openCv(application.cv_path as string)}
                openingCv={openingPath === application.cv_path}
              />
            </Box>
          ))}
        </Card>
      </Box>
    </Dialog>
  );
}
