// ==============================
// AI ASSISTANT — Logic untuk asisten AI SPPG
// Menggunakan Anthropic Claude Vision API
// ==============================
import { KNOWLEDGE_BASE } from '@/pages/ai-assistant/knowledge';

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string;
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AskParams {
  pertanyaan: string;
  sppgId: string;
  userId: string;
  namaSppg?: string;
  riwayatChat: ChatMessage[];
  inventoryData?: any[];
}

export interface AskResult {
  jawaban: string;
  error?: string;
}

// ─── Konteks SPPG (mock — TODO: sambungkan ke Supabase) ───────────────────────

function getSPPGContext(namaSppg?: string, inventoryData?: any[]): string {
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  
  let stokContext = 'Stok kritis: Minyak Goreng (sisa 3 liter), Telur Ayam (sisa 5 kg)';
  if (inventoryData && inventoryData.length > 0) {
    const kritis = inventoryData.filter(s => s.stok_akhir < s.min_stok);
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const expired = inventoryData.filter(s => s.tgl_kadaluarsa && new Date(s.tgl_kadaluarsa) < in7Days);
    
    stokContext = `Inventori Aktual:\n- Total Item: ${inventoryData.length}\n- Kritis: ${kritis.length > 0 ? kritis.map(k => `${k.nama} (${k.stok_akhir} ${k.satuan})`).join(', ') : 'Aman'}\n- Mendekati Kadaluarsa (< 7 hari): ${expired.length > 0 ? expired.map(e => `${e.nama} (Exp: ${e.tgl_kadaluarsa})`).join(', ') : 'Tidak ada'}`;
  }

  return `
Hari ini: ${today}
Nama SPPG: ${namaSppg ?? 'SPPG Contoh Berkah'}

Laporan hari ini: Belum dikunci (target dikunci sebelum jam 14:00)
Porsi terdistribusi: 2.847 dari target 3.000
Estimasi saldo VA: Rp 42.500.000 (cukup untuk ±12 hari operasional)
${stokContext}
Relawan hadir hari ini: 18 dari 22 orang (4 izin)
Laporan 2 mingguan berikutnya jatuh tempo: Senin depan
Petty cash bulan ini terpakai: Rp 4.250.000 dari limit Rp 5.000.000
PO menunggu approval: 1 (BUMDesa Maju Makmur — Rp 4.500.000)
`.trim();
}

// ─── Fungsi Utama ─────────────────────────────────────────────────────────────

export async function askAssistant(params: AskParams): Promise<AskResult> {
  const { pertanyaan, namaSppg, riwayatChat, inventoryData } = params;

  const systemPrompt = `Kamu adalah asisten operasional cerdas untuk SPPG "${namaSppg ?? 'SPPG'}" dalam program Makan Bergizi Gratis (MBG) Indonesia.

Aturan:
- Jawab dalam bahasa Indonesia yang mudah dipahami, singkat dan langsung ke inti (max 3-4 kalimat).
- Jangan gunakan markdown berlebihan — cukup bold untuk angka penting.
- Gunakan angka dalam format Rupiah Indonesia (Rp X.XXX.XXX).
- Kalau tidak tahu jawaban pasti, katakan dengan jujur dan berikan saran tindakan.
- Kamu tahu data operasional SPPG yang diberikan. Gunakan data tersebut untuk menjawab.
- Kamu juga paham tentang juknis BGN, prosedur laporan Lampiran 30, AKG (Angka Kecukupan Gizi), dan SOP dapur SPPG.

Data SPPG saat ini:
${getSPPGContext(namaSppg, inventoryData)}`;

  // Jika API key tidak ada, gunakan jawaban mock cerdas
  if (!ANTHROPIC_API_KEY) {
    return { jawaban: getMockAnswer(pertanyaan, inventoryData) };
  }

  try {
    const messages = [
      ...riwayatChat.map(m => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: pertanyaan },
    ];

    const res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        system: systemPrompt,
        messages,
      }),
    });

    if (!res.ok) {
      console.error('[AI] API error:', res.status);
      return { jawaban: getMockAnswer(pertanyaan, inventoryData) };
    }

    const data = await res.json();
    const text = data.content?.find((c: any) => c.type === 'text')?.text;
    return { jawaban: text ?? 'Maaf, saya tidak bisa menjawab saat ini.' };
  } catch (err: any) {
    console.error('[AI] Error:', err);
    return { jawaban: getMockAnswer(pertanyaan, inventoryData), error: err?.message };
  }
}

// ─── Mock Answer (fallback) ───────────────────────────────────────────────────

function getMockAnswer(q: string, inventoryData?: any[]): string {
  const ql = q.toLowerCase();

  // INVENTORY, KADALUARSA, & WASTE
  if (ql.includes('waste') || ql.includes('susut') || ql.includes('sisa') || ql.includes('buang') || ql.includes('rugi'))
    return '🗑️ **Laporan Food Waste & Susut**:\nBulan ini terdapat 4 insiden waste (Sisa Gudang, Prep Dapur, dan Distribusi).\nTotal taksiran kerugian finansial akibat bahan rusak/expired adalah Rp 476.000.\nEfisiensi bahan baku masih di angka 98.2% (+0.5% dari target BGN). Harap tingkatkan pengawasan FIFO gudang agar kerugian bisa ditekan!';

  if (ql.includes('kadaluarsa') || ql.includes('expired') || ql.includes('busuk') || ql.includes('basi')) {
    if (inventoryData && inventoryData.length > 0) {
      const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const expired = inventoryData.filter(s => s.tgl_kadaluarsa && new Date(s.tgl_kadaluarsa) < in7Days);
      if (expired.length > 0) {
        return `🚨 Berdasarkan data FIFO Gudang, ada ${expired.length} bahan yang akan segera kadaluarsa (EXP < 7 hari): ${expired.map(e => `${e.nama} (Lokasi: ${e.lokasi})`).join(', ')}. Harap Koki mengutamakan bahan ini untuk produksi hari ini!`;
      }
      return '✅ Cek stok aman! Saat ini tidak ada bahan baku di gudang yang mendekati tanggal kadaluarsa dalam 7 hari ke depan. Semua FIFO berjalan normal.';
    }
    return 'Saat ini saya belum bisa mengakses data kadaluarsa. Pastikan Anda mencatat tanggal kadaluarsa di menu Penerimaan PO.';
  }

  // KEUANGAN & PETTY CASH
  if (ql.includes('keuangan') || ql.includes('saldo') || ql.includes('uang') || ql.includes('petty cash') || ql.includes('biaya'))
    return '📊 **Status Keuangan**:\n- Saldo Virtual Account (VA): Rp 42.500.000 (Aman untuk ±12 hari operasional).\n- Petty Cash: Rp 4.250.000 terpakai dari batas bulanan Rp 5.000.000. Tersisa Rp 750.000. Harap berhemat untuk pengeluaran kas kecil!';

  // DAPUR, PRODUKSI, BAHAN & MENU
  if (ql.includes('bahan') || ql.includes('besok') || ql.includes('kebutuhan') || ql.includes('dapur') || ql.includes('masak') || ql.includes('menu'))
    return '🧑‍🍳 **Dapur & Produksi (Besok)**:\nMenu: Nasi + Ayam Goreng + Sayur Bayam (Standar AKG 700 kkal).\nTarget Produksi: 3.000 porsi.\nKebutuhan Bahan: Beras 250kg, Ayam 150kg, Bayam 50kg, Minyak 15L.\n⚠️ PERHATIAN: Minyak Goreng hampir habis, segera lapor ke admin pengadaan!';

  // ABSENSI & RELAWAN
  if (ql.includes('absen') || ql.includes('relawan') || ql.includes('hadir') || ql.includes('insentif') || ql.includes('tim'))
    return '👥 **Absensi Tim & Relawan**:\nHari ini 18 dari 22 tim hadir (82%).\nStatus: Budi (Sakit), Sari (Izin Keluarga), Agus (Alpha), Dewi (Izin).\nProduksi di dapur tetap bisa berjalan normal, namun sistem otomatis akan memotong kalkulasi insentif bagi yang absen sesuai SOP BGN.';

  // LAPORAN & INTEGRASI BGN
  if (ql.includes('laporan') || ql.includes('jatuh tempo') || ql.includes('deadline') || ql.includes('bgn') || ql.includes('integrasi') || ql.includes('sync'))
    return '📋 **Status Laporan BGN**:\n- Laporan Harian: BELUM DIKUNCI ⚠️ (Harap Kunci sebelum jam 14:00 agar Sinkronisasi ke SIPGN BGN Pusat otomatis berjalan).\n- Laporan 2 Mingguan (Lampiran 30C/30D): Jatuh tempo Senin depan. Pastikan semua struk belanja sudah di-scan OCR!';

  // PENERIMA MANFAAT / TARGET
  if (ql.includes('penerima') || ql.includes('manfaat') || ql.includes('target') || ql.includes('sekolah') || ql.includes('distribusi'))
    return '🎯 **Target & Distribusi**:\nSPPG kita melayani 5 Sekolah Dasar (SDN) di kecamatan ini dengan total Penerima Manfaat 3.000 siswa.\nHari ini: 2.847 porsi telah terdistribusi sukses (Proof of Delivery diterima), 153 porsi batal/retur karena ketidakhadiran siswa di SDN 02.';

  // PENGADAAN & PO
  if (ql.includes('po ') || ql.includes('pengadaan') || ql.includes('supplier') || ql.includes('belanja') || ql.includes('beli'))
    return '📦 **Pengadaan & PO**:\nAda 1 Purchase Order (PO) yang sedang menggantung:\nPO BUMDesa Maju Makmur (Rp 4.500.000) untuk pengadaan Beras & Minyak. Menunggu "Approval" dari Kepala SPPG di Dashboard Command Center. Segera approve agar barang dikirim sore ini!';

  // PRIORITAS HARIAN
  if (ql.includes('perhatikan') || ql.includes('hari ini') || ql.includes('prioritas') || ql.includes('tugas'))
    return '🔴 **PRIORITAS HARI INI**:\n1. Kunci Laporan Harian sebelum jam 14:00.\n2. Approve PO BUMDesa (Rp 4.500.000).\n3. Lakukan Penerimaan Barang untuk PO yang datang & Cetak Label Gudangnya.\n4. Cek bahan yang mau kadaluarsa di Gudang.';

  // INVENTORY STOK KRITIS
  if (ql.includes('stok') || ql.includes('habis') || ql.includes('kritis') || ql.includes('inventori') || ql.includes('gudang')) {
    if (inventoryData && inventoryData.length > 0) {
      const kritis = inventoryData.filter(s => s.stok_akhir < s.min_stok);
      if (kritis.length > 0) {
        return `⚠️ **Data Stok Kritis Aktual**: ${kritis.map(k => `${k.nama} (Sisa ${k.stok_akhir} ${k.satuan})`).join(', ')}. Segera buat PO ke supplier agar tidak menghambat operasional masak besok.`;
      }
      return 'Semua stok dalam kondisi aman di atas batas minimum. Kerja bagus dalam manajemen inventori!';
    }
    return '⚠️ **Stok Kritis**: Minyak Goreng (sisa 3 liter, butuh ~15L besok) dan Telur Ayam (sisa 5kg, butuh ~30kg). Segera buat PO atau belanja via Petty Cash agar produksi besok tidak terganggu.';
  }

  // FALLBACK TO KNOWLEDGE BASE
  const matches = KNOWLEDGE_BASE.filter(entry =>
    entry.keywords.some(kw => ql.includes(kw))
  );
  if (matches.length > 0) {
    const uniq = Array.from(new Set(matches.map(m => m.answer)));
    return uniq.join('\n\n');
  }

  return 'Saya siap membantu menjawab seluruh aspek operasional SPPG Anda! Tanyakan saya tentang: Kadaluarsa Gudang, Status Keuangan, Kebutuhan Masak Dapur, Absensi Relawan, Deadline Laporan BGN, Status PO Supplier, atau panduan modul lainnya.';
}
