import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface KeuanganState {
  saldoVA: number;
  pettyCash: number;
  pettyCashLimit: number;
  pengeluaranBahanBaku: number;
  pengeluaranOperasional: number;
  pengeluaranInsentif: number;
  poCount: number;
  pettyCount: number;
  relawanCount: number;

  /** Jumlah PO berstatus "Menunggu Approval" — dipakai oleh Dashboard warning */
  pendingPoCount: number;

  /** Status Laporan Harian — lintas halaman, persisted harian */
  laporanHarianStatus: 'terkirim' | 'belum_dikunci' | 'gagal';
  laporanHarianTanggal: string;

  catatPengeluaran: (tipe: 'bahan' | 'ops' | 'insentif', amount: number) => void;
  topupVA: (amount: number) => void;
  setLaporanHarianStatus: (status: 'terkirim' | 'belum_dikunci' | 'gagal') => void;
  addPendingPo: () => void;
  decrementPendingPo: () => void;
  /** Computed: status aktual hari ini (auto-reset jika tanggal berbeda) */
  getLaporanHarianStatusToday: () => 'terkirim' | 'belum_dikunci' | 'gagal';
}

export const useKeuanganStore = create<KeuanganState>()(
  persist(
    (set) => ({
      saldoVA: 42_500_000,
      pettyCash: 750_000,
      pettyCashLimit: 5_000_000,
      pengeluaranBahanBaku:   2_450_000,
      pengeluaranOperasional:   350_000,
      pengeluaranInsentif:      900_000,
      poCount:      1,
      pettyCount:   3,
      relawanCount: 18,
      pendingPoCount: 2,          // sesuai INITIAL_PO mock (1 Menunggu + 1 Disetujui belum diterima)
      laporanHarianStatus:  'belum_dikunci',
      laporanHarianTanggal: '',

      catatPengeluaran: (tipe, amount) =>
        set((state) => {
          let update: Partial<KeuanganState> = {};
          if (tipe === 'bahan')
            update = { pengeluaranBahanBaku: state.pengeluaranBahanBaku + amount, poCount: state.poCount + 1 };
          if (tipe === 'ops')
            update = { pengeluaranOperasional: state.pengeluaranOperasional + amount, pettyCount: state.pettyCount + 1 };
          if (tipe === 'insentif')
            update = { pengeluaranInsentif: state.pengeluaranInsentif + amount };
          return { ...update, saldoVA: Math.max(0, state.saldoVA - amount) };
        }),

      topupVA: (amount) => set((state) => ({ saldoVA: state.saldoVA + amount })),

      setLaporanHarianStatus: (status) =>
        set({ laporanHarianStatus: status, laporanHarianTanggal: new Date().toISOString().split('T')[0] }),

      addPendingPo: () => set((s) => ({ pendingPoCount: s.pendingPoCount + 1 })),

      decrementPendingPo: () => set((s) => ({ pendingPoCount: Math.max(0, s.pendingPoCount - 1) })),

      getLaporanHarianStatusToday: () => {
        const state = useKeuanganStore.getState();
        const today = new Date().toISOString().split('T')[0];
        // Jika tanggal terakhir kunci bukan hari ini → otomatis belum dikunci
        if (state.laporanHarianTanggal !== today) return 'belum_dikunci';
        return state.laporanHarianStatus;
      },
    }),
    { name: 'sppg-keuangan' }
  )
);
