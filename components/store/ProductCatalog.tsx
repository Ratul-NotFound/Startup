'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { ShoppingBag, Search, TrendingUp, Percent, ArrowUpDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { SubscriptionCategory } from '@/types';
import { Interactive3DCard } from '@/components/ui/Interactive3DCard';

export const ProductCatalog: React.FC = () => {
  const {
    products,
    setSelectedProduct,
    addToCart,
    activeSearchQuery,
    setActiveSearchQuery,
  } = useApp();

  const [sortBy, setSortBy] = useState<'popular' | 'price_low' | 'discount'>('popular');
  const [selectedPlanMap, setSelectedPlanMap] = useState<Record<string, number>>({});

  // Refs for each category horizontal scroll container
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollCategory = (catId: string, direction: 'left' | 'right') => {
    const el = scrollRefs.current[catId];
    if (el) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const categoryMetadata: {
    id: SubscriptionCategory;
    label: string;
    description: string;
  }[] = [
    {
      id: 'ai',
      label: 'AI & Productivity',
      description: 'Top AI models, coding assistants & intelligent tools',
    },
    {
      id: 'streaming',
      label: 'Movies & Music Streaming',
      description: '4K Ultra HD video, movies, music & ad-free entertainment',
    },
    {
      id: 'dev',
      label: 'Developer Tools',
      description: 'AI code editors, coding workspaces & fast requests',
    },
    {
      id: 'productivity',
      label: 'Design & Creative Apps',
      description: 'Full creative suites for graphic design, photo & video editing',
    },
    {
      id: 'vpn_security',
      label: 'VPN & Online Security',
      description: 'Fast encrypted connections & privacy protection',
    },
  ];

  // Filter and sort products
  const processedProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (activeSearchQuery.trim()) {
          const query = activeSearchQuery.toLowerCase();
          return p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.reviewCount - a.reviewCount;
        if (sortBy === 'price_low') return a.pricingTiers[0].price - b.pricingTiers[0].price;
        if (sortBy === 'discount') return b.pricingTiers[0].discountPercentage - a.pricingTiers[0].discountPercentage;
        return 0;
      });
  }, [products, activeSearchQuery, sortBy]);

  // Group products by category
  const categoryGroups = useMemo(() => {
    return categoryMetadata
      .map((meta) => {
        const catProducts = processedProducts.filter((p) => p.category === meta.id);
        return {
          id: meta.id,
          meta,
          products: catProducts,
        };
      })
      .filter((group) => group.products.length > 0);
  }, [processedProducts, categoryMetadata]);

  const handleSelectPlanIndex = (productId: string, planIndex: number) => {
    setSelectedPlanMap((prev) => ({ ...prev, [productId]: planIndex }));
  };

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
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]"
      >
        {/* Title in Space Grotesk Font */}
        <div className="flex items-center gap-3">
          <h2
            className="text-2xl sm:text-3xl font-black tracking-tight text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Popular <span className="text-cyan-400">Subscriptions</span>
          </h2>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/20">
            {processedProducts.length} Services
          </span>
        </div>

        {/* Right Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={activeSearchQuery}
              onChange={(e) => setActiveSearchQuery(e.target.value)}
              placeholder="Search subscriptions..."
              className="w-full sm:w-64 pl-10 pr-9 py-2.5 bg-zinc-900/90 hover:bg-zinc-900 border border-white/10 focus:border-cyan-500/50 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans shadow-sm"
            />
            {activeSearchQuery && (
              <button
                onClick={() => setActiveSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="inline-flex items-center p-1 rounded-xl bg-zinc-900/90 border border-white/10 shrink-0">
            {sortOptions.map((opt) => {
              const active = sortBy === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-white text-zinc-950 shadow-md font-bold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                >
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
        {categoryGroups.map((group, groupIdx) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: groupIdx * 0.1, ease: 'easeOut' }}
            className="space-y-4"
          >
            {/* Category Header */}
            <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
              <div>
                <h3
                  className="text-xl sm:text-2xl font-bold tracking-tight text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {group.meta.label}
                </h3>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">
                  {group.meta.description}
                </p>
              </div>

              {/* Right Controls: Service Count + Navigation Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-white/10 hidden sm:inline-block">
                  {group.products.length} {group.products.length === 1 ? 'Service' : 'Services'}
                </span>

                <button
                  onClick={() => scrollCategory(group.id, 'left')}
                  className="p-1.5 sm:p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition-colors"
                  aria-label="Scroll Left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => scrollCategory(group.id, 'right')}
                  className="p-1.5 sm:p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition-colors"
                  aria-label="Scroll Right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Product Cards Rail with Interactive 3D Cards */}
            <div
              ref={(el) => {
                scrollRefs.current[group.id] = el;
              }}
              className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-3 px-1 snap-x snap-mandatory scroll-smooth"
            >
              {group.products.map((product) => {
                const currentPlanIndex = selectedPlanMap[product.id] || 0;
                const currentPlan = product.pricingTiers[currentPlanIndex] || product.pricingTiers[0];

                return (
                  <Interactive3DCard
                    key={product.id}
                    maxTilt={7}
                    className="w-[280px] sm:w-[320px] shrink-0 snap-start"
                  >
                    <div className="group relative rounded-2xl sm:rounded-3xl bg-zinc-900/70 hover:bg-zinc-900/90 border border-white/[0.06] hover:border-cyan-500/40 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col justify-between h-full">
                      
                      <div>
                        {/* Responsive Cover Banner */}
                        <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-zinc-950">
                          <img
                            src={product.logo}
                            alt={product.name}
                            className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-black/60" />

                          {/* Top Badges */}
                          <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 right-2.5 sm:right-3 flex items-center justify-between z-10">
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10">
                              {product.category}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Instant Delivery</span>
                            </span>
                          </div>

                          {/* Product Title */}
                          <div className="absolute bottom-2.5 sm:bottom-3 left-3 sm:left-3.5 right-3 sm:right-3.5 z-10">
                            <h4 className="text-sm sm:text-base font-bold tracking-wide text-white drop-shadow-md truncate">
                              {product.name}
                            </h4>
                          </div>
                        </div>

                        {/* Card Body - Duration Capsule Selector */}
                        <div className="p-3 sm:p-4">
                          <div className="p-1 rounded-xl bg-zinc-950/80 border border-white/[0.06] grid grid-cols-4 gap-1 shadow-inner">
                            {product.pricingTiers.map((tier, idx) => {
                              const isSelected = idx === currentPlanIndex;
                              return (
                                <button
                                  key={tier.duration}
                                  type="button"
                                  onClick={() => handleSelectPlanIndex(product.id, idx)}
                                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    isSelected
                                      ? 'bg-white text-zinc-950 shadow-md font-bold scale-100'
                                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                                  }`}
                                >
                                  {tier.label.replace(' Months', 'mo').replace(' Month', 'mo').replace(' (1 Year)', 'yr')}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Price & Actions */}
                      <div className="p-3 sm:p-4 pt-0">
                        <div className="flex items-baseline justify-between mb-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg sm:text-xl font-black text-white">
                              ${currentPlan.price.toFixed(2)}
                            </span>
                            <span className="text-xs text-zinc-500 line-through">
                              ${currentPlan.originalPrice.toFixed(2)}
                            </span>
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-lg shadow-sm">
                            Save {currentPlan.discountPercentage}%
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="w-full py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-colors border border-white/[0.06]"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => addToCart(product, currentPlan)}
                            className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase transition-all shadow-[0_0_12px_rgba(37,99,235,0.3)] hover:scale-102 flex items-center justify-center gap-1.5"
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            <span>Buy Now</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </Interactive3DCard>
                );
              })}
            </div>

          </motion.div>
        ))}
      </div>

    </section>
  );
};
