'use client';

import React from 'react';
import { Plus, Save, Trash2, Sparkles, Star } from 'lucide-react';
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
  const toggleSpecialOffer = async (code: string, currentVal?: boolean) => {
    try {
      await updateDoc(doc(db, 'coupons', code), { isSpecialOffer: !currentVal });
      showFeedback('success', `Coupon ${code} ${!currentVal ? 'published to' : 'removed from'} Landing Page Special Offers hub.`);
    } catch {
      showFeedback('error', 'Failed to update special offer status.');
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <span>Promotional Coupons &amp; Special Offers Hub</span>
          </h2>
          <p className="text-xs text-slate-400">
            Manage promo discount codes and feature special deals / giveaways on the Landing Page.
          </p>
        </div>
        <button
          onClick={() => setShowCouponForm(!showCouponForm)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0"
        >
          <Plus className="h-4 w-4" /> New Coupon &amp; Deal
        </button>
      </div>

      {showCouponForm && (
        <div className="p-5 rounded-3xl bg-zinc-900 border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-bold text-white">Create Promo Code or Special Offer</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-bold block mb-1">Coupon Code</label>
              <input
                value={newCoupon.code}
                onChange={e => setNewCoupon(p => ({ ...p, code: e.target.value }))}
                placeholder="e.g. VIP50 or GIVEAWAY100"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white uppercase focus:outline-none focus:border-blue-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">Discount % (100 = Free Giveaway)</label>
              <input
                type="number"
                value={newCoupon.discountPercent}
                onChange={e => setNewCoupon(p => ({ ...p, discountPercent: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-emerald-400 font-bold font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">Min Order ($)</label>
              <input
                type="number"
                value={newCoupon.minOrderAmount || ''}
                onChange={e => setNewCoupon(p => ({ ...p, minOrderAmount: Number(e.target.value) || undefined }))}
                placeholder="Optional"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="col-span-1 sm:col-span-3">
              <label className="text-slate-400 font-bold block mb-1">Description / Subtitle</label>
              <input
                value={newCoupon.description}
                onChange={e => setNewCoupon(p => ({ ...p, description: e.target.value }))}
                placeholder="e.g. 50% discount on annual premium AI & streaming plans"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Special Offer Settings */}
            <div className="col-span-1 sm:col-span-3 p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!newCoupon.isSpecialOffer}
                    onChange={e => setNewCoupon(p => ({ ...p, isSpecialOffer: e.target.checked }))}
                    className="h-4 w-4 rounded accent-cyan-500 cursor-pointer"
                  />
                  <span className="font-bold text-white text-xs">Publish to Landing Page Special Offers &amp; Giveaway Hub</span>
                </label>
              </div>

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

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleCreateCoupon}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Save className="h-3.5 w-3.5" /> Save &amp; Publish Coupon
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
        {coupons.map(c => (
          <div key={c.code} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-zinc-900 border border-white/[0.08] gap-3">
            <div className="flex items-center gap-4">
              <div className="px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 shrink-0">
                <span className="font-mono font-black text-emerald-400 text-sm">{c.code}</span>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">{c.discountPercent}% OFF</span>
                  {c.isSpecialOffer && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-bold text-[9px] uppercase tracking-wider">
                      ★ Featured on Landing Page
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">{c.description}{c.minOrderAmount ? ` · Min order $${c.minOrderAmount}` : ''}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => toggleSpecialOffer(c.code, c.isSpecialOffer)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  c.isSpecialOffer
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-zinc-800 text-slate-400 border border-white/10 hover:text-white'
                }`}
                title="Toggle storefront landing page featured offer status"
              >
                <Star className={`h-3.5 w-3.5 ${c.isSpecialOffer ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                <span>{c.isSpecialOffer ? 'Featured' : 'Feature on Store'}</span>
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
        ))}
      </div>
    </div>
  );
}
