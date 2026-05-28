import { useState } from 'react';
import { RefreshCw, CloudOff, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { toast } from '@/store/toastStore';

// Mock Sync Data
const INITIAL_SYNC_HISTORY = [
  { id: 1, tanggal: '15 Jul 2025', jenis: 'Harian (Lampiran 30a)', status: 'success', waktu: '14:30 WIB' },
  { id: 2, tanggal: '15 Jul 2025', jenis: '2 Mingguan (Lampiran 30c)', status: 'queue', waktu: '-' },
  { id: 3, tanggal: '14 Jul 2025', jenis: 'Harian (Lampiran 30a)', status: 'success', waktu: '15:10 WIB' },
  { id: 4, tanggal: '13 Jul 2025', jenis: 'Harian (Lampiran 30a)', status: 'failed', waktu: '16:00 WIB' },
  { id: 5, tanggal: '12 Jul 2025', jenis: 'Harian (Lampiran 30a)', status: 'success', waktu: '14:45 WIB' },
];

export default function StatusSyncPage() {
  const [syncHistory, setSyncHistory] = useState(INITIAL_SYNC_HISTORY);

  const queueCount = syncHistory.filter(s => s.status === 'queue').length;
  const failCount = syncHistory.filter(s => s.status === 'failed').length;

  const handleKirimUlang = () => {
    toast.info('Mencoba sinkronisasi ulang...');
    setTimeout(() => {
      // Ubah semua yang failed atau queue menjadi success
      setSyncHistory(prev => prev.map(s => 
        s.status === 'failed' || s.status === 'queue' ? { ...s, status: 'success', waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' } : s
      ));
      toast.sukses('Sinkronisasi berhasil! Semua laporan telah terkirim.');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2"><RefreshCw className="text-blue-600"/> Status Sinkronisasi ke BGN</h1>
        <p className="text-slate-500 mt-1">Pantau status pengiriman laporan ke server pusat (SIPGN/Dialur).</p>
      </div>

      {/* KARTU STATUS REAL-TIME */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Status Sistem</p>
              <h3 className="font-bold text-slate-800 mt-1">Online</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={16}/></div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3">Terakhir terhubung: Baru saja</p>
        </div>

        <div className={`card p-5 border-l-4 ${queueCount > 0 ? 'border-l-amber-500' : 'border-l-slate-200'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Dalam Antrian</p>
              <h3 className={`font-bold mt-1 ${queueCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>{queueCount} Laporan</h3>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${queueCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
              {queueCount > 0 ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16}/>}
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3">Akan dikirim otomatis saat internet stabil</p>
        </div>

        <div className={`card p-5 border-l-4 ${failCount > 0 ? 'border-l-rose-500' : 'border-l-slate-200'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Gagal Sinkron</p>
              <h3 className={`font-bold mt-1 ${failCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{failCount} Laporan</h3>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${failCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
              {failCount > 0 ? <AlertTriangle size={16} /> : <CheckCircle2 size={16}/>}
            </div>
          </div>
          {failCount > 0 && (
            <button onClick={handleKirimUlang} className="mt-3 text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2 py-1 rounded w-full text-center">Coba Kirim Ulang Semua</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Riwayat Sinkronisasi (30 Hari Terakhir)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="p-4 font-semibold">Tanggal Data</th>
                    <th className="p-4 font-semibold">Jenis Laporan</th>
                    <th className="p-4 font-semibold">Waktu Kirim</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {syncHistory.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="p-4 text-xs font-medium text-slate-600">{row.tanggal}</td>
                      <td className="p-4 text-xs text-slate-800">{row.jenis}</td>
                      <td className="p-4 text-xs text-slate-500">{row.waktu}</td>
                      <td className="p-4">
                        {row.status === 'success' && <span className="badge-success text-[10px] flex items-center w-max gap-1"><CheckCircle2 size={12}/> Sukses</span>}
                        {row.status === 'queue' && <span className="badge-warning text-[10px] flex items-center w-max gap-1"><RefreshCw size={12}/> Antrian</span>}
                        {row.status === 'failed' && <span className="badge-danger text-[10px] flex items-center w-max gap-1"><AlertTriangle size={12}/> Gagal</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="card p-5 bg-slate-50 border-dashed border-2 border-slate-200">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><CloudOff size={16}/> Panduan Sync Manual</h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">Jika aplikasi terus gagal melakukan auto-sync karena masalah koneksi API ke server BGN pusat, Anda dapat mengunggah laporan secara manual.</p>
            
            <ol className="text-xs text-slate-600 space-y-3 mb-6 list-decimal list-inside font-medium">
              <li>Pilih menu laporan yang ingin dikirim.</li>
              <li>Klik tombol <strong>Download PDF</strong>.</li>
              <li>Buka web resmi pelaporan BGN.</li>
              <li>Login dengan akun Anda.</li>
              <li>Upload file PDF laporan yang baru didownload.</li>
            </ol>

            <a href="#" className="btn-primary w-full justify-center text-xs bg-blue-600 hover:bg-blue-700 border-blue-600 shadow-md">
              Buka Web SIPGN <ExternalLink size={14} className="ml-1"/>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
