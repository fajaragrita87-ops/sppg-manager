import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface JadwalShift {
  id?: string;
  relawan_id: string;
  sppg_id: string;
  tanggal: string;
  zona_id: string | null;
  jam_mulai: string | null;
  jam_selesai: string | null;
}

export function useJadwalMingguan(sppgId: string | undefined, startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['jadwal_shift', sppgId, startDate, endDate],
    enabled: !!sppgId && !!startDate && !!endDate,
    queryFn: async () => {
      // Ambil relawan aktif
      const { data: relawan, error: errRelawan } = await supabase
        .from('relawan')
        .select('id, nama, jabatan')
        .eq('sppg_id', sppgId!)
        .eq('aktif', true);
      if (errRelawan) throw errRelawan;

      // Ambil jadwal dalam rentang tanggal
      const { data: jadwal, error: errJadwal } = await supabase
        .from('jadwal_shift')
        .select('*')
        .eq('sppg_id', sppgId!)
        .gte('tanggal', startDate)
        .lte('tanggal', endDate);
      if (errJadwal) throw errJadwal;

      return { relawan: relawan || [], jadwal: jadwal || [] };
    }
  });
}

export function useSaveJadwalShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: JadwalShift) => {
      if (payload.zona_id === 'libur' || !payload.zona_id) {
        // Hapus jika diset libur
        await supabase.from('jadwal_shift')
          .delete()
          .match({ sppg_id: payload.sppg_id, relawan_id: payload.relawan_id, tanggal: payload.tanggal });
      } else {
        // Upsert jadwal
        const { error } = await supabase.from('jadwal_shift').upsert({
          sppg_id: payload.sppg_id,
          relawan_id: payload.relawan_id,
          tanggal: payload.tanggal,
          zona_id: payload.zona_id,
          jam_mulai: payload.jam_mulai,
          jam_selesai: payload.jam_selesai
        }, { onConflict: 'sppg_id,tanggal,relawan_id' });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jadwal_shift'] });
    }
  });
}

export function useCopyJadwalMingguLalu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sppgId, prevStart, currStart }: { sppgId: string, prevStart: string, currStart: string }) => {
      // 1. Fetch minggu lalu
      const d1 = new Date(prevStart);
      const d2 = new Date(d1); d2.setDate(d2.getDate() + 6);
      
      const { data: prevJadwal, error: errPrev } = await supabase
        .from('jadwal_shift')
        .select('*')
        .eq('sppg_id', sppgId)
        .gte('tanggal', d1.toISOString().split('T')[0])
        .lte('tanggal', d2.toISOString().split('T')[0]);
        
      if (errPrev) throw errPrev;
      if (!prevJadwal || prevJadwal.length === 0) throw new Error('Tidak ada data di minggu lalu.');

      // 2. Clone with new dates
      const newJadwal = prevJadwal.map(j => {
        const pd = new Date(j.tanggal);
        const diff = pd.getDate() - d1.getDate(); // 0 to 6
        
        const nd = new Date(currStart);
        nd.setDate(nd.getDate() + diff);
        
        return {
          sppg_id: j.sppg_id,
          relawan_id: j.relawan_id,
          tanggal: nd.toISOString().split('T')[0],
          zona_id: j.zona_id,
          jam_mulai: j.jam_mulai,
          jam_selesai: j.jam_selesai
        };
      });

      const { error } = await supabase.from('jadwal_shift').upsert(newJadwal, { onConflict: 'sppg_id,tanggal,relawan_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jadwal_shift'] });
    }
  });
}

// Untuk Layout Dapur: ambil jadwal hari ini + absensi
export function useJadwalHariIni(sppgId: string | undefined, tanggal: string) {
  return useQuery({
    queryKey: ['jadwal_hari_ini', sppgId, tanggal],
    enabled: !!sppgId && !!tanggal,
    queryFn: async () => {
      // 1. Relawan
      const { data: relawan } = await supabase.from('relawan').select('id, nama, jabatan').eq('sppg_id', sppgId!).eq('aktif', true);
      // 2. Jadwal
      const { data: jadwal } = await supabase.from('jadwal_shift').select('*').eq('sppg_id', sppgId!).eq('tanggal', tanggal);
      // 3. Absensi
      const { data: absensi } = await supabase.from('absensi').select('relawan_id, hadir').eq('sppg_id', sppgId!).eq('tanggal', tanggal);

      const rMap = new Map((relawan || []).map(r => [r.id, r]));
      const aMap = new Map((absensi || []).map(a => [a.relawan_id, a.hadir]));

      return (jadwal || []).map(j => {
        const r = rMap.get(j.relawan_id);
        return {
          ...j,
          nama: r?.nama || 'Unknown',
          jabatan: r?.jabatan || 'Unknown',
          hadir: aMap.get(j.relawan_id)
        };
      });
    }
  });
}
