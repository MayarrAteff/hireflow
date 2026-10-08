import { APPLICATION_PIPELINE } from '@/constants/applications';
import type { AnalyticsApplication } from '@/types/analytics.types';
import type { ApplicationStage } from '@/types/application.types';
import { dayjs } from '@/utils/dayjs';
import { getSkillMatch } from '@/utils/skillMatch';

export type AnalyticsRange = '30d' | '90d' | 'all';
export const ANALYTICS_RANGES: AnalyticsRange[] = ['30d', '90d', 'all'];

const RANGE_DAYS: Record<Exclude<AnalyticsRange, 'all'>, number> = { '30d': 30, '90d': 90 };

/** How the trend is bucketed for each range, so every chart has a readable number of points. */
const TREND_BUCKETS: Record<AnalyticsRange, { unit: 'day' | 'week' | 'month'; count: number }> = {
  '30d': { unit: 'day', count: 30 },
  '90d': { unit: 'week', count: 13 },
  all: { unit: 'month', count: 12 },
};

const average = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;

const daysBetween = (from: string, to: string) => Math.max(dayjs(to).diff(dayjs(from), 'hour') / 24, 0);

/** Applications received within the range; the range counts today as its last day. */
export function filterByRange(applications: AnalyticsApplication[], range: AnalyticsRange) {
  if (range === 'all') return applications;
  const since = dayjs()
    .subtract(RANGE_DAYS[range] - 1, 'day')
    .startOf('day');
  return applications.filter((application) => !dayjs(application.created_at).isBefore(since));
}

/**
 * How far along the pipeline an application got. Stage changes are not logged, so for a rejected applicant this is
 * inferred from what they left behind: an offer means they reached offer, an interview means they reached interview.
 */
function furthestStageIndex(application: AnalyticsApplication) {
  const current = APPLICATION_PIPELINE.indexOf(application.stage);
  const hadOffer = application.offers.some((offer) => offer.status !== 'draft');
  let evidence = 0;
  if (hadOffer) evidence = APPLICATION_PIPELINE.indexOf('offer');
  else if (application.interviews.length > 0) evidence = APPLICATION_PIPELINE.indexOf('interview');
  return Math.max(current, evidence);
}

export type FunnelStep = {
  stage: ApplicationStage;
  /** Applicants who reached this stage or a later one. */
  count: number;
  /** Share of all applicants, 0–1. */
  share: number;
  /** Share of the previous stage's applicants who made it here, 0–1; null for the first stage. */
  conversion: number | null;
};

export function getFunnel(applications: AnalyticsApplication[]): FunnelStep[] {
  const reached = applications.map(furthestStageIndex);
  const counts = APPLICATION_PIPELINE.map((_stage, index) => reached.filter((furthest) => furthest >= index).length);

  return APPLICATION_PIPELINE.map((stage, index) => {
    const previous = index > 0 ? counts[index - 1] : 0;
    return {
      stage,
      count: counts[index],
      share: applications.length ? counts[index] / applications.length : 0,
      conversion: index > 0 && previous > 0 ? counts[index] / previous : null,
    };
  });
}

/** The step that loses the largest share of the applicants who reached the stage before it. */
export function getBiggestDrop(funnel: FunnelStep[]) {
  const drops = funnel
    .map((step, index) => ({ from: funnel[index - 1]?.stage, to: step.stage, lost: 1 - (step.conversion ?? 1) }))
    .filter((drop) => drop.from && drop.lost > 0);
  return drops.sort((a, b) => b.lost - a.lost)[0] as
    { from: ApplicationStage; to: ApplicationStage; lost: number } | undefined;
}

export function getSummary(applications: AnalyticsApplication[]) {
  const hired = applications.filter((application) => application.stage === 'hired');
  const offers = applications.flatMap((application) => application.offers);
  const accepted = offers.filter((offer) => offer.status === 'accepted').length;
  const answered = accepted + offers.filter((offer) => offer.status === 'declined').length;

  return {
    applicants: applications.length,
    hired: hired.length,
    rejected: applications.filter((application) => application.stage === 'rejected').length,
    /** Application to hire: the accepted offer's answer time when there is one, otherwise the last update. */
    daysToHire: average(
      hired.map((application) => {
        const acceptedOffer = application.offers.find((offer) => offer.status === 'accepted');
        return daysBetween(application.created_at, acceptedOffer?.responded_at ?? application.updated_at);
      }),
    ),
    /** Application to the first time someone at the company opened it. */
    daysToReview: average(
      applications
        .filter((application) => application.viewed_at)
        .map((application) => daysBetween(application.created_at, application.viewed_at as string)),
    ),
    offersAccepted: accepted,
    offersAnswered: answered,
    offerAcceptance: answered ? accepted / answered : null,
  };
}

export type TrendPoint = { start: string; count: number };

/** Applications per day, week or month up to now, depending on the range. */
export function getTrend(applications: AnalyticsApplication[], range: AnalyticsRange) {
  const { unit, count } = TREND_BUCKETS[range];
  const first = dayjs()
    .startOf(unit)
    .subtract(count - 1, unit);
  const points: TrendPoint[] = Array.from({ length: count }, (_item, index) => ({
    start: first.add(index, unit).toISOString(),
    count: 0,
  }));

  applications.forEach((application) => {
    const index = dayjs(application.created_at).startOf(unit).diff(first, unit);
    if (index >= 0 && index < count) points[index].count += 1;
  });

  return { unit, points };
}

export type JobStats = {
  jobId: string;
  title: string;
  applicants: number;
  /** Average share of the job's skills its applicants list, 0–1; null when the job lists no skills. */
  match: number | null;
  interviewed: number;
  hired: number;
};

/** One row per job with applicants, best average skill match first. */
export function getJobStats(applications: AnalyticsApplication[]): JobStats[] {
  const byJob = new Map<string, AnalyticsApplication[]>();
  applications.forEach((application) => {
    byJob.set(application.job_id, [...(byJob.get(application.job_id) ?? []), application]);
  });
  const interviewIndex = APPLICATION_PIPELINE.indexOf('interview');

  return [...byJob.entries()]
    .map(([jobId, jobApplications]) => {
      const { title, skills } = jobApplications[0].job;
      const match = skills.length
        ? average(
            jobApplications.map(
              (application) => getSkillMatch(skills, application.candidate?.skills ?? []).percent / 100,
            ),
          )
        : null;
      return {
        jobId,
        title,
        applicants: jobApplications.length,
        match,
        interviewed: jobApplications.filter((application) => furthestStageIndex(application) >= interviewIndex).length,
        hired: jobApplications.filter((application) => application.stage === 'hired').length,
      };
    })
    .sort((a, b) => (b.match ?? -1) - (a.match ?? -1) || b.applicants - a.applicants);
}
