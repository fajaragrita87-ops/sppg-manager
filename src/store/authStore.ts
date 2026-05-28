import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit-logger';
import type {
  AuthUser,
  SppgProfile,
  Permission,
  UserRole,
} from '@/types';
import { PERMISSION_MATRIX } from '@/types';

// ─── Route Access Map ─────────────────────────────────────────────────────────

const ROUTE_ROLES: Record<string, UserRole[]> = {
  '/dashboard': [
    'owner', 'kasppg', 'pengawas_keuangan', 'pengawas_gizi',
    'pengawas_sanitasi', 'asisten_lapangan', 'jurutama_masak',
    'driver', 'bgn_coord',
  ],
  '/dapur': [
    'owner', 'kasppg', 'pengawas_gizi', 'asisten_lapangan', 'jurutama_masak',
  ],
  '/inventori': [
    'owner', 'kasppg', 'pengawas_keuangan', 'jurutama_masak',
  ],
  '/pengadaan': [
    'owner', 'kasppg', 'pengawas_keuangan',
  ],
  '/sdm': [
    'owner', 'kasppg', 'pengawas_keuangan', 'asisten_lapangan',
  ],
  '/keuangan': [
    'owner', 'kasppg', 'pengawas_keuangan', 'bgn_coord',
  ],
  '/laporan': [
    'owner', 'kasppg', 'pengawas_keuangan', 'pengawas_sanitasi', 'bgn_coord',
  ],
  '/penerima-manfaat': [
    'owner', 'kasppg', 'pengawas_keuangan', 'pengawas_gizi',
  ],
  '/admin': ['superadmin'],
};

// ─── Store Interface ──────────────────────────────────────────────────────────

interface AuthStore {
  // ── State ──
  user: AuthUser | null;
  sppg: SppgProfile | null;
  allSppg: SppgProfile[];
  isLoading: boolean;
  isOnline: boolean;

  // ── Setters ──
  setUser: (user: AuthUser | null) => void;
  setSppg: (sppg: SppgProfile | null) => void;
  setAllSppg: (list: SppgProfile[]) => void;
  setLoading: (loading: boolean) => void;
  setOnline: (online: boolean) => void;

  // ── Permission Helpers ──
  can: (permission: Permission) => boolean;
  canAccessRoute: (path: string) => boolean;

  // ── Auth Actions ──
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
}

// ─── Helper: friendly error messages ─────────────────────────────────────────

function friendlyError(message: string): string {
  if (message.includes('Invalid login credentials'))
    return 'Email atau kata sandi salah. Silakan coba lagi.';
  if (message.includes('Email not confirmed'))
    return 'Email belum dikonfirmasi. Periksa kotak masuk Anda.';
  if (message.includes('Too many requests'))
    return 'Terlalu banyak percobaan login. Coba lagi beberapa menit kemudian.';
  if (message.includes('network') || message.includes('fetch'))
    return 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
  return message || 'Terjadi kesalahan. Silakan coba lagi.';
}

// ─── Zustand Store ────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────────────────
      user: null,
      sppg: null,
      allSppg: [],
      isLoading: true,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,

      // ── Setters ───────────────────────────────────────────────────────────
      setUser:    (user)    => set({ user }),
      setSppg:    (sppg)    => set({ sppg }),
      setAllSppg: (allSppg) => set({ allSppg }),
      setLoading: (isLoading) => set({ isLoading }),
      setOnline:  (isOnline)  => set({ isOnline }),

      // ── Permission: can ───────────────────────────────────────────────────
      can: (permission) => {
        const { user } = get();
        if (!user) return false;
        return PERMISSION_MATRIX[user.role]?.[permission] === true;
      },

      // ── Permission: canAccessRoute ────────────────────────────────────────
      canAccessRoute: (path) => {
        const { user } = get();
        if (!user) return false;
        
        // Master Key: Superadmin can access everything
        if (user.role === 'superadmin') return true;

        // Cari route yang cocok (exact match atau prefix)
        const matchedKey = Object.keys(ROUTE_ROLES).find(
          (route) => path === route || path.startsWith(route + '/'),
        );

        if (!matchedKey) return false;
        return ROUTE_ROLES[matchedKey].includes(user.role);
      },

      // ── signIn ────────────────────────────────────────────────────────────
      signIn: async (email, password) => {
        const { setLoading, loadProfile } = get();
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          setLoading(false);
          return { error: friendlyError(error.message) };
        }

        await loadProfile();

        // ── Audit: login sukses ──
        const state = get();
        if (state.user && state.sppg) {
          void logAudit({
            sppgId:    state.sppg.id,
            userId:    state.user.id,
            action:    'login_pengguna',
            tableName: 'users',
            recordId:  state.user.id,
            keterangan: `Login sukses: ${email}`,
          });
        }

        return { error: null };
      },

      // ── signOut ───────────────────────────────────────────────────────────
      signOut: async () => {
        const { user, sppg } = get();
        const isBypass = user?.id.startsWith('admin-') || user?.id.startsWith('demo-');

        // ── Audit: logout ──
        if (user && sppg) {
          void logAudit({
            sppgId:    sppg.id,
            userId:    user.id,
            action:    'pengguna_logout',
            tableName: 'users',
            recordId:  user.id,
            keterangan: `Logout: ${user.nama}`,
          });
        }

        if (!isBypass) {
          await supabase.auth.signOut();
        }
        set({ user: null, sppg: null, allSppg: [], isLoading: false });
        try { localStorage.removeItem('sppg-auth'); } catch {}
        sessionStorage.removeItem('super_admin_session');
      },

      // ── loadProfile ───────────────────────────────────────────────────────
      loadProfile: async () => {
        const { user, setUser, setSppg, setAllSppg, setLoading } = get();
        
        // PROTEKSI: Jika user adalah demo/bypass, jangan load dari Supabase
        if (user?.id.startsWith('admin-') || user?.id.startsWith('demo-')) {
          setLoading(false);
          return;
        }

        setLoading(true);

        try {
          // 1. Ambil sesi Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.getUser();
          if (authError || !authData.user) {
            setUser(null);
            setSppg(null);
            setAllSppg([]);
            return;
          }

          // 2. Query profil user dari tabel 'users'
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', authData.user.id)
            .single();

          if (profileError || !profile) {
            console.error('[AuthStore] Profil user tidak ditemukan:', profileError?.message);
            setUser(null);
            setSppg(null);
            setAllSppg([]);
            return;
          }

          setUser(profile as AuthUser);

          // 3. Query data SPPG
          const { data: sppgData, error: sppgError } = await supabase
            .from('sppg')
            .select('*')
            .eq('id', profile.sppg_id)
            .single();

          if (sppgError || !sppgData) {
            console.error('[AuthStore] Data SPPG tidak ditemukan:', sppgError?.message);
            setSppg(null);
            setAllSppg([]);
            return;
          }

          setSppg(sppgData as SppgProfile);

          // 4. Kalau owner, load semua SPPG milik yayasan yang sama
          if (profile.role === 'owner' && sppgData.yayasan_id) {
            const { data: allSppgData } = await supabase
              .from('sppg')
              .select('*')
              .eq('yayasan_id', sppgData.yayasan_id)
              .order('nama');

            setAllSppg((allSppgData ?? []) as SppgProfile[]);
          } else {
            setAllSppg([]);
          }
        } catch (err) {
          console.error('[AuthStore] loadProfile error:', err);
          setUser(null);
          setSppg(null);
          setAllSppg([]);
        } finally {
          setLoading(false);
        }
      },
    }),

    // ── Persist config ──────────────────────────────────────────────────────
    {
      name: 'sppg-auth',
      // Hanya simpan data yang relevan — JANGAN persist isLoading & isOnline
      partialize: (state) => ({
        user:    state.user,
        sppg:    state.sppg,
        allSppg: state.allSppg,
      }),
    },
  ),
);

// ─── Online / Offline Listener ────────────────────────────────────────────────
// Dipasang di luar store agar tidak duplikat saat hot reload

if (typeof window !== 'undefined') {
  window.addEventListener('online',  () => useAuthStore.getState().setOnline(true));
  window.addEventListener('offline', () => useAuthStore.getState().setOnline(false));
}
