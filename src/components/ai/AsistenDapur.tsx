import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, X, Send, Bot } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { askAssistant, type ChatMessage } from '@/lib/ai-assistant';
import { useInventoryStore } from '@/store/inventoryStore';

const QQ = [
  { e: '📅', t: 'Ada bahan yang mau kadaluarsa?' },
  { e: '📦', t: 'Cek stok bahan yang kritis!' },
  { e: '📊', t: 'Bagaimana keuangan bulan ini?' },
  { e: '📋', t: 'Kapan laporan 2 mingguan jatuh tempo?' },
  { e: '⚠️', t: 'Apa yang perlu diperhatikan hari ini?' },
];

export default function AsistenDapur() {
  const { user, sppg } = useAuthStore();
  const { stocks } = useInventoryStore();
  const [isOpen, setIsOpen] = useState(false);
  const [msgs, setMsgs] = useState<(ChatMessage & { ts: string })[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Drag state
  const [pos, setPos] = useState({ x: window.innerWidth - 140, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, currX: 0, currY: 0, dragging: false });

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, currX: pos.x, currY: pos.y, dragging: true };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) setIsDragging(true);
    setPos({ x: dragRef.current.currX + dx, y: dragRef.current.currY + dy });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current.dragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setTimeout(() => setIsDragging(false), 50);
  };

  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const scroll = useCallback(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), []);
  useEffect(() => { scroll(); }, [msgs, scroll]);
  useEffect(() => {
    if (taRef.current) { taRef.current.style.height = 'auto'; taRef.current.style.height = Math.min(taRef.current.scrollHeight, 80) + 'px'; }
  }, [input]);


  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setMsgs(p => [...p, { role: 'user', content: text.trim(), ts: now }]);
    setInput('');
    setLoading(true);
    try {
      const riwayat: ChatMessage[] = msgs.map(m => ({ role: m.role, content: m.content }));
      const res = await askAssistant({ pertanyaan: text.trim(), sppgId: sppg?.id ?? '', userId: user?.id ?? '', namaSppg: sppg?.nama, riwayatChat: riwayat, inventoryData: stocks });
      const aiNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setMsgs(p => [...p, { role: 'assistant', content: res.jawaban, ts: aiNow }]);
    } catch {
      setMsgs(p => [...p, { role: 'assistant', content: 'Maaf, terjadi kesalahan. Coba lagi.', ts: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }]);
    }
    setLoading(false);
  };

  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } };

  return (
    <>
      {!isOpen && (
        <button 
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onClick={(e) => {
            if (isDragging) { e.preventDefault(); e.stopPropagation(); return; }
            setIsOpen(true);
          }}
          className="fixed z-50 shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 px-4 py-3 rounded-2xl text-white font-bold text-sm group cursor-move" 
          style={{ background: '#1e6fbf', left: pos.x, top: pos.y, touchAction: 'none' }}
        >
          <Sparkles size={18} className="group-hover:animate-pulse" />
          <span className="hidden sm:inline pointer-events-none">Tanya AI</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:right-6 sm:bottom-6 z-50 flex flex-col bg-white sm:w-[380px] sm:h-[600px] sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up sm:border border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#e2e8f0', background: 'linear-gradient(135deg, #1e6fbf, #1a5fa3)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center"><Bot size={20} className="text-white" /></div>
              <div><p className="font-bold text-white text-sm">Asisten SPPG 🤖</p><p className="text-[10px] text-blue-200">Tanya apa saja tentang operasional SPPG Anda</p></div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"><X size={18} /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#f8fafc' }}>
            {msgs.length === 0 && (
              <div className="space-y-3 pt-4">
                <div className="text-center mb-4">
                  <div className="w-14 h-14 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center mb-3"><Bot size={28} className="text-blue-600" /></div>
                  <p className="text-sm font-bold text-slate-700">Halo, {user?.nama?.split(' ')[0] ?? 'Kak'}! 👋</p>
                  <p className="text-xs text-slate-400 mt-1">Ada yang bisa saya bantu hari ini?</p>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Pertanyaan Cepat</p>
                {QQ.map((q, i) => (
                  <button key={i} onClick={() => send(q.t)} className="w-full text-left px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center gap-2.5 group">
                    <span className="text-base">{q.e}</span><span className="group-hover:text-blue-700">{q.t}</span>
                  </button>
                ))}
              </div>
            )}

            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className="max-w-[85%]">
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'text-white rounded-br-md' : 'text-slate-700 rounded-bl-md border'}`} style={m.role === 'user' ? { background: '#1e6fbf' } : { background: '#f8fafc', borderColor: '#e2e8f0' }}>
                    {m.content}
                  </div>
                  <p className={`text-[9px] text-slate-400 mt-1 ${m.role === 'user' ? 'text-right' : 'text-left'} px-1`}>{m.ts}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="px-4 py-3 bg-white rounded-2xl rounded-bl-md border text-sm" style={{ borderColor: '#e2e8f0' }}>
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs">Berpikir...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white" style={{ borderColor: '#e2e8f0' }}>
            <div className="flex items-end gap-2">
              <textarea ref={taRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey} placeholder="Tanya apa saja..." rows={1} className="flex-1 resize-none text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50" style={{ maxHeight: '80px' }} />
              <button onClick={() => send(input)} disabled={!input.trim() || loading} className="p-2.5 rounded-xl text-white disabled:opacity-40 shrink-0" style={{ background: '#1e6fbf' }}><Send size={18} /></button>
            </div>
            <p className="text-[9px] text-slate-400 mt-1.5 text-center">Enter kirim · Shift+Enter baris baru</p>
          </div>
        </div>
      )}
    </>
  );
}
