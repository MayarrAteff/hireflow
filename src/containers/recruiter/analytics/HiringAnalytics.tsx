import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import type { IconType } from 'react-icons';
import { MdGroups, MdHandshake, MdTimer, MdVisibility } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import { EmptyJobsIllustration } from '@/components/UI/Illustrations';
import { useCompanyAnalytics } from '@/hooks/useApplications';
import type { AccentColor } from '@/styles/themes/accents';
import {
  ANALYTICS_RANGES,
  type AnalyticsRange,
  filterByRange,
  getFunnel,
  getJobStats,
  getSummary,
  getTrend,
} from '@/utils/hiringAnalytics';
import { useAuth } from '@/utils/hooks/useAuth';

import { CompanySetupCard } from '../jobs/CompanySetupCard';
import { ApplicationsTrendChart } from './ApplicationsTrendChart';
import { JobsMatchTable } from './JobsMatchTable';
import { PipelineFunnel } from './PipelineFunnel';

const NO_VALUE = '—';

type ChartCardProps = {
  titleId: string;
  subtitleId?: string;
  className?: string;
  children: ReactNode;
};

function ChartCard({ titleId, subtitleId, className, children }: ChartCardProps) {
  const { $t } = useIntl();

  return (
    <Card className={className}>
      <CardContent className="p-5 sm:p-6">
        <Typography variant="h5">{$t({ id: titleId })}</Typography>
        {subtitleId && (
          <Typography variant="body2" color="text.secondary">
            {$t({ id: subtitleId })}
          </Typography>
        )}
        <Box className="mt-4">{children}</Box>
      </CardContent>
    </Card>
  );
}

/** How the company's hiring pipeline performs: volume, speed, drop-off and which jobs draw the best-fitting applicants. */
export function HiringAnalytics() {
  const { $t, formatNumber } = useIntl();
  const { profile } = useAuth();
  const { data: applications = [], isPending } = useCompanyAnalytics(profile?.company_id);
  const [range, setRange] = useState<AnalyticsRange>('90d');

  const inRange = useMemo(() => filterByRange(applications, range), [applications, range]);
  const summary = useMemo(() => getSummary(inRange), [inRange]);
  const funnel = useMemo(() => getFunnel(inRange), [inRange]);
  const trend = useMemo(() => getTrend(inRange, range), [inRange, range]);
  const jobs = useMemo(() => getJobStats(inRange), [inRange]);

  if (!profile?.company_id) return <CompanySetupCard />;

  const formatDays = (days: number | null) =>
    days === null
      ? NO_VALUE
      : formatNumber(days, { style: 'unit', unit: 'day', unitDisplay: 'long', maximumFractionDigits: 1 });

  const tiles: { icon: IconType; color: AccentColor; labelId: string; value: string; hint: string }[] = [
    {
      icon: MdGroups,
      color: 'violet',
      labelId: 'analytics.kpi.applicants',
      value: formatNumber(summary.applicants),
      hint: $t({ id: 'analytics.kpi.applicants.hint' }, { count: summary.hired }),
    },
    {
      icon: MdTimer,
      color: 'emerald',
      labelId: 'analytics.kpi.timeToHire',
      value: formatDays(summary.daysToHire),
      hint: $t({ id: 'analytics.kpi.timeToHire.hint' }),
    },
    {
      icon: MdVisibility,
      color: 'sky',
      labelId: 'analytics.kpi.timeToReview',
      value: formatDays(summary.daysToReview),
      hint: $t({ id: 'analytics.kpi.timeToReview.hint' }),
    },
    {
      icon: MdHandshake,
      color: 'amber',
      labelId: 'analytics.kpi.offerAcceptance',
      value:
        summary.offerAcceptance === null
          ? NO_VALUE
          : formatNumber(summary.offerAcceptance, { style: 'percent', maximumFractionDigits: 0 }),
      hint: $t(
        { id: 'analytics.kpi.offerAcceptance.hint' },
        { accepted: summary.offersAccepted, answered: summary.offersAnswered },
      ),
    },
  ];

  const emptyPeriod = <Typography color="text.secondary">{$t({ id: 'analytics.period.empty' })}</Typography>;

  return (
    <Box className="mx-auto flex max-w-6xl flex-col gap-6">
      <Box className="flex flex-wrap items-center justify-between gap-4">
        <Box>
          <Typography variant="h2">{$t({ id: 'analytics.title' })}</Typography>
          <Typography color="text.secondary">{$t({ id: 'analytics.subtitle' })}</Typography>
        </Box>
        {applications.length > 0 && (
          <ToggleButtonGroup
            exclusive
            size="small"
            value={range}
            onChange={(_event, value: AnalyticsRange | null) => value && setRange(value)}
            aria-label={$t({ id: 'analytics.range.label' })}
          >
            {ANALYTICS_RANGES.map((option) => (
              <ToggleButton key={option} value={option} className="px-4">
                {$t({ id: `analytics.range.${option}` })}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
      </Box>

      {isPending && (
        <>
          <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} variant="rounded" height={108} className="rounded-2xl" />
            ))}
          </Box>
          <Skeleton variant="rounded" height={340} className="rounded-2xl" />
        </>
      )}

      {!isPending && applications.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center px-6 py-12 text-center">
            <EmptyJobsIllustration className="mb-4 w-48" />
            <Typography variant="h3" className="mb-2">
              {$t({ id: 'analytics.empty.title' })}
            </Typography>
            <Typography color="text.secondary" className="max-w-md">
              {$t({ id: 'analytics.empty.body' })}
            </Typography>
          </CardContent>
        </Card>
      )}

      {applications.length > 0 && (
        <>
          <Box className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tiles.map(({ icon, color, labelId, value, hint }, index) => (
              <motion.div
                key={labelId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <Card className="h-full">
                  <CardContent className="flex items-start gap-4">
                    <IconTile icon={icon} color={color} size="lg" />
                    <Box className="min-w-0">
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {$t({ id: labelId })}
                      </Typography>
                      <Typography variant="h3" component="p" noWrap>
                        {value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap component="p">
                        {hint}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>

          <Box className="grid gap-6 lg:grid-cols-5">
            <ChartCard titleId="analytics.trend.title" className="lg:col-span-3">
              {/* Keyed by range so the chart redraws cleanly when the bucket size changes. */}
              <Box dir="ltr">
                <ApplicationsTrendChart key={range} unit={trend.unit} points={trend.points} />
              </Box>
            </ChartCard>
            <ChartCard
              titleId="analytics.funnel.title"
              subtitleId="analytics.funnel.subtitle"
              className="lg:col-span-2"
            >
              {inRange.length > 0 ? <PipelineFunnel funnel={funnel} rejected={summary.rejected} /> : emptyPeriod}
            </ChartCard>
          </Box>

          <ChartCard titleId="analytics.jobs.title" subtitleId="analytics.jobs.subtitle">
            {jobs.length > 0 ? <JobsMatchTable jobs={jobs} /> : emptyPeriod}
          </ChartCard>
        </>
      )}
    </Box>
  );
}
