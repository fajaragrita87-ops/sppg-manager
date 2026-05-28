/**
 * laporan-keuangan.ts — Generator semua laporan keuangan.
 * Bahasa tampil ke user: Indonesia sederhana, bukan jargon akuntansi.
 */
import { supabase } from './supabase';
import { getAllAkunDenganSaldo } from './accounting-engine';

// ─── NERACA (Laporan Posisi Keuangan) ────────────────────────

export async function generateNeraca(sppgId: string, tanggal: string) {
  const all = await getAllAkunDenganSaldo(sppgId, tanggal);

  const aset      = all.filter((a: any) => a.tipe === 'aset'      && a.level > 1);
  const liabilitas = all.filter((a: any) => a.tipe === 'liabilitas' && a.level > 1);
  const ekuitas   = all.filter((a: any) => a.tipe === 'ekuitas'   && a.level > 1);

  const totalAset      = aset.reduce((s: number, x: any) => s + (x.saldo || 0), 0);
  const totalLiabilitas = liabilitas.reduce((s: number, x: any) => s + (x.saldo || 0), 0);
  const totalEkuitas   = ekuitas.reduce((s: number, x: any) => s + (x.saldo || 0), 0);

  return {
    judul: 'Laporan Posisi Keuangan',
    tanggal,
    aset:      { items: aset,       total: totalAset },
    liabilitas: { items: liabilitas, total: totalLiabilitas },
    ekuitas:   { items: ekuitas,    total: totalEkuitas },
    balance:   Math.abs(totalAset - (totalLiabilitas + totalEkuitas)) < 1,
  };
}

// ─── LAPORAN SURPLUS/DEFISIT ──────────────────────────────────

export async function generateLaporanSurplusDefisit(sppgId: string, tanggalMulai: string, tanggalSelesai: string) {
  const { data: details } = await supabase
    .from('jurnal_detail')
    .select('debit, kredit, akun!inner(kode, nama, nama_tampil, tipe, sub_tipe, normal_balance, urutan), jurnal!inner(tanggal, status, sppg_id)')
    .eq('jurnal.sppg_id', sppgId).eq('jurnal.status', 'posted')
    .gte('jurnal.tanggal', tanggalMulai).lte('jurnal.tanggal', tanggalSelesai);

  const saldoMap: Record<string, { akun: any; saldo: number }> = {};
  (details || []).forEach((d: any) => {
    if (!['pendapatan', 'beban'].includes(d.akun.tipe)) return;
    const key = d.akun.kode;
    if (!saldoMap[key]) saldoMap[key] = { akun: d.akun, saldo: 0 };
    const net = (d.debit || 0) - (d.kredit || 0);
    saldoMap[key].saldo += d.akun.normal_balance === 'debit' ? net : -net;
  });

  const pendapatan  = Object.values(saldoMap).filter((x: any) => x.akun.tipe === 'pendapatan');
  const beban       = Object.values(saldoMap).filter((x: any) => x.akun.tipe === 'beban');

  const totalPendapatan = pendapatan.reduce((s: number, x: any) => s + x.saldo, 0);
  const bebanBahan  = beban.filter((x: any) => x.akun.kode.startsWith('5-1'));
  const bebanSDM    = beban.filter((x: any) => x.akun.kode.startsWith('5-2'));
  const bebanOps    = beban.filter((x: any) => x.akun.kode.startsWith('5-3'));
  const bebanAdmin  = beban.filter((x: any) => x.akun.kode.startsWith('5-4'));
  const totalBeban  = beban.reduce((s: number, x: any) => s + x.saldo, 0);

  return {
    judul: 'Laporan Penggunaan Dana',
    periode: `${tanggalMulai} s/d ${tanggalSelesai}`,
    pendapatan: { items: pendapatan, total: totalPendapatan },
    beban: {
      bahan_baku:   { items: bebanBahan,  total: bebanBahan.reduce((s: number, x: any) => s + x.saldo, 0) },
      sdm:          { items: bebanSDM,    total: bebanSDM.reduce((s: number, x: any) => s + x.saldo, 0) },
      operasional:  { items: bebanOps,    total: bebanOps.reduce((s: number, x: any) => s + x.saldo, 0) },
      administrasi: { items: bebanAdmin,  total: bebanAdmin.reduce((s: number, x: any) => s + x.saldo, 0) },
      total: totalBeban,
    },
    surplus_defisit: totalPendapatan - totalBeban,
    status: (totalPendapatan - totalBeban) >= 0 ? 'surplus' : 'defisit',
  };
}

// ─── LAPORAN ARUS KAS ────────────────────────────────────────

export async function generateLaporanArusKas(sppgId: string, tanggalMulai: string, tanggalSelesai: string) {
  const { data: jurnals } = await supabase
    .from('jurnal')
    .select('id, ref_tipe, deskripsi, tanggal')
    .eq('sppg_id', sppgId).eq('status', 'posted')
    .gte('tanggal', tanggalMulai).lte('tanggal', tanggalSelesai);

  const byType = (tipe: string) =>
    (jurnals || []).filter((j: any) => j.ref_tipe === tipe).length;

  // Ambil total dari jurnal_detail berdasarkan ref_tipe
  const getTotal = async (refTipe: string, field: 'debit' | 'kredit') => {
    const jIds = (jurnals || []).filter((j: any) => j.ref_tipe === refTipe).map((j: any) => j.id);
    if (!jIds.length) return 0;
    const { data } = await supabase.from('jurnal_detail').select('debit, kredit').in('jurnal_id', jIds);
    return (data || []).reduce((s: number, d: any) => s + (d[field] || 0), 0);
  };

  const [danaBGN, insentifFas, keluarBahan, keluarOps, keluarInsentif, keluarPetty] = await Promise.all([
    getTotal('kas_masuk', 'debit'),
    getTotal('insentif_fasilitas', 'debit'),
    getTotal('belanja_bahan', 'kredit'),
    getTotal('operasional', 'kredit'),
    getTotal('insentif', 'kredit'),
    getTotal('petty_cash', 'kredit'),
  ]);

  const totalMasuk  = danaBGN + insentifFas;
  const totalKeluar = keluarBahan + keluarOps + keluarInsentif + keluarPetty;

  return {
    judul: 'Laporan Aliran Dana',
    periode: `${tanggalMulai} s/d ${tanggalSelesai}`,
    masuk:  { dana_bgn: danaBGN, insentif_fasilitas: insentifFas, total: totalMasuk },
    keluar: { bahan_baku: keluarBahan, operasional: keluarOps, insentif_relawan: keluarInsentif, petty_cash: keluarPetty, total: totalKeluar },
    arus_kas_bersih: totalMasuk - totalKeluar,
    status: (totalMasuk - totalKeluar) >= 0 ? 'positif' : 'negatif',
  };
}

// ─── TRIAL BALANCE (Neraca Saldo) ────────────────────────────

export async function generateTrialBalance(sppgId: string, sampaiTanggal: string) {
  const all = await getAllAkunDenganSaldo(sppgId, sampaiTanggal);
  const aktif = all.filter((a: any) => a.total_debit > 0 || a.total_kredit > 0);
  const totalDebit  = aktif.reduce((s: number, r: any) => s + r.total_debit, 0);
  const totalKredit = aktif.reduce((s: number, r: any) => s + r.total_kredit, 0);
  return {
    judul: 'Neraca Saldo (Trial Balance)',
    sampai_tanggal: sampaiTanggal,
    akuns: aktif,
    total_debit: totalDebit,
    total_kredit: totalKredit,
    balance: Math.abs(totalDebit - totalKredit) < 1,
  };
}

// ─── BUKU BESAR PER AKUN ─────────────────────────────────────

export async function getBukuBesar(sppgId: string, akunKode: string, tanggalMulai: string, tanggalSelesai: string) {
  const { data: akun } = await supabase.from('akun').select('*').eq('sppg_id', sppgId).eq('kode', akunKode).single();
  if (!akun) return null;

  const { data: entries } = await supabase
    .from('jurnal_detail')
    .select('*, jurnal!inner(no_jurnal, tanggal, deskripsi, ref_tipe, status)')
    .eq('akun_id', akun.id).eq('jurnal.status', 'posted')
    .gte('jurnal.tanggal', tanggalMulai).lte('jurnal.tanggal', tanggalSelesai)
    .order('jurnal.tanggal');

  let saldoBerjalan = 0;
  const rows = (entries || []).map((e: any) => {
    const net = akun.normal_balance === 'debit'
      ? (e.debit || 0) - (e.kredit || 0)
      : (e.kredit || 0) - (e.debit || 0);
    saldoBerjalan += net;
    return { ...e, saldo_berjalan: saldoBerjalan };
  });
  return { akun, entries: rows, saldo_akhir: saldoBerjalan };
}

// ─── ANGGARAN VS REALISASI ────────────────────────────────────

export async function getAnggaranVsRealisasi(sppgId: string, tahun: number, bulan: number) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const tglMulai   = `${tahun}-${pad(bulan)}-01`;
  const tglSelesai = new Date(tahun, bulan, 0).toISOString().split('T')[0];

  const { data: anggaran } = await supabase.from('anggaran')
    .select('*, akun!inner(nama, nama_tampil, tipe, kode)')
    .eq('sppg_id', sppgId).eq('tahun', tahun).eq('bulan', bulan);

  return Promise.all((anggaran || []).map(async (a: any) => {
    const bb = await getBukuBesar(sppgId, a.akun.kode, tglMulai, tglSelesai);
    const real = bb?.saldo_akhir || 0;
    const pct  = a.jumlah > 0 ? Math.round((real / a.jumlah) * 100) : 0;
    return {
      akun: a.akun, anggaran: a.jumlah, realisasi: real,
      varians: a.jumlah - real, persentase: pct,
      status: pct > 110 ? 'over' : pct > 90 ? 'on_track' : 'under',
    };
  }));
}
