import { useState } from 'react';
import { Plus, Download, X, CheckCircle2, TrendingUp, TrendingDown, Wallet, FileText, AlertTriangle, Bell, ArrowRight, Clock } from 'lucide-react';
import { toast } from '@/store/toastStore';

// ─── Kategori Pengeluaran ─────────────────────────────────────────────────────
const KATEGORI = [
  { id: 'bahan_baku',   label: 'Pengadaan Bahan', warna: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'insentif',     label: 'Insentif Relawan', warna: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'bbm',          label: 'BBM & Transportasi', warna: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'operasional',  label: 'Utilitas & Ops', warna: 'bg-violet-50 text-violet-700 border-violet-200' },
  { id: 'perlengkapan', label: 'Perlengkapan', warna: 'bg-teal-50 text-teal-700 border-teal-200' },
  { id: 'lainnya',      label: 'Lain-lain', warna: 'bg-slate-50 text-slate-600 border-slate-200' },
];

// ─── Notifikasi PO yang Harus Dibayar ─────────────────────────────────────────
const PENDING_PAYMENTS = [
  { poId: 'PO/2026/05/MDK/002', supplier: 'Koperasi Peternak Mandiri', total: 2800000, approvedAt: '14 Mei 2026', jatuhTempo: '21 Mei 2026' },
];

// ─── Data Transaksi ───────────────────────────────────────────────────────────
const INIT_TRANSAKSI = [
  { id: 'T001', tanggal: '2026-05-15', uraian: 'Transfer Dana BGN Periode II — Minggu ke-20', tipe: 'masuk', kategori: 'dana_bgn', jumlah: 52000000 },
  { id: 'T002', tanggal: '2026-05-14', uraian: 'Pembayaran PO/2026/05/MDK/001 — BUMDesa Maju Makmur', tipe: 'keluar', kategori: 'bahan_baku', jumlah: 4500000 },
  { id: 'T003', tanggal: '2026-05-13', uraian: 'Insentif 47 relawan periode 1–15 Mei 2026', tipe: 'keluar', kategori: 'insentif', jumlah: 37250000 },
  { id: 'T004', tanggal: '2026-05-10', uraian: 'Transfer Dana BGN Periode I — Minggu ke-19', tipe: 'masuk', kategori: 'dana_bgn', jumlah: 52000000 },
  { id: 'T005', tanggal: '2026-05-09', uraian: 'BBM distribusi bulan April', tipe: 'keluar', kategori: 'bbm', jumlah: 750000 },
  { id: 'T006', tanggal: '2026-05-08', uraian: 'Tagihan listrik dapur April 2026', tipe: 'keluar', kategori: 'operasional', jumlah: 1200000 },
];

const fmtRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
const fmtTgl = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

export default function KeuanganPage() {
  const [transaksi, setTransaksi] = useState(INIT_TRANSAKSI);
  const [showForm, setShowForm] = useState(false);
  const [pendingPO, setPendingPO] = useState(PENDING_PAYMENTS);

  const [form, setForm] = useState({
    tipe: 'keluar',
    kategori: 'bahan_baku',
    uraian: '',
    jumlah: '',
    tanggal: new Date().toISOString().split('T')[0],
  });

  const masuk = transaksi.filter(t => t.tipe === 'masuk').reduce((a, t) => a + t.jumlah, 0);
  const keluar = transaksi.filter(t => t.tipe === 'keluar').reduce((a, t) => a + t.jumlah, 0);
  const saldo = masuk - keluar;
  const pctTerpakai = masuk > 0 ? Math.round((keluar / masuk) * 100) : 0;

  const handleSimpan = () => {
    if (!form.uraian || !form.jumlah) { toast.error('Isi semua kolom yang wajib'); return; }
    const jumlah = Number(String(form.jumlah).replace(/\./g, ''));
    if (isNaN(jumlah) || jumlah <= 0) { toast.error('Nominal tidak valid'); return; }
    const id = 'T' + Date.now();
    setTransaksi([{ id, tanggal: form.tanggal, uraian: form.uraian, tipe: form.tipe as 'masuk'|'keluar', kategori: form.kategori, jumlah }, ...transaksi]);
    toast.sukses('Transaksi berhasil dicatat');
    setShowForm(false);
    setForm({ tipe: 'keluar', kategori: 'bahan_baku', uraian: '', jumlah: '', tanggal: new Date().toISOString().split('T')[0] });
  };

  const handleBayarPO = (po: typeof PENDING_PAYMENTS[0]) => {
    // Auto-create transaksi dari PO yang di-approve
    const id = 'T' + Date.now();
    setTransaksi([{
      id,
      tanggal: new Date().toISOString().split('T')[0],
      uraian: `Pembayaran ${po.poId} — ${po.supplier}`,
      tipe: 'keluar',
      kategori: 'bahan_baku',
      jumlah: po.total,
    }, ...transaksi]);
    setPendingPO(pendingPO.filter(p => p.poId !== po.poId));
    toast.sukses(`Pembayaran ${po.poId} sebesar ${fmtRp(po.total)} berhasil dicatat`);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-16">

      {/* ── HEADER ── */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Keuangan SPPG</h1>
          <p className="text-sm text-slate-500 mt-1">Arus kas, pembayaran PO, dan realisasi anggaran</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs flex items-center gap-1.5 py-2">
            <Download size={14}/> Unduh Laporan
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={16}/> Catat Transaksi
          </button>
        </div>
      </div>

      {/* ── NOTIFIKASI PO MENUNGGU PEMBAYARAN ── */}
      {pendingPO.length > 0 && (
        <div className="mb-6 space-y-3">
          {pendingPO.map(po => (
            <div key={po.poId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    PO Disetujui — Menunggu Pembayaran
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    <span className="font-semibold text-blue-700">{po.poId}</span> ke {po.supplier} senilai <span className="font-bold">{fmtRp(po.total)}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock size={10}/> Disetujui {po.approvedAt} · Jatuh tempo {po.jatuhTempo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleBayarPO(po)}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 whitespace-nowrap self-end sm:self-center"
              >
                Bayar Sekarang <ArrowRight size={14}/>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── 3 KPI CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Wallet size={16} className="opacity-60"/>
            <p className="text-xs font-medium opacity-70">Saldo Dana Tersisa</p>
          </div>
          <p className="text-3xl font-black tracking-tight">{fmtRp(saldo)}</p>
          <div className="mt-3 bg-white/15 rounded-full h-1.5">
            <div className="bg-white h-1.5 rounded-full transition-all" style={{ width: `${Math.max(100 - pctTerpakai, 0)}%` }}/>
          </div>
          <p className="text-[11px] opacity-50 mt-1">{100 - pctTerpakai}% dana masih tersedia</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-emerald-600"/>
            </div>
            <p className="text-xs font-medium text-slate-500">Total Dana Masuk</p>
          </div>
          <p className="text-2xl font-black text-emerald-600">{fmtRp(masuk)}</p>
          <p className="text-xs text-slate-400 mt-1">Transfer BGN bulan berjalan</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center">
              <TrendingDown size={16} className="text-rose-600"/>
            </div>
            <p className="text-xs font-medium text-slate-500">Total Pengeluaran</p>
          </div>
          <p className="text-2xl font-black text-rose-600">{fmtRp(keluar)}</p>
          {pctTerpakai > 80
            ? <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-medium"><AlertTriangle size={11}/> {pctTerpakai}% dana terpakai</p>
            : <p className="text-xs text-slate-400 mt-1">{pctTerpakai}% dari total anggaran</p>
          }
        </div>
      </div>

      {/* ── BREAKDOWN KATEGORI ── */}
      <div className="card p-5 mb-6">
        <h2 className="font-bold text-slate-800 mb-4 text-sm">Komposisi Pengeluaran</h2>
        <div className="space-y-3">
          {KATEGORI.map(kat => {
            const total = transaksi.filter(t => t.kategori === kat.id).reduce((a, t) => a + t.jumlah, 0);
            if (!total) return null;
            const pct = masuk > 0 ? Math.round((total / masuk) * 100) : 0;
            return (
              <div key={kat.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`px-2.5 py-0.5 rounded border font-semibold text-[11px] ${kat.warna}`}>{kat.label}</span>
                  <span className="font-bold text-slate-700">{fmtRp(total)} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-slate-400 transition-all" style={{ width: `${pct}%` }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIWAYAT TRANSAKSI ── */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2"><FileText size={14} className="text-slate-400"/> Riwayat Transaksi</h2>
          <span className="text-xs text-slate-400">{transaksi.length} entri</span>
        </div>
        <div className="divide-y divide-slate-50">
          {transaksi.map(t => {
            const kat = KATEGORI.find(k => k.id === t.kategori);
            return (
              <div key={t.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.tipe === 'masuk' ? 'bg-emerald-500' : 'bg-rose-400'}`}/>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{t.uraian}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{fmtTgl(t.tanggal)}{kat ? ` · ${kat.label}` : ''}</p>
                </div>
                <div className={`text-right font-bold text-sm whitespace-nowrap ${t.tipe === 'masuk' ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {t.tipe === 'masuk' ? '+' : '−'}{fmtRp(t.jumlah)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MODAL CATAT TRANSAKSI ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Catat Transaksi Baru</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"><X size={18}/></button>
            </div>

            <div className="p-6 space-y-4">
              {/* Tipe */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Jenis Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setForm(f => ({ ...f, tipe: 'keluar' }))}
                    className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${form.tipe === 'keluar' ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-500'}`}
                  >Pengeluaran</button>
                  <button
                    onClick={() => setForm(f => ({ ...f, tipe: 'masuk' }))}
                    className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${form.tipe === 'masuk' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500'}`}
                  >Penerimaan Dana</button>
                </div>
              </div>

              {/* Kategori */}
              {form.tipe === 'keluar' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Kategori</label>
                  <div className="grid grid-cols-2 gap-2">
                    {KATEGORI.map(k => (
                      <button
                        key={k.id}
                        onClick={() => setForm(f => ({ ...f, kategori: k.id }))}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${form.kategori === k.id ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                      >{k.label}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Uraian */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Keterangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Pembayaran PO ke BUMDesa..."
                  value={form.uraian}
                  onChange={e => setForm(f => ({ ...f, uraian: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Jumlah */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nominal (Rp)</label>
                <input
                  type="number"
                  placeholder="500000"
                  value={form.jumlah}
                  onChange={e => setForm(f => ({ ...f, jumlah: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tanggal</label>
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 text-sm transition-colors">Batal</button>
              <button onClick={handleSimpan} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                <CheckCircle2 size={16}/> Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
