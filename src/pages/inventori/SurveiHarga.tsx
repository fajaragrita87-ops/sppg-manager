import { useState } from 'react';
import { FileSearch, CheckCircle2, AlertTriangle, Plus, ShieldCheck, Download } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';

interface ItemSurvei {
  id: string;
  nama: string;
  satuan: string;
  hargaLalu: number;
  suppliers: Array<{ supplier_id: string, nama_supplier: string, harga: number }>;
}

const MOCK_BAHAN = [
  { id: 'b1', nama: 'Beras Premium', satuan: 'kg', hargaLalu: 14500 },
  { id: 'b2', nama: 'Daging Ayam', satuan: 'kg', hargaLalu: 38000 },
  { id: 'b3', nama: 'Telur Ayam', satuan: 'kg', hargaLalu: 28000 },
  { id: 'b4', nama: 'Tahu Putih', satuan: 'pcs', hargaLalu: 1000 },
  { id: 'b5', nama: 'Tempe Daun', satuan: 'pcs', hargaLalu: 3000 },
  { id: 'b6', nama: 'Sayur Bayam', satuan: 'ikat', hargaLalu: 2500 },
  { id: 'b7', nama: 'Sayur Wortel', satuan: 'kg', hargaLalu: 12000 },
  { id: 'b8', nama: 'Minyak Goreng', satuan: 'liter', hargaLalu: 16000 },
  { id: 'b9', nama: 'Gula Pasir', satuan: 'kg', hargaLalu: 17000 },
  { id: 'b10', nama: 'Garam Beryodium', satuan: 'pack', hargaLalu: 2500 },
  { id: 'b11', nama: 'Gas Elpiji 3kg', satuan: 'tabung', hargaLalu: 20000 },
];

export default function SurveiHargaPage() {
  const role = useAuthStore(s => s.role);
  const [status, setStatus] = useState<'belum' | 'sebagian' | 'selesai'>('belum');
  
  // Inisialisasi state untuk 3 supplier default per bahan
  const [surveiData, setSurveiData] = useState<ItemSurvei[]>(
    MOCK_BAHAN.map(b => ({
      ...b,
      suppliers: [
        { supplier_id: 's1', nama_supplier: 'BUMDesa', harga: 0 },
        { supplier_id: 's2', nama_supplier: 'Koperasi', harga: 0 },
        { supplier_id: 's3', nama_supplier: 'Pasar', harga: 0 },
      ]
    }))
  );

  const handleUpdateHarga = (bahanId: string, suppIndex: number, newHarga: number) => {
    setStatus('sebagian');
    setSurveiData(prev => prev.map(item => {
      if (item.id === bahanId) {
        const newSuppliers = [...item.suppliers];
        newSuppliers[suppIndex] = { ...newSuppliers[suppIndex], harga: newHarga };
        return { ...item, suppliers: newSuppliers };
      }
      return item;
    }));
  };

  const handleSahkan = () => {
    if (!['owner', 'kasppg'].includes(role)) {
      return toast.error('Akses Ditolak', 'Hanya Ka.SPPG yang dapat mengesahkan survei harga.');
    }
    
    // Validasi sederhana: minimal 50% bahan punya setidaknya 1 harga terisi
    const terisi = surveiData.filter(d => d.suppliers.some(s => s.harga > 0)).length;
    if (terisi < MOCK_BAHAN.length / 2) {
      return toast.error('Survei Belum Lengkap', 'Silakan lengkapi minimal 50% data survei sebelum disahkan.');
    }

    setStatus('selesai');
    toast.sukses('Survei Harga berhasil disahkan!');
  };

  const handleGeneratePDF = () => {
    toast.info('Fitur PDF sedang disiapkan (menggunakan jsPDF).');
  };

  return (
    <div className="animate-fade-in pb-12">
      <div className="bg-white p-5 rounded-2xl border mb-5 shadow-sm" style={{ borderColor: '#e2e8f0' }}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="font-display text-xl font-semibold text-slate-900 flex items-center gap-2">
              <FileSearch className="text-blue-600" /> Survei Harga Mingguan
            </h1>
            <p className="text-sm text-slate-500 mt-1">Wajib dilakukan setiap minggu sesuai juknis BGN untuk referensi PO.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <p className="text-[10px] text-slate-500 font-medium">Status Minggu Ini</p>
              {status === 'belum' && <span className="badge-danger text-xs mt-1">Belum Dilakukan</span>}
              {status === 'sebagian' && <span className="badge-warning text-xs mt-1">Draf / Sebagian</span>}
              {status === 'selesai' && <span className="badge-success text-xs mt-1"><CheckCircle2 size={12} className="inline mr-1"/> Selesai Disahkan</span>}
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <p className="text-[10px] text-slate-500 font-medium">Periode</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">Senin, 7 Jul - Minggu, 13 Jul</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3 font-semibold text-slate-700 w-48">Nama Bahan</th>
                <th className="p-3 font-semibold text-slate-700 text-center w-16">Satuan</th>
                <th className="p-3 font-semibold text-slate-700">Supplier 1 (BUMDesa)</th>
                <th className="p-3 font-semibold text-slate-700">Supplier 2 (Koperasi)</th>
                <th className="p-3 font-semibold text-slate-700">Supplier 3 (Pasar)</th>
                <th className="p-3 font-semibold text-slate-700 text-center bg-blue-50/50">Termurah</th>
                <th className="p-3 font-semibold text-slate-700 text-right">vs Minggu Lalu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {surveiData.map((item) => {
                const hargaArray = item.suppliers.filter(s => s.harga > 0).map(s => s.harga);
                const termurah = hargaArray.length > 0 ? Math.min(...hargaArray) : 0;
                
                // Hitung selisih vs minggu lalu
                let selisihPersen = 0;
                if (termurah > 0 && item.hargaLalu > 0) {
                  selisihPersen = ((termurah - item.hargaLalu) / item.hargaLalu) * 100;
                }

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-medium text-slate-800">{item.nama}</td>
                    <td className="p-3 text-slate-500 text-center text-xs">{item.satuan}</td>
                    
                    {/* Render 3 Kolom Supplier */}
                    {item.suppliers.map((supp, idx) => (
                      <td key={idx} className="p-3">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">Rp</span>
                          <input 
                            type="number" 
                            disabled={status === 'selesai'}
                            value={supp.harga || ''} 
                            onChange={(e) => handleUpdateHarga(item.id, idx, Number(e.target.value))}
                            className={`input text-xs pl-8 py-1.5 w-full ${supp.harga === termurah && termurah > 0 ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-800 ring-1 ring-emerald-300' : 'bg-white'}`}
                            placeholder="0"
                          />
                        </div>
                      </td>
                    ))}

                    <td className="p-3 text-center bg-blue-50/30">
                      {termurah > 0 ? (
                        <span className="font-bold text-blue-700">Rp {termurah.toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      {termurah === 0 ? <span className="text-slate-300">-</span> : (
                        <div className="flex flex-col items-end">
                          <span className={`text-xs font-semibold ${selisihPersen > 0 ? 'text-rose-600' : (selisihPersen < 0 ? 'text-emerald-600' : 'text-slate-400')}`}>
                            {selisihPersen > 0 ? '↑ ' : (selisihPersen < 0 ? '↓ ' : '= ')}
                            {Math.abs(selisihPersen).toFixed(1)}%
                          </span>
                          {selisihPersen > 10 && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] bg-rose-100 text-rose-700 px-1 rounded mt-0.5 font-bold">
                              <AlertTriangle size={8}/> Naik Tinggi
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-xs text-slate-500 max-w-lg">
          Catatan: Harga termurah yang disahkan akan otomatis menjadi referensi pagu maksimal saat pembuatan <strong>Purchase Order (PO)</strong> kepada Supplier.
        </p>
        <div className="flex gap-3">
          {status === 'selesai' && (
            <button onClick={handleGeneratePDF} className="btn-secondary text-sm">
              <Download size={16} className="mr-1.5" /> Unduh PDF
            </button>
          )}
          {status !== 'selesai' && (
            <button onClick={handleSahkan} className="btn-primary bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-sm py-2">
              <ShieldCheck size={16} className="mr-1.5" /> Sahkan Survei Harga
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
