import React, { useState, useEffect } from 'react';
import {
  Navigation,
  MapPin,
  Truck,
  RefreshCw,
  Compass,
  CheckCircle2,
  LocateFixed,
  Eye,
  Zap,
  Clock,
  Gauge,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Radio,
  SlidersHorizontal
} from 'lucide-react';
import { Rider, Order } from '../../types';

interface RiderLiveRouteMapProps {
  rider: Rider;
  activeOrder?: Order;
  onSimulateMovement: () => void;
}

export interface CalculatedRoute {
  id: string;
  name: string;
  corridor: string;
  distanceKm: number;
  durationMinutes: number;
  trafficLevel: 'low' | 'moderate' | 'heavy';
  trafficSpeedKmh: number;
  isSuggestedFastest: boolean;
  savingsDescription: string;
  roadType: string;
  waypoints: Array<{
    instruction: string;
    distance: string;
    trafficNote?: string;
  }>;
  pathCoordinates: Array<{ x: number; y: number }>;
  color: string;
}

export const RiderLiveRouteMap: React.FC<RiderLiveRouteMapProps> = ({
  rider,
  activeOrder,
  onSimulateMovement
}) => {
  const [zoomLevel, setZoomLevel] = useState<'fit' | 'courier' | 'destination'>('fit');
  const [showGrid, setShowGrid] = useState(true);
  const [trafficPreset, setTrafficPreset] = useState<'normal' | 'rush_hour' | 'clear'>('normal');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalcNotice, setRecalcNotice] = useState<string | null>(null);

  // Reference coordinates
  // Central Hub: Kampala Central Industrial Area
  const hubCoords = { lat: 0.3180, lng: 32.5750, name: 'Kitnova Central Store Hub' };

  // Rider coordinates
  const riderCoords = rider.currentCoordinates || { lat: 0.3341, lng: 32.5855, landmark: 'Acacia Ave' };

  // Destination coordinates (Kololo / Bugolobi / Kampala zone)
  const destCoords = {
    lat: activeOrder?.deliveryAddress.zoneId === 'zone-nakawa-ntinda' ? 0.3420 : 0.3385,
    lng: activeOrder?.deliveryAddress.zoneId === 'zone-nakawa-ntinda' ? 0.3605 : 32.5910,
    address: activeOrder?.deliveryAddress.streetAddress || 'Plot 14 Windsor Loop, Kololo',
    customer: activeOrder?.customerName || 'Customer Delivery Point'
  };

  // Convert GPS Coordinates to 0-100% SVG viewport coordinates
  const minLat = 0.305;
  const maxLat = 0.355;
  const minLng = 32.565;
  const maxLng = 32.615;

  const toMapX = (lng: number) => Math.min(95, Math.max(5, ((lng - minLng) / (maxLng - minLng)) * 100));
  const toMapY = (lat: number) => Math.min(95, Math.max(5, 100 - ((lat - minLat) / (maxLat - minLat)) * 100));

  const hubPos = { x: toMapX(hubCoords.lng), y: toMapY(hubCoords.lat) };
  const riderPos = { x: toMapX(riderCoords.lng), y: toMapY(riderCoords.lat) };
  const destPos = { x: toMapX(destCoords.lng), y: toMapY(destCoords.lat) };

  // Generate automated routes dynamically based on traffic preset and destination
  const getRoutes = (preset: 'normal' | 'rush_hour' | 'clear'): CalculatedRoute[] => {
    const rushMultiplier = preset === 'rush_hour' ? 1.45 : preset === 'clear' ? 0.85 : 1.0;

    return [
      {
        id: 'route-jinja-express',
        name: 'Jinja Road Flyover & Lugogo Bypass',
        corridor: 'Main Eastern Express Artery',
        distanceKm: 4.2,
        durationMinutes: Math.round(11 * rushMultiplier),
        trafficLevel: preset === 'rush_hour' ? 'moderate' : 'low',
        trafficSpeedKmh: Math.round(38 / rushMultiplier),
        isSuggestedFastest: true,
        savingsDescription: 'Saves 6 mins vs congested ring roads',
        roadType: 'Dual-Carriage Tarmac (Grade A)',
        color: '#10B981', // Emerald
        waypoints: [
          { instruction: 'Depart Kitnova Central Hub via 6th Street Industrial', distance: '0.4 km', trafficNote: 'Free Flow' },
          { instruction: 'Enter Jinja Road Flyover heading towards Lugogo', distance: '1.8 km', trafficNote: 'Express Moving 42 km/h' },
          { instruction: 'Branch onto Lugogo Bypass towards Kololo Heights', distance: '1.2 km', trafficNote: 'Clear Tarmac' },
          { instruction: 'Arrive at destination gate on Windsor Loop', distance: '0.8 km', trafficNote: 'Direct Customer Drop' }
        ],
        pathCoordinates: [
          { x: hubPos.x, y: hubPos.y },
          { x: 30, y: 72 },
          { x: 45, y: 60 },
          { x: 62, y: 52 },
          { x: destPos.x, y: destPos.y }
        ]
      },
      {
        id: 'route-yusuf-lule',
        name: 'Yusuf Lule & Golf Course Ring',
        corridor: 'Central Kololo Terrace',
        distanceKm: 3.8,
        durationMinutes: Math.round(17 * rushMultiplier),
        trafficLevel: 'heavy',
        trafficSpeedKmh: Math.round(16 / rushMultiplier),
        isSuggestedFastest: false,
        savingsDescription: 'Shorter distance but bottlenecked at roundabout',
        roadType: 'Urban Arterial (Traffic Signal Intersections)',
        color: '#F59E0B', // Amber
        waypoints: [
          { instruction: 'Exit Hub onto Mukwano Access Road', distance: '0.6 km', trafficNote: 'Moderate Flow' },
          { instruction: 'Enter Garden City Roundabout bottleneck', distance: '1.1 km', trafficNote: 'Heavy Congestion (Stop-and-Go)' },
          { instruction: 'Ascend Upper Kololo Terrace past Golf Course', distance: '1.3 km', trafficNote: 'Slow Moving' },
          { instruction: 'Turn right into customer residential loop', distance: '0.8 km', trafficNote: 'Clear Access' }
        ],
        pathCoordinates: [
          { x: hubPos.x, y: hubPos.y },
          { x: 28, y: 84 },
          { x: 38, y: 52 },
          { x: 48, y: 35 },
          { x: destPos.x, y: destPos.y }
        ]
      },
      {
        id: 'route-rail-bypass',
        name: 'Mukwano & Port Bell Rail Corridor',
        corridor: 'Boda-Boda Express Link',
        distanceKm: 5.1,
        durationMinutes: Math.round(14 * rushMultiplier),
        trafficLevel: preset === 'rush_hour' ? 'moderate' : 'low',
        trafficSpeedKmh: Math.round(34 / rushMultiplier),
        isSuggestedFastest: false,
        savingsDescription: 'Smooth bypass avoiding central city core',
        roadType: 'Secondary Link Tarmac',
        color: '#38BDF8', // Sky Blue
        waypoints: [
          { instruction: 'Head East on 5th Street Industrial Area', distance: '0.8 km', trafficNote: 'Paved' },
          { instruction: 'Merge onto Rail Corridor Connector', distance: '2.1 km', trafficNote: 'Free Flowing 45 km/h' },
          { instruction: 'Turn onto Spring Road towards Lugogo', distance: '1.4 km', trafficNote: 'Steady Flow' },
          { instruction: 'Final approach to customer dropoff', distance: '0.8 km', trafficNote: 'Residential' }
        ],
        pathCoordinates: [
          { x: hubPos.x, y: hubPos.y },
          { x: 42, y: 82 },
          { x: 68, y: 70 },
          { x: 74, y: 46 },
          { x: destPos.x, y: destPos.y }
        ]
      }
    ];
  };

  const routes = getRoutes(trafficPreset);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-jinja-express');
  const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  const handleRecalculateRoutes = () => {
    setIsRecalculating(true);
    setRecalcNotice('Analyzing live Kampala road sensors and corridor congestion...');

    setTimeout(() => {
      setIsRecalculating(false);
      // Auto-select the fastest route
      const fastest = routes.reduce((prev, curr) =>
        curr.durationMinutes < prev.durationMinutes ? curr : prev
      );
      setSelectedRouteId(fastest.id);
      setRecalcNotice(`Automated Route Updated: ${fastest.name} recommended (~${fastest.durationMinutes} mins ETA).`);
      setTimeout(() => setRecalcNotice(null), 4000);
    }, 800);
  };

  return (
    <div className="bg-[#0A1A3C] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Top Header & Automated Calculation Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-lg font-black text-white tracking-tight">
              Automated Route Calculation & Real-Time Navigation
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-mono">
              AI TRAFFIC ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time traffic telemetry from Kitnova Central Store to customer delivery address.
          </p>
        </div>

        {/* Action Controls: Traffic Simulator & Recalculate Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Traffic Condition Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-xs">
            <button
              onClick={() => setTrafficPreset('normal')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                trafficPreset === 'normal'
                  ? 'bg-[#D4A029] text-[#0A1A3C] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Normal Traffic
            </button>
            <button
              onClick={() => setTrafficPreset('rush_hour')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                trafficPreset === 'rush_hour'
                  ? 'bg-amber-500 text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Rush Hour Peak
            </button>
            <button
              onClick={() => setTrafficPreset('clear')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                trafficPreset === 'clear'
                  ? 'bg-emerald-500 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Clear Express
            </button>
          </div>

          {/* Automated Recalculate Button */}
          <button
            onClick={handleRecalculateRoutes}
            disabled={isRecalculating}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] font-black text-xs hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
            title="Recalculate fastest delivery path using live traffic sensors"
          >
            <Zap className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-bounce text-white' : ''}`} />
            <span>{isRecalculating ? 'Recalculating...' : 'Recalculate Fastest Path'}</span>
          </button>
        </div>
      </div>

      {/* Recalculation Notification Alert */}
      {recalcNotice && (
        <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{recalcNotice}</span>
        </div>
      )}

      {/* AUTOMATED ROUTE SUGGESTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {routes.map(r => {
          const isSelected = r.id === selectedRouteId;
          return (
            <div
              key={r.id}
              onClick={() => setSelectedRouteId(r.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-[#0F2A5F]/70 border-[#D4A029] ring-2 ring-[#D4A029]/30 shadow-xl'
                  : 'bg-[#0F2A5F]/20 border-slate-800 hover:border-slate-700 hover:bg-[#0F2A5F]/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">
                    {r.corridor}
                  </span>
                  {r.isSuggestedFastest && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold font-mono flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-400" /> FASTEST PATH
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight">
                  {r.name}
                </h3>

                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-2xl font-black font-mono text-white">
                    {r.durationMinutes} min
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    ({r.distanceKm} km)
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 ml-auto">
                    {r.trafficSpeedKmh} km/h avg
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Traffic Delay:</span>
                  <span
                    className={`font-semibold capitalize font-mono ${
                      r.trafficLevel === 'low'
                        ? 'text-emerald-400'
                        : r.trafficLevel === 'moderate'
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}
                  >
                    ● {r.trafficLevel}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {r.savingsDescription}
                </p>
              </div>

              <button
                type="button"
                className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#D4A029] text-[#0A1A3C]'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isSelected ? 'Active Route Selected ✓' : 'Select This Route'}
              </button>
            </div>
          );
        })}
      </div>

      {/* REAL-TIME DYNAMIC VECTOR MINI-MAP */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] min-h-[340px] bg-[#071329] rounded-2xl overflow-hidden border border-slate-800 shadow-inner select-none">
        {/* Kampala Map Vector Background Graphics */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Grid Pattern */}
            <pattern id="roadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0F2A5F" strokeWidth="0.8" strokeOpacity="0.4" />
            </pattern>
            {/* Glow Filter for Active Route */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Background */}
          {showGrid && <rect width="100%" height="100%" fill="url(#roadGrid)" />}

          {/* Stylized Kampala Road Base Arteries */}
          {/* Jinja Road Arterial */}
          <path d="M 10 75 Q 35 60, 60 55 T 90 40" fill="none" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
          <path d="M 10 75 Q 35 60, 60 55 T 90 40" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6 4" />

          {/* Yusuf Lule & Acacia Avenue */}
          <path d="M 30 90 Q 40 50, 50 35 T 75 25" fill="none" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" />
          <path d="M 30 90 Q 40 50, 50 35 T 75 25" fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="5 3" />

          {/* Lugogo Bypass Connector */}
          <path d="M 50 35 Q 65 45, 80 50" fill="none" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />

          {/* RENDER ALL CANDIDATE ROUTES */}
          {routes.map(r => {
            const isSelected = r.id === selectedRouteId;
            const pointsStr = r.pathCoordinates.map(p => `${p.x},${p.y}`).join(' ');

            return (
              <g key={r.id}>
                {/* Background Shadow line */}
                <polyline
                  points={pointsStr}
                  fill="none"
                  stroke={isSelected ? r.color : '#334155'}
                  strokeWidth={isSelected ? 6 : 2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isSelected ? 0.9 : 0.4}
                  filter={isSelected ? 'url(#routeGlow)' : undefined}
                />
                {/* Animated Flow Dash when selected */}
                {isSelected && (
                  <polyline
                    points={pointsStr}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    strokeDasharray="8 6"
                    strokeLinecap="round"
                    className="animate-pulse"
                  />
                )}
              </g>
            );
          })}

          {/* Active Segment from Rider to Next Waypoint */}
          <line
            x1={`${riderPos.x}%`}
            y1={`${riderPos.y}%`}
            x2={`${activeRoute.pathCoordinates[2]?.x || destPos.x}%`}
            y2={`${activeRoute.pathCoordinates[2]?.y || destPos.y}%`}
            stroke="#10B981"
            strokeWidth="3"
            strokeDasharray="4 4"
            opacity="0.8"
          />

          {/* Landmark Labels on Vector Map */}
          <text x="25%" y="78%" fill="#64748B" fontSize="10" fontFamily="monospace">Jinja Road Flyover</text>
          <text x="50%" y="28%" fill="#64748B" fontSize="10" fontFamily="monospace">Kololo Heights</text>
          <text x="75%" y="60%" fill="#64748B" fontSize="10" fontFamily="monospace">Lugogo Bypass</text>
          <text x="18%" y="90%" fill="#64748B" fontSize="10" fontFamily="monospace">Industrial Area</text>
        </svg>

        {/* 1. Hub Marker (Start: Kitnova Central Store) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-all duration-500"
          style={{ left: `${hubPos.x}%`, top: `${hubPos.y}%` }}
        >
          <div className="w-7 h-7 rounded-full bg-[#0A1A3C] border-2 border-[#D4A029] text-[#D4A029] flex items-center justify-center shadow-xl">
            <span className="text-[10px] font-black">HUB</span>
          </div>
          <span className="text-[9px] text-slate-300 bg-[#0A1A3C]/95 px-2 py-0.5 rounded border border-slate-700 mt-1 whitespace-nowrap font-mono">
            Kitnova Central Store Hub
          </span>
        </div>

        {/* 2. Destination Marker (Customer Destination) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center transition-all duration-700 group cursor-pointer z-10"
          style={{ left: `${destPos.x}%`, top: `${destPos.y}%` }}
        >
          {/* Target Pulse */}
          <div className="absolute w-12 h-12 -top-1 rounded-full bg-[#D4A029]/25 animate-ping -z-10" />

          <div className="w-8 h-8 rounded-full bg-[#D4A029] text-[#0A1A3C] flex items-center justify-center shadow-xl font-bold border-2 border-white">
            <MapPin className="w-4 h-4 fill-current" />
          </div>

          <div className="bg-[#0A1A3C]/95 border border-[#D4A029]/60 px-2.5 py-1 rounded-lg shadow-xl mt-1 text-center whitespace-nowrap">
            <p className="text-[10px] font-bold text-white">{destCoords.customer}</p>
            <p className="text-[9px] text-[#D4A029] truncate max-w-[140px] font-mono">{destCoords.address}</p>
          </div>
        </div>

        {/* 3. Dynamic Courier Marker (Live GPS Position) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-1000 ease-out z-20 cursor-pointer"
          style={{ left: `${riderPos.x}%`, top: `${riderPos.y}%` }}
        >
          {/* Active Radar Wave */}
          <div className="absolute w-14 h-14 rounded-full bg-emerald-500/25 animate-ping -z-10" />

          {/* Vehicle Icon Badge */}
          <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-2xl border-2 border-white">
            <Truck className="w-4 h-4" />
          </div>

          <div className="bg-emerald-950/95 border border-emerald-500/60 px-2 py-0.5 rounded-md shadow-lg mt-1 text-center whitespace-nowrap">
            <span className="text-[10px] font-black text-emerald-300 font-mono tracking-wider">
              {rider.name.split(' ')[0]} ({rider.vehiclePlate.split(' ')[0]})
            </span>
          </div>
        </div>

        {/* Live Floating Telemetry Overlay (Bottom-left) */}
        <div className="absolute bottom-3 left-3 bg-[#0A1A3C]/95 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-[11px] shadow-2xl space-y-1 font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Compass className="w-3.5 h-3.5 text-[#D4A029]" />
            <span>Courier GPS:</span>
            <span className="text-white font-bold">{riderCoords.lat.toFixed(4)}° N, {riderCoords.lng.toFixed(4)}° E</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Destination:</span>
            <span className="text-[#D4A029]">{destCoords.lat.toFixed(4)}° N, {destCoords.lng.toFixed(4)}° E</span>
          </div>
        </div>

        {/* Dynamic Route Stats Card (Top-right) */}
        <div className="absolute top-3 right-3 bg-[#0A1A3C]/95 backdrop-blur-md border border-[#D4A029]/50 rounded-xl p-3 text-xs shadow-2xl space-y-1">
          <div className="flex justify-between items-center gap-4">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Suggested Corridor</span>
            <span className="font-mono font-bold text-emerald-400 text-xs">{activeRoute.name.split('&')[0]}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Est. Transit Time</span>
            <span className="font-mono font-bold text-[#D4A029] text-sm">~{activeRoute.durationMinutes} mins</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Live Traffic Speed</span>
            <span className="font-mono text-white text-xs">{activeRoute.trafficSpeedKmh} km/h</span>
          </div>
        </div>
      </div>

      {/* TURN-BY-TURN AUTOMATED WAYPOINTS GUIDE FOR SELECTED ROUTE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-[#D4A029]" />
            Turn-by-Turn Guidance ({activeRoute.name})
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Total {activeRoute.distanceKm} km · {activeRoute.waypoints.length} Maneuvers
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {activeRoute.waypoints.map((wp, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-[#0F2A5F]/30 border border-slate-800 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-full bg-[#0F2A5F] border border-slate-700 text-[#D4A029] text-[10px] font-black flex items-center justify-center font-mono">
                  {idx + 1}
                </span>
                <span className="font-mono text-[10px] text-slate-400 font-bold">{wp.distance}</span>
              </div>
              <p className="font-semibold text-white leading-snug">{wp.instruction}</p>
              {wp.trafficNote && (
                <span className="text-[10px] text-emerald-400 font-mono block">
                  ✓ {wp.trafficNote}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Map Interactive Toolbar Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              showGrid
                ? 'bg-[#0F2A5F] border-[#D4A029]/40 text-[#D4A029]'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Grid Mesh</span>
          </button>

          <button
            onClick={() => setZoomLevel(zoomLevel === 'courier' ? 'fit' : 'courier')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              zoomLevel === 'courier'
                ? 'bg-[#0F2A5F] border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>Center Courier</span>
          </button>
        </div>

        <button
          onClick={onSimulateMovement}
          className="px-4 py-2 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold text-xs hover:bg-[#F0C760] transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Simulate GPS Move</span>
        </button>
      </div>
    </div>
  );
};
