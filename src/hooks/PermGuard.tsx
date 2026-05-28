import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/permissions';
import type { Permission } from '@/lib/permissions';

// ── Re-export hooks agar file lain cukup import dari satu tempat ─────────────
export { usePermission, useAnyPermission, useAllPermissions, useRole } from '@/hooks/usePermission';
export type { Permission };

// ── KOMPONEN: PermGuard ───────────────────────────────────────────────────────

interface PermGuardProps {
  permission?: Permission;
  anyOf?: Permission[];
  allOf?: Permission[];
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Guard di level tombol/aksi.
 * Sembunyikan children jika user tidak punya permission.
 *
 * @example
 * <PermGuard permission="pengadaan.edit_po_header">
 *   <button>Edit PO</button>
 * </PermGuard>
 */
export default function PermGuard({ permission, anyOf, allOf, fallback = null, children }: PermGuardProps) {
  const role = useAuthStore(s => s.user?.role ?? '');

  let allowed = true;
  if (permission) allowed = hasPermission(role, permission);
  else if (anyOf)  allowed = hasAnyPermission(role, anyOf);
  else if (allOf)  allowed = hasAllPermissions(role, allOf);

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}

// ── KOMPONEN: ReadOnlyBadge ───────────────────────────────────────────────────

/** Badge kecil "Hanya Lihat" */
export function ReadOnlyBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider
      bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
      <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
        <path d="M8 10a2 2 0 100-4 2 2 0 000 4z" fill="currentColor"/>
        <path d="M1.5 8S3.5 3 8 3s6.5 5 6.5 5-2 5-6.5 5S1.5 8 1.5 8z" stroke="currentColor" strokeWidth="1.2"/>
        <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
      Hanya Lihat
    </span>
  );
}

// ── KOMPONEN: ReadOnlyBanner ──────────────────────────────────────────────────

/** Banner peringatan read-only di atas halaman */
export function ReadOnlyBanner({ message }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm mb-4">
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 flex-shrink-0">
        <path d="M10 3C6.13 3 3 6.13 3 10s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zm.75-4.5a.75.75 0 01-1.5 0V6.5a.75.75 0 011.5 0V9z" fill="currentColor"/>
      </svg>
      <span className="font-medium">{message ?? 'Role Anda hanya memiliki akses baca (read-only) di halaman ini.'}</span>
    </div>
  );
}
