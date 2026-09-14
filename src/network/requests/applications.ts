import { axiosInstance } from '@/network/interceptor';
import type {
  ApplicationUpdatePayload,
  CandidateApplication,
  CreateApplicationPayload,
  JobApplication,
  RecruiterApplication,
} from '@/types/application.types';

import { SINGLE_OBJECT_HEADERS } from './profile';

const CANDIDATE_APPLICATION_SELECT = 'id,stage,created_at,cv_path,cover_letter,interviews(*),offers(*)';

const APPLICANT_COLUMNS =
  'id,full_name,email,phone,avatar_url,headline,bio,location,skills,years_of_experience,linkedin_url,portfolio_url,github_url';
const RECRUITER_APPLICATION_SELECT = `*,candidate:profiles(${APPLICANT_COLUMNS}),interviews(*),offers(*)`;

export function getCandidateApplicationsRequest(candidateId: string) {
  return axiosInstance.get<CandidateApplication[]>('/applications', {
    params: {
      candidate_id: `eq.${candidateId}`,
      select:
        'id,job_id,stage,created_at,updated_at,job:jobs(title,company:companies(name)),offers(id,status,expires_at,created_at)',
      order: 'updated_at.desc',
    },
  });
}

export function getCandidateApplicationForJobRequest(candidateId: string, jobId: string) {
  return axiosInstance.get<JobApplication[]>('/applications', {
    params: {
      candidate_id: `eq.${candidateId}`,
      job_id: `eq.${jobId}`,
      select: CANDIDATE_APPLICATION_SELECT,
    },
  });
}

export function createApplicationRequest(payload: CreateApplicationPayload) {
  return axiosInstance.post<JobApplication>('/applications', payload, {
    params: { select: CANDIDATE_APPLICATION_SELECT },
    headers: { ...SINGLE_OBJECT_HEADERS, Prefer: 'return=representation' },
  });
}

export function deleteApplicationRequest(applicationId: string) {
  return axiosInstance.delete('/applications', { params: { id: `eq.${applicationId}` } });
}

export function getJobApplicationsRequest(jobId: string) {
  return axiosInstance.get<RecruiterApplication[]>('/applications', {
    params: { job_id: `eq.${jobId}`, select: RECRUITER_APPLICATION_SELECT, order: 'position.asc,created_at.asc' },
  });
}

export function updateApplicationRequest(applicationId: string, payload: ApplicationUpdatePayload) {
  return axiosInstance.patch('/applications', payload, { params: { id: `eq.${applicationId}` } });
}
