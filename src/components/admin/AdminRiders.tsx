import React, { useState } from 'react';
import { Truck, Plus, Search, Star, Phone, MapPin, CheckCircle2, Shield } from 'lucide-react';
import { store } from '../../services/store';
import { Rider } from '../../types';
import { CachedImage } from '../common/CachedImage';

export const AdminRiders: React.FC = () => {
  const riders = store.riders;
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Rider form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+256 7');
  const [email, setEmail] = useState('');
  const [plate, setPlate] = useState('UEM ');

  const filtered = riders.filter(r => {
    return (
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleCreateRider = (e: React.FormEvent) => {
    e.preventDefault();
    const newRider: Rider = {
      id: `rider-${Date.now()}`,
      name,
      phone,
      email,
      avatarUrl: '/assets/images/kitnova_rider_delivery_1791234701225.jpg',
      vehiclePlate: plate,
      vehicleType: 'motorcycle',
      status: 'available',
      isLocationSharingActive: true,
      currentCoordinates: {
        lat: 0.3476,
        lng: 32.5825,
        landmark: 'Kampala Central Dispatch Station',
        lastUpdated: new Date().toISOString()
      },
      rating: 5.0,
      totalCompletedDeliveries: 0
    };

    store.riders = [newRider, ...store.riders];
    store.logAction('riders', 'CREATE_RIDER', `Registered courier ${name} (${plate})`, 'Operations Admin');
    setShowAddModal(false);
    setName('');
    setPhone('+256 7');
    setEmail('');
    setPlate('UEM ');
  };

  const handleToggleStatus = (riderId: string) => {
    store.riders = store.riders.map(r => {
      if (r.id !== riderId) return r;
      const nextStatus = r.status === 'offline' ? 'available' : 'offline';
      return { ...r, status: nextStatus };
    });
    store.logAction('riders', 'TOGGLE_RIDER_AVAILABILITY', `Toggled courier availability for ${riderId}`, 'Operations Admin');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#D4A029] font-bold">
            Urban Fleet Operations
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Delivery Riders & Fleets
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch couriers across Kampala, track real-time GPS signals, and monitor SLA performance.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold text-xs hover:bg-[#F0C760] transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Register New Courier
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by rider name, plate, or phone..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#D4A029]"
        />
      </div>

      {/* Riders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map(rider => (
          <div
            key={rider.id}
            className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3">
                <CachedImage
                  src={rider.avatarUrl}
                  alt={rider.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-xl object-cover border border-[#D4A029]/50"
                />
                <div>
                  <h3 className="text-base font-bold text-white">{rider.name}</h3>
                  <p className="text-xs text-[#D4A029] font-mono">{rider.vehiclePlate}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 text-[#D4A029] fill-current" />
                    <span>{rider.rating} Rating · {rider.totalCompletedDeliveries} trips</span>
                  </p>
                </div>
              </div>

              {/* Status and GPS indicator */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Availability:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      rider.status === 'available'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                        : rider.status === 'busy'
                        ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {rider.status}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">GPS Signal:</span>
                  <span className="text-[11px] font-mono flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        rider.isLocationSharingActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
                      }`}
                    />
                    {rider.isLocationSharingActive ? 'Live Online' : 'Signal Stale'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0F2A5F]/20 border border-slate-800 text-[11px] text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-[#D4A029] inline mr-1" />
                  {rider.currentCoordinates.landmark}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex gap-2">
              <a
                href={`tel:${rider.phone}`}
                className="flex-1 py-2 rounded-xl bg-[#0F2A5F] border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-[#D4A029]" />
                Call
              </a>

              <button
                onClick={() => handleToggleStatus(rider.id)}
                className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                  rider.status === 'offline'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {rider.status === 'offline' ? 'Set Active' : 'Set Offline'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE RIDER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateRider}
            className="bg-[#0A1A3C] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Register Urban Courier</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Rider Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ronald Mugisha"
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phone Number (+256)</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 font-mono text-white focus:outline-none focus:border-[#D4A029]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="rider@kitnova.ug"
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Motorcycle Plate & Model</label>
                <input
                  type="text"
                  required
                  value={plate}
                  onChange={e => setPlate(e.target.value.toUpperCase())}
                  placeholder="e.g. UEM 482B (Bajaj Boxer)"
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 font-mono text-white focus:outline-none focus:border-[#D4A029]"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold text-xs hover:bg-[#F0C760]"
              >
                Register Courier
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
