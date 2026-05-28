import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Settings, CheckCircle2, Download, FileSpreadsheet, Layers, Eye } from 'lucide-react';
import { toast } from '@/store/toastStore';
import { generateLampiran30d } from '@/lib/pdf-generator';
import LaporanPreviewModal, { PreviewSection } from '@/components/keuangan/LaporanPreviewModal';

export default function LaporanBulananPage() {
  const { sppg, user } = useAuthStore();
  const [periode, setPeriode] = useState('Juli 2025');
  const [status, setStatus] = useState<'draft' | 'generated' | 'submitted'>('draft');
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState(false);
  const [sudahPreview, setSudahPreview] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setStatus('generated');
      setSudahPreview(false);
      toast.sukses('3 Lampiran Bulanan berhasil diagregasi.');
    }, 2000);
  };

  const PREVIEW_SECTIONS: PreviewSection[] = [
    { title: 'LAMPIRAN 30d-A: KEUANGAN BULANAN', rows: [
      { id:'bgn',   label:'Total Penerimaan dari BGN',  value:300000000,  colorClass:'positive', editable:true },
      { id:'bahan', label:'Pengeluaran Bahan Baku',      value:170000000,  colorClass:'negative', editable:true },
      { id:'ops',   label:'Pengeluaran Operasional',     value:24000000,   colorClass:'negative', editable:true },
      { id:'inst',  label:'Insentif Relawan',            value:50000000,   colorClass:'negative', editable:true },
      { id:'sisa',  label:'Sisa Dana Akhir Bulan',       value:56000000,   bold:true, colorClass:'positive', editable:false },
    ]},
    { title: 'LAMPIRAN 30d-C: PENERIMA MANFAAT', rows: [
      { id:'porsi', label:'Total Porsi Tersalurkan', value:89580, editable:true, format:'number' as const, unit:'porsi' },
    ], total:{ label:'Total Penerima Manfaat', value:89580, format:'number' as const, unit:'porsi' }},
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Laporan Bulanan SPPG</h1>
          <p className="text-slate-500 mt-1">Lampiran 30d (A, B, C) — Ringkasan Kinerja & Keuangan Bulanan</p>
        </div>
        <div className="flex items-center gap-3">
          {status === 'draft' && <span className="badge-neutral px-3 py-1 font-semibold">Draft</span>}
          {status === 'generated' && <span className="badge-warning px-3 py-1 font-semibold">Siap Dikirim</span>}
          {status === 'submitted' && <span className="badge-success px-3 py-1 font-semibold"><CheckCircle2 size={14} className="inline mr-1"/> Submitted</span>}
          
          <select value={periode} onChange={e=>setPeriode(e.target.value)} className="select text-sm font-bold bg-white shadow-sm border-slate-300">
            <option>Juli 2025</option>
            <option>Agustus 2025</option>
            <option>September 2025</option>
          </select>
        </div>
      </div>

      {status === 'draft' ? (
        <div className="card p-12 text-center border-2 border-dashed border-slate-200">
          <Layers size={48} className="mx-auto text-blue-300 mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Tutup Buku Bulanan</h2>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">Sistem akan mengompilasi semua aktivitas dari tanggal 1 hingga 31 {periode} menjadi 3 buah lampiran resmi BGN.</p>
          <button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="btn-primary py-3 px-8 text-sm font-semibold shadow-lg shadow-blue-500/30"
          >
            {isGenerating ? 'Memproses 3 Lampiran...' : 'Tutup Buku & Generate Laporan'}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-slide-up">
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-8 flex items-start gap-3">
            <CheckCircle2 className="text-emerald-600 mt-0.5 shrink-0" size={20}/>
            <div>
              <h3 className="font-bold text-emerald-800">Laporan Bulanan Siap Dikirim</h3>
              <p className="text-sm text-emerald-700 mt-1">Laporan ini merupakan gabungan dari Laporan 2 Mingguan. <strong>Wajib preview</strong> sebelum mengirimkan ke BGN.</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {/* WAJIB PREVIEW */}
              <button
                onClick={() => { setPreview(true); setSudahPreview(true); }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  sudahPreview
                    ? 'border-emerald-400 bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100 animate-pulse'
                }`}
              >
                <Eye size={13}/> {sudahPreview ? 'Lihat Preview' : '⚠ Wajib Preview Dulu'}
              </button>
              {status !== 'submitted' && (
                <button
                  disabled={!sudahPreview}
                  onClick={() => { setStatus('submitted'); toast.sukses('Laporan Bulanan resmi dikirim ke SIPGN.'); }}
                  className="btn-primary bg-emerald-600 border-emerald-600 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Kirim ke BGN
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lampiran A */}
            <div className="card p-6 flex flex-col h-full border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-slate-800 mb-1">Lampiran 30d-A</h3>
              <p className="text-xs font-semibold text-blue-600 mb-4">Summary Bulanan Keuangan</p>
              <p className="text-sm text-slate-500 mb-6 flex-1">Rekapitulasi total penerimaan dana BGN dan pengeluaran per kategori selama satu bulan penuh.</p>
              <button onClick={() => { toast.info('Menyiapkan dokumen PDF...'); generateLampiran30d({ sppg, periode }); }} className="btn-secondary w-full justify-center text-xs bg-slate-50 border-slate-200 mb-2 hover:bg-slate-100"><Download size={14} className="mr-1.5"/> Download PDF</button>
              <button className="btn-ghost w-full justify-center text-xs text-blue-600"><FileSpreadsheet size={14} className="mr-1.5"/> Excel</button>
            </div>

            {/* Lampiran B */}
            <div className="card p-6 flex flex-col h-full border-t-4 border-t-amber-500 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-slate-800 mb-1">Lampiran 30d-B</h3>
              <p className="text-xs font-semibold text-amber-600 mb-4">Anggaran Buku Kas Umum</p>
              <p className="text-sm text-slate-500 mb-6 flex-1">Rincian seluruh mutasi masuk dan keluar dari Kas Besar SPPG beserta saldo berjalannya.</p>
              <button onClick={() => { toast.info('Menyiapkan dokumen PDF...'); generateLampiran30d({ sppg, periode }); }} className="btn-secondary w-full justify-center text-xs bg-slate-50 border-slate-200 mb-2 hover:bg-slate-100"><Download size={14} className="mr-1.5"/> Download PDF</button>
              <button className="btn-ghost w-full justify-center text-xs text-blue-600"><FileSpreadsheet size={14} className="mr-1.5"/> Excel</button>
            </div>

            {/* Lampiran C */}
            <div className="card p-6 flex flex-col h-full border-t-4 border-t-emerald-500 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-slate-800 mb-1">Lampiran 30d-C</h3>
              <p className="text-xs font-semibold text-emerald-600 mb-4">Rekap Penerima Manfaat</p>
              <p className="text-sm text-slate-500 mb-6 flex-1">Total kumulatif porsi makan gizi yang disalurkan ke seluruh satuan pendidikan & posyandu.</p>
              <button onClick={() => { toast.info('Menyiapkan dokumen PDF...'); generateLampiran30d({ sppg, periode }); }} className="btn-secondary w-full justify-center text-xs bg-slate-50 border-slate-200 mb-2 hover:bg-slate-100"><Download size={14} className="mr-1.5"/> Download PDF</button>
              <button className="btn-ghost w-full justify-center text-xs text-blue-600"><FileSpreadsheet size={14} className="mr-1.5"/> Excel</button>
            </div>
          </div>
          
        </div>
      )}

      <LaporanPreviewModal
        open={preview}
        onClose={() => setPreview(false)}
        judul="Laporan Bulanan SPPG"
        subJudul="Lampiran 30d (A, B, C) — Ringkasan Kinerja & Keuangan Bulanan"
        periode={periode}
        sppgNama={sppg?.nama || 'SPPG'}
        sections={PREVIEW_SECTIONS}
        onSave={(s) => { toast.sukses('Koreksi preview disimpan'); }}
      />
    </div>
  );
}
