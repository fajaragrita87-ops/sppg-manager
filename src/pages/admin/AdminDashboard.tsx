import React from 'react';
import { 
  Building2, 
  CreditCard, 
  Users, 
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  PackageCheck,
  ShieldAlert,
  Search,
  Filter
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

// --- Mock Data ---
const porsiData = [
  { hari: 'Sen', target: 580000, realisasi: 575000 },
  { hari: 'Sel', target: 580000, realisasi: 578000 },
  { hari: 'Rab', target: 580000, realisasi: 580000 },
  { hari: 'Kam', target: 580000, realisasi: 572000 },
  { hari: 'Jum', target: 580000, realisasi: 579000 },
];

const complianceData = [
  { name: 'Tepat Waktu', value: 185, color: '#10b981' }, // emerald-500
  { name: 'Terlambat', value: 8, color: '#f59e0b' },    // amber-500
  { name: 'Belum Kirim', value: 5, color: '#ef4444' },  // rose-500
];

const SPPG_MONITORING = [
  { id: 'SP-001', name: 'SPPG Harapan Jaya', region: 'DKI Jakarta', porsi: 3000, produksi: 'Selesai', laporan: 'Terkirim', status: 'Aktif', plan: 'Pro' },
  { id: 'SP-002', name: 'SPPG Nusantara', region: 'Jawa Timur', porsi: 2500, produksi: 'Proses', laporan: 'Belum', status: 'Aktif', plan: 'Enterprise' },
  { id: 'SP-003', name: 'SPPG Mekar Sari', region: 'Jawa Tengah', porsi: 1500, produksi: 'Selesai', laporan: 'Terlambat', status: 'Aktif', plan: 'Starter' },
  { id: 'SP-004', name: 'SPPG Bina Bangsa', region: 'Banten', porsi: 4000, produksi: 'Masalah', laporan: 'Belum', status: 'Suspended', plan: 'Pro' },
  { id: 'SP-005', name: 'SPPG Tunas Karya', region: 'Jawa Barat', porsi: 3500, produksi: 'Selesai', laporan: 'Terkirim', status: 'Aktif', plan: 'Pro' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-red-200">
            <ShieldAlert size={12} /> Super Admin Control
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Command Center BGN</h1>
          <p className="text-slate-500 text-sm mt-1">Pemantauan global seluruh unit SPPG & performa SaaS</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistem Normal
          </span>
          <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 block p-2 font-medium shadow-sm">
            <option>Hari Ini (15 Mei 2026)</option>
            <option>Kemarin</option>
            <option>Minggu Ini</option>
          </select>
        </div>
      </div>

      {/* KPI GLOBAL - MBG PROGRAM LEVEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Skala Jaringan */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Building2 size={64} className="text-blue-600" />
          </div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Building2 size={20} />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
              <ArrowUpRight size={14} className="mr-0.5" /> +12 SPPG
            </span>
          </div>
          <div className="mt-4 relative z-10">
            <h3 className="text-sm font-medium text-slate-500">Total SPPG Jaringan</h3>
            <div className="text-3xl font-display font-bold text-slate-900 mt-1">247 <span className="text-sm font-normal text-slate-500">Unit</span></div>
            <div className="mt-3 flex items-center gap-3 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> 198 Aktif</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> 34 Trial</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> 15 Off</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Impact MBG */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={64} className="text-emerald-600" />
          </div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Users size={20} />
            </div>
            <span className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
              Nasional
            </span>
          </div>
          <div className="mt-4 relative z-10">
            <h3 className="text-sm font-medium text-slate-500">Penerima Manfaat Global</h3>
            <div className="text-3xl font-display font-bold text-slate-900 mt-1">684.5K <span className="text-sm font-normal text-slate-500">Siswa</span></div>
            <div className="mt-3 text-xs font-medium text-emerald-600 flex items-center gap-1">
              <PackageCheck size={14} /> 579,000 porsi terdistribusi hari ini
            </div>
          </div>
        </div>

        {/* KPI 3: Kepatuhan BGN */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileText size={64} className="text-purple-600" />
          </div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <FileText size={20} />
            </div>
            <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
              Minggu ke-20
            </span>
          </div>
          <div className="mt-4 relative z-10">
            <h3 className="text-sm font-medium text-slate-500">Kepatuhan Lampiran 30</h3>
            <div className="text-3xl font-display font-bold text-slate-900 mt-1">93.4% <span className="text-sm font-normal text-slate-500">Patuh</span></div>
            <div className="mt-3 text-xs font-medium text-slate-500 flex items-center gap-2">
              <span className="text-rose-600 font-bold flex items-center gap-1"><AlertCircle size={12}/> 5 SPPG</span> belum lapor
            </div>
          </div>
        </div>

        {/* KPI 4: Financial SaaS */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden group bg-slate-900 border-none text-white">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CreditCard size={64} className="text-white" />
          </div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="p-2 bg-white/10 text-white rounded-lg backdrop-blur-sm">
              <CreditCard size={20} />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
              <ArrowUpRight size={14} className="mr-0.5" /> +7.2%
            </span>
          </div>
          <div className="mt-4 relative z-10">
            <h3 className="text-sm font-medium text-slate-300">SaaS MRR (Est.)</h3>
            <div className="text-3xl font-display font-bold text-white mt-1">Rp 48.7<span className="text-xl">M</span></div>
            <div className="mt-3 text-xs font-medium text-slate-400">
              Total Dana BGN terkelola: Rp 4.2 Triliun
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Production Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-900">Volume Produksi Porsi (Nasional)</h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">Minggu Ini</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porsiData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hari" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `${val/1000}k`} dx={-10} />
                <RechartsTooltip 
                  formatter={(value: number) => [value.toLocaleString('id-ID'), 'Porsi']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="target" name="Target BGN" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="realisasi" name="Realisasi Dapur" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compliance Donut */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-900 mb-2">Status Pelaporan (Mg. 20)</h3>
          <p className="text-xs text-slate-500 mb-4">Kepatuhan submit Lampiran 30</p>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={complianceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-display font-bold text-slate-900">198</span>
              <span className="text-xs text-slate-500">SPPG Wajib Lapor</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {complianceData.map(c => (
              <div key={c.name} className="text-center">
                <div className="text-xs text-slate-500 mb-1 truncate">{c.name}</div>
                <div className="font-bold text-slate-900">{c.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABEL MONITORING LIVE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Live SPPG Command Center</h3>
            <p className="text-xs text-slate-500 mt-0.5">Pantau status operasional dapur secara real-time</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Cari SPPG, wilayah..." className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 bg-white shadow-sm">
              <Filter size={16} />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Nama SPPG & ID</th>
                <th className="px-6 py-4 font-medium">Wilayah</th>
                <th className="px-6 py-4 font-medium">Produksi Hari Ini</th>
                <th className="px-6 py-4 font-medium">Laporan BGN</th>
                <th className="px-6 py-4 font-medium">Paket / Status Akun</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SPPG_MONITORING.map((sppg, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{sppg.name}</p>
                    <p className="text-xs font-mono text-slate-500">{sppg.id}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{sppg.region}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {sppg.produksi === 'Selesai' && <CheckCircle2 size={16} className="text-emerald-500"/>}
                      {sppg.produksi === 'Proses' && <Activity size={16} className="text-blue-500 animate-pulse"/>}
                      {sppg.produksi === 'Masalah' && <ShieldAlert size={16} className="text-rose-500"/>}
                      <div>
                        <span className="font-medium text-slate-900 block">{sppg.porsi.toLocaleString('id-ID')} Porsi</span>
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${
                          sppg.produksi === 'Selesai' ? 'text-emerald-600' : 
                          sppg.produksi === 'Proses' ? 'text-blue-600' : 'text-rose-600'
                        }`}>{sppg.produksi}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      sppg.laporan === 'Terkirim' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      sppg.laporan === 'Terlambat' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {sppg.laporan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{sppg.plan}</p>
                    <span className="flex items-center gap-1 text-xs text-emerald-600 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {sppg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                      Masuk (Impersonate)
                    </button>
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
