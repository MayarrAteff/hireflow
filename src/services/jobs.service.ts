import {
  countPublishedJobsRequest,
  createJobRequest,
  getCompanyJobsRequest,
  getJobRequest,
  getLatestPublishedJobsRequest,
  getPublishedJobRequest,
  searchPublishedJobsRequest,
  updateJobRequest,
  updateJobStatusRequest,
} from '@/network/requests/jobs';
import type { CreateJobPayload, Job, JobFields, JobFormValues, JobSearchFilters, JobStatus } from '@/types/job.types';
import { dayjs } from '@/utils/dayjs';

export async function getCompanyJobs(companyId: string) {
  const response = await getCompanyJobsRequest(companyId);
  return response.data;
}

export async function getLatestPublishedJobs(limit: number) {
  const response = await getLatestPublishedJobsRequest(limit);
  return response.data;
}

export async function searchPublishedJobs(filters: JobSearchFilters, offset: number, limit: number) {
  const response = await searchPublishedJobsRequest(filters, offset, limit);
  return response.data;
}

export async function getPublishedJob(jobId: string) {
  const response = await getPublishedJobRequest(jobId);
  return response.data;
}

export async function countPublishedJobs() {
  const response = await countPublishedJobsRequest();
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
    currency: job?.currency ?? 'SAR',
    deadline: job?.deadline ? dayjs(job.deadline) : null,
  };
}
