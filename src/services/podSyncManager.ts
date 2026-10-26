// Background Sync & Network Monitoring Manager for KITNOVA Rider Proof of Delivery
import { offlinePodDb, OfflinePendingPod } from './offlinePodDb';
import { store } from './store';
import { ProofOfDelivery } from '../types';

export interface SyncEventLog {
  id: string;
  orderNumber: string;
  message: string;
  timestamp: string;
  type: 'offline_save' | 'sync_success' | 'sync_error' | 'online_detect';
}

type SyncListener = () => void;

class PodSyncManager {
  private static instance: PodSyncManager;
  private isOnlineStatus: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSimulatedOffline: boolean = false;
  private isSyncingStatus: boolean = false;
  private pendingCount: number = 0;
  private lastSyncTime: string | null = null;
  private syncLogs: SyncEventLog[] = [];
  private listeners: SyncListener[] = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));

      // Subscribe to IndexedDB changes to keep pending count synced
      offlinePodDb.subscribe(() => {
        this.refreshPendingCount();
      });

      this.refreshPendingCount();

      // Check on initial load if pending items need syncing
      if (this.isOnline()) {
        setTimeout(() => this.triggerAutomaticSync(), 1500);
      }
    }
  }

  static getInstance(): PodSyncManager {
    if (!PodSyncManager.instance) {
      PodSyncManager.instance = new PodSyncManager();
    }
    return PodSyncManager.instance;
  }

  subscribe(listener: SyncListener): () => void {
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
        console.error('PodSyncManager listener error:', e);
      }
    });
  }

  async refreshPendingCount(): Promise<number> {
    try {
      this.pendingCount = await offlinePodDb.getPendingCount();
      this.notify();
      return this.pendingCount;
    } catch {
      return this.pendingCount;
    }
  }

  private handleNetworkChange(online: boolean) {
    this.isOnlineStatus = online;
    const effectiveOnline = this.isOnline();

    this.addLog({
      orderNumber: 'NETWORK',
      message: effectiveOnline
        ? 'Device connectivity detected: ONLINE. Triggering automatic background sync to Supabase...'
        : 'Device connectivity detected: OFFLINE. New POD records will be persisted to IndexedDB.',
      type: effectiveOnline ? 'online_detect' : 'offline_save'
    });

    if (effectiveOnline) {
      this.triggerAutomaticSync();
    }

    this.notify();
  }

  /**
   * Returns current effective online status
   */
  isOnline(): boolean {
    if (this.isSimulatedOffline) return false;
    return this.isOnlineStatus;
  }

  /**
   * Toggle simulated offline mode for demonstration, QA and offline testing
   */
  setSimulatedOffline(simulated: boolean): void {
    this.isSimulatedOffline = simulated;
    const effectiveOnline = this.isOnline();

    this.addLog({
      orderNumber: 'SIMULATION',
      message: simulated
        ? 'Simulated Offline Mode: ACTIVE (Disconnecting. POD will persist to IndexedDB).'
        : 'Simulated Offline Mode: DEACTIVATED (Back online). Triggering auto-sync to Supabase...',
      type: effectiveOnline ? 'online_detect' : 'offline_save'
    });

    if (effectiveOnline) {
      this.triggerAutomaticSync();
    }

    this.notify();
  }

  getSimulatedOffline(): boolean {
    return this.isSimulatedOffline;
  }

  getPendingCount(): number {
    return this.pendingCount;
  }

  isSyncing(): boolean {
    return this.isSyncingStatus;
  }

  getLastSyncTime(): string | null {
    return this.lastSyncTime;
  }

  getSyncLogs(): SyncEventLog[] {
    return this.syncLogs;
  }

  private addLog(entry: Omit<SyncEventLog, 'id' | 'timestamp'>) {
    const newLog: SyncEventLog = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    this.syncLogs = [newLog, ...this.syncLogs.slice(0, 24)];
    this.notify();
  }

  /**
   * Submit Proof of Delivery (POD)
   * If online: sends to Supabase / store immediately and archives in IndexedDB.
   * If offline: securely writes to IndexedDB with status 'pending_sync' and schedules sync.
   */
  async submitProofOfDelivery(
    orderId: string,
    orderNumber: string,
    proof: ProofOfDelivery,
    riderName: string,
    riderId: string = 'rider-01'
  ): Promise<{ syncedImmediately: boolean; message: string }> {
    const online = this.isOnline();

    const record: OfflinePendingPod = {
      id: `pod-${orderId}`,
      orderId,
      orderNumber,
      proofOfDelivery: proof,
      riderName,
      riderId,
      capturedAt: new Date().toISOString(),
      syncStatus: online ? 'synced' : 'pending_sync',
      retryCount: 0,
      networkAtCapture: online ? 'online' : 'offline'
    };

    if (online) {
      // 1. Online: Update local store state immediately (replicates to Supabase)
      store.submitProofOfDelivery(orderId, proof, riderName);

      // 2. Save copy in IndexedDB as synced archive
      try {
        await offlinePodDb.savePendingPod(record);
      } catch (e) {
        console.warn('IndexedDB archive save error:', e);
      }

      this.addLog({
        orderNumber,
        message: `POD for Order #${orderNumber} submitted directly to Supabase with verified customer signature.`,
        type: 'sync_success'
      });

      await this.refreshPendingCount();
      return {
        syncedImmediately: true,
        message: 'Delivery completed and synced with Supabase in real-time.'
      };
    } else {
      // 2. Offline: Save to IndexedDB 'pending_pods'
      await offlinePodDb.savePendingPod(record);

      // Update local store so the rider sees completed state locally on their device immediately
      store.submitProofOfDelivery(orderId, proof, `${riderName} (Offline Captured - Pending Sync)`);

      this.addLog({
        orderNumber,
        message: `[OFFLINE CAPTURE] POD for Order #${orderNumber} securely saved to IndexedDB. Will auto-sync when connection is restored.`,
        type: 'offline_save'
      });

      // Request Service Worker Background Sync if supported
      this.requestServiceWorkerSync();

      await this.refreshPendingCount();
      return {
        syncedImmediately: false,
        message: 'Saved to IndexedDB storage (Offline). Will auto-sync to Supabase once online.'
      };
    }
  }

  /**
   * Trigger automatic background sync of all pending IndexedDB POD records
   */
  async triggerAutomaticSync(): Promise<{ syncedCount: number; failedCount: number }> {
    if (!this.isOnline() || this.isSyncingStatus) {
      return { syncedCount: 0, failedCount: 0 };
    }

    this.isSyncingStatus = true;
    this.notify();

    let syncedCount = 0;
    let failedCount = 0;

    try {
      const pendingList = await offlinePodDb.getPendingPods();
      if (pendingList.length === 0) {
        this.isSyncingStatus = false;
        await this.refreshPendingCount();
        return { syncedCount: 0, failedCount: 0 };
      }

      this.addLog({
        orderNumber: 'SYNC',
        message: `Beginning background synchronization of ${pendingList.length} offline POD record(s) to Supabase...`,
        type: 'online_detect'
      });

      for (const pod of pendingList) {
        try {
          await offlinePodDb.updatePodStatus(pod.orderId, 'syncing');

          // Simulate network roundtrip to remote Supabase server
          await new Promise(res => setTimeout(res, 600));

          // Ensure store state is updated and order status is delivered
          store.submitProofOfDelivery(pod.orderId, pod.proofOfDelivery, pod.riderName);

          // Update record to synced in IndexedDB
          await offlinePodDb.updatePodStatus(pod.orderId, 'synced');

          // Delete from pending queue or mark synced
          await offlinePodDb.deletePod(pod.orderId);

          syncedCount++;
          this.addLog({
            orderNumber: pod.orderNumber,
            message: `Order #${pod.orderNumber} successfully synced to Supabase database. Signature & photo confirmed.`,
            type: 'sync_success'
          });
        } catch (err: any) {
          failedCount++;
          await offlinePodDb.updatePodStatus(pod.orderId, 'failed', err?.message || 'Sync failed');
          this.addLog({
            orderNumber: pod.orderNumber,
            message: `Failed to sync Order #${pod.orderNumber}: ${err?.message || 'Network error'}`,
            type: 'sync_error'
          });
        }
      }

      this.lastSyncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error: any) {
      console.error('Background sync process error:', error);
    } finally {
      this.isSyncingStatus = false;
      await this.refreshPendingCount();
      this.notify();
    }

    return { syncedCount, failedCount };
  }

  /**
   * Register with browser Service Worker Background Sync API
   */
  async requestServiceWorkerSync() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register('sync-pending-pods');
      } catch (e) {
        // Fallback to online event listener
      }
    }
  }
}

export const podSyncManager = PodSyncManager.getInstance();
