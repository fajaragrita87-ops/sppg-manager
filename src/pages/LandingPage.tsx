import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, X, CheckCircle2, BarChart3, Users, 
  Package, LayoutDashboard, RefreshCw, ChevronDown,
  ShieldCheck, Smartphone, Lock, AlertCircle, FileText,
  Clock, Activity, MapPin, Search, ArrowRight, Zap, Calculator
} from 'lucide-react';

// Path Logo Baru (Sesuai dengan file lokal / asset di Vite)
const LogoSrc = '/@fs/C:/Users/HP/.gemini/antigravity/brain/e86f3240-0563-4028-ae03-69b0fd25d478/sppg_manager_logo_1778922831608.png';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver untuk animasi fade-in halus saat scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-8');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      el.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700', 'ease-out');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <LayoutDashboard size={20} />,
      title: "Dapur & Produksi",
      desc: "Timeline SOP BGN dari jam 02:00",
      fullDesc: "Pantau seluruh kegiatan produksi dapur mulai dari persiapan bahan, memasak, hingga pengemasan dengan timeline yang sesuai standar operasional BGN.",
      bullets: ["Timeline produksi real-time", "Checklist kebersihan harian", "Monitoring suhu makanan"]
    },
    {
      icon: <Package size={20} />,
      title: "Inventori Cerdas",
      desc: "Stok real-time + survei harga 3 supplier",
      fullDesc: "Kelola stok bahan baku dengan mudah. Sistem akan memberikan peringatan jika stok menipis dan mencatat riwayat perbandingan harga dari berbagai supplier.",
      bullets: ["Peringatan stok minimum otomatis", "Form survei harga supplier terintegrasi", "Laporan mutasi bahan akurat"]
    },
    {
      icon: <Users size={20} />,
      title: "SDM & Insentif",
      desc: "Absensi tap-tap, gaji otomatis",
      fullDesc: "Catat kehadiran relawan dengan cepat. Sistem akan menghitung insentif secara otomatis berdasarkan jumlah kehadiran dan absensi harian.",
      bullets: ["Absensi digital dengan tap-tap", "Kalkulasi insentif & BPJS otomatis", "Database 47 relawan lengkap"]
    },
    {
      icon: <FileText size={20} />,
      title: "Laporan BGN",
      desc: "Input 3 menit, Lampiran 30 langsung jadi",
      fullDesc: "Tidak perlu lagi pusing dengan format Excel. Cukup pastikan data harian terisi, dan seluruh Lampiran 30 BGN otomatis ter-generate dalam format PDF.",
      bullets: ["Generate Lampiran 30 (A,C,D,L) otomatis", "Format 100% mengikuti Juknis", "Arsip pelaporan digital tersusun rapi"]
    },
    {
      icon: <RefreshCw size={20} />,
      title: "Sinkronisasi BGN",
      desc: "Auto kirim ke SIPGN & dialur",
      fullDesc: "Integrasi mutakhir untuk sistem pelaporan pusat. Data harian yang sudah dikunci otomatis disinkronkan ke server pusat tanpa perlu double-input.",
      bullets: ["Auto-sync ke server pusat", "Status sinkronisasi real-time", "Offline support dengan antrean"]
    },
    {
      icon: <Calculator size={20} />,
      title: "Keuangan Transparan",
      desc: "5 Buku Bantu BGN otomatis",
      fullDesc: "Sistem akuntansi dan pencatatan kas ringan yang secara ajaib mengisi 5 Buku Bantu sesuai standar pelaporan BGN.",
      bullets: ["Buku Kas Umum terpusat", "5 Buku Bantu BGN otomatis", "Manajemen Petty Cash aman"]
    }
  ];

  const faqs = [
    {
      q: "Apakah aplikasi ini produk resmi BGN?",
      a: "Bukan. Ini adalah aplikasi pihak ketiga independen yang dirancang agar laporan SPPG sesuai format juknis BGN. Kami tidak berafiliasi dengan Badan Gizi Nasional."
    },
    {
      q: "Apakah bisa dipakai di daerah tanpa sinyal internet?",
      a: "Ya. Semua formulir bisa diisi dalam mode offline. Data tersimpan lokal dan otomatis tersinkronisasi ke server saat internet tersedia kembali."
    },
    {
      q: "Apakah format laporannya benar-benar sesuai Lampiran 30 BGN?",
      a: "Ya. Kami menyusun semua laporan berdasarkan SK BGN No. 401.1 Tahun 2025 tentang Juknis Tata Kelola MBG TA 2026. Lampiran 30a, 30c, 30d, 30l semua tersedia."
    },
    {
      q: "Berapa lama setup awal?",
      a: "Rata-rata 5–10 menit untuk daftar dan isi profil SPPG. Absensi bisa langsung digunakan di hari yang sama."
    },
    {
      q: "Apakah data kami aman?",
      a: "Data disimpan di server cloud dengan enkripsi. Setiap SPPG hanya bisa mengakses datanya sendiri. Kami tidak menjual data kepada pihak ketiga."
    },
    {
      q: "Bagaimana cara mengupgrade atau membatalkan paket?",
      a: "Bisa dilakukan kapan saja dari menu Pengaturan → Paket & Billing. Tidak ada biaya penalti untuk pembatalan."
    }
  ];

  return (
    <div className="min-h-screen text-[#0f172a] selection:bg-[#dbeafe] bg-white font-sans" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      
      {/* ──────────────── BAGIAN 1: NAVBAR ──────────────── */}
      <nav className={`fixed w-full z-50 transition-all duration-300 h-[64px] flex items-center ${isScrolled ? 'bg-white shadow-sm border-b-[0.5px] border-[#e2e8f0]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
              <img src={LogoSrc} alt="Logo" className="h-8 w-auto object-contain" />
              <span className="font-bold text-lg text-[#0f172a] tracking-tight" style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600 }}>SPPG Manager</span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <a href="#fitur" className="text-[#475569] hover:text-[#0f172a] font-medium transition-colors text-sm">Produk</a>
              <a href="#fitur" className="text-[#475569] hover:text-[#0f172a] font-medium transition-colors text-sm">Fitur</a>
              <a href="#harga" className="text-[#475569] hover:text-[#0f172a] font-medium transition-colors text-sm">Harga</a>
              <a href="#faq" className="text-[#475569] hover:text-[#0f172a] font-medium transition-colors text-sm">Tentang</a>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => navigate('/login')} className="text-[#475569] hover:text-[#0f172a] font-medium transition-colors text-sm">
                Masuk
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="bg-[#1e6fbf] text-white px-[18px] py-[8px] rounded-[8px] font-medium hover:bg-[#1a5fa8] transition-colors text-sm shadow-sm"
              >
                Coba Gratis
              </button>
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[#0f172a]">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Laci Menu Mobile */}
        <div className={`md:hidden fixed top-[64px] right-0 h-full w-[250px] bg-white border-l border-[#e2e8f0] shadow-xl transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col p-6 gap-4">
            <a href="#fitur" onClick={() => setMobileMenuOpen(false)} className="text-[#475569] font-medium py-2">Produk</a>
            <a href="#fitur" onClick={() => setMobileMenuOpen(false)} className="text-[#475569] font-medium py-2">Fitur</a>
            <a href="#harga" onClick={() => setMobileMenuOpen(false)} className="text-[#475569] font-medium py-2">Harga</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-[#475569] font-medium py-2">Tentang</a>
            <div className="h-px bg-[#e2e8f0] my-2"></div>
            <button onClick={() => navigate('/login')} className="text-left text-[#475569] font-medium py-2">Masuk</button>
            <button onClick={() => navigate('/login')} className="bg-[#1e6fbf] text-white px-4 py-2 rounded-lg font-medium text-center">Coba Gratis</button>
          </div>
        </div>
      </nav>

      {/* ──────────────── BAGIAN 2: PAHLAWAN (HERO) ──────────────── */}
      <section className="bg-[#ffffff] pt-[120px] pb-[80px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            <div className="w-full lg:w-1/2 animate-on-scroll">
              <div className="inline-flex items-center gap-1 px-4 py-1 rounded-full border border-[#dbeafe] bg-[#eff6ff] text-[#1e40af] text-sm font-medium mb-6">
                ✦ Khusus untuk Pengelola Dapur SPPG
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-[#0f172a] leading-tight mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
                Kelola Dapur SPPG,<br />Laporan BGN Otomatis
              </h1>
              <p className="text-lg text-[#64748b] mt-4 max-w-lg leading-relaxed">
                Platform manajemen lengkap untuk operasional SPPG — dari absensi 47 relawan hingga Lampiran 30 BGN. Input 3 menit, laporan megah, sinkronisasi otomatis.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button onClick={() => navigate('/login')} className="bg-[#1e6fbf] text-white px-[24px] py-[12px] rounded-[8px] font-medium hover:bg-[#1a5fa8] transition-colors text-center shadow-sm">
                  Mulai Gratis Sekarang
                </button>
                <button className="bg-transparent border border-[#e2e8f0] text-[#475569] px-[24px] py-[12px] rounded-[8px] font-medium hover:bg-[#f8fafc] transition-colors text-center">
                  Lihat Demo
                </button>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-8">
                <div className="flex items-center gap-1.5 text-sm text-[#94a3b8] font-medium">
                  <ShieldCheck size={16} className="text-[#64748b]" /> Sesuai Juknis BGN 2026
                </div>
                <div className="flex items-center gap-1.5 text-sm text-[#94a3b8] font-medium">
                  <Zap size={16} className="text-[#64748b]" /> 📡 Offline Ready
                </div>
                <div className="flex items-center gap-1.5 text-sm text-[#94a3b8] font-medium">
                  <Smartphone size={16} className="text-[#64748b]" /> Support Semua HP
                </div>
                <div className="flex items-center gap-1.5 text-sm text-[#94a3b8] font-medium">
                  <Lock size={16} className="text-[#64748b]" /> Data Terenkripsi
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 animate-on-scroll">
              <div className="rounded-[16px] overflow-hidden shadow-2xl relative w-full lg:h-[450px] group">
                <img 
                  src="/@fs/C:/Users/HP/.gemini/antigravity/brain/c6a10909-959a-4fb7-9c5c-b9ed7dfbf03a/sppg_dashboard_mockup_1778898112669.png" 
                  alt="Dashboard SPPG Mockup" 
                  className="w-full h-full object-cover object-top transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/20 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── BAGIAN 3: STRIP LOGO / BUKTI SOSIAL ──────────────── */}
      <section className="bg-[#f8fafc] py-[40px] border-y border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-on-scroll">
          <p className="text-sm font-medium text-[#64748b] mb-4">Digunakan oleh SPPG di seluruh Indonesia</p>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 font-medium text-[#cbd5e1] text-base md:text-lg">
            <span>Jawa Barat</span>
            <span className="hidden sm:inline">·</span>
            <span>Jawa Tengah</span>
            <span className="hidden sm:inline">·</span>
            <span>Jawa Timur</span>
            <span className="hidden md:inline">·</span>
            <span>DKI Jakarta</span>
            <span className="hidden lg:inline">·</span>
            <span>Banten</span>
            <span className="hidden lg:inline">·</span>
            <span>Sumatra Utara</span>
            <span className="hidden xl:inline">·</span>
            <span>Sulawesi Selatan</span>
          </div>
        </div>
      </section>

      {/* ──────────────── BAGIAN 4: POIN RASA SAKIT ──────────────── */}
      <section className="bg-[#ffffff] py-[80px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-on-scroll">
            <h2 className="text-3xl font-bold text-[#0f172a] mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
              Masalah yang sering dialami pengelola SPPG
            </h2>
            <p className="text-base text-[#64748b]">
              Kami tahu betapa sulitnya mengelola dapur dengan regulasi ketat BGN
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-[24px]">
            <div className="bg-white border-[0.5px] border-[#f1f5f9] rounded-[12px] p-[28px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform animate-on-scroll">
              <div className="text-4xl font-bold text-[#e2e8f0] mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>01</div>
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><circle cx="12" cy="12" r="9" stroke="#ef4444" strokeWidth="1.5"/><path d="M12 7v5l3 3" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3 className="text-lg font-semibold text-[#0f172a] mt-2">Laporan harian ke BGN butuh 1–2 jam</h3>
              <p className="text-[#64748b] text-sm mt-2 leading-relaxed">
                Buka Excel, copy-paste data manual, format ulang. Setiap hari tanpa henti.
              </p>
            </div>
            
            <div className="bg-white border-[0.5px] border-[#f1f5f9] rounded-[12px] p-[28px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform animate-on-scroll" style={{ transitionDelay: '100ms' }}>
              <div className="text-4xl font-bold text-[#e2e8f0] mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>02</div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 2l9 4.5v9L12 20l-9-4.5v-9L12 2z" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round"/><path d="M12 2v18M3 6.5l9 4.5 9-4.5" stroke="#f59e0b" strokeWidth="1.5"/></svg>
              </div>
              <h3 className="text-lg font-semibold text-[#0f172a] mt-2">Stok bahan habis tanpa peringatan</h3>
              <p className="text-[#64748b] text-sm mt-2 leading-relaxed">
                Tidak ada yang tahu sampai pagi hari produksi mau dimulai bahan sudah kosong.
              </p>
            </div>

            <div className="bg-white border-[0.5px] border-[#f1f5f9] rounded-[12px] p-[28px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform animate-on-scroll" style={{ transitionDelay: '200ms' }}>
              <div className="text-4xl font-bold text-[#e2e8f0] mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>03</div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><rect x="4" y="2" width="16" height="20" rx="2" stroke="#10b981" strokeWidth="1.5"/><path d="M8 7h8M8 11h5M8 15h6" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <h3 className="text-lg font-semibold text-[#0f172a] mt-2">Hitung insentif 47 relawan masih manual</h3>
              <p className="text-[#64748b] text-sm mt-2 leading-relaxed">
                Absensi di kertas, hitung pakai kalkulator, transfer satu per satu tiap 2 minggu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── BAGIAN 5: FITUR UTAMA (CAROUSEL UI) ──────────────── */}
      <section id="fitur" className="bg-[#f8fafc] py-[80px] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex justify-between items-end mb-12 animate-on-scroll">
            <div>
              <h2 className="text-3xl font-bold text-[#0f172a] mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
                Arsitektur AI & Fitur Terintegrasi
              </h2>
              <p className="text-base text-[#64748b] max-w-2xl">
                Otomasi seluruh pekerjaan manual dengan asisten pintar dan pencatatan presisi tinggi.
              </p>
            </div>
            <div className="hidden md:flex gap-3">
              <button 
                onClick={() => setActiveTab(prev => (prev === 0 ? features.length - 1 : prev - 1))}
                className="w-12 h-12 rounded-full border border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:bg-white hover:text-[#0f172a] transition-colors shadow-sm bg-[#f8fafc]"
              >
                ←
              </button>
              <button 
                onClick={() => setActiveTab(prev => (prev === features.length - 1 ? 0 : prev + 1))}
                className="w-12 h-12 rounded-full bg-[#1e6fbf] flex items-center justify-center text-white hover:bg-[#1a5fa8] transition-colors shadow-sm"
              >
                →
              </button>
            </div>
          </div>

          {/* Carousel Track */}
          <div className="relative w-full pb-8">
            <div 
              className="flex gap-6 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{ transform: `translateX(calc(-${activeTab * 100}% - ${activeTab * 24}px))` }}
            >
              {features.map((feature, idx) => (
                <div key={idx} className="w-full shrink-0 md:w-[85%] lg:w-[70%]">
                  <div className="bg-white rounded-[24px] border border-[#e2e8f0] shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col md:flex-row h-full">
                    
                    {/* Smart Data Visualization */}
                    <div className="w-full md:w-1/2 bg-gradient-to-br from-[#f0f7ff] via-white to-[#f8fafc] relative overflow-hidden flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-[#e8eef5]">
                      <div className="w-full max-w-xs">
                        {idx === 0 && (<div>
                          <div className="flex justify-between mb-3"><span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Timeline Produksi</span><span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Live</span></div>
                          {[['Persiapan Bahan','100','#1e6fbf'],['Memasak','100','#1e6fbf'],['QC Organoleptik','80','#f59e0b'],['Pengemasan','0','#e2e8f0'],['Distribusi','0','#e2e8f0']].map(([s,w,c],i)=><div key={i} className="flex items-center gap-2 mb-2.5"><span className="text-[10px] text-[#64748b] w-28 shrink-0">{s}</span><div className="flex-1 bg-[#f1f5f9] rounded-full h-2.5"><div className="h-full rounded-full transition-all duration-700" style={{width:`${w}%`,background:c}}/></div><span className="text-[10px] font-bold w-8 text-right" style={{color:c}}>{w==='100'?'✓':w==='0'?'—':`${w}%`}</span></div>)}
                        </div>)}
                        {idx === 1 && (<div>
                          <div className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-3">Status Stok Real-time</div>
                          {[['Beras Premium',90,'#1e6fbf','OK'],['Minyak Goreng',22,'#ef4444','KRITIS'],['Telur Ayam',45,'#f59e0b','RENDAH'],['Sayuran Segar',73,'#1e6fbf','OK'],['Bumbu Dapur',88,'#1e6fbf','OK']].map(([n,p,c,s],i)=><div key={i} className="flex items-center gap-2 mb-2"><span className="text-[10px] text-[#64748b] w-24 shrink-0 truncate">{n}</span><div className="flex-1 bg-[#f1f5f9] rounded-full h-2"><div className="h-full rounded-full" style={{width:`${p}%`,background:c}}/></div><span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{background:`${c}20`,color:c}}>{s}</span></div>)}
                        </div>)}
                        {idx === 2 && (<div className="text-center">
                          <div className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-3">Kehadiran Hari Ini</div>
                          <div className="grid grid-cols-8 gap-1 mb-4">{Array.from({length:47},(_,i)=><div key={i} className={`w-5 h-5 rounded-full ${i<38?'bg-[#1e6fbf]':'bg-red-200'}`}/>)}</div>
                          <div className="flex justify-center gap-6"><div><div className="text-2xl font-black text-[#1e6fbf]">38</div><div className="text-[10px] text-[#94a3b8]">Hadir</div></div><div className="w-px bg-[#e2e8f0]"/><div><div className="text-2xl font-black text-red-400">9</div><div className="text-[10px] text-[#94a3b8]">Absen</div></div><div className="w-px bg-[#e2e8f0]"/><div><div className="text-2xl font-black text-green-500">81%</div><div className="text-[10px] text-[#94a3b8]">Rate</div></div></div>
                        </div>)}
                        {idx === 3 && (<div className="text-center">
                          <div className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-5">Efisiensi Pelaporan</div>
                          <div className="flex items-end justify-center gap-8 mb-5"><div><div className="text-4xl font-black text-red-400 line-through opacity-50">120</div><div className="text-[10px] text-[#94a3b8]">menit dulu</div></div><div className="text-[#94a3b8] text-xl mb-3">→</div><div><div className="text-5xl font-black text-[#1e6fbf]">3</div><div className="text-[10px] text-[#94a3b8]">menit kini</div></div></div>
                          <div className="bg-green-50 text-green-700 text-xs font-bold py-2 rounded-xl">↓ 97.5% lebih efisien</div>
                        </div>)}
                        {idx === 4 && (<div>
                          <div className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-4 text-center">Status Sinkronisasi</div>
                          <div className="flex flex-col items-center gap-2">{[['SPPG Manager','Sumber data','#1e6fbf'],['Server SIPGN','Relay pusat','#10b981'],['BGN Pusat','Tersinkron','#f59e0b']].map(([t,s,c],i)=><div key={i} className="w-full"><div className="flex items-center gap-3 bg-white border border-[#e2e8f0] rounded-xl px-4 py-2.5 shadow-sm"><div className="w-2 h-2 rounded-full animate-pulse" style={{background:c}}/><div><div className="text-xs font-bold text-[#0f172a]">{t}</div><div className="text-[9px] text-[#94a3b8]">{s}</div></div></div>{i<2&&<div className="flex justify-center my-1"><div className="w-px h-3 bg-[#e2e8f0]"/></div>}</div>)}</div>
                        </div>)}
                        {idx === 5 && (<div>
                          <div className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-3">5 Buku Bantu BGN</div>
                          {[['Buku Kas Umum','Rp 24,750,000','#1e6fbf'],['Buku Bank','Rp 18,200,000','#1e6fbf'],['Buku Petty Cash','Rp 1,250,000','#10b981'],['Buku Persekot','Rp 500,000','#f59e0b'],['Buku Pajak','Rp 2,100,000','#8b5cf6']].map(([b,n,c],i)=><div key={i} className="flex items-center justify-between py-2 border-b border-[#f8fafc] last:border-0"><div className="flex items-center gap-2"><div className="w-1.5 h-5 rounded-sm" style={{background:c}}/><span className="text-[11px] font-medium text-[#334155]">{b}</span></div><span className="text-[11px] font-bold" style={{color:c}}>{n}</span></div>)}
                        </div>)}
                      </div>
                    </div>

                    {/* Content Side */}
                    <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                      <div className="w-12 h-12 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#1e6fbf] mb-6">
                        {feature.icon}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>{feature.title}</h3>
                      <p className="text-[#475569] text-base md:text-lg mb-8 leading-relaxed">
                        {feature.fullDesc}
                      </p>
                      <ul className="space-y-4">
                        {feature.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-3 text-[#334155] font-medium">
                            <CheckCircle2 size={20} className="text-[#10b981] shrink-0 mt-0.5" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Indicators (Mobile) */}
          <div className="flex justify-center mt-6 gap-2 md:hidden">
            {features.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`h-2 rounded-full transition-all ${activeTab === idx ? 'w-8 bg-[#1e6fbf]' : 'w-2 bg-[#cbd5e1]'}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* ──────────────── BAGIAN 6: CARA KERJA ──────────────── */}
      <section className="bg-[#ffffff] py-[80px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-on-scroll">
            <h2 className="text-3xl font-bold text-[#0f172a] mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
              Semudah ini menggunakan platform kami
            </h2>
            <p className="text-base text-[#64748b]">
              3 langkah, mulai dari daftar sampai laporan terkirim ke BGN
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-10 relative animate-on-scroll">
            {/* Garis penghubung di desktop */}
            <div className="hidden md:block absolute top-6 left-[15%] right-[15%] h-[2px] bg-[#e2e8f0] z-0">
              {/* Panah dekoratif */}
              <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-[#cbd5e1]"><ArrowRight size={20} /></div>
            </div>

            <div className="flex-1 relative z-10 flex flex-col items-center text-center">
              <div className="flex items-center gap-3 mb-4 bg-white px-3 py-1.5 rounded-full border border-[#e2e8f0]">
                <span className="w-8 h-8 rounded-full bg-[#eff6ff] text-[#1e6fbf] flex items-center justify-center font-bold text-sm">01</span>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M3 21h18M9 21V7l6-4v18" stroke="#1e6fbf" strokeWidth="1.5" strokeLinejoin="round"/><path d="M13 13h2v3h-2z" stroke="#1e6fbf" strokeWidth="1.5"/></svg>
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] mb-2">Daftarkan SPPG Anda</h3>
              <p className="text-[#64748b] leading-relaxed text-sm">
                Setup akun dalam 5 menit. Input profil SPPG, data yayasan, dan VA Himbara. Langsung bisa dipakai.
              </p>
            </div>

            <div className="flex-1 relative z-10 flex flex-col items-center text-center">
              <div className="flex items-center gap-3 mb-4 bg-white px-3 py-1.5 rounded-full border border-[#e2e8f0]">
                <span className="w-8 h-8 rounded-full bg-[#eff6ff] text-[#1e6fbf] flex items-center justify-center font-bold text-sm">02</span>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><circle cx="9" cy="7" r="3" stroke="#1e6fbf" strokeWidth="1.5"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="#1e6fbf" strokeWidth="1.5" strokeLinecap="round"/><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.85" stroke="#1e6fbf" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] mb-2">Input Data Relawan & Operasional</h3>
              <p className="text-[#64748b] leading-relaxed text-sm">
                Masukkan data 47 relawan sekali saja. Mulai absensi, catat belanja, input produksi harian.
              </p>
            </div>

            <div className="flex-1 relative z-10 flex flex-col items-center text-center">
              <div className="flex items-center gap-3 mb-4 bg-white px-3 py-1.5 rounded-full border border-[#e2e8f0]">
                <span className="w-8 h-8 rounded-full bg-[#eff6ff] text-[#1e6fbf] flex items-center justify-center font-bold text-sm">03</span>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#1e6fbf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] mb-2">Laporan Terkirim Otomatis</h3>
              <p className="text-[#64748b] leading-relaxed text-sm">
                Kunci laporan harian 3 langkah. Lampiran 30 BGN langsung di-generate dan terkirim ke pemerintah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── BAGIAN 7: STATISTIK ──────────────── */}
      <section className="bg-[#1e6fbf] py-[60px] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center animate-on-scroll">
            <div>
              <div className="text-4xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>3 Menit</div>
              <div className="text-[#bfdbfe] text-sm">Waktu isi laporan harian</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>100%</div>
              <div className="text-[#bfdbfe] text-sm">Format sesuai juknis BGN</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>47 Relawan</div>
              <div className="text-[#bfdbfe] text-sm">Bisa dikelola per SPPG</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>313 Hari</div>
              <div className="text-[#bfdbfe] text-sm">Hari operasional terlayani</div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── BAGIAN 8: KESAKSIAN ──────────────── */}
      <section className="bg-[#f8fafc] py-[80px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl font-bold text-[#0f172a]" style={{ fontFamily: 'Sora, sans-serif' }}>
              Dipercaya pengelola SPPG aktif
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-[24px] rounded-[12px] border border-[#e2e8f0] shadow-sm animate-on-scroll">
              <div className="flex gap-1 text-[#fbbf24] mb-4 text-sm">★★★★★</div>
              <p className="text-[#475569] italic mb-6 text-sm leading-relaxed">
                "Dulu laporan harian 2 jam, sekarang 3 menit langsung terkirim. Admin kami tidak stres lagi tiap hari."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f1f5f9] text-[#1e6fbf] rounded-full flex items-center justify-center font-bold text-sm">SW</div>
                <div>
                  <div className="font-semibold text-[#0f172a] text-sm">Sri Wahyuni</div>
                  <div className="text-xs text-[#64748b]">Pengawas Keuangan, Jawa Tengah</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-[24px] rounded-[12px] border border-[#e2e8f0] shadow-sm animate-on-scroll" style={{ transitionDelay: '100ms' }}>
              <div className="flex gap-1 text-[#fbbf24] mb-4 text-sm">★★★★★</div>
              <p className="text-[#475569] italic mb-6 text-sm leading-relaxed">
                "Stok bahan sekarang terpantau real-time. Tidak pernah lagi kehabisan bahan secara tiba-tiba saat produksi."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f1f5f9] text-[#1e6fbf] rounded-full flex items-center justify-center font-bold text-sm">BS</div>
                <div>
                  <div className="font-semibold text-[#0f172a] text-sm">Budi Santoso</div>
                  <div className="text-xs text-[#64748b]">Kepala SPPG, Jawa Barat</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-[24px] rounded-[12px] border border-[#e2e8f0] shadow-sm animate-on-scroll" style={{ transitionDelay: '200ms' }}>
              <div className="flex gap-1 text-[#fbbf24] mb-4 text-sm">★★★★★</div>
              <p className="text-[#475569] italic mb-6 text-sm leading-relaxed">
                "Insentif 44 relawan yang dulu 3 jam hitung manual, sekarang otomatis dari absensi. Luar biasa."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f1f5f9] text-[#1e6fbf] rounded-full flex items-center justify-center font-bold text-sm">RM</div>
                <div>
                  <div className="font-semibold text-[#0f172a] text-sm">Rina Marlina</div>
                  <div className="text-xs text-[#64748b]">Pengawas Keuangan, Banten</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── BAGIAN 9: HARGA ──────────────── */}
      <section id="harga" className="bg-[#ffffff] py-[80px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 animate-on-scroll">
            <h2 className="text-3xl font-bold text-[#0f172a] mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
              Pilih paket yang sesuai kebutuhan SPPG Anda
            </h2>
          </div>

          <div className="flex justify-center mb-12 animate-on-scroll">
            <div className="bg-[#f1f5f9] p-1 rounded-lg flex items-center">
              <button 
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 rounded-[6px] text-sm font-semibold transition-all ${!isAnnual ? 'bg-white text-[#0f172a] shadow-sm' : 'text-[#64748b] hover:text-[#0f172a]'}`}
              >
                Bulanan
              </button>
              <button 
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 rounded-[6px] text-sm font-semibold transition-all flex items-center gap-2 ${isAnnual ? 'bg-white text-[#0f172a] shadow-sm' : 'text-[#64748b] hover:text-[#0f172a]'}`}
              >
                Tahunan <span className="bg-[#dcfce7] text-[#166534] px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">Hemat 20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
            
            {/* Starter */}
            <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-[32px] flex flex-col h-full animate-on-scroll">
              <span className="bg-[#f8fafc] text-[#475569] text-xs font-bold px-3 py-1 rounded-full self-start mb-6 border border-[#e2e8f0]">Untuk mulai mencoba</span>
              <h3 className="text-xl font-bold text-[#0f172a] mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>STARTER</h3>
              <div className="mb-6 border-b border-[#f1f5f9] pb-6">
                <span className="text-4xl font-bold text-[#0f172a]" style={{ fontFamily: 'Sora, sans-serif' }}>Rp 0</span>
                <span className="text-[#64748b] text-sm font-medium"> / bulan</span>
              </div>
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#10b981]" /> <span className="text-[#475569] text-sm">1 SPPG</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#10b981]" /> <span className="text-[#475569] text-sm">Maks. 30 relawan</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#10b981]" /> <span className="text-[#475569] text-sm">Dashboard & absensi</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#10b981]" /> <span className="text-[#475569] text-sm">Laporan harian (tanpa PDF BGN)</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#10b981]" /> <span className="text-[#475569] text-sm">Inventaris dasar</span></div>
                <div className="flex items-center gap-3 opacity-50"><X size={18} className="text-[#94a3b8]" /> <span className="text-[#94a3b8] text-sm">Sinkronisasi ke BGN otomatis</span></div>
                <div className="flex items-center gap-3 opacity-50"><X size={18} className="text-[#94a3b8]" /> <span className="text-[#94a3b8] text-sm">Generate Lampiran 30</span></div>
                <div className="flex items-center gap-3 opacity-50"><X size={18} className="text-[#94a3b8]" /> <span className="text-[#94a3b8] text-sm">Support prioritas</span></div>
              </div>
              <button className="w-full py-[12px] rounded-[8px] border border-[#e2e8f0] font-medium text-[#0f172a] hover:bg-[#f8fafc] transition-colors mt-auto text-sm">
                Mulai Gratis
              </button>
            </div>

            {/* Pro */}
            <div className="bg-white border-2 border-[#1e6fbf] shadow-md rounded-[16px] p-[32px] flex flex-col h-[105%] relative z-10 animate-on-scroll">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1e6fbf] text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                Paling Populer
              </div>
              <span className="bg-[#eff6ff] text-[#1e6fbf] text-xs font-bold px-3 py-1 rounded-full self-start mb-6">Pilihan Utama</span>
              <h3 className="text-xl font-bold text-[#0f172a] mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>PRO</h3>
              <div className="mb-6 border-b border-[#f1f5f9] pb-6">
                <span className="text-4xl font-bold text-[#0f172a]" style={{ fontFamily: 'Sora, sans-serif' }}>{isAnnual ? 'Rp 239.000' : 'Rp 299.000'}</span>
                <span className="text-[#64748b] text-sm font-medium"> / bulan</span>
              </div>
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#10b981]" /> <span className="text-[#0f172a] font-medium text-sm">1 SPPG, relawan unlimited</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#10b981]" /> <span className="text-[#0f172a] font-medium text-sm">Semua fitur lengkap</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#10b981]" /> <span className="text-[#0f172a] font-medium text-sm">Generate semua 30 BGN</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#10b981]" /> <span className="text-[#0f172a] font-medium text-sm">Sync otomatis SIPGN & dialur</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#10b981]" /> <span className="text-[#0f172a] font-medium text-sm">Inventori Level Kledo</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#10b981]" /> <span className="text-[#0f172a] font-medium text-sm">Siap offline</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#10b981]" /> <span className="text-[#0f172a] font-medium text-sm">Dukungan melalui WhatsApp</span></div>
                <div className="flex items-center gap-3 opacity-50"><X size={18} className="text-[#94a3b8]" /> <span className="text-[#94a3b8] text-sm">Multi-SPPG</span></div>
              </div>
              <button className="w-full py-[12px] rounded-[8px] bg-[#1e6fbf] font-medium text-white hover:bg-[#1a5fa8] transition-colors mt-auto shadow-sm text-sm">
                Coba 14 Hari Gratis
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-[32px] flex flex-col h-full animate-on-scroll">
              <span className="bg-[#f8fafc] text-[#475569] text-xs font-bold px-3 py-1 rounded-full self-start mb-6 border border-[#e2e8f0]">Untuk yayasan besar</span>
              <h3 className="text-xl font-bold text-[#0f172a] mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>ENTERPRISE</h3>
              <div className="mb-6 border-b border-[#f1f5f9] pb-6">
                <span className="text-4xl font-bold text-[#0f172a]" style={{ fontFamily: 'Sora, sans-serif' }}>Custom</span>
              </div>
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#10b981]" /> <span className="text-[#475569] text-sm">Multi-SPPG dalam 1 akun</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#10b981]" /> <span className="text-[#475569] text-sm">Dashboard konsolidasi yayasan</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#10b981]" /> <span className="text-[#475569] text-sm">Semua fitur Pro</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#10b981]" /> <span className="text-[#475569] text-sm">Dukungan khusus 24/7</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#10b981]" /> <span className="text-[#475569] text-sm">Tim orientasi & pelatihan</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#10b981]" /> <span className="text-[#475569] text-sm">Integrasi khusus</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#10b981]" /> <span className="text-[#475569] text-sm">SLA terjamin</span></div>
              </div>
              <button className="w-full py-[12px] rounded-[8px] border border-[#e2e8f0] font-medium text-[#0f172a] hover:bg-[#f8fafc] transition-colors mt-auto text-sm">
                Hubungi Sales
              </button>
            </div>
            
          </div>
        </div>
      </section>

      {/* ──────────────── BAGIAN 10: TANYA JAWAB (FAQ) ──────────────── */}
      <section id="faq" className="bg-[#f8fafc] py-[80px]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 animate-on-scroll">
            <h2 className="text-3xl font-bold text-[#0f172a]" style={{ fontFamily: 'Sora, sans-serif' }}>
              Pertanyaan yang sering ditanyakan
            </h2>
          </div>

          <div className="space-y-3 animate-on-scroll">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-[#e2e8f0] rounded-[12px] overflow-hidden transition-all duration-300 shadow-sm">
                <button 
                  className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                >
                  <span className="font-semibold text-[#0f172a] text-sm md:text-base">{faq.q}</span>
                  <ChevronDown className={`text-[#94a3b8] transition-transform duration-300 w-5 h-5 flex-shrink-0 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === idx ? 'max-h-48 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-[#64748b] text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── BAGIAN 11: CTA AKHIR ──────────────── */}
      <section className="bg-[#1e6fbf] py-[80px] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-on-scroll">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
            Mulai kelola SPPG Anda<br />lebih profesional hari ini
          </h2>
          <p className="text-[#bfdbfe] text-lg mb-8">
            Gratis 14 hari. Setup 5 menit. Tidak perlu kartu kredit.
          </p>
          <button onClick={() => navigate('/login')} className="bg-white text-[#1e6fbf] px-[32px] py-[14px] rounded-[8px] font-semibold text-base hover:bg-[#f8fafc] transition-colors shadow-sm">
            Daftarkan SPPG Anda Sekarang
          </button>
        </div>
      </section>

      {/* ──────────────── BAGIAN 12: FOOTER ──────────────── */}
      <footer className="bg-[#0f172a] text-white py-[60px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10 border-b border-[#1e293b] pb-10">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src={LogoSrc} alt="SPPG Logo" className="h-8 w-auto brightness-0 invert" />
                <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'Sora, sans-serif' }}>SPPG Manager</span>
              </div>
              <p className="text-[#94a3b8] mb-6 text-sm leading-relaxed">
                Platform manajemen operasional terlengkap untuk satuan pelayanan program makan bergizi gratis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-[#f8fafc] text-sm">Produk</h4>
              <ul className="space-y-3 text-[#94a3b8] text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="#fitur" className="hover:text-white transition-colors">Fitur Lengkap</a></li>
                <li><a href="#harga" className="hover:text-white transition-colors">Harga Paket</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-[#f8fafc] text-sm">Dukungan</h4>
              <ul className="space-y-3 text-[#94a3b8] text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Panduan Penggunaan</a></li>
                <li><a href="#" className="hover:text-white transition-colors">WhatsApp Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Hubungi Kami</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-[#f8fafc] text-sm">Legal</h4>
              <ul className="space-y-3 text-[#94a3b8] text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Syarat Penggunaan</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Keamanan Data</a></li>
              </ul>
            </div>
          </div>
          
          <div className="text-[#64748b] text-xs text-center">
            © 2025 SPPG Manager · Produk pihak ketiga independen · Tidak berafiliasi dengan Badan Gizi Nasional (BGN)
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
