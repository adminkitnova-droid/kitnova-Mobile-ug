// Robust IndexedDB Persistence Layer for Offline Rider Proof of Delivery (POD) Records
import { ProofOfDelivery } from '../types';

export interface OfflinePendingPod {
  id: string; // Composite ID: pod-${orderId}
  orderId: string;
  orderNumber: string;
  proofOfDelivery: ProofOfDelivery;
  riderName: string;
  riderId: string;
  capturedAt: string;
  syncStatus: 'pending_sync' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  syncError?: string;
  networkAtCapture: 'offline' | 'online';
  updatedAt?: string;
}

const DB_NAME = 'kitnova_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'pending_pods';

type DbListener = () => void;

class OfflinePodDb {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private listeners: DbListener[] = [];

  subscribe(listener: DbListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (e) {
        console.error('Db listener error:', e);
      }
    });
  }

  private getDb(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !window.indexedDB) {
          reject(new Error('IndexedDB not supported in this browser/environment'));
          return;
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = event => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'orderId' });
            store.createIndex('syncStatus', 'syncStatus', { unique: false });
            store.createIndex('capturedAt', 'capturedAt', { unique: false });
            store.createIndex('riderId', 'riderId', { unique: false });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          this.dbPromise = null;
          reject(request.error || new Error('Failed to open IndexedDB'));
        };
      });
    }
    return this.dbPromise;
  }

  /**
   * Save a POD record to IndexedDB when captured (offline or archive)
   */
  async savePendingPod(record: OfflinePendingPod): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({
        ...record,
        updatedAt: new Date().toISOString()
      });

      req.onsuccess = () => {
        this.notify();
        resolve();
      };
      req.onerror = () => reject(req.error || new Error('Failed to save POD record to IndexedDB'));
    });
  }

  /**
   * Get all POD records that are pending synchronization to Supabase
   */
  async getPendingPods(): Promise<OfflinePendingPod[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const all: OfflinePendingPod[] = req.result || [];
        resolve(all.filter(p => p.syncStatus === 'pending_sync' || p.syncStatus === 'failed'));
      };
      req.onerror = () => reject(req.error || new Error('Failed to query pending PODs from IndexedDB'));
    });
  }

  /**
   * Get all records (including synced archive)
   */
  async getAllPods(): Promise<OfflinePendingPod[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error || new Error('Failed to fetch records from IndexedDB'));
    });
  }

  /**
   * Get specific POD record by orderId
   */
  async getPod(orderId: string): Promise<OfflinePendingPod | null> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(orderId);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Update sync status of a POD record
   */
  async updatePodStatus(
    orderId: string,
    status: 'pending_sync' | 'syncing' | 'synced' | 'failed',
    error?: string
  ): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(orderId);

      getReq.onsuccess = () => {
        const item = getReq.result as OfflinePendingPod | undefined;
        if (!item) {
          resolve();
          return;
        }
        item.syncStatus = status;
        item.updatedAt = new Date().toISOString();
        if (error) item.syncError = error;
        if (status === 'failed') item.retryCount = (item.retryCount || 0) + 1;
        const putReq = store.put(item);
        putReq.onsuccess = () => {
          this.notify();
          resolve();
        };
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  /**
   * Remove a POD record from IndexedDB
   */
  async deletePod(orderId: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(orderId);

      req.onsuccess = () => {
        this.notify();
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Clear all synced archive records
   */
  async clearSyncedPods(): Promise<void> {
    const all = await this.getAllPods();
    const db = await this.getDb();
    const synced = all.filter(p => p.syncStatus === 'synced');
    for (const item of synced) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(item.orderId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }
    this.notify();
  }

  /**
   * Get count of pending POD records awaiting sync
   */
  async getPendingCount(): Promise<number> {
    try {
      const pending = await this.getPendingPods();
      return pending.length;
    } catch {
      return 0;
    }
  }
}

export const offlinePodDb = new OfflinePodDb();
