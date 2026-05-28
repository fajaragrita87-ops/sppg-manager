// ==============================
// LITE MODE TOGGLE — Tombol Mode Hemat
// Bisa dipakai di TopBar (compact) maupun halaman Pengaturan (full)
// ==============================

import { useSettingsStore } from '@/store/settingsStore';

// ─── Tipe ─────────────────────────────────────────────────────────────────────

interface LiteModeToggleProps {
  /** 'topbar' = ikon kecil | 'settings' = card besar dengan deskripsi */
  variant?: 'topbar' | 'settings';
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────

export default function LiteModeToggle({ variant = 'settings' }: LiteModeToggleProps) {
  const { liteMode, toggleLiteMode } = useSettingsStore();

  if (variant === 'topbar') {
    return <TopBarToggle liteMode={liteMode} onToggle={toggleLiteMode} />;
  }

  return <SettingsToggle liteMode={liteMode} onToggle={toggleLiteMode} />;
}

// ─── Variant: TopBar (ikon kecil) ─────────────────────────────────────────────

function TopBarToggle({ liteMode, onToggle }: { liteMode: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title={liteMode ? 'Mode Hemat Aktif — klik untuk matikan' : 'Aktifkan Mode Hemat'}
      className={`relative flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-bold transition-all duration-200 ${
        liteMode
          ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
          : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
      }`}
    >
      {/* Ikon kilat/baterai */}
      {liteMode ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" />
        </svg>
      )}
      {liteMode && (
        <span className="text-[10px] font-black tracking-wide">HEMAT</span>
      )}
    </button>
  );
}

// ─── Variant: Settings (card besar) ───────────────────────────────────────────

function SettingsToggle({ liteMode, onToggle }: { liteMode: boolean; onToggle: () => void }) {
  const fitur = [
    'Semua animasi dimatikan',
    'Grafik/chart diganti dengan tabel teks',
    'Gambar tidak dimuat otomatis',
    'Font lebih kecil dan ringkas',
    'Sinkronisasi hanya saat manual (hemat baterai)',
    'Tabel menggunakan render efisien',
  ];

  return (
    <div
      className={`rounded-2xl border-2 p-5 transition-all duration-300 ${
        liteMode
          ? 'border-amber-400 bg-amber-50'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      {/* Header toggle */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              liteMode ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-400'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-800">Mode Hemat</p>
              {liteMode && (
                <span className="text-[10px] font-black bg-amber-400 text-white px-2 py-0.5 rounded-full tracking-wide">
                  AKTIF
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Matikan animasi dan grafik untuk kinerja lebih cepat di HP dengan spesifikasi
              rendah atau koneksi internet lemot.
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          onClick={onToggle}
          role="switch"
          aria-checked={liteMode}
          className={`relative shrink-0 w-12 h-6 rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ${
            liteMode ? 'bg-amber-400 border-amber-400' : 'bg-slate-200 border-slate-300'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${
              liteMode ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Daftar fitur */}
      <div className={`mt-4 grid grid-cols-1 sm:grid-cols-2 gap-1.5 transition-opacity ${liteMode ? 'opacity-100' : 'opacity-50'}`}>
        {fitur.map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
              liteMode ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-400'
            }`}>
              ✓
            </span>
            {f}
          </div>
        ))}
      </div>

      {/* Peringatan kalau mode hemat OFF */}
      {!liteMode && (
        <p className="mt-3 text-[11px] text-slate-400 italic">
          Aktifkan jika aplikasi terasa lambat atau baterai cepat habis.
        </p>
      )}
    </div>
  );
}
