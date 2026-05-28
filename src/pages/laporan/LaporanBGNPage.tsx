import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Download, CheckCircle2, Clock, AlertCircle, ChevronRight,
  Send, Eye, Users, UtensilsCrossed, Wallet, Truck, History,
  RefreshCw, ExternalLink, FileCheck, AlertTriangle
} from 'lucide-react';
import { useKeuanganStore } from '@/store/keuanganStore';
import { toast } from '@/store/toastStore';

// Ikon per lampiran (Lucide)
const LAMPIRAN_ICONS: Record<string, React.ElementType> = {
  '30A': Users,
  '30B': Truck,
  '30C': UtensilsCrossed,
  '30D': Wallet,
  '30L': FileText,
};

const RIWAYAT_LAPORAN = [
  { periode: 'Periode Minggu ke-19 (1–7 Mei 2026)', tanggal_submit: '8 Mei 2026 09:14', status: 'diterima', no_referensi: 'BGN/LAP/2026/05/W19/001' },
  { periode: 'Periode Minggu ke-18 (24–30 Apr 2026)', tanggal_submit: '1 Mei 2026 08:55', status: 'diterima', no_referensi: 'BGN/LAP/2026/04/W18/001' },
  { periode: 'Periode Minggu ke-17 (17–23 Apr 2026)', tanggal_submit: '24 Apr 2026 10:02', status: 'revisi', no_referensi: 'BGN/LAP/2026/04/W17/001' },
  { periode: 'Periode Minggu ke-16 (10–16 Apr 2026)', tanggal_submit: '17 Apr 2026 08:30', status: 'diterima', no_referensi: 'BGN/LAP/2026/04/W16/001' },
];

export default function LaporanBGNPage() {
  const navigate = useNavigate();
  const keuangan = useKeuanganStore();

  const [activeTab, setActiveTab] = useState<'generate' | 'riwayat'>('generate');
  const [periodeStart, setPeriodeStart] = useState('2026-05-08');
  const [periodeEnd, setPeriodeEnd] = useState('2026-05-14');
  const [generating, setGenerating] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Lampiran status — Lamp 30D depends on laporanHarianStatus
  const lamp30dReady = keuangan.laporanHarianStatus === 'terkirim';

  const LAMPIRAN = [
    {
      kode: '30A', nama: 'Lampiran 30a — Data Penerima Manfaat',
      desc: 'Daftar satuan pendidikan dan jumlah penerima manfaat per kategori',
      status: 'ready', tanggal: '15 Mei 2026',
      actionLink: '/penerima-manfaat',
    },
    {
      kode: '30B', nama: 'Lampiran 30b — Laporan Distribusi Harian',
      desc: 'Rekap pengantaran porsi per satdik dan jadwal distribusi',
      status: 'ready', tanggal: '14 Mei 2026',
      actionLink: '/distribusi',
    },
    {
      kode: '30C', nama: 'Lampiran 30c — Realisasi Menu & Produksi',
      desc: 'Menu harian, jumlah porsi diproduksi, dan komposisi gizi',
      status: 'ready', tanggal: '15 Mei 2026',
      actionLink: '/laporan/mingguan',
    },
    {
      kode: '30D', nama: 'Lampiran 30d — Realisasi Keuangan',
      desc: 'Penggunaan dana BGN vs anggaran — harus kunci laporan harian terlebih dahulu',
      status: lamp30dReady ? 'ready' : 'pending',
      tanggal: lamp30dReady ? new Date().toLocaleDateString('id-ID') : '-',
      pendingReason: 'Laporan harian belum dikunci. Kunci laporan dari tab Pelaporan BGN → Harian terlebih dahulu.',
      actionLink: '/laporan/harian',
    },
    {
      kode: '30L', nama: 'Lampiran 30l — Jadwal & Rute Distribusi',
      desc: 'Jadwal pengantaran, wilayah distribusi, dan konfirmasi penerimaan',
      status: 'ready', tanggal: '14 Mei 2026',
      actionLink: '/distribusi',
    },
  ];

  const readyCount = LAMPIRAN.filter(l => l.status === 'ready').length;
  const allReady = readyCount === LAMPIRAN.length;

  const handleGenerate = (kode: string, actionLink?: string) => {
    setGenerating(kode);
    setTimeout(() => {
      setGenerating(null);
      toast.sukses(`Lampiran ${kode} siap diunduh`, 'File PDF berhasil digenerate.');
      window.print();
    }, 1800);
  };

  const handleKirimSemua = async () => {
    if (!allReady) {
      toast.error('Belum siap', 'Lengkapi semua lampiran sebelum mengirim ke BGN.');
      return;
    }
    if (!confirm('Kirim semua lampiran ke sistem BGN? Tindakan ini tidak dapat dibatalkan.')) return;
    setSending(true);
    // Simulasi kirim data (dikurangi agar lebih cepat < 2 detik)
    await new Promise(r => setTimeout(r, 800));
    setSending(false);
    toast.sukses('Laporan berhasil dikirim ke BGN!', 'No. referensi akan tersedia dalam 1×24 jam.');
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display text-xl font-semibold text-slate-900">Laporan ke BGN</h1>
          <p className="text-sm text-slate-500 mt-1">Generate &amp; kirim Lampiran 30 sesuai Juknis SK-401.1/2025</p>
        </div>
      </div>

      {/* STATUS BANNER */}
      <div className={`card p-4 mb-6 flex items-center gap-4 ${allReady ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${allReady ? 'bg-emerald-100' : 'bg-amber-100'}`}>
          {allReady
            ? <CheckCircle2 size={20} className="text-emerald-600" />
            : <AlertCircle size={20} className="text-amber-600" />
          }
        </div>
        <div className="flex-1">
          <p className={`font-semibold text-sm ${allReady ? 'text-emerald-800' : 'text-amber-800'}`}>
            {allReady
              ? `Semua ${LAMPIRAN.length} lampiran siap dikirim ke BGN!`
              : `${LAMPIRAN.length - readyCount} lampiran belum siap — lengkapi data terlebih dahulu`
            }
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Periode: <strong>{periodeStart} s.d. {periodeEnd}</strong> &nbsp;|&nbsp; {readyCount}/{LAMPIRAN.length} siap
          </p>
        </div>
        {allReady && (
          <button
            onClick={handleKirimSemua}
            disabled={sending}
            className="btn-primary text-xs flex items-center gap-1.5 whitespace-nowrap"
          >
            {sending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
            {sending ? 'Mengirim...' : 'Kirim Semua ke BGN'}
          </button>
        )}
      </div>

      {/* TABS */}
      <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 mb-6">
        {[
          { id: 'generate', label: 'Generate Lampiran', icon: FileCheck },
          { id: 'riwayat',  label: 'Riwayat Pengiriman', icon: History },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === t.id ? 'bg-white text-blue-700 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Icon size={14} className={activeTab === t.id ? 'text-blue-500' : 'opacity-50'} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB: GENERATE */}
      {activeTab === 'generate' && (
        <div className="space-y-4 animate-fade-in">
          {/* Periode Selector */}
          <div className="card p-4 flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="label">Periode Awal</label>
              <input type="date" value={periodeStart} onChange={e => setPeriodeStart(e.target.value)} className="input text-sm w-full" />
            </div>
            <div className="flex-1">
              <label className="label">Periode Akhir</label>
              <input type="date" value={periodeEnd} onChange={e => setPeriodeEnd(e.target.value)} className="input text-sm w-full" />
            </div>
            <button className="btn-primary text-sm py-2.5 whitespace-nowrap">Terapkan Periode</button>
          </div>

          {/* Lampiran Cards */}
          <div className="space-y-3">
            {LAMPIRAN.map((lamp) => {
              const Icon = LAMPIRAN_ICONS[lamp.kode] || FileText;
              return (
                <div key={lamp.kode} className="card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${lamp.status === 'ready' ? 'bg-blue-100' : 'bg-amber-100'}`}>
                    <Icon size={22} className={lamp.status === 'ready' ? 'text-blue-600' : 'text-amber-600'} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-slate-800">{lamp.nama}</h3>
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wide border ${
                        lamp.status === 'ready'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {lamp.status === 'ready'
                          ? <><CheckCircle2 size={9}/> Siap</>
                          : <><AlertTriangle size={9}/> Belum Lengkap</>
                        }
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{lamp.desc}</p>
                    {lamp.tanggal !== '-' && (
                      <p className="text-xs text-slate-400 mt-1">Data per: {lamp.tanggal}</p>
                    )}

                    {lamp.status === 'pending' && (
                      <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-3">
                        <p className="text-xs text-amber-800 font-medium flex items-start gap-1.5">
                          <AlertCircle size={14} className="mt-0.5 shrink-0" />
                          <span><strong>Kenapa belum siap?</strong> {lamp.pendingReason}</span>
                        </p>
                        <button
                          onClick={() => navigate(lamp.actionLink || '/')}
                          className="mt-2 text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
                        >
                          Lengkapi Data Sekarang <ChevronRight size={14}/>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0 self-start sm:self-center mt-2 sm:mt-0">
                    {lamp.status === 'ready' && (
                      <button
                        onClick={() => navigate(lamp.actionLink || '/')}
                        className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center gap-1.5 transition-all"
                      >
                        <ExternalLink size={13}/> Sumber Data
                      </button>
                    )}
                    <button
                      onClick={() => handleGenerate(lamp.kode, lamp.actionLink)}
                      disabled={lamp.status !== 'ready' || generating === lamp.kode}
                      className={`text-xs font-medium px-4 py-2 rounded-lg border transition-all flex items-center gap-1.5 ${
                        lamp.status === 'ready'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                          : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      {generating === lamp.kode
                        ? <><span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> Generating...</>
                        : <><Download size={14}/> Download PDF</>
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Kirim Semua */}
          <div className="card p-5 bg-slate-900 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold mb-1">Kirim Laporan Lengkap ke Sistem BGN</h3>
                <p className="text-sm text-slate-400">Mengirimkan semua Lampiran 30 (A, B, C, D, L) sekaligus ke server BGN secara digital.</p>
                {!allReady && (
                  <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                    <AlertTriangle size={12}/> Lengkapi {LAMPIRAN.length - readyCount} lampiran yang belum siap.
                  </p>
                )}
              </div>
              <button
                onClick={handleKirimSemua}
                disabled={!allReady || sending}
                className="btn-primary bg-blue-500 hover:bg-blue-400 border-blue-500 text-sm flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
              >
                {sending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                {sending ? 'Mengirim...' : 'Kirim ke BGN Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: RIWAYAT */}
      {activeTab === 'riwayat' && (
        <div className="card p-5 animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-widest font-black border-b border-slate-100">
                <tr>
                  <th className="p-3">Periode Laporan</th>
                  <th className="p-3">Tanggal Submit</th>
                  <th className="p-3">No. Referensi BGN</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {RIWAYAT_LAPORAN.map((lap, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-medium text-slate-800">{lap.periode}</td>
                    <td className="p-3 text-slate-500 text-xs font-mono">{lap.tanggal_submit}</td>
                    <td className="p-3 text-xs font-mono text-blue-600">{lap.no_referensi}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wide border ${
                        lap.status === 'diterima'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {lap.status === 'diterima'
                          ? <><CheckCircle2 size={9}/> Diterima</>
                          : <><RefreshCw size={9}/> Perlu Revisi</>
                        }
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1 ml-auto">
                        <Eye size={14}/> Lihat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
