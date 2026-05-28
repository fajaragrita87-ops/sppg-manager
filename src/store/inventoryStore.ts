import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StockItem {
  id: string;
  nama: string;
  satuan: string;
  stok_akhir: number;
  min_stok: number;
  kategori: string;
  last_update: string;
  tgl_kadaluarsa?: string;
  lokasi?: string;
}

export interface WasteItem {
  id: string;
  tanggal: string;
  sumber: string;
  jenis: string;
  nama: string;
  jumlah: string;
  alasan: string;
  kerugian: number;
}

interface InventoryStore {
  stocks: StockItem[];
  wastes: WasteItem[];
  addStock: (items: { nama: string, qty: number, satuan: string }[]) => void;
  deductStock: (items: { nama: string, qty: number }[]) => void;
  updateStock: (id: string, qty: number) => void;
  initializeStocks: (initialStocks: StockItem[]) => void;
  addWaste: (waste: Omit<WasteItem, 'id'>) => void;
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set) => ({
      stocks: [],
      wastes: [
        { id: 'w1', tanggal: '2026-05-15', sumber: 'Gudang (Stok Susut)', jenis: 'Bahan Baku Expired', nama: 'Sayur Bayam', jumlah: '5 kg', alasan: 'Daun layu dan menguning sebelum dimasak', kerugian: 45000 },
        { id: 'w2', tanggal: '2026-05-15', sumber: 'Dapur (Prep Waste)', jenis: 'Sisa Potongan', nama: 'Tulang Ayam & Kulit', jumlah: '12 kg', alasan: 'Trimming ayam tidak terpakai untuk menu', kerugian: 0 },
        { id: 'w3', tanggal: '2026-05-14', sumber: 'Distribusi (Sisa)', jenis: 'Makanan Matang', nama: 'Nasi + Lauk', jumlah: '25 Porsi', alasan: 'Sekolah libur mendadak, gagal distribusi', kerugian: 375000 },
        { id: 'w4', tanggal: '2026-05-12', sumber: 'Gudang (Kerusakan)', jenis: 'Bahan Baku Rusak', nama: 'Telur Ayam', jumlah: '2 kg', alasan: 'Pecah saat penurunan dari mobil supplier', kerugian: 56000 },
      ],
      
      initializeStocks: (initialStocks) => set({ stocks: initialStocks }),

      addWaste: (waste) => set((state) => ({
        wastes: [{ ...waste, id: `w-${Math.random().toString(36).substr(2, 5)}` }, ...state.wastes]
      })),

      addStock: (newItems) => set((state) => {
        const updatedStocks = [...state.stocks];
        
        newItems.forEach(item => {
          const existingIndex = updatedStocks.findIndex(s => s.nama.toLowerCase() === item.nama.toLowerCase());
          
          if (existingIndex > -1) {
            updatedStocks[existingIndex] = {
              ...updatedStocks[existingIndex],
              stok_akhir: updatedStocks[existingIndex].stok_akhir + item.qty,
              last_update: new Date().toISOString().split('T')[0]
            };
          } else {
            // Jika bahan belum ada di stok, tambahkan baru
            updatedStocks.push({
              id: `b-${Math.random().toString(36).substr(2, 5)}`,
              nama: item.nama,
              satuan: item.satuan,
              stok_akhir: item.qty,
              min_stok: 10,
              kategori: 'Bahan Baku',
              last_update: new Date().toISOString().split('T')[0]
            });
          }
        });
        
        return { stocks: updatedStocks };
      }),

      deductStock: (itemsToDeduct) => set((state) => {
        const updatedStocks = [...state.stocks];
        itemsToDeduct.forEach(item => {
          const existingIndex = updatedStocks.findIndex(s => s.nama.toLowerCase() === item.nama.toLowerCase());
          if (existingIndex > -1) {
            updatedStocks[existingIndex] = {
              ...updatedStocks[existingIndex],
              stok_akhir: Math.max(0, updatedStocks[existingIndex].stok_akhir - item.qty),
              last_update: new Date().toISOString().split('T')[0]
            };
          }
        });
        return { stocks: updatedStocks };
      }),

      updateStock: (id, qty) => set((state) => ({
        stocks: state.stocks.map(s => s.id === id ? { ...s, stok_akhir: qty, last_update: new Date().toISOString().split('T')[0] } : s)
      }))
    }),
    {
      name: 'sppg-inventory',
    }
  )
);
