import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

/* ─── demo roles (dipertahankan dari LoginPage lama) ─── */
type DemoRole = { role: string; jabatan: string; label: string; desc: string; color: string };
const DEMO_ROLES: DemoRole[] = [
  { role: 'owner',             jabatan: 'Owner / Kepala Satuan',  label: 'Owner',             desc: 'Akses penuh semua modul',         color: '#1e6fbf' },
  { role: 'kasppg',            jabatan: 'Ka. SPPG',               label: 'Kepala SPPG',       desc: 'Operasional + laporan',           color: '#0284c7' },
  { role: 'pengawas_keuangan', jabatan: 'Pengawas Keuangan',      label: 'Pengawas Keuangan', desc: 'Keuangan, SDM, laporan',          color: '#0891b2' },
  { role: 'pengawas_gizi',     jabatan: 'Pengawas Gizi',          label: 'Pengawas Gizi',     desc: 'Dapur, menu, inventori gizi',     color: '#059669' },
  { role: 'pengawas_sanitasi', jabatan: 'Pengawas Sanitasi',      label: 'Pengawas Sanitasi', desc: 'Checklist kebersihan & laporan',  color: '#65a30d' },
  { role: 'asisten_lapangan',  jabatan: 'Asisten Lapangan',       label: 'Asisten Lapangan',  desc: 'Dapur, SDM, distribusi',          color: '#d97706' },
  { role: 'jurutama_masak',    jabatan: 'Jurutama Masak',         label: 'Jurutama Masak',    desc: 'Produksi & stok bahan',           color: '#ea580c' },
  { role: 'driver',            jabatan: 'Driver / Distribusi',    label: 'Driver',            desc: 'Manifest & distribusi satdik',    color: '#7c3aed' },
  { role: 'bgn_coord',         jabatan: 'Koordinator BGN',        label: 'Koordinator BGN',   desc: 'Laporan & keuangan konsolidasi',  color: '#be185d' },
];

/* ─── inline styles ─── */
const S = {
  root: {
    display: 'flex',
    flexDirection: 'row' as const,
    minHeight: '100dvh',
    background: '#f3f4f6',
  },
  /* ── Panel Kiri ── */
  left: {
    width: '42%',
    flexShrink: 0,
    background: '#1a7a5e',
    padding: '40px 36px',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    overflow: 'hidden',
  },
  /* dekorasi lingkaran */
  circle: (size: number, top: string, left: string, opacity?: number) => ({
    position: 'absolute' as const,
    width: size,
    height: size,
    borderRadius: '50%',
    border: `2px solid rgba(255,255,255,${opacity ?? 0.08})`,
    top,
    left,
    pointerEvents: 'none' as const,
  }),
  /* logo area */
  logoBox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: '10px 14px',
    alignSelf: 'flex-start' as const,
    backdropFilter: 'blur(8px)',
  },
  logoEmoji: { fontSize: 22 },
  logoText: { color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' },
  /* quote block */
  quoteWrap: {
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  quoteMark: {
    fontSize: 72,
    lineHeight: 1,
    color: 'rgba(255,255,255,0.3)',
    fontFamily: 'Georgia, serif',
    marginBottom: -8,
    display: 'block',
  },
  quoteText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 1.65,
    fontWeight: 400,
    marginBottom: 24,
  },
  avatarRow: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    flexShrink: 0,
  },
  avatarName: { color: '#fff', fontWeight: 600, fontSize: 13 },
  avatarRole: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 },
  /* dots */
  dotsRow: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 36 },
  dot: (active: boolean) => ({
    height: 6,
    borderRadius: 3,
    background: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
    width: active ? 20 : 6,
    transition: 'all .3s',
  }),
  /* ── Panel Kanan ── */
  right: {
    flex: 1,
    background: '#ffffff',
    padding: '44px 40px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    overflowY: 'auto' as const,
  },
  innerRight: { maxWidth: 400, width: '100%', margin: '0 auto' },
  heading: { fontSize: 20, fontWeight: 500, color: '#111827', margin: 0 },
  subheading: { fontSize: 14, color: '#9ca3af', marginTop: 6, marginBottom: 28 },
  /* form */
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: '#374151',
    marginBottom: 6,
  },
  inputWrap: { position: 'relative' as const, marginBottom: 16 },
  input: (focused: boolean, hasError: boolean) => ({
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: `1.5px solid ${hasError ? '#ef4444' : focused ? '#1a7a5e' : '#e5e7eb'}`,
    outline: 'none',
    fontSize: 14,
    color: '#111827',
    background: '#fff',
    boxSizing: 'border-box' as const,
    boxShadow: focused ? '0 0 0 3px rgba(26,122,94,0.08)' : 'none',
    transition: 'border-color .2s, box-shadow .2s',
  }),
  inputWithIcon: (focused: boolean, hasError: boolean) => ({
    width: '100%',
    padding: '10px 40px 10px 14px',
    borderRadius: 8,
    border: `1.5px solid ${hasError ? '#ef4444' : focused ? '#1a7a5e' : '#e5e7eb'}`,
    outline: 'none',
    fontSize: 14,
    color: '#111827',
    background: '#fff',
    boxSizing: 'border-box' as const,
    boxShadow: focused ? '0 0 0 3px rgba(26,122,94,0.08)' : 'none',
    transition: 'border-color .2s, box-shadow .2s',
  }),
  eyeBtn: {
    position: 'absolute' as const,
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
  },
  rememberRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 4,
  },
  checkLabel: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', cursor: 'pointer' },
  forgotLink: {
    fontSize: 13,
    color: '#1a7a5e',
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  submitBtn: (disabled: boolean) => ({
    width: '100%',
    padding: '11px 0',
    borderRadius: 8,
    background: disabled ? '#6b9e90' : '#1a7a5e',
    color: '#fff',
    fontWeight: 600,
    fontSize: 14,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'background .2s',
  }),
  /* divider */
  dividerRow: { display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' },
  dividerLine: { flex: 1, height: 1, background: '#e5e7eb' },
  dividerText: { fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' as const },
  /* social buttons */
  socialRow: { display: 'flex', gap: 8, marginBottom: 20 },
  socialBtn: (hovered: boolean) => ({
    flex: 1,
    padding: '9px 4px',
    border: `1.5px solid ${hovered ? '#1a7a5e' : '#e5e7eb'}`,
    borderRadius: 8,
    background: '#fff',
    cursor: 'pointer',
    fontSize: 12,
    color: '#374151',
    fontWeight: 500,
    textAlign: 'center' as const,
    transition: 'border-color .2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  }),
  /* register link */
  registerRow: { textAlign: 'center' as const, fontSize: 13, color: '#6b7280', marginBottom: 12 },
  accentLink: {
    color: '#1a7a5e',
    fontWeight: 600,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    fontSize: 13,
  },
  disclaimer: { textAlign: 'center' as const, fontSize: 11, color: '#d1d5db', marginTop: 4 },
  /* error alert */
  errorAlert: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 8,
    padding: '10px 12px',
    marginBottom: 16,
    fontSize: 13,
    color: '#b91c1c',
  },
  /* mobile logo (hidden on desktop via JS) */
  mobileLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  mobileLogoBox: {
    background: '#1a7a5e',
    borderRadius: 10,
    padding: '8px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  /* demo panel */
  demoBtn: {
    width: '100%',
    padding: '10px 0',
    marginTop: 8,
    borderRadius: 8,
    border: '2px dashed #93c5fd',
    background: 'none',
    color: '#2563eb',
    fontWeight: 700,
    fontSize: 12,
    cursor: 'pointer',
    letterSpacing: '.3px',
    transition: 'background .2s',
  },
  demoList: {
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    marginTop: 8,
  },
  demoListHeader: {
    fontSize: 10,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    padding: '8px 12px',
    background: '#f9fafb',
  },
  demoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderTop: '1px solid #f3f4f6',
    cursor: 'pointer',
    background: '#fff',
    transition: 'background .15s',
    width: '100%',
    border: 'none',
    textAlign: 'left' as const,
  },
  demoAvatar: (color: string) => ({
    width: 28,
    height: 28,
    borderRadius: 7,
    background: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 10,
    fontWeight: 900,
    flexShrink: 0,
  }),
};

export default function Login() {
  const navigate = useNavigate();
  const { signIn, isOnline } = useAuthStore();

  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember]         = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const [emailFocused, setEmailFocused]       = useState(false);
  const [passFocused, setPassFocused]         = useState(false);
  const [hoverGoogle, setHoverGoogle]         = useState(false);
  const [hoverSSO, setHoverSSO]               = useState(false);
  const [hoverOTP, setHoverOTP]               = useState(false);
  const [hoverSubmit, setHoverSubmit]         = useState(false);
  const [showDemoPanel, setShowDemoPanel]     = useState(false);

  /* ── viewport width watcher ── */
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useState(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  });

  /* ── submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Email dan kata sandi wajib diisi.'); return; }
    setError(null);
    setIsLoading(true);
    const { error: err } = await signIn(email, password);
    if (err) { setError(err); setIsLoading(false); return; }
    navigate('/dashboard', { replace: true });
  };

  /* ── bypass demo ── */
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
        aktif: true,
      },
      sppg: {
        id: 'sppg-demo-001',
        yayasan_id: 'yay-demo-001',
        nama: 'SPPG Contoh Berkah',
        kab_kota: 'Jakarta Selatan',
        provinsi: 'DKI Jakarta',
        kapasitas_pm: 3000,
        status: 'aktif',
      },
      isLoading: false,
    });
    navigate('/dashboard', { replace: true });
  };

  /* ── spinner ── */
  const Spinner = () => (
    <span style={{
      display: 'inline-block', width: 16, height: 16,
      borderRadius: '50%', border: '2px solid rgba(255,255,255,0.35)',
      borderTopColor: '#fff', animation: 'spin .7s linear infinite',
    }} />
  );

  return (
    <>
      {/* spin keyframe */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (hover: hover) {
          .submit-btn:not(:disabled):hover { background: #15644e !important; }
          .demo-item:hover { background: #f9fafb !important; }
          .demo-item:hover .demo-item-name { color: #2563eb; }
        }
      `}</style>

      <div style={S.root}>

        {/* ══════════════════════════════════════
            PANEL KIRI  (hidden on mobile)
        ══════════════════════════════════════ */}
        {!isMobile && (
          <div style={S.left}>
            {/* dekorasi lingkaran */}
            <div style={S.circle(340, '-100px', '-100px')} />
            <div style={S.circle(220, 'auto', 'auto')} />
            <div style={{ ...S.circle(160, 'auto', '-50px'), bottom: '80px', left: '-50px' }} />

            {/* Logo */}
            <div style={S.logoBox}>
              <span style={S.logoEmoji}>🍱</span>
              <span style={S.logoText}>SPPG Manager</span>
            </div>

            {/* Quote */}
            <div style={S.quoteWrap}>
              <span style={S.quoteMark}>"</span>
              <p style={S.quoteText}>
                Dulu laporan harian ke BGN butuh 2 jam. Sekarang 3 menit sudah selesai
                dan langsung terkirim otomatis.
              </p>
              <div style={S.avatarRow}>
                <div style={S.avatar}>SW</div>
                <div>
                  <div style={S.avatarName}>Sri Wahyuni</div>
                  <div style={S.avatarRole}>Pengawas Keuangan</div>
                </div>
              </div>
            </div>

            {/* Dots */}
            <div style={S.dotsRow}>
              <div style={S.dot(true)} />
              <div style={S.dot(false)} />
              <div style={S.dot(false)} />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            PANEL KANAN
        ══════════════════════════════════════ */}
        <div style={S.right}>
          <div style={S.innerRight}>

            {/* Mobile-only logo */}
            {isMobile && (
              <div style={S.mobileLogo}>
                <div style={S.mobileLogoBox}>
                  <span style={{ fontSize: 20 }}>🍱</span>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>SPPG Manager</span>
                </div>
              </div>
            )}

            {/* Heading */}
            <h1 style={S.heading}>Selamat datang kembali</h1>
            <p style={S.subheading}>Masuk ke dapur SPPG Anda</p>

            {/* Error */}
            {error && (
              <div style={S.errorAlert}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="login-email" style={S.label}>Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="nama@sppg.id"
                  autoComplete="email"
                  disabled={isLoading}
                  style={S.input(emailFocused, !!error)}
                />
              </div>

              {/* Kata sandi */}
              <div style={{ marginBottom: 4 }}>
                <label htmlFor="login-password" style={S.label}>Kata sandi</label>
                <div style={S.inputWrap}>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLoading}
                    style={S.inputWithIcon(passFocused, !!error)}
                  />
                  <button
                    type="button"
                    style={S.eyeBtn}
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember + forgot */}
              <div style={S.rememberRow}>
                <label style={S.checkLabel}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    style={{ accentColor: '#1a7a5e', width: 14, height: 14 }}
                  />
                  Ingat saya
                </label>
                <button type="button" style={S.forgotLink}>Lupa kata sandi?</button>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={isLoading || !isOnline}
                className="submit-btn"
                style={{
                  ...S.submitBtn(isLoading || !isOnline),
                  background: hoverSubmit && !isLoading && isOnline ? '#15644e' : (isLoading || !isOnline ? '#6b9e90' : '#1a7a5e'),
                }}
                onMouseEnter={() => setHoverSubmit(true)}
                onMouseLeave={() => setHoverSubmit(false)}
              >
                {isLoading ? (
                  <><Spinner /> Memverifikasi...</>
                ) : (
                  'Masuk ke Dashboard'
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={S.dividerRow}>
              <div style={S.dividerLine} />
              <span style={S.dividerText}>atau masuk dengan</span>
              <div style={S.dividerLine} />
            </div>

            {/* Social buttons */}
            <div style={S.socialRow}>
              <button
                id="btn-google"
                type="button"
                style={S.socialBtn(hoverGoogle)}
                onMouseEnter={() => setHoverGoogle(true)}
                onMouseLeave={() => setHoverGoogle(false)}
              >
                <span>🔵</span> Google
              </button>
              <button
                id="btn-sso-bgn"
                type="button"
                style={S.socialBtn(hoverSSO)}
                onMouseEnter={() => setHoverSSO(true)}
                onMouseLeave={() => setHoverSSO(false)}
              >
                <span>🏛️</span> SSO BGN
              </button>
              <button
                id="btn-otp"
                type="button"
                style={S.socialBtn(hoverOTP)}
                onMouseEnter={() => setHoverOTP(true)}
                onMouseLeave={() => setHoverOTP(false)}
              >
                <span>📲</span> OTP
              </button>
            </div>

            {/* Register link */}
            <p style={S.registerRow}>
              Belum punya akun?{' '}
              <button
                id="btn-register"
                type="button"
                style={S.accentLink}
                onClick={() => navigate('/register')}
              >
                Daftarkan SPPG Anda
              </button>
            </p>

            {/* Disclaimer */}
            <p style={S.disclaimer}>Bukan produk resmi BGN</p>

            {/* ─── Demo Panel ─── */}
            <button
              id="btn-demo-toggle"
              type="button"
              style={S.demoBtn}
              onClick={() => setShowDemoPanel((v) => !v)}
            >
              🚀 {showDemoPanel ? 'Tutup Panel Demo' : 'Masuk Mode Demo — Pilih Role'}
            </button>

            {showDemoPanel && (
              <div style={S.demoList}>
                <div style={S.demoListHeader}>Pilih Role untuk Demo</div>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {DEMO_ROLES.map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      className="demo-item"
                      style={S.demoItem}
                      onClick={() => handleBypass(r)}
                    >
                      <div style={S.demoAvatar(r.color)}>{r.label.charAt(0)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="demo-item-name" style={{ fontSize: 12, fontWeight: 600, color: '#1f2937', margin: 0, transition: 'color .15s' }}>{r.label}</p>
                        <p style={{ fontSize: 10, color: '#9ca3af', margin: 0, marginTop: 2 }}>{r.desc}</p>
                      </div>
                      <span style={{ fontSize: 11, color: '#d1d5db' }}>→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
