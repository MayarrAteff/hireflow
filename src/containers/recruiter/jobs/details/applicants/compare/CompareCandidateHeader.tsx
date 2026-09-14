import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { FaCrown } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { StageChip } from '@/components/Jobs/StageChip';
import { ApplicantAvatar } from '@/components/Profile/ApplicantAvatar';
import { ProgressRing } from '@/components/UI/ProgressRing';
import type { RecruiterApplication } from '@/types/application.types';
import type { CandidateFit } from '@/utils/candidateFit';

type CompareCandidateHeaderProps = {
  application: RecruiterApplication;
  fit: CandidateFit;
  isTopPick: boolean;
  canRemove: boolean;
  onRemove: () => void;
  onOpenProfile: () => void;
};

export function CompareCandidateHeader({
  application,
  fit,
  isTopPick,
  canRemove,
  onRemove,
  onOpenProfile,
}: CompareCandidateHeaderProps) {
  const { $t, formatNumber } = useIntl();
  const { candidate } = application;
  const name = candidate.full_name || candidate.email;
  const percent = formatNumber(fit.score / 100, { style: 'percent' });

  const breakdown = (
    <Box className="flex min-w-48 flex-col gap-1 p-1">
      <Typography variant="caption" fontWeight={700}>
        {$t({ id: 'compare.fit.title' })}
      </Typography>
      {fit.parts.length === 0 ? (
        <Typography variant="caption">{$t({ id: 'compare.fit.noData' })}</Typography>
      ) : (
        fit.parts.map((part) => (
          <Box key={part.key} className="flex justify-between gap-4">
            <Typography variant="caption">
              {$t(
                { id: 'compare.fit.weight' },
                { label: $t({ id: `compare.fit.part.${part.key}` }), weight: part.weight },
              )}
            </Typography>
            <Typography variant="caption" fontWeight={700}>
              {formatNumber(part.value / 100, { style: 'percent' })}
            </Typography>
          </Box>
        ))
      )}
      <Typography variant="caption" className="mt-1 opacity-80">
        {$t({ id: 'compare.fit.note' })}
      </Typography>
    </Box>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex h-full flex-col gap-3 p-4"
    >
      <Box className="flex items-start gap-1">
        <ButtonBase
          onClick={onOpenProfile}
          className="flex min-w-0 flex-1 items-center justify-start gap-3 rounded-xl p-1 text-start"
          sx={{ '&:hover': { bgcolor: 'action.hover' } }}
        >
          <ApplicantAvatar candidate={candidate} size={48} />
          <Box className="min-w-0">
            <Box className="flex min-w-0 items-center gap-1.5">
              <Typography fontWeight={700} noWrap className="min-w-0">
                {name}
              </Typography>
              {isTopPick && (
                <Box
                  component="span"
                  className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold leading-4"
                  sx={{ bgcolor: 'text.primary', color: 'background.paper' }}
                >
                  <FaCrown size={10} aria-hidden />
                  {$t({ id: 'compare.topPick' })}
                </Box>
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" noWrap>
              {candidate.headline || candidate.email}
            </Typography>
          </Box>
        </ButtonBase>
        {canRemove && (
          <Tooltip title={$t({ id: 'compare.remove' }, { name })}>
            <IconButton size="small" onClick={onRemove} aria-label={$t({ id: 'compare.remove' }, { name })}>
              <MdClose />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box className="flex items-center gap-3 px-1">
        <Tooltip title={breakdown} placement="bottom-start">
          <Box
            tabIndex={0}
            role="img"
            aria-label={$t({ id: 'compare.fitScoreValue' }, { percent })}
            className="relative shrink-0 cursor-help"
          >
            <ProgressRing value={fit.score} size={60} stroke={6} />
            <Typography variant="body2" fontWeight={800} className="absolute inset-0 flex items-center justify-center">
              {percent}
            </Typography>
          </Box>
        </Tooltip>
        <Box className="flex min-w-0 flex-col items-start gap-1">
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {$t({ id: 'compare.fitScore' })}
          </Typography>
          <StageChip stage={application.stage} />
        </Box>
      </Box>
    </motion.div>
  );
}
