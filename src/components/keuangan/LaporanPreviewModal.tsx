/**
 * LaporanPreviewModal.tsx
 * Modal preview laporan sebelum dicetak/diunduh.
 * Mendukung koreksi manual per baris sebelum finalisasi.
 */
import { useRef, useState } from 'react';
import { X, Printer, Download, Edit3, Check, AlertCircle, ChevronRight, Save } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

export interface PreviewRow {
  id: string;
  label: string;
  sublabel?: string;
  value: number;
  editable?: boolean;
  indent?: number;
  bold?: boolean;
  separator?: boolean;
  colorClass?: string;
  format?: 'currency' | 'number' | 'text'; // default = currency
  unit?: string; // mis. 'porsi', 'orang', 'kg'
}

export interface PreviewSection {
  title: string;
  rows: PreviewRow[];
  total?: { label: string; value: number; accent?: string; format?: 'currency' | 'number'; unit?: string };
}

interface Props {
  open: boolean;
  onClose: () => void;
  judul: string;
  subJudul?: string;
  periode?: string;
  sppgNama?: string;
  sections: PreviewSection[];
  onSave?: (sections: PreviewSection[]) => void;
}

export default function LaporanPreviewModal({ open, onClose, judul, subJudul, periode, sppgNama, sections: initSections, onSave }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const [sections, setSections] = useState(initSections);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  if (!open) return null;

  const startEdit = (secIdx: number, rowId: string, currentVal: number) => {
    setEditingId(`${secIdx}:${rowId}`);
    setEditVal(String(currentVal));
  };

  const commitEdit = (secIdx: number, rowId: string) => {
    const num = Number(editVal.replace(/\D/g, ''));
    setSections(prev => prev.map((sec, si) =>
      si !== secIdx ? sec : {
        ...sec,
        rows: sec.rows.map(r => r.id === rowId ? { ...r, value: num } : r),
        total: sec.total ? { ...sec.total, value: sec.rows.reduce((s, r) => s + (r.id === rowId ? num : r.value), 0) } : undefined,
      }
    ));
    setEditingId(null);
    setHasChanges(true);
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>${judul}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'Segoe UI', sans-serif; font-size: 11px; color: #1e293b; padding: 24px; }
        h1 { font-size: 16px; font-weight: 700; margin-bottom: 2px; }
        .sub { font-size: 11px; color: #64748b; margin-bottom: 2px; }
        .meta { font-size: 10px; color: #94a3b8; margin-bottom: 20px; }
        .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4px; margin: 16px 0 6px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 5px 8px; border-bottom: 0.5px solid #f1f5f9; vertical-align: middle; }
        td.num { text-align: right; font-family: monospace; white-space: nowrap; }
        td.total { font-weight: 700; border-top: 1.5px solid #cbd5e1; }
        .positive { color: #0f766e; } .negative { color: #b91c1c; }
        .bold { font-weight: 700; }
        .indent1 { padding-left: 16px; } .indent2 { padding-left: 32px; }
        .separator { border-top: 1.5px solid #e2e8f0; }
        .footer { margin-top: 32px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
        @media print { body { padding: 16px; } }
      </style></head><body>
      <h1>${judul}</h1>
      <div class="sub">${subJudul || ''}</div>
      <div class="meta">${sppgNama ? sppgNama + ' · ' : ''}Periode: ${periode || '—'} · Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      ${sections.map(sec => `
        <div class="section-title">${sec.title}</div>
        <table>${sec.rows.filter(r => !r.separator).map(r => `
          <tr>
            <td class="${r.bold ? 'bold' : ''} ${r.indent === 1 ? 'indent1' : r.indent === 2 ? 'indent2' : ''}">${r.label}${r.sublabel ? '<br><span style="font-size:9px;color:#94a3b8">' + r.sublabel + '</span>' : ''}</td>
            <td class="num ${r.colorClass === 'positive' ? 'positive' : r.colorClass === 'negative' ? 'negative' : ''} ${r.bold ? 'bold' : ''}">${formatRupiah(r.value)}</td>
          </tr>`).join('')}
        ${sec.total ? `<tr><td class="total">${sec.total.label}</td><td class="num total">${formatRupiah(sec.total.value)}</td></tr>` : ''}
        </table>`).join('')}
      <div class="footer">Laporan ini dibuat otomatis oleh SPPG Manager · Bukan produk resmi BGN</div>
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl flex flex-col max-h-[90vh]">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center">
              <Printer size={14} className="text-slate-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Preview Laporan</h2>
              <p className="text-xs text-slate-400">{judul}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="flex items-center gap-1 text-[11px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded font-semibold">
                <Edit3 size={10} /> Ada koreksi manual
              </span>
            )}
            {hasChanges && onSave && (
              <button onClick={() => { onSave(sections); setHasChanges(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors">
                <Save size={12} /> Simpan Koreksi
              </button>
            )}
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
              <Printer size={12} /> Cetak / PDF
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Koreksi info */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500 flex-shrink-0">
          <AlertCircle size={11} className="text-slate-400" />
          Klik ikon <Edit3 size={10} className="inline mx-0.5 text-slate-400"/> pada baris untuk koreksi nilai sebelum mencetak. Koreksi tidak mengubah jurnal asli.
        </div>

        {/* Preview area */}
        <div className="overflow-y-auto flex-1 p-6" ref={printRef}>
          {/* Letterhead */}
          <div className="border-b-2 border-slate-800 pb-4 mb-5">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">{judul}</h1>
                {subJudul && <p className="text-sm text-slate-500 mt-0.5">{subJudul}</p>}
              </div>
              <div className="text-right text-xs text-slate-400">
                {sppgNama && <p className="font-semibold text-slate-600">{sppgNama}</p>}
                <p>Periode: <span className="font-mono">{periode || '—'}</span></p>
                <p>Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {/* Sections */}
          {sections.map((sec, si) => (
            <div key={si} className="mb-6">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1.5 mb-1">{sec.title}</div>
              <table className="w-full">
                <tbody>
                  {sec.rows.map(row => {
                    if (row.separator) return <tr key={row.id}><td colSpan={2} className="border-t-2 border-slate-200 pt-1" /></tr>;
                    const isEditing = editingId === `${si}:${row.id}`;
                    const indent = row.indent === 1 ? 'pl-5' : row.indent === 2 ? 'pl-10' : '';
                    const colorCls = row.colorClass === 'positive' ? 'text-emerald-700' : row.colorClass === 'negative' ? 'text-rose-600' : 'text-slate-800';
                    return (
                      <tr key={row.id} className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                        <td className={`py-2 pr-4 text-sm ${indent} ${row.bold ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
                          {row.label}
                          {row.sublabel && <span className="block text-[11px] text-slate-400 font-normal">{row.sublabel}</span>}
                        </td>
                        <td className="py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input type="number" value={editVal} onChange={e => setEditVal(e.target.value)}
                                  autoFocus
                                  className="w-36 px-2 py-1 text-xs font-mono border-2 border-blue-400 rounded text-right focus:outline-none"
                                  onKeyDown={e => { if (e.key === 'Enter') commitEdit(si, row.id); if (e.key === 'Escape') setEditingId(null); }} />
                                <button onClick={() => commitEdit(si, row.id)} className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"><Check size={11} /></button>
                                <button onClick={() => setEditingId(null)} className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"><X size={11} /></button>
                              </div>
                            ) : (
                              <>
                                <span className={`font-mono text-sm ${row.bold ? 'font-bold' : 'font-medium'} ${colorCls}`}>
                                  {row.format === 'number'
                                    ? row.value.toLocaleString('id-ID') + (row.unit ? ' ' + row.unit : '')
                                    : formatRupiah(row.value)}
                                </span>
                                {row.editable !== false && (
                                  <button onClick={() => startEdit(si, row.id, row.value)}
                                    className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-300 hover:text-blue-500 transition-all ml-1">
                                    <Edit3 size={11} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {sec.total && (
                  <tfoot>
                    <tr className="border-t-2 border-slate-300">
                      <td className="py-2.5 pr-4 text-sm font-bold text-slate-800">{sec.total.label}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-base" style={{ color: sec.total.accent || '#0f172a' }}>
                        {sec.total.format === 'number'
                          ? sec.total.value.toLocaleString('id-ID') + (sec.total.unit ? ' ' + sec.total.unit : '')
                          : formatRupiah(sec.total.value)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          ))}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-400 flex justify-between">
            <span>Laporan dibuat otomatis oleh SPPG Manager</span>
            <span>Bukan produk resmi BGN</span>
          </div>
        </div>
      </div>
    </div>
  );
}
