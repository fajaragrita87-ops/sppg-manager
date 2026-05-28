import { useState, useMemo, useEffect } from 'react';
import { PackageSearch, AlertTriangle, FileSpreadsheet, Plus, Edit2, Zap, Save, X, Search, History, CheckCircle, AlertCircle, Minus, Clock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useInventoryStore, StockItem } from '@/store/inventoryStore';
import { toast } from '@/store/toastStore';
import { logAudit } from '@/lib/audit-logger';
import { useNavigate } from 'react-router-dom';

const INITIAL_STOCKS: StockItem[] = [
  { id: 'b1', nama: 'Beras Premium', satuan: 'kg', stok_akhir: 250, min_stok: 100, kategori: 'Kering', last_update: '2026-05-10', tgl_kadaluarsa: '2026-12-30', lokasi: 'Gudang Kering - Rak A1' },
  { id: 'b2', nama: 'Daging Ayam', satuan: 'kg', stok_akhir: 15, min_stok: 50, kategori: 'Dingin/Freezer', last_update: '2026-05-10', tgl_kadaluarsa: '2026-05-18', lokasi: 'Freezer Utama 1' },
  { id: 'b3', nama: 'Telur Ayam', satuan: 'kg', stok_akhir: 80, min_stok: 50, kategori: 'Dingin/Freezer', last_update: '2026-05-10', tgl_kadaluarsa: '2026-05-25', lokasi: 'Gudang Pendingin B' },
  { id: 'b4', nama: 'Minyak Goreng', satuan: 'liter', stok_akhir: 45, min_stok: 20, kategori: 'Kering', last_update: '2026-05-10', tgl_kadaluarsa: '2027-01-15', lokasi: 'Gudang Kering - Rak C' },
  { id: 'b5', nama: 'Bumbu Dapur', satuan: 'set', stok_akhir: 12, min_stok: 5, kategori: 'Bumbu', last_update: '2026-05-10', tgl_kadaluarsa: '2026-08-01', lokasi: 'Dapur - Kabinet Atas' },
];

export default function StokBahanPage() {
  const { stocks, initializeStocks, updateStock } = useInventoryStore();
  const [tab, setTab] = useState('Semua');
  const [search, setSearch] = useState('');
  const [opnameMode, setOpnameMode] = useState(false);
  const [opnameData, setOpnameData] = useState<Record<string, number>>({});
  
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const isManagement = user?.role === 'owner' || user?.role === 'kasppg' || user?.role === 'pengawas_keuangan';
  const [showLogMutasi, setShowLogMutasi] = useState(false);

  // Initialize stocks if empty
  useEffect(() => {
    if (stocks.length === 0) {
      initializeStocks(INITIAL_STOCKS);
    }
  }, [stocks.length, initializeStocks]);

  const filteredStok = useMemo(() => {
    let result = stocks;
    if (tab !== 'Semua') {
      result = result.filter(s => s.kategori === tab);
    }
    if (search) {
      result = result.filter(s => s.nama.toLowerCase().includes(search.toLowerCase()));
    }
    return result;
  }, [stocks, tab, search]);

  const totalItem = stocks.length;
  const stokKritis = stocks.filter(s => s.stok_akhir < s.min_stok);
  const stokKadaluarsa = stocks.filter(s => {
    if (!s.tgl_kadaluarsa) return false;
    const expDate = new Date(s.tgl_kadaluarsa);
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return expDate < in7Days;
  });

  const handleToggleOpname = () => {
    if (opnameMode) {
      setOpnameMode(false);
      setOpnameData({});
    } else {
      setOpnameMode(true);
      const initData: Record<string, number> = {};
      stocks.forEach(s => { initData[s.id] = s.stok_akhir; });
      setOpnameData(initData);
    }
  };

  const handleSimpanOpname = async () => {
    const user = useAuthStore.getState().user;
    const sppg = useAuthStore.getState().sppg;

    // Catat perubahan setiap item yang dikoreksi
    for (const id of Object.keys(opnameData)) {
      const itemLama = stocks.find(s => s.id === id);
      const nilaiBaru = opnameData[id];
      if (itemLama && itemLama.stok_akhir !== nilaiBaru) {
        await logAudit({
          sppgId:    sppg?.id ?? 'unknown',
          userId:    user?.id ?? 'unknown',
          action:    'stok_dikoreksi',
          tableName: 'stok_bahan',
          recordId:  id,
          beforeData: { stok_akhir: itemLama.stok_akhir, satuan: itemLama.satuan, nama: itemLama.nama },
          afterData:  { stok_akhir: nilaiBaru, satuan: itemLama.satuan, nama: itemLama.nama },
          keterangan: `Stok opname oleh ${user?.nama}: ${itemLama.nama} ${itemLama.stok_akhir} → ${nilaiBaru} ${itemLama.satuan}`,
        });
      }
      updateStock(id, nilaiBaru);
    }
    toast.sukses('Stok Opname berhasil disimpan!');
    setOpnameMode(false);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stok Bahan Baku & Gudang</h1>
          <p className="text-sm text-slate-500">Monitor saldo fisik dan ketersediaan dapur secara real-time</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowLogMutasi(true)} className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"><History size={14}/> Log Mutasi</button>
          {stokKritis.length > 0 && (
            <button onClick={() => navigate('/pengadaan')} className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 bg-rose-600 border-rose-600 hover:bg-rose-700">
              <AlertTriangle size={14}/> Buat PO Darurat ({stokKritis.length} item)
            </button>
          )}
        </div>
      </div>

      {/* Log Mutasi Modal */}
      {showLogMutasi && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowLogMutasi(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><History size={16} className="text-blue-600" /> Riwayat Mutasi Stok</h3>
              <button onClick={() => setShowLogMutasi(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={16} /></button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {stocks.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{s.nama}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{s.lokasi}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{s.stok_akhir} <span className="text-xs text-slate-400">{s.satuan}</span></p>
                    <p className="text-[10px] text-slate-400">{s.last_update}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-4 text-center">Log detail tersimpan di sistem audit. Hubungi admin untuk ekspor CSV.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<PackageSearch size={20} />} label="Total Item" value={totalItem} color="blue" />
        <StatCard icon={<AlertTriangle size={20} />} label="Stok Kritis" value={`${stokKritis.length} Item`} color="red" isAlert={stokKritis.length > 0} />
        <StatCard icon={<History size={20} />} label="Peringatan Exp" value={`${stokKadaluarsa.length} Item`} color="amber" isAlert={stokKadaluarsa.length > 0} />
        <StatCard icon={<Zap size={20} />} label="Turnover" value="Normal" color="emerald" />
      </div>

      <div className="card border-slate-200">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['Semua', 'Kering', 'Dingin/Freezer', 'Bumbu', 'Packaging'].map(t => (
              <button 
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${tab === t ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2 shrink-0">
            {!opnameMode ? (
              <>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Cari bahan..." value={search} onChange={e => setSearch(e.target.value)} className="input text-xs pl-9 py-2 w-48 shadow-sm" />
                </div>
                {isManagement && (
                  <button onClick={handleToggleOpname} className="btn-secondary text-xs py-2 px-4 border-slate-200 shadow-sm"><FileSpreadsheet size={14} className="mr-2"/> Stok Opname</button>
                )}
              </>
            ) : (
              <>
                <button onClick={handleToggleOpname} className="btn-ghost text-xs py-2 px-4 text-slate-500 font-bold">Batal</button>
                <button onClick={handleSimpanOpname} className="btn-primary text-xs py-2 px-6 bg-amber-500 hover:bg-amber-600 border-amber-600 shadow-lg shadow-amber-100"><Save size={14} className="mr-2"/> Simpan Opname</button>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-[0.15em] font-black border-b border-slate-100">
              <tr>
                <th className="p-4">Bahan</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Saldo Stok</th>
                <th className="p-4">Min. Stok</th>
                <th className="p-4">Kadaluarsa & Lokasi</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStok.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-400 font-medium">Bahan tidak ditemukan.</td></tr>
              ) : (
                filteredStok.map(s => (
                  <tr key={s.id} className={`hover:bg-slate-50/50 transition-colors ${s.stok_akhir < s.min_stok ? 'bg-red-50/20' : ''}`}>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{s.nama}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{s.id}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{s.kategori}</span>
                    </td>
                    <td className="p-4">
                      {opnameMode ? (
                        <div className="flex items-center gap-3">
                          <input 
                            type="number" 
                            className="input w-24 text-xs font-black py-1.5 border-amber-200 bg-amber-50"
                            value={opnameData[s.id]}
                            onChange={e => setOpnameData({...opnameData, [s.id]: Number(e.target.value)})}
                          />
                          <span className="text-xs text-slate-400 italic">Sis: {s.stok_akhir}</span>
                        </div>
                      ) : (
                        <p className="text-base font-black text-slate-900">{s.stok_akhir} <span className="text-xs font-bold text-slate-400 uppercase ml-0.5">{s.satuan}</span></p>
                      )}
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-500">{s.min_stok} {s.satuan}</td>
                    <td className="p-4">
                      {s.tgl_kadaluarsa ? (
                        <div className={`text-xs font-bold ${new Date(s.tgl_kadaluarsa) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'text-red-600 bg-red-50 inline-block px-2 py-0.5 rounded border border-red-100' : 'text-slate-600'}`}>
                          {s.tgl_kadaluarsa}
                        </div>
                      ) : <span className="text-xs text-slate-400">-</span>}
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">{s.lokasi || 'Belum ada lokasi'}</div>
                    </td>
                    <td className="p-4">
                      <StatusBadge saatIni={s.stok_akhir} minimum={s.min_stok} />
                    </td>
                    <td className="p-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {s.last_update}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, isAlert }: any) {
  const colors: any = {
    blue: 'border-l-blue-500 text-blue-600 bg-blue-50',
    red: 'border-l-red-500 text-red-600 bg-red-50',
    amber: 'border-l-amber-500 text-amber-600 bg-amber-50',
    emerald: 'border-l-emerald-500 text-emerald-600 bg-emerald-50'
  };

  return (
    <div className={`card p-5 flex items-center gap-5 border-l-4 ${colors[color]} ${isAlert ? 'animate-pulse shadow-lg shadow-red-100' : ''}`}>
      <div className={`p-3 rounded-2xl ${colors[color].split(' ')[2]} ${colors[color].split(' ')[1]}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
        <p className="text-xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ saatIni, minimum }: { saatIni: number; minimum: number }) {
  if (saatIni === 0)              return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase tracking-wide"><X size={10}/> Habis</span>;
  if (saatIni < minimum)         return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 text-[10px] font-black rounded-full uppercase tracking-wide"><AlertCircle size={10}/> Kritis</span>;
  if (saatIni <= minimum * 1.5)  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black rounded-full uppercase tracking-wide"><AlertTriangle size={10}/> Menipis</span>;
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black rounded-full uppercase tracking-wide"><CheckCircle size={10}/> Aman</span>;
}
