import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Wifi, WifiOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, isOnline } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Email dan kata sandi wajib diisi.'); return; }
    setError(null);
    setIsLoading(true);
    const { error: err } = await signIn(email, password);
    if (err) { setError(err); setIsLoading(false); return; }
    navigate('/dashboard', { replace: true });
  };

  type DemoRole = { role: string; jabatan: string; label: string; desc: string; color: string };
  const DEMO_ROLES: DemoRole[] = [
    { role: 'owner',              jabatan: 'Owner / Kepala Satuan',   label: 'Owner',             desc: 'Akses penuh semua modul',            color: '#1e6fbf' },
    { role: 'kasppg',             jabatan: 'Ka. SPPG',                label: 'Kepala SPPG',       desc: 'Operasional + laporan',              color: '#0284c7' },
    { role: 'pengawas_keuangan',  jabatan: 'Pengawas Keuangan',       label: 'Pengawas Keuangan', desc: 'Keuangan, SDM, laporan',             color: '#0891b2' },
    { role: 'pengawas_gizi',      jabatan: 'Pengawas Gizi',           label: 'Pengawas Gizi',     desc: 'Dapur, menu, inventori gizi',        color: '#059669' },
    { role: 'pengawas_sanitasi',  jabatan: 'Pengawas Sanitasi',       label: 'Pengawas Sanitasi', desc: 'Checklist kebersihan & laporan',     color: '#65a30d' },
    { role: 'asisten_lapangan',   jabatan: 'Asisten Lapangan',        label: 'Asisten Lapangan',  desc: 'Dapur, SDM, distribusi',             color: '#d97706' },
    { role: 'jurutama_masak',     jabatan: 'Jurutama Masak',          label: 'Jurutama Masak',    desc: 'Produksi & stok bahan',              color: '#ea580c' },
    { role: 'driver',             jabatan: 'Driver / Distribusi',     label: 'Driver',            desc: 'Manifest & distribusi satdik',       color: '#7c3aed' },
    { role: 'bgn_coord',          jabatan: 'Koordinator BGN',         label: 'Koordinator BGN',   desc: 'Laporan & keuangan konsolidasi',     color: '#be185d' },
  ];
  const [showDemoPanel, setShowDemoPanel] = useState(false);

  const handleBypass = (demoRole?: DemoRole) => {
    const r = demoRole ?? DEMO_ROLES[0];
    useAuthStore.setState({
      user: {
        id: `demo-${r.role}-001`,
        auth_id: `demo-auth-${r.role}`,
        sppg_id: 'sppg-demo-001',
        nama: `Demo — ${r.label}`,
        role: r.role as any,
        jabatan: r.jabatan,
        aktif: true
      },
      sppg: {
        id: 'sppg-demo-001',
        yayasan_id: 'yay-demo-001',
        nama: 'SPPG Contoh Berkah',
        kab_kota: 'Jakarta Selatan',
        provinsi: 'DKI Jakarta',
        kapasitas_pm: 3000,
        status: 'aktif'
      },
      isLoading: false
    });
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4" style={{ background: '#f8fafc' }}>
      <div className="w-full max-w-sm animate-fade-in">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <img src="/@fs/C:/Users/HP/.gemini/antigravity/brain/e86f3240-0563-4028-ae03-69b0fd25d478/sppg_manager_logo_1778922831608.png" alt="SPPG Manager Logo" className="h-24 w-auto object-contain" />
          <p className="text-xs" style={{ color: '#94a3b8' }}>Manajemen Dapur Program MBG</p>
        </div>

        {/* Card */}
        <div className="card p-6 animate-slide-up">
          <div className="mb-5">
            <h2 className="text-sm font-semibold" style={{ color: '#0f172a' }}>Masuk ke Akun</h2>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Masukkan email dan kata sandi Anda.</p>
          </div>

          {!isOnline && (
            <div className="alert-warning mb-4">
              <WifiOff size={15} className="flex-shrink-0 mt-0.5" />
              <span>Tidak ada koneksi internet. Login memerlukan koneksi aktif.</span>
            </div>
          )}
          {error && (
            <div className="alert-danger mb-4 animate-fade-in">
              <span className="flex-shrink-0">⚠️</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="label">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@sppg.id"
                autoComplete="email"
                disabled={isLoading}
                className={cn('input', error && 'input-error')}
              />
            </div>
            <div>
              <label htmlFor="login-password" className="label">Kata Sandi</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className={cn('input pr-10', error && 'input-error')}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: '#94a3b8' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading || !isOnline} className="btn-primary w-full mt-2">
              {isLoading ? (
                <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Memverifikasi...</>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogIn size={16} /> Masuk
                </div>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 mt-5 space-y-2">
            <button
              type="button"
              onClick={() => setShowDemoPanel(v => !v)}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-blue-200 text-blue-600 font-bold text-xs hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              🚀 {showDemoPanel ? 'Tutup Panel Demo' : 'Masuk Mode Demo — Pilih Role'}
            </button>

            {showDemoPanel && (
              <div className="rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2 bg-slate-50">Pilih Role untuk Demo</p>
                <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                  {DEMO_ROLES.map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => handleBypass(r)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left group"
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[10px] font-black" style={{ background: r.color }}>
                        {r.label.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{r.label}</p>
                        <p className="text-[10px] text-slate-400 truncate">{r.desc}</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 group-hover:text-blue-400 transition-colors">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-center text-xs pt-1" style={{ color: '#94a3b8' }}>
              Belum punya akun?{' '}
              <button onClick={() => navigate('/register')} className="text-blue-600 font-semibold hover:underline">
                Daftar SPPG Baru
              </button>
            </p>
          </div>
        </div>

        <div className="mt-5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs">
            {isOnline
              ? <><Wifi size={12} style={{ color: '#14532d' }} /><span style={{ color: '#94a3b8' }}>Terhubung</span></>
              : <><WifiOff size={12} style={{ color: '#78350f' }} /><span style={{ color: '#78350f' }}>Offline</span></>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
