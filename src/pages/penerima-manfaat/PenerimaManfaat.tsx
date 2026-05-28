import React, { useState, useMemo } from 'react';
import { Plus, Search, School, Users, Activity, Edit2, Trash2, PieChart, X, Save, FileText, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

interface Satdik {
  id: string;
  nama: string;
  jenjang: string;
  jumlahSiswa: number;
  pjNama: string;
  pjHp: string;
  jenis: 'Sekolah' | 'Posyandu';
  distribusi: string;
}

export default function PenerimaManfaat() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'list' | 'rekap'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuthStore();
  const isManagement = user?.role === 'owner' || user?.role === 'kasppg' || user?.role === 'pengawas_keuangan';

  const [showForm, setShowForm] = useState(false);
  const [editingSatdik, setEditingSatdik] = useState<Satdik | null>(null);
  
  const [formData, setFormData] = useState<Partial<Satdik>>({
    nama: '',
    jenjang: 'SD/MI',
    jumlahSiswa: 0,
    pjNama: '',
    pjHp: '',
    jenis: 'Sekolah',
    distribusi: 'Di sekolah'
  });

  // State Data
  const [satdiks, setSatdiks] = useState<Satdik[]>([
    { id: '1', nama: 'SDN 01 Merdeka', jenjang: 'SD/MI', jumlahSiswa: 350, pjNama: 'Bpk. Budi', pjHp: '08123456789', jenis: 'Sekolah', distribusi: 'Di sekolah' },
    { id: '2', nama: 'TK Pertiwi', jenjang: 'TK/RA', jumlahSiswa: 45, pjNama: 'Ibu Siti', pjHp: '08987654321', jenis: 'Sekolah', distribusi: 'Di sekolah' },
    { id: '3', nama: 'Posyandu Melati', jenjang: 'Posyandu', jumlahSiswa: 30, pjNama: 'Ibu Ani', pjHp: '08112233445', jenis: 'Posyandu', distribusi: 'Di posyandu' },
  ]);

  const handleDelete = (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data ${nama}?`)) {
      setSatdiks(satdiks.filter(s => s.id !== id));
      import('@/store/toastStore').then(({ toast }) => toast.sukses(`Data ${nama} berhasil dihapus dari daftar penerima manfaat.`));
    }
  };

  const handleEdit = (satdik: Satdik) => {
    setEditingSatdik(satdik);
    setFormData(satdik);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingSatdik(null);
    setFormData({
      nama: '', jenjang: 'SD/MI', jumlahSiswa: 0, pjNama: '', pjHp: '', jenis: 'Sekolah', distribusi: 'Di sekolah'
    });
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.pjNama) {
      import('@/store/toastStore').then(({ toast }) => toast.error('Nama Satdik dan Nama PJ wajib diisi'));
      return;
    }

    if (editingSatdik) {
      setSatdiks(satdiks.map(s => s.id === editingSatdik.id ? { ...s, ...formData } as Satdik : s));
      import('@/store/toastStore').then(({ toast }) => toast.sukses(`Data ${formData.nama} berhasil diperbarui.`));
    } else {
      const newSatdik: Satdik = {
        ...formData,
        id: Date.now().toString(),
      } as Satdik;
      setSatdiks([...satdiks, newSatdik]);
      import('@/store/toastStore').then(({ toast }) => toast.sukses(`Data ${formData.nama} berhasil ditambahkan.`));
    }
    setShowForm(false);
  };

  // ── Juknis BGN: tiered insentif PJ Satdik per periode ──
  const hitungInsentifPJSatdik = (jumlahSiswa: number): number => {
    if (jumlahSiswa <= 100)  return 100_000;
    if (jumlahSiswa <= 300)  return 200_000;
    if (jumlahSiswa <= 500)  return 300_000;
    if (jumlahSiswa <= 750)  return 400_000;
    return 500_000;
  };

  // ── Search filter (BUG FIX: apply searchTerm) ──
  const filteredSatdiks = useMemo(() =>
    satdiks.filter(s =>
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.pjNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.jenjang.toLowerCase().includes(searchTerm.toLowerCase())
    ), [satdiks, searchTerm]);

  // ── rekapKategori derived dari state (bukan hardcoded) ──
  const rekapKategori = useMemo(() => {
    const map: Record<string, { jumlah: number; unit: number; pagu: number }> = {
      'PAUD / TK':          { jumlah: 0, unit: 0, pagu: 15000 },
      'SD / MI':            { jumlah: 0, unit: 0, pagu: 15000 },
      'SMP / MTs':          { jumlah: 0, unit: 0, pagu: 15000 },
      'SMA / MA / SMK':     { jumlah: 0, unit: 0, pagu: 15000 },
      'Ibu Hamil / Balita': { jumlah: 0, unit: 0, pagu: 20000 },
    };
    satdiks.forEach(s => {
      if (s.jenjang.includes('PAUD') || s.jenjang.includes('TK'))   { map['PAUD / TK'].jumlah += s.jumlahSiswa; map['PAUD / TK'].unit += 1; }
      else if (s.jenjang.includes('SD') || s.jenjang.includes('MI')) { map['SD / MI'].jumlah += s.jumlahSiswa; map['SD / MI'].unit += 1; }
      else if (s.jenjang.includes('SMP') || s.jenjang.includes('MTs')) { map['SMP / MTs'].jumlah += s.jumlahSiswa; map['SMP / MTs'].unit += 1; }
      else if (s.jenjang.includes('SMA') || s.jenjang.includes('SMK')) { map['SMA / MA / SMK'].jumlah += s.jumlahSiswa; map['SMA / MA / SMK'].unit += 1; }
      else if (s.jenjang.includes('Posyandu') || s.jenis === 'Posyandu') { map['Ibu Hamil / Balita'].jumlah += s.jumlahSiswa; map['Ibu Hamil / Balita'].unit += 1; }
    });
    return Object.entries(map).map(([kategori, v]) => ({ kategori, ...v }));
  }, [satdiks]);

  const totalSiswa = rekapKategori.reduce((acc, curr) => acc + curr.jumlah, 0);
  const kapasitasMaks = 3000;
  const totalNilaiHarian = rekapKategori.reduce((acc, curr) => acc + (curr.jumlah * curr.pagu), 0);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Penerima Manfaat</h1>
        <p className="text-slate-500 text-sm">Kelola data satuan pendidikan &amp; posyandu penerima MBG.</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {isManagement && (
          <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Tambah Satdik
          </button>
        )}
        <button
          onClick={() => navigate('/laporan')}
          className="btn-secondary text-sm flex items-center gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <FileText size={14}/> Lampiran 30a <ArrowRight size={13}/>
        </button>
      </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${
            activeTab === 'list' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Satuan Pendidikan & Posyandu
        </button>
        <button
          onClick={() => setActiveTab('rekap')}
          className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${
            activeTab === 'rekap' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Rekap Per Kategori
        </button>
      </div>

      {activeTab === 'list' ? (
        <div className="space-y-6">
          {/* SEARCH & FILTERS */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Cari nama satdik atau PJ..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-700">Nama Satdik</th>
                  <th className="px-6 py-4 font-bold text-slate-700">Jenjang</th>
                  <th className="px-6 py-4 font-bold text-slate-700">Siswa</th>
                  <th className="px-6 py-4 font-bold text-slate-700">PJ Satdik</th>
                  <th className="px-6 py-4 font-bold text-slate-700">Distribusi</th>
                  <th className="px-6 py-4 font-bold text-slate-700">Estimasi PJ</th>
                  <th className="px-6 py-4 text-right font-bold text-slate-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSatdiks.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-400 text-sm">Tidak ada data yang cocok dengan pencarian.</td></tr>
                ) : filteredSatdiks.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{s.nama}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        s.jenis === 'Sekolah' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {s.jenjang}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">{s.jumlahSiswa.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900">{s.pjNama}</div>
                      <div className="text-[11px] text-slate-400">{s.pjHp}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{s.distribusi}</td>
                    <td className="px-6 py-4 text-blue-600 font-bold text-xs">
                      Rp {hitungInsentifPJSatdik(s.jumlahSiswa).toLocaleString('id-ID')}<span className="text-slate-400 font-normal">/periode</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isManagement ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(s)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Data"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(s.id, s.nama)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Data"><Trash2 size={16} /></button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">View Only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-700">Kategori Penerima</th>
                    <th className="px-6 py-4 font-bold text-slate-700 text-center">Jumlah</th>
                    <th className="px-6 py-4 font-bold text-slate-700 text-center">Unit</th>
                    <th className="px-6 py-4 font-bold text-slate-700 text-right">Pagu / Hari</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rekapKategori.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{r.kategori}</td>
                      <td className="px-6 py-4 text-center font-bold">{r.jumlah}</td>
                      <td className="px-6 py-4 text-center text-slate-500">{r.unit} Unit</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        Rp {(r.jumlah * r.pagu).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200">
                  <tr>
                    <td className="px-6 py-4 text-slate-900">Total Keseluruhan</td>
                    <td className="px-6 py-4 text-center text-blue-600 text-lg">{totalSiswa.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-center text-slate-500">{satdiks.length} Unit</td>
                    <td className="px-6 py-4 text-right text-blue-600">
                      Rp {totalNilaiHarian.toLocaleString('id-ID')}<span className="text-xs font-normal text-slate-400">/hari</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity size={18} className="text-blue-600" /> Kapasitas Produksi
              </h3>
              <div className="mb-4">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-500 uppercase tracking-wider">Pemanfaatan</span>
                  <span className={totalSiswa > kapasitasMaks ? 'text-red-600' : 'text-blue-600'}>
                    {totalSiswa} / {kapasitasMaks} Porsi
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${totalSiswa > kapasitasMaks ? 'bg-red-500' : 'bg-blue-600'}`}
                    style={{ width: `${(totalSiswa / kapasitasMaks) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                * Kapasitas maksimum dapur SPPG sesuai standar infrastruktur adalah 3.000 porsi per hari.
              </p>
            </div>

            <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-100 text-white">
              <PieChart className="mb-4 opacity-50" size={32} />
              <h3 className="font-bold mb-1">Target Porsi Aktif</h3>
              <p className="text-2xl font-black mb-4">{totalSiswa.toLocaleString('id-ID')} Orang</p>
              <p className="text-xs text-blue-100 mb-4">
                Data ini menjadi landasan perhitungan kebutuhan bahan baku dan porsi harian di Lampiran 30a.
              </p>
              <button
                onClick={() => navigate('/laporan')}
                className="w-full bg-white/20 hover:bg-white/30 text-white text-sm font-bold py-2 px-4 rounded-xl transition flex items-center justify-center gap-2"
              >
                <FileText size={14}/> Export Lampiran 30a
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM TAMBAH/EDIT */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                {editingSatdik ? <Edit2 size={18} className="text-blue-600"/> : <Plus size={18} className="text-blue-600"/>}
                {editingSatdik ? 'Edit Data Penerima Manfaat' : 'Tambah Penerima Manfaat Baru'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nama Satdik / Posyandu</label>
                  <input type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="input w-full" placeholder="Cth: SDN 01 Merdeka" required />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Jenis Instansi</label>
                  <select value={formData.jenis} onChange={e => setFormData({...formData, jenis: e.target.value as any})} className="input w-full">
                    <option value="Sekolah">Sekolah / Madrasah</option>
                    <option value="Posyandu">Posyandu</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Jenjang</label>
                  <select value={formData.jenjang} onChange={e => setFormData({...formData, jenjang: e.target.value})} className="input w-full">
                    <option value="PAUD/TK">PAUD / TK</option>
                    <option value="SD/MI">SD / MI</option>
                    <option value="SMP/MTs">SMP / MTs</option>
                    <option value="SMA/SMK">SMA / SMK / MA</option>
                    <option value="Posyandu">Posyandu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Jumlah Penerima (Siswa)</label>
                  <input type="number" min="0" value={formData.jumlahSiswa} onChange={e => setFormData({...formData, jumlahSiswa: Number(e.target.value)})} className="input w-full" required />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Metode Distribusi</label>
                  <select value={formData.distribusi} onChange={e => setFormData({...formData, distribusi: e.target.value})} className="input w-full">
                    <option value="Di sekolah">Makan di Sekolah</option>
                    <option value="Di posyandu">Makan di Posyandu</option>
                    <option value="Ambil ke Dapur">Ambil Sendiri ke Dapur</option>
                  </select>
                </div>

                <div className="col-span-2 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Kontak Penanggung Jawab (PJ)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Nama PJ</label>
                      <input type="text" value={formData.pjNama} onChange={e => setFormData({...formData, pjNama: e.target.value})} className="input w-full" placeholder="Cth: Bpk. Budi" required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Nomor HP/WA</label>
                      <input type="text" value={formData.pjHp} onChange={e => setFormData({...formData, pjHp: e.target.value})} className="input w-full" placeholder="08..." required />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors">
                  Batal
                </button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save size={16}/> Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
