import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  Star
} from 'lucide-react';
import { Product } from '../../types';
import { CachedImage } from '../common/CachedImage';

interface CustomerProductDetailProps {
  product: Product;
  onBack: () => void;
  onCustomize: (product: Product, size?: string, color?: string) => void;
  onAddPlainToCart: (product: Product, size: string, color: string, quantity?: number) => void;
}

export const CustomerProductDetail: React.FC<CustomerProductDetailProps> = ({
  product,
  onBack,
  onCustomize,
  onAddPlainToCart
}) => {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'L');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || '#0F2A5F');
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddedToast, setIsAddedToast] = useState(false);

  const isLowStock = product.stock <= product.lowStockThreshold;
  const currentImage = product.images[activeImageIdx] || product.images[0];
  const customizable = product.isCustomizable !== false;

  const handleAddToCart = () => {
    onAddPlainToCart(product, selectedSize, selectedColor, quantity);
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-[#D4A029] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Gallery Column (Left) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] w-full bg-[#0F2A5F]/20 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            <CachedImage
              src={currentImage?.url || '/assets/images/kitnova_custom_jersey_1791234670740.jpg'}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />

            {/* Customization badge */}
            {customizable ? (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#0A1A3C]/90 border border-[#D4A029]/50 text-[#D4A029] text-xs font-bold flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A029]" />
                Customizable Kit
              </span>
            ) : (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#0A1A3C]/90 border border-slate-700 text-slate-300 text-xs font-semibold">
                Standard Matchwear
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    activeImageIdx === idx ? 'border-[#D4A029] scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <CachedImage
                    src={img.url}
                    alt={img.altText}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Module Column (Right) */}
        <div className="lg:col-span-5 bg-[#0A1A3C] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Team / Category Tag */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="uppercase tracking-widest font-bold text-[#D4A029] font-mono">
                {product.team} · {product.category.toUpperCase()}
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                4.9 / 5.0
              </span>
            </div>

            {/* Title & SKU */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {product.name}
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-1">SKU: {product.sku}</p>
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-black font-mono text-white">
                UGX {product.basePrice.toLocaleString()}
              </span>
              {(product.oldPrice || product.discountPrice) && (
                <span className="text-sm font-mono text-slate-500 line-through">
                  UGX {(product.oldPrice || (product.basePrice + 15000)).toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock Availability */}
            <div className="p-3 rounded-2xl bg-[#0F2A5F]/30 border border-slate-800">
              {product.stock === 0 ? (
                <p className="text-xs font-bold text-red-400">Currently Out of Stock</p>
              ) : isLowStock ? (
                <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Only {product.stock} units remaining in Kampala Central Hub
                </p>
              ) : (
                <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  ✓ In Stock & Ready for Rapid Dispatch
                </p>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {product.description}
            </p>

            {/* Size Selector */}
            <div>
              <div className="flex justify-between items-center text-xs text-slate-300 font-semibold mb-2">
                <span>Available Sizes</span>
                <span className="text-slate-500 font-normal">Athletic Modern Fit</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'bg-[#D4A029] text-[#0A1A3C] shadow-md'
                        : 'bg-[#0F2A5F]/40 border border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div>
              <span className="block text-xs text-slate-300 font-semibold mb-2">Colorway</span>
              <div className="flex items-center gap-3">
                {product.colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                      selectedColor === color ? 'scale-125 border-[#D4A029] shadow-md' : 'border-slate-700 hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-300 font-semibold">Quantity</span>
              <div className="flex items-center bg-[#0F2A5F]/40 border border-slate-700 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-mono font-bold text-white text-xs">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Action CTAs (Spec 3 & 4: ADD TO CART IS PRIMARY!) */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            {/* PRIMARY CTA: ADD TO CART */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                isAddedToast
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-[#D4A029] via-[#F0C760] to-[#B3831B] text-[#0A1A3C] hover:brightness-110 active:scale-[0.99]'
              }`}
            >
              {isAddedToast ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added {quantity}x to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#0A1A3C]" />
                  <span>ADD TO CART</span>
                </>
              )}
            </button>

            {/* OPTIONAL SECONDARY CTA: CUSTOMIZE THIS JERSEY */}
            {/* IF Admin has disabled customization for this product, this button is NOT rendered! */}
            {customizable && (
              <button
                onClick={() => onCustomize(product, selectedSize, selectedColor)}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0F2A5F]/70 border border-[#D4A029]/50 hover:border-[#D4A029] text-[#D4A029] hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4 text-[#D4A029]" />
                <span>Customize this Jersey in Studio</span>
              </button>
            )}
          </div>

          {/* Value Props list */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-[#D4A029]" />
              <span>Same-day courier dispatch within Kampala</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4A029]" />
              <span>100% Authentic Vishcom Tech manufacture warranty</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
