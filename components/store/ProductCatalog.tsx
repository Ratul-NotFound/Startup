'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Product } from '@/types';
import { Check, ShoppingBag, Search } from 'lucide-react';

export const ProductCatalog: React.FC = () => {
  const {
    products,
    setSelectedProduct,
    addToCart,
    activeCategoryFilter,
    activeSearchQuery,
    setActiveSearchQuery,
  } = useApp();

  const [sortBy, setSortBy] = useState<'popular' | 'price_low' | 'discount'>('popular');
  const [selectedPlanMap, setSelectedPlanMap] = useState<Record<string, number>>({});

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

  return (
    <section id="catalog" className="space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Subscription Catalog</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Choose duration tier for instant automated credential allocation.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3">
          <div className="relative w-48 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={activeSearchQuery}
              onChange={(e) => setActiveSearchQuery(e.target.value)}
              placeholder="Search catalog..."
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 cursor-pointer"
          >
            <option value="popular">Popularity</option>
            <option value="discount">Highest Discount</option>
            <option value="price_low">Lowest Price</option>
          </select>
        </div>
      </div>

      {/* Product Cards Grid with comfortable spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {filteredProducts.map((product) => {
          const currentPlanIndex = selectedPlanMap[product.id] || 0;
          const currentPlan = product.pricingTiers[currentPlanIndex] || product.pricingTiers[0];

          return (
            <div
              key={product.id}
              className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between group shadow-lg"
            >
              <div>
                {/* Widescreen Cover Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
                  <img
                    src={product.logo}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-black/60" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-zinc-200 border border-white/10">
                      {product.category}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {product.deliveryTimeEstimate}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <h3 className="text-base font-black text-white drop-shadow-md">
                      {product.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-zinc-400 line-clamp-1">{product.tagline}</p>

                  {/* Segment Duration Tabs */}
                  <div className="p-1 rounded-xl bg-zinc-950 border border-zinc-800 grid grid-cols-4 gap-1">
                    {product.pricingTiers.map((tier, idx) => {
                      const isSelected = idx === currentPlanIndex;
                      return (
                        <button
                          key={tier.duration}
                          type="button"
                          onClick={() => handleSelectPlanIndex(product.id, idx)}
                          className={`py-1 rounded-lg text-[11px] font-semibold transition-all ${
                            isSelected
                              ? 'bg-zinc-800 text-white shadow-sm'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {tier.label.replace(' Months', 'mo').replace(' Month', 'mo').replace(' (1 Year)', 'yr')}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feature Bullets */}
                  <div className="space-y-1.5 pt-1 text-xs text-zinc-300">
                    {product.features.slice(0, 2).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-zinc-300">
                        <Check className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 pt-3 border-t border-zinc-800/80 bg-zinc-900/50">
                <div className="flex items-baseline justify-between mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-white">${currentPlan.price.toFixed(2)}</span>
                    <span className="text-xs text-zinc-500 line-through">
                      ${currentPlan.originalPrice.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded-md">
                    Save {currentPlan.discountPercentage}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-semibold border border-zinc-700/60 transition-colors"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => addToCart(product, currentPlan)}
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
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
