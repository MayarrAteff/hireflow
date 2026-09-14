import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { createLink, Link as RouterLink } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { MdEdit, MdEventAvailable, MdOpenInNew, MdPlace } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { StageChip } from '@/components/Jobs/StageChip';
import { IconTile } from '@/components/UI/IconTile';
import { EmptyJobsIllustration } from '@/components/UI/Illustrations';
import { INTERVIEW_TYPE_VISUALS, isMeetingUrl } from '@/constants/interviews';
import { useCompanyInterviews } from '@/hooks/useInterviews';
import type { InterviewsView } from '@/services/interviews.service';
import type { InterviewWithContext } from '@/types/interview.types';
import { dayjs } from '@/utils/dayjs';

import { ApplicantAvatar } from '../jobs/details/applicants/ApplicantAvatar';
import { type InterviewTarget, ScheduleInterviewDialog } from './ScheduleInterviewDialog';

const MuiRouterLink = createLink(Link);

function groupByDay(interviews: InterviewWithContext[]) {
  const groups = new Map<string, InterviewWithContext[]>();
  interviews.forEach((interview) => {
    const day = dayjs(interview.scheduled_at).format('YYYY-MM-DD');
    groups.set(day, [...(groups.get(day) ?? []), interview]);
  });
  return [...groups.entries()];
}

export function InterviewsPage() {
  const { $t, formatDate, formatTime, formatRelativeTime } = useIntl();
  const [view, setView] = useState<InterviewsView>('upcoming');
  const [target, setTarget] = useState<InterviewTarget | null>(null);
  const { data: interviews = [], isPending } = useCompanyInterviews(view);

  const today = dayjs().startOf('day');
  const todayCount = interviews.filter((interview) => dayjs(interview.scheduled_at).isSame(today, 'day')).length;
  const weekCount = interviews.filter((interview) =>
    dayjs(interview.scheduled_at).isBefore(today.add(7, 'day')),
  ).length;

  const dayLabel = (day: string) => {
    const diff = dayjs(day).diff(today, 'day');
    const date = formatDate(day, { weekday: 'long', month: 'long', day: 'numeric' });
    return Math.abs(diff) <= 1 ? `${formatRelativeTime(diff, 'day', { numeric: 'auto' })} · ${date}` : date;
  };

  return (
    <Box className="mx-auto flex max-w-5xl flex-col gap-6">
      <Box className="flex flex-wrap items-center gap-4">
        <IconTile icon={MdEventAvailable} size="lg" />
        <Box className="min-w-0 flex-1">
          <Typography variant="h2" className="mb-1">
            {$t({ id: 'interviews.title' })}
          </Typography>
          <Typography color="text.secondary">{$t({ id: 'interviews.subtitle' })}</Typography>
        </Box>
        <ToggleButtonGroup exclusive size="small" value={view} onChange={(_event, next) => next && setView(next)}>
          <ToggleButton value="upcoming" className="px-4">
            {$t({ id: 'interviews.upcoming' })}
          </ToggleButton>
          <ToggleButton value="past" className="px-4">
            {$t({ id: 'interviews.past' })}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {view === 'upcoming' && !isPending && interviews.length > 0 && (
        <Box className="flex flex-wrap gap-2">
          <Chip color="primary" label={$t({ id: 'interviews.today' }, { count: todayCount })} />
          <Chip variant="outlined" label={$t({ id: 'interviews.thisWeek' }, { count: weekCount })} />
        </Box>
      )}

      {isPending &&
        Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} variant="rounded" height={96} className="rounded-2xl" />
        ))}

      {!isPending && interviews.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <EmptyJobsIllustration className="mb-3 w-44" />
            <Typography variant="h4" className="mb-1">
              {$t({ id: view === 'upcoming' ? 'interviews.empty.upcoming' : 'interviews.empty.past' })}
            </Typography>
            <Typography color="text.secondary" className="mb-5 max-w-md">
              {$t({ id: 'interviews.empty.body' })}
            </Typography>
            <Button variant="outlined" component={RouterLink} to="/recruiter/jobs">
              {$t({ id: 'interviews.empty.cta' })}
            </Button>
          </CardContent>
        </Card>
      )}

      {groupByDay(interviews).map(([day, dayInterviews], groupIndex) => (
        <motion.section
          key={day}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(groupIndex, 6) * 0.05 }}
        >
          <Typography variant="h6" className="mb-2 px-1 first-letter:uppercase">
            {dayLabel(day)}
          </Typography>
          <Card>
            {dayInterviews.map((interview, index) => {
              const { icon, color } = INTERVIEW_TYPE_VISUALS[interview.type];
              const { application } = interview;
              const start = new Date(interview.scheduled_at);
              const end = new Date(start.getTime() + interview.duration_minutes * 60_000);
              const isLive = view === 'upcoming' && start.getTime() <= Date.now() && end.getTime() > Date.now();
              return (
                <Box
                  key={interview.id}
                  className="flex flex-wrap items-center gap-4 p-4"
                  sx={{ borderTop: index === 0 ? 0 : 1, borderColor: 'divider' }}
                >
                  <Box className="flex w-28 items-center gap-3">
                    <IconTile icon={icon} color={color} size="sm" />
                    <Box>
                      <Typography fontWeight={700}>
                        {formatTime(start, { hour: 'numeric', minute: '2-digit' })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {$t({ id: 'interview.minutes' }, { minutes: interview.duration_minutes })}
                      </Typography>
                    </Box>
                  </Box>

                  <Box className="flex min-w-0 flex-1 items-center gap-3">
                    <ApplicantAvatar candidate={application.candidate} />
                    <Box className="min-w-0">
                      <Typography fontWeight={600} noWrap>
                        {application.candidate.full_name || application.candidate.email}
                      </Typography>
                      <MuiRouterLink
                        to="/recruiter/jobs/$jobId"
                        params={{ jobId: application.job.id }}
                        search={{ tab: 'board' }}
                        variant="body2"
                        underline="hover"
                        className="block truncate"
                      >
                        {application.job.title}
                      </MuiRouterLink>
                    </Box>
                  </Box>

                  <Box className="flex items-center gap-2">
                    {isLive && <Chip size="small" color="error" label={$t({ id: 'interviews.now' })} />}
                    <StageChip stage={application.stage} />
                    {interview.location_or_link && !isMeetingUrl(interview.location_or_link) && (
                      <Tooltip title={interview.location_or_link}>
                        <Chip
                          size="small"
                          variant="outlined"
                          icon={<MdPlace />}
                          label={interview.location_or_link}
                          className="max-w-40"
                        />
                      </Tooltip>
                    )}
                    {view === 'upcoming' && isMeetingUrl(interview.location_or_link) && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<MdOpenInNew />}
                        href={interview.location_or_link as string}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {$t({ id: 'interview.join' })}
                      </Button>
                    )}
                    {view === 'upcoming' && (
                      <IconButton
                        aria-label={$t({ id: 'interview.edit' })}
                        onClick={() =>
                          setTarget({
                            applicationId: application.id,
                            jobId: application.job.id,
                            candidateName: application.candidate.full_name || application.candidate.email,
                            stage: application.stage,
                            interview,
                          })
                        }
                      >
                        <MdEdit />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Card>
        </motion.section>
      ))}

      <ScheduleInterviewDialog target={target} onClose={() => setTarget(null)} />
    </Box>
  );
}
