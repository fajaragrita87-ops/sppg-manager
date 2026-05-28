import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, WifiOff, LogOut, User, Settings, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getInisialNama, singkatNama } from '@/lib/utils';

const PAGE_NAMES: Record<string, string> = {
  '/dashboard': 'Dashboard', '/dapur': 'Dapur & Produksi', '/inventori': 'Inventori & Gudang',
  '/pengadaan': 'Pengadaan & Belanja', '/sdm': 'Relawan & Absensi', '/keuangan': 'Keuangan',
  '/laporan': 'Laporan ke BGN', '/penerima-manfaat': 'Penerima Manfaat', '/unauthorized': 'Akses Ditolak',
  '/settings': 'Pengaturan', '/panduan': 'Panduan & Bantuan',
};

function getPageName(p: string): string {
  if (PAGE_NAMES[p]) return PAGE_NAMES[p];
  const k = Object.keys(PAGE_NAMES).find((r) => p.startsWith(r + '/'));
  return k ? PAGE_NAMES[k] : 'SPPG Manager';
}

function avatarColor(nama: string): string {
  const colors = ['bg-blue-600','bg-indigo-600','bg-sky-600','bg-cyan-600','bg-teal-600','bg-violet-600'];
  let h = 0;
  for (let i = 0; i < nama.length; i++) h = nama.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

interface TopBarProps { onMenuClick: () => void; }

export default function TopBar({ onMenuClick }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, sppg, isOnline, signOut } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false); }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    // Bersihkan semua storage agar session bersih
    sessionStorage.removeItem('super_admin_session');
    navigate('/login', { replace: true });
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-40 md:pl-60" style={{ background: '#ffffff', borderBottom: '0.5px solid #e2e8f0' }}>
      <div className="flex items-center h-full px-4 gap-3">
        <button onClick={onMenuClick} className="md:hidden btn-ghost p-2 -ml-2" aria-label="Buka menu"><Menu size={20} /></button>
        <span className="text-sm font-medium truncate" style={{ color: '#0f172a' }}>{getPageName(location.pathname)}</span>

        <div className="ml-auto flex items-center gap-2">
          {!isOnline && <WifiOff size={16} style={{ color: '#78350f' }} />}
          <button className="relative btn-ghost p-2" aria-label="Notifikasi"><Bell size={18} /></button>
          {sppg && <span className="hidden md:block text-xs truncate max-w-[120px]" style={{ color: '#94a3b8' }}>{sppg.nama}</span>}

          {user && (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white transition-all ring-2 ring-transparent hover:ring-blue-300 ${avatarColor(user.nama)}`}>
                {getInisialNama(user.nama)}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-10 w-52 card shadow-lg z-50 animate-fade-in overflow-hidden" style={{ border: '0.5px solid #e2e8f0' }}>
                  <div className="px-4 py-3" style={{ borderBottom: '0.5px solid #e2e8f0' }}>
                    <p className="text-sm font-medium truncate" style={{ color: '#0f172a' }}>{singkatNama(user.nama)}</p>
                    <p className="text-xs truncate capitalize" style={{ color: '#475569' }}>{user.jabatan.replace(/_/g, ' ')}</p>
                    {user.email && <p className="text-xs truncate mt-0.5" style={{ color: '#94a3b8' }}>{user.email}</p>}
                  </div>
                  <div className="py-1">
                    <button onClick={() => { setDropdownOpen(false); navigate('/settings'); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-slate-50" style={{ color: '#475569' }}>
                      <Settings size={15} /> Pengaturan
                    </button>
                    <button onClick={() => { setDropdownOpen(false); navigate('/panduan'); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-slate-50" style={{ color: '#475569' }}>
                      <BookOpen size={15} /> Panduan & Bantuan
                    </button>
                    <div style={{ height: '0.5px', background: '#e2e8f0', margin: '4px 0' }} />
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-rose-50" style={{ color: '#991b1b' }}>
                      <LogOut size={15} /> Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
