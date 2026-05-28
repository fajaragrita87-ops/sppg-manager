// ==============================
// FOTO STRUK OCR — Komponen Scan Struk Belanja
// Dipasang di form PO (penerimaan) dan Petty Cash
// ==============================

import { useState, useRef } from 'react';
import { Camera, RotateCcw, CheckCircle2, AlertTriangle, Loader2, ImageIcon, Sparkles, X } from 'lucide-react';
import { extractReceiptData, type ExtractedReceipt } from '@/lib/receipt-ocr';

// ─── Props ────────────────────────────────────────────────────────────────────

interface FotoStrukOCRProps {
  /** Callback saat user klik "Gunakan Data Ini" */
  onDataExtracted: (data: ExtractedReceipt) => void;
  /** Judul opsional */
  title?: string;
}

// ─── Status Flow ──────────────────────────────────────────────────────────────

type OCRStatus = 'idle' | 'preview' | 'loading' | 'result';

// ─── Format Rupiah ────────────────────────────────────────────────────────────

function fmtRp(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────

export default function FotoStrukOCR({ onDataExtracted, title = 'Scan Struk dengan AI' }: FotoStrukOCRProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<OCRStatus>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [mediaType, setMediaType] = useState<string>('image/jpeg');
  const [result, setResult] = useState<ExtractedReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Reset ──
  const handleReset = () => {
    setStatus('idle');
    setPreviewUrl(null);
    setImageBase64('');
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Pilih/ambil foto ──
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran (maks 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Ukuran foto terlalu besar. Maksimal 10MB.');
      return;
    }

    setMediaType(file.type || 'image/jpeg');
    setPreviewUrl(URL.createObjectURL(file));

    // Convert ke base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setImageBase64(base64);
      setStatus('preview');
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // ── Proses OCR ──
  const handleProcessOCR = async () => {
    if (!imageBase64) return;

    setStatus('loading');
    setError(null);

    try {
      const data = await extractReceiptData(imageBase64, mediaType);
      setResult(data);
      setStatus('result');
    } catch (err: any) {
      setError(err?.message ?? 'Gagal memproses struk. Coba foto ulang.');
      setStatus('preview');
    }
  };

  // ── Gunakan data ──
  const handleUseData = () => {
    if (!result) return;
    onDataExtracted(result);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full py-3.5 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 text-sm font-bold hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2.5 group"
      >
        <Sparkles size={16} className="text-blue-400 group-hover:text-blue-600 transition-colors" />
        📷 {title}
        <span className="text-[10px] font-medium text-blue-400 bg-blue-50 px-2 py-0.5 rounded-full">AI</span>
      </button>
    );
  }

  return (
    <div className="border-2 border-blue-200 bg-blue-50/30 rounded-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{title}</p>
            <p className="text-[10px] text-blue-200">Foto struk → AI baca otomatis → formulir terisi</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { setIsOpen(false); handleReset(); }}
          className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4">

        {/* ── STATUS: IDLE — Belum ada foto ── */}
        {status === 'idle' && (
          <div className="text-center py-8">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex flex-col items-center gap-3 cursor-pointer group"
            >
              <div className="w-20 h-20 bg-white border-2 border-dashed border-blue-300 rounded-2xl flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-50 transition-all">
                <Camera size={32} className="text-blue-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">Ambil Foto atau Pilih dari Galeri</p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG — Maks 10MB</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* ── STATUS: PREVIEW — Foto sudah ada, belum diproses ── */}
        {status === 'preview' && previewUrl && (
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <img
                src={previewUrl}
                alt="Preview struk"
                className="w-24 h-32 object-cover rounded-xl border-2 border-white shadow-md"
              />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <ImageIcon size={14} className="text-blue-500" /> Foto siap diproses
                </p>
                <p className="text-xs text-slate-400">Pastikan struk terlihat jelas dan tidak terpotong sebelum memproses.</p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleProcessOCR}
                    className="btn-primary text-xs py-2 px-4 bg-blue-600 hover:bg-blue-700 border-blue-700 flex items-center gap-1.5"
                  >
                    <Sparkles size={13} /> Proses dengan AI
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
                  >
                    <RotateCcw size={13} /> Ganti Foto
                  </button>
                </div>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-xs text-red-700">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {error}
              </div>
            )}
          </div>
        )}

        {/* ── STATUS: LOADING — AI sedang membaca ── */}
        {status === 'loading' && (
          <div className="text-center py-10 space-y-4">
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <Sparkles size={20} className="absolute inset-0 m-auto text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">AI sedang membaca struk Anda...</p>
              <p className="text-xs text-slate-400 mt-1">Biasanya 3–8 detik. Sabar ya! 🤖</p>
            </div>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Sedang diproses"
                className="w-16 h-20 object-cover rounded-lg border-2 border-blue-200 mx-auto opacity-50"
              />
            )}
          </div>
        )}

        {/* ── STATUS: RESULT — Hasil OCR ── */}
        {status === 'result' && result && (
          <div className="space-y-3">
            {/* Badge Confidence */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Hasil Scan AI</p>
              {result.confidence === 'high' && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={11} /> Akurasi Tinggi
                </span>
              )}
              {result.confidence === 'medium' && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <AlertTriangle size={11} /> Cek Kembali
                </span>
              )}
              {result.confidence === 'low' && (
                <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <AlertTriangle size={11} /> Akurasi Rendah
                </span>
              )}
            </div>

            {/* Card Info Umum */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Supplier</p>
                  <p className="font-bold text-slate-800">{result.supplier ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Tanggal</p>
                  <p className="font-bold text-slate-800">
                    {result.tanggal
                      ? new Date(result.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">No. Faktur</p>
                  <p className="font-bold text-slate-800">{result.no_faktur ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Jumlah Item</p>
                  <p className="font-bold text-slate-800">{result.items.length} baris</p>
                </div>
              </div>
            </div>

            {/* Tabel Items */}
            {result.items.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-2.5 text-left font-semibold">Nama Bahan</th>
                      <th className="p-2.5 text-center font-semibold">Qty</th>
                      <th className="p-2.5 text-right font-semibold">Harga</th>
                      <th className="p-2.5 text-right font-semibold">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.items.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2.5 font-medium text-slate-800">{item.nama}</td>
                        <td className="p-2.5 text-center text-slate-600">
                          {item.qty} {item.satuan}
                        </td>
                        <td className="p-2.5 text-right text-slate-600">{fmtRp(item.harga_satuan)}</td>
                        <td className="p-2.5 text-right font-bold text-slate-800">{fmtRp(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-blue-50">
                    <tr>
                      <td colSpan={3} className="p-3 text-right font-black text-blue-800 text-sm">TOTAL</td>
                      <td className="p-3 text-right font-black text-blue-700 text-sm">{fmtRp(result.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Warning: low confidence */}
            {result.confidence === 'low' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>AI kurang yakin</strong> dengan beberapa angka pada struk ini. Silakan periksa kembali sebelum menyimpan.
                  Coba foto ulang dengan pencahayaan lebih baik jika perlu.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleUseData}
                className="btn-primary text-xs py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 border-emerald-700 flex-1 flex items-center justify-center gap-2 font-bold"
              >
                <CheckCircle2 size={15} /> Gunakan Data Ini
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-1.5"
              >
                <RotateCcw size={13} /> Foto Ulang
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
