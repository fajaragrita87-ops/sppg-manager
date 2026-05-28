-- ====================================================================
-- FOOD TRAY TRACKING — Pelacak baki makanan (ompreng)
-- Jalankan query ini di Supabase SQL Editor
-- ====================================================================

-- 1. Tabel utama food_tray_tracking
CREATE TABLE IF NOT EXISTS food_tray_tracking (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id         UUID REFERENCES sppg(id),
  satdik_id       UUID REFERENCES satuan_pendidikan(id),
  manifest_id     UUID REFERENCES manifest_distribusi(id),
  tanggal         DATE NOT NULL,
  tray_keluar     INTEGER NOT NULL,
  tray_kembali    INTEGER DEFAULT 0,
  tray_rusak      INTEGER DEFAULT 0,
  tray_hilang     INTEGER DEFAULT 0,
  status          VARCHAR(20) DEFAULT 'menunggu',
  -- status: 'menunggu' | 'kembali' | 'terlambat'
  waktu_konfirmasi TIMESTAMPTZ,
  dikonfirmasi_oleh UUID REFERENCES users(id),
  catatan         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index untuk query cepat per SPPG per tanggal
CREATE INDEX idx_tray_sppg_tanggal ON food_tray_tracking(sppg_id, tanggal);

-- 3. RLS (Row Level Security)
ALTER TABLE food_tray_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: Hanya user dari SPPG yang sama bisa lihat
CREATE POLICY "Tray read own SPPG" ON food_tray_tracking
  FOR SELECT USING (
    sppg_id IN (
      SELECT sppg_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Insert hanya untuk user SPPG sendiri
CREATE POLICY "Tray insert own SPPG" ON food_tray_tracking
  FOR INSERT WITH CHECK (
    sppg_id IN (
      SELECT sppg_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Update hanya untuk user SPPG sendiri
CREATE POLICY "Tray update own SPPG" ON food_tray_tracking
  FOR UPDATE USING (
    sppg_id IN (
      SELECT sppg_id FROM users WHERE id = auth.uid()
    )
  );
