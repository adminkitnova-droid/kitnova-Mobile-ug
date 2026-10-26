import React, { useState } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, Clock, Percent, DollarSign, Calendar } from 'lucide-react';
import { store } from '../../services/store';
import { CouponPromo } from '../../types';

export const AdminDiscounts: React.FC = () => {
  const coupons = store.coupons;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minSpend, setMinSpend] = useState<number>(50000);
  const [usageLimit, setUsageLimit] = useState<number>(200);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    store.addCoupon({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minSpend,
      usageLimit,
      expiryDate,
      isActive: true
    });
    setIsModalOpen(false);
    setCode('');
    setDiscountValue(10);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#D4A029] font-bold font-mono">
            MARKETING & CAMPAIGNS
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Discounts & Voucher Promotions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create coupon codes, configure percentage or UGX deductions, set minimum cart spend, and monitor redemptions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] font-bold text-xs flex items-center gap-2 hover:brightness-110 shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map(coupon => {
          const isExpired = new Date(coupon.expiryDate) < new Date();
          return (
            <div
              key={coupon.id}
              className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-black text-[#D4A029] bg-[#0F2A5F] px-3 py-1 rounded-lg border border-[#D4A029]/30">
                    {coupon.code}
                  </span>
                  <button
                    onClick={() => store.updateCoupon(coupon.id, { isActive: !coupon.isActive })}
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded cursor-pointer ${
                      coupon.isActive && !isExpired
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {coupon.isActive && !isExpired ? 'ACTIVE' : 'INACTIVE'}
                  </button>
                </div>

                <div className="text-lg font-black text-white flex items-baseline gap-1 mt-2">
                  {coupon.discountType === 'percentage' ? (
                    <span>{coupon.discountValue}% OFF</span>
                  ) : (
                    <span>UGX {coupon.discountValue.toLocaleString()} OFF</span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-1">
                  Min spend: <span className="text-slate-200 font-mono">UGX {coupon.minSpend.toLocaleString()}</span>
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800 space-y-1 text-xs text-slate-400 font-mono">
                  <div className="flex justify-between">
                    <span>Redemptions:</span>
                    <span className="text-white font-bold">{coupon.usedCount} / {coupon.usageLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expiry:</span>
                    <span className={isExpired ? 'text-red-400' : 'text-slate-300'}>{coupon.expiryDate}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => store.deleteCoupon(coupon.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCoupon}
            className="bg-[#0A1A3C] border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#D4A029]" />
                New Promotional Code
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Coupon Code (e.g. VIP20)</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="KAMPALA20"
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 font-mono text-[#D4A029] font-bold focus:outline-none focus:border-[#D4A029]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed UGX Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={discountValue}
                    onChange={e => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 font-mono text-white focus:outline-none focus:border-[#D4A029]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Order Spend (UGX)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="5000"
                    value={minSpend}
                    onChange={e => setMinSpend(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 font-mono text-white focus:outline-none focus:border-[#D4A029]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Redemptions</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={usageLimit}
                    onChange={e => setUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 font-mono text-white focus:outline-none focus:border-[#D4A029]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] text-xs font-bold shadow-lg hover:brightness-110 cursor-pointer"
              >
                Create Promo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
