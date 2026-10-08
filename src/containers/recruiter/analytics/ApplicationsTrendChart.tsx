import { useTheme } from '@mui/material/styles';
import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';
import { useIntl } from 'react-intl';

import type { TrendPoint } from '@/utils/hiringAnalytics';

type ApplicationsTrendChartProps = {
  unit: 'day' | 'week' | 'month';
  points: TrendPoint[];
};

/** Applications received per period as a single-series area chart. */
export function ApplicationsTrendChart({ unit, points }: ApplicationsTrendChartProps) {
  const { $t, formatDate, formatNumber } = useIntl();
  const theme = useTheme();

  const labels = points.map(({ start }) =>
    formatDate(start, unit === 'month' ? { month: 'short', year: '2-digit' } : { month: 'short', day: 'numeric' }),
  );
  const axisLabelStyle = { colors: theme.palette.text.secondary, fontSize: '12px' };

  const options: ApexOptions = {
    chart: {
      background: 'transparent',
      fontFamily: theme.typography.fontFamily,
      toolbar: { show: false },
      zoom: { enabled: false },
      parentHeightOffset: 0,
    },
    theme: { mode: theme.palette.mode },
    colors: [theme.palette.primary.main],
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.28, opacityTo: 0.02 } },
    dataLabels: { enabled: false },
    markers: { size: 0, hover: { size: 5 } },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 0, padding: { left: 8, right: 8 } },
    xaxis: {
      categories: labels,
      tickAmount: 6,
      labels: { style: axisLabelStyle, rotate: 0, hideOverlappingLabels: true },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      // Counts are whole numbers; fractional ticks on a small scale are left blank.
      labels: { style: axisLabelStyle, formatter: (value) => (Number.isInteger(value) ? formatNumber(value) : '') },
    },
    tooltip: { theme: theme.palette.mode, y: { formatter: (value) => formatNumber(value) } },
  };

  return (
    <Chart
      type="area"
      height={280}
      options={options}
      series={[{ name: $t({ id: 'analytics.trend.series' }), data: points.map(({ count }) => count) }]}
    />
  );
}
