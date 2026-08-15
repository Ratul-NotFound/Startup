'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import {
  X,
  ShoppingBag,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const ProductModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart } = useApp();
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(0);
  const [customEmail, setCustomEmail] = useState('');

  const currentPlan = selectedProduct
    ? selectedProduct.pricingTiers[selectedPlanIndex] || selectedProduct.pricingTiers[0]
    : null;

  const handleAddToCart = () => {
    if (!selectedProduct || !currentPlan) return;
    addToCart(selectedProduct, currentPlan, customEmail ? customEmail : undefined);
    setSelectedProduct(null);
  };

  return (
    <AnimatePresence>
      {selectedProduct && currentPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Cinema Backdrop with Smooth Progressive Blur */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={() => setSelectedProduct(null)}
            className="fixed inset-0 bg-black/85"
          />

          {/* 3D Holographic Unfold Modal Card */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.55,
              y: 90,
              rotateX: 45,
              rotateY: -18,
              filter: 'blur(14px)',
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              rotateX: 0,
              rotateY: 0,
              filter: 'blur(0px)',
            }}
            exit={{
              opacity: 0,
              scale: 0.65,
              y: 60,
              rotateX: -30,
              rotateY: 15,
              filter: 'blur(10px)',
            }}
            transition={{
              type: 'spring',
              damping: 22,
              stiffness: 280,
              mass: 0.8,
            }}
            style={{ transformStyle: 'preserve-3d', perspective: 1400 }}
            className="relative w-full max-w-lg rounded-3xl bg-zinc-900/95 border border-cyan-500/30 p-6 sm:p-7 shadow-[0_30px_90px_rgba(0,0,0,0.95)] space-y-6 my-6 z-10 backdrop-blur-2xl overflow-hidden"
          >
            {/* Ambient Background Aura Lights */}
            <div className="absolute -top-12 -right-12 w-56 h-56 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
            <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-blue-600/20 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Close Button with Micro Elastic Rotation */}
            <motion.button
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors border border-white/5 shadow-sm z-20"
            >
              <X className="h-4 w-4" />
            </motion.button>

            {/* 1. Header with Product Imagery & Staggered Slide */}
            <motion.div
              initial={{ opacity: 0, x: -25, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-4 pr-8"
            >
              <div className="relative h-14 w-14 rounded-2xl overflow-hidden border border-white/10 shrink-0 bg-zinc-950 shadow-inner group">
                <img
                  src={selectedProduct.logo}
                  alt={selectedProduct.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black tracking-tight text-white">{selectedProduct.name}</h2>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-sm">
                    {selectedProduct.category}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-snug">{selectedProduct.tagline || selectedProduct.description}</p>
              </div>
            </motion.div>

            {/* 2. Duration Selector with Elastic Sliding Pill */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2"
            >
              <label className="text-xs font-bold text-zinc-300 block">Select Plan Duration</label>
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-zinc-950/80 border border-white/[0.06] shadow-inner relative">
                {selectedProduct.pricingTiers.map((tier, idx) => {
                  const active = idx === selectedPlanIndex;
                  return (
                    <button
                      key={tier.duration}
                      type="button"
                      onClick={() => setSelectedPlanIndex(idx)}
                      className={`relative py-2 px-1 rounded-xl text-center transition-colors duration-200 z-10 ${
                        active ? 'text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="modalPlanIndicator"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          className="absolute inset-0 bg-white rounded-xl shadow-md -z-10"
                        />
                      )}
                      <p className="text-[11px] font-bold">
                        {tier.label.replace(' Months', 'mo').replace(' Month', 'mo').replace(' (1 Year)', 'yr')}
                      </p>
                      <p className={`text-xs font-black mt-0.5 ${active ? 'text-zinc-950' : 'text-white'}`}>
                        ${tier.price.toFixed(2)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Custom Email if direct upgrade */}
            {(selectedProduct.accountType === 'direct_upgrade' || selectedProduct.deliveryType === 'custom_email') && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="space-y-1.5"
              >
                <label className="text-xs font-bold text-zinc-300 block">
                  Personal Email (Optional for direct invite)
                </label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-colors shadow-inner"
                />
              </motion.div>
            )}

            {/* 3. Key Specifications Bar */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-zinc-950/60 border border-white/[0.06] text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Delivery</span>
                  <span className="font-bold text-emerald-400">{selectedProduct.deliveryTimeEstimate}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Warranty</span>
                  <span className="font-bold text-zinc-200">{selectedProduct.specs.warranty}</span>
                </div>
              </div>
            </motion.div>

            {/* 4. Actions & Total Price */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-between pt-2 border-t border-white/[0.06]"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Total Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">${currentPlan.price.toFixed(2)}</span>
                  {currentPlan.discountPercentage && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                      Save {currentPlan.discountPercentage}%
                    </span>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(37,99,235,0.45)]"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add to Cart</span>
              </motion.button>
            </motion.div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
