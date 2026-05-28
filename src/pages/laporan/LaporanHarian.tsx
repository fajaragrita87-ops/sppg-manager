import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { logAudit } from '@/lib/audit-logger';
import { 
  CheckCircle2, Clock, AlertTriangle, Upload, Camera, 
  Lock, RefreshCw, FileText, Download, ChevronRight, ChevronLeft, Save, Eye 
} from 'lucide-react';
import { toast } from '@/store/toastStore';
import { useNavigate } from 'react-router-dom';
import SIPGNExport from '@/components/laporan/SIPGNExport';
import { eksporLaporanHarianSIPGN } from '@/lib/sipgn-bridge';
import { generateLampiran30a } from '@/lib/pdf-generator';
import { useKeuanganStore } from '@/store/keuanganStore';
import { usePermission, ReadOnlyBanner } from '@/hooks/PermGuard';
import LaporanPreviewModal, { PreviewSection } from '@/components/keuangan/LaporanPreviewModal';

// MOCK DATA (Angka Porsi)
const DEFAULT_PORSI = {
  tk: 1200,
  sd: 1000,
  smp: 400,
  sma: 247,
  lainnya: 139 // Bumil + Posyandu
};

// INDEKS HARGA BGN (Sesuai Juknis)
const HARGA_BGN = {
  tk: 8000,
  sd: 10000,
  smp: 12000,
  sma: 12000,
  lainnya: 12000
};

const INSENTIF_SPPG_HARIAN = 6000000;

export default function LaporanHarianPage() {
  const { user, sppg } = useAuthStore();
  const keuangan = useKeuanganStore();
  const navigate = useNavigate();
  const canInput  = usePermission('laporan.input_harian');
  const canKunci  = usePermission('laporan.kunci_laporan');
  const canGenerate = usePermission('laporan.generate_bgn');
  
  // Status Laporan (bisa ditarik dari DB nantinya)
  const [isLocked, setIsLocked] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  
  // Stepper state
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const currentStep = !step1Done ? 1 : !step2Done ? 2 : 3;

  // Porsi State
  const [porsi, setPorsi] = useState(DEFAULT_PORSI);
  const [skipFoto, setSkipFoto] = useState(false);
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview30a, setPreview30a] = useState(false);
  const [sudahPreview, setSudahPreview] = useState(false);

  const totalPorsi = Object.values(porsi).reduce((a, b) => a + b, 0);
  const targetPorsi = 3000;
  const persentasePorsi = Math.min(100, (totalPorsi / targetPorsi) * 100);

  // Kalkulasi Pendapatan BGN Harian (Per Kategori Penerima Manfaat)
  const pendapatanPorsi = 
    (porsi.tk * HARGA_BGN.tk) +
    (porsi.sd * HARGA_BGN.sd) +
    (porsi.smp * HARGA_BGN.smp) +
    (porsi.sma * HARGA_BGN.sma) +
    (porsi.lainnya * HARGA_BGN.lainnya);
    
  // LOGIKA PENCAIRAN INSENTIF 6 JUTA:
  // Harus mencapai Service Level Agreement (SLA) minimal 90% dari target porsi.
  // Jika kurang dari 90%, insentif dipotong proporsional.
  const isSlaTerpenuhi = persentasePorsi >= 90;
  const insentifRiil = isSlaTerpenuhi ? INSENTIF_SPPG_HARIAN : (INSENTIF_SPPG_HARIAN * (persentasePorsi / 100));
  
  const totalPenerimaanHarian = pendapatanPorsi + insentifRiil;

  const totalPengeluaran = keuangan.pengeluaranBahanBaku + keuangan.pengeluaranOperasional + keuangan.pengeluaranInsentif;

  const updatePorsi = (key: keyof typeof porsi, delta: number) => {
    setPorsi(prev => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }));
  };

  const handleKunci = () => {
    if (!step1Done || !step2Done) return;
    setIsSubmitting(true);
    
    // Simulasi API call
    setTimeout(async () => {
      setIsLocked(true);
      setIsSubmitting(false);
      setSyncStatus('success');
      // ── Persist status ke store agar Dashboard langsung update ──
      keuangan.setLaporanHarianStatus('terkirim');
      toast.sukses('Laporan berhasil dikunci!', 'PDF tersimpan dan sinkronisasi ke BGN berjalan otomatis.');

      // ── Audit log ──
      await logAudit({
        sppgId:    user?.sppg_id ?? 'unknown',
        userId:    user?.id ?? 'unknown',
        action:    'laporan_dikunci',
        tableName: 'laporan_harian',
        recordId:  `laporan-${new Date().toISOString().split('T')[0]}`,
        afterData: { status: 'dikunci', total_porsi: totalPorsi, total_pengeluaran: totalPengeluaran },
        keterangan: `Laporan dikunci oleh ${user?.nama}`,
      });
    }, 500);
  };

  if (isLocked) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in pb-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="font-display text-xl font-semibold text-slate-900">Laporan Harian BGN</h1>
            <p className="text-sm text-slate-500 mt-1">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          {syncStatus === 'success' && <span className="badge-success px-4 py-1.5"><CheckCircle2 size={16} className="mr-1.5"/> Terkirim ke BGN</span>}
          {syncStatus === 'failed' && <span className="badge-danger px-4 py-1.5"><AlertTriangle size={16} className="mr-1.5"/> Gagal Sinkronisasi</span>}
          {syncStatus === 'pending' && <span className="badge-warning px-4 py-1.5"><Clock size={16} className="mr-1.5"/> Antrian Sync</span>}
        </div>

        <div className="card p-8 text-center animate-slide-up border-t-4 border-t-emerald-500">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Laporan Telah Dikunci</h2>
          <p className="text-slate-500 mb-6">Laporan hari ini sudah diverifikasi dan dikunci oleh <strong>{user?.nama}</strong> pada {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left max-w-2xl mx-auto">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold mb-1">Total Porsi</p>
              <p className="text-xl font-bold text-slate-800">{totalPorsi.toLocaleString('id-ID')} <span className="text-sm font-medium text-slate-500">porsi</span></p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold mb-1">Total Pengeluaran</p>
              <p className="text-xl font-bold text-rose-700">Rp {(totalPengeluaran / 1000000).toFixed(2)} Jt</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold mb-1">Sisa Saldo VA (Est)</p>
              <p className="text-xl font-bold text-blue-700">Rp {(keuangan.saldoVA / 1000000).toFixed(1)} Jt</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button 
              onClick={() => {
                toast.info('Menyiapkan dokumen PDF...');
                generateLampiran30a({
                  sppg,
                  laporan: {
                    penerima_manfaat: { tk: porsi.tk, sd: porsi.sd, smp: porsi.smp, sma: porsi.sma, lainnya: porsi.lainnya },
                    keuangan: { bahanBaku: keuangan.pengeluaranBahanBaku, operasional: keuangan.pengeluaranOperasional, insentif: keuangan.pengeluaranInsentif, saldoVA: keuangan.saldoVA }
                  }
                });
              }} 
              className="btn-secondary py-3 px-6"
            >
              <Download size={18} className="mr-2"/> Download PDF Lampiran 30a
            </button>
            {syncStatus !== 'success' && (
              <button className="btn-primary py-3 px-6"><RefreshCw size={18} className="mr-2"/> Coba Kirim Ulang (Sync)</button>
            )}
          </div>
        </div>

        {/* ─── SIPGN EXPORT CARD ─── */}
        <div className="mt-6 animate-slide-up">
          <SIPGNExport laporanId="laporan-hari-ini" modeHarian />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      {!canInput && <ReadOnlyBanner message="Role Anda hanya bisa melihat laporan. Untuk input atau kunci laporan, hubungi Ka. SPPG." />}
      {/* ─── HEADER ─── */}
      <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Laporan Harian BGN</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <CalendarIcon /> {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div>
          <span className="badge-warning px-4 py-2 text-sm shadow-sm border border-amber-200"><Clock size={16} className="mr-1.5"/> Belum Dikunci</span>
        </div>
      </div>

      {/* ─── PROGRESS STEPPER ─── */}
      <div className="flex items-center justify-between mb-10 px-4 sm:px-10 relative">
        <div className="absolute top-1/2 left-10 right-10 h-1 bg-slate-200 -z-10 -translate-y-1/2"></div>
        <div className={`absolute top-1/2 left-10 h-1 bg-amber-400 -z-10 -translate-y-1/2 transition-all duration-500`} style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}></div>
        
        {[
          { num: 1, title: 'Porsi Hari Ini', done: step1Done },
          { num: 2, title: 'Keuangan', done: step2Done },
          { num: 3, title: 'Kunci & Kirim', done: step1Done && step2Done }
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center bg-white px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-colors ${
              s.done ? 'bg-emerald-500 border-emerald-500 text-white' : 
              currentStep === s.num ? 'bg-amber-400 border-amber-400 text-white shadow-md ring-4 ring-amber-50' : 
              'bg-white border-slate-300 text-slate-400'
            }`}>
              {s.done ? <CheckCircle2 size={20} /> : s.num}
            </div>
            <span className={`text-xs font-semibold mt-2 ${s.done ? 'text-emerald-600' : currentStep === s.num ? 'text-amber-600' : 'text-slate-400'}`}>{s.title}</span>
          </div>
        ))}
      </div>

      {/* ─── STEP 1: PORSI ─── */}
      <div className={`transition-all duration-500 ${currentStep !== 1 ? 'hidden' : 'block animate-slide-right'}`}>
        <div className="card p-6 md:p-8">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-800">Berapa porsi yang sudah dibagikan hari ini?</h2>
            <p className="text-sm text-slate-500 mt-1">Angka sudah diisi otomatis dari modul distribusi. Silakan koreksi jika ada yang berbeda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            <PorsiInput label="PAUD / TK" value={porsi.tk} onChange={(d) => updatePorsi('tk', d)} />
            <PorsiInput label="SD / MI" value={porsi.sd} onChange={(d) => updatePorsi('sd', d)} />
            <PorsiInput label="SMP / MTs" value={porsi.smp} onChange={(d) => updatePorsi('smp', d)} />
            <PorsiInput label="SMA / MA / SMK" value={porsi.sma} onChange={(d) => updatePorsi('sma', d)} />
            <PorsiInput label="Bumil & Posyandu" value={porsi.lainnya} onChange={(d) => updatePorsi('lainnya', d)} />
          </div>

          <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl mb-6">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-semibold text-blue-900">Total Hari Ini</span>
              <span className="text-2xl font-black text-blue-700">{totalPorsi.toLocaleString('id-ID')} <span className="text-sm font-medium text-blue-600">dari target {targetPorsi.toLocaleString('id-ID')}</span></span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${persentasePorsi}%` }}></div>
            </div>
          </div>

          <div className="mb-8 border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2"><Camera size={16}/> Dokumentasi Distribusi (Opsional)</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <button disabled={skipFoto} className={`flex-1 py-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors ${skipFoto ? 'border-slate-100 bg-slate-50 text-slate-300' : 'border-slate-300 text-slate-500 hover:bg-slate-50 hover:border-blue-400 hover:text-blue-600'}`}>
                <Upload size={24} />
                <span className="text-xs font-semibold">Upload Foto Bukti</span>
              </button>
              <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer">
                <input type="checkbox" checked={skipFoto} onChange={(e) => setSkipFoto(e.target.checked)} className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 border-slate-300" />
                <span className="text-sm font-medium text-slate-700">Tidak ada sinyal internet — skip foto dulu (bisa diupload nanti)</span>
              </label>
            </div>
          </div>

          {canInput ? (
            <button onClick={() => setStep1Done(true)} className="btn-primary bg-emerald-600 hover:bg-emerald-700 border-emerald-600 w-full py-4 text-lg shadow-lg">
              <CheckCircle2 size={20} className="mr-2"/> Konfirmasi Porsi
            </button>
          ) : (
            <div className="w-full py-3 text-center text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl font-medium">
              🔒 Anda tidak memiliki akses untuk mengisi laporan
            </div>
          )}
        </div>
      </div>

      {/* ─── STEP 2: KEUANGAN ─── */}
      <div className={`transition-all duration-500 ${currentStep !== 2 ? 'hidden' : 'block animate-slide-right'}`}>
        <div className="card p-6 md:p-8">
          <button onClick={() => setStep1Done(false)} className="text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-4"><ChevronLeft size={14}/> Kembali ke Porsi</button>
          
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-800">Pengeluaran hari ini — cek dan konfirmasi</h2>
            <p className="text-sm text-slate-500 mt-1">Angka diambil otomatis dari semua transaksi Kas Besar & Petty Cash yang sudah dicatat hari ini.</p>
          </div>

          <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-xl mb-6">
            <div className="p-6 text-slate-300 font-mono text-sm sm:text-base space-y-4">
              <div className="flex justify-between items-start border-b border-slate-700 pb-4">
                <div>
                  <p className="text-white font-semibold">Belanja Bahan Baku</p>
                  <p className="text-xs text-slate-400 mt-1">(dari {keuangan.poCount} PO + {keuangan.pettyCount} petty cash)</p>
                </div>
                <p className="text-white">Rp {keuangan.pengeluaranBahanBaku.toLocaleString('id-ID')}</p>
              </div>
              
              <div className="flex justify-between items-start border-b border-slate-700 pb-4">
                <div>
                  <p className="text-white font-semibold">Biaya Operasional</p>
                  <p className="text-xs text-slate-400 mt-1">(listrik, gas, dll)</p>
                </div>
                <p className="text-white">Rp {keuangan.pengeluaranOperasional.toLocaleString('id-ID')}</p>
              </div>

              <div className="flex justify-between items-start border-b border-slate-700 pb-4">
                <div>
                  <p className="text-white font-semibold">Insentif Relawan Hari Ini</p>
                  <p className="text-xs text-slate-400 mt-1">({keuangan.relawanCount} orang × rate masing-masing)</p>
                </div>
                <p className="text-white">Rp {keuangan.pengeluaranInsentif.toLocaleString('id-ID')}</p>
              </div>
            </div>
            
            <div className="bg-slate-900 p-6 flex justify-between items-center text-amber-400 font-bold text-lg sm:text-xl border-b border-slate-700">
              <span>TOTAL PENGELUARAN HARI INI:</span>
              <span>Rp {totalPengeluaran.toLocaleString('id-ID')}</span>
            </div>

            <div className="bg-emerald-900 p-6 flex flex-col gap-2 border-b border-emerald-700/50">
              <div className="flex justify-between items-center text-emerald-400 font-bold text-lg sm:text-xl">
                <div>
                  <span className="block text-white">ESTIMASI PENERIMAAN BGN HARI INI:</span>
                  <span className="text-xs font-normal text-emerald-200/80 block mt-1">
                    Porsi: Rp {pendapatanPorsi.toLocaleString('id-ID')} + Insentif: Rp {insentifRiil.toLocaleString('id-ID')}
                  </span>
                </div>
                <span className="text-white">Rp {totalPenerimaanHarian.toLocaleString('id-ID')}</span>
              </div>
              
              {!isSlaTerpenuhi ? (
                <div className="bg-rose-950/40 text-rose-300 text-xs p-3 rounded border border-rose-800/50 mt-2">
                  <span className="font-bold">⚠️ Perhatian:</span> Target Distribusi Porsi Hari Ini belum mencapai Service Level Agreement (SLA) minimal 90%. Insentif SPPG Rp 6.000.000 akan dipotong secara proporsional.
                </div>
              ) : (
                <div className="bg-emerald-800/40 text-emerald-200 text-xs p-3 rounded border border-emerald-600/50 mt-2">
                  <span className="font-bold">✅ Target SLA Tercapai:</span> Distribusi {persentasePorsi.toFixed(1)}%. Insentif operasional harian SPPG Rp 6 Juta cair secara penuh setelah Laporan 30a ini dikunci.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mb-8">
            <button onClick={() => navigate('/keuangan')} className="text-sm font-semibold text-blue-600 hover:underline">Ada pengeluaran yang belum tercatat? Tambahkan di sini →</button>
            <div className="text-right">
              <p className="text-xs text-slate-500">Saldo VA setelah hari ini</p>
              <p className="text-lg font-bold text-slate-800">Rp {keuangan.saldoVA.toLocaleString('id-ID')}</p>
            </div>
          </div>

          {canInput ? (
            <button onClick={() => setStep2Done(true)} className="btn-primary bg-emerald-600 hover:bg-emerald-700 border-emerald-600 w-full py-4 text-lg shadow-lg">
              <CheckCircle2 size={20} className="mr-2"/> Konfirmasi Keuangan
            </button>
          ) : (
            <div className="w-full py-3 text-center text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl font-medium">
              🔒 Anda tidak memiliki akses untuk mengkonfirmasi keuangan
            </div>
          )}
        </div>
      </div>

      {/* ─── STEP 3: KUNCI & KIRIM ─── */}
      <div className={`transition-all duration-500 ${currentStep !== 3 ? 'hidden' : 'block animate-slide-right'}`}>
        <div className="card p-6 md:p-8 border-2 border-blue-100">
          <button onClick={() => setStep2Done(false)} className="text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-4"><ChevronLeft size={14}/> Kembali ke Keuangan</button>
          
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-black text-slate-800">Preview & Kunci Laporan</h2>
            <p className="text-sm text-slate-500 mt-1">Tinjau data laporan terlebih dahulu. Laporan yang sudah dikunci akan dikirim ke BGN.</p>
          </div>

          {/* WAJIB PREVIEW SEBELUM KUNCI */}
          {!sudahPreview && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl mb-4">
              <Eye size={18} className="text-amber-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-800">Wajib Preview Sebelum Mengunci</p>
                <p className="text-xs text-amber-600 mt-0.5">Anda harus melihat preview dan memverifikasi data laporan sebelum dapat mengunci dan mengirim ke BGN.</p>
              </div>
              <button
                onClick={() => { setPreview30a(true); setSudahPreview(true); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
              >
                <Eye size={14} /> Buka Preview
              </button>
            </div>
          )}
          {sudahPreview && (
            <button
              onClick={() => setPreview30a(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 mb-4 border border-emerald-300 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-xl hover:bg-emerald-100 transition-colors"
            >
              <Eye size={15} /> Lihat Preview Lagi / Koreksi
            </button>
          )}

          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-center border border-emerald-100">
              <CheckCircle2 size={16} className="mx-auto mb-1 text-emerald-500"/>
              <p className="text-[10px] font-bold uppercase">Total Porsi</p>
              <p className="text-lg font-black">{totalPorsi}</p>
            </div>
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-center border border-emerald-100">
              <CheckCircle2 size={16} className="mx-auto mb-1 text-emerald-500"/>
              <p className="text-[10px] font-bold uppercase">Pengeluaran</p>
              <p className="text-sm sm:text-base font-black">Rp {(totalPengeluaran/1000000).toFixed(2)}M</p>
            </div>
            <div className="bg-blue-50 text-blue-800 p-3 rounded-xl text-center border border-blue-100">
              <CheckCircle2 size={16} className="mx-auto mb-1 text-blue-500"/>
              <p className="text-[10px] font-bold uppercase">Saldo VA (Est)</p>
              <p className="text-sm sm:text-base font-black">Rp {(keuangan.saldoVA/1000000).toFixed(1)}M</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6 flex items-start gap-3">
            <FileText className="text-blue-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-bold text-slate-800">Tanda Tangan Digital Laporan</p>
              <p className="text-xs text-slate-500 mt-1">Akan dikunci atas nama: <strong>{user?.nama || 'Kepala SPPG'}</strong> pada jam {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB.</p>
            </div>
          </div>

          <div className="mb-8">
            <label className="text-xs font-semibold text-slate-600 block mb-2">Catatan Tambahan (Opsional)</label>
            <textarea value={catatan} onChange={e=>setCatatan(e.target.value)} className="input text-sm w-full py-3 bg-white" rows={2} placeholder="Kondisi cuaca hujan deras saat distribusi..."></textarea>
          </div>

          {canKunci ? (
            <button 
              onClick={handleKunci} 
              disabled={isSubmitting || !sudahPreview}
              className="btn-primary w-full py-4 text-lg shadow-xl shadow-blue-500/20 group relative overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Mengunci Laporan...</span>
              ) : (
                <span className="flex items-center justify-center gap-2"><Lock size={20} className="group-hover:scale-110 transition-transform"/> Kunci & Kirim ke BGN</span>
              )}
            </button>
          ) : (
            <div className="w-full py-4 text-center text-sm font-bold text-slate-500 bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl">
              <Lock size={16} className="inline mr-2 opacity-50"/>Hanya Ka. SPPG, Pengawas Keuangan, atau BGN Coord yang dapat mengunci laporan
            </div>
          )}
        </div>
      </div>

      {/* RIWAYAT LAPORAN HARIAN */}
      <RiwayatLaporanHarian />

      {/* Preview Modal 30a */}
      <LaporanPreviewModal
        open={preview30a}
        onClose={() => setPreview30a(false)}
        judul="Laporan Harian BGN — Lampiran 30a"
        subJudul={new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
        sppgNama={sppg?.nama || 'SPPG'}
        periode={new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}
        sections={[
          { title: 'DATA DISTRIBUSI PORSI', rows: [
            { id:'tk',      label:'PAUD / TK',           value:porsi.tk,      editable:true,  format:'number' as const, unit:'porsi' },
            { id:'sd',      label:'SD / MI',             value:porsi.sd,      editable:true,  format:'number' as const, unit:'porsi' },
            { id:'smp',     label:'SMP / MTs',           value:porsi.smp,     editable:true,  format:'number' as const, unit:'porsi' },
            { id:'sma',     label:'SMA / MA / SMK',      value:porsi.sma,     editable:true,  format:'number' as const, unit:'porsi' },
            { id:'lainnya', label:'Bumil & Posyandu',    value:porsi.lainnya, editable:true,  format:'number' as const, unit:'porsi' },
            { id:'total',   label:'TOTAL PORSI',         value:totalPorsi,    bold:true, editable:false, format:'number' as const, unit:'porsi' },
          ], total:{ label:'Total Penerima Manfaat', value:totalPorsi, format:'number' as const, unit:'porsi' }},
          { title: 'KEUANGAN HARI INI', rows: [
            { id:'bahan', label:'Belanja Bahan Baku',  value:keuangan.pengeluaranBahanBaku,   colorClass:'negative', editable:true },
            { id:'ops',   label:'Biaya Operasional',   value:keuangan.pengeluaranOperasional,  colorClass:'negative', editable:true },
            { id:'inst',  label:'Insentif Relawan',    value:keuangan.pengeluaranInsentif,    colorClass:'negative', editable:true },
            { id:'total', label:'Total Pengeluaran',   value:totalPengeluaran, bold:true, colorClass:'negative', editable:false },
          ], total:{ label:'Total Pengeluaran Hari Ini', value:totalPengeluaran, accent:'#b91c1c' }},
          { title: 'ESTIMASI PENERIMAAN BGN', rows: [
            { id:'porsi_rp',    label:'Dana Porsi (Klaim BGN)',          value:pendapatanPorsi,       colorClass:'positive', editable:false },
            { id:'insentif',    label:'Insentif Harian SPPG',           value:insentifRiil,          colorClass:'positive', editable:false },
            { id:'total_terima',label:'Total Estimasi Penerimaan',      value:totalPenerimaanHarian, bold:true, colorClass:'positive', editable:false },
          ], total:{ label:'Estimasi Dana Masuk', value:totalPenerimaanHarian, accent:'#0f766e' }},
        ]}
        onSave={() => { toast.sukses('Koreksi laporan disimpan'); }}
      />
    </div>
  );
}

// ─── Komponen Riwayat Laporan Harian ─────────────────────────────────────────
const MOCK_RIWAYAT = [
  { id: 'rw-001', tanggal: '2026-05-15', status: 'dikunci', porsi: 2986, pengeluaran: 7330000 },
  { id: 'rw-002', tanggal: '2026-05-14', status: 'dikunci', porsi: 3020, pengeluaran: 7210000 },
  { id: 'rw-003', tanggal: '2026-05-13', status: 'dikunci', porsi: 2950, pengeluaran: 7100000 },
  { id: 'rw-004', tanggal: '2026-05-12', status: 'dikunci', porsi: 3100, pengeluaran: 7450000 },
];

function RiwayatLaporanHarian() {
  const [eksporLoading, setEksporLoading] = useState<string | null>(null);

  async function handleEkspor(id: string) {
    setEksporLoading(id);
    try {
      await eksporLaporanHarianSIPGN(id);
    } catch (e: any) {
      alert(`❌ Gagal: ${e?.message}`);
    } finally {
      setEksporLoading(null);
    }
  }

  return (
    <div className="mt-8 card p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <FileText size={16} className="text-blue-500" />
          Riwayat Laporan Harian
        </h3>
        <span className="text-xs text-slate-400">Klik baris untuk ekspor ke SIPGN</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Tanggal</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">Total Porsi</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">Pengeluaran</th>
              <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">Status</th>
              <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">SIPGN</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_RIWAYAT.map((lap) => (
              <tr key={lap.id} className="border-b border-slate-100 last:border-0 hover:bg-blue-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-700">
                  {new Date(lap.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-800">
                  {lap.porsi.toLocaleString('id-ID')} <span className="text-xs text-slate-400">porsi</span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-rose-700">
                  Rp {(lap.pengeluaran / 1_000_000).toFixed(2)} Jt
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <Lock size={10} /> Dikunci
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleEkspor(lap.id)}
                    disabled={eksporLoading === lap.id}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-blue-600 px-3 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {eksporLoading === lap.id ? (
                      <span className="w-3 h-3 border border-blue-400 border-t-blue-700 rounded-full animate-spin" />
                    ) : '📤'}
                    SIPGN
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Komponen Input Porsi
function PorsiInput({ label, value, onChange }: { label: string, value: number, onChange: (delta: number) => void }) {
  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
      <p className="text-xs sm:text-sm font-semibold text-slate-600 text-center mb-3 h-10 flex items-center justify-center">{label}</p>
      <div className="flex items-center justify-between gap-2 bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
        <button onClick={() => onChange(-1)} className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 rounded-lg flex items-center justify-center font-bold text-xl transition-colors">-</button>
        <input 
          type="number" 
          value={value} 
          onChange={(e) => onChange(parseInt(e.target.value) - value || 0)}
          className="font-display font-black text-2xl sm:text-3xl text-slate-800 flex-1 text-center w-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded bg-transparent appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none m-0" 
        />
        <button onClick={() => onChange(1)} className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 rounded-lg flex items-center justify-center font-bold text-xl transition-colors">+</button>
      </div>
    </div>
  );
}

function CalendarIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
}
