import { DEFAULT_CURRENCY } from '@/constants/jobs';
import {
  countOpenJobsRequest,
  createJobRequest,
  getCompanyJobsRequest,
  getCompanyPublishedJobsRequest,
  getJobRequest,
  getLatestPublishedJobsRequest,
  getPublishedJobRequest,
  searchPublishedJobsRequest,
  updateJobRequest,
  updateJobStatusRequest,
} from '@/network/requests/jobs';
import type {
  CreateJobPayload,
  Job,
  JobFields,
  JobFormValues,
  JobPostedFilter,
  JobSearchFilters,
  JobStatus,
} from '@/types/job.types';
import { dayjs } from '@/utils/dayjs';

export async function getCompanyJobs(companyId: string) {
  const response = await getCompanyJobsRequest(companyId);
  return response.data;
}

const today = () => dayjs().format('YYYY-MM-DD');

/** How many days back each "posted" filter reaches, counting today. */
const POSTED_WITHIN_DAYS: Record<JobPostedFilter, number> = { today: 1, week: 7, month: 30 };

export async function getLatestPublishedJobs(limit: number) {
  const response = await getLatestPublishedJobsRequest(limit, today());
  return response.data;
}

export async function getCompanyPublishedJobs(companyId: string) {
  const response = await getCompanyPublishedJobsRequest(companyId);
  return response.data;
}

export async function searchPublishedJobs(filters: JobSearchFilters, offset: number, limit: number) {
  // Nothing can match "applied" before the first application, so there is no request to make.
  if (filters.application === 'applied' && filters.appliedJobIds.length === 0) return [];

  const postedSince = filters.posted
    ? dayjs()
        .subtract(POSTED_WITHIN_DAYS[filters.posted] - 1, 'day')
        .startOf('day')
        .toISOString()
    : null;
  const response = await searchPublishedJobsRequest(filters, postedSince, offset, limit);
  return response.data;
}

export async function getPublishedJob(jobId: string) {
  const response = await getPublishedJobRequest(jobId);
  return response.data;
}

export async function countOpenJobs() {
  const response = await countOpenJobsRequest(today());
  const total = String(response.headers['content-range'] ?? '').split('/')[1];
  return Number(total) || 0;
}

export async function getJob(jobId: string) {
  const response = await getJobRequest(jobId);
  return response.data;
}

export async function createJob(payload: CreateJobPayload) {
  const response = await createJobRequest(payload);
  return response.data;
}

export async function updateJobStatus(jobId: string, status: JobStatus) {
  const response = await updateJobStatusRequest(jobId, status);
  return response.data;
}

export async function updateJob(jobId: string, payload: JobFields) {
  const response = await updateJobRequest(jobId, payload);
  return response.data;
}

const toAmount = (value: string) => (value.trim() ? Number(value) : null);

export function toJobFields(values: JobFormValues, status: JobStatus): JobFields {
  return {
    title: values.title.trim(),
    employment_type: values.employmentType,
    work_mode: values.workMode,
    location: values.location.trim() || null,
    description: values.description.trim(),
    requirements: values.requirements.map((requirement) => requirement.trim()).filter(Boolean),
    skills: values.skills,
    salary_min: toAmount(values.salaryMin),
    salary_max: toAmount(values.salaryMax),
    currency: values.currency,
    deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : null,
    status,
  };
}

export function toJobFormValues(job?: Job): JobFormValues {
  return {
    title: job?.title ?? '',
    employmentType: job?.employment_type ?? 'full_time',
    workMode: job?.work_mode ?? 'onsite',
    location: job?.location ?? '',
    description: job?.description ?? '',
    requirements: job?.requirements ?? [],
    skills: job?.skills ?? [],
    salaryMin: job?.salary_min?.toString() ?? '',
    salaryMax: job?.salary_max?.toString() ?? '',
    currency: job?.currency ?? DEFAULT_CURRENCY,
    deadline: job?.deadline ? dayjs(job.deadline) : null,
  };
}
