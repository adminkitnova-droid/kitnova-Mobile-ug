import React, { useState } from 'react';
import { Users, Search, ShoppingBag, Eye, Ban, CheckCircle, ShieldCheck } from 'lucide-react';
import { store } from '../../services/store';
import { CustomerProfile } from '../../types';

export const AdminCustomers: React.FC = () => {
  const customers = store.customers;
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const customerOrders = selectedCustomer ? store.orders.filter(o => o.customerId === selectedCustomer.id) : [];

  const filtered = customers.filter(c => {
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase())
    );
  });

  const toggleCustomerStatus = (custId: string) => {
    store.customers = store.customers.map(c =>
      c.id === custId ? { ...c, status: c.status === 'active' ? 'suspended' : 'active' } : c
    );
    store.logAction(
      'users',
      'TOGGLE_CUSTOMER_STATUS',
      `Toggled customer status for ${custId}`,
      'Super Admin'
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#D4A029] font-bold">
            Customer Directory
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Customer Directory & Accounts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage customer records, lifetime spending, and security access. Passwords and credentials remain strictly redacted.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by customer name, email, or +256 phone..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#D4A029]"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F2A5F]/40 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4">Loyalty Points</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map(cust => (
                <tr key={cust.id} className="hover:bg-[#0F2A5F]/20 transition-colors">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#0F2A5F] text-[#D4A029] font-black flex items-center justify-center text-[10px] border border-[#D4A029]/30">
                      {cust.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span>{cust.name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-mono">{cust.email}</td>
                  <td className="py-3 px-4 font-mono text-[#D4A029]">{cust.phone}</td>
                  <td className="py-3 px-4 font-mono">{cust.ordersCount}</td>
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    UGX {cust.totalSpent.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#D4A029] font-bold">
                    {cust.loyaltyPoints} pts
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                        cust.status === 'active'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                          : 'bg-red-950/60 text-red-400 border border-red-500/40'
                      }`}
                    >
                      {cust.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedCustomerId(cust.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#0F2A5F] hover:bg-[#0F2A5F]/80 text-[#D4A029] font-bold text-xs flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER PROFILE DRAWER */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-end">
          <div className="bg-[#0A1A3C] border-l border-slate-800 w-full max-w-lg h-full overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Customer Account File</h2>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="text-xs text-slate-400 hover:text-white font-semibold"
              >
                Close Drawer
              </button>
            </div>

            {/* Profile Info */}
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0F2A5F] to-[#D4A029] text-[#0A1A3C] font-black flex items-center justify-center text-base">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedCustomer.name}</h3>
                  <p className="text-slate-400">{selectedCustomer.email}</p>
                  <p className="text-[#D4A029] font-mono">{selectedCustomer.phone}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0F2A5F]/30 border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Status</span>
                  <span className="font-bold text-emerald-400 uppercase font-mono">{selectedCustomer.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Orders</span>
                  <span className="font-mono text-white font-bold">{selectedCustomer.ordersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Spent</span>
                  <span className="font-mono text-[#D4A029] font-bold">
                    UGX {selectedCustomer.totalSpent.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Password</span>
                  <span className="font-mono text-slate-500 italic">[ENCRYPTED / REDACTED]</span>
                </div>
              </div>

              {/* Status Action */}
              <button
                onClick={() => toggleCustomerStatus(selectedCustomer.id)}
                className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                  selectedCustomer.status === 'active'
                    ? 'bg-red-950/40 border-red-500/50 text-red-300 hover:bg-red-900/50'
                    : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50'
                }`}
              >
                {selectedCustomer.status === 'active' ? 'Suspend Customer Account' : 'Reactivate Account'}
              </button>
            </div>

            {/* Orders History */}
            <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
              <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#D4A029]" />
                Order History ({customerOrders.length})
              </h3>

              {customerOrders.length === 0 ? (
                <p className="text-slate-400">No previous orders found for this profile.</p>
              ) : (
                customerOrders.map(order => (
                  <div key={order.id} className="p-3 rounded-xl bg-[#0F2A5F]/20 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-mono font-bold text-white">{order.orderNumber}</span>
                      <span className="text-[#D4A029] font-mono font-bold">
                        UGX {order.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()} · Status: <span className="uppercase text-slate-300">{order.status}</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
