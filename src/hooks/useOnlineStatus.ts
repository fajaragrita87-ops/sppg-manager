import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';

interface OnlineStatus {
  isOnline: boolean;
}

export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const setStoreOnline = useAuthStore((s) => s.setOnline);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setStoreOnline(true);
      toast.info('Koneksi kembali!', 'Data akan disinkronisasi...');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStoreOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setStoreOnline]);

  return { isOnline };
}
