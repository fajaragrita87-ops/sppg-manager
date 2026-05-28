import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Pastikan untuk menginstal dependensi sebelum digunakan:
// npm install jspdf jspdf-autotable

/**
 * ─── HELPER: ADD HEADER ────────────────────────────────────────────────────────
 * Menambahkan header standar dokumen BGN di setiap halaman
 */
function addHeader(doc: jsPDF, sppg: any, judulLampiran: string, periode: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Teks Kiri: Nama SPPG
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`SPPG: ${sppg?.nama || 'NAMA SPPG BELUM DIATUR'}`, 14, 15);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Alamat: ${sppg?.alamat || '-'}`, 14, 20);
  
  // Teks Kanan: Lampiran
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(judulLampiran, pageWidth - 14, 15, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Periode: ${periode}`, pageWidth - 14, 20, { align: 'right' });

  // Garis Pemisah
  doc.setLineWidth(0.5);
  doc.line(14, 25, pageWidth - 14, 25);
}

/**
 * ─── 1. LAMPIRAN 30a (Laporan Harian) ──────────────────────────────────────────
 */
export function generateLampiran30a(data: { sppg: any, laporan: any }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const { sppg, laporan } = data;
  const tanggalLaporan = laporan.tanggal || new Date().toISOString().split('T')[0];

  addHeader(doc, sppg, 'Lampiran 30a - Juknis Tata Kelola MBG TA 2026', tanggalLaporan);

  // Judul Laporan
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN PENGGUNAAN DANA HARIAN', doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });

  let startY = 45;

  // TABEL PENERIMA MANFAAT
  doc.setFontSize(11);
  doc.text('A. REALISASI PENERIMA MANFAAT', 14, startY);
  
  const pmData = laporan.penerima_manfaat || { tk: 0, sd: 0, smp: 0, sma: 0, lainnya: 0 };
  const totalPm = Object.values(pmData).reduce((a: any, b: any) => a + Number(b), 0);

  autoTable(doc, {
    startY: startY + 5,
    head: [['Kategori Penerima Manfaat', 'Jumlah Porsi']],
    body: [
      ['PAUD / TK', pmData.tk],
      ['SD / MI', pmData.sd],
      ['SMP / MTs', pmData.smp],
      ['SMA / MA / SMK', pmData.sma],
      ['Bumil & Posyandu', pmData.lainnya],
    ],
    foot: [['TOTAL PORSI', totalPm]],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [236, 240, 241], textColor: 0, fontStyle: 'bold' }
  });

  startY = (doc as any).lastAutoTable.finalY + 10;

  // TABEL PENGGUNAAN DANA
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('B. PENGGUNAAN DANA KEUANGAN', 14, startY);

  const keu = laporan.keuangan || { bahanBaku: 0, operasional: 0, insentif: 0, saldoVA: 0 };
  const totalKeu = keu.bahanBaku + keu.operasional + keu.insentif;

  autoTable(doc, {
    startY: startY + 5,
    head: [['Uraian Pengeluaran', 'Jumlah (Rp)']],
    body: [
      ['Belanja Bahan Baku', `Rp ${keu.bahanBaku.toLocaleString('id-ID')}`],
      ['Biaya Operasional', `Rp ${keu.operasional.toLocaleString('id-ID')}`],
      ['Insentif Relawan', `Rp ${keu.insentif.toLocaleString('id-ID')}`],
    ],
    foot: [
      ['TOTAL PENGELUARAN HARI INI', `Rp ${totalKeu.toLocaleString('id-ID')}`],
      ['SALDO VIRTUAL ACCOUNT', `Rp ${(keu.saldoVA || 0).toLocaleString('id-ID')}`]
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [39, 174, 96], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [236, 240, 241], textColor: 0, fontStyle: 'bold' }
  });

  // TANDA TANGAN
  startY = (doc as any).lastAutoTable.finalY + 20;
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Telah diperiksa dan dikunci pada: ${laporan.dikunci_at || new Date().toLocaleString('id-ID')}`, 14, startY);

  startY += 15;
  doc.text('Pengawas Keuangan SPPG', 40, startY, { align: 'center' });
  doc.text('Kepala SPPG', pageWidth - 40, startY, { align: 'center' });

  startY += 25;
  doc.setFont('helvetica', 'bold');
  doc.text(sppg?.nama_pengawas_keuangan || '(......................................)', 40, startY, { align: 'center' });
  doc.text(sppg?.nama_kepala_sppg || '(......................................)', pageWidth - 40, startY, { align: 'center' });

  doc.save(`LaporanHarian_${tanggalLaporan}_${sppg?.nama?.replace(/\s+/g, '') || 'SPPG'}.pdf`);
}

/**
 * ─── 2. LAMPIRAN 30c (Laporan 2 Mingguan) ──────────────────────────────────────
 */
export function generateLampiran30c(data: { sppg: any, laporanHarian: any[], periode: string }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const { sppg, laporanHarian, periode } = data;

  addHeader(doc, sppg, 'Lampiran 30c - Laporan Realisasi Penggunaan Dana Per 2 Minggu', periode);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN REALISASI PENGGUNAAN DANA PER 2 MINGGU', doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });

  let startY = 45;

  // A. REKAPITULASI KEUANGAN
  doc.setFontSize(11);
  doc.text('A. REKAPITULASI KEUANGAN', 14, startY);

  // Kalkulasi agregat (mock logic)
  let tBahan = 0, tOps = 0, tInsentif = 0;
  laporanHarian.forEach(l => {
    tBahan += l.keuangan?.bahanBaku || 0;
    tOps += l.keuangan?.operasional || 0;
    tInsentif += l.keuangan?.insentif || 0;
  });
  const tKeluar = tBahan + tOps + tInsentif;
  const tMasuk = 150000000; // Contoh penerimaan
  const sisa = tMasuk - tKeluar;

  autoTable(doc, {
    startY: startY + 5,
    body: [
      ['A. Penerimaan dari BGN', `Rp ${tMasuk.toLocaleString('id-ID')}`],
      ['B. Pengeluaran:', ''],
      ['   1. Bahan Baku', `Rp ${tBahan.toLocaleString('id-ID')}`],
      ['   2. Biaya Operasional', `Rp ${tOps.toLocaleString('id-ID')}`],
      ['   3. Insentif Fasilitas & Relawan', `Rp ${tInsentif.toLocaleString('id-ID')}`],
      ['TOTAL PENGELUARAN', `Rp ${tKeluar.toLocaleString('id-ID')}`],
      ['C. SISA DANA', `Rp ${sisa.toLocaleString('id-ID')}`]
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } },
  });

  startY = (doc as any).lastAutoTable.finalY + 10;

  // B. REALISASI PENERIMA MANFAAT
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('B. REALISASI PENERIMA MANFAAT HARIAN', 14, startY);

  const pmRows = laporanHarian.map(l => {
    const p = l.penerima_manfaat || {};
    const total = (p.paud||0) + (p.sd1||0) + (p.sd4||0) + (p.smp||0) + (p.sma||0) + (p.bumil||0);
    return [l.tanggal, p.paud||0, p.sd1||0, p.sd4||0, p.smp||0, p.sma||0, p.bumil||0, total];
  });

  const grandTotal = pmRows.reduce((a, b) => a + (b[7] as number), 0);

  autoTable(doc, {
    startY: startY + 5,
    head: [['Tanggal', 'PAUD/TK', 'SD 1-3', 'SD 4-6', 'SMP', 'SMA', '3B/Bumil', 'Total Harian']],
    body: pmRows,
    foot: [['TOTAL KESELURUHAN', '', '', '', '', '', '', grandTotal]],
    theme: 'grid',
    styles: { fontSize: 9, halign: 'center' },
    headStyles: { fillColor: [41, 128, 185] }
  });

  // TANDA TANGAN
  startY = (doc as any).lastAutoTable.finalY + 20;
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.text('Kepala SPPG', pageWidth / 3, startY, { align: 'center' });
  doc.text('Perwakilan Yayasan', (pageWidth / 3) * 2, startY, { align: 'center' });

  startY += 25;
  doc.text(sppg?.nama_kepala_sppg || '(......................................)', pageWidth / 3, startY, { align: 'center' });
  doc.text('(......................................)', (pageWidth / 3) * 2, startY, { align: 'center' });

  doc.save(`Laporan2Mingguan_${periode}_${sppg?.nama?.replace(/\s+/g, '') || 'SPPG'}.pdf`);
}

/**
 * ─── 3. LAMPIRAN 30l (Nominatif Insentif Relawan) ──────────────────────────────
 */
export function generateLampiran30l(data: { sppg: any, insentif: any[], periode: string }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const { sppg, insentif, periode } = data;

  addHeader(doc, sppg, 'Lampiran 30l - Nominatif Insentif Relawan', periode);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DAFTAR NOMINATIF PENERIMA INSENTIF RELAWAN', doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });

  const tableData = insentif.map((r, i) => [
    i + 1,
    r.nama,
    r.nik,
    r.jabatan,
    `${r.hari_hadir} Hari`,
    `Rp ${r.rate.toLocaleString('id-ID')}`,
    `Rp ${(r.hari_hadir * r.rate).toLocaleString('id-ID')}`,
    '' // Kolom TTD kosong
  ]);

  const totalInsentif = insentif.reduce((a, b) => a + (b.hari_hadir * b.rate), 0);

  autoTable(doc, {
    startY: 45,
    head: [['No', 'Nama Relawan', 'NIK', 'Jabatan', 'Kehadiran', 'Rate/Hari', 'Total Diterima', 'Tanda Tangan']],
    body: tableData,
    foot: [['', 'TOTAL KESELURUHAN', '', '', '', '', `Rp ${totalInsentif.toLocaleString('id-ID')}`, '']],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      4: { halign: 'center' },
      5: { halign: 'right' },
      6: { halign: 'right', fontStyle: 'bold' },
      7: { cellWidth: 30 } // Space for signature
    },
    didDrawCell: (data) => {
      // Add numbering for signature column
      if (data.section === 'body' && data.column.index === 7) {
        doc.setFontSize(7);
        doc.text(`${data.row.index + 1}.`, data.cell.x + 2, data.cell.y + 4);
      }
    }
  });

  let startY = (doc as any).lastAutoTable.finalY + 20;
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.text('Pengawas Keuangan SPPG', 40, startY, { align: 'center' });
  doc.text('Kepala SPPG', pageWidth - 40, startY, { align: 'center' });

  startY += 25;
  doc.text(sppg?.nama_pengawas_keuangan || '(......................................)', 40, startY, { align: 'center' });
  doc.text(sppg?.nama_kepala_sppg || '(......................................)', pageWidth - 40, startY, { align: 'center' });

  doc.save(`Nominatif_Relawan_${periode}_${sppg?.nama?.replace(/\s+/g, '') || 'SPPG'}.pdf`);
}

/**
 * ─── 4. LEMBAR SURVEI HARGA ───────────────────────────────────────────────────
 */
export function generateSurveiHarga(data: { sppg: any, survei: any[], tanggal: string }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const { sppg, survei, tanggal } = data;

  addHeader(doc, sppg, 'Lampiran Tata Kelola - Survei Harga Pasar', tanggal);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LEMBAR SURVEI HARGA PASAR MINGGUAN', doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });

  const tableData = survei.map((s, i) => [
    i + 1,
    s.nama_bahan,
    s.satuan,
    `${s.sup1_nama}\nRp ${s.sup1_harga.toLocaleString('id-ID')}`,
    `${s.sup2_nama}\nRp ${s.sup2_harga.toLocaleString('id-ID')}`,
    `${s.sup3_nama}\nRp ${s.sup3_harga.toLocaleString('id-ID')}`,
    `Rp ${s.harga_terendah.toLocaleString('id-ID')}`
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['No', 'Bahan Pangan', 'Satuan', 'Supplier 1', 'Supplier 2', 'Supplier 3', 'Harga Referensi (Terendah)']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 4, valign: 'middle' },
    headStyles: { fillColor: [44, 62, 80] },
    columnStyles: { 0: { halign: 'center', cellWidth: 10 }, 6: { fontStyle: 'bold', textColor: [39, 174, 96] } }
  });

  let startY = (doc as any).lastAutoTable.finalY + 20;
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.text('Telah disurvei dan disahkan oleh,', pageWidth / 2, startY, { align: 'center' });
  doc.text('Kepala SPPG', pageWidth / 2, startY + 5, { align: 'center' });

  startY += 30;
  doc.text(sppg?.nama_kepala_sppg || '(......................................)', pageWidth / 2, startY, { align: 'center' });

  doc.save(`SurveiHarga_${tanggal}_${sppg?.nama?.replace(/\s+/g, '') || 'SPPG'}.pdf`);
}

/**
 * ─── 5. LAMPIRAN 30d (Laporan Bulanan) ──────────────────────────────────────
 */
export function generateLampiran30d(data: { sppg: any, periode: string }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const { sppg, periode } = data;

  addHeader(doc, sppg, 'Lampiran 30d - Laporan Bulanan SPPG', periode);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN BULANAN REALISASI KEUANGAN & MANFAAT', doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });

  doc.setFontSize(11);
  doc.text('A. RINGKASAN BUKU KAS UMUM', 14, 45);

  autoTable(doc, {
    startY: 50,
    head: [['Uraian', 'Penerimaan (Rp)', 'Pengeluaran (Rp)', 'Saldo (Rp)']],
    body: [
      ['Saldo Awal Bulan', '0', '0', '0'],
      ['Penerimaan Dana BGN', '300.000.000', '0', '300.000.000'],
      ['Pembelian Bahan Baku', '0', '170.000.000', '130.000.000'],
      ['Biaya Operasional', '0', '24.000.000', '106.000.000'],
      ['Insentif Relawan', '0', '50.000.000', '56.000.000'],
    ],
    foot: [['SALDO AKHIR BUKU KAS', '', '', 'Rp 56.000.000']],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] }
  });

  doc.text('B. REKAPITULASI PENERIMA MANFAAT BULANAN', 14, (doc as any).lastAutoTable.finalY + 10);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 15,
    head: [['Kategori', 'Total Porsi Disalurkan (Sebulan)']],
    body: [
      ['PAUD/TK/SD Kecil', '24.000'],
      ['SD Kelas Atas', '20.000'],
      ['SMP', '8.000'],
      ['SMA/SMK', '4.940'],
      ['Bumil/Busui/Balita', '1.780'],
    ],
    foot: [['TOTAL KESELURUHAN', '58.720 Porsi']],
    theme: 'grid',
    headStyles: { fillColor: [39, 174, 96] }
  });

  const startY = (doc as any).lastAutoTable.finalY + 30;
  doc.setFontSize(10);
  doc.text('Dibuat & Disetujui Oleh:', 40, startY, { align: 'center' });
  doc.text('Mengetahui,', doc.internal.pageSize.getWidth() - 40, startY, { align: 'center' });
  
  doc.text('Kepala SPPG', 40, startY + 5, { align: 'center' });
  doc.text('Yayasan / Koperasi', doc.internal.pageSize.getWidth() - 40, startY + 5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.text(sppg?.nama_kepala_sppg || '(......................................)', 40, startY + 30, { align: 'center' });
  doc.text('(......................................)', doc.internal.pageSize.getWidth() - 40, startY + 30, { align: 'center' });

  doc.save(`LaporanBulanan_${periode.replace(/\s+/g, '')}_${sppg?.nama?.replace(/\s+/g, '') || 'SPPG'}.pdf`);
}
