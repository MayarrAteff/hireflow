import { useQuery } from '@tanstack/react-query';

import { getCompany } from '@/services/company.service';

export const companyQueryKey = (companyId: string) => ['companies', companyId] as const;

export function useCompany(companyId: string) {
  return useQuery({
    queryKey: companyQueryKey(companyId),
    queryFn: () => getCompany(companyId),
    retry: false,
  });
}
