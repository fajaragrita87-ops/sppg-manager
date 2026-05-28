// ==============================
// AUDIT LOGGER — Jejak Audit Anti-Penipuan
// Semua tindakan sensitif dicatat. Tidak ada fungsi DELETE/UPDATE.
// Insert-only ke tabel audit_log di Supabase.
// ==============================

import { supabase } from '@/lib/supabase';

// ─── Tipe Aksi ────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'laporan_dikunci'
  | 'laporan_diedit'
  | 'laporan_dibuka_ulang'
  | 'harga_bahan_diubah'
  | 'jumlah_porsi_diubah'
  | 'insentif_dibayar'
  | 'insentif_diubah'
  | 'po_dibuat'
  | 'po_disetujui'
  | 'po_ditolak'
  | 'relawan_ditambah'
  | 'relawan_diaktifkan'
  | 'stok_dikoreksi'
  | 'kas_dikoreksi'
  | 'login_pengguna'
  | 'pengguna_logout'
  | 'peran_diubah'
  | 'sppg_diupdate'
  | 'va_diperbarui';

// ─── Tipe Record ──────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  sppg_id: string;
  user_id: string;
  user_nama?: string;
  user_jabatan?: string;
  action: AuditAction;
  table_name: string;
  record_id: string;
  before_data?: Record<string, any> | null;
  after_data?: Record<string, any> | null;
  keterangan?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface LogAuditParams {
  sppgId: string;
  userId: string;
  action: AuditAction;
  tableName: string;
  recordId: string;
  beforeData?: Record<string, any> | null;
  afterData?: Record<string, any> | null;
  keterangan?: string;
}

// ─── Helper: Ambil IP (client-side best-effort) ───────────────────────────────

async function getClientIP(): Promise<string> {
  try {
    // Gunakan layanan publik untuk mendapat IP client — fallback jika gagal
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(2000) });
    const data = await res.json();
    return data.ip ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

// ─── Label Aksi ───────────────────────────────────────────────────────────────

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  laporan_dikunci:       'Laporan Dikunci',
  laporan_diedit:        'Laporan Diedit',
  laporan_dibuka_ulang:  'Laporan Dibuka Ulang',
  harga_bahan_diubah:    'Harga Bahan Diubah',
  jumlah_porsi_diubah:   'Jumlah Porsi Diubah',
  insentif_dibayar:      'Insentif Dibayar',
  insentif_diubah:       'Insentif Diubah',
  po_dibuat:             'PO Dibuat',
  po_disetujui:          'PO Disetujui',
  po_ditolak:            'PO Ditolak',
  relawan_ditambah:      'Relawan Ditambah',
  relawan_diaktifkan:    'Relawan Diaktifkan',
  stok_dikoreksi:        'Stok Dikoreksi',
  kas_dikoreksi:         'Kas Dikoreksi',
  login_pengguna:        'Login Pengguna',
  pengguna_logout:       'Pengguna Logout',
  peran_diubah:          'Peran Diubah',
  sppg_diupdate:         'Profil SPPG Diperbarui',
  va_diperbarui:         'VA Diperbarui',
};

export const AUDIT_ACTION_COLORS: Record<AuditAction, string> = {
  laporan_dikunci:       'blue',
  laporan_diedit:        'yellow',
  laporan_dibuka_ulang:  'orange',
  harga_bahan_diubah:    'yellow',
  jumlah_porsi_diubah:   'yellow',
  insentif_dibayar:      'green',
  insentif_diubah:       'orange',
  po_dibuat:             'blue',
  po_disetujui:          'green',
  po_ditolak:            'red',
  relawan_ditambah:      'teal',
  relawan_diaktifkan:    'teal',
  stok_dikoreksi:        'orange',
  kas_dikoreksi:         'red',
  login_pengguna:        'slate',
  pengguna_logout:       'slate',
  peran_diubah:          'purple',
  sppg_diupdate:         'blue',
  va_diperbarui:         'purple',
};

// ─── FUNGSI UTAMA: logAudit ───────────────────────────────────────────────────
// INSERT ONLY — tidak ada update/delete

export async function logAudit(params: LogAuditParams): Promise<void> {
  const {
    sppgId, userId, action, tableName, recordId,
    beforeData = null, afterData = null, keterangan,
  } = params;

  // Ambil IP & user agent secara paralel
  const [ip_address] = await Promise.allSettled([getClientIP()]);
  const user_agent = typeof navigator !== 'undefined'
    ? navigator.userAgent.substring(0, 255)
    : 'server';

  const payload = {
    sppg_id:    sppgId,
    user_id:    userId,
    action,
    table_name: tableName,
    record_id:  recordId,
    before_data: beforeData,
    after_data:  afterData,
    keterangan:  keterangan ?? null,
    ip_address:  ip_address.status === 'fulfilled' ? ip_address.value : 'unknown',
    user_agent,
    // created_at diserahkan ke server (default now() di Supabase)
  };

  const { error } = await supabase.from('audit_log').insert(payload);

  if (error) {
    // Jangan crash app karena gagal audit — cukup log ke console
    console.error('[AUDIT] Gagal menyimpan log audit:', error.message, payload);
  }
}

// ─── FUNGSI BACA: getAuditLog ─────────────────────────────────────────────────

export interface AuditFilter {
  userId?: string;
  action?: AuditAction;
  tanggalMulai?: string; // YYYY-MM-DD
  tanggalSelesai?: string;
  search?: string;
  limit?: number;
}

export async function getAuditLog(
  sppgId: string,
  filter?: AuditFilter,
): Promise<AuditLog[]> {
  let query = supabase
    .from('audit_log')
    .select('*, users(nama, jabatan)')
    .eq('sppg_id', sppgId)
    .order('created_at', { ascending: false })
    .limit(filter?.limit ?? 500);

  if (filter?.userId)        query = query.eq('user_id', filter.userId);
  if (filter?.action)        query = query.eq('action', filter.action);
  if (filter?.tanggalMulai)  query = query.gte('created_at', filter.tanggalMulai);
  if (filter?.tanggalSelesai) {
    // Inklusif akhir hari
    const akhirHari = filter.tanggalSelesai + 'T23:59:59';
    query = query.lte('created_at', akhirHari);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[AUDIT] Gagal mengambil log:', error.message);
    return [];
  }

  // Flatten join users
  return (data ?? []).map((row: any) => ({
    ...row,
    user_nama:    row.users?.nama    ?? null,
    user_jabatan: row.users?.jabatan ?? null,
  }));
}

// ─── HELPER: Export CSV ───────────────────────────────────────────────────────

export function exportAuditCSV(logs: AuditLog[], namaFile = 'audit_log.csv'): void {
  const header = ['Waktu', 'Pengguna', 'Jabatan', 'Aksi', 'Tabel', 'Record ID', 'Keterangan', 'IP'];
  const rows = logs.map(l => [
    new Date(l.created_at).toLocaleString('id-ID'),
    l.user_nama ?? l.user_id,
    l.user_jabatan ?? '',
    AUDIT_ACTION_LABELS[l.action] ?? l.action,
    l.table_name,
    l.record_id,
    l.keterangan ?? '',
    l.ip_address ?? '',
  ]);

  const csv = [header, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = namaFile;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── SQL SCHEMA (untuk referensi) ─────────────────────────────────────────────
/*
CREATE TABLE audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sppg_id     uuid NOT NULL REFERENCES sppg(id),
  user_id     uuid NOT NULL REFERENCES users(id),
  action      text NOT NULL,
  table_name  text NOT NULL,
  record_id   text NOT NULL,
  before_data jsonb,
  after_data  jsonb,
  keterangan  text,
  ip_address  text,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Row Level Security: HANYA bisa INSERT, tidak ada UPDATE/DELETE
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_insert_only" ON audit_log FOR INSERT WITH CHECK (true);
CREATE POLICY "audit_select_sppg" ON audit_log FOR SELECT USING (sppg_id = auth.uid());
-- TIDAK ADA policy untuk UPDATE dan DELETE
*/
