import { create } from 'zustand';

interface SuperAdmin {
  id: string;
  nama: string;
  email: string;
  role: 'super_admin' | 'support' | 'finance_viewer';
}

interface SuperAdminState {
  superAdmin: SuperAdmin | null;
  isLoading: boolean;
  signIn: (email: string, password: string, otpCode: string) => Promise<{ error: string | null }>;
  signOut: () => void;
  loadProfile: () => void;
}

export const useSuperAdminStore = create<SuperAdminState>((set) => ({
  superAdmin: null,
  isLoading: false,

  signIn: async (email, password, otpCode) => {
    set({ isLoading: true });
    try {
      // TODO: connect to Supabase
      // Simulasi API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validasi OTP
      if (otpCode !== '123456') {
        return { error: 'Kode OTP tidak valid' };
      }

      // Hardcoded untuk development
      if (email === 'admin@sppg.com' && password === 'admin123') {
        const adminData: SuperAdmin = {
          id: '1',
          nama: 'Super Admin',
          email: 'admin@sppg.com',
          role: 'super_admin'
        };
        sessionStorage.setItem('super_admin_session', JSON.stringify(adminData));
        set({ superAdmin: adminData, isLoading: false });
        return { error: null };
      }
      
      return { error: 'Email atau password salah' };
    } catch (error) {
      return { error: 'Terjadi kesalahan saat login' };
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: () => {
    sessionStorage.removeItem('super_admin_session');
    set({ superAdmin: null });
  },

  loadProfile: () => {
    // TODO: fetch real profile from Supabase
    const session = sessionStorage.getItem('super_admin_session');
    if (session) {
      try {
        const adminData = JSON.parse(session);
        set({ superAdmin: adminData });
      } catch (error) {
        sessionStorage.removeItem('super_admin_session');
      }
    }
  }
}));
