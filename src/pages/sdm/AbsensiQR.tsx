/**
 * AbsensiQR.tsx
 * Sistem Absensi QR Code — SPPG Manager
 * - Tab 1: Scanner kamera (BarcodeDetector API, native Chrome/Edge)
 * - Tab 2: Kelola & Cetak Kartu QR per relawan
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { QrCode, Camera, CameraOff, Printer, CheckCircle2, Clock, Users, X, RefreshCw, Download } from 'lucide-react';
import { toast } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';

// ─── Tipe Data ────────────────────────────────────────────────────────────────
interface RelawanQR {
  id: string;
  nama: string;
  jabatan: string;
  area: string;
}

interface LogAbsensi {
  id: string;
  nama: string;
  jabatan: string;
  jam: string; // HH:MM
  timestamp: number;
}

// ─── Data Mock (akan diganti dengan Supabase) ────────────────────────────────
const MOCK_RELAWAN: RelawanQR[] = [
  { id: 'RLW-001', nama: 'Siti Rahayu',    jabatan: 'Jurutama Masak',   area: 'Dapur Utama'  },
  { id: 'RLW-002', nama: 'Budi Santoso',   jabatan: 'Asisten Lapangan', area: 'Distribusi'   },
  { id: 'RLW-003', nama: 'Rina Marlina',   jabatan: 'Pengawas Gizi',    area: 'QC'           },
  { id: 'RLW-004', nama: 'Agus Setiawan',  jabatan: 'Driver',           area: 'Distribusi'   },
  { id: 'RLW-005', nama: 'Dewi Lestari',   jabatan: 'Asisten Lapangan', area: 'Packing'      },
  { id: 'RLW-006', nama: 'Hendra Gunawan', jabatan: 'Jurutama Masak',   area: 'Dapur Utama'  },
];

// Warna avatar deterministik
const AV_COLORS = ['#3b82f6','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444'];
function avColor(id: string) { let h = 0; for (const c of id) h = c.charCodeAt(0) + ((h << 5) - h); return AV_COLORS[Math.abs(h) % AV_COLORS.length]; }
function inisial(nama: string) { return nama.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase(); }

// URL QR Image (bebas internet, tidak perlu library)
function qrUrl(data: string, size = 180) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&format=png&ecc=M&margin=10`;
}

// Payload yang di-encode ke QR
function encodeQR(r: RelawanQR) {
  return JSON.stringify({ sppg_qr: true, id: r.id, nama: r.nama, jabatan: r.jabatan });
}

// ─── Komponen Kartu QR ────────────────────────────────────────────────────────
function KartuQR({ r, sppgNama }: { r: RelawanQR; sppgNama: string }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-blue-100 p-4 flex flex-col items-center gap-2 shadow-sm print:shadow-none print:border-gray-300">
      {/* Header SPPG */}
      <div className="text-center w-full border-b border-blue-50 pb-2 mb-1">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SPPG MANAGER</p>
        <p className="text-[10px] font-semibold text-slate-600 truncate">{sppgNama}</p>
      </div>

      {/* Avatar */}
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow"
        style={{ background: avColor(r.id) }}>
        {inisial(r.nama)}
      </div>

      {/* Nama */}
      <div className="text-center">
        <p className="text-sm font-bold text-slate-800 leading-tight">{r.nama}</p>
        <p className="text-[10px] text-blue-600 font-semibold mt-0.5">{r.jabatan}</p>
        <p className="text-[9px] text-slate-400">{r.area}</p>
      </div>

      {/* QR Code */}
      <div className="p-2 border-2 border-blue-100 rounded-xl bg-white">
        <img
          src={qrUrl(encodeQR(r))}
          alt={`QR ${r.nama}`}
          width={100} height={100}
          className="block"
          onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text y="50" x="10" font-size="10">QR Error</text></svg>'; }}
        />
      </div>

      {/* ID */}
      <p className="text-[9px] text-slate-400 font-mono">{r.id}</p>
    </div>
  );
}

// ─── Tab: Kelola Kartu QR ────────────────────────────────────────────────────
function TabKartuQR() {
  const sppg = useAuthStore(s => s.sppg);
  const sppgNama = sppg?.nama || 'SPPG';
  const [selected, setSelected] = useState<Set<string>>(new Set(MOCK_RELAWAN.map(r => r.id)));

  const toggleAll = () => {
    if (selected.size === MOCK_RELAWAN.length) setSelected(new Set());
    else setSelected(new Set(MOCK_RELAWAN.map(r => r.id)));
  };

  const handleCetak = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-800">Kartu QR Relawan</h2>
          <p className="text-xs text-slate-500">Cetak & bagikan ke masing-masing relawan untuk absensi mandiri</p>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleAll} className="btn-ghost text-xs flex items-center gap-1.5">
            {selected.size === MOCK_RELAWAN.length ? 'Batal Pilih' : 'Pilih Semua'}
          </button>
          <button onClick={handleCetak} className="btn-primary text-sm flex items-center gap-2">
            <Printer size={15}/> Cetak Kartu ({selected.size})
          </button>
        </div>
      </div>

      {/* Grid Kartu */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 print:grid-cols-4">
        {MOCK_RELAWAN.map(r => (
          <div key={r.id} className="relative group cursor-pointer" onClick={() => {
            const s = new Set(selected);
            s.has(r.id) ? s.delete(r.id) : s.add(r.id);
            setSelected(s);
          }}>
            {/* Checkbox overlay */}
            <div className={`absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              selected.has(r.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
            }`}>
              {selected.has(r.id) && <CheckCircle2 size={12} className="text-white"/>}
            </div>

            <div className={`transition-all ${selected.has(r.id) ? 'ring-2 ring-blue-500 ring-offset-2 rounded-2xl' : 'opacity-60 group-hover:opacity-80'}`}>
              <KartuQR r={r} sppgNama={sppgNama} />
            </div>
          </div>
        ))}
      </div>

      {/* Petunjuk cetak */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 space-y-1">
        <p className="font-bold">📖 Cara Penggunaan Kartu QR:</p>
        <ol className="list-decimal list-inside space-y-1 text-blue-700">
          <li>Cetak kartu (ukuran ID Card atau A6)</li>
          <li>Laminating agar tahan lama (opsional)</li>
          <li>Setiap relawan simpan kartu masing-masing</li>
          <li>Saat masuk dapur → scan kartu di tablet SPPG</li>
          <li>Sistem otomatis catat nama + jam masuk</li>
        </ol>
      </div>
    </div>
  );
}

// ─── Tab: Scanner QR ─────────────────────────────────────────────────────────
function TabScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const rafRef = useRef<number>(0);

  const [cameraOn, setCameraOn] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null); // debounce
  const [log, setLog] = useState<LogAbsensi[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSupportor, setHasSupport] = useState(true);

  // Cek dukungan BarcodeDetector
  useEffect(() => {
    if (!('BarcodeDetector' in window)) {
      setHasSupport(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  const processQR = useCallback((raw: string) => {
    // Debounce: jangan proses scan yang sama dalam 3 detik
    if (raw === lastScan) return;
    setLastScan(raw);
    setTimeout(() => setLastScan(null), 3000);

    try {
      const data = JSON.parse(raw);
      if (!data.sppg_qr || !data.id || !data.nama) {
        toast.error('QR tidak valid', 'Pastikan menggunakan kartu QR resmi SPPG Manager.');
        return;
      }

      // Cek apakah sudah scan hari ini
      const alreadyIn = log.find(l => l.id === data.id);
      if (alreadyIn) {
        toast.peringatan(`${data.nama} sudah absen`, `Jam masuk: ${alreadyIn.jam}`);
        return;
      }

      const now = new Date();
      const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      const entry: LogAbsensi = {
        id: data.id,
        nama: data.nama,
        jabatan: data.jabatan,
        jam,
        timestamp: now.getTime(),
      };

      setLog(prev => [entry, ...prev]);
      toast.sukses(`✅ ${data.nama} — Hadir`, `Jam masuk: ${jam}`);

      // TODO: Save ke Supabase (useAbsensi hook)

    } catch {
      toast.error('Format QR tidak dikenali');
    }
  }, [log, lastScan]);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);

      // Setup BarcodeDetector
      if ('BarcodeDetector' in window) {
        detectorRef.current = new (window as any).BarcodeDetector({ formats: ['qr_code'] });

        const scan = async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) {
            rafRef.current = requestAnimationFrame(scan);
            return;
          }
          try {
            const codes = await detectorRef.current.detect(videoRef.current);
            if (codes.length > 0) {
              processQR(codes[0].rawValue);
            }
          } catch { /* skip frame errors */ }
          rafRef.current = requestAnimationFrame(scan);
        };
        scan();
      }
    } catch (e: any) {
      setError(e.message?.includes('Permission') ? 'Izin kamera ditolak. Buka pengaturan browser dan izinkan akses kamera.' : 'Kamera tidak dapat dibuka. Pastikan tidak sedang digunakan aplikasi lain.');
    }
  }, [processQR]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-800">Scanner Absensi QR</h2>
          <p className="text-xs text-slate-500">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
            {log.length} hadir
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
            {MOCK_RELAWAN.length - log.length} belum
          </span>
        </div>
      </div>

      {/* Cek dukungan browser */}
      {!hasSupportor && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <p className="font-bold mb-1">⚠ Browser Anda belum mendukung QR Scanner</p>
          <p>Gunakan <strong>Google Chrome</strong> atau <strong>Microsoft Edge</strong> versi terbaru di tablet/HP untuk menggunakan fitur ini.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Kamera */}
        <div className="space-y-3">
          <div className="relative aspect-square md:aspect-video rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center border-2 border-slate-700">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

            {!cameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
                  <Camera size={28} className="text-slate-400"/>
                </div>
                <p className="text-slate-400 text-sm">Kamera belum aktif</p>
              </div>
            )}

            {/* Viewfinder overlay */}
            {cameraOn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 relative">
                  {/* Corner marks */}
                  {[['top-0 left-0','border-t-4 border-l-4'],['top-0 right-0','border-t-4 border-r-4'],['bottom-0 left-0','border-b-4 border-l-4'],['bottom-0 right-0','border-b-4 border-r-4']].map(([pos, cls], i) => (
                    <div key={i} className={`absolute w-8 h-8 ${pos} ${cls} border-blue-400 rounded-sm`} />
                  ))}
                  {/* Scan line */}
                  <div className="absolute left-4 right-4 h-0.5 bg-blue-400/70 animate-pulse" style={{ top: '50%' }}/>
                </div>
                <p className="absolute bottom-4 text-xs text-white/70 bg-black/40 px-3 py-1 rounded-full">Arahkan QR ke kotak ini</p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            {!cameraOn ? (
              <button onClick={startCamera} disabled={!hasSupportor} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Camera size={16}/> Aktifkan Kamera
              </button>
            ) : (
              <button onClick={stopCamera} className="btn-ghost flex-1 flex items-center justify-center gap-2 border border-rose-200 text-rose-600 hover:bg-rose-50">
                <CameraOff size={16}/> Matikan Kamera
              </button>
            )}
          </div>
        </div>

        {/* Log Kehadiran */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Users size={14}/> Log Kehadiran Hari Ini
            </p>
            {log.length > 0 && (
              <button onClick={() => { if (confirm('Reset log hari ini?')) setLog([]); }} className="text-xs text-rose-500 hover:underline flex items-center gap-1">
                <RefreshCw size={11}/> Reset
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {log.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <QrCode size={32} className="mx-auto mb-2 opacity-30"/>
                <p className="text-sm">Belum ada relawan yang scan</p>
                <p className="text-xs mt-1">Aktifkan kamera lalu minta relawan scan kartu QR-nya</p>
              </div>
            ) : (
              log.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl animate-fade-in">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: avColor(entry.id) }}>
                    {inisial(entry.nama)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{entry.nama}</p>
                    <p className="text-xs text-slate-500">{entry.jabatan}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-mono font-bold text-emerald-700">{entry.jam}</p>
                    <CheckCircle2 size={14} className="text-emerald-500 ml-auto mt-0.5"/>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Relawan belum hadir */}
          {log.length > 0 && log.length < MOCK_RELAWAN.length && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-500 mb-2">Belum hadir:</p>
              <div className="space-y-1">
                {MOCK_RELAWAN.filter(r => !log.find(l => l.id === r.id)).map(r => (
                  <div key={r.id} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                    <Clock size={12} className="text-amber-500"/>
                    <span>{r.nama}</span>
                    <span className="text-slate-400">— {r.jabatan}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Petunjuk penggunaan */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
        <p className="font-bold text-slate-700">💡 Tips Penggunaan:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Letakkan tablet ini di pintu masuk dapur saat shift mulai</li>
          <li>Pastikan pencahayaan cukup agar kamera bisa membaca QR</li>
          <li>Jarak scan ideal: 10–20 cm dari kartu</li>
          <li>Relawan yang terlambat tetap bisa scan (jam masuk tetap tercatat)</li>
          <li>Relawan izin/sakit → input manual oleh supervisor di tab Absensi</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Halaman Utama ────────────────────────────────────────────────────────────
export default function AbsensiQR() {
  const [tab, setTab] = useState<'scanner' | 'kartu'>('scanner');

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-xl font-semibold text-slate-900 flex items-center gap-2">
            <QrCode size={22} className="text-blue-600"/> Absensi QR Code
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Scan kartu QR relawan untuk mencatat kehadiran otomatis — tanpa alat tambahan
          </p>
        </div>
      </div>

      {/* Tab */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl mb-6 w-fit">
        {[
          { id: 'scanner', label: '📷 Scanner Kamera', icon: Camera },
          { id: 'kartu',   label: '🪪 Kelola Kartu QR', icon: QrCode },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'scanner' && <TabScanner />}
      {tab === 'kartu'   && <TabKartuQR />}
    </div>
  );
}
