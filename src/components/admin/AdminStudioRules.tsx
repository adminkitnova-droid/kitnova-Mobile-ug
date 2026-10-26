import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Type,
  TrendingUp,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Star,
  ArrowUpDown,
  History,
  ShieldCheck,
  Edit2,
  Upload,
  Image as ImageIcon,
  Trash2,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { store } from '../../services/store';
import { StudioArtwork, StudioFont, StudioPricing } from '../../types';
import { uploadSharedStudioAsset, updateSharedStudioAsset, deleteSharedStudioAsset, listSharedStudioAssets } from '../../services/studioAssetLibrary';

export const AdminStudioRules: React.FC = () => {
  const [, setStoreTick] = useState(0);
  useEffect(() => store.subscribe(() => setStoreTick(t => t + 1)), []);
  const fonts = store.fonts;
  const pricing = store.pricing;

  const [activeTab, setActiveTab] = useState<'fonts' | 'pricing' | 'bulk'>('fonts');

  // Individual Pricing edit state
  const [namePrice, setNamePrice] = useState(pricing.namePrice);
  const [numberPrice, setNumberPrice] = useState(pricing.numberPrice);
  const [logoPrice, setLogoPrice] = useState(pricing.logoPrice);
  const [sponsorPrice, setSponsorPrice] = useState(pricing.sponsorPrice);
  const [badgePrice, setBadgePrice] = useState(pricing.badgePrice);
  const [sleevePatchPrice, setSleevePatchPrice] = useState(pricing.sleevePatchPrice);
  const [framePrice, setFramePrice] = useState(pricing.framePrice || 3000);
  const [graphicPrice, setGraphicPrice] = useState(pricing.graphicPrice || 5000);
  const [emojiPrice, setEmojiPrice] = useState(pricing.emojiPrice || 1000);
  const [backgroundPrice, setBackgroundPrice] = useState(pricing.backgroundPrice || 3000);
  const [pricingSuccessNotice, setPricingSuccessNotice] = useState<string | null>(null);

  // Bulk Adjustment Engine state (Spec Section 3.2)
  const [bulkMode, setBulkMode] = useState<'percentage' | 'fixed'>('percentage');
  const [bulkValue, setBulkValue] = useState<number>(10);
  const [bulkRoundTo, setBulkRoundTo] = useState<100 | 500 | 1000>(500);
  const [selectedCategories, setSelectedCategories] = useState<
    Array<'name' | 'number' | 'logo' | 'sponsor' | 'badge' | 'sleevePatch'>
  >(['name', 'number', 'logo', 'sponsor', 'badge', 'sleevePatch']);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bulkSuccessNotice, setBulkSuccessNotice] = useState<string | null>(null);

  // Font Rename State
  const [editingFontId, setEditingFontId] = useState<string | null>(null);
  const [editingFontName, setEditingFontName] = useState('');
  const [fontName, setFontName] = useState('');
  const [fontUploadNotice, setFontUploadNotice] = useState<string | null>(null);
  const [artworkUploadNotice, setArtworkUploadNotice] = useState<string | null>(null);
  const [isArtworkUploading, setIsArtworkUploading] = useState(false);
  const [artworkName, setArtworkName] = useState('');
  const [artworkCategory, setArtworkCategory] = useState<StudioArtwork['category']>('crest');
  const fontInputRef = useRef<HTMLInputElement>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);
  const artworks = store.studioArtworks;

  useEffect(() => {
    let active = true;
    listSharedStudioAssets(true).then(({ fonts: sharedFonts, artworks: sharedArtworks }) => {
      if (!active) return;
      sharedFonts.forEach(font => {
        const existing = store.fonts.find(item => item.id === font.id);
        if (existing) store.updateFont(font.id, font); else store.addFont(font);
      });
      sharedArtworks.forEach(item => {
        const existing = store.studioArtworks.find(current => current.id === item.id);
        if (existing) store.updateStudioArtwork(item.id, item); else store.addStudioArtwork(item);
      });
    }).catch(error => console.warn('Shared studio assets unavailable; cached local assets remain available.', error));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const id = 'kitnova-uploaded-font-faces';
    let style = document.getElementById(id) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = store.fonts.filter(f => f.fontDataUrl).map(f => {
      const path = f.fontDataUrl!.split('?')[0].toLowerCase();
      const format = path.endsWith('.woff2') ? 'woff2' : path.endsWith('.woff') ? 'woff' : path.endsWith('.otf') ? 'opentype' : 'truetype';
      return `@font-face{font-family:${JSON.stringify(f.family.replace(/[\'"]|,.*$/g, ''))};src:url(\"${f.fontDataUrl}\") format(\"${format}\");font-display:swap;}`;
    }).join('\n');
  }, [fonts.map(f => `${f.id}:${f.fontDataUrl || ''}`).join('|')]);

  const handleUploadFont = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/\.(woff2?|ttf|otf)$/i.test(file.name)) {
      setFontUploadNotice('Choose a .woff, .woff2, .ttf, or .otf font file.');
      event.target.value = '';
      return;
    }
    if (file.size > 1_500_000) {
      setFontUploadNotice('Font files must be 1.5 MB or smaller so they can be stored reliably on this device.');
      event.target.value = '';
      return;
    }
    try {
      const displayName = fontName.trim() || file.name.replace(/\.(woff2?|ttf|otf)$/i, '').replace(/[-_]/g, ' ');
      const family = `KitnovaCustom${Date.now()}`;
      const shared = await uploadSharedStudioAsset(file, {
        type: 'font', name: displayName, family, cssClass: `font-custom-${Date.now()}`,
        previewText: 'KITNOVA 10', sortOrder: store.fonts.length + 1
      });
      const font: StudioFont = {
        id: shared.id, name: shared.name, family: shared.family || family,
        cssClass: shared.css_class || `font-${shared.id}`, isEnabled: true,
        isDefault: false, sortOrder: shared.sort_order, previewText: shared.preview_text || 'KITNOVA 10',
        fontDataUrl: shared.public_url
      };
      store.addFont(font);
      setFontName('');
      setFontUploadNotice(`Published ${displayName} to shared Supabase Storage. Customers can now access it on their devices.`);
    } catch (error: any) {
      setFontUploadNotice(error?.message || 'Unable to add this font.');
    } finally {
      event.target.value = '';
    }
  };

  const handleUploadStudioArtwork = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setArtworkUploadNotice('Choose an image file.');
      event.target.value = '';
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setArtworkUploadNotice('Image must be 8 MB or smaller.');
      event.target.value = '';
      return;
    }
    setIsArtworkUploading(true);
    setArtworkUploadNotice(null);
    try {
      const shared = await uploadSharedStudioAsset(file, {
        type: 'artwork', name: artworkName.trim() || file.name.replace(/\.[^.]+$/, ''),
        category: artworkCategory, sortOrder: store.studioArtworks.length + 1
      });
      const item: StudioArtwork = {
        id: shared.id, name: shared.name, imageUrl: shared.public_url,
        category: shared.category || artworkCategory, isEnabled: shared.is_enabled,
        createdAt: shared.created_at
      };
      store.addStudioArtwork(item);
      setArtworkName('');
      setArtworkUploadNotice('Artwork published to shared Supabase Storage. Customers can access it on their devices.');
    } catch (error: any) {
      setArtworkUploadNotice(error?.message || 'Could not upload artwork.');
    } finally {
      setIsArtworkUploading(false);
      event.target.value = '';
    }
  };


  const handleToggleFont = async (fontId: string) => {
    const font = store.fonts.find(item => item.id === fontId);
    if (!font) return;
    try {
      await updateSharedStudioAsset(fontId, { is_enabled: !font.isEnabled });
      store.toggleFont(fontId);
      setFontUploadNotice(`Font ${font.name} ${font.isEnabled ? 'disabled' : 'enabled'} for customers.`);
    } catch (error: any) { setFontUploadNotice(error?.message || 'Could not update shared font.'); }
  };

  const handleSetDefaultFont = async (fontId: string) => {
    try {
      for (const font of store.fonts) if (font.id.startsWith('font-')) await updateSharedStudioAsset(font.id, { is_default: font.id === fontId });
      store.setDefaultFont(fontId);
    } catch (error: any) { setFontUploadNotice(error?.message || 'Could not set shared default font.'); }
  };

  const handleSaveIndividualPricing = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateStudioPricing({
      namePrice,
      numberPrice,
      logoPrice,
      sponsorPrice,
      badgePrice,
      sleevePatchPrice,
      framePrice,
      graphicPrice,
      emojiPrice,
      backgroundPrice
    });
    setPricingSuccessNotice('Individual customization pricing updated and logged.');
    setTimeout(() => setPricingSuccessNotice(null), 3000);
  };

  // Preview Calculation for Bulk Adjustment
  const calculatePreview = (currentVal: number, isSelected: boolean) => {
    if (!isSelected) return currentVal;
    let newVal = currentVal;
    if (bulkMode === 'percentage') {
      newVal = currentVal * (1 + bulkValue / 100);
    } else {
      newVal = currentVal + bulkValue;
    }
    return Math.max(0, Math.round(newVal / bulkRoundTo) * bulkRoundTo);
  };

  const previewPricing = {
    name: calculatePreview(pricing.namePrice, selectedCategories.includes('name')),
    number: calculatePreview(pricing.numberPrice, selectedCategories.includes('number')),
    logo: calculatePreview(pricing.logoPrice, selectedCategories.includes('logo')),
    sponsor: calculatePreview(pricing.sponsorPrice, selectedCategories.includes('sponsor')),
    badge: calculatePreview(pricing.badgePrice, selectedCategories.includes('badge')),
    sleevePatch: calculatePreview(pricing.sleevePatchPrice, selectedCategories.includes('sleevePatch'))
  };

  const handleApplyBulkAdjustment = () => {
    const res = store.bulkAdjustStudioPricing(
      selectedCategories,
      bulkMode,
      bulkValue,
      bulkRoundTo,
      'Product Admin'
    );
    // sync local fields
    setNamePrice(res.after.namePrice);
    setNumberPrice(res.after.numberPrice);
    setLogoPrice(res.after.logoPrice);
    setSponsorPrice(res.after.sponsorPrice);
    setBadgePrice(res.after.badgePrice);
    setSleevePatchPrice(res.after.sleevePatchPrice);

    setShowConfirmModal(false);
    setBulkSuccessNotice(
      `Applied ${bulkMode === 'percentage' ? `${bulkValue}%` : `UGX ${bulkValue}`} bulk adjustment! Logged to audit trail.`
    );
    setTimeout(() => setBulkSuccessNotice(null), 4000);
  };

  const handleStartRenameFont = (f: StudioFont) => {
    setEditingFontId(f.id);
    setEditingFontName(f.name);
  };

  const handleSaveRenameFont = (fontId: string) => {
    if (editingFontName.trim()) {
      store.updateFont(fontId, { name: editingFontName.trim() });
    }
    setEditingFontId(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#D4A029] font-bold">
            Studio Engine Configuration
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Studio Rules & Pricing Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Admin controls everything that changes the customer studio. Customer chooses only from what Admin enables.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('fonts')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'fonts' ? 'bg-[#D4A029] text-[#0A1A3C]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          Font Catalog & Previews ({fonts.filter(f => f.isEnabled).length} active)
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'pricing' ? 'bg-[#D4A029] text-[#0A1A3C]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Customization Base Pricing
        </button>

        <button
          onClick={() => setActiveTab('bulk')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'bulk' ? 'bg-[#D4A029] text-[#0A1A3C]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Bulk Price Adjustment Engine
        </button>
      </div>

      {/* TAB 1: FONTS PREVIEW & MANAGEMENT (Spec Section 3.1) */}
      {activeTab === 'fonts' && (
        <div className="space-y-6">
          <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-white">Live Font Previews & Toggles</h2>
                <p className="text-xs text-slate-400">
                  Each font is rendered using its exact CSS typeface. Disabled fonts will vanish from Customer Studio immediately.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#D4A029]/30 bg-[#071329] p-4 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Upload className="w-4 h-4 text-[#D4A029]" /> Add a Custom Font</h3>
              <p className="text-xs text-slate-400">Upload WOFF/WOFF2/TTF/OTF. Custom font files are saved in this browser's local catalog; to share them across customer devices, configure a secure shared asset store.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input value={fontName} onChange={e => setFontName(e.target.value)} placeholder="Display name (optional)" className="min-w-0 flex-1 rounded-lg bg-[#0A1A3C] border border-slate-700 px-3 py-2 text-sm text-white" />
                <input ref={fontInputRef} type="file" accept=".woff,.woff2,.ttf,.otf,font/woff,font/woff2,font/ttf,font/otf" onChange={handleUploadFont} className="hidden" />
                <button type="button" onClick={() => fontInputRef.current?.click()} className="px-4 py-2 rounded-lg bg-[#D4A029] text-[#0A1A3C] text-xs font-black flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Upload Font File</button>
              </div>
              {fontUploadNotice && <p role="status" className="text-xs text-emerald-300">{fontUploadNotice}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {fonts.map(font => (
                <div
                  key={font.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    font.isEnabled
                      ? 'bg-[#0F2A5F]/30 border-slate-700'
                      : 'bg-slate-900/40 border-slate-800 opacity-60'
                  }`}
                >
                  <div>
                    {/* Live Font Appearance Preview Button */}
                    <div
                      style={{ fontFamily: font.family }}
                      className="text-2xl font-bold tracking-wide text-white py-3 text-center border-b border-slate-800/80 mb-3"
                    >
                      {font.previewText}
                    </div>

                    <div className="flex items-center justify-between text-xs mb-2">
                      {editingFontId === font.id ? (
                        <div className="flex items-center gap-1 w-full">
                          <input
                            type="text"
                            value={editingFontName}
                            onChange={e => setEditingFontName(e.target.value)}
                            className="px-2 py-0.5 rounded bg-[#0A1A3C] border border-slate-600 text-xs text-white flex-1"
                          />
                          <button
                            onClick={() => handleSaveRenameFont(font.id)}
                            className="text-emerald-400 font-bold text-xs"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-200">{font.name}</span>
                          <button
                            onClick={() => handleStartRenameFont(font)}
                            className="text-slate-400 hover:text-white"
                            title="Rename Display Label"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {font.isDefault && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#D4A029] text-[#0A1A3C] font-bold">
                          DEFAULT
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleToggleFont(font.id)}
                      className={`flex items-center gap-1 text-[11px] font-semibold ${
                        font.isEnabled ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {font.isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {font.isEnabled ? 'Enabled' : 'Disabled'}
                    </button>

                    {!font.isDefault && font.isEnabled && (
                      <button
                        onClick={() => handleSetDefaultFont(font.id)}
                        className="text-[11px] text-slate-400 hover:text-[#D4A029] flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" />
                        Set Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2"><ImageIcon className="w-4 h-4 text-[#D4A029]" /> Customer Studio Artwork Library</h2>
              <p className="text-xs text-slate-400 mt-1">Add club crests, sponsor logos, badges, patterns, and other images customers can place on their jerseys.</p>
            </div>
            <input ref={artworkInputRef} type="file" accept="image/*" onChange={handleUploadStudioArtwork} className="hidden" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input value={artworkName} onChange={e => setArtworkName(e.target.value)} placeholder="Artwork name" className="rounded-lg bg-[#071329] border border-slate-700 px-3 py-2 text-sm text-white" />
              <select value={artworkCategory} onChange={e => setArtworkCategory(e.target.value as StudioArtwork['category'])} className="rounded-lg bg-[#071329] border border-slate-700 px-3 py-2 text-sm text-white">
                <option value="crest">Club crest</option><option value="sponsor">Sponsor logo</option><option value="badge">Badge / patch</option><option value="pattern">Pattern</option><option value="other">Other</option>
              </select>
              <button type="button" disabled={isArtworkUploading} onClick={() => artworkInputRef.current?.click()} className="rounded-lg bg-[#D4A029] px-3 py-2 text-xs font-black text-[#0A1A3C] disabled:opacity-50 flex items-center justify-center gap-2"><Upload className="w-4 h-4" /> {isArtworkUploading ? 'Uploading…' : 'Upload Artwork Image'}</button>
            </div>
            {artworkUploadNotice && <p role="status" className="text-xs text-emerald-300">{artworkUploadNotice}</p>}
            {artworks.length === 0 ? <p className="text-xs text-slate-500">No custom artwork added yet.</p> : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">{artworks.map(item => <div key={item.id} className="rounded-xl border border-slate-800 bg-[#071329] p-3 space-y-2"><img src={item.imageUrl} alt={item.name} className="w-full h-24 object-contain rounded-lg bg-slate-900" /><p className="text-xs font-semibold text-white truncate">{item.name}</p><p className="text-[10px] text-slate-400 capitalize">{item.category}</p><div className="flex gap-2"><button type="button" onClick={async () => { try { await updateSharedStudioAsset(item.id, { is_enabled: !item.isEnabled }); store.updateStudioArtwork(item.id, { isEnabled: !item.isEnabled }); } catch (error: any) { setArtworkUploadNotice(error?.message || 'Could not update shared artwork.'); } }} className="flex-1 text-[10px] font-bold text-[#D4A029]">{item.isEnabled ? 'Disable' : 'Enable'}</button><button type="button" onClick={async () => { try { await deleteSharedStudioAsset(item.id); store.removeStudioArtwork(item.id); } catch (error: any) { setArtworkUploadNotice(error?.message || 'Could not delete shared artwork.'); } }} className="text-red-300" aria-label={`Delete ${item.name}`}><Trash2 className="w-3.5 h-3.5" /></button></div></div>)}</div>}
          </div>
        </div>
      )}

      {/* TAB 2: INDIVIDUAL CUSTOMIZATION PRICING */}
      {activeTab === 'pricing' && (
        <form
          onSubmit={handleSaveIndividualPricing}
          className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 max-w-2xl"
        >
          <div>
            <h2 className="text-base font-bold text-white">Customization Base Fees (UGX)</h2>
            <p className="text-xs text-slate-400">
              Set standard unit price for each customization element. Changes immediately affect Studio quotes and cart validation.
            </p>
          </div>

          {pricingSuccessNotice && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              {pricingSuccessNotice}
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F2A5F]/30 border border-slate-800">
              <label className="font-semibold text-slate-200">Player Name Heat-Press Vinyl</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono">UGX</span>
                <input
                  type="number"
                  step={500}
                  value={namePrice}
                  onChange={e => setNamePrice(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 rounded-lg bg-[#0A1A3C] border border-slate-700 font-mono text-white text-right focus:border-[#D4A029]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F2A5F]/30 border border-slate-800">
              <label className="font-semibold text-slate-200">Squad Number (0-99) Printing</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono">UGX</span>
                <input
                  type="number"
                  step={500}
                  value={numberPrice}
                  onChange={e => setNumberPrice(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 rounded-lg bg-[#0A1A3C] border border-slate-700 font-mono text-white text-right focus:border-[#D4A029]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F2A5F]/30 border border-slate-800">
              <label className="font-semibold text-slate-200">Front Chest Sponsor Printing</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono">UGX</span>
                <input
                  type="number"
                  step={500}
                  value={sponsorPrice}
                  onChange={e => setSponsorPrice(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 rounded-lg bg-[#0A1A3C] border border-slate-700 font-mono text-white text-right focus:border-[#D4A029]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F2A5F]/30 border border-slate-800">
              <label className="font-semibold text-slate-200">3D Silicone Crest Badge</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono">UGX</span>
                <input
                  type="number"
                  step={500}
                  value={badgePrice}
                  onChange={e => setBadgePrice(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 rounded-lg bg-[#0A1A3C] border border-slate-700 font-mono text-white text-right focus:border-[#D4A029]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F2A5F]/30 border border-slate-800">
              <label className="font-semibold text-slate-200">Sleeve Patch / Flag</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono">UGX</span>
                <input
                  type="number"
                  step={500}
                  value={sleevePatchPrice}
                  onChange={e => setSleevePatchPrice(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 rounded-lg bg-[#0A1A3C] border border-slate-700 font-mono text-white text-right focus:border-[#D4A029]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F2A5F]/30 border border-slate-800">
              <label className="font-semibold text-slate-200">Typography Border / Frame Fee</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono">UGX</span>
                <input
                  type="number"
                  step={500}
                  value={framePrice}
                  onChange={e => setFramePrice(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 rounded-lg bg-[#0A1A3C] border border-slate-700 font-mono text-white text-right focus:border-[#D4A029]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F2A5F]/30 border border-slate-800">
              <label className="font-semibold text-slate-200">Graphic Artwork / Customer Upload Fee</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono">UGX</span>
                <input
                  type="number"
                  step={500}
                  value={graphicPrice}
                  onChange={e => setGraphicPrice(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 rounded-lg bg-[#0A1A3C] border border-slate-700 font-mono text-white text-right focus:border-[#D4A029]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F2A5F]/30 border border-slate-800">
              <label className="font-semibold text-slate-200">Text Background Box / Pill Fee</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono">UGX</span>
                <input
                  type="number"
                  step={500}
                  value={backgroundPrice}
                  onChange={e => setBackgroundPrice(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 rounded-lg bg-[#0A1A3C] border border-slate-700 font-mono text-white text-right focus:border-[#D4A029]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F2A5F]/30 border border-slate-800">
              <label className="font-semibold text-slate-200">Sports Emoji Fee</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono">UGX</span>
                <input
                  type="number"
                  step={500}
                  value={emojiPrice}
                  onChange={e => setEmojiPrice(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 rounded-lg bg-[#0A1A3C] border border-slate-700 font-mono text-white text-right focus:border-[#D4A029]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold text-xs hover:bg-[#F0C760] transition-colors"
            >
              Save Base Pricing
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: BULK PRICE ADJUSTMENT ENGINE (Spec Section 3.2) */}
      {activeTab === 'bulk' && (
        <div className="space-y-6 max-w-4xl">
          {bulkSuccessNotice && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>{bulkSuccessNotice}</span>
            </div>
          )}

          <div className="bg-[#0A1A3C] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Bulk Customization Price Adjustment</h2>
              <p className="text-xs text-slate-400 mt-1">
                Calculate percentage or fixed adjustments across multiple customization categories with live Before vs After preview and audit logging.
              </p>
            </div>

            {/* Adjustment Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Adjustment Mode</label>
                <div className="flex p-1 bg-[#0F2A5F]/40 border border-slate-700 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setBulkMode('percentage')}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                      bulkMode === 'percentage'
                        ? 'bg-[#D4A029] text-[#0A1A3C]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Percentage (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkMode('fixed')}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                      bulkMode === 'fixed'
                        ? 'bg-[#D4A029] text-[#0A1A3C]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Fixed Amount (UGX)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Value ({bulkMode === 'percentage' ? '%' : 'UGX'})
                </label>
                <input
                  type="number"
                  value={bulkValue}
                  onChange={e => setBulkValue(Number(e.target.value))}
                  placeholder={bulkMode === 'percentage' ? '10' : '1000'}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 font-mono text-white text-xs focus:outline-none focus:border-[#D4A029]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Use negative values for discounts (e.g. -5% or -1000 UGX)
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Rounding Rule</label>
                <select
                  value={bulkRoundTo}
                  onChange={e => setBulkRoundTo(Number(e.target.value) as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#D4A029]"
                >
                  <option value={100} className="bg-[#0A1A3C]">Round to nearest UGX 100</option>
                  <option value={500} className="bg-[#0A1A3C]">Round to nearest UGX 500 (Recommended)</option>
                  <option value={1000} className="bg-[#0A1A3C]">Round to nearest UGX 1,000</option>
                </select>
              </div>
            </div>

            {/* LIVE COMPARISON TABLE (Spec Section 3.2 Before vs After) */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F2A5F]/40 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Apply</th>
                    <th className="py-2.5 px-4">Customization Category</th>
                    <th className="py-2.5 px-4">Current Price</th>
                    <th className="py-2.5 px-4">Simulated Change</th>
                    <th className="py-2.5 px-4">New Price (After)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {[
                    { key: 'name', label: 'Player Name', current: pricing.namePrice, newP: previewPricing.name },
                    { key: 'number', label: 'Squad Number', current: pricing.numberPrice, newP: previewPricing.number },
                    { key: 'logo', label: 'Club Logo / Badge', current: pricing.logoPrice, newP: previewPricing.logo },
                    { key: 'sponsor', label: 'Chest Sponsor', current: pricing.sponsorPrice, newP: previewPricing.sponsor },
                    { key: 'badge', label: '3D Crest Badge', current: pricing.badgePrice, newP: previewPricing.badge },
                    { key: 'sleevePatch', label: 'Sleeve Patch', current: pricing.sleevePatchPrice, newP: previewPricing.sleevePatch }
                  ].map(row => {
                    const isSelected = selectedCategories.includes(row.key as any);
                    const delta = row.newP - row.current;

                    return (
                      <tr key={row.key} className={isSelected ? 'bg-[#0F2A5F]/15' : 'opacity-40'}>
                        <td className="py-2.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                setSelectedCategories(selectedCategories.filter(c => c !== row.key));
                              } else {
                                setSelectedCategories([...selectedCategories, row.key as any]);
                              }
                            }}
                            className="accent-[#D4A029]"
                          />
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-white">{row.label}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-300">
                          UGX {row.current.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 font-mono">
                          {isSelected && delta !== 0 ? (
                            <span className={delta > 0 ? 'text-emerald-400' : 'text-red-400'}>
                              {delta > 0 ? `+UGX ${delta.toLocaleString()}` : `-UGX ${Math.abs(delta).toLocaleString()}`}
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-[#D4A029]">
                          UGX {row.newP.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Confirmation Action Button */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#D4A029]" />
                Applying will record an immutable record in the Admin Audit Log
              </span>

              <button
                type="button"
                disabled={selectedCategories.length === 0}
                onClick={() => setShowConfirmModal(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] font-bold text-xs hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-40 cursor-pointer shadow-lg"
              >
                Preview & Confirm Bulk Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL (Spec Section 3.2) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1A3C] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-amber-400 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Confirm Customization Price Adjustment</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to apply a <strong className="text-white">{bulkMode === 'percentage' ? `${bulkValue}%` : `UGX ${bulkValue}`}</strong> adjustment to <strong className="text-white">{selectedCategories.length} customization categories</strong>.
            </p>

            <div className="p-3 rounded-xl bg-[#0F2A5F]/40 border border-slate-800 text-xs space-y-1 font-mono">
              <p className="text-slate-400">Name: UGX {previewPricing.name.toLocaleString()}</p>
              <p className="text-slate-400">Number: UGX {previewPricing.number.toLocaleString()}</p>
              <p className="text-slate-400">Sponsor: UGX {previewPricing.sponsor.toLocaleString()}</p>
              <p className="text-slate-400">Badge: UGX {previewPricing.badge.toLocaleString()}</p>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Existing active customer carts with confirmed snapshots will not be modified. Future customizations will use these new rates.
            </p>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBulkAdjustment}
                className="flex-1 py-2.5 rounded-xl bg-[#D4A029] text-[#0A1A3C] font-bold text-xs hover:bg-[#F0C760] cursor-pointer shadow-lg"
              >
                Apply to Production
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
