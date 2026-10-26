import React from 'react';
import {
  CreditCard,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Eye
} from 'lucide-react';
import { store } from '../../services/store';
import { AdminModule } from './AdminSidebar';

interface AdminDashboardProps {
  onNavigateModule: (module: AdminModule) => void;
  onSelectOrder?: (orderId: string) => void;
  onSelectPayment?: (paymentId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateModule,
  onSelectOrder,
  onSelectPayment
}) => {
  const orders = store.orders;
  const payments = store.payments;
  const products = store.products;
  const riders = store.riders;

  // KPIs
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingPayments = payments.filter(p => p.status === 'pending_verification');
  const lowStockItems = products.filter(p => p.stock <= p.lowStockThreshold);
  const unassignedOrders = orders.filter(o => (o.status === 'paid' || o.status === 'ready') && !o.assignedRiderId);
  const activeRiders = riders.filter(r => r.status !== 'offline');

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#D4A029] font-bold">
            Executive Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Business Performance & Operations
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateModule('studio')}
            className="px-4 py-2 rounded-xl bg-[#0F2A5F] border border-slate-700 hover:border-[#D4A029] text-xs font-semibold text-slate-200 hover:text-[#D4A029] transition-colors cursor-pointer"
          >
            Studio Pricing Config
          </button>
          <button
            onClick={() => onNavigateModule('products')}
            className="px-4 py-2 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold text-xs hover:bg-[#F0C760] transition-colors cursor-pointer"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Revenue */}
        <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Realized Revenue (UGX)</span>
            <div className="p-1.5 rounded-lg bg-[#0F2A5F] text-[#D4A029]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">
            UGX {totalRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-400 font-medium">
            +18.4% this week · Paid & Verified
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Total Orders</span>
            <div className="p-1.5 rounded-lg bg-[#0F2A5F] text-[#D4A029]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{orders.length}</p>
          <p className="text-[11px] text-slate-400">
            {orders.filter(o => o.status === 'delivered').length} delivered successfully
          </p>
        </div>

        {/* Pending Verification */}
        <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Pending Verifications</span>
            <div className="p-1.5 rounded-lg bg-[#0F2A5F] text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">
            {pendingPayments.length}
          </p>
          <p className="text-[11px] text-slate-400">MTN MoMo & Airtel manual checks</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Low-Stock Alerts</span>
            <div className="p-1.5 rounded-lg bg-[#0F2A5F] text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-red-400 font-mono">
            {lowStockItems.length}
          </p>
          <p className="text-[11px] text-slate-400">Products ≤ threshold</p>
        </div>
      </div>

      {/* Action Required Queue (Spec Section 11) */}
      <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Action Required Queue
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {pendingPayments.length + lowStockItems.length + unassignedOrders.length} items need admin action
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Payments to verify */}
          <div className="p-4 rounded-xl bg-[#0F2A5F]/30 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Payments Awaiting Verification
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {pendingPayments.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {pendingPayments.length > 0
                  ? `e.g. ${pendingPayments[0].customerName} (UGX ${pendingPayments[0].amount.toLocaleString()}) via ${pendingPayments[0].paymentMethod.toUpperCase()}`
                  : 'All mobile money payments verified!'}
              </p>
            </div>

            {pendingPayments.length > 0 && (
              <button
                onClick={() => onNavigateModule('payments')}
                className="w-full py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Verify Payments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Card 2: Low Stock Alert Items */}
          <div className="p-4 rounded-xl bg-[#0F2A5F]/30 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Low Stock Inventory
                </span>
                <span className="text-xs font-mono font-bold text-red-400">
                  {lowStockItems.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lowStockItems.length > 0
                  ? `Product "${lowStockItems[0].name}" has only ${lowStockItems[0].stock} left (Threshold: ${lowStockItems[0].lowStockThreshold})`
                  : 'Warehouse stock levels optimal.'}
              </p>
            </div>

            {lowStockItems.length > 0 && (
              <button
                onClick={() => onNavigateModule('products')}
                className="w-full py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Manage Inventory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Card 3: Orders without Riders */}
          <div className="p-4 rounded-xl bg-[#0F2A5F]/30 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Unassigned Dispatches
                </span>
                <span className="text-xs font-mono font-bold text-[#D4A029]">
                  {unassignedOrders.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {unassignedOrders.length > 0
                  ? `${unassignedOrders.length} paid orders ready for courier dispatch in Kampala`
                  : 'All ready orders assigned to active riders.'}
              </p>
            </div>

            {unassignedOrders.length > 0 && (
              <button
                onClick={() => onNavigateModule('orders')}
                className="w-full py-2 rounded-lg bg-[#D4A029]/20 border border-[#D4A029]/40 text-[#D4A029] text-xs font-semibold hover:bg-[#D4A029]/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Assign Couriers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Overview Table */}
      <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-white">Recent Orders</h2>
          <button
            onClick={() => onNavigateModule('orders')}
            className="text-xs font-semibold text-[#D4A029] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F2A5F]/40 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items / Custom</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Delivery Status</th>
                <th className="py-3 px-4">Rider</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {orders.slice(0, 5).map(o => (
                <tr key={o.id} className="hover:bg-[#0F2A5F]/20 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#D4A029]">{o.orderNumber}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-white">{o.customerName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{o.customerPhone}</p>
                  </td>
                  <td className="py-3 px-4">
                    {o.items.map(it => (
                      <div key={it.id} className="truncate max-w-[180px]">
                        {it.productName} ({it.size})
                        {it.customSummary?.playerName && ` [${it.customSummary.playerName}]`}
                      </div>
                    ))}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    UGX {o.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                        o.paymentStatus === 'paid'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {o.paymentMethod.replace(/_/g, ' ')} ({o.paymentStatus})
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-[#0F2A5F] text-slate-300 font-mono text-[10px] uppercase">
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {o.assignedRiderName ? (
                      <span className="text-[#D4A029] font-medium">{o.assignedRiderName}</span>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigateModule('orders')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Inspect Order"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
