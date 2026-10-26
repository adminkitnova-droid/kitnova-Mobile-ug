import React, { useState } from 'react';
import { Truck, MapPin, Navigation, Clock, ShieldCheck, CheckCircle2, AlertTriangle, Phone, Radio } from 'lucide-react';
import { store } from '../../services/store';
import { CachedImage } from '../common/CachedImage';

export const AdminDeliveries: React.FC = () => {
  const riders = store.riders;
  const activeOrders = store.orders.filter(
    o => o.status === 'out_for_delivery' || o.status === 'picked_up' || o.status === 'rider_assigned'
  );

  const [selectedRiderId, setSelectedRiderId] = useState<string | null>(riders[0]?.id || null);

  const selectedRider = riders.find(r => r.id === selectedRiderId);
  const selectedOrder = activeOrders.find(o => o.assignedRiderId === selectedRiderId);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#D4A029] font-bold font-mono">
            FLEET TELEMETRY & KAMPALA DISPATCH
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Deliveries & Live Dispatch Monitor
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time courier GPS coordinates, route transit times, on-time delivery SLAs, and dispatch status.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#0A1A3C] px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-bold">{riders.filter(r => r.status === 'busy').length} ACTIVE RUNS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Courier Roster */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Kampala Couriers Fleet</h2>
          <div className="space-y-3">
            {riders.map(rider => {
              const order = activeOrders.find(o => o.assignedRiderId === rider.id);
              const isSelected = selectedRiderId === rider.id;
              return (
                <div
                  key={rider.id}
                  onClick={() => setSelectedRiderId(rider.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#D4A029]/15 border-[#D4A029]'
                      : 'bg-[#0A1A3C] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CachedImage
                        src={rider.avatarUrl}
                        alt={rider.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <p className="font-bold text-white text-xs">{rider.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{rider.vehiclePlate}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        rider.status === 'busy'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                          : rider.status === 'available'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rider.status}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-[#D4A029]" />
                      <span className="truncate">{rider.currentCoordinates.landmark}</span>
                    </p>
                    {order && (
                      <p className="text-[#D4A029] font-mono font-semibold">
                        Delivering {order.orderNumber} → {order.deliveryAddress.streetAddress}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Map Telemetry & Active Run Details */}
        <div className="lg:col-span-7 bg-[#0A1A3C] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Courier GPS Radar & Destination</h2>
              <p className="text-xs text-slate-400">
                {selectedRider?.name} ({selectedRider?.vehiclePlate})
              </p>
            </div>
            <a
              href={`tel:${selectedRider?.phone}`}
              className="px-3 py-1.5 rounded-xl bg-[#0F2A5F] hover:bg-[#0F2A5F]/80 text-[#D4A029] text-xs font-bold flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Courier</span>
            </a>
          </div>

          {/* Radar Mock Visualization */}
          <div className="h-64 rounded-2xl bg-[#071329] border border-slate-800 relative overflow-hidden flex items-center justify-center p-4">
            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#0F2A5F_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

            {/* Central Hub Marker */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-[#0F2A5F] border-2 border-[#D4A029] flex items-center justify-center text-[10px] font-bold text-[#D4A029]">
                H
              </div>
              <span className="text-[9px] font-mono text-slate-400 mt-1">Kitnova Hub (Industrial Area)</span>
            </div>

            {/* Courier Marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center animate-pulse">
                <Truck className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="text-[10px] font-bold text-white mt-1">{selectedRider?.name}</span>
              <span className="text-[9px] font-mono text-emerald-400">32 km/h en route</span>
            </div>

            {/* Destination Marker */}
            {selectedOrder && (
              <div className="absolute bottom-1/4 right-1/4 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-red-500/30 border-2 border-red-400 flex items-center justify-center text-red-200">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-mono text-slate-300 mt-1 truncate max-w-[140px]">
                  {selectedOrder.deliveryAddress.streetAddress}
                </span>
              </div>
            )}
          </div>

          {/* Active Order Details */}
          {selectedOrder ? (
            <div className="bg-[#071329] p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">Order {selectedOrder.orderNumber}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 font-mono font-bold text-[10px]">
                  {selectedOrder.status.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px]">
                <p>Recipient: <strong className="text-white">{selectedOrder.customerName}</strong></p>
                <p>Phone: <strong className="text-[#D4A029] font-mono">{selectedOrder.customerPhone}</strong></p>
                <p>Zone: <strong className="text-white">{selectedOrder.deliveryAddress.zoneName}</strong></p>
                <p>Total: <strong className="text-white font-mono">UGX {selectedOrder.totalAmount.toLocaleString()}</strong></p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#071329] border border-slate-800 text-center text-xs text-slate-400">
              No active parcel assigned to {selectedRider?.name}. Status: Ready for dispatch.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
