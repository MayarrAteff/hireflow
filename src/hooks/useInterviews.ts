import { useQuery } from '@tanstack/react-query';

import { getCompanyInterviews, type InterviewsView } from '@/services/interviews.service';

export const interviewsQueryKey = ['interviews'] as const;

export function useCompanyInterviews(view: InterviewsView) {
  return useQuery({
    queryKey: [...interviewsQueryKey, 'company', view],
    queryFn: () => getCompanyInterviews(view),
  });
}
