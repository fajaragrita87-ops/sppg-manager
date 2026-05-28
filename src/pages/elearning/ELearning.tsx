import { useState, useMemo } from 'react';
import { BookOpen, Clock, CheckCircle2, Play, RotateCcw, Award, ChevronRight } from 'lucide-react';
import { ELEARNING_MODULES } from '@/data/elearning-modules';
import { useAuthStore } from '@/store/authStore';
import ModulDetail from './ModulDetail';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getProgress(): Record<string, { completedLessons: string[], quizScores: Record<string, number> }> {
  try { return JSON.parse(localStorage.getItem('elearning_progress') || '{}'); } catch { return {}; }
}

export default function ELearning() {
  const role = useAuthStore(s => s.role);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const progress = getProgress();

  const modules = useMemo(() => ELEARNING_MODULES.filter(m => m.target_role.includes(role as any) || role === 'owner' || role === 'superadmin'), [role]);
  const totalModules = modules.length;
  const completedModules = modules.filter(m => {
    const p = progress[m.id];
    return p && p.completedLessons.length >= m.pelajaran.length;
  }).length;
  const allDone = completedModules === totalModules && totalModules > 0;

  if (activeModuleId) {
    const mod = ELEARNING_MODULES.find(m => m.id === activeModuleId);
    if (mod) return <ModulDetail module={mod} onBack={() => setActiveModuleId(null)} />;
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border" style={{ borderColor: '#e2e8f0' }}>
        <h1 className="font-display text-xl font-semibold text-slate-900">Pusat Belajar SPPG</h1>
        <p className="text-sm text-slate-500 mt-1">Tingkatkan pemahaman Anda tentang pengelolaan SPPG sesuai standar BGN</p>
      </div>

      {/* Progress Summary */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-700">Anda sudah menyelesaikan <strong className="text-blue-700">{completedModules}</strong> dari <strong>{totalModules}</strong> modul</p>
          {allDone && <span className="text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1.5"><Award size={14} /> 🎓 Tersertifikasi SPPG Manager</span>}
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${totalModules > 0 ? (completedModules / totalModules) * 100 : 0}%`, background: allDone ? '#10b981' : '#1e6fbf' }} />
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(m => {
          const p = progress[m.id];
          const completed = p?.completedLessons?.length ?? 0;
          const total = m.pelajaran.length;
          const isDone = completed >= total;
          const isStarted = completed > 0 && !isDone;

          return (
            <div key={m.id} className={`card p-5 hover:shadow-lg transition-all cursor-pointer group ${isDone ? 'border-emerald-200 bg-emerald-50/30' : ''}`} onClick={() => setActiveModuleId(m.id)}>
              <div className="text-3xl mb-3">{m.emoji}</div>
              <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">{m.judul}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{m.deskripsi}</p>

              <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><Clock size={10} /> {m.durasi_menit} menit</span>
                <span className="flex items-center gap-1"><BookOpen size={10} /> {total} pelajaran</span>
              </div>

              <div className="flex flex-wrap gap-1 mt-2">
                {m.target_role.slice(0, 3).map(r => <span key={r} className="text-[8px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{r.replace('_', ' ')}</span>)}
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%`, background: isDone ? '#10b981' : '#1e6fbf' }} />
                </div>
                <p className="text-[10px] mt-1 font-medium" style={{ color: isDone ? '#10b981' : isStarted ? '#1e6fbf' : '#94a3b8' }}>
                  {isDone ? '✓ Selesai' : isStarted ? `${completed}/${total} pelajaran` : 'Belum Mulai'}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className={`text-xs font-bold flex items-center gap-1 ${isDone ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {isDone ? <><RotateCcw size={12} /> Ulangi</> : isStarted ? <><Play size={12} /> Lanjutkan</> : <><ChevronRight size={12} /> Mulai Belajar</>}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
