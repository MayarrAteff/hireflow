import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useIntl } from 'react-intl';

import { type FunnelStep, getBiggestDrop } from '@/utils/hiringAnalytics';

type PipelineFunnelProps = {
  funnel: FunnelStep[];
  rejected: number;
};

/** Applicants who reached each stage as bars on one scale, with the weakest step called out underneath. */
export function PipelineFunnel({ funnel, rejected }: PipelineFunnelProps) {
  const { $t, formatNumber } = useIntl();
  const formatPercent = (value: number) => formatNumber(value, { style: 'percent', maximumFractionDigits: 0 });
  const stageLabel = (stage: FunnelStep['stage']) => $t({ id: `application.stage.${stage}` });
  const biggestDrop = getBiggestDrop(funnel);

  return (
    <Box className="flex flex-col gap-4">
      <Box component="ol" className="m-0 flex list-none flex-col gap-3 p-0">
        {funnel.map(({ stage, count, share, conversion }, index) => {
          const hint =
            conversion === null
              ? $t({ id: 'analytics.funnel.share' }, { percent: formatPercent(share) })
              : $t(
                  { id: 'analytics.funnel.conversion' },
                  { percent: formatPercent(conversion), stage: stageLabel(funnel[index - 1].stage) },
                );
          return (
            <Tooltip key={stage} title={hint} placement="top" followCursor>
              <Box component="li" className="grid grid-cols-[5.5rem_minmax(0,1fr)_5rem] items-center gap-3">
                <Typography variant="body2" color="text.secondary" noWrap>
                  {stageLabel(stage)}
                </Typography>
                <Box className="h-5 rounded-e-md" sx={{ bgcolor: 'action.hover' }}>
                  <motion.div
                    className="h-full rounded-e-md"
                    style={{ minWidth: count > 0 ? 4 : 0 }}
                    initial={{ width: 0 }}
                    animate={{ width: `${share * 100}%` }}
                    transition={{ duration: 0.5, delay: index * 0.06, ease: 'easeOut' }}
                  >
                    <Box className="h-full rounded-e-md" sx={{ bgcolor: 'primary.main' }} />
                  </motion.div>
                </Box>
                <Typography variant="body2" className="tabular-nums" noWrap>
                  <Box component="span" fontWeight={700}>
                    {formatNumber(count)}
                  </Box>{' '}
                  <Box component="span" sx={{ color: 'text.secondary' }}>
                    {formatPercent(share)}
                  </Box>
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {(biggestDrop || rejected > 0) && (
        <Box className="flex flex-col gap-1 rounded-2xl p-3" sx={{ bgcolor: 'action.hover' }}>
          {biggestDrop && (
            <Typography variant="body2">
              {$t(
                { id: 'analytics.funnel.biggestDrop' },
                {
                  from: stageLabel(biggestDrop.from),
                  to: stageLabel(biggestDrop.to),
                  percent: formatPercent(biggestDrop.lost),
                },
              )}
            </Typography>
          )}
          {rejected > 0 && (
            <Typography variant="body2" color="text.secondary">
              {$t({ id: 'analytics.funnel.rejected' }, { count: rejected })}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
