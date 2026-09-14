import { getCandidateApplicationsRequest } from '@/network/requests/applications';

export async function getCandidateApplications(candidateId: string) {
  const response = await getCandidateApplicationsRequest(candidateId);
  return response.data;
}
