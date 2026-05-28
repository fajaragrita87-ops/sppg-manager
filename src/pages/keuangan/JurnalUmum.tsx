import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronRight, Edit3, AlertCircle, Plus, Trash2, FileText, Filter, ArrowUpDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { buatJurnal } from '@/lib/accounting-engine';
import { toast } from '@/store/toastStore';
import { formatRupiah } from '@/lib/utils';

const REF_LABEL: Record<string, string> = {
  kas_masuk:'Dana BGN Masuk', insentif_fasilitas:'Insentif Fasilitas',
  belanja_bahan:'Belanja Bahan', operasional:'Operasional',
  insentif:'Insentif Relawan', insentif_pj:'Insentif PJ',
  petty_cash:'Petty Cash', bayar_hutang:'Bayar Hutang', manual:'Jurnal Manual',
};
const REF_COLOR: Record<string, string> = {
  kas_masuk:'#0f766e', insentif_fasilitas:'#0369a1',
  belanja_bahan:'#b45309', operasional:'#6d28d9',
  insentif:'#0369a1', insentif_pj:'#0369a1',
  petty_cash:'#065f46', bayar_hutang:'#b91c1c', manual:'#475569',
};

const MOCK = [
  { id:'J001', tanggal:'2026-05-15', no_jurnal:'JU/sppg-de/2026/05/0001', deskripsi:'Penerimaan dana BGN — Transfer Periode II Minggu ke-20', ref_tipe:'kas_masuk', status:'posted', debit:52000000, kredit:52000000,
    detail:[{kode:'1-1001',nama:'Saldo Rekening VA BGN',debit:52000000,kredit:0},{kode:'4-0001',nama:'Dana dari BGN untuk Operasional',debit:0,kredit:52000000}]},
  { id:'J002', tanggal:'2026-05-14', no_jurnal:'JU/sppg-de/2026/05/0002', deskripsi:'Belanja Beras 500 kg — BUMDesa Maju Makmur', ref_tipe:'belanja_bahan', status:'posted', debit:4500000, kredit:4500000,
    detail:[{kode:'5-1001',nama:'Beras & Karbohidrat',debit:4500000,kredit:0},{kode:'1-1001',nama:'Saldo Rekening VA BGN',debit:0,kredit:4500000}]},
  { id:'J003', tanggal:'2026-05-13', no_jurnal:'JU/sppg-de/2026/05/0003', deskripsi:'Pembayaran insentif 47 relawan periode 1–15 Mei 2026', ref_tipe:'insentif', status:'posted', debit:37250000, kredit:37250000,
    detail:[{kode:'5-2001',nama:'Insentif Harian Relawan',debit:37250000,kredit:0},{kode:'1-1001',nama:'Saldo Rekening VA BGN',debit:0,kredit:37250000}]},
  { id:'J004', tanggal:'2026-05-09', no_jurnal:'JU/sppg-de/2026/05/0004', deskripsi:'Bayar listrik PLN — April 2026', ref_tipe:'operasional', status:'posted', debit:1200000, kredit:1200000,
    detail:[{kode:'5-3001',nama:'Tagihan Listrik PLN',debit:1200000,kredit:0},{kode:'1-1001',nama:'Saldo Rekening VA BGN',debit:0,kredit:1200000}]},
];

export default function JurnalUmum() {
  const { user, sppg } = useAuthStore();
  const isMgr = ['owner','kasppg'].includes(user?.role||'');
  const [data] = useState(MOCK);
  const [exp, setExp] = useState<string|null>(null);
  const [search, setSearch] = useState('');
  const [filterTipe, setFilterTipe] = useState('semua');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [kForm, setKForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    deskripsi:'',
    lines:[{akun_kode:'',deskripsi:'',debit:0,kredit:0}],
  });

  const addLine = () => setKForm(f=>({...f,lines:[...f.lines,{akun_kode:'',deskripsi:'',debit:0,kredit:0}]}));
  const delLine = (i:number) => setKForm(f=>({...f,lines:f.lines.filter((_,idx)=>idx!==i)}));
  const totD = kForm.lines.reduce((s,l)=>s+(Number(l.debit)||0),0);
  const totK = kForm.lines.reduce((s,l)=>s+(Number(l.kredit)||0),0);
  const balanced = Math.abs(totD-totK)<0.01;

  const simpanKoreksi = async () => {
    if (!kForm.deskripsi) {toast.error('Isi keterangan');return;}
    if (!balanced) {toast.error('Debit dan kredit harus sama');return;}
    if (!sppg?.id||!user?.id) return;
    setSaving(true);
    try {
      await buatJurnal({sppgId:sppg.id,tanggal:kForm.tanggal,deskripsi:kForm.deskripsi,
        lines:kForm.lines.map(l=>({...l,debit:Number(l.debit),kredit:Number(l.kredit)})),
        refTipe:'manual',dibuatOleh:user.id});
      toast.sukses('Jurnal koreksi tersimpan');
      setShowModal(false);
    } catch(e:any){toast.error(e.message);}
    finally{setSaving(false);}
  };

  const filtered = data.filter(j=>{
    const ms = j.deskripsi.toLowerCase().includes(search.toLowerCase())||j.no_jurnal.toLowerCase().includes(search.toLowerCase());
    const mt = filterTipe==='semua'||j.ref_tipe===filterTipe;
    return ms&&mt;
  });

  const fmtTgl=(s:string)=>new Date(s).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'});

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <FileText size={11}/><span>Keuangan</span><ChevronRight size={9}/><span className="text-slate-600">Jurnal Transaksi</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Jurnal Transaksi</h1>
          <p className="text-sm text-slate-500 mt-0.5">General Ledger — seluruh entri dibuat otomatis oleh sistem</p>
        </div>
        {isMgr && (
          <button onClick={()=>setShowModal(true)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors">
            <Edit3 size={13}/> Jurnal Koreksi
          </button>
        )}
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 px-4 py-3 border border-blue-200 bg-blue-50/50 rounded-lg mb-5 text-xs text-blue-700">
        <AlertCircle size={13} className="flex-shrink-0 mt-0.5 text-blue-400"/>
        <span>Jurnal di bawah dibuat <strong>otomatis</strong> oleh sistem dari setiap transaksi di modul Pengadaan, Keuangan, dan SDM. Jurnal manual hanya untuk penyesuaian akuntansi.</span>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari deskripsi atau nomor jurnal..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white"/>
        </div>
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <select value={filterTipe} onChange={e=>setFilterTipe(e.target.value)}
            className="pl-8 pr-8 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white appearance-none min-w-[180px]">
            <option value="semua">Semua Jenis</option>
            {Object.entries(REF_LABEL).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Journal Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {/* Table head */}
        <div className="grid grid-cols-12 px-5 py-2.5 bg-slate-50 border-b border-slate-200">
          {[{l:'Tanggal',c:'col-span-2'},{l:'No. Jurnal',c:'col-span-3'},{l:'Keterangan',c:'col-span-3'},{l:'Jenis',c:'col-span-2'},{l:'Jumlah (Rp)',c:'col-span-2 text-right'}].map(h=>(
            <div key={h.l} className={`${h.c} text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1`}>
              {h.l}
            </div>
          ))}
        </div>

        {filtered.map(j=>{
          const color = REF_COLOR[j.ref_tipe]||'#475569';
          const isExp = exp===j.id;
          return (
            <div key={j.id} className="border-b border-slate-100 last:border-0">
              <button onClick={()=>setExp(isExp?null:j.id)}
                className="w-full grid grid-cols-12 px-5 py-3.5 items-center hover:bg-slate-50/70 transition-colors text-left">
                <div className="col-span-2 text-xs font-mono text-slate-500">{fmtTgl(j.tanggal)}</div>
                <div className="col-span-3">
                  <span className="text-xs font-mono text-slate-400">{j.no_jurnal}</span>
                </div>
                <div className="col-span-3">
                  <span className="text-sm text-slate-700 font-medium line-clamp-1">{j.deskripsi}</span>
                </div>
                <div className="col-span-2">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold border" style={{color,borderColor:color+'40',background:color+'10'}}>
                    {REF_LABEL[j.ref_tipe]||'—'}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <span className="text-sm font-mono font-semibold text-slate-800">{formatRupiah(j.debit)}</span>
                  {isExp ? <ChevronUp size={13} className="text-slate-300"/> : <ChevronDown size={13} className="text-slate-300"/>}
                </div>
              </button>

              {isExp && (
                <div className="px-5 pb-4 bg-slate-50/40 border-t border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-3">Detail Entri Jurnal</p>
                  <table className="w-full text-xs">
                    <thead><tr className="text-[10px] text-slate-400 border-b border-slate-200">
                      <th className="text-left py-1.5 pr-4 font-semibold">Kode Akun</th>
                      <th className="text-left py-1.5 pr-4 font-semibold">Nama Akun</th>
                      <th className="text-right py-1.5 pr-4 font-semibold">Debit (Rp)</th>
                      <th className="text-right py-1.5 font-semibold">Kredit (Rp)</th>
                    </tr></thead>
                    <tbody>
                      {j.detail.map((d,i)=>(
                        <tr key={i} className="border-b border-slate-100 last:border-0">
                          <td className="py-2 pr-4 font-mono text-slate-400">{d.kode}</td>
                          <td className="py-2 pr-4 text-slate-700 font-medium">{d.nama}</td>
                          <td className="py-2 pr-4 text-right font-mono">{d.debit?formatRupiah(d.debit):<span className="text-slate-300">—</span>}</td>
                          <td className="py-2 text-right font-mono">{d.kredit?formatRupiah(d.kredit):<span className="text-slate-300">—</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot><tr className="border-t-2 border-slate-300">
                      <td colSpan={2} className="py-2 font-bold text-slate-600 text-xs">TOTAL</td>
                      <td className="py-2 text-right font-mono font-bold text-slate-800">{formatRupiah(j.debit)}</td>
                      <td className="py-2 text-right font-mono font-bold text-slate-800">{formatRupiah(j.kredit)}</td>
                    </tr></tfoot>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        {!filtered.length && (
          <div className="px-5 py-12 text-center text-sm text-slate-400">Tidak ada jurnal yang cocok dengan filter</div>
        )}
      </div>

      {/* Modal Koreksi */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 size={15} className="text-slate-500"/>
                <h3 className="text-sm font-semibold text-slate-800">Buat Jurnal Koreksi</h3>
              </div>
              <button onClick={()=>setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <p className="text-xs text-slate-400 border border-amber-200 bg-amber-50 px-3 py-2 rounded-lg">Jurnal koreksi hanya untuk penyesuaian akuntansi. Semua transaksi normal dibuat otomatis oleh sistem.</p>
              <div className="grid grid-cols-2 gap-3">
                {[{label:'Tanggal',type:'date',key:'tanggal'},{label:'Keterangan Koreksi',type:'text',key:'deskripsi'}].map(f=>(
                  <div key={f.key} className={f.key==='deskripsi'?'col-span-2':''}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                    <input type={f.type} value={(kForm as any)[f.key]}
                      onChange={e=>setKForm(p=>({...p,[f.key]:e.target.value}))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400 font-mono"/>
                  </div>
                ))}
              </div>

              {/* Lines */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Baris Jurnal</label>
                  <button onClick={addLine} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                    <Plus size={12}/> Tambah Baris
                  </button>
                </div>
                {/* Column headers */}
                <div className="grid grid-cols-12 gap-2 mb-1.5">
                  {['Kode Akun','Keterangan','Debit (Rp)','Kredit (Rp)',''].map((h,i)=>(
                    <div key={i} className={`text-[10px] font-semibold text-slate-400 uppercase tracking-wider ${i===0?'col-span-2':i===1?'col-span-4':i===4?'col-span-1':'col-span-2'}`}>{h}</div>
                  ))}
                </div>
                <div className="space-y-2">
                  {kForm.lines.map((line,i)=>(
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <input className="col-span-2 px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-slate-400" placeholder="5-1001" value={line.akun_kode}
                        onChange={e=>setKForm(f=>({...f,lines:f.lines.map((l,idx)=>idx===i?{...l,akun_kode:e.target.value}:l)}))}/>
                      <input className="col-span-4 px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-400" placeholder="Keterangan baris" value={line.deskripsi}
                        onChange={e=>setKForm(f=>({...f,lines:f.lines.map((l,idx)=>idx===i?{...l,deskripsi:e.target.value}:l)}))}/>
                      <input type="number" className="col-span-2 px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-slate-400" placeholder="0" value={line.debit||''}
                        onChange={e=>setKForm(f=>({...f,lines:f.lines.map((l,idx)=>idx===i?{...l,debit:Number(e.target.value)}:l)}))}/>
                      <input type="number" className="col-span-2 px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-slate-400" placeholder="0" value={line.kredit||''}
                        onChange={e=>setKForm(f=>({...f,lines:f.lines.map((l,idx)=>idx===i?{...l,kredit:Number(e.target.value)}:l)}))}/>
                      <button onClick={()=>delLine(i)} className="col-span-1 flex items-center justify-center text-slate-200 hover:text-rose-400 transition-colors"><Trash2 size={13}/></button>
                      <div className="col-span-1"/>
                    </div>
                  ))}
                </div>
                {/* Balance indicator */}
                <div className={`mt-3 flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold border ${balanced?'border-emerald-200 bg-emerald-50 text-emerald-700':'border-rose-200 bg-rose-50 text-rose-600'}`}>
                  <span>{balanced?'Jurnal Balance (Siap Disimpan)':'Tidak Balance — Periksa Nominal'}</span>
                  <span className="font-mono">D: {formatRupiah(totD)} | K: {formatRupiah(totK)}</span>
                </div>
              </div>
            </div>
            <div className="px-5 pb-5 pt-4 flex gap-2 flex-shrink-0 border-t border-slate-100">
              <button onClick={()=>setShowModal(false)} className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Batal</button>
              <button onClick={simpanKoreksi} disabled={!balanced||saving} className="flex-1 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors">
                {saving?'Menyimpan...':'Simpan Jurnal Koreksi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
