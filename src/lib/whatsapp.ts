// ==============================
// WHATSAPP NOTIFIKASI — via Fonnte API
// fonnte.com — API WA terjangkau untuk Indonesia
// ==============================

const FONNTE_TOKEN = import.meta.env.VITE_FONNTE_TOKEN as string;
const FONNTE_URL   = 'https://api.fonnte.com/send';
const APP_URL      = import.meta.env.VITE_APP_URL ?? 'https://sppg-manager.app';

// ─── Tipe ─────────────────────────────────────────────────────────────────────

export interface SendWAParams {
  /** Format: 628123456789 (tanpa + atau 0 di depan) */
  nomor: string;
  pesan: string;
  /** Delay dalam detik — untuk rate limiting antar pesan */
  delay?: number;
}

export interface SendWAResult {
  sukses: boolean;
  error?: string;
}

// ─── Normalisasi nomor HP ─────────────────────────────────────────────────────

export function normalisasiNomor(hp: string): string {
  // Hapus semua karakter non-digit
  const clean = hp.replace(/\D/g, '');

  // 08xxx → 628xxx
  if (clean.startsWith('0')) return '62' + clean.slice(1);

  // +62xxx → 62xxx
  if (clean.startsWith('62')) return clean;

  // Kalau sudah 10+ digit tanpa 0 di depan, asumsikan sudah benar
  return clean;
}

// ─── Fungsi utama: sendWhatsApp ───────────────────────────────────────────────

export async function sendWhatsApp(params: SendWAParams): Promise<SendWAResult> {
  const { nomor, pesan, delay = 0 } = params;

  if (!FONNTE_TOKEN) {
    console.warn('[WA] VITE_FONNTE_TOKEN belum diset di .env — pesan tidak dikirim.');
    return { sukses: false, error: 'Token Fonnte belum dikonfigurasi.' };
  }

  const nomorBersih = normalisasiNomor(nomor);
  if (nomorBersih.length < 10) {
    return { sukses: false, error: `Nomor tidak valid: ${nomor}` };
  }

  try {
    const body = new URLSearchParams({
      target:  nomorBersih,
      message: pesan,
      ...(delay > 0 ? { delay: String(delay) } : {}),
    });

    const res = await fetch(FONNTE_URL, {
      method: 'POST',
      headers: {
        'Authorization': FONNTE_TOKEN,
        'Content-Type':  'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok || json.status === false) {
      const errMsg = json.reason ?? json.message ?? `HTTP ${res.status}`;
      console.error('[WA] Gagal kirim:', errMsg);
      return { sukses: false, error: errMsg };
    }

    console.info(`[WA] Terkirim ke ${nomorBersih}: ${pesan.substring(0, 40)}...`);
    return { sukses: true };
  } catch (err: any) {
    console.error('[WA] Error jaringan:', err);
    return { sukses: false, error: err?.message ?? 'Gagal menghubungi Fonnte API' };
  }
}

// ─── Template Pesan ───────────────────────────────────────────────────────────

/** Laporan harian belum dikunci lewat jam 14:00 */
export function templateLaporanBelumDikunci(namaKaSPPG: string, namaSPPG: string): string {
  return [
    `⏰ *Reminder Laporan BGN*`,
    ``,
    `Halo *${namaKaSPPG}*, laporan harian SPPG *${namaSPPG}* belum dikunci sampai jam 14.00 hari ini.`,
    ``,
    `📌 Mohon segera dikunci agar saldo VA bisa diproses oleh BGN.`,
    ``,
    `🔗 Buka aplikasi: ${APP_URL}`,
    ``,
    `_Pesan ini dikirim otomatis oleh sistem SPPG Manager._`,
  ].join('\n');
}

/** Stok bahan hampir habis / kritis */
export function templateStokKritis(
  namaUser: string,
  namaBahan: string,
  stokSisa: string,
): string {
  return [
    `⚠️ *Peringatan Stok Kritis!*`,
    ``,
    `Halo *${namaUser}*,`,
    ``,
    `Stok *${namaBahan}* di SPPG Anda tinggal *${stokSisa}*.`,
    ``,
    `📦 Segera rencanakan pembelian agar produksi besok tidak terganggu.`,
    ``,
    `🔗 Cek stok: ${APP_URL}/inventori`,
    ``,
    `_SPPG Manager — Sistem Manajemen Dapur MBG_`,
  ].join('\n');
}

/** Insentif relawan belum dibayar, mendekati jatuh tempo */
export function templateInsentifJatuhTempo(
  namaUser: string,
  jumlahRelawan: number,
  totalInsentif: string,
): string {
  return [
    `📋 *Reminder Insentif Relawan*`,
    ``,
    `Halo *${namaUser}*,`,
    ``,
    `Insentif *${jumlahRelawan} relawan* periode ini sebesar *${totalInsentif}* belum dibayarkan.`,
    ``,
    `⏳ Jatuh tempo *besok*. Segera proses pembayaran.`,
    ``,
    `🔗 Buka halaman insentif: ${APP_URL}/sdm`,
    ``,
    `_SPPG Manager — Sistem Manajemen Dapur MBG_`,
  ].join('\n');
}

/** Sinkronisasi laporan ke BGN gagal */
export function templateSyncGagal(namaUser: string, tanggal: string): string {
  return [
    `❌ *Sinkronisasi BGN Gagal!*`,
    ``,
    `Halo *${namaUser}*,`,
    ``,
    `Sinkronisasi laporan tanggal *${tanggal}* ke sistem BGN gagal.`,
    ``,
    `🔁 Silakan buka aplikasi untuk coba kirim ulang,`,
    `atau unduh PDF untuk diunggah secara manual ke portal BGN.`,
    ``,
    `🔗 Buka aplikasi: ${APP_URL}/laporan`,
    ``,
    `_SPPG Manager — Sistem Manajemen Dapur MBG_`,
  ].join('\n');
}

/** Selamat datang pengguna baru */
export function templateWelcome(namaUser: string, namaSPPG: string): string {
  return [
    `🍱 *Selamat Datang di SPPG Manager!*`,
    ``,
    `Halo *${namaUser}*,`,
    ``,
    `Akun Anda untuk SPPG *${namaSPPG}* sudah aktif dan siap digunakan.`,
    ``,
    `🔗 Login di: ${APP_URL}`,
    ``,
    `💬 Hubungi kami melalui WhatsApp ini jika butuh bantuan.`,
    ``,
    `_Tim SPPG Manager — Solusi Digital Dapur MBG_`,
  ].join('\n');
}

/** Reminder Mingguan Lampiran 30 BGN (Setiap Senin) */
export function templateReminderLampiran30(namaUser: string): string {
  return [
    `📅 *Reminder Laporan Mingguan BGN*`,
    ``,
    `Halo *${namaUser}*, ini adalah pengingat otomatis hari Senin.`,
    ``,
    `Mohon segera persiapkan dan kirimkan *Laporan Mingguan (Lampiran 30)* Anda ke portal resmi SIPGN BGN.`,
    ``,
    `Data rekap dapat diunduh melalui aplikasi.`,
    `🔗 Buka menu Laporan BGN: ${APP_URL}/laporan`,
    ``,
    `_SPPG Manager — Sistem Manajemen Dapur MBG_`,
  ].join('\n');
}

/** Pesan test untuk verifikasi konfigurasi */
export function templateTest(namaUser: string): string {
  return [
    `✅ *Test Notifikasi SPPG Manager*`,
    ``,
    `Halo *${namaUser}*!`,
    ``,
    `Notifikasi WhatsApp Anda sudah terhubung dengan benar. 🎉`,
    `Anda akan menerima pesan penting dari sistem SPPG Manager di nomor ini.`,
    ``,
    `_SPPG Manager — Sistem Manajemen Dapur MBG_`,
  ].join('\n');
}
