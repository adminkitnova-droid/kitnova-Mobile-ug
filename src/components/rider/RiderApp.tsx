import React, { useState, useEffect, useRef } from 'react';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Phone,
  Navigation,
  Shield,
  Clock,
  PenTool,
  Check,
  AlertCircle,
  RefreshCw,
  Volume2,
  BellRing,
  VolumeX,
  Sparkles,
  LogOut,
  Bell,
  Wifi,
  WifiOff,
  Database,
  UploadCloud,
  FileCheck,
  Layers
} from 'lucide-react';
import { store } from '../../services/store';
import { Order, Rider, ProofOfDelivery } from '../../types';
import { riderAlert } from '../../services/riderAlert';
import { RiderWeeklyChart } from './RiderWeeklyChart';
import { RiderLiveRouteMap } from './RiderLiveRouteMap';
import { RiderOfflineSyncManager } from './RiderOfflineSyncManager';
import { podSyncManager } from '../../services/podSyncManager';
import { offlinePodDb } from '../../services/offlinePodDb';
import { CachedImage } from '../common/CachedImage';

interface RiderAppProps {
  currentRiderId?: string;
  onLogout?: () => void;
}

export const RiderApp: React.FC<RiderAppProps> = ({ currentRiderId = 'rider-01', onLogout }) => {
  const [, setTick] = useState(0);
  const [notifPermission, setNotifPermission] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [incomingAlert, setIncomingAlert] = useState<{
    orderNumber: string;
    customerName: string;
    destination: string;
    orderId: string;
  } | null>(null);

  // Service Worker and IndexedDB state
  const [isOnline, setIsOnline] = useState(podSyncManager.isOnline());
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(podSyncManager.getSimulatedOffline());
  const [pendingCount, setPendingCount] = useState(podSyncManager.getPendingCount());
  const [isSyncing, setIsSyncing] = useState(podSyncManager.isSyncing());
  const [podToast, setPodToast] = useState<{ message: string; type: 'success' | 'offline' | 'error' } | null>(null);

  const prevOrdersCountRef = useRef<number>(0);

  useEffect(() => {
    // Store subscription
    const unsubStore = store.subscribe(() => {
      setTick(t => t + 1);

      // Check if a new order was assigned to this rider
      const riderOrders = store.orders.filter(o => o.assignedRiderId === currentRiderId);
      if (prevOrdersCountRef.current > 0 && riderOrders.length > prevOrdersCountRef.current) {
        const newest = riderOrders[0];
        if (newest && (newest.status === 'rider_assigned' || newest.status === 'ready')) {
          setIncomingAlert({
            orderNumber: newest.orderNumber,
            customerName: newest.customerName,
            destination: newest.deliveryAddress.streetAddress,
            orderId: newest.id
          });
          if (soundEnabled) {
            riderAlert.notifyNewTask(
              newest.orderNumber,
              newest.customerName,
              newest.deliveryAddress.streetAddress
            );
          }
        }
      }
      prevOrdersCountRef.current = riderOrders.length;
    });

    // Pod sync manager subscription
    const unsubSync = podSyncManager.subscribe(() => {
      setIsOnline(podSyncManager.isOnline());
      setIsSimulatedOffline(podSyncManager.getSimulatedOffline());
      setPendingCount(podSyncManager.getPendingCount());
      setIsSyncing(podSyncManager.isSyncing());
    });

    // IndexedDB listener
    const unsubDb = offlinePodDb.subscribe(() => {
      podSyncManager.refreshPendingCount();
    });

    return () => {
      unsubStore();
      unsubSync();
      unsubDb();
    };
  }, [currentRiderId, soundEnabled]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'deliveries' | 'map' | 'sync' | 'alerts' | 'profile'>('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Proof of Delivery Modal State
  const [showPodModal, setShowPodModal] = useState(false);
  const [podRecipientName, setPodRecipientName] = useState('');
  const [podNotes, setPodNotes] = useState('');
  const [podSigned, setPodSigned] = useState(false);

  const rider = store.riders.find(r => r.id === currentRiderId) || store.riders[0];

  const handleEnableWebNotifications = async () => {
    const perm = await riderAlert.requestNotificationPermission();
    setNotifPermission(perm);
    riderAlert.playDispatchChime();
  };

  const handleTestSoundAlert = () => {
    riderAlert.playDispatchChime();
    riderAlert.notifyNewTask('KTN-2026-TEST', 'David Mukasa', 'Acacia Mall, Kololo');
  };

  // Rider's assigned deliveries
  const myOrders = store.orders.filter(o => o.assignedRiderId === rider.id);
  const activeOrder = myOrders.find(o => o.status === 'rider_assigned' || o.status === 'picked_up' || o.status === 'out_for_delivery');
  const completedOrders = myOrders.filter(o => o.status === 'delivered');

  const handleUpdateStatus = (orderId: string, newStatus: 'picked_up' | 'out_for_delivery' | 'delivered') => {
    if (newStatus === 'delivered') {
      const ord = store.orders.find(o => o.id === orderId);
      setPodRecipientName(ord?.customerName || '');
      setSelectedOrderId(orderId);
      setShowPodModal(true);
      return;
    }

    store.updateOrderStatus(
      orderId,
      newStatus,
      rider.name,
      newStatus === 'picked_up'
        ? `Package picked up from Kitnova Central Store by ${rider.name}`
        : `Rider en-route with kit`
    );
  };

  const handleConfirmPod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;
    const ord = store.orders.find(o => o.id === selectedOrderId);
    if (!ord) return;

    const proof: ProofOfDelivery = {
      recipientName: podRecipientName,
      receivedAt: new Date().toISOString(),
      deliveryNotes: podNotes || 'Delivered directly to customer. Goods inspected.'
    };

    // Robust Service Worker & IndexedDB submission
    const res = await podSyncManager.submitProofOfDelivery(
      selectedOrderId,
      ord.orderNumber,
      proof,
      rider.name,
      rider.id
    );

    setPodToast({
      message: res.message,
      type: res.syncedImmediately ? 'success' : 'offline'
    });
    setTimeout(() => setPodToast(null), 5000);

    setShowPodModal(false);
    setSelectedOrderId(null);
    setPodNotes('');
    setPodSigned(false);
  };

  const handleToggleSimulatedOffline = () => {
    const nextState = !isSimulatedOffline;
    podSyncManager.setSimulatedOffline(nextState);
  };

  const handleManualSyncNow = async () => {
    if (!isOnline || isSyncing) return;
    const res = await podSyncManager.triggerAutomaticSync();
    if (res.syncedCount > 0) {
      setPodToast({
        message: `Synced ${res.syncedCount} POD record(s) to Supabase!`,
        type: 'success'
      });
      setTimeout(() => setPodToast(null), 4000);
    }
  };

  const handleToggleGps = () => {
    store.updateRiderLocation(
      rider.id,
      rider.currentCoordinates,
      !rider.isLocationSharingActive
    );
  };

  const handleSimulateMovement = () => {
    const landmarks = [
      'Acacia Avenue past Kisementi, Kololo',
      'Yusuf Lule Road near Garden City Roundabout',
      'Lugogo Bypass heading towards Village Mall Bugolobi',
      'Arrived outside customer gate'
    ];
    const randomLandmark = landmarks[Math.floor(Math.random() * landmarks.length)];
    store.updateRiderLocation(
      rider.id,
      {
        lat: 0.33 + Math.random() * 0.02,
        lng: 32.58 + Math.random() * 0.02,
        landmark: randomLandmark
      },
      true
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#071329] text-slate-100 flex flex-col">
      {/* Rider Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#0A1A3C] border-b border-slate-800 px-3 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4A029] text-[#0A1A3C] flex items-center justify-center font-black shadow-md shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              KITNOVA RIDER DISPATCH
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                ACTIVE COURIER
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-none">
              {rider.name} · {rider.vehiclePlate}
            </p>
          </div>
        </div>

        {/* Network State, Service Worker Background Sync & Audio Controls */}
        <div className="flex items-center gap-2">
          {/* Live Online / Offline State Badge with Drop Simulation */}
          <button
            onClick={handleToggleSimulatedOffline}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isOnline
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-amber-950/80 border-amber-500/70 text-amber-300 hover:bg-amber-900/60'
            }`}
            title="Click to toggle simulated offline/online connection for testing"
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px]">
              {isOnline ? 'Online (Supabase)' : 'Offline (IndexedDB)'}
            </span>
          </button>

          {/* Pending IndexedDB POD Counter Badge */}
          {pendingCount > 0 && (
            <button
              onClick={() => setActiveTab('sync')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-950/90 border border-amber-500/70 text-amber-300 text-xs font-bold flex items-center gap-1.5 animate-pulse cursor-pointer shadow-sm"
              title={`${pendingCount} Proof of Delivery record(s) queued in local IndexedDB. Tap to view.`}
            >
              <Database className="w-3.5 h-3.5 text-[#D4A029]" />
              <span className="font-mono text-[11px]">{pendingCount} Pending</span>
            </button>
          )}

          {/* Quick Sync Button */}
          {isOnline && pendingCount > 0 && (
            <button
              onClick={handleManualSyncNow}
              disabled={isSyncing}
              className="p-2 rounded-lg bg-[#0F2A5F] border border-[#D4A029]/50 text-[#D4A029] hover:bg-[#0F2A5F]/80 text-xs font-semibold cursor-pointer"
              title="Sync pending IndexedDB records to Supabase now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Sound Alert Audio Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) riderAlert.playDispatchChime();
            }}
            className={`p-2 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-[#0F2A5F] border-[#D4A029]/50 text-[#D4A029]'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={soundEnabled ? 'Dispatch Sound Alert: Enabled' : 'Dispatch Sound Alert: Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline text-[11px]">{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          {/* Web Notifications Permission Action */}
          <button
            onClick={handleEnableWebNotifications}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              notifPermission === 'granted'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/60'
            }`}
            title="Browser Web Notification Push API"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">
              {notifPermission === 'granted' ? 'Push Ready' : 'Enable Push'}
            </span>
          </button>

          {/* GPS Live Ping Control */}
          <button
            onClick={handleToggleGps}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
              rider.isLocationSharingActive
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/60 text-amber-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${rider.isLocationSharingActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span className="hidden sm:inline text-[11px]">{rider.isLocationSharingActive ? 'GPS Live' : 'GPS Idle'}</span>
          </button>

          {/* Direct Logout Action to Login Screen */}
          <button
            onClick={() => {
              store.logout();
              if (onLogout) onLogout();
            }}
            className="px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-500/50 text-red-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm ml-1"
            title="Log out of Rider App to Login Screen"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline text-[11px]">Log Out</span>
          </button>
        </div>
      </header>

      {/* Offline Toast Notification Banner */}
      {podToast && (
        <div
          className={`px-4 py-2.5 shadow-xl flex items-center justify-between text-xs font-semibold transition-all ${
            podToast.type === 'offline'
              ? 'bg-amber-500 text-slate-950'
              : podToast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            {podToast.type === 'offline' ? (
              <Database className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{podToast.message}</span>
          </div>
          <button
            onClick={() => setPodToast(null)}
            className="text-xs px-2 py-0.5 rounded bg-black/20 hover:bg-black/30 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Real-time Incoming Delivery Task Alert Banner (When Admin assigns an order) */}
      {incomingAlert && (
        <div className="bg-gradient-to-r from-[#D4A029] via-[#F0C760] to-[#B3831B] text-[#0A1A3C] px-4 py-3 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0A1A3C] text-[#D4A029] flex items-center justify-center font-bold">
              <BellRing className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-black tracking-wide uppercase">
                🚨 NEW DELIVERY TASK ASSIGNED: ORDER #{incomingAlert.orderNumber}
              </p>
              <p className="text-xs font-semibold">
                Customer: {incomingAlert.customerName} · Destination: {incomingAlert.destination}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                riderAlert.playDispatchChime();
                setSelectedOrderId(incomingAlert.orderId);
                setActiveTab('deliveries');
                setIncomingAlert(null);
              }}
              className="px-4 py-1.5 rounded-lg bg-[#0A1A3C] text-[#D4A029] font-black text-xs hover:bg-[#0F2A5F] transition-colors shadow-md cursor-pointer"
            >
              Accept & View Run
            </button>
            <button
              onClick={() => setIncomingAlert(null)}
              className="p-1 text-[#0A1A3C] hover:text-black font-bold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Rider Navigation Sub-tabs */}
      <div className="bg-[#0A1A3C]/90 border-b border-slate-800 px-4 sm:px-6 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'border-[#D4A029] text-[#D4A029]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Dashboard & KPIs
        </button>
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'deliveries'
              ? 'border-[#D4A029] text-[#D4A029]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Assigned Tasks ({myOrders.length})
          {activeOrder && (
            <span className="w-2 h-2 rounded-full bg-[#D4A029] animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'map'
              ? 'border-[#D4A029] text-[#D4A029]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          Active Route & Map
        </button>
        <button
          onClick={() => setActiveTab('sync')}
          className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'sync'
              ? 'border-[#D4A029] text-[#D4A029]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Offline POD & Sync
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-mono font-black">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'alerts'
              ? 'border-[#D4A029] text-[#D4A029]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          Alerts & Push
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-[#D4A029] text-[#D4A029]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Rider Profile
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-4 shadow-lg">
                <span className="text-slate-400 text-xs">Active Job</span>
                <p className="text-2xl font-black text-white font-mono mt-1">
                  {activeOrder ? '1 Task' : '0'}
                </p>
                <p className="text-[11px] text-[#D4A029] mt-1 font-medium">
                  {activeOrder ? activeOrder.status.replace(/_/g, ' ') : 'Ready for dispatch'}
                </p>
              </div>

              <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-4 shadow-lg">
                <span className="text-slate-400 text-xs">Completed Today</span>
                <p className="text-2xl font-black text-white font-mono mt-1">
                  {completedOrders.length}
                </p>
                <p className="text-[11px] text-emerald-400 mt-1 font-medium">100% on-time</p>
              </div>

              <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-4 shadow-lg">
                <span className="text-slate-400 text-xs">Today's Earnings</span>
                <p className="text-xl sm:text-2xl font-black text-[#D4A029] font-mono mt-1">
                  UGX {(completedOrders.length * 12000).toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Payout via MTN MoMo</p>
              </div>

              <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-4 shadow-lg">
                <span className="text-slate-400 text-xs">Rider Rating</span>
                <p className="text-2xl font-black text-white font-mono mt-1">
                  ★ {rider.rating}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Total {rider.totalCompletedDeliveries} lifetime</p>
              </div>
            </div>

            {/* Active Delivery Card (High Intent) */}
            {activeOrder ? (
              <div className="bg-[#0A1A3C] border-2 border-[#D4A029]/60 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A029]">
                      CURRENT ACTIVE RUN
                    </span>
                    <h2 className="text-lg font-bold text-white">
                      Order #{activeOrder.orderNumber}
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded bg-[#0F2A5F] text-[#D4A029] font-mono text-xs font-bold uppercase border border-[#D4A029]/30">
                    STATUS: {activeOrder.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Destination & Customer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Customer & Destination</span>
                    <p className="font-bold text-white text-sm">{activeOrder.customerName}</p>
                    <p className="text-slate-300 mt-0.5">{activeOrder.deliveryAddress.streetAddress}</p>
                    {activeOrder.deliveryAddress.landmark && (
                      <p className="text-[#D4A029] mt-0.5">Landmark: {activeOrder.deliveryAddress.landmark}</p>
                    )}
                    <p className="text-slate-400 mt-1">Zone: {activeOrder.deliveryAddress.zoneName}</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-400 block mb-1">Package Contents</span>
                      {activeOrder.items.map(it => (
                        <p key={it.id} className="text-slate-200">
                          • {it.quantity}x {it.productName} ({it.size})
                          {it.customSummary && ` [NAME: ${it.customSummary.playerName} #${it.customSummary.playerNumber}]`}
                        </p>
                      ))}
                    </div>

                    <a
                      href={`tel:${activeOrder.customerPhone}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F2A5F] border border-slate-700 text-xs font-semibold text-white hover:text-[#D4A029]"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#D4A029]" />
                      Call Customer ({activeOrder.customerPhone})
                    </a>
                  </div>
                </div>

                {/* Rider Action Workflow Pipeline Buttons */}
                <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-3">
                  {activeOrder.status === 'rider_assigned' && (
                    <button
                      onClick={() => handleUpdateStatus(activeOrder.id, 'picked_up')}
                      className="flex-1 py-3 px-4 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold text-xs hover:bg-[#F0C760] transition-colors cursor-pointer"
                    >
                      Confirm Pickup at Kitnova Central Hub
                    </button>
                  )}

                  {activeOrder.status === 'picked_up' && (
                    <button
                      onClick={() => handleUpdateStatus(activeOrder.id, 'out_for_delivery')}
                      className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-colors cursor-pointer"
                    >
                      Start En-Route Delivery (Out with Rider)
                    </button>
                  )}

                  {activeOrder.status === 'out_for_delivery' && (
                    <button
                      onClick={() => handleUpdateStatus(activeOrder.id, 'delivered')}
                      className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Arrived & Submit Proof of Delivery (POD)
                    </button>
                  )}

                  <button
                    onClick={handleSimulateMovement}
                    className="px-4 py-3 rounded-xl bg-[#0F2A5F] border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
                    title="Simulate GPS road position update"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Ping GPS
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">All Assigned Runs Completed</h3>
                <p className="text-xs">Your queue is clear. Stay online to receive the next dispatch from Central Store.</p>
              </div>
            )}

            {/* Recharts Weekly Delivery Completion & Earnings Growth Chart (Prompt 2 requirement) */}
            <RiderWeeklyChart />
          </div>
        )}

        {/* TAB 2: DELIVERIES LIST */}
        {activeTab === 'deliveries' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">All Assigned Orders</h2>
              <span className="text-xs text-slate-400 font-mono">
                {myOrders.length} {myOrders.length === 1 ? 'Job' : 'Jobs'}
              </span>
            </div>

            {myOrders.length === 0 ? (
              <p className="text-xs text-slate-400">No deliveries assigned to your profile yet.</p>
            ) : (
              myOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white font-mono text-sm">
                        {order.orderNumber}
                      </span>
                      <p className="text-xs text-slate-400">{order.customerName} · {order.deliveryAddress.streetAddress}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.proofOfDelivery && (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> POD VERIFIED
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded bg-[#0F2A5F] text-[#D4A029] font-mono text-xs font-bold uppercase border border-[#D4A029]/30">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400 font-mono">
                      Total: UGX {order.totalAmount.toLocaleString()} ({order.paymentMethod.toUpperCase()})
                    </span>
                    {order.status !== 'delivered' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 cursor-pointer flex items-center gap-1.5 shadow-md"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        Complete Delivery (POD)
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: ACTIVE ROUTE & MAP (Real-time dynamic mini-map) */}
        {activeTab === 'map' && (
          <RiderLiveRouteMap
            rider={rider}
            activeOrder={activeOrder}
            onSimulateMovement={handleSimulateMovement}
          />
        )}

        {/* TAB 4: OFFLINE POD & SYNC MANAGER (Prompt 4 requirement) */}
        {activeTab === 'sync' && (
          <RiderOfflineSyncManager />
        )}

        {/* TAB 5: ALERTS & NOTIFICATIONS */}
        {activeTab === 'alerts' && (
          <div className="bg-[#0A1A3C] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 max-w-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#D4A029]" />
                  Courier Alerts & Push Gateway
                </h2>
                <p className="text-xs text-slate-400">Real-time task dispatch alerts and web notifications</p>
              </div>

              <button
                onClick={handleTestSoundAlert}
                className="px-3 py-1.5 rounded-lg bg-[#0F2A5F] border border-[#D4A029]/40 text-[#D4A029] text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#0F2A5F]/80"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Test Chime
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F2A5F]/30 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold">Web Notifications API Permission:</span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                  notifPermission === 'granted' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                }`}>
                  {notifPermission.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                When granted, notifications appear on your desktop or mobile home lockscreen even when this tab is in the background.
              </p>
              {notifPermission !== 'granted' && (
                <button
                  onClick={handleEnableWebNotifications}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-[#D4A029] text-[#0A1A3C] font-bold text-xs cursor-pointer"
                >
                  Grant Web Push Permissions
                </button>
              )}
            </div>

            {/* Notification items */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Recent Dispatch Events</span>
              {store.notifications
                .filter(n => n.targetRole === 'rider' || n.targetRole === 'all')
                .map(n => (
                  <div key={n.id} className="p-3.5 rounded-xl bg-[#0F2A5F]/20 border border-slate-800 text-xs space-y-1">
                    <p className="font-bold text-white">{n.title}</p>
                    <p className="text-slate-300 text-[11px]">{n.message}</p>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 6: RIDER PROFILE */}
        {activeTab === 'profile' && (
          <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 max-w-xl">
            <div className="flex items-center gap-4">
              <CachedImage
                src={rider.avatarUrl}
                alt={rider.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border border-[#D4A029]"
              />
              <div>
                <h2 className="text-lg font-bold text-white">{rider.name}</h2>
                <p className="text-xs text-[#D4A029]">{rider.email}</p>
                <p className="text-xs text-slate-400">{rider.phone}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-slate-800 pt-4">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Assigned Vehicle</span>
                <span className="font-bold text-white">{rider.vehiclePlate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Total Lifetime Deliveries</span>
                <span className="font-mono font-bold text-[#D4A029]">{rider.totalCompletedDeliveries}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Operational Hub</span>
                <span className="text-slate-200">Kampala Central Station</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Role Authority</span>
                <span className="text-emerald-400 font-mono font-bold">RIDER COURIER</span>
              </div>
            </div>

            {/* Logout Action */}
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  store.logout();
                  if (onLogout) onLogout();
                }}
                className="w-full py-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/50 text-red-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Log Out of Rider App</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* PROOF OF DELIVERY (POD) MODAL WITH SERVICE WORKER & INDEXEDDB OFFLINE SUPPORT */}
      {showPodModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmPod}
            className="bg-[#0A1A3C] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#D4A029]" />
                <h3 className="text-base font-bold text-white">Proof of Delivery (POD)</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Order #{selectedOrderId}</span>
            </div>

            {/* Offline vs Online Mode Info in Modal */}
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 font-medium ${
                isOnline
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Online Mode: POD record will sync directly to Supabase and archive to IndexedDB.</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Offline Mode: POD record will be saved to IndexedDB and automatically synced to Supabase when reconnected.</span>
                </>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Recipient Full Name
              </label>
              <input
                type="text"
                required
                value={podRecipientName}
                onChange={e => setPodRecipientName(e.target.value)}
                placeholder="e.g. David Mukasa / Receptionist"
                className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#D4A029]"
              />
            </div>

            {/* Digital Signature Confirmation Pad */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Customer Signature & Handoff Confirmation
              </label>
              <div
                onClick={() => setPodSigned(!podSigned)}
                className={`w-full h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  podSigned
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                    : 'bg-[#0F2A5F]/20 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {podSigned ? (
                  <div className="text-center">
                    <Check className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                    <span className="text-xs font-bold font-mono">DIGITALLY SIGNED & VERIFIED</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <PenTool className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">Tap to capture recipient digital signature</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Handover Notes (Optional)
              </label>
              <input
                type="text"
                value={podNotes}
                onChange={e => setPodNotes(e.target.value)}
                placeholder="e.g. Received at reception, ID inspected"
                className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#D4A029]"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowPodModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!podSigned || !podRecipientName.trim()}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 disabled:opacity-40 cursor-pointer shadow-lg flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isOnline ? 'Confirm & Sync to Supabase' : 'Save Offline (IndexedDB)'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
