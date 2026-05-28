import { useState } from 'react';
import { Eye, RefreshCw, ChevronRight, FileBarChart2, TrendingUp, TrendingDown, Scale, Layers, BarChart3, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import LaporanPreviewModal, { PreviewSection } from '@/components/keuangan/LaporanPreviewModal';

const TABS = [
  { id:'neraca',    label:'Posisi Keuangan',    icon:Scale },
  { id:'sd',        label:'Penggunaan Dana',     icon:TrendingDown },
  { id:'ak',        label:'Aliran Dana',         icon:Layers },
  { id:'tb',        label:'Neraca Saldo',        icon:BarChart3 },
  { id:'avr',       label:'Anggaran vs Realisasi',icon:FileBarChart2 },
];

const NERACA = {
  aset:[
    {kode:'1-1001',nama:'Saldo Rekening VA BGN',sub:'Kas & Setara Kas',saldo:10250000},
    {kode:'1-1002',nama:'Kas Kecil Operasional',sub:'Kas & Setara Kas',saldo:500000},
    {kode:'1-1100',nama:'Persediaan Bahan Baku',sub:'Persediaan',saldo:3200000},
    {kode:'1-2001',nama:'Peralatan Dapur',sub:'Aset Tetap',saldo:45000000},
  ],
  liabilitas:[
    {kode:'2-1001',nama:'Tagihan Belum Dibayar (Supplier)',sub:'Hutang Usaha',saldo:2800000},
    {kode:'2-1002',nama:'Insentif Belum Dibayar',sub:'Hutang SDM',saldo:0},
  ],
  ekuitas:[
    {kode:'3-0001',nama:'Modal Awal Yayasan',sub:'Modal',saldo:50000000},
    {kode:'3-0003',nama:'Surplus Periode Berjalan',sub:'Laba Ditahan',saldo:6150000},
  ],
};

const SD = {
  pendapatan:[{nama:'Dana Operasional BGN',saldo:104000000},{nama:'Insentif Fasilitas SPPG',saldo:5000000}],
  beban:{
    bahan:[{nama:'Beras & Karbohidrat',saldo:22000000},{nama:'Protein Hewani (Ayam/Ikan/Telur)',saldo:31500000},{nama:'Sayur & Buah-buahan',saldo:12000000}],
    sdm:[{nama:'Insentif Harian Relawan',saldo:37250000},{nama:'Insentif PJ Satuan Pendidikan',saldo:0}],
    ops:[{nama:'Listrik PLN',saldo:1200000},{nama:'Gas LPG',saldo:800000},{nama:'BBM Kendaraan',saldo:750000}],
    admin:[],
  },
};

const TB_ROWS = [
  {kode:'1-1001',nama:'Saldo Rekening VA BGN',tipe:'Aset',debit:109000000,kredit:98750000,saldo:10250000},
  {kode:'4-0001',nama:'Dana dari BGN untuk Operasional',tipe:'Pendapatan',debit:0,kredit:104000000,saldo:104000000},
  {kode:'5-1001',nama:'Beras & Karbohidrat',tipe:'Beban',debit:22000000,kredit:0,saldo:22000000},
  {kode:'5-2001',nama:'Insentif Harian Relawan',tipe:'Beban',debit:37250000,kredit:0,saldo:37250000},
  {kode:'5-3001',nama:'Tagihan Listrik PLN',tipe:'Beban',debit:1200000,kredit:0,saldo:1200000},
];

const AVR = [
  {nama:'Bahan Makanan',anggaran:70000000,real:65500000,pct:94,status:'on_track'},
  {nama:'SDM & Insentif',anggaran:38000000,real:37250000,pct:98,status:'on_track'},
  {nama:'Operasional Dapur',anggaran:2000000,real:2750000,pct:138,status:'over'},
  {nama:'Administrasi & Umum',anggaran:500000,real:0,pct:0,status:'under'},
];

function SectionHeader({label,count}:{label:string;count?:string}) {
  return (
    <div className="flex items-center justify-between py-2 px-4 bg-slate-100 border-b border-slate-200">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      {count && <span className="text-[10px] font-mono text-slate-400">{count}</span>}
    </div>
  );
}

function AkunRow({kode,nama,sub,saldo,accent}:{kode:string;nama:string;sub:string;saldo:number;accent:string}) {
  return (
    <div className="grid grid-cols-12 px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors items-center">
      <div className="col-span-2 font-mono text-[11px] text-slate-400">{kode}</div>
      <div className="col-span-6">
        <p className="text-sm text-slate-800 font-medium">{nama}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
      </div>
      <div className="col-span-4 text-right font-mono text-sm font-semibold" style={{color:accent}}>{saldo>0?formatRupiah(saldo):<span className="text-slate-300 font-normal">—</span>}</div>
    </div>
  );
}

function TotalRow({label,value,accent='#0f172a',large=false}:{label:string;value:number;accent?:string;large?:boolean}) {
  return (
    <div className="grid grid-cols-12 px-4 py-3 bg-slate-50 border-t-2 border-slate-200">
      <div className="col-span-8 font-bold text-slate-700 text-sm">{label}</div>
      <div className={`col-span-4 text-right font-mono font-bold ${large?'text-base':'text-sm'}`} style={{color:accent}}>{formatRupiah(value)}</div>
    </div>
  );
}

function TabNeraca() {
  const tA=NERACA.aset.reduce((s,x)=>s+x.saldo,0);
  const tL=NERACA.liabilitas.reduce((s,x)=>s+x.saldo,0);
  const tE=NERACA.ekuitas.reduce((s,x)=>s+x.saldo,0);
  const bal=Math.abs(tA-(tL+tE))<1;
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <SectionHeader label="Aset" count={formatRupiah(tA)}/>
        {NERACA.aset.map(a=><AkunRow key={a.kode} {...a} accent="#0f766e"/>)}
        <TotalRow label="Total Aset" value={tA} accent="#0f766e" large/>
      </div>
      <div className="space-y-3">
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <SectionHeader label="Liabilitas (Kewajiban)" count={formatRupiah(tL)}/>
          {NERACA.liabilitas.map(a=><AkunRow key={a.kode} {...a} accent="#b91c1c"/>)}
          <TotalRow label="Total Liabilitas" value={tL} accent="#b91c1c"/>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <SectionHeader label="Ekuitas" count={formatRupiah(tE)}/>
          {NERACA.ekuitas.map(a=><AkunRow key={a.kode} {...a} accent="#6d28d9"/>)}
          <TotalRow label="Total Ekuitas" value={tE} accent="#6d28d9"/>
        </div>
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-semibold ${bal?'border-emerald-200 bg-emerald-50 text-emerald-700':'border-rose-200 bg-rose-50 text-rose-600'}`}>
          {bal?<CheckCircle size={16}/>:<AlertCircle size={16}/>}
          {bal?'Neraca Seimbang — Aset = Liabilitas + Ekuitas':'Neraca Tidak Seimbang — Periksa Entri Jurnal'}
        </div>
      </div>
    </div>
  );
}

function TabSD() {
  const [open,setOpen]=useState<string|null>('bahan');
  const tP=SD.pendapatan.reduce((s,x)=>s+x.saldo,0);
  const tBahan=SD.beban.bahan.reduce((s,x)=>s+x.saldo,0);
  const tSDM=SD.beban.sdm.reduce((s,x)=>s+x.saldo,0);
  const tOps=SD.beban.ops.reduce((s,x)=>s+x.saldo,0);
  const tB=tBahan+tSDM+tOps;
  const surplus=tP-tB;
  const GROUPS=[{k:'bahan',l:'Beban Bahan Makanan',t:tBahan,items:SD.beban.bahan},{k:'sdm',l:'Beban SDM & Insentif',t:tSDM,items:SD.beban.sdm},{k:'ops',l:'Beban Operasional Dapur',t:tOps,items:SD.beban.ops}];
  return (
    <div className="space-y-3">
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <SectionHeader label="Penerimaan Dana"/>
        {SD.pendapatan.map((p,i)=>(
          <div key={i} className="grid grid-cols-12 px-4 py-3 border-b border-slate-50 last:border-0 items-center">
            <div className="col-span-8 text-sm text-slate-700 font-medium">{p.nama}</div>
            <div className="col-span-4 text-right font-mono text-sm font-semibold text-emerald-700">+{formatRupiah(p.saldo)}</div>
          </div>
        ))}
        <TotalRow label="Total Penerimaan" value={tP} accent="#0f766e" large/>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <SectionHeader label="Pengeluaran"/>
        {GROUPS.map(g=>(
          <div key={g.k} className="border-b border-slate-100 last:border-0">
            <button onClick={()=>setOpen(open===g.k?null:g.k)} className="w-full grid grid-cols-12 px-4 py-3 items-center hover:bg-slate-50 transition-colors">
              <div className="col-span-8 flex items-center gap-2 text-sm font-semibold text-slate-700">
                {open===g.k?<ChevronDown size={13} className="text-slate-400"/>:<ChevronRight size={13} className="text-slate-400"/>}{g.l}
              </div>
              <div className="col-span-4 text-right font-mono text-sm font-semibold text-rose-600">−{formatRupiah(g.t)}</div>
            </button>
            {open===g.k && g.items.map((it,i)=>(
              <div key={i} className="grid grid-cols-12 px-4 py-2.5 bg-slate-50/50 border-t border-slate-100 items-center">
                <div className="col-span-8 text-xs text-slate-500 pl-5">└ {it.nama}</div>
                <div className="col-span-4 text-right font-mono text-xs text-slate-600">{it.saldo?formatRupiah(it.saldo):'—'}</div>
              </div>
            ))}
          </div>
        ))}
        <TotalRow label="Total Pengeluaran" value={tB} accent="#b91c1c" large/>
      </div>

      <div className={`flex items-center justify-between px-5 py-4 rounded-lg border-2 ${surplus>=0?'border-emerald-300 bg-emerald-50':'border-rose-300 bg-rose-50'}`}>
        <div className="flex items-center gap-3">
          {surplus>=0?<TrendingUp size={20} className="text-emerald-600"/>:<TrendingDown size={20} className="text-rose-600"/>}
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${surplus>=0?'text-emerald-600':'text-rose-500'}`}>{surplus>=0?'SURPLUS':'DEFISIT'} PERIODE INI</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{surplus>=0?'Penerimaan melebihi pengeluaran — kondisi keuangan sehat':'Pengeluaran melebihi penerimaan — perlu evaluasi anggaran'}</p>
          </div>
        </div>
        <span className={`text-2xl font-bold font-mono ${surplus>=0?'text-emerald-700':'text-rose-600'}`}>{surplus>=0?'+':''}{formatRupiah(surplus)}</span>
      </div>
    </div>
  );
}

function TabAK() {
  const masuk=104000000+5000000; const keluar=65500000+2750000+37250000+500000; const net=masuk-keluar;
  return (
    <div className="space-y-3">
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <SectionHeader label="Aktivitas Operasional"/>
        {[['Dana Operasional BGN','masuk',104000000],['Insentif Fasilitas SPPG','masuk',5000000],['Belanja Bahan Makanan','keluar',65500000],['Biaya Operasional Dapur','keluar',2750000],['Pembayaran Insentif Relawan','keluar',37250000],['Petty Cash','keluar',500000]].map(([l,t,v]:any,i)=>(
          <div key={i} className="grid grid-cols-12 px-4 py-3 border-b border-slate-50 last:border-0 items-center">
            <div className="col-span-8 text-sm text-slate-700">{l}</div>
            <div className={`col-span-4 text-right font-mono text-sm font-semibold ${t==='masuk'?'text-emerald-700':'text-rose-600'}`}>{t==='masuk'?'+':'−'}{formatRupiah(v)}</div>
          </div>
        ))}
        <div className={`grid grid-cols-12 px-4 py-3.5 border-t-2 border-slate-200 bg-slate-50 items-center`}>
          <div className="col-span-8 font-bold text-slate-700 text-sm">Arus Kas Bersih dari Aktivitas Operasional</div>
          <div className={`col-span-4 text-right font-mono font-bold text-base ${net>=0?'text-emerald-700':'text-rose-600'}`}>{net>=0?'+':''}{formatRupiah(net)}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[{l:'Saldo Awal Periode',v:7250000,c:'#475569'},{l:'Arus Kas Bersih',v:net,c:net>=0?'#0f766e':'#b91c1c'},{l:'Saldo Akhir Periode',v:7250000+net,c:'#0f172a'}].map((kpi,i)=>(
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{kpi.l}</p>
            <p className="text-xl font-bold font-mono" style={{color:kpi.c}}>{formatRupiah(kpi.v)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabTB() {
  const tD=TB_ROWS.reduce((s,r)=>s+r.debit,0); const tK=TB_ROWS.reduce((s,r)=>s+r.kredit,0);
  const bal=Math.abs(tD-tK)<1;
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="grid grid-cols-12 px-5 py-2.5 bg-slate-50 border-b border-slate-200">
        {['Kode','Nama Akun','Tipe','Total Debit (Rp)','Total Kredit (Rp)','Saldo (Rp)'].map((h,i)=>(
          <div key={h} className={`text-[10px] font-semibold text-slate-400 uppercase tracking-wider ${i===0?'col-span-1':i===1?'col-span-4':i===2?'col-span-2':'col-span-2'} ${i>=3?'text-right':''}`}>{h}</div>
        ))}
      </div>
      {TB_ROWS.map(r=>(
        <div key={r.kode} className="grid grid-cols-12 px-5 py-3.5 border-b border-slate-50 last:border-0 items-center hover:bg-slate-50/60 transition-colors">
          <div className="col-span-1 font-mono text-[11px] text-slate-400">{r.kode}</div>
          <div className="col-span-4 text-sm text-slate-800 font-medium">{r.nama}</div>
          <div className="col-span-2"><span className="text-[11px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-medium">{r.tipe}</span></div>
          <div className="col-span-2 text-right font-mono text-sm text-slate-700">{r.debit?formatRupiah(r.debit):<span className="text-slate-300">—</span>}</div>
          <div className="col-span-2 text-right font-mono text-sm text-slate-700">{r.kredit?formatRupiah(r.kredit):<span className="text-slate-300">—</span>}</div>
          <div className="col-span-1 text-right font-mono text-sm font-semibold text-slate-800">{formatRupiah(r.saldo)}</div>
        </div>
      ))}
      <div className="grid grid-cols-12 px-5 py-3.5 bg-slate-50 border-t-2 border-slate-300 items-center">
        <div className="col-span-7 font-bold text-slate-700 text-sm flex items-center gap-2">
          TOTAL
          <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${bal?'border-emerald-200 bg-emerald-50 text-emerald-700':'border-rose-200 bg-rose-50 text-rose-600'}`}>
            {bal?'Balance':'Tidak Balance'}
          </span>
        </div>
        <div className="col-span-2 text-right font-mono font-bold text-slate-900">{formatRupiah(tD)}</div>
        <div className="col-span-2 text-right font-mono font-bold text-slate-900">{formatRupiah(tK)}</div>
        <div className="col-span-1"/>
      </div>
    </div>
  );
}

function TabAVR() {
  const ST: Record<string,{label:string;c:string;bg:string;border:string}> = {
    on_track:{label:'Sesuai Rencana',c:'#0f766e',bg:'#f0fdfa',border:'#99f6e4'},
    over:    {label:'Over Budget',   c:'#b91c1c',bg:'#fef2f2',border:'#fecaca'},
    under:   {label:'Di Bawah Target',c:'#b45309',bg:'#fffbeb',border:'#fde68a'},
  };
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="grid grid-cols-12 px-5 py-2.5 bg-slate-50 border-b border-slate-200">
        {['Kategori Anggaran','Anggaran (Rp)','Realisasi (Rp)','Selisih (Rp)','Realisasi (%)','Status'].map((h,i)=>(
          <div key={h} className={`text-[10px] font-semibold text-slate-400 uppercase tracking-wider ${i===0?'col-span-3':i<=3?'col-span-2 text-right':i===4?'col-span-2':'col-span-1'}`}>{h}</div>
        ))}
      </div>
      {AVR.map((r,i)=>{
        const st=ST[r.status];
        const selisih=r.anggaran-r.real;
        return (
          <div key={i} className="grid grid-cols-12 px-5 py-4 border-b border-slate-50 last:border-0 items-center hover:bg-slate-50/50 transition-colors">
            <div className="col-span-3 text-sm font-medium text-slate-800">{r.nama}</div>
            <div className="col-span-2 text-right font-mono text-sm text-slate-600">{formatRupiah(r.anggaran)}</div>
            <div className="col-span-2 text-right font-mono text-sm font-semibold text-slate-800">{formatRupiah(r.real)}</div>
            <div className={`col-span-2 text-right font-mono text-sm font-semibold ${selisih>=0?'text-emerald-600':'text-rose-600'}`}>{selisih>=0?'+':''}{formatRupiah(selisih)}</div>
            <div className="col-span-2 px-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{width:`${Math.min(r.pct,100)}%`,background:r.pct>110?'#b91c1c':r.pct>90?'#0f766e':'#b45309'}}/>
                </div>
                <span className="text-[11px] font-mono font-semibold text-slate-600 w-8 text-right">{r.pct}%</span>
              </div>
            </div>
            <div className="col-span-1 flex justify-end">
              <span className="text-[10px] px-2 py-1 rounded border font-semibold whitespace-nowrap" style={{color:st.c,background:st.bg,borderColor:st.border}}>{st.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function buildSections(tab: string, periode: {mulai:string;selesai:string}): PreviewSection[] {
  const p = `${periode.mulai} s/d ${periode.selesai}`;
  if (tab === 'neraca') return [
    { title: 'ASET', rows: NERACA.aset.map(a=>({id:a.kode,label:a.nama,sublabel:a.sub,value:a.saldo,editable:true})), total:{label:'Total Aset',value:NERACA.aset.reduce((s,x)=>s+x.saldo,0),accent:'#0f766e'} },
    { title: 'LIABILITAS', rows: NERACA.liabilitas.map(a=>({id:a.kode,label:a.nama,sublabel:a.sub,value:a.saldo,editable:true})), total:{label:'Total Liabilitas',value:NERACA.liabilitas.reduce((s,x)=>s+x.saldo,0),accent:'#b91c1c'} },
    { title: 'EKUITAS', rows: NERACA.ekuitas.map(a=>({id:a.kode,label:a.nama,sublabel:a.sub,value:a.saldo,editable:true})), total:{label:'Total Ekuitas',value:NERACA.ekuitas.reduce((s,x)=>s+x.saldo,0),accent:'#6d28d9'} },
  ];
  if (tab === 'sd') {
    const tP = SD.pendapatan.reduce((s,x)=>s+x.saldo,0);
    const allBeban = [...SD.beban.bahan,...SD.beban.sdm,...SD.beban.ops];
    return [
      { title: 'PENERIMAAN', rows: SD.pendapatan.map((p,i)=>({id:'P'+i,label:p.nama,value:p.saldo,editable:true,colorClass:'positive'})), total:{label:'Total Penerimaan',value:tP,accent:'#0f766e'} },
      { title: 'PENGELUARAN', rows: allBeban.map((b,i)=>({id:'B'+i,label:b.nama,value:b.saldo,editable:true,colorClass:'negative'})), total:{label:'Total Pengeluaran',value:allBeban.reduce((s,x)=>s+x.saldo,0),accent:'#b91c1c'} },
      { title: 'HASIL', rows: [{id:'surplus',label:'Surplus / Defisit Periode',value:tP-allBeban.reduce((s,x)=>s+x.saldo,0),bold:true,editable:false,colorClass:tP-allBeban.reduce((s,x)=>s+x.saldo,0)>=0?'positive':'negative'}] },
    ];
  }
  if (tab === 'ak') return [
    { title: 'ARUS KAS MASUK', rows: [{id:'bgn',label:'Dana Operasional BGN',value:104000000,editable:true,colorClass:'positive'},{id:'ins',label:'Insentif Fasilitas SPPG',value:5000000,editable:true,colorClass:'positive'}], total:{label:'Total Masuk',value:109000000,accent:'#0f766e'} },
    { title: 'ARUS KAS KELUAR', rows: [{id:'bhn',label:'Belanja Bahan Makanan',value:65500000,editable:true,colorClass:'negative'},{id:'ops',label:'Biaya Operasional',value:2750000,editable:true,colorClass:'negative'},{id:'sdm',label:'Insentif Relawan',value:37250000,editable:true,colorClass:'negative'},{id:'pc',label:'Petty Cash',value:500000,editable:true,colorClass:'negative'}], total:{label:'Total Keluar',value:106000000,accent:'#b91c1c'} },
    { title: 'RINGKASAN', rows: [{id:'net',label:'Arus Kas Bersih',value:3000000,bold:true,editable:false,colorClass:'positive'},{id:'awal',label:'Saldo Awal Periode',value:7250000,editable:true},{id:'akhir',label:'Saldo Akhir Periode',value:10250000,bold:true,editable:false,colorClass:'positive'}] },
  ];
  if (tab === 'tb') return [{ title: 'NERACA SALDO', rows: TB_ROWS.map(r=>({id:r.kode,label:r.nama,sublabel:r.tipe,value:r.saldo,editable:true})), total:{label:'Saldo Bersih',value:TB_ROWS.reduce((s,r)=>s+r.saldo,0)} }];
  if (tab === 'avr') return [{ title: 'ANGGARAN VS REALISASI', rows: AVR.map((r,i)=>({id:'avr'+i,label:r.nama,sublabel:`Anggaran: ${formatRupiah(r.anggaran)} · Realisasi: ${r.pct}%`,value:r.real,editable:true,colorClass:r.status==='over'?'negative':r.status==='under'?'neutral':'positive'})), total:{label:'Total Realisasi',value:AVR.reduce((s,r)=>s+r.real,0)} }];
  return [];
}

export default function LaporanKeuangan() {
  const [tab,setTab]=useState('neraca');
  const [periode,setPeriode]=useState({mulai:'2026-05-01',selesai:'2026-05-31'});
  const [preview,setPreview]=useState(false);
  const CONTENT: Record<string,React.ReactNode> = {neraca:<TabNeraca/>,sd:<TabSD/>,ak:<TabAK/>,tb:<TabTB/>,avr:<TabAVR/>};
  const tabMeta = TABS.find(t=>t.id===tab)!;

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <FileBarChart2 size={11}/><span>Keuangan</span><ChevronRight size={9}/><span className="text-slate-600">Laporan Keuangan</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Laporan Keuangan</h1>
          <p className="text-sm text-slate-500 mt-0.5">Dibuat otomatis — tidak memerlukan input manual</p>
        </div>
        <button onClick={()=>setPreview(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-300 bg-white rounded-lg hover:bg-slate-50 text-slate-700 transition-colors shadow-sm">
          <Eye size={13}/> Preview &amp; Cetak
        </button>
      </div>

      <div className="flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-lg mb-5 text-xs text-blue-700">
        <Info size={13} className="flex-shrink-0 text-blue-400"/>
        <span>Semua angka di laporan ini dikalkulasi otomatis dari jurnal transaksi yang tercatat di sistem.</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-end mb-5 p-4 bg-white border border-slate-200 rounded-lg">
        {[{l:'Dari Tanggal',k:'mulai'},{l:'Sampai Tanggal',k:'selesai'}].map(f=>(
          <div key={f.k}>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">{f.l}</label>
            <input type="date" value={(periode as any)[f.k]} onChange={e=>setPeriode(p=>({...p,[f.k]:e.target.value}))}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-slate-400 font-mono bg-slate-50"/>
          </div>
        ))}
        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
          <RefreshCw size={12}/> Perbarui
        </button>
      </div>

      <div className="flex border-b border-slate-200 mb-5 overflow-x-auto">
        {TABS.map(t=>{
          const Icon=t.icon; const act=tab===t.id;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap -mb-px ${act?'border-slate-900 text-slate-900':'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
              <Icon size={13}/>{t.label}
            </button>
          );
        })}
      </div>

      {CONTENT[tab]}

      <LaporanPreviewModal
        open={preview}
        onClose={()=>setPreview(false)}
        judul={tabMeta.label}
        subJudul={`Laporan Keuangan SPPG — ${tab.toUpperCase()}`}
        periode={`${periode.mulai} s/d ${periode.selesai}`}
        sppgNama="SPPG Contoh Berkah"
        sections={buildSections(tab,periode)}
        onSave={(s)=>{ console.log('Koreksi disimpan',s); }}
      />
    </div>
  );
}
