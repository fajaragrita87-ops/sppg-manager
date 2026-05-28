/**
 * accounting-engine.ts — Double-entry accounting engine untuk SPPG Manager.
 * Semua jurnal dibuat otomatis. User tidak pernah lihat debit/kredit.
 */
import { supabase } from './supabase';

export interface JurnalLine {
  akun_kode: string;
  deskripsi?: string;
  debit: number;
  kredit: number;
}

export interface CreateJurnalParams {
  sppgId: string;
  tanggal: string;
  deskripsi: string;
  lines: JurnalLine[];
  refTipe?: string;
  refId?: string;
  dibuatOleh: string;
}

async function generateNoJurnal(sppgId: string, tanggal: string): Promise<string> {
  const [tahun, bulan] = tanggal.split('-');
  const prefix = `JU/${sppgId.slice(0, 8)}/${tahun}/${bulan}/`;
  const { count } = await supabase.from('jurnal').select('*', { count: 'exact', head: true })
    .eq('sppg_id', sppgId).like('no_jurnal', `${prefix}%`);
  return `${prefix}${String((count || 0) + 1).padStart(4, '0')}`;
}

function validasiBalance(lines: JurnalLine[]): boolean {
  const d = lines.reduce((s, l) => s + (l.debit || 0), 0);
  const k = lines.reduce((s, l) => s + (l.kredit || 0), 0);
  return Math.abs(d - k) < 0.01;
}

export async function buatJurnal(params: CreateJurnalParams): Promise<string | null> {
  const { sppgId, tanggal, deskripsi, lines, refTipe, refId, dibuatOleh } = params;
  if (!validasiBalance(lines)) throw new Error('Jurnal tidak balance!');

  const kodes = [...new Set(lines.map(l => l.akun_kode))];
  const { data: akuns } = await supabase.from('akun').select('id, kode')
    .eq('sppg_id', sppgId).in('kode', kodes);
  if (!akuns?.length) { console.warn('[Accounting] COA belum di-setup.'); return null; }

  const akunMap: Record<string, string> = {};
  akuns.forEach((a: any) => { akunMap[a.kode] = a.id; });

  const { data: jurnal, error: jErr } = await supabase.from('jurnal').insert({
    sppg_id: sppgId, tanggal, no_jurnal: await generateNoJurnal(sppgId, tanggal),
    deskripsi, ref_tipe: refTipe || null, ref_id: refId || null,
    dibuat_oleh: dibuatOleh, status: 'posted',
  }).select('id').single();
  if (jErr || !jurnal) { console.error('[Accounting]', jErr?.message); return null; }

  await supabase.from('jurnal_detail').insert(
    lines.filter(l => akunMap[l.akun_kode]).map((line, i) => ({
      jurnal_id: jurnal.id, akun_id: akunMap[line.akun_kode],
      deskripsi: line.deskripsi || deskripsi,
      debit: line.debit || 0, kredit: line.kredit || 0, urutan: i + 1,
    }))
  );
  return jurnal.id;
}

// ── Template Jurnal Otomatis ──────────────────────────────────

export async function jurnalTerimaDanaBGN(p: { sppgId: string; tanggal: string; jumlah: number; keterangan: string; userId: string; refId?: string }) {
  return buatJurnal({ sppgId: p.sppgId, tanggal: p.tanggal, deskripsi: `Penerimaan dana BGN — ${p.keterangan}`, refTipe: 'kas_masuk', refId: p.refId, dibuatOleh: p.userId,
    lines: [{ akun_kode: '1-1001', debit: p.jumlah, kredit: 0 }, { akun_kode: '4-0001', debit: 0, kredit: p.jumlah }] });
}

export async function jurnalTerimaInsentifFasilitas(p: { sppgId: string; tanggal: string; jumlah: number; periode: string; userId: string; refId?: string }) {
  return buatJurnal({ sppgId: p.sppgId, tanggal: p.tanggal, deskripsi: `Insentif fasilitas SPPG — ${p.periode}`, refTipe: 'insentif_fasilitas', refId: p.refId, dibuatOleh: p.userId,
    lines: [{ akun_kode: '1-1001', debit: p.jumlah, kredit: 0 }, { akun_kode: '4-0002', debit: 0, kredit: p.jumlah }] });
}

export async function jurnalBelanjaBahan(p: { sppgId: string; tanggal: string; jumlah: number; namaBahan: string; kategoriAkun?: string; metodeBayar: 'kas' | 'hutang'; userId: string; refId?: string }) {
  const akun = p.kategoriAkun || '5-1001';
  const kredit = p.metodeBayar === 'kas' ? '1-1001' : '2-1001';
  return buatJurnal({ sppgId: p.sppgId, tanggal: p.tanggal, deskripsi: `Belanja ${p.namaBahan}`, refTipe: 'belanja_bahan', refId: p.refId, dibuatOleh: p.userId,
    lines: [{ akun_kode: akun, debit: p.jumlah, kredit: 0 }, { akun_kode: kredit, debit: 0, kredit: p.jumlah }] });
}

export async function jurnalBayarOperasional(p: { sppgId: string; tanggal: string; jumlah: number; jenis: string; keterangan: string; userId: string; refId?: string }) {
  const map: Record<string, string> = { listrik: '5-3001', gas: '5-3002', air: '5-3003', internet: '5-3004', bbm: '5-3005', sewa_kendaraan: '5-3006', atk: '5-3007', apd: '5-3008', lainnya: '5-3099' };
  return buatJurnal({ sppgId: p.sppgId, tanggal: p.tanggal, deskripsi: `Bayar ${p.jenis} — ${p.keterangan}`, refTipe: 'operasional', refId: p.refId, dibuatOleh: p.userId,
    lines: [{ akun_kode: map[p.jenis] || '5-3099', debit: p.jumlah, kredit: 0 }, { akun_kode: '1-1001', debit: 0, kredit: p.jumlah }] });
}

export async function jurnalBayarInsentif(p: { sppgId: string; tanggal: string; jumlah: number; jumlahRelawan: number; periode: string; userId: string; refId?: string }) {
  return buatJurnal({ sppgId: p.sppgId, tanggal: p.tanggal, deskripsi: `Insentif ${p.jumlahRelawan} relawan periode ${p.periode}`, refTipe: 'insentif', refId: p.refId, dibuatOleh: p.userId,
    lines: [{ akun_kode: '5-2001', debit: p.jumlah, kredit: 0 }, { akun_kode: '1-1001', debit: 0, kredit: p.jumlah }] });
}

export async function jurnalBayarInsentifPJSatdik(p: { sppgId: string; tanggal: string; jumlah: number; jumlahSatdik: number; periode: string; userId: string; refId?: string }) {
  return buatJurnal({ sppgId: p.sppgId, tanggal: p.tanggal, deskripsi: `Insentif PJ ${p.jumlahSatdik} satdik periode ${p.periode}`, refTipe: 'insentif_pj', refId: p.refId, dibuatOleh: p.userId,
    lines: [{ akun_kode: '5-2002', debit: p.jumlah, kredit: 0 }, { akun_kode: '1-1001', debit: 0, kredit: p.jumlah }] });
}

export async function jurnalPettyCash(p: { sppgId: string; tanggal: string; jumlah: number; kategori: string; uraian: string; userId: string; refId?: string }) {
  const akun = p.kategori === 'bahan_baku' ? '5-1005' : p.kategori === 'bbm' ? '5-3005' : p.kategori === 'atk' ? '5-3007' : p.kategori === 'kebersihan' ? '5-3008' : '5-3099';
  return buatJurnal({ sppgId: p.sppgId, tanggal: p.tanggal, deskripsi: `Petty cash — ${p.uraian}`, refTipe: 'petty_cash', refId: p.refId, dibuatOleh: p.userId,
    lines: [{ akun_kode: akun, debit: p.jumlah, kredit: 0 }, { akun_kode: '1-1002', debit: 0, kredit: p.jumlah }] });
}

export async function jurnalBayarHutangSupplier(p: { sppgId: string; tanggal: string; jumlah: number; namaSupplier: string; userId: string; refId?: string }) {
  return buatJurnal({ sppgId: p.sppgId, tanggal: p.tanggal, deskripsi: `Bayar hutang supplier ${p.namaSupplier}`, refTipe: 'bayar_hutang', refId: p.refId, dibuatOleh: p.userId,
    lines: [{ akun_kode: '2-1001', debit: p.jumlah, kredit: 0 }, { akun_kode: '1-1001', debit: 0, kredit: p.jumlah }] });
}

// ── Kalkulasi Saldo ───────────────────────────────────────────

export async function getAllAkunDenganSaldo(sppgId: string, sampaiTanggal: string) {
  const { data: akuns } = await supabase.from('akun').select('*').eq('sppg_id', sppgId).eq('aktif', true).order('urutan');
  if (!akuns) return [];

  const { data: allDetails } = await supabase
    .from('jurnal_detail')
    .select('akun_id, debit, kredit, jurnal!inner(tanggal, status, sppg_id)')
    .eq('jurnal.sppg_id', sppgId).eq('jurnal.status', 'posted').lte('jurnal.tanggal', sampaiTanggal);

  const saldoMap: Record<string, { debit: number; kredit: number }> = {};
  (allDetails || []).forEach((d: any) => {
    if (!saldoMap[d.akun_id]) saldoMap[d.akun_id] = { debit: 0, kredit: 0 };
    saldoMap[d.akun_id].debit  += d.debit  || 0;
    saldoMap[d.akun_id].kredit += d.kredit || 0;
  });

  return akuns.map((a: any) => {
    const s = saldoMap[a.id] || { debit: 0, kredit: 0 };
    const saldo = a.normal_balance === 'debit' ? s.debit - s.kredit : s.kredit - s.debit;
    return { ...a, total_debit: s.debit, total_kredit: s.kredit, saldo };
  });
}
