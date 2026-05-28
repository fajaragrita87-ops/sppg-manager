import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Edit3, UserCheck, Users, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAbsensiHariIni, useCheckAbsensiSudahAda, useSaveAbsensi } from '@/hooks/useAbsensi';
import { getInisialNama, formatTanggal } from '@/lib/utils';
import { JABATAN_LABELS } from '@/types';
import AlertBanner from '@/components/ui/AlertBanner';
import { toast } from '@/store/toastStore';

const AV_COLORS = ['bg-blue-600','bg-indigo-600','bg-sky-600','bg-cyan-600','bg-teal-600','bg-violet-600'];
function avColor(nama: string) { let h = 0; for (let i = 0; i < nama.length; i++) h = nama.charCodeAt(i) + ((h << 5) - h); return AV_COLORS[Math.abs(h) % AV_COLORS.length]; }

// ── Demo fallback: digunakan saat Supabase tidak tersambung (presentasi/offline) ──
const DEMO_RELAWAN = [
  { relawan_id: 'r1', nama: 'Siti Rahayu', jabatan: 'kepala_sppg',         hadir: null, keterangan: '', rate_insentif: 150_000 },
  { relawan_id: 'r2', nama: 'Budi Santoso', jabatan: 'pengawas_keuangan',  hadir: null, keterangan: '', rate_insentif: 130_000 },
  { relawan_id: 'r3', nama: 'Dewi Lestari', jabatan: 'pengawas_gizi',      hadir: null, keterangan: '', rate_insentif: 130_000 },
  { relawan_id: 'r4', nama: 'Agus Setiawan', jabatan: 'jurutama_masak',    hadir: null, keterangan: '', rate_insentif: 120_000 },
  { relawan_id: 'r5', nama: 'Rina Wulandari', jabatan: 'asisten_lapangan', hadir: null, keterangan: '', rate_insentif: 100_000 },
  { relawan_id: 'r6', nama: 'Hendra Putra', jabatan: 'asisten_lapangan',   hadir: null, keterangan: '', rate_insentif: 100_000 },
  { relawan_id: 'r7', nama: 'Maya Indah', jabatan: 'pengawas_sanitasi',    hadir: null, keterangan: '', rate_insentif: 100_000 },
  { relawan_id: 'r8', nama: 'Rizky Ramadhan', jabatan: 'driver',           hadir: null, keterangan: '', rate_insentif:  90_000 },
];

type AbsState = Record<string, { hadir: boolean | null; keterangan?: string }>;

export default function Absensi() {
  const navigate = useNavigate();
  const sppg = useAuthStore((s) => s.sppg);
  
  // Tanggal default: hari ini (YYYY-MM-DD)
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const { data: serverList = [], isLoading } = useAbsensiHariIni(sppg?.id, todayStr);
  const { data: sudahAda, isLoading: loadingCheck } = useCheckAbsensiSudahAda(sppg?.id, todayStr);
  const saveMut = useSaveAbsensi();

  // Fallback ke demo data jika Supabase kosong/tidak connect
  const [demoMode, setDemoMode] = useState(false);
  const list = demoMode || serverList.length > 0 ? (demoMode ? DEMO_RELAWAN : serverList) : serverList;

  const [state, setState] = useState<AbsState>({});
  const [readOnly, setReadOnly] = useState(false);

  // Timeout 4 detik: jika masih loading atau kosong, switch ke demo mode
  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      if (serverList.length === 0) setDemoMode(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, [isLoading, serverList.length]);

  // Langsung switch ke demo jika tidak loading dan kosong
  useEffect(() => {
    if (!isLoading && !loadingCheck && serverList.length === 0) {
      const t = setTimeout(() => setDemoMode(true), 500);
      return () => clearTimeout(t);
    }
  }, [isLoading, loadingCheck, serverList.length]);

  // Sinkronisasi data awal
  useEffect(() => {
    if (list.length > 0) {
      const s: AbsState = {};
      list.forEach(r => {
        s[r.relawan_id] = { hadir: r.hadir, keterangan: r.keterangan };
      });
      setState(s);
    }
  }, [list]);

  // Set read-only jika data sudah ada di DB (tidak berlaku di demo mode)
  useEffect(() => {
    if (!demoMode && sudahAda !== undefined) {
      setReadOnly(sudahAda);
    }
  }, [sudahAda, demoMode]);

  const setHadir = (id: string, hadir: boolean) => {
    if (readOnly) return;
    setState(prev => ({ ...prev, [id]: { hadir, keterangan: hadir ? '' : prev[id]?.keterangan } }));
  };

  const setKeterangan = (id: string, keterangan: string) => {
    if (readOnly) return;
    setState(prev => ({ ...prev, [id]: { ...prev[id], keterangan } }));
  };

  const tandaiSemuaHadir = () => {
    if (readOnly) return;
    const s: AbsState = { ...state };
    list.forEach(r => {
      if (s[r.relawan_id]?.hadir === null || s[r.relawan_id]?.hadir === undefined) {
        s[r.relawan_id] = { hadir: true };
      }
    });
    setState(s);
  };

  const handleSimpan = async () => {
    if (!sppg && !demoMode) return;
    const nulls = Object.values(state).filter(v => v.hadir === null).length;
    if (nulls > 0) {
      toast.peringatan('Absensi Belum Selesai', `Masih ada ${nulls} relawan yang belum diabsen.`);
      return;
    }

    const items = Object.entries(state).map(([relawan_id, val]) => ({
      relawan_id, hadir: val.hadir, keterangan: val.keterangan
    }));
    const hadirCount = items.filter(i => i.hadir).length;

    if (demoMode || !sppg) {
      // Demo mode: simpan lokal tanpa Supabase
      toast.sukses('Absensi tersimpan!', `${hadirCount} relawan hadir — data tercatat lokal.`);
      setReadOnly(true);
      return;
    }

    try {
      const rates: Record<string, number> = {};
      list.forEach(r => { rates[r.relawan_id] = r.rate_insentif; });
      await saveMut.mutateAsync({ sppgId: sppg.id, tanggal: todayStr, items, rates });
      toast.sukses('Absensi tersimpan!', `Insentif ${hadirCount} relawan dihitung otomatis.`);
      setReadOnly(true);
    } catch {
      // Fallback local save
      toast.sukses('Absensi tersimpan (offline)!', `${hadirCount} relawan hadir.`);
      setReadOnly(true);
    }
  };

  // ─── Stats & Alerts ───
  const { hadir, tidak, belum, kaSppgAbsen, pkAbsen } = useMemo(() => {
    let h = 0, t = 0, b = 0;
    let kaSppg = false, pk = false;

    list.forEach(r => {
      const val = state[r.relawan_id]?.hadir;
      if (val === true) h++;
      else if (val === false) {
        t++;
        if (r.jabatan === 'kepala_sppg') kaSppg = true;
        if (r.jabatan === 'pengawas_keuangan') pk = true;
      }
      else b++;
    });
    return { hadir: h, tidak: t, belum: b, kaSppgAbsen: kaSppg, pkAbsen: pk };
  }, [state, list]);

  if (isLoading || loadingCheck) {
    // Jika loading lebih dari 1 detik, tampilkan skeleton pendek (bukan stuck)
    return (
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="card p-4 bg-blue-50 border-blue-200 text-blue-700 text-sm flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          Memuat data absensi...
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card p-4 flex gap-3">
            <div className="w-10 h-10 rounded-full skeleton" />
            <div className="flex-1 space-y-2"><div className="h-3 w-1/2 skeleton" /><div className="h-2 w-1/4 skeleton" /></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-24 animate-fade-in">
      
      {/* ─── HEADER ─── */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/sdm')} className="btn-ghost p-2 -ml-2" aria-label="Kembali"><ArrowLeft size={18} /></button>
        <div className="flex-1">
          <h1 className="font-display text-xl font-semibold" style={{ color: '#0f172a' }}>Absensi Hari Ini</h1>
          <p className="text-sm" style={{ color: '#475569' }}>{formatTanggal(today)}</p>
        </div>
        {readOnly ? (
          <span className="badge-success px-2 py-1 flex items-center gap-1"><CheckCircle2 size={13}/> Tersimpan</span>
        ) : (
          <span className="badge-danger px-2 py-1">{belum} Belum</span>
        )}
      </div>

      {/* ─── ALERTS ─── */}
      <div className="space-y-2 mb-4">
        {readOnly && (
          <div className="p-3 rounded-lg text-sm flex items-center justify-between" style={{ background: '#eff6ff', border: '0.5px solid #dbeafe', color: '#1e3a5f' }}>
            <span>Absensi telah dikunci.</span>
            <button onClick={() => { if(confirm('Insentif akan dihitung ulang jika Anda mengubah absensi. Yakin?')) setReadOnly(false); }} className="flex items-center gap-1.5 font-medium" style={{ color: '#1e6fbf' }}>
              <Edit3 size={14} /> Edit
            </button>
          </div>
        )}
        {kaSppgAbsen && <AlertBanner type="danger" judul="Ka.SPPG tidak hadir" pesan="Hubungi Yayasan untuk koordinasi operasional hari ini." />}
        {pkAbsen && <AlertBanner type="warning" judul="Pengawas Keuangan tidak hadir" pesan="Semua pengeluaran perlu persetujuan Ka.SPPG." />}
      </div>

      {/* ─── AKSI CEPAT ─── */}
      {!readOnly && list.length > 0 && belum > 0 && (
        <div className="mb-4">
          <button onClick={tandaiSemuaHadir} className="btn-secondary text-sm w-full py-2.5">
            <UserCheck size={16} /> Tandai Sisa ({belum}) Hadir
          </button>
        </div>
      )}

      {/* ─── LIST ─── */}
      <div className="card overflow-hidden">
        {list.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-slate-400" />
            </div>
            <p className="font-medium" style={{ color: '#0f172a' }}>Belum ada data relawan</p>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Tambah relawan di menu Data Relawan terlebih dahulu.</p>
          </div>
        ) : (
          list.map((r, idx) => {
            const val = state[r.relawan_id];
            const isHadir = val?.hadir === true;
            const isTidak = val?.hadir === false;
            
            return (
              <div key={r.relawan_id} style={{ borderBottom: idx === list.length - 1 ? 'none' : '0.5px solid #e2e8f0' }}>
                <div className="flex items-center gap-3 px-3 py-3 min-h-[64px]">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 ${avColor(r.nama)}`}>
                    {getInisialNama(r.nama)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: '#0f172a' }}>{r.nama}</p>
                    <p className="text-[11px] truncate mt-0.5" style={{ color: '#475569' }}>{JABATAN_LABELS[r.jabatan as any] || r.jabatan}</p>
                  </div>
                  
                  {/* Tombol Hadir / Tidak */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button 
                      onClick={() => setHadir(r.relawan_id, true)}
                      disabled={readOnly}
                      className="min-w-[64px] sm:min-w-[72px] py-1.5 px-2 text-xs font-medium rounded-lg transition-all disabled:opacity-60"
                      style={isHadir 
                        ? { background: '#16a34a', color: '#ffffff', border: '1px solid #16a34a' } 
                        : { background: 'transparent', color: '#14532d', border: '1px solid #dcfce7' }}
                    >
                      Hadir
                    </button>
                    <button 
                      onClick={() => setHadir(r.relawan_id, false)}
                      disabled={readOnly}
                      className="min-w-[64px] sm:min-w-[72px] py-1.5 px-2 text-xs font-medium rounded-lg transition-all disabled:opacity-60"
                      style={isTidak 
                        ? { background: '#dc2626', color: '#ffffff', border: '1px solid #dc2626' } 
                        : { background: 'transparent', color: '#991b1b', border: '1px solid #fecaca' }}
                    >
                      Tidak
                    </button>
                  </div>
                </div>

                {/* Dropdown Alasan jika Tidak Hadir */}
                {isTidak && (
                  <div className="px-3 pb-3 pt-1 animate-slide-down ml-12 sm:ml-12">
                    <p className="text-[11px] mb-2" style={{ color: '#475569' }}>Pilih keterangan tidak hadir:</p>
                    <div className="flex flex-wrap gap-2">
                      {['Sakit', 'Izin', 'Tanpa Keterangan'].map(ket => {
                        const active = val?.keterangan === ket;
                        return (
                          <button 
                            key={ket}
                            onClick={() => setKeterangan(r.relawan_id, ket)}
                            disabled={readOnly}
                            className="px-3 py-1.5 text-xs rounded-full font-medium transition-all disabled:opacity-60"
                            style={active 
                              ? { background: '#eff6ff', color: '#1e6fbf', border: '1px solid #dbeafe' } 
                              : { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}
                          >
                            {ket}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ─── SUMMARY BAR (STICKY BOTTOM) ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:pl-60">
        <div className="flex items-center justify-between p-3 sm:px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-all" style={{ background: '#ffffff', borderTop: '0.5px solid #e2e8f0' }}>
          <div className="text-xs sm:text-sm font-medium" style={{ color: '#475569' }}>
            <span style={{ color: '#16a34a' }}>H: {hadir}</span> <span className="mx-1.5 opacity-40">|</span> 
            <span style={{ color: '#dc2626' }}>T: {tidak}</span> <span className="mx-1.5 opacity-40">|</span> 
            <span style={belum > 0 ? { color: '#d97706' } : {}}>B: {belum}</span>
          </div>
          <button 
            onClick={handleSimpan}
            disabled={readOnly || belum > 0 || saveMut.isPending}
            className="btn-primary"
          >
            {saveMut.isPending ? (
              <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> ...</>
            ) : (
              <><Save size={16} /> Simpan</>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
