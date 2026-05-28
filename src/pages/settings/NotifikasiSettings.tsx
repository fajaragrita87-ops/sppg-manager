// ==============================
// NOTIFIKASI SETTINGS — Komponen panel pengaturan WA
// Ditambahkan sebagai tab baru di halaman Pengaturan
// ==============================

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  sendWhatsApp, normalisasiNomor, templateTest, templateReminderLampiran30
} from '@/lib/whatsapp';
import {
  getNotifPrefs, saveNotifPrefs, type NotifPrefs,
} from '@/lib/notification-scheduler';
import { toast } from '@/store/toastStore';
import { MessageSquare, Send, CheckCircle2, Phone, Info } from 'lucide-react';

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({
  checked, onChange, disabled = false,
}: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 disabled:opacity-40 ${
        checked ? 'bg-green-500 border-green-500' : 'bg-slate-200 border-slate-300'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// ─── Baris item toggle ────────────────────────────────────────────────────────

function NotifToggleRow({
  label, desc, checked, onChange,
}: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-slate-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────

export default function NotifikasiSettings() {
  const { user } = useAuthStore();
  const [prefs, setPrefs] = useState<NotifPrefs>(getNotifPrefs());
  const [nomorHP, setNomorHP] = useState(user?.no_hp ?? '');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [jenisTest, setJenisTest] = useState<'koneksi' | 'lampiran30'>('koneksi');

  // Simpan perubahan ke localStorage setiap kali prefs berubah
  useEffect(() => {
    saveNotifPrefs(prefs);
  }, [prefs]);

  const setField = <K extends keyof NotifPrefs>(key: K, val: NotifPrefs[K]) => {
    setPrefs(p => ({ ...p, [key]: val }));
  };

  const handleKirimTest = async () => {
    const noTarget = nomorHP || prefs.nomor_tambahan;
    if (!noTarget) {
      toast.error('Nomor HP kosong', 'Isi nomor HP di profil atau nomor tambahan terlebih dahulu.');
      return;
    }

    const nomorBersih = normalisasiNomor(noTarget);
    if (nomorBersih.length < 10) {
      toast.error('Nomor tidak valid', `Format: 628123456789 (tanpa +)`);
      return;
    }

    setIsSendingTest(true);
    setTestStatus('idle');

    let pesan = '';
    if (jenisTest === 'lampiran30') {
      pesan = templateReminderLampiran30(user?.nama ?? 'Pengguna');
    } else {
      pesan = templateTest(user?.nama ?? 'Pengguna');
    }

    const res = await sendWhatsApp({ nomor: nomorBersih, pesan });

    setIsSendingTest(false);
    if (res.sukses) {
      setTestStatus('success');
      toast.sukses(`Pesan ${jenisTest === 'lampiran30' ? 'Reminder Laporan' : 'Test'} terkirim! 🎉`, `Cek WhatsApp di nomor ${nomorBersih}`);
    } else {
      setTestStatus('failed');
      toast.error('Gagal kirim test WA', res.error ?? 'Cek token Fonnte di .env');
    }
  };

  // Apakah token Fonnte sudah diset?
  const isTokenSet = Boolean(import.meta.env.VITE_FONNTE_TOKEN);

  return (
    <div className="space-y-5">

      {/* ── Banner Token Belum Diset ── */}
      {!isTokenSet && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
          <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Token Fonnte belum dikonfigurasi</p>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              Tambahkan <code className="bg-amber-100 px-1 rounded">VITE_FONNTE_TOKEN=your_token</code> di file{' '}
              <code className="bg-amber-100 px-1 rounded">.env</code> lalu restart server.{' '}
              Daftar token di <a href="https://fonnte.com" target="_blank" rel="noopener noreferrer" className="underline font-bold">fonnte.com</a>.
            </p>
          </div>
        </div>
      )}

      {/* ── Card: Nomor HP Pengguna ── */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Phone size={16} className="text-green-600" />
          <h3 className="font-bold text-slate-800 text-sm">Nomor WhatsApp Penerima</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label">Nomor HP Anda (dari profil)</label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={nomorHP}
                onChange={e => setNomorHP(e.target.value)}
                placeholder="08123456789 atau 628123456789"
                className="input flex-1 text-sm"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Format: 08xxx atau 628xxx (tanpa + atau spasi). Notifikasi utama dikirim ke nomor ini.
            </p>
          </div>

          <div>
            <label className="label">Kirim Juga ke Nomor Tambahan</label>
            <input
              type="tel"
              value={prefs.nomor_tambahan}
              onChange={e => setField('nomor_tambahan', e.target.value)}
              placeholder="Mis: nomor HP Ketua Yayasan"
              className="input w-full text-sm"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Berguna jika owner yayasan ingin menerima notifikasi meski tidak login setiap hari.
            </p>
          </div>
        </div>
      </div>

      {/* ── Card: Toggle per Jenis Notifikasi ── */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare size={16} className="text-green-600" />
          <h3 className="font-bold text-slate-800 text-sm">Pemberitahuan WhatsApp</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4 pb-4 border-b border-slate-100">
          Pilih jenis notifikasi yang ingin Anda terima secara otomatis.
        </p>

        <div>
          <NotifToggleRow
            label="⏰ Laporan harian belum dikunci"
            desc="Reminder jam 14:00 jika laporan hari ini belum dikunci dan dikirim ke BGN."
            checked={prefs.laporan_belum_dikunci}
            onChange={v => setField('laporan_belum_dikunci', v)}
          />
          <NotifToggleRow
            label="📦 Stok bahan hampir habis"
            desc="Alert saat stok bahan turun di bawah batas minimum yang ditetapkan."
            checked={prefs.stok_kritis}
            onChange={v => setField('stok_kritis', v)}
          />
          <NotifToggleRow
            label="💰 Insentif relawan jatuh tempo"
            desc="Reminder H-1 sebelum akhir periode jika ada insentif yang belum dibayarkan."
            checked={prefs.insentif_jatuh_tempo}
            onChange={v => setField('insentif_jatuh_tempo', v)}
          />
          <NotifToggleRow
            label="📅 Reminder laporan mingguan BGN"
            desc="Pengingat otomatis setiap hari Senin untuk melaporkan Lampiran 30."
            checked={prefs.reminder_lampiran_30}
            onChange={v => setField('reminder_lampiran_30', v)}
          />
          <NotifToggleRow
            label="❌ Sinkronisasi BGN gagal"
            desc="Notifikasi jika sinkronisasi otomatis laporan ke portal BGN mengalami error."
            checked={prefs.sync_gagal}
            onChange={v => setField('sync_gagal', v)}
          />
          <NotifToggleRow
            label="✅ Laporan berhasil dikirim ke BGN"
            desc="Konfirmasi WhatsApp setiap kali laporan berhasil tersinkronisasi ke BGN."
            checked={prefs.laporan_berhasil}
            onChange={v => setField('laporan_berhasil', v)}
          />
        </div>
      </div>

      {/* ── Card: Test Kirim WA ── */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-1">
          <Send size={16} className="text-blue-600" />
          <h3 className="font-bold text-slate-800 text-sm">Test Kirim WhatsApp</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Kirim pesan percobaan ke nomor Anda untuk memastikan koneksi WhatsApp berfungsi atau melihat contoh format pesannya.
        </p>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <select
              value={jenisTest}
              onChange={(e) => setJenisTest(e.target.value as any)}
              className="select text-sm w-48"
              disabled={isSendingTest}
            >
              <option value="koneksi">Test Koneksi Umum</option>
              <option value="lampiran30">Contoh: Reminder Lampiran 30</option>
            </select>

            <button
              onClick={handleKirimTest}
              disabled={isSendingTest || !isTokenSet}
              className="btn-primary text-sm flex items-center gap-2 disabled:opacity-60 bg-green-600 hover:bg-green-700 border-green-700 shrink-0"
            >
              {isSendingTest ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send size={15} /> Kirim Sekarang
                </>
              )}
            </button>

            {testStatus === 'success' && (
              <span className="flex items-center gap-1.5 text-green-600 text-sm font-semibold whitespace-nowrap">
                <CheckCircle2 size={16} /> Terkirim!
              </span>
            )}
            {testStatus === 'failed' && (
              <span className="text-rose-600 text-sm font-semibold whitespace-nowrap">❌ Gagal — cek token Fonnte</span>
            )}
          </div>

          {!isTokenSet && (
            <p className="text-[10px] text-amber-600 mt-1">
              Tombol ini dinonaktifkan sampai token Fonnte dikonfigurasi di file .env
            </p>
          )}
        </div>
      </div>

      {/* ── Info ── */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 leading-relaxed">
          Notifikasi dikirim melalui WhatsApp ke nomor yang terdaftar di profil Anda via layanan{' '}
          <a href="https://fonnte.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">Fonnte</a>.{' '}
          Pastikan nomor HP diisi dengan benar. Notifikasi yang sama tidak akan terkirim dua kali dalam satu hari.
        </p>
      </div>
    </div>
  );
}
