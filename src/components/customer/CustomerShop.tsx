import React, { useState } from 'react';
import { Search, Sparkles, ShoppingBag, Check, Star } from 'lucide-react';
import { store } from '../../services/store';
import { Product } from '../../types';
import { CachedImage } from '../common/CachedImage';

interface CustomerShopProps {
  onSelectProduct: (product: Product) => void;
  onCustomizeProduct: (product: Product, size?: string, color?: string) => void;
  onAddToCartPlain?: (product: Product, size: string, color: string) => void;
}

export const CustomerShop: React.FC<CustomerShopProps> = ({
  onSelectProduct,
  onCustomizeProduct,
  onAddToCartPlain
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [cardSizes, setCardSizes] = useState<Record<string, string>>({});
  const [cardColors, setCardColors] = useState<Record<string, string>>({});
  const [addedAnimation, setAddedAnimation] = useState<Record<string, boolean>>({});

  const categories = [
    { id: 'all', label: 'All Kits & Apparel' },
    { id: 'club', label: 'Club Matchwear' },
    { id: 'national', label: 'National Editions' },
    { id: 'training', label: 'Training Series' },
    { id: 'blank', label: 'Customizer Blanks' }
  ];

  let filtered = store.products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch && p.status === 'active';
  });

  if (sortBy === 'price-asc') {
    filtered = [...filtered].sort((a, b) => a.basePrice - b.basePrice);
  } else if (sortBy === 'price-desc') {
    filtered = [...filtered].sort((a, b) => b.basePrice - a.basePrice);
  }

  const handleQuickAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const size = cardSizes[product.id] || product.sizes[0] || 'L';
    const color = cardColors[product.id] || product.colors[0] || '#0F2A5F';

    if (onAddToCartPlain) {
      onAddToCartPlain(product, size, color);
    }

    // Trigger visual added pulse
    setAddedAnimation(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedAnimation(prev => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#D4A029] font-bold font-mono">
            Official E-Commerce Store
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            Sportswear Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Shop directly with standard checkout or personalize official jerseys in the Studio.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search jerseys, teams, series..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#D4A029]"
            />
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-[#D4A029] cursor-pointer"
          >
            <option value="featured">Featured First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Segmented Tabs */}
      <div className="flex items-center gap-2 py-4 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#D4A029] text-[#0A1A3C] shadow-md font-bold'
                : 'bg-[#0F2A5F]/40 text-slate-300 hover:text-white hover:bg-[#0F2A5F]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-slate-400">
          <p className="text-base font-semibold">No jerseys match your filters.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-3 text-xs text-[#D4A029] hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
          {filtered.map(product => {
            const primaryImg = product.images.find(img => img.isPrimary) || product.images[0];
            const isLowStock = product.stock <= product.lowStockThreshold;
            const currentSelectedSize = cardSizes[product.id] || product.sizes[0] || 'L';
            const currentSelectedColor = cardColors[product.id] || product.colors[0] || '#0F2A5F';
            const isAdded = addedAnimation[product.id];
            const customizable = product.isCustomizable !== false;

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group bg-[#0A1A3C]/90 border border-slate-800 rounded-3xl overflow-hidden hover:border-[#D4A029]/60 transition-all duration-200 flex flex-col cursor-pointer shadow-xl hover:-translate-y-1"
              >
                {/* Product Card Image */}
                <div className="relative aspect-[4/3] w-full bg-[#0F2A5F]/20 overflow-hidden">
                  <CachedImage
                    src={primaryImg?.url || '/assets/images/kitnova_custom_jersey_1791234670740.jpg'}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Stock Tag */}
                  <div className="absolute top-3 right-3">
                    {product.stock === 0 ? (
                      <span className="px-2.5 py-1 rounded-full bg-red-950/90 border border-red-500/60 text-red-300 text-[10px] font-semibold">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-950/90 border border-amber-500/60 text-amber-300 text-[10px] font-semibold">
                        Only {product.stock} units left
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 text-[10px] font-medium">
                        ✓ In Stock
                      </span>
                    )}
                  </div>

                  {/* Customizable Badge */}
                  {customizable && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-[#0A1A3C]/90 border border-[#D4A029]/50 text-[#D4A029] text-[10px] font-bold flex items-center gap-1 shadow-md">
                        <Sparkles className="w-3 h-3 text-[#D4A029]" />
                        Customizable
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Content & E-commerce Attributes */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="uppercase tracking-wider font-semibold text-[#D4A029]">{product.team}</span>
                      <span className="flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                        <Star className="w-3 h-3 fill-current" />
                        4.8
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-[#D4A029] transition-colors line-clamp-1">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Inline Variant Selection: Size & Color */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Size:</span>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        {product.sizes.slice(0, 5).map(sz => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setCardSizes(prev => ({ ...prev, [product.id]: sz }))}
                            className={`w-6 h-6 rounded text-[10px] font-bold font-mono transition-all cursor-pointer ${
                              currentSelectedSize === sz
                                ? 'bg-[#D4A029] text-[#0A1A3C] shadow'
                                : 'bg-[#0F2A5F]/40 text-slate-300 hover:bg-[#0F2A5F]'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Color:</span>
                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        {product.colors.map(col => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setCardColors(prev => ({ ...prev, [product.id]: col }))}
                            style={{ backgroundColor: col }}
                            className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                              currentSelectedColor === col ? 'scale-125 border-white ring-1 ring-[#D4A029]' : 'border-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Primary Action Buttons (Spec 2 & 3: ADD TO CART IS PRIMARY!) */}
                  <div className="pt-3 border-t border-slate-800">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">Price</span>
                        <span className="text-lg font-black font-mono text-white">
                          UGX {product.basePrice.toLocaleString()}
                        </span>
                      </div>
                      {(product.oldPrice || product.discountPrice) && (
                        <span className="text-xs text-slate-500 line-through font-mono">
                          UGX {(product.oldPrice || (product.basePrice + 15000)).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Button Group */}
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      {/* PRIMARY ACTION: ADD TO CART */}
                      <button
                        type="button"
                        onClick={e => handleQuickAddToCart(e, product)}
                        className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] hover:brightness-110 active:scale-[0.98]'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added to Cart!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>ADD TO CART</span>
                          </>
                        )}
                      </button>

                      {/* OPTIONAL SECONDARY ACTION: CUSTOMIZE (ONLY IF customizable is true) */}
                      {customizable && (
                        <button
                          type="button"
                          onClick={() => onCustomizeProduct(product, currentSelectedSize, currentSelectedColor)}
                          className="py-2.5 px-3 rounded-xl bg-[#0F2A5F] hover:bg-[#0F2A5F]/80 text-[#D4A029] border border-[#D4A029]/40 hover:border-[#D4A029] font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Personalize in Studio"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Customize</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
