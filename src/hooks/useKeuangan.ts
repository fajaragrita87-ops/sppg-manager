import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/store/toastStore';
import { generateNoBukti } from '@/lib/utils';

const DEFAULT_QUERY_OPTIONS = {
  staleTime: 30_000,
  gcTime: 300_000,
  retry: 1,
  refetchOnWindowFocus: false,
};

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface KasBesar {
  id: string;
  tanggal: string;
  no_bukti: string;
  uraian: string;
  debet: number;
  kredit: number;
  saldo_running?: number;
  kategori: string;
  sppg_id: string;
}

export interface PettyCash {
  id: string;
  tanggal: string;
  uraian: string;
  kategori: string;
  jumlah: number;
  user: string;
  sppg_id: string;
}

export interface BukuBahanPangan {
  tanggal: string;
  uraian: string;
  qty_masuk: number;
  nilai_masuk: number;
  qty_keluar: number;
  saldo_qty: number;
  saldo_rp: number;
}

export interface InsentifFasilitas {
  id: string;
  periode_mulai: string;
  periode_selesai: string;
  hari_operasional: number;
  total_rp: number;
  status: string;
  tanggal_terima: string;
}

// ─── 1. useKasBesar ──────────────────────────────────────────────────────────

export function useKasBesar(sppgId: string | undefined, bulan: number, tahun: number) {
  return useQuery({
    queryKey: ['kas_besar', sppgId, bulan, tahun],
    enabled: !!sppgId,
    ...DEFAULT_QUERY_OPTIONS,
    queryFn: async () => {
      if (!sppgId) return [];
      try {
        const { data, error } = await supabase
          .from('kas_besar')
          .select('*')
          .eq('sppg_id', sppgId)
          .order('tanggal', { ascending: true })
          .order('created_at', { ascending: true });

        if (error) throw error;

        const filtered = (data ?? []).filter(d => {
          const date = new Date(d.tanggal);
          return date.getMonth() + 1 === bulan && date.getFullYear() === tahun;
        });

        let saldo = 0;
        return filtered.map(item => {
          saldo += (item.debet || 0) - (item.kredit || 0);
          return { ...item, saldo_running: saldo };
        }) as KasBesar[];
      } catch (err: any) {
        console.error('[useKasBesar]:', err);
        throw err;
      }
    },
  });
}

// ─── 2. usePettyCash (dengan validasi limit) ──────────────────────────────────

export function usePettyCash(sppgId: string | undefined, bulan: number, tahun: number) {
  return useQuery({
    queryKey: ['petty_cash', sppgId, bulan, tahun],
    enabled: !!sppgId,
    ...DEFAULT_QUERY_OPTIONS,
    queryFn: async () => {
      if (!sppgId) return [];
      try {
        const { data, error } = await supabase
          .from('petty_cash')
          .select('*')
          .eq('sppg_id', sppgId)
          .order('tanggal', { ascending: true });

        if (error) throw error;

        return (data ?? []).filter(d => {
          const date = new Date(d.tanggal);
          return date.getMonth() + 1 === bulan && date.getFullYear() === tahun;
        }) as PettyCash[];
      } catch (err: any) {
        console.error('[usePettyCash]:', err);
        throw err;
      }
    },
  });
}

export function useCatatPettyCash() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      sppg_id: string;
      tanggal: string;
      uraian: string;
      kategori: string;
      jumlah: number;
      user_id: string;
    }) => {
      // ── Validasi ──
      if (!payload.jumlah || payload.jumlah <= 0) throw new Error('Jumlah tidak boleh Rp 0 atau negatif');
      if (payload.jumlah > 500_000) throw new Error('Jumlah melebihi batas petty cash Rp 500.000 per transaksi');

      // ── Cek limit mingguan Rp 5.000.000 ──
      const today = new Date(payload.tanggal);
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const { data: mingguIni } = await supabase
        .from('petty_cash')
        .select('jumlah')
        .eq('sppg_id', payload.sppg_id)
        .gte('tanggal', startOfWeek.toISOString().split('T')[0])
        .lte('tanggal', endOfWeek.toISOString().split('T')[0]);

      const totalMingguIni = (mingguIni ?? []).reduce((a, b) => a + (b.jumlah || 0), 0);

      if (totalMingguIni + payload.jumlah > 5_000_000) {
        throw new Error(`Melebihi batas petty cash minggu ini. Sisa limit: Rp ${(5_000_000 - totalMingguIni).toLocaleString('id-ID')}`);
      }

      // Warning kalau sudah > 80% limit
      if (totalMingguIni + payload.jumlah > 4_000_000) {
        toast.peringatan(
          'Perhatian: Limit Mendekati Batas',
          `Sisa limit petty cash minggu ini: Rp ${(5_000_000 - totalMingguIni - payload.jumlah).toLocaleString('id-ID')}`,
        );
      }

      // ── Generate no_bukti ──
      const { data: countData } = await supabase
        .from('petty_cash')
        .select('id', { count: 'exact', head: true })
        .eq('sppg_id', payload.sppg_id);
      const urutan = (countData as any)?.length ?? 0;
      const no_bukti = generateNoBukti('petty_cash', payload.tanggal, urutan + 1);

      // ── Insert petty_cash ──
      const { data: pc, error: pcErr } = await supabase
        .from('petty_cash')
        .insert({ ...payload, no_bukti })
        .select()
        .single();
      if (pcErr) throw pcErr;

      // ── Insert kas_besar ──
      const kasBukti = generateNoBukti('petty_cash', payload.tanggal, urutan + 1);
      await supabase.from('kas_besar').insert({
        sppg_id: payload.sppg_id,
        tanggal: payload.tanggal,
        uraian: payload.uraian,
        kategori: 'petty_cash',
        kredit: payload.jumlah,
        debet: 0,
        no_bukti: kasBukti,
      });

      return pc;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['petty_cash'] });
      qc.invalidateQueries({ queryKey: ['kas_besar'] });
      toast.sukses('Pengeluaran Dicatat ✓', 'Petty cash berhasil dicatat ke buku kas.');
    },
    onError: (err: any) => {
      toast.error('Gagal Catat Petty Cash', err?.message || 'Terjadi kesalahan. Coba lagi.');
    },
  });
}

// ─── 3. useBukuBahanPangan ────────────────────────────────────────────────────

export function useBukuBahanPangan(
  sppgId: string | undefined,
  bahanId: string | undefined,
  bulan: number,
  tahun: number,
) {
  return useQuery({
    queryKey: ['buku_bahan', sppgId, bahanId, bulan, tahun],
    enabled: !!sppgId && !!bahanId,
    ...DEFAULT_QUERY_OPTIONS,
    queryFn: async () => {
      if (!sppgId || !bahanId) return [];
      try {
        const [{ data: masuk }, { data: keluar }] = await Promise.all([
          supabase.from('stok_masuk').select('*').eq('sppg_id', sppgId).eq('bahan_id', bahanId),
          supabase.from('stok_keluar').select('*').eq('sppg_id', sppgId).eq('bahan_id', bahanId),
        ]);

        const gabung: any[] = [];
        masuk?.forEach(m => {
          const date = new Date(m.tanggal);
          if (date.getMonth() + 1 === bulan && date.getFullYear() === tahun) {
            gabung.push({ tanggal: m.tanggal, uraian: 'Pembelian / Masuk', qty_masuk: m.qty, nilai_masuk: (m.harga_satuan ?? 0) * m.qty, qty_keluar: 0 });
          }
        });
        keluar?.forEach(k => {
          const date = new Date(k.tanggal);
          if (date.getMonth() + 1 === bulan && date.getFullYear() === tahun) {
            gabung.push({ tanggal: k.tanggal, uraian: k.keperluan || 'Distribusi', qty_masuk: 0, nilai_masuk: 0, qty_keluar: k.qty });
          }
        });

        gabung.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

        let saldoQty = 0;
        let saldoRp = 0;

        return gabung.map(g => {
          saldoQty += g.qty_masuk - g.qty_keluar;
          saldoRp += g.nilai_masuk;
          return { ...g, saldo_qty: Math.max(0, saldoQty), saldo_rp: Math.max(0, saldoRp) };
        }) as BukuBahanPangan[];
      } catch (err: any) {
        console.error('[useBukuBahanPangan]:', err);
        throw err;
      }
    },
  });
}

// ─── 4. useInsentifFasilitas ──────────────────────────────────────────────────

export function useInsentifFasilitas(sppgId: string | undefined, tahun: number) {
  return useQuery({
    queryKey: ['insentif_fasilitas', sppgId, tahun],
    enabled: !!sppgId,
    ...DEFAULT_QUERY_OPTIONS,
    queryFn: async () => {
      if (!sppgId) return [];
      try {
        const { data, error } = await supabase
          .from('insentif_fasilitas')
          .select('*')
          .eq('sppg_id', sppgId);
        if (error) throw error;

        return (data ?? [])
          .filter(d => new Date(d.periode_mulai).getFullYear() === tahun)
          .map(d => ({
            ...d,
            // Rp 6.000.000 × hari operasional aktual (laporan dikunci)
            total_rp: (d.hari_operasional || 0) * 6_000_000,
          })) as InsentifFasilitas[];
      } catch (err: any) {
        console.error('[useInsentifFasilitas]:', err);
        throw err;
      }
    },
  });
}

// ─── 5. useRekonsiliasi ───────────────────────────────────────────────────────

export function useRekonsiliasi(sppgId: string | undefined, bulan: number, tahun: number) {
  return useQuery({
    queryKey: ['rekonsiliasi', sppgId, bulan, tahun],
    enabled: !!sppgId,
    ...DEFAULT_QUERY_OPTIONS,
    queryFn: async () => {
      const empty = { totalPemasukan: 0, totalPengeluaran: 0, saldoAkhir: 0, rataRataHarian: 0, estimasiHariLagi: 0, data30Hari: [] };
      if (!sppgId) return empty;

      try {
        const { data, error } = await supabase.from('kas_besar').select('*').eq('sppg_id', sppgId);
        if (error) throw error;

        let totalPemasukan = 0;
        let totalPengeluaran = 0;
        let saldoAkhir = 0;

        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const chartDataMap: Record<string, number> = {};

        (data ?? []).forEach(item => {
          const itemDate = new Date(item.tanggal);
          saldoAkhir += (item.debet || 0) - (item.kredit || 0);

          if (itemDate.getMonth() + 1 === bulan && itemDate.getFullYear() === tahun) {
            totalPemasukan += item.debet || 0;
            totalPengeluaran += item.kredit || 0;
          }

          if (itemDate >= thirtyDaysAgo && itemDate <= today && item.kredit > 0) {
            const tgl = item.tanggal;
            chartDataMap[tgl] = (chartDataMap[tgl] || 0) + item.kredit;
          }
        });

        // Saldo tidak boleh negatif di UI
        const saldoAkhirSafe = Math.max(0, saldoAkhir);

        const currentDay = new Date().getDate();
        const rataRataHarian = totalPengeluaran / (currentDay > 0 ? currentDay : 1);
        const estimasiHariLagi = rataRataHarian > 0
          ? Math.max(0, Math.floor(saldoAkhirSafe / rataRataHarian))
          : 0;

        const data30Hari = Object.keys(chartDataMap).sort().map(k => ({
          tanggal: k.substring(5),
          pengeluaran: chartDataMap[k],
          paguBGN: 8_500_000,
        }));

        return { totalPemasukan, totalPengeluaran, saldoAkhir: saldoAkhirSafe, rataRataHarian, estimasiHariLagi, data30Hari };
      } catch (err: any) {
        console.error('[useRekonsiliasi]:', err);
        return empty;
      }
    },
  });
}

// ─── 6. useInputPenerimaanVA ──────────────────────────────────────────────────

export function useInputPenerimaanVA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      sppg_id: string;
      tanggal: string;
      jumlah: number;
      keterangan: string;
    }) => {
      if (!payload.jumlah || payload.jumlah <= 0) throw new Error('Jumlah VA tidak boleh 0');

      // Hitung urutan no_bukti VA bulan ini
      const d = new Date(payload.tanggal);
      const { count } = await supabase
        .from('kas_besar')
        .select('*', { count: 'exact', head: true })
        .eq('sppg_id', payload.sppg_id)
        .eq('kategori', 'pemasukan_va');
      const urutan = (count ?? 0) + 1;
      const no_bukti = generateNoBukti('pemasukan_va', payload.tanggal, urutan);

      const { error } = await supabase.from('kas_besar').insert({
        sppg_id: payload.sppg_id,
        tanggal: payload.tanggal,
        uraian: payload.keterangan,
        debet: payload.jumlah,
        kredit: 0,
        kategori: 'pemasukan_va',
        no_bukti,
      });
      if (error) throw error;
      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kas_besar', variables.sppg_id] });
      queryClient.invalidateQueries({ queryKey: ['rekonsiliasi', variables.sppg_id] });
      toast.sukses('Penerimaan VA Dicatat ✓', 'Saldo VA sudah diperbarui di buku kas.');
    },
    onError: (err: any) => {
      toast.error('Gagal Catat Penerimaan VA', err?.message || 'Terjadi kesalahan.');
    },
  });
}
