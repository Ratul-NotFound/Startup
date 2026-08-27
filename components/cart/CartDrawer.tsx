'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
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
  LogIn,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

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
    firebaseUser,
    setIsAuthModalOpen,
    formatPrice,
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleBrowseCatalog = () => {
    setIsCartOpen(false);
    if (pathname === '/') {
      const el = document.getElementById('catalog');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 600, behavior: 'smooth' });
      }
    } else {
      router.push('/#catalog');
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
    if (res.success) setCouponInput('');
  };

  const handleProceedToCheckout = () => {
    if (!firebaseUser) {
      setIsCartOpen(false);
      setIsAuthModalOpen(true);
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop with Progressive Blur */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/75"
          />

          <div
            style={{ perspective: 1200 }}
            className="fixed inset-y-0 right-0 max-w-full flex pl-10"
          >
            {/* 3D Perspective Slide-In Drawer */}
            <motion.div
              initial={{ x: '100%', rotateY: -15, opacity: 0 }}
              animate={{ x: 0, rotateY: 0, opacity: 1 }}
              exit={{ x: '100%', rotateY: 10, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.85 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="w-screen max-w-md bg-zinc-900/95 border-l border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col justify-between backdrop-blur-2xl"
            >
              
              {/* Header */}
              <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Your Cart</h3>
                    <p className="text-xs text-zinc-400">{cart.length} item{cart.length !== 1 ? 's' : ''} in cart</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-20 space-y-3">
                    <ShoppingBag className="h-12 w-12 text-zinc-600 mx-auto" />
                    <p className="text-sm font-semibold text-zinc-300">Your cart is empty</p>
                    <p className="text-xs text-zinc-500">Pick a subscription plan to get instant access.</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleBrowseCatalog}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer"
                    >
                      Browse Catalog
                    </motion.button>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <motion.div
                      key={`${item.product.id}-${item.selectedPlan.duration}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                      className="p-4 rounded-2xl bg-zinc-950/70 border border-white/[0.06] space-y-3 relative group hover:border-cyan-500/30 transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <img
                          src={item.product.logo}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{item.product.name}</h4>
                          <p className="text-xs text-cyan-300 font-semibold">{item.selectedPlan.label}</p>
                          <p className="text-[11px] text-emerald-400 mt-0.5">
                            <span className="font-bold">{formatPrice(item.selectedPlan.price)}</span>{' '}
                            <span className="text-zinc-500 line-through">{formatPrice(item.selectedPlan.originalPrice)}</span>
                          </p>
                          {(item.product.stockCount ?? 0) <= 0 && (
                            <span className="inline-block mt-1 text-[10px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/30">
                              ⚠️ Out of Stock - Please remove
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedPlan.duration)}
                          className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Quantity & Item Subtotal */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-xs">
                        <div className="flex items-center gap-2 bg-zinc-900 px-2 py-1 rounded-lg border border-white/5">
                          <button
                            onClick={() =>
                              updateCartItemQuantity(
                                item.product.id,
                                item.selectedPlan.duration,
                                item.quantity - 1
                              )
                            }
                            className="text-zinc-400 hover:text-white p-0.5"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold text-white px-1.5">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateCartItemQuantity(
                                item.product.id,
                                item.selectedPlan.duration,
                                item.quantity + 1
                              )
                            }
                            className="text-zinc-400 hover:text-white p-0.5"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-bold text-white">
                          {formatPrice(item.selectedPlan.price * item.quantity)}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-white/[0.08] bg-zinc-950/80 space-y-4">
                  
                  {/* Promo Code Input */}
                  <div>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-xs">
                        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                          <Tag className="h-3.5 w-3.5" />
                          <span>
                            {appliedCoupon.code} applied ({appliedCoupon.discountPercent}% off
                            {appliedCoupon.applicableCategory && appliedCoupon.applicableCategory !== 'all'
                              ? ` for ${appliedCoupon.applicableCategory.toUpperCase()}`
                              : appliedCoupon.applicableProductIds && appliedCoupon.applicableProductIds.length > 0
                              ? ' for select products'
                              : ''}
                            )
                          </span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-zinc-400 hover:text-rose-400 text-[11px] font-bold underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Promo code (e.g. VIP20)"
                          className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 uppercase"
                        />
                        <button
                          type="submit"
                          className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors"
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
                  <div className="space-y-1.5 text-xs text-zinc-300">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(cartSubtotal)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-400 font-medium">
                        <span>Discount ({appliedCoupon.discountPercent}%)</span>
                        <span>-{formatPrice(cartDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-white/[0.06]">
                      <span>Total Amount</span>
                      <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  {(() => {
                    const hasOutOfStock = cart.some(i => (i.product.stockCount ?? 0) <= 0);
                    return (
                      <motion.button
                        whileHover={hasOutOfStock ? {} : { scale: 1.02 }}
                        whileTap={hasOutOfStock ? {} : { scale: 0.98 }}
                        disabled={hasOutOfStock}
                        onClick={handleProceedToCheckout}
                        className={`w-full py-3.5 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
                          hasOutOfStock
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/10 opacity-70'
                            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                        }`}
                      >
                        {hasOutOfStock ? (
                          <span>Remove Out-of-Stock Items to Checkout</span>
                        ) : firebaseUser ? (
                          <>
                            <ArrowRight className="h-4 w-4" />
                            <span>Proceed to Checkout ({formatPrice(cartTotal)})</span>
                          </>
                        ) : (
                          <>
                            <LogIn className="h-4 w-4" />
                            <span>Sign In to Checkout</span>
                          </>
                        )}
                      </motion.button>
                    );
                  })()}

                  <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Instant delivery · 100% replacement warranty</span>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
