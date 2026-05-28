// Standard AKG berdasarkan Lampiran 2 Juknis BGN (Mock/Estimasi rasional jika juknis asli tidak detail)
export type KategoriPM = 
  | 'PAUD' | 'TK' | 'SD 1-3' | 'SD 4-6' 
  | 'SMP' | 'SMA' | 'SMK' 
  | 'Balita' | 'Bumil KEK' | 'Bumil Normal' | 'Busui' | 'SANTRI' | 'LAINNYA';

export interface StandarGizi {
  waktu: 'Pagi' | 'Siang' | 'Snack';
  kkal_min: number;
  kkal_max: number;
  protein_min: number;
  protein_max: number;
  lemak_min: number;
  lemak_max: number;
  karbo_min: number;
  karbo_max: number;
  persen_akg: number;
}

export const STANDAR_AKG: Record<KategoriPM, StandarGizi> = {
  'PAUD': { waktu: 'Pagi', persen_akg: 30, kkal_min: 300, kkal_max: 450, protein_min: 10, protein_max: 15, lemak_min: 10, lemak_max: 15, karbo_min: 40, karbo_max: 60 },
  'TK': { waktu: 'Pagi', persen_akg: 30, kkal_min: 350, kkal_max: 500, protein_min: 12, protein_max: 18, lemak_min: 12, lemak_max: 18, karbo_min: 45, karbo_max: 70 },
  'SD 1-3': { waktu: 'Siang', persen_akg: 30, kkal_min: 400, kkal_max: 600, protein_min: 15, protein_max: 20, lemak_min: 15, lemak_max: 25, karbo_min: 50, karbo_max: 80 },
  'SD 4-6': { waktu: 'Siang', persen_akg: 30, kkal_min: 500, kkal_max: 750, protein_min: 18, protein_max: 25, lemak_min: 18, lemak_max: 30, karbo_min: 65, karbo_max: 100 },
  'SMP': { waktu: 'Siang', persen_akg: 30, kkal_min: 600, kkal_max: 850, protein_min: 20, protein_max: 30, lemak_min: 20, lemak_max: 35, karbo_min: 80, karbo_max: 120 },
  'SMA': { waktu: 'Siang', persen_akg: 30, kkal_min: 700, kkal_max: 950, protein_min: 25, protein_max: 35, lemak_min: 25, lemak_max: 40, karbo_min: 90, karbo_max: 130 },
  'SMK': { waktu: 'Siang', persen_akg: 30, kkal_min: 700, kkal_max: 950, protein_min: 25, protein_max: 35, lemak_min: 25, lemak_max: 40, karbo_min: 90, karbo_max: 130 },
  'Balita': { waktu: 'Snack', persen_akg: 20, kkal_min: 200, kkal_max: 350, protein_min: 8, protein_max: 12, lemak_min: 8, lemak_max: 12, karbo_min: 25, karbo_max: 45 },
  'Bumil KEK': { waktu: 'Siang', persen_akg: 40, kkal_min: 800, kkal_max: 1100, protein_min: 30, protein_max: 45, lemak_min: 30, lemak_max: 45, karbo_min: 100, karbo_max: 150 },
  'Bumil Normal': { waktu: 'Siang', persen_akg: 30, kkal_min: 600, kkal_max: 850, protein_min: 25, protein_max: 35, lemak_min: 20, lemak_max: 35, karbo_min: 80, karbo_max: 120 },
  'Busui': { waktu: 'Siang', persen_akg: 30, kkal_min: 700, kkal_max: 950, protein_min: 25, protein_max: 35, lemak_min: 25, lemak_max: 40, karbo_min: 90, karbo_max: 130 },
  'SANTRI': { waktu: 'Siang', persen_akg: 30, kkal_min: 600, kkal_max: 850, protein_min: 20, protein_max: 30, lemak_min: 20, lemak_max: 35, karbo_min: 80, karbo_max: 120 },
  'LAINNYA': { waktu: 'Siang', persen_akg: 30, kkal_min: 500, kkal_max: 800, protein_min: 15, protein_max: 25, lemak_min: 15, lemak_max: 30, karbo_min: 70, karbo_max: 110 },
};

export function validasiNutrisi(
  menu: { kkal: number; protein_g: number; lemak_g: number; karbo_g: number }, 
  kategori: KategoriPM
) {
  const std = STANDAR_AKG[kategori] || STANDAR_AKG['LAINNYA'];
  
  const kkal_ok = menu.kkal >= std.kkal_min && menu.kkal <= std.kkal_max;
  const protein_ok = menu.protein_g >= std.protein_min && menu.protein_g <= std.protein_max;
  const lemak_ok = menu.lemak_g >= std.lemak_min && menu.lemak_g <= std.lemak_max;
  const karbo_ok = menu.karbo_g >= std.karbo_min && menu.karbo_g <= std.karbo_max;

  const semua_ok = kkal_ok && protein_ok && lemak_ok && karbo_ok;

  let pesan_summary = semua_ok ? 'Menu memenuhi standar BGN.' : 'Menu BELUM memenuhi standar gizi BGN. ';
  if (!semua_ok) {
    const issues = [];
    if (!kkal_ok) issues.push(menu.kkal < std.kkal_min ? 'Kalori kurang' : 'Kalori berlebih');
    if (!protein_ok) issues.push(menu.protein_g < std.protein_min ? 'Protein kurang' : 'Protein berlebih');
    if (!lemak_ok) issues.push(menu.lemak_g < std.lemak_min ? 'Lemak kurang' : 'Lemak berlebih');
    if (!karbo_ok) issues.push(menu.karbo_g < std.karbo_min ? 'Karbo kurang' : 'Karbo berlebih');
    pesan_summary += issues.join(', ') + '.';
  }

  return {
    kkal_ok,
    protein_ok,
    lemak_ok,
    karbo_ok,
    semua_ok,
    pesan_summary,
    standar: std
  };
}
