import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatRupiah, formatTanggal, generateNoBukti } from '@/lib/utils';
import { JABATAN_LABELS } from '@/types';
import { toast } from '@/store/toastStore';

const DEFAULT_QUERY_OPTIONS = {
  staleTime: 30_000,
  gcTime: 300_000,
  retry: 1,
  refetchOnWindowFocus: false,
};

export interface InsentifSummary {
  relawan_id: string;
  nama: string;
  jabatan: string;
  bpjs_aktif: boolean;
  rate_hari: number;
  hari_hadir: number;
  total_insentif: number;
  bpjs_jkk: number;    // 0.24% × upah
  bpjs_jkm: number;    // 0.30% × upah
  sudah_dibayar: boolean;
  ids: string[];
}

// ─── hitungInsentifPJSatdik (sesuai Tabel 3 Juknis BGN 2026) ─────────────────

export function hitungInsentifPJSatdik(jumlahSiswa: number): number {
  if (jumlahSiswa <= 0) return 0;
  if (jumlahSiswa <= 100) return 20_000;
  if (jumlahSiswa <= 500) return 30_000;
  if (jumlahSiswa <= 750) return 50_000;
  if (jumlahSiswa <= 1_000) return 60_000;
  if (jumlahSiswa <= 2_000) return 100_000;
  if (jumlahSiswa <= 3_000) return 200_000;
  return 200_000; // max per juknis
}

// ─── hitungBPJS (0.24% JKK + 0.30% JKM) ────────────────────────────────────

export function hitungBPJS(upahSebulan: number): { jkk: number; jkm: number; total: number } {
  const jkk = Math.round(upahSebulan * 0.0024);
  const jkm = Math.round(upahSebulan * 0.0030);
  return { jkk, jkm, total: jkk + jkm };
}

// ─── hitungInsentifKaderPosyandu ────────────────────────────────────────────

export function hitungInsentifKaderPosyandu(totalPmPosyandu: number, hariOperasional: number): number {
  return 1_000 * totalPmPosyandu * hariOperasional;
}

// ─── hitungInsentifFasilitas ────────────────────────────────────────────────

export function hitungInsentifFasilitas(hariOperasionalAktual: number): number {
  return 6_000_000 * hariOperasionalAktual;
}

// ─── useInsentifPeriode ───────────────────────────────────────────────────────

export function useInsentifPeriode(
  sppgId: string | undefined,
  startDate: string,
  endDate: string,
) {
  return useQuery({
    queryKey: ['insentif', sppgId, startDate, endDate],
    enabled: !!sppgId && !!startDate && !!endDate,
    ...DEFAULT_QUERY_OPTIONS,
    queryFn: async () => {
      try {
        const { data: relawan } = await supabase
          .from('relawan')
          .select('id, nama, jabatan, bpjs_aktif, rate_insentif')
          .eq('sppg_id', sppgId!);

        const rMap = new Map((relawan || []).map(r => [r.id, r]));

        const { data: insentif, error } = await supabase
          .from('insentif_harian')
          .select('*')
          .eq('sppg_id', sppgId!)
          .gte('tanggal', startDate)
          .lte('tanggal', endDate);

        if (error) throw error;

        const summaryMap = new Map<string, InsentifSummary>();

        (insentif || []).forEach(i => {
          if (!summaryMap.has(i.relawan_id)) {
            const r = rMap.get(i.relawan_id);
            const rate = r?.rate_insentif || 0;
            summaryMap.set(i.relawan_id, {
              relawan_id: i.relawan_id,
              nama: r?.nama || 'Relawan Dihapus',
              jabatan: r?.jabatan || '-',
              bpjs_aktif: !!r?.bpjs_aktif,
              rate_hari: rate,
              hari_hadir: 0,
              total_insentif: 0,
              bpjs_jkk: 0,
              bpjs_jkm: 0,
              sudah_dibayar: true,
              ids: [],
            });
          }

          const sum = summaryMap.get(i.relawan_id)!;
          sum.hari_hadir += 1;
          // Total dihitung dari jumlah actual di DB (bukan rate × hari) untuk akurasi
          sum.total_insentif += (i.jumlah || 0);
          if (!i.sudah_dibayar) sum.sudah_dibayar = false;
          sum.ids.push(i.id);
        });

        // Hitung BPJS per relawan setelah semua insentif terkumpul
        summaryMap.forEach(sum => {
          if (sum.bpjs_aktif) {
            const bpjs = hitungBPJS(sum.total_insentif);
            sum.bpjs_jkk = bpjs.jkk;
            sum.bpjs_jkm = bpjs.jkm;
          }
        });

        return Array.from(summaryMap.values()).sort((a, b) => a.nama.localeCompare(b.nama));
      } catch (err: any) {
        console.error('[useInsentifPeriode]:', err);
        throw err;
      }
    },
  });
}

// ─── useBayarInsentif ────────────────────────────────────────────────────────

export function useBayarInsentif() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sppgId,
      ids,
      metode,
      tanggal,
      namaRelawan,
    }: {
      sppgId: string;
      ids: string[];
      metode: 'tunai' | 'transfer';
      tanggal: string;
      namaRelawan?: string;
    }) => {
      if (ids.length === 0) throw new Error('Tidak ada data insentif untuk dibayar');

      // 1. Update status dibayar
      const { error } = await supabase
        .from('insentif_harian')
        .update({ sudah_dibayar: true, metode_bayar: metode, dibayar_at: new Date().toISOString() })
        .in('id', ids);
      if (error) throw error;

      // 2. Hitung total yang baru saja dibayar
      const { data: insentifs } = await supabase
        .from('insentif_harian')
        .select('jumlah')
        .in('id', ids);
      const total = (insentifs || []).reduce((acc, curr) => acc + (curr.jumlah || 0), 0);

      // 3. Insert ke kas_besar dengan no_bukti yang proper
      if (total > 0) {
        const { count } = await supabase
          .from('kas_besar')
          .select('*', { count: 'exact', head: true })
          .eq('sppg_id', sppgId)
          .eq('kategori', 'insentif_relawan');
        const urutan = (count ?? 0) + 1;
        const no_bukti = generateNoBukti('insentif_relawan', tanggal, urutan);

        await supabase.from('kas_besar').insert({
          sppg_id: sppgId,
          kategori: 'insentif_relawan',
          tipe: 'keluar',
          kredit: total,
          debet: 0,
          nominal: total,
          tanggal,
          no_bukti,
          uraian: `Pembayaran insentif relawan (${metode})${namaRelawan ? ` — ${namaRelawan}` : ''}`,
        });
      }

      return { total, count: ids.length };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['insentif'] });
      qc.invalidateQueries({ queryKey: ['kas_besar'] });
      toast.sukses(
        'Insentif Dibayar ✓',
        `${result.count} record insentif (${formatRupiah(result.total)}) sudah ditandai dibayar`,
      );
    },
    onError: (err: any) => {
      toast.error('Gagal Bayar Insentif', err?.message || 'Terjadi kesalahan. Coba lagi.');
    },
  });
}

// ─── generateNominatifPDF ─────────────────────────────────────────────────────

export function generateNominatifPDF(
  sppgNama: string,
  periode: string,
  data: InsentifSummary[],
  biayaLain: {
    pm_harian: number;
    hari_ops: number;
    satdik: any[];
    totalPJSatdik: number;
    bpjs: number;
  },
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DAFTAR NOMINATIF PEMBAYARAN INSENTIF RELAWAN', pageWidth / 2, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Unit Pelayanan: ${sppgNama}`, 14, 25);
  doc.text(`Periode: ${periode}`, 14, 30);
  doc.text(`Tanggal Cetak: ${formatTanggal(new Date())}`, 14, 35);

  const tableData = data.map((row, index) => [
    index + 1,
    row.nama,
    JABATAN_LABELS[row.jabatan as any] || row.jabatan,
    row.hari_hadir.toString(),
    formatRupiah(row.rate_hari),
    formatRupiah(row.total_insentif),
    row.bpjs_aktif ? formatRupiah(row.bpjs_jkk + row.bpjs_jkm) : '-',
    '', // Tanda tangan
  ]);

  const totalSemua = data.reduce((acc, r) => acc + r.total_insentif, 0);
  const totalBPJS = data.reduce((acc, r) => acc + r.bpjs_jkk + r.bpjs_jkm, 0);

  autoTable(doc, {
    startY: 40,
    head: [['No', 'Nama Relawan', 'Jabatan', 'Hari', 'Rate/Hari', 'Total Insentif', 'BPJS', 'Tanda Tangan']],
    body: tableData,
    foot: [['', '', '', '', 'TOTAL', formatRupiah(totalSemua), formatRupiah(totalBPJS), '']],
    theme: 'grid',
    headStyles: { fillColor: [30, 111, 191] },
    styles: { fontSize: 8 },
    columnStyles: { 7: { minCellWidth: 30 } },
  });

  let finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Rekapitulasi Biaya SDM Lainnya:', 14, finalY);
  doc.setFont('helvetica', 'normal');
  const totalKader = hitungInsentifKaderPosyandu(biayaLain.pm_harian, biayaLain.hari_ops);
  doc.text(`1. Insentif PJ Satuan Pendidikan (${biayaLain.satdik.length} Sekolah): ${formatRupiah(biayaLain.totalPJSatdik)}`, 14, finalY + 7);
  doc.text(`2. Insentif Kader Posyandu (Rp1.000 × ${biayaLain.pm_harian} PM × ${biayaLain.hari_ops} Hari): ${formatRupiah(totalKader)}`, 14, finalY + 14);
  doc.text(`3. Iuran BPJS Ketenagakerjaan (JKK 0.24% + JKM 0.30%): ${formatRupiah(biayaLain.bpjs)}`, 14, finalY + 21);
  doc.setFont('helvetica', 'bold');
  const grandTotal = totalSemua + biayaLain.totalPJSatdik + totalKader + biayaLain.bpjs;
  doc.text(`GRAND TOTAL BIAYA SDM: ${formatRupiah(grandTotal)}`, 14, finalY + 31);

  const sigY = finalY + 45;
  doc.setFont('helvetica', 'normal');
  doc.text('Dibuat Oleh,', 30, sigY);
  doc.text('Disetujui Oleh,', pageWidth - 70, sigY);
  doc.setFont('helvetica', 'bold');
  doc.text('Pengawas Keuangan', 25, sigY + 25);
  doc.text('Kepala SPPG', pageWidth - 65, sigY + 25);

  doc.save(`Nominatif_Insentif_${periode.replace(/ /g, '_')}.pdf`);
  toast.sukses('PDF Siap', 'File nominatif insentif sedang diunduh...');
}
