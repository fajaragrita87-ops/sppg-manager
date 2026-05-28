// ==============================
// MENU LIBRARY — Data statis menu per provinsi Indonesia
// Sudah divalidasi AKG BGN (standar gizi program MBG)
// ==============================

import type { KategoriPM } from '@/lib/gizi-calculator';

export interface MenuLibraryItem {
  id: string;
  nama: string;
  daerah: string[];
  kategori_pm: KategoriPM[];
  waktu_makan: 'pagi' | 'siang';
  bahan_utama: string[];
  estimasi_kkal: number;
  estimasi_protein_g: number;
  validasi_aksg: boolean;
  tag: string[];
  deskripsi: string;
}

export const MENU_LIBRARY: MenuLibraryItem[] = [
  // ─── NASIONAL ───
  { id: 'mn01', nama: 'Nasi + Ayam Goreng + Sayur Bayam + Tempe', daerah: ['Nasional'], kategori_pm: ['SD 1-3', 'SD 4-6'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Ayam', 'Bayam', 'Tempe'], estimasi_kkal: 580, estimasi_protein_g: 22, validasi_aksg: true, tag: ['hewani', 'kearifan-lokal'], deskripsi: 'Menu standar nasional yang disukai anak-anak. Protein hewani dari ayam, protein nabati dari tempe, vitamin dari bayam.' },
  { id: 'mn02', nama: 'Nasi + Telur Dadar + Sop Sayur + Tahu', daerah: ['Nasional'], kategori_pm: ['SD 1-3', 'SD 4-6', 'SMP'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Telur', 'Wortel', 'Kentang', 'Tahu'], estimasi_kkal: 520, estimasi_protein_g: 18, validasi_aksg: true, tag: ['hemat', 'hewani', 'nabati'], deskripsi: 'Menu hemat dengan gizi seimbang. Telur sebagai protein utama, sop sayur kaya vitamin.' },
  { id: 'mn03', nama: 'Nasi + Ikan Goreng Tepung + Cah Kangkung', daerah: ['Nasional'], kategori_pm: ['SD 4-6', 'SMP'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Ikan Dori', 'Kangkung', 'Bawang Putih'], estimasi_kkal: 610, estimasi_protein_g: 24, validasi_aksg: true, tag: ['hewani'], deskripsi: 'Ikan goreng tepung renyah dengan cah kangkung bawang putih. Protein tinggi dan serat cukup.' },

  // ─── JAWA ───
  { id: 'mj01', nama: 'Nasi + Gudeg + Tahu Bacem + Lalapan', daerah: ['Jawa Tengah', 'DIY'], kategori_pm: ['SD 4-6', 'SMP'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Nangka Muda', 'Tahu', 'Timun', 'Kemangi'], estimasi_kkal: 550, estimasi_protein_g: 16, validasi_aksg: true, tag: ['kearifan-lokal', 'nabati'], deskripsi: 'Menu khas Yogyakarta. Gudeg nangka muda kaya serat, tahu bacem sumber protein nabati.' },
  { id: 'mj02', nama: 'Nasi + Lele Goreng + Capcay + Tempe Goreng', daerah: ['Jawa Tengah', 'Jawa Barat'], kategori_pm: ['SD 1-3', 'SD 4-6'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Lele', 'Wortel', 'Kol', 'Tempe'], estimasi_kkal: 600, estimasi_protein_g: 25, validasi_aksg: true, tag: ['hewani', 'kearifan-lokal', 'hemat'], deskripsi: 'Lele goreng garing plus capcay sayuran segar. Protein tinggi dan harga terjangkau.' },
  { id: 'mj03', nama: 'Nasi + Pecel Ayam + Sambal Pecel', daerah: ['Jawa Timur', 'Jawa Tengah'], kategori_pm: ['SD 4-6', 'SMP'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Ayam', 'Kacang Tanah', 'Bayam', 'Tauge'], estimasi_kkal: 630, estimasi_protein_g: 26, validasi_aksg: true, tag: ['kearifan-lokal', 'hewani'], deskripsi: 'Pecel ayam Jawa Timur dengan bumbu kacang. Protein ganda dari ayam dan kacang.' },
  { id: 'mj04', nama: 'Nasi + Rawon Ayam + Tempe Goreng + Lalapan', daerah: ['Jawa Timur'], kategori_pm: ['SMP'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Ayam', 'Kluwek', 'Tempe', 'Tauge'], estimasi_kkal: 650, estimasi_protein_g: 28, validasi_aksg: true, tag: ['kearifan-lokal', 'hewani'], deskripsi: 'Rawon khas Jawa Timur versi ayam. Kuah hitam kluwek kaya antioksidan.' },
  { id: 'mj05', nama: 'Nasi + Soto Ayam + Perkedel Kentang', daerah: ['Jawa Tengah', 'Jawa Timur'], kategori_pm: ['SD 1-3', 'SD 4-6'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Ayam', 'Kentang', 'Seledri', 'Daun Bawang'], estimasi_kkal: 560, estimasi_protein_g: 20, validasi_aksg: true, tag: ['kearifan-lokal', 'hewani'], deskripsi: 'Soto ayam hangat dengan perkedel kentang goreng. Disukai semua kalangan usia.' },

  // ─── SUNDA ───
  { id: 'ms01', nama: 'Nasi + Ikan Pindang + Tumis Kangkung + Tahu Goreng', daerah: ['Jawa Barat'], kategori_pm: ['SD 4-6', 'SMP'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Ikan Pindang', 'Kangkung', 'Tahu'], estimasi_kkal: 570, estimasi_protein_g: 23, validasi_aksg: true, tag: ['kearifan-lokal', 'hewani'], deskripsi: 'Menu Sunda asli. Ikan pindang kaya omega-3, kangkung sumber zat besi.' },
  { id: 'ms02', nama: 'Nasi Timbel + Ayam Goreng + Lalapan + Sambal', daerah: ['Jawa Barat'], kategori_pm: ['SD 4-6', 'SMP'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Daun Pisang', 'Ayam', 'Timun', 'Kemangi'], estimasi_kkal: 620, estimasi_protein_g: 25, validasi_aksg: true, tag: ['kearifan-lokal', 'hewani'], deskripsi: 'Nasi timbel dibungkus daun pisang khas Sunda dengan ayam goreng dan lalapan segar.' },

  // ─── SUMATERA ───
  { id: 'msu01', nama: 'Nasi + Gulai Tahu + Oseng Daun Singkong', daerah: ['Sumatera Barat', 'Sumatera Utara'], kategori_pm: ['SD 1-3', 'SD 4-6'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Tahu', 'Daun Singkong', 'Santan', 'Kunyit'], estimasi_kkal: 500, estimasi_protein_g: 15, validasi_aksg: true, tag: ['kearifan-lokal', 'nabati', 'hemat'], deskripsi: 'Gulai tahu Minang dengan daun singkong. Hemat namun tetap bergizi dan kaya serat.' },
  { id: 'msu02', nama: 'Nasi + Rendang Ayam + Urap Sayur + Tempe', daerah: ['Sumatera Barat'], kategori_pm: ['SMP'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Ayam', 'Kelapa', 'Bayam', 'Kacang Panjang', 'Tempe'], estimasi_kkal: 680, estimasi_protein_g: 30, validasi_aksg: true, tag: ['kearifan-lokal', 'hewani'], deskripsi: 'Rendang ayam Minangkabau dengan urap sayuran kelapa parut. Protein sangat tinggi.' },
  { id: 'msu03', nama: 'Nasi + Ikan Arsik + Sayur Daun Ubi', daerah: ['Sumatera Utara'], kategori_pm: ['SD 4-6', 'SMP'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Ikan Mas', 'Daun Ubi', 'Andaliman'], estimasi_kkal: 590, estimasi_protein_g: 24, validasi_aksg: true, tag: ['kearifan-lokal', 'hewani'], deskripsi: 'Arsik ikan mas Batak dengan bumbu andaliman. Khas Sumatera Utara, kaya protein ikan air tawar.' },

  // ─── SULAWESI ───
  { id: 'msl01', nama: 'Nasi + Coto Ayam + Ketupat Kecil', daerah: ['Sulawesi Selatan'], kategori_pm: ['SD 4-6', 'SMP'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Ayam', 'Kacang Tanah', 'Serai'], estimasi_kkal: 560, estimasi_protein_g: 22, validasi_aksg: true, tag: ['kearifan-lokal', 'hewani'], deskripsi: 'Coto Makassar versi ayam. Kuah kacang tanah kaya protein dan lemak sehat.' },
  { id: 'msl02', nama: 'Nasi + Ikan Bakar Rica-Rica + Tumis Pakis', daerah: ['Sulawesi Utara', 'Sulawesi Selatan'], kategori_pm: ['SD 4-6', 'SMP'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Ikan Cakalang', 'Cabai', 'Pakis'], estimasi_kkal: 580, estimasi_protein_g: 26, validasi_aksg: true, tag: ['kearifan-lokal', 'hewani'], deskripsi: 'Ikan bakar rica-rica khas Manado (versi tidak terlalu pedas untuk anak). Pakis sumber serat.' },
  { id: 'msl03', nama: 'Nasi + Tinorangsak Ayam + Sayur Bunga Pepaya', daerah: ['Sulawesi Utara'], kategori_pm: ['SMP'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Ayam', 'Kemangi', 'Bunga Pepaya'], estimasi_kkal: 600, estimasi_protein_g: 24, validasi_aksg: true, tag: ['kearifan-lokal', 'hewani'], deskripsi: 'Tinorangsak ayam berbumbu kemangi dan daun jeruk. Sayur bunga pepaya khas Minahasa.' },

  // ─── PAPUA ───
  { id: 'mp01', nama: 'Papeda + Ikan Kuah Kuning + Tumis Kangkung', daerah: ['Papua', 'Papua Barat'], kategori_pm: ['SD 4-6', 'SMP'], waktu_makan: 'siang', bahan_utama: ['Sagu', 'Ikan Kakap', 'Kunyit', 'Kangkung'], estimasi_kkal: 530, estimasi_protein_g: 22, validasi_aksg: true, tag: ['kearifan-lokal', 'hewani'], deskripsi: 'Papeda sagu dengan kuah kuning ikan kakap. Karbohidrat lokal Papua, protein tinggi dari ikan laut.' },
  { id: 'mp02', nama: 'Nasi + Ikan Bakar + Sayur Ganemo', daerah: ['Papua'], kategori_pm: ['SD 4-6'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Ikan', 'Daun Melinjo', 'Bawang Merah'], estimasi_kkal: 520, estimasi_protein_g: 20, validasi_aksg: true, tag: ['kearifan-lokal', 'hewani'], deskripsi: 'Ikan bakar dengan sayur ganemo (daun melinjo muda). Gizi lengkap khas Papua.' },

  // ─── NTB / NTT ───
  { id: 'mnt01', nama: 'Nasi + Ayam Taliwang + Plecing Kangkung', daerah: ['NTB'], kategori_pm: ['SD 4-6', 'SMP'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Ayam', 'Cabai', 'Kangkung', 'Tomat'], estimasi_kkal: 610, estimasi_protein_g: 25, validasi_aksg: true, tag: ['kearifan-lokal', 'hewani'], deskripsi: 'Ayam Taliwang versi tidak pedas untuk anak. Plecing kangkung segar khas Lombok.' },
  { id: 'mnt02', nama: 'Nasi Jagung + Ikan Se\'i + Sayur Kelor', daerah: ['NTT'], kategori_pm: ['SD 4-6', 'SMP'], waktu_makan: 'siang', bahan_utama: ['Jagung', 'Beras', 'Ikan', 'Daun Kelor'], estimasi_kkal: 550, estimasi_protein_g: 23, validasi_aksg: true, tag: ['kearifan-lokal', 'hewani'], deskripsi: 'Nasi jagung NTT dengan ikan se\'i (asap). Daun kelor superfood kaya kalsium dan vitamin A.' },

  // ─── KALIMANTAN ───
  { id: 'mk01', nama: 'Nasi + Ikan Haruan Goreng + Sayur Asam', daerah: ['Kalimantan Selatan', 'Kalimantan Tengah'], kategori_pm: ['SD 4-6', 'SMP'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Ikan Gabus', 'Asam Jawa', 'Labu Siam'], estimasi_kkal: 560, estimasi_protein_g: 24, validasi_aksg: true, tag: ['kearifan-lokal', 'hewani'], deskripsi: 'Ikan haruan (gabus) khas Kalimantan. Kaya albumin untuk penyembuhan dan tumbuh kembang anak.' },
  { id: 'mk02', nama: 'Nasi + Ayam Cincane + Tumis Pakis', daerah: ['Kalimantan Timur'], kategori_pm: ['SD 4-6', 'SMP'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Ayam', 'Bawang', 'Pakis'], estimasi_kkal: 590, estimasi_protein_g: 24, validasi_aksg: true, tag: ['kearifan-lokal', 'hewani'], deskripsi: 'Ayam goreng cincane bumbu bawang khas Kutai. Disajikan dengan tumis pakis segar.' },

  // ─── ACEH ───
  { id: 'ma01', nama: 'Nasi + Mie Aceh Kuah + Tahu Goreng', daerah: ['Aceh'], kategori_pm: ['SD 4-6', 'SMP'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Mie', 'Daging Ayam', 'Tahu', 'Tomat'], estimasi_kkal: 620, estimasi_protein_g: 20, validasi_aksg: true, tag: ['kearifan-lokal', 'hewani'], deskripsi: 'Mie Aceh kuah kari dengan tambahan nasi. Porsi besar cocok untuk SMP.' },
  { id: 'ma02', nama: 'Nasi + Kuah Beulangong + Tempe Goreng', daerah: ['Aceh'], kategori_pm: ['SD 4-6'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Daging Ayam', 'Nangka Muda', 'Tempe'], estimasi_kkal: 550, estimasi_protein_g: 21, validasi_aksg: true, tag: ['kearifan-lokal', 'hewani'], deskripsi: 'Kuah beulangong ayam nangka muda khas Aceh. Kaya serat dan protein.' },

  // ─── BALI ───
  { id: 'mb01', nama: 'Nasi + Ayam Betutu + Lawar Sayur + Sambal Matah', daerah: ['Bali'], kategori_pm: ['SMP'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Ayam', 'Kacang Panjang', 'Kelapa', 'Bawang Merah'], estimasi_kkal: 640, estimasi_protein_g: 27, validasi_aksg: true, tag: ['kearifan-lokal', 'hewani'], deskripsi: 'Ayam betutu bumbu Bali dengan lawar sayur (versi tanpa darah). Sambal matah segar.' },
  { id: 'mb02', nama: 'Nasi + Sate Lilit Ikan + Sayur Urap', daerah: ['Bali'], kategori_pm: ['SD 4-6', 'SMP'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Ikan Tenggiri', 'Kelapa', 'Bayam', 'Kacang Panjang'], estimasi_kkal: 570, estimasi_protein_g: 22, validasi_aksg: true, tag: ['kearifan-lokal', 'hewani'], deskripsi: 'Sate lilit ikan tenggiri khas Bali. Disajikan dengan urap sayur kelapa parut.' },

  // ─── MALUKU ───
  { id: 'mml01', nama: 'Nasi + Ikan Bakar + Sayur Gangan', daerah: ['Maluku', 'Maluku Utara'], kategori_pm: ['SD 4-6', 'SMP'], waktu_makan: 'siang', bahan_utama: ['Beras', 'Ikan Cakalang', 'Pepaya Muda', 'Daun Kemangi'], estimasi_kkal: 560, estimasi_protein_g: 25, validasi_aksg: true, tag: ['kearifan-lokal', 'hewani'], deskripsi: 'Ikan cakalang bakar Maluku dengan sayur gangan pepaya muda. Protein tinggi dari ikan laut.' },

  // ─── MENU PAGI ───
  { id: 'mpg01', nama: 'Bubur Ayam + Telur Rebus + Kerupuk', daerah: ['Nasional'], kategori_pm: ['SD 1-3', 'SD 4-6'], waktu_makan: 'pagi', bahan_utama: ['Beras', 'Ayam', 'Telur', 'Seledri'], estimasi_kkal: 420, estimasi_protein_g: 18, validasi_aksg: true, tag: ['hewani', 'hemat'], deskripsi: 'Bubur ayam hangat untuk sarapan. Mudah dicerna dan kaya protein dari ayam dan telur.' },
  { id: 'mpg02', nama: 'Nasi Uduk + Telur Balado + Tempe Orek', daerah: ['Nasional', 'Jawa Barat'], kategori_pm: ['SD 1-3', 'SD 4-6', 'SMP'], waktu_makan: 'pagi', bahan_utama: ['Beras', 'Santan', 'Telur', 'Tempe', 'Cabai'], estimasi_kkal: 480, estimasi_protein_g: 16, validasi_aksg: true, tag: ['hewani', 'nabati', 'kearifan-lokal'], deskripsi: 'Nasi uduk wangi santan dengan telur balado dan tempe orek manis. Favorit sarapan anak Indonesia.' },
  { id: 'mpg03', nama: 'Lontong Sayur + Telur + Kerupuk', daerah: ['Nasional', 'Jawa'], kategori_pm: ['SD 4-6', 'SMP'], waktu_makan: 'pagi', bahan_utama: ['Beras', 'Santan', 'Labu Siam', 'Telur'], estimasi_kkal: 460, estimasi_protein_g: 14, validasi_aksg: true, tag: ['nabati', 'kearifan-lokal'], deskripsi: 'Lontong sayur santan dengan labu siam dan telur rebus. Menu sarapan tradisional.' },
];
