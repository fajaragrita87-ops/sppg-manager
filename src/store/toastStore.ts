import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Toast {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  judul: string;
  pesan?: string;
  durasi?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (toastData) => {
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString();

    const newToast: Toast = {
      id,
      durasi: 5000,
      ...toastData,
    };

    set((state) => ({ toasts: [...state.toasts, newToast] }));

    // Auto-remove setelah durasi
    setTimeout(() => {
      get().removeToast(id);
    }, newToast.durasi);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

// ─── Helper: toast.sukses / toast.peringatan / toast.error / toast.info ───────

export const toast = {
  sukses: (judul: string, pesan?: string, durasi = 5000) =>
    useToastStore.getState().addToast({ type: 'success', judul, pesan, durasi }),

  peringatan: (judul: string, pesan?: string, durasi = 6000) =>
    useToastStore.getState().addToast({ type: 'warning', judul, pesan, durasi }),

  error: (judul: string, pesan?: string, durasi = 7000) =>
    useToastStore.getState().addToast({ type: 'error', judul, pesan, durasi }),

  info: (judul: string, pesan?: string, durasi = 5000) =>
    useToastStore.getState().addToast({ type: 'info', judul, pesan, durasi }),
};
