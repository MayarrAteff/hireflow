import { axiosInstance } from '@/network/interceptor';
import type { CandidateApplication } from '@/types/application.types';

export function getCandidateApplicationsRequest(candidateId: string) {
  return axiosInstance.get<CandidateApplication[]>('/applications', {
    params: {
      candidate_id: `eq.${candidateId}`,
      select: 'id,stage,created_at,updated_at,job:jobs(title,company:companies(name))',
      order: 'updated_at.desc',
    },
  });
}
