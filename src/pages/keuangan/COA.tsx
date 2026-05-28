import { useState } from 'react';
import { Lock, Plus, ChevronRight, ChevronDown, Eye, EyeOff, Info, Layers, Banknote, TrendingUp, TrendingDown, Scale, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { formatRupiah } from '@/lib/utils';

const TIPE_META: Record<string, { label: string; icon: React.ElementType; accent: string; bg: string }> = {
  aset:       { label: 'Aset',        icon: Banknote,    accent: '#0f766e', bg: '#f0fdfa' },
  liabilitas: { label: 'Kewajiban',   icon: Scale,       accent: '#b91c1c', bg: '#fef2f2' },
  ekuitas:    { label: 'Ekuitas',     icon: Layers,      accent: '#6d28d9', bg: '#f5f3ff' },
  pendapatan: { label: 'Pendapatan',  icon: TrendingUp,  accent: '#0369a1', bg: '#eff6ff' },
  beban:      { label: 'Beban',       icon: TrendingDown, accent: '#b45309', bg: '#fffbeb' },
};

const COA_DATA = [
  { tipe: 'aset', items: [
    { kode:'1-1001', nama:'Kas & Virtual Account BGN',    tampil:'Saldo Rekening VA BGN',      sub:'kas',        saldo:10250000,  lock:true,  aktif:true },
    { kode:'1-1002', nama:'Kas Kecil (Petty Cash)',       tampil:'Kas Kecil Operasional',       sub:'kas',        saldo:500000,    lock:true,  aktif:true },
    { kode:'1-1100', nama:'Persediaan Bahan Baku',        tampil:'Stok Bahan di Gudang',        sub:'persediaan', saldo:3200000,  lock:true,  aktif:true },
    { kode:'1-2001', nama:'Peralatan Dapur',              tampil:'Aset Peralatan Dapur',        sub:'aset_tetap', saldo:45000000, lock:false, aktif:true },
    { kode:'1-2002', nama:'Kendaraan Distribusi',         tampil:'Kendaraan Operasional',       sub:'aset_tetap', saldo:0,        lock:false, aktif:true },
  ]},
  { tipe: 'liabilitas', items: [
    { kode:'2-1001', nama:'Hutang ke Supplier',           tampil:'Tagihan Belum Dibayar',       sub:'hutang_usaha', saldo:2800000, lock:true,  aktif:true },
    { kode:'2-1002', nama:'Hutang Insentif Relawan',      tampil:'Insentif Belum Dibayar',      sub:'hutang_sdm',   saldo:0,       lock:true,  aktif:true },
  ]},
  { tipe: 'ekuitas', items: [
    { kode:'3-0001', nama:'Modal Awal Yayasan',           tampil:'Modal Awal',                  sub:'modal',           saldo:50000000, lock:true,  aktif:true },
    { kode:'3-0003', nama:'Surplus/Defisit Berjalan',     tampil:'Surplus/Defisit Periode Ini', sub:'current_earnings',saldo:6150000,  lock:true,  aktif:true },
  ]},
  { tipe: 'pendapatan', items: [
    { kode:'4-0001', nama:'Dana Operasional BGN',         tampil:'Dana dari BGN',               sub:'dana_bgn',         saldo:104000000, lock:true,  aktif:true },
    { kode:'4-0002', nama:'Insentif Fasilitas SPPG',      tampil:'Insentif Fasilitas BGN',      sub:'insentif_fasilitas',saldo:5000000,  lock:true,  aktif:true },
  ]},
  { tipe: 'beban', items: [
    { kode:'5-1001', nama:'Bahan Baku Karbohidrat',       tampil:'Beras & Karbohidrat',         sub:'bahan_baku',  saldo:22000000,  lock:false, aktif:true },
    { kode:'5-1002', nama:'Bahan Baku Protein Hewani',    tampil:'Ayam, Ikan, Telur, Daging',   sub:'bahan_baku',  saldo:31500000,  lock:false, aktif:true },
    { kode:'5-2001', nama:'Insentif Harian Relawan',      tampil:'Insentif Relawan',            sub:'insentif',    saldo:37250000,  lock:true,  aktif:true },
    { kode:'5-3001', nama:'Listrik',                      tampil:'Tagihan Listrik PLN',         sub:'utilitas',    saldo:1200000,   lock:false, aktif:true },
    { kode:'5-3002', nama:'Gas LPG',                      tampil:'Gas LPG Dapur',               sub:'utilitas',    saldo:800000,    lock:false, aktif:true },
    { kode:'5-3005', nama:'Bahan Bakar (BBM)',            tampil:'BBM Kendaraan',               sub:'kendaraan',   saldo:750000,    lock:false, aktif:true },
  ]},
];

export default function COA() {
  const { user } = useAuthStore();
  const isOwner = user?.role === 'owner';
  const [expanded, setExpanded] = useState<string[]>(['aset', 'beban']);
  const [showAkuntansi, setShowAkuntansi] = useState(false);
  const [showTambah, setShowTambah] = useState(false);
  const [form, setForm] = useState({ tipe:'beban', kode:'', nama:'', tampil:'' });

  const toggle = (t: string) => setExpanded(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  const totalPerTipe = (tipe: string) => {
    const grp = COA_DATA.find(g => g.tipe === tipe);
    return grp ? grp.items.reduce((s, a) => s + a.saldo, 0) : 0;
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <BookOpen size={12} /> <span>Keuangan</span> <ChevronRight size={10} /> <span className="text-slate-600">Daftar Akun (COA)</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Daftar Akun</h1>
          <p className="text-sm text-slate-500 mt-0.5">Chart of Accounts — {COA_DATA.reduce((s,g)=>s+g.items.length,0)} akun aktif</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAkuntansi(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
            {showAkuntansi ? <EyeOff size={13}/> : <Eye size={13}/>}
            {showAkuntansi ? 'Tampilan Sederhana' : 'Nama Akuntansi'}
          </button>
          {isOwner && (
            <button onClick={() => setShowTambah(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
              <Plus size={13}/> Tambah Akun
            </button>
          )}
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg mb-5 text-xs text-slate-600">
        <Info size={14} className="flex-shrink-0 mt-0.5 text-slate-400" />
        <span>Akun bertanda <Lock size={11} className="inline mx-0.5 text-slate-500" /> adalah akun sistem yang dikunci dan tidak dapat dihapus. Anda dapat menambahkan akun kustom atau menonaktifkan akun yang tidak digunakan.</span>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {COA_DATA.map(g => {
          const meta = TIPE_META[g.tipe];
          const Icon = meta.icon;
          return (
            <button key={g.tipe} onClick={() => toggle(g.tipe)}
              className="flex flex-col gap-1 p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all text-left">
              <div className="flex items-center justify-between w-full">
                <Icon size={14} style={{ color: meta.accent }} />
                <span className="text-[10px] font-mono text-slate-400">{g.items.length}</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-700 mt-1">{meta.label}</p>
              <p className="text-[11px] font-mono text-slate-500">{formatRupiah(totalPerTipe(g.tipe))}</p>
            </button>
          );
        })}
      </div>

      {/* COA Table per group */}
      <div className="space-y-2">
        {COA_DATA.map(group => {
          const meta = TIPE_META[group.tipe];
          const Icon = meta.icon;
          const isOpen = expanded.includes(group.tipe);
          const total = group.items.reduce((s,a)=>s+a.saldo,0);
          return (
            <div key={group.tipe} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              {/* Group header */}
              <button onClick={() => toggle(group.tipe)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-200 last:border-0">
                <Icon size={15} style={{ color: meta.accent }} />
                <span className="text-sm font-semibold text-slate-800">{meta.label}</span>
                <span className="text-xs text-slate-400 ml-1">({group.items.length} akun)</span>
                <div className="ml-auto flex items-center gap-4">
                  <span className="text-xs font-mono font-semibold text-slate-700">{formatRupiah(total)}</span>
                  {isOpen ? <ChevronDown size={14} className="text-slate-400"/> : <ChevronRight size={14} className="text-slate-400"/>}
                </div>
              </button>

              {isOpen && (
                <div>
                  {/* Table head */}
                  <div className="grid grid-cols-12 px-4 py-2 border-b border-slate-100 bg-slate-50/50">
                    <div className="col-span-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Kode</div>
                    <div className="col-span-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {showAkuntansi ? 'Nama Akun (Akuntansi)' : 'Nama Tampil'}
                    </div>
                    <div className="col-span-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Sub-Tipe</div>
                    <div className="col-span-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Saldo</div>
                    <div className="col-span-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Status</div>
                  </div>
                  {/* Rows */}
                  {group.items.map((akun, i) => (
                    <div key={akun.kode}
                      className={`grid grid-cols-12 px-4 py-3 items-center border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors ${!akun.aktif ? 'opacity-40' : ''}`}>
                      <div className="col-span-2 flex items-center gap-1.5">
                        {akun.lock
                          ? <Lock size={10} className="text-slate-300 flex-shrink-0" />
                          : <span className="w-[10px]" />}
                        <span className="text-xs font-mono text-slate-500">{akun.kode}</span>
                      </div>
                      <div className="col-span-4">
                        <p className="text-sm text-slate-800 font-medium leading-tight">
                          {showAkuntansi ? akun.nama : akun.tampil}
                        </p>
                        {showAkuntansi && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{akun.tampil}</p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <span className="text-[11px] text-slate-400 capitalize font-mono">{akun.sub.replace(/_/g,' ')}</span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-sm font-mono font-semibold text-slate-800">
                          {akun.saldo > 0 ? formatRupiah(akun.saldo) : <span className="text-slate-300">—</span>}
                        </span>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        {akun.aktif
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded border border-emerald-200 text-emerald-700 bg-emerald-50">Aktif</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded border border-slate-200 text-slate-400 bg-slate-50">Nonaktif</span>}
                      </div>
                    </div>
                  ))}
                  {/* Group total */}
                  <div className="grid grid-cols-12 px-4 py-2.5 bg-slate-50 border-t border-slate-200">
                    <div className="col-span-8 text-xs font-semibold text-slate-500">Total {meta.label}</div>
                    <div className="col-span-2 text-right">
                      <span className="text-sm font-mono font-bold" style={{ color: meta.accent }}>{formatRupiah(total)}</span>
                    </div>
                    <div className="col-span-2" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Tambah Akun */}
      {showTambah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Plus size={15} className="text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-800">Tambah Akun Baru</h3>
              </div>
              <button onClick={() => setShowTambah(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <Plus size={16} className="rotate-45" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label:'Tipe Akun', type:'select', opts:['aset','liabilitas','ekuitas','pendapatan','beban'] },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{f.label}</label>
                  <select className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-slate-400 bg-white"
                    value={form.tipe} onChange={e => setForm(p=>({...p,tipe:e.target.value}))}>
                    {f.opts?.map(o => <option key={o} value={o} className="capitalize">{TIPE_META[o]?.label || o}</option>)}
                  </select>
                </div>
              ))}
              {[
                { key:'kode', label:'Kode Akun', ph:'mis. 5-3011', mono:true },
                { key:'nama', label:'Nama Akun (Akuntansi)', ph:'mis. Biaya Pengiriman', mono:false },
                { key:'tampil', label:'Nama Tampil (Bahasa Sederhana)', ph:'mis. Ongkos Kirim Bahan', mono:false },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{f.label}</label>
                  <input type="text" placeholder={f.ph}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))}
                    className={`w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-slate-400 ${f.mono?'font-mono':''}`} />
                </div>
              ))}
            </div>
            <div className="px-5 pb-5 flex gap-2">
              <button onClick={() => setShowTambah(false)} className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Batal</button>
              <button onClick={() => setShowTambah(false)} className="flex-1 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">Simpan Akun</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
