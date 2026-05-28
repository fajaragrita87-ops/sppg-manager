import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useNavigate as useNav } from 'react-router-dom';
import ProduksiHarian from './ProduksiHarian';
import QCOrganoleptik from './QCOrganoleptik';
import LayoutDapur from '../sdm/LayoutDapur';
import MenuPlanning from './MenuPlanning';
import FoodTrayTracker from './FoodTrayTracker';
import type { UserRole } from '@/types';

// ─── Definisi Tab beserta Role yang diizinkan ─────────────────────────────────
// Ini adalah SINGLE SOURCE OF TRUTH permission untuk modul Dapur.
// Jika sebuah role tidak terdaftar di sini, tab tidak akan muncul
// bahkan jika user mengetik URL secara manual.
const ALL_DAPUR_TABS: { id: string; label: string; roles: UserRole[] }[] = [
  {
    id: 'produksi',
    label: 'Produksi Harian',
    roles: ['owner', 'kasppg', 'asisten_lapangan', 'jurutama_masak'],
  },
  {
    id: 'menu',
    label: 'Perencanaan Menu',
    roles: ['owner', 'kasppg', 'pengawas_gizi', 'jurutama_masak'],
  },
  {
    id: 'qc',
    label: 'QC Organoleptik',
    roles: ['owner', 'kasppg', 'pengawas_gizi'],
  },
  {
    id: 'layout',
    label: 'Layout Dapur',
    roles: ['owner', 'kasppg', 'pengawas_sanitasi'],
  },
  {
    id: 'tray',
    label: 'Food Tray',
    roles: ['owner', 'kasppg', 'pengawas_sanitasi', 'asisten_lapangan'],
  },
];

export default function DapurPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore(s => s.user);

  // 1. Filter tab hanya untuk role yang diizinkan
  const allowedTabs = ALL_DAPUR_TABS.filter(
    t => user && t.roles.includes(user.role)
  );

  // 2. Ambil tab aktif dari URL path
  const pathParts = location.pathname.split('/');
  const rawTab = pathParts[2] || 'produksi';

  // 3. SECURITY: Jika role tidak punya izin ke tab tsb (via URL langsung),
  //    redirect ke tab pertama yang diizinkan.
  const isAllowedTab = allowedTabs.some(t => t.id === rawTab);
  const activeTab = isAllowedTab ? rawTab : (allowedTabs[0]?.id || 'produksi');

  const setTab = (id: string) => navigate(`/dapur/${id}`);

  if (allowedTabs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-4xl mb-4">🔒</p>
        <h2 className="font-bold text-slate-700 text-lg">Akses Ditolak</h2>
        <p className="text-slate-400 text-sm mt-1">Role Anda tidak memiliki akses ke modul Dapur & Produksi.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* ─── TAB HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold" style={{ color: '#0f172a' }}>Manajemen Dapur</h1>
          <div className="flex gap-1 mt-2 overflow-x-auto">
            {/* Hanya tampilkan tab yang diizinkan untuk role ini */}
            {allowedTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="btn-ghost text-xs whitespace-nowrap"
                style={activeTab === t.id ? { background: '#eff6ff', color: '#1e6fbf', fontWeight: 500 } : undefined}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── TAB CONTENT ─── */}
      {/* Double-check: render konten hanya jika role diizinkan ke tab tsb */}
      <div className="mt-2">
        {activeTab === 'produksi' && allowedTabs.some(t => t.id === 'produksi') && <ProduksiHarian />}
        {activeTab === 'menu'     && allowedTabs.some(t => t.id === 'menu')     && <MenuPlanning />}
        {activeTab === 'qc'       && allowedTabs.some(t => t.id === 'qc')       && <QCOrganoleptik />}
        {activeTab === 'layout'   && allowedTabs.some(t => t.id === 'layout')   && <LayoutDapur />}
        {activeTab === 'tray'     && allowedTabs.some(t => t.id === 'tray')     && <FoodTrayTracker />}
      </div>
    </div>
  );
}
