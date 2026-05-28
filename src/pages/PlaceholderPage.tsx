import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  icon?: string | React.ReactNode;
  description?: string;
}

export default function PlaceholderPage({ 
  title, 
  icon = '🏗️', 
  description = 'Halaman ini sedang dalam tahap pengembangan teknis oleh tim SPPG Manager.' 
}: PlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-5xl mb-8 shadow-sm border border-slate-100">
        {icon}
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">{title}</h1>
      <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed font-medium">
        {description}
      </p>
      
      <div className="flex gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          <ArrowLeft size={18} /> Kembali
        </button>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Home size={18} /> Dashboard
        </button>
      </div>

      <div className="mt-16 pt-8 border-t border-slate-100 w-full max-w-xs">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">SPPG Smart Ops v2.5</p>
      </div>
    </div>
  );
}
