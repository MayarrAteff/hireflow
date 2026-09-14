import type { JobFormStep } from '@/store/features/jobFormStepsSlice';
import type { JobFormValues } from '@/types/job.types';
import { JOB_DESCRIPTION_MIN_LENGTH } from '@/validations/job.validation.schema';

export type ReadinessHint = { id: string; step: JobFormStep };

export type JobReadiness = {
  /** Blocks publishing; mirrors the validation schema. */
  missing: ReadinessHint[];
  /** Optional details that make the posting more complete. */
  suggestions: ReadinessHint[];
};

export function getJobReadiness(values: JobFormValues): JobReadiness {
  const missing: ReadinessHint[] = [];
  const suggestions: ReadinessHint[] = [];

  if (!values.title.trim()) missing.push({ id: 'title', step: 'basics' });
  if (values.workMode !== 'remote' && !values.location.trim()) missing.push({ id: 'location', step: 'basics' });
  if (values.description.trim().length < JOB_DESCRIPTION_MIN_LENGTH) {
    missing.push({ id: 'description', step: 'details' });
  }
  if (!values.skills.length) missing.push({ id: 'skills', step: 'details' });

  if (!values.requirements.some((requirement) => requirement.trim())) {
    suggestions.push({ id: 'requirements', step: 'details' });
  }
  if (!values.salaryMin && !values.salaryMax) suggestions.push({ id: 'salary', step: 'compensation' });
  if (!values.deadline) suggestions.push({ id: 'deadline', step: 'compensation' });

  return { missing, suggestions };
}
