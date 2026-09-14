import { axiosInstance } from '@/network/interceptor';
import type { Interview, InterviewPayload, InterviewWithContext } from '@/types/interview.types';

import { SINGLE_OBJECT_HEADERS } from './profile';

const RETURN_SINGLE_HEADERS = { ...SINGLE_OBJECT_HEADERS, Prefer: 'return=representation' };

const INTERVIEW_CONTEXT_SELECT =
  '*,application:applications(id,stage,job:jobs(id,title),candidate:profiles(id,full_name,email,avatar_url,headline))';

/** Row-level security limits this to interviews on the recruiter's own company jobs. */
export function getCompanyInterviewsRequest(range: { from?: string; before?: string }, ascending: boolean) {
  return axiosInstance.get<InterviewWithContext[]>('/interviews', {
    params: {
      select: INTERVIEW_CONTEXT_SELECT,
      order: `scheduled_at.${ascending ? 'asc' : 'desc'}`,
      ...(range.from && { scheduled_at: `gte.${range.from}` }),
      ...(range.before && { scheduled_at: `lt.${range.before}` }),
    },
  });
}

export function createInterviewRequest(payload: InterviewPayload) {
  return axiosInstance.post<Interview>('/interviews', payload, { headers: RETURN_SINGLE_HEADERS });
}

export function updateInterviewRequest(interviewId: string, payload: Partial<InterviewPayload>) {
  return axiosInstance.patch<Interview>('/interviews', payload, {
    params: { id: `eq.${interviewId}` },
    headers: RETURN_SINGLE_HEADERS,
  });
}

export function deleteInterviewRequest(interviewId: string) {
  return axiosInstance.delete('/interviews', { params: { id: `eq.${interviewId}` } });
}
