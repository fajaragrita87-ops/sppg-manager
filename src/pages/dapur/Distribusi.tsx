import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useMasterDistribusi, useBuatManifest, useManifestAktif, useKonfirmasiTujuan, useSelesaikanManifest, useRiwayatDistribusi } from '@/hooks/useDistribusi';
import { formatTanggal } from '@/lib/utils';
import { toast } from '@/store/toastStore';
import { Truck, Navigation, History, Minus, Plus, Rocket, CheckCircle2, AlertCircle, Camera, CheckCircle, Clock } from 'lucide-react';

const TABS = [
  { id: 'buat', label: 'Buat Manifest', icon: Truck },
  { id: 'status', label: 'Update Status', icon: Navigation },
  { id: 'riwayat', label: 'Riwayat', icon: History },
];

export default function Distribusi() {
  const sppg = useAuthStore(s => s.sppg);
  const tglStr = new Date().toISOString().split('T')[0];
  const [tab, setTab] = useState('buat');

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5 animate-fade-in pb-12">
      
      {/* ─── HEADER ─── */}
      <div className="bg-white p-5 rounded-2xl border" style={{ borderColor: '#e2e8f0' }}>
        <h1 className="font-display text-xl font-semibold text-slate-900">Distribusi Hari Ini</h1>
        <p className="text-sm text-slate-500 mt-1">{formatTanggal(new Date())}</p>
      </div>

      {/* ─── TABS ─── */}
      <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
        {TABS.map(t => {
          const isActive = tab === t.id;
          const Icon = t.icon;
          return (
            <button 
              key={t.id} 
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all ${isActive ? 'bg-white text-blue-700 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Icon size={16} className={isActive ? 'text-blue-500' : 'opacity-50'} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ─── CONTENT ─── */}
      {tab === 'buat' && <TabBuatManifest sppgId={sppg?.id} tanggal={tglStr} setTab={setTab} />}
      {tab === 'status' && <TabUpdateStatus sppgId={sppg?.id} tanggal={tglStr} />}
      {tab === 'riwayat' && <TabRiwayat sppgId={sppg?.id} />}

    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// TAB 1: BUAT MANIFEST
// ════════════════════════════════════════════════════════════════════════════

function TabBuatManifest({ sppgId, tanggal, setTab }: any) {
  const { data, isLoading } = useMasterDistribusi(sppgId, tanggal);
  const buatMut = useBuatManifest();

  const [form, setForm] = useState({
    kendaraan_id: '',
    driver_id: '',
    batch_ke: 1,
    jam_berangkat: new Date().toTimeString().substring(0,5),
  });

  // State untuk tujuan (porsi aktual bisa diubah)
  const [tujuan, setTujuan] = useState<Record<string, number>>({});

  const handlePorsiChange = (id: string, delta: number, porsiRencana: number) => {
    setTujuan(prev => {
      const current = prev[id] !== undefined ? prev[id] : porsiRencana;
      return { ...prev, [id]: Math.max(0, current + delta) };
    });
  };

  const handleSubmit = async () => {
    if (!form.driver_id) return toast.error('Pilih driver terlebih dahulu');
    if (!data?.satdik?.length) return toast.error('Tidak ada tujuan satdik');

    try {
      const payloadTujuan = data.satdik.map((s: any) => ({
        satdik_id: s.id,
        porsi_rencana: s.siswa,
        porsi_aktual_bawa: tujuan[s.id] !== undefined ? tujuan[s.id] : s.siswa
      }));

      await buatMut.mutateAsync({ sppg_id: sppgId, tanggal, ...form, tujuan: payloadTujuan });
      toast.sukses('Manifest berhasil dibuat! Supir siap berangkat.');
      setTab('status');
    } catch { toast.error('Gagal membuat manifest'); }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-400">Memuat data operasional...</div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">Informasi Keberangkatan</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Kendaraan</label>
            <select value={form.kendaraan_id} onChange={e => setForm({...form, kendaraan_id: e.target.value})} className="select text-sm w-full">
              <option value="">-- Opsional --</option>
              {data?.kendaraan.map((k: any) => <option key={k.id} value={k.id}>{k.jenis} ({k.nopol})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Driver (Hadir Hari Ini)</label>
            <select value={form.driver_id} onChange={e => setForm({...form, driver_id: e.target.value})} className="select text-sm w-full">
              <option value="">Pilih Driver...</option>
              {data?.drivers.map((d: any) => <option key={d.id} value={d.id}>{d.nama}</option>)}
            </select>
            {data?.drivers.length === 0 && <p className="text-[10px] text-amber-600 mt-1">Belum ada driver yang absen hari ini.</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Batch Ke</label>
            <div className="flex gap-2">
              {[1, 2, 3].map(b => (
                <button key={b} onClick={() => setForm({...form, batch_ke: b})} className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${form.batch_ke === b ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                  B{b}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Rencana Berangkat</label>
            <input type="time" value={form.jam_berangkat} onChange={e => setForm({...form, jam_berangkat: e.target.value})} className="input text-sm w-full" />
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">Daftar Muatan Tujuan</h2>
        
        <div className="space-y-3 pt-2">
          {data?.satdik.map((s: any) => {
            const porsi = tujuan[s.id] !== undefined ? tujuan[s.id] : s.siswa;
            return (
              <div key={s.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-800">{s.nama}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Rencana: {s.siswa} porsi</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button onClick={() => handlePorsiChange(s.id, -1, s.siswa)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-600"><Minus size={14} /></button>
                  <div className="w-12 text-center text-sm font-bold text-slate-900">{porsi}</div>
                  <button onClick={() => handlePorsiChange(s.id, 1, s.siswa)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-600"><Plus size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={handleSubmit} disabled={buatMut.isPending} className="w-full btn-primary text-base py-3.5 shadow-md flex items-center justify-center gap-2 rounded-xl">
        {buatMut.isPending ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <Rocket size={20} />}
        Berangkat Sekarang
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 2: UPDATE STATUS
// ════════════════════════════════════════════════════════════════════════════

function TabUpdateStatus({ sppgId, tanggal }: any) {
  const { data: manifests = [], isLoading } = useManifestAktif(sppgId, tanggal);
  const konfirmMut = useKonfirmasiTujuan();
  const selesaiMut = useSelesaikanManifest();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ jam_tiba: '', nama_penerima: '', porsi_diterima: 0, qc_ok: true });

  if (isLoading) return <div className="p-8 text-center text-slate-400">Mencari manifest aktif...</div>;
  if (manifests.length === 0) return (
    <div className="card p-10 text-center">
      <Truck size={40} className="mx-auto text-slate-300 mb-3" />
      <p className="font-medium text-slate-700">Tidak ada pengiriman berjalan.</p>
      <p className="text-xs text-slate-500 mt-1">Buat manifest baru di tab sebelah untuk memulai.</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {manifests.map((m: any) => {
        const tujuan = m.tujuan || [];
        const totalTj = tujuan.length;
        const selesaiTj = tujuan.filter((t: any) => t.status === 'sampai').length;
        const isAllDone = totalTj > 0 && selesaiTj === totalTj;

        const handleExpand = (t: any) => {
          if (expandedId === t.id) { setExpandedId(null); return; }
          setExpandedId(t.id);
          setForm({
            jam_tiba: new Date().toTimeString().substring(0,5),
            nama_penerima: '',
            porsi_diterima: t.porsi_aktual_bawa,
            qc_ok: true
          });
        };

        const handleSimpanTujuan = async (tId: string) => {
          if (!form.nama_penerima) return toast.error('Nama penerima wajib diisi');
          try {
            await konfirmMut.mutateAsync({ tujuan_id: tId, ...form });
            setExpandedId(null);
            toast.sukses('Tujuan berhasil dikonfirmasi sampai');
          } catch { toast.error('Gagal konfirmasi'); }
        };

        const handleSelesaiManifest = async () => {
          try {
            await selesaiMut.mutateAsync(m.id);
            toast.sukses('Manifest pengiriman selesai!');
          } catch { toast.error('Gagal menyelesaikan manifest'); }
        };

        return (
          <div key={m.id} className="card p-5 border-blue-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="badge-info text-[10px] mb-1">Batch {m.batch_ke}</span>
                <h3 className="font-semibold text-slate-800">Driver: {m.driver?.nama || 'Unknown'}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Clock size={12} /> Berangkat {m.jam_berangkat?.substring(0,5)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 mb-1">Progress</p>
                <p className="text-lg font-bold text-blue-700">{selesaiTj} <span className="text-sm font-normal text-slate-400">/ {totalTj}</span></p>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full mb-5 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${(selesaiTj / totalTj) * 100}%` }} />
            </div>

            <div className="space-y-3">
              {tujuan.map((t: any) => {
                const isSampai = t.status === 'sampai';
                const isExpanded = expandedId === t.id;

                return (
                  <div key={t.id} className={`border rounded-xl transition-all ${isSampai ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                    <div onClick={() => !isSampai && handleExpand(t)} className={`p-4 flex items-center justify-between ${!isSampai ? 'cursor-pointer hover:bg-slate-50' : ''}`}>
                      <div>
                        <p className={`font-medium ${isSampai ? 'text-emerald-800 line-through opacity-80' : 'text-slate-800'}`}>{t.nama_satdik}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Bawa: {t.porsi_aktual_bawa} porsi</p>
                      </div>
                      {isSampai ? (
                        <div className="text-right flex flex-col items-end">
                          <CheckCircle2 size={20} className="text-emerald-500 mb-1" />
                          <span className="text-[10px] font-medium text-emerald-700">{t.jam_tiba?.substring(0,5)}</span>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center">
                          {isExpanded && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
                        </div>
                      )}
                    </div>

                    {/* Form Konfirmasi Inline */}
                    {isExpanded && !isSampai && (
                      <div className="px-4 pb-4 border-t border-slate-100 pt-3 animate-slide-down">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-[10px] font-medium text-slate-500 mb-1 block">Jam Tiba</label>
                            <input type="time" value={form.jam_tiba} onChange={e => setForm({...form, jam_tiba: e.target.value})} className="input text-xs" />
                          </div>
                          <div>
                            <label className="text-[10px] font-medium text-slate-500 mb-1 block">Porsi Diterima</label>
                            <input type="number" value={form.porsi_diterima} onChange={e => setForm({...form, porsi_diterima: parseInt(e.target.value)})} className="input text-xs" />
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <label className="text-[10px] font-medium text-slate-500 mb-1 block">Nama Penerima / PJ Satdik *</label>
                          <input type="text" value={form.nama_penerima} onChange={e => setForm({...form, nama_penerima: e.target.value})} className="input text-xs" placeholder="Nama..." />
                        </div>

                        <div className="mb-4">
                          <label className="text-[10px] font-medium text-slate-500 mb-1 block">Organoleptik di Lokasi</label>
                          <div className="flex gap-2">
                            <button onClick={() => setForm({...form, qc_ok: true})} className={`flex-1 py-1.5 text-xs font-medium rounded-lg border ${form.qc_ok ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>✅ Normal</button>
                            <button onClick={() => setForm({...form, qc_ok: false})} className={`flex-1 py-1.5 text-xs font-medium rounded-lg border ${!form.qc_ok ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>❌ Ada Masalah</button>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button className="btn-secondary px-3"><Camera size={16} /></button>
                          <button onClick={() => handleSimpanTujuan(t.id)} disabled={konfirmMut.isPending} className="flex-1 btn-success text-xs font-medium">✅ Konfirmasi Sampai</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tombol Selesaikan Manifest */}
            {isAllDone && (
              <button onClick={handleSelesaiManifest} disabled={selesaiMut.isPending} className="w-full mt-5 bg-emerald-600 text-white font-medium py-3 rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm animate-fade-in">
                <CheckCircle size={18} /> Selesaikan Shift Distribusi Ini
              </button>
            )}

          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 3: RIWAYAT
// ════════════════════════════════════════════════════════════════════════════

function TabRiwayat({ sppgId }: any) {
  const { data = [], isLoading } = useRiwayatDistribusi(sppgId);

  if (isLoading) return <div className="text-center p-8 text-slate-400">Memuat riwayat...</div>;
  if (data.length === 0) return <div className="text-center p-8 text-slate-400">Belum ada riwayat distribusi.</div>;

  return (
    <div className="card overflow-hidden animate-fade-in">
      <table className="table">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Batch & Driver</th>
            <th className="text-center">Jml Tujuan</th>
            <th className="text-right">Total Porsi</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((m: any) => (
            <tr key={m.id}>
              <td className="font-medium text-slate-800">{formatTanggal(new Date(m.tanggal))}</td>
              <td>
                <p className="text-sm font-medium text-slate-900">Batch {m.batch_ke}</p>
                <p className="text-[10px] text-slate-500">{m.driver?.nama}</p>
              </td>
              <td className="text-center text-slate-600">{m.jml_tujuan}</td>
              <td className="text-right font-medium text-slate-800">{m.total_porsi}</td>
              <td>
                {m.status === 'jalan' ? <span className="badge-warning text-[10px]">Sedang Jalan</span> :
                 m.ada_masalah ? <span className="badge-danger text-[10px]">Ada Kendala</span> :
                 <span className="badge-success text-[10px]">Tuntas</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
