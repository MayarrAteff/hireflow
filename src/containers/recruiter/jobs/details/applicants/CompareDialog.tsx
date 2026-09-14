import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Rating from '@mui/material/Rating';
import { alpha, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Fragment, type ReactNode } from 'react';
import { MdCheckCircle, MdClose, MdEmojiEvents, MdOpenInNew, MdRemove } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { StageChip } from '@/components/Jobs/StageChip';
import { getNextInterview } from '@/constants/interviews';
import { useOpenCv } from '@/hooks/useOpenCv';
import { ACCENT_COLORS } from '@/styles/themes/accents';
import type { RecruiterApplication } from '@/types/application.types';
import type { Job } from '@/types/job.types';
import { useJobFormatters } from '@/utils/hooks/useJobFormatters';
import { getSkillMatch } from '@/utils/skillMatch';

import { ApplicantAvatar } from './ApplicantAvatar';
import { SkillMatchBar } from './SkillMatchBar';

const LABEL_COLUMN = '170px';

/** Indexes holding the highest value, so ties are all highlighted; nothing is "best" if every value is empty. */
function bestIndexes(values: (number | null)[]) {
  const max = Math.max(...values.map((value) => value ?? -1));
  if (max <= 0) return new Set<number>();
  return new Set(values.flatMap((value, index) => (value === max ? [index] : [])));
}

type CompareDialogProps = {
  open: boolean;
  job: Job;
  applications: RecruiterApplication[];
  onClose: () => void;
  onOpenApplicant: (applicationId: string) => void;
};

/** Side-by-side comparison of 2–3 applicants against the job's skills. */
export function CompareDialog({ open, job, applications, onClose, onOpenApplicant }: CompareDialogProps) {
  const { $t, formatDate } = useIntl();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { formatRelativeDay } = useJobFormatters();
  const { openCv, openingPath } = useOpenCv();

  const matches = applications.map((application) => getSkillMatch(job.skills, application.candidate.skills ?? []));
  const bestMatch = bestIndexes(matches.map((match) => match.percent));
  const bestExperience = bestIndexes(applications.map((a) => a.candidate.years_of_experience));
  const bestRating = bestIndexes(applications.map((a) => a.rating));

  const columns = `${LABEL_COLUMN} repeat(${applications.length}, minmax(200px, 1fr))`;

  const bestSx = (isBest: boolean) =>
    isBest ? { bgcolor: alpha(ACCENT_COLORS.emerald, theme.palette.mode === 'dark' ? 0.16 : 0.08) } : undefined;

  const bestBadge = (
    <Chip
      size="small"
      icon={<MdEmojiEvents />}
      label={$t({ id: 'compare.best' })}
      sx={{ bgcolor: ACCENT_COLORS.emerald, color: '#fff', '& .MuiChip-icon': { color: '#fff' } }}
    />
  );

  const row = (
    label: string,
    render: (application: RecruiterApplication, index: number) => ReactNode,
    best?: Set<number>,
  ) => (
    <Fragment key={label}>
      <Box
        className="tw-sticky tw-start-0 tw-z-[1] tw-flex tw-items-center tw-px-4 tw-py-3"
        sx={{ bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}
      >
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
      </Box>
      {applications.map((application, index) => (
        <Box
          key={application.id}
          className="tw-flex tw-flex-col tw-justify-center tw-gap-1.5 tw-px-4 tw-py-3"
          sx={{ borderTop: 1, borderColor: 'divider', ...bestSx(Boolean(best?.has(index))) }}
        >
          {render(application, index)}
        </Box>
      ))}
    </Fragment>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth fullScreen={fullScreen} scroll="paper">
      <DialogTitle className="tw-flex tw-items-center tw-gap-3 tw-pe-14">
        <Box className="tw-min-w-0">
          <Typography variant="h4" component="span" className="tw-block">
            {$t({ id: 'compare.title' })}
          </Typography>
          <Typography color="text.secondary" component="span" className="tw-block">
            {job.title}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          aria-label={$t({ id: 'profile.cancel' })}
          className="tw-absolute tw-end-3 tw-top-3"
        >
          <MdClose />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers className="tw-p-0">
        <Box className="tw-overflow-x-auto">
          <Box className="tw-grid tw-min-w-max" sx={{ gridTemplateColumns: columns }}>
            <Box className="tw-sticky tw-start-0 tw-z-[1]" sx={{ bgcolor: 'background.paper' }} />
            {applications.map((application) => (
              <Box
                key={application.id}
                className="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-px-4 tw-py-5 tw-text-center"
              >
                <ApplicantAvatar candidate={application.candidate} size={64} />
                <Box className="tw-min-w-0">
                  <Typography fontWeight={700}>
                    {application.candidate.full_name || application.candidate.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="tw-line-clamp-2">
                    {application.candidate.headline}
                  </Typography>
                </Box>
                <StageChip stage={application.stage} />
                <Button size="small" onClick={() => onOpenApplicant(application.id)}>
                  {$t({ id: 'compare.openProfile' })}
                </Button>
              </Box>
            ))}

            {row(
              $t({ id: 'compare.skillMatch' }),
              (_application, index) => (
                <>
                  <SkillMatchBar percent={matches[index].percent} />
                  <Typography variant="caption" color="text.secondary">
                    {$t(
                      { id: 'jobs.details.skillsMatched' },
                      { matched: matches[index].matchedCount, total: matches[index].total },
                    )}
                  </Typography>
                  {bestMatch.has(index) && applications.length > 1 && bestBadge}
                </>
              ),
              bestMatch,
            )}

            {job.skills.map((skill) =>
              row(skill, (_application, index) =>
                matches[index].matched.has(skill) ? (
                  <Box
                    component={MdCheckCircle}
                    size={22}
                    sx={{ color: ACCENT_COLORS.emerald }}
                    aria-label={$t({ id: 'compare.hasSkill' })}
                  />
                ) : (
                  <Box
                    component={MdRemove}
                    size={22}
                    sx={{ color: 'text.disabled' }}
                    aria-label={$t({ id: 'compare.missingSkill' })}
                  />
                ),
              ),
            )}

            {row(
              $t({ id: 'compare.experience' }),
              (application, index) => (
                <>
                  <Typography fontWeight={600}>
                    {application.candidate.years_of_experience != null
                      ? $t({ id: 'applicants.years' }, { years: application.candidate.years_of_experience })
                      : '—'}
                  </Typography>
                  {bestExperience.has(index) && bestBadge}
                </>
              ),
              bestExperience,
            )}

            {row($t({ id: 'profile.field.location' }), (application) => (
              <Typography>{application.candidate.location || '—'}</Typography>
            ))}

            {row(
              $t({ id: 'compare.rating' }),
              (application, index) => (
                <>
                  {application.rating ? (
                    <Rating value={application.rating} readOnly size="small" />
                  ) : (
                    <Typography variant="body2" color="text.disabled">
                      {$t({ id: 'applicants.notRated' })}
                    </Typography>
                  )}
                  {bestRating.has(index) && bestBadge}
                </>
              ),
              bestRating,
            )}

            {row($t({ id: 'compare.applied' }), (application) => (
              <Typography variant="body2">
                {formatDate(application.created_at, { dateStyle: 'medium' })}
                <Typography component="span" variant="body2" color="text.secondary">
                  {' '}
                  ({formatRelativeDay(application.created_at)})
                </Typography>
              </Typography>
            ))}

            {row($t({ id: 'compare.interview' }), (application) => {
              const next = getNextInterview(application.interviews);
              return (
                <Typography variant="body2" color={next ? 'text.primary' : 'text.disabled'}>
                  {next
                    ? formatDate(next.scheduled_at, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : $t({ id: 'compare.noInterview' })}
                </Typography>
              );
            })}

            {row($t({ id: 'apply.coverLetter' }), (application) => (
              <Typography
                variant="body2"
                color={application.cover_letter ? 'text.primary' : 'text.disabled'}
                className="tw-line-clamp-5 tw-whitespace-pre-line"
              >
                {application.cover_letter || $t({ id: 'compare.noCoverLetter' })}
              </Typography>
            ))}

            {row($t({ id: 'profile.section.cv.title' }), (application) =>
              application.cv_path ? (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<MdOpenInNew />}
                  onClick={() => openCv(application.cv_path as string)}
                  loading={openingPath === application.cv_path}
                  className="tw-self-start"
                >
                  {$t({ id: 'profile.cv.view' })}
                </Button>
              ) : (
                <Typography variant="body2" color="text.disabled">
                  —
                </Typography>
              ),
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
