import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Search, Clock, Save, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSaveQC, useQCRiwayat } from '@/hooks/useDapur';
import { formatTanggal } from '@/lib/utils';
import { toast } from '@/store/toastStore';
import AlertBanner from '@/components/ui/AlertBanner';

const PARAMS = [
  { key: 'warna', label: 'Warna Makanan' },
  { key: 'rasa', label: 'Rasa Makanan' },
  { key: 'aroma', label: 'Aroma Makanan' },
  { key: 'tekstur', label: 'Tekstur / Kematangan' },
] as const;

export default function QCOrganoleptik() {
  const navigate = useNavigate();
  const sppg = useAuthStore(s => s.sppg);
  
  const today = new Date();
  const tglStr = today.toISOString().split('T')[0];

  const { data: riwayat = [], isLoading: isLoadingRiwayat } = useQCRiwayat(sppg?.id);
  const saveMut = useSaveQC();
  const [localRiwayat, setLocalRiwayat] = useState<any[]>([]);

  const [form, setForm] = useState({
    lokasi: 'Dapur SPPG',
    jam: today.toTimeString().substring(0,5),
    batch_ke: 1,
    keterangan: ''
  });

  // State for parameters: true = Normal, false = Tidak Normal
  const [params, setParams] = useState<Record<string, boolean>>({
    warna: true, rasa: true, aroma: true, tekstur: true
  });

  const isSemuaNormal = Object.values(params).every(v => v === true);

  const setParam = (key: string, val: boolean) => {
    setParams(prev => ({ ...prev, [key]: val }));
  };

  const handleSimpan = async () => {
    if (!sppg) return;
    if (!isSemuaNormal && !form.keterangan) {
      toast.error('Keterangan masalah wajib diisi!');
      return;
    }
    const newRecord = {
      id: Date.now().toString(),
      sppg_id: sppg.id,
      tanggal: tglStr,
      lokasi: form.lokasi,
      jam_cek: form.jam,
      batch_ke: form.batch_ke,
      warna_ok: params.warna,
      rasa_ok: params.rasa,
      aroma_ok: params.aroma,
      tekstur_ok: params.tekstur,
      keterangan: form.keterangan || null,
      status: isSemuaNormal ? 'lolos' : 'tidak_lolos'
    };
    // Optimistic local update
    setLocalRiwayat(prev => [newRecord, ...prev]);
    toast.sukses(`QC Batch ${form.batch_ke} berhasil disimpan`);
    setParams({ warna: true, rasa: true, aroma: true, tekstur: true });
    setForm(prev => ({ ...prev, keterangan: '', batch_ke: prev.batch_ke < 3 ? prev.batch_ke + 1 : 1 }));
    // Try Supabase in background
    saveMut.mutateAsync(newRecord).catch(() => {});
  };

  // Merge local + server riwayat (local first, no duplicates)
  const allRiwayat = [
    ...localRiwayat,
    ...riwayat.filter((r: any) => !localRiwayat.find(lr => lr.id === r.id))
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in pb-10">
      
      {/* ─── HEADER ─── */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/dapur')} className="btn-ghost p-2 -ml-2" aria-label="Kembali"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="font-display text-xl font-semibold text-slate-900">QC Organoleptik</h1>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5"><FileText size={12} /> Sesuai Lampiran 22 BGN</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* ─── FORM QC ─── */}
        <div className="card p-5 space-y-5">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">Form Pengecekan Kualitas</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Lokasi Pengecekan</label>
              <select value={form.lokasi} onChange={e => setForm({...form, lokasi: e.target.value})} className="select text-sm w-full">
                <option value="Dapur SPPG">Dapur SPPG</option>
                <option value="Sekolah / Titik Distribusi">Sekolah / Titik Distribusi</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Waktu Cek</label>
              <div className="relative">
                <Clock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="time" value={form.jam} onChange={e => setForm({...form, jam: e.target.value})} className="input text-sm w-full pl-8" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Batch Produksi / Pengiriman Ke:</label>
            <div className="flex gap-2">
              {[1, 2, 3].map(b => (
                <button key={b} onClick={() => setForm({...form, batch_ke: b})} className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${form.batch_ke === b ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                  Batch {b}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-xs font-medium text-slate-500 block">Parameter Uji (Pilih jika ada masalah):</label>
            {PARAMS.map(p => {
              const isOk = params[p.key];
              return (
                <div key={p.key} className="flex bg-slate-50 rounded-xl p-1 border border-slate-200">
                  <button 
                    onClick={() => setParam(p.key, true)}
                    className={`flex-1 py-2.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all ${isOk ? 'bg-white shadow-sm text-emerald-700 border border-emerald-100' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <CheckCircle2 size={15} className={isOk ? 'text-emerald-500' : 'opacity-40'} /> {p.label} Normal
                  </button>
                  <button 
                    onClick={() => setParam(p.key, false)}
                    className={`flex-1 py-2.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all ${!isOk ? 'bg-white shadow-sm text-red-700 border border-red-100' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <XCircle size={15} className={!isOk ? 'text-red-500' : 'opacity-40'} /> Tidak Normal
                  </button>
                </div>
              );
            })}
          </div>

          {/* Alert & Keterangan if Not Normal */}
          <div className="pt-2 animate-slide-up" style={{ minHeight: '140px' }}>
            {isSemuaNormal ? (
              <div className="h-full flex flex-col items-center justify-center p-6 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800">
                <CheckCircle2 size={32} className="mb-2 text-emerald-500" />
                <p className="font-semibold text-lg">QC LOLOS</p>
                <p className="text-xs opacity-80 mt-1">Kualitas makanan memenuhi standar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AlertBanner type="danger" judul="QC TIDAK LOLOS" pesan="Tahan distribusi batch ini. Laporkan ke Ka.SPPG untuk tindak lanjut keamanan pangan." />
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Keterangan Masalah *</label>
                  <textarea value={form.keterangan} onChange={e => setForm({...form, keterangan: e.target.value})} className="input text-sm w-full py-2 border-red-200 focus:border-red-400" rows={2} placeholder="Jelaskan kondisi makanan yang tidak normal..." />
                </div>
              </div>
            )}
          </div>

          <button onClick={handleSimpan} disabled={saveMut.isPending} className={`w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 ${isSemuaNormal ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
            {saveMut.isPending ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Save size={16} />}
            Simpan Hasil QC
          </button>
        </div>

        {/* ─── RIWAYAT QC ─── */}
        <div className="card p-5 h-full">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-800">Riwayat QC Terakhir</h2>
            <Search size={16} className="text-slate-400" />
          </div>

          {isLoadingRiwayat ? (
            <div className="text-center p-10 text-slate-400 text-sm">Memuat riwayat...</div>
          ) : allRiwayat.length === 0 ? (
            <div className="text-center p-10 text-slate-400 text-sm">Belum ada riwayat QC.</div>
          ) : (
            <div className="space-y-2">
              {allRiwayat.map((r: any) => {
                const isLolos = r.status === 'lolos';
                return (
                  <div key={r.id} className="p-3 rounded-xl border flex items-center gap-3 transition-colors hover:bg-slate-50 cursor-pointer" style={{ borderColor: isLolos ? '#dcfce7' : '#fecaca', background: isLolos ? '#fff' : '#fef2f2' }}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isLolos ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {isLolos ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm font-semibold truncate ${isLolos ? 'text-emerald-800' : 'text-red-800'}`}>Batch {r.batch_ke}</p>
                        <p className="text-[10px] font-medium text-slate-500">{formatTanggal(new Date(r.tanggal))} {r.jam_cek?.substring(0,5)}</p>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 truncate">{r.lokasi}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
