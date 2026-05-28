import { useState } from 'react';
import { Store, Star, Plus, Edit2, ShieldAlert, ShieldCheck, Phone, MapPin, X, Save, Eye } from 'lucide-react';
import { toast } from '@/store/toastStore';
import { usePermission, ReadOnlyBanner } from '@/hooks/PermGuard';

export interface Supplier {
  id: string;
  nama: string;
  tipe: 'BUMDesa' | 'Koperasi' | 'UMKM' | 'Distributor' | 'Perorangan';
  kontak: string;
  alamat: string;
  nkv: boolean;
  no_nkv: string;
  rating: number; // 1-5
}

// Data Mockup untuk UI
const MOCK_SUPPLIER: Supplier[] = [
  { id: 's1', nama: 'BUMDesa Maju Makmur', tipe: 'BUMDesa', kontak: '081234567890', alamat: 'Jl. Desa No. 1', nkv: false, no_nkv: '', rating: 5 },
  { id: 's2', nama: 'Koperasi Peternak Mandiri', tipe: 'Koperasi', kontak: '081298765432', alamat: 'Jl. Peternak No. 2', nkv: true, no_nkv: 'NKV-123456', rating: 4 },
  { id: 's3', nama: 'Toko Sayur Segar (Pak Budi)', tipe: 'UMKM', kontak: '085612312312', alamat: 'Pasar Induk Blok A', nkv: false, no_nkv: '', rating: 4 },
  { id: 's4', nama: 'PT Daging Sapi Lokal', tipe: 'Distributor', kontak: '081199998888', alamat: 'Kawasan Industri', nkv: false, no_nkv: '', rating: 3 },
];

export default function SupplierPage() {
  const canManage = usePermission('inventori.kelola_supplier');
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIER);
  const [formMode, setFormMode] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Supplier> | null>(null);

  const handleEdit = (s: Supplier) => {
    setEditingItem(s);
    setFormMode(true);
  };

  const handleAdd = () => {
    setEditingItem({ nama: '', tipe: 'BUMDesa', kontak: '', alamat: '', nkv: false, no_nkv: '', rating: 5 });
    setFormMode(true);
  };

  const handleSave = (data: Partial<Supplier>) => {
    if (!data.nama) return toast.error('Nama wajib diisi');
    
    if (data.id) {
      setSuppliers(suppliers.map(s => s.id === data.id ? data as Supplier : s));
      toast.sukses('Supplier berhasil diupdate');
    } else {
      setSuppliers([...suppliers, { ...data, id: 's' + Date.now() } as Supplier]);
      toast.sukses('Supplier baru ditambahkan');
    }
    setFormMode(false);
  };

  return (
    <div className="animate-fade-in pb-12">
      {!canManage && <ReadOnlyBanner message="Role Anda hanya bisa melihat data supplier. Hubungi Owner atau Ka. SPPG untuk perubahan." />}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Data Supplier</h2>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Store size={14} className="text-blue-500" />
            Sesuai juknis BGN: utamakan supplier BUMDesa, Koperasi, dan UMKM lokal setempat.
          </p>
        </div>
        {canManage && (
          <button onClick={handleAdd} className="btn-primary text-xs py-1.5"><Plus size={14} /> Tambah Supplier</button>
        )}
      </div>

      {formMode && editingItem && (
        <FormSupplier 
          initialData={editingItem} 
          onSave={handleSave}
          onClose={() => setFormMode(false)} 
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map(s => (
          <div key={s.id} className="card p-5 border hover:border-blue-200 transition-colors relative overflow-hidden group">
            {/* Action Buttons — hanya untuk yang berhak */}
            {canManage && (
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(s)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"><Edit2 size={14} /></button>
              </div>
            )}

            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-slate-800 leading-tight pr-8">{s.nama}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={i < s.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              {s.tipe === 'BUMDesa' && <span className="badge-success text-[10px]">BUMDesa</span>}
              {s.tipe === 'Koperasi' && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-semibold">Koperasi</span>}
              {s.tipe === 'UMKM' && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-semibold">UMKM</span>}
              {s.tipe === 'Distributor' && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">Distributor</span>}
              {s.tipe === 'Perorangan' && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">Perorangan</span>}

              {s.nkv ? (
                <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-semibold" title={s.no_nkv}>
                  <ShieldCheck size={12} /> NKV ✅
                </span>
              ) : (
                <span className="flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-600 px-2 py-0.5 rounded text-[10px] font-semibold">
                  <ShieldAlert size={12} /> Perlu NKV
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
              <p className="flex items-center gap-2"><Phone size={12} className="text-slate-400" /> {s.kontak}</p>
              <p className="flex items-start gap-2"><MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" /> <span className="line-clamp-2">{s.alamat}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormSupplier({ initialData, onSave, onClose }: { initialData: Partial<Supplier>, onSave: (d: Partial<Supplier>) => void, onClose: () => void }) {
  const [formData, setFormData] = useState<Partial<Supplier>>(initialData);

  return (
    <div className="card p-5 mb-5 border-l-4 border-l-blue-600 animate-slide-down">
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
        <h3 className="font-bold text-slate-800">{formData.id ? 'Edit Supplier' : 'Tambah Supplier Baru'}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-medium text-slate-500 block mb-1">Nama Supplier / Toko *</label>
          <input type="text" value={formData.nama} onChange={e=>setFormData({...formData, nama: e.target.value})} className="input text-sm w-full" placeholder="Mis: Koperasi Jaya" />
        </div>
        <div>
          <label className="text-[10px] font-medium text-slate-500 block mb-1">Tipe Supplier *</label>
          <select value={formData.tipe} onChange={e=>setFormData({...formData, tipe: e.target.value as any})} className="select text-sm w-full">
            <option value="BUMDesa">BUMDesa (Prioritas)</option>
            <option value="Koperasi">Koperasi</option>
            <option value="UMKM">UMKM</option>
            <option value="Distributor">Distributor / PT</option>
            <option value="Perorangan">Perorangan</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-medium text-slate-500 block mb-1">Kontak HP/WA</label>
          <input type="text" value={formData.kontak} onChange={e=>setFormData({...formData, kontak: e.target.value})} className="input text-sm w-full" placeholder="08..." />
        </div>
        <div>
          <label className="text-[10px] font-medium text-slate-500 block mb-1">Rating</label>
          <div className="flex items-center gap-1 h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg w-max">
            {[1,2,3,4,5].map(star => (
              <button key={star} type="button" onClick={() => setFormData({...formData, rating: star})} className="p-1 hover:scale-110 transition-transform">
                <Star size={16} className={(formData.rating || 0) >= star ? "text-amber-400 fill-amber-400" : "text-slate-300"} />
              </button>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="text-[10px] font-medium text-slate-500 block mb-1">Alamat</label>
          <textarea value={formData.alamat} onChange={e=>setFormData({...formData, alamat: e.target.value})} className="input text-sm w-full py-2" rows={2} placeholder="Alamat lengkap..."></textarea>
        </div>
        
        <div className="md:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <input type="checkbox" checked={formData.nkv} onChange={e=>setFormData({...formData, nkv: e.target.checked, no_nkv: e.target.checked ? formData.no_nkv : ''})} className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
            <span className="text-sm font-medium text-slate-700">Punya Nomor Kontrol Veteriner (NKV)</span>
          </label>
          {formData.nkv && (
            <div className="animate-fade-in pl-6 border-l-2 border-slate-200 ml-1.5">
              <label className="text-[10px] font-medium text-slate-500 block mb-1">Nomor Sertifikat NKV</label>
              <input type="text" value={formData.no_nkv} onChange={e=>setFormData({...formData, no_nkv: e.target.value})} className="input text-sm w-full max-w-sm" placeholder="Mis: NKV-XXXX-XXXX" />
              <p className="text-[10px] text-slate-400 mt-1">Sesuai aturan keamanan pangan, supplier produk daging/unggas/telur diutamakan memiliki NKV.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-5">
        <button onClick={onClose} className="btn-ghost text-xs">Batal</button>
        <button onClick={() => onSave(formData)} className="btn-primary text-xs"><Save size={14} /> Simpan Supplier</button>
      </div>
    </div>
  );
}
