import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/store/toastStore';
import type { Relawan } from '@/types';
import { validateNIK, validateHP, validateRateInsentif } from '@/lib/utils';

const DEFAULT_QUERY_OPTIONS = {
  staleTime: 60_000,
  gcTime: 300_000,
  retry: 1,
  refetchOnWindowFocus: false,
};

// ─── List relawan aktif ───────────────────────────────────────────────────────

export function useRelawanList(sppgId: string | undefined, tampilkanNonaktif = false) {
  return useQuery<Relawan[]>({
    queryKey: ['relawan', sppgId, tampilkanNonaktif],
    enabled: !!sppgId,
    ...DEFAULT_QUERY_OPTIONS,
    queryFn: async () => {
      // BGN Demo Data - Mocked for Presentation
      const mockData: Relawan[] = [
        { id: '1', sppg_id: sppgId!, nama: 'Siti Aminah', nik: '3201010001', no_hp: '08123456780', hp: '08123456780', jabatan: 'jurutama_masak', rate_insentif: 125000, bpjs_aktif: true, desil: '1', aktif: true, created_at: '', updated_at: '', dokumen: { ktp: true, npwp: true, sertifikat_gizi: true, bpjs: true, buku_tabungan: true } },
        { id: '2', sppg_id: sppgId!, nama: 'Budi Santoso', nik: '3201010002', no_hp: '08123456781', hp: '08123456781', jabatan: 'kepala_sppg', rate_insentif: 200000, bpjs_aktif: true, desil: '3', aktif: true, created_at: '', updated_at: '', dokumen: { ktp: true, npwp: true, sertifikat_gizi: false, bpjs: true, buku_tabungan: true } },
        { id: '3', sppg_id: sppgId!, nama: 'Dewi Lestari', nik: '3201010003', no_hp: '08123456782', hp: '08123456782', jabatan: 'pengawas_gizi', rate_insentif: 150000, bpjs_aktif: true, desil: '2', aktif: true, created_at: '', updated_at: '', dokumen: { ktp: true, npwp: true, sertifikat_gizi: true, bpjs: true, buku_tabungan: true } },
        { id: '4', sppg_id: sppgId!, nama: 'Ahmad Faisal', nik: '3201010004', no_hp: '08123456783', hp: '08123456783', jabatan: 'pengawas_keuangan', rate_insentif: 150000, bpjs_aktif: true, desil: '3', aktif: true, created_at: '', updated_at: '', dokumen: { ktp: true, npwp: true, sertifikat_gizi: false, bpjs: true, buku_tabungan: true } },
        { id: '5', sppg_id: sppgId!, nama: 'Rina Marlina', nik: '3201010005', no_hp: '08123456784', hp: '08123456784', jabatan: 'asisten_lapangan', rate_insentif: 100000, bpjs_aktif: true, desil: '1', aktif: true, created_at: '', updated_at: '', dokumen: { ktp: true, npwp: false, sertifikat_gizi: false, bpjs: true, buku_tabungan: true } },
        { id: '6', sppg_id: sppgId!, nama: 'Joko Widodo', nik: '3201010006', no_hp: '08123456785', hp: '08123456785', jabatan: 'asisten_lapangan', rate_insentif: 100000, bpjs_aktif: false, desil: '2', aktif: true, created_at: '', updated_at: '', dokumen: { ktp: true, npwp: false, sertifikat_gizi: false, bpjs: false, buku_tabungan: true } },
        { id: '7', sppg_id: sppgId!, nama: 'Sri Wahyuni', nik: '3201010007', no_hp: '08123456786', hp: '08123456786', jabatan: 'asisten_lapangan', rate_insentif: 100000, bpjs_aktif: true, desil: '1', aktif: true, created_at: '', updated_at: '', dokumen: { ktp: true, npwp: true, sertifikat_gizi: false, bpjs: true, buku_tabungan: true } },
        { id: '8', sppg_id: sppgId!, nama: 'Yusuf Mansur', nik: '3201010008', no_hp: '08123456787', hp: '08123456787', jabatan: 'asisten_lapangan', rate_insentif: 100000, bpjs_aktif: true, desil: '1', aktif: false, created_at: '', updated_at: '', dokumen: { ktp: true, npwp: false, sertifikat_gizi: false, bpjs: true, buku_tabungan: true } },
      ];
      
      // Simulasikan delay network
      await new Promise(r => setTimeout(r, 500));
      let arr = mockData;
      if (!tampilkanNonaktif) arr = arr.filter(r => r.aktif);
      return arr;
    },
  });
}

// ─── Statistik relawan ────────────────────────────────────────────────────────

export function useRelawanStats(sppgId: string | undefined) {
  const { data: list = [], isLoading } = useRelawanList(sppgId, true);
  const aktif = list.filter(r => r.aktif);
  const nonaktif = list.filter(r => !r.aktif);
  const desilSatu = aktif.filter(r => r.desil === '1').length;
  const desilDua = aktif.filter(r => r.desil === '2').length;
  const totalAktif = aktif.length;
  const persentaseDesil = totalAktif > 0 ? ((desilSatu + desilDua) / totalAktif) * 100 : 0;

  return {
    isLoading,
    totalAktif,
    totalNonaktif: nonaktif.length,
    desilSatu,
    desilDua,
    persentaseDesil: Math.round(persentaseDesil * 10) / 10,
    memenuhiSyarat: persentaseDesil >= 30,
  };
}

// ─── Single relawan by id ─────────────────────────────────────────────────────

export function useRelawanById(id: string | undefined) {
  return useQuery<Relawan | null>({
    queryKey: ['relawan', 'detail', id],
    enabled: !!id,
    ...DEFAULT_QUERY_OPTIONS,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('relawan')
          .select('*')
          .eq('id', id!)
          .single();
        if (error) throw error;
        return data as Relawan;
      } catch (err: any) {
        console.error('[useRelawanById]:', err);
        return null;
      }
    },
  });
}

// ─── Save (insert or update) dengan validasi ketat ───────────────────────────

export function useSaveRelawan() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Relawan> & { sppg_id: string }) => {
      // ── Validasi input ──
      const errors: string[] = [];
      if (payload.nik) {
        const nikErr = validateNIK(payload.nik);
        if (nikErr) errors.push(nikErr);
      }
      if (payload.no_hp) {
        const hpErr = validateHP(payload.no_hp);
        if (hpErr) errors.push(hpErr);
      }
      if (payload.rate_insentif !== undefined) {
        const rateErr = validateRateInsentif(payload.rate_insentif);
        if (rateErr) errors.push(rateErr);
      }
      if (payload.tgl_lahir) {
        const usia = Math.floor((Date.now() - new Date(payload.tgl_lahir).getTime()) / (365.25 * 24 * 3600 * 1000));
        if (usia < 17) errors.push('Usia relawan minimum 17 tahun');
        if (usia > 65) errors.push('Usia relawan maksimum 65 tahun');
      }

      if (errors.length > 0) throw new Error(errors.join('; '));

      // ── Cek duplikat NIK ──
      if (payload.nik) {
        const { data: existing } = await supabase
          .from('relawan')
          .select('id, nama')
          .eq('sppg_id', payload.sppg_id)
          .eq('nik', payload.nik)
          .neq('id', payload.id ?? 'new')
          .maybeSingle();
        if (existing) throw new Error(`NIK sudah terdaftar atas nama ${existing.nama}`);
      }

      if (payload.id) {
        const { id, ...rest } = payload;
        const { data, error } = await supabase
          .from('relawan')
          .update(rest)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('relawan')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data: any, vars) => {
      qc.invalidateQueries({ queryKey: ['relawan', vars.sppg_id] });
      qc.invalidateQueries({ queryKey: ['relawan', 'detail'] });
      toast.sukses(
        'Relawan Tersimpan ✓',
        vars.id ? `Data ${data?.nama} berhasil diperbarui` : `${data?.nama} berhasil didaftarkan`,
      );
    },
    onError: (err: any) => {
      toast.error('Gagal Simpan Relawan', err?.message || 'Terjadi kesalahan. Coba lagi.');
    },
  });
}

// ─── Toggle aktif/nonaktif ────────────────────────────────────────────────────

export function useToggleAktifRelawan() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, aktif, sppg_id }: { id: string; aktif: boolean; sppg_id: string }) => {
      const { error } = await supabase
        .from('relawan')
        .update({ aktif })
        .eq('id', id);
      if (error) throw error;
      return { aktif, sppg_id };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['relawan', result.sppg_id] });
      toast.sukses(
        result.aktif ? 'Relawan Diaktifkan' : 'Relawan Dinonaktifkan',
        result.aktif ? 'Relawan kembali aktif bertugas.' : 'Relawan tidak lagi terdaftar aktif.',
      );
    },
    onError: (err: any) => {
      toast.error('Gagal', err?.message || 'Gagal mengubah status relawan.');
    },
  });
}
