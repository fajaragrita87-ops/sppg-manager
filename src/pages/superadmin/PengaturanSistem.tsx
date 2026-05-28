import React, { useState } from 'react';
import { Settings, Globe, Mail, Wrench, Save, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { toast } from '@/store/toastStore';

export default function PengaturanSistem() {
  const [activeTab, setActiveTab] = useState('umum');
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Pengaturan Sistem Global</h1>
        <p className="text-slate-500 text-sm mt-1">Konfigurasi utama aplikasi, integrasi pihak ketiga, dan mode pemeliharaan</p>
      </div>

      <div className="flex border-b border-slate-200">
        {[
          { id: 'umum', label: 'Umum & Tampilan', icon: Settings },
          { id: 'api', label: 'API & Integrasi BGN', icon: Globe },
          { id: 'email', label: 'SMTP & Email', icon: Mail },
          { id: 'maintenance', label: 'Maintenance Mode', icon: Wrench },
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

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
        
        {/* TAB UMUM */}
        {activeTab === 'umum' && (
          <div className="space-y-6 max-w-2xl">
            <div className="grid gap-4">
              <div><label className="block text-sm font-bold text-slate-700 mb-1">Nama Aplikasi</label><input type="text" defaultValue="SPPG Manager" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">URL Aplikasi Utama</label><input type="text" defaultValue="https://app.sppgmanager.id" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-500 bg-slate-50"/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Email Support</label><input type="email" defaultValue="support@sppgmanager.id" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1">WhatsApp Support</label><input type="text" defaultValue="081234567890" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/></div>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="font-bold text-slate-800">Fitur Publik</h3>
              <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <div>
                  <div className="font-bold text-slate-700">Pendaftaran Terbuka</div>
                  <div className="text-xs text-slate-500">Izinkan publik mendaftar via Landing Page</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </label>
              <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <div>
                  <div className="font-bold text-slate-700">Demo Mode</div>
                  <div className="text-xs text-slate-500">Tampilkan tombol Bypass Login dan data dummy</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </label>
            </div>
            <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"><Save size={16}/> Simpan Perubahan</button>
          </div>
        )}

        {/* TAB API */}
        {activeTab === 'api' && (
          <div className="space-y-8 max-w-3xl">
            {/* SIPGN */}
            <div className="border border-slate-200 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Globe className="text-emerald-500"/> Integrasi SIPGN BGN Pusat</h3>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"><CheckCircle2 size={14}/> Terhubung</span>
              </div>
              <div className="space-y-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Endpoint URL</label><input type="text" defaultValue="https://api.sipgn.bgn.go.id/v1" disabled className="w-full p-2 border rounded-lg bg-slate-50 text-slate-600"/></div>
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Production API Key</label>
                  <input type={showKey ? "text" : "password"} defaultValue="sk_prod_bgn_8f92j3kf0293kf02" disabled className="w-full p-2 pr-10 border rounded-lg bg-slate-50 text-slate-600 font-mono text-sm"/>
                  <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-7 text-slate-400 hover:text-blue-600"><Eye size={16}/></button>
                </div>
                <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">Test Koneksi Sinkronisasi</button>
              </div>
            </div>

            {/* Supabase */}
            <div className="border border-slate-200 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Globe className="text-emerald-500"/> Supabase Database (BaaS)</h3>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"><CheckCircle2 size={14}/> OK</span>
              </div>
              <div className="space-y-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Project URL</label><input type="text" defaultValue="https://xyz.supabase.co" disabled className="w-full p-2 border rounded-lg bg-slate-50 text-slate-600"/></div>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder untuk Tab Email & Maintenance */}
        {activeTab === 'email' && <div className="text-slate-500 text-center py-20">Pengaturan SMTP Server dan Template Email (SendGrid / AWS SES) akan tampil di sini.</div>}
        {activeTab === 'maintenance' && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
              <Wrench size={48} className="text-rose-500 mx-auto mb-4" />
              <h3 className="text-xl font-black text-rose-900 mb-2">Aktifkan Maintenance Mode</h3>
              <p className="text-sm text-rose-700 mb-6">Semua user biasa akan di-logout dan melihat halaman "Under Maintenance". Hanya Super Admin yang bisa login.</p>
              <button className="bg-rose-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-200">Kunci Aplikasi Sekarang</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
