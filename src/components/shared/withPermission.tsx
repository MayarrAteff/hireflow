import type { ComponentType } from 'react';

import type { Permission } from '@/enum/permissions';

import { PermissionGuard, type PermissionMode } from './PermissionGuard';

/**
 * Route-level permission guard:
 * ```ts
 * export const Route = createFileRoute('/_authenticated/admin/dashboard')({
 *   component: withPermission(AdminDashboard, Permission.ViewPlatformAnalytics),
 * });
 * ```
 */
export function withPermission<P extends object>(
  Component: ComponentType<P>,
  permissions: Permission | Permission[],
  mode: PermissionMode = 'any',
) {
  const required = Array.isArray(permissions) ? permissions : [permissions];

  return function PermissionGuardedRoute(props: P) {
    return (
      <PermissionGuard permissions={required} mode={mode}>
        <Component {...props} />
      </PermissionGuard>
    );
  };
}
