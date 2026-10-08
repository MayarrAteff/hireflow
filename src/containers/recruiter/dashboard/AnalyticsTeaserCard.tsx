import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { createLink } from '@tanstack/react-router';
import { MdArrowForward, MdInsights } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import { useCompanyAnalytics } from '@/hooks/useApplications';
import { filterByRange, getSummary } from '@/utils/hiringAnalytics';
import { useAuth } from '@/utils/hooks/useAuth';

const ButtonLink = createLink(Button);
const NO_VALUE = '—';

/** A few headline figures from the last 30 days that lead into the full analytics page; hidden until there are applicants. */
export function AnalyticsTeaserCard() {
  const { $t, formatNumber } = useIntl();
  const { profile } = useAuth();
  const { data: applications = [] } = useCompanyAnalytics(profile?.company_id);

  if (applications.length === 0) return null;

  const summary = getSummary(filterByRange(applications, '30d'));
  const figures = [
    { labelId: 'analytics.kpi.applicants', value: formatNumber(summary.applicants) },
    {
      labelId: 'analytics.kpi.timeToReview',
      value:
        summary.daysToReview === null
          ? NO_VALUE
          : formatNumber(summary.daysToReview, {
              style: 'unit',
              unit: 'day',
              unitDisplay: 'long',
              maximumFractionDigits: 1,
            }),
    },
    {
      labelId: 'analytics.kpi.offerAcceptance',
      value:
        summary.offerAcceptance === null
          ? NO_VALUE
          : formatNumber(summary.offerAcceptance, { style: 'percent', maximumFractionDigits: 0 }),
    },
  ];

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center">
        <Box className="flex items-center gap-3 lg:w-64 lg:shrink-0">
          <IconTile icon={MdInsights} color="violet" />
          <Box className="min-w-0">
            <Typography variant="h5">{$t({ id: 'analytics.title' })}</Typography>
            <Typography variant="body2" color="text.secondary">
              {$t({ id: 'analytics.range.30d' })}
            </Typography>
          </Box>
        </Box>

        <Box className="grid flex-1 gap-4 sm:grid-cols-3">
          {figures.map(({ labelId, value }) => (
            <Box key={labelId} className="min-w-0">
              <Typography variant="h4" component="p" noWrap>
                {value}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {$t({ id: labelId })}
              </Typography>
            </Box>
          ))}
        </Box>

        <ButtonLink
          variant="outlined"
          to="/recruiter/analytics"
          endIcon={<MdArrowForward className="rtl:rotate-180" />}
          className="shrink-0 self-start lg:self-center"
        >
          {$t({ id: 'dashboard.analytics.view' })}
        </ButtonLink>
      </CardContent>
    </Card>
  );
}
