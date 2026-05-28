import { useState } from 'react';
import { PackageOpen, CheckCircle2, QrCode, AlertTriangle, Printer, Save, MapPin, CalendarDays, AlertCircle, XCircle, CheckCircle, EyeIcon } from 'lucide-react';
import { toast } from '@/store/toastStore';
import { usePermission, ReadOnlyBanner } from '@/hooks/PermGuard';

const PENDING_PO = [
  { id: 'PO-202605-001', supplier: 'PT IndoBeras Mandiri', tanggal: '16 Mei 2026', totalItem: 2, status: 'Menunggu Kiriman' },
  { id: 'PO-202605-002', supplier: 'CV Ayam Segar Sejahtera', tanggal: '16 Mei 2026', totalItem: 1, status: 'Menunggu Kiriman' },
];

const PO_ITEMS: Record<string, any[]> = {
  'PO-202605-001': [
    { id: 'item-1', nama: 'Beras Premium', dipesan: 200, satuan: 'kg', lokasi: 'Gudang Kering - Rak A1', tgl_kadaluarsa: '2026-12-30' },
    { id: 'item-2', nama: 'Minyak Goreng', dipesan: 50, satuan: 'liter', lokasi: 'Gudang Kering - Rak B2', tgl_kadaluarsa: '2027-05-10' },
  ],
  'PO-202605-002': [
    { id: 'item-3', nama: 'Daging Ayam', dipesan: 100, satuan: 'kg', lokasi: 'Freezer Utama - Laci 1', tgl_kadaluarsa: '2026-05-20' },
  ]
};

type ReceiveEntry = { diterima: number; lokasi: string; kadaluarsa: string; alasan_selisih: string };
type KlaimItem = { item_id: string; nama: string; dipesan: number; diterima: number; selisih: number; satuan: string; alasan: string };

function getStatusSelisih(dipesan: number, diterima: number) {
  if (diterima === dipesan) return 'ok';
  if (diterima < dipesan) return 'kurang';
  return 'lebih';
}

export default function PenerimaanBarangPage() {
  const canKonfirmasi = usePermission('pengadaan.konfirmasi_penerimaan');
  const [activePO, setActivePO] = useState<string | null>(null);
  const [receiveData, setReceiveData] = useState<Record<string, ReceiveEntry>>({});
  const [showLabelModal, setShowLabelModal] = useState<string | null>(null);
  const [showKlaimModal, setShowKlaimModal] = useState<KlaimItem[] | null>(null);
  const [step, setStep] = useState<'input' | 'review'>('input');

  const handleSelectPO = (poId: string) => {
    setActivePO(poId);
    setStep('input');
    const initData: Record<string, ReceiveEntry> = {};
    PO_ITEMS[poId].forEach(item => {
      initData[item.id] = { diterima: item.dipesan, lokasi: item.lokasi, kadaluarsa: item.tgl_kadaluarsa, alasan_selisih: '' };
    });
    setReceiveData(initData);
  };

  const handleUpdateItem = (itemId: string, field: string, value: any) => {
    setReceiveData(prev => ({ ...prev, [itemId]: { ...prev[itemId], [field]: value } }));
  };

  const handleReview = () => {
    // Validasi: diterima tidak boleh melebihi dipesan
    const activeItems = activePO ? PO_ITEMS[activePO] : [];
    for (const item of activeItems) {
      const d = receiveData[item.id];
      if (d.diterima > item.dipesan) {
        toast.error('Anomali Kuantitas!', `${item.nama}: jumlah diterima (${d.diterima}) melebihi pesanan (${item.dipesan}). Hubungi supervisor.`);
        return;
      }
      if (d.diterima < item.dipesan && !d.alasan_selisih.trim()) {
        toast.error('Alasan Selisih Wajib Diisi!', `${item.nama} memiliki selisih. Isi kolom alasan terlebih dahulu.`);
        return;
      }
    }
    setStep('review');
  };

  const handleSimpanPenerimaan = () => {
    const activeItems = activePO ? PO_ITEMS[activePO] : [];
    const klaimItems: KlaimItem[] = activeItems
      .filter(item => receiveData[item.id]?.diterima < item.dipesan)
      .map(item => ({
        item_id: item.id,
        nama: item.nama,
        dipesan: item.dipesan,
        diterima: receiveData[item.id].diterima,
        selisih: item.dipesan - receiveData[item.id].diterima,
        satuan: item.satuan,
        alasan: receiveData[item.id].alasan_selisih,
      }));

    if (klaimItems.length > 0) {
      setShowKlaimModal(klaimItems);
    } else {
      toast.sukses('Penerimaan Lengkap!', 'Semua item diterima sesuai pesanan. Stok FIFO diupdate.');
      setActivePO(null);
      setStep('input');
    }
  };

  const handleKonfirmasiKlaim = () => {
    toast.sukses('Penerimaan Parsial Disimpan!', `Stok diupdate sesuai fisik. Klaim selisih ke supplier telah dicatat untuk audit BGN.`);
    setShowKlaimModal(null);
    setActivePO(null);
    setStep('input');
  };

  const activeItems = activePO ? PO_ITEMS[activePO] : [];

  return (
    <div className="animate-fade-in pb-12 max-w-6xl mx-auto space-y-6">

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Penerimaan & Integrasi PO</h1>
          <p className="text-sm text-slate-500">Pengecekan fisik barang, pencatatan selisih (partial delivery), dan cetak label gudang.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LIST PO */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PackageOpen className="text-blue-600" size={18} /> PO Menunggu Kedatangan
            </h3>
            <div className="space-y-3">
              {PENDING_PO.map(po => (
                <button
                  key={po.id}
                  onClick={() => handleSelectPO(po.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${activePO === po.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">{po.id}</span>
                    <span className="text-[10px] text-slate-500">{po.tanggal}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{po.supplier}</h4>
                  <p className="text-xs text-slate-500 mt-1">{po.totalItem} Item Barang</p>
                </button>
              ))}
            </div>
          </div>

          {/* INFO PARTIAL DELIVERY */}
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2">
            <h3 className="font-bold text-amber-800 text-sm flex items-center gap-2"><AlertTriangle size={15} /> Ketentuan Partial Delivery</h3>
            <div className="text-xs text-amber-700 space-y-1.5">
              <div className="flex gap-2"><CheckCircle size={13} className="text-green-600 shrink-0 mt-0.5" /><span>Jumlah <b>diterima = dipesan</b> → PO Lunas ✅</span></div>
              <div className="flex gap-2"><AlertCircle size={13} className="text-amber-600 shrink-0 mt-0.5" /><span>Jumlah <b>diterima &lt; dipesan</b> → Selisih dicatat sebagai Klaim Supplier ⚠️</span></div>
              <div className="flex gap-2"><XCircle size={13} className="text-red-600 shrink-0 mt-0.5" /><span>Jumlah <b>diterima &gt; dipesan</b> → Anomali, wajib verifikasi supervisor 🚨</span></div>
            </div>
          </div>
        </div>

        {/* DETAIL */}
        <div className="lg:col-span-2">
          {activePO ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up">
              <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-slate-800 text-lg">Pengecekan Fisik Barang</h2>
                  <p className="text-xs text-slate-500">Validasi pesanan {activePO}</p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Step indicator */}
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 'input' ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'}`}>1</span>
                    <span>Input</span>
                    <span className="mx-1">→</span>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 'review' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
                    <span>Review</span>
                  </div>
                  <button onClick={() => { setActivePO(null); setStep('input'); }} className="text-slate-400 hover:text-slate-600 text-sm font-medium">Batal</button>
                </div>
              </div>

              <div className="p-5 overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-200">
                      <th className="pb-3 font-semibold">Nama Bahan</th>
                      <th className="pb-3 font-semibold text-center">Dipesan</th>
                      <th className="pb-3 font-semibold">Diterima (Fisik)</th>
                      <th className="pb-3 font-semibold text-center">Selisih</th>
                      <th className="pb-3 font-semibold">Alasan Selisih</th>
                      <th className="pb-3 font-semibold">Tgl Exp</th>
                      <th className="pb-3 font-semibold">Lokasi</th>
                      <th className="pb-3 font-semibold text-center">Label</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeItems.map((item, idx) => {
                      const data = receiveData[item.id] || {};
                      const status = getStatusSelisih(item.dipesan, data.diterima ?? item.dipesan);
                      const selisih = item.dipesan - (data.diterima ?? item.dipesan);
                      return (
                        <tr key={idx} className={`border-b border-slate-100 ${status === 'kurang' ? 'bg-amber-50/50' : status === 'lebih' ? 'bg-red-50/50' : ''}`}>
                          <td className="py-4 font-bold text-slate-800 pr-3">{item.nama}</td>
                          <td className="py-4 text-center text-slate-500 font-mono">{item.dipesan} {item.satuan}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min={0}
                                max={item.dipesan}
                                className={`input py-1.5 px-2 text-center font-bold w-20 ${status === 'kurang' ? 'border-amber-400 text-amber-700 bg-amber-50' : status === 'ok' ? 'border-green-400 text-green-700' : 'border-red-400 text-red-700'}`}
                                value={data.diterima}
                                disabled={step === 'review'}
                                onChange={(e) => handleUpdateItem(item.id, 'diterima', Number(e.target.value))}
                              />
                              <span className="text-xs text-slate-500">{item.satuan}</span>
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            {status === 'ok' && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Lengkap</span>}
                            {status === 'kurang' && <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">-{selisih} {item.satuan}</span>}
                            {status === 'lebih' && <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">+{Math.abs(selisih)} ⚠️</span>}
                          </td>
                          <td className="py-4">
                            {status === 'kurang' ? (
                              <select
                                className="input py-1.5 px-2 text-xs w-40"
                                value={data.alasan_selisih}
                                disabled={step === 'review'}
                                onChange={(e) => handleUpdateItem(item.id, 'alasan_selisih', e.target.value)}
                              >
                                <option value="">-- Pilih alasan --</option>
                                <option value="Stok supplier habis">Stok supplier habis</option>
                                <option value="Sebagian rusak/reject">Sebagian rusak/reject</option>
                                <option value="Kirim bertahap">Kirim bertahap (akan menyusul)</option>
                                <option value="Salah timbang">Salah timbang/hitung</option>
                                <option value="Lainnya">Lainnya</option>
                              </select>
                            ) : (
                              <span className="text-xs text-slate-400 italic">—</span>
                            )}
                          </td>
                          <td className="py-4">
                            <input
                              type="date"
                              className="input py-1.5 px-2 w-36 text-xs"
                              value={data.kadaluarsa}
                              disabled={step === 'review'}
                              onChange={(e) => handleUpdateItem(item.id, 'kadaluarsa', e.target.value)}
                            />
                          </td>
                          <td className="py-4">
                            <div className="relative w-40">
                              <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                              <input
                                type="text"
                                className="input py-1.5 pl-7 pr-2 w-full text-xs"
                                value={data.lokasi}
                                disabled={step === 'review'}
                                onChange={(e) => handleUpdateItem(item.id, 'lokasi', e.target.value)}
                                placeholder="Rak/Laci..."
                              />
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <button
                              onClick={() => setShowLabelModal(item.id)}
                              className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                              title="Cetak Label"
                            >
                              <QrCode size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* RINGKASAN SELISIH jika ada */}
              {step === 'review' && activeItems.some(i => receiveData[i.id]?.diterima < i.dipesan) && (
                <div className="mx-5 mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <h4 className="font-bold text-amber-800 text-sm mb-2 flex items-center gap-2">
                    <AlertTriangle size={15} /> Ringkasan Klaim Selisih — Akan Dikirim ke Supplier
                  </h4>
                  <div className="space-y-1">
                    {activeItems.filter(i => receiveData[i.id]?.diterima < i.dipesan).map(item => (
                      <div key={item.id} className="flex justify-between text-xs text-amber-700">
                        <span className="font-medium">{item.nama}</span>
                        <span>Selisih: <b>{item.dipesan - receiveData[item.id].diterima} {item.satuan}</b> — "{receiveData[item.id].alasan_selisih}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                {step === 'input' ? (
                  <>
                    <p className="text-xs text-slate-500">* Isi kolom alasan jika ada selisih kuantitas</p>
                    <button onClick={handleReview} className="btn-primary text-sm px-6 flex items-center gap-2">
                      Review Penerimaan →
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setStep('input')} className="btn-secondary text-sm px-4">
                      ← Edit Kembali
                    </button>
                    <button onClick={handleSimpanPenerimaan} className="btn-primary text-sm px-6 flex items-center gap-2">
                      <CheckCircle2 size={16} /> Konfirmasi & Simpan ke Inventori
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 border border-slate-200 border-dashed rounded-2xl py-20">
              <PackageOpen size={48} className="mb-4 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">Pilih Dokumen PO di sebelah kiri untuk memproses penerimaan.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL KONFIRMASI KLAIM */}
      {showKlaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-slate-100 bg-amber-50">
              <h3 className="font-bold text-amber-800 text-lg flex items-center gap-2">
                <AlertTriangle size={20} /> Konfirmasi Penerimaan Parsial
              </h3>
              <p className="text-xs text-amber-700 mt-1">Selisih berikut akan dicatat sebagai <b>Klaim Supplier</b> dan masuk ke riwayat audit.</p>
            </div>
            <div className="p-5 space-y-3">
              {showKlaimModal.map((klaim, i) => (
                <div key={i} className="flex justify-between items-start p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{klaim.nama}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Alasan: <span className="italic">{klaim.alasan}</span></p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-xs text-slate-500">Dipesan: <span className="font-bold text-slate-700">{klaim.dipesan} {klaim.satuan}</span></p>
                    <p className="text-xs text-slate-500">Diterima: <span className="font-bold text-green-700">{klaim.diterima} {klaim.satuan}</span></p>
                    <p className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full mt-1 inline-block">Klaim: {klaim.selisih} {klaim.satuan}</p>
                  </div>
                </div>
              ))}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-700">
                  <b>Catatan:</b> Stok inventori akan diupdate sesuai jumlah fisik diterima. Klaim selisih disimpan ke log supplier dan dapat diakses saat rekonsiliasi bulanan BGN.
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
              <button onClick={() => setShowKlaimModal(null)} className="btn-secondary flex-1">Tinjau Ulang</button>
              <button onClick={handleKonfirmasiKlaim} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Save size={16} /> Simpan + Catat Klaim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LABEL */}
      {showLabelModal && activePO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Printer size={16} /> Preview Label Gudang</h3>
              <button onClick={() => setShowLabelModal(null)} className="text-slate-400 hover:text-red-500">&times;</button>
            </div>
            <div className="p-6 flex justify-center">
              <div className="w-full border-2 border-slate-800 rounded-lg p-4 bg-white shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-12 h-12 bg-slate-800 rotate-45"></div>
                <h4 className="font-black text-xl text-slate-900 mb-1 tracking-tight">
                  {activeItems.find(i => i.id === showLabelModal)?.nama.toUpperCase()}
                </h4>
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Item Masuk</div>
                  <span className="text-xs font-bold text-slate-500">{activePO}</span>
                </div>
                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Tanggal Kadaluarsa (EXP)</p>
                    <p className="font-mono text-red-600 font-bold text-lg bg-red-50 inline-block px-2 py-0.5 rounded border border-red-100">
                      {receiveData[showLabelModal]?.kadaluarsa}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Lokasi Penyimpanan</p>
                    <p className="font-bold text-sm text-slate-800">{receiveData[showLabelModal]?.lokasi}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Kuantitas Diterima</p>
                    <p className="font-bold text-slate-800">
                      {receiveData[showLabelModal]?.diterima} {activeItems.find(i => i.id === showLabelModal)?.satuan}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t-2 border-dashed border-slate-200 flex justify-between items-end">
                  <div className="text-[8px] text-slate-400 font-mono">
                    <p className="font-bold text-slate-600 mb-1">KODE BATCH:</p>
                    <p className="text-xl font-black text-slate-900 tracking-widest bg-slate-100 px-2 py-0.5 rounded border border-slate-300 inline-block">
                      {activePO?.split('-')[1]}-{showLabelModal?.split('-')[1]}
                    </p>
                    <p className="mt-2 text-[7px]">DICETAK OLEH SPPG SYSTEM — {new Date().toLocaleDateString('id-ID')}</p>
                  </div>
                  <QrCode size={32} className="text-slate-300" />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
              <button onClick={() => setShowLabelModal(null)} className="btn-secondary flex-1">Tutup</button>
              <button onClick={() => { toast.sukses('Sedang Mencetak...', 'Menghubungkan ke printer thermal.'); setShowLabelModal(null); }} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Printer size={16} /> Cetak (Thermal)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
