import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Building, User, Lock, Bell, Users, Globe, Shield, Save, Check, FileText } from 'lucide-react';
import { toast } from '@/store/toastStore';
import { useSettingsStore } from '@/store/settingsStore';
import { singkatNama } from '@/lib/utils';
import NotifikasiSettings from '@/pages/settings/NotifikasiSettings';
import MigrasiData from '@/pages/settings/MigrasiData';
import { Database } from 'lucide-react';

// Role yang boleh akses tab sensitif (Kop Surat, Profil SPPG, Manajemen Tim)
const MANAGEMENT_ROLES = ['owner', 'kasppg', 'pengawas_keuangan'];

export default function SettingsPage() {
  const { user, sppg } = useAuthStore();
  const { docSettings, setDocSettings } = useSettingsStore();
  const isManagement = user ? MANAGEMENT_ROLES.includes(user.role) : false;
  const [activeTab, setActiveTab] = useState<'profil' | 'sppg' | 'keamanan' | 'notifikasi' | 'tim' | 'dokumen' | 'migrasi'>('profil');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'jurutama_masak', nama: '' });
  
  const [mockTim, setMockTim] = useState([
    { id: 1, nama: user?.nama || 'Kepala SPPG', email: user?.email || 'owner@sppg.id', role: 'owner', status: 'Aktif' },
    { id: 2, nama: 'Ahmad Zulfikar', email: 'ahmad@sppg.id', role: 'kasppg', status: 'Aktif' },
    { id: 3, nama: 'Siti Aminah', email: 'siti.gizi@sppg.id', role: 'pengawas_gizi', status: 'Menunggu' },
  ]);

  // Simulasi data form
  const [formData, setFormData] = useState({
    nama: user?.nama || '',
    email: user?.email || '',
    no_hp: '081234567890',
    sppg_nama: sppg?.nama || '',
    sppg_alamat: `${sppg?.kab_kota}, ${sppg?.provinsi}`,
    sppg_kapasitas: sppg?.kapasitas_pm || 3000,
    sppg_va: '1234567890 (Himbara)',
    notif_email: true,
    notif_wa: true,
    notif_browser: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    toast.sukses('Pengaturan berhasil disimpan!');
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData.email || !inviteData.nama) {
      return toast.error('Nama dan Email wajib diisi!');
    }
    
    setMockTim([
      ...mockTim,
      { 
        id: Date.now(), 
        nama: inviteData.nama, 
        email: inviteData.email, 
        role: inviteData.role, 
        status: 'Menunggu' 
      }
    ]);
    
    toast.sukses(`Undangan berhasil dikirim ke ${inviteData.email}`);
    setShowInviteModal(false);
    setInviteData({ email: '', role: 'jurutama_masak', nama: '' });
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="mb-6">
        <h1 className="font-display text-xl font-semibold text-slate-900">Pengaturan</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola profil, organisasi, dan preferensi akun Anda</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="md:w-64 shrink-0">
          <div className="card p-2 space-y-1">
            <button
              onClick={() => setActiveTab('profil')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'profil' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User size={16} /> Profil Saya
            </button>
            {user?.role === 'owner' && (
              <button
                onClick={() => setActiveTab('sppg')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'sppg' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building size={16} /> Profil SPPG
              </button>
            )}
            <button
              onClick={() => setActiveTab('keamanan')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'keamanan' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Lock size={16} /> Keamanan
            </button>
            <button
              onClick={() => setActiveTab('notifikasi')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'notifikasi' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bell size={16} /> Notifikasi
            </button>
            {/* Kop & Stempel — HANYA manajemen */}
            {isManagement && (
              <button
                onClick={() => setActiveTab('dokumen')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'dokumen' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText size={16} /> Kop & Stempel
              </button>
            )}
            {/* Manajemen Tim — HANYA owner */}
            {user?.role === 'owner' && (
              <button
                onClick={() => setActiveTab('tim')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'tim' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users size={16} /> Manajemen Tim
              </button>
            )}
            {/* Migrasi Data — HANYA manajemen */}
            {isManagement && (
              <button
                onClick={() => setActiveTab('migrasi')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'migrasi' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Database size={16} /> Migrasi Data
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-4">
          
          {/* TAB: PROFIL */}
          {activeTab === 'profil' && (
            <div className="card p-6 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Informasi Pribadi</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold border-2 border-white shadow-sm">
                  {user?.nama?.charAt(0) || 'U'}
                </div>
                <div>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg mb-1 transition-colors">
                    Ubah Foto
                  </button>
                  <p className="text-xs text-slate-500">Format JPG atau PNG. Maksimal 2MB.</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Nama Lengkap</label>
                  <input type="text" name="nama" value={formData.nama} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} disabled className="input bg-slate-50 text-slate-500 cursor-not-allowed" />
                  <p className="text-xs text-slate-400 mt-1">Email tidak dapat diubah karena terikat ke akun Auth.</p>
                </div>
                <div>
                  <label className="label">Nomor HP / WhatsApp</label>
                  <input type="text" name="no_hp" value={formData.no_hp} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="label">Jabatan (Sistem)</label>
                  <input type="text" value={user?.jabatan || ''} disabled className="input bg-slate-50 text-slate-500 capitalize cursor-not-allowed" />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={handleSave} className="btn-primary text-sm flex items-center gap-2">
                  <Save size={16} /> Simpan Perubahan
                </button>
              </div>
            </div>
          )}

          {/* TAB: SPPG */}
          {activeTab === 'sppg' && (
            <div className="card p-6 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Profil Organisasi SPPG</h2>
              <div className="grid gap-4">
                <div>
                  <label className="label">Nama SPPG</label>
                  <input type="text" name="sppg_nama" value={formData.sppg_nama} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="label">Alamat Lengkap</label>
                  <input type="text" name="sppg_alamat" value={formData.sppg_alamat} onChange={handleChange} className="input" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Kapasitas PM (Porsi/Hari)</label>
                    <input type="number" name="sppg_kapasitas" value={formData.sppg_kapasitas} onChange={handleChange} className="input" />
                  </div>
                  <div>
                    <label className="label">Rekening VA Himbara BGN</label>
                    <input type="text" name="sppg_va" value={formData.sppg_va} onChange={handleChange} className="input" />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={handleSave} className="btn-primary text-sm flex items-center gap-2">
                  <Save size={16} /> Simpan Profil SPPG
                </button>
              </div>
            </div>
          )}

          {/* TAB: KEAMANAN */}
          {activeTab === 'keamanan' && (
            <div className="card p-6 animate-fade-in space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">Keamanan Akun</h2>
                <p className="text-sm text-slate-500 mb-4 pb-3 border-b border-slate-100">Kelola kata sandi dan keamanan tambahan</p>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-800">Kata Sandi</h3>
                    <p className="text-sm text-slate-500">Terakhir diubah 3 bulan lalu</p>
                  </div>
                  <button className="btn-secondary text-sm bg-white">Ubah Kata Sandi</button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Shield className="text-blue-600 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h3 className="font-semibold text-slate-800">Autentikasi Dua Faktor (2FA)</h3>
                      <p className="text-sm text-slate-500 mt-0.5">Tambah lapisan keamanan ekstra ke akun Anda menggunakan aplikasi authenticator.</p>
                    </div>
                  </div>
                  <button className="btn-primary text-sm whitespace-nowrap">Aktifkan 2FA</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: NOTIFIKASI */}
          {activeTab === 'notifikasi' && (
            <div className="animate-fade-in">
              <NotifikasiSettings />
            </div>
          )}

          {/* TAB: DOKUMEN & KOP — hanya manajemen */}
          {activeTab === 'dokumen' && isManagement && (
            <div className="card p-6 animate-fade-in space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">Pengaturan Dokumen & Kop Surat</h2>
                <p className="text-sm text-slate-500 pb-4 border-b border-slate-100">
                  Ubah Kop Surat, Nama Pimpinan, dan format tanda tangan untuk dokumen cetak seperti PO & Laporan BGN.
                </p>
              </div>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Nama Organisasi (Baris Utama Header)</label>
                  <input type="text" value={docSettings.namaSppg} onChange={e => setDocSettings({ namaSppg: e.target.value })} className="input w-full font-bold text-slate-800" placeholder="Misal: SATUAN PELAYANAN PROGRAM GIZI DEPOK" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Alamat Lengkap & Kontak (Baris Bawah Header)</label>
                  <input type="text" value={docSettings.alamat} onChange={e => setDocSettings({ alamat: e.target.value })} className="input w-full text-slate-700" placeholder="Jl. Raya No 1..." />
                </div>
                
                <div className="pt-4 mt-2 border-t border-slate-100">
                  <h3 className="font-bold text-base text-slate-800 mb-3 flex items-center gap-2">
                    <FileText size={18} className="text-blue-600"/> Tanda Tangan & Cap Digital
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">Pengaturan ini akan mengubah siapa yang tercantum sebagai pemberi persetujuan resmi (Approver) di dokumen cetak sistem.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Nama Pimpinan / Otorisator</label>
                      <input type="text" value={docSettings.namaPimpinan} onChange={e => setDocSettings({ namaPimpinan: e.target.value })} className="input w-full font-semibold text-slate-800" placeholder="Misal: Ahmad Faisal, S.E." />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Jabatan Resmi</label>
                      <input type="text" value={docSettings.jabatanPimpinan} onChange={e => setDocSettings({ jabatanPimpinan: e.target.value })} className="input w-full text-slate-700" placeholder="Misal: Kepala SPPG / Pejabat Keuangan" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 mt-2 border-t border-slate-100">
                  <button onClick={() => toast.sukses('Pengaturan Dokumen Berhasil Disimpan', 'Semua PDF yang dicetak sekarang akan menggunakan Kop & Tanda Tangan terbaru.')} className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2">
                    <Save size={16} /> Simpan Pengaturan Cetak
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Fallback: jika user tidak berhak tapi URL di-force */}
          {activeTab === 'dokumen' && !isManagement && (
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-amber-600" size={28} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Akses Terbatas</h3>
              <p className="text-sm text-slate-500">Pengaturan Kop Surat & Tanda Tangan hanya dapat diubah oleh Owner, Ka. SPPG, atau Pengawas Keuangan.</p>
            </div>
          )}

          {/* TAB: TIM */}
          {activeTab === 'tim' && (
            <div className="card p-6 animate-fade-in">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-1">Manajemen Tim & Hak Akses</h2>
                  <p className="text-sm text-slate-500">Kelola anggota yang memiliki akses ke dashboard SPPG ini.</p>
                </div>
                <button onClick={() => setShowInviteModal(true)} className="btn-primary text-sm flex items-center gap-2">
                  <User size={16} /> Undang Anggota
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                    <tr>
                      <th className="p-3 font-medium">Pengguna</th>
                      <th className="p-3 font-medium">Peran (Role)</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mockTim.map(anggota => (
                      <tr key={anggota.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <p className="font-semibold text-slate-800">{anggota.nama}</p>
                          <p className="text-xs text-slate-500">{anggota.email}</p>
                        </td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            {anggota.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3">
                          {anggota.status === 'Aktif' ? (
                            <span className="text-emerald-600 font-medium text-xs flex items-center gap-1"><Check size={12}/> Aktif</span>
                          ) : (
                            <span className="text-amber-600 font-medium text-xs flex items-center gap-1">🕒 Menunggu</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {anggota.role !== 'owner' && (
                            <button 
                              onClick={() => setMockTim(mockTim.filter(m => m.id !== anggota.id))}
                              className="text-rose-600 hover:underline text-xs font-medium"
                            >
                              Cabut Akses
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: MIGRASI DATA */}
          {activeTab === 'migrasi' && isManagement && (
            <MigrasiData />
          )}

        </div>
      </div>

      {/* Modal Undang Anggota */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Undang Anggota Tim Baru</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={inviteData.nama} 
                  onChange={e => setInviteData({...inviteData, nama: e.target.value})} 
                  placeholder="Budi Santoso"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email Karyawan</label>
                <input 
                  type="email" 
                  value={inviteData.email} 
                  onChange={e => setInviteData({...inviteData, email: e.target.value})} 
                  placeholder="budi@sppg.id"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Pilih Peran (Role)</label>
                <select 
                  value={inviteData.role} 
                  onChange={e => setInviteData({...inviteData, role: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="kasppg">Kasir / Wakil Kepala SPPG</option>
                  <option value="jurutama_masak">Jurutama Masak (Chef)</option>
                  <option value="pengawas_gizi">Pengawas Gizi</option>
                  <option value="pengawas_keuangan">Pengawas Keuangan / Admin</option>
                  <option value="pengawas_sanitasi">Pengawas Sanitasi</option>
                  <option value="asisten_lapangan">Asisten Lapangan (Kurir)</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  Role ini menentukan menu apa saja yang bisa mereka akses di dashboard.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors">
                  Batal
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">
                  Kirim Undangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
