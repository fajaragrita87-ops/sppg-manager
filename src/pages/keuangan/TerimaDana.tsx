import { useState } from 'react';
import { ArrowDownCircle, Calendar, FileText, Plus, Check, ChevronRight, CreditCard, Building2, Layers } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';
import { jurnalTerimaDanaBGN, jurnalTerimaInsentifFasilitas } from '@/lib/accounting-engine';
import { formatRupiah, getTanggalHariIni } from '@/lib/utils';

type JenisId = 'dana_bgn' | 'insentif_fasilitas' | 'lainnya';
const JENIS: { id: JenisId; label: string; sub: string; icon: React.ElementType; accent: string }[] = [
  { id:'dana_bgn',           label:'Dana Operasional BGN',     sub:'Transfer dari BGN ke VA SPPG',    icon:Building2,      accent:'#0f766e' },
  { id:'insentif_fasilitas', label:'Insentif Fasilitas SPPG',  sub:'Insentif dari BGN atas fasilitas', icon:Layers,         accent:'#0369a1' },
  { id:'lainnya',            label:'Penerimaan Lainnya',        sub:'Penerimaan di luar kategori utama',icon:CreditCard,     accent:'#6d28d9' },
];

const INIT: { id:string; tanggal:string; jenis:JenisId; jumlah:number; keterangan:string; oleh:string }[] = [
  { id:'R001', tanggal:'2026-05-15', jenis:'dana_bgn',           jumlah:52000000, keterangan:'Transfer BGN Periode II — Minggu ke-20', oleh:'Pengawas Keuangan' },
  { id:'R002', tanggal:'2026-05-01', jenis:'insentif_fasilitas',  jumlah:5000000,  keterangan:'Insentif Fasilitas SPPG April 2026',     oleh:'Ka. SPPG' },
  { id:'R003', tanggal:'2026-04-15', jenis:'dana_bgn',           jumlah:52000000, keterangan:'Transfer BGN Periode I — Minggu ke-16',  oleh:'Pengawas Keuangan' },
];

export default function TerimaDana() {
  const { user, sppg } = useAuthStore();
  const [show, setShow]       = useState(false);
  const [rows, setRows]       = useState(INIT);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({ jenis:'dana_bgn' as JenisId, tanggal:getTanggalHariIni(), jumlah:'', keterangan:'' });

  const totalBulanIni = rows.filter(r => r.tanggal.startsWith('2026-05')).reduce((s,r)=>s+r.jumlah,0);
  const totalDanaBGN  = rows.filter(r=>r.jenis==='dana_bgn').reduce((s,r)=>s+r.jumlah,0);
  const totalInsentif = rows.filter(r=>r.jenis==='insentif_fasilitas').reduce((s,r)=>s+r.jumlah,0);

  const handleSimpan = async () => {
    if (!form.jumlah || !form.keterangan) { toast.error('Lengkapi semua kolom'); return; }
    const jumlah = Number(String(form.jumlah).replace(/\D/g,''));
    if (!jumlah) { toast.error('Nominal tidak valid'); return; }
    setLoading(true);
    try {
      if (sppg?.id && user?.id) {
        if (form.jenis==='dana_bgn')
          await jurnalTerimaDanaBGN({ sppgId:sppg.id, tanggal:form.tanggal, jumlah, keterangan:form.keterangan, userId:user.id });
        else if (form.jenis==='insentif_fasilitas')
          await jurnalTerimaInsentifFasilitas({ sppgId:sppg.id, tanggal:form.tanggal, jumlah, periode:form.keterangan, userId:user.id });
      }
      setRows(p=>[{ id:'R'+Date.now(), tanggal:form.tanggal, jenis:form.jenis, jumlah, keterangan:form.keterangan, oleh:user?.jabatan||'—' },...p]);
      toast.sukses(`Penerimaan ${formatRupiah(jumlah)} berhasil dicatat`);
      setShow(false);
      setForm({ jenis:'dana_bgn', tanggal:getTanggalHariIni(), jumlah:'', keterangan:'' });
    } catch(e:any) { toast.error(e.message||'Gagal menyimpan'); }
    finally { setLoading(false); }
  };

  const fmtTgl = (s:string) => new Date(s).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <FileText size={11}/><span>Keuangan</span><ChevronRight size={9}/><span className="text-slate-600">Catat Penerimaan Dana</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Penerimaan Dana</h1>
          <p className="text-sm text-slate-500 mt-0.5">Catat setiap dana masuk dari BGN ke rekening VA SPPG</p>
        </div>
        <button onClick={()=>setShow(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
          <Plus size={14}/> Catat Penerimaan
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label:'Total Diterima Bulan Ini', value:totalBulanIni, accent:'#0f766e', icon:ArrowDownCircle },
          { label:'Dana Operasional BGN',      value:totalDanaBGN,  accent:'#0369a1', icon:Building2 },
          { label:'Insentif Fasilitas SPPG',   value:totalInsentif, accent:'#6d28d9', icon:Layers },
        ].map(kpi=>{
          const Icon=kpi.icon;
          return (
            <div key={kpi.label} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{kpi.label}</p>
                <div className="w-7 h-7 rounded flex items-center justify-center" style={{background:kpi.accent+'14'}}>
                  <Icon size={14} style={{color:kpi.accent}}/>
                </div>
              </div>
              <p className="text-2xl font-bold font-mono tracking-tight" style={{color:kpi.accent}}>{formatRupiah(kpi.value)}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-slate-400"/>
            <span className="text-sm font-semibold text-slate-700">Riwayat Penerimaan</span>
          </div>
          <span className="text-xs font-mono text-slate-400">{rows.length} transaksi</span>
        </div>
        <div className="grid grid-cols-12 px-5 py-2.5 border-b border-slate-100 bg-slate-50/50">
          {['Tanggal','Jenis','Keterangan / Referensi','Jumlah (Rp)','Dicatat Oleh'].map((h,i)=>(
            <div key={h} className={`text-[10px] font-semibold text-slate-400 uppercase tracking-wider ${i===0?'col-span-2':i===1?'col-span-2':i===2?'col-span-4':i===3?'col-span-2 text-right':'col-span-2'}`}>{h}</div>
          ))}
        </div>
        {rows.map(r=>{
          const j = JENIS.find(x=>x.id===r.jenis)!;
          const Icon = j.icon;
          return (
            <div key={r.id} className="grid grid-cols-12 px-5 py-3.5 border-b border-slate-50 last:border-0 items-center hover:bg-slate-50/60 transition-colors">
              <div className="col-span-2 flex items-center gap-1.5">
                <Calendar size={11} className="text-slate-300 flex-shrink-0"/>
                <span className="text-xs font-mono text-slate-600">{fmtTgl(r.tanggal)}</span>
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-1.5">
                  <Icon size={12} style={{color:j.accent}}/>
                  <span className="text-xs font-medium" style={{color:j.accent}}>{j.label}</span>
                </div>
              </div>
              <div className="col-span-4">
                <span className="text-sm text-slate-700">{r.keterangan}</span>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-sm font-mono font-semibold text-emerald-700">+{formatRupiah(r.jumlah)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-slate-400">{r.oleh}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowDownCircle size={15} className="text-emerald-600"/>
                <h3 className="text-sm font-semibold text-slate-800">Catat Penerimaan Dana</h3>
              </div>
              <button onClick={()=>setShow(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
            </div>
            <div className="p-5 space-y-4">
              {/* Jenis */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Jenis Penerimaan</label>
                <div className="space-y-2">
                  {JENIS.map(j=>{
                    const Icon=j.icon;
                    const sel=form.jenis===j.id;
                    return (
                      <button key={j.id} type="button" onClick={()=>setForm(f=>({...f,jenis:j.id as JenisId}))}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-all ${sel?'border-slate-800 bg-slate-50':'border-slate-200 hover:border-slate-300'}`}>
                        <Icon size={16} style={{color:sel?'#0f172a':j.accent}}/>
                        <div>
                          <p className={`text-sm font-semibold ${sel?'text-slate-900':'text-slate-600'}`}>{j.label}</p>
                          <p className="text-[11px] text-slate-400">{j.sub}</p>
                        </div>
                        {sel && <Check size={14} className="ml-auto text-slate-800"/>}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Fields */}
              {[
                { label:'Tanggal Diterima', type:'date',   key:'tanggal', ph:'' },
                { label:'Jumlah (Rp)',      type:'number', key:'jumlah',  ph:'52000000' },
                { label:'Keterangan / No. Referensi Transfer', type:'text', key:'keterangan', ph:'Transfer BGN Periode II...' },
              ].map(f=>(
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                  <input type={f.type} placeholder={f.ph}
                    value={(form as any)[f.key]}
                    onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-slate-400 bg-slate-50 font-mono" />
                </div>
              ))}
            </div>
            <div className="px-5 pb-5 flex gap-2">
              <button onClick={()=>setShow(false)} className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Batal</button>
              <button onClick={handleSimpan} disabled={loading} className="flex-1 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                <Check size={14}/>{loading?'Menyimpan...':'Simpan Penerimaan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
