import type { ReactNode } from 'react';

import type { Permission } from '@/enum/permissions';
import { usePermissions } from '@/utils/hooks/usePermissions';

import { Forbidden } from './StatusPage';

/** `any`: one of the listed permissions is enough. `all`: every one is required. */
export type PermissionMode = 'any' | 'all';

interface PermissionGuardProps {
  permissions: Permission[];
  mode?: PermissionMode;
  /** What to render when not allowed. Defaults to the Forbidden page; pass `null` to hide silently. */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Renders `children` only when the signed-in user holds the required permission(s).
 * For guarding a whole page use `withPermission` on the route component instead.
 */
export function PermissionGuard({
  permissions,
  mode = 'any',
  fallback = <Forbidden />,
  children,
}: PermissionGuardProps) {
  const { can } = usePermissions();
  const allowed = mode === 'all' ? permissions.every(can) : permissions.some(can);

  return <>{allowed ? children : fallback}</>;
}
