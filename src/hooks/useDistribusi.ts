import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// ─── BUAT MANIFEST (MASTER DATA) ───
export function useMasterDistribusi(sppgId: string | undefined, tanggal: string) {
  return useQuery({
    queryKey: ['master_distribusi', sppgId, tanggal],
    enabled: !!sppgId && !!tanggal,
    queryFn: async () => {
      // 1. Ambil relawan hadir (distribusi)
      const { data: relawan } = await supabase.from('relawan')
        .select('id, nama, jabatan')
        .eq('sppg_id', sppgId!)
        .eq('aktif', true)
        .eq('jabatan', 'distribusi');
      
      const { data: absensi } = await supabase.from('absensi').select('relawan_id, hadir').eq('tanggal', tanggal);
      const rHadir = new Set((absensi || []).filter(a => a.hadir).map(a => a.relawan_id));
      const drivers = (relawan || []).filter(r => rHadir.has(r.id));

      // 2. Ambil kendaraan
      const { data: kendaraan } = await supabase.from('kendaraan').select('*').eq('sppg_id', sppgId!);

      // 3. Ambil data satdik
      const { data: satdik } = await supabase.from('satuan_pendidikan').select('*').eq('sppg_id', sppgId!);
      
      // Jika kosong (karena ini purwarupa), beri dummy data untuk UI
      const dummySatdik = satdik?.length ? satdik : [
        { id: 's1', nama: 'SDN 01 Pagi', kategori: 'SD 1-3', siswa: 120 },
        { id: 's2', nama: 'SDN 02 Pagi', kategori: 'SD 4-6', siswa: 210 },
        { id: 's3', nama: 'Posyandu Melati', kategori: 'Balita/Bumil', siswa: 45 },
      ];

      return { drivers, kendaraan: kendaraan || [], satdik: dummySatdik };
    }
  });
}

export function useBuatManifest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      // 1. Insert manifest utama
      const { data: manifest, error: e1 } = await supabase.from('manifest_distribusi').insert({
        sppg_id: payload.sppg_id,
        tanggal: payload.tanggal,
        kendaraan_id: payload.kendaraan_id || null,
        driver_id: payload.driver_id,
        batch_ke: payload.batch_ke,
        jam_berangkat: payload.jam_berangkat,
        status: 'jalan'
      }).select('id').single();

      if (e1) throw e1;

      // 2. Insert tujuan
      const detail = payload.tujuan.map((t: any) => ({
        manifest_id: manifest.id,
        satdik_id: t.satdik_id,
        porsi_rencana: t.porsi_rencana,
        porsi_aktual_bawa: t.porsi_aktual_bawa,
        status: 'pending'
      }));

      const { error: e2 } = await supabase.from('manifest_tujuan').insert(detail);
      if (e2) throw e2;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['manifest_aktif', vars.sppg_id, vars.tanggal] });
    }
  });
}

// ─── UPDATE STATUS MANIFEST ───
export function useManifestAktif(sppgId: string | undefined, tanggal: string) {
  return useQuery({
    queryKey: ['manifest_aktif', sppgId, tanggal],
    enabled: !!sppgId && !!tanggal,
    queryFn: async () => {
      // Dummy response karena struktur tabel mungkin belum komplit di db user
      // Query aslinya akan di-join dengan tabel tujuan
      const { data: manifests } = await supabase.from('manifest_distribusi')
        .select('*, driver:relawan(nama), kendaraan(nopol)')
        .eq('sppg_id', sppgId!)
        .eq('tanggal', tanggal)
        .eq('status', 'jalan');
        
      if (!manifests || manifests.length === 0) return [];

      const mIds = manifests.map(m => m.id);
      const { data: tujuans } = await supabase.from('manifest_tujuan').select('*').in('manifest_id', mIds);

      // Map dummy satdik names
      const dSatdik: Record<string, string> = { 's1': 'SDN 01 Pagi', 's2': 'SDN 02 Pagi', 's3': 'Posyandu Melati' };

      return manifests.map(m => ({
        ...m,
        tujuan: (tujuans || []).filter(t => t.manifest_id === m.id).map(t => ({
          ...t,
          nama_satdik: t.satdik?.nama || dSatdik[t.satdik_id] || t.satdik_id
        }))
      }));
    }
  });
}

export function useKonfirmasiTujuan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase.from('manifest_tujuan').update({
        jam_tiba: payload.jam_tiba,
        nama_penerima: payload.nama_penerima,
        porsi_diterima: payload.porsi_diterima,
        qc_ok: payload.qc_ok,
        status: 'sampai'
      }).eq('id', payload.tujuan_id);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['manifest_aktif'] });
      qc.invalidateQueries({ queryKey: ['manifest_riwayat'] });
    }
  });
}

export function useSelesaikanManifest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (manifestId: string) => {
      const { error } = await supabase.from('manifest_distribusi').update({ status: 'selesai', jam_kembali: new Date().toTimeString().substring(0,5) }).eq('id', manifestId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['manifest_aktif'] });
      qc.invalidateQueries({ queryKey: ['manifest_riwayat'] });
    }
  });
}

// ─── RIWAYAT ───
export function useRiwayatDistribusi(sppgId: string | undefined) {
  return useQuery({
    queryKey: ['manifest_riwayat', sppgId],
    enabled: !!sppgId,
    queryFn: async () => {
      const { data } = await supabase.from('manifest_distribusi')
        .select('*, driver:relawan(nama)')
        .eq('sppg_id', sppgId!)
        .order('tanggal', { ascending: false })
        .limit(20);
        
      if (!data) return [];
      
      const mIds = data.map(m => m.id);
      const { data: tujuans } = await supabase.from('manifest_tujuan').select('*').in('manifest_id', mIds);
      
      return data.map(m => {
        const tj = (tujuans || []).filter(t => t.manifest_id === m.id);
        const totalPorsi = tj.reduce((acc, t) => acc + (t.porsi_diterima || 0), 0);
        const masalah = tj.some(t => t.qc_ok === false || (t.porsi_diterima !== t.porsi_rencana && t.status === 'sampai'));
        
        return {
          ...m,
          jml_tujuan: tj.length,
          total_porsi: totalPorsi,
          ada_masalah: masalah
        };
      });
    }
  });
}
