import { useEffect, useRef } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import type { Toast } from '@/store/toastStore';

const CFG = {
  success: { bg: '#f0fdf4', border: '#dcfce7', icon: CheckCircle2, ic: '#14532d', bar: '#22c55e' },
  warning: { bg: '#fffbeb', border: '#fef3c7', icon: AlertTriangle, ic: '#78350f', bar: '#f59e0b' },
  error:   { bg: '#fef2f2', border: '#fecaca', icon: XCircle,       ic: '#991b1b', bar: '#ef4444' },
  info:    { bg: '#eff6ff', border: '#dbeafe', icon: Info,          ic: '#1e3a5f', bar: '#3b82f6' },
} as const;

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore((s) => s.removeToast);
  const c = CFG[toast.type];
  const Icon = c.icon;
  const dur = toast.durasi ?? 5000;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.width = '0%'; el.style.transition = `width ${dur}ms linear`; }));
  }, [dur]);

  return (
    <div className="relative flex items-start gap-3 p-3.5 pr-8 rounded-xl shadow-lg animate-slide-up overflow-hidden"
      style={{ background: c.bg, border: `0.5px solid ${c.border}` }} role="alert">
      <Icon size={17} className="flex-shrink-0 mt-0.5" style={{ color: c.ic }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: c.ic }}>{toast.judul}</p>
        {toast.pesan && <p className="text-xs mt-0.5 opacity-75" style={{ color: c.ic }}>{toast.pesan}</p>}
      </div>
      <button onClick={() => remove(toast.id)} className="absolute top-2.5 right-2.5 opacity-40 hover:opacity-100 p-0.5" style={{ color: c.ic }}><X size={14} /></button>
      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `${c.border}` }}>
        <div ref={ref} className="h-full opacity-60" style={{ width: '100%', background: c.bar }} />
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-[360px] w-full pointer-events-none" aria-live="polite">
      {toasts.map((t) => <div key={t.id} className="pointer-events-auto"><ToastItem toast={t} /></div>)}
    </div>
  );
}
