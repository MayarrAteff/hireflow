import type { JobFormStep } from '@/store/features/jobFormStepsSlice';
import type { EmploymentType, Job, JobFormValues, JobStatus, WorkMode } from '@/types/job.types';
import { dayjs } from '@/utils/dayjs';

export const EMPLOYMENT_TYPES: EmploymentType[] = ['full_time', 'part_time', 'contract', 'internship'];
export const WORK_MODES: WorkMode[] = ['onsite', 'remote', 'hybrid'];
export const DEFAULT_CURRENCY = 'EGP';
export const CURRENCIES = [DEFAULT_CURRENCY, 'SAR', 'AED', 'USD', 'EUR'];

/** Fields validated before leaving each step. */
export const JOB_STEP_FIELDS: Record<JobFormStep, (keyof JobFormValues)[]> = {
  basics: ['title', 'employmentType', 'workMode', 'location'],
  details: ['description', 'requirements', 'skills'],
  compensation: ['salaryMin', 'salaryMax', 'currency', 'deadline'],
  review: [],
};

/** A draft only needs a title, plus well-formed values in whatever else was filled in. */
export const JOB_DRAFT_FIELDS: (keyof JobFormValues)[] = ['title', 'salaryMin', 'salaryMax', 'deadline'];

/** What recruiters see: the stored status, plus `expired` for a published job past its deadline. */
export type JobDisplayStatus = JobStatus | 'expired';

/** The deadline is inclusive: a job closing today still takes applications today. */
export function isJobExpired(job: Pick<Job, 'status' | 'deadline'>) {
  return job.status === 'published' && job.deadline !== null && dayjs(job.deadline).endOf('day').isBefore(dayjs());
}

export function getJobDisplayStatus(job: Pick<Job, 'status' | 'deadline'>): JobDisplayStatus {
  return isJobExpired(job) ? 'expired' : job.status;
}
