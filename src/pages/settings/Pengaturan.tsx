import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore, type SyncInterval } from '@/store/settingsStore';
import LiteModeToggle from '@/components/ui/LiteModeToggle';
import { useLiteMode } from '@/hooks/useLiteMode';
import { toast } from '@/store/toastStore';
import NotifikasiSettings from '@/pages/settings/NotifikasiSettings';
import { Zap, Monitor, RefreshCw, User, LogOut, Save, MessageSquare, FileText } from 'lucide-react';

type Tab = 'performa' | 'tampilan' | 'sinkronisasi' | 'notifikasi' | 'dokumen' | 'akun';

export default function Pengaturan() {
  const { user, signOut } = useAuthStore();
  const {
    deviceInfo, fontSize, bahasa, autoSyncInterval, lastSyncAt, docSettings,
    setFontSize, setLanguage, setAutoSyncInterval, setLastSyncAt, setDocSettings
  } = useSettingsStore();
  const { isLite, cn, anim } = useLiteMode();

  const [activeTab, setActiveTab] = useState<Tab>('performa');
  const [isSyncing, setIsSyncing] = useState(false);
  const [formNama, setFormNama] = useState(user?.nama || '');

  const nav_items: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'performa',    label: 'Performa',     icon: <Zap size={16} /> },
    { key: 'tampilan',    label: 'Tampilan',      icon: <Monitor size={16} /> },
    { key: 'sinkronisasi',label: 'Sinkronisasi',  icon: <RefreshCw size={16} /> },
    { key: 'notifikasi',  label: 'Notif WA',      icon: <MessageSquare size={16} /> },
    { key: 'dokumen',     label: 'Kop & Stempel', icon: <FileText size={16} /> },
    { key: 'akun',        label: 'Akun',          icon: <User size={16} /> },
  ];

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 1500));
    const now = new Date().toISOString();
    setLastSyncAt(now);
    setIsSyncing(false);
    toast.sukses('Sinkronisasi selesai!', 'Data berhasil diperbarui dari server.');
  };

  const handleLogout = async () => {
    if (!confirm('Yakin ingin keluar?')) return;
    await signOut?.();
    window.location.href = '/login';
  };

  const ramLabel = deviceInfo.ram !== null ? `${deviceInfo.ram} GB` : 'Tidak terdeteksi';
  const koneksiLabel = deviceInfo.koneksi ?? 'Tidak terdeteksi';

  return (
    <div className={cn('max-w-4xl mx-auto pb-12', anim('animate-fade-in'))}>
      <div className="mb-6">
        <h1 className="font-display text-xl font-semibold text-slate-900">Pengaturan</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola performa, tampilan, dan preferensi akun Anda</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-56 shrink-0">
          <div className="card p-2 space-y-1">
            {nav_items.map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === item.key
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">

          {/* ── TAB: PERFORMA ── */}
          {activeTab === 'performa' && (
            <div className="space-y-4">
              <div className="card p-6">
                <h2 className="text-base font-bold text-slate-800 mb-1">Performa Perangkat</h2>
                <p className="text-xs text-slate-500 mb-5 pb-4 border-b border-slate-100">
                  Sesuaikan kinerja aplikasi dengan spesifikasi HP dan kecepatan internet Anda.
                </p>

                {/* Info perangkat */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">RAM Terdeteksi</p>
                    <p className="text-sm font-bold text-slate-800">{ramLabel}</p>
                    {deviceInfo.ram !== null && deviceInfo.ram < 4 && (
                      <p className="text-[10px] text-amber-600 mt-0.5">⚠ Rekomendasi: aktifkan Mode Hemat</p>
                    )}
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Tipe Koneksi</p>
                    <p className="text-sm font-bold text-slate-800 uppercase">{koneksiLabel}</p>
                    {(koneksiLabel === '2g' || koneksiLabel === 'slow-2g') && (
                      <p className="text-[10px] text-amber-600 mt-0.5">⚠ Koneksi lemah terdeteksi</p>
                    )}
                  </div>
                </div>

                {/* Mode Hemat Toggle */}
                <LiteModeToggle variant="settings" />

                {/* Penjelasan dampak */}
                <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-800 mb-2">💡 Tips untuk HP Low-End & 2G</p>
                  <ul className="text-xs text-blue-700 space-y-1 list-none">
                    <li>• Aktifkan Mode Hemat untuk menonaktifkan animasi & grafik berat</li>
                    <li>• Set sinkronisasi ke "Manual" untuk hemat kuota & baterai</li>
                    <li>• Gunakan font Besar untuk kemudahan baca di layar kecil</li>
                    <li>• Laporan bisa diisi offline, data akan sync saat ada koneksi</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: TAMPILAN ── */}
          {activeTab === 'tampilan' && (
            <div className="card p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-800 mb-1">Pengaturan Tampilan</h2>
                <p className="text-xs text-slate-500 pb-4 border-b border-slate-100">
                  Sesuaikan tampilan agar nyaman digunakan di berbagai kondisi.
                </p>
              </div>

              {/* Ukuran Font */}
              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">Ukuran Teks</p>
                <div className="grid grid-cols-2 gap-3">
                  {(['normal', 'besar'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => { setFontSize(size); toast.info(size === 'besar' ? 'Font diperbesar' : 'Font normal'); }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        fontSize === size
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className={`font-bold text-slate-800 ${size === 'besar' ? 'text-lg' : 'text-sm'}`}>
                        {size === 'normal' ? 'Normal' : 'Besar'}
                      </p>
                      <p className={`text-slate-500 mt-0.5 ${size === 'besar' ? 'text-base' : 'text-xs'}`}>
                        {size === 'normal' ? 'Ukuran standar' : 'Untuk mata tua / layar kecil'}
                      </p>
                      {fontSize === size && (
                        <span className="inline-block mt-2 text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                          AKTIF
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bahasa */}
              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">Bahasa Antarmuka</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { key: 'id', label: 'Indonesia Standar', desc: 'Bahasa Indonesia formal' },
                    { key: 'id-simple', label: 'Indonesia Sederhana', desc: 'Bahasa lebih mudah dipahami' },
                  ] as const).map(lang => (
                    <button
                      key={lang.key}
                      onClick={() => { setLanguage(lang.key); toast.info(`Bahasa: ${lang.label}`); }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        bahasa === lang.key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-bold text-slate-800 text-sm">{lang.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{lang.desc}</p>
                      {bahasa === lang.key && (
                        <span className="inline-block mt-2 text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                          AKTIF
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: SINKRONISASI ── */}
          {activeTab === 'sinkronisasi' && (
            <div className="card p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-800 mb-1">Pengaturan Sinkronisasi</h2>
                <p className="text-xs text-slate-500 pb-4 border-b border-slate-100">
                  Atur seberapa sering aplikasi menyinkronkan data dengan server.
                </p>
              </div>

              {/* Status sync */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Status Sinkronisasi</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lastSyncAt
                      ? `Terakhir: ${new Date(lastSyncAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                      : 'Belum pernah sinkronisasi sesi ini'}
                  </p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow shadow-emerald-300" />
              </div>

              {/* Interval */}
              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">Interval Sinkronisasi Otomatis</p>
                <div className="space-y-2">
                  {([
                    { val: 5,  label: '5 Menit',    desc: 'Paling update — butuh koneksi stabil' },
                    { val: 15, label: '15 Menit',   desc: 'Seimbang antara data & baterai' },
                    { val: 0,  label: 'Manual Saja', desc: 'Paling hemat baterai & kuota — rekomendasi 2G' },
                  ] as { val: SyncInterval; label: string; desc: string }[]).map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => { setAutoSyncInterval(opt.val); toast.info(`Interval sync: ${opt.label}`); }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
                        autoSyncInterval === opt.val
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-left">
                        <p className="font-bold text-slate-800 text-sm">{opt.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        autoSyncInterval === opt.val
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-slate-300'
                      }`}>
                        {autoSyncInterval === opt.val && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tombol sync manual */}
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Menyinkronkan...' : 'Sinkronisasi Sekarang'}
              </button>
            </div>
          )}

          {/* ── TAB: NOTIFIKASI WA ── */}
          {activeTab === 'notifikasi' && <NotifikasiSettings />}

          {/* ── TAB: DOKUMEN & KOP ── */}
          {activeTab === 'dokumen' && (
            <div className="card p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-800 mb-1">Pengaturan Dokumen Cetak</h2>
                <p className="text-xs text-slate-500 pb-4 border-b border-slate-100">
                  Ubah Kop Surat, Nama Pimpinan, dan format tanda tangan untuk dokumen PO & Invoice.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Nama Organisasi (Baris 1)</label>
                  <input type="text" value={docSettings.namaSppg} onChange={e => setDocSettings({ namaSppg: e.target.value })} className="input text-sm w-full" placeholder="Misal: SATUAN PELAYANAN PROGRAM GIZI (SPPG)" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Alamat & Kontak (Baris 3)</label>
                  <input type="text" value={docSettings.alamat} onChange={e => setDocSettings({ alamat: e.target.value })} className="input text-sm w-full" placeholder="Jl. Raya No 1..." />
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="font-bold text-sm text-slate-800 mb-3">Tanda Tangan & Cap Digital (Persetujuan)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Nama Pimpinan / Otorisator</label>
                      <input type="text" value={docSettings.namaPimpinan} onChange={e => setDocSettings({ namaPimpinan: e.target.value })} className="input text-sm w-full" placeholder="Misal: Ahmad Faisal, S.E." />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Jabatan Pimpinan</label>
                      <input type="text" value={docSettings.jabatanPimpinan} onChange={e => setDocSettings({ jabatanPimpinan: e.target.value })} className="input text-sm w-full" placeholder="Misal: Kepala SPPG" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button onClick={() => toast.sukses('Pengaturan Dokumen disimpan!', 'Format kop & cap telah diperbarui secara global.')} className="btn-primary text-sm px-6 py-2 flex items-center gap-2">
                    <Save size={16} /> Simpan Pengaturan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: AKUN ── */}
          {activeTab === 'akun' && (
            <div className="space-y-4">
              <div className="card p-6">
                <h2 className="text-base font-bold text-slate-800 mb-1">Informasi Akun</h2>
                <p className="text-xs text-slate-500 pb-4 border-b border-slate-100">Kelola data profil Anda.</p>

                <div className="flex items-center gap-4 my-5">
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold border-2 border-white shadow">
                    {user?.nama?.charAt(0) ?? 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{user?.nama}</p>
                    <p className="text-xs text-slate-500">{user?.jabatan}</p>
                    <span className="inline-block mt-1 text-[10px] font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full uppercase">
                      {user?.role?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="label">Nama Lengkap</label>
                    <input
                      type="text"
                      value={formNama}
                      onChange={e => setFormNama(e.target.value)}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="label">Email (tidak dapat diubah)</label>
                    <input
                      type="email"
                      value={user?.email ?? ''}
                      disabled
                      className="input w-full bg-slate-50 text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <button
                    onClick={() => toast.sukses('Profil disimpan!')}
                    className="btn-primary text-sm flex items-center gap-2"
                  >
                    <Save size={15} /> Simpan Perubahan
                  </button>
                  <button
                    onClick={() => toast.info('Tautan reset kata sandi dikirim ke email Anda.')}
                    className="btn-secondary text-sm"
                  >
                    Ubah Kata Sandi
                  </button>
                </div>
              </div>

              {/* Logout */}
              <div className="card p-5 border-rose-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Keluar dari Akun</p>
                    <p className="text-xs text-slate-500 mt-0.5">Anda akan diarahkan ke halaman login.</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 px-4 py-2 rounded-xl transition-all"
                  >
                    <LogOut size={15} /> Keluar
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
