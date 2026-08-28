'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  Plus, Save, Trash2, Sparkles, Star, Gift, Tag, CheckCircle2, Upload,
  Image as ImageIcon, X, Edit2, Check, Eye, EyeOff, ArrowUp, ArrowDown,
  Sliders, Settings2, ChevronDown, ChevronUp, AlertCircle,
} from 'lucide-react';
import { Coupon } from '@/types';
import { useApp } from '@/context/AppContext';

interface CouponsTabProps {
  coupons: Coupon[];
  newCoupon: Coupon;
  setNewCoupon: React.Dispatch<React.SetStateAction<Coupon>>;
  showCouponForm: boolean;
  setShowCouponForm: (show: boolean) => void;
  handleCreateCoupon: () => Promise<void>;
  adminDeleteCoupon: (code: string) => Promise<void>;
  showFeedback: (type: 'success' | 'error', msg: string) => void;
}

export function CouponsTab({
  coupons,
  newCoupon,
  setNewCoupon,
  showCouponForm,
  setShowCouponForm,
  handleCreateCoupon,
  adminDeleteCoupon,
  showFeedback,
}: CouponsTabProps) {
  const {
    products,
    specialOffersSettings,
    updateSpecialOffersSettings,
    adminToggleCouponVisibility,
    adminReorderCoupons,
    adminUpdateCoupon,
  } = useApp();

  const [editingCouponCode, setEditingCouponCode] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'special' | 'giveaway' | 'hidden'>('all');
  const [showSectionSettings, setShowSectionSettings] = useState(false);
  const [movingCode, setMovingCode] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Section customizer local state
  const [sectionBadge, setSectionBadge] = useState(specialOffersSettings?.badgeTitle || 'Special Offers & Promo Hub');
  const [sectionHeading, setSectionHeading] = useState(specialOffersSettings?.sectionHeading || 'Exclusive Deals & Giveaways');
  const [sectionSubtitle, setSectionSubtitle] = useState(specialOffersSettings?.sectionSubtitle || 'Swipe or scroll to claim promo codes, giveaways, and exclusive subscription discounts.');
  const [isSavingSection, setIsSavingSection] = useState(false);

  // Derived scope mode: 'all' | 'category' | 'products'
  const targetScope: 'all' | 'category' | 'products' =
    (newCoupon.applicableProductIds && newCoupon.applicableProductIds.length > 0)
      ? 'products'
      : (newCoupon.applicableCategory && newCoupon.applicableCategory !== 'all')
      ? 'category'
      : 'all';

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCouponCode(coupon.code);
    setNewCoupon({ ...coupon });
    setShowCouponForm(true);
  };

  const toggleSpecialOffer = async (code: string, currentVal?: boolean) => {
    try {
      await adminUpdateCoupon(code, { isSpecialOffer: !currentVal });
      showFeedback('success', `Deal ${code} ${!currentVal ? 'featured on' : 'removed from'} Landing Page Deals Hub.`);
    } catch {
      showFeedback('error', 'Failed to update special offer status.');
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showFeedback('error', 'Image size exceeds 2MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setNewCoupon(p => ({ ...p, offerImage: result }));
        showFeedback('success', 'Custom offer picture uploaded!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Sort coupons strictly by orderIndex ascending
  const sortedCoupons = useMemo(() => {
    return [...coupons].sort((a, b) => (a.orderIndex ?? 999) - (b.orderIndex ?? 999));
  }, [coupons]);

  const filteredCoupons = useMemo(() => {
    return sortedCoupons.filter(c => {
      if (filterType === 'special') return c.isSpecialOffer && !c.isHidden;
      if (filterType === 'giveaway') return (c.type === 'giveaway' || c.discountPercent >= 100 || c.offerTag?.toLowerCase().includes('giveaway')) && !c.isHidden;
      if (filterType === 'hidden') return !!c.isHidden;
      return true;
    });
  }, [sortedCoupons, filterType]);

  // Handle move coupon Up / Down
  const handleMoveCoupon = async (code: string, direction: 'up' | 'down') => {
    setMovingCode(code);
    try {
      const list = [...sortedCoupons];
      const currentIndex = list.findIndex(c => c.code === code);
      if (currentIndex === -1) return;

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return;

      const temp = list[currentIndex];
      list[currentIndex] = list[targetIndex];
      list[targetIndex] = temp;

      const reordered = list.map((c, idx) => ({ ...c, orderIndex: idx }));
      await adminReorderCoupons(reordered);
    } finally {
      setMovingCode(null);
    }
  };

  // Handle direct position selection
  const handleSetPosition = async (code: string, newPos: number) => {
    const list = [...sortedCoupons];
    const currentIndex = list.findIndex(c => c.code === code);
    if (currentIndex === -1 || currentIndex === newPos) return;

    const [item] = list.splice(currentIndex, 1);
    list.splice(newPos, 0, item);

    const reordered = list.map((c, idx) => ({ ...c, orderIndex: idx }));
    await adminReorderCoupons(reordered);
    showFeedback('success', `Moved ${code} to sequence #${newPos + 1}`);
  };

  // Save section titles
  const handleSaveSectionSettings = async () => {
    setIsSavingSection(true);
    try {
      await updateSpecialOffersSettings({
        badgeTitle: sectionBadge,
        sectionHeading: sectionHeading,
        sectionSubtitle: sectionSubtitle,
      });
      showFeedback('success', 'Exclusive Deals section titles updated on Storefront!');
      setShowSectionSettings(false);
    } catch {
      showFeedback('error', 'Failed to save section settings.');
    } finally {
      setIsSavingSection(false);
    }
  };

  const isSectionHidden = !!specialOffersSettings?.isSectionHidden;

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* 1. Master Section Customization & Visibility Control Banner */}
      <div className="p-5 rounded-3xl bg-zinc-950 border border-white/[0.08] shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <span>Exclusive Deals, Giveaways &amp; Offers Hub</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Manage storefront deals carousel, sequence promo cards, and toggle visibility.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Master Hide / Show Section Toggle */}
            <button
              type="button"
              onClick={async () => {
                const nextVal = !isSectionHidden;
                await updateSpecialOffersSettings({ isSectionHidden: nextVal });
                showFeedback('success', `Exclusive Deals Section is now ${nextVal ? 'HIDDEN from' : 'LIVE on'} Storefront.`);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border shadow-sm ${
                isSectionHidden
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/40 hover:bg-rose-900'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900'
              }`}
              title="Click to toggle entire section visibility on homepage"
            >
              {isSectionHidden ? (
                <>
                  <EyeOff className="h-4 w-4 text-rose-400" />
                  <span>Section: Hidden (Off)</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 text-emerald-400" />
                  <span>Section: Live on Store</span>
                </>
              )}
            </button>

            {/* Customizer Drawer Button */}
            <button
              type="button"
              onClick={() => setShowSectionSettings(!showSectionSettings)}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-slate-300 border border-white/10 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Settings2 className="h-4 w-4 text-cyan-400" />
              <span>Section Text</span>
              {showSectionSettings ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Section Text Customizer Collapsible Box */}
        {showSectionSettings && (
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-cyan-500/30 space-y-3 animate-in fade-in duration-200">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-cyan-400" />
              <span>Customize Storefront Deals Section Headings</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Badge Tagline</label>
                <input
                  value={sectionBadge}
                  onChange={e => setSectionBadge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Special Offers & Promo Hub"
                />
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Section Main Heading</label>
                <input
                  value={sectionHeading}
                  onChange={e => setSectionHeading(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Exclusive Deals & Giveaways"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-slate-300 font-bold block mb-1">Section Subtitle</label>
                <input
                  value={sectionSubtitle}
                  onChange={e => setSectionSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Swipe or scroll to claim promo codes..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowSectionSettings(false)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 text-slate-300 text-xs font-bold hover:bg-zinc-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingSection}
                onClick={handleSaveSectionSettings}
                className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save Section Titles</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Action Buttons & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: `All Deals & Codes (${coupons.length})` },
            { id: 'special', label: `★ Landing Deals (${coupons.filter(c => c.isSpecialOffer && !c.isHidden).length})` },
            { id: 'giveaway', label: `🎁 Giveaways (${coupons.filter(c => (c.type === 'giveaway' || c.discountPercent >= 100) && !c.isHidden).length})` },
            { id: 'hidden', label: `👁️‍🗨️ Hidden (${coupons.filter(c => c.isHidden).length})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === f.id
                  ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
                  : 'bg-zinc-900 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Create Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setNewCoupon({
                code: `GIVEAWAY${Math.floor(100 + Math.random() * 900)}`,
                discountPercent: 100,
                description: '100% Free Monthly Premium Subscription Giveaway Code',
                isSpecialOffer: true,
                offerTag: '🎁 FREE GIVEAWAY',
                offerTitle: 'Community Monthly Premium Giveaway',
                offerImage: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
                type: 'giveaway',
                isHidden: false,
                orderIndex: sortedCoupons.length,
              });
              setShowCouponForm(true);
            }}
            className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 text-amber-400" />
            <Gift className="h-3.5 w-3.5" />
            <span>+ Giveaway</span>
          </button>

          <button
            onClick={() => {
              setNewCoupon({
                code: `FLASH${Math.floor(10 + Math.random() * 90)}`,
                discountPercent: 40,
                description: '40% off summer flash sale promo',
                isSpecialOffer: true,
                offerTag: '⚡ FLASH SALE',
                offerTitle: 'Instant 40% Off Storewide Flash Sale',
                offerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
                type: 'special_deal',
                isHidden: false,
                orderIndex: sortedCoupons.length,
              });
              setShowCouponForm(true);
            }}
            className="px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 text-cyan-400" />
            <Sparkles className="h-3.5 w-3.5" />
            <span>+ Special Deal</span>
          </button>

          <button
            onClick={() => {
              setNewCoupon({
                code: '',
                discountPercent: 15,
                description: '',
                isHidden: false,
                orderIndex: sortedCoupons.length,
              });
              setShowCouponForm(!showCouponForm);
            }}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="h-3.5 w-3.5" />
            <Tag className="h-3.5 w-3.5" />
            <span>+ Add Code</span>
          </button>
        </div>
      </div>

      {/* 3. Form Overlay / Drawer */}
      {showCouponForm && (
        <div className="p-6 rounded-3xl bg-zinc-900 border border-white/15 space-y-5 shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gift className="h-4 w-4 text-cyan-400" />
              <span>{editingCouponCode ? `Edit Promo Code: ${editingCouponCode}` : 'Configure Promo Code / Special Offer / Giveaway'}</span>
            </h3>
            <button
              onClick={() => {
                setShowCouponForm(false);
                setEditingCouponCode(null);
              }}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Coupon / Promo Code</label>
              <input
                value={newCoupon.code}
                onChange={e => setNewCoupon(p => ({ ...p, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') }))}
                placeholder="e.g. VIP50 or GIVEAWAY100"
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white uppercase focus:outline-none focus:border-cyan-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Discount % (100 = Free Giveaway)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={newCoupon.discountPercent}
                onChange={e => setNewCoupon(p => ({ ...p, discountPercent: Math.min(100, Math.max(1, Number(e.target.value))) }))}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-emerald-400 font-bold font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Display Sequence Order</label>
              <input
                type="number"
                value={newCoupon.orderIndex ?? 0}
                onChange={e => setNewCoupon(p => ({ ...p, orderIndex: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
                placeholder="0 = 1st position"
              />
            </div>

            {/* Applicable Scope & Target Product Picker */}
            <div className="sm:col-span-3 p-3.5 rounded-2xl bg-zinc-950/90 border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Target Product &amp; Eligibility Scope</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Controls which product this code discounts in multi-item carts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Coupon Scope</label>
                  <select
                    value={
                      (newCoupon.linkedProductId || (newCoupon.applicableProductIds && newCoupon.applicableProductIds.length > 0))
                        ? 'product'
                        : (newCoupon.applicableCategory && newCoupon.applicableCategory !== 'all')
                        ? 'category'
                        : 'all'
                    }
                    onChange={e => {
                      const scope = e.target.value;
                      if (scope === 'all') {
                        setNewCoupon(p => ({ ...p, linkedProductId: undefined, applicableProductIds: [], applicableCategory: 'all' }));
                      } else if (scope === 'category') {
                        setNewCoupon(p => ({ ...p, linkedProductId: undefined, applicableProductIds: [], applicableCategory: 'ai' }));
                      } else if (scope === 'product') {
                        const firstProdId = products[0]?.id || '';
                        setNewCoupon(p => ({ ...p, linkedProductId: firstProdId, applicableProductIds: [firstProdId], applicableCategory: 'all' }));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="all">🌐 All Products (Storewide Discount)</option>
                    <option value="product">🎯 Specific Target Product</option>
                    <option value="category">🏷️ Specific Category Only</option>
                  </select>
                </div>

                {/* If Product scope selected, show product picker */}
                {(newCoupon.linkedProductId || (newCoupon.applicableProductIds && newCoupon.applicableProductIds.length > 0)) && (
                  <div>
                    <label className="text-slate-400 block mb-1">Select Applicable Product</label>
                    <select
                      value={newCoupon.linkedProductId || newCoupon.applicableProductIds?.[0] || ''}
                      onChange={e => {
                        const prodId = e.target.value;
                        setNewCoupon(p => ({
                          ...p,
                          linkedProductId: prodId,
                          applicableProductIds: [prodId],
                          applicableCategory: 'all',
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs focus:outline-none focus:border-cyan-400"
                    >
                      {products.map(prod => (
                        <option key={prod.id} value={prod.id}>
                          {prod.name} ({prod.category.toUpperCase()}) {prod.productType === 'special' ? '⚡ Special' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* If Category scope selected, show category picker */}
                {!newCoupon.linkedProductId && (!newCoupon.applicableProductIds || newCoupon.applicableProductIds.length === 0) && newCoupon.applicableCategory && newCoupon.applicableCategory !== 'all' && (
                  <div>
                    <label className="text-slate-400 block mb-1">Select Category</label>
                    <select
                      value={newCoupon.applicableCategory}
                      onChange={e => setNewCoupon(p => ({ ...p, applicableCategory: e.target.value as any }))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="ai">AI &amp; GPT</option>
                      <option value="streaming">Streaming &amp; OTT</option>
                      <option value="dev">Developer Tools</option>
                      <option value="productivity">Productivity &amp; Cloud</option>
                      <option value="vpn_security">Security &amp; VPN</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="text-slate-300 font-bold block mb-1">Deal Description &amp; Terms</label>
              <input
                value={newCoupon.description}
                onChange={e => setNewCoupon(p => ({ ...p, description: e.target.value }))}
                placeholder="e.g. 50% discount on all Developer Tools subscriptions"
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Special Deals Hub Card Customization */}
            <div className="sm:col-span-3 p-4 rounded-2xl bg-zinc-950 border border-cyan-500/20 space-y-3">
              <span className="font-bold text-slate-200 block text-xs">
                Featured Offer &amp; Deals Hub Banner Settings
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Offer Title (Shown on Banner)</label>
                  <input
                    value={newCoupon.offerTitle || ''}
                    onChange={e => setNewCoupon(p => ({ ...p, offerTitle: e.target.value }))}
                    placeholder="e.g. Free 1-Month ChatGPT Plus Access"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Badge Tag (e.g. 🎁 GIVEAWAY, ⚡ FLASH)</label>
                  <input
                    value={newCoupon.offerTag || ''}
                    onChange={e => setNewCoupon(p => ({ ...p, offerTag: e.target.value }))}
                    placeholder="e.g. 🎁 FREE GIVEAWAY"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Custom Deal Picture URL</label>
                <div className="flex items-center gap-2">
                  <input
                    value={newCoupon.offerImage || ''}
                    onChange={e => setNewCoupon(p => ({ ...p, offerImage: e.target.value }))}
                    placeholder="https://images.unsplash.com/... or upload"
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-white/10 shrink-0"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Picture</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2 border-t border-white/5 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!newCoupon.isSpecialOffer}
                    onChange={e => setNewCoupon(p => ({ ...p, isSpecialOffer: e.target.checked }))}
                    className="h-4 w-4 rounded bg-zinc-900 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-white font-bold text-xs">Featured on Landing Page Deals Hub</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!newCoupon.isHidden}
                    onChange={e => setNewCoupon(p => ({ ...p, isHidden: e.target.checked }))}
                    className="h-4 w-4 rounded bg-zinc-900 text-rose-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-rose-300 font-bold text-xs">Hide Deal from Storefront</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setShowCouponForm(false);
                setEditingCouponCode(null);
              }}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-slate-300 text-xs font-bold hover:bg-zinc-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                if (editingCouponCode) {
                  await adminUpdateCoupon(editingCouponCode, newCoupon);
                  showFeedback('success', `Deal ${editingCouponCode} updated.`);
                  setShowCouponForm(false);
                  setEditingCouponCode(null);
                } else {
                  await handleCreateCoupon();
                }
              }}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold cursor-pointer shadow-lg flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>{editingCouponCode ? 'Update Deal' : 'Save & Publish Deal'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Deals & Giveaways List with Sequencing & Instant Hide/Unhide */}
      <div className="space-y-3">
        {filteredCoupons.map((c, idx) => {
          const isGiveaway = c.type === 'giveaway' || c.discountPercent >= 100 || c.offerTag?.toLowerCase().includes('giveaway');
          const isHidden = !!c.isHidden;
          const isMoving = movingCode === c.code;

          return (
            <div
              key={c.code}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-4 ${
                isHidden
                  ? 'bg-zinc-950/60 border-rose-500/20 opacity-75'
                  : c.isSpecialOffer
                    ? 'bg-zinc-900/90 border-cyan-500/40 shadow-lg ring-1 ring-cyan-500/20'
                    : 'bg-zinc-900 border-white/[0.08]'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                {/* Sequence Number & Up/Down Arrows */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <select
                    value={sortedCoupons.findIndex(item => item.code === c.code)}
                    onChange={(e) => handleSetPosition(c.code, Number(e.target.value))}
                    className="text-[11px] font-mono font-bold px-2 py-1 rounded-lg bg-zinc-950 text-cyan-400 border border-cyan-500/30 cursor-pointer"
                    title="Change sequence order on storefront"
                  >
                    {sortedCoupons.map((_, pIdx) => (
                      <option key={pIdx} value={pIdx}>
                        #{pIdx + 1}
                      </option>
                    ))}
                  </select>

                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={isMoving || idx === 0}
                      onClick={() => handleMoveCoupon(c.code, 'up')}
                      className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                      title="Move deal up (▲)"
                    >
                      <ArrowUp className="h-2.5 w-2.5" />
                    </button>
                    <button
                      type="button"
                      disabled={isMoving || idx === sortedCoupons.length - 1}
                      onClick={() => handleMoveCoupon(c.code, 'down')}
                      className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                      title="Move deal down (▼)"
                    >
                      <ArrowDown className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>

                {/* Thumbnail if custom offerImage exists */}
                {c.offerImage ? (
                  <div className="h-12 w-16 rounded-xl border border-white/10 overflow-hidden shrink-0">
                    <img src={c.offerImage} alt={c.code} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={`px-3 py-2 rounded-xl border shrink-0 font-mono font-black text-xs ${
                    isGiveaway
                      ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {c.code}
                  </div>
                )}

                {/* Deal Details */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-black text-emerald-400 text-sm">{c.code}</span>
                    <span className="text-sm font-black text-white">
                      {isGiveaway ? '🎁 100% FREE GIVEAWAY' : `${c.discountPercent}% OFF`}
                    </span>

                    {/* Scope Badge */}
                    {(() => {
                      const linkedProd = c.linkedProductId ? products.find(p => p.id === c.linkedProductId) : null;
                      const applicableProds = (c.applicableProductIds && c.applicableProductIds.length > 0)
                        ? products.filter(p => c.applicableProductIds?.includes(p.id))
                        : [];
                      
                      if (linkedProd) {
                        return (
                          <span className="px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-500/30 text-[9px] font-bold flex items-center gap-1">
                            <span>🎯</span>
                            <span>Target: {linkedProd.name}</span>
                          </span>
                        );
                      }
                      if (applicableProds.length > 0) {
                        return (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 text-[9px] font-bold flex items-center gap-1">
                            <span>🎯</span>
                            <span>Applies to: {applicableProds.map(p => p.name).join(', ')}</span>
                          </span>
                        );
                      }
                      if (c.applicableCategory && c.applicableCategory !== 'all') {
                        return (
                          <span className="px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30 text-[9px] font-bold">
                            🏷️ Category: {c.applicableCategory.toUpperCase()}
                          </span>
                        );
                      }
                      return (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-white/10 text-[9px] font-bold">
                          🌐 Storewide
                        </span>
                      );
                    })()}

                    {c.offerTag && (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-cyan-300 font-bold text-[10px] uppercase border border-white/10">
                        {c.offerTag}
                      </span>
                    )}

                    {c.isSpecialOffer && (
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-cyan-400" /> Featured Deal
                      </span>
                    )}

                    {isHidden && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/30 text-[9px] font-bold uppercase">
                        Hidden from Store
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {c.offerTitle || c.description}
                  </p>
                </div>
              </div>

              {/* Status & Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {/* 1-Click Hide/Unhide Button */}
                <button
                  type="button"
                  onClick={() => adminToggleCouponVisibility(c.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isHidden
                      ? 'bg-rose-950/80 text-rose-300 border-rose-500/40 hover:bg-rose-900'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900'
                  }`}
                  title="Click to toggle visibility on storefront"
                >
                  {isHidden ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5 text-rose-400" />
                      <span>Hidden (Off)</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Live on Hub</span>
                    </>
                  )}
                </button>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => handleEditCoupon(c)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
                  title="Edit deal settings"
                >
                  <Edit2 className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Edit</span>
                </button>

                {/* Star / Featured Toggle */}
                <button
                  type="button"
                  onClick={() => toggleSpecialOffer(c.code, c.isSpecialOffer)}
                  className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    c.isSpecialOffer
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-zinc-800 text-slate-400 border-white/10 hover:text-white'
                  }`}
                  title="Toggle storefront featured offer status"
                >
                  <Star className={`h-3.5 w-3.5 ${c.isSpecialOffer ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                </button>

                {/* Delete */}
                <button
                  onClick={() => adminDeleteCoupon(c.code).then(() => showFeedback('success', `Deal ${c.code} deleted.`))}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-red-950/60 text-red-400 transition-colors cursor-pointer"
                  title="Delete deal"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredCoupons.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs rounded-2xl bg-zinc-900 border border-white/[0.06]">
            No deals matching query. Click &quot;+ Special Deal&quot; or &quot;+ Giveaway&quot; above to create one.
          </div>
        )}
      </div>
    </div>
  );
}
