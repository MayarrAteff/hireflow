import { axiosInstance } from '@/network/interceptor';
import type { CandidateOffer, Offer, OfferPayload } from '@/types/offer.types';

import { SINGLE_OBJECT_HEADERS } from './profile';

const RETURN_SINGLE_HEADERS = { ...SINGLE_OBJECT_HEADERS, Prefer: 'return=representation' };

const CANDIDATE_OFFER_SELECT =
  '*,application:applications(id,job_id,stage,job:jobs(title,company:companies(name,logo_url)))';

export function createOfferRequest(payload: OfferPayload) {
  return axiosInstance.post<Offer>('/offers', payload, { headers: RETURN_SINGLE_HEADERS });
}

/** Drafts can change freely; a sent offer only accepts `status: 'withdrawn'` (enforced in the database). */
export function updateOfferRequest(offerId: string, payload: Partial<OfferPayload>) {
  return axiosInstance.patch<Offer>('/offers', payload, {
    params: { id: `eq.${offerId}` },
    headers: RETURN_SINGLE_HEADERS,
  });
}

export function deleteOfferRequest(offerId: string) {
  return axiosInstance.delete('/offers', { params: { id: `eq.${offerId}` } });
}

/** Row-level security returns nothing for drafts or other people's offers, which reads as "not found". */
export function getCandidateOfferRequest(offerId: string) {
  return axiosInstance.get<CandidateOffer>('/offers', {
    params: { id: `eq.${offerId}`, select: CANDIDATE_OFFER_SELECT },
    headers: SINGLE_OBJECT_HEADERS,
  });
}

/** Accepting also moves the application to Hired; both happen in one transaction. */
export function respondToOfferRequest(offerId: string, accept: boolean, reason: string | null) {
  return axiosInstance.post<Offer>(
    '/rpc/respond_to_offer',
    { p_offer_id: offerId, p_accept: accept, p_reason: reason },
    { headers: SINGLE_OBJECT_HEADERS },
  );
}

export function markOfferViewedRequest(offerId: string) {
  return axiosInstance.post('/rpc/mark_offer_viewed', { p_offer_id: offerId });
}
