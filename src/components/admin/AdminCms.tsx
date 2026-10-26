import React, { useState } from 'react';
import { Layout, Plus, Trash2, Edit2, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import { store } from '../../services/store';
import { CmsBanner } from '../../types';
import { CachedImage } from '../common/CachedImage';

export const AdminCms: React.FC = () => {
  const banners = store.banners;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tag, setTag] = useState('NEW DROP');
  const [badgeText, setBadgeText] = useState('FEATURED');
  const [imageUrl, setImageUrl] = useState('/assets/images/kitnova_hero_jersey_1791234660638.jpg');
  const [ctaText, setCtaText] = useState('Customize Now');
  const [targetView, setTargetView] = useState('studio');

  const handleCreateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    store.addBanner({
      title,
      subtitle,
      tag,
      badgeText,
      imageUrl,
      ctaText,
      targetView,
      isActive: true,
      order: banners.length + 1
    });
    setIsModalOpen(false);
    setTitle('');
    setSubtitle('');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#D4A029] font-bold font-mono">
            STOREFRONT CONTENT MANAGEMENT (CMS)
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Home Page Banners & Announcements
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure mobile & desktop hero carousels, campaign tags, and direct destination CTA links.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A029] to-[#B3831B] text-[#0A1A3C] font-bold text-xs flex items-center gap-2 hover:brightness-110 shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Banner</span>
        </button>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map(banner => (
          <div
            key={banner.id}
            className="bg-[#0A1A3C] border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between"
          >
            <div className="relative h-48 w-full overflow-hidden bg-slate-900">
              <CachedImage
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A3C] via-[#0A1A3C]/40 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#D4A029] text-[#0A1A3C] font-black text-[10px] uppercase font-mono">
                  {banner.badgeText}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#0F2A5F]/80 border border-slate-700 text-white font-bold text-[10px] uppercase font-mono">
                  {banner.tag}
                </span>
              </div>
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-lg font-black text-white">{banner.title}</h3>
                <p className="text-xs text-slate-300 truncate">{banner.subtitle}</p>
              </div>
            </div>

            <div className="p-5 flex items-center justify-between border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">Target Action:</span>{' '}
                <span className="font-mono text-[#D4A029] font-bold">{banner.ctaText} → {banner.targetView}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => store.updateBanner(banner.id, { isActive: !banner.isActive })}
                  className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg cursor-pointer ${
                    banner.isActive
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {banner.isActive ? 'ACTIVE' : 'DRAFT'}
                </button>
                <button
                  onClick={() => store.deleteBanner(banner.id)}
                  className="p-1 rounded-lg text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="Remove banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE BANNER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateBanner}
            className="bg-[#0A1A3C] border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layout className="w-4 h-4 text-[#D4A029]" />
                Publish Home Banner
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
                <label className="block text-slate-300 font-semibold mb-1">Headline Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="CUSTOMIZE YOUR MATCHWEAR"
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subtitle</label>
                <input
                  type="text"
                  required
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  placeholder="Official dry-tech kits engineered for elite performance"
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tag</label>
                  <input
                    type="text"
                    value={tag}
                    onChange={e => setTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={e => setBadgeText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">CTA Label</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={e => setCtaText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Destination</label>
                  <select
                    value={targetView}
                    onChange={e => setTargetView(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F2A5F]/40 border border-slate-700 text-white focus:outline-none focus:border-[#D4A029]"
                  >
                    <option value="studio">Customization Studio</option>
                    <option value="shop">Shop All Jerseys</option>
                    <option value="team">Team Orders</option>
                  </select>
                </div>
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
                Save Banner
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
