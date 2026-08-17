'use client';

import React from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Coupon } from '@/types';

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
  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white">Promotional Coupons</h2>
          <p className="text-xs text-slate-400">Manage promo discount codes synced in Firestore.</p>
        </div>
        <button
          onClick={() => setShowCouponForm(!showCouponForm)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> New Coupon
        </button>
      </div>

      {showCouponForm && (
        <div className="p-5 rounded-3xl bg-zinc-900 border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-bold text-white">Create Promo Code</h3>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-bold block mb-1">Code</label>
              <input
                value={newCoupon.code}
                onChange={e => setNewCoupon(p => ({ ...p, code: e.target.value }))}
                placeholder="e.g. VIP40"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white uppercase focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 font-bold block mb-1">Discount %</label>
              <input
                type="number"
                value={newCoupon.discountPercent}
                onChange={e => setNewCoupon(p => ({ ...p, discountPercent: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-blue-500"
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
            <div className="col-span-3">
              <label className="text-slate-400 font-bold block mb-1">Description</label>
              <input
                value={newCoupon.description}
                onChange={e => setNewCoupon(p => ({ ...p, description: e.target.value }))}
                placeholder="e.g. 40% off summer promo"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreateCoupon}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" /> Save Coupon
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

      <div className="space-y-3">
        {coupons.map(c => (
          <div key={c.code} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900 border border-white/[0.08]">
            <div className="flex items-center gap-4">
              <div className="px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30">
                <span className="font-mono font-black text-emerald-400 text-sm">{c.code}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">{c.discountPercent}% OFF</p>
                <p className="text-[11px] text-slate-400">{c.description}{c.minOrderAmount ? ` · Min order $${c.minOrderAmount}` : ''}</p>
              </div>
            </div>
            <button
              onClick={() => adminDeleteCoupon(c.code).then(() => showFeedback('success', `Coupon ${c.code} deleted.`))}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-red-950/60 text-red-400 transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
