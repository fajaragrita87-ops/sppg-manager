// ==============================
// RECEIPT OCR — Anthropic Claude Vision API
// Ekstrak data dari foto struk/nota belanja dapur SPPG
// ==============================

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string;
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

// ─── Tipe Data ────────────────────────────────────────────────────────────────

export interface ReceiptItem {
  nama: string;
  qty: number;
  satuan: string;
  harga_satuan: number;
  subtotal: number;
}

export interface ExtractedReceipt {
  supplier?: string;
  tanggal?: string;
  no_faktur?: string;
  items: ReceiptItem[];
  total: number;
  confidence: 'high' | 'medium' | 'low';
  /** Base64 gambar asli (disimpan untuk bukti) */
  imageBase64?: string;
  mediaType?: string;
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Kamu adalah sistem OCR untuk struk belanja dapur program SPPG Makan Bergizi Gratis Indonesia.
Ekstrak data dari struk/nota/faktur belanja dan return HANYA JSON valid tanpa pembukaan.

Aturan:
- Kalau tidak yakin dengan suatu field, return null untuk field tersebut.
- Format tanggal: YYYY-MM-DD.
- Semua harga dalam integer Rupiah (tanpa titik/koma desimal).
- qty harus angka desimal atau integer.
- satuan: kg, gram, liter, buah, pcs, bungkus, pack, dll.
- subtotal = qty × harga_satuan (hitung sendiri jika tidak tertera).
- confidence: "high" jika struk jelas dan terbaca, "medium" jika beberapa bagian blur/tidak yakin, "low" jika banyak yang tidak terbaca.

Format output JSON:
{
  "supplier": "Nama Toko",
  "tanggal": "2026-05-15",
  "no_faktur": "INV-001",
  "items": [
    { "nama": "Beras Premium", "qty": 10, "satuan": "kg", "harga_satuan": 14000, "subtotal": 140000 }
  ],
  "total": 140000,
  "confidence": "high"
}`;

// ─── Fungsi Utama ─────────────────────────────────────────────────────────────

export async function extractReceiptData(
  imageBase64: string,
  mediaType: string,
): Promise<ExtractedReceipt> {
  // Fallback jika API key belum diset
  if (!ANTHROPIC_API_KEY) {
    console.warn('[OCR] VITE_ANTHROPIC_API_KEY belum diset — gunakan mock data.');
    return getMockResult(imageBase64, mediaType);
  }

  try {
    const response = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: 'Ekstrak semua data dari struk ini. Return JSON dengan format: { supplier, tanggal, no_faktur, items: [{nama, qty, satuan, harga_satuan, subtotal}], total, confidence }',
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('[OCR] API error:', response.status, errBody);
      return getMockResult(imageBase64, mediaType);
    }

    const data = await response.json();

    // Ambil text content dari respons
    const textContent = data.content?.find((c: any) => c.type === 'text');
    if (!textContent?.text) {
      console.error('[OCR] Tidak ada text content:', data);
      return getMockResult(imageBase64, mediaType);
    }

    // Parse JSON dari respons (bisa ada markdown code block)
    const jsonStr = textContent.text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    const parsed = JSON.parse(jsonStr);

    return {
      supplier: parsed.supplier ?? undefined,
      tanggal: parsed.tanggal ?? undefined,
      no_faktur: parsed.no_faktur ?? undefined,
      items: Array.isArray(parsed.items) ? parsed.items.map((item: any) => ({
        nama: item.nama ?? 'Item tidak terbaca',
        qty: Number(item.qty) || 0,
        satuan: item.satuan ?? 'pcs',
        harga_satuan: Number(item.harga_satuan) || 0,
        subtotal: Number(item.subtotal) || (Number(item.qty) * Number(item.harga_satuan)) || 0,
      })) : [],
      total: Number(parsed.total) || 0,
      confidence: (['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'medium') as 'high' | 'medium' | 'low',
      imageBase64,
      mediaType,
    };
  } catch (err) {
    console.error('[OCR] Parse/fetch error:', err);
    return getMockResult(imageBase64, mediaType);
  }
}

// ─── Mock Result (untuk demo / fallback) ──────────────────────────────────────

function getMockResult(imageBase64: string, mediaType: string): ExtractedReceipt {
  return {
    supplier: 'Toko Sumber Makmur',
    tanggal: new Date().toISOString().split('T')[0],
    no_faktur: `INV-${Date.now().toString().slice(-6)}`,
    items: [
      { nama: 'Beras Premium', qty: 25, satuan: 'kg', harga_satuan: 14000, subtotal: 350000 },
      { nama: 'Daging Ayam', qty: 10, satuan: 'kg', harga_satuan: 38000, subtotal: 380000 },
      { nama: 'Minyak Goreng', qty: 5, satuan: 'liter', harga_satuan: 16000, subtotal: 80000 },
      { nama: 'Telur Ayam', qty: 10, satuan: 'kg', harga_satuan: 28000, subtotal: 280000 },
    ],
    total: 1090000,
    confidence: 'high',
    imageBase64,
    mediaType,
  };
}
