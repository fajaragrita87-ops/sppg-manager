import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

type AlertType = 'warning' | 'danger' | 'success' | 'info';

interface AlertBannerProps {
  type: AlertType;
  judul: string;
  pesan?: string;
  onDismiss?: () => void;
  action?: { label: string; onClick: () => void };
}

const CFG = {
  success: { bg: '#f0fdf4', border: '#dcfce7', color: '#14532d', icon: CheckCircle2 },
  warning: { bg: '#fffbeb', border: '#fef3c7', color: '#78350f', icon: AlertTriangle },
  danger:  { bg: '#fef2f2', border: '#fecaca', color: '#991b1b', icon: XCircle },
  info:    { bg: '#eff6ff', border: '#dbeafe', color: '#1e3a5f', icon: Info },
} as const;

export default function AlertBanner({ type, judul, pesan, onDismiss, action }: AlertBannerProps) {
  const c = CFG[type];
  const Icon = c.icon;
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-lg text-sm animate-fade-in" role="alert"
      style={{ background: c.bg, border: `0.5px solid ${c.border}`, color: c.color }}>
      <Icon size={17} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-medium leading-snug">{judul}</p>
        {pesan && <p className="text-xs opacity-75 mt-0.5 leading-relaxed">{pesan}</p>}
      </div>
      {(action || onDismiss) && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {action && <button onClick={action.onClick} className="btn btn-sm" style={{ background: `${c.color}15`, border: `0.5px solid ${c.border}`, color: c.color }}>{action.label}</button>}
          {onDismiss && <button onClick={onDismiss} className="p-1 opacity-50 hover:opacity-100"><X size={14} /></button>}
        </div>
      )}
    </div>
  );
}
