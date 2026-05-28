// ==============================
// NOTIFICATION SCHEDULER
// Penjadwal notifikasi WA berbasis kondisi (frontend-driven)
// Dipanggil saat: app dibuka + setiap kali Dashboard dimuat
// ==============================

import { supabase } from '@/lib/supabase';
import {
  sendWhatsApp,
  normalisasiNomor,
  templateLaporanBelumDikunci,
  templateStokKritis,
  templateInsentifJatuhTempo,
  templateReminderLampiran30,
} from '@/lib/whatsapp';

// ─── Konstanta ────────────────────────────────────────────────────────────────

// Key localStorage untuk de-duplikasi notifikasi
const KEY_NOTIF_LAPORAN = (sppgId: string, tanggal: string) =>
  `notif_laporan_${sppgId}_${tanggal}`;
const KEY_NOTIF_STOK = (sppgId: string, tanggal: string) =>
  `notif_stok_${sppgId}_${tanggal}`;
const KEY_NOTIF_INSENTIF = (sppgId: string, periode: string) =>
  `notif_insentif_${sppgId}_${periode}`;

const TODAY = () => new Date().toISOString().split('T')[0];

// ─── Helper: sudah kirim notif hari ini? ─────────────────────────────────────

function sudahKirimHariIni(key: string): boolean {
  try {
    return localStorage.getItem(key) === 'sent';
  } catch {
    return false;
  }
}

function tandaiSudahKirim(key: string): void {
  try {
    localStorage.setItem(key, 'sent');
  } catch {}
}

// ─── Role-to-notification mapping: hanya role ini yang menerima notif ini ────
// Prinsip: staf dapur TIDAK menerima notif keuangan/laporan BGN
export const NOTIF_ROLE_MAP = {
  laporan_belum_dikunci:  ['owner', 'kasppg', 'pengawas_keuangan'] as const,
  stok_kritis:            ['owner', 'kasppg', 'pengawas_keuangan'] as const,
  insentif_jatuh_tempo:   ['owner', 'kasppg', 'pengawas_keuangan'] as const,
  reminder_lampiran_30:   ['owner', 'kasppg', 'bgn_coord'] as const,
} as const;

// Helper: ambil nomor HP dari beberapa role, return array unik
async function getNoHpByRoles(
  sppgId: string,
  roles: readonly string[],
): Promise<string[]> {
  const results = await Promise.all(
    roles.map(r => getNomorHPByRole(sppgId, r as 'owner' | 'kasppg' | 'pengawas_keuangan'))
  );
  return [...new Set(results.filter(Boolean) as string[])];
}

async function getNomorHPByRole(
  sppgId: string,
  role: 'owner' | 'kasppg' | 'pengawas_keuangan',
): Promise<string | null> {
  const { data } = await supabase
    .from('users')
    .select('no_hp, nama')
    .eq('sppg_id', sppgId)
    .eq('role', role)
    .eq('aktif', true)
    .limit(1)
    .single();

  return data?.no_hp ?? null;
}

// ─── Helper: format rupiah ────────────────────────────────────────────────────

function fmtRupiah(n: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

// ─── Hasil check tiap kondisi ─────────────────────────────────────────────────

export interface NotifCheckResult {
  cek: string;
  status: 'terkirim' | 'dilewati' | 'gagal' | 'tidak_perlu';
  detail?: string;
}

// ─── FUNGSI UTAMA: checkAndSendPendingNotifications ──────────────────────────

export async function checkAndSendPendingNotifications(
  sppgId: string,
): Promise<NotifCheckResult[]> {
  const hasil: NotifCheckResult[] = [];
  const tanggalHari = TODAY();

  // Baca preferensi notif dari localStorage
  const prefs = getNotifPrefs();

  // ── CHECK 1: Laporan Harian Belum Dikunci ──────────────────────────────────
  if (prefs.laporan_belum_dikunci) {
    const jamSekarang = new Date().getHours();

    if (jamSekarang >= 14) {
      const keyLaporan = KEY_NOTIF_LAPORAN(sppgId, tanggalHari);

      if (sudahKirimHariIni(keyLaporan)) {
        hasil.push({ cek: 'laporan_dikunci', status: 'dilewati', detail: 'Sudah dikirim hari ini' });
      } else {
        // Cek apakah laporan hari ini sudah dikunci
        const { data: laporan } = await supabase
          .from('laporan_harian')
          .select('id, status')
          .eq('sppg_id', sppgId)
          .eq('tanggal', tanggalHari)
          .single();

        const belumDikunci = !laporan || laporan.status !== 'dikunci';

        if (belumDikunci) {
          // Hanya kirim ke role manajemen — BUKAN jurutama masak / driver
          const nomors = await getNoHpByRoles(sppgId, NOTIF_ROLE_MAP.laporan_belum_dikunci);

          const { data: sppgData } = await supabase.from('sppg').select('nama').eq('id', sppgId).single();
          const namaSPPG = sppgData?.nama ?? 'SPPG';

          let terkirim = false;
          for (const noHp of nomors) {
            const pesan = templateLaporanBelumDikunci('Ka.SPPG', namaSPPG);
            const res = await sendWhatsApp({ nomor: noHp, pesan, delay: 2 });
            if (res.sukses) terkirim = true;
          }

          if (terkirim) {
            tandaiSudahKirim(keyLaporan);
            hasil.push({ cek: 'laporan_dikunci', status: 'terkirim', detail: `Reminder laporan ${tanggalHari} dikirim` });
          } else {
            hasil.push({ cek: 'laporan_dikunci', status: 'gagal', detail: 'Gagal kirim WA' });
          }
        } else {
          hasil.push({ cek: 'laporan_dikunci', status: 'tidak_perlu', detail: 'Laporan sudah dikunci' });
        }
      }
    } else {
      hasil.push({ cek: 'laporan_dikunci', status: 'tidak_perlu', detail: `Belum jam 14:00 (sekarang: ${jamSekarang}:xx)` });
    }
  }

  // ── CHECK 2: Stok Kritis ──────────────────────────────────────────────────

  if (prefs.stok_kritis) {
    const keyStok = KEY_NOTIF_STOK(sppgId, tanggalHari);

    if (sudahKirimHariIni(keyStok)) {
      hasil.push({ cek: 'stok_kritis', status: 'dilewati', detail: 'Sudah dikirim hari ini' });
    } else {
      // Query stok yang kritis (stok_akhir <= min_stok)
      const { data: stokKritis } = await supabase
        .from('stok_bahan')
        .select('id, nama, stok_akhir, min_stok, satuan')
        .eq('sppg_id', sppgId)
        .filter('stok_akhir', 'lte', 'min_stok');

      if (stokKritis && stokKritis.length > 0) {
        const bahankritis = stokKritis.slice(0, 3);
        const listBahan = bahankritis
          .map(b => `• ${b.nama}: sisa ${b.stok_akhir} ${b.satuan}`)
          .join('\n');

        // Hanya kirim ke pengawas keuangan & owner — BUKAN staf dapur
        const nomorsStok = await getNoHpByRoles(sppgId, NOTIF_ROLE_MAP.stok_kritis);

        const pesan = templateStokKritis(
          'Tim SPPG',
          bahankritis.length === 1 ? bahankritis[0].nama : `${bahankritis.length} bahan`,
          stokKritis.length === 1
            ? `${stokKritis[0].stok_akhir} ${stokKritis[0].satuan}`
            : `\n${listBahan}`,
        );

        let terkirim = false;
        for (const noHp of nomorsStok) {
          const res = await sendWhatsApp({ nomor: noHp, pesan, delay: 3 });
          if (res.sukses) terkirim = true;
        }

        if (terkirim) {
          tandaiSudahKirim(keyStok);
          hasil.push({ cek: 'stok_kritis', status: 'terkirim', detail: `${stokKritis.length} item stok kritis dikirim` });
        } else {
          hasil.push({ cek: 'stok_kritis', status: 'gagal' });
        }
      } else {
        hasil.push({ cek: 'stok_kritis', status: 'tidak_perlu', detail: 'Semua stok aman' });
      }
    }
  }

  // ── CHECK 3: Insentif Jatuh Tempo (H-1 sebelum akhir periode) ────────────

  if (prefs.insentif_jatuh_tempo) {
    const now = new Date();
    const akhirBulan = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const akhirPeriode1 = 15;
    const akhirPeriode2 = akhirBulan;
    const tanggalHari2 = now.getDate();

    // H-1 sebelum akhir periode setengah bulan
    const isJatuhTempo =
      tanggalHari2 === akhirPeriode1 - 1 ||
      tanggalHari2 === akhirPeriode2 - 1;

    if (!isJatuhTempo) {
      hasil.push({ cek: 'insentif_jatuh_tempo', status: 'tidak_perlu', detail: 'Bukan H-1 jatuh tempo' });
    } else {
      const periodeStr = tanggalHari2 < 15
        ? `${now.getFullYear()}-${now.getMonth() + 1}-1`
        : `${now.getFullYear()}-${now.getMonth() + 1}-2`;

      const keyInsentif = KEY_NOTIF_INSENTIF(sppgId, periodeStr);

      if (sudahKirimHariIni(keyInsentif)) {
        hasil.push({ cek: 'insentif_jatuh_tempo', status: 'dilewati' });
      } else {
        // Query insentif yang belum dibayar
        const periodeStart = tanggalHari2 < 15
          ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
          : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-16`;
        const periodeEnd = tanggalHari2 < 15
          ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-15`
          : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${akhirBulan}`;

        const { data: insentif } = await supabase
          .from('insentif_relawan')
          .select('id, jumlah')
          .eq('sppg_id', sppgId)
          .eq('sudah_dibayar', false)
          .gte('tanggal', periodeStart)
          .lte('tanggal', periodeEnd);

        if (insentif && insentif.length > 0) {
          const total = insentif.reduce((acc, i) => acc + (i.jumlah ?? 0), 0);
          const noHp = await getNomorHPByRole(sppgId, 'pengawas_keuangan')
            ?? await getNomorHPByRole(sppgId, 'owner');

          if (noHp) {
            const pesan = templateInsentifJatuhTempo('Tim SPPG', insentif.length, fmtRupiah(total));
            const res = await sendWhatsApp({ nomor: noHp, pesan, delay: 4 });

            if (res.sukses) {
              tandaiSudahKirim(keyInsentif);
              hasil.push({ cek: 'insentif_jatuh_tempo', status: 'terkirim', detail: `${insentif.length} relawan, ${fmtRupiah(total)}` });
            } else {
              hasil.push({ cek: 'insentif_jatuh_tempo', status: 'gagal' });
            }
          } else {
            hasil.push({ cek: 'insentif_jatuh_tempo', status: 'gagal', detail: 'Nomor HP tidak ditemukan' });
          }
        } else {
          hasil.push({ cek: 'insentif_jatuh_tempo', status: 'tidak_perlu', detail: 'Semua insentif sudah dibayar' });
        }
      }
    }
  }

  // ── CHECK 4: Reminder Lampiran 30 (Setiap Hari Senin) ────────────────────

  if (prefs.reminder_lampiran_30) {
    const isSenin = new Date().getDay() === 1; // 0 = Minggu, 1 = Senin
    
    if (isSenin) {
      const keyLampiran = `notif_lampiran30_${sppgId}_${tanggalHari}`;
      
      if (sudahKirimHariIni(keyLampiran)) {
        hasil.push({ cek: 'reminder_lampiran_30', status: 'dilewati' });
      } else {
        const noHpKa = await getNomorHPByRole(sppgId, 'kasppg') ?? await getNomorHPByRole(sppgId, 'owner');
        
        if (noHpKa) {
          const pesan = templateReminderLampiran30('Ka.SPPG / Owner');
          const res = await sendWhatsApp({ nomor: noHpKa, pesan, delay: 5 });
          
          if (res.sukses) {
            tandaiSudahKirim(keyLampiran);
            hasil.push({ cek: 'reminder_lampiran_30', status: 'terkirim', detail: 'Pengingat Senin terkirim' });
          } else {
            hasil.push({ cek: 'reminder_lampiran_30', status: 'gagal' });
          }
        } else {
          hasil.push({ cek: 'reminder_lampiran_30', status: 'gagal', detail: 'Nomor HP tidak ditemukan' });
        }
      }
    } else {
      hasil.push({ cek: 'reminder_lampiran_30', status: 'tidak_perlu', detail: 'Bukan hari Senin' });
    }
  }

  return hasil;
}

// ─── Preferensi Notifikasi ────────────────────────────────────────────────────

export interface NotifPrefs {
  laporan_belum_dikunci:  boolean;
  stok_kritis:            boolean;
  insentif_jatuh_tempo:   boolean;
  sync_gagal:             boolean;
  laporan_berhasil:       boolean;
  reminder_lampiran_30:   boolean;
  nomor_tambahan:         string;
}

const DEFAULT_PREFS: NotifPrefs = {
  laporan_belum_dikunci:  true,
  stok_kritis:            true,
  insentif_jatuh_tempo:   true,
  sync_gagal:             true,
  laporan_berhasil:       false,
  reminder_lampiran_30:   true,
  nomor_tambahan:         '',
};

const KEY_PREFS = 'sppg_notif_prefs';

export function getNotifPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(KEY_PREFS);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function saveNotifPrefs(prefs: NotifPrefs): void {
  try {
    localStorage.setItem(KEY_PREFS, JSON.stringify(prefs));
  } catch {}
}
