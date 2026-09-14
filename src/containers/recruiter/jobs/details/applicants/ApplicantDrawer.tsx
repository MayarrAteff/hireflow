import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Rating from '@mui/material/Rating';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { type ReactNode, useEffect } from 'react';
import type { IconType } from 'react-icons';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import {
  MdAdd,
  MdCheckCircle,
  MdClose,
  MdEdit,
  MdEmail,
  MdEvent,
  MdFormatQuote,
  MdLanguage,
  MdLocalOffer,
  MdOpenInNew,
  MdPerson,
  MdPhone,
  MdPlace,
  MdSchedule,
  MdTaskAlt,
  MdWorkHistory,
} from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import { ProgressRing } from '@/components/UI/ProgressRing';
import { APPLICATION_PIPELINE } from '@/constants/applications';
import { INTERVIEW_TYPE_VISUALS, isMeetingUrl } from '@/constants/interviews';
import { getCurrentOffer } from '@/constants/offers';
import { useApplicationMoves, useMarkApplicationViewed, useMoveApplicantStage } from '@/hooks/useApplicationMutations';
import { useOpenCv } from '@/hooks/useOpenCv';
import type { ApplicationStage, RecruiterApplication } from '@/types/application.types';
import type { Interview } from '@/types/interview.types';
import type { Job } from '@/types/job.types';
import { useJobFormatters } from '@/utils/hooks/useJobFormatters';
import { getSkillMatch } from '@/utils/skillMatch';
import { getStageGap, type StageGap } from '@/utils/stageGaps';

import { OfferSummary } from '../../../offers/OfferSummary';
import { ApplicantAvatar } from './ApplicantAvatar';

const ALL_STAGES: ApplicationStage[] = [...APPLICATION_PIPELINE, 'rejected'];

type DrawerSectionProps = {
  icon: IconType;
  titleId: string;
  children: ReactNode;
  action?: ReactNode;
};

function DrawerSection({ icon: Icon, titleId, children, action }: DrawerSectionProps) {
  const { $t } = useIntl();

  return (
    <Box component="section" className="px-6 py-5">
      <Box className="mb-3 flex items-center gap-2">
        <Box component={Icon} className="shrink-0" sx={{ color: 'primary.main' }} aria-hidden />
        <Typography variant="subtitle2" component="h3" className="flex-1">
          {$t({ id: titleId })}
        </Typography>
        {action}
      </Box>
      {children}
    </Box>
  );
}

function StageGapAlert({ gap, onFix }: { gap: StageGap; onFix: () => void }) {
  const { $t } = useIntl();

  return (
    <Alert severity="warning" className="mt-3 rounded-2xl">
      <AlertTitle className="mb-0.5 text-sm font-semibold">{$t({ id: `applicants.gap.${gap}.title` })}</AlertTitle>
      {$t({ id: `applicants.gap.${gap}.body` })}
      <Box className="mt-2">
        <Button
          size="small"
          variant="outlined"
          color="warning"
          startIcon={gap === 'interview' ? <MdAdd /> : <MdLocalOffer />}
          onClick={onFix}
        >
          {$t({ id: gap === 'interview' ? 'interview.dialog.title' : 'offer.action.make' })}
        </Button>
      </Box>
    </Alert>
  );
}

type Contact = { href: string; title: string; labelId: string; icon: ReactNode; external?: boolean };

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
  // Same follow-ups as dropping a card on the board: booking prompt for Interview, offer dialog for Offer.
  const moveStage = useMoveApplicantStage(job.id, { onSuggestInterview: onSchedule, onSuggestOffer: onMakeOffer });
  const { mutate: markViewed } = useMarkApplicationViewed(job.id);

  const unseenApplicationId = application && !application.viewed_at ? application.id : null;
  useEffect(() => {
    if (unseenApplicationId) markViewed(unseenApplicationId);
  }, [unseenApplicationId, markViewed]);

  const candidate = application?.candidate;
  const stageGap = application ? getStageGap(application) : null;
  const match = getSkillMatch(job.skills, candidate?.skills ?? []);
  const interviews = [...(application?.interviews ?? [])].sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at));
  const contacts: Contact[] = candidate
    ? [
        { href: `mailto:${candidate.email}`, title: candidate.email, labelId: 'field.email', icon: <MdEmail /> },
        ...(candidate.phone
          ? [
              {
                href: `tel:${candidate.phone}`,
                title: candidate.phone,
                labelId: 'profile.field.phone',
                icon: <MdPhone />,
              },
            ]
          : []),
        ...[
          { url: candidate.linkedin_url, labelId: 'profile.field.linkedin', icon: <FaLinkedin /> },
          { url: candidate.github_url, labelId: 'profile.field.github', icon: <FaGithub /> },
          { url: candidate.portfolio_url, labelId: 'profile.field.portfolio', icon: <MdLanguage /> },
        ]
          .filter((link) => link.url)
          .map((link) => ({
            href: link.url as string,
            title: $t({ id: link.labelId }),
            labelId: link.labelId,
            icon: link.icon,
            external: true,
          })),
      ]
    : [];

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
          <Box
            component="header"
            className="relative px-6 pb-5 pt-6"
            sx={(theme) => ({
              background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 100%)`,
            })}
          >
            <IconButton
              onClick={onClose}
              aria-label={$t({ id: 'profile.cancel' })}
              className="absolute end-3 top-3"
              size="small"
            >
              <MdClose />
            </IconButton>

            <Box className="flex items-center gap-4 pe-8">
              <ApplicantAvatar
                candidate={candidate}
                size={64}
                sx={(theme) => ({ fontSize: 26, boxShadow: `0 0 0 4px ${theme.palette.background.paper}` })}
              />
              <Box className="min-w-0 flex-1">
                <Typography variant="h5" component="h2" className="break-words leading-tight">
                  {candidate.full_name || candidate.email}
                </Typography>
                {candidate.headline && (
                  <Typography variant="body2" color="text.secondary" className="mt-0.5 line-clamp-2">
                    {candidate.headline}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              {[
                { icon: MdSchedule, label: formatRelativeDay(application.created_at), key: 'applied' },
                candidate.location && { icon: MdPlace, label: candidate.location, key: 'location' },
                candidate.years_of_experience != null && {
                  icon: MdWorkHistory,
                  label: $t({ id: 'applicants.years' }, { years: candidate.years_of_experience }),
                  key: 'experience',
                },
              ]
                .filter((item): item is { icon: IconType; label: string; key: string } => Boolean(item))
                .map(({ icon: Icon, label, key }) => (
                  <Typography
                    key={key}
                    variant="body2"
                    color="text.secondary"
                    className="flex items-center gap-1"
                    title={
                      key === 'applied'
                        ? $t(
                            { id: 'applicants.appliedOn' },
                            { date: formatDate(application.created_at, { dateStyle: 'medium' }), when: label },
                          )
                        : undefined
                    }
                  >
                    <Icon aria-hidden /> {label}
                  </Typography>
                ))}
            </Box>

            <Box className="mt-4 flex flex-wrap gap-2">
              {contacts.map((contact) => (
                <Tooltip key={contact.labelId} title={contact.title}>
                  <IconButton
                    component="a"
                    href={contact.href}
                    {...(contact.external && { target: '_blank', rel: 'noopener noreferrer' })}
                    aria-label={$t({ id: contact.labelId })}
                    className="h-9 w-9 rounded-xl"
                    sx={(theme) => ({
                      border: 1,
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      color: 'text.secondary',
                      fontSize: 18,
                      '&:hover': { color: 'primary.main', borderColor: alpha(theme.palette.primary.main, 0.4) },
                    })}
                  >
                    {contact.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
          </Box>

          <Box className="px-6">
            <Box
              className="grid grid-cols-1 items-center gap-4 rounded-2xl p-4 sm:grid-cols-2"
              sx={(theme) => ({ bgcolor: alpha(theme.palette.text.primary, 0.035), border: 1, borderColor: 'divider' })}
            >
              <TextField
                select
                size="small"
                fullWidth
                label={$t({ id: 'applicants.stage' })}
                value={application.stage}
                onChange={(event) => moveStage(application, event.target.value as ApplicationStage)}
              >
                {ALL_STAGES.map((stage) => (
                  <MenuItem key={stage} value={stage}>
                    {$t({ id: `application.stage.${stage}` })}
                  </MenuItem>
                ))}
              </TextField>
              <Box className="flex flex-col">
                <Typography variant="caption" color="text.secondary">
                  {$t({ id: 'applicants.yourRating' })}
                </Typography>
                <Rating
                  value={application.rating}
                  onChange={(_event, rating) => moves.mutate([{ id: application.id, payload: { rating } }])}
                />
              </Box>
            </Box>

            {stageGap && (
              <StageGapAlert
                gap={stageGap}

                onFix={() => (stageGap === 'interview' ? onSchedule(application) : onMakeOffer(application))}
              />
            )}
          </Box>

          {job.skills.length > 0 && (
            <DrawerSection icon={MdTaskAlt} titleId="compare.skillMatch">
              <Box className="mb-3 flex items-center gap-3">
                <Box className="relative shrink-0">
                  <ProgressRing value={match.percent} size={52} stroke={6} />
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
                    <Chip key={skill} size="small" variant="outlined" label={skill} sx={{ color: 'text.secondary' }} />
                  ),
                )}
              </Box>
            </DrawerSection>
          )}

          {(application.offers.length > 0 || ['interview', 'offer'].includes(application.stage)) && (
            <>
              <Divider className="mx-6" />
              <DrawerSection icon={MdLocalOffer} titleId="offer.section.title">
                <OfferSummary
                  offer={getCurrentOffer(application.offers)}
                  onOpenDialog={() => onMakeOffer(application)}
                />
              </DrawerSection>
            </>
          )}

          <Divider className="mx-6" />
          <DrawerSection icon={MdEvent} titleId="applicants.interviews">
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
            <>
              <Divider className="mx-6" />
              <DrawerSection icon={MdPerson} titleId="applicants.about">
                <Typography variant="body2" color="text.secondary" className="whitespace-pre-line leading-relaxed">
                  {candidate.bio}
                </Typography>
              </DrawerSection>
            </>
          )}

          <Divider className="mx-6" />
          <DrawerSection icon={MdFormatQuote} titleId="applicants.coverLetter">
            {application.cover_letter ? (
              <Typography
                variant="body2"
                className="whitespace-pre-line rounded-e-xl py-3 pe-4 ps-4 leading-relaxed"
                sx={(theme) => ({
                  borderInlineStart: 3,
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                })}
              >
                {application.cover_letter}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.disabled">
                {$t({ id: 'compare.noCoverLetter' })}
              </Typography>
            )}
          </DrawerSection>

          <Box
            className="sticky bottom-0 mt-auto flex gap-2 px-6 py-4"
            sx={(theme) => ({
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(8px)',
            })}
          >
            {application.cv_path && (
              <Button
                variant="outlined"
                className="flex-1 whitespace-nowrap"
                startIcon={<MdOpenInNew />}
                onClick={() => openCv(application.cv_path as string)}
                loading={openingPath === application.cv_path}
              >
                {$t({ id: 'applicants.viewCv' })}
              </Button>
            )}
            <Button
              variant="contained"
              disableElevation
              className="flex-1 whitespace-nowrap"
              startIcon={<MdAdd />}
              onClick={() => onSchedule(application)}
            >
              {$t({ id: 'interview.dialog.title' })}
            </Button>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
