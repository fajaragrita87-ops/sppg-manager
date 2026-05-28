import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserPlus, Clock, CheckCircle2, XCircle, CheckCircle,
  Search, Download, Calendar, ChevronRight, ChevronDown,
  Star, Phone, MapPin, Badge, X, Save, Plus, QrCode,
  ClipboardList, Banknote, AlertCircle, FileText, ArrowRight
} from 'lucide-react';
import { toast } from '@/store/toastStore';

const JABATAN_OPTIONS = ['Jurutama Masak', 'Asisten Lapangan', 'Pengawas Gizi', 'Driver', 'Pengawas Sanitasi'];
const SHIFT_OPTIONS = ['Pagi (04:00–12:00)', 'Siang (12:00–20:00)', 'Malam (20:00–04:00)'];

const MOCK_RELAWAN = [
  { id: '1', nama: 'Siti Rahayu', jabatan: 'Jurutama Masak', shift: 'Pagi', hadir: 22, izin: 1, alpha: 0, telp: '08123456789', area: 'Dapur Utama' },
  { id: '2', nama: 'Budi Santoso', jabatan: 'Asisten Lapangan', shift: 'Pagi', hadir: 20, izin: 2, alpha: 1, telp: '08987654321', area: 'Distribusi' },
  { id: '3', nama: 'Rina Marlina', jabatan: 'Pengawas Gizi', shift: 'Pagi', hadir: 23, izin: 0, alpha: 0, telp: '08765432198', area: 'Quality Control' },
  { id: '4', nama: 'Agus Setiawan', jabatan: 'Driver', shift: 'Siang', hadir: 18, izin: 3, alpha: 2, telp: '08112233445', area: 'Distribusi' },
  { id: '5', nama: 'Dewi Lestari', jabatan: 'Asisten Lapangan', shift: 'Pagi', hadir: 21, izin: 1, alpha: 1, telp: '08554433221', area: 'Packing' },
  { id: '6', nama: 'Hendra Gunawan', jabatan: 'Jurutama Masak', shift: 'Siang', hadir: 19, izin: 2, alpha: 0, telp: '08667788990', area: 'Dapur Utama' },
];

const ABSENSI_HARI_INI = [
  { nama: 'Siti Rahayu', jam_masuk: '05:32', status: 'hadir' },
  { nama: 'Budi Santoso', jam_masuk: '05:45', status: 'hadir' },
  { nama: 'Rina Marlina', jam_masuk: '-', status: 'izin' },
  { nama: 'Agus Setiawan', jam_masuk: '06:10', status: 'hadir' },
  { nama: 'Dewi Lestari', jam_masuk: '-', status: 'alpha' },
  { nama: 'Hendra Gunawan', jam_masuk: '05:58', status: 'hadir' },
];

export default function SDMPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'absensi' | 'relawan' | 'insentif'>('absensi');
  const [search, setSearch] = useState('');
  const [showAbsenForm, setShowAbsenForm] = useState(false);
  const [showTambahRelawan, setShowTambahRelawan] = useState(false);
  const [relawanList, setRelawanList] = useState(MOCK_RELAWAN);
  const [absensiData, setAbsensiData] = useState(
    ABSENSI_HARI_INI.map(a => ({ ...a }))
  );
  const [formRelawan, setFormRelawan] = useState({ nama: '', jabatan: 'Jurutama Masak', shift: 'Pagi (04:00–12:00)', telp: '', area: '' });

  // ── KPI computed dari live state ──
  const totalRelawan = relawanList.length;
  const hadirHariIni = absensiData.filter(a => a.status === 'hadir').length;
  const izinHariIni  = absensiData.filter(a => a.status === 'izin').length;
  const alphaHariIni = absensiData.filter(a => a.status === 'alpha').length;

  const filtered = relawanList.filter(r =>
    r.nama.toLowerCase().includes(search.toLowerCase()) ||
    r.jabatan.toLowerCase().includes(search.toLowerCase())
  );

  const handleSimpanAbsensi = () => {
    toast.sukses('Absensi berhasil disimpan!', 'Data kehadiran hari ini telah tercatat.');
    setShowAbsenForm(false);
  };

  const handleTambahRelawan = () => {
    if (!formRelawan.nama.trim()) { toast.error('Nama relawan wajib diisi!'); return; }
    if (!formRelawan.telp.trim()) { toast.error('Nomor telepon wajib diisi!'); return; }
    setRelawanList(prev => [
      ...prev,
      { id: String(Date.now()), ...formRelawan, shift: formRelawan.shift.split(' ')[0], hadir: 0, izin: 0, alpha: 0 }
    ]);
    toast.sukses(`Relawan ${formRelawan.nama} berhasil ditambahkan!`);
    setFormRelawan({ nama: '', jabatan: 'Jurutama Masak', shift: 'Pagi (04:00–12:00)', telp: '', area: '' });
    setShowTambahRelawan(false);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">

      {/* ── MODAL CATAT ABSENSI ── */}
      {showAbsenForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-blue-50">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Calendar size={16} className="text-blue-600"/> Catat Absensi Hari Ini</h3>
                <p className="text-xs text-slate-500 mt-0.5">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <button onClick={() => setShowAbsenForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500 uppercase">
                    <th className="p-2 text-left font-medium">Nama Relawan</th>
                    <th className="p-2 text-center font-medium">Status</th>
                    <th className="p-2 text-center font-medium">Jam Masuk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {absensiData.map((a, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2 font-medium text-slate-800">{a.nama}</td>
                      <td className="p-2">
                        <div className="flex gap-1 justify-center">
                          {(['hadir','izin','alpha'] as const).map(s => (
                            <button key={s} onClick={() => setAbsensiData(prev => prev.map((x, idx) => idx === i ? {...x, status: s} : x))}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                a.status === s ?
                                  s === 'hadir' ? 'bg-emerald-500 text-white border-emerald-500' :
                                  s === 'izin'  ? 'bg-amber-500 text-white border-amber-500' :
                                  'bg-rose-500 text-white border-rose-500'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                              }`}
                            >{s === 'hadir' ? '✓ Hadir' : s === 'izin' ? 'Izin' : 'Alpha'}</button>
                          ))}
                        </div>
                      </td>
                      <td className="p-2">
                        <input type="time" defaultValue={a.jam_masuk !== '-' ? a.jam_masuk : ''}
                          disabled={a.status !== 'hadir'}
                          className="input text-xs text-center w-full disabled:opacity-40"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button onClick={() => setShowAbsenForm(false)} className="btn-ghost text-sm">Batal</button>
              <button onClick={handleSimpanAbsensi} className="btn-primary text-sm"><Save size={14}/> Simpan Absensi</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL TAMBAH RELAWAN ── */}
      {showTambahRelawan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-emerald-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><UserPlus size={16} className="text-emerald-600"/> Tambah Relawan Baru</h3>
              <button onClick={() => setShowTambahRelawan(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nama Lengkap *</label>
                <input className="input w-full" placeholder="Mis: Budi Santoso" value={formRelawan.nama} onChange={e => setFormRelawan(p => ({...p, nama: e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Jabatan *</label>
                  <select className="select w-full" value={formRelawan.jabatan} onChange={e => setFormRelawan(p => ({...p, jabatan: e.target.value}))}>
                    {JABATAN_OPTIONS.map(j => <option key={j}>{j}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Shift</label>
                  <select className="select w-full" value={formRelawan.shift} onChange={e => setFormRelawan(p => ({...p, shift: e.target.value}))}>
                    {SHIFT_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">No. Telepon/WA *</label>
                <input className="input w-full" placeholder="08..." value={formRelawan.telp} onChange={e => setFormRelawan(p => ({...p, telp: e.target.value}))} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Area Kerja</label>
                <input className="input w-full" placeholder="Mis: Dapur Utama, Distribusi..." value={formRelawan.area} onChange={e => setFormRelawan(p => ({...p, area: e.target.value}))} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button onClick={() => setShowTambahRelawan(false)} className="btn-ghost text-sm">Batal</button>
              <button onClick={handleTambahRelawan} className="btn-primary text-sm bg-emerald-600 border-emerald-600"><Save size={14}/> Simpan Relawan</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display text-xl font-semibold text-slate-900">Relawan & Absensi</h1>
          <p className="text-sm text-slate-500 mt-1">Manajemen SDM dan kehadiran relawan SPPG</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => navigate('/sdm/absensi-qr')}
            className="btn-ghost text-sm flex items-center gap-2 border border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <QrCode size={15}/> Absensi via QR
          </button>
          <button
            onClick={() => setShowAbsenForm(true)}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <CheckCircle2 size={16} /> Catat Absensi Manual
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2 mb-1"><Users size={16} className="text-blue-500" /><p className="text-xs text-slate-500 font-medium">Total Relawan</p></div>
          <p className="text-2xl font-bold text-slate-900">{totalRelawan}</p>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><CheckCircle size={11}/> {hadirHariIni} aktif hari ini</p>
        </div>
        <div className="card p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2 mb-1"><CheckCircle size={16} className="text-emerald-500" /><p className="text-xs text-slate-500 font-medium">Hadir Hari Ini</p></div>
          <p className="text-2xl font-bold text-emerald-600">{hadirHariIni}</p>
          <p className="text-xs text-slate-400 mt-1">dari {totalRelawan} relawan</p>
        </div>
        <div className="card p-4 border-l-4 border-l-amber-400">
          <div className="flex items-center gap-2 mb-1"><Clock size={16} className="text-amber-500" /><p className="text-xs text-slate-500 font-medium">Izin Hari Ini</p></div>
          <p className="text-2xl font-bold text-amber-600">{izinHariIni}</p>
          <p className="text-xs text-slate-400 mt-1">sudah konfirmasi</p>
        </div>
        <div className={`card p-4 border-l-4 ${alphaHariIni > 0 ? 'border-l-rose-500 bg-rose-50/30' : 'border-l-slate-200'}`}>
          <div className="flex items-center gap-2 mb-1"><AlertCircle size={16} className={alphaHariIni > 0 ? 'text-rose-500' : 'text-slate-400'} /><p className="text-xs text-slate-500 font-medium">Alpha / Tidak Hadir</p></div>
          <p className={`text-2xl font-bold ${alphaHariIni > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{alphaHariIni}</p>
          <p className="text-xs text-slate-400 mt-1">perlu konfirmasi</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 mb-6 overflow-x-auto">
        {[
          { id: 'absensi',  label: 'Absensi Hari Ini',  icon: ClipboardList },
          { id: 'relawan',  label: 'Data Relawan',       icon: Users },
          { id: 'insentif', label: 'Insentif Bulanan',   icon: Banknote },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`flex-1 py-2 px-4 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                activeTab === t.id ? 'bg-white text-blue-700 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={14} className={activeTab === t.id ? 'text-blue-500' : 'opacity-50'} />
              {t.label}
            </button>
          );
        })}
      </div>

        {/* TAB: ABSENSI */}
        {activeTab === 'absensi' && (
          <div className="card p-5 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" />
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-medium border border-emerald-200">
                Shift Pagi — 04:00 s.d. 12:00
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-widest font-black border-b border-slate-100">
                  <tr>
                    <th className="p-3">Nama Relawan</th>
                    <th className="p-3 text-center">Jam Masuk</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {absensiData.map((a, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-medium text-slate-800">{a.nama}</td>
                      <td className="p-3 text-slate-600 font-mono text-center">{a.jam_masuk}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                          a.status === 'hadir' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          a.status === 'izin'  ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}>
                          {a.status === 'hadir'
                            ? <><CheckCircle size={10}/> Hadir</>
                            : a.status === 'izin'
                            ? <><Clock size={10}/> Izin</>
                            : <><XCircle size={10}/> Alpha</>
                          }
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setAbsensiData(prev => prev.map((x, idx) =>
                              idx === i ? { ...x, status: x.status === 'hadir' ? 'alpha' : 'hadir' } : x
                            ));
                          }}
                          className="text-xs text-blue-600 font-medium hover:underline"
                        >Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-3 items-center justify-between">
              <div className="flex gap-4 text-sm">
                <span className="text-emerald-700 font-semibold flex items-center gap-1"><CheckCircle size={14}/> {hadirHariIni} Hadir</span>
                <span className="text-amber-700 font-semibold flex items-center gap-1"><Clock size={14}/> {izinHariIni} Izin</span>
                <span className="text-rose-700 font-semibold flex items-center gap-1"><AlertCircle size={14}/> {alphaHariIni} Alpha</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAbsenForm(true)} className="btn-secondary text-xs flex items-center gap-1.5"><Save size={14}/> Koreksi</button>
                <button
                  onClick={() => {
                    toast.sukses('Menyiapkan PDF', 'Laporan absensi harian dicetak');
                    window.print();
                  }}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  <Download size={14}/> Export Absensi PDF
                </button>
              </div>
            </div>
          </div>
        )}

      {/* TAB: DATA RELAWAN */}
      {activeTab === 'relawan' && (
        <div className="card p-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-3 mb-4 justify-between">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9 text-sm w-full" placeholder="Cari relawan..." />
            </div>
            <button onClick={() => setShowTambahRelawan(true)} className="btn-primary text-xs flex items-center gap-1.5">
              <UserPlus size={14} /> Tambah Relawan
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="p-3 font-medium">Nama & Jabatan</th>
                  <th className="p-3 font-medium">Shift</th>
                  <th className="p-3 font-medium">Area</th>
                  <th className="p-3 font-medium text-center">Hadir/Izin/Alpha</th>
                  <th className="p-3 font-medium">Telepon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <p className="font-semibold text-slate-800">{r.nama}</p>
                      <p className="text-xs text-slate-500">{r.jabatan}</p>
                    </td>
                    <td className="p-3 text-slate-600">{r.shift}</td>
                    <td className="p-3 text-slate-600">{r.area}</td>
                    <td className="p-3 text-center">
                      <span className="text-emerald-600 font-bold">{r.hadir}</span>
                      <span className="text-slate-300 mx-1">/</span>
                      <span className="text-amber-600 font-bold">{r.izin}</span>
                      <span className="text-slate-300 mx-1">/</span>
                      <span className="text-rose-600 font-bold">{r.alpha}</span>
                    </td>
                    <td className="p-3 text-slate-500 text-xs">{r.telp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: INSENTIF */}
      {activeTab === 'insentif' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Rekap Insentif — Mei 2026</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-1">Total Insentif Dibayarkan</p>
                <p className="text-xl font-bold text-blue-800">Rp 74.500.000</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium mb-1">Rata-rata per Relawan</p>
                <p className="text-xl font-bold text-slate-800">Rp 1.585.106</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium mb-1">Status Pembayaran</p>
                <p className="text-xl font-bold text-emerald-700 flex items-center gap-2"><CheckCircle2 size={18}/> Lunas</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-widest font-black border-b border-slate-100">
                  <tr>
                    <th className="p-3">Nama</th>
                    <th className="p-3 text-center">Hari Kerja</th>
                    <th className="p-3 text-right">Insentif Pokok</th>
                    <th className="p-3 text-right">Bonus Hadir</th>
                    <th className="p-3 text-right">Total</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_RELAWAN.map((r) => {
                    const pokok = 1200000;
                    const bonus = r.alpha === 0 ? 200000 : r.alpha === 1 ? 100000 : 0;
                    return (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-800">{r.nama}</td>
                        <td className="p-3 text-center text-slate-600">{r.hadir} hari</td>
                        <td className="p-3 text-right text-slate-600">Rp {pokok.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right text-emerald-600 font-medium">+Rp {bonus.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-bold text-slate-900">Rp {(pokok + bonus).toLocaleString('id-ID')}</td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wide">
                            <CheckCircle2 size={10}/> Lunas
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Integration link → Laporan Bulanan */}
            <div className="mt-5 p-4 bg-blue-50 border border-blue-100 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                  <FileText size={14}/> Data Insentif → Laporan Bulanan BGN
                </p>
                <p className="text-xs text-blue-600 mt-0.5">Insentif relawan terintegrasi ke Lampiran 30d-B & 30d-C (Laporan Bulanan).</p>
              </div>
              <button onClick={() => navigate('/laporan')} className="btn-primary text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0">
                Lihat Laporan <ArrowRight size={14}/>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
