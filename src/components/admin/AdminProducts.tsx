import React, { useState, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertTriangle,
  Check,
  Star,
  Camera,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  Sparkles,
  Maximize2,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Archive,
  AlertCircle,
  X
} from 'lucide-react';
import { store } from '../../services/store';
import { Product, ProductImage } from '../../types';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { CachedImage } from '../common/CachedImage';

export const AdminProducts: React.FC = () => {
  const products = store.products;
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'archived'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<'club' | 'national' | 'training' | 'blank'>('club');
  const [team, setTeam] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState<number>(75000);
  const [discountPrice, setDiscountPrice] = useState<number>(65000);
  const [oldPrice, setOldPrice] = useState<number>(85000);
  const [stock, setStock] = useState<number>(50);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(10);
  const [isCustomizable, setIsCustomizable] = useState<boolean>(true);
  const [productStatus, setProductStatus] = useState<'active' | 'archived' | 'draft'>('active');
  const [images, setImages] = useState<ProductImage[]>([]);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadTargetSide, setUploadTargetSide] = useState<'front' | 'back' | 'gallery'>('front');
  const [replaceTargetIndex, setReplaceTargetIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);

  // Deletion Confirmation Modal State
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Feedback Banner
  const [feedback, setFeedback] = useState<string | null>(null);
  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const filtered = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.team.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'active' && p.status === 'active') ||
      (selectedStatus === 'archived' && p.status === 'archived');
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const openCreateModal = () => {
    setEditingProductId(null);
    setName('');
    setSku(`KTN-${Math.floor(1000 + Math.random() * 9000)}`);
    setCategory('club');
    setTeam('Kitnova Elite');
    setDescription('High performance dry-tech breathable jersey fabric tailored for athletic matchwear.');
    setBasePrice(75000);
    setDiscountPrice(65000);
    setOldPrice(85000);
    setStock(50);
    setLowStockThreshold(10);
    setIsCustomizable(true);
    setProductStatus('active');
    setImages([
      {
        id: `img-${Date.now()}`,
        url: '/assets/images/kitnova_custom_jersey_1791234670740.jpg',
        isPrimary: true,
        altText: 'Kitnova Pro Jersey'
      }
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProductId(p.id);
    setName(p.name);
    setSku(p.sku);
    setCategory(p.category);
    setTeam(p.team);
    setDescription(p.description);
    setBasePrice(p.basePrice);
    setDiscountPrice(p.discountPrice || p.basePrice);
    setOldPrice(p.oldPrice || p.basePrice + 10000);
    setStock(p.stock);
    setLowStockThreshold(p.lowStockThreshold);
    setIsCustomizable(p.isCustomizable !== false);
    setProductStatus(p.status || 'active');
    setImages(p.images);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      store.updateProduct(editingProductId, {
        name,
        sku,
        category,
        team,
        description,
        basePrice,
        discountPrice,
        oldPrice,
        stock,
        lowStockThreshold,
        isCustomizable,
        status: productStatus,
        images
      }, 'Super Admin');
      showFeedback(`Product "${name}" updated successfully.`);
    } else {
      store.addProduct({
        name,
        sku,
        description,
        category,
        team,
        basePrice,
        discountPrice,
        oldPrice,
        sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
        colors: ['#0F2A5F', '#D4A029', '#0A1A3C', '#FFFFFF'],
        stock,
        lowStockThreshold,
        isCustomizable,
        isFeatured: true,
        isPopular: false,
        status: productStatus,
        images
      }, 'Super Admin');
      showFeedback(`Product "${name}" published to catalog.`);
    }
    setIsModalOpen(false);
  };

  // Toggle publish / archive
  const handleTogglePublish = (p: Product) => {
    if (p.status === 'active') {
      store.archiveProduct(p.id, 'Super Admin');
      showFeedback(`Archived "${p.name}". Hidden from customer shop.`);
    } else {
      store.publishProduct(p.id, 'Super Admin');
      showFeedback(`Published "${p.name}". Visible in live customer store.`);
    }
  };

  // Safe delete handler
  const handleInitiateDelete = (p: Product) => {
    const check = store.canSafelyDeleteProduct(p.id);
    setDeleteCandidate(p);
    setDeleteError(check.safe ? null : check.reason || null);
  };

  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    const res = store.deleteProduct(deleteCandidate.id, 'Super Admin');
    if (res.success) {
      showFeedback(`Safely deleted "${deleteCandidate.name}".`);
      setDeleteCandidate(null);
      setDeleteError(null);
    } else {
      setDeleteError(res.error || 'Deletion failed.');
    }
  };

  // Trigger file upload from camera or device
  const triggerUpload = (targetSide: 'front' | 'back' | 'gallery') => {
    setUploadTargetSide(targetSide);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    setUploadPercent(10);

    try {
      const res = await uploadToCloudinary(file, percent => setUploadPercent(percent));
      if (res.success && res.secureUrl) {
        const isFirst = images.length === 0 || uploadTargetSide === 'front';
        const newImg: ProductImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          url: res.secureUrl,
          isPrimary: isFirst,
          altText: `${name || 'Product'} ${uploadTargetSide} view`
        };

        if (uploadTargetSide === 'front' && images.length > 0) {
          setImages([newImg, ...images.filter((_, idx) => idx !== 0)]);
        } else {
          setImages(prev => [...prev, newImg]);
        }
        showFeedback('Uploaded high-res photo via Cloudinary CDN!');
      }
    } catch (err) {
      console.error('Cloudinary upload error:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Image replacement from device
  const handleReplaceImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replaceTargetIndex === null) return;

    setIsUploading(true);
    setUploadPercent(15);

    try {
      const res = await uploadToCloudinary(file, percent => setUploadPercent(percent));
      if (res.success && res.secureUrl) {
        setImages(prev =>
          prev.map((img, idx) => (idx === replaceTargetIndex ? { ...img, url: res.secureUrl! } : img))
        );
        showFeedback(`Replaced image #${replaceTargetIndex + 1}.`);
      }
    } catch (err) {
      console.error('Replacement error:', err);
    } finally {
      setIsUploading(false);
      setReplaceTargetIndex(null);
      e.target.value = '';
    }
  };

  // Reorder images
  const handleMoveImage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= images.length) return;
    const copy = [...images];
    const item = copy.splice(fromIdx, 1)[0];
    copy.splice(toIdx, 0, item);
    // Keep first item as primary
    const normalized = copy.map((img, idx) => ({ ...img, isPrimary: idx === 0 }));
    setImages(normalized);
  };

  const handleSetPrimaryImage = (imgId: string) => {
    setImages(images.map(img => ({ ...img, isPrimary: img.id === imgId })));
  };

  const handleDeleteImage = (imgId: string) => {
    if (images.length <= 1) return; // Keep at least one
    const updated = images.filter(img => img.id !== imgId);
    if (!updated.some(i => i.isPrimary) && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    setImages(updated);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Hidden File Inputs for Real Photo Uploads & Replacements */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleReplaceImageFile}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#D4A029] font-bold font-mono">
            Catalog & Apparel Lifecycle
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Products & Apparel Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish, archive, and manage football kits with direct camera/gallery Cloudinary uploads.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold text-xs hover:bg-[#F0C760] transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Feedback Notice */}
      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, SKU, or team..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#D4A029]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter tabs */}
          <div className="flex bg-[#0A1A3C] p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedStatus === 'all' ? 'bg-[#D4A029] text-[#0A1A3C]' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setSelectedStatus('active')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedStatus === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setSelectedStatus('archived')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedStatus === 'archived' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Archived
            </button>
          </div>

          {/* Category filter pills */}
          {['all', 'club', 'national', 'training', 'blank'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0F2A5F] text-[#D4A029] border border-[#D4A029]/40'
                  : 'bg-[#0F2A5F]/20 text-slate-300 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F2A5F]/40 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Item & Images</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Base Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Customizable?</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map(p => {
                const isLowStock = p.stock <= p.lowStockThreshold;
                const primaryImg = p.images.find(img => img.isPrimary) || p.images[0];
                const isArchived = p.status === 'archived';

                return (
                  <tr key={p.id} className="hover:bg-[#0F2A5F]/20 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <CachedImage
                        src={primaryImg?.url || '/assets/images/kitnova_custom_jersey_1791234670740.jpg'}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover bg-slate-800 border border-slate-700"
                      />
                      <div>
                        <p className="font-bold text-white text-xs">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.images.length} photo(s) on CDN</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{p.sku}</td>
                    <td className="py-3 px-4">
                      <span className="capitalize">{p.category}</span> · <span className="text-[#D4A029]">{p.team}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      UGX {p.basePrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                          p.stock === 0
                            ? 'bg-red-950 text-red-300 border border-red-500/50'
                            : isLowStock
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/50 animate-pulse'
                            : 'bg-emerald-950/60 text-emerald-300'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          !isArchived
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {!isArchived ? 'Published' : 'Archived'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          p.isCustomizable !== false
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {p.isCustomizable !== false ? '✓ Customizable' : 'Standard Only'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg bg-[#0F2A5F] hover:bg-[#0F2A5F]/80 text-[#D4A029] transition-colors"
                          title="Edit product details & images"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Publish / Archive Button */}
                        <button
                          onClick={() => handleTogglePublish(p)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            !isArchived
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-400'
                          }`}
                          title={!isArchived ? 'Archive product (hide from shop)' : 'Publish product to live shop'}
                        >
                          {!isArchived ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>

                        {/* Safe Delete Button */}
                        <button
                          onClick={() => handleInitiateDelete(p)}
                          className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 transition-colors"
                          title="Safely delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SAFE DELETE CONFIRMATION MODAL */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1A3C] border border-red-500/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Safe Deletion Verification</h3>
                <p className="text-[11px] text-slate-400">{deleteCandidate.name} ({deleteCandidate.sku})</p>
              </div>
            </div>

            {deleteError ? (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  Cannot Safely Delete
                </p>
                <p className="text-[11px] leading-relaxed">{deleteError}</p>
                <button
                  onClick={() => {
                    handleTogglePublish(deleteCandidate);
                    setDeleteCandidate(null);
                  }}
                  className="w-full mt-2 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 transition-colors"
                >
                  Archive This Product Instead (Recommended)
                </button>
              </div>
            ) : (
              <p className="text-slate-300 leading-relaxed">
                This item has no pending customer orders. Are you sure you want to permanently delete it from the Kitnova catalog? This action will be recorded in the security audit logs.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setDeleteCandidate(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              {!deleteError && (
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors"
                >
                  Confirm Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT CREATION / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveProduct}
            className="bg-[#0A1A3C] border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto text-xs"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-[#D4A029]">
                  {editingProductId ? 'Edit Product' : 'Add Product'}
                </span>
                <h3 className="text-lg font-black text-white">
                  {editingProductId ? 'Update Product Details' : 'ADD PRODUCT'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            {/* Product Basic Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. KITNOVA Premium Jersey"
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Breathable athletic fabric tailored for professional performance..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">SKU</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 font-mono text-white focus:outline-none focus:border-[#D4A029]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
                >
                  <option value="club" className="bg-[#0A1A3C]">Football Club Kit</option>
                  <option value="national" className="bg-[#0A1A3C]">National Team</option>
                  <option value="training" className="bg-[#0A1A3C]">Training Series</option>
                  <option value="blank" className="bg-[#0A1A3C]">Blank Customizer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Base Price (UGX)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={500}
                  value={basePrice}
                  onChange={e => setBasePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 font-mono text-white focus:outline-none focus:border-[#D4A029]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Discount Price (UGX)</label>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  value={discountPrice}
                  onChange={e => setDiscountPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 font-mono text-white focus:outline-none focus:border-[#D4A029]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={stock}
                  onChange={e => setStock(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 font-mono text-white focus:outline-none focus:border-[#D4A029]"
                />
              </div>

              <div>
                <label className="block font-semibold text-amber-300 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={lowStockThreshold}
                  onChange={e => setLowStockThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0A1A3C] border border-slate-700 font-mono text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Publishing Status</label>
                <select
                  value={productStatus}
                  onChange={e => setProductStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white font-bold"
                >
                  <option value="active" className="bg-[#0A1A3C]">Published (Live on Storefront)</option>
                  <option value="archived" className="bg-[#0A1A3C]">Archived (Hidden from Customers)</option>
                  <option value="draft" className="bg-[#0A1A3C]">Draft (Staff Preview Only)</option>
                </select>
              </div>
            </div>

            {/* PRODUCT IMAGES UPLOAD SECTION */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block font-bold text-white text-xs uppercase tracking-wider">
                    Product Images ({images.length} Loaded)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Upload from camera or device. Reorder, replace, or set primary cover.
                  </p>
                </div>
              </div>

              {/* Upload Dropzone / Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => triggerUpload('front')}
                  className="p-3 rounded-2xl border-2 border-dashed border-[#D4A029]/50 hover:border-[#D4A029] bg-[#0F2A5F]/30 hover:bg-[#0F2A5F]/50 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group"
                >
                  <Camera className="w-4 h-4 text-[#D4A029]" />
                  <span className="font-bold text-white text-xs">+ Front Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerUpload('back')}
                  className="p-3 rounded-2xl border-2 border-dashed border-slate-700 hover:border-slate-500 bg-[#0F2A5F]/20 hover:bg-[#0F2A5F]/40 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group"
                >
                  <ImageIcon className="w-4 h-4 text-slate-300" />
                  <span className="font-bold text-white text-xs">+ Back Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerUpload('gallery')}
                  className="p-3 rounded-2xl border-2 border-dashed border-slate-700 hover:border-slate-500 bg-[#0F2A5F]/20 hover:bg-[#0F2A5F]/40 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group"
                >
                  <Upload className="w-4 h-4 text-slate-300" />
                  <span className="font-bold text-white text-xs">+ Gallery Angle</span>
                </button>
              </div>

              {/* Uploaded Gallery Grid with Reorder and Replace Controls */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400">
                  Gallery Perspective Ordering (Use arrows to reorder, replace icon to swap photo):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((img, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === images.length - 1;

                    return (
                      <div
                        key={img.id}
                        className={`relative rounded-xl overflow-hidden border p-1 bg-slate-900 group ${
                          img.isPrimary ? 'border-[#D4A029] ring-2 ring-[#D4A029]/30' : 'border-slate-800'
                        }`}
                      >
                        <CachedImage
                          src={img.url}
                          alt={img.altText}
                          referrerPolicy="no-referrer"
                          className="w-full h-20 object-cover rounded-lg bg-slate-950"
                        />

                        {img.isPrimary && (
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#D4A029] text-[#0A1A3C] text-[9px] font-bold font-mono">
                            PRIMARY
                          </span>
                        )}

                        {/* Reorder and Action Toolbar */}
                        <div className="mt-1 flex items-center justify-between text-[10px] bg-slate-950/80 p-1 rounded-lg">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, idx - 1)}
                              disabled={isFirst}
                              className="text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                              title="Move left"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, idx + 1)}
                              disabled={isLast}
                              className="text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                              title="Move right"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Replace photo from device */}
                            <button
                              type="button"
                              onClick={() => {
                                setReplaceTargetIndex(idx);
                                replaceInputRef.current?.click();
                              }}
                              className="text-slate-400 hover:text-[#D4A029] cursor-pointer"
                              title="Replace photo from device"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>

                            {/* Set primary */}
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(img.id)}
                              className={`cursor-pointer ${img.isPrimary ? 'text-[#D4A029]' : 'text-slate-500 hover:text-white'}`}
                              title={img.isPrimary ? 'Primary Front' : 'Make Primary Front'}
                            >
                              <Star className="w-3 h-3 fill-current" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(img.id)}
                              className="text-slate-500 hover:text-red-400 cursor-pointer"
                              title="Remove photo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CUSTOMIZATION PERMISSIONS */}
            <div className="p-4 rounded-2xl bg-[#0F2A5F]/30 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-xs block">
                    CUSTOMIZATION PERMISSIONS
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Control whether this product can be customized by customers
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="customizationToggle"
                  checked={isCustomizable}
                  onChange={e => setIsCustomizable(e.target.checked)}
                  className="w-5 h-5 accent-[#D4A029] cursor-pointer"
                />
              </div>

              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                {isCustomizable ? (
                  <p className="text-emerald-400 font-semibold">
                    ✓ Checked: Customer sees [ ADD TO CART ] and secondary [ CUSTOMIZE ] button.
                  </p>
                ) : (
                  <p className="text-amber-300 font-semibold">
                    ⚠ Unchecked: Customer sees [ ADD TO CART ] only. Studio customization button is completely hidden.
                  </p>
                )}
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold text-xs hover:bg-[#F0C760] cursor-pointer shadow-lg"
              >
                Save Product & Images
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
