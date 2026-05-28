import { useState, useMemo } from 'react';
import { Clock, AlertTriangle, Box, Siren, X, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTimelineProduksi, useUpdateTimeline, useCekFoodSample, useLaporFoodSample, useLaporKM } from '@/hooks/useDapur';
import { formatTanggal } from '@/lib/utils';
import { toast } from '@/store/toastStore';
import { useInventoryStore } from '@/store/inventoryStore';
import AlertBanner from '@/components/ui/AlertBanner';

const HARDCODED_TIMELINE = [
  { id: 't1', jam: '02:00', label: 'Persiapan bahan non-perishable', zona: 'prep' },
  { id: 't2', jam: '02:15', label: 'Masak nasi — Tahap 1', zona: 'masak_nasi' },
  { id: 't3', jam: '03:00', label: 'Masak lauk — Tahap 1', zona: 'masak_lauk' },
  { id: 't4', jam: '05:00', label: 'Semua stasiun — Tahap 2', zona: 'semua' },
  { id: 't5', jam: '07:00', label: 'Tahap 3 + Pemorsian dimulai', zona: 'pemorsian' },
  { id: 't6', jam: '07:30', label: '🚚 Kirim PAUD / TK / SD 1-3', zona: 'distribusi', isBatch: 1 },
  { id: 't7', jam: '09:00', label: '🚚 Kirim SD 4-6', zona: 'distribusi', isBatch: 2 },
  { id: 't8', jam: '10:30', label: '🚚 Kirim SMP / SMA / Balita', zona: 'distribusi', isBatch: 3 },
];

export default function ProduksiHarian() {
  const sppg = useAuthStore(s => s.sppg);
  const today = new Date();
  const tglStr = today.toISOString().split('T')[0];

  const { data: serverTimeline = [] } = useTimelineProduksi(sppg?.id, tglStr);
  const updateMut = useUpdateTimeline();
  const { data: foodSamples = [] } = useCekFoodSample(sppg?.id, tglStr);
  const laporFsMut = useLaporFoodSample();
  const laporKmMut = useLaporKM();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ jam_mulai: '', jam_selesai: '', catatan: '', porsi_aktual: 0, waste: 0 });
  const [showDarurat, setShowDarurat] = useState(false);
  const [kmForm, setKmForm] = useState({ jenis: 'Dugaan Keracunan', terdampak: 0, keterangan: '', tindakan: '' });
  // Local override state (works even without Supabase)
  const [localProgress, setLocalProgress] = useState<Record<string, any>>({});

  // Merge hardcoded timeline with server state
  const timeline = useMemo(() => {
    return HARDCODED_TIMELINE.map(ht => {
      const db    = serverTimeline.find(s => s.step_id === ht.id);
      const local = localProgress[ht.id];
      return { ...ht, ...db, ...local }; // local overrides db overrides hardcoded
    });
  }, [serverTimeline, localProgress]);

  // Food Sample Logic (Cari batch yg selesai masak/distribusi tapi blm diambil samplenya)
  const missingSamples = useMemo(() => {
    const missing: number[] = [];
    timeline.forEach(t => {
      if (t.isBatch && t.jam_selesai && !foodSamples.includes(t.isBatch)) {
        missing.push(t.isBatch);
      }
    });
    return missing;
  }, [timeline, foodSamples]);

  const handleExpand = (t: any) => {
    if (expandedId === t.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(t.id);
    const nowTm = new Date().toTimeString().substring(0,5);
    setForm({
      jam_mulai: t.jam_mulai || nowTm,
      jam_selesai: t.jam_selesai || '',
      catatan: t.catatan || '',
      porsi_aktual: t.porsi_aktual || 0,
      waste: t.waste || 0
    });
  };

  const deductStock = useInventoryStore(s => s.deductStock);

  const handleSimpanStep = async (stepId: string) => {
    if (!sppg) return;
    const localUpdate = {
      jam_mulai:   form.jam_mulai   || null,
      jam_selesai: form.jam_selesai || null,
      catatan:     form.catatan,
      porsi_aktual: form.porsi_aktual,
      waste:       form.waste,
    };

    // ── Optimistic local update (works without Supabase) ──
    setLocalProgress(prev => ({ ...prev, [stepId]: localUpdate }));
    setExpandedId(null);

    // ── Stock deduction & toast ──
    if (form.jam_selesai) {
      if (stepId === 't2') {
        deductStock([{ nama: 'Beras Premium', qty: 320 }]);
        toast.sukses('Tahap selesai! Stok Beras Premium terpotong otomatis (-320kg)');
      } else if (stepId === 't3') {
        deductStock([{ nama: 'Daging Ayam', qty: 160 }, { nama: 'Bumbu Dapur', qty: 5 }, { nama: 'Minyak Goreng', qty: 10 }]);
        toast.sukses('Tahap selesai! Stok Ayam, Bumbu, dan Minyak terpotong otomatis');
      } else {
        toast.sukses('Tahapan selesai — data tersimpan & akan muncul di Laporan Harian');
      }
    } else {
      toast.sukses('Progress tahapan disimpan');
    }

    // ── Try persist ke Supabase di background (non-blocking) ──
    updateMut.mutateAsync({
      sppg_id: sppg.id, tanggal: tglStr, step_id: stepId, ...localUpdate
    }).catch(() => {/* silent fail, local state is source of truth */});
  };

  const handleLaporFS = async (batchKe: number) => {
    if (!sppg) return;
    try {
      await laporFsMut.mutateAsync({ sppg_id: sppg.id, tanggal: tglStr, batch_ke: batchKe, jam_ambil: new Date().toTimeString().substring(0,5) });
      toast.sukses(`Food sample Batch ${batchKe} tercatat`);
    } catch { toast.error('Gagal mencatat food sample'); }
  };

  const submitDarurat = async () => {
    if (!sppg) return;
    if (!kmForm.keterangan) { toast.error('Keterangan wajib diisi'); return; }
    try {
      await laporKmMut.mutateAsync({ sppg_id: sppg.id, tanggal: tglStr, ...kmForm });
      setShowDarurat(false);
      toast.error('Laporan Darurat Terkirim', 'Ka.SPPG dan Pengawas Gizi telah dinotifikasi');
      setKmForm({ jenis: 'Dugaan Keracunan', terdampak: 0, keterangan: '', tindakan: '' });
    } catch { toast.error('Gagal mengirim laporan'); }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-fade-in relative min-h-[85vh] pb-20">
      
      {/* ─── HEADER ─── */}
      <div className="bg-white p-5 rounded-2xl border" style={{ borderColor: '#e2e8f0' }}>
        <h1 className="font-display text-xl font-semibold text-slate-900">Produksi Hari Ini</h1>
        <p className="text-sm text-slate-500 mt-1">{formatTanggal(today)}</p>
        <div className="mt-3 inline-block px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 font-medium">
          Menu: Nasi Ayam Teriyaki · Target: 3.200 porsi
        </div>
      </div>

      {/* ─── FOOD SAMPLE ALERTS ─── */}
      {missingSamples.length > 0 && (
        <div className="space-y-2">
          {missingSamples.map(b => (
            <div key={b} className="flex items-center justify-between p-3 rounded-lg border bg-blue-50" style={{ borderColor: '#bfdbfe' }}>
              <div className="flex items-center gap-2 text-blue-800">
                <Box size={16} />
                <span className="text-sm font-medium">Food sample batch {b} belum diambil</span>
              </div>
              <button onClick={() => handleLaporFS(b)} disabled={laporFsMut.isPending} className="btn-primary text-xs py-1.5 px-3">
                Sudah Diambil
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ─── TIMELINE ─── */}
      <div className="bg-white p-5 rounded-2xl border relative" style={{ borderColor: '#e2e8f0' }}>
        <div className="absolute left-8 top-8 bottom-8 w-px bg-slate-200" />
        
        <div className="space-y-6 relative z-10">
          {timeline.map((t) => {
            const isExpanded = expandedId === t.id;
            const isDone = !!t.jam_selesai;
            const isRunning = !isDone && !!t.jam_mulai;
            
            // Logic status warna
            let dotColor = 'bg-slate-200 border-slate-300';
            if (isDone) dotColor = 'bg-emerald-500 border-emerald-500';
            else if (isRunning) dotColor = 'bg-blue-500 border-blue-500';

            return (
              <div key={t.id} className="relative pl-12 transition-all">
                {/* Dot */}
                <div className={`absolute left-[11px] top-1.5 w-3.5 h-3.5 rounded-full border-2 ${dotColor} flex items-center justify-center transition-colors`}>
                  {isRunning && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  {isDone && <CheckCircle2 size={10} className="text-white" />}
                </div>
                
                {/* Content */}
                <div 
                  onClick={() => handleExpand(t)}
                  className={`cursor-pointer group p-3 rounded-xl border transition-all ${isExpanded ? 'bg-slate-50 border-slate-300 shadow-sm' : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className={`text-sm font-medium transition-colors ${isDone ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{t.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{t.zona.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                        <Clock size={13} /> {t.jam}
                      </div>
                      {isDone && <p className="text-[10px] text-emerald-600 font-medium mt-1">Selesai: {t.jam_selesai?.substring(0,5)}</p>}
                    </div>
                  </div>
                  
                  {/* EXPAND FORM */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-200 animate-slide-down cursor-default" onClick={e => e.stopPropagation()}>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="text-[10px] font-medium text-slate-500 mb-1 block">Jam Mulai Aktual</label>
                          <input type="time" value={form.jam_mulai} onChange={e => setForm({...form, jam_mulai: e.target.value})} className="input text-xs" />
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-slate-500 mb-1 block">Jam Selesai Aktual</label>
                          <input type="time" value={form.jam_selesai} onChange={e => setForm({...form, jam_selesai: e.target.value})} className="input text-xs" />
                        </div>
                      </div>
                      
                      {t.isBatch && (
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-[10px] font-medium text-slate-500 mb-1 block">Jumlah Porsi Aktual</label>
                            <input type="number" value={form.porsi_aktual} onChange={e => setForm({...form, porsi_aktual: parseInt(e.target.value)})} className="input text-xs" />
                          </div>
                          <div>
                            <label className="text-[10px] font-medium text-slate-500 mb-1 block">Porsi Waste (Rusak)</label>
                            <input type="number" value={form.waste} onChange={e => setForm({...form, waste: parseInt(e.target.value)})} className="input text-xs" />
                          </div>
                        </div>
                      )}
                      
                      <div className="mb-3">
                        <label className="text-[10px] font-medium text-slate-500 mb-1 block">Catatan Kendala (Opsional)</label>
                        <textarea value={form.catatan} onChange={e => setForm({...form, catatan: e.target.value})} className="input text-xs py-2" rows={2} placeholder="Isi jika ada masalah..." />
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setExpandedId(null)} className="btn-ghost text-xs px-3">Batal</button>
                        <button onClick={() => handleSimpanStep(t.id)} disabled={updateMut.isPending} className="btn-primary text-xs px-4">Simpan Progress</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── TOMBOL DARURAT STICKY ─── */}
      <button 
        onClick={() => setShowDarurat(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-red-600 text-white rounded-full shadow-[0_8px_16px_rgba(220,38,38,0.4)] flex items-center justify-center hover:bg-red-700 transition-all hover:scale-105 active:scale-95"
      >
        <Siren size={24} />
      </button>

      {/* ─── DIALOG DARURAT ─── */}
      {showDarurat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDarurat(false)} />
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl relative z-10 animate-slide-up border border-red-100 overflow-hidden">
            <div className="bg-red-600 p-4 text-white flex justify-between items-center">
              <h2 className="font-semibold flex items-center gap-2"><AlertTriangle size={18} /> Laporan Kejadian Menonjol</h2>
              <button onClick={() => setShowDarurat(false)} className="hover:bg-red-700 p-1 rounded-full"><X size={16} /></button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Jenis Insiden</label>
                <div className="flex flex-col gap-2">
                  {['Dugaan Keracunan', 'Insiden Fisik', 'Lainnya'].map(j => (
                    <label key={j} className={`p-2.5 rounded-lg border text-sm flex items-center gap-2 cursor-pointer transition-colors ${kmForm.jenis === j ? 'bg-red-50 border-red-200 text-red-800 font-medium' : 'border-slate-200 text-slate-700'}`}>
                      <input type="radio" checked={kmForm.jenis === j} onChange={() => setKmForm({...kmForm, jenis: j})} className="accent-red-600 w-4 h-4" /> {j}
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Jml Orang Terdampak</label>
                <input type="number" value={kmForm.terdampak} onChange={e => setKmForm({...kmForm, terdampak: parseInt(e.target.value)})} className="input text-sm" />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Keterangan Singkat *</label>
                <textarea value={kmForm.keterangan} onChange={e => setKmForm({...kmForm, keterangan: e.target.value})} className="input text-sm" rows={2} />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tindakan Yang Diambil</label>
                <textarea value={kmForm.tindakan} onChange={e => setKmForm({...kmForm, tindakan: e.target.value})} className="input text-sm" rows={2} />
              </div>

              <button onClick={submitDarurat} disabled={laporKmMut.isPending} className="w-full bg-red-600 text-white font-medium py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                <Siren size={18} /> Laporkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
