import React, { useState } from 'react';
import { 
  Search, Filter, Download, MoreVertical, Eye, 
  Edit, Ban, CheckCircle, Key, Trash2,
  Building2, Users, Activity, CreditCard, Clock, ChevronLeft
} from 'lucide-react';

const MOCK_SPPG = [
  { id: 'SP-001', nama: 'SPPG Merdeka 01', yayasan: 'Yayasan Bina Bangsa', kota: 'Bandung', prov: 'Jawa Barat', paket: 'Pro', status: 'Aktif', mrr: 299000, tgl: '10 Mei 2026' },
  { id: 'SP-002', nama: 'SPPG Melati Sejahtera', yayasan: 'Yayasan Melati', kota: 'Surabaya', prov: 'Jawa Timur', paket: 'Starter', status: 'Trial', mrr: 0, tgl: '12 Mei 2026' },
  { id: 'SP-003', nama: 'SPPG Papua Maju', yayasan: 'Yayasan Harapan', kota: 'Jayapura', prov: 'Papua', paket: 'Pro', status: 'Suspended', mrr: 299000, tgl: '15 Apr 2026' },
];

export default function KelolaSSPG() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');

  const handleDetail = (id: string) => {
    setSelectedId(id);
    setView('detail');
  };

  if (view === 'detail') {
    const data = MOCK_SPPG.find(s => s.id === selectedId);
    return (
      <div className="space-y-6 animate-fade-in">
        <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
          <ChevronLeft size={16} /> Kembali ke Daftar
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{data?.nama}</h1>
            <p className="text-slate-500 text-sm mt-1">{data?.id} • {data?.yayasan}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
            data?.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
            data?.status === 'Trial' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
            'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            Status: {data?.status}
          </span>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-200">
          {[
            { id: 'info', label: 'Info Umum', icon: Building2 },
            { id: 'users', label: 'User & Role', icon: Users },
            { id: 'usage', label: 'Penggunaan', icon: Activity },
            { id: 'billing', label: 'Billing', icon: CreditCard },
            { id: 'logs', label: 'Log Aktivitas', icon: Clock },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT (Placeholder untuk mempercepat render) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 min-h-[400px]">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-900 border-b pb-2">Informasi Profil</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500 block mb-1">Nama SPPG</span><div className="font-medium">{data?.nama}</div></div>
                <div><span className="text-slate-500 block mb-1">Yayasan Induk</span><div className="font-medium">{data?.yayasan}</div></div>
                <div><span className="text-slate-500 block mb-1">Provinsi</span><div className="font-medium">{data?.prov}</div></div>
                <div><span className="text-slate-500 block mb-1">Kab/Kota</span><div className="font-medium">{data?.kota}</div></div>
              </div>
              <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 mt-4">Edit Profil SPPG</button>
            </div>
          )}
          {activeTab === 'users' && <div className="text-slate-500 text-center py-20">List semua user di SPPG ini akan tampil di sini.</div>}
          {activeTab === 'usage' && <div className="text-slate-500 text-center py-20">Grafik laporan harian & usage storage akan tampil di sini.</div>}
          {activeTab === 'billing' && <div className="text-slate-500 text-center py-20">Riwayat pembayaran & paket {data?.paket} akan tampil di sini.</div>}
          {activeTab === 'logs' && <div className="text-slate-500 text-center py-20">Log aktivitas user (login, hapus data) akan tampil di sini.</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Kelola SPPG</h1>
          <p className="text-slate-500 text-sm mt-1">Manajemen klien, langganan, dan akses unit dapur</p>
        </div>
        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm flex items-center gap-2">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Cari nama SPPG, yayasan, lokasi..." className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select className="flex-1 sm:w-auto bg-white border border-slate-200 text-slate-700 text-sm rounded-lg p-2 focus:outline-none">
              <option>Semua Status</option>
              <option>Aktif</option>
              <option>Trial</option>
              <option>Suspended</option>
              <option>Expired</option>
            </select>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 bg-white">
              <Filter size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-200">
              <tr>
                <th className="px-5 py-4 font-medium"># ID</th>
                <th className="px-5 py-4 font-medium">Nama SPPG & Yayasan</th>
                <th className="px-5 py-4 font-medium">Lokasi</th>
                <th className="px-5 py-4 font-medium text-center">Paket</th>
                <th className="px-5 py-4 font-medium text-center">Status</th>
                <th className="px-5 py-4 font-medium text-right">MRR</th>
                <th className="px-5 py-4 font-medium">Tgl Daftar</th>
                <th className="px-5 py-4 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_SPPG.map((sppg, i) => (
                <tr key={sppg.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">{sppg.id}</td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900">{sppg.nama}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{sppg.yayasan}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-slate-800">{sppg.kota}</div>
                    <div className="text-xs text-slate-500">{sppg.prov}</div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold">{sppg.paket}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      sppg.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                      sppg.status === 'Trial' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {sppg.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-slate-900">
                    {sppg.mrr > 0 ? `Rp ${(sppg.mrr / 1000)}k` : '-'}
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs">{sppg.tgl}</td>
                  <td className="px-5 py-4 text-center relative group">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleDetail(sppg.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Lihat Detail"><Eye size={16}/></button>
                      <div className="relative group">
                        <button className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded"><MoreVertical size={16}/></button>
                        {/* Simple Dropdown Hover */}
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-left overflow-hidden">
                          <button className="w-full px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2"><Edit size={14}/> Edit Paket</button>
                          {sppg.status === 'Suspended' ? (
                            <button className="w-full px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-emerald-600"><CheckCircle size={14}/> Aktifkan Kembali</button>
                          ) : (
                            <button className="w-full px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-rose-600"><Ban size={14}/> Suspend Akun</button>
                          )}
                          <button className="w-full px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2"><Key size={14}/> Reset Password Admin</button>
                          <div className="border-t border-slate-100"></div>
                          <button className="w-full px-4 py-2 text-xs hover:bg-rose-50 text-rose-600 flex items-center gap-2"><Trash2 size={14}/> Hapus Permanen</button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
