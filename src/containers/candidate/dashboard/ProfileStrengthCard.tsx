import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useId } from 'react';
import { MdCheck } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { ACCENT_COLORS } from '@/styles/themes/accents';
import { useAuth } from '@/utils/hooks/useAuth';

const RING_SIZE = 112;
const RING_STROKE = 10;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressRing({ value }: { value: number }) {
  const { palette } = useTheme();
  const gradientId = useId();

  return (
    <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} className="-tw-rotate-90">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={palette.primary.main} />
          <stop offset="1" stopColor={palette.secondary.main} />
        </linearGradient>
      </defs>
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        fill="none"
        stroke={palette.primary.main}
        strokeOpacity={0.14}
        strokeWidth={RING_STROKE}
      />
      <motion.circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={RING_STROKE}
        strokeLinecap="round"
        strokeDasharray={RING_CIRCUMFERENCE}
        initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
        animate={{ strokeDashoffset: RING_CIRCUMFERENCE * (1 - value / 100) }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  );
}

/** How complete the candidate's profile is, based on the fields recruiters look at. */
export function ProfileStrengthCard() {
  const { $t, formatNumber } = useIntl();
  const { profile } = useAuth();

  const items = [
    { id: 'name', done: Boolean(profile?.full_name.trim()) },
    { id: 'headline', done: Boolean(profile?.headline) },
    { id: 'bio', done: Boolean(profile?.bio) },
    { id: 'phone', done: Boolean(profile?.phone) },
    { id: 'cv', done: Boolean(profile?.cv_path) },
    { id: 'photo', done: Boolean(profile?.avatar_url) },
  ];
  const percent = Math.round((items.filter((item) => item.done).length / items.length) * 100);
  const levelId = percent === 100 ? 'complete' : percent >= 50 ? 'good' : 'start';

  return (
    <Card className="tw-h-full">
      <CardContent className="tw-flex tw-h-full tw-flex-col tw-p-6">
        <Typography variant="h5" className="tw-mb-4">
          {$t({ id: 'candidate.profile.title' })}
        </Typography>

        <Box className="tw-mb-5 tw-flex tw-items-center tw-gap-5">
          <Box className="tw-relative tw-shrink-0">
            <ProgressRing value={percent} />
            <Typography
              variant="h3"
              component="span"
              className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center"
            >
              {formatNumber(percent / 100, { style: 'percent' })}
            </Typography>
          </Box>
          <Box className="tw-min-w-0">
            <Typography fontWeight={700}>{$t({ id: `candidate.profile.level.${levelId}.title` })}</Typography>
            <Typography variant="body2" color="text.secondary">
              {$t({ id: `candidate.profile.level.${levelId}.body` })}
            </Typography>
          </Box>
        </Box>

        <Box component="ul" className="tw-m-0 tw-mb-4 tw-grid tw-list-none tw-grid-cols-2 tw-gap-x-3 tw-gap-y-2 tw-p-0">
          {items.map((item) => (
            <Box component="li" key={item.id} className="tw-flex tw-items-center tw-gap-2">
              <Box
                className="tw-flex tw-h-5 tw-w-5 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-full"
                sx={
                  item.done ? { bgcolor: ACCENT_COLORS.emerald, color: '#fff' } : { border: 2, borderColor: 'divider' }
                }
              >
                {item.done && <MdCheck size={14} />}
              </Box>
              <Typography variant="body2" color={item.done ? 'text.primary' : 'text.secondary'} noWrap>
                {$t({ id: `candidate.profile.item.${item.id}` })}
              </Typography>
            </Box>
          ))}
        </Box>

        <Chip
          size="small"
          variant="outlined"
          label={$t({ id: 'candidate.profile.editingSoon' })}
          className="tw-w-fit"
        />
      </CardContent>
    </Card>
  );
}
