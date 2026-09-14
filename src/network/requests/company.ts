import { axiosInstance } from '@/network/interceptor';
import type { Company, CreateCompanyPayload } from '@/types/auth.types';

/** `create_company` inserts the company and links the calling recruiter to it in one transaction. */
export function createCompanyRequest({ name, website, industry }: CreateCompanyPayload) {
  return axiosInstance.post<Company>('/rpc/create_company', {
    p_name: name,
    p_website: website || null,
    p_industry: industry || null,
  });
}
