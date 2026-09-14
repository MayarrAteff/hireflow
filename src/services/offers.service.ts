import {
  createOfferRequest,
  deleteOfferRequest,
  getCandidateOfferRequest,
  markOfferViewedRequest,
  respondToOfferRequest,
  updateOfferRequest,
} from '@/network/requests/offers';
import { createSignedUrlRequest, uploadFileRequest } from '@/network/requests/storage';
import type { Offer, OfferPayload } from '@/types/offer.types';

const LETTER_LINK_TTL_SECONDS = 60;
const LETTER_PREFIX_PATTERN = /^\d+-/;

export type SaveOfferInput = {
  /** The application's current offer, if any; decides between editing a draft and sending a revision. */
  current: Offer | undefined;
  companyId: string;
  payload: Omit<OfferPayload, 'letter_path'>;
  /** A newly picked letter; otherwise the current letter is kept unless `removeLetter` is set. */
  letter: File | null;
  removeLetter: boolean;
};

async function uploadLetter(companyId: string, applicationId: string, file: File) {
  const safeName = file.name.replace(/[^\w.-]+/g, '-');
  const path = `${companyId}/${applicationId}/${Date.now()}-${safeName}`;
  await uploadFileRequest({ bucket: 'offer-letters', path, file });
  return path;
}

/**
 * Saves a draft, sends an offer, or sends a revised one. A sent offer can't be edited (the candidate may already
 * have read it), so a revision withdraws it first and creates a new offer, keeping the old one as history.
 */
export async function saveOffer({ current, companyId, payload, letter, removeLetter }: SaveOfferInput) {
  const letterPath = letter
    ? await uploadLetter(companyId, payload.application_id, letter)
    : removeLetter
      ? null
      : (current?.letter_path ?? null);
  const fullPayload: OfferPayload = { ...payload, letter_path: letterPath };

  if (current?.status === 'draft') {
    const response = await updateOfferRequest(current.id, fullPayload);
    return response.data;
  }
  if (current?.status === 'sent') await withdrawOffer(current.id);
  const response = await createOfferRequest(fullPayload);
  return response.data;
}

export async function withdrawOffer(offerId: string) {
  await updateOfferRequest(offerId, { status: 'withdrawn' });
}

export async function deleteDraftOffer(offerId: string) {
  await deleteOfferRequest(offerId);
}

export async function getOfferLetterUrl(path: string) {
  const { data, error } = await createSignedUrlRequest('offer-letters', path, LETTER_LINK_TTL_SECONDS);
  if (error) throw error;
  return data.signedUrl;
}

export function getOfferLetterFileName(path: string) {
  return (path.split('/').pop() ?? path).replace(LETTER_PREFIX_PATTERN, '');
}

export async function getCandidateOffer(offerId: string) {
  const response = await getCandidateOfferRequest(offerId);
  return response.data;
}

export async function respondToOffer(offerId: string, accept: boolean, reason: string | null) {
  const response = await respondToOfferRequest(offerId, accept, reason);
  return response.data;
}

export async function markOfferViewed(offerId: string) {
  await markOfferViewedRequest(offerId);
}
