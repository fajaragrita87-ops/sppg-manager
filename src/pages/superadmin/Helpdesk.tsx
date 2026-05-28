import React, { useState } from 'react';
import { MessageSquare, Mail, Search, CheckCircle2, Clock, MoreVertical, Send, Filter, Paperclip, Reply } from 'lucide-react';
import { toast } from '@/store/toastStore';

export default function Helpdesk() {
  const [activeTab, setActiveTab] = useState<'semua' | 'pending' | 'selesai'>('pending');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  const [tickets, setTickets] = useState([
    {
      id: 'TKT-1001',
      sppg: 'SPPG Harapan Jaya',
      pengirim: 'Budi Santoso',
      kontak: '081234567890',
      saluran: 'WhatsApp',
      waktu: '10:30',
      tanggal: '16 Mei 2026',
      subjek: 'Gagal generate Lampiran 30B',
      pesan: 'Halo admin, saya mau cetak lampiran 30B untuk laporan harian tapi selalu muter-muter aja loadingnya. Mohon bantuannya segera karena harus disetor ke BGN siang ini.',
      status: 'pending',
      prioritas: 'tinggi'
    },
    {
      id: 'TKT-1002',
      sppg: 'SPPG Bina Bangsa',
      pengirim: 'Siti Aminah',
      kontak: 'siti.keuangan@gmail.com',
      saluran: 'Email',
      waktu: '09:15',
      tanggal: '16 Mei 2026',
      subjek: 'Tanya cara tambah staf admin',
      pesan: 'Selamat pagi, saya mau mendelegasikan input bahan baku ke staf gudang, tapi saya bingung cara menambah user baru di pengaturan. Bagaimana caranya ya?',
      status: 'pending',
      prioritas: 'normal'
    },
    {
      id: 'TKT-1003',
      sppg: 'SPPG Mekar Sari',
      pengirim: 'Ahmad',
      kontak: '085512344321',
      saluran: 'WhatsApp',
      waktu: 'Kemarin',
      tanggal: '15 Mei 2026',
      subjek: 'Cara ubah harga paket langganan',
      pesan: 'Mau tanya, apakah paket Pro bisa di-upgrade ke Enterprise di pertengahan bulan?',
      status: 'selesai',
      prioritas: 'normal'
    }
  ]);

  const filteredTickets = tickets.filter(t => activeTab === 'semua' ? true : t.status === activeTab);

  const handleReply = () => {
    if (!replyText.trim()) return;
    toast.sukses(`Balasan terkirim ke ${selectedTicket.pengirim} via ${selectedTicket.saluran}`);
    setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: 'selesai' } : t));
    setSelectedTicket({ ...selectedTicket, status: 'selesai' });
    setReplyText('');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 font-display">Helpdesk & Keluhan</h1>
        <p className="text-slate-500 text-sm mt-1">Pantau dan balas keluhan klien dari WhatsApp dan Email dalam satu pintu</p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* LIST TIKET */}
        <div className="w-1/3 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Cari nama, ID, atau masalah..." className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('pending')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Perlu Dibalas</button>
              <button onClick={() => setActiveTab('selesai')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Selesai</button>
              <button onClick={() => setActiveTab('semua')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'semua' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Semua</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-slate-100">
              {filteredTickets.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-sm">Tidak ada tiket di kategori ini.</div>
              )}
              {filteredTickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 cursor-pointer transition-colors ${selectedTicket?.id === ticket.id ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-900 text-sm truncate pr-2">{ticket.sppg}</h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{ticket.waktu}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 mb-1 truncate">{ticket.subjek}</p>
                  <p className="text-xs text-slate-500 line-clamp-2">{ticket.pesan}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold flex items-center gap-1 ${ticket.saluran === 'WhatsApp' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {ticket.saluran === 'WhatsApp' ? <MessageSquare size={10} /> : <Mail size={10} />}
                      {ticket.saluran}
                    </span>
                    {ticket.status === 'pending' && <span className="w-2 h-2 rounded-full bg-amber-500 ml-auto" title="Menunggu Balasan" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DETAIL TIKET & CHAT */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-slate-900">{selectedTicket.subjek}</h3>
                  <p className="text-xs text-slate-500 mt-1">ID: <span className="font-mono text-slate-700">{selectedTicket.id}</span> • {selectedTicket.tanggal}</p>
                </div>
                <div className="flex gap-2">
                  {selectedTicket.status === 'pending' && (
                    <button onClick={() => {
                      setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: 'selesai' } : t));
                      setSelectedTicket({ ...selectedTicket, status: 'selesai' });
                      toast.sukses('Tiket ditandai selesai');
                    }} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors">
                      <CheckCircle2 size={14} /> Tandai Selesai
                    </button>
                  )}
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                {/* Bubble Klien */}
                <div className="flex gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                    {selectedTicket.pengirim.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-slate-800 text-sm">{selectedTicket.pengirim}</span>
                      <span className="text-[10px] text-slate-400">{selectedTicket.waktu} via {selectedTicket.saluran}</span>
                    </div>
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-700">
                      {selectedTicket.pesan}
                    </div>
                    {selectedTicket.prioritas === 'tinggi' && (
                      <span className="inline-block mt-2 text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        SLA: Tanggapan Cepat (1 Jam)
                      </span>
                    )}
                  </div>
                </div>

                {/* Bubble Admin (Jika Selesai) */}
                {selectedTicket.status === 'selesai' && (
                  <div className="flex gap-4 mb-6 flex-row-reverse">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold shrink-0">
                      SA
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-baseline gap-2 mb-1 flex-row-reverse">
                        <span className="font-bold text-slate-800 text-sm">Super Admin</span>
                        <span className="text-[10px] text-slate-400">Telah dibalas</span>
                      </div>
                      <div className="bg-[#1e6fbf] text-white p-4 rounded-2xl rounded-tr-none shadow-sm text-sm">
                        Permasalahan telah kami terima dan sudah diatasi oleh tim teknis kami. Silakan refresh halaman SPPG Anda. Terima kasih!
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Balas */}
              {selectedTicket.status === 'pending' && (
                <div className="p-4 bg-white border-t border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Reply size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Balas ke {selectedTicket.saluran} ({selectedTicket.kontak})</span>
                  </div>
                  <div className="flex gap-3">
                    <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                      <Paperclip size={20} />
                    </button>
                    <input 
                      type="text" 
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleReply()}
                      placeholder="Ketik balasan Anda di sini..." 
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button onClick={handleReply} className="px-5 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
                      <Send size={16} /> Kirim
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageSquare size={48} className="mb-4 opacity-20" />
              <p className="font-medium">Pilih tiket di sebelah kiri untuk melihat detail</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
