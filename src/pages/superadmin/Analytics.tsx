import React from 'react';
import { 
  TrendingUp, Users, AlertCircle, BarChart3, PieChart as PieChartIcon, Target, DollarSign
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const growthData = [
  { name: 'Jan', aktif: 120 }, { name: 'Feb', aktif: 135 }, { name: 'Mar', aktif: 150 },
  { name: 'Apr', aktif: 178 }, { name: 'Mei', aktif: 198 }
];

const usageData = [
  { name: 'Absensi', value: 850 }, { name: 'Laporan Harian', value: 720 },
  { name: 'PO/Pengadaan', value: 450 }, { name: 'Inventori', value: 600 }
];

const provData = [
  { name: 'Jawa Barat', value: 45, color: '#3b82f6' },
  { name: 'Jawa Timur', value: 30, color: '#10b981' },
  { name: 'Jawa Tengah', value: 25, color: '#f59e0b' },
  { name: 'Lainnya', value: 15, color: '#94a3b8' },
];

export default function Analytics() {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Analytics & Insights</h1>
          <p className="text-slate-500 text-sm mt-1">Analisis mendalam performa SaaS, retensi klien, dan penggunaan fitur</p>
        </div>
        <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg p-2 font-medium shadow-sm">
          <option>30 Hari Terakhir</option>
          <option>3 Bulan Terakhir</option>
          <option>Tahun Ini</option>
        </select>
      </div>

      {/* SECTION 1: GROWTH METRICS */}
      <h2 className="text-lg font-bold text-slate-800 border-b pb-2">1. Growth Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'New Registrations', val: '+24', icon: Users, color: 'blue' },
          { label: 'Churned', val: '-2', icon: AlertCircle, color: 'rose' },
          { label: 'Net New SPPG', val: '+22', icon: Target, color: 'emerald' },
          { label: 'Total Aktif', val: '198', icon: TrendingUp, color: 'indigo' },
        ].map((k, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 bg-${k.color}-50 text-${k.color}-600 rounded-lg`}><k.icon size={24}/></div>
            <div>
              <div className="text-sm text-slate-500">{k.label}</div>
              <div className="text-2xl font-bold text-slate-900">{k.val}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-72">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Pertumbuhan SPPG Aktif</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={growthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <RechartsTooltip />
            <Line type="monotone" dataKey="aktif" stroke="#3b82f6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* SECTION 2: USAGE METRICS */}
      <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mt-8">2. Usage Metrics & Demografi</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-72">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Fitur Paling Banyak Dipakai (Click Events)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usageData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} />
              <RechartsTooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-72">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Distribusi Klien per Provinsi</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={provData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                {provData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 3: REVENUE */}
      <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mt-8">3. Revenue & ARPU</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-72">
          <h3 className="text-sm font-bold text-slate-900 mb-4">MRR Chart 12 Bulan</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <RechartsTooltip />
              <Line type="monotone" dataKey="aktif" name="MRR" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-900 rounded-xl p-6 shadow-sm text-white">
          <h3 className="text-sm font-bold text-slate-300 mb-6">Financial Summary</h3>
          <div className="space-y-6">
            <div>
              <p className="text-xs text-slate-400 mb-1">Average Revenue Per User (ARPU)</p>
              <p className="text-3xl font-bold font-display">Rp 299.000</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Customer Lifetime Value (Est. 2thn)</p>
              <p className="text-3xl font-bold font-display">Rp 7.176.000</p>
            </div>
            <div className="pt-4 border-t border-slate-700">
              <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                Download Financial Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
