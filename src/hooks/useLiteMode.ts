// ==============================
// useLiteMode — Hook utilitas Mode Hemat
// Gunakan ini di semua komponen agar konsisten
// ==============================

import { useSettingsStore } from '@/store/settingsStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─── Return Type ─────────────────────────────────────────────────────────────

export interface UseLiteModeReturn {
  /** true jika Mode Hemat sedang aktif */
  isLite: boolean;

  /**
   * Wrapper classNames yang otomatis menghapus kelas animasi saat lite mode aktif.
   * Gunakan seperti: cn('card p-4', 'animate-fade-in', 'hover:shadow-md')
   */
  cn: (...inputs: ClassValue[]) => string;

  /**
   * false jika lite mode aktif — gunakan untuk conditional render chart vs tabel
   */
  showChart: boolean;

  /**
   * Kembalikan src gambar atau undefined jika lite mode aktif.
   * Gunakan: <img src={imgSrc('/path/foto.jpg')} />
   * Kalau lite: gambar tidak dimuat, tampilkan placeholder saja.
   */
  imgSrc: (src: string) => string | undefined;

  /**
   * Kelas CSS animasi yang dikosongkan saat lite mode.
   * Contoh: <div className={`card ${anim('animate-fade-in')}`}>
   */
  anim: (...classes: string[]) => string;
}

// ─── Kelas animasi yang akan distrip saat lite mode ───────────────────────────

const ANIMATION_CLASSES = new Set([
  'animate-fade-in',
  'animate-slide-up',
  'animate-slide-right',
  'animate-pulse',
  'animate-pulse-soft',
  'animate-spin',
  'animate-bounce',
  'animate-shimmer',
  'transition-all',
  'transition-shadow',
  'transition-colors',
  'transition-transform',
  'duration-300',
  'duration-500',
  'duration-700',
  'hover:shadow-md',
  'hover:shadow-lg',
  'hover:shadow-xl',
  'hover:scale-105',
  'active:scale-95',
]);

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLiteMode(): UseLiteModeReturn {
  const isLite = useSettingsStore((s) => s.liteMode);

  /**
   * cn dengan strip animasi otomatis saat lite mode.
   * Saat lite = true: semua kelas di ANIMATION_CLASSES dihilangkan.
   */
  const cn = (...inputs: ClassValue[]): string => {
    const merged = twMerge(clsx(...inputs));
    if (!isLite) return merged;

    // Strip kelas animasi satu per satu
    return merged
      .split(' ')
      .filter((cls) => !ANIMATION_CLASSES.has(cls))
      .join(' ');
  };

  /**
   * false saat lite — komponen chart harus render tabel fallback
   */
  const showChart = !isLite;

  /**
   * Kembalikan undefined saat lite agar <img> tidak dirender / dimuat
   */
  const imgSrc = (src: string): string | undefined => {
    return isLite ? undefined : src;
  };

  /**
   * Helper cepat untuk animasi opsional.
   * Kalau lite → kembalikan string kosong, jadi tidak ada kelas animasi.
   */
  const anim = (...classes: string[]): string => {
    return isLite ? '' : classes.join(' ');
  };

  return { isLite, cn, showChart, imgSrc, anim };
}
