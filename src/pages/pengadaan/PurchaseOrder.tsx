import { useState, useEffect } from 'react';
import { 
  ShoppingCart, Wallet, Plus, Clock, CheckCircle2, PackageCheck, 
  XCircle, ChevronRight, Search, Camera, Save, AlertTriangle, X,
  User, FileText, Calendar, ShieldAlert, BadgeCheck, TrendingDown,
  Package, Banknote, Activity, ArrowUpRight, Receipt
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useKeuanganStore } from '@/store/keuanganStore';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from '@/store/toastStore';
import { logAudit } from '@/lib/audit-logger';
import FotoStrukOCR from '@/components/pengadaan/FotoStrukOCR';
import type { ExtractedReceipt } from '@/lib/receipt-ocr';

// ─── INITIAL MOCK DATA ───
const INITIAL_PO = [
  { 
    id: 'PO/2026/05/MDK/001', 
    tanggal: '2026-05-10', 
    supplier: 'BUMDesa Maju Makmur', 
    total: 4500000, 
    status: 'Menunggu Approval', 
    createdBy: 'Budi (Admin Gudang)',
    keperluan: 'Bahan Baku Menu Utama Senin-Jumat (Minggu ke-3)',
    dimintaOleh: 'Jurutama Masak',
    items: [
      { nama: 'Beras Premium', qty: 200, satuan: 'kg', harga: 14000 },
      { nama: 'Daging Ayam', qty: 45, satuan: 'kg', harga: 38000 }
    ]
  },
  { 
    id: 'PO/2026/05/MDK/002', 
    tanggal: '2026-05-09', 
    supplier: 'Koperasi Peternak Mandiri', 
    total: 2800000, 
    status: 'Disetujui', 
    createdBy: 'Budi (Admin Gudang)',
    keperluan: 'Pasokan Telur & Daging Ayam Mingguan',
    dimintaOleh: 'Pengawas Gizi',
    items: [
      { nama: 'Telur Ayam', qty: 100, satuan: 'kg', harga: 28000 }
    ]
  },
  { 
    id: 'PO/2026/05/MDK/003', 
    tanggal: '2026-05-08', 
    supplier: 'Toko Sayur Segar', 
    total: 750000, 
    status: 'Diterima', 
    createdBy: 'Siti (Asisten)',
    keperluan: 'Sayur Mayur & Bumbu Dapur Darurat',
    dimintaOleh: 'Asisten Lapangan',
    items: [
      { nama: 'Sayur Campur', qty: 25, satuan: 'kg', harga: 30000 }
    ]
  },
];

const MOCK_BAHAN_TERSEDIA = [
  { id: 'b1', nama: 'Beras Premium', satuan: 'kg', harga: 14000 },
  { id: 'b2', nama: 'Daging Ayam', satuan: 'kg', harga: 37500 },
  { id: 'b3', nama: 'Telur Ayam', satuan: 'kg', harga: 27000 },
  { id: 'b4', nama: 'Minyak Goreng', satuan: 'liter', harga: 16000 },
  { id: 'b5', nama: 'Bumbu Dapur', satuan: 'set', harga: 25000 },
];

export default function PengadaanPage() {
  const [tab, setTab] = useState('po');

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display text-xl font-semibold text-slate-900">Pengadaan & Belanja</h1>
          <p className="text-sm text-slate-500 mt-1">Siklus PO dan Kas Kecil Dapur</p>
        </div>
      </div>

      <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 overflow-x-auto mb-6">
        {[
          { id: 'po', label: 'Purchase Order (PO)', icon: ShoppingCart },
          { id: 'petty', label: 'Petty Cash (Kas Kecil)', icon: Wallet },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button 
              key={t.id} 
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 px-4 text-xs sm:text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all whitespace-nowrap ${tab === t.id ? 'bg-white text-blue-700 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Icon size={16} className={tab === t.id ? 'text-blue-500' : 'opacity-50'} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'po' && <TabPurchaseOrder />}
      {tab === 'petty' && <TabPettyCash />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 1: PURCHASE ORDER
// ════════════════════════════════════════════════════════════════════════════
function TabPurchaseOrder() {
  const user = useAuthStore(s => s.user);
  const role = user?.role;
  const [poList, setPoList] = useState(INITIAL_PO);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'create'>('list');
  const [selectedPO, setSelectedPO] = useState<any>(null);

  const canCreatePO = ['owner', 'kasppg', 'pengawas_keuangan', 'superadmin'].includes(role || '');
  const keuangan = useKeuanganStore();

  const handleAddPO = (newPO: any) => {
    setPoList([newPO, ...poList]);
    keuangan.addPendingPo();   // track di store
    setViewMode('list');
    toast.sukses('Purchase Order berhasil diajukan!', 'Menunggu persetujuan Ka.SPPG / Owner.');
  };

  const addStock = useInventoryStore(s => s.addStock);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const currentUser = useAuthStore.getState().user;
    const sppg = useAuthStore.getState().sppg;
    const po = poList.find(p => p.id === id);
    const prevStatus = po?.status;

    setPoList(poList.map(p => p.id === id ? { ...p, status: newStatus } : p));
    if (selectedPO?.id === id) setSelectedPO({ ...selectedPO, status: newStatus });
    
    // ── Decrement pending PO saat di-approve atau ditolak ──
    if (prevStatus === 'Menunggu Approval' && (newStatus === 'Disetujui' || newStatus === 'Dibatalkan')) {
      keuangan.decrementPendingPo();
    }

    // ── Update keuangan saat barang diterima ──
    if (newStatus === 'Diterima' && po && po.items) {
      addStock(po.items);
      keuangan.catatPengeluaran('bahan', po.total); // catat ke pengeluaran bahan baku
      toast.sukses(
        `PO Diterima & Stok Diperbarui`,
        `${po.items.length} jenis bahan masuk gudang. Pengeluaran Rp ${po.total.toLocaleString('id-ID')} tercatat.`
      );
    } else {
      toast.sukses(`Status PO → ${newStatus}`);
    }

    // ── Audit log ──
    if (newStatus === 'Disetujui' || newStatus === 'Dibatalkan') {
      await logAudit({
        sppgId:    sppg?.id ?? 'unknown',
        userId:    currentUser?.id ?? 'unknown',
        action:    newStatus === 'Disetujui' ? 'po_disetujui' : 'po_ditolak',
        tableName: 'purchase_order',
        recordId:  id,
        beforeData: { status: po?.status, total: po?.total },
        afterData:  { status: newStatus },
        keterangan: `PO ${newStatus === 'Disetujui' ? 'disetujui' : 'ditolak'} oleh ${currentUser?.nama}`,
      });
    }
  };

  // ── SAP-grade KPI summary ──
  const totalNilaiPO = poList.reduce((a, p) => a + p.total, 0);
  const countMenunggu = poList.filter(p => p.status === 'Menunggu Approval').length;
  const countDisetujui = poList.filter(p => p.status === 'Disetujui').length;
  const countDiterima  = poList.filter(p => p.status === 'Diterima').length;

  if (viewMode === 'create') return <FormCreatePO onCancel={() => setViewMode('list')} onSubmit={handleAddPO} poCount={poList.length} />;

  if (viewMode === 'detail' && selectedPO) {
    return <DetailPO po={selectedPO} onBack={() => setViewMode('list')} role={role || ''} onUpdateStatus={handleUpdateStatus} />;
  }

  return (
    <div className="space-y-5 animate-slide-up">
      {/* SAP KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-l-slate-400 flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-slate-100"><Receipt size={18} className="text-slate-600" /></div>
          <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total PO</p><p className="text-xl font-black text-slate-900">{poList.length}</p></div>
        </div>
        <div className={`card p-4 border-l-4 ${countMenunggu > 0 ? 'border-l-amber-500 animate-pulse' : 'border-l-slate-300'} flex items-center gap-4`}>
          <div className={`p-2.5 rounded-xl ${countMenunggu > 0 ? 'bg-amber-100' : 'bg-slate-100'}`}><Clock size={18} className={countMenunggu > 0 ? 'text-amber-600' : 'text-slate-400'} /></div>
          <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Menunggu</p><p className={`text-xl font-black ${countMenunggu > 0 ? 'text-amber-700' : 'text-slate-900'}`}>{countMenunggu}</p></div>
        </div>
        <div className="card p-4 border-l-4 border-l-blue-500 flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-blue-100"><BadgeCheck size={18} className="text-blue-600" /></div>
          <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Disetujui</p><p className="text-xl font-black text-blue-700">{countDisetujui}</p></div>
        </div>
        <div className="card p-4 border-l-4 border-l-emerald-500 flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-emerald-100"><PackageCheck size={18} className="text-emerald-600" /></div>
          <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Diterima</p><p className="text-xl font-black text-emerald-700">{countDiterima}</p></div>
        </div>
      </div>

      {/* PO Table Card */}
      <div className="card p-5">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="font-semibold text-slate-800">Daftar Purchase Order</h2>
            <p className="text-xs text-slate-400 mt-0.5">Total nilai: <span className="font-semibold text-slate-600">Rp {totalNilaiPO.toLocaleString('id-ID')}</span></p>
          </div>
          {canCreatePO && (
            <button onClick={() => setViewMode('create')} className="btn-primary text-xs py-1.5 flex items-center gap-1.5"><Plus size={14} /> Buat PO Baru</button>
          )}
        </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-widest font-black border-b border-slate-100">
            <tr>
              <th className="p-3">No PO</th>
              <th className="p-3">Keperluan / Pemohon</th>
              <th className="p-3 text-center">Tanggal</th>
              <th className="p-3">Supplier</th>
              <th className="p-3 text-right">Total (Rp)</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {poList.map(po => (
              <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-semibold text-blue-700 whitespace-nowrap">{po.id}</td>
                <td className="p-3">
                  <p className="font-medium text-slate-800 line-clamp-1">{po.keperluan}</p>
                  <p className="text-[10px] text-slate-400">Pemohon: {po.dimintaOleh}</p>
                </td>
                <td className="p-3 text-slate-600 text-center font-mono">{po.tanggal}</td>
                <td className="p-3 text-slate-800 whitespace-nowrap text-sm">{po.supplier}</td>
                <td className="p-3 font-mono font-semibold text-slate-800 text-right whitespace-nowrap">Rp {po.total.toLocaleString('id-ID')}</td>
                <td className="p-3 text-center">
                  <BadgeStatus status={po.status} />
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => { setSelectedPO(po); setViewMode('detail'); }} className="btn-ghost text-xs text-blue-600 py-1 px-2 flex items-center gap-1 ml-auto">Detail <ChevronRight size={14}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}



function BadgeStatus({ status }: { status: string }) {
  switch (status) {
    case 'Draft': return <span className="badge-neutral text-[10px]">Draft</span>;
    case 'Menunggu Approval': return <span className="badge-warning text-[10px] flex items-center w-max gap-1"><Clock size={10}/> Menunggu Approval</span>;
    case 'Disetujui': return <span className="badge-info text-[10px] flex items-center w-max gap-1"><BadgeCheck size={10}/> Disetujui</span>;
    case 'Diterima': return <span className="badge-success text-[10px] flex items-center w-max gap-1"><PackageCheck size={10}/> Diterima</span>;
    case 'Dibatalkan': return <span className="badge-danger text-[10px]">Dibatalkan</span>;
    default: return <span className="badge-neutral text-[10px]">{status}</span>;
  }
}

function DetailPO({ po, onBack, role, onUpdateStatus }: { po: any, onBack: () => void, role: string, onUpdateStatus: (id: string, s: string) => void }) {
  const isApprover = ['owner', 'kasppg', 'superadmin'].includes(role);
  const docSettings = useSettingsStore(s => s.docSettings);
  const [alasanTolak, setAlasanTolak] = useState('');
  const [showTolak, setShowTolak] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="space-y-4 animate-slide-left">
      <button onClick={onBack} className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1">
        <ChevronRight size={14} className="rotate-180" /> Kembali ke List PO
      </button>

      <div className="card p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-800">{po.id}</h2>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Dokumen Resmi</span>
            </div>
            <p className="text-sm text-slate-500">Input: {po.createdBy} | <span className="text-blue-600 font-bold">Pemohon: {po.dimintaOleh}</span></p>
          </div>
          <div className="text-right flex flex-col items-end gap-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Status saat ini</p>
              <BadgeStatus status={po.status} />
            </div>
            
            {(po.status === 'Disetujui' || po.status === 'Diterima') && (
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowPreview(true)}
                  className="btn-ghost text-xs px-3 py-1.5 border border-slate-200 shadow-sm flex items-center gap-1.5"
                >
                  <FileText size={14} className="text-blue-600" /> Preview PDF PO
                </button>
                <button 
                  onClick={() => {
                    const text = encodeURIComponent(`Halo ${po.supplier}, ini adalah lampiran Purchase Order resmi dari SPPG (No. ${po.id}). Total pesanan Rp ${po.total.toLocaleString('id-ID')}. Mohon diproses.`);
                    window.open(`https://wa.me/?text=${text}`, '_blank');
                  }}
                  className="btn-ghost text-xs px-3 py-1.5 border border-slate-200 shadow-sm flex items-center gap-1.5"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  Kirim WA
                </button>
              </div>
            )}
          </div>

        {/* ─── MODAL PDF PREVIEW ─── */}
        {showPreview && (
          <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm animate-fade-in flex flex-col print:bg-white print:block">
            
            {/* Action Bar (Fixed at top) */}
            <div className="bg-white p-4 shadow-md flex justify-between items-center print:hidden z-[110]">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                  <X size={24} />
                </button>
                <h3 className="font-bold text-slate-800">Preview Dokumen: {po.id}</h3>
              </div>
              <button onClick={() => window.print()} className="btn-primary flex gap-2">
                <FileText size={18} /> Cetak / Simpan PDF
              </button>
            </div>

            {/* Scrollable Document Container */}
            <div className="flex-1 overflow-y-auto p-4 md:p-12 flex justify-center print:p-0 print:overflow-visible">
              
              {/* Kertas A4 Area */}
              <div className="bg-white w-full max-w-4xl min-h-[1056px] shadow-2xl relative" id="print-area" style={{ borderTop: '8px solid #1e6fbf' }}>
                <div className="p-12 relative h-full">
                  
                  {/* Watermark BGN (Inline SVG) */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[600px] h-[600px]">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>

                  {/* Kop Surat Resmi */}
                  <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-8 relative z-10">
                    <div className="flex gap-5 items-center">
                      <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 shrink-0">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                      </div>
                      <div>
                        <h1 className="text-2xl font-black uppercase tracking-widest text-slate-900">{docSettings.namaSppg}</h1>
                        <p className="text-sm font-bold text-slate-600 tracking-wider">PROGRAM MAKAN BERGIZI GRATIS (MBG) NASIONAL</p>
                        <p className="text-[10px] text-slate-500 mt-1">{docSettings.alamat}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <h2 className="text-3xl font-black text-blue-900 uppercase tracking-widest">PURCHASE ORDER</h2>
                      <p className="font-mono text-slate-500 mt-1 font-bold">{po.id}</p>
                    </div>
                  </div>

                  {/* Info PO & Supplier */}
                  <div className="grid grid-cols-2 gap-12 mb-8 relative z-10 text-sm">
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2 border-b-2 border-slate-200 pb-1 uppercase tracking-wider text-xs">Informasi Pemesanan</h3>
                      <table className="w-full">
                        <tbody>
                          <tr><td className="py-1 text-slate-500 w-32">Tanggal</td><td className="py-1 font-bold text-slate-800">{po.tanggal}</td></tr>
                          <tr><td className="py-1 text-slate-500">Pemohon</td><td className="py-1 font-bold text-slate-800">{po.dimintaOleh}</td></tr>
                          <tr><td className="py-1 text-slate-500">Keterangan</td><td className="py-1 font-bold text-slate-800">{po.keperluan}</td></tr>
                          <tr><td className="py-1 text-slate-500">Pembayaran</td><td className="py-1 font-bold text-slate-800">{po.metodeBayar === 'petty' ? 'Tunai (Kas Kecil)' : 'Transfer (Virtual Account)'}</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2 border-b-2 border-slate-200 pb-1 uppercase tracking-wider text-xs">Kepada Yth. Supplier:</h3>
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="font-black text-lg text-slate-900">{po.supplier}</p>
                        <p className="text-slate-500 mt-1 text-xs">Mohon segera diproses pesanan di bawah ini sesuai spesifikasi dan harga yang telah disepakati.</p>
                      </div>
                    </div>
                  </div>

                  {/* Tabel Barang */}
                  <table className="w-full text-left text-sm mb-8 relative z-10">
                    <thead className="border-y-2 border-slate-900 bg-slate-50">
                      <tr>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs text-slate-700">No</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs text-slate-700">Deskripsi Barang</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs text-slate-700 text-center">Qty</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs text-slate-700 text-right">Harga Satuan</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs text-slate-700 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {po.items?.map((it: any, i: number) => (
                        <tr key={i}>
                          <td className="py-3 px-4 text-slate-500">{i + 1}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{it.nama}</td>
                          <td className="py-3 px-4 text-center">{it.qty} <span className="text-slate-500 text-xs">{it.satuan}</span></td>
                          <td className="py-3 px-4 text-right">Rp {it.harga.toLocaleString('id-ID')}</td>
                          <td className="py-3 px-4 text-right font-black text-slate-900">Rp {(it.qty * it.harga).toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-slate-900">
                      <tr>
                        <td colSpan={4} className="py-4 px-4 text-right font-black uppercase tracking-wider text-slate-500">Total Purchase Order</td>
                        <td className="py-4 px-4 text-right font-black text-xl text-slate-900">Rp {po.total.toLocaleString('id-ID')}</td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Tanda Tangan & Cap Digital */}
                  <div className="flex justify-between items-end pt-8 relative z-10">
                    <div className="w-64">
                      <p className="text-xs text-slate-500 mb-1">Dibuat oleh:</p>
                      <p className="text-sm font-bold text-slate-800 mb-3">{po.createdBy}</p>
                      
                      <p className="text-xs text-slate-500 mb-1">Catatan Tambahan:</p>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-500 italic">
                        Dokumen ini sah dan diterbitkan secara elektronik oleh Sistem SPPG Manager. Barcode tersertifikasi BGN.
                      </div>
                    </div>
                    
                    <div className="text-center relative">
                      <p className="text-sm mb-2 text-slate-600 font-medium">Disetujui dan Diotorisasi oleh,</p>
                      <div className="relative inline-block my-4">
                        {/* Simulasi Cap Digital SPPG & TTD */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-30 rotate-[-15deg] scale-125 z-0">
                          <div className="w-32 h-32 rounded-full border-4 border-blue-600 flex items-center justify-center">
                            <div className="text-center text-blue-600 uppercase font-black leading-none">
                              <span className="text-[10px] block border-b-2 border-blue-600 pb-1 mb-1">APPROVED</span>
                              <span className="text-xl tracking-widest block">SPPG</span>
                            </div>
                          </div>
                        </div>
                        {/* TTD Stylized */}
                        <p className="text-5xl relative z-10" style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive", color: '#1e3a8a', transform: 'rotate(-5deg)' }}>{docSettings.namaPimpinan.split(',')[0]}</p>
                      </div>
                      <p className="font-black text-slate-900 uppercase underline mt-2 text-lg relative z-10">{docSettings.namaPimpinan}</p>
                      <p className="text-xs text-slate-600 font-bold relative z-10">{docSettings.jabatanPimpinan}</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* CSS Print Stylesheet Khusus untuk Mode Ini */}
            <style>{`
              @media print {
                body * { visibility: hidden !important; }
                .fixed.inset-0, .fixed.inset-0 * { visibility: visible !important; }
                .fixed.inset-0 { position: absolute; left: 0; top: 0; margin: 0; padding: 0; background: white !important; }
                #print-area { box-shadow: none !important; border-top: none !important; margin: 0 !important; width: 100% !important; max-width: none !important; }
                .print\\:hidden { display: none !important; }
                @page { size: A4 portrait; margin: 1cm; }
              }
            `}</style>
          </div>
        )}

        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FileText size={12}/> Tujuan & Keperluan</p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-slate-800 font-bold leading-relaxed">{po.keperluan}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <Calendar size={12} /> Tanggal: {po.tanggal}
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><ShoppingCart size={12}/> Informasi Supplier</p>
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
              <p className="font-bold text-slate-800">{po.supplier}</p>
              <p className="text-xs text-slate-500 mt-1">Metode: {po.metodeBayar === 'petty' ? 'Kas Kecil (Tunai)' : 'Virtual Account'}</p>
              <p className="text-[10px] text-blue-600 font-bold mt-2 tracking-widest uppercase">TERVALIDASI SIPGN</p>
            </div>
          </div>
        </div>

        <table className="w-full text-left text-sm mb-6 border border-slate-200 rounded-2xl overflow-hidden">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-4 border-b border-slate-200">Nama Bahan</th>
              <th className="p-4 border-b border-slate-200 text-center">Qty</th>
              <th className="p-4 border-b border-slate-200 text-right">Harga Satuan</th>
              <th className="p-4 border-b border-slate-200 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {po.items?.map((it: any, i: number) => (
              <tr key={i}>
                <td className="p-4 text-slate-800 font-medium">{it.nama}</td>
                <td className="p-4 text-center font-bold">{it.qty} {it.satuan}</td>
                <td className="p-4 text-right text-slate-600">Rp {it.harga.toLocaleString('id-ID')}</td>
                <td className="p-4 text-right font-bold text-slate-800">Rp {(it.qty * it.harga).toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50">
            <tr>
              <td colSpan={3} className="p-4 text-right font-bold text-slate-700">TOTAL PEMBELIAN</td>
              <td className="p-4 text-right font-black text-blue-700 text-xl">Rp {po.total.toLocaleString('id-ID')}</td>
            </tr>
          </tfoot>
        </table>

        {/* ─── ACTION BUTTONS ─── */}
        {po.status === 'Menunggu Approval' && isApprover && (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-8">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert size={18} className="text-amber-500" />
              <p className="text-sm font-bold text-slate-700">Otorisasi Pembelian (Ka.SPPG / Owner)</p>
            </div>
            {!showTolak ? (
              <div className="flex gap-4">
                <button onClick={() => onUpdateStatus(po.id, 'Disetujui')} className="btn-primary bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-sm flex-1 py-3 font-bold"><CheckCircle2 size={18} className="mr-2"/> Setujui & Kirim ke Supplier</button>
                <button onClick={() => setShowTolak(true)} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 text-sm px-8 py-3 font-bold"><XCircle size={18} className="mr-2"/> Tolak</button>
              </div>
            ) : (
              <div className="animate-fade-in space-y-3">
                <textarea value={alasanTolak} onChange={e=>setAlasanTolak(e.target.value)} className="input text-sm w-full py-3" rows={2} placeholder="Sebutkan alasan penolakan untuk perbaikan pemohon..." />
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowTolak(false)} className="btn-ghost text-xs font-bold text-slate-500 uppercase tracking-widest">Batal</button>
                  <button onClick={() => { onUpdateStatus(po.id, 'Dibatalkan'); }} className="btn-primary bg-red-600 hover:bg-red-700 text-xs px-6 py-2">Kirim Penolakan</button>
                </div>
              </div>
            )}
          </div>
        )}

        {po.status === 'Disetujui' && (
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mt-8 space-y-5">
            <div className="flex flex-col items-center text-center">
              <PackageCheck size={48} className="text-blue-500 mb-4" />
              <h3 className="font-bold text-slate-800">Konfirmasi Penerimaan Barang</h3>
              <p className="text-sm text-slate-500 mb-4 max-w-md">Foto struk supplier untuk dicocokkan dengan PO, atau langsung klik "Terima Barang".</p>
            </div>

            {/* OCR Scan Struk Supplier */}
            <FotoStrukOCR
              title="Scan Struk Supplier (Opsional)"
              onDataExtracted={(data) => {
                // Bandingkan total struk vs total PO
                const selisih = Math.abs(data.total - po.total);
                const pctDiff = po.total > 0 ? (selisih / po.total) * 100 : 0;

                if (pctDiff > 5) {
                  toast.error(
                    `Total struk berbeda ${pctDiff.toFixed(1)}% dari PO!`,
                    `Struk: Rp ${data.total.toLocaleString('id-ID')} vs PO: Rp ${po.total.toLocaleString('id-ID')}. Periksa kembali.`
                  );
                } else {
                  toast.sukses(
                    'Struk cocok dengan PO ✓',
                    `Selisih hanya ${pctDiff.toFixed(1)}% — dalam batas wajar.`
                  );
                }
              }}
            />

            <button onClick={() => onUpdateStatus(po.id, 'Diterima')} className="btn-primary px-12 py-3 w-full">Terima Barang & Masukkan ke Stok</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FORM WIZARD BUAT PO ───
function FormCreatePO({ onCancel, onSubmit, poCount }: { onCancel: () => void, onSubmit: (po: any) => void, poCount: number }) {
  const { sppg, user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    supplier: '',
    keperluan: '',
    dimintaOleh: '',
    tanggal: new Date().toISOString().split('T')[0],
    metodeBayar: 'va',
    noPo: ''
  });
  
  // Auto-generate PO Number
  useEffect(() => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const code = sppg?.nama?.substring(0, 3).toUpperCase() || 'SPPG';
    const nextNum = String(poCount + 1).padStart(3, '0');
    setFormData(prev => ({ ...prev, noPo: `PO/${year}/${month}/${code}/${nextNum}` }));
  }, [sppg, poCount]);

  // Cart items
  const [cart, setCart] = useState<Array<{bahan_id: string, nama: string, qty: number, satuan: string, harga: number}>>([]);

  const subtotal = cart.reduce((acc, curr) => acc + (curr.qty * curr.harga), 0);
  const isPettyCashOverlimit = formData.metodeBayar === 'petty' && subtotal > 500000;

  const handleAddItem = (bahanId: string) => {
    const b = MOCK_BAHAN_TERSEDIA.find(x => x.id === bahanId);
    if (!b) return;
    if (cart.find(c => c.bahan_id === bahanId)) return toast.error('Bahan sudah ada di keranjang');
    setCart([...cart, { bahan_id: b.id, nama: b.nama, qty: 1, satuan: b.satuan, harga: b.harga }]);
  };

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) return;
    setCart(cart.map(c => c.bahan_id === id ? { ...c, qty } : c));
  };

  const removeItem = (id: string) => {
    setCart(cart.filter(c => c.bahan_id !== id));
  };

  const handleAjukan = () => {
    if (!formData.keperluan) return toast.error('Isi keperluan pengadaan');
    if (!formData.dimintaOleh) return toast.error('Isi nama pemohon');
    if (cart.length === 0) return toast.error('Pilih minimal 1 bahan');
    if (isPettyCashOverlimit) return;

    const finalPO = {
      id: formData.noPo,
      tanggal: formData.tanggal,
      supplier: formData.supplier === 's1' ? 'BUMDesa Maju Makmur' : formData.supplier === 's2' ? 'Koperasi Peternak Mandiri' : 'Toko Sayur Segar Jaya',
      total: subtotal,
      status: 'Menunggu Approval',
      createdBy: user?.nama || 'Unknown',
      keperluan: formData.keperluan,
      dimintaOleh: formData.dimintaOleh,
      metodeBayar: formData.metodeBayar,
      items: cart
    };

    onSubmit(finalPO);
  };

  return (
    <div className="card max-w-3xl mx-auto animate-slide-up shadow-2xl border-blue-100">
      <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
        <div>
          <h2 className="font-bold text-xl text-slate-800">Form Purchase Order</h2>
          <p className="text-xs text-slate-400 font-bold mt-1 tracking-widest">{formData.noPo}</p>
        </div>
        <button onClick={onCancel} className="p-2 bg-white rounded-lg text-slate-400 hover:text-slate-600 shadow-sm border border-slate-200"><X size={20}/></button>
      </div>

      <div className="p-8">
        {/* WIZARD PROGRESS */}
        <div className="flex gap-4 mb-10">
          {[1,2,3].map(s => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full ${step >= s ? 'bg-blue-600' : 'bg-slate-100'} transition-all duration-500`}></div>
              <p className={`text-[10px] mt-3 font-black uppercase tracking-[0.1em] ${step >= s ? 'text-blue-700' : 'text-slate-300'}`}>
                {s === 1 ? 'Data Umum' : s === 2 ? 'Detail Barang' : 'Pembayaran'}
              </p>
            </div>
          ))}
        </div>

        {/* STEP 1: DATA UMUM */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in min-h-[300px]">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Pemohon (Diminta Oleh) *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    value={formData.dimintaOleh}
                    onChange={e=>setFormData({...formData, dimintaOleh: e.target.value})}
                    className="input w-full pl-11 py-2.5 text-sm font-bold bg-slate-50 border-slate-200 focus:bg-white" 
                    placeholder="Mis: Jurutama Masak"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pilih Supplier *</label>
                <div className="relative">
                  <ShoppingCart className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select 
                    value={formData.supplier} 
                    onChange={e=>setFormData({...formData, supplier: e.target.value})}
                    className="select w-full pl-11 py-2.5 text-sm font-bold bg-slate-50 border-slate-200 focus:bg-white"
                  >
                    <option value="">-- Pilih Supplier --</option>
                    <option value="s1">BUMDesa Maju Makmur (Pangan Lokal)</option>
                    <option value="s2">Koperasi Peternak Mandiri</option>
                    <option value="s3">Toko Sayur Segar Jaya</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tujuan / Keperluan Pengadaan *</label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-4 text-slate-400" size={16} />
                <textarea 
                  value={formData.keperluan}
                  onChange={e=>setFormData({...formData, keperluan: e.target.value})}
                  className="input w-full pl-11 py-3 text-sm leading-relaxed bg-slate-50 border-slate-200 focus:bg-white" 
                  rows={3}
                  placeholder="Mis: Untuk kebutuhan bahan baku menu utama minggu ke-3 (21-25 Juli 2026)..."
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DETAIL BARANG */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in min-h-[300px]">
            <div className="flex gap-3">
              <select onChange={(e) => handleAddItem(e.target.value)} value="" className="select text-sm flex-1 bg-blue-50 border-blue-200 py-3 font-bold text-blue-700 shadow-sm">
                <option value="">+ Cari & Tambah Bahan dari Survei Harga BGN...</option>
                {MOCK_BAHAN_TERSEDIA.map(b => (
                  <option key={b.id} value={b.id}>{b.nama} - Rp {b.harga.toLocaleString('id-ID')}/{b.satuan}</option>
                ))}
              </select>
            </div>

            {cart.length > 0 ? (
              <div className="space-y-3">
                {cart.map(c => (
                  <div key={c.bahan_id} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{c.nama}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Harga: Rp {c.harga.toLocaleString('id-ID')} / {c.satuan}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1.5 border border-slate-100">
                      <button onClick={()=>updateQty(c.bahan_id, c.qty - 1)} className="w-8 h-8 flex items-center justify-center font-bold text-slate-400 hover:text-slate-900 transition-colors">-</button>
                      <input type="number" value={c.qty} readOnly className="w-12 text-center text-sm font-black bg-transparent outline-none text-blue-600" />
                      <button onClick={()=>updateQty(c.bahan_id, c.qty + 1)} className="w-8 h-8 flex items-center justify-center font-bold text-slate-400 hover:text-slate-900 transition-colors">+</button>
                    </div>
                    <div className="w-32 text-right">
                      <p className="text-sm font-black text-slate-900">Rp {(c.qty * c.harga).toLocaleString('id-ID')}</p>
                    </div>
                    <button onClick={()=>removeItem(c.bahan_id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><X size={18}/></button>
                  </div>
                ))}
                
                <div className="flex justify-between items-center pt-6 px-4 border-t border-slate-100">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Total Estimasi</span>
                  <span className="text-2xl font-black text-blue-700">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <ShoppingCart size={24} className="text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-500">Keranjang masih kosong</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Pilih bahan di atas untuk memulai</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: PEMBAYARAN */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in min-h-[300px]">
            <div className="p-6 bg-blue-600 rounded-[2rem] text-white flex justify-between items-center shadow-xl shadow-blue-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><ShoppingCart size={80}/></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Nilai Purchase Order</p>
                <p className="text-3xl font-black">Rp {subtotal.toLocaleString('id-ID')}</p>
              </div>
              <div className="text-right relative z-10">
                <p className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">{formData.noPo}</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pilih Mekanisme Pembayaran</label>
              <div className="grid gap-3">
                <label className={`flex items-start gap-4 p-5 rounded-[2rem] border-2 cursor-pointer transition-all ${formData.metodeBayar === 'va' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                  <input type="radio" name="bayar" value="va" checked={formData.metodeBayar==='va'} onChange={(e)=>setFormData({...formData, metodeBayar: e.target.value})} className="mt-1.5 w-4 h-4 text-blue-600 focus:ring-blue-500" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Virtual Account (Transfer Kas Besar)</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium leading-relaxed">Metode standar BGN untuk akuntabilitas tinggi. Dana dipotong dari Kas Besar SPPG.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-4 p-5 rounded-[2rem] border-2 cursor-pointer transition-all ${formData.metodeBayar === 'petty' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                  <input type="radio" name="bayar" value="petty" checked={formData.metodeBayar==='petty'} onChange={(e)=>setFormData({...formData, metodeBayar: e.target.value})} className="mt-1.5 w-4 h-4 text-blue-600 focus:ring-blue-500" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Tunai (Petty Cash / Kas Kecil)</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium leading-relaxed">Hanya untuk pengadaan darurat skala kecil. Limit maks: <span className="font-black text-red-600">Rp 500.000</span>.</p>
                  </div>
                </label>
              </div>
            </div>

            {isPettyCashOverlimit && (
              <div className="p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4 animate-slide-up">
                <AlertTriangle className="text-red-600 shrink-0" size={20} />
                <div>
                  <p className="text-sm font-black text-red-900">Melewati Limit Kas Kecil</p>
                  <p className="text-xs text-red-700 mt-1 font-medium">Nilai belanja Rp {subtotal.toLocaleString('id-ID')} melebihi batas maksimal Petty Cash. Silakan gunakan Virtual Account.</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-100">
          <button onClick={() => step > 1 ? setStep(step - 1) : onCancel()} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
            {step === 1 ? 'Batal' : '← Kembali'}
          </button>
          
          <div className="flex gap-3">
            {step < 3 ? (
              <button 
                onClick={() => setStep(step + 1)} 
                disabled={step === 1 && (!formData.supplier || !formData.keperluan || !formData.dimintaOleh)} 
                className="btn-primary px-10 py-3 text-sm font-bold shadow-lg shadow-blue-100 disabled:opacity-50"
              >
                Lanjutkan
              </button>
            ) : (
              <button onClick={handleAjukan} disabled={isPettyCashOverlimit} className="btn-primary bg-emerald-600 hover:bg-emerald-700 border-emerald-600 px-12 py-3 text-sm font-bold shadow-lg shadow-emerald-100">
                <CheckCircle2 size={18} className="mr-2" /> Ajukan PO Sekarang
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 2: PETTY CASH
// ════════════════════════════════════════════════════════════════════════════
function TabPettyCash() {
  const [jumlah, setJumlah] = useState('');
  const [uraian, setUraian] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [kategori, setKategori] = useState('');
  const [buktiStruk, setBuktiStruk] = useState<string | null>(null);
  const overlimit = Number(jumlah) > 500000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (overlimit) return;
    if (!jumlah || Number(jumlah) <= 0) return toast.error('Jumlah tidak valid');
    
    toast.sukses('Pengeluaran Petty Cash berhasil dicatat!');
    setJumlah('');
    setUraian('');
    setKategori('');
    setBuktiStruk(null);
  };

  // Handler OCR data
  const handleOCRData = (data: ExtractedReceipt) => {
    // Isi otomatis uraian dari item terbesar
    if (data.items.length > 0) {
      const sorted = [...data.items].sort((a, b) => b.subtotal - a.subtotal);
      const topItem = sorted[0];
      const uraianText = data.items.length === 1
        ? topItem.nama
        : `${topItem.nama} + ${data.items.length - 1} item lainnya`;
      setUraian(uraianText);
    }

    // Isi jumlah
    setJumlah(String(data.total));

    // Isi tanggal jika ada
    if (data.tanggal) setTanggal(data.tanggal);

    // Simpan bukti foto
    if (data.imageBase64) setBuktiStruk(data.imageBase64);

    // Otomatis set kategori
    setKategori('Bahan Baku Darurat');

    toast.sukses('✓ Data dari struk berhasil diisi otomatis', `Supplier: ${data.supplier ?? '—'} | Total: Rp ${data.total.toLocaleString('id-ID')}`);
  };

  const limitBulanan = 5000000;
  const terpakai = 4250000;
  const persentase = (terpakai / limitBulanan) * 100;
  const isKritis = persentase > 80;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      
      {/* KIRI: FORM & PROGRESS */}
      <div className="space-y-6">
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Petty Cash Bulan Ini</h2>
          
          <div className="flex justify-between text-xs font-semibold mb-2">
            <span className="text-slate-600">Terpakai: Rp {terpakai.toLocaleString('id-ID')}</span>
            <span className="text-slate-400">Limit: Rp {limitBulanan.toLocaleString('id-ID')}</span>
          </div>
          
          <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
            <div className={`h-3 rounded-full ${isKritis ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${persentase}%` }}></div>
          </div>
          
          {isKritis ? (
            <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1"><AlertTriangle size={12}/> ⚠️ Hampir habis! Sisa limit Rp {(limitBulanan - terpakai).toLocaleString('id-ID')}</p>
          ) : (
            <p className="text-[10px] text-slate-500">Sisa limit: Rp {(limitBulanan - terpakai).toLocaleString('id-ID')}</p>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-5 border-b border-slate-100 pb-3">Catat Pengeluaran Kecil</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ── OCR Scan Struk ── */}
            <FotoStrukOCR
              title="Scan Struk Belanja"
              onDataExtracted={handleOCRData}
            />

            <div>
              <label className="text-[10px] font-medium text-slate-500 block mb-1">Tanggal</label>
              <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} className="input text-sm w-full" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-slate-500 block mb-1">Uraian / Keterangan *</label>
              <input type="text" value={uraian} onChange={e => setUraian(e.target.value)} className="input text-sm w-full" placeholder="Mis: Beli sapu & pel" required />
            </div>
            <div>
              <label className="text-[10px] font-medium text-slate-500 block mb-1">Kategori *</label>
              <select value={kategori} onChange={e => setKategori(e.target.value)} className="select text-sm w-full" required>
                <option value="">-- Pilih --</option>
                <option>Bahan Baku Darurat</option>
                <option>BBM Operasional</option>
                <option>ATK & Cetak</option>
                <option>Alat Kebersihan</option>
                <option>Perlengkapan Dapur</option>
                <option>Lainnya</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium text-slate-500 block mb-1">Jumlah Rp *</label>
              <input 
                type="number" 
                value={jumlah}
                onChange={e=>setJumlah(e.target.value)}
                className={`input text-sm w-full font-bold ${overlimit ? 'border-rose-500 ring-1 ring-rose-500 text-rose-700 bg-rose-50' : ''}`} 
                placeholder="0" 
                required 
              />
              {overlimit && <p className="text-[10px] text-rose-600 font-semibold mt-1">Melewati batas Rp 500.000/transaksi. Gunakan PO!</p>}
            </div>
            <div>
              <label className="text-[10px] font-medium text-slate-500 block mb-1">Struk / Nota</label>
              {buktiStruk ? (
                <div className="flex items-center gap-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <p className="text-xs font-medium text-emerald-700 flex-1">Bukti foto dari OCR tersimpan</p>
                  <button type="button" onClick={() => setBuktiStruk(null)} className="text-xs text-slate-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => {}} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-xs font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                  <Camera size={16} /> Upload Foto Nota Manual
                </button>
              )}
            </div>
            <button type="submit" disabled={overlimit || !jumlah} className="btn-primary w-full text-sm py-2.5 mt-2">
              <Save size={16} className="mr-1.5" /> Catat Pengeluaran
            </button>
          </form>
        </div>
      </div>

      {/* KANAN: RIWAYAT */}
      <div className="lg:col-span-2 card p-5">
        <h2 className="font-semibold text-slate-800 mb-5">Riwayat Petty Cash (Bulan Ini)</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="p-3 font-medium rounded-tl-lg">Tanggal</th>
                <th className="p-3 font-medium">Uraian</th>
                <th className="p-3 font-medium">Kategori</th>
                <th className="p-3 font-medium text-right">Jumlah</th>
                <th className="p-3 font-medium rounded-tr-lg text-center">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { id: '1', tanggal: '2025-07-10', uraian: 'Beli Gas Elpiji 3kg (3 tabung) darurat', kategori: 'Bahan Baku Darurat', jumlah: 60000, user: 'Siti' },
                { id: '2', tanggal: '2025-07-09', uraian: 'Bensin Operasional Kurir', kategori: 'BBM', jumlah: 50000, user: 'Agus' },
              ].map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-xs text-slate-500">{p.tanggal}</td>
                  <td className="p-3">
                    <p className="font-medium text-slate-800 leading-tight">{p.uraian}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Oleh: {p.user}</p>
                  </td>
                  <td className="p-3 text-xs text-slate-600">{p.kategori}</td>
                  <td className="p-3 text-right font-bold text-slate-700">Rp {p.jumlah.toLocaleString('id-ID')}</td>
                  <td className="p-3 text-center">
                    <button className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded-lg"><Camera size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
