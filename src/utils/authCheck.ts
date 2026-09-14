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

/**
 * Only allow same-origin relative redirects (blocks `//evil.com` and absolute URLs) into a portal the role can open.
 * A `redirect` left over from another account (e.g. `/recruiter/...` after signing in as a candidate) is dropped.
 */
export function safeRedirectPath(path: unknown, role: UserRole | null): string | null {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return null;
  const portal = path.split(/[/?#]/)[1];
  const isOtherPortal = portal in roleHomePath && portal !== role;
  return isOtherPortal ? null : path;
}

/** `beforeLoad` guard for a portal: the signed-in user must have one of the given roles. */
export function requireRole(...roles: UserRole[]) {
  return ({ context }: { context: RouterContext }) => {
    if (!context.auth.role || !roles.includes(context.auth.role)) {
      throw redirect({ to: '/forbidden' });
    }
  };
}
