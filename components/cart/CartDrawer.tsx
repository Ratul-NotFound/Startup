'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  Sparkles,
  Zap,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartItemQuantity,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    cartSubtotal,
    cartDiscount,
    cartTotal,
    setIsCheckoutOpen,
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
    if (res.success) setCouponInput('');
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-obsidian-900 border-l border-white/10 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Your Subscription Cart</h3>
                <p className="text-xs text-slate-400">{cart.length} item(s) pending dispatch</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <ShoppingBag className="h-12 w-12 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">Your cart is empty</p>
                <p className="text-xs text-slate-500">Pick a subscription plan to get instant access.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedPlan.duration}`}
                  className="p-4 rounded-2xl bg-obsidian-850 border border-white/[0.06] space-y-3 relative group"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={item.product.logo}
                      alt={item.product.name}
                      className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{item.product.name}</h4>
                      <p className="text-xs text-brand-300 font-semibold">{item.selectedPlan.label}</p>
                      <p className="text-[11px] text-emerald-400 mt-0.5">
                        <span className="font-bold">${item.selectedPlan.price.toFixed(2)}</span>{' '}
                        <span className="text-slate-500 line-through">${item.selectedPlan.originalPrice.toFixed(2)}</span>
                      </p>
                      {item.customEmail && (
                        <p className="text-[10px] text-slate-400 font-mono mt-1 truncate">
                          Target: {item.customEmail}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id, item.selectedPlan.duration)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Quantity and Line Total */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                    <div className="flex items-center gap-2 bg-obsidian-950 px-2 py-1 rounded-lg border border-white/[0.06]">
                      <button
                        onClick={() =>
                          updateCartItemQuantity(item.product.id, item.selectedPlan.duration, item.quantity - 1)
                        }
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold text-white px-1.5">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateCartItemQuantity(item.product.id, item.selectedPlan.duration, item.quantity + 1)
                        }
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <span className="text-sm font-black text-white">
                      ${(item.selectedPlan.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-white/[0.08] bg-obsidian-950 space-y-4">
              {/* Promo Code Input */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs">
                    <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                      <Tag className="h-3.5 w-3.5" />
                      <span>Code <strong>{appliedCoupon.code}</strong> applied (-{appliedCoupon.discountPercent}%)</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Promo Code (e.g. NEXUS20)"
                      className="flex-1 px-3 py-2 rounded-xl bg-obsidian-850 border border-white/[0.1] text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-xs font-bold text-slate-200 border border-white/[0.1] transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponFeedback && (
                  <p
                    className={`text-[11px] mt-1.5 ${
                      couponFeedback.success ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {couponFeedback.message}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Discount ({appliedCoupon.discountPercent}%)</span>
                    <span>-${cartDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-white/[0.06]">
                  <span>Total Amount</span>
                  <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-400">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-glow transition-all flex items-center justify-center gap-2"
              >
                <Zap className="h-4 w-4" />
                <span>Instant Bot Checkout (${cartTotal.toFixed(2)})</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Instant dispatch with 100% replacement warranty</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
