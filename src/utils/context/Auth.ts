import type { Session, User } from '@supabase/supabase-js';
import { createContext } from 'react';

import type { Profile, UserRole } from '@/types/auth.types';

export interface IAuthContext {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  /** True once the initial session (and profile, if signed in) has been resolved. */
  isReady: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<unknown>;
}

export const AuthContext = createContext<IAuthContext | null>(null);
