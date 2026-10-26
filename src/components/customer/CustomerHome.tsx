import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Truck, Users } from 'lucide-react';
import { store } from '../../services/store';
import { Product } from '../../types';
import { CachedImage } from '../common/CachedImage';

interface CustomerHomeProps {
  onNavigate: (view: string) => void;
  onSelectProduct: (product: Product) => void;
  onCustomizeProduct: (product: Product) => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  onNavigate,
  onSelectProduct,
  onCustomizeProduct
}) => {
  const featuredProducts = store.products.slice(0, 3);

  return (
    <div className="w-full pb-16">
      {/* 1. Storefront Hero: 1 bold campaign focal point */}
      <section className="relative w-full min-h-[520px] md:min-h-[580px] flex items-center bg-[#0A1A3C] overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <CachedImage
            src="/assets/images/kitnova_hero_jersey_1791234660638.jpg"
            alt="KITNOVA Sportswear Athletes in Stadium Tunnel"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1A3C] via-[#0A1A3C]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A3C] via-transparent to-black/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col justify-center">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A029]/15 border border-[#D4A029]/30 text-[#D4A029] text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Official Vishcom Tech Sportswear 2026/27
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.08] text-balance">
              Precision Sportswear. Built for the Champions.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
              Engineered in Kampala with elite breathable dry-tech fabrics. Design your personalized match kit with live typography previews and fast urban dispatch.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('studio')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] font-bold text-sm tracking-wide shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer"
              >
                Customize in Studio
                <ArrowRight className="w-4 h-4 text-[#0A1A3C]" />
              </button>

              <button
                onClick={() => onNavigate('shop')}
                className="px-6 py-3.5 rounded-xl bg-[#0F2A5F]/70 border border-slate-700 text-white font-semibold text-sm hover:bg-[#0F2A5F] hover:border-slate-500 transition-all cursor-pointer"
              >
                Explore Catalog
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Fast Trust & Operations Bar (Kampala Delivery, Tech Fabrics, MTN/Airtel) */}
      <section className="border-y border-slate-800 bg-[#0F2A5F]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0F2A5F] text-[#D4A029]">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-200">Kampala Urban Dispatch</p>
              <p className="text-slate-400">Rider delivery in 2-4 hours across Kampala & Wakiso</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0F2A5F] text-[#D4A029]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-200">MTN MoMo & Airtel Instant Pay</p>
              <p className="text-slate-400">Direct mobile money checkout with verified receipt</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0F2A5F] text-[#D4A029]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-200">Dry-Tech Aero Fabric</p>
              <p className="text-slate-400">High-definition heat press & silicone crest durability</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Collection Grid: 3-column with generous whitespace */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 md:pt-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#D4A029] font-bold">
              Official Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Featured Matchwear
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-semibold text-[#D4A029] hover:underline flex items-center gap-1 cursor-pointer"
          >
            View all ({store.products.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {featuredProducts.map(product => {
            const primaryImg = product.images.find(img => img.isPrimary) || product.images[0];
            const isLowStock = product.stock <= product.lowStockThreshold;

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group bg-[#0A1A3C]/70 border border-slate-800 rounded-2xl overflow-hidden hover:border-[#D4A029]/50 transition-all duration-200 flex flex-col cursor-pointer shadow-lg hover:-translate-y-1"
              >
                {/* Product Image: 65-75% of card height */}
                <div className="relative aspect-[4/3] w-full bg-[#0F2A5F]/30 overflow-hidden">
                  <CachedImage
                    src={primaryImg?.url || '/assets/images/kitnova_custom_jersey_1791234670740.jpg'}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Subtle Stock status indicator */}
                  <div className="absolute top-3 right-3">
                    {product.stock === 0 ? (
                      <span className="px-2.5 py-1 rounded bg-red-950/80 border border-red-500/60 text-red-300 text-[11px] font-semibold">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2.5 py-1 rounded bg-amber-950/80 border border-amber-500/60 text-amber-300 text-[11px] font-semibold">
                        Only {product.stock} left
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-slate-900/80 border border-slate-700 text-slate-300 text-[11px] font-medium">
                        In Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Metadata */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <span className="uppercase tracking-wider font-semibold text-[#D4A029]">{product.team}</span>
                      <span>·</span>
                      <span className="capitalize">{product.category}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-[#D4A029] transition-colors line-clamp-1">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Price</span>
                      <span className="text-base font-bold font-mono text-white">
                        UGX {product.basePrice.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onCustomizeProduct(product);
                      }}
                      className="px-3.5 py-2 rounded-lg bg-[#D4A029] hover:bg-[#F0C760] text-[#0A1A3C] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Customize
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Team & Club Bulk Customization Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
        <div className="relative rounded-2xl bg-gradient-to-r from-[#0F2A5F] via-[#0A1A3C] to-[#0F2A5F] border border-[#D4A029]/30 p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A029]/20 text-[#D4A029] text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              Clubs, Companies & Tournaments
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Order Custom Squad Kits for Your Entire Team
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Use our interactive Team Roster Manager to configure 15+ player names, squad numbers, and custom sizes in one unified order with bulk pricing.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('team')}
                className="px-6 py-3 rounded-xl bg-white text-[#0A1A3C] font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors shadow-lg cursor-pointer"
              >
                Launch Team Roster Builder
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
