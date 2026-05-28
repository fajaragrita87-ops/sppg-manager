import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ChefHat, Package, ShoppingCart,
  Users, Wallet, FileText, Heart, LogOut, X, ShieldAlert,
  Settings, BookOpen, GraduationCap, Truck, Bot
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getInisialNama, singkatNama } from '@/lib/utils';
import type { UserRole } from '@/types';

interface NavItem { 
  path: string; 
  icon: React.ElementType; 
  label: string; 
  roles: UserRole[]; 
  subItems?: { path: string; label: string; roles: UserRole[] }[]; 
}
interface NavGroup { label: string; items: NavItem[]; }

const ALL_ROLES: UserRole[] = ['owner','kasppg','pengawas_keuangan','pengawas_gizi','pengawas_sanitasi','asisten_lapangan','jurutama_masak','driver','bgn_coord'];

const NAV_GROUPS: NavGroup[] = [
  { label: '', items: [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ALL_ROLES },
  ]},
  { label: 'Operasional', items: [
    { 
      path: '/dapur', icon: ChefHat, label: 'Dapur & Produksi', roles: ['owner','kasppg','pengawas_gizi','pengawas_sanitasi','asisten_lapangan','jurutama_masak'],
      subItems: [
        { path: '/dapur/produksi', label: 'Produksi Harian', roles: ['owner','kasppg','asisten_lapangan','jurutama_masak'] },
        { path: '/dapur/menu', label: 'Perencanaan Menu', roles: ['owner','kasppg','pengawas_gizi','jurutama_masak'] },
        { path: '/dapur/qc', label: 'QC Organoleptik', roles: ['owner','kasppg','pengawas_gizi'] },
        { path: '/dapur/layout', label: 'Layout Dapur', roles: ['owner','kasppg','pengawas_sanitasi'] },
        { path: '/dapur/tray', label: 'Food Tray', roles: ['owner','kasppg','pengawas_sanitasi','asisten_lapangan'] },
      ]
    },
    { 
      path: '/inventori', icon: Package, label: 'Inventori & Gudang', roles: ['owner','kasppg','pengawas_keuangan','pengawas_gizi','asisten_lapangan','jurutama_masak'],
      subItems: [
        { path: '/inventori/stok', label: 'Stok Gudang', roles: ['owner','kasppg','pengawas_keuangan','pengawas_gizi','asisten_lapangan','jurutama_masak'] },
        { path: '/inventori/penerimaan', label: 'Penerimaan PO', roles: ['owner','kasppg','pengawas_keuangan','asisten_lapangan'] },
        { path: '/inventori/master', label: 'Master Data Bahan', roles: ['owner','kasppg','pengawas_keuangan'] },
        { path: '/inventori/supplier', label: 'Data Supplier', roles: ['owner','kasppg','pengawas_keuangan'] },
      ]
    },
    { path: '/pengadaan', icon: ShoppingCart, label: 'Pengadaan & Belanja', roles: ['owner','kasppg','pengawas_keuangan'] },
    { path: '/distribusi', icon: Truck, label: 'Distribusi & DO', roles: ['owner','kasppg','asisten_lapangan','driver'] },
  ]},
  { label: 'SDM & Organisasi', items: [
    { 
      path: '/sdm', icon: Users, label: 'Relawan & Absensi', roles: ['owner','kasppg','pengawas_keuangan','asisten_lapangan'],
      subItems: [
        { path: '/sdm', label: 'Data Relawan', roles: ['owner','kasppg','pengawas_keuangan','asisten_lapangan'] },
        { path: '/sdm/absensi-qr', label: 'Absensi QR', roles: ['owner','kasppg','pengawas_keuangan','asisten_lapangan'] },
      ]
    },
  ]},
  { label: 'Keuangan & Pelaporan', items: [
    { 
      path: '/keuangan', icon: Wallet, label: 'Keuangan', roles: ['owner','kasppg','pengawas_keuangan','bgn_coord'],
      subItems: [
        { path: '/keuangan', label: '📊 Dashboard Keuangan', roles: ['owner','kasppg','pengawas_keuangan','bgn_coord'] },
        { path: '/keuangan/terima-dana', label: '💵 Catat Penerimaan Dana', roles: ['owner','kasppg','pengawas_keuangan'] },
        { path: '/keuangan/buku-bantu', label: '📒 Buku Bantu BGN', roles: ['owner','kasppg','pengawas_keuangan','bgn_coord'] },
        { path: '/keuangan/jurnal', label: '📋 Jurnal Transaksi', roles: ['owner','kasppg','pengawas_keuangan'] },
        { path: '/keuangan/laporan-keuangan', label: '📈 Laporan Keuangan', roles: ['owner','kasppg','pengawas_keuangan','bgn_coord'] },
        { path: '/keuangan/daftar-akun', label: '📁 Daftar Akun', roles: ['owner','kasppg','pengawas_keuangan'] },
      ]
    },
    { 
      path: '/laporan',  icon: FileText, label: 'Laporan BGN', roles: ['owner','kasppg','pengawas_keuangan','pengawas_gizi','pengawas_sanitasi','asisten_lapangan','bgn_coord'],
      subItems: [
        { path: '/laporan/harian', label: 'Harian (30a)', roles: ['owner','kasppg','pengawas_keuangan','pengawas_gizi','asisten_lapangan','bgn_coord'] },
        { path: '/laporan/mingguan', label: '2 Mingguan (30c)', roles: ['owner','kasppg','pengawas_keuangan','bgn_coord'] },
        { path: '/laporan/bulanan', label: 'Bulanan (30d)', roles: ['owner','kasppg','pengawas_keuangan','bgn_coord'] },
        { path: '/laporan/waste', label: 'Food Waste', roles: ['owner','kasppg','pengawas_gizi','pengawas_sanitasi'] },
        { path: '/laporan/sync', label: 'Status SIPGN', roles: ['owner','kasppg','pengawas_keuangan','bgn_coord'] },
      ]
    },
  ]},
  { label: 'Penerima', items: [
    { path: '/penerima-manfaat', icon: Heart, label: 'Penerima Manfaat', roles: ['owner','kasppg','pengawas_keuangan','pengawas_gizi'] },
  ]},
  { label: 'Lainnya', items: [
    { path: '/ai-assistant', icon: Bot, label: 'AI Assistant', roles: ['owner','kasppg','pengawas_keuangan','bgn_coord','asisten_lapangan'] },
    { path: '/settings',  icon: Settings,       label: 'Pengaturan',       roles: ALL_ROLES },
    { path: '/panduan',   icon: BookOpen,       label: 'Panduan & Bantuan', roles: ALL_ROLES },
    { path: '/belajar',   icon: GraduationCap,  label: 'Belajar',          roles: ALL_ROLES },
  ]},
  { label: 'Platform Control', items: [
    { path: '/superadmin', icon: ShieldAlert, label: 'Panel Super Admin', roles: ['superadmin'] },
  ]},
];

function avatarColor(nama: string): string {
  const colors = ['bg-blue-600','bg-indigo-600','bg-sky-600','bg-cyan-600','bg-teal-600','bg-violet-600'];
  let h = 0;
  for (let i = 0; i < nama.length; i++) h = nama.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'aktif')     return <span className="badge-success">Aktif</span>;
  if (status === 'persiapan') return <span className="badge-warning">Persiapan</span>;
  if (status === 'suspended') return <span className="badge-danger">Suspended</span>;
  return <span className="badge-neutral">Nonaktif</span>;
}

interface SidebarProps { isOpen: boolean; onClose: () => void; }

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, sppg, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => { await signOut(); navigate('/login', { replace: true }); };

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 gap-2 flex-shrink-0" style={{ borderBottom: '0.5px solid #e2e8f0' }}>
        <img src="/@fs/C:/Users/HP/.gemini/antigravity/brain/e86f3240-0563-4028-ae03-69b0fd25d478/sppg_manager_logo_1778922831608.png" alt="SPPG Manager" className="h-9 w-auto object-contain flex-shrink-0" />
        <button onClick={onClose} className="md:hidden p-1 ml-auto" style={{ color: '#94a3b8' }}><X size={18} /></button>
      </div>

      {/* SPPG Info */}
      {sppg && (
        <div className="mx-3 my-3 p-3 card-surface flex-shrink-0">
          <p className="text-sm font-medium truncate" style={{ color: '#0f172a' }}>{sppg.nama}</p>
          <p className="text-xs mt-0.5 truncate" style={{ color: '#475569' }}>{sppg.kab_kota}</p>
          <div className="mt-2"><StatusBadge status={sppg.status} /></div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {NAV_GROUPS.map((group) => {
          const visible = group.items.filter((item) => user && item.roles.includes(user.role));
          if (!visible.length) return null;
          return (
            <div key={group.label || 'root'}>
              {group.label && <p className="section-title px-3 pt-4 pb-1">{group.label}</p>}
              <div className="space-y-0.5">
                {visible.map((item) => {
                  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                  const Icon = item.icon;
                  const visibleSubItems = item.subItems?.filter(sub => user && sub.roles.includes(user.role)) || [];

                  return (
                    <div key={item.path} className="mb-0.5">
                      <NavLink to={item.path} onClick={!visibleSubItems.length ? onClose : undefined}
                        style={isActive ? { background: '#eff6ff', color: '#1e6fbf', borderLeft: '2px solid #3b82f6', paddingLeft: 'calc(0.75rem - 2px)' } : { color: '#475569' }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${!isActive ? 'hover:bg-[#f1f5f9]' : ''}`}
                      >
                        <Icon size={16} className="flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>

                      {/* Render Sub Items if active or if you want them expanded */}
                      {isActive && visibleSubItems.length > 0 && (
                        <div className="ml-7 mt-1 pl-3 border-l-2 border-slate-100 space-y-0.5">
                          {visibleSubItems.map(sub => {
                            // Cek active sub item, default empty param ke item utama
                            const subPathSegments = sub.path.split('/');
                            const currentSegments = location.pathname.split('/');
                            // Check if current URL matches the subpath
                            const isSubActive = location.pathname === sub.path || (sub.path === item.path && currentSegments.length === 2);
                            
                            return (
                              <NavLink key={sub.path} to={sub.path} onClick={onClose}
                                className={`block px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                  isSubActive ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {sub.label}
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User */}
      {user && (
        <div className="p-3 flex-shrink-0" style={{ borderTop: '0.5px solid #e2e8f0' }}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 ${avatarColor(user.nama)}`}>
              {getInisialNama(user.nama)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#0f172a' }}>{singkatNama(user.nama)}</p>
              <p className="text-xs truncate capitalize" style={{ color: '#94a3b8' }}>{user.jabatan.replace(/_/g, ' ')}</p>
            </div>
            <button onClick={handleSignOut} title="Keluar" className="p-1.5 rounded-lg transition-all flex-shrink-0" style={{ color: '#94a3b8' }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={onClose} />}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col z-40" style={{ background: '#ffffff', borderRight: '0.5px solid #e2e8f0' }}>
        {content}
      </aside>
      <aside className={`fixed left-0 top-0 h-screen w-60 flex flex-col z-50 md:hidden transition-transform duration-200 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ background: '#ffffff', borderRight: '0.5px solid #e2e8f0' }}>
        {content}
      </aside>
    </>
  );
}
