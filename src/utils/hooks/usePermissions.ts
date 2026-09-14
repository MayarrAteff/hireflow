import { rolePermissions } from '@/constants/permissions';
import type { Permission } from '@/enum/permissions';
import { useAuth } from '@/utils/hooks/useAuth';

export function usePermissions() {
  const { role } = useAuth();
  const permissions: Permission[] = role ? rolePermissions[role] : [];

  return {
    permissions,
    can: (permission: Permission) => permissions.includes(permission),
  };
}
