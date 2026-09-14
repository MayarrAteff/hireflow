import { redirect } from '@tanstack/react-router';

import { roleHomePath } from '@/constants/app';
import type { UserRole } from '@/types/auth.types';
import type { RouterContext } from '@/types/router.types';
import type { IAuthContext } from '@/utils/context/Auth';

export function isAuthenticated(auth: IAuthContext) {
  return auth.isAuthenticated;
}

export function homePathFor(auth: IAuthContext) {
  return auth.role ? roleHomePath[auth.role] : '/login';
}

/** Only allow same-origin relative redirects (blocks `//evil.com` and absolute URLs). */
export function safeRedirectPath(path: unknown): string | null {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') ? path : null;
}

/** `beforeLoad` guard for a portal: the signed-in user must have one of the given roles. */
export function requireRole(...roles: UserRole[]) {
  return ({ context }: { context: RouterContext }) => {
    if (!context.auth.role || !roles.includes(context.auth.role)) {
      throw redirect({ to: '/forbidden' });
    }
  };
}
