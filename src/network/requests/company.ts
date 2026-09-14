import { axiosInstance } from '@/network/interceptor';
import type { Company, CompanyUpdatePayload, CreateCompanyPayload } from '@/types/auth.types';

import { SINGLE_OBJECT_HEADERS } from './profile';

/** `create_company` inserts the company and links the calling recruiter to it in one transaction. */
export function createCompanyRequest({ name, website, industry, size }: CreateCompanyPayload) {
  return axiosInstance.post<Company>('/rpc/create_company', {
    p_name: name,
    p_website: website || null,
    p_industry: industry || null,
    p_size: size || null,
  });
}

export function updateCompanyRequest(companyId: string, payload: CompanyUpdatePayload) {
  return axiosInstance.patch<Company>('/companies', payload, {
    params: { id: `eq.${companyId}` },
    headers: { ...SINGLE_OBJECT_HEADERS, Prefer: 'return=representation' },
  });
}
