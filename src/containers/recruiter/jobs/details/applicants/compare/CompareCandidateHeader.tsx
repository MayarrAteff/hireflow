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
import { ProgressRing } from '@/components/UI/ProgressRing';
import type { RecruiterApplication } from '@/types/application.types';
import type { CandidateFit } from '@/utils/candidateFit';

import { ApplicantAvatar } from '../ApplicantAvatar';

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
    <Box className="tw-flex tw-min-w-48 tw-flex-col tw-gap-1 tw-p-1">
      <Typography variant="caption" fontWeight={700}>
        {$t({ id: 'compare.fit.title' })}
      </Typography>
      {fit.parts.length === 0 ? (
        <Typography variant="caption">{$t({ id: 'compare.fit.noData' })}</Typography>
      ) : (
        fit.parts.map((part) => (
          <Box key={part.key} className="tw-flex tw-justify-between tw-gap-4">
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
      <Typography variant="caption" className="tw-mt-1 tw-opacity-80">
        {$t({ id: 'compare.fit.note' })}
      </Typography>
    </Box>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="tw-flex tw-h-full tw-flex-col tw-gap-3 tw-p-4"
    >
      <Box className="tw-flex tw-items-start tw-gap-1">
        <ButtonBase
          onClick={onOpenProfile}
          className="tw-flex tw-min-w-0 tw-flex-1 tw-items-center tw-justify-start tw-gap-3 tw-rounded-xl tw-p-1 tw-text-start"
          sx={{ '&:hover': { bgcolor: 'action.hover' } }}
        >
          <ApplicantAvatar candidate={candidate} size={48} />
          <Box className="tw-min-w-0">
            <Box className="tw-flex tw-min-w-0 tw-items-center tw-gap-1.5">
              <Typography fontWeight={700} noWrap className="tw-min-w-0">
                {name}
              </Typography>
              {isTopPick && (
                <Box
                  component="span"
                  className="tw-inline-flex tw-shrink-0 tw-items-center tw-gap-1 tw-rounded-full tw-px-2 tw-py-0.5 tw-text-[11px] tw-font-bold tw-leading-4"
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

      <Box className="tw-flex tw-items-center tw-gap-3 tw-px-1">
        <Tooltip title={breakdown} placement="bottom-start">
          <Box
            tabIndex={0}
            role="img"
            aria-label={$t({ id: 'compare.fitScoreValue' }, { percent })}
            className="tw-relative tw-shrink-0 tw-cursor-help"
          >
            <ProgressRing value={fit.score} size={60} stroke={6} />
            <Typography
              variant="body2"
              fontWeight={800}
              className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center"
            >
              {percent}
            </Typography>
          </Box>
        </Tooltip>
        <Box className="tw-flex tw-min-w-0 tw-flex-col tw-items-start tw-gap-1">
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {$t({ id: 'compare.fitScore' })}
          </Typography>
          <StageChip stage={application.stage} />
        </Box>
      </Box>
    </motion.div>
  );
}
