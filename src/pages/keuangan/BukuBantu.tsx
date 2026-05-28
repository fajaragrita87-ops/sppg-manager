import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useKasBesar, usePettyCash, useBukuBahanPangan, useInsentifFasilitas } from '@/hooks/useKeuangan';
import { useMasterBahan } from '@/hooks/useInventori';
import { FileText, Download, Printer, Filter, Calendar } from 'lucide-react';
import { toast } from '@/store/toastStore';

export default function BukuBantuPage() {
  const sppg = useAuthStore(s => s.sppg);
  const [tab, setTab] = useState('neraca');
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  const handleCetak = (lampiran: string) => {
    toast.info(`Menyiapkan dokumen cetak ${lampiran}...`);
    window.print();
  };

  return (
    <div className="animate-fade-in pb-12 print:pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 print:hidden">
        <div>
          <h1 className="font-display text-xl font-semibold text-slate-900">Buku Keuangan BGN</h1>
          <p className="text-sm text-slate-500 mt-1">Semua buku terisi otomatis dari transaksi. Cetak kapan saja.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <Filter size={16} className="text-slate-400 ml-1" />
          <select value={bulan} onChange={e=>setBulan(Number(e.target.value))} className="select text-xs py-1.5 border-transparent bg-transparent font-semibold text-slate-700">
            {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map((m, i) => (
              <option key={i} value={i+1}>{m}</option>
            ))}
          </select>
          <select value={tahun} onChange={e=>setTahun(Number(e.target.value))} className="select text-xs py-1.5 border-transparent bg-transparent font-semibold text-slate-700">
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 overflow-x-auto mb-6 print:hidden">
        {[
          { id: 'neraca', label: 'Neraca Besar' },
          { id: 'petty', label: 'Petty Cash' },
          { id: 'bahan', label: 'Bahan Pangan' },
          { id: 'ops', label: 'Dana Operasional' },
          { id: 'insentif', label: 'Insentif Fasilitas' },
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 px-4 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${tab === t.id ? 'bg-white text-blue-700 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card print:shadow-none print:border-none print:m-0 print:p-0">
        {tab === 'neraca' && <TabNeracaBesar sppgId={sppg?.id} bulan={bulan} tahun={tahun} onCetak={() => handleCetak('Lampiran 30e')} />}
        {tab === 'petty' && <TabPettyCash sppgId={sppg?.id} bulan={bulan} tahun={tahun} onCetak={() => handleCetak('Lampiran 30f')} />}
        {tab === 'bahan' && <TabBahanPangan sppgId={sppg?.id} bulan={bulan} tahun={tahun} onCetak={() => handleCetak('Lampiran 30g')} />}
        {tab === 'ops' && <TabDanaOperasional sppgId={sppg?.id} bulan={bulan} tahun={tahun} onCetak={() => handleCetak('Lampiran 30h')} />}
        {tab === 'insentif' && <TabInsentifFasilitas sppgId={sppg?.id} tahun={tahun} onCetak={() => handleCetak('Lampiran 30i')} />}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
function TabNeracaBesar({ sppgId, bulan, tahun, onCetak }: { sppgId: any, bulan: number, tahun: number, onCetak: () => void }) {
  const { data = [], isLoading } = useKasBesar(sppgId, bulan, tahun);

  const totalDebet = data.reduce((a, c) => a + (c.debet || 0), 0);
  const totalKredit = data.reduce((a, c) => a + (c.kredit || 0), 0);

  return (
    <div className="p-5">
      <div className="flex justify-between items-start mb-6 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FileText size={18} className="text-blue-600"/> Buku Kas Umum (Neraca Besar)</h2>
          <p className="text-xs text-slate-500 mt-1">Format Lampiran 30e - Standar Pelaporan BGN</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button className="btn-secondary text-xs"><Download size={14}/> Export Excel</button>
          <button onClick={onCetak} className="btn-primary text-xs"><Printer size={14}/> Cetak Lampiran 30e</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse border border-slate-200">
          <thead className="bg-slate-50 text-xs text-slate-700 font-semibold text-center">
            <tr>
              <th className="border border-slate-200 p-2 w-12">No</th>
              <th className="border border-slate-200 p-2 w-24">Tanggal</th>
              <th className="border border-slate-200 p-2 w-32">No. Bukti</th>
              <th className="border border-slate-200 p-2 text-left">Uraian</th>
              <th className="border border-slate-200 p-2 w-32">Debet (Rp)</th>
              <th className="border border-slate-200 p-2 w-32">Kredit (Rp)</th>
              <th className="border border-slate-200 p-2 w-32">Saldo (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center p-8 text-slate-400">Memuat data...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className="text-center p-8 text-slate-400">Tidak ada transaksi di bulan ini.</td></tr>
            ) : (
              data.map((row, i) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="border border-slate-200 p-2 text-center text-xs text-slate-500">{i + 1}</td>
                  <td className="border border-slate-200 p-2 text-center text-xs">{row.tanggal}</td>
                  <td className="border border-slate-200 p-2 text-xs text-slate-600">{row.no_bukti}</td>
                  <td className="border border-slate-200 p-2 text-xs">{row.uraian}</td>
                  <td className="border border-slate-200 p-2 text-right text-emerald-600">{row.debet ? row.debet.toLocaleString('id-ID') : '-'}</td>
                  <td className="border border-slate-200 p-2 text-right text-slate-700">{row.kredit ? row.kredit.toLocaleString('id-ID') : '-'}</td>
                  <td className="border border-slate-200 p-2 text-right font-semibold text-slate-800">{(row.saldo_running || 0).toLocaleString('id-ID')}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-slate-50 font-bold text-xs">
            <tr>
              <td colSpan={4} className="border border-slate-200 p-3 text-right">TOTAL</td>
              <td className="border border-slate-200 p-3 text-right text-emerald-600">{totalDebet.toLocaleString('id-ID')}</td>
              <td className="border border-slate-200 p-3 text-right text-slate-700">{totalKredit.toLocaleString('id-ID')}</td>
              <td className="border border-slate-200 p-3 text-right text-blue-700 bg-blue-50">{(totalDebet - totalKredit).toLocaleString('id-ID')}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
function TabPettyCash({ sppgId, bulan, tahun, onCetak }: { sppgId: any, bulan: number, tahun: number, onCetak: () => void }) {
  const { data = [], isLoading } = usePettyCash(sppgId, bulan, tahun);
  const total = data.reduce((a, c) => a + c.jumlah, 0);

  return (
    <div className="p-5">
      <div className="flex justify-between items-start mb-6 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FileText size={18} className="text-blue-600"/> Buku Bantu Petty Cash</h2>
          <p className="text-xs text-slate-500 mt-1">Format Lampiran 30f | Limit per transaksi: Rp 500.000 | Limit mingguan: Rp 5.000.000</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button className="btn-secondary text-xs"><Download size={14}/> Export Excel</button>
          <button onClick={onCetak} className="btn-primary text-xs"><Printer size={14}/> Cetak Lampiran 30f</button>
        </div>
      </div>

      <table className="w-full text-left text-sm border-collapse border border-slate-200">
        <thead className="bg-slate-50 text-xs text-slate-700 font-semibold text-center">
          <tr>
            <th className="border border-slate-200 p-2 w-12">No</th>
            <th className="border border-slate-200 p-2 w-24">Tanggal</th>
            <th className="border border-slate-200 p-2 text-left">Uraian / Keterangan</th>
            <th className="border border-slate-200 p-2 w-40 text-left">Kategori</th>
            <th className="border border-slate-200 p-2 w-32">Pengeluaran (Rp)</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={5} className="text-center p-8 text-slate-400">Memuat data...</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={5} className="text-center p-8 text-slate-400">Tidak ada pengeluaran petty cash.</td></tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="border border-slate-200 p-2 text-center text-xs text-slate-500">{i + 1}</td>
                <td className="border border-slate-200 p-2 text-center text-xs">{row.tanggal}</td>
                <td className="border border-slate-200 p-2 text-xs">{row.uraian}</td>
                <td className="border border-slate-200 p-2 text-xs text-slate-600">{row.kategori}</td>
                <td className="border border-slate-200 p-2 text-right font-medium">{row.jumlah.toLocaleString('id-ID')}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot className="bg-slate-50 font-bold text-xs">
          <tr>
            <td colSpan={4} className="border border-slate-200 p-3 text-right">TOTAL PENGELUARAN PETTY CASH</td>
            <td className="border border-slate-200 p-3 text-right text-rose-700 bg-rose-50">{total.toLocaleString('id-ID')}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
function TabBahanPangan({ sppgId, bulan, tahun, onCetak }: { sppgId: any, bulan: number, tahun: number, onCetak: () => void }) {
  const [bahanId, setBahanId] = useState('');
  const { data: bahanList = [] } = useMasterBahan(sppgId);
  const { data = [], isLoading } = useBukuBahanPangan(sppgId, bahanId, bulan, tahun);

  return (
    <div className="p-5">
      <div className="flex flex-col md:flex-row justify-between md:items-start mb-6 border-b border-slate-200 pb-4 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FileText size={18} className="text-blue-600"/> Buku Bantu Persediaan Bahan Pangan</h2>
          <p className="text-xs text-slate-500 mt-1">Format Lampiran 30g - Catatan stok masuk dan keluar per jenis bahan</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 print:hidden w-full md:w-auto">
          <select value={bahanId} onChange={e=>setBahanId(e.target.value)} className="select text-sm w-full md:w-48 bg-white border-blue-200 focus:ring-blue-500">
            <option value="">-- Pilih Bahan --</option>
            {bahanList.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
          </select>
          <button onClick={onCetak} disabled={!bahanId} className="btn-primary text-xs whitespace-nowrap"><Printer size={14}/> Cetak 30g</button>
        </div>
      </div>

      {!bahanId ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
          <p className="text-sm text-slate-500 font-medium">Silakan pilih bahan terlebih dahulu di sudut kanan atas.</p>
        </div>
      ) : (
        <table className="w-full text-left text-sm border-collapse border border-slate-200">
          <thead className="bg-slate-50 text-xs text-slate-700 font-semibold text-center">
            <tr>
              <th className="border border-slate-200 p-2 w-24">Tanggal</th>
              <th className="border border-slate-200 p-2 text-left">Uraian</th>
              <th className="border border-slate-200 p-2 w-20 bg-emerald-50">Masuk (Qty)</th>
              <th className="border border-slate-200 p-2 w-32 bg-emerald-50">Masuk (Rp)</th>
              <th className="border border-slate-200 p-2 w-20 bg-rose-50">Keluar (Qty)</th>
              <th className="border border-slate-200 p-2 w-20 bg-blue-50">Saldo (Qty)</th>
              <th className="border border-slate-200 p-2 w-32 bg-blue-50">Saldo (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center p-8 text-slate-400">Memuat data...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className="text-center p-8 text-slate-400">Belum ada mutasi untuk bahan ini di bulan terpilih.</td></tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 text-xs">
                  <td className="border border-slate-200 p-2 text-center">{row.tanggal}</td>
                  <td className="border border-slate-200 p-2">{row.uraian}</td>
                  <td className="border border-slate-200 p-2 text-center text-emerald-600">{row.qty_masuk || '-'}</td>
                  <td className="border border-slate-200 p-2 text-right text-emerald-600">{row.nilai_masuk ? row.nilai_masuk.toLocaleString('id-ID') : '-'}</td>
                  <td className="border border-slate-200 p-2 text-center text-rose-600">{row.qty_keluar || '-'}</td>
                  <td className="border border-slate-200 p-2 text-center font-bold text-slate-800 bg-blue-50/20">{row.saldo_qty}</td>
                  <td className="border border-slate-200 p-2 text-right font-bold text-slate-800 bg-blue-50/20">{row.saldo_rp.toLocaleString('id-ID')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
function TabDanaOperasional({ sppgId, bulan, tahun, onCetak }: { sppgId: any, bulan: number, tahun: number, onCetak: () => void }) {
  const { data = [], isLoading } = useKasBesar(sppgId, bulan, tahun);
  
  // Filter hanya kategori operasional
  const opsData = data.filter(d => ['listrik', 'gas', 'air', 'internet', 'bbm', 'atk', 'apd', 'sewa_kendaraan', 'operasional'].includes(d.kategori));
  const total = opsData.reduce((a, c) => a + (c.kredit || 0), 0);

  return (
    <div className="p-5">
      <div className="flex justify-between items-start mb-6 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FileText size={18} className="text-blue-600"/> Buku Bantu Dana Operasional</h2>
          <p className="text-xs text-slate-500 mt-1">Format Lampiran 30h - Biaya non-bahan baku</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={onCetak} className="btn-primary text-xs"><Printer size={14}/> Cetak Lampiran 30h</button>
        </div>
      </div>

      <table className="w-full text-left text-sm border-collapse border border-slate-200">
        <thead className="bg-slate-50 text-xs text-slate-700 font-semibold text-center">
          <tr>
            <th className="border border-slate-200 p-2 w-12">No</th>
            <th className="border border-slate-200 p-2 w-24">Tanggal</th>
            <th className="border border-slate-200 p-2 text-left">Uraian Transaksi</th>
            <th className="border border-slate-200 p-2 w-32">Pengeluaran (Rp)</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={4} className="text-center p-8 text-slate-400">Memuat data...</td></tr>
          ) : opsData.length === 0 ? (
            <tr><td colSpan={4} className="text-center p-8 text-slate-400">Tidak ada pengeluaran operasional.</td></tr>
          ) : (
            opsData.map((row, i) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="border border-slate-200 p-2 text-center text-xs text-slate-500">{i + 1}</td>
                <td className="border border-slate-200 p-2 text-center text-xs">{row.tanggal}</td>
                <td className="border border-slate-200 p-2 text-xs">{row.uraian} <span className="text-[10px] text-slate-400 bg-slate-100 px-1 ml-1 rounded">{row.kategori}</span></td>
                <td className="border border-slate-200 p-2 text-right font-medium">{row.kredit.toLocaleString('id-ID')}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot className="bg-slate-50 font-bold text-xs">
          <tr>
            <td colSpan={3} className="border border-slate-200 p-3 text-right">TOTAL PENGELUARAN OPERASIONAL</td>
            <td className="border border-slate-200 p-3 text-right text-slate-800">{total.toLocaleString('id-ID')}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
function TabInsentifFasilitas({ sppgId, tahun, onCetak }: { sppgId: any, tahun: number, onCetak: () => void }) {
  const { data = [], isLoading } = useInsentifFasilitas(sppgId, tahun);
  
  // Data Mock jika kosong (untuk demo)
  const isMock = data.length === 0;
  const mockData = [
    { id: '1', periode_mulai: `${tahun}-01-01`, periode_selesai: `${tahun}-01-31`, hari_operasional: 25, total_rp: 25 * 6000000, status: 'Cair', tanggal_terima: `${tahun}-02-05` },
    { id: '2', periode_mulai: `${tahun}-02-01`, periode_selesai: `${tahun}-02-28`, hari_operasional: 24, total_rp: 24 * 6000000, status: 'Proses', tanggal_terima: '-' },
  ];
  const displayData = isMock ? mockData : data;

  const totalHariTarget = 313;
  const totalHariBerjalan = displayData.reduce((a, c) => a + c.hari_operasional, 0);
  const persentase = (totalHariBerjalan / totalHariTarget) * 100;

  return (
    <div className="p-5">
      <div className="flex justify-between items-start mb-6 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FileText size={18} className="text-blue-600"/> Buku Bantu Insentif Penyiapan Fasilitas</h2>
          <p className="text-xs text-slate-500 mt-1">Format Lampiran 30i - Pembayaran Rp 6.000.000 / hari operasional (Pagu: 313 hari)</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={onCetak} className="btn-primary text-xs"><Printer size={14}/> Cetak Lampiran 30i</button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
        <div className="flex justify-between text-xs font-semibold mb-2 text-blue-900">
          <span>Hari Berjalan: {totalHariBerjalan} hari</span>
          <span>Target Setahun: {totalHariTarget} hari</span>
        </div>
        <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-blue-100">
          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${persentase}%` }}></div>
        </div>
        <p className="text-[10px] text-blue-700 mt-2 font-medium">313 hari operasional TA {tahun} × Rp 6.000.000 = Rp 1.878.000.000 (Pagu Total)</p>
      </div>

      <table className="w-full text-left text-sm border-collapse border border-slate-200">
        <thead className="bg-slate-50 text-xs text-slate-700 font-semibold text-center">
          <tr>
            <th className="border border-slate-200 p-2">Periode</th>
            <th className="border border-slate-200 p-2 w-32">Hari Operasional</th>
            <th className="border border-slate-200 p-2 w-32">Total Hak (Rp)</th>
            <th className="border border-slate-200 p-2 w-24">Status</th>
            <th className="border border-slate-200 p-2 w-32">Tgl Terima</th>
          </tr>
        </thead>
        <tbody>
          {displayData.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50 text-center text-xs">
              <td className="border border-slate-200 p-2">{row.periode_mulai} s/d {row.periode_selesai}</td>
              <td className="border border-slate-200 p-2 font-bold">{row.hari_operasional} Hari</td>
              <td className="border border-slate-200 p-2 text-right font-medium text-emerald-700">{(row.total_rp).toLocaleString('id-ID')}</td>
              <td className="border border-slate-200 p-2">
                {row.status === 'Cair' ? <span className="text-emerald-600 font-bold">✓ Cair</span> : <span className="text-amber-600 font-semibold">Proses BGN</span>}
              </td>
              <td className="border border-slate-200 p-2 text-slate-500">{row.tanggal_terima}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
