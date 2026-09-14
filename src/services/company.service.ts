import { createCompanyRequest, updateCompanyRequest } from '@/network/requests/company';
import { getPublicUrlRequest, removeFileRequest, uploadFileRequest } from '@/network/requests/storage';
import type { CompanyUpdatePayload, CreateCompanyPayload } from '@/types/auth.types';

const logoPath = (companyId: string) => `${companyId}/logo.jpg`;

export async function createCompany(payload: CreateCompanyPayload) {
  const response = await createCompanyRequest(payload);
  return response.data;
}

export async function updateCompany(companyId: string, payload: CompanyUpdatePayload) {
  const response = await updateCompanyRequest(companyId, payload);
  return response.data;
}

/** Stores the cropped logo under a fixed name and busts caches with a version query. */
export async function uploadCompanyLogo(companyId: string, image: Blob) {
  const path = logoPath(companyId);
  await uploadFileRequest({ bucket: 'company-logos', path, file: image });
  const { publicUrl } = getPublicUrlRequest('company-logos', path).data;
  return updateCompany(companyId, { logo_url: `${publicUrl}?v=${Date.now()}` });
}

export async function removeCompanyLogo(companyId: string) {
  const { error } = await removeFileRequest('company-logos', logoPath(companyId));
  if (error) throw error;
  return updateCompany(companyId, { logo_url: null });
}
