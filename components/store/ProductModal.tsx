'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { X, ShoppingBag, Zap, ShieldCheck, Star, CheckCircle2, Share2, Link2 } from 'lucide-react';

export const ProductModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart, setIsCartOpen } = useApp();
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(0);
  const [customEmail, setCustomEmail] = useState('');
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/?product=${selectedProduct?.id}` : '';
    const shareData = {
      title: selectedProduct?.name ?? '',
      text: `${selectedProduct?.tagline ?? selectedProduct?.description ?? ''} — from SubNexus`,
      url,
    };
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share(shareData); } catch (_) {}
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      const popIdx = selectedProduct.pricingTiers.findIndex(t => t.isPopular);
      setSelectedPlanIndex(popIdx !== -1 ? popIdx : 0);
      setCustomEmail('');
      setAdded(false);
    }
  }, [selectedProduct]);

  const currentPlan = selectedProduct
    ? selectedProduct.pricingTiers[selectedPlanIndex] ?? selectedProduct.pricingTiers[0]
    : null;

  const handleAddToCart = () => {
    if (!selectedProduct || !currentPlan) return;
    addToCart(selectedProduct, currentPlan, customEmail || undefined);
    setAdded(true);
    setTimeout(() => {
      setSelectedProduct(null);
      setIsCartOpen(true);
    }, 500);
  };

  const heroImage = selectedProduct?.images?.[0] ?? selectedProduct?.logo;

  return (
    <AnimatePresence>
      {selectedProduct && currentPlan && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedProduct(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            layoutId={`product-card-container-${selectedProduct.id}`}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', damping: 30, stiffness: 380 }}
            className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl z-10 overflow-hidden"
          >
            {/* Hero Image */}
            <div className="relative h-44 w-full bg-zinc-950 overflow-hidden">
              {heroImage && (
                <img
                  src={heroImage}
                  alt={selectedProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-80"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />

              {/* Actions: Share + Close */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShare}
                  title="Share this product"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/50 text-white border border-white/10 backdrop-blur-md text-[11px] font-semibold"
                >
                  {copied ? (
                    <><Link2 className="h-3.5 w-3.5 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
                  ) : (
                    <><Share2 className="h-3.5 w-3.5" /><span>Share</span></>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedProduct(null)}
                  className="p-1.5 rounded-full bg-black/50 text-white border border-white/10 backdrop-blur-md"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Product Identity */}
              <div className="absolute bottom-4 left-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl overflow-hidden border border-white/15 bg-zinc-800 shrink-0">
                  <img
                    src={selectedProduct.logo}
                    alt={selectedProduct.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white leading-tight">{selectedProduct.name}</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-[11px] text-zinc-300">{selectedProduct.rating.toFixed(1)}</span>
                    <span className="text-zinc-600 text-[11px]">·</span>
                    <span className="text-[11px] text-zinc-400">{selectedProduct.reviewCount.toLocaleString()} reviews</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">

              {/* Description */}
              <p className="text-xs text-zinc-400 leading-relaxed">{selectedProduct.tagline || selectedProduct.description}</p>

              {/* Key perks — top 3 features */}
              <div className="space-y-1.5">
                {selectedProduct.features.slice(0, 3).map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              {/* Plan Selector */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Duration</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {selectedProduct.pricingTiers.map((tier, idx) => {
                    const active = idx === selectedPlanIndex;
                    return (
                      <button
                        key={tier.duration}
                        type="button"
                        onClick={() => setSelectedPlanIndex(idx)}
                        className={`relative py-2.5 rounded-xl text-center text-xs transition-all ${
                          active
                            ? 'bg-white text-zinc-950 font-bold shadow-sm'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        {tier.isPopular && !active && (
                          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[7px] font-black uppercase bg-cyan-500 text-white px-1 rounded">
                            Best
                          </span>
                        )}
                        <div className="font-bold text-[11px]">
                          {tier.label.replace(' Months', 'mo').replace(' Month', 'mo').replace(' (1 Year)', 'yr')}
                        </div>
                        <div className={`text-[10px] mt-0.5 ${active ? 'text-zinc-600' : 'text-zinc-500'}`}>
                          ${tier.price.toFixed(2)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery & Warranty */}
              <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-zinc-800/60 border border-white/[0.06]">
                  <Zap className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Delivery</div>
                    <div className="text-xs font-semibold text-white">{selectedProduct.deliveryTimeEstimate}</div>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-zinc-800/60 border border-white/[0.06]">
                  <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Warranty</div>
                    <div className="text-xs font-semibold text-white">Full Period</div>
                  </div>
                </div>
              </div>

              {/* Custom Email */}
              {(selectedProduct.accountType === 'direct_upgrade' || selectedProduct.deliveryType === 'custom_email') && (
                <input
                  type="email"
                  value={customEmail}
                  onChange={e => setCustomEmail(e.target.value)}
                  placeholder="Your email (optional for invite)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
                />
              )}

              {/* CTA Row */}
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.07]">
                <div>
                  <div className="text-[10px] text-zinc-500 font-medium">Total</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">${currentPlan.price.toFixed(2)}</span>
                    {currentPlan.discountPercentage && (
                      <span className="text-[10px] text-emerald-400 font-bold">-{currentPlan.discountPercentage}%</span>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white text-zinc-950 font-bold text-xs tracking-wide transition-all shadow-sm hover:bg-zinc-100"
                >
                  {added ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Added!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      Add to Cart
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
