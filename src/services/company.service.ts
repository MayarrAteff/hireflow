import { createCompanyRequest } from '@/network/requests/company';
import type { CreateCompanyPayload } from '@/types/auth.types';

export async function createCompany(payload: CreateCompanyPayload) {
  const response = await createCompanyRequest(payload);
  return response.data;
}
