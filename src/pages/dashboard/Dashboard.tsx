import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, RefreshCw, AlertTriangle, Lock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuthStore } from '@/store/authStore';
import { useKeuanganStore } from '@/store/keuanganStore';
import { formatRupiah, formatTanggal, getGreeting, singkatNama, hitungHariLagi } from '@/lib/utils';
import AlertBanner from '@/components/ui/AlertBanner';
import { useLiteMode } from '@/hooks/useLiteMode';
import { checkAndSendPendingNotifications } from '@/lib/notification-scheduler';
import OnboardingChecklist from '@/components/elearning/OnboardingChecklist';
import { useInventoryStore } from '@/store/inventoryStore';

// TODO: connect to Supabase
const D_PORSI = { done: 2847, target: 3000 };
// D_SALDO & D_LAP dihapus — kini dari keuanganStore (real data)
const D_ALERTS: Array<{ type: 'danger' | 'warning'; judul: string; pesan: string }> = [
  { type: 'danger',  judul: 'Stok beras hampir habis', pesan: 'Tersisa untuk 2 hari produksi — segera beli' },
  { type: 'warning', judul: 'Survei harga belum dilakukan minggu ini', pesan: 'Batas hari Jumat' },
];
const D_CHART = [
  { h: 'Sen', b: 3.2e6, o: 0.8e6, i: 1.4e6 }, { h: 'Sel', b: 2.9e6, o: 0.75e6, i: 1.4e6 },
  { h: 'Rab', b: 3.5e6, o: 0.9e6, i: 1.4e6 }, { h: 'Kam', b: 3.1e6, o: 0.85e6, i: 1.4e6 },
  { h: 'Jum', b: 2.8e6, o: 0.7e6, i: 1.4e6 }, { h: 'Sab', b: 3.4e6, o: 0.95e6, i: 1.4e6 },
  { h: 'Min', b: 0, o: 0, i: 0 },
];
const D_ACT = [
  { jam: '02:15', teks: 'Produksi batch 1 dimulai', icon: '🍳' },
  { jam: '07:30', teks: 'Distribusi ke 8 sekolah berangkat', icon: '🚚' },
  { jam: '09:45', teks: 'QC organoleptik semua OK', icon: '✅' },
];

const fmtJ = (v: number) => v >= 1e6 ? `${(v/1e6).toFixed(1).replace('.0','')}jt` : v >= 1e3 ? `${(v/1e3).toFixed(0)}rb` : `${v}`;

function CTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const names: Record<string,string> = { b: 'Bahan Baku', o: 'Operasional', i: 'Insentif' };
  return (
    <div className="card px-3 py-2.5 shadow-lg text-xs space-y-1" style={{ border: '0.5px solid #e2e8f0' }}>
      <p className="font-medium mb-1" style={{ color: '#0f172a' }}>{label}</p>
      {payload.map((e: any) => (
        <div key={e.dataKey} className="flex items-center gap-2 justify-between">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: e.fill }} /><span style={{ color: '#475569' }}>{names[e.dataKey]}</span></span>
          <span className="font-medium" style={{ color: '#0f172a' }}>{formatRupiah(e.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Tabel Lite pengganti chart ───────────────────────────────────────────────
function LiteChartTable() {
  return (
    <div>
      <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
        Pengeluaran 7 Hari Terakhir
      </p>
      <table className="w-full text-xs border border-slate-200 rounded-xl overflow-hidden">
        <thead className="bg-slate-100">
          <tr>
            <th className="text-left px-3 py-2 text-slate-500 font-semibold">Hari</th>
            <th className="text-right px-3 py-2 text-slate-500 font-semibold">Bahan Baku</th>
            <th className="text-right px-3 py-2 text-slate-500 font-semibold">Ops</th>
            <th className="text-right px-3 py-2 text-slate-500 font-semibold">Insentif</th>
            <th className="text-right px-3 py-2 text-slate-500 font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {D_CHART.map((row, i) => {
            const total = row.b + row.o + row.i;
            return (
              <tr key={i} className="border-t border-slate-100 even:bg-slate-50">
                <td className="px-3 py-2 font-medium text-slate-700">{row.h}</td>
                <td className="px-3 py-2 text-right text-slate-600">{fmtJ(row.b)}</td>
                <td className="px-3 py-2 text-right text-slate-600">{fmtJ(row.o)}</td>
                <td className="px-3 py-2 text-right text-slate-600">{fmtJ(row.i)}</td>
                <td className="px-3 py-2 text-right font-bold text-slate-800">
                  {total > 0 ? fmtJ(total) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Aktivitas Lite (list plain) ──────────────────────────────────────────────
function LiteActivityList() {
  return (
    <div>
      <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Aktivitas Hari Ini</p>
      <ul className="space-y-1.5">
        {D_ACT.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-slate-700 border border-slate-200 rounded-lg px-3 py-2 bg-white">
            <span>{item.icon}</span>
            <span className="font-mono text-slate-400">{item.jam}</span>
            <span>{item.teks}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Dashboard Utama ──────────────────────────────────────────────────────────

export default function Dashboard() {
  const nav = useNavigate();
  const { user, sppg } = useAuthStore();
  const { isLite, cn, showChart, anim } = useLiteMode();
  const { stocks } = useInventoryStore();
  const keuangan = useKeuanganStore();

  // ── Saldo & pengeluaran dari store nyata ──
  const D_SALDO = keuangan.saldoVA;
  const D_SPEND = (keuangan.pengeluaranBahanBaku + keuangan.pengeluaranOperasional + keuangan.pengeluaranInsentif) || 3_700_000;
  const D_REL   = { hadir: 44, total: 47, absen: null as string | null };

  // ── Status laporan harian — auto-reset jika hari berbeda ──
  const todayStr = new Date().toISOString().split('T')[0];
  const D_LAP: 'terkirim' | 'belum_dikunci' | 'gagal' =
    keuangan.laporanHarianTanggal === todayStr
      ? keuangan.laporanHarianStatus
      : 'belum_dikunci';

  const days = hitungHariLagi(D_SALDO, D_SPEND);
  const pct  = Math.min(100, (D_PORSI.done / D_PORSI.target) * 100);

  // Hitung Dynamic Alerts
  const dynamicAlerts = [ ...D_ALERTS.filter(a => !a.judul.includes('beras')) ]; // Hapus static beras alert
  
  // Tambah alert inventori dinamis
  if (stocks && stocks.length > 0) {
    const kritis = stocks.filter(s => s.stok_akhir < s.min_stok);
    kritis.forEach(k => {
      dynamicAlerts.unshift({
        type: 'danger',
        judul: `Stok ${k.nama} kritis!`,
        pesan: `Tersisa ${k.stok_akhir} ${k.satuan} (Min: ${k.min_stok}). Segera buat PO.`
      });
    });
  }

  // Jalankan scheduler notifikasi WA setiap Dashboard dibuka
  useEffect(() => {
    if (sppg?.id) {
      void checkAndSendPendingNotifications(sppg.id);
    }
  }, [sppg?.id]);

  // ── Tugas Hari Ini — per role ──────────────────────────────────────────
  const role = user?.role ?? '';
  const TUGAS_MAP: Record<string, { id: string; label: string; sublabel: string; route: string; done: boolean; urgent?: boolean }[]> = {
    jurutama_masak: [
      { id: 't1', label: 'Cek stok bahan baku', sublabel: 'Pastikan semua bahan tersedia sebelum produksi', route: '/inventori', done: true },
      { id: 't2', label: 'Input produksi batch hari ini', sublabel: 'Catat jumlah porsi per satuan pendidikan', route: '/dapur', done: false },
      { id: 't3', label: 'QC organoleptik', sublabel: 'Cek warna, rasa, aroma sebelum distribusi', route: '/dapur', done: false, urgent: true },
    ],
    driver: [
      { id: 'd1', label: 'Cek manifest distribusi hari ini', sublabel: 'Daftar sekolah & jumlah porsi', route: '/distribusi', done: false },
      { id: 'd2', label: 'Konfirmasi pengiriman selesai', sublabel: 'Update status setelah semua terkirim', route: '/distribusi', done: false },
    ],
    kasppg: [
      { id: 'k1', label: 'Absensi relawan hari ini', sublabel: 'Catat kehadiran semua relawan', route: '/sdm', done: true },
      { id: 'k2', label: 'Approve PO yang menunggu', sublabel: 'Ada 2 PO menunggu persetujuan', route: '/pengadaan', done: false, urgent: true },
      { id: 'k3', label: 'Kunci Laporan Harian BGN', sublabel: 'Wajib dikunci sebelum 23:59', route: '/laporan', done: keuangan.getLaporanHarianStatusToday() === 'terkirim', urgent: keuangan.getLaporanHarianStatusToday() !== 'terkirim' },
    ],
    pengawas_keuangan: [
      { id: 'pq1', label: 'Verifikasi pengeluaran hari ini', sublabel: 'Cocokkan bukti dengan Buku Bantu', route: '/keuangan', done: false },
      { id: 'pq2', label: 'Kunci Laporan Harian BGN', sublabel: 'Wajib dikunci sebelum 23:59', route: '/laporan', done: keuangan.getLaporanHarianStatusToday() === 'terkirim', urgent: keuangan.getLaporanHarianStatusToday() !== 'terkirim' },
    ],
    owner: [
      { id: 'o1', label: 'Review status operasional', sublabel: 'Cek KPI porsi & saldo VA', route: '/dashboard', done: true },
      { id: 'o2', label: 'Approve PO menunggu', sublabel: `Ada ${keuangan.pendingPoCount} PO menunggu persetujuan`, route: '/pengadaan', done: keuangan.pendingPoCount === 0, urgent: keuangan.pendingPoCount > 0 },
      { id: 'o3', label: 'Kunci Laporan Harian BGN', sublabel: keuangan.getLaporanHarianStatusToday() === 'terkirim' ? 'Sudah dikunci hari ini ✓' : 'Wajib dikunci sebelum 23:59', route: '/laporan', done: keuangan.getLaporanHarianStatusToday() === 'terkirim', urgent: keuangan.getLaporanHarianStatusToday() !== 'terkirim' },
    ],
  };
  const tugasHariIni = TUGAS_MAP[role] ?? TUGAS_MAP['kasppg'];
  const todayKey = new Date().toISOString().split('T')[0];
  const [tugasDone, setTugasDone] = useState<Record<string, boolean>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sppg_tugas_done') || '{}');
      return saved._date === todayKey ? saved : { _date: todayKey };
    } catch { return { _date: todayKey }; }
  });
  const markTugasDone = (id: string) => {
    setTugasDone(prev => {
      const next = { ...prev, [id]: true };
      localStorage.setItem('sppg_tugas_done', JSON.stringify(next));
      return next;
    });
  };

  // ── Quick Actions dengan SVG icon ──────────────────────────────────────
  const QUICK_ACTIONS = [
    { label: 'Input Absensi', route: '/sdm', roles: ['owner','kasppg','asisten_lapangan','pengawas_keuangan'],
      svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></svg> },
    { label: 'Catat Produksi', route: '/dapur', roles: ['owner','kasppg','pengawas_gizi','asisten_lapangan','jurutama_masak'],
      svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6"><path d="M2 7h20M6 7V4m6 3V4m6 3V4M4 7v13a1 1 0 001 1h14a1 1 0 001-1V7"/><circle cx="12" cy="14" r="2"/></svg> },
    { label: 'Catat Belanja', route: '/pengadaan', roles: ['owner','kasppg','pengawas_keuangan'],
      svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
    { label: 'Laporan BGN', route: '/laporan', roles: ['owner','kasppg','pengawas_keuangan','pengawas_sanitasi','pengawas_gizi','asisten_lapangan','bgn_coord'],
      svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
    { label: 'Cek Stok', route: '/inventori', roles: ['owner','kasppg','pengawas_keuangan','pengawas_gizi','asisten_lapangan'],
      svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> },
    { label: 'Buat PO', route: '/pengadaan', roles: ['owner','kasppg','pengawas_keuangan'],
      svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg> },
  ];

  const visibleActions = QUICK_ACTIONS.filter(a => user && a.roles.includes(user.role));

  // ── Kelas KPI card ──
  const kpiCard = cn(
    'card p-4 flex flex-col gap-2 cursor-pointer',
    !isLite && 'hover:shadow-md transition-shadow',
  );

  // ── BGN Compliance items ──────────────────────────────────────────────
  const today = new Date();
  const dayOfMonth = today.getDate();
  const BGN_COMPLIANCE = [
    { label: 'Laporan Harian Hari Ini', status: D_LAP === 'terkirim' ? 'ok' : 'pending', deadline: '23:59 hari ini', urgent: D_LAP !== 'terkirim' },
    { label: 'Survei Harga Minggu Ini', status: 'warning', deadline: 'Jumat ini', urgent: false },
    { label: 'Laporan 2 Mingguan', status: dayOfMonth < 14 ? 'ok' : 'pending', deadline: 'Tgl 15 & 30', urgent: dayOfMonth >= 13 },
    { label: 'Laporan Bulanan', status: dayOfMonth <= 5 ? 'pending' : 'ok', deadline: 'Tgl 5 bulan depan', urgent: false },
  ];

  return (
    <div className={cn('flex flex-col gap-6', anim('animate-fade-in'))}>

      {/* ── LITE MODE BANNER ── */}
      {isLite && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-xl px-4 py-2.5 text-sm text-amber-800">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
            <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" />
          </svg>
          <span className="font-bold">Mode Hemat Aktif</span>
          <span className="text-amber-600">— Grafik & animasi dimatikan untuk kinerja lebih cepat.</span>
        </div>
      )}

      {/* ── ONBOARDING CHECKLIST ── */}
      <OnboardingChecklist />

      {/* ── GREETING + BGN STATUS ROW ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-semibold" style={{ color: '#0f172a' }}>
            {getGreeting()}, {singkatNama(user?.nama ?? 'Pengguna')}! 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#475569' }}>{formatTanggal(new Date())}</p>
          <div className="flex items-center gap-2 mt-2">
            {sppg?.status === 'aktif'
              ? <span className="badge-success">● Aktif</span>
              : <span className="badge-warning">● Persiapan</span>
            }
            <span className="text-xs" style={{ color: '#94a3b8' }}>· {sppg?.kab_kota ?? '—'}</span>
            {D_LAP !== 'terkirim' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full animate-pulse">
                <AlertTriangle size={10}/> Laporan harian belum dikunci!
              </span>
            )}
          </div>
        </div>
        <button onClick={() => window.location.reload()} className="btn-ghost text-xs hidden sm:inline-flex gap-1.5">
          <RefreshCw size={12} /> Perbarui Data
        </button>
      </div>

      {/* ── TUGAS HARI INI ── */}
      <div className="card p-5 border-l-4 border-l-blue-500">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-slate-800 text-base">📋 Tugas Hari Ini</h2>
            <p className="text-xs text-slate-400 mt-0.5">{tugasHariIni.filter(t => tugasDone[t.id] || t.done).length} dari {tugasHariIni.length} selesai</p>
          </div>
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${(tugasHariIni.filter(t => tugasDone[t.id] || t.done).length / tugasHariIni.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="space-y-2">
          {tugasHariIni.map((t, i) => {
            const done = tugasDone[t.id] || t.done;
            return (
              <div key={t.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                done ? 'bg-slate-50 border-slate-100 opacity-60' :
                t.urgent ? 'bg-rose-50 border-rose-200 hover:bg-rose-100' :
                'bg-white border-slate-200 hover:bg-blue-50 hover:border-blue-200'
              }`}
                onClick={() => { if (!t.done) markTugasDone(t.id); nav(t.route); }}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${
                  done ? 'bg-emerald-500' : t.urgent ? 'bg-rose-500' : 'bg-blue-100'
                }`}>
                  {done ? <CheckCircle2 size={14}/> : <span className="text-slate-500 font-bold">{i+1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${done ? 'line-through text-slate-400' : t.urgent ? 'text-rose-800' : 'text-slate-800'}`}>{t.label}</p>
                  <p className="text-xs text-slate-400 truncate">{t.sublabel}</p>
                </div>
                {t.urgent && !done && <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full shrink-0">URGENT</span>}
                {done && <CheckCircle2 size={16} className="text-emerald-500 shrink-0"/>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BGN COMPLIANCE TIMELINE ── */}
      {(role === 'owner' || role === 'kasppg' || role === 'pengawas_keuangan' || role === 'bgn_coord') && (
        <div className="card p-5">
          <h2 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-blue-500"/> Status Kepatuhan Pelaporan BGN</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BGN_COMPLIANCE.map((c, i) => (
              <div key={i} className={`p-3 rounded-xl border text-center ${
                c.status === 'ok' ? 'bg-emerald-50 border-emerald-200' :
                c.urgent ? 'bg-rose-50 border-rose-200 animate-pulse' : 'bg-amber-50 border-amber-200'
              }`}>
                <div className={`text-xl mb-1 ${ c.status === 'ok' ? 'text-emerald-500' : c.urgent ? 'text-rose-500' : 'text-amber-500' }`}>
                  {c.status === 'ok' ? '✓' : c.urgent ? '⚠' : '○'}
                </div>
                <p className="text-xs font-bold text-slate-700 leading-tight">{c.label}</p>
                <p className="text-[10px] text-slate-400 mt-1">{c.deadline}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── KPI ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className={kpiCard} onClick={() => nav('/dapur')}>
          <span className="text-xs" style={{ color: '#94a3b8' }}>Porsi Terdistribusi Hari Ini</span>
          <span className="font-display text-3xl font-semibold" style={{ color: '#0f172a' }}>
            {D_PORSI.done.toLocaleString('id-ID')}
          </span>
          <span className="text-xs" style={{ color: '#475569' }}>dari target {D_PORSI.target.toLocaleString('id-ID')} porsi</span>
          {/* Progress bar hanya di mode normal */}
          {!isLite && (
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: '#3b82f6' }} />
            </div>
          )}
          {isLite && (
            <span className="text-xs font-bold text-blue-700">{pct.toFixed(1)}% tercapai</span>
          )}
          <span className="text-xs text-blue-500">→ Klik lihat dapur</span>
        </div>

        {['owner','kasppg','pengawas_keuangan','bgn_coord'].includes(role) && (
          <div
            className={kpiCard}
            style={days < 5 ? { borderColor: '#fecaca', background: '#fff5f5' } : undefined}
            onClick={() => nav('/keuangan')}
          >
            <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>Sisa Saldo VA Saat Ini</span>
            <span className="font-display text-3xl font-semibold" style={{ color: days < 5 ? '#991b1b' : '#0f172a' }}>{formatRupiah(D_SALDO)}</span>
            {days >= 7
              ? <span className="text-xs" style={{ color: '#475569' }}>Estimasi cukup ±{days} hari operasional</span>
              : days >= 3
              ? <span className="text-xs font-semibold" style={{ color: '#78350f' }}>⚠ Tersisa ±{days} hari — segera ajukan top-up</span>
              : <span className="text-xs font-bold animate-pulse" style={{ color: '#991b1b' }}>🚨 Saldo kritis! Ajukan top-up SEGERA</span>
            }
            <span className="text-xs text-blue-500">→ Klik lihat keuangan lengkap</span>
          </div>
        )}

        <div className={kpiCard} onClick={() => nav('/sdm')}>
          <span className="text-xs" style={{ color: '#94a3b8' }}>Relawan Hadir Hari Ini</span>
          <span className="font-display text-3xl font-semibold" style={{ color: '#0f172a' }}>{D_REL.hadir} / {D_REL.total}</span>
          {D_REL.absen
            ? <span className="text-xs" style={{ color: '#78350f' }}>⚠ {D_REL.absen} tidak hadir</span>
            : <span className="text-xs" style={{ color: '#14532d' }}>✓ Semua jabatan kritis hadir</span>
          }
          <span className="text-xs text-blue-500">→ Klik lihat absensi</span>
        </div>

        {D_LAP === 'terkirim' && (
          <div className={cn('card p-4 flex flex-col gap-3 cursor-pointer', !isLite && 'hover:shadow-md')} style={{ background: '#f0fdf4', borderColor: '#dcfce7' }} onClick={() => nav('/laporan')}>
            <span className="text-xs" style={{ color: '#94a3b8' }}>Status Laporan BGN</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={20} style={{ color: '#14532d' }} />
              <span className="text-sm font-medium" style={{ color: '#14532d' }}>Laporan terkirim ke BGN ✓</span>
            </div>
          </div>
        )}
        {D_LAP === 'belum_dikunci' && (
          <div className={cn('card p-4 flex flex-col gap-3 cursor-pointer', !isLite && 'hover:shadow-md')} style={{ borderColor: '#fef3c7' }} onClick={() => nav('/laporan')}>
            <span className="text-xs" style={{ color: '#94a3b8' }}>Status Laporan BGN</span>
            <div className="flex items-center gap-2">
              <Clock size={20} style={{ color: '#78350f' }} />
              <div>
                <span className="text-sm font-medium block" style={{ color: '#78350f' }}>Belum dikunci</span>
                <span className="text-xs mt-1 text-blue-600">→ Klik untuk kunci laporan</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── ALERTS ── */}
      {dynamicAlerts.length > 0 && (
        <div className="space-y-2">
          <p className="section-title">Perlu Perhatian</p>
          {dynamicAlerts.map((a, i) => <AlertBanner key={i} type={a.type as any} judul={a.judul} pesan={a.pesan} />)}
        </div>
      )}

      {/* ── CHART / TABEL + AKTIVITAS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {['owner','kasppg','pengawas_keuangan','bgn_coord'].includes(role) && (
          <div className="card p-4 lg:col-span-3">
            {showChart ? (
              <>
                <p className="text-sm font-medium mb-4" style={{ color: '#0f172a' }}>Pengeluaran 7 Hari Terakhir</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={D_CHART} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="h" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                    <YAxis tickFormatter={fmtJ} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
                    <Tooltip content={<CTip />} cursor={{ fill: 'rgba(241,245,249,0.6)' }} />
                    <ReferenceLine y={6e6} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'Pagu', position: 'insideTopRight', fill: '#94a3b8', fontSize: 10 }} />
                    <Bar dataKey="b" stackId="a" fill="#3b82f6" name="Bahan" />
                    <Bar dataKey="o" stackId="a" fill="#93c5fd" name="Ops" />
                    <Bar dataKey="i" stackId="a" fill="#bfdbfe" radius={[4,4,0,0]} name="Insentif" />
                  </BarChart>
                </ResponsiveContainer>
              </>
            ) : (
              <LiteChartTable />
            )}
          </div>
        )}

        <div className={`card p-4 ${['owner','kasppg','pengawas_keuangan','bgn_coord'].includes(role) ? 'lg:col-span-2' : 'lg:col-span-5'}`}>
          {showChart ? (
            <>
              <p className="text-sm font-medium mb-4" style={{ color: '#0f172a' }}>Aktivitas Hari Ini</p>
              {D_ACT.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 relative pb-5 last:pb-0">
                  {idx < D_ACT.length - 1 && <div className="absolute left-[11px] top-6 bottom-0 w-px" style={{ background: '#e2e8f0' }} />}
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 z-10" style={{ background: '#f1f5f9', border: '0.5px solid #e2e8f0' }}>{item.icon}</div>
                  <div className="pt-0.5">
                    <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>{item.jam}</span>
                    <p className="text-sm leading-snug" style={{ color: '#0f172a' }}>{item.teks}</p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <LiteActivityList />
          )}
        </div>
      </div>

      {/* ── QUICK ACCESS ── */}
      {user && visibleActions.length > 0 && (
        <div>
          <p className="section-title mb-3">Akses Cepat</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {visibleActions.map((a, i) => (
              <button
                key={i}
                onClick={() => nav(a.route)}
                className={cn(
                  'card p-4 flex flex-col items-center gap-2.5 text-center group',
                  !isLite && 'hover:bg-blue-50 hover:border-blue-200 transition-all active:scale-95',
                )}
              >
                <span className="text-slate-500 group-hover:text-blue-600 transition-colors">{a.svg}</span>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
