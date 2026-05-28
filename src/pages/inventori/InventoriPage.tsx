import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import StokBahanPage from './StokBahan';
import MasterBahanPage from './MasterBahan';
import SupplierPage from './Supplier';
import SurveiHargaPage from './SurveiHarga';
import PenerimaanBarangPage from './PenerimaanBarang';
import { ReadOnlyBadge } from '@/hooks/PermGuard';
import { ShieldOff, Package, Truck, Database, Users, BarChart2, ClipboardList } from 'lucide-react';
import type { UserRole } from '@/types';

// ─── Single Source of Truth Permission Inventori ──────────────────────────────
const ALL_INVENTORI_TABS: { id: string; label: string; icon: any; roles: UserRole[] }[] = [
  { id: 'stok',      label: 'Stok & Gudang',         icon: Package,       roles: ['owner','kasppg','pengawas_keuangan','pengawas_gizi','asisten_lapangan','jurutama_masak'] },
  { id: 'penerimaan',label: 'Penerimaan PO',          icon: Truck,         roles: ['owner','kasppg','pengawas_keuangan','asisten_lapangan'] },
  { id: 'master',    label: 'Master Data Bahan',      icon: Database,      roles: ['owner','kasppg','pengawas_keuangan'] },
  { id: 'supplier',  label: 'Data Supplier',          icon: Users,         roles: ['owner','kasppg','pengawas_keuangan'] },
  { id: 'survei',    label: 'Survei Harga',           icon: BarChart2,     roles: ['owner','kasppg','pengawas_keuangan'] },
];

export default function InventoriPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore(s => s.user);

  // 1. Filter tab berdasarkan role - ini yang mengontrol apa yang BENAR-BENAR bisa diakses
  const allowedTabs = ALL_INVENTORI_TABS.filter(
    t => user && t.roles.includes(user.role)
  );

  const isManagement = user &&
    ['owner', 'kasppg', 'pengawas_keuangan'].includes(user.role);

  // 2. Ambil tab dari path
  const pathParts = location.pathname.split('/');
  const rawTab = pathParts[2] || 'stok';

  // 3. SECURITY: Jika user mencoba akses tab via URL langsung yang tidak diizinkan,
  //    otomatis jatuhkan ke tab pertama yang diizinkan.
  const isAllowedTab = allowedTabs.some(t => t.id === rawTab);
  const activeTab = isAllowedTab ? rawTab : (allowedTabs[0]?.id || 'stok');

  const setTab = (id: string) => navigate(`/inventori/${id}`);

  if (allowedTabs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <ShieldOff size={28} className="text-red-400" />
        </div>
        <h2 className="font-bold text-slate-700 text-lg">Akses Ditolak</h2>
        <p className="text-slate-400 text-sm mt-1">Role Anda tidak memiliki akses ke modul Inventori & Gudang.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* ─── TAB HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl font-semibold" style={{ color: '#0f172a' }}>Inventori & Gudang</h1>
            {!isManagement && <ReadOnlyBadge />}
          </div>
          {!isManagement && (
            <p className="text-xs text-amber-700 mt-1 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 inline-block">
              Role Anda hanya dapat melihat data stok. Master data, supplier, dan survei harga memerlukan izin manajemen.
            </p>
          )}
          <div className="flex gap-1 mt-3 overflow-x-auto">
            {allowedTabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                  style={activeTab === t.id
                    ? { background: '#eff6ff', color: '#1d4ed8', fontWeight: 700, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                    : { color: '#64748b' }
                  }
                >
                  <Icon size={13} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── TAB CONTENT ─── */}
      {/* Double-check di level render: bahkan jika URL dimanipulasi, konten tidak akan keluar */}
      <div className="mt-2">
        {activeTab === 'stok'       && allowedTabs.some(t => t.id === 'stok')       && <StokBahanPage />}
        {activeTab === 'penerimaan' && allowedTabs.some(t => t.id === 'penerimaan') && <PenerimaanBarangPage />}
        {activeTab === 'master'     && allowedTabs.some(t => t.id === 'master')     && <MasterBahanPage />}
        {activeTab === 'supplier'   && allowedTabs.some(t => t.id === 'supplier')   && <SupplierPage />}
        {activeTab === 'survei'     && allowedTabs.some(t => t.id === 'survei')     && <SurveiHargaPage />}
      </div>
    </div>
  );
}
