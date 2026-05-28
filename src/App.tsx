import { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { checkAndSendPendingNotifications } from '@/lib/notification-scheduler';
import type { UserRole } from '@/types';

// ─── Layouts & UI ───────────────────────────────────────────────────────────
import AppLayout from '@/components/layout/AppLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// ─── Halaman Utama & Auth ───────────────────────────────────────────────────
import Login from '@/pages/auth/Login';
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import RegisterPage from '@/pages/RegisterPage';
import LandingPage from '@/pages/LandingPage';
import Dashboard from '@/pages/dashboard/Dashboard';

// ─── Super Admin Dashboard (Lazy) ───────────────────────────────────────────────────
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import { SuperAdminGuard } from '@/components/layout/SuperAdminGuard';
import SuperAdminLogin from '@/pages/superadmin/SuperAdminLogin';
const SuperAdminDashboard = lazy(() => import('@/pages/superadmin/SuperAdminDashboard'));
const KelolaSSPG = lazy(() => import('@/pages/superadmin/KelolaSSPG'));
const PaketBilling = lazy(() => import('@/pages/superadmin/PaketBilling'));
const Analytics = lazy(() => import('@/pages/superadmin/Analytics'));
const Broadcast = lazy(() => import('@/pages/superadmin/Broadcast'));
const Helpdesk = lazy(() => import('@/pages/superadmin/Helpdesk'));
const CMSWebsite = lazy(() => import('@/pages/superadmin/CMSWebsite'));
const PengaturanSistem = lazy(() => import('@/pages/superadmin/PengaturanSistem'));
const Keamanan = lazy(() => import('@/pages/superadmin/Keamanan'));

// ─── Halaman Placeholder & Utama (Lazy) ────────────────────────
const PlaceholderPage = lazy(() => import('@/pages/PlaceholderPage'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const Pengaturan = lazy(() => import('@/pages/settings/Pengaturan'));
const PenerimaManfaatPage = lazy(() => import('@/pages/penerima-manfaat/PenerimaManfaat'));
const DapurPage = lazy(() => import('@/pages/dapur/DapurPage'));

// ─── MODUL: PENGADAAN (Lazy) ───────────────────────────────────────────────────────
const PurchaseOrder = lazy(() => import('@/pages/pengadaan/PurchaseOrder'));

// ─── MODUL: DISTRIBUSI (Lazy) ──────────────────────────────────────────────────────
const DistribusiPage = lazy(() => import('@/pages/distribusi/DistribusiPage'));

// ─── MODUL: INVENTORI (Lazy) ───────────────────────────────────────────────────────
const InventoriPage = lazy(() => import('@/pages/inventori/InventoriPage'));

// ─── MODUL: SDM, KEUANGAN, LAPORAN, PANDUAN (Lazy) ──────────────────────────────────
const SDMPage = lazy(() => import('@/pages/sdm/SDMPage'));
const AbsensiQR = lazy(() => import('@/pages/sdm/AbsensiQR'));
const KeuanganPage = lazy(() => import('@/pages/keuangan/KeuanganPage'));
const AuditTrailPage = lazy(() => import('@/pages/keuangan/AuditTrail'));
const BukuBantuPage = lazy(() => import('@/pages/keuangan/BukuBantu'));
const TerimaDana = lazy(() => import('@/pages/keuangan/TerimaDana'));
const JurnalUmum = lazy(() => import('@/pages/keuangan/JurnalUmum'));
const LaporanKeuangan = lazy(() => import('@/pages/keuangan/LaporanKeuangan'));
const COA = lazy(() => import('@/pages/keuangan/COA'));
const LaporanPageWrapper = lazy(() => import('@/pages/laporan/LaporanPage'));
const PanduanPage = lazy(() => import('@/pages/panduan/PanduanPage'));
const ELearning = lazy(() => import('@/pages/elearning/ELearning'));
const AiAssistantPage = lazy(() => import('@/pages/ai-assistant/AiAssistantPage'));

/**
 * Pelindung Rute (RBAC)
 * Memastikan user sudah login & memiliki role yang diizinkan.
 */
function RoleGuard({ children, roles }: { children: React.ReactNode, roles?: UserRole[] }) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <LoadingSpinner fullScreen />;

  // Belum login → ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Superadmin tidak boleh akses route tenant biasa (kecuali dashboard)
  // (Superadmin punya layout sendiri di /superadmin)
  // Role guard tambahan: kalau ada pembatasan dan user tidak punya role itu
  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

function UnauthorizedPage() {
  return (
    <PlaceholderPage 
      title="Akses Ditolak" 
      icon="🔒" 
      description="Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator SPPG atau Kepala Satuan Pelayanan untuk penyesuaian hak akses." 
    />
  );
}

function NotFoundPage() {
  return (
    <PlaceholderPage 
      title="404 — Tidak Ditemukan" 
      icon="🗺️" 
      description="Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan." 
    />
  );
}

// ─── App Component ─────────────────────────────────────────────────────────
export default function App() {
  const { user, isLoading, loadProfile, setUser, setSppg, setAllSppg, setLoading } = useAuthStore();
  const initAutoDetect = useSettingsStore((s) => s.initAutoDetect);

  // Inisialisasi deteksi RAM & koneksi sekali saat app mount
  useEffect(() => {
    initAutoDetect();
    // Darurat: Hapus efek pointer-events-none dari modal Radix yang gagal unmount
    document.body.style.pointerEvents = 'auto';
  }, [initAutoDetect]);

  // Jalankan scheduler notifikasi WA saat app pertama kali dibuka
  useEffect(() => {
    const sppgId = useAuthStore.getState().sppg?.id;
    if (sppgId) {
      void checkAndSendPendingNotifications(sppgId);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      // 1. Cek apakah ada user bypass yang sudah ter-persist
      const persistedUser = useAuthStore.getState().user;
      const isBypass = persistedUser?.id.startsWith('admin-') || persistedUser?.id.startsWith('demo-');

      if (isBypass) {
        // Jika bypass, kita langsung anggap beres (set loading false)
        if (isMounted) setLoading(false);
        return;
      }

      // 2. Jika bukan bypass, cek session Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await loadProfile();
      } else {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    // 3. Pasang listener perubahan auth state (hanya untuk non-bypass)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        const currentUser = useAuthStore.getState().user;
        const isBypass = currentUser?.id.startsWith('admin-') || currentUser?.id.startsWith('demo-');

        if (isBypass) return; // Abaikan semua event server jika sedang mode bypass

        if (event === 'SIGNED_IN') {
          void loadProfile();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSppg(null);
          setAllSppg([]);
          setLoading(false);
        }
      },
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile, setUser, setSppg, setAllSppg, setLoading]);

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Super Admin Routes (Isolasi dari AppLayout user biasa) */}
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route path="/superadmin" element={<SuperAdminGuard><SuperAdminLayout /></SuperAdminGuard>}>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="sppg" element={<KelolaSSPG />} />
          <Route path="paket" element={<PaketBilling />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="broadcast" element={<Broadcast />} />
          <Route path="helpdesk" element={<Helpdesk />} />
          <Route path="cms" element={<CMSWebsite />} />
          <Route path="pengaturan" element={<PengaturanSistem />} />
          <Route path="keamanan" element={<Keamanan />} />
        </Route>

        <Route path="/absensi/qr" element={<AbsensiQR />} />

        {/* Semua halaman dalam AppLayout dilindungi RoleGuard */}
        <Route element={<AppLayout />}>
          {/* Rute Umum (Semua Staff) */}
          <Route path="/dashboard" element={<RoleGuard><Dashboard /></RoleGuard>} />
          <Route path="/settings" element={<RoleGuard><SettingsPage /></RoleGuard>} />
          {/* Pengaturan SPPG (Kop Surat, Tanda Tangan, Profil Organisasi) — HANYA MANAJEMEN */}
          <Route path="/pengaturan" element={<RoleGuard roles={['owner','kasppg','pengawas_keuangan']}><Pengaturan /></RoleGuard>} />
          <Route path="/belajar" element={<RoleGuard><ELearning /></RoleGuard>} />
          <Route path="/panduan" element={<RoleGuard><PanduanPage /></RoleGuard>} />
          <Route path="/ai-assistant" element={<RoleGuard roles={['owner','kasppg','pengawas_keuangan','bgn_coord','asisten_lapangan']}><AiAssistantPage /></RoleGuard>} />

          {/* Modul Operasional dengan Role Guard ketat */}
          <Route path="/dapur/*" element={<RoleGuard roles={['owner','kasppg','pengawas_gizi','pengawas_sanitasi','asisten_lapangan','jurutama_masak']}><DapurPage /></RoleGuard>} />
          <Route path="/inventori/*" element={<RoleGuard roles={['owner','kasppg','pengawas_keuangan','pengawas_gizi','asisten_lapangan','jurutama_masak']}><InventoriPage /></RoleGuard>} />
          <Route path="/pengadaan" element={<RoleGuard roles={['owner','kasppg','pengawas_keuangan']}><PurchaseOrder /></RoleGuard>} />
          <Route path="/distribusi" element={<RoleGuard roles={['owner','kasppg','asisten_lapangan','driver']}><DistribusiPage /></RoleGuard>} />
          <Route path="/penerima-manfaat" element={<RoleGuard roles={['owner','kasppg','pengawas_keuangan','pengawas_gizi']}><PenerimaManfaatPage /></RoleGuard>} />

          {/* Modul SDM & Keuangan */}
          <Route path="/sdm" element={<RoleGuard roles={['owner','kasppg','pengawas_keuangan','asisten_lapangan']}><SDMPage /></RoleGuard>} />
          <Route path="/sdm/*" element={<RoleGuard roles={['owner','kasppg','pengawas_keuangan','asisten_lapangan']}><SDMPage /></RoleGuard>} />
          <Route path="/sdm/absensi-qr" element={<RoleGuard roles={['owner','kasppg','pengawas_keuangan','asisten_lapangan']}><AbsensiQR /></RoleGuard>} />
          
          <Route path="/keuangan" element={<RoleGuard roles={['owner','kasppg','pengawas_keuangan','bgn_coord']}><KeuanganPage /></RoleGuard>} />
          <Route path="/keuangan/buku-bantu" element={<RoleGuard roles={['owner','kasppg','pengawas_keuangan','bgn_coord']}><BukuBantuPage /></RoleGuard>} />
          <Route path="/keuangan/terima-dana" element={<RoleGuard roles={['owner','kasppg','pengawas_keuangan']}><TerimaDana /></RoleGuard>} />
          <Route path="/keuangan/jurnal" element={<RoleGuard roles={['owner','kasppg','pengawas_keuangan']}><JurnalUmum /></RoleGuard>} />
          <Route path="/keuangan/laporan-keuangan" element={<RoleGuard roles={['owner','kasppg','pengawas_keuangan','bgn_coord']}><LaporanKeuangan /></RoleGuard>} />
          <Route path="/keuangan/daftar-akun" element={<RoleGuard roles={['owner','kasppg','pengawas_keuangan']}><COA /></RoleGuard>} />
          <Route path="/audit-trail" element={<RoleGuard roles={['owner','kasppg']}><AuditTrailPage /></RoleGuard>} />
          
          <Route path="/laporan/*" element={<RoleGuard roles={['owner','kasppg','pengawas_keuangan','pengawas_gizi','pengawas_sanitasi','asisten_lapangan','bgn_coord']}><LaporanPageWrapper /></RoleGuard>} />

          {/* Korwil (BGN Coord) */}
          <Route path="/korwil" element={<RoleGuard roles={['bgn_coord']}><PlaceholderPage title="Koordinator Wilayah" icon="🗺️" description="Fitur monitoring wilayah untuk BGN Coord sedang dalam pengembangan." /></RoleGuard>} />

          {/* Panel Super Admin di dalam AppLayout hanya untuk superadmin */}
          <Route path="/admin" element={<RoleGuard roles={['superadmin']}><AdminDashboard /></RoleGuard>} />
        </Route>

        {/* Error Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
