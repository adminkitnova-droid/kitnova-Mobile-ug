import React, { useState } from 'react';
import { Shirt, AlertTriangle, CheckCircle2, RefreshCw, Plus, Search, Layers, TrendingDown } from 'lucide-react';
import { store } from '../../services/store';
import { Product } from '../../types';
import { CachedImage } from '../common/CachedImage';

export const AdminInventory: React.FC = () => {
  const products = store.products;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low_stock' | 'healthy'>('all');
  const [restockProductId, setRestockProductId] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(20);

  const filtered = products.filter(p => {
    const isLow = p.stock <= p.lowStockThreshold;
    if (filter === 'low_stock' && !isLow) return false;
    if (filter === 'healthy' && isLow) return false;
    return p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
  });

  const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold).length;
  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);

  const handleRestock = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const newStock = prod.stock + restockAmount;
    store.updateProduct(productId, { stock: newStock }, 'Super Admin (Restock)');
    setRestockProductId(null);
    setRestockAmount(20);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#D4A029] font-bold font-mono">
            APPAREL WAREHOUSE & STOCK CONTROLS
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Inventory & Variant Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track stock per size and variant, monitor low-stock alert thresholds, and execute fast restocks.
          </p>
        </div>

        {/* Inventory KPI Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-[#0A1A3C] p-3 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Total Warehouse Units</span>
            <span className="text-lg font-black text-white font-mono">{totalStockUnits}</span>
          </div>
          <div className={`p-3 rounded-2xl border text-center ${
            lowStockCount > 0 ? 'bg-red-950/40 border-red-500/50' : 'bg-emerald-950/40 border-emerald-500/50'
          }`}>
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Low Stock Alerts</span>
            <span className={`text-lg font-black font-mono ${lowStockCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {lowStockCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search jersey title, SKU, or series..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#D4A029]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-[#D4A029] text-[#0A1A3C]' : 'bg-[#0F2A5F]/40 text-slate-300'
            }`}
          >
            All Inventory ({products.length})
          </button>
          <button
            onClick={() => setFilter('low_stock')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filter === 'low_stock' ? 'bg-red-600 text-white' : 'bg-[#0F2A5F]/40 text-red-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock ({lowStockCount})</span>
          </button>
          <button
            onClick={() => setFilter('healthy')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === 'healthy' ? 'bg-emerald-600 text-white' : 'bg-[#0F2A5F]/40 text-emerald-300'
            }`}
          >
            Healthy Stock
          </button>
        </div>
      </div>

      {/* Product Inventory Table */}
      <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F2A5F]/40 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Apparel Item</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Available Sizes</th>
                <th className="py-3 px-4">Palette</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Stock Units</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map(product => {
                const isLow = product.stock <= product.lowStockThreshold;
                return (
                  <tr key={product.id} className="hover:bg-[#0F2A5F]/20 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <CachedImage
                        src={product.images[0]?.url || '/assets/images/kitnova_custom_jersey_1791234670740.jpg'}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-800 border border-slate-700 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-white">{product.name}</p>
                        <p className="text-[10px] text-slate-400">{product.team}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 font-bold">
                      {product.sku}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.map(s => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-[#0F2A5F] text-[10px] font-mono text-slate-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {product.colors.map((c, i) => (
                          <div
                            key={i}
                            className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {product.lowStockThreshold} units
                    </td>
                    <td className="py-3 px-4 font-mono font-black text-sm">
                      <span className={isLow ? 'text-red-400' : 'text-white'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {isLow ? (
                        <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-500/40 text-[10px] font-mono font-bold flex items-center gap-1 w-max">
                          <AlertTriangle className="w-3 h-3" />
                          LOW STOCK
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" />
                          HEALTHY
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {restockProductId === product.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            min="1"
                            value={restockAmount}
                            onChange={e => setRestockAmount(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 px-2 py-1 rounded bg-[#0A1A3C] border border-slate-700 text-xs text-white font-mono"
                          />
                          <button
                            onClick={() => handleRestock(product.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 cursor-pointer"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => setRestockProductId(null)}
                            className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRestockProductId(product.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#0F2A5F] hover:bg-[#0F2A5F]/80 text-[#D4A029] font-bold text-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Restock</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
