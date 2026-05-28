-- ====================================================================
-- SPPG MANAGER — SQL AUDIT & RLS POLICIES
-- Jalankan seluruh script ini di Supabase SQL Editor
-- ====================================================================

-- ── 1. Enable RLS pada semua tabel sensitif ──────────────────────────────────

ALTER TABLE IF EXISTS sppg                ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS relawan             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS absensi             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS insentif_harian     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS kas_besar           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS laporan_harian      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS purchase_order      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stok_bahan          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stok_masuk          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stok_keluar         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS petty_cash          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS insentif_fasilitas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_log           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS food_tray_tracking  ENABLE ROW LEVEL SECURITY;

-- ── 2. Helper function: ambil sppg_id user yang sedang login ─────────────────

CREATE OR REPLACE FUNCTION current_user_sppg_id()
RETURNS UUID AS $$
  SELECT sppg_id FROM users WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: cek apakah user adalah superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'superadmin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: cek role user
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── 3. Policies: SPPG ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "sppg_select_own" ON sppg;
CREATE POLICY "sppg_select_own" ON sppg
  FOR SELECT USING (
    is_superadmin() OR id = current_user_sppg_id()
  );

DROP POLICY IF EXISTS "sppg_update_own" ON sppg;
CREATE POLICY "sppg_update_own" ON sppg
  FOR UPDATE USING (
    id = current_user_sppg_id() AND current_user_role() IN ('owner', 'kasppg')
  );

-- ── 4. Policies: users ───────────────────────────────────────────────────────

DROP POLICY IF EXISTS "users_select_own_sppg" ON users;
CREATE POLICY "users_select_own_sppg" ON users
  FOR SELECT USING (
    is_superadmin() OR sppg_id = current_user_sppg_id()
  );

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (
    auth_id = auth.uid() OR (
      sppg_id = current_user_sppg_id() AND current_user_role() IN ('owner', 'kasppg')
    )
  );

-- ── 5. Policies: relawan ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "relawan_crud_own_sppg" ON relawan;
CREATE POLICY "relawan_select_own_sppg" ON relawan
  FOR SELECT USING (
    is_superadmin() OR sppg_id = current_user_sppg_id()
  );

CREATE POLICY "relawan_insert_own_sppg" ON relawan
  FOR INSERT WITH CHECK (
    sppg_id = current_user_sppg_id() AND
    current_user_role() IN ('owner', 'kasppg', 'pengawas_keuangan')
  );

CREATE POLICY "relawan_update_own_sppg" ON relawan
  FOR UPDATE USING (
    sppg_id = current_user_sppg_id() AND
    current_user_role() IN ('owner', 'kasppg', 'pengawas_keuangan')
  );

-- TIDAK ADA DELETE relawan (Audit Trail requirement: tidak bisa hapus siapapun)
-- Gunakan toggle aktif saja

-- ── 6. Policies: absensi ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "absensi_select_own" ON absensi;
DROP POLICY IF EXISTS "absensi_insert_own" ON absensi;
DROP POLICY IF EXISTS "absensi_update_own" ON absensi;

CREATE POLICY "absensi_select_own" ON absensi
  FOR SELECT USING (is_superadmin() OR sppg_id = current_user_sppg_id());

CREATE POLICY "absensi_insert_own" ON absensi
  FOR INSERT WITH CHECK (sppg_id = current_user_sppg_id());

CREATE POLICY "absensi_update_own" ON absensi
  FOR UPDATE USING (sppg_id = current_user_sppg_id());

-- ── 7. Policies: insentif_harian ─────────────────────────────────────────────

DROP POLICY IF EXISTS "insentif_select_own" ON insentif_harian;
DROP POLICY IF EXISTS "insentif_upsert_own" ON insentif_harian;

CREATE POLICY "insentif_select_own" ON insentif_harian
  FOR SELECT USING (is_superadmin() OR sppg_id = current_user_sppg_id());

CREATE POLICY "insentif_insert_own" ON insentif_harian
  FOR INSERT WITH CHECK (sppg_id = current_user_sppg_id());

CREATE POLICY "insentif_update_own" ON insentif_harian
  FOR UPDATE USING (
    sppg_id = current_user_sppg_id() AND
    current_user_role() IN ('owner', 'kasppg', 'pengawas_keuangan')
  );

-- ── 8. Policies: kas_besar ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "kas_select_own" ON kas_besar;
DROP POLICY IF EXISTS "kas_insert_own" ON kas_besar;

CREATE POLICY "kas_select_own" ON kas_besar
  FOR SELECT USING (
    is_superadmin() OR
    sppg_id = current_user_sppg_id()
  );

-- bgn_coord hanya bisa SELECT (read-only)
CREATE POLICY "kas_insert_own" ON kas_besar
  FOR INSERT WITH CHECK (
    sppg_id = current_user_sppg_id() AND
    current_user_role() NOT IN ('bgn_coord', 'driver', 'asisten_lapangan')
  );

-- Tidak ada UPDATE atau DELETE untuk kas_besar (immutable financial record)

-- ── 9. Policies: laporan_harian ──────────────────────────────────────────────

DROP POLICY IF EXISTS "laporan_select_own" ON laporan_harian;
DROP POLICY IF EXISTS "laporan_insert_own" ON laporan_harian;
DROP POLICY IF EXISTS "laporan_update_own" ON laporan_harian;

CREATE POLICY "laporan_select_own" ON laporan_harian
  FOR SELECT USING (is_superadmin() OR sppg_id = current_user_sppg_id());

CREATE POLICY "laporan_insert_own" ON laporan_harian
  FOR INSERT WITH CHECK (
    sppg_id = current_user_sppg_id() AND
    current_user_role() IN ('owner', 'kasppg')
  );

CREATE POLICY "laporan_update_own" ON laporan_harian
  FOR UPDATE USING (
    sppg_id = current_user_sppg_id() AND
    current_user_role() IN ('owner', 'kasppg')
  );

-- ── 10. Policies: purchase_order ─────────────────────────────────────────────

DROP POLICY IF EXISTS "po_select_own" ON purchase_order;
DROP POLICY IF EXISTS "po_insert_own" ON purchase_order;
DROP POLICY IF EXISTS "po_update_own" ON purchase_order;

CREATE POLICY "po_select_own" ON purchase_order
  FOR SELECT USING (is_superadmin() OR sppg_id = current_user_sppg_id());

CREATE POLICY "po_insert_own" ON purchase_order
  FOR INSERT WITH CHECK (
    sppg_id = current_user_sppg_id() AND
    current_user_role() IN ('owner', 'kasppg', 'pengawas_keuangan')
  );

CREATE POLICY "po_update_own" ON purchase_order
  FOR UPDATE USING (
    sppg_id = current_user_sppg_id() AND
    current_user_role() IN ('owner', 'kasppg', 'pengawas_keuangan')
  );

-- ── 11. Policies: stok_bahan ─────────────────────────────────────────────────

DROP POLICY IF EXISTS "stok_select_own" ON stok_bahan;

CREATE POLICY "stok_select_own" ON stok_bahan
  FOR SELECT USING (is_superadmin() OR sppg_id = current_user_sppg_id());

CREATE POLICY "stok_insert_own" ON stok_bahan
  FOR INSERT WITH CHECK (sppg_id = current_user_sppg_id());

CREATE POLICY "stok_update_own" ON stok_bahan
  FOR UPDATE USING (
    sppg_id = current_user_sppg_id() AND
    current_user_role() IN ('owner', 'kasppg', 'pengawas_keuangan', 'jurutama_masak')
  );

-- ── 12. Policies: petty_cash ─────────────────────────────────────────────────

CREATE POLICY "petty_select_own" ON petty_cash
  FOR SELECT USING (is_superadmin() OR sppg_id = current_user_sppg_id());

CREATE POLICY "petty_insert_own" ON petty_cash
  FOR INSERT WITH CHECK (
    sppg_id = current_user_sppg_id() AND
    current_user_role() IN ('owner', 'kasppg', 'pengawas_keuangan')
  );

-- ── 13. Policies: audit_log ──────────────────────────────────────────────────

-- Audit log hanya bisa SELECT oleh owner/kasppg, INSERT oleh semua (via service role)
CREATE POLICY "audit_select_own" ON audit_log
  FOR SELECT USING (
    is_superadmin() OR (
      sppg_id = current_user_sppg_id() AND
      current_user_role() IN ('owner', 'kasppg')
    )
  );

CREATE POLICY "audit_insert_all" ON audit_log
  FOR INSERT WITH CHECK (true); -- aplikasi yang mengontrol via service role

-- ── 14. UNIQUE constraints penting ───────────────────────────────────────────

-- Pastikan tidak ada duplikat absensi per hari per relawan
ALTER TABLE absensi ADD CONSTRAINT IF NOT EXISTS absensi_unique_per_hari
  UNIQUE (sppg_id, tanggal, relawan_id);

-- Pastikan tidak ada duplikat insentif per hari per relawan
ALTER TABLE insentif_harian ADD CONSTRAINT IF NOT EXISTS insentif_unique_per_hari
  UNIQUE (sppg_id, tanggal, relawan_id);

-- ── 15. Tabel food_tray_tracking (jika belum ada) ───────────────────────────

CREATE TABLE IF NOT EXISTS food_tray_tracking (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id          UUID REFERENCES sppg(id),
  satdik_id        UUID,
  manifest_id      UUID,
  tanggal          DATE NOT NULL,
  tray_keluar      INTEGER NOT NULL DEFAULT 0,
  tray_kembali     INTEGER DEFAULT 0,
  tray_rusak       INTEGER DEFAULT 0,
  tray_hilang      INTEGER DEFAULT 0,
  status           VARCHAR(20) DEFAULT 'menunggu',
  waktu_konfirmasi TIMESTAMPTZ,
  dikonfirmasi_oleh UUID,
  catatan          TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tray_sppg_tanggal ON food_tray_tracking(sppg_id, tanggal);

ALTER TABLE food_tray_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tray_select_own" ON food_tray_tracking
  FOR SELECT USING (is_superadmin() OR sppg_id = current_user_sppg_id());
CREATE POLICY "tray_insert_own" ON food_tray_tracking
  FOR INSERT WITH CHECK (sppg_id = current_user_sppg_id());
CREATE POLICY "tray_update_own" ON food_tray_tracking
  FOR UPDATE USING (sppg_id = current_user_sppg_id());

-- ── 16. View: laporan_bulanan_summary (aggregate laporan harian) ─────────────

CREATE OR REPLACE VIEW laporan_bulanan_summary AS
SELECT
  sppg_id,
  DATE_TRUNC('month', tanggal) AS bulan,
  COUNT(*) FILTER (WHERE dikunci = true)     AS hari_operasional,
  SUM(total_porsi)                            AS total_porsi,
  SUM(pengeluaran_bahan)                      AS total_bahan,
  SUM(pengeluaran_operasional)                AS total_operasional,
  SUM(pengeluaran_insentif)                   AS total_insentif,
  SUM(pengeluaran_bahan + pengeluaran_operasional + pengeluaran_insentif) AS total_pengeluaran
FROM laporan_harian
WHERE dikunci = true
GROUP BY sppg_id, DATE_TRUNC('month', tanggal);

COMMENT ON VIEW laporan_bulanan_summary IS 'Agregasi laporan harian yang sudah dikunci per bulan per SPPG';
