// ==============================
// SETTINGS STORE — Mode Hemat & Preferensi Pengguna
// Deteksi otomatis RAM & koneksi untuk SPPG di daerah terpencil
// ==============================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from '@/store/toastStore';

// ─── Tipe & Interface ─────────────────────────────────────────────────────────

export type Bahasa = 'id' | 'id-simple';
export type FontSize = 'normal' | 'besar';
export type SyncInterval = 5 | 15 | 0; // 0 = manual saja

interface DeviceInfo {
  ram: number | null;        // GB (dari navigator.deviceMemory)
  koneksi: string | null;    // '4g' | '3g' | '2g' | 'slow-2g' | null
  autoDetected: boolean;
}

interface SettingsState {
  // ── Status ──
  liteMode: boolean;
  bahasa: Bahasa;
  fontSize: FontSize;
  autoSyncInterval: SyncInterval;
  lastSyncAt: string | null;
  deviceInfo: DeviceInfo;
  docSettings: {
    namaSppg: string;
    alamat: string;
    namaPimpinan: string;
    jabatanPimpinan: string;
  };

  // ── Tindakan ──
  toggleLiteMode: () => void;
  setLiteMode: (val: boolean) => void;
  setLanguage: (lang: Bahasa) => void;
  setFontSize: (size: FontSize) => void;
  setAutoSyncInterval: (menit: SyncInterval) => void;
  setLastSyncAt: (time: string) => void;
  initAutoDetect: () => void;
  setDocSettings: (settings: Partial<SettingsState['docSettings']>) => void;
}

// ─── Deteksi Perangkat ────────────────────────────────────────────────────────

function detectDevice(): DeviceInfo {
  const nav = navigator as any;
  const ram: number | null = nav.deviceMemory ?? null;
  const conn = nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
  const koneksi: string | null = conn?.effectiveType ?? null;
  return { ram, koneksi, autoDetected: false };
}

function shouldAutoLite(info: DeviceInfo): boolean {
  if (info.ram !== null && info.ram < 4) return true;
  if (info.koneksi === '2g' || info.koneksi === 'slow-2g') return true;
  return false;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      liteMode: false,
      bahasa: 'id',
      fontSize: 'normal',
      autoSyncInterval: 5,
      lastSyncAt: null,
      deviceInfo: { ram: null, koneksi: null, autoDetected: false },
      docSettings: {
        namaSppg: 'SATUAN PELAYANAN PROGRAM GIZI',
        alamat: 'Jl. Operasional Dapur No. 1, Jawa Barat | Email: admin@sppg.id',
        namaPimpinan: 'Ahmad Faisal, S.E.',
        jabatanPimpinan: 'Kepala SPPG / Pejabat Keuangan'
      },

      setDocSettings: (settings) => set((state) => ({ docSettings: { ...state.docSettings, ...settings } })),

      toggleLiteMode: () => {
        const next = !get().liteMode;
        set({ liteMode: next });
        applyBodyClass(next, get().fontSize);
        toast.info(
          next ? '⚡ Mode Hemat Aktif' : '🖥 Mode Normal Aktif',
          next
            ? 'Animasi & grafik dimatikan untuk kinerja optimal.'
            : 'Tampilan penuh diaktifkan kembali.',
        );
      },

      setLiteMode: (val) => {
        set({ liteMode: val });
        applyBodyClass(val, get().fontSize);
      },

      setLanguage: (lang) => set({ bahasa: lang }),

      setFontSize: (size) => {
        set({ fontSize: size });
        applyBodyClass(get().liteMode, size);
      },

      setAutoSyncInterval: (menit) => set({ autoSyncInterval: menit }),

      setLastSyncAt: (time) => set({ lastSyncAt: time }),

      // Dipanggil sekali saat app mount — deteksi otomatis RAM & koneksi
      initAutoDetect: () => {
        const info = detectDevice();
        const state = get();

        // Kalau sudah pernah di-persist, jangan override pilihan user
        if (state.deviceInfo.autoDetected) {
          applyBodyClass(state.liteMode, state.fontSize);
          return;
        }

        const auto = shouldAutoLite(info);
        set({ deviceInfo: { ...info, autoDetected: true }, liteMode: auto });
        applyBodyClass(auto, state.fontSize);

        if (auto) {
          // Delay toast agar tidak bertabrakan dengan render awal
          setTimeout(() => {
            toast.info(
              '⚡ Mode Hemat diaktifkan otomatis',
              'Mode Hemat diaktifkan otomatis untuk kinerja terbaik di perangkat Anda.',
              7000,
            );
          }, 1500);
        }
      },
    }),
    {
      name: 'sppg-settings',
      // Jangan persist deviceInfo.autoDetected agar bisa re-detect kalau clear storage
      partialize: (s) => ({
        liteMode: s.liteMode,
        bahasa: s.bahasa,
        fontSize: s.fontSize,
        autoSyncInterval: s.autoSyncInterval,
        lastSyncAt: s.lastSyncAt,
        deviceInfo: s.deviceInfo,
        docSettings: s.docSettings,
      }),
    }
  )
);

// ─── Helper: Apply class ke <body> ───────────────────────────────────────────

function applyBodyClass(lite: boolean, fontSize: FontSize) {
  const body = document.body;
  if (lite) {
    body.classList.add('lite-mode');
  } else {
    body.classList.remove('lite-mode');
  }
  body.classList.remove('font-besar', 'font-normal-size');
  body.classList.add(fontSize === 'besar' ? 'font-besar' : 'font-normal-size');
}
