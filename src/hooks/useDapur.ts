import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// ─── TIMELINE PRODUKSI ───
export function useTimelineProduksi(sppgId: string | undefined, tanggal: string) {
  return useQuery({
    queryKey: ['timeline', sppgId, tanggal],
    enabled: !!sppgId && !!tanggal,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timeline_produksi')
        .select('*')
        .eq('sppg_id', sppgId!)
        .eq('tanggal', tanggal);
      
      // Jika error tidak fatal (misal tabel belum ada), kembalikan array kosong agar UI tetap jalan
      if (error && error.code !== 'PGRST116') console.error(error);
      return data || [];
    }
  });
}

export function useUpdateTimeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase.from('timeline_produksi').upsert(payload, { onConflict: 'sppg_id,tanggal,step_id' });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['timeline', vars.sppg_id, vars.tanggal] });
    }
  });
}

// ─── KEJADIAN MENONJOL (DARURAT) ───
export function useLaporKM() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase.from('kejadian_menonjol').insert(payload);
      if (error) throw error;
    }
  });
}

// ─── FOOD SAMPLE ───
export function useCekFoodSample(sppgId: string | undefined, tanggal: string) {
  return useQuery({
    queryKey: ['food_sample', sppgId, tanggal],
    enabled: !!sppgId && !!tanggal,
    queryFn: async () => {
      const { data } = await supabase.from('food_sample').select('batch_ke').eq('sppg_id', sppgId!).eq('tanggal', tanggal);
      return (data || []).map(d => d.batch_ke);
    }
  });
}

export function useLaporFoodSample() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase.from('food_sample').insert(payload);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['food_sample', vars.sppg_id, vars.tanggal] });
    }
  });
}

// ─── QC ORGANOLEPTIK ───
export function useQCRiwayat(sppgId: string | undefined) {
  return useQuery({
    queryKey: ['qc_riwayat', sppgId],
    enabled: !!sppgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qc_organoleptik')
        .select('*')
        .eq('sppg_id', sppgId!)
        .order('tanggal', { ascending: false })
        .limit(20);
      
      if (error && error.code !== 'PGRST116') console.error(error);
      return data || [];
    }
  });
}

export function useSaveQC() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase.from('qc_organoleptik').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qc_riwayat'] });
    }
  });
}
