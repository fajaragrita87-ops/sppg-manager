import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useKeuanganStore } from '@/store/keuanganStore';
import { useRekonsiliasi, useInputPenerimaanVA } from '@/hooks/useKeuangan';
import { Wallet, TrendingDown, Clock, Download, Plus, Save, X, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from '@/store/toastStore';
import { getWhatsAppLink } from '@/lib/whatsapp';

export default function DashboardKeuangan() {
  const sppg = useAuthStore(s => s.sppg);
  const keuangan = useKeuanganStore();
  
  const { mutate: simpanVA, isPending } = useInputPenerimaanVA();

  const [showFormVA, setShowFormVA] = useState(false);
  const [formData, setFormData] = useState({ tanggal: new Date().toISOString().split('T')[0], jumlah: '', keterangan: 'Dropping BGN Termin 1' });

  const saldoAkhir = keuangan.saldoVA;
  const pengeluaranTotal = keuangan.pengeluaranBahanBaku + keuangan.pengeluaranOperasional + keuangan.pengeluaranInsentif;
  // rataRata pengeluaran per hari (asumsi dibagi 12 hari aktif)
  const rataRata = pengeluaranTotal / 12 || 7500000;
  const estimasiHari = Math.floor(saldoAkhir / rataRata) || 0;
  
  const handleSaveVA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.jumlah || Number(formData.jumlah) <= 0) return toast.error('Jumlah tidak valid');
    
    simpanVA({
      sppg_id: sppg?.id || '',
      tanggal: formData.tanggal,
      jumlah: Number(formData.jumlah),
      keterangan: formData.keterangan
    }, {
      onSuccess: () => {
        toast.sukses('Penerimaan VA berhasil dicatat ke Kas Besar');
        setShowFormVA(false);
      },
      onError: (err: any) => toast.error('Gagal', err.message)
    });
  };

  return (
    <div className="animate-fade-in pb-12">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="font-display text-xl font-semibold text-slate-900">Dashboard Keuangan</h1>
          <p className="text-sm text-slate-500 mt-1">Rekonsiliasi Kas Besar & Pantauan Pagu</p>
        </div>
        {['owner', 'kasppg', 'pengawas_keuangan'].includes(useAuthStore(s => s.user?.role) || '') && (
          <button onClick={() => setShowFormVA(true)} className="btn-primary text-xs py-2"><Plus size={14} className="mr-1"/> Input Penerimaan VA BGN</button>
        )}
      </div>

      {showFormVA && (
        <div className="card p-5 mb-6 border-l-4 border-l-emerald-500 animate-slide-down">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Catat Uang Masuk (Dropping BGN)</h3>
            <button onClick={() => setShowFormVA(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
          </div>
          <form onSubmit={handleSaveVA} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] font-medium text-slate-500 block mb-1">Tanggal Masuk *</label>
              <input type="date" value={formData.tanggal} onChange={e=>setFormData({...formData, tanggal: e.target.value})} className="input text-sm w-full" required />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-medium text-slate-500 block mb-1">Uraian / Keterangan *</label>
              <input type="text" value={formData.keterangan} onChange={e=>setFormData({...formData, keterangan: e.target.value})} className="input text-sm w-full" required />
            </div>
            <div>
              <label className="text-[10px] font-medium text-slate-500 block mb-1">Jumlah Rp *</label>
              <input type="number" value={formData.jumlah} onChange={e=>setFormData({...formData, jumlah: e.target.value})} className="input text-sm w-full font-bold text-emerald-700" placeholder="0" required />
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button type="submit" disabled={isPending} className="btn-primary bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-xs px-6 py-2"><Save size={14} className="mr-1.5"/> Simpan Pemasukan</button>
            </div>
          </form>
        </div>
      )}

      {/* KARTU SALDO & BURN RATE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className={`card p-5 border-t-4 ${estimasiHari < 7 ? 'border-t-rose-500 bg-rose-50/30' : 'border-t-blue-600'}`}>
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo Virtual Account</p>
            <Wallet size={18} className={estimasiHari < 7 ? 'text-rose-500' : 'text-blue-500'} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight mt-2">Rp {(saldoAkhir/1000000).toFixed(1)}Jt</h2>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
            <Calendar size={12} /> Saldo riil Kas Besar SPPG
          </p>
        </div>

        <div className="card p-5 border-t-4 border-t-amber-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Burn Rate (Rata Harian)</p>
            <TrendingDown size={18} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mt-2">Rp {(rataRata/1000000).toFixed(1)}Jt <span className="text-sm font-medium text-slate-500">/hari</span></h2>
          <p className="text-xs text-slate-500 mt-2">Rata-rata pengeluaran belanja bahan baku bulan ini.</p>
        </div>

        <div className={`card p-5 border-t-4 ${estimasiHari < 7 ? 'border-t-rose-500 bg-rose-50/50 ring-1 ring-rose-200' : 'border-t-emerald-500'}`}>
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimasi Ketahanan Dana</p>
            <Clock size={18} className={estimasiHari < 7 ? 'text-rose-500' : 'text-emerald-500'} />
          </div>
          <h2 className={`text-2xl font-bold tracking-tight mt-2 ${estimasiHari < 7 ? 'text-rose-700' : 'text-slate-800'}`}>± {estimasiHari} Hari Lagi</h2>
          {estimasiHari < 7 ? (
            <button 
              onClick={() => window.open(getWhatsAppLink('bgn', 'topup'), '_blank')}
              className="text-xs text-rose-600 font-bold mt-2 mt-2 flex items-center gap-1 hover:underline cursor-pointer text-left"
            >
              <AlertTriangle size={12}/> Segera ajukan laporan & tagihan top-up ke BGN! (Klik untuk kirim WA)
            </button>
          ) : (
            <p className="text-xs text-slate-500 mt-2">Kondisi likuiditas aman.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRAFIK & BREAKDOWN MOCKUP (Since Recharts might be overkill to fully mock if simple CSS works, we do simple CSS bars) */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><TrendingUp size={16} className="text-slate-400"/> Grafik Pengeluaran 30 Hari</h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-semibold">vs Pagu Harian</span>
          </div>
          
          <div className="h-48 flex items-end justify-between gap-1 mt-4 relative">
            {/* Mock Line untuk Pagu */}
            <div className="absolute w-full h-px bg-rose-300 border-t border-dashed border-rose-300 top-1/4 z-0">
              <span className="absolute -top-4 right-0 text-[9px] font-bold text-rose-500 bg-white px-1">Pagu BGN (Rp 8.5M)</span>
            </div>
            
            {/* Bar chart mockup */}
            {Array.from({length: 30}).map((_, i) => {
              const val = 40 + Math.random() * 40; // 40% to 80%
              const isOver = val > 75;
              return (
                <div key={i} className="w-full relative group z-10">
                  <div 
                    className={`w-full rounded-t-sm transition-all ${isOver ? 'bg-rose-400' : 'bg-blue-300 hover:bg-blue-400'}`} 
                    style={{ height: `${val}%` }}
                  ></div>
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-20">
                    Rp {(val * 0.1).toFixed(1)}Jt
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BREAKDOWN */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-2">Distribusi Pengeluaran</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Bahan Pangan Baku</span>
                <span className="text-slate-500">82%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: '82%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Biaya Operasional</span>
                <span className="text-slate-500">12%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full" style={{width: '12%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Insentif SDM</span>
                <span className="text-slate-500">5%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{width: '5%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Lainnya (Petty Cash)</span>
                <span className="text-slate-500">1%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-slate-400 h-2 rounded-full" style={{width: '1%'}}></div></div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
            <p className="text-[10px] text-blue-600 font-semibold mb-1">Total Serapan Anggaran Bulan Ini</p>
            <p className="text-xl font-bold text-blue-800">Rp {pengeluaranTotal.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
