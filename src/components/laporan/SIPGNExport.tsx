import { useState, useEffect } from 'react';
import {
  eksporLaporanHarianSIPGN,
  eksporLaporanKeuanganSIPGN,
  generateSIPGNPackage,
  getRiwayatEkspor,
  tandaiDiunggah,
  type RiwayatEkspor,
} from '@/lib/sipgn-bridge';
import { useAuthStore } from '@/store/authStore';

interface SIPGNExportProps {
  laporanId?: string;
  sppgId?: string;
  /** Jika disediakan, hanya ekspor laporan harian ini */
  modeHarian?: boolean;
}

export default function SIPGNExport({ laporanId, sppgId, modeHarian = false }: SIPGNExportProps) {
  const { user } = useAuthStore();
  const resolvedSppgId = sppgId || user?.sppg_id || 'SPPG-DEFAULT';
  const resolvedLaporanId = laporanId || 'laporan-hari-ini';

  const now = new Date();
  const bulan = now.getMonth() + 1;
  const tahun = now.getFullYear();
  const bulanStr = String(bulan).padStart(2, '0');
  const tanggalMulai = `${tahun}-${bulanStr}-01`;
  const tanggalSelesai = new Date(tahun, bulan, 0).toISOString().split('T')[0];

  const [loading, setLoading] = useState<string | null>(null);
  const [riwayat, setRiwayat] = useState<RiwayatEkspor[]>([]);

  const muatRiwayat = () => setRiwayat(getRiwayatEkspor());

  useEffect(() => {
    muatRiwayat();
  }, []);

  const terakhirEkspor = riwayat[0];

  async function handle(key: string, fn: () => Promise<void>) {
    setLoading(key);
    try {
      await fn();
      muatRiwayat();
    } catch (e: any) {
      alert(`❌ Gagal ekspor: ${e?.message || 'Terjadi kesalahan'}`);
    } finally {
      setLoading(null);
    }
  }

  function handleTandaiDiunggah(id: string) {
    tandaiDiunggah(id);
    muatRiwayat();
  }

  const Spinner = () => (
    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
  );

  return (
    <div className="card border border-blue-200 bg-gradient-to-br from-blue-50 to-white overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-blue-100 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 text-base">Ekspor ke SIPGN BGN</h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            BGN mengizinkan pelaporan melalui SIPGN. Ekspor data dari sini untuk diunggah ke portal resmi.
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Info Banner */}
        <div className="flex items-start gap-3 bg-blue-600 text-white rounded-xl p-4 text-sm">
          <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="leading-relaxed">
            Setelah download, login ke <strong>sipgn.bgn.go.id</strong> dan upload file yang sudah didownload.
            Atau tanyakan ke koordinator BGN Anda tentang cara sinkronisasi otomatis.
          </p>
        </div>

        {/* Status terakhir ekspor */}
        <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
          <span className="font-medium">Status Ekspor Terakhir:</span>
          {terakhirEkspor ? (
            <span className="text-slate-700 font-semibold">
              {new Date(terakhirEkspor.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : (
            <span className="text-slate-400 italic">Belum pernah ekspor</span>
          )}
        </div>

        {/* Tombol Aksi */}
        <div className={`grid gap-3 ${modeHarian ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'}`}>
          {/* Tombol 1: Laporan Harian */}
          <button
            onClick={() => handle('harian', () => eksporLaporanHarianSIPGN(resolvedLaporanId))}
            disabled={loading !== null}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'harian' ? <Spinner /> : <span>📤</span>}
            Ekspor Laporan Hari Ini
          </button>

          {!modeHarian && (
            <>
              {/* Tombol 2: Paket Bulanan */}
              <button
                onClick={() => handle('paket', () => generateSIPGNPackage(resolvedSppgId, tanggalMulai, tanggalSelesai))}
                disabled={loading !== null}
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold bg-white border-2 border-purple-200 text-purple-700 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'paket' ? <Spinner /> : <span>📦</span>}
                Ekspor Paket Bulanan
              </button>

              {/* Tombol 3: Keuangan Excel */}
              <button
                onClick={() => handle('excel', () => eksporLaporanKeuanganSIPGN(resolvedSppgId, bulan, tahun))}
                disabled={loading !== null}
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold bg-white border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'excel' ? <Spinner /> : <span>📊</span>}
                Keuangan Bulanan (Excel)
              </button>
            </>
          )}
        </div>

        {/* Riwayat Ekspor */}
        {riwayat.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Riwayat Ekspor</p>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-3 py-2 text-slate-500 font-semibold">Tanggal</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-semibold">Jenis</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-semibold hidden sm:table-cell">Berkas</th>
                    <th className="text-center px-3 py-2 text-slate-500 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {riwayat.slice(0, 8).map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium text-[10px] ${
                          item.jenis === 'laporan_harian' ? 'bg-blue-100 text-blue-700' :
                          item.jenis === 'keuangan_bulanan' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {item.jenis === 'laporan_harian' ? '📤 Harian' :
                           item.jenis === 'keuangan_bulanan' ? '📊 Keuangan' : '📦 Paket'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-400 font-mono truncate max-w-[160px] hidden sm:table-cell" title={item.berkas}>
                        {item.berkas}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {item.status === 'diunggah' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            ✓ Diunggah
                          </span>
                        ) : (
                          <button
                            onClick={() => handleTandaiDiunggah(item.id)}
                            className="text-[10px] font-semibold text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full transition-colors border border-amber-200 whitespace-nowrap"
                          >
                            Tandai Diunggah
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
