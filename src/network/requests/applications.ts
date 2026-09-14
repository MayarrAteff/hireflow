import { axiosInstance } from '@/network/interceptor';
import type { CandidateApplication, CreateApplicationPayload, JobApplication } from '@/types/application.types';

import { SINGLE_OBJECT_HEADERS } from './profile';

export function getCandidateApplicationsRequest(candidateId: string) {
  return axiosInstance.get<CandidateApplication[]>('/applications', {
    params: {
      candidate_id: `eq.${candidateId}`,
      select: 'id,job_id,stage,created_at,updated_at,job:jobs(title,company:companies(name))',
      order: 'updated_at.desc',
    },
  });
}

export function getCandidateApplicationForJobRequest(candidateId: string, jobId: string) {
  return axiosInstance.get<JobApplication[]>('/applications', {
    params: {
      candidate_id: `eq.${candidateId}`,
      job_id: `eq.${jobId}`,
      select: 'id,stage,created_at,cv_path,cover_letter',
    },
  });
}

export function createApplicationRequest(payload: CreateApplicationPayload) {
  return axiosInstance.post<JobApplication>('/applications', payload, {
    params: { select: 'id,stage,created_at,cv_path,cover_letter' },
    headers: { ...SINGLE_OBJECT_HEADERS, Prefer: 'return=representation' },
  });
}

export function deleteApplicationRequest(applicationId: string) {
  return axiosInstance.delete('/applications', { params: { id: `eq.${applicationId}` } });
}
