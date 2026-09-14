import type { Session } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { supabase } from '@/network/supabase';
import { getProfile } from '@/services/profile.service';
import type { ChildProp } from '@/types/general.types';

import { AuthContext, type IAuthContext } from './Auth';

export const profileQueryKey = (userId?: string) => ['profile', userId] as const;

export function AuthProvider({ children }: Readonly<ChildProp>) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionChecked(true);
    });

    // Keep this callback synchronous: awaiting Supabase calls inside it can deadlock the auth lock.
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;

  const profileQuery = useQuery({
    queryKey: profileQueryKey(userId),
    queryFn: () => getProfile(userId as string),
    enabled: Boolean(userId),
    staleTime: Infinity,
  });

  const profile = userId ? (profileQuery.data ?? null) : null;

  // Only gate the very first render; later sign-ins shouldn't unmount the router.
  useEffect(() => {
    if (!isReady && sessionChecked && (!userId || !profileQuery.isPending)) {
      setIsReady(true);
    }
  }, [isReady, sessionChecked, userId, profileQuery.isPending]);

  const value = useMemo<IAuthContext>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? null,
      isReady,
      isAuthenticated: Boolean(session && profile),
      refreshProfile: profileQuery.refetch,
    }),
    [session, profile, isReady, profileQuery.refetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
