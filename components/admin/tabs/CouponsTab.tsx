'use client';

import React, { useState } from 'react';
import { Plus, Save, Trash2, Sparkles, Star, Gift, Tag, CheckCircle2 } from 'lucide-react';
import { Coupon } from '@/types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  const [filterType, setFilterType] = useState<'all' | 'special' | 'giveaway'>('all');

  const toggleSpecialOffer = async (code: string, currentVal?: boolean) => {
    try {
      await updateDoc(doc(db, 'coupons', code), { isSpecialOffer: !currentVal });
      showFeedback('success', `Coupon ${code} ${!currentVal ? 'published to' : 'removed from'} Storefront Landing Page Special Offers Hub.`);
    } catch {
      showFeedback('error', 'Failed to update special offer status.');
    }
  };

  const filteredCoupons = coupons.filter(c => {
    if (filterType === 'special') return c.isSpecialOffer;
    if (filterType === 'giveaway') return c.type === 'giveaway' || c.discountPercent >= 100 || c.offerTag?.toLowerCase().includes('giveaway');
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-900 border border-white/[0.08]">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Gift className="h-5 w-5 text-cyan-400" />
            <span>Special Offers, Discounts &amp; Giveaway Manager</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create flash sales, free giveaways, promo codes, and feature them live on the Storefront Landing Page.
          </p>
        </div>

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
                type: 'giveaway',
              });
              setShowCouponForm(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
          >
            <Plus className="h-4 w-4 text-amber-400" />
            <Gift className="h-3.5 w-3.5" />
            <span>+ Add New Giveaway</span>
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
                type: 'special_deal',
              });
              setShowCouponForm(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
          >
            <Plus className="h-4 w-4 text-cyan-400" />
            <Sparkles className="h-3.5 w-3.5" />
            <span>+ Add Special Offer</span>
          </button>

          <button
            onClick={() => {
              setNewCoupon({ code: '', discountPercent: 15, description: '' });
              setShowCouponForm(!showCouponForm);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="h-4 w-4" />
            <Tag className="h-3.5 w-3.5" />
            <span>+ Add Discount Code</span>
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all', label: `All Codes & Deals (${coupons.length})` },
          { id: 'special', label: `★ Landing Page Featured (${coupons.filter(c => c.isSpecialOffer).length})` },
          { id: 'giveaway', label: `🎁 Giveaways (${coupons.filter(c => c.type === 'giveaway' || c.discountPercent >= 100).length})` },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === f.id
                ? 'bg-zinc-800 text-white border border-white/20 shadow-sm'
                : 'bg-zinc-950 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Form Overlay */}
      {showCouponForm && (
        <div className="p-6 rounded-3xl bg-zinc-900 border border-white/15 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gift className="h-4 w-4 text-cyan-400" />
              <span>Configure Promo Code / Special Offer / Giveaway</span>
            </h3>
            <button onClick={() => setShowCouponForm(false)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Coupon / Code</label>
              <input
                value={newCoupon.code}
                onChange={e => setNewCoupon(p => ({ ...p, code: e.target.value }))}
                placeholder="e.g. VIP50 or GIVEAWAY100"
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white uppercase focus:outline-none focus:border-blue-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Discount % (100 = Free Giveaway)</label>
              <input
                type="number"
                value={newCoupon.discountPercent}
                onChange={e => setNewCoupon(p => ({ ...p, discountPercent: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-emerald-400 font-bold font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Min Order ($)</label>
              <input
                type="number"
                value={newCoupon.minOrderAmount || ''}
                onChange={e => setNewCoupon(p => ({ ...p, minOrderAmount: Number(e.target.value) || undefined }))}
                placeholder="Optional e.g. 30.00"
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="col-span-1 sm:col-span-3">
              <label className="text-slate-300 font-bold block mb-1">Description / Terms</label>
              <input
                value={newCoupon.description}
                onChange={e => setNewCoupon(p => ({ ...p, description: e.target.value }))}
                placeholder="e.g. 50% discount on annual premium AI & streaming plans"
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Special Offer Settings */}
            <div className="col-span-1 sm:col-span-3 p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!newCoupon.isSpecialOffer}
                  onChange={e => setNewCoupon(p => ({ ...p, isSpecialOffer: e.target.checked }))}
                  className="h-4 w-4 rounded accent-cyan-500 cursor-pointer"
                />
                <span className="font-bold text-white text-xs">Publish to Storefront Landing Page Special Offers &amp; Giveaway Hub</span>
              </label>

              {newCoupon.isSpecialOffer && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Badge Tag</label>
                    <input
                      value={newCoupon.offerTag || ''}
                      onChange={e => setNewCoupon(p => ({ ...p, offerTag: e.target.value }))}
                      placeholder="e.g. 🎁 FREE GIVEAWAY, ⚡ FLASH SALE, 🔥 VIP 50%"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-cyan-300 font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Offer Headline Title</label>
                    <input
                      value={newCoupon.offerTitle || ''}
                      onChange={e => setNewCoupon(p => ({ ...p, offerTitle: e.target.value }))}
                      placeholder="e.g. Summer AI &amp; Cinema Giveaway Pass"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-bold text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCreateCoupon}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Save className="h-3.5 w-3.5" /> Save &amp; Publish Offer
            </button>
            <button
              onClick={() => setShowCouponForm(false)}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 text-slate-300 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Coupons & Offers List */}
      <div className="space-y-3">
        {filteredCoupons.map(c => {
          const isGiveaway = c.type === 'giveaway' || c.discountPercent >= 100 || c.offerTag?.toLowerCase().includes('giveaway');

          return (
            <div
              key={c.code}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-4 ${
                c.isSpecialOffer
                  ? 'bg-zinc-900/90 border-cyan-500/30 shadow-md ring-1 ring-cyan-500/20'
                  : 'bg-zinc-900 border-white/[0.08]'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`px-3.5 py-2 rounded-xl border shrink-0 font-mono font-black text-sm ${
                  isGiveaway
                    ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                }`}>
                  {c.code}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-white">
                      {isGiveaway ? '🎁 100% FREE GIVEAWAY' : `${c.discountPercent}% OFF`}
                    </span>

                    {c.offerTag && (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-cyan-300 font-bold text-[10px] uppercase border border-white/10">
                        {c.offerTag}
                      </span>
                    )}

                    {c.isSpecialOffer && (
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-cyan-400" /> Landing Page Hub Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {c.offerTitle || c.description}
                    {c.minOrderAmount ? ` · Min order $${c.minOrderAmount}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => toggleSpecialOffer(c.code, c.isSpecialOffer)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    c.isSpecialOffer
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                      : 'bg-zinc-800 text-slate-400 border-white/10 hover:text-white'
                  }`}
                  title="Toggle storefront landing page featured offer status"
                >
                  <Star className={`h-3.5 w-3.5 ${c.isSpecialOffer ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                  <span>{c.isSpecialOffer ? 'Featured on Store' : 'Publish to Store'}</span>
                </button>

                <button
                  onClick={() => adminDeleteCoupon(c.code).then(() => showFeedback('success', `Coupon ${c.code} deleted.`))}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-red-950/60 text-red-400 transition-colors cursor-pointer"
                  title="Delete coupon"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredCoupons.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs rounded-2xl bg-zinc-900 border border-white/[0.06]">
            No coupons or special offers matching query. Click &quot;+ New Promo Code&quot; or &quot;🎁 New Giveaway&quot; above to create one.
          </div>
        )}
      </div>
    </div>
  );
}
