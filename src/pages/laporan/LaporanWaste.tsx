import { useState } from 'react';
import { Trash2, AlertOctagon, TrendingDown, Filter, FileSpreadsheet, PlusCircle, X, Save } from 'lucide-react';
import { toast } from '@/store/toastStore';
import { useInventoryStore } from '@/store/inventoryStore';

export default function LaporanWastePage() {
  const { wastes, stocks, addWaste, deductStock } = useInventoryStore();
  const [filter, setFilter] = useState('Semua');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    sumber: 'Gudang (Stok Susut)',
    jenis: 'Bahan Baku Expired',
    nama: '',
    jumlah: '',
    alasan: '',
    kerugian: 0
  });

  const filteredData = filter === 'Semua' ? wastes : wastes.filter(w => w.sumber.includes(filter));
  
  const totalKerugian = filteredData.reduce((acc, curr) => acc + curr.kerugian, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.jumlah || !formData.alasan) {
      toast.error('Harap lengkapi nama item, jumlah, dan alasan.');
      return;
    }
    
    // Simpan ke laporan waste
    addWaste({
      tanggal: new Date().toISOString().split('T')[0],
      sumber: formData.sumber,
      jenis: formData.jenis,
      nama: formData.nama,
      jumlah: formData.jumlah,
      alasan: formData.alasan,
      kerugian: formData.kerugian
    });

    // Jika bersumber dari gudang, auto-deduct stok
    if (formData.sumber.includes('Gudang') && !isNaN(parseFloat(formData.jumlah))) {
      deductStock([{ nama: formData.nama, qty: parseFloat(formData.jumlah) }]);
      toast.success('Waste dicatat & stok gudang otomatis dipotong!');
    } else {
      toast.success('Laporan waste berhasil dicatat.');
    }

    setIsModalOpen(false);
    setFormData({ sumber: 'Gudang (Stok Susut)', jenis: 'Bahan Baku Expired', nama: '', jumlah: '', alasan: '', kerugian: 0 });
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Laporan Food Waste & Susut</h2>
          <p className="text-sm text-slate-500">Rekapitulasi sisa bahan terbuang dan makanan sisa (Zero Waste Monitoring).</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs px-4 py-2 flex items-center gap-2">
            <FileSpreadsheet size={14} /> Export CSV
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary text-xs px-4 py-2 bg-red-600 border-red-700 hover:bg-red-700 shadow-md shadow-red-200 flex items-center gap-2">
            <PlusCircle size={14} /> Catat Waste Baru
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm border-l-4 border-l-red-500 relative overflow-hidden">
          <AlertOctagon className="absolute right-[-10px] top-[-10px] text-red-50 opacity-50" size={100} />
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Kerugian (Finansial)</p>
            <p className="text-2xl font-black text-red-600">Rp {totalKerugian.toLocaleString('id-ID')}</p>
            <p className="text-[10px] text-slate-400 mt-2">Akibat bahan rusak/kadaluarsa & retur matang.</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm border-l-4 border-l-amber-500 relative overflow-hidden">
          <Trash2 className="absolute right-[-10px] top-[-10px] text-amber-50 opacity-50" size={100} />
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Insiden Waste</p>
            <p className="text-2xl font-black text-amber-600">{filteredData.length} Kasus</p>
            <p className="text-[10px] text-slate-400 mt-2">Bulan ini (Mei 2026)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm border-l-4 border-l-emerald-500 relative overflow-hidden">
          <TrendingDown className="absolute right-[-10px] top-[-10px] text-emerald-50 opacity-50" size={100} />
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Efisiensi Bahan</p>
            <p className="text-2xl font-black text-emerald-600">98.2%</p>
            <p className="text-[10px] text-emerald-600/70 font-medium bg-emerald-50 inline-block px-1.5 py-0.5 rounded mt-2">+0.5% dari target BGN</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50 gap-4">
          <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2"><Trash2 size={16} className="text-slate-400"/> Log Food Waste</h3>
          <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm text-xs font-medium">
            {['Semua', 'Gudang', 'Dapur', 'Distribusi'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md transition-all ${filter === f ? 'bg-red-50 text-red-700' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-widest font-black border-b border-slate-100">
              <tr>
                <th className="p-4">Tanggal</th>
                <th className="p-4">Sumber & Jenis</th>
                <th className="p-4">Nama Item</th>
                <th className="p-4">Kuantitas</th>
                <th className="p-4">Alasan (Keterangan)</th>
                <th className="p-4 text-right">Taksiran Kerugian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-slate-700">{item.tanggal}</span>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{item.sumber}</p>
                    <p className="text-[10px] text-slate-500">{item.jenis}</p>
                  </td>
                  <td className="p-4 font-medium text-slate-700">{item.nama}</td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded text-xs">
                      {item.jumlah}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-500 max-w-[200px] truncate" title={item.alasan}>
                    {item.alasan}
                  </td>
                  <td className="p-4 text-right font-bold">
                    {item.kerugian > 0 ? (
                      <span className="text-red-600">Rp {item.kerugian.toLocaleString('id-ID')}</span>
                    ) : (
                      <span className="text-slate-400">Rp 0 (Wajar)</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400 font-medium">
                    Tidak ada data waste untuk filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INPUT WASTE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><AlertOctagon size={18} className="text-red-500" /> Catat Food Waste / Susut Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Sumber Insiden</label>
                  <select 
                    value={formData.sumber}
                    onChange={e => setFormData({...formData, sumber: e.target.value})}
                    className="input w-full text-sm"
                  >
                    <option value="Gudang (Stok Susut)">Gudang (Stok Susut)</option>
                    <option value="Dapur (Prep Waste)">Dapur (Prep Waste)</option>
                    <option value="Distribusi (Sisa)">Distribusi (Sisa/Retur)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Jenis</label>
                  <input 
                    type="text" 
                    value={formData.jenis}
                    onChange={e => setFormData({...formData, jenis: e.target.value})}
                    className="input w-full text-sm"
                    placeholder="Contoh: Bahan Expired"
                  />
                </div>
              </div>

              <div>
                <label className="label">Nama Bahan / Menu Terbuang</label>
                {formData.sumber.includes('Gudang') ? (
                  <select 
                    value={formData.nama}
                    onChange={e => setFormData({...formData, nama: e.target.value})}
                    className="input w-full text-sm"
                    required
                  >
                    <option value="">-- Pilih Bahan di Gudang --</option>
                    {stocks.map(s => (
                      <option key={s.id} value={s.nama}>{s.nama} (Sisa: {s.stok_akhir} {s.satuan})</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    value={formData.nama}
                    onChange={e => setFormData({...formData, nama: e.target.value})}
                    className="input w-full text-sm"
                    placeholder="Contoh: Nasi Goreng Sisa"
                    required
                  />
                )}
                {formData.sumber.includes('Gudang') && <p className="text-[10px] text-amber-600 mt-1">⚠️ Mengisi laporan gudang akan otomatis memotong stok akhir di menu Inventori.</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Kuantitas / Jumlah</label>
                  <input 
                    type="text" 
                    value={formData.jumlah}
                    onChange={e => setFormData({...formData, jumlah: e.target.value})}
                    className="input w-full text-sm font-mono"
                    placeholder="Contoh: 5 kg atau 20 Porsi"
                    required
                  />
                </div>
                <div>
                  <label className="label">Taksiran Kerugian (Rp)</label>
                  <input 
                    type="number" 
                    value={formData.kerugian}
                    onChange={e => setFormData({...formData, kerugian: Number(e.target.value)})}
                    className="input w-full text-sm font-mono text-red-600 font-bold"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="label">Alasan / Kronologi singkat</label>
                <textarea 
                  value={formData.alasan}
                  onChange={e => setFormData({...formData, alasan: e.target.value})}
                  className="input w-full text-sm h-20"
                  placeholder="Mengapa bahan/makanan ini terbuang?"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary px-5 py-2.5">Batal</button>
                <button type="submit" className="btn-primary bg-red-600 border-red-700 hover:bg-red-700 px-5 py-2.5 flex items-center gap-2">
                  <Save size={16} /> Simpan Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
