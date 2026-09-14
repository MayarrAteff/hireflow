import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Rating from '@mui/material/Rating';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import {
  MdAdd,
  MdCheckCircle,
  MdClose,
  MdEdit,
  MdEmail,
  MdLanguage,
  MdOpenInNew,
  MdPhone,
  MdPlace,
  MdWorkHistory,
} from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import { ProgressRing } from '@/components/UI/ProgressRing';
import { APPLICATION_PIPELINE } from '@/constants/applications';
import { INTERVIEW_TYPE_VISUALS, isMeetingUrl } from '@/constants/interviews';
import { getCurrentOffer } from '@/constants/offers';
import { useApplicationMoves } from '@/hooks/useApplicationMutations';
import { useOpenCv } from '@/hooks/useOpenCv';
import { brandGradient } from '@/styles/themes/accents';
import type { ApplicationStage, RecruiterApplication } from '@/types/application.types';
import type { Interview } from '@/types/interview.types';
import type { Job } from '@/types/job.types';
import { useJobFormatters } from '@/utils/hooks/useJobFormatters';
import { getSkillMatch } from '@/utils/skillMatch';

import { OfferSummary } from '../../../offers/OfferSummary';
import { ApplicantAvatar } from './ApplicantAvatar';

const ALL_STAGES: ApplicationStage[] = [...APPLICATION_PIPELINE, 'rejected'];

function DrawerSection({ titleId, children, action }: { titleId: string; children: ReactNode; action?: ReactNode }) {
  const { $t } = useIntl();

  return (
    <Box className="px-5 py-4">
      <Box className="mb-2 flex items-center justify-between gap-2">
        <Typography variant="overline" color="text.secondary" className="leading-none">
          {$t({ id: titleId })}
        </Typography>
        {action}
      </Box>
      {children}
    </Box>
  );
}

type ApplicantDrawerProps = {
  application: RecruiterApplication | null;
  job: Job;
  onClose: () => void;
  onSchedule: (application: RecruiterApplication, interview?: Interview) => void;
  onMakeOffer: (application: RecruiterApplication) => void;
};

export function ApplicantDrawer({ application, job, onClose, onSchedule, onMakeOffer }: ApplicantDrawerProps) {
  const { $t, formatDate, formatNumber } = useIntl();
  const { formatRelativeDay } = useJobFormatters();
  const { openCv, openingPath } = useOpenCv();
  const moves = useApplicationMoves(job.id);

  const candidate = application?.candidate;
  const match = getSkillMatch(job.skills, candidate?.skills ?? []);
  const interviews = [...(application?.interviews ?? [])].sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at));
  const links = [
    { url: candidate?.linkedin_url, labelId: 'profile.field.linkedin', icon: <FaLinkedin /> },
    { url: candidate?.github_url, labelId: 'profile.field.github', icon: <FaGithub /> },
    { url: candidate?.portfolio_url, labelId: 'profile.field.portfolio', icon: <MdLanguage /> },
  ].filter((link) => link.url);

  return (
    <Drawer
      anchor="right"
      open={Boolean(application)}
      onClose={onClose}
      // Same layer as dialogs so it opens on top of the comparison instead of behind it.
      sx={{ zIndex: 'modal' }}
      slotProps={{ paper: { className: 'w-full sm:w-[460px]' } }}
    >
      {application && candidate && (
        <Box className="flex min-h-full flex-col">
          <Box className="relative h-20 shrink-0" sx={(theme) => ({ background: brandGradient(theme) })}>
            <IconButton
              onClick={onClose}
              aria-label={$t({ id: 'profile.cancel' })}
              className="absolute end-2 top-2"
              sx={{ color: '#fff' }}
            >
              <MdClose />
            </IconButton>
          </Box>

          <Box className="-mt-10 px-5">
            <ApplicantAvatar
              candidate={candidate}
              size={80}
              sx={{ border: 4, borderColor: 'background.paper', fontSize: 30 }}
            />
            <Typography variant="h4" className="mt-2 break-words">
              {candidate.full_name || candidate.email}
            </Typography>
            {candidate.headline && <Typography color="text.secondary">{candidate.headline}</Typography>}
            <Box className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {candidate.location && (
                <Typography variant="body2" color="text.secondary" className="flex items-center gap-1">
                  <MdPlace /> {candidate.location}
                </Typography>
              )}
              {candidate.years_of_experience != null && (
                <Typography variant="body2" color="text.secondary" className="flex items-center gap-1">
                  <MdWorkHistory /> {$t({ id: 'applicants.years' }, { years: candidate.years_of_experience })}
                </Typography>
              )}
            </Box>
            <Box className="mt-2 flex flex-wrap items-center gap-1">
              <Tooltip title={candidate.email}>
                <IconButton
                  size="small"
                  component="a"
                  href={`mailto:${candidate.email}`}
                  aria-label={$t({ id: 'field.email' })}
                >
                  <MdEmail />
                </IconButton>
              </Tooltip>
              {candidate.phone && (
                <Tooltip title={candidate.phone}>
                  <IconButton
                    size="small"
                    component="a"
                    href={`tel:${candidate.phone}`}
                    aria-label={$t({ id: 'profile.field.phone' })}
                  >
                    <MdPhone />
                  </IconButton>
                </Tooltip>
              )}
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
          </Box>

          <Box className="grid grid-cols-2 gap-3 px-5 pt-4">
            <TextField
              select
              size="small"
              label={$t({ id: 'applicants.stage' })}
              value={application.stage}
              onChange={(event) =>
                moves.mutate([{ id: application.id, payload: { stage: event.target.value as ApplicationStage } }])
              }
            >
              {ALL_STAGES.map((stage) => (
                <MenuItem key={stage} value={stage}>
                  {$t({ id: `application.stage.${stage}` })}
                </MenuItem>
              ))}
            </TextField>
            <Box className="flex flex-col justify-center">
              <Typography variant="caption" color="text.secondary">
                {$t({ id: 'applicants.yourRating' })}
              </Typography>
              <Rating
                value={application.rating}
                onChange={(_event, rating) => moves.mutate([{ id: application.id, payload: { rating } }])}
              />
            </Box>
          </Box>

          <Box className="flex flex-wrap gap-2 px-5 py-4">
            {application.cv_path && (
              <Button
                variant="outlined"
                startIcon={<MdOpenInNew />}
                onClick={() => openCv(application.cv_path as string)}
                loading={openingPath === application.cv_path}
              >
                {$t({ id: 'applicants.viewCv' })}
              </Button>
            )}
            <Button variant="contained" startIcon={<MdAdd />} onClick={() => onSchedule(application)}>
              {$t({ id: 'interview.dialog.title' })}
            </Button>
          </Box>

          <Divider />

          {job.skills.length > 0 && (
            <DrawerSection titleId="compare.skillMatch">
              <Box className="mb-3 flex items-center gap-3">
                <Box className="relative shrink-0">
                  <ProgressRing value={match.percent} size={56} stroke={6} />
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {formatNumber(match.percent / 100, { style: 'percent' })}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {$t({ id: 'jobs.details.skillsMatched' }, { matched: match.matchedCount, total: match.total })}
                </Typography>
              </Box>
              <Box className="flex flex-wrap gap-1.5">
                {job.skills.map((skill) =>
                  match.matched.has(skill) ? (
                    <Chip key={skill} size="small" color="success" icon={<MdCheckCircle />} label={skill} />
                  ) : (
                    <Chip key={skill} size="small" variant="outlined" label={skill} />
                  ),
                )}
              </Box>
            </DrawerSection>
          )}

          {application && (application.offers.length > 0 || ['interview', 'offer'].includes(application.stage)) && (
            <DrawerSection titleId="offer.section.title">
              <OfferSummary offer={getCurrentOffer(application.offers)} onOpenDialog={() => onMakeOffer(application)} />
            </DrawerSection>
          )}

          <DrawerSection titleId="applicants.interviews">
            {interviews.length === 0 ? (
              <Typography variant="body2" color="text.disabled">
                {$t({ id: 'compare.noInterview' })}
              </Typography>
            ) : (
              <Box className="flex flex-col gap-2">
                {interviews.map((interview) => {
                  const { icon, color } = INTERVIEW_TYPE_VISUALS[interview.type];
                  const isPast = new Date(interview.scheduled_at).getTime() < Date.now();
                  return (
                    <Box
                      key={interview.id}
                      className="flex items-center gap-3 rounded-xl p-2.5"
                      sx={{ border: 1, borderColor: 'divider', opacity: isPast ? 0.7 : 1 }}
                    >
                      <IconTile icon={icon} color={color} size="sm" />
                      <Box className="min-w-0 flex-1">
                        <Typography variant="body2" fontWeight={600}>
                          {formatDate(interview.scheduled_at, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap className="block">
                          {$t({ id: `interview.type.${interview.type}` })} ·{' '}
                          {$t({ id: 'interview.minutes' }, { minutes: interview.duration_minutes })}
                          {interview.location_or_link &&
                            !isMeetingUrl(interview.location_or_link) &&
                            ` · ${interview.location_or_link}`}
                        </Typography>
                      </Box>
                      {isMeetingUrl(interview.location_or_link) && !isPast && (
                        <Button
                          size="small"
                          href={interview.location_or_link as string}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {$t({ id: 'interview.join' })}
                        </Button>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => onSchedule(application, interview)}
                        aria-label={$t({ id: 'interview.edit' })}
                      >
                        <MdEdit />
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>
            )}
          </DrawerSection>

          {candidate.bio && (
            <DrawerSection titleId="profile.section.about.title">
              <Typography variant="body2" className="whitespace-pre-line">
                {candidate.bio}
              </Typography>
            </DrawerSection>
          )}

          <DrawerSection titleId="apply.coverLetter">
            <Typography
              variant="body2"
              color={application.cover_letter ? 'text.primary' : 'text.disabled'}
              className="whitespace-pre-line"
            >
              {application.cover_letter || $t({ id: 'compare.noCoverLetter' })}
            </Typography>
          </DrawerSection>

          <Box className="mt-auto px-5 pb-5">
            <Typography variant="caption" color="text.secondary">
              {$t(
                { id: 'applicants.appliedOn' },
                {
                  date: formatDate(application.created_at, { dateStyle: 'medium' }),
                  when: formatRelativeDay(application.created_at),
                },
              )}
            </Typography>
            {candidate.email && (
              <Link href={`mailto:${candidate.email}`} variant="caption" className="ms-2">
                {candidate.email}
              </Link>
            )}
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
