'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { ShoppingBag, Search, TrendingUp, Percent, ArrowUpDown, X } from 'lucide-react';
import { SubscriptionCategory } from '@/types';

export const ProductCatalog: React.FC = () => {
  const {
    products,
    setSelectedProduct,
    addToCart,
    activeCategoryFilter,
    setActiveCategoryFilter,
    activeSearchQuery,
    setActiveSearchQuery,
  } = useApp();

  const [sortBy, setSortBy] = useState<'popular' | 'price_low' | 'discount'>('popular');
  const [selectedPlanMap, setSelectedPlanMap] = useState<Record<string, number>>({});

  const categories: {
    id: SubscriptionCategory;
    label: string;
    count: number;
  }[] = [
    {
      id: 'all',
      label: 'All Vaults',
      count: products.length,
    },
    {
      id: 'ai',
      label: 'AI & Models',
      count: products.filter((p) => p.category === 'ai').length,
    },
    {
      id: 'streaming',
      label: 'Cinema 4K',
      count: products.filter((p) => p.category === 'streaming').length,
    },
    {
      id: 'dev',
      label: 'Developer',
      count: products.filter((p) => p.category === 'dev').length,
    },
    {
      id: 'productivity',
      label: 'Design & Pro',
      count: products.filter((p) => p.category === 'productivity').length,
    },
    {
      id: 'vpn_security',
      label: 'VPN Privacy',
      count: products.filter((p) => p.category === 'vpn_security').length,
    },
  ];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (activeCategoryFilter !== 'all' && p.category !== activeCategoryFilter) {
          return false;
        }
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
  }, [products, activeCategoryFilter, activeSearchQuery, sortBy]);

  const handleSelectPlanIndex = (productId: string, planIndex: number) => {
    setSelectedPlanMap((prev) => ({ ...prev, [productId]: planIndex }));
  };

  const sortOptions = [
    { id: 'popular', label: 'Popular', icon: <TrendingUp className="h-3 w-3" /> },
    { id: 'discount', label: 'Highest Discount', icon: <Percent className="h-3 w-3" /> },
    { id: 'price_low', label: 'Lowest Price', icon: <ArrowUpDown className="h-3 w-3" /> },
  ];

  return (
    <section id="catalog" className="space-y-6">
      
      {/* 1. Seamless Glassmorphic Category Capsule Dock */}
      <div className="flex justify-center pb-2">
        <div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-zinc-900/70 backdrop-blur-xl shadow-2xl overflow-x-auto max-w-full scrollbar-none">
          {categories.map((cat) => {
            const active = activeCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center gap-2 shrink-0 ${
                  active
                    ? 'bg-white text-zinc-950 shadow-lg scale-100 font-black'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    active ? 'bg-zinc-200 text-zinc-900 font-bold' : 'text-zinc-500 bg-white/5'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Clean Streamlined Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        
        {/* Left: Dynamic Title & Active Counter */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase font-mono">
            Subscription <span className="text-cyan-400">Vault</span>
          </h2>
          <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/20">
            {filteredProducts.length} ACTIVE
          </span>
        </div>

        {/* Right: Glassmorphic Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Glass Search Pill */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={activeSearchQuery}
              onChange={(e) => setActiveSearchQuery(e.target.value)}
              placeholder="Search subscriptions..."
              className="w-48 sm:w-56 pl-9 pr-8 py-1.5 bg-zinc-900/80 hover:bg-zinc-900 rounded-full text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition-all font-mono"
            />
            {activeSearchQuery && (
              <button
                onClick={() => setActiveSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Custom Segmented Sort Buttons */}
          <div className="inline-flex items-center p-1 rounded-full bg-zinc-900/80 backdrop-blur-md">
            {sortOptions.map((opt) => {
              const active = sortBy === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id as any)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-white text-zinc-950 shadow-md font-bold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span className="hidden sm:inline">{opt.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* 3. Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {filteredProducts.map((product) => {
          const currentPlanIndex = selectedPlanMap[product.id] || 0;
          const currentPlan = product.pricingTiers[currentPlanIndex] || product.pricingTiers[0];

          return (
            <div
              key={product.id}
              className="group relative rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-white/[0.06] hover:border-cyan-500/40 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.8)] hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Widescreen Cover Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
                  <img
                    src={product.logo}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-black/60" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10 font-mono">
                      {product.category}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {product.deliveryTimeEstimate}
                    </span>
                  </div>

                  {/* Product Title */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 z-10">
                    <h3 className="text-base font-black tracking-wide text-white drop-shadow-md">
                      {product.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body - Clean Duration Tabs */}
                <div className="p-4">
                  <div className="p-1 rounded-xl bg-zinc-950 border border-white/[0.06] grid grid-cols-4 gap-1">
                    {product.pricingTiers.map((tier, idx) => {
                      const isSelected = idx === currentPlanIndex;
                      return (
                        <button
                          key={tier.duration}
                          type="button"
                          onClick={() => handleSelectPlanIndex(product.id, idx)}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all font-mono ${
                            isSelected
                              ? 'bg-white text-zinc-950 shadow-md font-black'
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

              {/* Card Footer: Clean Price & Action Buttons */}
              <div className="p-4 pt-0">
                <div className="flex items-baseline justify-between mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-white font-mono">
                      ${currentPlan.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-500 line-through font-mono">
                      ${currentPlan.originalPrice.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-lg font-mono">
                    Save {currentPlan.discountPercentage}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="w-full py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-colors"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => addToCart(product, currentPlan)}
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:scale-102"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
};
