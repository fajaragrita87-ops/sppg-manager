import { useState, useMemo } from 'react';
import { X, Users, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useJadwalHariIni } from '@/hooks/useJadwalShift';
import { getInisialNama, formatTanggal } from '@/lib/utils';

const ZONAS = [
  { id: 'prep',        nama: 'Prep Bahan',  bg: '#f3e8ff', border: '#d8b4fe', text: '#7e22ce', minRelawan: 4 },
  { id: 'masak_nasi',  nama: 'Masak Nasi',  bg: '#ffedd5', border: '#fdba74', text: '#c2410c', minRelawan: 2 },
  { id: 'masak_lauk',  nama: 'Masak Lauk',  bg: '#fef2f2', border: '#fca5a5', text: '#b91c1c', minRelawan: 3 },
  { id: 'pemorsian',   nama: 'Pemorsian',   bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', minRelawan: 9 },
  { id: 'masak_sayur', nama: 'Masak Sayur', bg: '#dcfce7', border: '#86efac', text: '#15803d', minRelawan: 2 },
  { id: 'cuci_alat',   nama: 'Cuci Alat',   bg: '#f1f5f9', border: '#cbd5e1', text: '#334155', minRelawan: 14 },
  { id: 'packing',     nama: 'Packing',     bg: '#ccfbf1', border: '#5eead4', text: '#0f766e', minRelawan: 1 },
  { id: 'distribusi',  nama: 'Distribusi',  bg: '#fef9c3', border: '#fde047', text: '#a16207', minRelawan: 4 },
];

const GRID_LAYOUT = [
  ['prep', 'masak_nasi', 'masak_lauk'],
  ['pemorsian', 'masak_sayur', 'cuci_alat'],
  ['packing', 'distribusi', null], // Empty cell for grid layout
];

const AV_COLORS = ['bg-blue-600','bg-indigo-600','bg-sky-600','bg-cyan-600','bg-teal-600','bg-violet-600'];
function avColor(nama: string) { let h = 0; for (let i = 0; i < nama.length; i++) h = nama.charCodeAt(i) + ((h << 5) - h); return AV_COLORS[Math.abs(h) % AV_COLORS.length]; }

export default function LayoutDapur() {
  const sppg = useAuthStore((s) => s.sppg);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const { data = [], isLoading } = useJadwalHariIni(sppg?.id, todayStr);
  const [selectedZona, setSelectedZona] = useState<string | null>(null);

  // Mengelompokkan relawan berdasarkan zona
  const groupedData = useMemo(() => {
    const map = new Map<string, any[]>();
    ZONAS.forEach(z => map.set(z.id, []));
    
    data.forEach(j => {
      if (j.zona_id && map.has(j.zona_id)) {
        map.get(j.zona_id)!.push(j);
      }
    });
    return map;
  }, [data]);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in relative min-h-[80vh]">
      
      {/* ─── HEADER ─── */}
      <div>
        <h1 className="font-display text-xl font-semibold flex items-center gap-2" style={{ color: '#0f172a' }}>
          <LayoutDashboard size={20} /> Layout Dapur
        </h1>
        <p className="text-sm mt-1" style={{ color: '#475569' }}>Hari ini, {formatTanggal(today)}</p>
      </div>

      {/* ─── DENAH DAPUR ─── */}
      <div className="card-surface p-4 sm:p-6 rounded-2xl relative" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl" style={{ background: 'rgba(241, 245, 249, 0.7)' }}>
            <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#e2e8f0', borderTopColor: '#3b82f6' }} />
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {GRID_LAYOUT.flat().map((zonaId, idx) => {
            if (!zonaId) return <div key={idx} className="hidden sm:block" />; // Empty placeholder

            const zInfo = ZONAS.find(z => z.id === zonaId)!;
            const relawanList = groupedData.get(zonaId) || [];
            const isKurang = relawanList.length < zInfo.minRelawan;

            return (
              <button 
                key={zonaId}
                onClick={() => setSelectedZona(zonaId)}
                className="flex flex-col items-start justify-between p-4 rounded-xl text-left transition-all hover:scale-[1.02] hover:shadow-md"
                style={{ background: zInfo.bg, border: `1.5px solid ${isKurang ? '#ef4444' : zInfo.border}` }}
              >
                <div>
                  <h3 className="font-semibold text-sm sm:text-base leading-tight mb-1" style={{ color: zInfo.text }}>{zInfo.nama}</h3>
                  <p className="text-[10px] opacity-70" style={{ color: zInfo.text }}>Min: {zInfo.minRelawan} orang</p>
                </div>
                
                <div className="mt-6 flex items-center justify-between w-full">
                  <div className="flex -space-x-2">
                    {relawanList.slice(0, 3).map((r, i) => (
                      <div key={i} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-bold text-white shadow-sm ${avColor(r.nama)}`} style={{ borderColor: zInfo.bg }}>
                        {getInisialNama(r.nama)}
                      </div>
                    ))}
                    {relawanList.length > 3 && (
                      <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-bold bg-white text-gray-500 shadow-sm" style={{ borderColor: zInfo.bg }}>
                        +{relawanList.length - 3}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-bold" style={{ color: isKurang ? '#ef4444' : zInfo.text }}>{relawanList.length}</p>
                    <p className="text-[10px]" style={{ color: isKurang ? '#ef4444' : zInfo.text }}>{relawanList.length === 0 ? 'Belum diisi' : 'Relawan'}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── MODAL DETAIL ZONA ─── */}
      {selectedZona && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedZona(null)} />
          
          <div className="relative w-full max-w-sm h-full bg-white shadow-2xl flex flex-col animate-slide-left">
            {(() => {
              const zInfo = ZONAS.find(z => z.id === selectedZona)!;
              const list = groupedData.get(selectedZona) || [];
              
              return (
                <>
                  <div className="p-5 flex items-center justify-between border-b" style={{ background: zInfo.bg, borderColor: zInfo.border }}>
                    <div>
                      <h2 className="font-semibold text-lg" style={{ color: zInfo.text }}>{zInfo.nama}</h2>
                      <p className="text-xs mt-0.5" style={{ color: zInfo.text }}>{list.length} Relawan ditugaskan hari ini</p>
                    </div>
                    <button onClick={() => setSelectedZona(null)} className="p-2 bg-white/50 rounded-full hover:bg-white/80 transition-colors" style={{ color: zInfo.text }}>
                      <X size={18} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {list.length === 0 ? (
                      <div className="text-center p-8 opacity-60">
                        <Users size={32} className="mx-auto mb-2" />
                        <p className="text-sm">Belum ada relawan di zona ini.</p>
                      </div>
                    ) : (
                      list.map(r => (
                        <div key={r.relawan_id} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: '#e2e8f0' }}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold text-white ${avColor(r.nama)}`}>
                            {getInisialNama(r.nama)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-900 truncate">{r.nama}</p>
                            <p className="text-xs text-slate-500 truncate">{r.jabatan}</p>
                          </div>
                          <div>
                            {r.hadir === true && <span className="badge-success text-[10px]">✅ Hadir</span>}
                            {r.hadir === false && <span className="badge-danger text-[10px]">❌ Tidak</span>}
                            {r.hadir === null && <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Belum Absen</span>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
}
