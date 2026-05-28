import React, { useState } from 'react';
import { Send, Bell, Info, AlertTriangle, Gift, Clock, Search, Eye } from 'lucide-react';
import { toast } from '@/store/toastStore';

export default function Broadcast() {
  const [formData, setFormData] = useState({
    target: 'Semua SPPG',
    judul: '',
    pesan: '',
    jenis: 'Informasi',
    jadwal: 'Sekarang',
  });

  const handleKirim = () => {
    if (!formData.judul || !formData.pesan) {
      toast.error('Judul dan pesan tidak boleh kosong');
      return;
    }
    toast.sukses('Broadcast berhasil dijadwalkan!');
    setFormData({ ...formData, judul: '', pesan: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Broadcast & Notifikasi</h1>
        <p className="text-slate-500 text-sm mt-1">Kirim pengumuman langsung ke dashboard semua klien SPPG</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Target Penerima</label>
            <div className="flex flex-wrap gap-3">
              {['Semua SPPG', 'Paket Pro', 'Paket Enterprise', 'SPPG Tertentu'].map(t => (
                <label key={t} className="flex items-center gap-2 text-sm cursor-pointer border p-2 rounded-lg hover:bg-slate-50">
                  <input type="radio" name="target" checked={formData.target === t} onChange={() => setFormData({...formData, target: t})} className="text-blue-600 focus:ring-blue-500" />
                  {t}
                </label>
              ))}
            </div>
            {formData.target === 'SPPG Tertentu' && (
              <div className="mt-3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                <input type="text" placeholder="Cari nama SPPG..." className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Jenis Notifikasi</label>
              <select value={formData.jenis} onChange={e => setFormData({...formData, jenis: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Informasi">Informasi</option>
                <option value="Peringatan">Peringatan</option>
                <option value="Pembaruan Fitur">Pembaruan Fitur</option>
                <option value="Promosi">Promosi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Jadwal Kirim</label>
              <select value={formData.jadwal} onChange={e => setFormData({...formData, jadwal: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Sekarang">Kirim Sekarang</option>
                <option value="Jadwalkan">Jadwalkan...</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Judul Notifikasi</label>
            <input type="text" value={formData.judul} onChange={e => setFormData({...formData, judul: e.target.value})} placeholder="Contoh: Pemeliharaan Server Malam Ini" className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-bold text-slate-700">Isi Pesan</label>
              <span className="text-xs text-slate-400">{formData.pesan.length}/500</span>
            </div>
            <textarea value={formData.pesan} onChange={e => setFormData({...formData, pesan: e.target.value})} rows={4} maxLength={500} placeholder="Tuliskan pesan broadcast Anda di sini..." className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>

          <button onClick={handleKirim} className="bg-blue-600 text-white w-full py-3 rounded-lg font-bold hover:bg-blue-700 shadow-sm shadow-blue-200 flex justify-center items-center gap-2">
            <Send size={16} /> Kirim Broadcast
          </button>
        </div>

        {/* PREVIEW */}
        <div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner h-full">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Eye size={16} /> Preview Notifikasi</h3>
            <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex gap-4">
              <div className={`p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0 ${
                formData.jenis === 'Peringatan' ? 'bg-rose-100 text-rose-600' :
                formData.jenis === 'Promosi' ? 'bg-amber-100 text-amber-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {formData.jenis === 'Peringatan' ? <AlertTriangle size={20} /> :
                 formData.jenis === 'Promosi' ? <Gift size={20} /> :
                 <Info size={20} />}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{formData.judul || 'Judul Notifikasi'}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-3">{formData.pesan || 'Isi pesan akan tampil seperti ini di layar user...'}</p>
                <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1"><Clock size={10} /> Baru saja</div>
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center mt-6">Preview ini menunjukkan bagaimana notifikasi akan terlihat di *TopBar* klien Anda.</p>
          </div>
        </div>
      </div>

      {/* RIWAYAT */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="font-bold text-slate-900">Riwayat Broadcast</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-medium">Tanggal</th>
                <th className="px-5 py-3 font-medium">Judul</th>
                <th className="px-5 py-3 font-medium">Target</th>
                <th className="px-5 py-3 font-medium">Dibaca</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-500">12 Mei 2026, 10:00</td>
                <td className="px-5 py-3 font-medium">Update Fitur Laporan BGN v2.0</td>
                <td className="px-5 py-3 text-slate-600">Semua SPPG</td>
                <td className="px-5 py-3 text-emerald-600 font-medium">85%</td>
                <td className="px-5 py-3"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">Terkirim</span></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-500">10 Mei 2026, 08:00</td>
                <td className="px-5 py-3 font-medium">Gangguan Server Sementara</td>
                <td className="px-5 py-3 text-slate-600">Semua SPPG</td>
                <td className="px-5 py-3 text-emerald-600 font-medium">92%</td>
                <td className="px-5 py-3"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">Terkirim</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
