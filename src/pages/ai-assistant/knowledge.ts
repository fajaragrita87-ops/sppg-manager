export interface KnowledgeEntry {
  keywords: string[]; // lower-case terms to match
  answer: string;     // concise answer (may contain line breaks)
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  {
    keywords: ['dashboard', 'overview', 'beranda', 'kpi', 'warning'],
    answer: 'Dashboard menampilkan KPI real-time: saldo VA, total porsi, status PO, dan peringatan operasional. Warning "Kunci Laporan" akan hilang otomatis setelah laporan harian dikunci. Warning "PO Menunggu" terhubung ke keuanganStore dan hilang saat semua PO disetujui.'
  },

  // ── LAPORAN HARIAN ─────────────────────────────────────────────────────────
  {
    keywords: ['laporan', 'harian', '30a', 'kunci laporan', 'kunci harian'],
    answer: 'Laporan Harian (Lampiran 30a): Masukkan jumlah porsi per kategori (PAUD, SD, SMP, SMA, Bumil) → Klik "Kunci Laporan". Sistem otomatis hitung klaim BGN dan insentif SPPG (Rp 6 juta/hari jika SLA ≥ 90%). Setelah dikunci, status Dashboard berubah menjadi selesai. Status reset otomatis di hari berikutnya.'
  },

  // ── LAPORAN 2 MINGGUAN ─────────────────────────────────────────────────────
  {
    keywords: ['laporan', '2 mingguan', 'dua mingguan', '30c', 'mingguan'],
    answer: 'Laporan 2 Mingguan (Lampiran 30c) tersedia di tab Pelaporan BGN → 2 Mingguan. Merangkum produksi dan distribusi 14 hari. Harus di-preview sebelum bisa dikirim ke BGN.'
  },

  // ── LAPORAN BULANAN ────────────────────────────────────────────────────────
  {
    keywords: ['laporan', 'bulanan', '30d', 'tutup buku'],
    answer: 'Laporan Bulanan (Lampiran 30d) terdiri dari 3 lampiran: A (Keuangan), B (Insentif SDM), C (Penerima Manfaat). Akses via Pelaporan BGN → Bulanan → klik "Tutup Buku & Generate". Wajib preview sebelum submit ke BGN.'
  },

  // ── SUBMIT KE BGN ─────────────────────────────────────────────────────────
  {
    keywords: ['submit', 'kirim bgn', 'lampiran 30', 'bgn', '30a 30b 30c 30d 30l'],
    answer: 'Tab "Submit ke BGN" ada di Pelaporan BGN (tab paling kanan, hanya owner/kasppg/bgn_coord). Berisi 5 lampiran: 30a (Penerima Manfaat), 30b (Distribusi), 30c (Menu & Produksi), 30d (Keuangan), 30l (Jadwal). Lampiran 30d hanya siap setelah laporan harian dikunci. Tombol "Kirim ke BGN" aktif setelah semua lampiran siap.'
  },

  // ── PENERIMA MANFAAT ───────────────────────────────────────────────────────
  {
    keywords: ['penerima manfaat', 'satdik', 'satuan pendidikan', 'posyandu', 'rekap'],
    answer: 'Modul Penerima Manfaat mengelola daftar sekolah dan posyandu. Rekap Per Kategori dihitung otomatis dari data satdik (bukan hardcoded). Insentif PJ Satdik menggunakan tarif berjenjang Juknis BGN: ≤100 siswa=Rp100rb, ≤300=Rp200rb, ≤500=Rp300rb, ≤750=Rp400rb, >750=Rp500rb per periode. Tombol "Export Lampiran 30a" tersedia di rekap.'
  },

  // ── INVENTORI & STOK ───────────────────────────────────────────────────────
  {
    keywords: ['inventori', 'stok', 'gudang', 'log mutasi', 'stok kritis'],
    answer: 'Inventori mengelola Stok Bahan, Penerimaan PO, Master Data, dan Supplier. Jika ada stok kritis, tombol "Buat PO Darurat" muncul otomatis dan terhubung ke modul Pengadaan. Tab "Log Mutasi" menampilkan snapshot histori stok. Notifikasi stok kritis hanya diterima oleh pengawas_keuangan dan owner, bukan staf dapur.'
  },

  // ── PURCHASE ORDER ────────────────────────────────────────────────────────
  {
    keywords: ['purchase order', 'po', 'pengadaan', 'approval', 'approve'],
    answer: 'Modul Pengadaan (PO): Buat PO → Approval (Ka.SPPG/Owner) → Status berubah "Disetujui" → Penerimaan barang → Status "Diterima". Saat PO Diterima, sistem otomatis catat pengeluaran ke keuanganStore dan update stok gudang. KPI Dashboard "PO Menunggu" update real-time.'
  },

  // ── SDM & ABSENSI ─────────────────────────────────────────────────────────
  {
    keywords: ['sdm', 'relawan', 'absensi', 'insentif relawan', 'penggajihan'],
    answer: 'Modul SDM: Tab Absensi (KPI live dari data absensi), Tab Data Relawan (tambah/cari), Tab Insentif Bulanan (terhubung ke Laporan Bulanan 30d-B). Absensi bisa manual atau via QR. Klik "Edit" di baris absensi untuk koreksi status hari ini. Tombol "Lihat Laporan" di tab Insentif membuka modul Pelaporan BGN.'
  },

  // ── DAPUR & PRODUKSI ───────────────────────────────────────────────────────
  {
    keywords: ['dapur', 'produksi harian', 'menu', 'qc', 'organoleptik', 'food tray', 'batch'],
    answer: 'Modul Dapur mencakup: Produksi Harian (simpan progres per batch), Perencanaan Menu (ganti menu aktif), QC Organoleptik (simpan hasil QC per batch), Food Tray (konfirmasi pengembalian baki update dashboard otomatis). Semua tombol simpan sudah terintegrasi dengan laporan terkait.'
  },

  // ── KEUANGAN ──────────────────────────────────────────────────────────────
  {
    keywords: ['keuangan', 'saldo', 'saldo va', 'va', 'coa', 'buku kas'],
    answer: 'Dashboard keuangan menampilkan saldo VA aktual (sisa dana hari ini, bukan total penerimaan). Saldo berkurang otomatis saat PO diterima. COA tersedia di modul Keuangan. Laporan keuangan bulanan di Lampiran 30d-A.'
  },

  // ── NOTIFIKASI ────────────────────────────────────────────────────────────
  {
    keywords: ['notifikasi', 'notif', 'wa', 'whatsapp', 'reminder'],
    answer: 'Notifikasi WA dikirim berdasarkan role:\n• Laporan Belum Dikunci → owner, kasppg, pengawas_keuangan\n• Stok Kritis → owner, kasppg, pengawas_keuangan\n• Insentif Jatuh Tempo → owner, kasppg, pengawas_keuangan\n• Reminder Lampiran 30 → owner, kasppg, bgn_coord\nStaf dapur (jurutama_masak, driver) TIDAK menerima notif laporan/keuangan. Setting notif di menu Pengaturan.'
  },

  // ── DISTRIBUSI ────────────────────────────────────────────────────────────
  {
    keywords: ['distribusi', 'driver', 'do', 'delivery', 'tray'],
    answer: 'Modul Distribusi mengelola pengiriman porsi ke satdik. Driver lihat manifest pengiriman dan update status serah terima. Konfirmasi pengembalian baki di Food Tray langsung update dashboard. Lampiran 30b (Distribusi) terhubung ke Submit ke BGN.'
  },

  // ── RBAC / AKSES ──────────────────────────────────────────────────────────
  {
    keywords: ['akses', 'role', 'rbac', 'hak akses', 'access denied', 'ditolak'],
    answer: 'RBAC SPPG Manager:\n• owner: akses penuh semua modul\n• kasppg: operasional + laporan + SDM\n• pengawas_keuangan: keuangan + laporan\n• pengawas_gizi: dapur + laporan gizi\n• asisten_lapangan: inventori + distribusi\n• jurutama_masak: dapur saja\n• driver: distribusi saja\n• bgn_coord: laporan + submit ke BGN\nHalaman akses ditolak tampil jika role tidak sesuai.'
  },

  // ── FOOD WASTE ────────────────────────────────────────────────────────────
  {
    keywords: ['food waste', 'waste', 'sisa', 'susut'],
    answer: 'Laporan Food Waste mencatat sisa bahan dan limbah. Input waste otomatis memotong stok gudang dan dicatat di jurnal keuangan. Tersedia di tab Pelaporan BGN → Food Waste.'
  },

  // ── AI ASSISTANT ──────────────────────────────────────────────────────────
  {
    keywords: ['ai assistant', 'ai', 'assistant', 'bantuan ai'],
    answer: 'AI Assistant SPPG Manager membantu menjawab pertanyaan operasional berdasarkan knowledge base internal. Tanyakan tentang modul apa saja: laporan, PO, inventori, SDM, distribusi, keuangan, atau notifikasi.'
  },

  // ── PANDUAN ───────────────────────────────────────────────────────────────
  {
    keywords: ['panduan', 'bantuan', 'helpdesk', 'sop', 'alur kerja'],
    answer: 'Panduan Operasional tersedia di Sidebar → Panduan & Bantuan. Pilih role Anda untuk melihat SOP, alur kerja, laporan wajib, dan akses fitur langsung. Role yang tersedia: Jurutama Masak, Owner, Ka.SPPG, Asisten Gudang, Pengawas Gizi, Kurir.'
  },

  // ── SINKRONISASI SIPGN ────────────────────────────────────────────────────
  {
    keywords: ['status sipgn', 'sinkronisasi', 'sipgn', 'sync'],
    answer: 'Status SIPGN menampilkan hasil sinkronisasi data ke server BGN Nasional. Jika sync gagal, gunakan tombol "Coba Kirim Ulang" di halaman Laporan Harian. Pipeline pelaporan: Input Harian → Generate 2 Minggu → Approval Ka.SPPG → Submit ke BGN.'
  },
];
