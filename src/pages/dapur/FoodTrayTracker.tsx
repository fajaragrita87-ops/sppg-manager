import { useState } from 'react';
import { Package, CheckCircle2, Clock, AlertTriangle, XCircle, Save, History, MessageCircle } from 'lucide-react';
import { toast } from '@/store/toastStore';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_TRAY_HARI_INI = [
  { id: '1', satdik: 'SDN 01 Menteng', porsi: 350, tray_keluar: 350, tray_kembali: 350, tray_rusak: 0, tray_hilang: 0, status: 'kembali', waktu_kirim: '07:30', waktu_kembali: '12:15', catatan: '' },
  { id: '2', satdik: 'SDN 02 Cikini', porsi: 280, tray_keluar: 280, tray_kembali: 278, tray_rusak: 1, tray_hilang: 1, status: 'kembali', waktu_kirim: '07:30', waktu_kembali: '12:30', catatan: '1 baki pecah, 1 hilang' },
  { id: '3', satdik: 'SMPN 05 Gambir', porsi: 420, tray_keluar: 420, tray_kembali: 0, tray_rusak: 0, tray_hilang: 0, status: 'menunggu', waktu_kirim: '07:45', waktu_kembali: '', catatan: '' },
  { id: '4', satdik: 'SDN 03 Sawah Besar', porsi: 200, tray_keluar: 200, tray_kembali: 0, tray_rusak: 0, tray_hilang: 0, status: 'terlambat', waktu_kirim: '07:15', waktu_kembali: '', catatan: '' },
  { id: '5', satdik: 'SMPN 12 Senen', porsi: 380, tray_keluar: 380, tray_kembali: 380, tray_rusak: 0, tray_hilang: 0, status: 'kembali', waktu_kirim: '08:00', waktu_kembali: '13:00', catatan: '' },
];

const MOCK_RIWAYAT = [
  { tanggal: '2026-05-15', keluar: 1630, kembali: 1620, rusak: 3, hilang: 7 },
  { tanggal: '2026-05-14', keluar: 1580, kembali: 1575, rusak: 2, hilang: 3 },
  { tanggal: '2026-05-13', keluar: 1600, kembali: 1600, rusak: 0, hilang: 0 },
  { tanggal: '2026-05-12', keluar: 1550, kembali: 1540, rusak: 5, hilang: 5 },
  { tanggal: '2026-05-11', keluar: 1620, kembali: 1618, rusak: 1, hilang: 1 },
  { tanggal: '2026-05-10', keluar: 1590, kembali: 1590, rusak: 0, hilang: 0 },
  { tanggal: '2026-05-09', keluar: 1610, kembali: 1605, rusak: 2, hilang: 3 },
];

const HARGA_PER_BAKI = 15000;

export default function FoodTrayTracker() {
  const [tab, setTab] = useState<'harian' | 'riwayat'>('harian');
  const [data, setData] = useState(MOCK_TRAY_HARI_INI);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ kembali: 0, rusak: 0, hilang: 0, waktu: '', catatan: '' });

  const totalKeluar = data.reduce((a, d) => a + d.tray_keluar, 0);
  const totalKembali = data.reduce((a, d) => a + d.tray_kembali, 0);
  const totalBelum = totalKeluar - totalKembali;
  const belumKembali = data.filter(d => d.status !== 'kembali');

  const handleExpand = (item: typeof MOCK_TRAY_HARI_INI[0]) => {
    if (expandedId === item.id) { setExpandedId(null); return; }
    setExpandedId(item.id);
    setForm({ kembali: item.tray_keluar, rusak: 0, hilang: 0, waktu: new Date().toTimeString().substring(0, 5), catatan: '' });
  };

  const handleKonfirmasi = (id: string) => {
    setData(prev => prev.map(d => d.id === id ? {
      ...d,
      tray_kembali: form.kembali,
      tray_rusak: form.rusak,
      tray_hilang: form.hilang,
      status: 'kembali',
      waktu_kembali: form.waktu,
      catatan: form.catatan,
    } : d));
    setExpandedId(null);
    toast.sukses('Food tray dikonfirmasi kembali!');
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'kembali': return <span className="badge-success text-[10px] flex items-center gap-1 w-max"><CheckCircle2 size={10} /> Kembali</span>;
      case 'menunggu': return <span className="badge-warning text-[10px] flex items-center gap-1 w-max"><Clock size={10} /> Menunggu</span>;
      case 'terlambat': return <span className="badge-danger text-[10px] flex items-center gap-1 w-max"><AlertTriangle size={10} /> Terlambat</span>;
      default: return <span className="badge-neutral text-[10px]">{s}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5 animate-fade-in pb-12">
      <div className="bg-white p-5 rounded-2xl border" style={{ borderColor: '#e2e8f0' }}>
        <h1 className="font-display text-xl font-semibold text-slate-900">Tracker Food Tray (Ompreng)</h1>
        <p className="text-sm text-slate-500 mt-1">Pantau food tray yang keluar dan kembali setiap hari</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Baki Keluar</p><p className="text-2xl font-black text-blue-700 mt-1">{totalKeluar}</p></div>
        <div className="card p-4 text-center"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Baki Kembali</p><p className="text-2xl font-black text-emerald-600 mt-1">{totalKembali}</p></div>
        <div className={`card p-4 text-center ${totalBelum > 0 ? 'border-red-200 bg-red-50' : ''}`}><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Belum Kembali</p><p className={`text-2xl font-black mt-1 ${totalBelum > 0 ? 'text-red-600' : 'text-slate-400'}`}>{totalBelum}</p></div>
      </div>

      {/* Alert */}
      {belumKembali.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-900">⚠️ {belumKembali.length} satdik belum mengembalikan food tray</p>
            <div className="mt-2 space-y-1">
              {belumKembali.map(b => (
                <div key={b.id} className="flex items-center justify-between text-xs">
                  <span className="text-amber-800 font-medium">{b.satdik} ({b.tray_keluar} baki)</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setTab('harian'); handleExpand(b); setTimeout(() => document.getElementById('inline-form-'+b.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }}
                      className="text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 hover:bg-blue-100"
                    >✓ Konfirmasi</button>
                    <button className="text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 hover:bg-green-100"><MessageCircle size={10} /> WA</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
        <button onClick={() => setTab('harian')} className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all ${tab === 'harian' ? 'bg-white text-blue-700 shadow-sm border border-slate-100' : 'text-slate-500'}`}><Package size={16} /> Hari Ini</button>
        <button onClick={() => setTab('riwayat')} className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all ${tab === 'riwayat' ? 'bg-white text-blue-700 shadow-sm border border-slate-100' : 'text-slate-500'}`}><History size={16} /> Riwayat 7 Hari</button>
      </div>

      {/* Tab: Hari Ini */}
      {tab === 'harian' && (
        <div className="card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3 font-medium">Satuan Pendidikan</th>
                  <th className="p-3 font-medium text-center">Dikirim</th>
                  <th className="p-3 font-medium text-center">Kembali</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-center">Waktu</th>
                  <th className="p-3 font-medium">Kondisi</th>
                  <th className="p-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map(d => (
                  <tr key={d.id}>
                    <td className="p-3"><p className="font-medium text-slate-800">{d.satdik}</p></td>
                    <td className="p-3 text-center font-bold text-slate-700">{d.tray_keluar}</td>
                    <td className="p-3 text-center font-bold">{d.status === 'kembali' ? <span className="text-emerald-600">{d.tray_kembali}</span> : <span className="text-slate-300">—</span>}</td>
                    <td className="p-3">{getStatusBadge(d.status)}</td>
                    <td className="p-3 text-center text-xs text-slate-500">{d.waktu_kembali || '—'}</td>
                    <td className="p-3">
                      {d.status === 'kembali' ? (
                        d.tray_rusak > 0 || d.tray_hilang > 0
                          ? <span className="text-xs text-amber-700 font-medium">{d.tray_rusak > 0 ? `${d.tray_rusak} rusak` : ''}{d.tray_rusak > 0 && d.tray_hilang > 0 ? ', ' : ''}{d.tray_hilang > 0 ? `${d.tray_hilang} hilang` : ''}</span>
                          : <span className="text-xs text-emerald-600 font-medium">Baik Semua</span>
                      ) : <span className="text-xs text-slate-300">—</span>}
                    </td>
                    <td className="p-3 text-right">
                      {d.status !== 'kembali' && (
                        <button onClick={() => handleExpand(d)} className="btn-primary text-[10px] py-1 px-2.5">Konfirmasi</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Inline form */}
          {expandedId && (
            <div className="p-4 bg-blue-50 border-t border-blue-100 animate-slide-down">
              <p className="text-xs font-bold text-blue-800 mb-3">Konfirmasi Pengembalian — {data.find(d => d.id === expandedId)?.satdik}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div><label className="text-[10px] text-slate-500 mb-1 block">Baki Kembali</label><input type="number" value={form.kembali} onChange={e => setForm({ ...form, kembali: +e.target.value })} className="input text-sm w-full" /></div>
                <div><label className="text-[10px] text-slate-500 mb-1 block">Rusak</label><input type="number" value={form.rusak} onChange={e => setForm({ ...form, rusak: +e.target.value })} className="input text-sm w-full" min={0} /></div>
                <div><label className="text-[10px] text-slate-500 mb-1 block">Hilang</label><input type="number" value={form.hilang} onChange={e => setForm({ ...form, hilang: +e.target.value })} className="input text-sm w-full" min={0} /></div>
                <div><label className="text-[10px] text-slate-500 mb-1 block">Waktu Kembali</label><input type="time" value={form.waktu} onChange={e => setForm({ ...form, waktu: e.target.value })} className="input text-sm w-full" /></div>
              </div>
              <div className="mb-3"><label className="text-[10px] text-slate-500 mb-1 block">Catatan (Opsional)</label><input type="text" value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })} className="input text-sm w-full" placeholder="Mis: 1 baki pecah saat distribusi" /></div>
              <div className="flex gap-2">
                <button onClick={() => handleKonfirmasi(expandedId)} className="btn-primary text-xs py-2 flex items-center gap-1.5"><Save size={14} /> Simpan</button>
                <button onClick={() => setExpandedId(null)} className="btn-ghost text-xs">Batal</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Riwayat */}
      {tab === 'riwayat' && (
        <div className="card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3 font-medium">Tanggal</th>
                  <th className="p-3 font-medium text-center">Keluar</th>
                  <th className="p-3 font-medium text-center">Kembali</th>
                  <th className="p-3 font-medium text-center">Rusak</th>
                  <th className="p-3 font-medium text-center">Hilang</th>
                  <th className="p-3 font-medium text-right">Est. Kerugian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_RIWAYAT.map(r => (
                  <tr key={r.tanggal}>
                    <td className="p-3 font-medium text-slate-800">{new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</td>
                    <td className="p-3 text-center text-slate-600">{r.keluar}</td>
                    <td className="p-3 text-center text-emerald-600 font-medium">{r.kembali}</td>
                    <td className="p-3 text-center">{r.rusak > 0 ? <span className="text-amber-600 font-bold">{r.rusak}</span> : <span className="text-slate-300">0</span>}</td>
                    <td className="p-3 text-center">{r.hilang > 0 ? <span className="text-red-600 font-bold">{r.hilang}</span> : <span className="text-slate-300">0</span>}</td>
                    <td className="p-3 text-right">{r.hilang > 0 ? <span className="font-bold text-red-600">Rp {(r.hilang * HARGA_PER_BAKI).toLocaleString('id-ID')}</span> : <span className="text-slate-300">—</span>}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td className="p-3 font-bold text-slate-700">Total 7 Hari</td>
                  <td className="p-3 text-center font-bold text-slate-700">{MOCK_RIWAYAT.reduce((a, r) => a + r.keluar, 0)}</td>
                  <td className="p-3 text-center font-bold text-emerald-600">{MOCK_RIWAYAT.reduce((a, r) => a + r.kembali, 0)}</td>
                  <td className="p-3 text-center font-bold text-amber-600">{MOCK_RIWAYAT.reduce((a, r) => a + r.rusak, 0)}</td>
                  <td className="p-3 text-center font-bold text-red-600">{MOCK_RIWAYAT.reduce((a, r) => a + r.hilang, 0)}</td>
                  <td className="p-3 text-right font-black text-red-700">Rp {(MOCK_RIWAYAT.reduce((a, r) => a + r.hilang, 0) * HARGA_PER_BAKI).toLocaleString('id-ID')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
