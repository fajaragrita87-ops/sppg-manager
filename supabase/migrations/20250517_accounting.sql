/**
 * SQL migration — Jalankan di Supabase SQL Editor.
 * Buat tabel akuntansi dan function setup_coa_default.
 *
 * URUTAN EKSEKUSI:
 * 1. Tabel akun, jurnal, jurnal_detail, periode_akuntansi, anggaran
 * 2. Indexes
 * 3. Function setup_coa_default()
 */

-- ═══════════════════════════════════════════
-- TABEL AKUNTANSI
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS akun (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID REFERENCES sppg(id) ON DELETE CASCADE,
  kode            VARCHAR(20) NOT NULL,
  nama            VARCHAR(255) NOT NULL,
  nama_tampil     VARCHAR(255),
  tipe            VARCHAR(20) NOT NULL CHECK (tipe IN ('aset','liabilitas','ekuitas','pendapatan','beban')),
  sub_tipe        VARCHAR(50),
  normal_balance  VARCHAR(10) CHECK (normal_balance IN ('debit','kredit')),
  parent_id       UUID REFERENCES akun(id),
  level           INTEGER DEFAULT 1,
  aktif           BOOLEAN DEFAULT true,
  urutan          INTEGER,
  system_account  BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sppg_id, kode)
);

CREATE TABLE IF NOT EXISTS jurnal (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id       UUID REFERENCES sppg(id) ON DELETE CASCADE,
  tanggal       DATE NOT NULL,
  no_jurnal     VARCHAR(60) UNIQUE NOT NULL,
  deskripsi     TEXT NOT NULL,
  ref_tipe      VARCHAR(50),
  ref_id        UUID,
  status        VARCHAR(20) DEFAULT 'posted' CHECK (status IN ('draft','posted','void')),
  dibuat_oleh   UUID,
  void_reason   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jurnal_detail (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jurnal_id  UUID REFERENCES jurnal(id) ON DELETE CASCADE,
  akun_id    UUID REFERENCES akun(id),
  deskripsi  TEXT,
  debit      DECIMAL(15,2) DEFAULT 0,
  kredit     DECIMAL(15,2) DEFAULT 0,
  urutan     INTEGER
);

CREATE TABLE IF NOT EXISTS periode_akuntansi (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id       UUID REFERENCES sppg(id),
  tahun         INTEGER NOT NULL,
  bulan         INTEGER NOT NULL CHECK (bulan BETWEEN 1 AND 12),
  status        VARCHAR(20) DEFAULT 'terbuka',
  ditutup_pada  TIMESTAMPTZ,
  ditutup_oleh  UUID,
  UNIQUE(sppg_id, tahun, bulan)
);

CREATE TABLE IF NOT EXISTS anggaran (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id  UUID REFERENCES sppg(id),
  akun_id  UUID REFERENCES akun(id),
  tahun    INTEGER,
  bulan    INTEGER,
  jumlah   DECIMAL(15,2),
  UNIQUE(sppg_id, akun_id, tahun, bulan)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jurnal_sppg_tanggal    ON jurnal(sppg_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_jurnal_detail_jurnal   ON jurnal_detail(jurnal_id);
CREATE INDEX IF NOT EXISTS idx_jurnal_detail_akun     ON jurnal_detail(akun_id);
CREATE INDEX IF NOT EXISTS idx_akun_sppg              ON akun(sppg_id, kode);

-- ═══════════════════════════════════════════
-- FUNCTION: setup_coa_default(sppg_id)
-- Panggil setelah SPPG baru dibuat.
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION setup_coa_default(p_sppg_id UUID)
RETURNS void AS $$
BEGIN
  -- Aset Lancar
  INSERT INTO akun (sppg_id,kode,nama,nama_tampil,tipe,sub_tipe,normal_balance,level,urutan,system_account) VALUES
  (p_sppg_id,'1-1000','Aset Lancar','Aset Lancar','aset','induk','debit',1,100,true),
  (p_sppg_id,'1-1001','Kas & Virtual Account BGN','Saldo Dana di Rekening BGN','aset','kas','debit',2,101,true),
  (p_sppg_id,'1-1002','Kas Kecil (Petty Cash)','Kas Kecil','aset','kas','debit',2,102,true),
  (p_sppg_id,'1-1100','Persediaan Bahan Baku','Stok Bahan di Gudang','aset','persediaan','debit',2,110,true),
  (p_sppg_id,'1-1200','Piutang Penerimaan BGN','Dana BGN yang Belum Cair','aset','piutang','debit',2,120,false),
  -- Aset Tetap
  (p_sppg_id,'1-2000','Aset Tetap','Peralatan & Kendaraan','aset','induk','debit',1,200,true),
  (p_sppg_id,'1-2001','Peralatan Dapur','Peralatan Dapur','aset','aset_tetap','debit',2,201,false),
  (p_sppg_id,'1-2002','Kendaraan Distribusi','Kendaraan Distribusi','aset','aset_tetap','debit',2,202,false),
  (p_sppg_id,'1-2099','Akumulasi Penyusutan','Akumulasi Penyusutan','aset','contra_asset','kredit',2,209,false),
  -- Liabilitas
  (p_sppg_id,'2-1000','Liabilitas Jangka Pendek','Kewajiban yang Harus Dibayar','liabilitas','induk','kredit',1,300,true),
  (p_sppg_id,'2-1001','Hutang ke Supplier','Belanja yang Belum Dibayar','liabilitas','hutang_usaha','kredit',2,301,true),
  (p_sppg_id,'2-1002','Hutang Insentif Relawan','Insentif yang Belum Dibayar','liabilitas','hutang_sdm','kredit',2,302,true),
  -- Ekuitas
  (p_sppg_id,'3-0000','Ekuitas Yayasan','Modal & Saldo Yayasan','ekuitas','induk','kredit',1,400,true),
  (p_sppg_id,'3-0001','Modal Awal Yayasan','Modal Awal','ekuitas','modal','kredit',2,401,true),
  (p_sppg_id,'3-0002','Surplus/Defisit Tahun Lalu','Surplus/Defisit Tahun Sebelumnya','ekuitas','retained','kredit',2,402,true),
  (p_sppg_id,'3-0003','Surplus/Defisit Berjalan','Surplus/Defisit Periode Ini','ekuitas','current_earnings','kredit',2,403,true),
  -- Pendapatan
  (p_sppg_id,'4-0000','Pendapatan','Penerimaan Dana','pendapatan','induk','kredit',1,500,true),
  (p_sppg_id,'4-0001','Dana Operasional BGN','Dana dari BGN untuk Operasional','pendapatan','dana_bgn','kredit',2,501,true),
  (p_sppg_id,'4-0002','Insentif Fasilitas SPPG','Insentif Fasilitas dari BGN','pendapatan','insentif_fasilitas','kredit',2,502,true),
  (p_sppg_id,'4-0003','Pendapatan Lain-lain','Penerimaan Lainnya','pendapatan','lain_lain','kredit',2,503,false),
  -- Beban Bahan Baku
  (p_sppg_id,'5-1000','Beban Bahan Baku','Biaya Belanja Bahan Makanan','beban','induk','debit',1,600,true),
  (p_sppg_id,'5-1001','Bahan Baku Karbohidrat','Beras & Karbohidrat','beban','bahan_baku','debit',2,601,false),
  (p_sppg_id,'5-1002','Bahan Baku Protein Hewani','Ayam, Ikan, Telur, Daging','beban','bahan_baku','debit',2,602,false),
  (p_sppg_id,'5-1003','Bahan Baku Protein Nabati','Tahu, Tempe, Kacang','beban','bahan_baku','debit',2,603,false),
  (p_sppg_id,'5-1004','Bahan Baku Sayur & Buah','Sayuran & Buah-buahan','beban','bahan_baku','debit',2,604,false),
  (p_sppg_id,'5-1005','Bahan Baku Bumbu & Minyak','Bumbu & Minyak','beban','bahan_baku','debit',2,605,false),
  (p_sppg_id,'5-1006','Bahan Baku Susu & Pelengkap','Susu & Pelengkap','beban','bahan_baku','debit',2,606,false),
  -- Beban SDM
  (p_sppg_id,'5-2000','Beban SDM & Insentif','Biaya Relawan & Insentif','beban','induk','debit',1,700,true),
  (p_sppg_id,'5-2001','Insentif Harian Relawan','Insentif Harian Relawan','beban','insentif','debit',2,701,true),
  (p_sppg_id,'5-2002','Insentif PJ Satuan Pendidikan','Insentif PJ Sekolah/Posyandu','beban','insentif','debit',2,702,true),
  (p_sppg_id,'5-2003','Insentif Kader Posyandu','Insentif Kader Posyandu','beban','insentif','debit',2,703,true),
  (p_sppg_id,'5-2004','BPJS Ketenagakerjaan','Iuran BPJS Relawan','beban','bpjs','debit',2,704,true),
  -- Beban Operasional
  (p_sppg_id,'5-3000','Beban Operasional','Biaya Operasional Dapur','beban','induk','debit',1,800,true),
  (p_sppg_id,'5-3001','Listrik','Tagihan Listrik','beban','utilitas','debit',2,801,false),
  (p_sppg_id,'5-3002','Gas LPG','Gas LPG','beban','utilitas','debit',2,802,false),
  (p_sppg_id,'5-3003','Air','Tagihan Air','beban','utilitas','debit',2,803,false),
  (p_sppg_id,'5-3004','Internet & Komunikasi','Internet & Pulsa','beban','utilitas','debit',2,804,false),
  (p_sppg_id,'5-3005','Bahan Bakar (BBM)','BBM Kendaraan Distribusi','beban','kendaraan','debit',2,805,false),
  (p_sppg_id,'5-3006','Sewa Kendaraan','Sewa Kendaraan Distribusi','beban','kendaraan','debit',2,806,false),
  (p_sppg_id,'5-3007','ATK & Perlengkapan','Alat Tulis & Perlengkapan','beban','atk','debit',2,807,false),
  (p_sppg_id,'5-3008','APD & Kebersihan','Masker, Sarung Tangan, Pembersih','beban','kebersihan','debit',2,808,false),
  (p_sppg_id,'5-3009','Perawatan Peralatan','Biaya Servis & Perawatan','beban','pemeliharaan','debit',2,809,false),
  (p_sppg_id,'5-3010','Penyusutan Peralatan','Penyusutan Aset Tetap','beban','penyusutan','debit',2,810,false),
  (p_sppg_id,'5-3099','Beban Operasional Lainnya','Biaya Operasional Lainnya','beban','lain_lain','debit',2,899,false),
  -- Beban Administrasi
  (p_sppg_id,'5-4000','Beban Administrasi','Biaya Administrasi','beban','induk','debit',1,900,false),
  (p_sppg_id,'5-4001','Biaya Administrasi Bank','Biaya Admin Rekening','beban','admin','debit',2,901,false),
  (p_sppg_id,'5-4099','Beban Lain-lain','Biaya Lainnya','beban','lain_lain','debit',2,999,false)
  ON CONFLICT (sppg_id, kode) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
