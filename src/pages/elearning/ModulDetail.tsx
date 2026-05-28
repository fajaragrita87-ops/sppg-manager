import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, BookOpen, FileText, HelpCircle } from 'lucide-react';
import type { ElearningModule, Pelajaran, QuizItem } from '@/data/elearning-modules';
import { toast } from '@/store/toastStore';

interface Props { module: ElearningModule; onBack: () => void; }

// ─── Progress helpers ─────────────────────────────────────────────────────────

function getProgress(): Record<string, { completedLessons: string[], quizScores: Record<string, number> }> {
  try { return JSON.parse(localStorage.getItem('elearning_progress') || '{}'); } catch { return {}; }
}

function saveProgress(moduleId: string, lessonId: string, quizScore?: number) {
  const all = getProgress();
  if (!all[moduleId]) all[moduleId] = { completedLessons: [], quizScores: {} };
  if (!all[moduleId].completedLessons.includes(lessonId)) all[moduleId].completedLessons.push(lessonId);
  if (quizScore !== undefined) all[moduleId].quizScores[lessonId] = quizScore;
  localStorage.setItem('elearning_progress', JSON.stringify(all));
}

export default function ModulDetail({ module, onBack }: Props) {
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const lesson = module.pelajaran[activeLessonIdx];
  const progress = getProgress()[module.id];
  const isCompleted = (id: string) => progress?.completedLessons?.includes(id);

  // Mark text lessons as complete when viewed
  useEffect(() => {
    if (lesson.tipe === 'text') {
      setTimeout(() => saveProgress(module.id, lesson.id), 2000);
    }
  }, [lesson.id, lesson.tipe, module.id]);

  const goNext = () => { if (activeLessonIdx < module.pelajaran.length - 1) setActiveLessonIdx(activeLessonIdx + 1); };
  const goPrev = () => { if (activeLessonIdx > 0) setActiveLessonIdx(activeLessonIdx - 1); };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-4 animate-fade-in pb-12">
      <button onClick={onBack} className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 self-start"><ChevronLeft size={14} /> Kembali ke Pusat Belajar</button>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar */}
        <div className="lg:w-64 shrink-0">
          <div className="card p-3 space-y-1 sticky top-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">{module.emoji} {module.judul}</p>
            {module.pelajaran.map((p, i) => {
              const done = isCompleted(p.id);
              const isActive = i === activeLessonIdx;
              return (
                <button key={p.id} onClick={() => setActiveLessonIdx(i)} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs flex items-center gap-2 transition-all ${isActive ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                  {done ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> : p.tipe === 'quiz' ? <HelpCircle size={14} className="text-amber-400 shrink-0" /> : <FileText size={14} className="text-slate-300 shrink-0" />}
                  <span className="line-clamp-1">{p.judul}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 card p-6 animate-fade-in">
          {lesson.tipe === 'quiz' ? (
            <QuizView lesson={lesson} moduleId={module.id} onComplete={() => { if (activeLessonIdx < module.pelajaran.length - 1) setTimeout(() => setActiveLessonIdx(activeLessonIdx + 1), 2000); }} />
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <BookOpen size={18} className="text-blue-600" />
                <h2 className="font-bold text-slate-800">{lesson.judul}</h2>
              </div>
              <div className="prose-sm text-sm text-slate-700 leading-relaxed space-y-3">
                {lesson.konten.split('\n').map((line, i) => {
                  if (!line.trim()) return <br key={i} />;
                  const html = line
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>');
                  return <p key={i} dangerouslySetInnerHTML={{ __html: html }} />;
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100">
            <button onClick={goPrev} disabled={activeLessonIdx === 0} className="text-xs font-bold text-slate-400 hover:text-slate-700 disabled:opacity-30 flex items-center gap-1"><ChevronLeft size={14} /> Sebelumnya</button>
            <span className="text-[10px] text-slate-400">{activeLessonIdx + 1} / {module.pelajaran.length}</span>
            <button onClick={goNext} disabled={activeLessonIdx === module.pelajaran.length - 1} className="text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-30 flex items-center gap-1">Selanjutnya <ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quiz Component ───────────────────────────────────────────────────────────

function QuizView({ lesson, moduleId, onComplete }: { lesson: Pelajaran; moduleId: string; onComplete: () => void }) {
  const kuis = lesson.kuis ?? [];
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState<Record<number, boolean>>({});
  const [done, setDone] = useState(false);

  const q = kuis[currentQ];
  const score = Object.entries(answers).filter(([i, a]) => kuis[Number(i)]?.jawaban_benar === a).length;
  const pct = kuis.length > 0 ? Math.round((score / kuis.length) * 100) : 0;

  const handleAnswer = (idx: number) => {
    if (showResult[currentQ]) return;
    setAnswers(p => ({ ...p, [currentQ]: idx }));
    setShowResult(p => ({ ...p, [currentQ]: true }));

    // Auto advance after 1.5s
    setTimeout(() => {
      if (currentQ < kuis.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        setDone(true);
        const finalScore = Object.entries({ ...answers, [currentQ]: idx }).filter(([i, a]) => kuis[Number(i)]?.jawaban_benar === a).length;
        const finalPct = Math.round((finalScore / kuis.length) * 100);
        saveProgress(moduleId, lesson.id, finalPct);
        if (finalPct >= 80) toast.sukses(`Quiz selesai! Skor: ${finalScore}/${kuis.length} (${finalPct}%) 🎉`);
        else toast.error(`Skor: ${finalScore}/${kuis.length} (${finalPct}%)`, 'Coba lagi untuk skor ≥ 80%');
        onComplete();
      }
    }, 1500);
  };

  if (done) {
    return (
      <div className="text-center py-10">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${pct >= 80 ? 'bg-emerald-100' : 'bg-amber-100'}`}>
          {pct >= 80 ? <CheckCircle2 size={40} className="text-emerald-600" /> : <XCircle size={40} className="text-amber-600" />}
        </div>
        <h3 className="text-xl font-bold text-slate-800">Quiz Selesai!</h3>
        <p className={`text-3xl font-black mt-2 ${pct >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{score}/{kuis.length}</p>
        <p className="text-sm text-slate-500 mt-1">Skor: {pct}% {pct >= 80 ? '— LULUS ✓' : '— Belum lulus (min 80%)'}</p>
        <button onClick={() => { setCurrentQ(0); setAnswers({}); setShowResult({}); setDone(false); }} className="btn-secondary text-xs mt-6">Ulangi Quiz</button>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100">
        <HelpCircle size={18} className="text-amber-500" />
        <h2 className="font-bold text-slate-800">📝 Mini Quiz</h2>
        <span className="ml-auto text-xs text-slate-400 font-medium">{currentQ + 1} / {kuis.length}</span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-6">
        {kuis.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < currentQ ? (answers[i] === kuis[i].jawaban_benar ? 'bg-emerald-400' : 'bg-red-400') : i === currentQ ? 'bg-blue-500' : 'bg-slate-200'}`} />
        ))}
      </div>

      <p className="text-sm font-bold text-slate-800 mb-4">{q.pertanyaan}</p>

      <div className="space-y-2.5">
        {q.pilihan.map((p, i) => {
          const isSelected = answers[currentQ] === i;
          const isCorrect = q.jawaban_benar === i;
          const revealed = showResult[currentQ];

          let cls = 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer';
          if (revealed) {
            if (isCorrect) cls = 'border-emerald-300 bg-emerald-50 text-emerald-800';
            else if (isSelected && !isCorrect) cls = 'border-red-300 bg-red-50 text-red-800';
            else cls = 'border-slate-200 bg-slate-50 text-slate-400';
          }

          return (
            <button key={i} onClick={() => handleAnswer(i)} disabled={!!revealed} className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all flex items-center gap-3 ${cls}`}>
              <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${revealed && isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : revealed && isSelected ? 'border-red-500 bg-red-500 text-white' : 'border-slate-300 text-slate-400'}`}>
                {revealed && isCorrect ? '✓' : revealed && isSelected && !isCorrect ? '✗' : String.fromCharCode(65 + i)}
              </span>
              {p}
            </button>
          );
        })}
      </div>

      {showResult[currentQ] && (
        <p className={`mt-3 text-xs font-bold animate-fade-in ${answers[currentQ] === q.jawaban_benar ? 'text-emerald-600' : 'text-red-600'}`}>
          {answers[currentQ] === q.jawaban_benar ? 'Benar! ✓' : `Jawaban yang benar: ${q.pilihan[q.jawaban_benar]}`}
        </p>
      )}
    </div>
  );
}
