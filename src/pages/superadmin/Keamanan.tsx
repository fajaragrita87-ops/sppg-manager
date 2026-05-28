import React, { useState } from 'react';
import { Shield, ShieldAlert, Activity, UserPlus, Key, EyeOff } from 'lucide-react';
import { toast } from '@/store/toastStore';

const MOCK_ADMINS = [
  { id: 1, nama: 'Super Admin Utama', email: 'admin@sppg.id', role: 'super_admin', last_login: 'Baru saja', fa: true },
  { id: 2, nama: 'Budi Support', email: 'support@sppg.id', role: 'support', last_login: '2 jam lalu', fa: false },
  { id: 3, nama: 'Siti Finance', email: 'finance@sppg.id', role: 'finance_viewer', last_login: 'Kemarin', fa: true },
];

export default function Keamanan() {
  const [activeTab, setActiveTab] = useState('audit');

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Keamanan & Audit</h1>
        <p className="text-slate-500 text-sm mt-1">Pantau aktivitas platform, anomali keamanan, dan kelola akses Super Admin</p>
      </div>

      <div className="flex border-b border-slate-200">
        {[
          { id: 'audit', label: 'Audit Log Global', icon: Activity },
          { id: 'anomali', label: 'Akses Mencurigakan', icon: ShieldAlert },
          { id: 'admins', label: 'Super Admin Accounts', icon: Key },
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

      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Aktivitas Sensitif Terkini</h3>
            <div className="flex gap-2">
              <input type="date" className="text-sm border rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500" />
              <select className="text-sm border rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500">
                <option>Semua Aksi</option>
                <option>Hapus Data</option>
                <option>Login Gagal</option>
                <option>Ubah Role</option>
              </select>
            </div>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-b border-slate-200 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">User & SPPG</th>
                <th className="px-5 py-3">Aksi</th>
                <th className="px-5 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-500">2026-05-15 10:45:12</td>
                <td className="px-5 py-3 text-slate-800">ahmad@sppg (SP-001)</td>
                <td className="px-5 py-3 text-rose-600 font-bold">DELETE_INVENTORI</td>
                <td className="px-5 py-3 text-slate-500">114.120.45.10</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-500">2026-05-15 10:30:00</td>
                <td className="px-5 py-3 text-slate-800">system_cron</td>
                <td className="px-5 py-3 text-blue-600 font-bold">SYNC_BGN_SUCCESS</td>
                <td className="px-5 py-3 text-slate-500">127.0.0.1</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-500">2026-05-15 09:15:22</td>
                <td className="px-5 py-3 text-slate-800">admin@sppg.id (SuperAdmin)</td>
                <td className="px-5 py-3 text-amber-600 font-bold">UPDATE_PAKET_PRICE</td>
                <td className="px-5 py-3 text-slate-500">202.80.20.1</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'anomali' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-rose-500">
          <div className="p-4 border-b border-slate-200 bg-rose-50/30">
            <h3 className="font-bold text-rose-900 flex items-center gap-2"><ShieldAlert size={18}/> Akses Mencurigakan (Login Gagal Berulang)</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-b border-slate-200 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3">IP Address</th>
                <th className="px-5 py-3">Percobaan</th>
                <th className="px-5 py-3">Terakhir Dicoba</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 font-mono text-slate-800">182.253.120.45</td>
                <td className="px-5 py-3 text-rose-600 font-bold">14 kali</td>
                <td className="px-5 py-3 text-slate-500 text-xs">5 menit yang lalu</td>
                <td className="px-5 py-3 text-right">
                  <button className="px-3 py-1.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-lg hover:bg-rose-200">Blokir IP</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'admins' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-slate-900">List Super Admin Terdaftar</h3>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-white border-b border-slate-200 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3">Nama & Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3 text-center">Status 2FA</th>
                  <th className="px-5 py-3">Terakhir Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_ADMINS.map(admin => (
                  <tr key={admin.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="font-bold text-slate-900">{admin.nama}</div>
                      <div className="text-xs text-slate-500">{admin.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        admin.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {admin.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {admin.fa ? <span className="text-emerald-500 font-bold">Aktif</span> : <span className="text-rose-500">Off</span>}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">{admin.last_login}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-slate-900 rounded-xl p-6 shadow-sm text-white">
            <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2"><UserPlus size={18}/> Tambah Admin</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Nama Lengkap</label>
                <input type="text" className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Email Internal</label>
                <input type="email" placeholder="@sppg.id" className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Role Akses</label>
                <select className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                  <option value="support">Support / CS</option>
                  <option value="finance_viewer">Finance Viewer</option>
                  <option value="super_admin">Super Admin (Full)</option>
                </select>
              </div>
              <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold mt-2">Buat Akun</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
