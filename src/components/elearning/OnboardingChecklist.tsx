import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Rocket, X } from 'lucide-react';

const CHECKLIST = [
  { id: 'profil', label: 'Lengkapi profil SPPG', desc: 'Isi nama, alamat, dan kapasitas PM' },
  { id: 'relawan', label: 'Tambahkan minimal 5 relawan', desc: 'Daftarkan tim dapur Anda' },
  { id: 'menu', label: 'Setup menu minggu ini', desc: 'Buat perencanaan menu di kalender' },
  { id: 'absensi', label: 'Input absensi pertama Anda', desc: 'Catat kehadiran relawan hari ini' },
  { id: 'laporan', label: 'Kunci laporan harian pertama', desc: 'Buat dan kunci laporan ke BGN' },
];

function getOnboardingState(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem('onboarding_checklist') || '{}'); } catch { return {}; }
}

function saveOnboardingState(state: Record<string, boolean>) {
  localStorage.setItem('onboarding_checklist', JSON.stringify(state));
}

export default function OnboardingChecklist() {
  const [state, setState] = useState(getOnboardingState);
  const [dismissed, setDismissed] = useState(false);
  const completed = CHECKLIST.filter(c => state[c.id]).length;
  const allDone = completed === CHECKLIST.length;

  useEffect(() => {
    const d = localStorage.getItem('onboarding_dismissed');
    if (d === 'true') setDismissed(true);
  }, []);

  const toggle = (id: string) => {
    const next = { ...state, [id]: !state[id] };
    setState(next);
    saveOnboardingState(next);
  };

  const dismiss = () => { setDismissed(true); localStorage.setItem('onboarding_dismissed', 'true'); };

  if (dismissed) return null;

  return (
    <div className={`card p-5 animate-slide-up ${allDone ? 'border-emerald-200 bg-emerald-50/30' : 'border-blue-200 bg-blue-50/20'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Rocket size={18} className="text-blue-600" />
          <h3 className="font-bold text-slate-800 text-sm">Setup SPPG Anda 🚀</h3>
        </div>
        <button onClick={dismiss} className="p-1 text-slate-300 hover:text-slate-500"><X size={14} /></button>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(completed / CHECKLIST.length) * 100}%`, background: allDone ? '#10b981' : '#1e6fbf' }} />
        </div>
        <span className="text-xs font-bold text-slate-500">{completed}/{CHECKLIST.length}</span>
      </div>

      {allDone ? (
        <div className="text-center py-3">
          <p className="text-sm font-bold text-emerald-700">🎉 SPPG Anda siap beroperasi!</p>
          <p className="text-xs text-slate-500 mt-1">Widget ini akan tersembunyi. <button onClick={dismiss} className="text-blue-600 underline">Tutup</button></p>
        </div>
      ) : (
        <div className="space-y-2">
          {CHECKLIST.map(c => (
            <button key={c.id} onClick={() => toggle(c.id)} className={`w-full text-left flex items-start gap-3 p-2.5 rounded-xl transition-all ${state[c.id] ? 'bg-emerald-50 border border-emerald-100' : 'hover:bg-slate-50 border border-transparent'}`}>
              {state[c.id] ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" /> : <Circle size={18} className="text-slate-300 shrink-0 mt-0.5" />}
              <div>
                <p className={`text-sm font-medium ${state[c.id] ? 'text-emerald-700 line-through' : 'text-slate-700'}`}>{c.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{c.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
