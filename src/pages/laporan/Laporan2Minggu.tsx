import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Settings, CheckCircle2, FileText, Download, FileSpreadsheet, Lock, Eye, AlertTriangle } from 'lucide-react';
import { toast } from '@/store/toastStore';
import { generateLampiran30c } from '@/lib/pdf-generator';
import LaporanPreviewModal, { PreviewSection } from '@/components/keuangan/LaporanPreviewModal';

const MOCK_DATA = {
  penerimaanBGN: 150000000,
  pengeluaran: {
    bahanBaku: 85000000,
    ops: 12000000,
    insentif: 25000000,
  },
  tabelPorsi: [
    { tanggal: '1 Jul', paud: 1200, sd1: 1000, sd4: 400, smp: 247, sma: 89, bumil: 50, total: 2986 },
    { tanggal: '2 Jul', paud: 1200, sd1: 1000, sd4: 400, smp: 247, sma: 89, bumil: 50, total: 2986 },
    { tanggal: '3 Jul', paud: 1195, sd1: 990, sd4: 395, smp: 240, sma: 89, bumil: 50, total: 2959 },
  ]
};

export default function Laporan2MingguPage() {
  const { sppg, user } = useAuthStore();
  const [periode, setPeriode] = useState('1–15 Juli 2025');
  const [status, setStatus] = useState<'draft' | 'generated' | 'approved_sppg' | 'approved_yayasan' | 'submitted'>('draft');
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState(false);
  const [sudahPreview, setSudahPreview] = useState(false);

  const { bahanBaku, ops, insentif } = MOCK_DATA.pengeluaran;
  const totalPengeluaran = bahanBaku + ops + insentif;
  const sisaDana = MOCK_DATA.penerimaanBGN - totalPengeluaran;

  const totalPorsiAll = MOCK_DATA.tabelPorsi.reduce((a, b) => a + b.total, 0);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setStatus('generated');
      setSudahPreview(false); // reset — wajib preview ulang sebelum submit
      toast.sukses('Laporan berhasil diagregasi dari data harian.');
    }, 1500);
  };

  const PREVIEW_SECTIONS: PreviewSection[] = [
    { title: 'A. PENERIMAAN', rows: [{ id:'bgn', label:'Penerimaan dari BGN', value:MOCK_DATA.penerimaanBGN, colorClass:'positive', editable:true }], total:{label:'Total Penerimaan',value:MOCK_DATA.penerimaanBGN,accent:'#0f766e'} },
    { title: 'B. PENGELUARAN', rows: [
      { id:'bahan', label:'1. Pembelian Bahan Baku', value:MOCK_DATA.pengeluaran.bahanBaku, editable:true },
      { id:'ops',   label:'2. Biaya Operasional',    value:MOCK_DATA.pengeluaran.ops,      editable:true },
      { id:'inst',  label:'3. Insentif Fasilitas & Relawan', value:MOCK_DATA.pengeluaran.insentif, editable:true },
    ], total:{label:'Total Pengeluaran',value:totalPengeluaran,accent:'#b91c1c'} },
    { title: 'C. SALDO', rows: [{ id:'sisa', label:'Sisa Dana (A - B)', value:sisaDana, bold:true, colorClass: sisaDana>=0?'positive':'negative', editable:false }] },
    { title: 'D. REKAPITULASI PORSI HARIAN (jumlah porsi makanan per hari)', rows: MOCK_DATA.tabelPorsi.map((t,i)=>({ id:'p'+i, label:t.tanggal, sublabel:`PAUD:${t.paud} | SD 1-3:${t.sd1} | SD 4-6:${t.sd4} | SMP:${t.smp} | SMA:${t.sma} | Bumil:${t.bumil}`, value:t.total, editable:true, format:'number' as const, unit:'porsi' })), total:{label:'Total Porsi (Estimasi Full Periode)', value:totalPorsiAll*5, format:'number' as const, unit:'porsi'} },
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Laporan 2 Mingguan</h1>
          <p className="text-slate-500 mt-1">Lampiran 30c BGN — Laporan Realisasi Penggunaan Dana Per 2 Minggu</p>
        </div>
        <div className="flex items-center gap-3">
          {status === 'draft' && <span className="badge-neutral px-3 py-1 font-semibold">Draft</span>}
          {['generated', 'approved_sppg', 'approved_yayasan'].includes(status) && <span className="badge-warning px-3 py-1 font-semibold">Menunggu Finalisasi</span>}
          {status === 'submitted' && <span className="badge-success px-3 py-1 font-semibold"><CheckCircle2 size={14} className="inline mr-1"/> Submitted</span>}
          
          <select value={periode} onChange={e=>setPeriode(e.target.value)} className="select text-sm font-bold bg-white shadow-sm border-slate-300">
            <option>1–15 Juli 2025</option>
            <option>16–31 Juli 2025</option>
          </select>
        </div>
      </div>

      {status === 'draft' ? (
        <div className="card p-12 text-center border-2 border-dashed border-slate-200">
          <Settings size={48} className="mx-auto text-slate-300 mb-4 animate-[spin_4s_linear_infinite]" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Generate Laporan 2 Mingguan</h2>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">Sistem akan mengumpulkan dan merekap semua laporan harian dan transaksi pada periode {periode}.</p>
          <button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="btn-secondary py-3 px-8 text-sm font-semibold shadow-sm"
          >
            {isGenerating ? 'Mengumpulkan data dari laporan harian...' : '⚙️ Generate Laporan Sekarang'}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-slide-up">
          {/* ACTION BAR */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setStatus('approved_sppg')} 
                disabled={!sudahPreview || ['approved_sppg', 'approved_yayasan', 'submitted'].includes(status)}
                className={`btn-primary text-xs ${['approved_sppg', 'approved_yayasan', 'submitted'].includes(status) ? 'bg-emerald-600 border-emerald-600' : ''} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <CheckCircle2 size={16} className="mr-1"/> 
                {['approved_sppg', 'approved_yayasan', 'submitted'].includes(status) ? 'Disetujui Ka.SPPG' : 'Setujui (Ka.SPPG)'}
              </button>
              <button 
                onClick={() => setStatus('approved_yayasan')} 
                disabled={!sudahPreview || !['approved_sppg'].includes(status) || ['approved_yayasan', 'submitted'].includes(status)}
                className={`btn-primary text-xs ${['approved_yayasan', 'submitted'].includes(status) ? 'bg-emerald-600 border-emerald-600' : ''} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <CheckCircle2 size={16} className="mr-1"/> 
                {['approved_yayasan', 'submitted'].includes(status) ? 'Disetujui Yayasan' : 'Setujui (Yayasan)'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setPreview(true); setSudahPreview(true); }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  sudahPreview
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100 animate-pulse'
                }`}
              >
                <Eye size={13}/>
                {sudahPreview ? 'Lihat Preview' : '⚠ Wajib Preview Dulu'}
              </button>
              <button onClick={() => toast.info('Export Excel akan segera diaktifkan')} className="btn-secondary text-xs"><FileSpreadsheet size={16} className="mr-1.5"/>Excel</button>
              <button 
                disabled={!sudahPreview}
                onClick={() => { toast.info('Menyiapkan dokumen PDF...'); generateLampiran30c({ sppg, periode, laporan: MOCK_DATA }); }}
                className="btn-primary bg-blue-600 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download size={16} className="mr-1.5"/>Download 30c (PDF)
              </button>
            </div>
          </div>

          {/* DOCUMENT PREVIEW */}
          <div className="card p-8 md:p-12 shadow-sm border border-slate-200 bg-white font-serif relative overflow-hidden">
            {/* Watermark for draft */}
            {status !== 'submitted' && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 text-[150px] font-black text-slate-100 opacity-50 select-none pointer-events-none z-0">DRAFT</div>}
            
            <div className="relative z-10">
              <div className="text-center mb-10 border-b-2 border-slate-800 pb-6">
                <h2 className="text-xl font-bold uppercase tracking-wide">Laporan Realisasi Penggunaan Dana</h2>
                <h3 className="text-lg font-bold mt-1">Badan Gizi Nasional</h3>
                <p className="mt-4 text-sm font-sans font-medium text-slate-600">Periode: {periode}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 text-sm font-sans font-semibold text-slate-800">
                <div>
                  <p>Nama Satpel (SPPG) : {sppg?.nama || 'SPPG Percobaan'}</p>
                  <p className="mt-1">Kepala SPPG : {user?.nama || 'Ahmad Fauzi'}</p>
                </div>
                <div className="text-right">
                  <p>Kab/Kota : Jawa Barat / Bandung</p>
                </div>
              </div>

              <h4 className="font-bold text-slate-800 mb-4 bg-slate-100 p-2 font-sans">A. REKAPITULASI KEUANGAN</h4>
              <table className="w-full text-sm font-sans mb-10">
                <tbody>
                  <tr>
                    <td className="py-2 px-4 font-semibold w-2/3 border-t border-slate-200 border-l border-r">A. Penerimaan dari BGN</td>
                    <td className="py-2 px-4 text-right font-bold border-t border-slate-200 border-r">Rp {MOCK_DATA.penerimaanBGN.toLocaleString('id-ID')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-semibold border-t border-slate-200 border-l border-r">B. Pengeluaran:</td>
                    <td className="py-2 px-4 text-right border-t border-slate-200 border-r"></td>
                  </tr>
                  <tr>
                    <td className="py-1 px-8 border-l border-r text-slate-700">1. Pembelian Bahan Baku</td>
                    <td className="py-1 px-4 text-right border-r">Rp {bahanBaku.toLocaleString('id-ID')}</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-8 border-l border-r text-slate-700">2. Biaya Operasional</td>
                    <td className="py-1 px-4 text-right border-r">Rp {ops.toLocaleString('id-ID')}</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-8 border-l border-r text-slate-700 pb-3">3. Insentif Fasilitas & Relawan</td>
                    <td className="py-1 px-4 text-right border-r pb-3">Rp {insentif.toLocaleString('id-ID')}</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="py-2 px-8 font-bold border-t border-b border-l border-r">Total Pengeluaran</td>
                    <td className="py-2 px-4 text-right font-bold text-rose-700 border-t border-b border-r">Rp {totalPengeluaran.toLocaleString('id-ID')}</td>
                  </tr>
                  <tr className="bg-blue-50/50">
                    <td className="py-3 px-4 font-bold border-b border-l border-r">C. Sisa Dana (A - B)</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-800 border-b border-r">Rp {sisaDana.toLocaleString('id-ID')}</td>
                  </tr>
                </tbody>
              </table>

              <h4 className="font-bold text-slate-800 mb-4 bg-slate-100 p-2 font-sans">B. REALISASI PENERIMA MANFAAT</h4>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-xs font-sans text-center border-collapse border border-slate-300">
                  <thead className="bg-slate-100 font-semibold">
                    <tr>
                      <th className="border border-slate-300 p-2">Tanggal</th>
                      <th className="border border-slate-300 p-2">PAUD/TK</th>
                      <th className="border border-slate-300 p-2">SD 1-3</th>
                      <th className="border border-slate-300 p-2">SD 4-6</th>
                      <th className="border border-slate-300 p-2">SMP</th>
                      <th className="border border-slate-300 p-2">SMA</th>
                      <th className="border border-slate-300 p-2">Bumil/3B</th>
                      <th className="border border-slate-300 p-2 font-bold bg-slate-200">Total Harian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_DATA.tabelPorsi.map((t, i) => (
                      <tr key={i}>
                        <td className="border border-slate-300 p-2 font-medium">{t.tanggal}</td>
                        <td className="border border-slate-300 p-2">{t.paud}</td>
                        <td className="border border-slate-300 p-2">{t.sd1}</td>
                        <td className="border border-slate-300 p-2">{t.sd4}</td>
                        <td className="border border-slate-300 p-2">{t.smp}</td>
                        <td className="border border-slate-300 p-2">{t.sma}</td>
                        <td className="border border-slate-300 p-2">{t.bumil}</td>
                        <td className="border border-slate-300 p-2 font-bold bg-slate-50">{t.total.toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                    <tr><td colSpan={8} className="border border-slate-300 p-2 text-slate-400 italic">... data 12 hari lainnya disembunyikan untuk preview ...</td></tr>
                  </tbody>
                  <tfoot className="bg-slate-100 font-bold">
                    <tr>
                      <td colSpan={7} className="border border-slate-300 p-2 text-right">TOTAL PORSI PERIODE INI</td>
                      <td className="border border-slate-300 p-2 bg-blue-100 text-blue-800 text-sm">{(totalPorsiAll * 5).toLocaleString('id-ID')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between font-sans">
                <div>
                  <h5 className="font-bold text-blue-900 text-sm">Nominatif Insentif Relawan</h5>
                  <p className="text-xs text-blue-700 mt-1">Daftar presensi dan insentif terlampir terpisah sesuai Juknis BGN.</p>
                </div>
                <button className="text-xs font-bold text-blue-600 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow border border-blue-100">
                  Lihat Lampiran 30l &rarr;
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      <LaporanPreviewModal
        open={preview}
        onClose={() => setPreview(false)}
        judul="Laporan Realisasi Penggunaan Dana"
        subJudul="Lampiran 30c BGN — 2 Mingguan"
        periode={periode}
        sppgNama={sppg?.nama || 'SPPG'}
        sections={PREVIEW_SECTIONS}
        onSave={(s) => { toast.sukses('Koreksi preview disimpan'); }}
      />
    </div>
  );
}
