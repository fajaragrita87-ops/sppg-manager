// ==============================
// E-LEARNING MODULES — Data statis modul pelatihan SPPG
// ==============================

export type UserRole = 'owner' | 'kasppg' | 'jurutama_masak' | 'pengawas_gizi' | 'pengawas_keuangan' | 'pengawas_sanitasi' | 'asisten_lapangan';

export interface QuizItem {
  pertanyaan: string;
  pilihan: string[];
  jawaban_benar: number;
}

export interface Pelajaran {
  id: string;
  judul: string;
  tipe: 'text' | 'video' | 'quiz';
  konten: string;
  kuis?: QuizItem[];
}

export interface ElearningModule {
  id: string;
  judul: string;
  deskripsi: string;
  durasi_menit: number;
  target_role: UserRole[];
  urutan: number;
  emoji: string;
  pelajaran: Pelajaran[];
}

export const ELEARNING_MODULES: ElearningModule[] = [
  {
    id: 'mod-01', judul: 'Memahami Juknis BGN 2026', deskripsi: 'Pelajari dasar-dasar program Makan Bergizi Gratis dan peran SPPG.', durasi_menit: 15, emoji: '📘',
    target_role: ['owner', 'kasppg', 'jurutama_masak', 'pengawas_gizi', 'pengawas_keuangan', 'pengawas_sanitasi', 'asisten_lapangan'], urutan: 1,
    pelajaran: [
      { id: 'mod01-01', judul: 'Apa itu SPPG?', tipe: 'text', konten: `**SPPG (Sentra Pengolahan Pangan dan Gizi)** adalah unit dapur komunal yang bertugas memproduksi makanan bergizi untuk program Makan Bergizi Gratis (MBG) Indonesia.\n\n**Tujuan utama SPPG:**\n- Menyediakan makanan bergizi seimbang bagi siswa SD, SMP, dan kelompok prioritas\n- Memenuhi standar AKG (Angka Kecukupan Gizi) yang ditetapkan BGN\n- Mendukung ekonomi lokal melalui pengadaan bahan dari petani/UMKM sekitar\n\n**Setiap SPPG melayani:**\n- 3.000 – 5.000 porsi per hari\n- 5 – 15 satuan pendidikan (sekolah/posyandu)\n- Beroperasi 5 hari per minggu (Senin – Jumat)` },
      { id: 'mod01-02', judul: 'Struktur Tim SPPG', tipe: 'text', konten: `**Struktur organisasi SPPG terdiri dari:**\n\n1. **Owner / Kepala SPPG** — Penanggung jawab utama operasional\n2. **Ka.SPPG (Kasir/Wakil)** — Pengelola keuangan dan administrasi\n3. **Jurutama Masak (Chef)** — Penanggung jawab produksi makanan\n4. **Pengawas Gizi** — Memastikan menu sesuai standar AKG BGN\n5. **Pengawas Keuangan** — Mengawasi anggaran dan laporan keuangan\n6. **Pengawas Sanitasi** — Memastikan kebersihan dan keamanan pangan\n7. **Asisten Lapangan / Driver** — Distribusi dan absensi penerima manfaat\n\n**Total relawan per SPPG: 15 – 25 orang**\n\nSetiap peran memiliki akses berbeda di aplikasi SPPG Manager sesuai tanggung jawabnya.` },
      { id: 'mod01-03', judul: 'Kewajiban Laporan ke BGN', tipe: 'text', konten: `**Laporan yang wajib dikirim ke BGN:**\n\n**Harian:**\n- Laporan produksi dan distribusi (Lampiran 30a)\n- Jumlah porsi, biaya, dan dokumentasi foto\n- Harus dikunci sebelum jam 14:00\n\n**2 Mingguan:**\n- Rekapitulasi Lampiran 30 (a-l)\n- Dikirim setiap Senin minggu ganjil\n\n**Bulanan:**\n- Laporan keuangan lengkap\n- Nominatif insentif relawan\n- Rekapitulasi stok dan pengadaan\n\n**⚠️ Keterlambatan laporan dapat menyebabkan:**\n- Penundaan pencairan dana VA\n- Teguran dari BGN Pusat\n- Potensi sanksi administratif` },
      { id: 'mod01-04', judul: 'Kuis: Dasar-Dasar Juknis BGN', tipe: 'quiz', konten: 'Uji pemahaman Anda tentang juknis BGN.',
        kuis: [
          { pertanyaan: 'Apa kepanjangan dari SPPG?', pilihan: ['Sentra Pengolahan Pangan dan Gizi', 'Sistem Pengelolaan Pangan Gratis', 'Satuan Pelayanan Pangan Gizi', 'Standar Produksi Pangan Gratis'], jawaban_benar: 0 },
          { pertanyaan: 'Berapa porsi per hari yang dilayani satu SPPG?', pilihan: ['500 – 1.000', '1.000 – 2.000', '3.000 – 5.000', '10.000+'], jawaban_benar: 2 },
          { pertanyaan: 'Jam berapa batas penguncian laporan harian?', pilihan: ['Jam 10:00', 'Jam 12:00', 'Jam 14:00', 'Jam 17:00'], jawaban_benar: 2 },
          { pertanyaan: 'Siapa yang bertanggung jawab memastikan menu sesuai AKG?', pilihan: ['Owner', 'Jurutama Masak', 'Pengawas Gizi', 'Asisten Lapangan'], jawaban_benar: 2 },
          { pertanyaan: 'Laporan 2 mingguan dikirim pada hari apa?', pilihan: ['Jumat', 'Senin', 'Rabu', 'Sabtu'], jawaban_benar: 1 },
        ] },
    ],
  },
  {
    id: 'mod-02', judul: 'Cara Isi Laporan Harian', deskripsi: 'Step-by-step menggunakan fitur laporan harian di SPPG Manager.', durasi_menit: 10, emoji: '📝',
    target_role: ['asisten_lapangan', 'kasppg', 'owner'], urutan: 2,
    pelajaran: [
      { id: 'mod02-01', judul: 'Membuka Laporan Harian', tipe: 'text', konten: `**Langkah membuat laporan harian:**\n\n1. Login ke SPPG Manager\n2. Buka menu **Dashboard** → klik **"Buat Laporan Hari Ini"**\n3. Atau buka menu **Laporan ke BGN** → **Lampiran 30a**\n\n**Data yang perlu diisi:**\n- Jumlah porsi yang diproduksi\n- Jumlah porsi yang terdistribusi per satdik\n- Total pengeluaran hari ini\n- Foto dokumentasi (minimal 3 foto: persiapan, masak, distribusi)\n\n**Tips:**\n- Isi data segera setelah distribusi selesai\n- Jangan tunggu sampai sore — risiko lupa!` },
      { id: 'mod02-02', judul: 'Mengunci Laporan', tipe: 'text', konten: `**Setelah semua data terisi:**\n\n1. Review semua angka di halaman laporan\n2. Pastikan foto dokumentasi sudah diupload\n3. Klik tombol **"🔒 Kunci Laporan"**\n4. Konfirmasi dengan klik "Ya, Kunci"\n\n**⚠️ Penting:**\n- Laporan yang sudah dikunci TIDAK bisa diedit\n- Untuk membuka kunci, harus minta izin Owner/Ka.SPPG\n- Semua perubahan setelah unlock akan tercatat di Audit Trail\n\n**Deadline: Jam 14:00 setiap hari kerja**` },
      { id: 'mod02-03', judul: 'Kuis: Laporan Harian', tipe: 'quiz', konten: 'Tes pemahaman tentang laporan harian.',
        kuis: [
          { pertanyaan: 'Minimal berapa foto dokumentasi yang diperlukan?', pilihan: ['1 foto', '2 foto', '3 foto', '5 foto'], jawaban_benar: 2 },
          { pertanyaan: 'Siapa yang bisa membuka kunci laporan?', pilihan: ['Semua staff', 'Owner / Ka.SPPG', 'Jurutama Masak', 'BGN Pusat'], jawaban_benar: 1 },
          { pertanyaan: 'Apa yang terjadi jika laporan terlambat dikunci?', pilihan: ['Tidak ada efek', 'Pencairan VA tertunda', 'Akun diblokir', 'Denda Rp 1 juta'], jawaban_benar: 1 },
        ] },
    ],
  },
  {
    id: 'mod-03', judul: 'Manajemen Stok & Belanja', deskripsi: 'Cara survei harga, buat PO, dan kelola petty cash dengan benar.', durasi_menit: 20, emoji: '🛒',
    target_role: ['pengawas_keuangan', 'kasppg', 'owner'], urutan: 3,
    pelajaran: [
      { id: 'mod03-01', judul: 'Survei Harga 3 Supplier', tipe: 'text', konten: `**Juknis BGN mewajibkan survei harga minimal 3 supplier** sebelum melakukan pembelian.\n\n**Cara melakukan survei:**\n1. Buka menu **Pengadaan & Belanja**\n2. Klik **"Survei Harga"**\n3. Masukkan nama bahan dan harga dari 3 supplier berbeda\n4. Sistem otomatis menandai harga terendah\n\n**Aturan:**\n- Prioritaskan BUMDesa dan Koperasi lokal\n- Bandingkan kualitas, bukan hanya harga\n- Simpan bukti survei (foto/screenshot)` },
      { id: 'mod03-02', judul: 'Membuat Purchase Order', tipe: 'text', konten: `**Alur pembuatan PO:**\n\n1. Buka **Pengadaan & Belanja** → **Tab PO**\n2. Klik **"+ Buat PO Baru"**\n3. Isi: Pemohon, Supplier, Keperluan\n4. Tambahkan item dari daftar bahan\n5. Pilih metode bayar (VA atau Petty Cash)\n6. Klik **"Ajukan PO"**\n\n**Dual Approval:**\n- PO harus disetujui oleh Owner ATAU Ka.SPPG\n- PO > Rp 500.000 WAJIB pakai VA (bukan petty cash)\n- Setelah disetujui, PO dikirim ke supplier` },
      { id: 'mod03-03', judul: 'Petty Cash dan Batasannya', tipe: 'text', konten: `**Petty Cash (Kas Kecil):**\n\n- Untuk pembelian darurat di bawah **Rp 500.000**\n- Limit bulanan: **Rp 5.000.000**\n- Wajib ada bukti struk/nota\n\n**Cara mencatat:**\n1. Buka **Pengadaan** → **Tab Petty Cash**\n2. Isi tanggal, uraian, kategori, dan jumlah\n3. Upload foto struk (bisa pakai fitur **Scan Struk AI** 📷)\n4. Klik "Catat Pengeluaran"\n\n**⚠️ Pelanggaran:**\n- Transaksi > Rp 500.000 via petty cash = DITOLAK\n- Tanpa struk = temuan audit` },
      { id: 'mod03-04', judul: 'Kuis: Stok & Belanja', tipe: 'quiz', konten: 'Uji pemahaman tentang manajemen stok.',
        kuis: [
          { pertanyaan: 'Minimal berapa supplier yang harus disurvei?', pilihan: ['1', '2', '3', '5'], jawaban_benar: 2 },
          { pertanyaan: 'Batas maksimal transaksi petty cash?', pilihan: ['Rp 100.000', 'Rp 300.000', 'Rp 500.000', 'Rp 1.000.000'], jawaban_benar: 2 },
          { pertanyaan: 'PO harus disetujui oleh siapa?', pilihan: ['Jurutama Masak', 'Owner atau Ka.SPPG', 'BGN Pusat', 'Semua staff'], jawaban_benar: 1 },
          { pertanyaan: 'Apa yang diprioritaskan saat memilih supplier?', pilihan: ['Harga termurah saja', 'BUMDesa & Koperasi lokal', 'Supplier terbesar', 'Yang paling dekat'], jawaban_benar: 1 },
          { pertanyaan: 'Limit petty cash per bulan adalah?', pilihan: ['Rp 1.000.000', 'Rp 3.000.000', 'Rp 5.000.000', 'Rp 10.000.000'], jawaban_benar: 2 },
        ] },
    ],
  },
  {
    id: 'mod-04', judul: 'Absensi & Insentif Relawan', deskripsi: 'Cara absensi harian dan cek insentif otomatis untuk relawan.', durasi_menit: 10, emoji: '👥',
    target_role: ['asisten_lapangan', 'pengawas_keuangan', 'kasppg', 'owner'], urutan: 4,
    pelajaran: [
      { id: 'mod04-01', judul: 'Cara Absensi Harian', tipe: 'text', konten: `**Absensi relawan dilakukan setiap hari:**\n\n1. Buka menu **SDM** → **Relawan & Absensi**\n2. Centang kehadiran setiap relawan\n3. Pilih status: Hadir / Izin / Sakit / Alpha\n4. Klik **"Simpan Absensi"**\n\n**Tips:**\n- Absensi pagi dilakukan sebelum jam 07:00\n- Absensi WAJIB dilakukan setiap hari kerja\n- Data absensi otomatis masuk ke kalkulasi insentif` },
      { id: 'mod04-02', judul: 'Cek Insentif Otomatis', tipe: 'text', konten: `**Insentif relawan dihitung otomatis berdasarkan:**\n- Jumlah hari hadir dalam bulan berjalan\n- Jabatan / posisi relawan\n- Tarif per hari sesuai juknis BGN\n\n**Cara mengecek:**\n1. Buka **SDM** → **Penggajihan**\n2. Lihat daftar nominatif insentif\n3. Download format BGN untuk dikirim ke pusat\n\n**Pembayaran:**\n- Dilakukan oleh Ka.SPPG via transfer\n- Setiap pembayaran tercatat di Audit Trail` },
      { id: 'mod04-03', judul: 'Kuis: Absensi & Insentif', tipe: 'quiz', konten: 'Tes pemahaman tentang absensi.',
        kuis: [
          { pertanyaan: 'Absensi pagi harus dilakukan sebelum jam berapa?', pilihan: ['06:00', '07:00', '08:00', '09:00'], jawaban_benar: 1 },
          { pertanyaan: 'Insentif dihitung berdasarkan apa?', pilihan: ['Umur relawan', 'Jumlah hari hadir', 'Jumlah porsi', 'Jarak rumah'], jawaban_benar: 1 },
          { pertanyaan: 'Siapa yang melakukan pembayaran insentif?', pilihan: ['BGN Pusat', 'Ka.SPPG', 'Jurutama Masak', 'Driver'], jawaban_benar: 1 },
        ] },
    ],
  },
  {
    id: 'mod-05', judul: 'Keamanan Pangan & QC Organoleptik', deskripsi: 'Pelajari 4 parameter organoleptik dan prosedur keamanan pangan.', durasi_menit: 15, emoji: '🔬',
    target_role: ['pengawas_gizi', 'jurutama_masak', 'pengawas_sanitasi'], urutan: 5,
    pelajaran: [
      { id: 'mod05-01', judul: '4 Parameter Organoleptik', tipe: 'text', konten: `**4 Parameter QC Organoleptik BGN:**\n\n1. **Rasa** — Sesuai standar resep, tidak terlalu asin/manis/hambar\n2. **Aroma** — Harum makanan segar, tidak ada bau tengik/asam\n3. **Tekstur** — Sesuai jenis masakan (nasi pulen, sayur renyah, dll)\n4. **Penampilan** — Warna menarik, porsi merata, penyajian rapi\n\n**Setiap parameter dinilai:**\n- ✅ Layak (4-5) — Lolos standar\n- ⚠️ Perlu Perbaikan (3) — Catatan improvement\n- ❌ Tidak Layak (1-2) — WAJIB dimasak ulang` },
      { id: 'mod05-02', judul: 'Prosedur Sampel Makanan', tipe: 'text', konten: `**Prosedur pengambilan sampel:**\n\n1. Ambil sampel dari batch terakhir yang dimasak\n2. Gunakan wadah bersih dan steril\n3. Simpan sampel di suhu 4°C selama **24 jam**\n4. Label dengan: tanggal, jam, nama masakan, batch ke-\n\n**Tujuan sampel:**\n- Jika ada keluhan, sampel bisa diuji lab\n- Bukti keamanan pangan untuk auditor BGN\n- Perlindungan hukum bagi SPPG\n\n**⚠️ Wajib setiap hari!** Tidak boleh dilewatkan.` },
      { id: 'mod05-03', judul: 'Kejadian Menonjol (KM)', tipe: 'text', konten: `**Kejadian Menonjol (KM)** adalah insiden yang perlu dilaporkan:\n\n- Keluhan keracunan makanan\n- Bahan baku rusak/kadaluarsa\n- Kontaminasi benda asing\n- Kerusakan alat produksi\n- Keterlambatan distribusi > 2 jam\n\n**Cara melaporkan KM:**\n1. Catat kronologis kejadian\n2. Ambil foto/video bukti\n3. Laporkan ke Ka.SPPG dalam 1 jam\n4. Input ke sistem (Dashboard → Insiden)\n5. Ka.SPPG eskalasi ke BGN dalam 24 jam` },
      { id: 'mod05-04', judul: 'Kuis: Keamanan Pangan', tipe: 'quiz', konten: 'Tes pemahaman keamanan pangan.',
        kuis: [
          { pertanyaan: 'Berapa parameter QC organoleptik?', pilihan: ['2', '3', '4', '5'], jawaban_benar: 2 },
          { pertanyaan: 'Berapa lama sampel makanan harus disimpan?', pilihan: ['6 jam', '12 jam', '24 jam', '48 jam'], jawaban_benar: 2 },
          { pertanyaan: 'Suhu penyimpanan sampel yang benar?', pilihan: ['0°C', '4°C', '10°C', '25°C'], jawaban_benar: 1 },
          { pertanyaan: 'KM harus dilaporkan ke Ka.SPPG dalam berapa jam?', pilihan: ['30 menit', '1 jam', '6 jam', '24 jam'], jawaban_benar: 1 },
          { pertanyaan: 'Jika skor organoleptik 1-2, apa yang harus dilakukan?', pilihan: ['Tetap distribusi', 'Tambah bumbu', 'Wajib masak ulang', 'Buang saja'], jawaban_benar: 2 },
        ] },
    ],
  },
];
