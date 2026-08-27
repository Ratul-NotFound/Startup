'use client';

import React, { useRef } from 'react';
import { Product } from '@/types';
import { compressImageToDataUrl } from '@/lib/image-compression';
import {
  Package, X, ImageIcon, DollarSign, Zap, CheckCircle2, Shield, BookOpen,
  Loader2, Upload, Sparkles, Plus, Trash2, Star, Save,
} from 'lucide-react';

interface ProductEditorModalProps {
  editingProduct: (Product & { isNew?: boolean }) | null;
  setEditingProduct: React.Dispatch<React.SetStateAction<(Product & { isNew?: boolean }) | null>>;
  productEditorTab: 'basic' | 'pricing' | 'delivery' | 'features' | 'specs' | 'docs';
  setProductEditorTab: (tab: 'basic' | 'pricing' | 'delivery' | 'features' | 'specs' | 'docs') => void;
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
  const productLogoInputRef = useRef<HTMLInputElement>(null);
  const productBannerInputRef = useRef<HTMLInputElement>(null);

  if (!editingProduct) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-zinc-900 border border-white/15 my-4 shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Modal Top Header */}
        <div className="shrink-0 flex items-center justify-between p-5 border-b border-white/[0.08] bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {editingProduct.isNew ? 'Create New Product' : `Edit Product: ${editingProduct.name}`}
              </h3>
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
            { id: 'basic', label: '1. General & Visuals', icon: <ImageIcon className="h-3.5 w-3.5" /> },
            { id: 'pricing', label: '2. Pricing Durations', icon: <DollarSign className="h-3.5 w-3.5" /> },
            { id: 'delivery', label: '3. Delivery & Stock', icon: <Zap className="h-3.5 w-3.5" /> },
            { id: 'features', label: '4. Features Matrix', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
            { id: 'specs', label: '5. Technical Specs', icon: <Shield className="h-3.5 w-3.5" /> },
            { id: 'docs', label: '6. Docs & Guide', icon: <BookOpen className="h-3.5 w-3.5" /> },
          ].map(sec => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setProductEditorTab(sec.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                productEditorTab === sec.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-zinc-900'
              }`}
            >
              {sec.icon}
              <span>{sec.label}</span>
            </button>
          ))}
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
              const compressed = await compressImageToDataUrl(file, 400, 400, 0.85);
              setEditingProduct(prev => prev ? { ...prev, logo: compressed } : null);
              showFeedback('success', 'Product logo compressed and attached.');
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
          ref={productBannerInputRef}
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setIsCompressingProductBanner(true);
            try {
              const compressed = await compressImageToDataUrl(file, 1200, 800, 0.80);
              setEditingProduct(prev => {
                if (!prev) return null;
                const currImages = prev.images || [];
                return { ...prev, images: [compressed, ...currImages.filter(img => img !== compressed)] };
              });
              showFeedback('success', 'Banner image compressed and added to gallery.');
            } catch {
              showFeedback('error', 'Failed to compress banner.');
            } finally {
              setIsCompressingProductBanner(false);
              if (productBannerInputRef.current) productBannerInputRef.current.value = '';
            }
          }}
          className="hidden"
        />

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 max-h-[62vh]">
          {/* SECTION 1: GENERAL & BRAND VISUALS */}
          {productEditorTab === 'basic' && (
            <div className="space-y-4">
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
                    placeholder="Provide detailed description of what the user receives..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Logo Asset Box */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-cyan-400" />
                    Product Logo Icon
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Auto-compressed for instant loading</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-white/20 overflow-hidden shrink-0 shadow-md p-0.5">
                    <img
                      src={editingProduct.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'}
                      alt="Logo preview"
                      className="h-full w-full object-cover rounded-xl"
                    />
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => productLogoInputRef.current?.click()}
                        disabled={isCompressingProductLogo}
                        className="px-4 py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        {isCompressingProductLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        <span>Upload Logo from Device</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={editingProduct.logo}
                      onChange={e => setEditingProduct(prev => prev ? { ...prev, logo: e.target.value } : null)}
                      placeholder="Or paste direct logo URL..."
                      className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Gallery & Cover Banners */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    Cover Banner &amp; Gallery Images
                  </span>
                  <button
                    type="button"
                    onClick={() => productBannerInputRef.current?.click()}
                    disabled={isCompressingProductBanner}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
                  >
                    {isCompressingProductBanner ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                    <span>Upload Banner Image</span>
                  </button>
                </div>

                {editingProduct.images && editingProduct.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {editingProduct.images.map((imgUrl, imgIdx) => (
                      <div key={imgIdx} className="relative group rounded-xl overflow-hidden border border-white/10 h-16 bg-zinc-900">
                        <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(prev => {
                              if (!prev) return null;
                              return { ...prev, images: (prev.images || []).filter((_, idx) => idx !== imgIdx) };
                            });
                          }}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Remove image"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 block font-semibold">Gallery Image / GIF URLs (1 per line)</label>
                  <textarea
                    rows={2}
                    value={(editingProduct.images || []).join('\n')}
                    onChange={e => {
                      const urls = e.target.value.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
                      setEditingProduct(prev => prev ? { ...prev, images: urls } : null);
                    }}
                    placeholder="https://images.unsplash.com/...&#10;https://i.giphy.com/..."
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono text-[11px] resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: PRICING DURATIONS BUILDER */}
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
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold block">Duration Identifier</label>
                        <select
                          value={tier.duration}
                          onChange={e => {
                            const tiers = [...editingProduct.pricingTiers];
                            tiers[tIdx] = { ...tiers[tIdx], duration: e.target.value as any };
                            setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono cursor-pointer"
                        >
                          <option value="1_month">1 Month</option>
                          <option value="3_months">3 Months</option>
                          <option value="6_months">6 Months</option>
                          <option value="12_months">12 Months (1 Year)</option>
                          <option value="lifetime">Lifetime Access</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold block">Display Label</label>
                        <input
                          type="text"
                          value={tier.label}
                          onChange={e => {
                            const tiers = [...editingProduct.pricingTiers];
                            tiers[tIdx] = { ...tiers[tIdx], label: e.target.value };
                            setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                          }}
                          placeholder="e.g. 1 Month"
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold block">Sale Price (৳ BDT)</label>
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
                          placeholder="e.g. 999"
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-emerald-400 font-mono font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold block">Original Price (৳ BDT)</label>
                        <input
                          type="number"
                          step="1"
                          value={tier.originalPrice || ''}
                          onChange={e => {
                            const orig = Number(e.target.value);
                            const tiers = [...editingProduct.pricingTiers];
                            const p = tiers[tIdx].price;
                            const disc = orig > p ? Math.round(((orig - p) / orig) * 100) : 0;
                            tiers[tIdx] = { ...tiers[tIdx], originalPrice: orig, discountPercentage: disc };
                            setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                          }}
                          placeholder="e.g. 2000"
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-slate-400 font-mono line-through"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold block">Discount %</label>
                        <input
                          type="number"
                          value={tier.discountPercentage}
                          onChange={e => {
                            const tiers = [...editingProduct.pricingTiers];
                            tiers[tIdx] = { ...tiers[tIdx], discountPercentage: Number(e.target.value) };
                            setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-cyan-300 font-mono font-bold"
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

              {/* Storefront Feature Toggles */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-3">
                <span className="font-bold text-slate-200">Promotional Placement Flags</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
