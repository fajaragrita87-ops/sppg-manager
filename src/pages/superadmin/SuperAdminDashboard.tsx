import React from 'react';
import { 
  Building2, 
  CreditCard, 
  Users, 
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Filter,
  Search,
  Eye,
  ExternalLink
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

// --- Mock Data SaaS ---
const revenueData = [
  { name: 'Jan', mrr: 15000000 },
  { name: 'Feb', mrr: 18000000 },
  { name: 'Mar', mrr: 22000000 },
  { name: 'Apr', mrr: 28000000 },
  { name: 'Mei', mrr: 35000000 },
  { name: 'Jun', mrr: 45000000 },
  { name: 'Jul', mrr: 48700000 }
];

const laporanData = [
  { minggu: 'Mg. 16', total: 120 },
  { minggu: 'Mg. 17', total: 145 },
  { minggu: 'Mg. 18', total: 170 },
  { minggu: 'Mg. 19', total: 198 },
  { minggu: 'Mg. 20', total: 215 },
];

const LAPORAN_MASUK = [
  { id: 'L30-001', sppg: 'SPPG Harapan Jaya', jenis: 'Lampiran 30 (A,C,D,L)', waktu: '10 menit yang lalu', status: 'Menunggu Verifikasi', file: 'PDF/JSON' },
  { id: 'L30-002', sppg: 'SPPG Nusantara', jenis: 'Lampiran 30 (C)', waktu: '1 jam yang lalu', status: 'Terverifikasi', file: 'PDF/JSON' },
  { id: 'L30-003', sppg: 'SPPG Mekar Sari', jenis: 'Lampiran 30 (A,C,D,L)', waktu: '3 jam yang lalu', status: 'Terverifikasi', file: 'PDF/JSON' },
  { id: 'L30-004', sppg: 'SPPG Tunas Karya', jenis: 'Lampiran 30 (A,C)', waktu: 'Kemarin', status: 'Perlu Perbaikan', file: 'PDF/JSON' },
];

const KLIEN_SPPG = [
  { name: 'SPPG Bina Bangsa', plan: 'Enterprise', users: 15, joined: '2 hari yang lalu', status: 'Aktif' },
  { name: 'SPPG Melati', plan: 'Pro', users: 8, joined: '5 hari yang lalu', status: 'Aktif' },
  { name: 'SPPG Sido Makmur', plan: 'Starter (Trial)', users: 2, joined: 'Minggu lalu', status: 'Trial' },
];

const SuperAdminDashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            SaaS Overview
          </h1>
          <p className="text-slate-500 text-sm mt-1">Pantau performa aplikasi, langganan klien, dan arus laporan BGN secara real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-bold hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95">
            <Download size={16} /> Export Data Konsolidasi
          </button>
        </div>
      </div>

      {/* KPI UTAMA SAAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Klien Aktif */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.15)] transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100/50 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-xl shadow-inner border border-blue-100/50">
              <Building2 size={22} />
            </div>
            <span className="flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full shadow-sm">
              <ArrowUpRight size={14} className="mr-0.5" /> +12 bln ini
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Klien SPPG Aktif</h3>
            <div className="text-3xl font-display font-bold text-slate-900 mt-1">198</div>
            <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">145 Pro</span> • <span>38 Ent.</span> • <span>15 Trial</span>
            </div>
          </div>
        </div>

        {/* KPI 2: MRR */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.15)] transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 rounded-xl shadow-inner border border-emerald-100/50">
              <CreditCard size={22} />
            </div>
            <span className="flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full shadow-sm">
              <ArrowUpRight size={14} className="mr-0.5" /> +7.2%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">SaaS MRR</h3>
            <div className="text-3xl font-display font-bold text-slate-900 mt-1">Rp 48.7M</div>
            <div className="mt-2 text-xs text-slate-500 font-medium">
              Estimasi ARR: <span className="text-slate-700">Rp 584 Juta</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Volume Laporan */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.15)] transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100/50 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 bg-gradient-to-br from-purple-50 to-fuchsia-50 text-purple-600 rounded-xl shadow-inner border border-purple-100/50">
              <FileText size={22} />
            </div>
            <span className="flex items-center text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-full shadow-sm">
              Minggu ini
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Laporan BGN</h3>
            <div className="text-3xl font-display font-bold text-slate-900 mt-1">8,492</div>
            <div className="mt-2 text-xs text-slate-500 font-medium">
              Dokumen diproses via sistem
            </div>
          </div>
        </div>

        {/* KPI 4: Users Aktif */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.15)] transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-100/50 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-2">
            <div className="p-2.5 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 rounded-xl shadow-inner border border-amber-100/50">
              <Users size={22} />
            </div>
            <span className="flex items-center text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-full shadow-sm">
              DAU: 68%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">User App Aktif</h3>
            <div className="text-3xl font-display font-bold text-slate-900 mt-1">1,284</div>
            <div className="mt-2 text-xs text-slate-500 font-medium">
              Dari 1,850 total user terdaftar
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MRR Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-6">Pertumbuhan Revenue (MRR)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis 
                  axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} 
                  tickFormatter={(val) => `Rp${val/1000000}M`} dx={-10} 
                />
                <RechartsTooltip 
                  formatter={(value: number) => [`Rp ${(value).toLocaleString('id-ID')}`, 'MRR']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="mrr" stroke="#1e6fbf" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume Laporan Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-6">Volume Laporan BGN yang Dihasilkan SPPG</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={laporanData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="minggu" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                <RechartsTooltip 
                  formatter={(value: number) => [value, 'Laporan Terkirim']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Bar dataKey="total" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TABEL LAPORAN BGN MASUK (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-base font-bold text-slate-900">Arus Laporan BGN Masuk</h3>
              <p className="text-xs text-slate-500 mt-0.5">Laporan terbaru yang digenerate & disubmit oleh klien SPPG</p>
            </div>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Lihat Semua Laporan
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 font-medium">ID / Waktu</th>
                  <th className="px-5 py-3 font-medium">Klien SPPG</th>
                  <th className="px-5 py-3 font-medium">Jenis Dokumen</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {LAPORAN_MASUK.map((lap, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="font-mono text-xs font-bold text-slate-900">{lap.id}</div>
                      <div className="text-[10px] text-slate-500">{lap.waktu}</div>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-800">{lap.sppg}</td>
                    <td className="px-5 py-3 text-slate-600 text-xs">{lap.jenis}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        lap.status === 'Terverifikasi' ? 'bg-emerald-100 text-emerald-700' :
                        lap.status === 'Menunggu Verifikasi' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {lap.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Lihat Laporan">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* KLIEN SPPG TERBARU (1/3 width) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-base font-bold text-slate-900">Klien SPPG Terbaru</h3>
            <p className="text-xs text-slate-500 mt-0.5">Pendaftar baru di aplikasi</p>
          </div>
          <div className="p-0">
            <div className="divide-y divide-slate-100">
              {KLIEN_SPPG.map((klien, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{klien.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{klien.plan}</span>
                      <span className="text-[10px] text-slate-500">{klien.users} users</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold ${klien.status === 'Aktif' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {klien.status}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{klien.joined}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button className="w-full text-sm font-medium text-blue-600 hover:text-blue-800">
                Kelola Semua Klien SPPG →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
