'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { ShoppingBag, Search, TrendingUp, Percent, ArrowUpDown, X, Sparkles, Film, Code, Palette, Shield, Layers } from 'lucide-react';
import { SubscriptionCategory, Product } from '@/types';

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

  const categoryMetadata: {
    id: SubscriptionCategory | 'all';
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'all',
      label: 'All Vaults',
      description: 'Explore our complete catalog of verified wholesale subscription accounts.',
      icon: <Layers className="h-4 w-4 text-cyan-400" />,
    },
    {
      id: 'ai',
      label: 'AI & Intelligence',
      description: 'Frontier AI models, LLM compute & intelligent reasoning tools.',
      icon: <Sparkles className="h-4 w-4 text-cyan-400" />,
    },
    {
      id: 'streaming',
      label: 'Cinema & 4K Streaming',
      description: 'Ultra HD 4K streaming, Dolby Atmos, and high-fidelity audio.',
      icon: <Film className="h-4 w-4 text-red-400" />,
    },
    {
      id: 'dev',
      label: 'Developer Tools',
      description: 'AI code editors, fast generation requests, and composer tools.',
      icon: <Code className="h-4 w-4 text-indigo-400" />,
    },
    {
      id: 'productivity',
      label: 'Design & Creative',
      description: 'Complete suites for photography, video editing & vector design.',
      icon: <Palette className="h-4 w-4 text-amber-400" />,
    },
    {
      id: 'vpn_security',
      label: 'VPN & Privacy',
      description: 'Encrypted tunnel networks and high-speed multi-country servers.',
      icon: <Shield className="h-4 w-4 text-blue-400" />,
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
    const activeCategories = activeCategoryFilter === 'all'
      ? ['ai', 'streaming', 'dev', 'productivity', 'vpn_security']
      : [activeCategoryFilter];

    return activeCategories
      .map((catId) => {
        const meta = categoryMetadata.find((m) => m.id === catId);
        const catProducts = processedProducts.filter((p) => p.category === catId);
        return {
          id: catId,
          meta: meta || { id: catId, label: catId, description: '', icon: null },
          products: catProducts,
        };
      })
      .filter((group) => group.products.length > 0);
  }, [processedProducts, activeCategoryFilter, categoryMetadata]);

  const handleSelectPlanIndex = (productId: string, planIndex: number) => {
    setSelectedPlanMap((prev) => ({ ...prev, [productId]: planIndex }));
  };

  const sortOptions = [
    { id: 'popular', label: 'Popular', icon: <TrendingUp className="h-3 w-3" /> },
    { id: 'discount', label: 'Discount', icon: <Percent className="h-3 w-3" /> },
    { id: 'price_low', label: 'Price', icon: <ArrowUpDown className="h-3 w-3" /> },
  ];

  return (
    <section id="catalog" className="space-y-10">
      
      {/* 1. Header Toolbar with Filter Pills + Search/Sort */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-zinc-900/80 backdrop-blur-xl">
            {categoryMetadata.map((cat) => {
              const active = activeCategoryFilter === cat.id;
              const count = cat.id === 'all'
                ? products.length
                : products.filter((p) => p.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryFilter(cat.id)}
                  className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center gap-2 shrink-0 ${
                    active
                      ? 'bg-white text-zinc-950 shadow-md font-black'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      active ? 'bg-zinc-200 text-zinc-900 font-bold' : 'text-zinc-500 bg-white/5'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Search & Sort Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={activeSearchQuery}
              onChange={(e) => setActiveSearchQuery(e.target.value)}
              placeholder="Search plans..."
              className="w-full sm:w-52 pl-9 pr-8 py-1.5 bg-zinc-900/80 hover:bg-zinc-900 rounded-full text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition-all font-mono"
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

          <div className="inline-flex items-center p-1 rounded-full bg-zinc-900/80 shrink-0">
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

      {/* 2. Category-wise Section Render */}
      <div className="space-y-12">
        {categoryGroups.map((group) => (
          <div key={group.id} className="space-y-4">
            
            {/* Category Section Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-zinc-900 border border-white/10">
                  {group.meta.icon}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white uppercase font-mono tracking-wide">
                    {group.meta.label}
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans hidden sm:block">
                    {group.meta.description}
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-full border border-white/5">
                {group.products.length} {group.products.length === 1 ? 'Service' : 'Services'}
              </span>
            </div>

            {/* Product Cards for this Category */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
              {group.products.map((product) => {
                const currentPlanIndex = selectedPlanMap[product.id] || 0;
                const currentPlan = product.pricingTiers[currentPlanIndex] || product.pricingTiers[0];

                return (
                  <div
                    key={product.id}
                    className="group relative rounded-2xl sm:rounded-3xl bg-zinc-900/70 hover:bg-zinc-900/90 border border-white/[0.06] hover:border-cyan-500/40 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.8)] hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div>
                      {/* Responsive Cover Banner */}
                      <div className="relative h-28 sm:h-40 md:h-44 w-full overflow-hidden bg-zinc-950">
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
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between z-10">
                          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10 font-mono">
                            {product.category}
                          </span>
                          <span className="text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono shadow-sm">
                            <span className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="hidden sm:inline">{product.deliveryTimeEstimate}</span>
                            <span className="sm:hidden">&lt;30s</span>
                          </span>
                        </div>

                        {/* Product Title */}
                        <div className="absolute bottom-2 sm:bottom-3 left-2.5 sm:left-3.5 right-2.5 sm:right-3.5 z-10">
                          <h4 className="text-xs sm:text-base font-black tracking-wide text-white drop-shadow-md truncate">
                            {product.name}
                          </h4>
                        </div>
                      </div>

                      {/* Card Body - Duration Capsule Selector */}
                      <div className="p-2.5 sm:p-4">
                        <div className="p-0.5 sm:p-1 rounded-xl bg-zinc-950/80 border border-white/[0.06] grid grid-cols-4 gap-0.5 sm:gap-1 shadow-inner">
                          {product.pricingTiers.map((tier, idx) => {
                            const isSelected = idx === currentPlanIndex;
                            return (
                              <button
                                key={tier.duration}
                                type="button"
                                onClick={() => handleSelectPlanIndex(product.id, idx)}
                                className={`py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-xs font-bold transition-all font-mono ${
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

                    {/* Card Footer: Price & Actions */}
                    <div className="p-2.5 sm:p-4 pt-0">
                      <div className="flex items-baseline justify-between mb-2 sm:mb-3">
                        <div className="flex items-baseline gap-1 sm:gap-2">
                          <span className="text-base sm:text-xl font-black text-white font-mono">
                            ${currentPlan.price.toFixed(2)}
                          </span>
                          <span className="text-[10px] sm:text-xs text-zinc-500 line-through font-mono">
                            ${currentPlan.originalPrice.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-[9px] sm:text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg font-mono shadow-sm">
                          -{currentPlan.discountPercentage}%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="w-full py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[10px] sm:text-xs font-bold transition-colors border border-white/[0.06]"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => addToCart(product, currentPlan)}
                          className="w-full py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] sm:text-xs font-bold uppercase transition-all shadow-[0_0_12px_rgba(37,99,235,0.3)] hover:scale-102 flex items-center justify-center gap-1"
                        >
                          <ShoppingBag className="h-3 w-3" />
                          <span>Buy</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

    </section>
  );
};
