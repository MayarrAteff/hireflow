import { getNextInterview } from '@/constants/interviews';
import { getCurrentOffer, isOfferLive } from '@/constants/offers';
import type { RecruiterApplication } from '@/types/application.types';

/** A stage whose next step hasn't been set up yet: in Interview with nothing booked, or in Offer with no live offer. */
export type StageGap = 'interview' | 'offer';

export function getStageGap(
  application: Pick<RecruiterApplication, 'stage' | 'interviews' | 'offers'>,
): StageGap | null {
  if (application.stage === 'interview' && !getNextInterview(application.interviews)) return 'interview';
  if (application.stage === 'offer' && !isOfferLive(getCurrentOffer(application.offers))) return 'offer';
  return null;
}
