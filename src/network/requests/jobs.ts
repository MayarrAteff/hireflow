import { axiosInstance } from '@/network/interceptor';
import type { CreateJobPayload, Job, JobFields, JobWithCompany } from '@/types/job.types';

import { SINGLE_OBJECT_HEADERS } from './profile';

/** Write requests return the saved row as a single object. */
const RETURN_SINGLE_HEADERS = { ...SINGLE_OBJECT_HEADERS, Prefer: 'return=representation' };

export function getCompanyJobsRequest(companyId: string) {
  return axiosInstance.get<Job[]>('/jobs', {
    params: { company_id: `eq.${companyId}`, select: '*', order: 'created_at.desc' },
  });
}

export function getLatestPublishedJobsRequest(limit: number) {
  return axiosInstance.get<JobWithCompany[]>('/jobs', {
    params: { status: 'eq.published', select: '*,company:companies(name)', order: 'created_at.desc', limit },
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

export function updateJobRequest(jobId: string, payload: JobFields) {
  return axiosInstance.patch<Job>('/jobs', payload, {
    params: { id: `eq.${jobId}` },
    headers: RETURN_SINGLE_HEADERS,
  });
}
