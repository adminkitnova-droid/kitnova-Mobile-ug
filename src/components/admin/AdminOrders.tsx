import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Eye,
  MapPin,
  Sparkles,
  Phone,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { store } from '../../services/store';
import { Order, OrderStatus } from '../../types';

export const AdminOrders: React.FC = () => {
  const orders = store.orders;
  const riders = store.riders;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const filtered = orders.filter(o => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAssignRider = (orderId: string, riderId: string) => {
    store.assignRider(orderId, riderId, 'Operations Admin');
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    store.updateOrderStatus(orderId, newStatus, 'Operations Admin');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#D4A029] font-bold">
            Order Lifecycle & Logistics
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Orders & Courier Dispatch
          </h1>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search order #, customer, or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#D4A029]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['all', 'pending', 'paid', 'customization_review', 'ready', 'rider_assigned', 'out_for_delivery', 'delivered'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-[#D4A029] text-[#0A1A3C]'
                  : 'bg-[#0F2A5F]/40 text-slate-300 hover:text-white'
              }`}
            >
              {st === 'all' ? 'All Orders' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F2A5F]/40 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items / Custom</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Courier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-[#0F2A5F]/20 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#D4A029]">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-white">{order.customerName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{order.customerPhone}</p>
                  </td>
                  <td className="py-3 px-4">
                    {order.items.map(it => (
                      <div key={it.id} className="truncate max-w-[200px]">
                        {it.productName} ({it.size})
                        {it.customSummary?.playerName && ` [${it.customSummary.playerName} #${it.customSummary.playerNumber}]`}
                      </div>
                    ))}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    UGX {order.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                        order.paymentStatus === 'paid'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-[#0F2A5F] text-slate-300 font-mono text-[10px] uppercase">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {order.assignedRiderName ? (
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <Truck className="w-3.5 h-3.5 text-[#D4A029]" />
                        <span>{order.assignedRiderName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">No courier assigned</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedOrderId(order.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#0F2A5F] hover:bg-[#0F2A5F]/80 text-[#D4A029] font-bold text-xs flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS & RIDER ASSIGNMENT DRAWER (Spec Section 7) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-end">
          <div className="bg-[#0A1A3C] border-l border-slate-800 w-full max-w-xl h-full overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs uppercase text-[#D4A029] font-bold">Order Details</span>
                <h2 className="text-xl font-black text-white font-mono">{selectedOrder.orderNumber}</h2>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="text-xs text-slate-400 hover:text-white font-semibold"
              >
                Close Drawer
              </button>
            </div>

            {/* Status Pipeline Controller */}
            <div className="p-4 rounded-xl bg-[#0F2A5F]/30 border border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Update Order Status
              </label>
              <select
                value={selectedOrder.status}
                onChange={e => handleUpdateStatus(selectedOrder.id, e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-[#0A1A3C] border border-slate-700 text-xs text-white uppercase font-mono focus:border-[#D4A029]"
              >
                <option value="pending">Pending</option>
                <option value="payment_pending">Payment Pending</option>
                <option value="paid">Paid & Confirmed</option>
                <option value="preparing">Preparing Workshop</option>
                <option value="customization_review">Customization Review</option>
                <option value="ready">Ready at Hub</option>
                <option value="rider_assigned">Rider Assigned</option>
                <option value="picked_up">Picked Up</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* ASSIGN RIDER SELECTOR (Spec Section 7 & 12) */}
            <div className="p-4 rounded-xl bg-[#0F2A5F]/40 border border-[#D4A029]/40 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#D4A029]" />
                  Assign Delivery Courier
                </label>
                {selectedOrder.assignedRiderName && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                    ASSIGNED
                  </span>
                )}
              </div>

              <select
                value={selectedOrder.assignedRiderId || ''}
                onChange={e => handleAssignRider(selectedOrder.id, e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0A1A3C] border border-slate-700 text-xs text-white focus:border-[#D4A029]"
              >
                <option value="">-- Choose available rider --</option>
                {riders.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.vehiclePlate}) — {r.status.toUpperCase()}
                  </option>
                ))}
              </select>

              {selectedOrder.assignedRiderId && (
                <div className="text-[11px] text-slate-300 pt-1">
                  Assigned: <strong>{selectedOrder.assignedRiderName}</strong> ({selectedOrder.assignedRiderPhone})
                </div>
              )}
            </div>

            {/* Customer & Destination */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-white block uppercase tracking-wider">Customer & Delivery</span>
              <div className="p-3 rounded-xl bg-[#0F2A5F]/20 border border-slate-800 space-y-1">
                <p className="font-semibold text-white">{selectedOrder.customerName}</p>
                <p className="text-slate-400">{selectedOrder.customerPhone} · {selectedOrder.customerEmail}</p>
                <p className="text-slate-300 mt-1">
                  Destination: {selectedOrder.deliveryAddress.streetAddress}
                </p>
                {selectedOrder.deliveryAddress.landmark && (
                  <p className="text-[#D4A029]">Landmark: {selectedOrder.deliveryAddress.landmark}</p>
                )}
                <p className="text-slate-500 font-mono">Zone: {selectedOrder.deliveryAddress.zoneName}</p>
              </div>
            </div>

            {/* IMMUTABLE CUSTOMIZATION SNAPSHOT (Spec Section 4 & 7) */}
            <div className="space-y-3 text-xs">
              <span className="font-bold text-white block uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D4A029]" />
                Customization Snapshot & Bill of Materials
              </span>

              {selectedOrder.items.map(it => (
                <div key={it.id} className="p-3 rounded-xl bg-[#0F2A5F]/30 border border-slate-800 space-y-2">
                  <div className="flex justify-between font-bold text-slate-200">
                    <span>{it.productName} ({it.size})</span>
                    <span className="font-mono">UGX {it.totalUnitPrice.toLocaleString()}</span>
                  </div>

                  {it.customSummary && (
                    <div className="p-2 rounded-lg bg-[#0A1A3C] border border-slate-700 font-mono text-[11px] space-y-1">
                      <p className="text-[#D4A029]">
                        BACK NAME: <strong className="text-white">{it.customSummary.playerName || 'NONE'}</strong>
                      </p>
                      <p className="text-[#D4A029]">
                        SQUAD NUMBER: <strong className="text-white">{it.customSummary.playerNumber ? `#${it.customSummary.playerNumber}` : 'NONE'}</strong>
                      </p>
                      {it.customSummary.sponsorText && (
                        <p className="text-[#D4A029]">
                          CHEST SPONSOR: <strong className="text-white">{it.customSummary.sponsorText}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Status History Audit */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-white block uppercase tracking-wider">Status History Audit</span>
              <div className="space-y-1.5">
                {selectedOrder.statusHistory.map((h, i) => (
                  <div key={i} className="flex justify-between text-[11px] text-slate-400 py-1 border-b border-slate-800">
                    <span>
                      <strong className="text-slate-200 uppercase">{h.status.replace(/_/g, ' ')}</strong> ({h.actor})
                    </span>
                    <span className="font-mono text-slate-500">
                      {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
