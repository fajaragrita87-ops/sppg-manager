import { useAuthStore } from '@/store/authStore';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/permissions';
import type { Permission } from '@/lib/permissions';

export type { Permission };

/** Cek single permission untuk user yang sedang login */
export function usePermission(permission: Permission): boolean {
  const role = useAuthStore(s => s.user?.role ?? '');
  return hasPermission(role, permission);
}

/** Cek apakah user punya salah satu dari beberapa permission */
export function useAnyPermission(permissions: Permission[]): boolean {
  const role = useAuthStore(s => s.user?.role ?? '');
  return hasAnyPermission(role, permissions);
}

/** Cek apakah user punya SEMUA permission */
export function useAllPermissions(permissions: Permission[]): boolean {
  const role = useAuthStore(s => s.user?.role ?? '');
  return hasAllPermissions(role, permissions);
}

/** Kembalikan role string saat ini */
export function useRole(): string {
  return useAuthStore(s => s.user?.role ?? '');
}
