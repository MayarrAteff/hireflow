import { useIntl } from 'react-intl';

import { dayjs } from '@/utils/dayjs';

/** Formatting shared by every place that shows a job to candidates. */
export function useJobFormatters() {
  const { $t, formatNumber, formatRelativeTime } = useIntl();

  /** "18,000 – 25,000 SAR", "From 18,000 SAR", "Up to 25,000 SAR", or null when no salary is shared. */
  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    const [from, to] = [min, max].map((amount) => (amount == null ? null : formatNumber(amount)));
    if (from && to) return $t({ id: 'jobs.review.salary.range' }, { min: from, max: to, currency });
    if (from) return $t({ id: 'jobs.review.salary.from' }, { min: from, currency });
    if (to) return $t({ id: 'jobs.review.salary.upTo' }, { max: to, currency });
    return null;
  };

  /** Whole days from today: negative in the past, 0 today. */
  const daysFromToday = (date: string) => dayjs(date).startOf('day').diff(dayjs().startOf('day'), 'day');

  /** "today", "yesterday", "in 3 days", "2 days ago". */
  const formatRelativeDay = (date: string) => formatRelativeTime(daysFromToday(date), 'day', { numeric: 'auto' });

  return { formatSalary, daysFromToday, formatRelativeDay };
}
