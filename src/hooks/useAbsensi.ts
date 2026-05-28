import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/store/toastStore';

export interface AbsensiCombined {
  id?: string;
  relawan_id: string;
  sppg_id: string;
  tanggal: string;
  hadir: boolean | null;
  keterangan?: string;
  nama: string;
  jabatan: string;
  rate_insentif: number;
}

// ─── Query Options Standard ───────────────────────────────────────────────────

const DEFAULT_QUERY_OPTIONS = {
  staleTime: 30_000,       // 30 detik
  gcTime: 300_000,          // 5 menit
  retry: 1,                 // 1x retry (jangan 3x di koneksi lambat)
  refetchOnWindowFocus: false,
};

// ─── useAbsensiHariIni ────────────────────────────────────────────────────────

export function useAbsensiHariIni(sppgId: string | undefined, tanggal: string) {
  return useQuery({
    queryKey: ['absensi', sppgId, tanggal],
    enabled: !!sppgId && !!tanggal,
    ...DEFAULT_QUERY_OPTIONS,
    queryFn: async () => {
      // BGN Demo Data - Mocked for Presentation
      const mockRelawan = [
        { id: '1', nama: 'Siti Aminah', jabatan: 'jurutama_masak', rate_insentif: 125000 },
        { id: '2', nama: 'Budi Santoso', jabatan: 'kepala_sppg', rate_insentif: 200000 },
        { id: '3', nama: 'Dewi Lestari', jabatan: 'pengawas_gizi', rate_insentif: 150000 },
        { id: '4', nama: 'Ahmad Faisal', jabatan: 'pengawas_keuangan', rate_insentif: 150000 },
        { id: '5', nama: 'Rina Marlina', jabatan: 'asisten_lapangan', rate_insentif: 100000 },
        { id: '6', nama: 'Joko Widodo', jabatan: 'asisten_lapangan', rate_insentif: 100000 },
        { id: '7', nama: 'Sri Wahyuni', jabatan: 'asisten_lapangan', rate_insentif: 100000 },
      ];

      const mockAbsensi = [
        { relawan_id: '1', hadir: true, keterangan: '' },
        { relawan_id: '2', hadir: true, keterangan: '' },
        { relawan_id: '3', hadir: true, keterangan: '' },
        { relawan_id: '4', hadir: true, keterangan: '' },
        { relawan_id: '5', hadir: false, keterangan: 'Sakit' },
      ];

      await new Promise(r => setTimeout(r, 500));

      const combined: AbsensiCombined[] = mockRelawan.map((r) => {
        const abs = mockAbsensi.find((a) => a.relawan_id === r.id);
        return {
          id: undefined,
          relawan_id: r.id,
          sppg_id: sppgId!,
          tanggal,
          nama: r.nama,
          jabatan: r.jabatan,
          rate_insentif: r.rate_insentif,
          hadir: abs ? abs.hadir : null,
          keterangan: abs?.keterangan || '',
        };
      });

      return combined;
    },
  });
}

// ─── useCheckAbsensiSudahAda ──────────────────────────────────────────────────

export function useCheckAbsensiSudahAda(sppgId: string | undefined, tanggal: string) {
  return useQuery({
    queryKey: ['absensi_check', sppgId, tanggal],
    enabled: !!sppgId && !!tanggal,
    ...DEFAULT_QUERY_OPTIONS,
    queryFn: async () => {
      // Mocked check (return false so we can show the absen UI)
      return false;
    },
  });
}

// ─── useSaveAbsensi ───────────────────────────────────────────────────────────

export function useSaveAbsensi() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sppgId,
      tanggal,
      items,
      rates,
    }: {
      sppgId: string;
      tanggal: string;
      items: Array<{ relawan_id: string; hadir: boolean | null; keterangan?: string }>;
      rates: Record<string, number>;
    }) => {
      // Validasi: tidak bisa absen untuk tanggal masa depan
      const today = new Date().toISOString().split('T')[0];
      if (tanggal > today) throw new Error('Tidak bisa mencatat absensi untuk tanggal masa depan');

      // Validasi: semua relawan harus sudah diabsen
      const belumDiabsen = items.filter(i => i.hadir === null);
      if (belumDiabsen.length > 0) {
        throw new Error(`${belumDiabsen.length} relawan belum diabsen. Lengkapi semua sebelum menyimpan.`);
      }

      const validItems = items.filter(i => i.hadir !== null).map(i => ({
        sppg_id: sppgId,
        tanggal,
        relawan_id: i.relawan_id,
        hadir: i.hadir,
        keterangan: i.keterangan || null,
      }));

      // UPSERT (bukan insert) — handle konflik offline
      if (validItems.length > 0) {
        const { error } = await supabase
          .from('absensi')
          .upsert(validItems, { onConflict: 'sppg_id,tanggal,relawan_id' });
        if (error) throw error;
      }

      // Auto-hitung insentif: upsert insentif_harian per relawan yang hadir
      const insentifErrors: string[] = [];
      for (const item of items) {
        try {
          if (item.hadir === true) {
            const jumlah = rates[item.relawan_id] ?? 0;
            const { error } = await supabase
              .from('insentif_harian')
              .upsert({
                sppg_id: sppgId,
                tanggal,
                relawan_id: item.relawan_id,
                jumlah,
                sudah_dibayar: false,
              }, { onConflict: 'sppg_id,tanggal,relawan_id' });
            if (error) insentifErrors.push(error.message);
          } else if (item.hadir === false) {
            // Hapus insentif yang belum dibayar (tidak hadir = tidak berhak)
            await supabase
              .from('insentif_harian')
              .delete()
              .match({ sppg_id: sppgId, tanggal, relawan_id: item.relawan_id, sudah_dibayar: false });
          }
        } catch (e: any) {
          insentifErrors.push(e.message);
        }
      }

      if (insentifErrors.length > 0) {
        console.warn('[useSaveAbsensi] Beberapa insentif gagal diupdate:', insentifErrors);
      }

      const hadirCount = items.filter(i => i.hadir === true).length;
      return { hadirCount };
    },
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ['absensi', vars.sppgId, vars.tanggal] });
      qc.invalidateQueries({ queryKey: ['absensi_check', vars.sppgId, vars.tanggal] });
      qc.invalidateQueries({ queryKey: ['insentif', vars.sppgId] });
      toast.sukses(
        'Absensi Tersimpan ✓',
        `Insentif ${result.hadirCount} relawan dihitung otomatis`,
      );
    },
    onError: (err: any) => {
      toast.error('Gagal Simpan Absensi', err?.message || 'Terjadi kesalahan. Coba lagi.');
    },
  });
}
