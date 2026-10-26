import React, { useState } from 'react';
import { store } from '../../services/store';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  DollarSign,
  TrendingUp,
  Truck,
  Shirt,
  CreditCard,
  Printer,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';

export const AdminReports: React.FC = () => {
  const [reportType, setReportType] = useState<'sales' | 'inventory' | 'deliveries' | 'payments'>('sales');
  const [dateRange, setDateRange] = useState<'7days' | '30days' | 'this_quarter' | 'all'>('30days');

  const orders = store.orders;
  const products = store.products;
  const riders = store.riders;
  const payments = store.payments;

  // Calculated metrics
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.totalAmount : sum), 0);
  const totalCustomizationRevenue = orders.reduce((sum, o) => {
    const customSum = o.items.reduce((s, i) => s + (i.customizationPrice || 0) * i.quantity, 0);
    return sum + customSum;
  }, 0);
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const deliverySuccessRate = orders.length > 0 ? Math.round((deliveredOrders.length / orders.length) * 100) : 100;

  const handleExportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'sales') {
      csvContent += 'Order Number,Customer Name,Date,Amount (UGX),Payment Method,Status\n';
      orders.forEach(o => {
        csvContent += `"${o.orderNumber}","${o.customerName}","${o.createdAt}",${o.totalAmount},"${o.paymentMethod}","${o.status}"\n`;
      });
    } else if (reportType === 'inventory') {
      csvContent += 'SKU,Product Name,Category,Base Price (UGX),Stock,Low Stock Threshold,Customizable\n';
      products.forEach(p => {
        csvContent += `"${p.sku}","${p.name}","${p.category}",${p.basePrice},${p.stock},${p.lowStockThreshold},${p.isCustomizable !== false}\n`;
      });
    } else if (reportType === 'deliveries') {
      csvContent += 'Rider Name,Vehicle Plate,Status,Completed Deliveries,Rating,Current Landmark\n';
      riders.forEach(r => {
        csvContent += `"${r.name}","${r.vehiclePlate}","${r.status}",${r.totalCompletedDeliveries},${r.rating},"${r.currentCoordinates.landmark || 'En Route'}"\n`;
      });
    } else {
      csvContent += 'Payment ID,Order Number,Customer,Amount (UGX),Reference Number,Verified By,Verified At,Status\n';
      payments.forEach(p => {
        csvContent += `"${p.id}","${p.orderNumber}","${p.customerName}",${p.amount},"${p.referenceNumber}","${p.verifiedBy || 'Pending'}","${p.verifiedAt || 'N/A'}","${p.status}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kitnova_${reportType}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#D4A029] font-bold font-mono">
            Audited Financials & Operations
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#D4A029]" />
            Business Reports & Export Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate authoritative spreadsheets and operational metrics for accounting and dispatch audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-[#0F2A5F] hover:bg-[#0F2A5F]/80 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print Summary</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-xl bg-[#D4A029] hover:bg-[#F0C760] text-[#0A1A3C] text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0A1A3C] p-2 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setReportType('sales')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              reportType === 'sales'
                ? 'bg-[#D4A029] text-[#0A1A3C] shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Sales & Revenue</span>
          </button>

          <button
            onClick={() => setReportType('inventory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              reportType === 'inventory'
                ? 'bg-[#D4A029] text-[#0A1A3C] shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>Inventory Burn</span>
          </button>

          <button
            onClick={() => setReportType('deliveries')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              reportType === 'deliveries'
                ? 'bg-[#D4A029] text-[#0A1A3C] shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Courier Delivery SLA</span>
          </button>

          <button
            onClick={() => setReportType('payments')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              reportType === 'payments'
                ? 'bg-[#D4A029] text-[#0A1A3C] shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment Verifications</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 hidden sm:inline">Timeframe:</span>
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-[#0F2A5F] border border-slate-700 text-xs text-[#D4A029] font-bold focus:outline-none"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="this_quarter">Current Fiscal Quarter</option>
            <option value="all">All-Time Cumulative</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0A1A3C] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Total Booked Gross</span>
          <p className="text-xl font-black text-white font-mono">UGX {totalRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{orders.length} orders recorded</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0A1A3C] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-[#D4A029]">Studio Custom Value</span>
          <p className="text-xl font-black text-[#D4A029] font-mono">UGX {totalCustomizationRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400">Names, badges & sponsor artwork</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0A1A3C] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">Courier SLA Success</span>
          <p className="text-xl font-black text-emerald-400 font-mono">{deliverySuccessRate}%</p>
          <p className="text-[11px] text-slate-400">{deliveredOrders.length} confirmed deliveries</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0A1A3C] border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-sky-400">Active Fleet</span>
          <p className="text-xl font-black text-sky-400 font-mono">{riders.length} Couriers</p>
          <p className="text-[11px] text-slate-400">{riders.filter(r => r.status === 'busy').length} currently dispatching</p>
        </div>
      </div>

      {/* Detailed Data Table for Selected Report */}
      <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white capitalize">
            {reportType.replace(/_/g, ' ')} Data Audit
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            {reportType === 'sales'
              ? `${orders.length} entries`
              : reportType === 'inventory'
              ? `${products.length} catalog items`
              : reportType === 'deliveries'
              ? `${riders.length} couriers`
              : `${payments.length} transactions`}
          </span>
        </div>

        <div className="overflow-x-auto text-xs">
          {reportType === 'sales' && (
            <table className="w-full text-left">
              <thead className="bg-[#0F2A5F]/40 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-[#0F2A5F]/20">
                    <td className="py-3 px-4 font-mono font-bold text-[#D4A029]">{o.orderNumber}</td>
                    <td className="py-3 px-4 font-semibold text-white">{o.customerName}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 uppercase text-[10px]">{o.paymentMethod.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">UGX {o.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 text-[10px] uppercase font-bold">
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'inventory' && (
            <table className="w-full text-left">
              <thead className="bg-[#0F2A5F]/40 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">Base Price</th>
                  <th className="py-3 px-4">Customizable</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-[#0F2A5F]/20">
                    <td className="py-3 px-4 font-bold text-white">{p.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{p.sku}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#D4A029]">{p.stock} units</td>
                    <td className="py-3 px-4 font-mono">UGX {p.basePrice.toLocaleString()}</td>
                    <td className="py-3 px-4">{p.isCustomizable !== false ? 'Yes' : 'No'}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.status === 'active' ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {p.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'deliveries' && (
            <table className="w-full text-left">
              <thead className="bg-[#0F2A5F]/40 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                <tr>
                  <th className="py-3 px-4">Courier</th>
                  <th className="py-3 px-4">Plate</th>
                  <th className="py-3 px-4">Completed Deliveries</th>
                  <th className="py-3 px-4">Customer Rating</th>
                  <th className="py-3 px-4 text-right">Live GPS Landmark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {riders.map(r => (
                  <tr key={r.id} className="hover:bg-[#0F2A5F]/20">
                    <td className="py-3 px-4 font-bold text-white">{r.name}</td>
                    <td className="py-3 px-4 font-mono text-[#D4A029]">{r.vehiclePlate}</td>
                    <td className="py-3 px-4 font-mono font-bold">{r.totalCompletedDeliveries} drop-offs</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">{r.rating} / 5.0 ★</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {r.currentCoordinates.landmark || 'En route'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'payments' && (
            <table className="w-full text-left">
              <thead className="bg-[#0F2A5F]/40 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Tx Reference</th>
                  <th className="py-3 px-4">Verified By</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-[#0F2A5F]/20">
                    <td className="py-3 px-4 font-mono font-bold text-[#D4A029]">{p.orderNumber}</td>
                    <td className="py-3 px-4 font-semibold text-white">{p.customerName}</td>
                    <td className="py-3 px-4 font-mono">UGX {p.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{p.referenceNumber}</td>
                    <td className="py-3 px-4 text-slate-400">{p.verifiedBy || 'Pending Super Admin'}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.status === 'paid'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : p.status === 'pending_verification'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : 'bg-red-950 text-red-300'
                        }`}
                      >
                        {p.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
