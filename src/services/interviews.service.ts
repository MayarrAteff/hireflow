import {
  createInterviewRequest,
  deleteInterviewRequest,
  getCompanyInterviewsRequest,
  updateInterviewRequest,
} from '@/network/requests/interviews';
import type { InterviewPayload } from '@/types/interview.types';
import { dayjs } from '@/utils/dayjs';

export type InterviewsView = 'upcoming' | 'past';

export async function getCompanyInterviews(view: InterviewsView) {
  // "Upcoming" starts at the beginning of today, so interviews earlier today stay visible.
  const startOfToday = dayjs().startOf('day').toISOString();
  const response =
    view === 'upcoming'
      ? await getCompanyInterviewsRequest({ from: startOfToday }, true)
      : await getCompanyInterviewsRequest({ before: startOfToday }, false);
  return response.data;
}

export async function saveInterview(interviewId: string | null, payload: InterviewPayload) {
  const response = interviewId
    ? await updateInterviewRequest(interviewId, payload)
    : await createInterviewRequest(payload);
  return response.data;
}

export async function cancelInterview(interviewId: string) {
  await deleteInterviewRequest(interviewId);
}
