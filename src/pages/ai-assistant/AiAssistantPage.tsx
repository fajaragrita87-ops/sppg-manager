import { useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { toast } from '@/store/toastStore';
import { KNOWLEDGE_BASE } from './knowledge';
// AI knowledge lookup – matches keywords from knowledge base
const getAnswer = (question: string): string => {
  const q = question.toLowerCase();
  const matches = KNOWLEDGE_BASE.filter(entry =>
    entry.keywords.some(kw => q.includes(kw))
  );
  if (matches.length === 0) {
    return 'Maaf, saya belum memiliki informasi tentang hal itu. Silakan hubungi tim dukungan atau periksa dokumentasi.';
  }
  // Combine unique answers
  const uniq = Array.from(new Set(matches.map(m => m.answer)));
  return uniq.join('\n\n');
};

export default function AiAssistantPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = () => {
    if (!question.trim()) {
      toast.error('Tulis pertanyaan terlebih dahulu');
      return;
    }
    setLoading(true);
    // Simulate async call
    setTimeout(() => {
      const resp = getAnswer(question);
      setAnswer(resp);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Bot size={24} className="text-blue-600" /> AI Assistant
      </h1>
      <p className="text-slate-600 mb-6">
        Tanyakan apa saja tentang aplikasi SPPG Manager, modul operasional, laporan, atau proses PO. AI akan memberikan panduan singkat.
      </p>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Masukkan pertanyaan..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Send size={16} /> {loading ? 'Memproses...' : 'Tanya'}
        </button>
      </div>
      {answer && (
        <div className="mt-4 p-4 bg-slate-100 border border-slate-200 rounded-lg">
          <p className="font-medium text-slate-800">Jawaban:</p>
          <p className="mt-2 text-slate-700 whitespace-pre-line">{answer}</p>
        </div>
      )}
    </div>
  );
}
