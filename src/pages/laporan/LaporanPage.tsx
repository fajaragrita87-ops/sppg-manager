import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LaporanHarianPage from './LaporanHarian';
import Laporan2MingguPage from './Laporan2Minggu';
import LaporanBulananPage from './LaporanBulanan';
import LaporanBGNPage from './LaporanBGNPage';
import StatusSyncPage from './StatusSync';
import LaporanWastePage from './LaporanWaste';
import type { UserRole } from '@/types';
import {
  FileText, Calendar, CalendarDays, BarChart3, RefreshCw,
  CheckCircle2, Clock, AlertTriangle, ArrowRight, Send
} from 'lucide-react';

// ─── RBAC: Single Source of Truth untuk akses tab laporan ─────────────────────
const ALL_TABS: { id: string; label: string; sublabel: string; icon: React.ElementType; roles: UserRole[] }[] = [
  {
    id: 'harian',
    label: 'Harian',
    sublabel: 'Lampiran 30a',
    icon: Calendar,
    roles: ['owner', 'kasppg', 'pengawas_keuangan', 'pengawas_gizi', 'asisten_lapangan', 'bgn_coord'],
  },
  {
    id: 'mingguan',
    label: '2 Mingguan',
    sublabel: 'Lampiran 30c',
    icon: CalendarDays,
    roles: ['owner', 'kasppg', 'pengawas_keuangan', 'bgn_coord'],
  },
  {
    id: 'bulanan',
    label: 'Bulanan',
    sublabel: 'Lampiran 30d',
    icon: FileText,
    roles: ['owner', 'kasppg', 'pengawas_keuangan', 'bgn_coord'],
  },
  {
    id: 'waste',
    label: 'Food Waste',
    sublabel: 'Susut & Sisa',
    icon: BarChart3,
    roles: ['owner', 'kasppg', 'pengawas_gizi', 'pengawas_sanitasi'],
  },
  {
    id: 'sync',
    label: 'Sinkronisasi',
    sublabel: 'Status SIPGN',
    icon: RefreshCw,
    roles: ['owner', 'kasppg', 'pengawas_keuangan', 'bgn_coord'],
  },
  {
    id: 'bgn',
    label: 'Submit ke BGN',
    sublabel: 'Kirim Lampiran 30',
    icon: Send,
    roles: ['owner', 'kasppg', 'bgn_coord'],
  },
];

// ─── Status Pipeline Pelaporan ────────────────────────────────────────────────
const PIPELINE = [
  { step: 1, label: 'Input Harian', status: 'done' },
  { step: 2, label: 'Generate 2 Minggu', status: 'done' },
  { step: 3, label: 'Approval Ka.SPPG', status: 'current' },
  { step: 4, label: 'Submit ke BGN', status: 'pending' },
];

export default function LaporanPageWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore(s => s.user);

  const allowedTabs = ALL_TABS.filter(t => user && t.roles.includes(user.role));

  const pathParts = location.pathname.split('/');
  const rawTab = pathParts[2] || 'harian';
  const isAllowed = allowedTabs.some(t => t.id === rawTab);
  const activeTab = isAllowed ? rawTab : (allowedTabs[0]?.id || 'harian');

  const setTab = (id: string) => navigate(`/laporan/${id}`);

  if (allowedTabs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText size={48} className="text-slate-200 mb-4" />
        <h2 className="font-bold text-slate-700 text-lg">Akses Ditolak</h2>
        <p className="text-slate-400 text-sm mt-1">Role Anda tidak memiliki akses ke modul Pelaporan BGN.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 animate-fade-in">
      {/* ─── HEADER ─── */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900">Pelaporan BGN</h1>
        <p className="text-sm text-slate-500 mt-1">Siklus pelaporan terintegrasi — dari input harian hingga submit ke Badan Gizi Nasional</p>
      </div>

      {/* ─── PIPELINE STATUS (hanya untuk manajemen) ─── */}
      {['owner', 'kasppg', 'pengawas_keuangan', 'bgn_coord'].includes(user?.role || '') && (
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Pipeline Periode Berjalan</p>
          <div className="flex items-center gap-0 overflow-x-auto">
            {PIPELINE.map((p, i) => (
              <div key={p.step} className="flex items-center">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    p.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                    p.status === 'current' ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {p.status === 'done' ? <CheckCircle2 size={14}/> : p.step}
                  </div>
                  <span className={`text-xs font-medium ${
                    p.status === 'done' ? 'text-emerald-700' :
                    p.status === 'current' ? 'text-blue-700 font-bold' :
                    'text-slate-400'
                  }`}>{p.label}</span>
                </div>
                {i < PIPELINE.length - 1 && (
                  <div className={`w-8 sm:w-16 h-px mx-2 flex-shrink-0 ${
                    p.status === 'done' ? 'bg-emerald-300' : 'bg-slate-200'
                  }`}/>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB NAVIGATION ─── */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 border-b border-slate-200">
        {allowedTabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-blue-500' : 'opacity-40'}/>
              <div className="text-left">
                <span className="block leading-tight">{t.label}</span>
                <span className={`block text-[10px] leading-tight ${isActive ? 'text-blue-400' : 'text-slate-300'}`}>{t.sublabel}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── TAB CONTENT ─── */}
      <div>
        {activeTab === 'harian'   && allowedTabs.some(t => t.id === 'harian')   && <LaporanHarianPage />}
        {activeTab === 'mingguan' && allowedTabs.some(t => t.id === 'mingguan') && <Laporan2MingguPage />}
        {activeTab === 'bulanan'  && allowedTabs.some(t => t.id === 'bulanan')  && <LaporanBulananPage />}
        {activeTab === 'waste'    && allowedTabs.some(t => t.id === 'waste')    && <LaporanWastePage />}
        {activeTab === 'sync'     && allowedTabs.some(t => t.id === 'sync')     && <StatusSyncPage />}
        {activeTab === 'bgn'      && allowedTabs.some(t => t.id === 'bgn')      && <LaporanBGNPage />}
      </div>
    </div>
  );
}
