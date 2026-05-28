import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  getAuditLog, exportAuditCSV, AUDIT_ACTION_LABELS, AUDIT_ACTION_COLORS,
  type AuditLog, type AuditAction,
} from '@/lib/audit-logger';
import { Search, Download, RefreshCw, ChevronDown, ChevronUp, Shield } from 'lucide-react';

// ─── Mock data fallback (Supabase belum dikonfigurasi) ────────────────────────

const MOCK_LOGS: AuditLog[] = [
  {
    id: 'a1', sppg_id: 'sppg-1', user_id: 'u1', user_nama: 'Budi Santoso',
    user_jabatan: 'Owner / Kepala Satuan',
    action: 'laporan_dikunci', table_name: 'laporan_harian', record_id: 'lap-001',
    before_data: null, after_data: { status: 'dikunci', total_porsi: 2986 },
    keterangan: 'Laporan dikunci setelah verifikasi', ip_address: '192.168.1.10',
    created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: 'a2', sppg_id: 'sppg-1', user_id: 'u1', user_nama: 'Budi Santoso',
    user_jabatan: 'Owner / Kepala Satuan',
    action: 'po_disetujui', table_name: 'purchase_order', record_id: 'PO/2026/05/001',
    before_data: { status: 'Menunggu Approval' }, after_data: { status: 'Disetujui' },
    keterangan: 'PO disetujui oleh Ka.SPPG', ip_address: '192.168.1.10',
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'a3', sppg_id: 'sppg-1', user_id: 'u2', user_nama: 'Siti Aminah',
    user_jabatan: 'Pengawas Keuangan',
    action: 'stok_dikoreksi', table_name: 'stok_bahan', record_id: 'b1',
    before_data: { stok_akhir: 250, satuan: 'kg', nama: 'Beras Premium' },
    after_data: { stok_akhir: 230, satuan: 'kg', nama: 'Beras Premium' },
    keterangan: 'Koreksi setelah stok opname fisik', ip_address: '192.168.1.22',
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'a4', sppg_id: 'sppg-1', user_id: 'u1', user_nama: 'Budi Santoso',
    user_jabatan: 'Owner / Kepala Satuan',
    action: 'insentif_dibayar', table_name: 'insentif_relawan', record_id: 'ins-batch-001',
    before_data: { sudah_dibayar: false }, after_data: { sudah_dibayar: true, metode: 'tunai', jumlah: 350000 },
    keterangan: 'Pembayaran insentif Ahmad Zulfikar periode 1-15 Mei', ip_address: '192.168.1.10',
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: 'a5', sppg_id: 'sppg-1', user_id: 'u2', user_nama: 'Siti Aminah',
    user_jabatan: 'Pengawas Keuangan',
    action: 'harga_bahan_diubah', table_name: 'survei_harga', record_id: 'harga-beras-001',
    before_data: { harga: 35000, nama_bahan: 'Beras Premium' },
    after_data: { harga: 40000, nama_bahan: 'Beras Premium' },
    keterangan: 'Update harga pasar berdasarkan survei mingguan', ip_address: '192.168.1.22',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 'a6', sppg_id: 'sppg-1', user_id: 'u3', user_nama: 'Ahmad Zulfikar',
    user_jabatan: 'Kasir / Wakil Kepala',
    action: 'login_pengguna', table_name: 'users', record_id: 'u3',
    before_data: null, after_data: null,
    keterangan: null, ip_address: '10.0.0.5',
    created_at: new Date(Date.now() - 26 * 3600000).toISOString(),
  },
  {
    id: 'a7', sppg_id: 'sppg-1', user_id: 'u1', user_nama: 'Budi Santoso',
    user_jabatan: 'Owner / Kepala Satuan',
    action: 'po_ditolak', table_name: 'purchase_order', record_id: 'PO/2026/05/003',
    before_data: { status: 'Menunggu Approval', total: 2500000 },
    after_data: { status: 'Dibatalkan', alasan_tolak: 'Supplier tidak terverifikasi BGN' },
    keterangan: 'PO ditolak: Supplier tidak terverifikasi BGN', ip_address: '192.168.1.10',
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
];

// ─── Helper: badge warna per aksi ─────────────────────────────────────────────

function ActionBadge({ action }: { action: AuditAction }) {
  const label = AUDIT_ACTION_LABELS[action] ?? action;
  const color = AUDIT_ACTION_COLORS[action] ?? 'slate';

  const colorMap: Record<string, string> = {
    blue:   'bg-blue-100 text-blue-700 border-blue-200',
    green:  'bg-emerald-100 text-emerald-700 border-emerald-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    red:    'bg-red-100 text-red-700 border-red-200',
    teal:   'bg-teal-100 text-teal-700 border-teal-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    slate:  'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorMap[color] ?? colorMap.slate}`}>
      {label}
    </span>
  );
}

// ─── Helper: format diff JSON ─────────────────────────────────────────────────

function DiffView({ before, after }: { before: any; after: any }) {
  const allKeys = Array.from(new Set([
    ...Object.keys(before ?? {}),
    ...Object.keys(after ?? {}),
  ]));

  const formatVal = (v: any) => {
    if (v === null || v === undefined) return <span className="text-slate-400">null</span>;
    if (typeof v === 'number') return <span className="font-mono font-bold">{v.toLocaleString('id-ID')}</span>;
    if (typeof v === 'boolean') return <span className="font-mono">{v ? 'true' : 'false'}</span>;
    return <span className="font-mono">{String(v)}</span>;
  };

  const fmtRupiah = (v: any) => {
    if (typeof v === 'number') return `Rp ${v.toLocaleString('id-ID')}`;
    return null;
  };

  return (
    <div className="bg-slate-900 rounded-xl p-4 text-xs font-mono space-y-2">
      {allKeys.map(key => {
        const b = before?.[key];
        const a = after?.[key];
        const changed = JSON.stringify(b) !== JSON.stringify(a);
        const isNumDiff = typeof b === 'number' && typeof a === 'number';

        return (
          <div key={key} className="grid grid-cols-[120px_1fr_1fr] gap-3 items-start">
            <span className="text-slate-400 truncate" title={key}>{key}</span>
            <div className={`${changed ? 'text-rose-400' : 'text-slate-300'}`}>
              {b !== undefined ? (
                <span className="bg-rose-900/30 px-1.5 py-0.5 rounded">
                  {formatVal(b)}
                </span>
              ) : <span className="text-slate-600">—</span>}
            </div>
            <div className={`${changed ? 'text-emerald-400' : 'text-slate-300'}`}>
              {a !== undefined ? (
                <div>
                  <span className="bg-emerald-900/30 px-1.5 py-0.5 rounded">
                    {formatVal(a)}
                  </span>
                  {changed && isNumDiff && (
                    <span className={`ml-2 text-[10px] font-bold ${a > b ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {a > b ? '+' : ''}{fmtRupiah(a - b) ?? (a - b).toLocaleString('id-ID')}
                    </span>
                  )}
                </div>
              ) : <span className="text-slate-600">—</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────

export default function AuditTrailPage() {
  const { user, sppg } = useAuthStore();

  // Hanya owner & kasppg
  if (user?.role !== 'owner' && user?.role !== 'kasppg' && user?.role !== 'superadmin') {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-slate-800">Akses Ditolak</h2>
        <p className="text-slate-500 mt-2">Halaman ini hanya bisa diakses oleh Owner dan Ka.SPPG.</p>
      </div>
    );
  }

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState<AuditAction | ''>('');
  const [filterTglMulai, setFilterTglMulai] = useState('');
  const [filterTglSelesai, setFilterTglSelesai] = useState('');

  const muatLog = useCallback(async () => {
    setLoading(true);
    if (!sppg?.id) {
      // Fallback mock
      setLogs(MOCK_LOGS);
      setLoading(false);
      return;
    }
    const data = await getAuditLog(sppg.id, {
      action: filterAction || undefined,
      tanggalMulai: filterTglMulai || undefined,
      tanggalSelesai: filterTglSelesai || undefined,
    });
    setLogs(data.length > 0 ? data : MOCK_LOGS);
    setLoading(false);
  }, [sppg?.id, filterAction, filterTglMulai, filterTglSelesai]);

  useEffect(() => { muatLog(); }, [muatLog]);

  // Filter search di client
  const filteredLogs = logs.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (l.user_nama ?? '').toLowerCase().includes(q) ||
      (l.keterangan ?? '').toLowerCase().includes(q) ||
      (l.record_id ?? '').toLowerCase().includes(q)
    );
  });

  const bulanIni = new Date().getMonth();
  const tahunIni = new Date().getFullYear();
  const totalBulanIni = logs.filter(l => {
    const d = new Date(l.created_at);
    return d.getMonth() === bulanIni && d.getFullYear() === tahunIni;
  }).length;

  const handleExportCSV = () => {
    const tgl = new Date().toISOString().split('T')[0];
    exportAuditCSV(filteredLogs, `AuditTrail_${sppg?.nama?.replace(/\s+/g, '_') ?? 'SPPG'}_${tgl}.csv`);
  };

  const fmtWaktu = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const avatarInitial = (nama: string) => (nama?.[0] ?? '?').toUpperCase();

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={20} className="text-blue-600" />
            <h1 className="font-display text-xl font-semibold text-slate-900">Audit Trail — Riwayat Perubahan Data</h1>
          </div>
          <p className="text-sm text-slate-500">
            Semua perubahan data sensitif dicatat di sini.{' '}
            <span className="font-bold text-rose-600">Tidak bisa dihapus atau diubah.</span>
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="btn-secondary text-sm flex items-center gap-2 shrink-0"
        >
          <Download size={15} /> Ekspor CSV
        </button>
      </div>

      {/* ── Info bar ── */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 flex items-center justify-between mb-5 text-sm">
        <span className="text-blue-700">
          Total <strong>{totalBulanIni} log</strong> bulan ini ·
          Tidak ada data yang bisa dihapus dari halaman ini
        </span>
        <button onClick={muatLog} disabled={loading} className="text-blue-600 hover:text-blue-800">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="card p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau keterangan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input text-xs pl-9 w-full py-2"
          />
        </div>

        {/* Filter aksi */}
        <select
          value={filterAction}
          onChange={e => setFilterAction(e.target.value as AuditAction | '')}
          className="input text-xs py-2"
        >
          <option value="">Semua Jenis Aksi</option>
          {(Object.entries(AUDIT_ACTION_LABELS) as [AuditAction, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        {/* Tanggal mulai */}
        <input
          type="date"
          value={filterTglMulai}
          onChange={e => setFilterTglMulai(e.target.value)}
          className="input text-xs py-2"
          placeholder="Dari tanggal"
        />

        {/* Tanggal selesai */}
        <input
          type="date"
          value={filterTglSelesai}
          onChange={e => setFilterTglSelesai(e.target.value)}
          className="input text-xs py-2"
          placeholder="Sampai tanggal"
        />
      </div>

      {/* ── Tabel Log ── */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Waktu</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Pengguna</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Aksi</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Keterangan</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">IP</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Data</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
                    Memuat log audit...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    Tidak ada log yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const isExpanded = expandedId === log.id;
                  const hasData = log.before_data || log.after_data;

                  return (
                    <>
                      <tr
                        key={log.id}
                        className={`border-b border-slate-100 hover:bg-slate-50/60 transition-colors ${isExpanded ? 'bg-slate-50' : ''}`}
                      >
                        {/* Waktu */}
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 font-mono">
                          {fmtWaktu(log.created_at)}
                        </td>

                        {/* Pengguna */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black shrink-0">
                              {avatarInitial(log.user_nama ?? '?')}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 text-xs truncate">{log.user_nama ?? log.user_id}</p>
                              <p className="text-[10px] text-slate-400 truncate">{log.user_jabatan}</p>
                            </div>
                          </div>
                        </td>

                        {/* Aksi */}
                        <td className="px-4 py-3">
                          <ActionBadge action={log.action} />
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{log.table_name}</p>
                        </td>

                        {/* Keterangan */}
                        <td className="px-4 py-3 text-xs text-slate-600 max-w-[200px] truncate" title={log.keterangan ?? ''}>
                          {log.keterangan ?? <span className="text-slate-300 italic">—</span>}
                        </td>

                        {/* IP */}
                        <td className="px-4 py-3 text-[10px] font-mono text-slate-400 whitespace-nowrap">
                          {log.ip_address ?? '—'}
                        </td>

                        {/* Tombol detail */}
                        <td className="px-4 py-3 text-center">
                          {hasData ? (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : log.id)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-lg transition-colors"
                            >
                              Lihat Detail
                              {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-300">—</span>
                          )}
                        </td>
                      </tr>

                      {/* Row ekspansi detail data */}
                      {isExpanded && hasData && (
                        <tr key={`${log.id}-detail`} className="bg-slate-900/5 border-b border-slate-200">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="max-w-3xl">
                              <div className="flex items-center gap-4 mb-2 text-xs">
                                <span className="flex items-center gap-1 text-rose-500 font-bold">
                                  <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" /> SEBELUM
                                </span>
                                <span className="flex items-center gap-1 text-emerald-500 font-bold">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> SESUDAH
                                </span>
                                <span className="text-slate-400 ml-auto text-[10px]">Record: {log.record_id}</span>
                              </div>
                              <DiffView before={log.before_data} after={log.after_data} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer total */}
        {filteredLogs.length > 0 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Menampilkan <strong>{filteredLogs.length}</strong> dari <strong>{logs.length}</strong> log</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Shield size={10} /> Insert-only · Tidak bisa dihapus
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
