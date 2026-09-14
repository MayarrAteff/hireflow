import type { JobFormStep } from '@/store/features/jobFormStepsSlice';
import type { EmploymentType, JobFormValues, WorkMode } from '@/types/job.types';

export const EMPLOYMENT_TYPES: EmploymentType[] = ['full_time', 'part_time', 'contract', 'internship'];
export const WORK_MODES: WorkMode[] = ['onsite', 'remote', 'hybrid'];
export const CURRENCIES = ['SAR', 'AED', 'EGP', 'USD', 'EUR'];

/** Fields validated before leaving each step. */
export const JOB_STEP_FIELDS: Record<JobFormStep, (keyof JobFormValues)[]> = {
  basics: ['title', 'employmentType', 'workMode', 'location'],
  details: ['description', 'requirements', 'skills'],
  compensation: ['salaryMin', 'salaryMax', 'currency', 'deadline'],
  review: [],
};

/** A draft only needs a title, plus well-formed values in whatever else was filled in. */
export const JOB_DRAFT_FIELDS: (keyof JobFormValues)[] = ['title', 'salaryMin', 'salaryMax', 'deadline'];
