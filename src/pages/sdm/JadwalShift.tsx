import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Copy, FileDown, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useJadwalMingguan, useSaveJadwalShift, useCopyJadwalMingguLalu } from '@/hooks/useJadwalShift';
import { getInisialNama } from '@/lib/utils';
import { toast } from '@/store/toastStore';

const ZONAS = [
  { id: 'prep',        nama: 'Prep Bahan',  bg: '#f3e8ff', border: '#d8b4fe', text: '#7e22ce', minRelawan: 4 },
  { id: 'masak_nasi',  nama: 'Masak Nasi',  bg: '#ffedd5', border: '#fdba74', text: '#c2410c', minRelawan: 2 },
  { id: 'masak_lauk',  nama: 'Masak Lauk',  bg: '#fef2f2', border: '#fca5a5', text: '#b91c1c', minRelawan: 3 },
  { id: 'masak_sayur', nama: 'Masak Sayur', bg: '#dcfce7', border: '#86efac', text: '#15803d', minRelawan: 2 },
  { id: 'pemorsian',   nama: 'Pemorsian',   bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', minRelawan: 9 },
  { id: 'packing',     nama: 'Packing',     bg: '#ccfbf1', border: '#5eead4', text: '#0f766e', minRelawan: 1 },
  { id: 'distribusi',  nama: 'Distribusi',  bg: '#fef9c3', border: '#fde047', text: '#a16207', minRelawan: 4 },
  { id: 'cuci_alat',   nama: 'Cuci Alat',   bg: '#f1f5f9', border: '#cbd5e1', text: '#334155', minRelawan: 14 },
];

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function getMonday(d: Date) {
  const d2 = new Date(d);
  const day = d2.getDay();
  const diff = d2.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d2.setDate(diff));
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function JadwalShift() {
  const sppg = useAuthStore((s) => s.sppg);
  const [currMon, setCurrMon] = useState(getMonday(new Date()));
  const currSat = new Date(currMon); currSat.setDate(currMon.getDate() + 5);

  const startStr = currMon.toISOString().split('T')[0];
  const endStr = currSat.toISOString().split('T')[0];

  const { data, isLoading } = useJadwalMingguan(sppg?.id, startStr, endStr);
  const saveMut = useSaveJadwalShift();
  const copyMut = useCopyJadwalMingguLalu();

  const [editingCell, setEditingCell] = useState<{ relawan_id: string; dateStr: string } | null>(null);

  // Derived state
  const mapJadwal = useMemo(() => {
    const map = new Map<string, any>();
    if (data?.jadwal) {
      data.jadwal.forEach(j => map.set(`${j.relawan_id}_${j.tanggal}`, j));
    }
    return map;
  }, [data]);

  const dates = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(currMon);
      d.setDate(currMon.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  }, [currMon]);

  // Validation
  const validation = useMemo(() => {
    const res: { [zona: string]: { [date: string]: number } } = {};
    ZONAS.forEach(z => { res[z.id] = {}; dates.forEach(d => res[z.id][d] = 0); });
    
    if (data?.jadwal) {
      data.jadwal.forEach(j => {
        if (j.zona_id && res[j.zona_id] && res[j.zona_id][j.tanggal] !== undefined) {
          res[j.zona_id][j.tanggal]++;
        }
      });
    }
    return res;
  }, [data, dates]);

  const handleCopy = async () => {
    if (!sppg) return;
    if (!confirm('Salin jadwal dari minggu sebelumnya? Jadwal yang sudah ada di minggu ini akan tertimpa.')) return;
    
    const prevMon = new Date(currMon); prevMon.setDate(prevMon.getDate() - 7);
    try {
      await copyMut.mutateAsync({ 
        sppgId: sppg.id, 
        prevStart: prevMon.toISOString().split('T')[0], 
        currStart: startStr 
      });
      toast.sukses('Jadwal berhasil disalin.');
    } catch (e: any) {
      toast.error('Gagal menyalin', e.message);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in relative min-h-[80vh]">
      
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold" style={{ color: '#0f172a' }}>Jadwal Shift Mingguan</h1>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={() => { const d = new Date(currMon); d.setDate(d.getDate() - 7); setCurrMon(d); }} className="btn-ghost p-1.5"><ChevronLeft size={16} /></button>
            <span className="text-sm font-medium" style={{ color: '#475569' }}>
              {fmtDate(currMon)} – {fmtDate(currSat)}
            </span>
            <button onClick={() => { const d = new Date(currMon); d.setDate(d.getDate() + 7); setCurrMon(d); }} className="btn-ghost p-1.5"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopy} disabled={copyMut.isPending} className="btn-secondary text-xs"><Copy size={14} /> Salin Minggu Lalu</button>
          <button onClick={() => window.print()} className="btn-ghost text-xs"><FileDown size={14} /> Export PDF</button>
        </div>
      </div>

      {/* ─── TABLE ─── */}
      <div className="card overflow-x-auto pb-32">
        <table className="w-full text-sm text-left border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="p-3 border-b border-r bg-[#f8fafc] sticky left-0 z-10 w-[200px]" style={{ borderColor: '#e2e8f0' }}>Relawan</th>
              {DAYS.map((d, i) => (
                <th key={d} className="p-3 border-b text-center font-medium w-[120px]" style={{ borderColor: '#e2e8f0', color: '#475569' }}>
                  {d}<br/><span className="text-[10px] opacity-70">{dates[i].split('-')[2]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr>
            ) : data?.relawan.length === 0 ? (
              <tr><td colSpan={7} className="p-4 text-center" style={{ color: '#94a3b8' }}>Belum ada data relawan.</td></tr>
            ) : (
              data?.relawan.map(r => (
                <tr key={r.id}>
                  <td className="p-3 border-b border-r bg-white sticky left-0 z-10" style={{ borderColor: '#e2e8f0' }}>
                    <p className="font-medium truncate" style={{ color: '#0f172a' }}>{r.nama}</p>
                    <p className="text-[10px] truncate" style={{ color: '#94a3b8' }}>{r.jabatan.replace('_', ' ').toUpperCase()}</p>
                  </td>
                  {dates.map((dateStr) => {
                    const cellData = mapJadwal.get(`${r.id}_${dateStr}`);
                    const isEditing = editingCell?.relawan_id === r.id && editingCell.dateStr === dateStr;
                    const zData = ZONAS.find(z => z.id === cellData?.zona_id);

                    return (
                      <td key={dateStr} className="border-b p-1 relative group cursor-pointer hover:bg-[#f8fafc] transition-colors" style={{ borderColor: '#e2e8f0' }}>
                        <div 
                          onClick={() => setEditingCell({ relawan_id: r.id, dateStr })}
                          className={`w-full h-14 rounded-md flex flex-col items-center justify-center p-1 text-center transition-all ${isEditing ? 'ring-2 ring-blue-500 shadow-md' : ''}`}
                          style={zData ? { background: zData.bg, border: `1px solid ${zData.border}` } : { background: '#f8fafc', border: '1px dashed #cbd5e1' }}
                        >
                          {zData ? (
                            <>
                              <span className="text-[11px] font-semibold leading-tight line-clamp-2" style={{ color: zData.text }}>{zData.nama}</span>
                              {(cellData?.jam_mulai || cellData?.jam_selesai) && (
                                <span className="text-[9px] mt-0.5 opacity-80" style={{ color: zData.text }}>
                                  {cellData?.jam_mulai?.substring(0,5)} - {cellData?.jam_selesai?.substring(0,5)}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#94a3b8' }}>+ Set Zona</span>
                          )}
                        </div>

                        {/* Popup Editor */}
                        {isEditing && (
                          <CellEditor 
                            sppgId={sppg!.id}
                            relawanId={r.id}
                            dateStr={dateStr}
                            initialData={cellData}
                            onClose={() => setEditingCell(null)}
                            onSave={saveMut.mutateAsync}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── VALIDATION ALERTS ─── */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {ZONAS.filter(z => z.minRelawan > 0).map(z => {
            let errorMsg = '';
            for (let i = 0; i < 6; i++) {
              const count = validation[z.id][dates[i]];
              if (count < z.minRelawan) errorMsg += `${DAYS[i].substring(0,3)}(${count}) `;
            }

            return (
              <div key={z.id} className="p-3 rounded-lg text-xs" style={{ background: z.bg, border: `1px solid ${z.border}`, color: z.text }}>
                <div className="font-semibold mb-1 flex justify-between">
                  <span>{z.nama}</span>
                  <span>Min: {z.minRelawan}</span>
                </div>
                {errorMsg ? (
                  <p className="flex items-start gap-1"><span className="text-red-600">⚠️</span> Kurang di: {errorMsg}</p>
                ) : (
                  <p className="flex items-center gap-1 opacity-80"><span>✅</span> Terpenuhi semua hari</p>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

// ─── Popup Editor Component ───
function CellEditor({ sppgId, relawanId, dateStr, initialData, onClose, onSave }: any) {
  const [zona, setZona] = useState(initialData?.zona_id || '');
  const [start, setStart] = useState(initialData?.jam_mulai || '02:00');
  const [end, setEnd] = useState(initialData?.jam_selesai || '10:00');

  const handleSimpan = async () => {
    if (!zona) return;
    try {
      await onSave({ sppg_id: sppgId, relawan_id: relawanId, tanggal: dateStr, zona_id: zona, jam_mulai: start, jam_selesai: end });
      onClose();
    } catch { toast.error('Gagal menyimpan jadwal'); }
  };

  const handleLibur = async () => {
    try {
      await onSave({ sppg_id: sppgId, relawan_id: relawanId, tanggal: dateStr, zona_id: 'libur' });
      onClose();
    } catch { toast.error('Gagal menghapus jadwal'); }
  };

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-white shadow-xl rounded-xl p-3 border border-gray-200 w-48 animate-fade-in" style={{ borderColor: '#e2e8f0' }}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold" style={{ color: '#0f172a' }}>Edit Shift</span>
        <button onClick={onClose} className="p-0.5 opacity-50 hover:opacity-100"><X size={14} /></button>
      </div>
      <div className="space-y-2">
        <select value={zona} onChange={e => setZona(e.target.value)} className="select text-xs w-full py-1.5 px-2">
          <option value="">Pilih Zona...</option>
          {ZONAS.map(z => <option key={z.id} value={z.id}>{z.nama}</option>)}
        </select>
        <div className="flex gap-2">
          <input type="time" value={start} onChange={e => setStart(e.target.value)} className="input text-[10px] w-full px-1.5 py-1" />
          <span className="self-center text-[10px]">-</span>
          <input type="time" value={end} onChange={e => setEnd(e.target.value)} className="input text-[10px] w-full px-1.5 py-1" />
        </div>
        <div className="flex gap-1 mt-2">
          <button onClick={handleSimpan} className="btn-primary flex-1 text-[10px] py-1.5 px-0">Simpan</button>
          <button onClick={handleLibur} className="btn-secondary flex-1 text-[10px] py-1.5 px-0 text-red-600 border-red-200 hover:bg-red-50">Libur</button>
        </div>
      </div>
    </div>
  );
}
