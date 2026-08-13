'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { ShoppingBag, Search, TrendingUp, Percent, ArrowUpDown, X, Sparkles, Shield, Zap } from 'lucide-react';
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
      label: 'AI & Intelligence',
      count: products.filter((p) => p.category === 'ai').length,
    },
    {
      id: 'streaming',
      label: 'Cinema & 4K TV',
      count: products.filter((p) => p.category === 'streaming').length,
    },
    {
      id: 'dev',
      label: 'Developer Tools',
      count: products.filter((p) => p.category === 'dev').length,
    },
    {
      id: 'productivity',
      label: 'Design & Pro',
      count: products.filter((p) => p.category === 'productivity').length,
    },
    {
      id: 'vpn_security',
      label: 'VPN & Privacy',
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
    { id: 'discount', label: 'Discount', icon: <Percent className="h-3 w-3" /> },
    { id: 'price_low', label: 'Price', icon: <ArrowUpDown className="h-3 w-3" /> },
  ];

  return (
    <section id="catalog" className="space-y-8">
      
      {/* 1. Master Section Header (Linear / Whop Style) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        
        {/* Left: Professional Section Headline */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
              Official Wholesale Vault
            </span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
            Explore Subscriptions <span className="text-zinc-500 text-lg font-normal font-sans">({filteredProducts.length} plans)</span>
          </h2>
        </div>

        {/* Right: Search & Sort Toolbar */}
        <div className="flex items-center gap-3">
          
          {/* Glass Search Pill */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={activeSearchQuery}
              onChange={(e) => setActiveSearchQuery(e.target.value)}
              placeholder="Search plans..."
              className="w-48 sm:w-56 pl-9 pr-8 py-2 bg-zinc-900/80 hover:bg-zinc-900 rounded-full text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition-all font-mono shadow-sm"
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

          {/* Segmented Sort Toggle */}
          <div className="inline-flex items-center p-1 rounded-full bg-zinc-900/80 backdrop-blur-md shadow-sm">
            {sortOptions.map((opt) => {
              const active = sortBy === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id as any)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
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

      {/* 2. Seamless Category Navigation Capsule Strip */}
      <div className="overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-zinc-900/60 backdrop-blur-xl">
          {categories.map((cat) => {
            const active = activeCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center gap-2 shrink-0 ${
                  active
                    ? 'bg-white text-zinc-950 shadow-md scale-100 font-black'
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

      {/* 3. High-Conversion Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
        {filteredProducts.map((product) => {
          const currentPlanIndex = selectedPlanMap[product.id] || 0;
          const currentPlan = product.pricingTiers[currentPlanIndex] || product.pricingTiers[0];

          return (
            <div
              key={product.id}
              className="group relative rounded-3xl bg-zinc-900/70 hover:bg-zinc-900/90 border border-white/[0.06] hover:border-cyan-500/40 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.8)] hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Widescreen Cover Banner */}
                <div className="relative h-48 w-full overflow-hidden bg-zinc-950">
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
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10 font-mono">
                      {product.category}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-mono shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {product.deliveryTimeEstimate}
                    </span>
                  </div>

                  {/* Product Title */}
                  <div className="absolute bottom-3 left-4 right-4 z-10">
                    <h3 className="text-lg font-black tracking-wide text-white drop-shadow-md">
                      {product.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body - Duration Capsule Selector */}
                <div className="p-5">
                  <div className="p-1 rounded-2xl bg-zinc-950/80 border border-white/[0.06] grid grid-cols-4 gap-1 shadow-inner">
                    {product.pricingTiers.map((tier, idx) => {
                      const isSelected = idx === currentPlanIndex;
                      return (
                        <button
                          key={tier.duration}
                          type="button"
                          onClick={() => handleSelectPlanIndex(product.id, idx)}
                          className={`py-1.5 rounded-xl text-xs font-bold transition-all font-mono ${
                            isSelected
                              ? 'bg-white text-zinc-950 shadow-md font-black scale-100'
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

              {/* Card Footer: Price & Instant Actions */}
              <div className="p-5 pt-0">
                <div className="flex items-baseline justify-between mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white font-mono">
                      ${currentPlan.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-500 line-through font-mono">
                      ${currentPlan.originalPrice.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-xl font-mono shadow-sm">
                    Save {currentPlan.discountPercentage}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="w-full py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-colors border border-white/[0.06]"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => addToCart(product, currentPlan)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black tracking-wide uppercase transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:scale-102 flex items-center justify-center gap-1.5"
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
