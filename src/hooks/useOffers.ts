import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { supabase } from '@/network/supabase';
import { getCandidateOffer } from '@/services/offers.service';

import { applicationsQueryKey } from './useApplications';

export const offerQueryKey = (offerId: string) => ['offers', offerId] as const;

export function useCandidateOffer(offerId: string) {
  return useQuery({
    queryKey: offerQueryKey(offerId),
    queryFn: () => getCandidateOffer(offerId),
    retry: false,
  });
}

/** Keeps an open offer in sync, e.g. when the recruiter withdraws it while the candidate is reading. */
export function useOfferRealtime(offerId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`offers:${offerId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offers', filter: `id=eq.${offerId}` }, () => {
        queryClient.invalidateQueries({ queryKey: offerQueryKey(offerId) });
        queryClient.invalidateQueries({ queryKey: applicationsQueryKey });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [offerId, queryClient]);
}
