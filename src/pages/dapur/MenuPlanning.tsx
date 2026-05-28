import { useState, useMemo } from 'react';
import { Calendar, ClipboardList, ShieldCheck, Lock, ChevronLeft, ChevronRight, Plus, Trash2, Zap, Sparkles, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import type { KategoriPM } from '@/lib/gizi-calculator';
import { STANDAR_AKG, validasiNutrisi } from '@/lib/gizi-calculator';
import { toast } from '@/store/toastStore';
import MenuLibraryPicker from '@/components/dapur/MenuLibraryPicker';
import type { MenuLibraryItem } from '@/data/menu-library';

const TABS = [
  { id: 'kalender', label: 'Kalender Menu', icon: Calendar },
  { id: 'master', label: 'Master Menu', icon: ClipboardList },
  { id: 'validasi', label: 'Validasi Gizi & AI', icon: ShieldCheck },
];

const MOCK_MENUS = [
  { id: 'm1', nama: 'Nasi Ayam Teriyaki + Sayur', kategori: 'SD 1-3' as KategoriPM, kkal: 550, protein_g: 18, lemak_g: 20, karbo_g: 65 },
  { id: 'm2', nama: 'Nasi Ikan Gurame + Bayam', kategori: 'SMP' as KategoriPM, kkal: 700, protein_g: 25, lemak_g: 25, karbo_g: 90 },
];

export default function MenuPlanning() {
  const [tab, setTab] = useState('kalender');

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-fade-in pb-12">
      <div className="bg-white p-5 rounded-2xl border" style={{ borderColor: '#e2e8f0' }}>
        <h1 className="font-display text-xl font-semibold text-slate-900">Perencanaan Menu</h1>
        <p className="text-sm text-slate-500 mt-1">Siklus Menu & Kepatuhan Gizi BGN</p>
      </div>

      <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 overflow-x-auto">
        {TABS.map(t => {
          const isActive = tab === t.id;
          const Icon = t.icon;
          return (
            <button 
              key={t.id} 
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 px-4 text-xs sm:text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all whitespace-nowrap ${isActive ? 'bg-white text-blue-700 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Icon size={16} className={isActive ? 'text-blue-500' : 'opacity-50'} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'kalender' && <TabKalender />}
      {tab === 'master' && <TabMasterMenu />}
      {tab === 'validasi' && <TabValidasiGizi />}

    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 1: KALENDER
// ════════════════════════════════════════════════════════════════════════════
function TabKalender() {
  const user = useAuthStore(s => s.user);
  const role = user?.role ?? '';
  const [locked, setLocked] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [gantiMenuMode, setGantiMenuMode] = useState(false);
  const [customMenus, setCustomMenus] = useState<Record<string, string>>({}); // "YYYY-M-D" -> nama menu

  // Navigatable calendar state
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });
  const prevMonth = () => setCurrentDate(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; });
  const nextMonth = () => setCurrentDate(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; });

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay(); // 0=Sun

  const BULAN_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  const days: (number | null)[] = [];
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const dateKey = (d: number) => `${year}-${month}-${d}`;
  const hasMenu = (d: number) => d % 2 !== 0 && d < 25; // mock pattern — bisa diganti data nyata

  const ROLES_BISA_KUNCI = ['owner', 'kasppg', 'pengawas_gizi', 'bgn_coord'];
  const toggleLock = () => {
    if (!ROLES_BISA_KUNCI.includes(role)) {
      return toast.error('Akses Ditolak', 'Hanya Owner, Ka.SPPG, Pengawas Gizi, atau BGN Coord yang bisa mengunci menu.');
    }
    setLocked(prev => !prev);
    toast.sukses(locked ? 'Kunci menu dibuka' : 'Menu bulan ini dikunci!');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 animate-fade-in">
      <div className="flex-1 card p-5">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="btn-ghost p-1 hover:bg-slate-100 rounded-lg"><ChevronLeft size={16}/></button>
            <h2 className="font-semibold text-slate-800 min-w-[140px] text-center">{BULAN_ID[month]} {year}</h2>
            <button onClick={nextMonth} className="btn-ghost p-1 hover:bg-slate-100 rounded-lg"><ChevronRight size={16}/></button>
          </div>
          <button onClick={toggleLock} className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${locked ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            <Lock size={14} /> {locked ? 'Terkunci' : 'Kunci Menu'}
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-medium text-slate-500 mb-2">
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((d, i) => {
            if (!d) return <div key={i} className="aspect-square bg-slate-50 rounded-lg" />;
            const isSelected = selectedDate === d;
            const menuAdaDisini = hasMenu(d);
            const namaMenu = customMenus[dateKey(d)];
            const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

            return (
              <button 
                key={i} 
                onClick={() => { setSelectedDate(d); setGantiMenuMode(false); }}
                className={`aspect-square sm:aspect-auto sm:h-20 border rounded-lg p-1.5 flex flex-col items-start justify-start transition-all ${
                  isToday ? 'border-blue-400 ring-2 ring-blue-100' :
                  isSelected ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-blue-300'
                }`}
                style={{ background: menuAdaDisini || namaMenu ? '#f8fafc' : '#ffffff' }}
              >
                <div className="flex justify-between w-full items-center">
                  <span className={`text-xs font-semibold ${isToday ? 'text-blue-600' : isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>{d}</span>
                  {isToday && <span className="text-[8px] font-bold text-blue-500">Hari ini</span>}
                  {locked && <Lock size={10} className="text-amber-500" />}
                </div>
                {(namaMenu || menuAdaDisini) && (
                  <div className="mt-1 w-full text-left">
                    <p className="text-[9px] sm:text-[10px] font-medium text-slate-800 leading-tight line-clamp-2">{namaMenu || 'Ayam Teriyaki'}</p>
                    <span className="inline-block mt-0.5 px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-[8px] font-semibold">SD 1-3</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5"><AlertCircle size={14} /> Sesuai juknis BGN, menu harus dikunci minimal H-30 sebelum pelaksanaan.</p>
      </div>

      {/* RIGHT PANEL */}
      <div className="lg:w-80 shrink-0">
        <div className="card p-5 sticky top-5">
          {selectedDate ? (
            <div className="animate-slide-left space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-semibold text-slate-800">{selectedDate} {BULAN_ID[month]} {year}</h3>
                <p className="text-xs text-slate-500">Jadwal distribusi: Siang</p>
              </div>

              {(hasMenu(selectedDate) || customMenus[dateKey(selectedDate)]) ? (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <span className="badge-info text-[10px] mb-1">SD 1-3</span>
                    <p className="text-sm font-semibold text-blue-900 leading-tight">
                      {selectedDate && (customMenus[dateKey(selectedDate)] || 'Nasi Ayam Teriyaki + Sayur Bayam')}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 border border-slate-200 rounded-lg"><p className="text-slate-500">Kalori</p><p className="font-bold text-slate-800">550 kkal</p></div>
                    <div className="p-2 border border-slate-200 rounded-lg"><p className="text-slate-500">Protein</p><p className="font-bold text-slate-800">18 g</p></div>
                  </div>

                  {!locked && (
                    gantiMenuMode ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-blue-700">Pilih menu pengganti dari library:</p>
                        <MenuLibraryPicker onMenuPicked={(m) => {
                          if (selectedDate) setCustomMenus(prev => ({ ...prev, [dateKey(selectedDate)]: m.nama }));
                          setGantiMenuMode(false);
                          toast.sukses('Menu berhasil diganti!', m.nama);
                        }} />
                        <button onClick={() => setGantiMenuMode(false)} className="w-full btn-ghost text-xs">Batal</button>
                      </div>
                    ) : (
                      <button onClick={() => setGantiMenuMode(true)} className="w-full btn-secondary text-xs mt-2">Ganti Menu</button>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm text-slate-500">Belum ada menu di hari ini.</p>
                  {!locked && (
                    <button onClick={() => setGantiMenuMode(true)} className="mt-3 btn-primary text-xs w-full py-1.5"><Plus size={14} /> Set Menu dari Library</button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8 text-slate-400 flex flex-col items-center">
              <Calendar size={32} className="mb-2 opacity-50" />
              <p className="text-sm">Klik tanggal di kalender untuk melihat detail menu.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 2: MASTER MENU
// ════════════════════════════════════════════════════════════════════════════
function TabMasterMenu() {
  const [showForm, setShowForm]     = useState(false);
  const [libraryMenu, setLibraryMenu] = useState<MenuLibraryItem | null>(null);

  // Daftar menu (mulai dari mock, bisa bertambah)
  type MenuEntry = { id: string; nama: string; kategori: KategoriPM; kkal: number; protein_g: number; lemak_g: number; karbo_g: number; bahan: {nama:string; gram:string}[] };
  const [menus, setMenus] = useState<MenuEntry[]>([
    { id: 'm1', nama: 'Nasi Ayam Teriyaki + Sayur', kategori: 'SD 1-3' as KategoriPM, kkal: 550, protein_g: 18, lemak_g: 20, karbo_g: 65, bahan: [] },
    { id: 'm2', nama: 'Nasi Ikan Gurame + Bayam',   kategori: 'SMP'    as KategoriPM, kkal: 700, protein_g: 25, lemak_g: 25, karbo_g: 90, bahan: [] },
  ]);

  // Form state — fully controlled
  const KATEGORI_OPTIONS = Object.keys(STANDAR_AKG) as KategoriPM[];
  const [form, setForm] = useState({
    nama: '', kategori: KATEGORI_OPTIONS[0], waktu: 'Siang', kkal: '', protein_g: '', lemak_g: '', karbo_g: '',
  });
  const [bahan, setBahan] = useState([{ nama: '', gram: '' }]);
  const [akgResult, setAkgResult] = useState<ReturnType<typeof validasiNutrisi> | null>(null);

  const resetForm = () => {
    setForm({ nama: '', kategori: KATEGORI_OPTIONS[0], waktu: 'Siang', kkal: '', protein_g: '', lemak_g: '', karbo_g: '' });
    setBahan([{ nama: '', gram: '' }]);
    setAkgResult(null);
    setLibraryMenu(null);
  };

  const handleLibraryPick = (m: MenuLibraryItem) => {
    setShowForm(true);
    setLibraryMenu(m);
    setBahan(m.bahan_utama.map(b => ({ nama: b, gram: '' })));
    setForm(prev => ({ ...prev, nama: m.nama }));
    toast.sukses('Menu dari library dipilih!', `${m.nama} — lengkapi nilai gizi lalu simpan.`);
  };

  const handleCekAKG = () => {
    if (!form.kkal && !form.protein_g) {
      toast.error('Isi minimal Kalori dan Protein terlebih dahulu');
      return;
    }
    const mockMenu = {
      id: 'cek', nama: form.nama || 'Draft',
      kategori: form.kategori,
      kkal: Number(form.kkal) || 0,
      protein_g: Number(form.protein_g) || 0,
      lemak_g: Number(form.lemak_g) || 0,
      karbo_g: Number(form.karbo_g) || 0,
    };
    const hasil = validasiNutrisi(mockMenu, form.kategori);
    setAkgResult(hasil);
    toast.sukses(hasil.semua_ok ? 'Gizi memenuhi standar BGN ✓' : 'Ada komponen gizi yang perlu disesuaikan');
  };

  const handleSimpan = () => {
    if (!form.nama.trim()) { toast.error('Nama menu wajib diisi'); return; }
    if (!form.kkal)        { toast.error('Kalori wajib diisi');     return; }
    const newMenu: MenuEntry = {
      id: 'm' + Date.now(),
      nama: form.nama,
      kategori: form.kategori,
      kkal: Number(form.kkal),
      protein_g: Number(form.protein_g) || 0,
      lemak_g:   Number(form.lemak_g)   || 0,
      karbo_g:   Number(form.karbo_g)   || 0,
      bahan,
    };
    setMenus(prev => [newMenu, ...prev]);
    toast.sukses('Menu berhasil disimpan!', `"${form.nama}" tersedia di daftar Master Menu.`);
    resetForm();
    setShowForm(false);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {!showForm ? (
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-slate-800">Daftar Master Menu <span className="text-xs font-normal text-slate-400 ml-1">({menus.length} menu)</span></h2>
            <div className="flex gap-2">
              <MenuLibraryPicker onMenuPicked={handleLibraryPick} />
              <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-xs py-1.5"><Plus size={14} /> Tambah Manual</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {menus.map(m => {
              const val = validasiNutrisi(m, m.kategori);
              return (
                <div key={m.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-800 text-sm">{m.nama}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${val.semua_ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {val.semua_ok ? '✓ AKG OK' : '⚠ AKG'}
                      </span>
                      <span className="badge-info text-[10px]">{m.kategori}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-600 mt-3 border-t border-slate-100 pt-3">
                    <span className="font-medium text-slate-800">{m.kkal} kkal</span>
                    <span>Pro: {m.protein_g}g</span>
                    <span>Lem: {m.lemak_g}g</span>
                    <span>Kar: {m.karbo_g}g</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card p-5 max-w-2xl mx-auto animate-slide-up">
          <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-semibold text-slate-800">{libraryMenu ? 'Edit dari Library' : 'Tambah Menu Baru'}</h2>
              {libraryMenu && <p className="text-xs text-blue-600 mt-0.5">Sumber: {libraryMenu.nama}</p>}
            </div>
            <button onClick={() => { resetForm(); setShowForm(false); }} className="btn-ghost text-xs">Batal</button>
          </div>
          
          <div className="space-y-4">
            {/* Nama */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Nama Menu Lengkap *</label>
              <input
                type="text"
                value={form.nama}
                onChange={e => setForm({...form, nama: e.target.value})}
                className="input text-sm w-full"
                placeholder="Mis: Nasi Putih + Telur Dadar + Sayur Sop"
              />
            </div>
            
            {/* Kategori + Waktu */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Kategori PM *</label>
                <select value={form.kategori} onChange={e => { setForm({...form, kategori: e.target.value as KategoriPM}); setAkgResult(null); }} className="select text-sm w-full">
                  {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Waktu Makan</label>
                <select value={form.waktu} onChange={e => setForm({...form, waktu: e.target.value})} className="select text-sm w-full">
                  <option>Pagi</option><option>Siang</option><option>Snack</option>
                </select>
              </div>
            </div>

            {/* Bahan */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-700 block">Bahan Makanan (Per Porsi)</label>
                <button onClick={() => setBahan([...bahan, { nama: '', gram: '' }])} className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">+ Tambah Bahan</button>
              </div>
              {bahan.map((b, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="text" value={b.nama} onChange={e => { const nb = [...bahan]; nb[i].nama = e.target.value; setBahan(nb); }} className="input text-xs flex-1" placeholder="Nama bahan (mis: Beras)" />
                  <input type="number" value={b.gram} onChange={e => { const nb = [...bahan]; nb[i].gram = e.target.value; setBahan(nb); }} className="input text-xs w-20" placeholder="Gram" />
                  <button onClick={() => setBahan(bahan.filter((_, idx) => idx !== i))} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>

            {/* Nilai Gizi */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-2 block">Nilai Gizi Per Porsi *</label>
              <div className="grid grid-cols-4 gap-2">
                <div><label className="text-[10px] text-slate-500">Kalori (kkal)</label><input type="number" value={form.kkal} onChange={e => { setForm({...form, kkal: e.target.value}); setAkgResult(null); }} className="input text-xs w-full py-1.5" placeholder="550" /></div>
                <div><label className="text-[10px] text-slate-500">Protein (g)</label><input type="number" value={form.protein_g} onChange={e => { setForm({...form, protein_g: e.target.value}); setAkgResult(null); }} className="input text-xs w-full py-1.5" placeholder="18" /></div>
                <div><label className="text-[10px] text-slate-500">Lemak (g)</label><input type="number" value={form.lemak_g} onChange={e => { setForm({...form, lemak_g: e.target.value}); setAkgResult(null); }} className="input text-xs w-full py-1.5" placeholder="15" /></div>
                <div><label className="text-[10px] text-slate-500">Karbo (g)</label><input type="number" value={form.karbo_g} onChange={e => { setForm({...form, karbo_g: e.target.value}); setAkgResult(null); }} className="input text-xs w-full py-1.5" placeholder="70" /></div>
              </div>
            </div>

            {/* Hasil AKG */}
            {akgResult && (
              <div className={`p-3 rounded-xl border text-xs animate-slide-up ${akgResult.semua_ok ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                <p className={`font-bold mb-2 ${akgResult.semua_ok ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {akgResult.semua_ok ? '✓ LULUS Standar BGN' : '⚠ Perlu Penyesuaian Gizi'}
                </p>
                <p className="text-slate-600 mb-2">{akgResult.pesan_summary}</p>
                <div className="grid grid-cols-4 gap-1 text-center">
                  {[
                    { label: 'Kalori', ok: akgResult.kkal_ok },
                    { label: 'Protein', ok: akgResult.protein_ok },
                    { label: 'Lemak', ok: akgResult.lemak_ok },
                    { label: 'Karbo', ok: akgResult.karbo_ok },
                  ].map(r => (
                    <div key={r.label} className={`p-1.5 rounded ${r.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      <p className="text-[9px] font-medium">{r.label}</p>
                      <p className="text-sm font-bold">{r.ok ? '✓' : '✗'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex gap-2">
              <button onClick={handleCekAKG} className="flex-1 btn-secondary flex items-center justify-center gap-1.5"><Zap size={15} /> Cek Gizi AKG</button>
              <button onClick={handleSimpan} className="flex-1 btn-primary flex items-center justify-center gap-1.5"><Plus size={15} /> Simpan Master Menu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// TAB 3: VALIDASI GIZI & AI
// ════════════════════════════════════════════════════════════════════════════
function TabValidasiGizi() {
  const [selectedMenu, setSelectedMenu] = useState(MOCK_MENUS[0].id);
  const [bahanGanti, setBahanGanti] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRes, setAiRes] = useState<string | null>(null);

  const menu = MOCK_MENUS.find(m => m.id === selectedMenu)!;
  const validasi = validasiNutrisi(menu, menu.kategori);

  const reqAi = () => {
    if (!bahanGanti) return toast.error('Ketik nama bahan yang ingin diganti');
    setAiLoading(true);
    setAiRes(null);
    
    // Simulate dynamic AI intelligence based on input
    setTimeout(() => {
      const input = bahanGanti.toLowerCase();
      let res = '';

      if (input.includes('daging') || input.includes('sapi')) {
        res = `💡 Analisis AI untuk substitusi **${bahanGanti}**:\n\n` +
              `Daging sapi memiliki kandungan protein hewani tinggi (~26g/100g) namun harganya fluktuatif. Rekomendasi substitusi lokal dengan nilai gizi setara:\n\n` +
              `1. **Ikan Lele Lokal (Pecel Lele/Goreng)**: Protein ~18g/100g. Mengandung asam lemak Omega-3 esensial untuk otak anak. Harga ~60% lebih murah dari daging sapi.\n` +
              `2. **Hati Ayam**: Kaya zat besi (sangat bagus untuk mencegah anemia pada siswi SMP) dan protein tinggi. Cost-efficiency sangat baik.\n` +
              `3. **Kombinasi Telur & Tempe Koro**: Gabungan asam amino esensial hewani dan nabati yang melengkapi kebutuhan profil gizi BGN dengan biaya sangat rendah.`;
      } else if (input.includes('ayam')) {
        res = `💡 Analisis AI untuk substitusi **${bahanGanti}**:\n\n` +
              `Daging ayam adalah sumber protein (~27g/100g). Jika harga sedang naik atau stok lokal kurang, berikut alternatifnya:\n\n` +
              `1. **Telur Bebek Lokal**: Mengandung protein dan lemak sehat sedikit lebih tinggi dari telur ayam biasa. Cocok dibuat bumbu bali atau dadar padat.\n` +
              `2. **Tahu Susu / Tahu Sutra Lembang**: Jika di Jawa Barat, teksturnya lembut disukai anak, kaya kalsium dan protein nabati ringan. Kombinasikan dengan kaldu tulang untuk aroma ayam.\n` +
              `3. **Ikan Mujair / Nila**: Ikan air tawar lokal yang mudah dibudidayakan. Tekstur dagingnya putih mirip ayam, mudah disuwir atau dibikin nugget.`;
      } else if (input.includes('susu')) {
        res = `💡 Analisis AI untuk substitusi **${bahanGanti}**:\n\n` +
              `Susu sapi difokuskan untuk asupan Kalsium dan Protein cair. Jika logistik sulit, pertimbangkan substitusi berstandar BGN ini:\n\n` +
              `1. **Susu Kedelai Fortifikasi (V-Soy/Lokal)**: Protein nabati sangat baik. Pastikan memilih varian rendah gula untuk standar anak sekolah.\n` +
              `2. **Sari Kacang Hijau + Ekstrak Daun Kelor**: Kacang hijau kaya vitamin B, dipadukan bubuk kelor (Moringa) yang kandungan kalsiumnya 4x lebih tinggi dari susu biasa.\n` +
              `3. **Yogurt / Susu Fermentasi Lokal**: Kadang lebih awet dari susu segar (UHT) dan sangat baik untuk pencernaan anak.`;
      } else if (input.includes('beras') || input.includes('nasi')) {
        res = `💡 Analisis AI untuk substitusi **${bahanGanti}**:\n\n` +
              `Beras adalah karbohidrat utama. Untuk penganekaragaman pangan lokal (instruksi BGN poin 4):\n\n` +
              `1. **Singkong / ubi Jalar Kuning**: Ubi jalar kuning kaya Beta-Karoten (Vitamin A), indeks glikemik lebih rendah dari nasi putih. Sangat cocok untuk snack berat.\n` +
              `2. **Nasi Jagung (Campuran)**: Mencampur beras 70% dan jagung pipil 30% akan menurunkan cost, menaikkan serat, dan memberi warna menarik untuk selera makan anak.\n` +
              `3. **Sagu / Papeda (Bagi Wilayah Timur)**: Karbohidrat kompleks lokal yang sangat berlimpah, kombinasikan dengan kuah kuning ikan agar kaya protein.`;
      } else {
        res = `💡 Analisis AI untuk substitusi **${bahanGanti}**:\n\n` +
              `Berdasarkan data harga pasar saat ini dan profil gizi (${menu.kategori}), berikut adalah alternatif lokal yang *cost-effective*:\n\n` +
              `1. **Bahan Lokal Alternatif 1**: Subtitusi terdekat dengan profil kalori yang mirip (deviasi < 5%). Penghematan estimasi: 15-20% dari anggaran semula.\n` +
              `2. **Pemanfaatan Komoditas Panen Raya**: Saat ini sedang musim panen untuk sayuran hijau dan kacang-kacangan di wilayah Anda. Bisa dimanfaatkan untuk meningkatkan volume sajian.\n` +
              `3. **Kombinasi Menu (Food Pairing)**: Menggabungkan 50% bahan asli dengan 50% protein nabati lokal (seperti tempe/tahu) untuk mempertahankan rasa sambil menekan biaya operasional dapur.`;
      }

      setAiRes(res);
      setAiLoading(false);
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in">
      
      {/* KIRI: REPORT VALIDASI */}
      <div className="card p-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">Pilih Menu untuk Divalidasi</label>
          <select value={selectedMenu} onChange={e => setSelectedMenu(e.target.value)} className="select text-sm w-full">
            {MOCK_MENUS.map(m => <option key={m.id} value={m.id}>{m.nama} ({m.kategori})</option>)}
          </select>
        </div>

        <div className={`p-4 rounded-xl border ${validasi.semua_ok ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-start gap-2">
            <ShieldCheck size={20} className={validasi.semua_ok ? 'text-emerald-600' : 'text-amber-600'} />
            <div>
              <p className={`text-sm font-bold ${validasi.semua_ok ? 'text-emerald-800' : 'text-amber-800'}`}>{validasi.semua_ok ? 'LULUS STANDAR BGN' : 'PERLU PENYESUAIAN GIZI'}</p>
              <p className="text-xs mt-1 text-slate-600 leading-relaxed">{validasi.pesan_summary}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-[11px] sm:text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-2 border-b">Komponen</th>
                <th className="p-2 border-b">Nilai Menu</th>
                <th className="p-2 border-b">Standar Min - Max</th>
                <th className="p-2 border-b text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Kalori', val: menu.kkal, unit: 'kkal', stdMin: validasi.standar.kkal_min, stdMax: validasi.standar.kkal_max, ok: validasi.kkal_ok },
                { label: 'Protein', val: menu.protein_g, unit: 'g', stdMin: validasi.standar.protein_min, stdMax: validasi.standar.protein_max, ok: validasi.protein_ok },
                { label: 'Lemak', val: menu.lemak_g, unit: 'g', stdMin: validasi.standar.lemak_min, stdMax: validasi.standar.lemak_max, ok: validasi.lemak_ok },
                { label: 'Karbohidrat', val: menu.karbo_g, unit: 'g', stdMin: validasi.standar.karbo_min, stdMax: validasi.standar.karbo_max, ok: validasi.karbo_ok },
              ].map(r => (
                <tr key={r.label}>
                  <td className="p-2 border-b font-medium text-slate-700">{r.label}</td>
                  <td className="p-2 border-b text-slate-900">{r.val} {r.unit}</td>
                  <td className="p-2 border-b text-slate-500">{r.stdMin} - {r.stdMax} {r.unit}</td>
                  <td className="p-2 border-b text-center">
                    {r.ok ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-red-500 font-bold">✗</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KANAN: AI SUBSTITUSI */}
      <div className="card p-5 bg-gradient-to-br from-indigo-50 to-blue-50 border-blue-100 flex flex-col">
        <h3 className="font-semibold text-blue-900 mb-1 flex items-center gap-2"><Sparkles size={16} className="text-blue-600" /> AI Substitusi Bahan Lokal</h3>
        <p className="text-xs text-blue-700 mb-4">Minta AI mencari alternatif bahan yang lebih murah namun gizinya setara untuk kategori <strong>{menu.kategori}</strong>.</p>
        
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            value={bahanGanti} 
            onChange={e => setBahanGanti(e.target.value)} 
            placeholder="Ketik bahan, mis: Daging Sapi..." 
            className="input text-sm flex-1 bg-white"
          />
          <button onClick={reqAi} disabled={aiLoading} className="btn-primary text-sm whitespace-nowrap bg-blue-600 hover:bg-blue-700">
            {aiLoading ? <span className="animate-pulse">Berpikir...</span> : 'Tanya AI'}
          </button>
        </div>

        {aiRes && (
          <div className="flex-1 bg-white p-4 rounded-xl border border-blue-100 text-sm text-slate-700 whitespace-pre-wrap animate-fade-in shadow-inner">
            {aiRes.split('\n').map((line, i) => (
              <p key={i} className="mb-2 last:mb-0" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
