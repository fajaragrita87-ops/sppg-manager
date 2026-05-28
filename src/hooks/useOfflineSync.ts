import { useState, useEffect, useCallback } from 'react';
import { getQueueCount } from '@/lib/offline-queue';
import { processOfflineQueue } from '@/lib/bgn-sync';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  const updateQueueCount = useCallback(async () => {
    try {
      const count = await getQueueCount();
      setQueueCount(count);
    } catch (error) {
      console.error('Error fetching queue count:', error);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (!navigator.onLine) return;
    
    setIsSyncing(true);
    try {
      await processOfflineQueue();
      setLastSyncAt(new Date());
      await updateQueueCount();
    } catch (error) {
      console.error('Error processing offline queue:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [updateQueueCount]);

  // Handle Online/Offline Status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      triggerSync();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerSync]);

  // Initial queue check and interval polling (every 30 seconds)
  useEffect(() => {
    updateQueueCount();

    const interval = setInterval(() => {
      updateQueueCount();
      // Optionally auto-trigger sync periodically if online
      if (navigator.onLine) {
        triggerSync();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [updateQueueCount, triggerSync]);

  return {
    isOnline,
    isSyncing,
    queueCount,
    lastSyncAt,
    triggerSync
  };
}
