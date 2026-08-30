'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, DEFAULT_CATEGORY_CONFIGS } from '@/context/AppContext';
import { ShoppingBag, Search, TrendingUp, Percent, ArrowUpDown, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { SubscriptionCategory } from '@/types';
import { Interactive3DCard } from '@/components/ui/Interactive3DCard';
import { ProductCardImageCarousel } from './ProductCardImageCarousel';

export const ProductCatalog: React.FC = () => {
  const {
    products,
    categoryConfigs,
    setSelectedProduct,
    addToCart,
    isSpecialOfferClaimed,
    activeSearchQuery,
    setActiveSearchQuery,
    formatPrice,
  } = useApp();

  const [sortBy, setSortBy] = useState<'popular' | 'price_low' | 'discount'>('popular');
  const [selectedPlanMap, setSelectedPlanMap] = useState<Record<string, number>>({});

  // Refs for each category horizontal scroll container
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollCategory = useCallback((catId: string, direction: 'left' | 'right') => {
    const el = scrollRefs.current[catId];
    if (el) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  const processedProducts = useMemo(() => {
    // 1. Filter out hidden products from storefront
    let list = products.filter(p => !p.isHidden);

    if (activeSearchQuery.trim()) {
      const q = activeSearchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price_low') {
      list.sort((a, b) => a.pricingTiers[0].price - b.pricingTiers[0].price);
    } else if (sortBy === 'discount') {
      list.sort((a, b) => {
        const maxA = Math.max(...a.pricingTiers.map((t) => t.discountPercentage));
        const maxB = Math.max(...b.pricingTiers.map((t) => t.discountPercentage));
        return maxB - maxA;
      });
    }

    return list;
  }, [products, activeSearchQuery, sortBy]);

  // Group products by active categories in custom sequence
  const categoryGroups = useMemo(() => {
    const list = (categoryConfigs && categoryConfigs.length > 0)
      ? categoryConfigs
      : DEFAULT_CATEGORY_CONFIGS;

    const activeCategories = [...list]
      .filter((c) => !c.isHidden)
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

    return activeCategories
      .map((meta) => {
        const catProducts = processedProducts.filter((p) => p.category === meta.id);
        // If viewing in default popular mode, respect in-category admin product sequence
        if (sortBy === 'popular') {
          catProducts.sort((a, b) => {
            // Netflix (Giveaway) is ALWAYS at the 1st position in Streaming
            if (meta.id === 'streaming') {
              const aIsGiveaway = a.name.toLowerCase().includes('giveaway') || a.id.includes('giveaway');
              const bIsGiveaway = b.name.toLowerCase().includes('giveaway') || b.id.includes('giveaway');
              if (aIsGiveaway && !bIsGiveaway) return -1;
              if (!aIsGiveaway && bIsGiveaway) return 1;
            }
            // Gemini Pro is ALWAYS at the 1st position in AI
            if (meta.id === 'ai') {
              if (a.id === 'gemini-advanced') return -1;
              if (b.id === 'gemini-advanced') return 1;
            }
            return (a.orderIndex ?? 999) - (b.orderIndex ?? 999);
          });
        }
        return {
          id: meta.id,
          meta,
          products: catProducts,
        };
      })
      .filter((group) => group.products.length > 0);
  }, [processedProducts, categoryConfigs, sortBy]);

  const handleSelectPlanIndex = useCallback((productId: string, planIndex: number) => {
    setSelectedPlanMap((prev) => ({ ...prev, [productId]: planIndex }));
  }, []);

  const sortOptions = [
    { id: 'popular', label: 'Popular', icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { id: 'discount', label: 'Best Deals', icon: <Percent className="h-3.5 w-3.5" /> },
    { id: 'price_low', label: 'Price', icon: <ArrowUpDown className="h-3.5 w-3.5" /> },
  ];

  return (
    <section id="catalog" className="space-y-12 pt-4">
      
      {/* 1. Master Toolbar: Section Title + Search & Sort with Scroll Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]"
      >
        {/* Title in Space Grotesk Font */}
        <div className="flex items-center gap-3">
          <h2
            className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Popular <span className="text-cyan-500 dark:text-cyan-400">Subscriptions</span>
          </h2>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/20">
            {processedProducts.length} Services
          </span>
        </div>

        {/* Right Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={activeSearchQuery}
              onChange={(e) => setActiveSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.code === 'Space') {
                  e.stopPropagation();
                }
              }}
              placeholder="Search subscriptions..."
              className="w-full sm:w-64 pl-10 pr-9 py-2.5 bg-white dark:bg-zinc-900/90 hover:bg-slate-50 dark:hover:bg-zinc-900 border border-slate-200 dark:border-white/10 focus:border-cyan-500 rounded-xl text-xs text-slate-900 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans shadow-sm"
            />
            {activeSearchQuery && (
              <button
                onClick={() => setActiveSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector with Smooth Spring Sliding Pill */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/10 shrink-0 relative">
            {sortOptions.map((opt) => {
              const active = sortBy === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id as any)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-200 flex items-center gap-1.5 z-10 ${
                    active ? 'text-slate-950 dark:text-zinc-950' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-zinc-200'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeSortPill"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                    />
                  )}
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </motion.div>

      {/* 2. Category-Wise Horizontal Scrollable Rows with 3D Tilt & Scroll Reveal */}
      <div className="space-y-14">
        {categoryGroups.length === 0 ? (
          <div className="py-16 text-center p-8 rounded-3xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 space-y-4 max-w-md mx-auto">
            <div className="h-14 w-14 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-cyan-500 dark:text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
              <Search className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No subscriptions found</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                We couldn&apos;t find any digital services matching &quot;<span className="text-cyan-600 dark:text-cyan-300 font-bold">{activeSearchQuery}</span>&quot;.
              </p>
            </div>
            <button
              onClick={() => setActiveSearchQuery('')}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:bg-slate-800 dark:hover:bg-zinc-100 transition-colors shadow-md cursor-pointer"
            >
              Clear Search Filter
            </button>
          </div>
        ) : (
          categoryGroups.map((group, groupIdx) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: groupIdx * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4 content-auto"
          >
            {/* Category Header */}
            <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-white/[0.06]">
              <div>
                <h3
                  className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {group.meta.label}
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 font-sans mt-0.5">
                  {group.meta.description}
                </p>
              </div>

              {/* Right Controls: Service Count + Navigation Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-900 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 hidden sm:inline-block">
                  {group.products.length} {group.products.length === 1 ? 'Service' : 'Services'}
                </span>

                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => scrollCategory(group.id, 'left')}
                  className="p-1.5 sm:p-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-colors shadow-sm"
                  aria-label="Scroll Left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => scrollCategory(group.id, 'right')}
                  className="p-1.5 sm:p-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-colors shadow-sm"
                  aria-label="Scroll Right"
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            {/* Horizontal Scrollable Product Cards Rail with Interactive 3D Cards */}
            <div
              ref={(el) => {
                scrollRefs.current[group.id] = el;
              }}
              style={{
                overscrollBehaviorY: 'auto',
                overscrollBehaviorX: 'contain',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-x pan-y',
              }}
              className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-3 px-1"
            >
              {group.products.map((product, productIdx) => {
                const currentPlanIndex = selectedPlanMap[product.id] || 0;
                const currentPlan = product.pricingTiers[currentPlanIndex] || product.pricingTiers[0];
                const isOutOfStock = (product.stockCount ?? 0) <= 0;

                return (
                  <Interactive3DCard
                    key={product.id}
                    index={productIdx}
                    maxTilt={16}
                    className="w-[280px] sm:w-[320px] shrink-0 snap-start"
                  >
                    <div
                      style={{ transformStyle: 'preserve-3d' }}
                      className="group relative rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] hover:border-cyan-500/40 overflow-hidden transition-all duration-200 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] shadow-sm dark:shadow-none flex flex-col justify-between h-full contain-card"
                    >
                      <div>
                        {/* Responsive Animated Image Carousel with Multiple Relevant Images & Dynamic Transitions */}
                        <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-zinc-950">
                          <ProductCardImageCarousel
                            images={product.images || [product.logo]}
                            productName={product.name}
                            index={productIdx}
                          />

                          {/* Top Badges with Enhanced 3D Elevation */}
                          <div
                            style={{ transform: 'translateZ(44px)' }}
                            className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 right-2.5 sm:right-3 flex items-center justify-between z-10 drop-shadow-md"
                          >
                            {product.productType === 'special' ? (
                              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 flex items-center gap-1 shadow-lg shadow-amber-500/30">
                                <Sparkles className="h-3 w-3 fill-zinc-950 animate-pulse" />
                                <span>{product.specialConfig?.campaignBadge || '⚡ Special Deal'}</span>
                              </span>
                            ) : (
                              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-zinc-300 border border-white/10 shadow-lg">
                                {product.category}
                              </span>
                            )}

                            {product.productType === 'special' && product.specialConfig?.tasks?.length ? (
                              <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/90 backdrop-blur-md text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-lg">
                                <Sparkles className="h-2.5 w-2.5 text-amber-400" />
                                <span>{product.specialConfig.tasks.length} Tasks</span>
                              </span>
                            ) : (
                              <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900/90 backdrop-blur-md text-cyan-400 border border-cyan-500/40 flex items-center gap-1 shadow-lg">
                                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                <span>Instant Delivery</span>
                              </span>
                            )}
                          </div>

                          {/* Product Title with 3D Pop */}
                          <div
                            style={{ transform: 'translateZ(36px)' }}
                            className="absolute bottom-2.5 sm:bottom-3 left-3 sm:left-3.5 right-3 sm:right-3.5 z-10"
                          >
                            <h4 className="text-sm sm:text-base font-bold tracking-wide text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] truncate">
                              {product.name}
                            </h4>
                          </div>
                        </div>

                        {/* Card Body - Duration Capsule Selector with Smooth Sliding Pill */}
                        <div
                          style={{ transform: 'translateZ(28px)' }}
                          className="p-3 sm:p-4"
                        >
                          <div className="p-1 rounded-xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-white/[0.06] grid grid-cols-4 gap-1 shadow-inner relative">
                            {product.pricingTiers.map((tier, idx) => {
                              const isSelected = idx === currentPlanIndex;
                              return (
                                <button
                                  key={tier.duration}
                                  type="button"
                                  onClick={() => handleSelectPlanIndex(product.id, idx)}
                                  className={`relative py-1.5 rounded-lg text-xs font-bold transition-colors duration-200 z-10 ${
                                    isSelected
                                      ? 'text-slate-950 dark:text-zinc-950 font-black'
                                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-zinc-200'
                                  }`}
                                >
                                  {isSelected && (
                                    <motion.div
                                      layoutId={`planPill-${product.id}`}
                                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                      className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                                    />
                                  )}
                                  {tier.label.replace(' Months', 'mo').replace(' Month', 'mo').replace(' (1 Year)', 'yr')}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Price & Actions with 3D Depth Layer */}
                      <div
                        style={{ transform: 'translateZ(38px)' }}
                        className="p-3 sm:p-4 pt-0"
                      >
                        <div className="flex items-baseline justify-between mb-3">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={currentPlan.price}
                              initial={{ opacity: 0, y: 3 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -3 }}
                              transition={{ duration: 0.15 }}
                              className="flex items-baseline gap-2"
                            >
                              <span className={`text-lg sm:text-xl font-black drop-shadow-sm ${currentPlan.price === 0 ? 'text-emerald-500 dark:text-emerald-400 font-[\'Hind_Siliguri\',sans-serif]' : 'text-slate-900 dark:text-white'}`}>
                                {currentPlan.price === 0 ? '৳০ (ফ্রি গিভঅ্যাওয়ে)' : formatPrice(currentPlan.price)}
                              </span>
                              {currentPlan.originalPrice && (
                                <span className="text-xs text-slate-400 dark:text-zinc-500 line-through">
                                  {formatPrice(currentPlan.originalPrice)}
                                </span>
                              )}
                            </motion.div>
                          </AnimatePresence>

                          {isOutOfStock ? (
                            <span className="text-[10px] sm:text-[11px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-500/30 px-2 py-0.5 rounded-lg shadow-sm">
                              OUT OF STOCK
                            </span>
                          ) : (product.id !== 'gemini-advanced' && (product.productType === 'special' || (product.specialConfig?.tasks && product.specialConfig.tasks.length > 0) || product.isFreeProduct)) ? (
                            <span className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-md flex items-center gap-1 border ${
                              isSpecialOfferClaimed(product.id)
                                ? 'bg-slate-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                                : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/40'
                            }`}>
                              <Sparkles className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                              {isSpecialOfferClaimed(product.id)
                                ? '✓ 1-TIME CLAIMED'
                                : product.isFreeProduct || product.specialConfig?.isFreeProduct
                                ? '100% FREE REWARD'
                                : 'SPECIAL DEAL'}
                            </span>
                          ) : (
                            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/30 px-2 py-0.5 rounded-lg shadow-sm">
                              Save {currentPlan.discountPercentage}%
                            </span>
                          )}
                        </div>

                        {(() => {
                          const isSpecial = product.id !== 'gemini-advanced' && (product.productType === 'special' || (product.specialConfig?.tasks && product.specialConfig.tasks.length > 0) || product.isFreeProduct);
                          const isFree = currentPlan.price === 0 || (isSpecial && (product.isFreeProduct || product.specialConfig?.isFreeProduct));
                          const isClaimed = isSpecial && isSpecialOfferClaimed(product.id);

                          return (
                            <div className="grid grid-cols-2 gap-2" style={{ transform: 'translateZ(15px)' }}>
                              <motion.button
                                whileHover={{ scale: 1.03, z: 20 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => setSelectedProduct(product)}
                                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 text-slate-700 hover:text-slate-950 dark:text-zinc-300 dark:hover:text-white text-xs font-semibold transition-colors border border-slate-200 dark:border-white/[0.06] shadow-sm cursor-pointer"
                              >
                                View Details
                              </motion.button>

                              <motion.button
                                whileHover={(isOutOfStock || isClaimed) ? {} : { scale: 1.03, z: 20 }}
                                whileTap={(isOutOfStock || isClaimed) ? {} : { scale: 0.96 }}
                                disabled={isOutOfStock || isClaimed}
                                onClick={() => {
                                  if (isOutOfStock || isClaimed) return;
                                  if (isSpecial) {
                                    // Open modal directly so user sees and fulfills special tasks
                                    setSelectedProduct(product);
                                  } else {
                                    addToCart(product, currentPlan);
                                  }
                                }}
                                className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                  isOutOfStock
                                    ? 'bg-zinc-800/90 text-zinc-500 cursor-not-allowed border border-white/5 opacity-70'
                                    : isClaimed
                                    ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed border border-white/10 opacity-70'
                                    : isFree
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black shadow-lg shadow-emerald-500/20'
                                    : isSpecial
                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black shadow-lg shadow-amber-500/20'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                                }`}
                              >
                                {isSpecial ? (
                                  <Sparkles className="h-3.5 w-3.5 fill-current" />
                                ) : (
                                  <ShoppingBag className="h-3.5 w-3.5" />
                                )}
                                <span>
                                  {isOutOfStock
                                    ? 'SOLD OUT'
                                    : isClaimed
                                    ? 'CLAIMED'
                                    : isFree
                                    ? 'CLAIM FREE'
                                    : isSpecial
                                    ? 'UNLOCK DEAL'
                                    : 'BUY NOW'}
                                </span>
                              </motion.button>
                            </div>
                          );
                        })()}
                      </div>

                    </div>
                  </Interactive3DCard>
                );
              })}
            </div>

          </motion.div>
        )))}
      </div>

    </section>
  );
};
