// ═══════════════════════════════════════════════════════════════════════════════
// SPPG Manager — Type Definitions
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Roles & Permissions ──────────────────────────────────────────────────────

export type UserRole =
  | 'owner'
  | 'kasppg'
  | 'pengawas_keuangan'
  | 'pengawas_gizi'
  | 'pengawas_sanitasi'
  | 'asisten_lapangan'
  | 'jurutama_masak'
  | 'driver'
  | 'bgn_coord'
  | 'superadmin';

export type Permission =
  | 'dashboard_keuangan'
  | 'approve_belanja'
  | 'input_belanja'
  | 'menu_planning'
  | 'input_produksi'
  | 'qc_organoleptik'
  | 'distribusi'
  | 'absensi'
  | 'generate_laporan'
  | 'sdm_penggajihan'
  | 'audit_sanitasi'
  | 'view_all_sppg';

// ─── Jabatan & Kategori ───────────────────────────────────────────────────────

export type JabatanRelawan =
  | 'kepala_sppg'
  | 'pengawas_gizi'
  | 'pengawas_keuangan'
  | 'pengawas_sanitasi'
  | 'jurutama_masak'
  | 'asisten_lapangan'
  | 'persiapan_bahan'
  | 'pengolahan_bahan'
  | 'pemorsian'
  | 'packing'
  | 'distribusi'
  | 'kebersihan'
  | 'pencuci_alat'
  | 'keamanan';

export type KategoriKas =
  | 'bahan_baku'
  | 'operasional_listrik'
  | 'operasional_gas'
  | 'operasional_air'
  | 'operasional_internet'
  | 'insentif_relawan'
  | 'bpjs'
  | 'insentif_pj_satdik'
  | 'insentif_kader'
  | 'sewa_kendaraan'
  | 'bbm'
  | 'atk'
  | 'apd'
  | 'petty_cash'
  | 'insentif_fasilitas_sppg'
  | 'penerimaan_va'
  | 'pajak'
  | 'lainnya';

// ─── Core Interfaces ──────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  auth_id: string;
  sppg_id: string;
  nama: string;
  role: UserRole;
  jabatan: string;
  hp?: string;
  email?: string;
  aktif: boolean;
}

export interface SppgProfile {
  id: string;
  yayasan_id: string;
  id_sppg?: string;
  nama: string;
  kab_kota: string;
  provinsi: string;
  kapasitas_pm: number;
  status: 'persiapan' | 'aktif' | 'suspended' | 'nonaktif';
  virtual_account?: string;
}

export interface Yayasan {
  id: string;
  nama: string;
  npwp?: string;
  virtual_account?: string;
}

export interface Relawan {
  id: string;
  sppg_id: string;
  nama: string;
  nik: string;
  jabatan: JabatanRelawan;
  desil: '1' | '2' | 'lainnya';
  usia?: number;
  tgl_lahir?: string;         // YYYY-MM-DD — untuk validasi usia
  jenis_kelamin: 'L' | 'P';
  hp: string;
  no_hp?: string;              // alias untuk hp (beberapa komponen memakai no_hp)
  bpjs_no?: string;
  bpjs_aktif: boolean;
  sim_a: boolean;
  sim_c: boolean;
  dokumen: Record<string, boolean>;
  rate_insentif: number;
  tanggal_mulai?: string;
  aktif: boolean;
}

export interface Absensi {
  id: string;
  relawan_id: string;
  sppg_id: string;
  tanggal: string;
  hadir: boolean;
  keterangan?: string;
  jam_masuk?: string;
}

export interface InsentifHarian {
  id: string;
  relawan_id: string;
  sppg_id: string;
  tanggal: string;
  jumlah: number;
  sudah_dibayar: boolean;
  metode_bayar?: 'tunai' | 'transfer';
  dibayar_at?: string;
}

export interface LaporanHarian {
  id: string;
  sppg_id: string;
  tanggal: string;
  /** JSON porsi per satuan pendidikan: { "SDN 01": 150, "SMPN 02": 200 } */
  pm_json: Record<string, number>;
  total_porsi: number;
  pengeluaran_bahan: number;
  pengeluaran_operasional: number;
  saldo_akhir: number;
  dikunci: boolean;
  dikunci_oleh?: string;
  dikunci_at?: string;
  sync_sipgn: 'belum' | 'sukses' | 'gagal';
  sync_dialur: 'belum' | 'sukses' | 'gagal';
  pdf_url?: string;
}

export interface KasBesar {
  id: string;
  sppg_id: string;
  tanggal: string;
  no_bukti: string;
  uraian: string;
  kategori: KategoriKas;
  debet: number;
  kredit: number;
  saldo: number;
}

export interface StokBahan {
  id: string;
  sppg_id: string;
  bahan_id: string;
  nama_bahan: string;
  kategori: string;
  stok_saat_ini: number;
  stok_minimum: number;
  satuan: string;
  harga_terakhir: number;
  zona_gudang: 'kering' | 'dingin' | 'bumbu' | 'packaging';
}

export interface PurchaseOrder {
  id: string;
  sppg_id: string;
  no_po: string;
  tanggal: string;
  supplier_id: string;
  total: number;
  status: 'draft' | 'menunggu_approval' | 'disetujui' | 'diterima' | 'dibatalkan';
  dibuat_oleh: string;
  disetujui_oleh?: string;
}

// ─── Konstanta: Label Jabatan ─────────────────────────────────────────────────

export const JABATAN_LABELS: Record<JabatanRelawan, string> = {
  kepala_sppg:       'Kepala SPPG',
  pengawas_gizi:     'Pengawas Gizi',
  pengawas_keuangan: 'Pengawas Keuangan',
  pengawas_sanitasi: 'Pengawas Sanitasi',
  jurutama_masak:    'Jurutama Masak',
  asisten_lapangan:  'Asisten Lapangan',
  persiapan_bahan:   'Persiapan Bahan',
  pengolahan_bahan:  'Pengolahan Bahan',
  pemorsian:         'Pemorsian',
  packing:           'Packing',
  distribusi:        'Distribusi',
  kebersihan:        'Kebersihan',
  pencuci_alat:      'Pencuci Alat',
  keamanan:          'Keamanan',
};

// ─── Konstanta: Jabatan List (untuk dropdown/form) ────────────────────────────

export const JABATAN_RELAWAN_LIST: Array<{
  value: JabatanRelawan;
  label: string;
  deskripsi: string;
  warna: string;
}> = [
  {
    value: 'kepala_sppg',
    label: 'Kepala SPPG',
    deskripsi: 'Memimpin operasional dapur dan bertanggung jawab terhadap seluruh kegiatan SPPG.',
    warna: '#d4a017',
  },
  {
    value: 'pengawas_gizi',
    label: 'Pengawas Gizi',
    deskripsi: 'Memastikan kualitas gizi menu sesuai standar BGN dan melakukan QC organoleptik.',
    warna: '#1d9e75',
  },
  {
    value: 'pengawas_keuangan',
    label: 'Pengawas Keuangan',
    deskripsi: 'Mengelola kas harian, laporan keuangan, dan pengajuan belanja.',
    warna: '#5470d4',
  },
  {
    value: 'pengawas_sanitasi',
    label: 'Pengawas Sanitasi',
    deskripsi: 'Memantau kebersihan dapur, peralatan, dan standar higiene produksi.',
    warna: '#60a5fa',
  },
  {
    value: 'jurutama_masak',
    label: 'Jurutama Masak',
    deskripsi: 'Bertanggung jawab atas proses memasak dan kualitas hasil masakan.',
    warna: '#f97316',
  },
  {
    value: 'asisten_lapangan',
    label: 'Asisten Lapangan',
    deskripsi: 'Membantu koordinasi distribusi dan kegiatan lapangan harian.',
    warna: '#a78bfa',
  },
  {
    value: 'persiapan_bahan',
    label: 'Persiapan Bahan',
    deskripsi: 'Menyiapkan dan membersihkan bahan baku sebelum proses pengolahan.',
    warna: '#34d399',
  },
  {
    value: 'pengolahan_bahan',
    label: 'Pengolahan Bahan',
    deskripsi: 'Mengolah bahan baku menjadi bahan siap masak sesuai standar resep.',
    warna: '#2dd4bf',
  },
  {
    value: 'pemorsian',
    label: 'Pemorsian',
    deskripsi: 'Menimbang dan membagi makanan sesuai porsi standar per penerima manfaat.',
    warna: '#facc15',
  },
  {
    value: 'packing',
    label: 'Packing',
    deskripsi: 'Mengemas makanan ke dalam wadah distribusi dengan rapi dan higienis.',
    warna: '#fb923c',
  },
  {
    value: 'distribusi',
    label: 'Distribusi',
    deskripsi: 'Mengantarkan makanan ke satuan pendidikan tepat waktu dan kondisi baik.',
    warna: '#38bdf8',
  },
  {
    value: 'kebersihan',
    label: 'Kebersihan',
    deskripsi: 'Menjaga kebersihan area dapur, ruang produksi, dan lingkungan SPPG.',
    warna: '#86efac',
  },
  {
    value: 'pencuci_alat',
    label: 'Pencuci Alat',
    deskripsi: 'Membersihkan dan mensterilkan peralatan masak dan makan setelah digunakan.',
    warna: '#94a3b8',
  },
  {
    value: 'keamanan',
    label: 'Keamanan',
    deskripsi: 'Menjaga keamanan aset, akses masuk dapur, dan ketertiban lingkungan SPPG.',
    warna: '#f87171',
  },
];

// ─── Permission Matrix ────────────────────────────────────────────────────────

export const PERMISSION_MATRIX: Record<UserRole, Partial<Record<Permission, boolean>>> = {
  owner: {
    dashboard_keuangan:  true,
    approve_belanja:     true,
    input_belanja:       true,
    menu_planning:       true,
    input_produksi:      true,
    qc_organoleptik:     true,
    distribusi:          true,
    absensi:             true,
    generate_laporan:    true,
    sdm_penggajihan:     true,
    audit_sanitasi:      true,
    view_all_sppg:       true,
  },

  kasppg: {
    dashboard_keuangan:  true,
    approve_belanja:     true,
    input_belanja:       true,
    menu_planning:       true,
    input_produksi:      true,
    qc_organoleptik:     true,
    distribusi:          true,
    absensi:             true,
    generate_laporan:    true,
    sdm_penggajihan:     true,
    audit_sanitasi:      true,
    view_all_sppg:       false,
  },

  pengawas_keuangan: {
    dashboard_keuangan:  true,
    input_belanja:       true,
    absensi:             true,
    generate_laporan:    true,
    sdm_penggajihan:     true,
  },

  pengawas_gizi: {
    menu_planning:       true,
    input_produksi:      true,
    qc_organoleptik:     true,
  },

  pengawas_sanitasi: {
    generate_laporan:    true,
    audit_sanitasi:      true,
  },

  asisten_lapangan: {
    input_produksi:      true,
    distribusi:          true,
    absensi:             true,
  },

  jurutama_masak: {
    menu_planning:       true,
    input_produksi:      true,
  },

  driver: {
    distribusi:          true,
  },

  bgn_coord: {
    dashboard_keuangan:  true,
    generate_laporan:    true,
    view_all_sppg:       true,
  },
  
  superadmin: {
    dashboard_keuangan:  true,
    view_all_sppg:       true,
    generate_laporan:    true,
  },
};

// ─── Helper: cek permission ───────────────────────────────────────────────────

/**
 * Cek apakah role tertentu memiliki izin untuk suatu permission.
 * @example hasPermission('kasppg', 'approve_belanja') → true
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return PERMISSION_MATRIX[role]?.[permission] === true;
}
