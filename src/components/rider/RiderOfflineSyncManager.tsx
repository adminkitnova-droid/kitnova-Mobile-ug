import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { podSyncManager, SyncEventLog } from '../../services/podSyncManager';
import { offlinePodDb, OfflinePendingPod } from '../../services/offlinePodDb';

export const RiderOfflineSyncManager: React.FC = () => {
  const [isOnline, setIsOnline] = useState(podSyncManager.isOnline());
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(podSyncManager.getSimulatedOffline());
  const [pendingCount, setPendingCount] = useState(podSyncManager.getPendingCount());
  const [isSyncing, setIsSyncing] = useState(podSyncManager.isSyncing());
  const [lastSyncTime, setLastSyncTime] = useState(podSyncManager.getLastSyncTime());
  const [syncLogs, setSyncLogs] = useState<SyncEventLog[]>(podSyncManager.getSyncLogs());
  const [allPods, setAllPods] = useState<OfflinePendingPod[]>([]);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const loadPods = async () => {
    try {
      const records = await offlinePodDb.getAllPods();
      setAllPods(records);
      const count = await offlinePodDb.getPendingCount();
      setPendingCount(count);
    } catch (e) {
      console.error('Failed to load pods:', e);
    }
  };

  useEffect(() => {
    loadPods();

    const unsubManager = podSyncManager.subscribe(() => {
      setIsOnline(podSyncManager.isOnline());
      setIsSimulatedOffline(podSyncManager.getSimulatedOffline());
      setPendingCount(podSyncManager.getPendingCount());
      setIsSyncing(podSyncManager.isSyncing());
      setLastSyncTime(podSyncManager.getLastSyncTime());
      setSyncLogs(podSyncManager.getSyncLogs());
      loadPods();
    });

    const unsubDb = offlinePodDb.subscribe(() => {
      loadPods();
    });

    return () => {
      unsubManager();
      unsubDb();
    };
  }, []);

  const handleToggleSimulatedOffline = () => {
    const nextState = !isSimulatedOffline;
    podSyncManager.setSimulatedOffline(nextState);
    setIsSimulatedOffline(nextState);
    setIsOnline(!nextState);
  };

  const handleManualSync = async () => {
    setSyncFeedback('Initiating background synchronization to Supabase...');
    const result = await podSyncManager.triggerAutomaticSync();
    if (result.syncedCount > 0) {
      setSyncFeedback(`Successfully synced ${result.syncedCount} POD record(s) to Supabase.`);
    } else if (result.failedCount > 0) {
      setSyncFeedback(`Encountered issues syncing ${result.failedCount} record(s). Retrying on next network heartbeat.`);
    } else {
      setSyncFeedback('All offline POD records are already in sync with Supabase.');
    }
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const handleClearArchive = async () => {
    await offlinePodDb.clearSyncedPods();
    loadPods();
    setSyncFeedback('Cleared synced history archive from local IndexedDB.');
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  const pendingPods = allPods.filter(p => p.syncStatus === 'pending_sync' || p.syncStatus === 'failed');
  const syncedPods = allPods.filter(p => p.syncStatus === 'synced');

  return (
    <div className="bg-[#0A1A3C] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#D4A029]" />
            <h2 className="text-lg font-black text-white tracking-tight">
              Service Worker & IndexedDB Offline State Manager
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-500/40 font-mono">
              SW SYNC v2
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatic offline resilience: Proof of Delivery records are stored in browser IndexedDB when offline and auto-synced to Supabase upon online detection.
          </p>
        </div>

        {/* Network & Simulation Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSimulatedOffline}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
              isSimulatedOffline
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 ring-2 ring-amber-500/20'
                : 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
            }`}
            title="Toggle offline state to test IndexedDB capture and auto-sync"
          >
            {isSimulatedOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isSimulatedOffline ? 'Simulating OFFLINE' : 'Network: ONLINE'}</span>
          </button>

          <button
            onClick={handleManualSync}
            disabled={!isOnline || isSyncing || pendingCount === 0}
            className="px-3.5 py-1.5 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold text-xs hover:bg-[#F0C760] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync to Supabase'}</span>
          </button>
        </div>
      </div>

      {/* Sync Feedback Toast */}
      {syncFeedback && (
        <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-200 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D4A029]" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Status Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-[#0F2A5F]/30 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-blue-400" />
            Connection Status
          </span>
          <p className="text-base font-black text-white font-mono flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </p>
          <span className="text-[10px] text-slate-400 font-mono">
            {isSimulatedOffline ? 'Simulated drop active' : 'Live browser connectivity'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0F2A5F]/30 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-[#D4A029]" />
            IndexedDB Pending Queue
          </span>
          <p className={`text-base font-black font-mono ${pendingCount > 0 ? 'text-[#D4A029]' : 'text-emerald-400'}`}>
            {pendingCount} {pendingCount === 1 ? 'Record' : 'Records'}
          </p>
          <span className="text-[10px] text-slate-400 font-mono">
            {pendingCount > 0 ? 'Awaiting online sync' : 'IndexedDB in sync'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0F2A5F]/30 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
            <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
            Last Background Sync
          </span>
          <p className="text-base font-black text-white font-mono">
            {lastSyncTime || 'Pending trigger'}
          </p>
          <span className="text-[10px] text-emerald-400 font-mono">
            {isSyncing ? 'Sync active now...' : 'Supabase REST connected'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0F2A5F]/30 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            Local POD Archive
          </span>
          <p className="text-base font-black text-purple-300 font-mono">
            {allPods.length} Total
          </p>
          <span className="text-[10px] text-slate-400 font-mono">
            {syncedPods.length} Synced · {pendingPods.length} Pending
          </span>
        </div>
      </div>

      {/* Offline Instructions / Warning Banner */}
      {!isOnline && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs space-y-1.5 animate-pulse">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>DEVICE CURRENTLY DISCONNECTED FROM INTERNET</span>
          </div>
          <p className="text-[11px] text-amber-200/90 leading-relaxed">
            All Proof of Delivery submissions (recipient name, customer signature, handover notes, and coordinates) will be stored immediately in your device's <strong>IndexedDB (kitnova_offline_db)</strong>. Once connectivity is restored, the Service Worker background sync triggers an automatic sync to Supabase without requiring rider intervention.
          </p>
        </div>
      )}

      {/* Pending Records in IndexedDB */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-[#D4A029]" />
            IndexedDB Object Store: `pending_pods` ({pendingPods.length} Pending Sync)
          </h3>
          {syncedPods.length > 0 && (
            <button
              onClick={handleClearArchive}
              className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              Clear Synced History ({syncedPods.length})
            </button>
          )}
        </div>

        {allPods.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#0F2A5F]/20 border border-slate-800 text-center text-xs text-slate-400">
            <Database className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p>No POD records stored in IndexedDB yet.</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Deliver an order while offline to test local persistence and background sync.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allPods.map(pod => (
              <div
                key={pod.orderId}
                className={`p-4 rounded-2xl border transition-all text-xs space-y-2.5 ${
                  pod.syncStatus === 'pending_sync'
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : pod.syncStatus === 'syncing'
                    ? 'bg-blue-950/20 border-blue-500/40 animate-pulse'
                    : pod.syncStatus === 'synced'
                    ? 'bg-emerald-950/15 border-emerald-500/30'
                    : 'bg-red-950/20 border-red-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm">
                      Order #{pod.orderNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        pod.syncStatus === 'pending_sync'
                          ? 'bg-amber-900/60 text-amber-300 border border-amber-500/40'
                          : pod.syncStatus === 'syncing'
                          ? 'bg-blue-900/60 text-blue-300 border border-blue-500/40'
                          : pod.syncStatus === 'synced'
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                          : 'bg-red-900/60 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {pod.syncStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(pod.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recipient:</span>
                    <span className="font-semibold text-white">{pod.proofOfDelivery.recipientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Captured Under:</span>
                    <span className="font-mono text-xs uppercase text-[#D4A029]">
                      {pod.networkAtCapture} mode
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Signature:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Digitally Verified
                    </span>
                  </div>
                  {pod.proofOfDelivery.deliveryNotes && (
                    <div className="pt-1 text-[11px] text-slate-400 italic">
                      "{pod.proofOfDelivery.deliveryNotes}"
                    </div>
                  )}
                </div>

                {/* Status indicator / error */}
                {pod.syncStatus === 'pending_sync' && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-amber-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Queued in IndexedDB
                    </span>
                    {isOnline && (
                      <button
                        onClick={handleManualSync}
                        className="text-[#D4A029] hover:underline font-bold"
                      >
                        Sync Now →
                      </button>
                    )}
                  </div>
                )}

                {pod.syncStatus === 'synced' && (
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Successfully persisted to Supabase
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real-time Background Sync Audit Log */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          Service Worker Background Sync Event Log
        </h3>

        <div className="bg-[#071329] border border-slate-800 rounded-2xl p-4 max-h-56 overflow-y-auto space-y-2 font-mono text-[11px]">
          {syncLogs.length === 0 ? (
            <p className="text-slate-500 italic">No sync events logged yet. Events will appear here in real time.</p>
          ) : (
            syncLogs.map(log => (
              <div
                key={log.id}
                className="flex items-start justify-between gap-3 pb-1.5 border-b border-slate-800/50 last:border-0"
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 mt-0.5 ${
                      log.type === 'sync_success'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : log.type === 'offline_save'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : log.type === 'online_detect'
                        ? 'bg-blue-950 text-blue-300 border border-blue-500/40'
                        : 'bg-red-950 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {log.type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-slate-300 leading-snug">{log.message}</span>
                </div>
                <span className="text-slate-500 shrink-0 text-[10px]">{log.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
