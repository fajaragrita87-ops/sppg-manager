import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Tag, Save, RefreshCw } from 'lucide-react';
import { toast } from '@/store/toastStore';

// ─── Tipe data ───────────────────────────────────────────────────────────────
interface Paket {
  id: string;
  nama: string;
  harga_bulanan: number;
  harga_tahunan: number;
  deskripsi: string;
  fitur: string[];
  aktif: boolean;
  populer: boolean;
  tag: string; // 'free' | 'pro' | 'enterprise'
}

interface PromoCode {
  id: string;
  kode: string;
  tipe: 'persen' | 'nominal';
  nilai: number;
  max_pakai: number | null;
  dipakai: number;
  expired: string;
  aktif: boolean;
}

const INITIAL_PAKET: Paket[] = [
  {
    id: 'starter',
    nama: 'Starter',
    harga_bulanan: 0,
    harga_tahunan: 0,
    deskripsi: 'Untuk mulai coba platform',
    fitur: ['1 SPPG', 'Maks. 30 relawan', 'Dashboard & absensi', 'Laporan harian (tanpa PDF BGN)', 'Inventori dasar'],
    aktif: true,
    populer: false,
    tag: 'free',
  },
  {
    id: 'pro',
    nama: 'Pro',
    harga_bulanan: 299000,
    harga_tahunan: 2868000,
    deskripsi: 'Untuk SPPG aktif operasional',
    fitur: ['1 SPPG, relawan unlimited', 'Semua fitur lengkap', 'Generate semua Lampiran 30 BGN', 'Sync otomatis SIPGN & dialur', 'Offline ready', 'Support via WhatsApp'],
    aktif: true,
    populer: true,
    tag: 'pro',
  },
  {
    id: 'enterprise',
    nama: 'Enterprise',
    harga_bulanan: 0, // custom
    harga_tahunan: 0, // custom
    deskripsi: 'Untuk yayasan dengan banyak SPPG',
    fitur: ['Multi-SPPG dalam 1 akun', 'Dashboard konsolidasi yayasan', 'Semua fitur Pro', 'Dedicated support 24/7', 'Onboarding & training tim', 'SLA terjamin'],
    aktif: true,
    populer: false,
    tag: 'enterprise',
  },
];

const INITIAL_PROMO: PromoCode[] = [
  { id: 'p1', kode: 'EARLYBIRD', tipe: 'persen', nilai: 20, max_pakai: 100, dipakai: 45, expired: '2026-12-31', aktif: true },
  { id: 'p2', kode: 'POTONGAN50K', tipe: 'nominal', nilai: 50000, max_pakai: null, dipakai: 12, expired: '2026-06-30', aktif: true },
];

// ─── Komponen Utama ──────────────────────────────────────────────────────────
const PaketBilling = () => {
  const [paketList, setPaketList] = useState<Paket[]>(INITIAL_PAKET);
  const [promoList, setPromoList] = useState<PromoCode[]>(INITIAL_PROMO);
  const [editingPaket, setEditingPaket] = useState<string | null>(null);
  
  // Form promo baru
  const [newPromo, setNewPromo] = useState({ kode: '', tipe: 'persen', nilai: '', expired: '' });

  const updatePaket = (id: string, key: keyof Paket, value: any) => {
    setPaketList(prev => prev.map(p => p.id === id ? { ...p, [key]: value } : p));
  };

  const savePaket = (id: string) => {
    setEditingPaket(null);
    toast.sukses('Perubahan paket berhasil disimpan!');
  };

  const togglePromo = (id: string) => {
    setPromoList(prev => prev.map(p => p.id === id ? { ...p, aktif: !p.aktif } : p));
    toast.sukses('Status promo diperbarui');
  };

  const deletePromo = (id: string) => {
    setPromoList(prev => prev.filter(p => p.id !== id));
    toast.sukses('Kode promo dihapus');
  };

  const addPromo = () => {
    if (!newPromo.kode || !newPromo.nilai || !newPromo.expired) {
      toast.error('Isi semua field kode promo'); return;
    }
    const promo: PromoCode = {
      id: `p${Date.now()}`,
      kode: newPromo.kode.toUpperCase(),
      tipe: newPromo.tipe as 'persen' | 'nominal',
      nilai: Number(newPromo.nilai),
      max_pakai: null,
      dipakai: 0,
      expired: newPromo.expired,
      aktif: true,
    };
    setPromoList(prev => [promo, ...prev]);
    setNewPromo({ kode: '', tipe: 'persen', nilai: '', expired: '' });
    toast.sukses(`Kode promo ${promo.kode} berhasil dibuat!`);
  };

  // Hitung MRR dari data paket
  const totalMRR = paketList.filter(p => p.tag === 'pro').reduce((acc, p) => acc + p.harga_bulanan * 198, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Manajemen Paket & Pricing</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola harga, fitur, dan promo berlangganan</p>
        </div>
      </div>

      {/* KARTU REVENUE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm font-medium text-slate-500 mb-1">MRR Total (Est.)</div>
          <div className="text-2xl font-bold text-slate-900">Rp {(totalMRR).toLocaleString('id-ID')}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm font-medium text-slate-500 mb-1">ARR Projected</div>
          <div className="text-2xl font-bold text-slate-900">Rp {(totalMRR * 12).toLocaleString('id-ID')}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm font-medium text-slate-500 mb-1">Churn Rate</div>
          <div className="text-2xl font-bold text-rose-600">1.2%</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm font-medium text-slate-500 mb-1">Trial Conversion</div>
          <div className="text-2xl font-bold text-emerald-600">42.5%</div>
        </div>
      </div>

      {/* EDITOR PAKET */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-900">Daftar & Editor Paket</h3>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg">
            ⚡ Klik pada harga untuk mengedit langsung
          </div>
        </div>
        <div className="p-5">
          <div className="grid md:grid-cols-3 gap-6">
            {paketList.map((paket) => (
              <div
                key={paket.id}
                className={`border rounded-xl p-5 relative transition-all ${
                  paket.populer ? 'border-2 border-[#1e6fbf] bg-blue-50/30' : 'border-slate-200'
                } ${editingPaket === paket.id ? 'ring-2 ring-blue-300 shadow-md' : ''}`}
              >
                {paket.populer && (
                  <div className="absolute -top-3 left-4 bg-[#1e6fbf] text-white text-xs px-2 py-0.5 rounded-full font-bold">Populer</div>
                )}

                {/* Nama & Status */}
                <div className="flex justify-between items-start mb-4 mt-2">
                  <div>
                    <h4 className="font-bold text-lg text-slate-900">{paket.nama}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{paket.deskripsi}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${paket.aktif ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {paket.aktif ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                {/* Editor Harga */}
                {editingPaket === paket.id ? (
                  <div className="space-y-3 mb-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">✏ Mode Edit Harga & Paket</p>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Paket</label>
                      <input type="text" value={paket.nama} onChange={e => updatePaket(paket.id, 'nama', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Harga Bulanan (Rp)</label>
                      <input type="number" value={paket.harga_bulanan} onChange={e => updatePaket(paket.id, 'harga_bulanan', Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    {paket.tag !== 'free' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Harga Tahunan (Rp)</label>
                        <input type="number" value={paket.harga_tahunan} onChange={e => updatePaket(paket.id, 'harga_tahunan', Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 mb-2">
                      <div>
                        <p className="text-xs text-slate-400">Bulanan</p>
                        <p className="font-bold text-[#1e6fbf]">
                          {paket.harga_bulanan === 0 && paket.tag === 'free' ? 'Gratis' :
                           paket.harga_bulanan === 0 ? 'Custom' :
                           `Rp ${paket.harga_bulanan.toLocaleString('id-ID')}`}
                        </p>
                      </div>
                      {paket.tag !== 'free' && paket.harga_tahunan > 0 && (
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Tahunan</p>
                          <p className="font-bold text-emerald-600">Rp {paket.harga_tahunan.toLocaleString('id-ID')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Fitur */}
                <ul className="text-sm space-y-2 mb-5">
                  {paket.fitur.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check size={13} className="text-emerald-500 shrink-0" />
                      <span className="text-slate-600">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Tombol Aksi */}
                {editingPaket === paket.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => savePaket(paket.id)}
                      className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-700 flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Save size={14} /> Simpan
                    </button>
                    <button
                      onClick={() => setEditingPaket(null)}
                      className="flex-1 border border-slate-300 text-slate-600 rounded-lg py-2 text-sm font-medium hover:bg-slate-50 flex items-center justify-center gap-1.5"
                    >
                      <X size={14} /> Batal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingPaket(paket.id)}
                    className={`w-full rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      paket.populer
                        ? 'bg-[#1e6fbf] text-white hover:bg-[#1a5fa8] shadow-sm'
                        : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Edit2 size={14} /> Edit Harga & Paket
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PROMO & DISKON */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Buat Promo */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <Tag size={18} className="text-[#1e6fbf]" /> Buat Kode Promo Baru
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-slate-700 mb-1 font-medium">Kode Promo</label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-lg p-2.5 uppercase font-mono font-bold focus:ring-2 focus:ring-blue-200 focus:border-[#1e6fbf] outline-none"
                placeholder="CONTOH2026"
                value={newPromo.kode}
                onChange={e => setNewPromo({ ...newPromo, kode: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 mb-1 font-medium">Jenis</label>
                <select
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-200 outline-none"
                  value={newPromo.tipe}
                  onChange={e => setNewPromo({ ...newPromo, tipe: e.target.value })}
                >
                  <option value="persen">Persentase (%)</option>
                  <option value="nominal">Nominal (Rp)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-medium">Nilai</label>
                <input
                  type="number"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder={newPromo.tipe === 'persen' ? '20' : '50000'}
                  value={newPromo.nilai}
                  onChange={e => setNewPromo({ ...newPromo, nilai: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-medium">Tanggal Expired</label>
              <input
                type="date"
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-200 outline-none"
                value={newPromo.expired}
                onChange={e => setNewPromo({ ...newPromo, expired: e.target.value })}
              />
            </div>
            <button
              onClick={addPromo}
              className="w-full bg-slate-900 text-white rounded-lg py-2.5 font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Buat Kode
            </button>
          </div>
        </div>

        {/* Daftar Promo Aktif */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Kode Promo Aktif</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium">Kode</th>
                  <th className="px-4 py-3 font-medium">Diskon</th>
                  <th className="px-4 py-3 font-medium">Dipakai</th>
                  <th className="px-4 py-3 font-medium">Expired</th>
                  <th className="px-4 py-3 font-medium text-center">Status</th>
                  <th className="px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {promoList.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{p.kode}</td>
                    <td className="px-4 py-3 text-[#1e6fbf] font-medium">
                      {p.tipe === 'persen' ? `${p.nilai}%` : `Rp ${p.nilai.toLocaleString('id-ID')}`}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.dipakai}/{p.max_pakai ?? '∞'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{p.expired}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => togglePromo(p.id)}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                          p.aktif
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        {p.aktif ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deletePromo(p.id)}
                        className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded transition-colors"
                        title="Hapus promo"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {promoList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">
                      Belum ada kode promo. Buat yang baru di sebelah kiri.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaketBilling;
