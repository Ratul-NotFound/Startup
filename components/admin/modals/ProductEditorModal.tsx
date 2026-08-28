'use client';

import React, { useRef, useState } from 'react';
import { Product } from '@/types';
import { compressImageToDataUrl } from '@/lib/image-compression';
import { useApp } from '@/context/AppContext';
import {
  Package, X, ImageIcon, DollarSign, Zap, CheckCircle2, Shield, BookOpen,
  Loader2, Upload, Sparkles, Plus, Trash2, Star, Save, ArrowLeft, ArrowRight,
  Layers, Film, Check, Eye,
} from 'lucide-react';

interface ProductEditorModalProps {
  editingProduct: (Product & { isNew?: boolean }) | null;
  setEditingProduct: React.Dispatch<React.SetStateAction<(Product & { isNew?: boolean }) | null>>;
  productEditorTab: 'basic' | 'pricing' | 'special' | 'delivery' | 'features' | 'specs' | 'docs';
  setProductEditorTab: (tab: 'basic' | 'pricing' | 'special' | 'delivery' | 'features' | 'specs' | 'docs') => void;
  isCompressingProductLogo: boolean;
  setIsCompressingProductLogo: (val: boolean) => void;
  isCompressingProductBanner: boolean;
  setIsCompressingProductBanner: (val: boolean) => void;
  handleSaveProduct: () => Promise<void>;
  showFeedback: (type: 'success' | 'error', msg: string) => void;
}

export function ProductEditorModal({
  editingProduct,
  setEditingProduct,
  productEditorTab,
  setProductEditorTab,
  isCompressingProductLogo,
  setIsCompressingProductLogo,
  isCompressingProductBanner,
  setIsCompressingProductBanner,
  handleSaveProduct,
  showFeedback,
}: ProductEditorModalProps) {
  const { bdtRate } = useApp();
  const productLogoInputRef = useRef<HTMLInputElement>(null);
  const productBannerInputRef = useRef<HTMLInputElement>(null);
  const multiplePhotosInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingMultiple, setIsUploadingMultiple] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  if (!editingProduct) return null;

  const isSpecial = editingProduct.productType === 'special';

  // Multi-photo upload and compression handler
  const handleMultiplePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingMultiple(true);
    setUploadProgress({ current: 0, total: files.length });

    const newCompressedList: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress({ current: i + 1, total: files.length });
      try {
        const compressed = await compressImageToDataUrl(file, 1200, 800, 0.80);
        newCompressedList.push(compressed);
      } catch (err) {
        console.warn('Failed to compress image:', file.name, err);
      }
    }

    if (newCompressedList.length > 0) {
      setEditingProduct(prev => {
        if (!prev) return null;
        const curr = prev.images || [];
        return { ...prev, images: [...curr, ...newCompressedList] };
      });
      showFeedback('success', `Uploaded & compressed ${newCompressedList.length} photos.`);
    }
    setIsUploadingMultiple(false);
    setUploadProgress(null);
    if (multiplePhotosInputRef.current) multiplePhotosInputRef.current.value = '';
  };

  const handleSetCoverPhoto = (index: number) => {
    setEditingProduct(prev => {
      if (!prev || !prev.images) return prev;
      const imgs = [...prev.images];
      const [chosen] = imgs.splice(index, 1);
      return { ...prev, images: [chosen, ...imgs] };
    });
    showFeedback('success', 'Cover photo updated.');
  };

  const handleMovePhoto = (fromIndex: number, toIndex: number) => {
    setEditingProduct(prev => {
      if (!prev || !prev.images) return prev;
      const imgs = [...prev.images];
      if (toIndex < 0 || toIndex >= imgs.length) return prev;
      const [item] = imgs.splice(fromIndex, 1);
      imgs.splice(toIndex, 0, item);
      return { ...prev, images: imgs };
    });
  };

  const handleDeletePhoto = (index: number) => {
    setEditingProduct(prev => {
      if (!prev || !prev.images) return prev;
      const imgs = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: imgs };
    });
    showFeedback('success', 'Photo removed.');
  };

  const handleAddPhotoUrl = () => {
    if (!newPhotoUrl.trim()) return;
    const url = newPhotoUrl.trim();
    setEditingProduct(prev => {
      if (!prev) return null;
      const curr = prev.images || [];
      return { ...prev, images: [...curr, url] };
    });
    setNewPhotoUrl('');
    showFeedback('success', 'Photo URL added to gallery.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-zinc-900 border border-white/15 my-4 shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Modal Top Header */}
        <div className="shrink-0 flex items-center justify-between p-5 border-b border-white/[0.08] bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-2xl border flex items-center justify-center ${
              isSpecial 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' 
                : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
            }`}>
              {isSpecial ? <Sparkles className="h-5 w-5" /> : <Package className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  {editingProduct.isNew ? 'Create New Product' : `Edit Product: ${editingProduct.name}`}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isSpecial
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {isSpecial ? '⚡ Special Deal' : '🟢 General'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Every single line and element syncs dynamically to storefront popups.</p>
            </div>
          </div>
          <button
            onClick={() => setEditingProduct(null)}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="shrink-0 flex items-center gap-1.5 p-2 px-4 sm:px-6 bg-zinc-950 border-b border-white/[0.06] overflow-x-auto scrollbar-none">
          {[
            { id: 'basic', label: '1. General & Type', icon: <ImageIcon className="h-3.5 w-3.5" /> },
            { 
              id: 'special', 
              label: isSpecial ? '⚡ 2. Special Tasks & Deals' : '⚡ 2. Special Tasks', 
              icon: <Sparkles className={`h-3.5 w-3.5 ${isSpecial ? 'text-amber-400 animate-pulse' : ''}`} />,
              isSpecialTab: true,
            },
            { id: 'pricing', label: '3. Pricing Durations', icon: <DollarSign className="h-3.5 w-3.5" /> },
            { id: 'delivery', label: '4. Delivery & Stock', icon: <Zap className="h-3.5 w-3.5" /> },
            { id: 'features', label: '5. Features Matrix', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
            { id: 'specs', label: '6. Technical Specs', icon: <Shield className="h-3.5 w-3.5" /> },
            { id: 'docs', label: '7. Docs & Guide', icon: <BookOpen className="h-3.5 w-3.5" /> },
          ].map(sec => {
            const isActive = productEditorTab === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setProductEditorTab(sec.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? sec.isSpecialTab && isSpecial
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : sec.isSpecialTab && isSpecial
                      ? 'text-amber-300 bg-amber-950/40 border border-amber-500/30 hover:bg-amber-900/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-zinc-900'
                }`}
              >
                {sec.icon}
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={productLogoInputRef}
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setIsCompressingProductLogo(true);
            try {
              const compressed = await compressImageToDataUrl(file, 256, 256, 0.85);
              setEditingProduct(prev => prev ? { ...prev, logo: compressed } : null);
              showFeedback('success', 'Logo image compressed and uploaded.');
            } catch {
              showFeedback('error', 'Failed to compress logo.');
            } finally {
              setIsCompressingProductLogo(false);
              if (productLogoInputRef.current) productLogoInputRef.current.value = '';
            }
          }}
          className="hidden"
        />

        <input
          type="file"
          ref={multiplePhotosInputRef}
          multiple
          accept="image/*"
          onChange={(e) => handleMultiplePhotoUpload(e.target.files)}
          className="hidden"
        />

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 max-h-[62vh]">
          {/* SECTION 1: GENERAL & BRAND VISUALS */}
          {productEditorTab === 'basic' && (
            <div className="space-y-4">
              {/* PRODUCT TYPE SELECTOR */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-indigo-400" />
                      Product Classification & Mode
                    </h4>
                    <p className="text-[11px] text-slate-400">Select whether this is a regular product or an interactive mission/campaign product.</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    isSpecial
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {isSpecial ? '⚡ Special Campaign' : '🟢 General Product'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(prev => prev ? { ...prev, productType: 'general' } : null)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      !isSpecial
                        ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-900/20 ring-1 ring-emerald-500/30'
                        : 'bg-zinc-900/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        General Product
                      </span>
                      {!isSpecial && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Standard subscription. Customers purchase directly at listed pricing without prerequisite task requirements.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(prev => {
                        if (!prev) return null;
                        const currentConfig = prev.specialConfig || {
                          campaignTitle: `${prev.name} Special Campaign Deal`,
                          campaignBadge: '⚡ Flash Mission Deal',
                          campaignDescription: 'Complete quick community tasks below to unlock exclusive discounted pricing!',
                          unlockedCouponCode: '',
                          discountPercent: 20,
                          isSpecialOfferSynced: true,
                          tasks: [
                            { id: 't_tg', type: 'join_telegram', title: 'Join Keyoon Telegram Channel', url: 'https://t.me/keyoon', isRequired: true },
                            { id: 't_fb', type: 'follow_facebook', title: 'Follow Keyoon on Facebook', url: 'https://facebook.com/keyoon', isRequired: true },
                            { id: 't_rev', type: 'write_review', title: 'Write a Verified Product Review', url: '', isRequired: true },
                          ],
                        };
                        return { ...prev, productType: 'special', specialConfig: currentConfig };
                      });
                      setProductEditorTab('special');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSpecial
                        ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-900/20 ring-1 ring-amber-500/30'
                        : 'bg-zinc-900/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                        Special Product (Campaign Deal)
                      </span>
                      {isSpecial && <CheckCircle2 className="h-4 w-4 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Requires user to perform tasks (Telegram, Facebook, Write Review) to unlock exclusive offers & syncs to Deals hub.
                    </p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingProduct(prev => {
                        if (!prev) return null;
                        const autoSlug = prev.isNew && !prev.slug
                          ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                          : prev.slug;
                        return { ...prev, name: val, slug: autoSlug };
                      });
                    }}
                    placeholder="e.g. ChatGPT Plus Official"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">URL Slug Identifier</label>
                  <input
                    type="text"
                    value={editingProduct.slug}
                    onChange={e => setEditingProduct(prev => prev ? { ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') } : null)}
                    placeholder="e.g. chatgpt-plus"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-cyan-300 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={e => setEditingProduct(prev => prev ? { ...prev, category: e.target.value as any } : null)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-medium cursor-pointer"
                  >
                    <option value="ai">AI Tools (ChatGPT, Claude, Midjourney)</option>
                    <option value="streaming">Streaming &amp; Cinema (Netflix, Spotify, Prime)</option>
                    <option value="dev">Developer &amp; Cloud (GitHub Copilot, Cursor, JetBrains)</option>
                    <option value="productivity">Productivity (Canva Pro, Office 365, Notion)</option>
                    <option value="vpn_security">VPN &amp; Security (NordVPN, ExpressVPN, Surfshark)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Highlight Badge (Optional)</label>
                  <input
                    type="text"
                    value={editingProduct.badge || ''}
                    onChange={e => setEditingProduct(prev => prev ? { ...prev, badge: e.target.value.toUpperCase() } : null)}
                    placeholder="e.g. POPULAR, BEST DEAL, 4K ULTRA, EXCLUSIVE"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white uppercase font-bold"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-300">Tagline / Key Highlight</label>
                  <input
                    type="text"
                    value={editingProduct.tagline}
                    onChange={e => setEditingProduct(prev => prev ? { ...prev, tagline: e.target.value } : null)}
                    placeholder="e.g. Full GPT-4o, Canvas & Voice with instant dedicated access"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-300">Detailed Description</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description}
                    onChange={e => setEditingProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                    placeholder="Provide full details about this subscription..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Visual Media Row & Multi-Photo Upload Studio */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-cyan-400" />
                      Product Visuals &amp; Multi-Photo Showcase Studio
                    </h4>
                    <p className="text-[11px] text-slate-400">Upload multiple photos/GIFs. The first photo is the main storefront banner; all photos cycle smoothly in the interactive card carousel.</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    {editingProduct.images?.length || 0} Photos
                  </span>
                </div>

                {/* 1. Brand Logo Row */}
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-2">
                  <label className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
                    <span>Brand Icon / Logo</span>
                    <span className="text-[10px] text-slate-500 font-normal">(Square 1:1, used on avatars & checkout)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {editingProduct.logo ? (
                        <img src={editingProduct.logo} alt="Logo" className="h-full w-full object-contain p-1.5" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row items-center gap-2">
                      <button
                        type="button"
                        onClick={() => productLogoInputRef.current?.click()}
                        disabled={isCompressingProductLogo}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                      >
                        {isCompressingProductLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        {isCompressingProductLogo ? 'Compressing...' : 'Upload Logo'}
                      </button>
                      <input
                        type="text"
                        value={editingProduct.logo}
                        onChange={e => setEditingProduct(prev => prev ? { ...prev, logo: e.target.value } : null)}
                        placeholder="Or paste direct logo URL (https://...)"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Multi-Photo Upload Action Bar */}
                <div className="space-y-3 pt-1">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <button
                      type="button"
                      disabled={isUploadingMultiple}
                      onClick={() => multiplePhotosInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                    >
                      {isUploadingMultiple ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      <span>{isUploadingMultiple ? `Compressing Photo ${uploadProgress?.current}/${uploadProgress?.total}...` : '📸 Upload Multiple Photos from Device'}</span>
                    </button>

                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="text"
                        value={newPhotoUrl}
                        onChange={e => setNewPhotoUrl(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddPhotoUrl())}
                        placeholder="Paste image / GIF URL..."
                        className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs placeholder-zinc-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddPhotoUrl}
                        className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add URL</span>
                      </button>
                    </div>

                    {(editingProduct.images?.length || 0) > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Clear all gallery images for this product?')) {
                            setEditingProduct(prev => prev ? { ...prev, images: [] } : null);
                            showFeedback('success', 'All gallery photos cleared.');
                          }
                        }}
                        className="px-2.5 py-2 rounded-xl bg-zinc-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-white/5 hover:border-rose-500/30 text-xs font-medium transition-colors cursor-pointer shrink-0"
                        title="Clear all photos"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Uploading Progress Indicator */}
                  {isUploadingMultiple && uploadProgress && (
                    <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-3">
                      <Loader2 className="h-4 w-4 text-cyan-400 animate-spin shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between text-[11px] text-cyan-300 font-bold mb-1">
                          <span>Processing &amp; Compressing Photos...</span>
                          <span>{uploadProgress.current} / {uploadProgress.total}</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-200"
                            style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Interactive Photo Gallery Grid */}
                  {(editingProduct.images && editingProduct.images.length > 0) ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                      {editingProduct.images.map((imgUrl, imgIdx) => {
                        const isCover = imgIdx === 0;
                        return (
                          <div
                            key={imgIdx}
                            className={`group relative rounded-2xl overflow-hidden bg-zinc-900 border transition-all duration-200 flex flex-col justify-between ${
                              isCover
                                ? 'border-amber-500/60 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10'
                                : 'border-white/10 hover:border-white/20'
                            }`}
                          >
                            {/* Image Thumbnail */}
                            <div className="relative h-28 w-full bg-zinc-950 overflow-hidden">
                              <img
                                src={imgUrl}
                                alt={`Photo ${imgIdx + 1}`}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
                                }}
                              />

                              {/* Position Badge */}
                              <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md border shadow-md flex items-center gap-1 ${
                                isCover
                                  ? 'bg-amber-500 text-zinc-950 border-amber-400 font-extrabold'
                                  : 'bg-black/75 text-zinc-300 border-white/10'
                              }`}>
                                {isCover ? (
                                  <>
                                    <Star className="h-2.5 w-2.5 fill-current" />
                                    <span>Main Cover</span>
                                  </>
                                ) : (
                                  <span>#{imgIdx + 1}</span>
                                )}
                              </span>
                            </div>

                            {/* Card Control Buttons */}
                            <div className="p-2 bg-zinc-950/90 border-t border-white/5 flex items-center justify-between gap-1">
                              {!isCover ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetCoverPhoto(imgIdx)}
                                  className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                  title="Make this the primary cover photo"
                                >
                                  <Star className="h-3 w-3" />
                                  <span>Set Cover</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-amber-400 font-bold px-1.5 flex items-center gap-1">
                                  <Check className="h-3 w-3" /> Cover
                                </span>
                              )}

                              <div className="flex items-center gap-1">
                                {imgIdx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMovePhoto(imgIdx, imgIdx - 1)}
                                    className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                    title="Move left in sequence"
                                  >
                                    <ArrowLeft className="h-3 w-3" />
                                  </button>
                                )}
                                {imgIdx < (editingProduct.images?.length || 0) - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMovePhoto(imgIdx, imgIdx + 1)}
                                    className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                    title="Move right in sequence"
                                  >
                                    <ArrowRight className="h-3 w-3" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeletePhoto(imgIdx)}
                                  className="p-1 rounded-lg bg-zinc-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                                  title="Delete photo"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      onClick={() => multiplePhotosInputRef.current?.click()}
                      className="p-6 rounded-2xl border-2 border-dashed border-white/10 hover:border-cyan-500/40 bg-zinc-900/40 hover:bg-zinc-900/70 text-center transition-all cursor-pointer space-y-2 group"
                    >
                      <div className="h-10 w-10 mx-auto rounded-xl bg-zinc-800 group-hover:bg-cyan-500/20 text-slate-400 group-hover:text-cyan-300 flex items-center justify-center transition-colors">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">No photos in gallery yet</p>
                        <p className="text-[11px] text-slate-400">Click to upload multiple images/GIFs from your device or paste URLs above.</p>
                      </div>
                    </div>
                  )}

                  {/* 4. Raw Textarea Backup for Fast Bulk Pasting */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] text-slate-400 block font-semibold">Bulk URL Editor (Optional — 1 Image/GIF URL per line)</label>
                    <textarea
                      rows={2}
                      value={(editingProduct.images || []).join('\n')}
                      onChange={e => {
                        const urls = e.target.value.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
                        setEditingProduct(prev => prev ? { ...prev, images: urls } : null);
                      }}
                      placeholder="https://images.unsplash.com/...&#10;https://i.giphy.com/..."
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono text-[11px] resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: SPECIAL DEAL & PREREQUISITE TASKS BUILDER */}
          {productEditorTab === 'special' && (
            <div className="space-y-5 text-xs">
              {/* Special Mode Master Switch */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Sparkles className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Special Product Campaign &amp; Tasks Setup</h4>
                      <p className="text-[11px] text-slate-400">Configure tasks (Telegram, Facebook, Review) required to unlock exclusive offers.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(prev => {
                        if (!prev) return null;
                        const nextType = prev.productType === 'special' ? 'general' : 'special';
                        const currentConfig = prev.specialConfig || {
                          campaignTitle: `${prev.name} Special Campaign Deal`,
                          campaignBadge: '⚡ Flash Mission Deal',
                          campaignDescription: 'Complete quick community tasks below to unlock exclusive discounted pricing!',
                          unlockedCouponCode: '',
                          discountPercent: 20,
                          isSpecialOfferSynced: true,
                          tasks: [
                            { id: 't_tg', type: 'join_telegram', title: 'Join Keyoon Telegram Channel', url: 'https://t.me/keyoon', isRequired: true },
                            { id: 't_fb', type: 'follow_facebook', title: 'Follow Keyoon on Facebook', url: 'https://facebook.com/keyoon', isRequired: true },
                            { id: 't_rev', type: 'write_review', title: 'Write a Verified Product Review', url: '', isRequired: true },
                          ],
                        };
                        return { ...prev, productType: nextType, specialConfig: currentConfig };
                      });
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSpecial
                        ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30'
                    }`}
                  >
                    {isSpecial ? '🔄 Shift to General Product' : '✨ Shift to Special Product'}
                  </button>
                </div>
              </div>

              {isSpecial && (
                <>
                  {/* Campaign Configuration Fields */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                      1. Campaign &amp; Offer Details
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-300">Campaign Badge Title</label>
                        <input
                          type="text"
                          value={editingProduct.specialConfig?.campaignBadge || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setEditingProduct(prev => {
                              if (!prev) return null;
                              return {
                                ...prev,
                                specialConfig: { ...(prev.specialConfig || { tasks: [] }), campaignBadge: val }
                              };
                            });
                          }}
                          placeholder="e.g. ⚡ FLASH MISSION DEAL"
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-amber-300 font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-300">Campaign Headline</label>
                        <input
                          type="text"
                          value={editingProduct.specialConfig?.campaignTitle || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setEditingProduct(prev => {
                              if (!prev) return null;
                              return {
                                ...prev,
                                specialConfig: { ...(prev.specialConfig || { tasks: [] }), campaignTitle: val }
                              };
                            });
                          }}
                          placeholder="e.g. Join Community to Unlock 25% Off"
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-300">Unlockable Coupon Code (Optional)</label>
                        <input
                          type="text"
                          value={editingProduct.specialConfig?.unlockedCouponCode || ''}
                          onChange={e => {
                            const val = e.target.value.toUpperCase();
                            setEditingProduct(prev => {
                              if (!prev) return null;
                              return {
                                ...prev,
                                specialConfig: { ...(prev.specialConfig || { tasks: [] }), unlockedCouponCode: val }
                              };
                            });
                          }}
                          placeholder="e.g. SPECIAL25 or FREE100"
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-cyan-300 font-mono font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-300">Extra Reward Discount %</label>
                        <input
                          type="number"
                          value={editingProduct.specialConfig?.discountPercent ?? (editingProduct.specialConfig?.isFreeProduct ? 100 : 20)}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setEditingProduct(prev => {
                              if (!prev) return null;
                              return {
                                ...prev,
                                specialConfig: { ...(prev.specialConfig || { tasks: [] }), discountPercent: val }
                              };
                            });
                          }}
                          placeholder="20 (or 100 for Free)"
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-emerald-400 font-bold"
                        />
                      </div>

                      {/* 100% FREE CLAIM MODE TOGGLE */}
                      <div className="col-span-1 sm:col-span-2 pt-1">
                        <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                          editingProduct.specialConfig?.isFreeProduct || editingProduct.isFreeProduct
                            ? 'bg-emerald-950/50 border-emerald-500/50 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                            : 'bg-zinc-900/80 border-white/5 hover:border-white/15'
                        }`}>
                          <input
                            type="checkbox"
                            checked={!!(editingProduct.specialConfig?.isFreeProduct || editingProduct.isFreeProduct)}
                            onChange={e => {
                              const checked = e.target.checked;
                              setEditingProduct(prev => {
                                if (!prev) return null;
                                return {
                                  ...prev,
                                  isFreeProduct: checked,
                                  specialConfig: {
                                    ...(prev.specialConfig || { tasks: [] }),
                                    isFreeProduct: checked,
                                    discountPercent: checked ? 100 : (prev.specialConfig?.discountPercent || 20),
                                    unlockedCouponCode: checked && !prev.specialConfig?.unlockedCouponCode ? 'FREE100' : prev.specialConfig?.unlockedCouponCode,
                                  }
                                };
                              });
                            }}
                            className="h-4 w-4 rounded bg-zinc-950 border-white/20 text-emerald-500 focus:ring-emerald-500 mt-0.5"
                          />
                          <div className="space-y-0.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                                🎁 100% Free Claim Mode (Tasks Unlock Without Payment)
                              </span>
                              {(editingProduct.specialConfig?.isFreeProduct || editingProduct.isFreeProduct) && (
                                <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase">
                                  Free Claim Active
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 block leading-relaxed">
                              When turned on, users who finish the required tasks can claim this product for <strong className="text-emerald-400">0 ৳ (100% Free)</strong> without having to go through bKash/Nagad manual payment verification.
                            </span>
                          </div>
                        </label>
                      </div>

                      <div className="col-span-1 sm:col-span-2 space-y-1">
                        <label className="font-bold text-slate-300">Campaign Instructions &amp; Description</label>
                        <textarea
                          rows={2}
                          value={editingProduct.specialConfig?.campaignDescription || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setEditingProduct(prev => {
                              if (!prev) return null;
                              return {
                                ...prev,
                                specialConfig: { ...(prev.specialConfig || { tasks: [] }), campaignDescription: val }
                              };
                            });
                          }}
                          placeholder="Complete all required tasks below to unlock this exclusive special deal!"
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white resize-none"
                        />
                      </div>

                      {/* Sync to Deals Section Checkbox */}
                      <div className="col-span-1 sm:col-span-2 pt-1">
                        <label className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/80 border border-white/5 cursor-pointer hover:border-white/15 transition-all">
                          <input
                            type="checkbox"
                            checked={editingProduct.specialConfig?.isSpecialOfferSynced ?? true}
                            onChange={e => {
                              const checked = e.target.checked;
                              setEditingProduct(prev => {
                                if (!prev) return null;
                                return {
                                  ...prev,
                                  specialConfig: { ...(prev.specialConfig || { tasks: [] }), isSpecialOfferSynced: checked }
                                };
                              });
                            }}
                            className="h-4 w-4 rounded bg-zinc-950 border-white/20 text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <span className="font-bold text-white text-xs block">
                              🟢 Sync Offer with Storefront Deals &amp; Offers Section
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              When enabled, this special product automatically creates and updates a matching card in the Storefront Exclusive Deals Carousel.
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Tasks Builder */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          2. Required Tasks ({editingProduct.specialConfig?.tasks?.length || 0})
                        </h4>
                        <p className="text-[11px] text-slate-400">Users must perform these tasks before the offer becomes unlocked.</p>
                      </div>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            const newTask = {
                              id: `task_${Date.now()}`,
                              type: 'join_telegram' as const,
                              title: 'Join our Telegram Channel',
                              url: 'https://t.me/keyoon',
                              isRequired: true,
                            };
                            setEditingProduct(prev => {
                              if (!prev) return null;
                              const tasks = [...(prev.specialConfig?.tasks || []), newTask];
                              return { ...prev, specialConfig: { ...(prev.specialConfig || {}), tasks } };
                            });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-[11px] font-bold border border-blue-500/30 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" /> Telegram
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const newTask = {
                              id: `task_${Date.now()}`,
                              type: 'follow_facebook' as const,
                              title: 'Follow Keyoon on Facebook',
                              url: 'https://facebook.com/keyoon',
                              isRequired: true,
                            };
                            setEditingProduct(prev => {
                              if (!prev) return null;
                              const tasks = [...(prev.specialConfig?.tasks || []), newTask];
                              return { ...prev, specialConfig: { ...(prev.specialConfig || {}), tasks } };
                            });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[11px] font-bold border border-indigo-500/30 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" /> Facebook
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const newTask = {
                              id: `task_${Date.now()}`,
                              type: 'write_review' as const,
                              title: 'Write a Verified Product Review',
                              url: '',
                              isRequired: true,
                            };
                            setEditingProduct(prev => {
                              if (!prev) return null;
                              const tasks = [...(prev.specialConfig?.tasks || []), newTask];
                              return { ...prev, specialConfig: { ...(prev.specialConfig || {}), tasks } };
                            });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-[11px] font-bold border border-amber-500/30 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" /> Write Review
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const newTask = {
                              id: `task_${Date.now()}`,
                              type: 'custom_action' as const,
                              title: 'Visit Promotional Link',
                              url: 'https://',
                              isRequired: true,
                            };
                            setEditingProduct(prev => {
                              if (!prev) return null;
                              const tasks = [...(prev.specialConfig?.tasks || []), newTask];
                              return { ...prev, specialConfig: { ...(prev.specialConfig || {}), tasks } };
                            });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-[11px] font-bold border border-white/10 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" /> Custom Action
                        </button>
                      </div>
                    </div>

                    {/* Tasks List */}
                    <div className="space-y-3">
                      {(editingProduct.specialConfig?.tasks || []).length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-white/10 rounded-xl text-slate-500 text-xs">
                          No tasks configured. Click one of the buttons above to add Telegram, Facebook, or Write Review tasks.
                        </div>
                      ) : (
                        editingProduct.specialConfig?.tasks?.map((task, tIdx) => (
                          <div key={task.id || tIdx} className="p-3.5 rounded-xl bg-zinc-900 border border-white/10 space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="h-5 w-5 rounded-full bg-zinc-800 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                                  #{tIdx + 1}
                                </span>
                                <select
                                  value={task.type}
                                  onChange={e => {
                                    const nextType = e.target.value as any;
                                    const tasks = [...(editingProduct.specialConfig?.tasks || [])];
                                    tasks[tIdx] = { ...tasks[tIdx], type: nextType };
                                    setEditingProduct(prev => prev ? { ...prev, specialConfig: { ...(prev.specialConfig || {}), tasks } } : null);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-white/10 text-amber-300 text-xs font-bold cursor-pointer"
                                >
                                  <option value="join_telegram">📱 Join Telegram</option>
                                  <option value="follow_facebook">👍 Follow on Facebook</option>
                                  <option value="write_review">⭐ Write Product Review</option>
                                  <option value="youtube_sub">🎬 Subscribe on YouTube</option>
                                  <option value="discord_join">💬 Join Discord Server</option>
                                  <option value="custom_action">🔗 Custom Action URL</option>
                                </select>
                              </div>

                              <div className="flex items-center gap-3">
                                <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={task.isRequired ?? true}
                                    onChange={e => {
                                      const checked = e.target.checked;
                                      const tasks = [...(editingProduct.specialConfig?.tasks || [])];
                                      tasks[tIdx] = { ...tasks[tIdx], isRequired: checked };
                                      setEditingProduct(prev => prev ? { ...prev, specialConfig: { ...(prev.specialConfig || {}), tasks } } : null);
                                    }}
                                    className="h-3.5 w-3.5 rounded bg-zinc-950 border-white/20 text-amber-600 focus:ring-amber-500"
                                  />
                                  <span>Required</span>
                                </label>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const tasks = (editingProduct.specialConfig?.tasks || []).filter((_, idx) => idx !== tIdx);
                                    setEditingProduct(prev => prev ? { ...prev, specialConfig: { ...(prev.specialConfig || {}), tasks } } : null);
                                  }}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Task Title / Label</label>
                                <input
                                  type="text"
                                  value={task.title}
                                  onChange={e => {
                                    const val = e.target.value;
                                    const tasks = [...(editingProduct.specialConfig?.tasks || [])];
                                    tasks[tIdx] = { ...tasks[tIdx], title: val };
                                    setEditingProduct(prev => prev ? { ...prev, specialConfig: { ...(prev.specialConfig || {}), tasks } } : null);
                                  }}
                                  placeholder="e.g. Join Keyoon Official Channel"
                                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-white/10 text-white text-xs font-medium"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">
                                  {task.type === 'write_review' ? 'Review Verification Mode' : 'Action Link URL'}
                                </label>
                                {task.type === 'write_review' ? (
                                  <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-amber-500/20 text-amber-300 text-xs font-mono">
                                    ⭐ Auto-verified when customer submits review
                                  </div>
                                ) : (
                                  <input
                                    type="text"
                                    value={task.url || ''}
                                    onChange={e => {
                                      const val = e.target.value;
                                      const tasks = [...(editingProduct.specialConfig?.tasks || [])];
                                      tasks[tIdx] = { ...tasks[tIdx], url: val };
                                      setEditingProduct(prev => prev ? { ...prev, specialConfig: { ...(prev.specialConfig || {}), tasks } } : null);
                                    }}
                                    placeholder="https://t.me/... or https://facebook.com/..."
                                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-white/10 text-cyan-300 text-xs font-mono"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* SECTION 3: PRICING DURATIONS BUILDER */}
          {productEditorTab === 'pricing' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950 border border-white/[0.08]">
                <div>
                  <h4 className="font-bold text-white text-sm">Subscription Pricing Tiers (৳ BDT)</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Enter prices in <strong className="text-emerald-400">Bangladeshi Taka (৳ BDT)</strong>. For non-BD visitors, prices automatically convert to USD ($).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(prev => {
                      if (!prev) return null;
                      return {
                        ...prev,
                        pricingTiers: [
                          ...prev.pricingTiers,
                          { duration: '1_month', label: '1 Month', price: 999, originalPrice: 1999, discountPercentage: 50, isPopular: false }
                        ]
                      };
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add Pricing Tier
                </button>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-[11px]">
                ℹ️ <strong>BD Taka Pricing Enabled:</strong> Type prices in ৳ BDT (e.g. 999 BDT). Customers from Bangladesh will see direct Taka (৳999), while international visitors will see converted USD ($7.99).
              </div>

              <div className="space-y-3">
                {editingProduct.pricingTiers.map((tier, tIdx) => (
                  <div key={tIdx} className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3 relative group">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-zinc-900 border border-white/10 text-cyan-400 font-mono text-[11px] flex items-center justify-center font-bold">
                          #{tIdx + 1}
                        </span>
                        <span className="font-bold text-white text-xs">
                          {tier.label || 'Unnamed Duration Plan'}
                        </span>
                        {tier.isPopular && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-black uppercase">
                            Popular Choice
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!tier.isPopular}
                            onChange={e => {
                              const checked = e.target.checked;
                              const tiers = editingProduct.pricingTiers.map((t, idx) => ({
                                ...t,
                                isPopular: idx === tIdx ? checked : t.isPopular
                              }));
                              setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                            }}
                            className="h-3.5 w-3.5 rounded bg-zinc-900 border-white/20 text-cyan-500"
                          />
                          <span>Highlight as Popular</span>
                        </label>

                        {editingProduct.pricingTiers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const tiers = editingProduct.pricingTiers.filter((_, idx) => idx !== tIdx);
                              setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                            }}
                            className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                            title="Delete this tier"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* Duration Preset Dropdown */}
                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-slate-400 font-semibold block text-[11px]">
                          Duration Preset
                        </label>
                        <select
                          value={
                            ['1_day', '3_days', '7_days', '14_days', '1_month', '2_months', '3_months', '6_months', '12_months', '24_months', 'lifetime'].includes(tier.duration)
                              ? tier.duration
                              : 'custom'
                          }
                          onChange={e => {
                            const val = e.target.value;
                            const tiers = [...editingProduct.pricingTiers];
                            if (val === 'custom') {
                              tiers[tIdx] = {
                                ...tiers[tIdx],
                                duration: tiers[tIdx].duration || 'custom_plan',
                              };
                            } else {
                              const labelMap: Record<string, string> = {
                                '1_day': '1 Day',
                                '3_days': '3 Days',
                                '7_days': '7 Days',
                                '14_days': '14 Days',
                                '1_month': '1 Month',
                                '2_months': '2 Months',
                                '3_months': '3 Months',
                                '6_months': '6 Months',
                                '12_months': '12 Months (1 Year)',
                                '24_months': '2 Years',
                                'lifetime': 'Lifetime Access',
                              };
                              tiers[tIdx] = {
                                ...tiers[tIdx],
                                duration: val,
                                label: labelMap[val] || tiers[tIdx].label || val,
                              };
                            }
                            setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono text-xs cursor-pointer"
                        >
                          <optgroup label="Standard Presets">
                            <option value="1_month">1 Month</option>
                            <option value="3_months">3 Months</option>
                            <option value="6_months">6 Months</option>
                            <option value="12_months">12 Months (1 Year)</option>
                            <option value="lifetime">Lifetime Access</option>
                          </optgroup>
                          <optgroup label="Short-term / Trial Presets">
                            <option value="1_day">1 Day (24 Hours)</option>
                            <option value="3_days">3 Days Trial</option>
                            <option value="7_days">7 Days (1 Week)</option>
                            <option value="14_days">14 Days (2 Weeks)</option>
                          </optgroup>
                          <optgroup label="Extended Presets">
                            <option value="2_months">2 Months</option>
                            <option value="24_months">2 Years (24 Months)</option>
                          </optgroup>
                          <optgroup label="Custom Entry">
                            <option value="custom">✍️ Custom Value Entry...</option>
                          </optgroup>
                        </select>
                      </div>

                      {/* Custom Identifier / Key (Side-by-Side Entry) */}
                      <div className="sm:col-span-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-slate-400 font-semibold block text-[11px]">
                            Custom Identifier (Key)
                          </label>
                          <span className="text-[10px] text-cyan-400 font-mono font-bold">Editable</span>
                        </div>
                        <input
                          type="text"
                          value={tier.duration}
                          onChange={e => {
                            const val = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
                            const tiers = [...editingProduct.pricingTiers];
                            tiers[tIdx] = { ...tiers[tIdx], duration: val };
                            setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                          }}
                          placeholder="e.g. 7_days, 15_days, 2_years"
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-cyan-500/30 focus:border-cyan-400 text-cyan-300 font-mono text-xs font-bold"
                          title="Custom Duration Identifier (e.g. 1_month, 7_days, lifetime)"
                        />
                      </div>

                      {/* Display Label */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-slate-400 font-semibold block text-[11px]">Display Label</label>
                        <input
                          type="text"
                          value={tier.label}
                          onChange={e => {
                            const tiers = [...editingProduct.pricingTiers];
                            tiers[tIdx] = { ...tiers[tIdx], label: e.target.value };
                            setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                          }}
                          placeholder="e.g. 1 Month, 7 Days"
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-bold text-xs"
                        />
                      </div>

                      {/* Sale Price (BDT) with live USD Badge */}
                      <div className="sm:col-span-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-slate-400 font-semibold block text-[11px]">Sale Price (৳ BDT)</label>
                          <span className="text-[10px] text-cyan-400 font-mono font-bold">
                            ≈ ${(tier.price / (bdtRate || 125)).toFixed(2)}
                          </span>
                        </div>
                        <input
                          type="number"
                          step="1"
                          value={tier.price}
                          onChange={e => {
                            const p = Number(e.target.value);
                            const tiers = [...editingProduct.pricingTiers];
                            const orig = tiers[tIdx].originalPrice || (p * 2);
                            const disc = orig > p ? Math.round(((orig - p) / orig) * 100) : 0;
                            tiers[tIdx] = { ...tiers[tIdx], price: p, discountPercentage: disc };
                            setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                          }}
                          placeholder="999"
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-emerald-400 font-mono font-bold text-xs"
                        />
                      </div>

                      {/* Original Price (BDT) */}
                      <div className="sm:col-span-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-slate-400 font-semibold block text-[11px]">Original (৳)</label>
                          <span className="text-[10px] text-emerald-400 font-bold">
                            -{tier.discountPercentage}%
                          </span>
                        </div>
                        <input
                          type="number"
                          step="1"
                          value={tier.originalPrice || ''}
                          onChange={e => {
                            const op = Number(e.target.value);
                            const tiers = [...editingProduct.pricingTiers];
                            const p = tiers[tIdx].price;
                            const disc = op > p ? Math.round(((op - p) / op) * 100) : 0;
                            tiers[tIdx] = { ...tiers[tIdx], originalPrice: op, discountPercentage: disc };
                            setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                          }}
                          placeholder="1999"
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-slate-400 font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => {
                          const tiers = editingProduct.pricingTiers.map((t, idx) => ({
                            ...t,
                            isPopular: idx === tIdx ? !t.isPopular : false,
                          }));
                          setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          tier.isPopular
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                            : 'bg-zinc-900 text-slate-400 border border-white/10 hover:text-white'
                        }`}
                      >
                        <Star className={`h-3.5 w-3.5 ${tier.isPopular ? 'fill-amber-400 text-amber-400' : ''}`} />
                        <span>{tier.isPopular ? '⭐ Marked as Popular (Highlighted on Store)' : 'Mark as Popular Tier'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const tiers = editingProduct.pricingTiers.filter((_, idx) => idx !== tIdx);
                          setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                        }}
                        disabled={editingProduct.pricingTiers.length <= 1}
                        className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 disabled:opacity-30 transition-colors cursor-pointer"
                        title="Delete Tier"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: DELIVERY & STOCK METRICS */}
          {productEditorTab === 'delivery' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Available Stock Count</label>
                  <input
                    type="number"
                    value={editingProduct.stockCount}
                    onChange={e => setEditingProduct(prev => prev ? { ...prev, stockCount: Number(e.target.value) } : null)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-emerald-400 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Delivery Time Estimate</label>
                  <input
                    type="text"
                    value={editingProduct.deliveryTimeEstimate || 'Instant (< 30s)'}
                    onChange={e => setEditingProduct(prev => prev ? { ...prev, deliveryTimeEstimate: e.target.value } : null)}
                    placeholder="e.g. Instant (< 30s), Under 5 Mins, 1-2 Hours"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Delivery Mechanism</label>
                  <select
                    value={editingProduct.deliveryType}
                    onChange={e => setEditingProduct(prev => prev ? { ...prev, deliveryType: e.target.value as any } : null)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-medium cursor-pointer"
                  >
                    <option value="instant_bot">Instant Bot (Automated Vault Credential Allocation)</option>
                    <option value="custom_email">Direct Email Upgrade (Requires user email)</option>
                    <option value="slot_invite">Family / Team Slot Invite Link</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Account Provisioning Type</label>
                  <select
                    value={editingProduct.accountType}
                    onChange={e => setEditingProduct(prev => prev ? { ...prev, accountType: e.target.value as any } : null)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-medium cursor-pointer"
                  >
                    <option value="private_account">Private Dedicated Account (Master Email + Password)</option>
                    <option value="shared_profile">Shared Profile / Screen (PIN-Locked Slot)</option>
                    <option value="family_slot">Family / Workspace Member Slot</option>
                    <option value="direct_upgrade">Direct Account Upgrade (Applied to customer's personal email)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Customer Rating (0.0 to 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    max="5.0"
                    min="1.0"
                    value={editingProduct.rating}
                    onChange={e => setEditingProduct(prev => prev ? { ...prev, rating: Number(e.target.value) } : null)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-amber-300 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Verified Review Count</label>
                  <input
                    type="number"
                    value={editingProduct.reviewCount}
                    onChange={e => setEditingProduct(prev => prev ? { ...prev, reviewCount: Number(e.target.value) } : null)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              {/* Storefront Feature & Visibility Toggles */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-3">
                <span className="font-bold text-slate-200">Catalog Visibility & Placement</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-white/5 cursor-pointer hover:bg-zinc-850 transition-colors">
                    <input
                      type="checkbox"
                      checked={!!editingProduct.isHidden}
                      onChange={e => setEditingProduct(prev => prev ? { ...prev, isHidden: e.target.checked } : null)}
                      className="h-4 w-4 rounded bg-zinc-950 text-rose-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-rose-300 block">Hide Product from Storefront</span>
                      <span className="text-[10px] text-slate-400">Temporarily unpublish from customer catalog</span>
                    </div>
                  </label>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-white/5">
                    <div className="flex-1 space-y-0.5">
                      <label className="font-bold text-white block text-xs">Display Sequence Order</label>
                      <span className="text-[10px] text-slate-400 block">Position in category row (1 = first)</span>
                    </div>
                    <input
                      type="number"
                      value={editingProduct.orderIndex ?? 0}
                      onChange={e => setEditingProduct(prev => prev ? { ...prev, orderIndex: Number(e.target.value) } : null)}
                      className="w-16 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-white/10 text-cyan-300 font-mono font-bold text-center text-xs"
                    />
                  </div>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-white/5 cursor-pointer hover:bg-zinc-850 transition-colors">
                    <input
                      type="checkbox"
                      checked={!!editingProduct.isFeatured}
                      onChange={e => setEditingProduct(prev => prev ? { ...prev, isFeatured: e.target.checked } : null)}
                      className="h-4 w-4 rounded bg-zinc-950 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-white block">Featured Product</span>
                      <span className="text-[10px] text-slate-400">Highlights item in Featured Carousel</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-white/5 cursor-pointer hover:bg-zinc-850 transition-colors">
                    <input
                      type="checkbox"
                      checked={!!editingProduct.isTrending}
                      onChange={e => setEditingProduct(prev => prev ? { ...prev, isTrending: e.target.checked } : null)}
                      className="h-4 w-4 rounded bg-zinc-950 text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-white block">Trending Deal</span>
                      <span className="text-[10px] text-slate-400">Shows hot flame icon on storefront cards</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: FEATURES MATRIX */}
          {productEditorTab === 'features' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">Included Features &amp; Perks List</h4>
                    <p className="text-slate-400 text-[11px]">These bullet points appear in the product detail card &amp; modal overview.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(prev => {
                        if (!prev) return null;
                        return { ...prev, features: [...(prev.features || []), 'New premium feature'] };
                      });
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Feature
                  </button>
                </div>

                <div className="space-y-2">
                  {(editingProduct.features || []).map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <input
                        type="text"
                        value={feat}
                        onChange={e => {
                          const list = [...(editingProduct.features || [])];
                          list[fIdx] = e.target.value;
                          setEditingProduct(prev => prev ? { ...prev, features: list } : null);
                        }}
                        placeholder="e.g. GPT-4o & Canvas access included"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const list = (editingProduct.features || []).filter((_, idx) => idx !== fIdx);
                          setEditingProduct(prev => prev ? { ...prev, features: list } : null);
                        }}
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-red-950 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Batch Textarea Mode */}
                <div className="pt-3 border-t border-white/5 space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold block">Or paste full list (1 per line):</label>
                  <textarea
                    rows={3}
                    value={(editingProduct.features || []).join('\n')}
                    onChange={e => {
                      const items = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
                      setEditingProduct(prev => prev ? { ...prev, features: items } : null);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-sans text-xs resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: TECHNICAL SPECIFICATIONS */}
          {productEditorTab === 'specs' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-4">
                <div>
                  <h4 className="font-bold text-white text-sm">Product Specifications &amp; Compatibility</h4>
                  <p className="text-slate-400 text-[11px]">Displays in the technical spec matrix inside the customer modal.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Streaming / Performance Quality</label>
                    <input
                      type="text"
                      value={editingProduct.specs?.quality || ''}
                      onChange={e => {
                        setEditingProduct(prev => prev ? {
                          ...prev,
                          specs: { ...(prev.specs || { warranty: 'Full Replacement', region: 'Global', platforms: [] }), quality: e.target.value }
                        } : null);
                      }}
                      placeholder="e.g. 4K Ultra HD / Max Bitrate, Dedicated Server Pool"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Warranty Coverage Policy</label>
                    <input
                      type="text"
                      value={editingProduct.specs?.warranty || ''}
                      onChange={e => {
                        setEditingProduct(prev => prev ? {
                          ...prev,
                          specs: { ...(prev.specs || { quality: 'HD', region: 'Global', platforms: [] }), warranty: e.target.value }
                        } : null);
                      }}
                      placeholder="e.g. 100% Full-Term Replacement Warranty"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-emerald-400 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Region &amp; VPN Status</label>
                    <input
                      type="text"
                      value={editingProduct.specs?.region || ''}
                      onChange={e => {
                        setEditingProduct(prev => prev ? {
                          ...prev,
                          specs: { ...(prev.specs || { warranty: 'Full', quality: 'HD', platforms: [] }), region: e.target.value }
                        } : null);
                      }}
                      placeholder="e.g. Worldwide / No VPN Required, Bangladesh Profile"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-cyan-300 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Allowed Screens / Concurrent Devices</label>
                    <input
                      type="number"
                      value={editingProduct.specs?.screens || 1}
                      onChange={e => {
                        setEditingProduct(prev => prev ? {
                          ...prev,
                          specs: { ...(prev.specs || { warranty: 'Full', quality: 'HD', platforms: [], region: 'Global' }), screens: Number(e.target.value) }
                        } : null);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2 space-y-2">
                    <label className="font-bold text-slate-300 block">Supported Platforms &amp; Ecosystems (Comma-separated)</label>
                    <input
                      type="text"
                      value={(editingProduct.specs?.platforms || []).join(', ')}
                      onChange={e => {
                        const plats = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setEditingProduct(prev => prev ? {
                          ...prev,
                          specs: { ...(prev.specs || { warranty: 'Full Replacement', quality: 'HD/4K', region: 'Global', platforms: [] }), platforms: plats }
                        } : null);
                      }}
                      placeholder="e.g. Web, iOS, Android, macOS, Windows, Smart TV, Apple TV, Linux"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white font-medium"
                    />

                    {/* Quick Platform Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['Web', 'iOS', 'Android', 'macOS', 'Windows', 'Smart TV', 'Linux', 'Apple TV'].map(pTag => {
                        const isAdded = (editingProduct.specs?.platforms || []).includes(pTag);
                        return (
                          <button
                            key={pTag}
                            type="button"
                            onClick={() => {
                              const current = editingProduct.specs?.platforms || [];
                              const updated = isAdded ? current.filter(x => x !== pTag) : [...current, pTag];
                              setEditingProduct(prev => prev ? {
                                ...prev,
                                specs: { ...(prev.specs || { warranty: 'Full Replacement', quality: 'HD', region: 'Global', platforms: [] }), platforms: updated }
                              } : null);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                              isAdded
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                : 'bg-zinc-900 text-slate-400 border-white/10 hover:text-white'
                            }`}
                          >
                            {isAdded ? `✓ ${pTag}` : `+ ${pTag}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: ACTIVATION GUIDE & DOCS */}
          {productEditorTab === 'docs' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">Step-by-Step Activation Protocol (Docs Tab)</h4>
                    <p className="text-slate-400 text-[11px]">Customers follow these exact ordered steps in their Vault &amp; modal docs tab.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(prev => {
                        if (!prev) return null;
                        return { ...prev, instructions: [...(prev.instructions || []), 'New instruction step'] };
                      });
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Step
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(editingProduct.instructions || []).map((inst, iIdx) => (
                    <div key={iIdx} className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-900 border border-white/10">
                      <div className="h-6 w-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {iIdx + 1}
                      </div>
                      <textarea
                        rows={2}
                        value={inst}
                        onChange={e => {
                          const steps = [...(editingProduct.instructions || [])];
                          steps[iIdx] = e.target.value;
                          setEditingProduct(prev => prev ? { ...prev, instructions: steps } : null);
                        }}
                        placeholder={`Step ${iIdx + 1} instructions...`}
                        className="flex-1 p-2 rounded-lg bg-zinc-950 border border-white/10 text-white text-xs resize-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const steps = (editingProduct.instructions || []).filter((_, idx) => idx !== iIdx);
                          setEditingProduct(prev => prev ? { ...prev, instructions: steps } : null);
                        }}
                        className="p-2 rounded-xl bg-zinc-950 hover:bg-red-950 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Batch Textarea Mode */}
                <div className="pt-3 border-t border-white/5 space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold block">Or paste full steps (1 step per line):</label>
                  <textarea
                    rows={3}
                    value={(editingProduct.instructions || []).join('\n')}
                    onChange={e => {
                      const items = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
                      setEditingProduct(prev => prev ? { ...prev, instructions: items } : null);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-sans text-xs resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="shrink-0 flex items-center justify-between p-4 px-6 border-t border-white/[0.08] bg-zinc-950">
          <span className="text-[11px] text-slate-400">
            Category: <span className="font-mono text-cyan-400 font-bold uppercase">{editingProduct.category}</span> · Tiers: <span className="text-white font-bold">{editingProduct.pricingTiers.length}</span>
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveProduct}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Save &amp; Publish Product</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
