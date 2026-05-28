import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ToastContainer from '@/components/ui/ToastContainer';
import GlobalAiAssistant from '@/components/ai/GlobalAiAssistant';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useOnlineStatus();
  const isOnline = useAuthStore((s) => s.isOnline);

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar onMenuClick={() => setSidebarOpen(true)} />

      {!isOnline && (
        <div className="fixed top-14 left-0 right-0 z-30 md:pl-60 text-center py-1.5 px-4 text-xs" style={{ background: '#fffbeb', borderBottom: '0.5px solid #fef3c7', color: '#78350f' }}>
          📡 Offline — data tersimpan lokal, akan terkirim saat internet kembali
        </div>
      )}

      <main className="md:pl-60 pt-14 min-h-screen transition-all duration-200" style={{ background: '#f8fafc' }}>
        <div className={`p-4 md:p-6 ${!isOnline ? 'mt-8' : ''}`}>
          <Outlet />
        </div>
      </main>

      <ToastContainer />
      <GlobalAiAssistant />
    </div>
  );
}
