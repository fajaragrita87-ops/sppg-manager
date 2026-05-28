import { useState } from 'react';
import { Plus, Edit2, Search, Save, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useMasterBahan, useSimpanMasterBahan, MasterBahan } from '@/hooks/useInventori';
import { toast } from '@/store/toastStore';

export default function MasterBahanPage() {
  const sppg = useAuthStore(s => s.sppg);
  const { data: masterList = [], isLoading } = useMasterBahan(sppg?.id);
  const [search, setSearch] = useState('');
  const [formMode, setFormMode] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MasterBahan> | null>(null);

  const filtered = masterList.filter(m => m.nama.toLowerCase().includes(search.toLowerCase()));

  const handleEdit = (item: MasterBahan) => {
    setEditingItem(item);
    setFormMode(true);
  };

  const handleAdd = () => {
    setEditingItem({ nama: '', kategori: 'Kering', satuan: 'kg', stok_minimum: 0, fortifikasi: false });
    setFormMode(true);
  };

  return (
    <div className="animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Master Data Bahan Baku</h2>
          <p className="text-xs text-slate-500">Katalog standar untuk gudang dan resep menu.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
            <input type="text" placeholder="Cari nama..." value={search} onChange={e => setSearch(e.target.value)} className="input text-xs pl-8 py-1.5 w-48" />
          </div>
          <button onClick={handleAdd} className="btn-primary text-xs py-1.5"><Plus size={14} /> Tambah Baru</button>
        </div>
      </div>

      {formMode && editingItem && (
        <FormMaster 
          initialData={editingItem} 
          onClose={() => { setFormMode(false); setEditingItem(null); }} 
        />
      )}

      <div className="card overflow-x-auto mt-4">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 text-xs text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="p-3 font-medium">Nama Bahan</th>
              <th className="p-3 font-medium">Kategori</th>
              <th className="p-3 font-medium">Satuan</th>
              <th className="p-3 font-medium">Stok Minimum</th>
              <th className="p-3 font-medium text-center">Fortifikasi</th>
              <th className="p-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-400">Memuat data...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-400">Tidak ada data.</td></tr>
            ) : (
              filtered.map(item => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">{item.nama}</td>
                  <td className="p-3 text-slate-600">{item.kategori}</td>
                  <td className="p-3 text-slate-600">{item.satuan}</td>
                  <td className="p-3 text-slate-600 font-bold">{item.stok_minimum}</td>
                  <td className="p-3 text-center">
                    {item.fortifikasi ? <span className="badge-success text-[10px]">Ya</span> : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FormMaster({ initialData, onClose }: { initialData: Partial<MasterBahan>, onClose: () => void }) {
  const sppg = useAuthStore(s => s.sppg);
  const { mutate, isPending } = useSimpanMasterBahan();
  const [formData, setFormData] = useState<Partial<MasterBahan>>(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama) return toast.error('Nama bahan wajib diisi');
    
    mutate({ ...formData, sppg_id: sppg?.id }, {
      onSuccess: () => {
        toast.sukses('Data Master Bahan tersimpan!');
        onClose();
      },
      onError: (err: any) => toast.error('Gagal menyimpan', err.message)
    });
  };

  return (
    <div className="card p-5 mb-4 border-l-4 border-l-blue-600 bg-blue-50/10">
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
        <h3 className="font-bold text-slate-800">{initialData.id ? 'Edit Bahan' : 'Tambah Master Bahan'}</h3>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2">
          <label className="text-[10px] font-medium text-slate-500 block mb-1">Nama Bahan *</label>
          <input type="text" autoFocus value={formData.nama || ''} onChange={e=>setFormData({...formData, nama: e.target.value})} className="input text-sm w-full" placeholder="Mis: Beras Premium" required />
        </div>
        <div>
          <label className="text-[10px] font-medium text-slate-500 block mb-1">Kategori *</label>
          <select value={formData.kategori || ''} onChange={e=>setFormData({...formData, kategori: e.target.value})} className="select text-sm w-full">
            <option value="Kering">Kering / Sembako</option>
            <option value="Dingin/Freezer">Dingin / Freezer</option>
            <option value="Bumbu">Bumbu Dapur</option>
            <option value="Packaging">Packaging</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-medium text-slate-500 block mb-1">Satuan *</label>
          <select value={formData.satuan || ''} onChange={e=>setFormData({...formData, satuan: e.target.value})} className="select text-sm w-full">
            <option value="kg">Kg</option>
            <option value="liter">Liter</option>
            <option value="pcs">Pcs / Buah</option>
            <option value="ikat">Ikat</option>
            <option value="pack">Pack</option>
            <option value="botol">Botol</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-medium text-slate-500 block mb-1">Stok Min (Alert) *</label>
          <input type="number" value={formData.stok_minimum || 0} onChange={e=>setFormData({...formData, stok_minimum: Number(e.target.value)})} className="input text-sm w-full" required />
        </div>
        <div className="md:col-span-4 flex items-center gap-2 pt-2">
          <input type="checkbox" id="fortifikasi" checked={formData.fortifikasi || false} onChange={e=>setFormData({...formData, fortifikasi: e.target.checked})} className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
          <label htmlFor="fortifikasi" className="text-xs text-slate-600">Bahan ini wajib Fortifikasi (Beras/Terigu/Minyak/Garam/Susu) sesuai Juknis BGN.</label>
        </div>
        <div className="flex items-end justify-end">
          <button type="submit" disabled={isPending} className="btn-primary w-full text-xs py-2"><Save size={14} className="mr-1" /> Simpan</button>
        </div>
      </form>
    </div>
  );
}
