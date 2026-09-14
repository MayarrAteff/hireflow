import type { ApplicationStage } from './application.types';

export type OfferStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'withdrawn';

export type Offer = {
  id: string;
  application_id: string;
  salary: number;
  currency: string;
  start_date: string;
  /** Last day the candidate can respond (a date, inclusive). */
  expires_at: string;
  message: string | null;
  letter_path: string | null;
  status: OfferStatus;
  decline_reason: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  responded_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type OfferPayload = Pick<
  Offer,
  'application_id' | 'salary' | 'currency' | 'start_date' | 'expires_at' | 'message' | 'letter_path' | 'status'
>;

/** Just enough of an offer to flag it in the candidate's application list. */
export type OfferSummary = Pick<Offer, 'id' | 'status' | 'expires_at' | 'created_at'>;

/** An offer as the candidate opens it, with the job it is for. */
export type CandidateOffer = Offer & {
  application: {
    id: string;
    job_id: string;
    stage: ApplicationStage;
    /** Null when the job is no longer visible to the candidate (e.g. closed). */
    job: { title: string; company: { name: string } | null } | null;
  };
};
