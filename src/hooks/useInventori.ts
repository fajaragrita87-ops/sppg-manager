import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// TYPES
export interface MasterBahan {
  id: string;
  nama: string;
  kategori: string;
  satuan: string;
  stok_minimum: number;
  fortifikasi: boolean;
  sppg_id: string;
}

export interface StokBahan {
  id: string;
  sppg_id: string;
  bahan_id: string;
  stok_saat_ini: number;
  harga_terakhir: number;
  updated_at: string;
  master_bahan?: MasterBahan;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
let MOCK_MASTER_BAHAN: MasterBahan[] = [
  { id: 'b1', nama: 'Beras Premium', kategori: 'Kering', satuan: 'kg', stok_minimum: 100, fortifikasi: true, sppg_id: '1' },
  { id: 'b2', nama: 'Daging Ayam', kategori: 'Dingin/Freezer', satuan: 'kg', stok_minimum: 50, fortifikasi: false, sppg_id: '1' },
  { id: 'b3', nama: 'Telur Ayam', kategori: 'Dingin/Freezer', satuan: 'kg', stok_minimum: 50, fortifikasi: false, sppg_id: '1' },
  { id: 'b4', nama: 'Minyak Goreng', kategori: 'Kering', satuan: 'liter', stok_minimum: 20, fortifikasi: true, sppg_id: '1' },
  { id: 'b5', nama: 'Bumbu Dapur', kategori: 'Bumbu', satuan: 'set', stok_minimum: 5, fortifikasi: false, sppg_id: '1' },
];

// ─── 1. useMasterBahan ──────────────────────────────────────────────────────────
export function useMasterBahan(sppgId: string | undefined) {
  return useQuery({
    queryKey: ['master_bahan', sppgId],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 300)); // Simulasi network
      return [...MOCK_MASTER_BAHAN];
    },
    enabled: !!sppgId,
  });
}

// ─── 2. useStokBahan ────────────────────────────────────────────────────────────
export function useStokBahan(sppgId: string | undefined) {
  return useQuery({
    queryKey: ['stok_bahan', sppgId],
    queryFn: async () => {
      if (!sppgId) return [];
      // Menggunakan join/select untuk mendapatkan nama dan detail dari master_bahan
      const { data, error } = await supabase
        .from('stok_bahan')
        .select(`
          *,
          master_bahan:bahan_id (
            nama, kategori, satuan, stok_minimum, fortifikasi
          )
        `)
        .eq('sppg_id', sppgId);

      if (error) throw error;
      return data as StokBahan[];
    },
    enabled: !!sppgId,
  });
}

// ─── 3. tambahStokMasuk ──────────────────────────────────────────────────────────
export function useTambahStokMasuk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      sppg_id: string;
      bahan_id: string;
      qty: number;
      harga_satuan: number;
      supplier_id?: string;
      no_faktur?: string;
      nama_bahan: string; // untuk log kas
    }) => {
      // 1. Dapatkan atau buat stok_bahan row untuk bahan ini (jika belum ada)
      const { data: existingStok } = await supabase
        .from('stok_bahan')
        .select('*')
        .eq('sppg_id', payload.sppg_id)
        .eq('bahan_id', payload.bahan_id)
        .single();

      if (existingStok) {
        // Update stok
        await supabase
          .from('stok_bahan')
          .update({
            stok_saat_ini: existingStok.stok_saat_ini + payload.qty,
            harga_terakhir: payload.harga_satuan,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingStok.id);
      } else {
        // Insert stok awal
        await supabase.from('stok_bahan').insert({
          sppg_id: payload.sppg_id,
          bahan_id: payload.bahan_id,
          stok_saat_ini: payload.qty,
          harga_terakhir: payload.harga_satuan,
        });
      }

      // 2. Insert ke stok_masuk (riwayat)
      await supabase.from('stok_masuk').insert({
        sppg_id: payload.sppg_id,
        bahan_id: payload.bahan_id,
        qty: payload.qty,
        harga_satuan: payload.harga_satuan,
        supplier_id: payload.supplier_id,
        no_faktur: payload.no_faktur,
        tanggal: new Date().toISOString().split('T')[0],
      });

      // 3. Kas Besar
      const totalCost = payload.qty * payload.harga_satuan;
      await supabase.from('kas_besar').insert({
        sppg_id: payload.sppg_id,
        uraian: `Pembelian ${payload.nama_bahan}`,
        kredit: totalCost,
        kategori: 'bahan_baku',
        tanggal: new Date().toISOString().split('T')[0],
      });

      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stok_bahan', variables.sppg_id] });
      queryClient.invalidateQueries({ queryKey: ['kas_besar', variables.sppg_id] });
    },
  });
}

// ─── 4. stokOpname ──────────────────────────────────────────────────────────────
export function useStokOpname() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      sppg_id: string;
      adjustments: Array<{
        bahan_id: string;
        stok_fisik: number;
        stok_sistem: number;
        harga_terakhir: number;
        keterangan: string;
      }>;
    }) => {
      for (const adj of payload.adjustments) {
        const selisih = adj.stok_fisik - adj.stok_sistem;
        if (selisih === 0) continue;

        if (selisih < 0) {
          // Stok berkurang (koreksi negatif)
          await supabase.from('stok_keluar').insert({
            sppg_id: payload.sppg_id,
            bahan_id: adj.bahan_id,
            qty: Math.abs(selisih),
            keperluan: `Koreksi opname: ${adj.keterangan}`,
            tanggal: new Date().toISOString().split('T')[0],
          });
        } else {
          // Stok bertambah (koreksi positif)
          await supabase.from('stok_masuk').insert({
            sppg_id: payload.sppg_id,
            bahan_id: adj.bahan_id,
            qty: selisih,
            harga_satuan: adj.harga_terakhir || 0,
            no_faktur: 'OPNAME',
            tanggal: new Date().toISOString().split('T')[0],
          });
        }

        // Update saldo akhir
        await supabase
          .from('stok_bahan')
          .update({
            stok_saat_ini: adj.stok_fisik,
            updated_at: new Date().toISOString(),
          })
          .eq('sppg_id', payload.sppg_id)
          .eq('bahan_id', adj.bahan_id);
      }
      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stok_bahan', variables.sppg_id] });
    },
  });
}

// ─── 5. Simpan Master Bahan ──────────────────────────────────────────────────
export function useSimpanMasterBahan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<MasterBahan>) => {
      await new Promise(r => setTimeout(r, 500)); // Simulasi network
      
      if (payload.id) {
        // Edit
        const index = MOCK_MASTER_BAHAN.findIndex(m => m.id === payload.id);
        if (index !== -1) {
          MOCK_MASTER_BAHAN[index] = { ...MOCK_MASTER_BAHAN[index], ...payload };
        }
      } else {
        // Tambah baru
        MOCK_MASTER_BAHAN.push({
          id: `new-${Date.now()}`,
          nama: payload.nama!,
          kategori: payload.kategori || 'Lainnya',
          satuan: payload.satuan || 'pcs',
          stok_minimum: payload.stok_minimum || 0,
          fortifikasi: payload.fortifikasi || false,
          sppg_id: payload.sppg_id!,
        });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['master_bahan', variables.sppg_id] });
    },
  });
}

// ─── 6. Hitung Food Cost Hari Ini ────────────────────────────────────────────
export function useHitungFoodCost(sppgId: string | undefined, tanggal: string) {
  return useQuery({
    queryKey: ['food_cost', sppgId, tanggal],
    queryFn: async () => {
      if (!sppgId) return { totalBahan: 0, totalPorsi: 0, costPerPorsi: 0, vsPaguBGN: 0 };
      
      // Hitung total kas keluar untuk bahan baku hari ini
      const { data: kasList, error: kasError } = await supabase
        .from('kas_besar')
        .select('kredit')
        .eq('sppg_id', sppgId)
        .eq('kategori', 'bahan_baku')
        .eq('tanggal', tanggal);
        
      if (kasError) throw kasError;
      const totalBahan = kasList.reduce((acc, curr) => acc + (curr.kredit || 0), 0);

      // Hitung total porsi (dari rencana distribusi hari ini)
      const { data: porsiData, error: porsiError } = await supabase
        .from('distribusi_harian')
        .select('porsi_rencana')
        .eq('sppg_id', sppgId)
        .eq('tanggal', tanggal);
        
      if (porsiError) throw porsiError;
      const totalPorsi = porsiData.reduce((acc, curr) => acc + (curr.porsi_rencana || 0), 0);

      const costPerPorsi = totalPorsi > 0 ? totalBahan / totalPorsi : 0;
      
      // vs Pagu BGN (asumsi pagu antara 8000-10000, kita kembalikan statusnya)
      return {
        totalBahan,
        totalPorsi,
        costPerPorsi,
        vsPaguBGN: 10000 - costPerPorsi
      };
    },
    enabled: !!sppgId,
  });
}
