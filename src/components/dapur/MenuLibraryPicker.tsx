import { useState, useMemo } from 'react';
import { Search, X, CheckCircle2, MapPin, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { MENU_LIBRARY, type MenuLibraryItem } from '@/data/menu-library';

interface Props { onMenuPicked: (menu: MenuLibraryItem) => void; }

const DAERAH_LIST = ['Semua Daerah', 'Nasional', ...Array.from(new Set(MENU_LIBRARY.flatMap(m => m.daerah).filter(d => d !== 'Nasional'))).sort()];
const TAG_LIST = ['kearifan-lokal', 'nabati', 'hewani', 'hemat'];

export default function MenuLibraryPicker({ onMenuPicked }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [daerah, setDaerah] = useState('Semua Daerah');
  const [waktu, setWaktu] = useState<'' | 'pagi' | 'siang'>('');
  const [validasiOnly, setValidasiOnly] = useState(false);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return MENU_LIBRARY.filter(m => {
      if (search && !m.nama.toLowerCase().includes(search.toLowerCase()) && !m.bahan_utama.some(b => b.toLowerCase().includes(search.toLowerCase()))) return false;
      if (daerah !== 'Semua Daerah' && !m.daerah.includes(daerah)) return false;
      if (waktu && m.waktu_makan !== waktu) return false;
      if (validasiOnly && !m.validasi_aksg) return false;
      if (tagFilter.length > 0 && !tagFilter.some(t => m.tag.includes(t))) return false;
      return true;
    });
  }, [search, daerah, waktu, validasiOnly, tagFilter]);

  const toggleTag = (t: string) => setTagFilter(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  if (!open) return (
    <button type="button" onClick={() => setOpen(true)} className="btn-secondary text-xs py-2 flex items-center gap-2">
      📚 Pilih dari Library Menu
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-white w-full sm:max-w-3xl sm:rounded-2xl sm:max-h-[85vh] max-h-full flex flex-col overflow-hidden animate-slide-up shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div><h2 className="font-bold text-slate-800">📚 Library Menu SPPG</h2><p className="text-xs text-slate-500 mt-0.5">{filtered.length} menu dari {MENU_LIBRARY.length} tersedia</p></div>
          <button onClick={() => setOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><X size={20} /></button>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 space-y-3 border-b border-slate-100 shrink-0 bg-white">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari menu atau bahan..." className="input text-sm w-full pl-9 py-2" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={daerah} onChange={e => setDaerah(e.target.value)} className="select text-xs py-1.5 min-w-[120px]">
              {DAERAH_LIST.map(d => <option key={d}>{d}</option>)}
            </select>
            <select value={waktu} onChange={e => setWaktu(e.target.value as any)} className="select text-xs py-1.5">
              <option value="">Semua Waktu</option><option value="pagi">Pagi</option><option value="siang">Siang</option>
            </select>
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-blue-50">
              <input type="checkbox" checked={validasiOnly} onChange={e => setValidasiOnly(e.target.checked)} className="w-3.5 h-3.5 text-blue-600 rounded" />
              ✓ Validasi AKG saja
            </label>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {TAG_LIST.map(t => (
              <button key={t} onClick={() => toggleTag(t)} className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${tagFilter.includes(t) ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-200'}`}>
                {t === 'kearifan-lokal' ? '🏠' : t === 'nabati' ? '🌱' : t === 'hewani' ? '🍗' : '💰'} {t}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400"><p className="text-sm font-medium">Tidak ada menu yang cocok.</p><p className="text-xs mt-1">Coba ubah filter pencarian.</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map(m => (
                <div key={m.id} className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all bg-white">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-slate-800 leading-tight cursor-pointer hover:text-blue-700" onClick={() => setExpanded(expanded === m.id ? null : m.id)}>{m.nama}</h3>
                    {m.validasi_aksg && <span className="shrink-0 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><CheckCircle2 size={9} />BGN</span>}
                  </div>
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    {m.daerah.map(d => <span key={d} className="text-[9px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-0.5"><MapPin size={8} />{d}</span>)}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {m.bahan_utama.slice(0, 4).map(b => <span key={b} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{b}</span>)}
                  </div>
                  <p className="text-[10px] text-slate-500 mb-3">~{m.estimasi_kkal} kkal · {m.estimasi_protein_g}g protein</p>

                  {expanded === m.id && (
                    <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 animate-fade-in">
                      <p className="leading-relaxed">{m.deskripsi}</p>
                      <div className="flex flex-wrap gap-1 mt-2">{m.tag.map(t => <span key={t} className="text-[9px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">#{t}</span>)}</div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => { onMenuPicked(m); setOpen(false); }} className="flex-1 btn-primary text-[10px] py-1.5 bg-blue-600 hover:bg-blue-700 border-blue-700">+ Tambah ke Rencana</button>
                    <button onClick={() => setExpanded(expanded === m.id ? null : m.id)} className="btn-ghost p-1.5">{expanded === m.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
