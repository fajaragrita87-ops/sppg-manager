import React, { useState } from 'react';
import { Truck, MapPin, CheckCircle2, Clock, Navigation, Camera, AlertCircle, ChefHat } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';

export default function DistribusiPage() {
  const [activeTab, setActiveTab] = useState<'berlangsung' | 'riwayat' | 'tracking'>('berlangsung');
  const user = useAuthStore(s => s.user);
  const isManagement = ['owner', 'kasppg', 'asisten_lapangan'].includes(user?.role || '');

  // State untuk modal bukti kirim
  const [showProofModal, setShowProofModal] = useState(false);
  const [activeDeliveryId, setActiveDeliveryId] = useState<string | null>(null);
  const [penerimaName, setPenerimaName] = useState('');
  const [photoCaptured, setPhotoCaptured] = useState(false);

  const [deliveries, setDeliveries] = useState([
    {
      id: 'DO-260516-01',
      sekolah: 'SDN 01 Merdeka',
      alamat: 'Jl. Merdeka No. 10, Kec. Tengah',
      porsi: 350,
      berangkat_jam: '07:30',
      estimasi_sampai: '08:00',
      status: 'perjalanan', // perjalanan, selesai
      penerima: null,
      waktu_sampai: null
    },
    {
      id: 'DO-260516-02',
      sekolah: 'SMPN 02 Bangsa',
      alamat: 'Jl. Pahlawan No. 45',
      porsi: 200,
      berangkat_jam: '07:30',
      estimasi_sampai: '08:45',
      status: 'pending',
      penerima: null,
      waktu_sampai: null
    }
  ]);

  const openProofModal = (id: string) => {
    setActiveDeliveryId(id);
    setPenerimaName('');
    setPhotoCaptured(false);
    setShowProofModal(true);
  };

  const handleSubmitProof = () => {
    if (!penerimaName) {
      toast.error('Nama penerima harus diisi!');
      return;
    }
    if (!photoCaptured) {
      toast.error('Anda harus mengambil foto bukti serah terima!');
      return;
    }

    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setDeliveries(deliveries.map(d => 
      d.id === activeDeliveryId ? { ...d, status: 'selesai', penerima: penerimaName, waktu_sampai: now } : d
    ));
    
    const d = deliveries.find(x => x.id === activeDeliveryId);
    toast.sukses(`Pengiriman ke ${d?.sekolah} berhasil diselesaikan dengan bukti foto!`);
    setShowProofModal(false);
  };

  const activeDeliveries = deliveries.filter(d => activeTab === 'berlangsung' ? d.status !== 'selesai' : d.status === 'selesai');

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Truck className="text-blue-600" /> Pengiriman & Distribusi
        </h1>
        <p className="text-slate-500 text-sm mt-1">Pantau rute dan laporkan bukti pengiriman makanan ke satuan pendidikan.</p>
      </div>

      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('berlangsung')}
          className={`px-6 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'berlangsung' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Sedang Berlangsung
        </button>
        <button
          onClick={() => setActiveTab('riwayat')}
          className={`px-6 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'riwayat' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Riwayat Selesai
        </button>
        {isManagement && (
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-6 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'tracking' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Navigation size={16} /> Live Tracking GPS
          </button>
        )}
      </div>

      {activeTab === 'tracking' ? (
        <LiveTrackingView />
      ) : (
        <div className="space-y-4">
        {activeDeliveries.length === 0 ? (
          <div className="card p-12 flex flex-col items-center justify-center text-center bg-slate-50 border-dashed">
            <CheckCircle2 size={48} className="text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-700">Tidak ada pengiriman</h3>
            <p className="text-sm text-slate-500">Semua rute telah selesai atau belum ada jadwal baru.</p>
          </div>
        ) : (
          activeDeliveries.map((d, index) => (
            <div key={d.id} className={`card p-0 overflow-hidden border-l-4 ${d.status === 'selesai' ? 'border-l-emerald-500' : d.status === 'perjalanan' ? 'border-l-blue-500' : 'border-l-amber-500'}`}>
              <div className="p-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{d.id}</span>
                      <h3 className="font-bold text-lg text-slate-900">{d.sekolah}</h3>
                    </div>
                    {d.status === 'selesai' ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold">
                        <CheckCircle2 size={12} /> Selesai
                      </span>
                    ) : d.status === 'perjalanan' ? (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">
                        <Truck size={12} /> Otw
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 flex items-start gap-2 mb-2">
                    <MapPin size={16} className="shrink-0 mt-0.5 text-slate-400" />
                    {d.alamat}
                  </p>

                  <div className="flex gap-4 mt-4">
                    <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 flex-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Total Muatan</p>
                      <p className="font-black text-slate-800">{d.porsi} Porsi</p>
                    </div>
                    <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 flex-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Target Waktu</p>
                      <p className="font-black text-slate-800">{d.estimasi_sampai}</p>
                    </div>
                  </div>

                  {d.status === 'selesai' && (
                    <div className="mt-4 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 flex items-center justify-between text-sm">
                      <div>
                        <p className="text-emerald-800 font-medium">Diterima oleh: <span className="font-bold">{d.penerima}</span></p>
                        <p className="text-emerald-600 text-xs">Pukul {d.waktu_sampai}</p>
                      </div>
                      <div className="text-emerald-500">
                        <CheckCircle2 size={24} />
                      </div>
                    </div>
                  )}
                </div>

                {d.status !== 'selesai' && (
                  <div className="flex flex-col gap-2 sm:w-48 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-4">
                    <button className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors flex justify-center items-center gap-2">
                      <Navigation size={16} /> Buka Maps
                    </button>
                    {d.status === 'pending' ? (
                      <button 
                        onClick={() => setDeliveries(deliveries.map(item => item.id === d.id ? { ...item, status: 'perjalanan' } : item))}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-sm transition-colors flex justify-center items-center gap-2"
                      >
                        Mulai Jalan
                      </button>
                    ) : (
                      <button 
                        onClick={() => openProofModal(d.id)}
                        className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-sm transition-colors flex justify-center items-center gap-2"
                      >
                        <Camera size={16} /> Ambil Bukti Kirim
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      )}

      {activeTab !== 'tracking' && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 items-start">
          <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-blue-900 text-sm mb-1">Panduan Pengemudi</h4>
            <p className="text-blue-700 text-xs leading-relaxed">
              Pastikan Anda mengambil foto serah terima bersama pihak sekolah dan mencatat nama penerima menggunakan fitur <b>Ambil Bukti Kirim</b>. Foto akan otomatis masuk ke Lampiran 30 BGN. Tombol <b>Buka Maps</b> akan mengarahkan Anda ke Google Maps untuk navigasi.
            </p>
          </div>
        </div>
      )}

      {/* MODAL BUKTI KIRIM */}
      {showProofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Camera size={18} className="text-emerald-500"/> Bukti Serah Terima
              </h3>
              <button onClick={() => setShowProofModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200"><AlertCircle size={18} className="rotate-45" /></button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nama Pihak Sekolah (Penerima)</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Bpk. Budi (Kepala Sekolah)"
                  value={penerimaName}
                  onChange={e => setPenerimaName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Foto Serah Terima & Makanan</label>
                {photoCaptured ? (
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center group border border-slate-200">
                    <img src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=800&auto=format&fit=crop" alt="Bukti Kirim" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-emerald-500/20 flex flex-col items-center justify-center">
                      <CheckCircle2 size={32} className="text-white drop-shadow-md mb-2" />
                      <span className="text-white font-bold drop-shadow-md text-sm">Foto Berhasil Disimpan</span>
                    </div>
                    <button onClick={() => setPhotoCaptured(false)} className="absolute top-2 right-2 px-3 py-1 bg-white/90 text-slate-700 text-xs font-bold rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">Ulangi</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      toast.sukses('Kamera terbuka... Jepret!');
                      setTimeout(() => setPhotoCaptured(true), 800);
                    }}
                    className="w-full aspect-video border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <Camera size={32} className="mb-2" />
                    <span className="font-bold text-sm">Buka Kamera HP</span>
                    <span className="text-xs text-slate-400 mt-1">Gunakan kamera belakang</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowProofModal(false)} className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-200 rounded-xl text-sm transition-colors">Batal</button>
              <button 
                onClick={handleSubmitProof}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-sm transition-colors flex items-center gap-2"
              >
                Upload & Selesaikan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Komponen Simulasi Live Tracking
function LiveTrackingView() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* List Armada */}
        <div className="md:col-span-1 space-y-3">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Truck size={18} className="text-blue-500" /> Armada Aktif (2)
          </h3>
          
          <div className="card p-3 border-2 border-blue-500 bg-blue-50/50 cursor-pointer">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded uppercase">Mobil 1 (B 1234 CD)</span>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <p className="font-bold text-slate-800 text-sm mb-1">Bpk. Yanto (Driver)</p>
            <p className="text-xs text-slate-500 mb-2">Menuju: SDN 01 Merdeka</p>
            <div className="flex gap-2 text-[10px] font-bold">
              <span className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-600">40 km/jam</span>
              <span className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-600">Est: 5 mnt lagi</span>
            </div>
          </div>

          <div className="card p-3 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer opacity-70">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold bg-slate-600 text-white px-2 py-0.5 rounded uppercase">Mobil 2 (D 5678 EF)</span>
              <span className="h-3 w-3 rounded-full bg-slate-300"></span>
            </div>
            <p className="font-bold text-slate-800 text-sm mb-1">Mas Dimas (Driver)</p>
            <p className="text-xs text-slate-500 mb-2">Menunggu jadwal berangkat...</p>
            <div className="flex gap-2 text-[10px] font-bold">
              <span className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-600">0 km/jam</span>
              <span className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-600">Di Dapur SPPG</span>
            </div>
          </div>
        </div>

        {/* Peta GPS Mockup */}
        <div className="md:col-span-2">
          <div className="w-full aspect-[4/3] sm:aspect-video rounded-2xl bg-slate-100 border-2 border-slate-200 overflow-hidden relative">
            {/* Tekstur Peta */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
            
            {/* Route Line SVG */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <path d="M 20% 80% Q 40% 50% 70% 30%" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="8 8" className="animate-pulse" />
            </svg>

            {/* Titik Dapur */}
            <div className="absolute left-[20%] top-[80%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="bg-white p-1 rounded-full shadow-lg border border-slate-200 mb-1 z-10"><ChefHat size={16} className="text-amber-600"/></div>
              <span className="text-[10px] font-bold bg-white/90 px-2 py-0.5 rounded shadow-sm text-slate-700 whitespace-nowrap">Dapur SPPG</span>
            </div>

            {/* Titik Mobil */}
            <div className="absolute left-[45%] top-[55%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-1000">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 mb-1 z-20 border-2 border-white ring-4 ring-blue-100">
                <Truck size={20} className="text-white" />
              </div>
              <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded shadow-md whitespace-nowrap z-20">Mobil 1 (Yanto)</span>
            </div>

            {/* Titik Sekolah */}
            <div className="absolute left-[70%] top-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="bg-white p-1.5 rounded-full shadow-lg border-2 border-emerald-500 mb-1 z-10"><MapPin size={18} className="text-emerald-500"/></div>
              <span className="text-[10px] font-bold bg-white/90 px-2 py-0.5 rounded shadow-sm text-slate-700 whitespace-nowrap border border-slate-200">SDN 01 Merdeka</span>
            </div>

            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-200 w-48">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status GPS</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-slate-700">Terhubung (Akurasi 5m)</span>
              </div>
              <div className="h-px bg-slate-200 my-2"></div>
              <p className="text-xs text-slate-600 leading-relaxed">Sistem mendeteksi Mobil 1 bergerak dengan kecepatan stabil. Tidak ada kendala lalu lintas di rute.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
