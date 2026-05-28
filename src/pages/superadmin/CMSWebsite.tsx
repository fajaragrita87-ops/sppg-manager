import React, { useState } from 'react';
import { LayoutTemplate, Image as ImageIcon, Type, Palette, Save, Eye, RefreshCw } from 'lucide-react';
import { toast } from '@/store/toastStore';

export default function CMSWebsite() {
  const [activeTab, setActiveTab] = useState<'hero' | 'kontak' | 'tema'>('hero');
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    heroTitle: 'Kelola Dapur SPPG, Laporan BGN Otomatis',
    heroSubtitle: 'Platform manajemen lengkap untuk operasional SPPG — dari absensi 47 relawan hingga Lampiran 30 BGN.',
    kontakWa: '6281234567890',
    kontakEmail: 'halo@sppg.id',
    primaryColor: '#1e6fbf',
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.sukses('Perubahan Landing Page berhasil disimpan dan dipublikasikan!');
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">CMS Landing Page</h1>
          <p className="text-slate-500 text-sm mt-1">Ubah tampilan, teks, dan informasi pada halaman depan website SPPG Manager</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 flex items-center gap-2 transition-colors">
            <Eye size={16} /> Preview Web
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70">
            {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? 'Menyimpan...' : 'Publikasikan Perubahan'}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* SIDEBAR CMS */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl p-2 space-y-1 shadow-sm">
            <button
              onClick={() => setActiveTab('hero')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'hero' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Type size={16} /> Teks Utama (Hero)
            </button>
            <button
              onClick={() => setActiveTab('kontak')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'kontak' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ImageIcon size={16} /> Info Kontak & Link
            </button>
            <button
              onClick={() => setActiveTab('tema')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'tema' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Palette size={16} /> Tema & Warna
            </button>
          </div>
        </div>

        {/* EDITOR AREA */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          {activeTab === 'hero' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Pengaturan Teks Utama (Hero Section)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Headline Utama (H1)</label>
                    <input 
                      type="text" 
                      value={formData.heroTitle}
                      onChange={e => setFormData({...formData, heroTitle: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-900"
                    />
                    <p className="text-xs text-slate-500 mt-1">Muncul paling besar di halaman depan.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Sub-headline (Deskripsi)</label>
                    <textarea 
                      rows={3}
                      value={formData.heroSubtitle}
                      onChange={e => setFormData({...formData, heroSubtitle: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 text-slate-700 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Live Preview (Desktop)</h4>
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-inner">
                  <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
                    {formData.heroTitle}
                  </h1>
                  <p className="text-slate-600">{formData.heroSubtitle}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'kontak' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Informasi Kontak & Perusahaan</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Nomor WhatsApp Bantuan</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Wa.me/</span>
                      <input 
                        type="text" 
                        value={formData.kontakWa}
                        onChange={e => setFormData({...formData, kontakWa: e.target.value})}
                        className="w-full pl-16 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                        placeholder="628..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Email Resmi</label>
                    <input 
                      type="email" 
                      value={formData.kontakEmail}
                      onChange={e => setFormData({...formData, kontakEmail: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Logo Perusahaan</h3>
                <div className="flex items-center gap-6 p-4 border border-slate-200 rounded-xl bg-slate-50">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    {/* Placeholder Logo */}
                    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">SPPG Manager Logo</p>
                    <p className="text-xs text-slate-500 mb-2">Format disarankan: PNG transparan, ukuran maks 2MB.</p>
                    <button className="px-3 py-1.5 bg-white border border-slate-300 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-50">Ganti Logo</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tema' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Pengaturan Tema Global</h3>
                <p className="text-sm text-slate-500 mb-4">Warna ini akan diaplikasikan ke semua tombol utama dan aksen di Landing Page.</p>
                
                <div className="flex items-center gap-4 mb-6">
                  <input 
                    type="color" 
                    value={formData.primaryColor}
                    onChange={e => setFormData({...formData, primaryColor: e.target.value})}
                    className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                  />
                  <div>
                    <label className="block text-sm font-bold text-slate-700">Warna Utama (Primary)</label>
                    <p className="text-xs font-mono text-slate-500">{formData.primaryColor}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {['#1e6fbf', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#0f172a'].map(color => (
                    <button 
                      key={color}
                      onClick={() => setFormData({...formData, primaryColor: color})}
                      className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <span className="w-6 h-6 rounded-full border border-black/10" style={{ backgroundColor: color }}></span>
                      <span className="text-xs font-mono text-slate-600 uppercase">{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
