import type { AccentColor } from '@/styles/themes/accents';
import type { Offer, OfferStatus, OfferSummary } from '@/types/offer.types';
import { dayjs } from '@/utils/dayjs';

export const MAX_OFFER_LETTER_BYTES = 5 * 1024 * 1024;
export const OFFER_LETTER_TYPES = ['application/pdf'];
export const OFFER_MESSAGE_MAX = 2000;
export const OFFER_DECLINE_REASON_MAX = 1000;

/** What the UI shows: the stored status, plus `expired` for a sent offer past its deadline. */
export type OfferDisplayStatus = OfferStatus | 'expired';

export const OFFER_STATUS_COLOR: Record<OfferDisplayStatus, AccentColor | null> = {
  draft: null,
  sent: 'sky',
  accepted: 'emerald',
  declined: 'rose',
  withdrawn: null,
  expired: 'amber',
};

/** The newest offer on an application; older ones are withdrawn or answered history. */
export function getCurrentOffer<T extends Pick<OfferSummary, 'created_at'>>(offers: T[] | undefined) {
  return [...(offers ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
}

/** The deadline is inclusive: an offer expiring today can still be answered today. */
export function isOfferExpired(offer: Pick<Offer, 'status' | 'expires_at'>) {
  return offer.status === 'sent' && dayjs(offer.expires_at).endOf('day').isBefore(dayjs());
}

export function getOfferDisplayStatus(offer: Pick<Offer, 'status' | 'expires_at'>): OfferDisplayStatus {
  return isOfferExpired(offer) ? 'expired' : offer.status;
}

/** A draft or a sent offer still waiting for an answer; the recruiter edits or withdraws it rather than starting over. */
export function isOfferLive(offer: Pick<Offer, 'status'> | undefined) {
  return offer?.status === 'draft' || offer?.status === 'sent';
}
