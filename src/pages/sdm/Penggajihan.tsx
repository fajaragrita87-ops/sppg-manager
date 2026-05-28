import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, FileDown, CheckCircle2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useInsentifPeriode, useBayarInsentif, generateNominatifPDF, hitungInsentifPJSatdik } from '@/hooks/useInsentif';
import { formatRupiah } from '@/lib/utils';
import { JABATAN_LABELS } from '@/types';
import { toast } from '@/store/toastStore';
import { logAudit } from '@/lib/audit-logger';

function getPeriodes() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const mName = now.toLocaleString('id-ID', { month: 'long' });
  const lastDay = new Date(y, m + 1, 0).getDate();
  
  const isSecondHalf = now.getDate() > 15;
  
  return {
    options: [
      { id: `${y}-${m+1}-1`, label: `1–15 ${mName} ${y}`, start: `${y}-${m+1}-01`, end: `${y}-${m+1}-15` },
      { id: `${y}-${m+1}-2`, label: `16–${lastDay} ${mName} ${y}`, start: `${y}-${m+1}-16`, end: `${y}-${m+1}-${lastDay}` },
    ],
    defaultIdx: isSecondHalf ? 1 : 0
  };
}

// ─── DEMO FALLBACK (saat Supabase tidak connect) ───
const DEMO_INSENTIF = [
  { relawan_id: 'r1', nama: 'Siti Rahayu',    jabatan: 'kepala_sppg',        total_insentif: 1_950_000, sudah_dibayar: false, ids: ['i1'] },
  { relawan_id: 'r2', nama: 'Budi Santoso',   jabatan: 'pengawas_keuangan',  total_insentif: 1_690_000, sudah_dibayar: true,  ids: ['i2'] },
  { relawan_id: 'r3', nama: 'Dewi Lestari',   jabatan: 'pengawas_gizi',      total_insentif: 1_690_000, sudah_dibayar: false, ids: ['i3'] },
  { relawan_id: 'r4', nama: 'Agus Setiawan',  jabatan: 'jurutama_masak',     total_insentif: 1_560_000, sudah_dibayar: false, ids: ['i4'] },
  { relawan_id: 'r5', nama: 'Rina Wulandari', jabatan: 'asisten_lapangan',   total_insentif: 1_300_000, sudah_dibayar: true,  ids: ['i5'] },
  { relawan_id: 'r6', nama: 'Hendra Putra',   jabatan: 'asisten_lapangan',   total_insentif: 1_300_000, sudah_dibayar: false, ids: ['i6'] },
  { relawan_id: 'r7', nama: 'Maya Indah',     jabatan: 'pengawas_sanitasi',  total_insentif: 1_300_000, sudah_dibayar: false, ids: ['i7'] },
  { relawan_id: 'r8', nama: 'Rizky Ramadhan', jabatan: 'driver',             total_insentif: 1_170_000, sudah_dibayar: true,  ids: ['i8'] },
];

// ─── DUMMY DATA UNTUK KALKULASI TAMBAHAN ───
const DUMMY_SATDIK = [
  { nama: 'SDN 01 Jakarta', siswa: 450 },
  { nama: 'SMPN 12 Jakarta', siswa: 850 },
  { nama: 'SDN 03 Jakarta', siswa: 300 }
];
const DUMMY_PM_HARIAN = 1600;
const HARI_OPS = 12;

export default function Penggajihan() {
  const navigate = useNavigate();
  const sppg = useAuthStore((s) => s.sppg);
  
  const pData = getPeriodes();
  const [perIdx, setPerIdx] = useState(pData.defaultIdx);
  const activePer = pData.options[perIdx];

  const { data: rawData = [], isLoading } = useInsentifPeriode(sppg?.id, activePer.start, activePer.end);
  const bayarMut = useBayarInsentif();

  // Gunakan demo data jika Supabase kosong
  const data = rawData.length > 0 ? rawData : (!isLoading ? DEMO_INSENTIF : []);

  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [metode, setMetode] = useState<'tunai' | 'transfer'>('tunai');
  const [tglBayar, setTglBayar] = useState(new Date().toISOString().split('T')[0]);
  const [showBiayaLain, setShowBiayaLain] = useState(false);

  // ─── Kalkulasi ───
  const { totalSemua, sdhDibayar, blmDibayar } = useMemo(() => {
    let tot = 0, sdh = 0, blm = 0;
    data.forEach(r => {
      tot += r.total_insentif;
      if (r.sudah_dibayar) sdh++; else blm++;
    });
    return { totalSemua: tot, sdhDibayar: sdh, blmDibayar: blm };
  }, [data]);

  // Kalkulasi Biaya Tambahan
  const totalPJSatdik = DUMMY_SATDIK.reduce((acc, s) => acc + hitungInsentifPJSatdik(s.siswa), 0);
  const totalKader = DUMMY_PM_HARIAN * 1000 * HARI_OPS;
  const totalBpjs = Math.round(totalSemua * 0.0054); // 0.54% JKK & JKM
  const grandTotal = totalSemua + totalPJSatdik + totalKader + totalBpjs;

  // ─── Actions ───
  const handleBayarBaris = async (relawanId: string, ids: string[]) => {
    if (!sppg) return;
    const relawan = data.find(r => r.relawan_id === relawanId);
    try {
      await bayarMut.mutateAsync({ sppgId: sppg.id, ids, metode, tanggal: tglBayar });
      toast.sukses('Insentif berhasil dibayarkan');
      setExpandedRow(null);

      // ── Audit log ──
      const currentUser = useAuthStore.getState().user;
      await logAudit({
        sppgId:    sppg.id,
        userId:    currentUser?.id ?? 'unknown',
        action:    'insentif_dibayar',
        tableName: 'insentif_relawan',
        recordId:  `insentif-${relawanId}-${activePer.id}`,
        beforeData: { sudah_dibayar: false },
        afterData:  { sudah_dibayar: true, metode, tanggal: tglBayar, jumlah: relawan?.total_insentif },
        keterangan: `Pembayaran insentif ${relawan?.nama ?? relawanId} periode ${activePer.label} via ${metode}`,
      });
    } catch { toast.error('Gagal mencatat pembayaran'); }
  };

  const handleBayarSemuaTunai = async () => {
    if (!sppg) return;
    if (!confirm(`Bayar tunai untuk ${blmDibayar} relawan yang belum dibayar?`)) return;
    
    const allUnpaidIds: string[] = [];
    data.filter(r => !r.sudah_dibayar).forEach(r => allUnpaidIds.push(...r.ids));
    
    if (allUnpaidIds.length === 0) return;

    try {
      await bayarMut.mutateAsync({ sppgId: sppg.id, ids: allUnpaidIds, metode: 'tunai', tanggal: tglBayar });
      toast.sukses(`Berhasil membayar ${blmDibayar} relawan secara tunai.`);
    } catch { toast.error('Gagal melakukan pembayaran massal'); }
  };

  const handleDownloadPdf = () => {
    if (!sppg) return;
    generateNominatifPDF(sppg.nama, activePer.label, data, {
      pm_harian: DUMMY_PM_HARIAN,
      hari_ops: HARI_OPS,
      satdik: DUMMY_SATDIK,
      totalPJSatdik,
      bpjs: totalBpjs
    });
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5 animate-fade-in pb-10">
      
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/sdm')} className="btn-ghost p-2 -ml-2" aria-label="Kembali"><ArrowLeft size={18} /></button>
          <h1 className="font-display text-xl font-semibold" style={{ color: '#0f172a' }}>Insentif & Penggajihan</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <select value={perIdx} onChange={e => setPerIdx(Number(e.target.value))} className="select py-1.5 font-medium">
            {pData.options.map((opt, i) => <option key={opt.id} value={i}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      {/* ─── TOP BUTTONS ─── */}
      <div className="flex flex-wrap justify-end gap-2">
        {blmDibayar > 0 && (
          <button onClick={handleBayarSemuaTunai} disabled={bayarMut.isPending} className="btn-secondary text-sm bg-white" style={{ borderColor: '#e2e8f0', color: '#0f172a' }}>
            <CheckCircle2 size={15} style={{ color: '#16a34a' }} /> Bayar Semua (Tunai)
          </button>
        )}
        <button onClick={handleDownloadPdf} className="btn-primary text-sm">
          <FileDown size={15} /> Download Nominatif BGN
        </button>
      </div>

      {/* ─── SUMMARY CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="card p-4">
          <p className="text-sm font-medium mb-1" style={{ color: '#475569' }}>Total Insentif</p>
          <p className="font-display text-2xl font-bold" style={{ color: '#1e6fbf' }}>{formatRupiah(totalSemua)}</p>
        </div>
        <div className="card p-4 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: '#475569' }}>Sudah Dibayar</p>
            <p className="font-display text-xl font-bold" style={{ color: '#0f172a' }}>{sdhDibayar} <span className="text-sm font-normal opacity-60">orang</span></p>
          </div>
          <span className="badge-success">Tuntas</span>
        </div>
        <div className="card p-4 flex justify-between items-center" style={blmDibayar > 0 ? { border: '1px solid #fecaca', background: '#fef2f2' } : {}}>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: '#475569' }}>Belum Dibayar</p>
            <p className="font-display text-xl font-bold" style={{ color: '#0f172a' }}>{blmDibayar} <span className="text-sm font-normal opacity-60">orang</span></p>
          </div>
          {blmDibayar > 0 ? <span className="badge-danger">Tertunda</span> : <span className="badge-success">Bersih</span>}
        </div>
      </div>

      {/* ─── TABLE INSENTIF ─── */}
      <div className="card overflow-x-auto">
        <table className="table min-w-[700px]">
          <thead>
            <tr>
              <th>Relawan</th>
              <th className="text-center">Hari Hadir</th>
              <th className="text-right">Rate/Hari</th>
              <th className="text-right">Total Insentif</th>
              <th className="text-center">BPJS</th>
              <th>Status</th>
              <th className="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center p-6 text-slate-500">Memuat data insentif...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className="text-center p-6 text-slate-500">Tidak ada absensi pada periode ini.</td></tr>
            ) : (
              data.map((r) => {
                const isExpanded = expandedRow === r.relawan_id;
                return (
                  <React.Fragment key={r.relawan_id}>
                    <tr className={isExpanded ? 'bg-slate-50' : ''}>
                      <td>
                        <p className="font-medium text-slate-900">{r.nama}</p>
                        <p className="text-[10px] text-slate-500">{JABATAN_LABELS[r.jabatan as any] || r.jabatan}</p>
                      </td>
                      <td className="text-center font-medium text-slate-700">{r.hari_hadir}</td>
                      <td className="text-right text-slate-600">{formatRupiah(r.rate_hari)}</td>
                      <td className="text-right font-medium text-slate-900">
                        <div className="flex justify-end items-center gap-1.5">
                          <Lock size={12} className="text-slate-400" />
                          {formatRupiah(r.total_insentif)}
                        </div>
                      </td>
                      <td className="text-center">
                        {r.bpjs_aktif 
                          ? <CheckCircle2 size={16} className="inline text-emerald-600" title="BPJS Aktif" />
                          : <AlertTriangle size={15} className="inline text-amber-500" title="BPJS Tidak Aktif" />
                        }
                      </td>
                      <td>
                        {r.sudah_dibayar 
                          ? <span className="badge-success text-[10px]">Dibayar</span> 
                          : <span className="badge-danger text-[10px]">Belum</span>
                        }
                      </td>
                      <td className="text-right">
                        {!r.sudah_dibayar && (
                          <button 
                            onClick={() => setExpandedRow(isExpanded ? null : r.relawan_id)} 
                            className="btn-sm text-xs px-3"
                            style={{ background: isExpanded ? '#f1f5f9' : '#10b981', color: isExpanded ? '#0f172a' : '#fff' }}
                          >
                            {isExpanded ? 'Batal' : 'Bayar'}
                          </button>
                        )}
                      </td>
                    </tr>
                    
                    {/* INLINE ROW EXPANSION FOR PAYMENT */}
                    {isExpanded && !r.sudah_dibayar && (
                      <tr style={{ background: '#f8fafc' }}>
                        <td colSpan={7} className="p-3 border-b">
                          <div className="flex flex-wrap items-center justify-end gap-3 p-2 animate-slide-down">
                            <span className="text-xs font-medium text-slate-600 mr-2">Bayar {r.nama}:</span>
                            <div className="flex items-center gap-1.5">
                              <label className="text-xs text-slate-500">Tgl:</label>
                              <input type="date" value={tglBayar} onChange={e => setTglBayar(e.target.value)} className="input text-xs py-1" />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <label className="text-xs text-slate-500">Metode:</label>
                              <select value={metode} onChange={e => setMetode(e.target.value as any)} className="select text-xs py-1 pr-6">
                                <option value="tunai">Tunai</option>
                                <option value="transfer">Transfer</option>
                              </select>
                            </div>
                            <button onClick={() => handleBayarBaris(r.relawan_id, r.ids)} disabled={bayarMut.isPending} className="btn-primary text-xs py-1.5 ml-2">
                              <CheckCircle2 size={13} className="inline mr-1" /> Konfirmasi ({formatRupiah(r.total_insentif)})
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─── KALKULASI BIAYA SDM LAINNYA ─── */}
      <div className="card overflow-hidden mt-2">
        <button 
          onClick={() => setShowBiayaLain(!showBiayaLain)} 
          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2 text-slate-800 font-medium">
            <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg"><CheckCircle2 size={16} /></span>
            Biaya SDM Lainnya Periode Ini
          </div>
          {showBiayaLain ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </button>
        
        {showBiayaLain && (
          <div className="p-5 border-t border-slate-200 space-y-5 animate-slide-down bg-white">
            
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-800">1. Insentif PJ Satuan Pendidikan</p>
              <div className="pl-4 space-y-1">
                {DUMMY_SATDIK.map((s, i) => (
                  <div key={i} className="flex justify-between text-xs text-slate-600">
                    <span>{s.nama} ({s.siswa} Siswa)</span>
                    <span className="font-medium">{formatRupiah(hitungInsentifPJSatdik(s.siswa))}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs font-semibold text-slate-800 pt-1 border-t border-slate-100 mt-1">
                  <span>Subtotal PJ Satdik</span>
                  <span>{formatRupiah(totalPJSatdik)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-800">2. Insentif Kader Posyandu</span>
                <span className="font-medium text-slate-700">{formatRupiah(totalKader)}</span>
              </div>
              <p className="text-xs text-slate-500 pl-4">Rp 1.000 × {DUMMY_PM_HARIAN} PM × {HARI_OPS} hari kerja</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-800">3. Iuran BPJS Ketenagakerjaan</span>
                <span className="font-medium text-slate-700">{formatRupiah(totalBpjs)}</span>
              </div>
              <p className="text-xs text-slate-500 pl-4">0.24% JKK + 0.30% JKM = 0.54% × {formatRupiah(totalSemua)} (Total Insentif)</p>
            </div>

            <div className="pt-4 border-t-2 border-slate-200 border-dashed flex justify-between items-end">
              <div>
                <p className="text-sm font-semibold text-slate-800">GRAND TOTAL</p>
                <p className="text-xs text-slate-500">Biaya SDM keseluruhan periode ini</p>
              </div>
              <p className="font-display text-xl font-bold text-blue-700">{formatRupiah(grandTotal)}</p>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
