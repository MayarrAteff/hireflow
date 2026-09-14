import { axiosInstance } from '@/network/interceptor';
import type {
  CreateJobPayload,
  Job,
  JobFields,
  JobSearchFilters,
  JobWithApplicantStages,
  JobWithCompany,
} from '@/types/job.types';

import { SINGLE_OBJECT_HEADERS } from './profile';

/** Write requests return the saved row as a single object. */
const RETURN_SINGLE_HEADERS = { ...SINGLE_OBJECT_HEADERS, Prefer: 'return=representation' };

export function getCompanyJobsRequest(companyId: string) {
  return axiosInstance.get<JobWithApplicantStages[]>('/jobs', {
    params: { company_id: `eq.${companyId}`, select: '*,applications(stage,viewed_at)', order: 'created_at.desc' },
  });
}

export function getLatestPublishedJobsRequest(limit: number) {
  return axiosInstance.get<JobWithCompany[]>('/jobs', {
    params: { status: 'eq.published', select: '*,company:companies(name,logo_url)', order: 'created_at.desc', limit },
  });
}

/** Strips characters that have meaning inside a PostgREST `ilike` pattern. */
const toSearchPattern = (search: string) => `*${search.replace(/[*,()%\\]/g, ' ').trim()}*`;

export function searchPublishedJobsRequest(filters: JobSearchFilters, offset: number, limit: number) {
  return axiosInstance.get<JobWithCompany[]>('/jobs', {
    params: {
      status: 'eq.published',
      select: '*,company:companies(name,logo_url)',
      order: 'created_at.desc',
      offset,
      limit,
      ...(filters.search.trim() && { title: `ilike.${toSearchPattern(filters.search)}` }),
      ...(filters.employmentType && { employment_type: `eq.${filters.employmentType}` }),
      ...(filters.workMode && { work_mode: `eq.${filters.workMode}` }),
    },
  });
}

export function getPublishedJobRequest(jobId: string) {
  return axiosInstance.get<JobWithCompany>('/jobs', {
    params: {
      id: `eq.${jobId}`,
      status: 'eq.published',
      select: '*,company:companies(name,logo_url,industry,website,size,about)',
    },
    headers: SINGLE_OBJECT_HEADERS,
  });
}

/** HEAD request: PostgREST puts the total after the slash in `Content-Range` without sending any rows. */
export function countPublishedJobsRequest() {
  return axiosInstance.head('/jobs', {
    params: { status: 'eq.published' },
    headers: { Prefer: 'count=exact' },
  });
}

export function getJobRequest(jobId: string) {
  return axiosInstance.get<Job>('/jobs', {
    params: { id: `eq.${jobId}`, select: '*' },
    headers: SINGLE_OBJECT_HEADERS,
  });
}

export function createJobRequest(payload: CreateJobPayload) {
  return axiosInstance.post<Job>('/jobs', payload, { headers: RETURN_SINGLE_HEADERS });
}

export function updateJobStatusRequest(jobId: string, status: Job['status']) {
  return axiosInstance.patch<Job>(
    '/jobs',
    { status },
    { params: { id: `eq.${jobId}` }, headers: RETURN_SINGLE_HEADERS },
  );
}

export function updateJobRequest(jobId: string, payload: JobFields) {
  return axiosInstance.patch<Job>('/jobs', payload, {
    params: { id: `eq.${jobId}` },
    headers: RETURN_SINGLE_HEADERS,
  });
}
