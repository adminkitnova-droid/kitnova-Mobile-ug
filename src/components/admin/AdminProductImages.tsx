import React, { useState, useRef } from 'react';
import { store } from '../../services/store';
import { Product, ProductImage } from '../../types';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { CachedImage } from '../common/CachedImage';
import {
  Image as ImageIcon,
  Camera,
  Upload,
  Star,
  Trash2,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Shirt,
  Sparkles,
  Layers
} from 'lucide-react';

export const AdminProductImages: React.FC = () => {
  const products = store.products;
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [replaceTargetIdx, setReplaceTargetIdx] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.team.toLowerCase().includes(search.toLowerCase())
  );

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Direct image addition via Cloudinary
  const handleAddNewImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProduct) return;

    setIsUploading(true);
    setUploadProgress(15);

    try {
      const res = await uploadToCloudinary(file, p => setUploadProgress(p));
      if (res.success && res.secureUrl) {
        const newImg: ProductImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          url: res.secureUrl,
          isPrimary: selectedProduct.images.length === 0,
          altText: `${selectedProduct.name} Perspective ${selectedProduct.images.length + 1}`
        };

        const updatedImages = [...selectedProduct.images, newImg];
        store.updateProduct(selectedProduct.id, { images: updatedImages }, 'Super Admin (Images)');
        showFeedback(`Added high-res photo to "${selectedProduct.name}"!`);
      } else {
        showFeedback(res.error || 'Upload failed.', 'error');
      }
    } catch (err: any) {
      showFeedback(err?.message || 'Upload error.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (e.target) e.target.value = '';
    }
  };

  // Direct image replacement via Cloudinary
  const handleReplaceImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProduct || replaceTargetIdx === null) return;

    setIsUploading(true);
    setUploadProgress(20);

    try {
      const res = await uploadToCloudinary(file, p => setUploadProgress(p));
      if (res.success && res.secureUrl) {
        const updatedImages = selectedProduct.images.map((img, idx) => {
          if (idx !== replaceTargetIdx) return img;
          return {
            ...img,
            url: res.secureUrl!,
            altText: `${selectedProduct.name} Replaced View`
          };
        });

        store.updateProduct(selectedProduct.id, { images: updatedImages }, 'Super Admin (Images)');
        showFeedback(`Replaced image #${replaceTargetIdx + 1} with fresh Cloudinary photo!`);
      } else {
        showFeedback(res.error || 'Failed to replace image.', 'error');
      }
    } catch (err: any) {
      showFeedback(err?.message || 'Replacement failed.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setReplaceTargetIdx(null);
      if (e.target) e.target.value = '';
    }
  };

  // Reordering images: move left / right
  const handleMoveImage = (fromIdx: number, toIdx: number) => {
    if (!selectedProduct) return;
    if (toIdx < 0 || toIdx >= selectedProduct.images.length) return;

    const copy = [...selectedProduct.images];
    const item = copy.splice(fromIdx, 1)[0];
    copy.splice(toIdx, 0, item);

    // Keep primary status on the first image if moved
    const normalized = copy.map((img, idx) => ({
      ...img,
      isPrimary: idx === 0
    }));

    store.updateProduct(selectedProduct.id, { images: normalized }, 'Super Admin (Images)');
    showFeedback('Reordered product images.');
  };

  // Set primary thumbnail
  const handleSetPrimary = (imgId: string) => {
    if (!selectedProduct) return;
    const targetIdx = selectedProduct.images.findIndex(i => i.id === imgId);
    if (targetIdx === -1) return;

    const copy = [...selectedProduct.images];
    const primaryImg = copy.splice(targetIdx, 1)[0];
    primaryImg.isPrimary = true;
    const normalized = [primaryImg, ...copy.map(i => ({ ...i, isPrimary: false }))];

    store.updateProduct(selectedProduct.id, { images: normalized }, 'Super Admin (Images)');
    showFeedback('Primary storefront thumbnail updated.');
  };

  // Remove an image safely
  const handleDeleteImage = (imgId: string) => {
    if (!selectedProduct) return;
    if (selectedProduct.images.length <= 1) {
      showFeedback('A product must maintain at least one showcase image.', 'error');
      return;
    }

    const updated = selectedProduct.images.filter(i => i.id !== imgId);
    if (!updated.some(i => i.isPrimary) && updated.length > 0) {
      updated[0].isPrimary = true;
    }

    store.updateProduct(selectedProduct.id, { images: updated }, 'Super Admin (Images)');
    showFeedback('Image removed from product gallery.');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAddNewImage}
        className="hidden"
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        onChange={handleReplaceImageFile}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#D4A029] font-bold font-mono">
            Digital Asset Management
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-[#D4A029]" />
            Product Images & Gallery Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload, replace, remove, and reorder high-res kit photography directly from your device. Real-time Cloudinary sync.
          </p>
        </div>

        {selectedProduct && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2.5 rounded-xl bg-[#D4A029] hover:bg-[#F0C760] text-[#0A1A3C] font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-lg disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
            <span>Upload New Photo</span>
          </button>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              : 'bg-red-950/80 border-red-500/50 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="bg-[#0F2A5F] px-4 py-3 rounded-2xl border border-[#D4A029]/40 flex items-center justify-between text-xs font-bold text-white shadow-xl animate-pulse">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#D4A029] animate-spin" />
            <span>Uploading photo to Cloudinary CDN ({uploadProgress}%)...</span>
          </div>
          <div className="w-40 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div className="bg-[#D4A029] h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {/* Main Layout: Left Product Picker, Right Photo Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product Selection List */}
        <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Shirt className="w-4 h-4 text-[#D4A029]" />
              Select Product ({products.length})
            </h2>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter products..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#D4A029]"
            />
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredProducts.map(p => {
              const isSelected = p.id === selectedProductId;
              const primaryImg = p.images.find(i => i.isPrimary) || p.images[0];
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F2A5F] border-[#D4A029] text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <CachedImage
                    src={primaryImg?.url || '/assets/images/kitnova_custom_jersey_1791234670740.jpg'}
                    alt={p.name}
                    className="w-11 h-11 rounded-lg object-cover bg-slate-950 border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate text-white">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{p.sku}</p>
                    <span className="text-[10px] text-[#D4A029] font-semibold">{p.images.length} photos</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Gallery Control for Selected Product */}
        <div className="lg:col-span-2 bg-[#0A1A3C] border border-slate-800 rounded-2xl p-6 space-y-6">
          {selectedProduct ? (
            <>
              {/* Product Info Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-[#D4A029]">
                    {selectedProduct.sku} · {selectedProduct.category.toUpperCase()}
                  </span>
                  <h3 className="text-lg font-black text-white">{selectedProduct.name}</h3>
                  <p className="text-xs text-slate-400">
                    Base Price: UGX {selectedProduct.basePrice.toLocaleString()} · Total Images: {selectedProduct.images.length}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-[#0F2A5F] border border-[#D4A029]/40 text-[#D4A029] text-xs font-bold hover:bg-[#0F2A5F]/80 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload to Gallery</span>
                  </button>
                </div>
              </div>

              {/* Photo Cards Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Reorder perspective by clicking arrows, or set as Front Thumbnail.</span>
                  <span className="text-emerald-400 font-mono text-[11px]">Auto-saved to store</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedProduct.images.map((img, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === selectedProduct.images.length - 1;

                    return (
                      <div
                        key={img.id}
                        className={`rounded-2xl border p-2 bg-[#071329] space-y-2 relative group transition-all ${
                          img.isPrimary
                            ? 'border-[#D4A029] ring-2 ring-[#D4A029]/30'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Image Preview */}
                        <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-950">
                          <CachedImage
                            src={img.url}
                            alt={img.altText || `View ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Primary Badge */}
                          {img.isPrimary && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#D4A029] text-[#0A1A3C] text-[10px] font-black font-mono shadow-md">
                              PRIMARY COVER
                            </span>
                          )}

                          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-slate-300 text-[10px] font-mono">
                            #{idx + 1}
                          </span>
                        </div>

                        {/* Controls Toolbar */}
                        <div className="space-y-2 text-xs">
                          {/* Reorder Buttons */}
                          <div className="flex items-center justify-between bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                            <button
                              onClick={() => handleMoveImage(idx, idx - 1)}
                              disabled={isFirst}
                              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                              title="Move photo left"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] text-slate-400 font-mono font-semibold">
                              Position {idx + 1} of {selectedProduct.images.length}
                            </span>
                            <button
                              onClick={() => handleMoveImage(idx, idx + 1)}
                              disabled={isLast}
                              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                              title="Move photo right"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Action Buttons: Set Primary, Replace, Remove */}
                          <div className="flex items-center justify-between pt-1">
                            {!img.isPrimary ? (
                              <button
                                onClick={() => handleSetPrimary(img.id)}
                                className="text-[11px] text-[#D4A029] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Star className="w-3 h-3" />
                                <span>Make Primary</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-[#D4A029] font-bold flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" />
                                <span>Front Cover</span>
                              </span>
                            )}

                            <div className="flex items-center gap-2">
                              {/* Replace button (direct device file upload) */}
                              <button
                                onClick={() => {
                                  setReplaceTargetIdx(idx);
                                  replaceInputRef.current?.click();
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                title="Replace photo from device"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>

                              {/* Remove button */}
                              <button
                                onClick={() => handleDeleteImage(img.id)}
                                className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 transition-colors cursor-pointer"
                                title="Remove photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
              <p>Select a product to view and edit its high-res image gallery.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
