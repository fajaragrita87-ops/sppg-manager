/**
 * SPPG Manager — Sistem Izin Aksi Granular (RBAC)
 *
 * Setiap aksi di UI harus di-check dengan usePermission() sebelum ditampilkan.
 * Chef tidak bisa edit header PO, driver tidak bisa lihat keuangan, dsb.
 */

export type Permission =
  // ── DAPUR ──────────────────────────────────────────
  | 'dapur.view'
  | 'dapur.input_produksi'       // Input data produksi harian
  | 'dapur.edit_menu'            // Edit menu planning
  | 'dapur.approve_qc'           // Approve QC organoleptik
  | 'dapur.edit_timeline'        // Edit SOP / timeline shift
  | 'dapur.manage_distribusi'    // Buat/update manifest distribusi

  // ── INVENTORI ───────────────────────────────────────
  | 'inventori.view'
  | 'inventori.view_stok'        // Lihat stok (read-only)
  | 'inventori.edit_stok'        // Adjust stok manual
  | 'inventori.kelola_supplier'  // CRUD supplier
  | 'inventori.survei_harga'     // Input survei harga

  // ── PENGADAAN / PO ─────────────────────────────────
  | 'pengadaan.view'
  | 'pengadaan.buat_po'          // Buat PO baru
  | 'pengadaan.edit_po_header'   // Edit header/detail PO yang sudah dibuat
  | 'pengadaan.approve_po'       // Approve / tolak PO
  | 'pengadaan.konfirmasi_penerimaan' // Konfirmasi barang datang

  // ── SDM ─────────────────────────────────────────────
  | 'sdm.view'
  | 'sdm.input_absensi'          // Input absensi harian
  | 'sdm.edit_relawan'           // Tambah/edit data relawan
  | 'sdm.approve_insentif'       // Approve perhitungan insentif
  | 'sdm.edit_jadwal'            // Edit jadwal shift

  // ── KEUANGAN ────────────────────────────────────────
  | 'keuangan.view'
  | 'keuangan.input_transaksi'   // Input kas masuk/keluar
  | 'keuangan.edit_transaksi'    // Edit transaksi yang sudah ada
  | 'keuangan.approve_laporan'   // Approve/kunci laporan keuangan

  // ── LAPORAN BGN ─────────────────────────────────────
  | 'laporan.view'
  | 'laporan.input_harian'       // Input data laporan harian
  | 'laporan.kunci_laporan'      // Kunci laporan harian (tidak bisa diedit)
  | 'laporan.generate_bgn'       // Generate PDF Lampiran 30

  // ── SETTINGS / PENGATURAN ──────────────────────────
  | 'settings.view'
  | 'settings.edit_profil_sppg'  // Edit nama/alamat/profil SPPG
  | 'settings.kelola_users'      // Tambah/nonaktifkan user
  | 'settings.kelola_roles'      // Ubah role user lain

  // ── PENERIMA MANFAAT ────────────────────────────────
  | 'penerima.view'
  | 'penerima.edit';             // Edit data satdik / penerima manfaat

// ── MATRIKS IZIN PER ROLE ─────────────────────────────────────────────────────

const ALL: Permission[] = [
  'dapur.view','dapur.input_produksi','dapur.edit_menu','dapur.approve_qc','dapur.edit_timeline','dapur.manage_distribusi',
  'inventori.view','inventori.view_stok','inventori.edit_stok','inventori.kelola_supplier','inventori.survei_harga',
  'pengadaan.view','pengadaan.buat_po','pengadaan.edit_po_header','pengadaan.approve_po','pengadaan.konfirmasi_penerimaan',
  'sdm.view','sdm.input_absensi','sdm.edit_relawan','sdm.approve_insentif','sdm.edit_jadwal',
  'keuangan.view','keuangan.input_transaksi','keuangan.edit_transaksi','keuangan.approve_laporan',
  'laporan.view','laporan.input_harian','laporan.kunci_laporan','laporan.generate_bgn',
  'settings.view','settings.edit_profil_sppg','settings.kelola_users','settings.kelola_roles',
  'penerima.view','penerima.edit',
];

const ROLE_PERMISSIONS: Record<string, Permission[]> = {

  // ── OWNER: Akses penuh ──────────────────────────────
  owner: ALL,

  // ── KEPALA SPPG: Hampir penuh, kecuali kelola roles ─
  kasppg: ALL.filter(p => p !== 'settings.kelola_roles'),

  // ── PENGAWAS KEUANGAN ────────────────────────────────
  // Fokus: keuangan, SDM insentif, laporan BGN
  // Tidak bisa: edit menu, approve QC, edit timeline dapur
  pengawas_keuangan: [
    'dapur.view',
    'inventori.view','inventori.view_stok','inventori.konfirmasi_penerimaan' as Permission,
    'pengadaan.view','pengadaan.konfirmasi_penerimaan',
    'sdm.view','sdm.input_absensi','sdm.edit_relawan','sdm.approve_insentif','sdm.edit_jadwal',
    'keuangan.view','keuangan.input_transaksi','keuangan.edit_transaksi','keuangan.approve_laporan',
    'laporan.view','laporan.input_harian','laporan.kunci_laporan','laporan.generate_bgn',
    'settings.view',
    'penerima.view',
  ],

  // ── PENGAWAS GIZI ────────────────────────────────────
  // Fokus: menu, produksi, QC gizi, stok bahan
  // Tidak bisa: keuangan, PO header, kelola user
  pengawas_gizi: [
    'dapur.view','dapur.input_produksi','dapur.edit_menu','dapur.approve_qc',
    'inventori.view','inventori.view_stok','inventori.edit_stok','inventori.survei_harga',
    'pengadaan.view',
    'sdm.view',
    'laporan.view','laporan.input_harian',
    'settings.view',
    'penerima.view',
  ],

  // ── PENGAWAS SANITASI ───────────────────────────────
  // Fokus: checklist kebersihan, laporan sanitasi
  // Akses sangat terbatas
  pengawas_sanitasi: [
    'dapur.view','dapur.input_produksi',
    'inventori.view','inventori.view_stok',
    'sdm.view',
    'laporan.view','laporan.input_harian',
    'settings.view',
    'penerima.view',
  ],

  // ── ASISTEN LAPANGAN ────────────────────────────────
  // Fokus: operasional dapur, absensi, distribusi
  // Tidak bisa: keuangan, approve laporan BGN, edit PO
  asisten_lapangan: [
    'dapur.view','dapur.input_produksi','dapur.manage_distribusi',
    'inventori.view','inventori.view_stok','inventori.edit_stok',
    'pengadaan.view','pengadaan.konfirmasi_penerimaan',
    'sdm.view','sdm.input_absensi','sdm.edit_jadwal',
    'laporan.view','laporan.input_harian',
    'settings.view',
    'penerima.view',
  ],

  // ── JURUTAMA MASAK (CHEF) ───────────────────────────
  // Fokus: input produksi, lihat stok bahan
  // TIDAK BISA: edit PO, edit menu, keuangan, laporan BGN, settings SPPG
  jurutama_masak: [
    'dapur.view','dapur.input_produksi',
    'inventori.view','inventori.view_stok',   // hanya READ
    'pengadaan.view',                           // hanya READ
    'laporan.view',                             // hanya READ
    'settings.view',
  ],

  // ── DRIVER / DISTRIBUSI ─────────────────────────────
  // Fokus: hanya manifest distribusi & update status
  // Akses sangat terbatas
  driver: [
    'dapur.view','dapur.manage_distribusi',
    'laporan.view',
    'settings.view',
  ],

  // ── KOORDINATOR BGN ─────────────────────────────────
  // Fokus: review laporan, approve keuangan konsolidasi
  // Tidak bisa: edit operasional dapur, SDM
  bgn_coord: [
    'dapur.view',
    'inventori.view','inventori.view_stok',
    'pengadaan.view',
    'sdm.view',
    'keuangan.view','keuangan.approve_laporan',
    'laporan.view','laporan.kunci_laporan','laporan.generate_bgn',
    'settings.view',
    'penerima.view',
  ],

  // ── SUPER ADMIN ─────────────────────────────────────
  superadmin: ALL,
};

// ── PUBLIC API ────────────────────────────────────────────────────────────────

/** Ambil semua permission untuk satu role */
export function getPermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/** Cek apakah role punya permission tertentu */
export function hasPermission(role: string, permission: Permission): boolean {
  return getPermissions(role).includes(permission);
}

/** Cek apakah role punya SEMUA permission dalam array */
export function hasAllPermissions(role: string, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

/** Cek apakah role punya SALAH SATU permission dalam array */
export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}
