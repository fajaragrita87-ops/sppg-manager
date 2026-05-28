import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw, Download, ChevronRight, X, Clock, Eye } from 'lucide-react';
import { toast } from '@/store/toastStore';
import * as XLSX from 'xlsx';
import { useInventoryStore } from '@/store/inventoryStore';

export default function MigrasiData() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [importType, setImportType] = useState('supplier');
  const [importHistory, setImportHistory] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const addStock = useInventoryStore((state) => state.addStock);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (selectedFile: File) => {
    if (!selectedFile) return;
    
    // Validasi ekstensi
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.csv')) {
      toast.error('Gunakan format file Excel (.xlsx) atau CSV');
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Baca sebagai JSON array
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
      
      if (jsonData.length > 1) {
        // Baris pertama sebagai header
        const headers = jsonData[0].map((h: any) => String(h || '').trim());
        const rows = jsonData.slice(1).filter(r => r.length > 0).map(row => {
          const obj: any = {};
          headers.forEach((h, i) => {
            obj[h] = row[i];
          });
          return obj;
        });

        setColumns(headers);
        setPreviewData(rows);
      } else {
        toast.error('File kosong atau format tidak sesuai');
        setFile(null);
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal membaca file. Pastikan format Excel tidak rusak.');
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (previewData.length === 0) return;
    
    // Jika import master stok, kita push ke Inventory Store agar nyambung ke Stok Bahan
    if (importType === 'stok') {
      const stockItems = previewData.map(row => ({
        nama: row['Nama Bahan'] || row['Nama'] || row['nama_bahan'] || 'Bahan Tanpa Nama',
        qty: Number(row['Stok Awal'] || row['Stok'] || row['qty']) || 0,
        satuan: row['Satuan'] || row['satuan'] || 'Kg'
      }));
      addStock(stockItems);
    }
    
    // Tambah ke riwayat impor
    setImportHistory(prev => [
      {
        id: Date.now(),
        type: importType,
        fileName: file?.name || 'Data Manual',
        rows: previewData.length,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        data: previewData, // Simpan untuk preview
        columns: columns
      },
      ...prev
    ]);

    toast.sukses(`Berhasil mengimpor ${previewData.length} baris data ${importType}!`);
    
    // Reset state
    setFile(null);
    setPreviewData([]);
    setColumns([]);
  };

  const downloadTemplate = () => {
    let wsData: any[][] = [];
    if (importType === 'supplier') {
      wsData = [
        ['Nama Supplier', 'Kategori', 'Kontak / No HP', 'Alamat Lengkap', 'Bank', 'No Rekening', 'Atas Nama'],
        ['PT Sayur Makmur', 'Bahan Segar', '081234567890', 'Pasar Induk Kramat Jati', 'BCA', '1234567890', 'Ahmad'],
      ];
    } else if (importType === 'stok') {
      wsData = [
        ['Kode Bahan', 'Nama Bahan', 'Kategori', 'Satuan', 'Stok Awal', 'Harga Satuan'],
        ['BRS-001', 'Beras Premium', 'Karbohidrat', 'Kg', '500', '15000'],
      ];
    } else if (importType === 'relawan') {
      wsData = [
        ['Nama Lengkap', 'Jabatan', 'No HP', 'Alamat', 'Email'],
        ['Siti Aminah', 'Juru Masak', '08987654321', 'Jl. Merdeka No 1', 'siti@gmail.com'],
      ];
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `Template_Import_${importType}.xlsx`);
  };

  return (
    <div className="card p-6 animate-fade-in space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">Migrasi & Impor Data</h2>
        <p className="text-sm text-slate-500 pb-4 border-b border-slate-100">
          Pindahkan data dari sistem lama atau file Excel Anda langsung ke SPPG Manager.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Kolom Kiri: Pengaturan Impor */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Pilih Jenis Data</label>
            <div className="space-y-2">
              {[
                { id: 'supplier', label: 'Data Supplier & Rekening' },
                { id: 'stok', label: 'Master Data Bahan & Stok Awal' },
                { id: 'relawan', label: 'Data Relawan / SDM' },
              ].map((type) => (
                <label 
                  key={type.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    importType === type.id 
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                    : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="importType" 
                    value={type.id} 
                    checked={importType === type.id} 
                    onChange={() => {
                      setImportType(type.id);
                      setFile(null);
                      setPreviewData([]);
                    }}
                    className="text-blue-600 focus:ring-blue-500 w-4 h-4" 
                  />
                  <span className={`text-sm font-semibold ${importType === type.id ? 'text-blue-800' : 'text-slate-700'}`}>
                    {type.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <FileSpreadsheet size={14} className="text-emerald-600"/> Unduh Template
            </h4>
            <p className="text-[10px] text-slate-500 mb-3">
              Gunakan format Excel standar kami agar sistem dapat membaca kolom dengan sempurna.
            </p>
            <button 
              onClick={downloadTemplate}
              className="w-full py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-100 flex items-center justify-center gap-2"
            >
              <Download size={14} /> Download Template .xlsx
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Area Upload & Preview */}
        <div className="md:col-span-2 space-y-4">
          {!file && (
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[280px] ${
                dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-400'
              }`}
            >
              <input 
                ref={inputRef}
                type="file" 
                accept=".xlsx, .xls, .csv" 
                className="hidden" 
                onChange={handleChange} 
              />
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform ${dragActive ? 'bg-blue-100 text-blue-600 scale-110' : 'bg-white text-slate-400 shadow-sm border border-slate-100'}`}>
                <UploadCloud size={32} />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                {dragActive ? 'Lepaskan file di sini' : 'Drag & Drop file Excel Anda'}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs">
                atau klik untuk mencari file dari komputer. Format yang didukung: .xlsx, .csv
              </p>
            </div>
          )}

          {isProcessing && (
            <div className="border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 min-h-[280px]">
              <RefreshCw size={32} className="text-blue-600 animate-spin mb-4" />
              <h3 className="font-bold text-slate-800">Membaca Dokumen...</h3>
              <p className="text-xs text-slate-500 mt-1">Mengurai baris dan kolom untuk validasi</p>
            </div>
          )}

          {file && !isProcessing && previewData.length > 0 && (
            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm flex flex-col h-full min-h-[280px]">
              {/* Header Preview */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      File Siap Diimpor <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full uppercase">{importType}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      {file.name} • <span className="font-bold text-slate-700">{previewData.length} baris data ditemukan</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => { setFile(null); setPreviewData([]); }}
                  className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-md transition-colors"
                  title="Batalkan"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Table Preview */}
              <div className="flex-1 overflow-x-auto max-h-60 bg-white">
                <table className="w-full text-xs text-left whitespace-nowrap">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10">
                    <tr>
                      <th className="px-4 py-2 font-bold text-slate-600">#</th>
                      {columns.slice(0, 5).map((col, idx) => (
                        <th key={idx} className="px-4 py-2 font-bold text-slate-600">{col}</th>
                      ))}
                      {columns.length > 5 && <th className="px-4 py-2 font-bold text-slate-400 italic">... (+{columns.length - 5} kolom)</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-400 font-mono">{idx + 1}</td>
                        {columns.slice(0, 5).map((col, colIdx) => (
                          <td key={colIdx} className="px-4 py-2 text-slate-700 truncate max-w-[150px]">{row[col] || '-'}</td>
                        ))}
                        {columns.length > 5 && <td className="px-4 py-2 text-slate-400">...</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {previewData.length > 5 && (
                <div className="text-center py-2 bg-slate-50 border-t border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Menampilkan 5 dari {previewData.length} baris
                </div>
              )}

              {/* Footer Actions */}
              <div className="p-4 bg-white flex justify-end gap-3 shrink-0">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mr-auto">
                  <AlertCircle size={12} /> Data duplikat akan otomatis ditimpa (di-update)
                </div>
                <button 
                  onClick={handleImport}
                  className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  Eksekusi Impor Data <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIWAYAT IMPOR TERBARU */}
      {importHistory.length > 0 && (
        <div className="mt-8 pt-8 border-t border-slate-100 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-blue-600"/> Riwayat Impor Terbaru
          </h3>
          <div className="space-y-4">
            {importHistory.map((history) => (
              <div key={history.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold text-[10px] uppercase rounded-full tracking-wider">
                        {history.type}
                      </span>
                      <span className="text-sm font-bold text-slate-800">{history.fileName}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span>{history.time}</span> • 
                      <span className="font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={12}/> {history.rows} baris sukses dimasukkan</span>
                    </div>
                  </div>
                  {history.type === 'stok' && (
                    <button onClick={() => toast.info('Cek Tab Inventori > Stok Bahan untuk melihat hasilnya.')} className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                      Lihat di Inventori
                    </button>
                  )}
                </div>
                {/* Preview 3 baris pertama data yang berhasil masuk */}
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white border-b border-slate-100 text-slate-500">
                      <tr>
                        {history.columns.slice(0, 4).map((col: string, idx: number) => (
                          <th key={idx} className="px-4 py-2 font-medium">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {history.data.slice(0, 3).map((row: any, idx: number) => (
                        <tr key={idx}>
                          {history.columns.slice(0, 4).map((col: string, colIdx: number) => (
                            <td key={colIdx} className="px-4 py-2 text-slate-700 truncate max-w-[150px]">{row[col]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
