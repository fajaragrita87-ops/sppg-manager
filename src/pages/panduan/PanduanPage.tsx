import React, { useState } from 'react';
import { 
  BookOpen, ChevronRight, Play, CheckCircle2,
  Users, Wallet, ChefHat, Package, FileText,
  Search, LayoutDashboard, ShoppingCart, ExternalLink as LinkIcon
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';

const ROLE_GUIDES = [
  {
    id: 'jurutama_masak',
    label: 'Jurutama Masak (Chef)',
    icon: ChefHat,
    color: 'text-orange-600 bg-orange-100',
    description: 'Bertanggung jawab penuh atas proses produksi makanan di dapur SPPG sesuai standar gizi BGN.',
    tugasUtama: [
      'Memeriksa ketersediaan dan kualitas bahan baku sebelum memasak.',
      'Memasak sesuai dengan buku resep BGN dan standar gizi harian.',
      'Input produksi harian dan simpan progres batch di modul Dapur.',
      'Mengisi form QC Organoleptik (warna, rasa, aroma) sebelum distribusi.',
      'Melaporkan sisa makanan (Food Waste) di akhir produksi.',
    ],
    laporanHarian: [
      'Input Produksi Harian (Jumlah Porsi Dimasak)',
      'QC Organoleptik (Simpan Hasil Pemeriksaan)',
      'Laporan Sisa Makanan (Food Waste)'
    ],
    fiturAkses: [
      { name: 'Dapur & Produksi', link: '/dapur', icon: ChefHat },
      { name: 'Food Waste', link: '/laporan/waste', icon: FileText },
      { name: 'Lihat Stok Bahan', link: '/inventori', icon: Package }
    ],
    alur: [
      { step: '1', title: 'Terima Bahan', desc: 'Ambil bahan dari gudang' },
      { step: '2', title: 'Persiapan', desc: 'Cuci & potong sesuai resep' },
      { step: '3', title: 'Produksi', desc: 'Masak + simpan progres batch' },
      { step: '4', title: 'QC & Distribusi', desc: 'Isi QC → serahkan ke kurir' }
    ]
  },
  {
    id: 'owner',
    label: 'Kepala SPPG / Owner',
    icon: Users,
    color: 'text-blue-600 bg-blue-100',
    description: 'Penanggung jawab utama operasional harian SPPG: pengadaan, SDM, dan pelaporan langsung ke BGN Pusat.',
    tugasUtama: [
      'Pantau Dashboard setiap pagi: saldo VA aktual, PO menunggu, dan status laporan hari ini.',
      'Approve Purchase Order (PO) yang masuk — status Dashboard hilang otomatis setelah disetujui.',
      'Kunci Laporan Harian (Lampiran 30a) sebelum pukul 23:59 — wajib setiap hari operasional.',
      'Submit semua Lampiran 30 (A, B, C, D, L) ke BGN via tab "Submit ke BGN" di Pelaporan BGN.',
      'Pantau insentif relawan di SDM → tab Insentif Bulanan.',
    ],
    laporanHarian: [
      'Kunci Laporan Harian BGN (Lampiran 30a) — setiap hari',
      'Approve PO & Review Keuangan',
      'Submit Lampiran 30 ke BGN (mingguan)',
      'Review Rekap Absensi & Insentif Relawan',
    ],
    fiturAkses: [
      { name: 'Dashboard Command Center', link: '/', icon: LayoutDashboard },
      { name: 'Approval PO (Pengadaan)', link: '/pengadaan', icon: FileText },
      { name: 'Laporan Harian → Kunci', link: '/laporan/harian', icon: FileText },
      { name: 'Submit ke BGN (Lamp. 30)', link: '/laporan/bgn', icon: FileText },
      { name: 'Penerima Manfaat', link: '/penerima-manfaat', icon: Users },
      { name: 'SDM & Insentif Relawan', link: '/sdm', icon: Users },
    ],
    alur: [
      { step: '1', title: 'Dashboard', desc: 'Pantau KPI & warning pagi hari' },
      { step: '2', title: 'Approve PO', desc: 'Setujui belanja bahan baku' },
      { step: '3', title: 'Kunci Laporan', desc: 'Kunci laporan harian 30a' },
      { step: '4', title: 'Submit BGN', desc: 'Kirim Lampiran 30 ke BGN Pusat' }
    ]
  },
  {
    id: 'kasppg',
    label: 'Bag. Keuangan & Admin',
    icon: Wallet,
    color: 'text-emerald-600 bg-emerald-100',
    description: 'Mengurus administrasi pengadaan barang, pencatatan biaya operasional, dan invoice supplier.',
    tugasUtama: [
      'Membuat Purchase Order (PO) berdasarkan survei harga pasar.',
      'Melakukan pemindaian (OCR) pada struk belanja dan nota supplier.',
      'Melunasi pembayaran (Petty Cash/VA) dan mencatat arus kas.',
      'Mencetak dokumen PO fisik ber-watermark untuk diberikan ke Supplier.'
    ],
    laporanHarian: [
      'Buku Kas Umum (Pemasukan & Pengeluaran)',
      'Rekapitulasi Struk/Nota OCR'
    ],
    fiturAkses: [
      { name: 'Modul Pengadaan (PO)', link: '/pengadaan', icon: Wallet },
      { name: 'Manajemen Supplier', link: '/pengadaan', icon: Users },
      { name: 'Cetak Dokumen PO', link: '/pengadaan', icon: FileText }
    ],
    alur: [
      { step: '1', title: 'Cek Stok', desc: 'Analisa stok kritis di Gudang' },
      { step: '2', title: 'Buat PO', desc: 'Terbitkan Surat Pesanan' },
      { step: '3', title: 'Scan Struk', desc: 'Gunakan AI OCR untuk validasi nota' },
      { step: '4', title: 'Pelunasan', desc: 'Tandai lunas & update Kas' }
    ]
  },
  {
    id: 'asisten_lapangan',
    label: 'Asisten Gudang',
    icon: Package,
    color: 'text-amber-600 bg-amber-100',
    description: 'Pihak yang bertanggung jawab atas penerimaan bahan baku, mutasi stok, dan keamanan inventori.',
    tugasUtama: [
      'Menerima bahan baku dari supplier dan memvalidasi kecocokan dengan PO.',
      'Mencatat mutasi masuk dan mutasi keluar (ke dapur) setiap hari.',
      'Melakukan stock opname (penyesuaian stok) mingguan.',
      'Melaporkan bahan yang mendekati kadaluarsa.'
    ],
    laporanHarian: [
      'Laporan Mutasi Barang Masuk/Keluar',
      'Alert Stok Kritis'
    ],
    fiturAkses: [
      { name: 'Dashboard Inventori', link: '/inventori', icon: Package },
      { name: 'Penerimaan Barang', link: '/pengadaan', icon: CheckCircle2 },
      { name: 'Master Data Bahan', link: '/inventori', icon: Package }
    ],
    alur: [
      { step: '1', title: 'Terima Barang', desc: 'Cek fisik barang vs PO' },
      { step: '2', title: 'Update Stok', desc: 'Masukkan stok ke sistem' },
      { step: '3', title: 'Distribusi Dapur', desc: 'Keluarkan bahan sesuai resep' },
      { step: '4', title: 'Stock Opname', desc: 'Cek fisik akhir minggu' }
    ]
  },
  {
    id: 'pengawas_gizi',
    label: 'Pengawas Gizi & Sanitasi',
    icon: LayoutDashboard,
    color: 'text-rose-600 bg-rose-100',
    description: 'Memastikan standar kalori BGN terpenuhi dan dapur beroperasi dengan standar kebersihan tertinggi.',
    tugasUtama: [
      'Mengecek kesesuaian menu harian dengan pedoman Gizi BGN.',
      'Mengisi form checklist kebersihan dapur, alat masak, dan relawan harian.',
      'Menyetujui substitusi bahan lokal jika bahan utama tidak tersedia.',
      'Melakukan sampling suhu makanan sebelum distribusi.'
    ],
    laporanHarian: [
      'Checklist Sanitasi & Higiene',
      'Laporan Pemenuhan Kalori Menu'
    ],
    fiturAkses: [
      { name: 'Modul Dapur', link: '/dapur', icon: ChefHat },
      { name: 'Laporan Gizi', link: '/laporan', icon: LayoutDashboard }
    ],
    alur: [
      { step: '1', title: 'Inspeksi Pagi', desc: 'Cek sanitasi dapur & alat' },
      { step: '2', title: 'Review Menu', desc: 'Validasi resep & kalori' },
      { step: '3', title: 'Quality Control', desc: 'Cek makanan siap saji' },
      { step: '4', title: 'Approve', desc: 'Beri izin distribusi' }
    ]
  },
  {
    id: 'kurir',
    label: 'Kurir BGN (Ekspedisi)',
    icon: ShoppingCart,
    color: 'text-indigo-600 bg-indigo-100',
    description: 'Ujung tombak distribusi makanan sehat dari SPPG langsung ke titik kumpul / sekolah.',
    tugasUtama: [
      'Menerima boks makanan/ompreng dari dapur dan menghitung jumlahnya.',
      'Mengantar makanan sesuai rute distribusi tepat waktu.',
      'Meminta tanda terima (digital/fisik) dari PIC sekolah / penerima manfaat.',
      'Membawa kembali ompreng kosong ke SPPG.'
    ],
    laporanHarian: [
      'Laporan Serah Terima (POD - Proof of Delivery)',
      'Laporan Pengembalian Tray'
    ],
    fiturAkses: [
      { name: 'Akses Mobile', link: '/', icon: Play },
      { name: 'Dashboard', link: '/', icon: LayoutDashboard }
    ],
    alur: [
      { step: '1', title: 'Ambil Tray', desc: 'Muat makanan ke kendaraan' },
      { step: '2', title: 'Perjalanan', desc: 'Distribusi ke titik target' },
      { step: '3', title: 'Serah Terima', desc: 'Catat Proof of Delivery' },
      { step: '4', title: 'Kembali', desc: 'Bawa tray kosong ke SPPG' }
    ]
  },
  {
    id: 'buku_panduan_bgn',
    label: 'Buku Panduan Pelaporan & Keuangan BGN',
    icon: BookOpen,
    color: 'text-purple-600 bg-purple-100',
    description: 'Panduan alur pelaporan BGN, keuangan, dan notifikasi agar staf memahami gambaran besar program MBG Nasional.',
    tugasUtama: [
      'Uang Masuk: PAUD (Rp 8.000), SD (Rp 10.000), SMP/SMA/Bumil (Rp 12.000) per porsi/anak hadir.',
      'Insentif SPPG Rp 6.000.000/hari: penuh jika SLA ≥ 90%. Jika kurang, dipotong proporsional.',
      'Alur Laporan: Input Harian → Kunci (30a) → Generate 2 Mingguan (30c) → Tutup Buku Bulanan (30d) → Submit ke BGN.',
      'Lampiran 30 terdiri dari: 30a (Penerima Manfaat), 30b (Distribusi), 30c (Menu & Produksi), 30d (Keuangan), 30l (Jadwal).',
      'Notifikasi WA: laporan belum dikunci dikirim ke owner & kasppg pukul 14:00. Staf dapur TIDAK menerima notif keuangan.',
      'Saldo VA di Dashboard = sisa dana hari ini (bukan total penerimaan). Berkurang otomatis saat PO diterima.',
    ],
    laporanHarian: [
      'Laporan Harian (Lampiran 30a) — input porsi, kunci sebelum 23:59',
      'Laporan 2 Mingguan (Lampiran 30c) — generate otomatis tiap 2 minggu',
      'Laporan Bulanan (Lampiran 30d) — tutup buku akhir bulan',
      'Submit Lampiran 30 ke BGN — via tab Submit ke BGN'
    ],
    fiturAkses: [
      { name: 'Laporan Harian (30a)', link: '/laporan/harian', icon: FileText },
      { name: 'Submit ke BGN', link: '/laporan/bgn', icon: FileText },
      { name: 'Dashboard Keuangan', link: '/keuangan', icon: Wallet },
      { name: 'Penerima Manfaat', link: '/penerima-manfaat', icon: Users }
    ],
    alur: [
      { step: '1', title: 'Input Porsi', desc: 'Setiap sore, masukkan jumlah anak yang makan' },
      { step: '2', title: 'Kunci (30a)', desc: 'Sistem cetak PDF & tagihan otomatis' },
      { step: '3', title: 'Generate (30c/30d)', desc: 'Tiap 2 minggu & akhir bulan' },
      { step: '4', title: 'Submit ke BGN', desc: 'Kirim semua lampiran, tunggu pencairan' }
    ]
  }
];

export default function PanduanPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  
  // Default tab based on user role, or fallback to owner
  const defaultTab = ROLE_GUIDES.find(r => r.id === user?.role)?.id || 'owner';
  const [activeRole, setActiveRole] = useState(defaultTab);

  const activeGuide = ROLE_GUIDES.find(r => r.id === activeRole) || ROLE_GUIDES[0];

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Panduan Operasional SPPG</h1>
        </div>
        <p className="text-slate-500 text-sm md:text-base">
          Kenali peran Anda, pahami tugas harian, dan ikuti alur kerja standar Program Makan Bergizi Gratis (MBG) Nasional.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Roles */}
        <div className="md:w-72 shrink-0 space-y-2">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari Role..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Sesuaikan Role Anda</h3>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex flex-col gap-1">
            {ROLE_GUIDES.filter(r => r.label.toLowerCase().includes(search.toLowerCase())).map(role => {
              const RoleIcon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                    activeRole === role.id 
                      ? 'bg-blue-50 border border-blue-200 shadow-sm relative overflow-hidden' 
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  {activeRole === role.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-lg" />}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activeRole === role.id ? role.color : 'bg-slate-100 text-slate-500'}`}>
                    <RoleIcon size={16} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${activeRole === role.id ? 'text-blue-900' : 'text-slate-700'}`}>{role.label}</p>
                    {user?.role === role.id && (
                      <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase">Role Anda Saat Ini</span>
                    )}
                  </div>
                  {activeRole === role.id && <ChevronRight size={16} className="text-blue-500 ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {/* Hero Role Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className={`p-6 md:p-8 ${activeGuide.color.split(' ')[1]} border-b border-white/20 relative overflow-hidden`}>
              <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                <activeGuide.icon size={150} />
              </div>
              <div className="relative z-10 flex items-start gap-5">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-white ${activeGuide.color.split(' ')[0]}`}>
                  <activeGuide.icon size={32} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">{activeGuide.label}</h2>
                  <p className="text-slate-800 font-medium max-w-xl leading-relaxed">
                    {activeGuide.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-8 bg-white">
              
              {/* Alur Kerja Diagram */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <LayoutDashboard size={20} className="text-blue-600" /> Alur Kerja (Workflow)
                </h3>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative bg-slate-50 p-6 rounded-xl border border-slate-200">
                  {/* Garis Konektor Desktop */}
                  <div className="hidden md:block absolute top-1/2 left-8 right-8 h-1 bg-slate-300 -translate-y-1/2 z-0" />
                  
                  {activeGuide.alur.map((alur, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col items-center mb-6 md:mb-0 group w-full md:w-1/4">
                      {/* Lingkaran Step */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-4 shadow-sm mb-3 transition-transform group-hover:scale-110 ${activeGuide.color.split(' ')[0]} bg-white border-white ring-2 ring-slate-200`}>
                        {alur.step}
                      </div>
                      {/* Judul & Desc */}
                      <div className="text-center px-2">
                        <p className="font-bold text-slate-800 text-sm mb-1">{alur.title}</p>
                        <p className="text-xs text-slate-500">{alur.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Daftar Tugas Pokok */}
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-600" /> Tugas Pokok (SOP)
                  </h3>
                  <ul className="space-y-3">
                    {activeGuide.tugasUtama.map((tugas, idx) => (
                      <li key={idx} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold">{idx + 1}</span>
                        </div>
                        <span className="text-sm text-slate-700 leading-relaxed">{tugas}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Akses Fitur & Laporan */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <FileText size={20} className="text-rose-600" /> Laporan Harian
                    </h3>
                    <div className="flex flex-col gap-2">
                      {activeGuide.laporanHarian.map((lap, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-900 text-sm font-medium">
                          <FileText size={16} className="text-rose-500" /> {lap}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <LinkIcon size={20} className="text-blue-600" /> Akses Fitur Langsung
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeGuide.fiturAkses.map((fitur, idx) => {
                        const FiturIcon = fitur.icon;
                        return (
                          <Link key={idx} to={fitur.link} className="flex items-center gap-3 p-3 bg-white border border-slate-200 shadow-sm rounded-lg hover:border-blue-500 hover:shadow-md transition-all group">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activeGuide.color}`}>
                              <FiturIcon size={16} />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">{fitur.name}</span>
                            <ChevronRight size={14} className="ml-auto text-slate-400 group-hover:text-blue-600" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
