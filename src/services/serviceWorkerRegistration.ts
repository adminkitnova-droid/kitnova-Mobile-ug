// Service Worker Registration & Client Listener for KITNOVA Rider App
import { podSyncManager } from './podSyncManager';

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          // Listen for background sync triggers from worker
          navigator.serviceWorker.addEventListener('message', event => {
            if (event.data?.type === 'TRIGGER_BACKGROUND_SYNC') {
              console.log('[Service Worker] Triggering background sync to Supabase...');
              podSyncManager.triggerAutomaticSync();
            }
          });

          // Check if periodic or online sync can be queued
          if ('sync' in registration) {
            (registration as any).sync.register('sync-pending-pods').catch(() => {});
          }
        })
        .catch(err => {
          // In development environments without full HTTPS or if disabled, gracefully fallback
          console.info('Service Worker registration note:', err?.message || err);
        });
    });
  }
}

export async function requestServiceWorkerSync(): Promise<boolean> {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register('sync-pending-pods');
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
