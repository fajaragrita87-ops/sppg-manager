import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─── Tailwind class merger ────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Format Rupiah (SAFE — handles null/undefined/NaN) ────────────────────────
/**
 * Format angka ke format mata uang Rupiah Indonesia.
 * @example formatRupiah(1500000) → "Rp 1.500.000"
 * @example formatRupiah(null) → "Rp 0"
 */
export function formatRupiah(angka: number | null | undefined): string {
  const safe = (typeof angka === 'number' && isFinite(angka)) ? angka : 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(safe)
    .replace('IDR', 'Rp')
    .trim();
}

// ─── Format Tanggal ───────────────────────────────────────────────────────────
export function formatTanggal(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export function formatTanggalPendek(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function getTanggalHariIni(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ─── Greeting ─────────────────────────────────────────────────────────────────
export function getGreeting(): string {
  const jam = new Date().getHours();
  if (jam < 12) return 'Selamat pagi';
  if (jam < 17) return 'Selamat siang';
  return 'Selamat malam';
}

// ─── Nama ─────────────────────────────────────────────────────────────────────
export function singkatNama(nama: string): string {
  return nama.trim().split(/\s+/).slice(0, 2).join(' ');
}

export function getInisialNama(nama: string): string {
  return nama.trim().split(/\s+/).slice(0, 2).map((kata) => kata.charAt(0).toUpperCase()).join('');
}

// ─── Keuangan ─────────────────────────────────────────────────────────────────
/**
 * Hitung estimasi hari operasional tersisa.
 * Mengembalikan 0 jika rata-rata = 0 (bukan Infinity/NaN).
 */
export function hitungHariLagi(totalSaldo: number, rataRataPengeluaranHarian: number): number {
  if (!rataRataPengeluaranHarian || rataRataPengeluaranHarian <= 0) return 0;
  return Math.max(0, Math.floor(totalSaldo / rataRataPengeluaranHarian));
}

// ─── Generate No Bukti Kas ────────────────────────────────────────────────────
/**
 * Generate nomor bukti unik untuk entri kas besar.
 * Format: BB/07/2025/001 (bahan baku), PC/07/2025/001 (petty cash), dll.
 * 
 * Prefix Map:
 *   bahan_baku         → BB
 *   operasional        → OP
 *   insentif_relawan   → IR
 *   petty_cash         → PC
 *   pemasukan_va       → VA
 *   lainnya            → LN
 */
export function generateNoBuktiPrefix(kategori: string): string {
  const map: Record<string, string> = {
    bahan_baku: 'BB',
    operasional: 'OP',
    insentif_relawan: 'IR',
    petty_cash: 'PC',
    pemasukan_va: 'VA',
    lainnya: 'LN',
  };
  return map[kategori] ?? 'XX';
}

export function generateNoBukti(kategori: string, tanggal: string, urutan: number): string {
  const prefix = generateNoBuktiPrefix(kategori);
  const d = new Date(tanggal);
  const bulan = String(d.getMonth() + 1).padStart(2, '0');
  const tahun = d.getFullYear();
  const nomor = String(urutan).padStart(3, '0');
  return `${prefix}/${bulan}/${tahun}/${nomor}`;
}

// ─── Validasi Input ───────────────────────────────────────────────────────────

/** Validasi NIK: tepat 16 digit angka */
export function validateNIK(nik: string): string | null {
  if (!nik) return 'NIK wajib diisi';
  if (!/^\d{16}$/.test(nik)) return 'NIK harus 16 digit angka';
  return null;
}

/** Validasi nomor HP Indonesia */
export function validateHP(hp: string): string | null {
  if (!hp) return 'Nomor HP wajib diisi';
  const cleaned = hp.replace(/[\s-]/g, '');
  if (!/^(08|62)\d{8,12}$/.test(cleaned)) return 'Nomor HP tidak valid (harus diawali 08 atau 62)';
  return null;
}

/** Validasi rate insentif */
export function validateRateInsentif(rate: number): string | null {
  if (!rate || rate <= 0) return 'Rate insentif wajib diisi';
  if (rate < 100000) return 'Rate insentif minimum Rp 100.000';
  if (rate > 200000) return 'Rate insentif maksimum Rp 200.000 sesuai juknis BGN';
  return null;
}

// ─── Kompres Gambar (canvas API, no library) ─────────────────────────────────
/**
 * Kompres gambar ke base64 JPEG dengan max width 1200px dan quality 0.75.
 * Digunakan sebelum upload foto ke Supabase Storage.
 */
export async function kompresGambar(
  file: File,
  maxWidth = 1200,
  quality = 0.75,
): Promise<{ base64: string; mediaType: string; size: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        const base64 = compressed.split(',')[1];
        const size = Math.round((base64.length * 3) / 4 / 1024); // KB
        resolve({ base64, mediaType: 'image/jpeg', size });
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Burndown Rate (saldo VA → estimasi hari) ────────────────────────────────
/**
 * Hitung rata-rata pengeluaran 7 hari terakhir.
 * @returns { rataRata, estimasiHari } — estimasiHari = '–' jika rataRata = 0
 */
export function hitungBurndown(
  saldo: number,
  pengeluaran7Hari: number[],
): { rataRata: number; estimasiHari: number | null } {
  const valid = pengeluaran7Hari.filter(p => p > 0);
  if (valid.length === 0) return { rataRata: 0, estimasiHari: null };
  const rataRata = valid.reduce((a, b) => a + b, 0) / valid.length;
  const estimasiHari = rataRata > 0 ? Math.max(0, Math.floor(saldo / rataRata)) : null;
  return { rataRata, estimasiHari };
}
