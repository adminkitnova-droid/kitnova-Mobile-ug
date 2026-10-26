import React, { useState } from 'react';
import { ShieldAlert, Search, Filter, History, UserCheck, Calendar, ArrowRight, ShieldCheck, Database, Layers } from 'lucide-react';
import { store } from '../../services/store';
import { OrderAuditLog } from '../../types';

export const AdminAuditLogs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'order_triggers' | 'universal'>('order_triggers');
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  const orderLogs = store.orderAuditLogs || [];
  const systemLogs = store.auditLogs || [];

  const filteredOrderLogs = orderLogs.filter(log => {
    const matchesSearch =
      log.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      log.adminId.toLowerCase().includes(search.toLowerCase()) ||
      log.adminEmail.toLowerCase().includes(search.toLowerCase()) ||
      log.adminRole.toLowerCase().includes(search.toLowerCase()) ||
      log.originalStatus.toLowerCase().includes(search.toLowerCase()) ||
      log.newStatus.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === 'all' ||
      log.originalStatus === selectedStatusFilter ||
      log.newStatus === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredSystemLogs = systemLogs.filter(log => {
    const matchesSearch =
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());
    const matchesMod = selectedModule === 'all' || log.module === selectedModule;
    return matchesSearch && matchesMod;
  });

  const formatStatus = (s: string) => s.replace(/_/g, ' ').toUpperCase();

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'paid':
      case 'confirmed':
      case 'delivered':
        return 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300';
      case 'out_for_delivery':
      case 'rider_assigned':
      case 'picked_up':
        return 'bg-blue-950/70 border-blue-500/50 text-blue-300';
      case 'preparing':
      case 'customization_review':
        return 'bg-amber-950/70 border-amber-500/50 text-[#D4A029]';
      case 'cancelled':
      case 'rejected':
      case 'failed_delivery':
        return 'bg-red-950/70 border-red-500/50 text-red-300';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-[#D4A029] font-bold">
              Security & Governance
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              DB TRIGGER ACTIVE
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Administrative Audit Trail & Orders Trigger
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            PostgreSQL trigger <code className="text-[#D4A029] bg-slate-900 px-1 py-0.5 rounded">tr_capture_order_status_change</code> intercepts every mutation to the <code className="text-slate-300">orders</code> table, capturing administrator IDs, original statuses, and transition state deltas into an immutable table.
          </p>
        </div>

        {/* Security Summary Pills */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-[#0F2A5F]/40 border border-slate-800 p-3 rounded-xl flex items-center gap-2">
            <Database className="w-4 h-4 text-[#D4A029]" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono">Order Transitions</p>
              <p className="text-sm font-bold text-white font-mono">{orderLogs.length} Records</p>
            </div>
          </div>
          <div className="bg-[#0F2A5F]/40 border border-slate-800 p-3 rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono">Trigger Rule</p>
              <p className="text-sm font-bold text-emerald-300 font-mono">IMMUTABLE</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => {
            setActiveTab('order_triggers');
            setSearch('');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'order_triggers'
              ? 'bg-[#D4A029] text-[#0A1A3C] shadow-lg shadow-[#D4A029]/20'
              : 'text-slate-400 hover:text-white bg-[#0F2A5F]/20 hover:bg-[#0F2A5F]/40'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Orders Table Trigger Audit ({orderLogs.length})</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('universal');
            setSearch('');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'universal'
              ? 'bg-[#D4A029] text-[#0A1A3C] shadow-lg shadow-[#D4A029]/20'
              : 'text-slate-400 hover:text-white bg-[#0F2A5F]/20 hover:bg-[#0F2A5F]/40'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Universal System Logs ({systemLogs.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative min-w-[300px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={
              activeTab === 'order_triggers'
                ? 'Search order #, admin ID, role, or status...'
                : 'Search action, actor, or description...'
            }
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#D4A029]"
          />
        </div>

        {activeTab === 'order_triggers' ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-400">Filter Status:</span>
            {['all', 'confirmed', 'preparing', 'rider_assigned', 'delivered'].map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-colors cursor-pointer ${
                  selectedStatusFilter === st
                    ? 'bg-[#D4A029] text-[#0A1A3C]'
                    : 'bg-[#0F2A5F]/40 text-slate-300 hover:text-white'
                }`}
              >
                {st === 'all' ? 'All Transitions' : st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            {['all', 'studio_pricing', 'products', 'orders', 'payments', 'riders', 'users'].map(m => (
              <button
                key={m}
                onClick={() => setSelectedModule(m)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-colors cursor-pointer ${
                  selectedModule === m
                    ? 'bg-[#D4A029] text-[#0A1A3C]'
                    : 'bg-[#0F2A5F]/40 text-slate-300 hover:text-white'
                }`}
              >
                {m === 'all' ? 'All Modules' : m.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: ORDERS TABLE TRIGGER AUDIT LOG (EXACT USER REQUIREMENT) */}
      {/* ========================================================================= */}
      {activeTab === 'order_triggers' && (
        <div className="space-y-4">
          <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-[#0F2A5F]/30 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#D4A029]" />
                <span className="font-bold text-white">PostgreSQL Table: public.order_audit_logs</span>
                <span className="text-[10px] text-slate-400">· Trigger: BEFORE UPDATE ON public.orders</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">RLS: READ ONLY TO ADMINS (NO CLIENT DELETE/UPDATE)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F2A5F]/40 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Order Ref</th>
                    <th className="py-3 px-4">Administrator ID & Role</th>
                    <th className="py-3 px-4">Status Transition (Original ➔ New)</th>
                    <th className="py-3 px-4">Payment Transition</th>
                    <th className="py-3 px-4">Delta Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {filteredOrderLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No order status audit records matched the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrderLogs.map(log => (
                      <tr key={log.id} className="hover:bg-[#0F2A5F]/20 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>

                        {/* Order Reference */}
                        <td className="py-3 px-4">
                          <p className="font-mono font-bold text-white text-xs">{log.orderNumber}</p>
                          <p className="font-mono text-[10px] text-slate-400">{log.orderId.slice(0, 16)}...</p>
                        </td>

                        {/* Administrator ID & Identity */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] font-bold text-[#D4A029] bg-[#0F2A5F] px-1.5 py-0.5 rounded border border-[#D4A029]/30">
                                {log.adminId}
                              </span>
                            </div>
                            <p className="font-semibold text-white text-[11px]">{log.adminEmail}</p>
                            <p className="text-[10px] uppercase font-mono text-slate-400">{log.adminRole}</p>
                          </div>
                        </td>

                        {/* Status Transition: original_status -> new_status */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getStatusColor(
                                log.originalStatus
                              )}`}
                            >
                              {formatStatus(log.originalStatus)}
                            </span>
                            <ArrowRight className="w-3 h-3 text-[#D4A029] shrink-0" />
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getStatusColor(
                                log.newStatus
                              )} font-bold shadow-sm`}
                            >
                              {formatStatus(log.newStatus)}
                            </span>
                          </div>
                        </td>

                        {/* Payment Transition */}
                        <td className="py-3 px-4 font-mono text-[11px]">
                          {log.originalPaymentStatus && log.newPaymentStatus ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400">{log.originalPaymentStatus}</span>
                              <span className="text-slate-600">→</span>
                              <span className={log.newPaymentStatus === 'paid' ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                                {log.newPaymentStatus}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>

                        {/* Changed Fields / Metadata */}
                        <td className="py-3 px-4 max-w-xs">
                          {log.changedFields ? (
                            <div className="text-[10px] font-mono text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                              {Object.entries(log.changedFields).map(([k, v]) => (
                                <div key={k} className="truncate">
                                  <span className="text-[#D4A029]">{k}:</span> {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px] font-mono">Direct trigger capture</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: UNIVERSAL SYSTEM AUDIT LOG */}
      {/* ========================================================================= */}
      {activeTab === 'universal' && (
        <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F2A5F]/40 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor & Role</th>
                  <th className="py-3 px-4">Audit Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredSystemLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#0F2A5F]/20 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#0F2A5F] text-[#D4A029] border border-[#D4A029]/30">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white font-mono">{log.action}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{log.actorName}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">{log.actorRole}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-md">
                      <p className="leading-relaxed">{log.description}</p>
                      {log.beforeValue && log.afterValue && (
                        <div className="mt-1 text-[10px] font-mono text-slate-400 bg-slate-900/60 p-1.5 rounded border border-slate-800">
                          <span className="text-red-300">BEFORE:</span> {log.beforeValue.slice(0, 80)}...
                          <br />
                          <span className="text-emerald-300">AFTER:</span> {log.afterValue.slice(0, 80)}...
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

