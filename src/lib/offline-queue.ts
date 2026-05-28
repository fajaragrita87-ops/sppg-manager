import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface QueueItem {
  id: string;
  type: string;
  payload: any;
  createdAt: number;
  retryCount: number;
  status: 'pending' | 'processing' | 'failed';
  error?: string;
}

interface SppgDB extends DBSchema {
  'sync-queue': {
    key: string;
    value: QueueItem;
    indexes: { 'by-status': string };
  };
}

let dbPromise: Promise<IDBPDatabase<SppgDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<SppgDB>('sppg-offline-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('sync-queue', { keyPath: 'id' });
        store.createIndex('by-status', 'status');
      },
    });
  }
  return dbPromise;
}

/**
 * Menyimpan item baru ke dalam queue offline
 */
export async function addToQueue(type: string, payload: any): Promise<string> {
  const db = await getDB();
  const id = crypto.randomUUID();
  
  const item: QueueItem = {
    id,
    type,
    payload,
    createdAt: Date.now(),
    retryCount: 0,
    status: 'pending'
  };

  await db.add('sync-queue', item);
  return id;
}

/**
 * Mengambil semua item queue yang statusnya pending atau failed
 */
export async function getQueue(): Promise<QueueItem[]> {
  const db = await getDB();
  // Ambil semua dari store, lalu difilter di memory karena index hanya support equals
  const all = await db.getAll('sync-queue');
  return all.filter(item => item.status === 'pending' || item.status === 'failed')
            .sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Mengupdate status suatu item queue
 */
export async function updateStatus(id: string, status: 'pending' | 'processing' | 'failed', error?: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('sync-queue', 'readwrite');
  const store = tx.objectStore('sync-queue');
  const item = await store.get(id);
  
  if (item) {
    item.status = status;
    if (status === 'failed') {
      item.retryCount += 1;
      if (error) item.error = error;
    }
    await store.put(item);
  }
  
  await tx.done;
}

/**
 * Menghapus item dari queue (misal setelah sukses)
 */
export async function removeItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('sync-queue', id);
}

/**
 * Membersihkan semua queue yang sudah selesai/sukses (jika ada yang tidak terhapus)
 */
export async function clearCompleted(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('sync-queue', 'readwrite');
  const store = tx.objectStore('sync-queue');
  
  const all = await store.getAll();
  const deletePromises = all.map(item => {
    // secara default sukses langsung di-remove, tapi untuk safety
    if (item.status !== 'pending' && item.status !== 'failed' && item.status !== 'processing') {
      return store.delete(item.id);
    }
  });
  
  await Promise.all(deletePromises);
  await tx.done;
}

/**
 * Mendapatkan jumlah queue yang masih pending/failed
 */
export async function getQueueCount(): Promise<number> {
  const queue = await getQueue();
  return queue.length;
}
