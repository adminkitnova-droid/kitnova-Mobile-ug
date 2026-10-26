import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, Truck, CheckCircle2, Clock, MapPin, ShieldCheck, AlertCircle } from 'lucide-react';
import { Order } from '../../types';
import { store } from '../../services/store';
import { CachedImage } from '../common/CachedImage';

interface CustomerTrackingProps {
  orderId?: string;
  onBack: () => void;
}

export const CustomerTracking: React.FC<CustomerTrackingProps> = ({ orderId, onBack }) => {
  // Listen for live updates
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const order = orderId
    ? store.orders.find(o => o.id === orderId)
    : store.orders.find(o => o.status === 'out_for_delivery') || store.orders[0];

  if (!order) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-20 text-center text-slate-400">
        <p>No active delivery to track.</p>
        <button onClick={onBack} className="mt-4 text-xs text-[#D4A029] hover:underline">
          Return to Store
        </button>
      </div>
    );
  }

  const assignedRider = order.assignedRiderId
    ? store.riders.find(r => r.id === order.assignedRiderId)
    : null;

  // Pipeline Steps
  const steps = [
    { key: 'pending', label: 'Order Received' },
    { key: 'paid', label: 'Payment Verified' },
    { key: 'customization_review', label: 'Customization Review' },
    { key: 'ready', label: 'Kit Ready at Hub' },
    { key: 'out_for_delivery', label: 'Out with Rider' },
    { key: 'delivered', label: 'Delivered' }
  ];

  const getStepStatus = (stepKey: string) => {
    const stepOrder = ['pending', 'paid', 'customization_review', 'ready', 'rider_assigned', 'picked_up', 'out_for_delivery', 'delivered'];
    const currentIdx = stepOrder.indexOf(order.status);
    const targetIdx = stepOrder.indexOf(stepKey);

    if (currentIdx > targetIdx || order.status === 'delivered') return 'completed';
    if (currentIdx === targetIdx || (stepKey === 'out_for_delivery' && (order.status === 'rider_assigned' || order.status === 'picked_up'))) return 'current';
    return 'upcoming';
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#D4A029] mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Tracking Order #{order.orderNumber}
            </h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold font-mono uppercase bg-[#0F2A5F] text-[#D4A029] border border-[#D4A029]/30">
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          <p>Order Placed: <strong className="text-slate-200">{new Date(order.createdAt).toLocaleDateString()}</strong></p>
          <p>Payment: <strong className="text-slate-200 uppercase font-mono">{order.paymentMethod.replace(/_/g, ' ')} ({order.paymentStatus})</strong></p>
        </div>
      </div>

      {/* Real-Time Progress Timeline */}
      <div className="bg-[#0A1A3C]/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6">
          Order Progress Timeline
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
          {steps.map((step, idx) => {
            const status = getStepStatus(step.key);
            return (
              <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                    status === 'completed'
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : status === 'current'
                      ? 'bg-[#D4A029] border-[#F0C760] text-[#0A1A3C] shadow-lg animate-pulse'
                      : 'bg-[#0F2A5F]/40 border-slate-700 text-slate-500'
                  }`}
                >
                  {status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    status === 'current' ? 'text-[#D4A029]' : status === 'completed' ? 'text-slate-200' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Rider Dispatch Card + Simulated GPS Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Assigned Rider Details */}
        <div className="lg:col-span-5 bg-[#0A1A3C]/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#D4A029]" />
            Delivery Rider Dispatch
          </h2>

          {assignedRider ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <CachedImage
                  src={assignedRider.avatarUrl}
                  alt={assignedRider.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover border border-[#D4A029]/50 shadow-md"
                />
                <div>
                  <h3 className="text-base font-bold text-white">{assignedRider.name}</h3>
                  <p className="text-xs text-[#D4A029] font-medium">{assignedRider.vehiclePlate}</p>
                  <p className="text-xs text-slate-400">★ {assignedRider.rating} · {assignedRider.totalCompletedDeliveries} deliveries</p>
                </div>
              </div>

              {/* Call Rider CTA */}
              <a
                href={`tel:${assignedRider.phone}`}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0F2A5F] hover:bg-[#0F2A5F]/80 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#D4A029]" />
                Call Rider ({assignedRider.phone})
              </a>

              {/* GPS Live Status Indicator */}
              <div className="p-3 rounded-xl bg-[#0F2A5F]/40 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Live GPS Status</span>
                  {assignedRider.isLocationSharingActive ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Active Ping
                    </span>
                  ) : (
                    <span className="text-amber-400 font-mono text-[11px]">Signal Stale</span>
                  )}
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {assignedRider.currentCoordinates.landmark}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
              <Clock className="w-8 h-8 text-[#D4A029] mx-auto animate-spin" />
              <p className="font-semibold text-slate-300">Assigning Rider from Central Hub</p>
              <p>Your kit is undergoing final heat-press quality check. A courier will be assigned shortly.</p>
            </div>
          )}

          {/* Delivery Address Card */}
          <div className="pt-4 border-t border-slate-800 space-y-1 text-xs">
            <span className="font-semibold text-slate-300 block">Delivery Address</span>
            <p className="text-slate-200">{order.deliveryAddress.fullName}</p>
            <p className="text-slate-400">{order.deliveryAddress.streetAddress}</p>
            {order.deliveryAddress.landmark && (
              <p className="text-[#D4A029]">Landmark: {order.deliveryAddress.landmark}</p>
            )}
            <p className="text-slate-500 font-mono pt-1">Zone: {order.deliveryAddress.zoneName}</p>
          </div>
        </div>

        {/* Right Column: Simulated Kampala Route Map */}
        <div className="lg:col-span-7 bg-[#0A1A3C]/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D4A029]" />
              <span className="font-bold text-white">Live Route Tracker (Kampala Metro)</span>
            </div>
            <span className="text-slate-400 font-mono">ETA: ~25 mins</span>
          </div>

          {/* Simulated Map Canvas */}
          <div className="relative w-full aspect-[16/10] bg-[#0A1A3C] rounded-xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
            {/* Map Roads & Grid SVG Pattern */}
            <svg viewBox="0 0 500 320" className="w-full h-full opacity-60">
              <defs>
                <pattern id="cityGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cityGrid)" />

              {/* Main Arterial Roads (Jinja Rd, Yusuf Lule Rd, Acacia Ave) */}
              <path
                d="M 50 280 C 140 220 220 200 320 180 C 390 160 440 90 480 40"
                fill="none"
                stroke="#334155"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 80 40 C 160 110 240 160 320 180 C 380 195 440 260 480 300"
                fill="none"
                stroke="#334155"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Active Delivery Route Line */}
              <path
                d="M 120 230 C 180 190 240 180 330 160"
                fill="none"
                stroke="#D4A029"
                strokeWidth="4"
                strokeDasharray="6 4"
                className="animate-pulse"
              />

              {/* Central Store Origin Pin */}
              <g transform="translate(120, 230)">
                <circle r="6" fill="#0F2A5F" stroke="#FFFFFF" strokeWidth="2" />
                <text x="10" y="4" fill="#94A3B8" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
                  KITNOVA Hub
                </text>
              </g>

              {/* Customer Destination Pin */}
              <g transform="translate(330, 160)">
                <circle r="8" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                <text x="12" y="4" fill="#10B981" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
                  Customer Destination
                </text>
              </g>

              {/* Rider In-Transit Marker */}
              {assignedRider && (
                <g transform="translate(250, 175)">
                  <circle r="12" fill="#D4A029" fillOpacity="0.3" className="animate-ping" />
                  <circle r="7" fill="#D4A029" stroke="#0A1A3C" strokeWidth="2" />
                  <text x="-25" y="-12" fill="#D4A029" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
                    Rider: {assignedRider.name.split(' ')[0]}
                  </text>
                </g>
              )}
            </svg>

            {/* Overlay Map Badge */}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-[#0A1A3C]/90 border border-slate-700/80 text-[11px] text-slate-300 backdrop-blur-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Kololo - Lugogo Bypass Corridor</span>
            </div>
          </div>

          {/* Proof of Delivery Card (if already completed) */}
          {order.proofOfDelivery && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Proof of Delivery Confirmed</span>
              </div>
              <p className="text-slate-300">
                Received by: <strong className="text-white">{order.proofOfDelivery.recipientName}</strong>
              </p>
              <p className="text-[11px] text-slate-400">
                Timestamp: {new Date(order.proofOfDelivery.receivedAt).toLocaleString()}
              </p>
              {order.proofOfDelivery.deliveryNotes && (
                <p className="text-slate-300 italic">"{order.proofOfDelivery.deliveryNotes}"</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
