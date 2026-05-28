import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// ─── Validasi ─────────────────────────────────────────────────────────────────
// Jangan throw saat dev tanpa Supabase — gunakan fallback dummy
// agar halaman tetap bisa dipreview.

const isMissing = !supabaseUrl?.trim() || !supabaseAnonKey?.trim();

if (isMissing) {
  console.warn(
    '[SPPG Manager] ⚠ VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum dikonfigurasi.\n' +
    'Tambahkan ke file .env:\n\n' +
    '  VITE_SUPABASE_URL=https://xxx.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=eyJhbG...\n\n' +
    'Fitur auth & database tidak akan berfungsi sampai env var diisi.',
  );
}

// Buat client dengan fallback URL agar tidak crash
// Auth & query akan gagal tapi UI tetap bisa dipreview
export const supabase: SupabaseClient = createClient(
  supabaseUrl?.trim() || 'https://placeholder.supabase.co',
  supabaseAnonKey?.trim() || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  },
);

/** True jika Supabase sudah dikonfigurasi dengan benar */
export const isSupabaseConfigured = !isMissing;
