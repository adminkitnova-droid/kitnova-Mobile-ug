import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Shirt, Truck, CreditCard } from 'lucide-react';
import { store } from '../../services/store';

export const AdminAnalytics: React.FC = () => {
  const orders = store.orders;
  const payments = store.payments;
  const products = store.products;

  const totalRev = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalAmount, 0);

  // Channel breakdown
  const mtnCount = payments.filter(p => p.paymentMethod === 'mtn_momo').length;
  const airtelCount = payments.filter(p => p.paymentMethod === 'airtel_money').length;
  const cardCount = payments.filter(p => p.paymentMethod === 'stripe_card').length;
  const totalCount = Math.max(1, payments.length);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="pb-6 border-b border-slate-800">
        <span className="text-xs uppercase tracking-wider text-[#D4A029] font-bold">
          Business Intelligence
        </span>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">
          Analytics & Performance Metrics
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment Channels Breakdown */}
        <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#D4A029]" />
            Payment Gateway Share
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>MTN Mobile Money</span>
                <span className="font-mono font-bold text-white">{Math.round((mtnCount / totalCount) * 100)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div style={{ width: `${(mtnCount / totalCount) * 100}%` }} className="h-full bg-[#FFCC00]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Airtel Money</span>
                <span className="font-mono font-bold text-white">{Math.round((airtelCount / totalCount) * 100)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div style={{ width: `${(airtelCount / totalCount) * 100}%` }} className="h-full bg-[#DC2626]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Visa / Stripe Cards</span>
                <span className="font-mono font-bold text-white">{Math.round((cardCount / totalCount) * 100)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div style={{ width: `${(cardCount / totalCount) * 100}%` }} className="h-full bg-[#D4A029]" />
              </div>
            </div>
          </div>
        </div>

        {/* Customization Volume */}
        <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shirt className="w-4 h-4 text-[#D4A029]" />
            Studio Customization Rate
          </h2>

          <div className="space-y-2 text-xs">
            <p className="text-3xl font-black text-white font-mono">82.4%</p>
            <p className="text-slate-400">
              of customers customize with a personalized player name or squad number before checkout.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Top Font Selected:</span>
                <strong className="text-[#D4A029]">Bebas Pro (54%)</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Most Popular Number:</span>
                <strong className="text-white">#10, #7, #9</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Logistics SLA */}
        <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#D4A029]" />
            Urban Delivery Turnaround
          </h2>

          <div className="space-y-2 text-xs">
            <p className="text-3xl font-black text-[#D4A029] font-mono">42 mins</p>
            <p className="text-slate-400">
              Average rider transit time from Kitnova Central Store to Kampala Central destination.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>On-time Delivery SLA:</span>
                <strong className="text-emerald-400">98.2%</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Top Delivery Zone:</span>
                <strong className="text-white">Kololo & Nakawa</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
