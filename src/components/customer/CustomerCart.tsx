import React, { useState } from 'react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles, Check, Tag, Edit3, Copy } from 'lucide-react';
import { CartItem, DeliveryZone } from '../../types';
import { store } from '../../services/store';
import { CachedImage } from '../common/CachedImage';

interface CustomerCartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onEditItem?: (item: CartItem) => void;
  onDuplicateItem?: (item: CartItem) => void;
  onProceedToCheckout: (discount: number, zone: DeliveryZone) => void;
  onNavigate: (view: string) => void;
}

export const CustomerCart: React.FC<CustomerCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onEditItem,
  onDuplicateItem,
  onProceedToCheckout,
  onNavigate
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string>(store.zones[0].id);

  const selectedZone = store.zones.find(z => z.id === selectedZoneId) || store.zones[0];

  const subtotal = items.reduce((sum, item) => sum + item.totalUnitPrice * item.quantity, 0);
  const deliveryFee = subtotal >= store.settings.freeDeliveryThreshold ? 0 : selectedZone.fee;
  const grandTotal = Math.max(0, subtotal - appliedDiscount + deliveryFee);

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'KAMPALA10') {
      const disc = Math.round(subtotal * 0.1);
      setAppliedDiscount(disc);
      setPromoMessage('10% Kampala promo discount applied!');
    } else if (code === 'KITNOVAUG') {
      setAppliedDiscount(10000);
      setPromoMessage('UGX 10,000 kit voucher applied!');
    } else {
      setPromoMessage('Invalid voucher code. Try KAMPALA10 or KITNOVAUG');
    }
  };

  if (items.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#0F2A5F]/40 border border-[#D4A029]/30 flex items-center justify-center mx-auto mb-4 text-[#D4A029]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Your Cart is Empty</h2>
        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
          You haven't added any jerseys or custom designs to your bag yet.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => onNavigate('shop')}
            className="px-6 py-2.5 rounded-xl bg-[#0F2A5F] border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            Browse Kits
          </button>
          <button
            onClick={() => onNavigate('studio')}
            className="px-6 py-2.5 rounded-xl bg-[#D4A029] text-[#0A1A3C] text-xs font-bold hover:bg-[#F0C760] transition-colors cursor-pointer"
          >
            Design in Studio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight pb-6 border-b border-slate-800">
        Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
      </h1>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
          {items.map(item => (
            <div
              key={item.id}
              className="bg-[#0A1A3C]/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex gap-4 sm:gap-6 items-center shadow-lg"
            >
              {/* Thumbnail */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#0F2A5F]/30 shrink-0 border border-slate-700">
                <CachedImage
                  src={item.productImage || '/assets/images/kitnova_custom_jersey_1791234670740.jpg'}
                  alt={item.productName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {item.productName}
                </h3>

                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Size: <strong className="text-slate-200">{item.size}</strong></span>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <span>Color:</span>
                    <span
                      style={{ backgroundColor: item.color }}
                      className="w-3 h-3 rounded-full inline-block border border-slate-600"
                    />
                  </div>
                </div>

                {/* Customization Details Summary & Price Breakdown (Spec Section 6) */}
                {item.customSummary && (
                  <div className="mt-2 text-[11px] p-2 rounded-xl bg-[#0F2A5F]/40 border border-[#D4A029]/30 text-slate-300 space-y-1 font-mono">
                    <div className="flex items-center gap-1.5 text-[#D4A029] font-bold">
                      <Sparkles className="w-3 h-3 text-[#D4A029]" />
                      <span>CUSTOMIZATION DETAILS</span>
                    </div>
                    {item.customSummary.playerName && (
                      <p>Name: <strong className="text-white">{item.customSummary.playerName}</strong></p>
                    )}
                    {item.customSummary.playerNumber && (
                      <p>Number: <strong className="text-white">#{item.customSummary.playerNumber}</strong></p>
                    )}
                    {item.customSummary.sponsorText && (
                      <p>Sponsor: <strong className="text-white">{item.customSummary.sponsorText}</strong></p>
                    )}
                    {item.customizationPrice > 0 && (
                      <div className="pt-1 border-t border-slate-700/60 text-[10px] text-slate-300 flex justify-between">
                        <span>Base: UGX {item.basePrice.toLocaleString()}</span>
                        <span className="text-[#D4A029]">+ Custom: UGX {item.customizationPrice.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold font-mono text-white">
                    UGX {item.totalUnitPrice.toLocaleString()}
                  </span>

                  {/* Quantity and Actions: Stepper, Edit, Duplicate, Delete (Spec Section 20 & 21) */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center border border-slate-700 rounded-lg bg-[#0F2A5F]/40 overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors"
                        title="Decrease Quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 text-xs font-mono font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors"
                        title="Increase Quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Edit Customization in Studio */}
                    {item.design && onEditItem && (
                      <button
                        onClick={() => onEditItem(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#0F2A5F] border border-slate-700 hover:border-[#D4A029] text-[11px] font-semibold text-slate-300 hover:text-[#D4A029] flex items-center gap-1 transition-colors"
                        title="Re-open in Studio to modify player name, squad number or crest"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </button>
                    )}

                    {/* Duplicate Configuration Line */}
                    {onDuplicateItem && (
                      <button
                        onClick={() => onDuplicateItem(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#0F2A5F]/60 border border-slate-700 hover:border-slate-500 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                        title="Duplicate this configuration to customize another squad member"
                      >
                        <Copy className="w-3 h-3" />
                        Duplicate
                      </button>
                    )}

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                      title="Remove Item from Cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Summary, Zone & Checkout */}
        <div className="lg:col-span-5 bg-[#0A1A3C]/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-base font-bold text-white">Order Summary</h2>

          {/* Delivery Zone Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Kampala Delivery Area
            </label>
            <select
              value={selectedZoneId}
              onChange={e => setSelectedZoneId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#D4A029]"
            >
              {store.zones.map(zone => (
                <option key={zone.id} value={zone.id} className="bg-[#0A1A3C]">
                  {zone.name} — UGX {zone.fee.toLocaleString()} ({zone.estimatedTime})
                </option>
              ))}
            </select>
          </div>

          {/* Promo Code Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Promo or Voucher Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                placeholder="e.g. KAMPALA10"
                className="flex-1 px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-xs text-white placeholder-slate-400 uppercase font-mono focus:outline-none focus:border-[#D4A029]"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="px-4 py-2 rounded-xl bg-[#0F2A5F] border border-slate-700 hover:border-[#D4A029] text-xs font-semibold text-[#D4A029] transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
            {promoMessage && (
              <p className="mt-1.5 text-[11px] text-[#D4A029] flex items-center gap-1 font-medium">
                <Tag className="w-3 h-3" />
                {promoMessage}
              </p>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Items Subtotal</span>
              <span className="font-mono text-white">UGX {subtotal.toLocaleString()}</span>
            </div>

            {appliedDiscount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Voucher Discount</span>
                <span className="font-mono">-UGX {appliedDiscount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-300">
              <div>
                <span>Delivery Fee</span>
                <span className="text-[10px] text-slate-400 block">{selectedZone.name}</span>
              </div>
              <span className="font-mono text-white">
                {deliveryFee === 0 ? 'FREE' : `UGX ${deliveryFee.toLocaleString()}`}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline font-bold text-sm">
              <span className="text-white">Total Amount</span>
              <span className="text-xl font-black font-mono text-[#D4A029]">
                UGX {grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            onClick={() => onProceedToCheckout(appliedDiscount, selectedZone)}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4 text-[#0A1A3C]" />
          </button>
        </div>
      </div>
    </div>
  );
};
