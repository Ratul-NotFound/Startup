'use client';

import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Edit2, Trash2, X, Eye, EyeOff, ArrowUp, ArrowDown,
  Layers, CheckCircle2, Sliders, ChevronDown, ChevronUp, Sparkles, Check,
  RefreshCw, ArrowRightLeft,
} from 'lucide-react';
import { Product, SubscriptionCategory, CategoryConfig } from '@/types';
import { useApp } from '@/context/AppContext';

// Blank product template
export const blankProduct = (): Omit<Product, 'id'> => ({
  name: '', slug: '', category: 'ai', tagline: '', description: '',
  logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
  bannerGradient: 'from-blue-600/30 to-zinc-900',
  rating: 4.9, reviewCount: 120, deliveryType: 'instant_bot',
  accountType: 'private_account', deliveryTimeEstimate: 'Instant (< 30s)',
  features: ['Full access included', 'Fast reliable server pool', 'Replacement warranty'],
  specs: { screens: 1, quality: 'Premium HD/4K', warranty: 'Full Period Replacement', platforms: ['Web', 'iOS', 'Android'], region: 'Global' },
  pricingTiers: [
    { duration: '1_month', label: '1 Month', price: 999, originalPrice: 2000, discountPercentage: 50, isPopular: false },
    { duration: '3_months', label: '3 Months', price: 2499, originalPrice: 6000, discountPercentage: 58, isPopular: true },
    { duration: '12_months', label: '12 Months', price: 7999, originalPrice: 24000, discountPercentage: 66 },
  ],
  stockCount: 50,
  isHidden: false,
  orderIndex: 0,
  instructions: ['Log in with credentials provided in your vault.', 'Enjoy your premium subscription.'],
});

interface ProductsTabProps {
  products: Product[];
  productSearch: string;
  setProductSearch: (q: string) => void;
  setEditingProduct: (prod: (Product & { isNew?: boolean }) | null) => void;
  deleteConfirm: string | null;
  setDeleteConfirm: (id: string | null) => void;
  handleDeleteProduct: (id: string) => Promise<void>;
}

export function ProductsTab({
  products,
  productSearch,
  setProductSearch,
  setEditingProduct,
  deleteConfirm,
  setDeleteConfirm,
  handleDeleteProduct,
}: ProductsTabProps) {
  const {
    categoryConfigs,
    adminUpdateCategoryConfigs,
    adminToggleCategoryVisibility,
    adminReorderCategories,
    adminToggleProductVisibility,
    adminToggleProductType,
    adminReorderProduct,
    formatPrice,
  } = useApp();

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<SubscriptionCategory | 'all'>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'general' | 'special'>('all');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [movingProductId, setMovingProductId] = useState<string | null>(null);

  const sortedCategoryConfigs = useMemo(() => {
    return [...categoryConfigs].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }, [categoryConfigs]);

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategoryFilter !== 'all') {
      list = list.filter(p => p.category === selectedCategoryFilter);
    }

    if (selectedTypeFilter === 'general') {
      list = list.filter(p => p.productType !== 'special');
    } else if (selectedTypeFilter === 'special') {
      list = list.filter(p => p.productType === 'special');
    }

    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q)
      );
    }

    // Sort by orderIndex ascending
    list.sort((a, b) => (a.orderIndex ?? 999) - (b.orderIndex ?? 999));
    return list;
  }, [products, selectedCategoryFilter, selectedTypeFilter, productSearch]);

  // Handle move category Up / Down
  const handleMoveCategory = async (catId: SubscriptionCategory, direction: 'up' | 'down') => {
    const list = [...sortedCategoryConfigs];
    const currentIndex = list.findIndex(c => c.id === catId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[currentIndex];
    list[currentIndex] = list[targetIndex];
    list[targetIndex] = temp;

    const reordered = list.map((c, idx) => ({ ...c, orderIndex: idx }));
    await adminUpdateCategoryConfigs(reordered);
  };

  // Direct position changer
  const handleSetCategoryPosition = async (catId: SubscriptionCategory, newPos: number) => {
    const list = [...sortedCategoryConfigs];
    const currentIndex = list.findIndex(c => c.id === catId);
    if (currentIndex === -1 || currentIndex === newPos) return;

    const [item] = list.splice(currentIndex, 1);
    list.splice(newPos, 0, item);

    const reordered = list.map((c, idx) => ({ ...c, orderIndex: idx }));
    await adminUpdateCategoryConfigs(reordered);
  };

  // Handle move product Up / Down inside its category
  const handleMoveProduct = async (product: Product, direction: 'up' | 'down') => {
    setMovingProductId(product.id);
    try {
      // Find all products in the same category sorted by orderIndex
      const sameCatProducts = products
        .filter(p => p.category === product.category)
        .sort((a, b) => (a.orderIndex ?? 999) - (b.orderIndex ?? 999));

      const currentIndex = sameCatProducts.findIndex(p => p.id === product.id);
      if (currentIndex === -1) return;

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= sameCatProducts.length) return;

      const otherProduct = sameCatProducts[targetIndex];
      
      // Swap order indexes
      const currentOrder = product.orderIndex ?? currentIndex;
      const otherOrder = otherProduct.orderIndex ?? targetIndex;

      // Assign safe unique integers
      await adminReorderProduct(product.id, otherOrder === currentOrder ? (direction === 'up' ? currentOrder - 1 : currentOrder + 1) : otherOrder);
      await adminReorderProduct(otherProduct.id, currentOrder);
    } finally {
      setMovingProductId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-zinc-500"
              placeholder="Search products…"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowCategoryManager(!showCategoryManager)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
              showCategoryManager
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-zinc-900 hover:bg-zinc-850 text-slate-300 border-white/10'
            }`}
          >
            <Layers className="h-4 w-4 text-cyan-400" />
            <span>Category Sequence &amp; Visibility ({categoryConfigs.filter(c => !c.isHidden).length}/{categoryConfigs.length})</span>
            {showCategoryManager ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        <button
          onClick={() => setEditingProduct({ ...blankProduct(), id: '', isNew: true } as Product & { isNew: boolean })}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> Add New Product
        </button>
      </div>

      {/* 2. Category Sequence & Visibility Manager Panel */}
      {showCategoryManager && (
        <div className="p-4 sm:p-5 rounded-3xl bg-zinc-950 border border-cyan-500/30 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-cyan-400" />
                Storefront Category Manager &amp; Sequence Controller
              </h3>
              <p className="text-[11px] text-slate-400">
                Arrange which category appears 1st, 2nd, 3rd on the storefront, or hide categories completely. Changes take effect on the customer store instantly.
              </p>
            </div>
            <button
              onClick={() => setShowCategoryManager(false)}
              className="self-end sm:self-auto p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedCategoryConfigs.map((cat, idx) => {
              const count = products.filter(p => p.category === cat.id).length;
              const isHidden = !!cat.isHidden;

              return (
                <div
                  key={cat.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isHidden
                      ? 'bg-zinc-900/40 border-rose-500/20'
                      : 'bg-zinc-900/90 border-white/10 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {/* Direct Position Dropdown */}
                        <select
                          value={idx}
                          onChange={(e) => handleSetCategoryPosition(cat.id, Number(e.target.value))}
                          className="text-[11px] font-mono font-bold px-2 py-1 rounded-lg bg-zinc-950 text-cyan-400 border border-cyan-500/30 cursor-pointer"
                          title="Change Position Sequence Number"
                        >
                          {sortedCategoryConfigs.map((_, pIdx) => (
                            <option key={pIdx} value={pIdx}>
                              #{pIdx + 1}
                            </option>
                          ))}
                        </select>
                        <h4 className="font-bold text-xs text-white">{cat.label}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{cat.description}</p>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-950 text-slate-400 border border-white/5 shrink-0">
                      {count} items
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    {/* Move Up / Down Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveCategory(cat.id, 'up')}
                        className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-slate-300 disabled:opacity-30 border border-white/5 transition-colors cursor-pointer"
                        title="Move Category Up (▲)"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sortedCategoryConfigs.length - 1}
                        onClick={() => handleMoveCategory(cat.id, 'down')}
                        className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-slate-300 disabled:opacity-30 border border-white/5 transition-colors cursor-pointer"
                        title="Move Category Down (▼)"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Visibility Toggle Button */}
                    <button
                      type="button"
                      onClick={() => adminToggleCategoryVisibility(cat.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isHidden
                          ? 'bg-rose-950/80 text-rose-300 border-rose-500/40 hover:bg-rose-900'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900'
                      }`}
                    >
                      {isHidden ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5 text-rose-400" />
                          <span>Hidden from Store</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Visible on Store</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Category Filter Tabs with Direct Visibility Toggles */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
        <button
          type="button"
          onClick={() => setSelectedCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedCategoryFilter === 'all'
              ? 'bg-white text-zinc-950 shadow-md'
              : 'bg-zinc-900 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          All Products ({products.length})
        </button>

        {sortedCategoryConfigs.map((cat, cIdx) => {
          const count = products.filter(p => p.category === cat.id).length;
          const active = selectedCategoryFilter === cat.id;
          const isHidden = !!cat.isHidden;

          return (
            <div
              key={cat.id}
              className={`flex items-center rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                active
                  ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/30 border-cyan-400'
                  : isHidden
                    ? 'bg-zinc-950 text-slate-500 border-rose-500/30'
                    : 'bg-zinc-900 text-slate-400 hover:text-white border-white/5'
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className="px-3 py-1.5 flex items-center gap-1.5 cursor-pointer"
              >
                <span className={`text-[10px] font-mono ${active ? 'text-zinc-950' : 'text-cyan-400'}`}>#{cIdx + 1}</span>
                <span className={isHidden ? 'line-through opacity-70' : ''}>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${active ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-slate-400'}`}>
                  {count}
                </span>
              </button>

              {/* Direct Quick Toggle Icon on Chip */}
              <button
                type="button"
                onClick={() => adminToggleCategoryVisibility(cat.id)}
                className={`p-1.5 mr-1 rounded-lg transition-colors cursor-pointer ${
                  active
                    ? 'hover:bg-cyan-600 text-zinc-950'
                    : isHidden
                      ? 'text-rose-400 hover:bg-rose-950'
                      : 'text-emerald-400 hover:bg-zinc-800'
                }`}
                title={isHidden ? 'Category is HIDDEN on storefront. Click to make Visible.' : 'Category is VISIBLE on storefront. Click to Hide.'}
              >
                {isHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* 3.5. Product Type Quick Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-slate-400">Filter By Type:</span>
        <button
          type="button"
          onClick={() => setSelectedTypeFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedTypeFilter === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-zinc-900 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          All Types ({products.length})
        </button>

        <button
          type="button"
          onClick={() => setSelectedTypeFilter('general')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedTypeFilter === 'general'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-zinc-900 text-emerald-400 hover:bg-emerald-950/40 border border-white/5'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          General Products ({products.filter(p => p.productType !== 'special').length})
        </button>

        <button
          type="button"
          onClick={() => setSelectedTypeFilter('special')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedTypeFilter === 'special'
              ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
              : 'bg-zinc-900 text-amber-300 hover:bg-amber-950/40 border border-amber-500/20'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          Special Campaign Deals ({products.filter(p => p.productType === 'special').length})
        </button>
      </div>

      {/* 4. Products Table with In-Category Sequence & Instant Visibility Toggle */}
      <div className="rounded-3xl bg-zinc-900 border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-slate-400 uppercase font-semibold border-b border-white/[0.06]">
              <tr>
                <th className="p-4 w-20">Sequence</th>
                <th className="p-4">Product</th>
                <th className="p-4">Type &amp; Tasks</th>
                <th className="p-4">Category</th>
                <th className="p-4">Storefront Status</th>
                <th className="p-4">Pricing Tiers (৳ BDT)</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Rating</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, idx) => {
                  const isHidden = !!p.isHidden;
                  const isMoving = movingProductId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isHidden ? 'bg-rose-950/[0.08] opacity-75' : ''
                      }`}
                    >
                      {/* In-Category Sequence Controls */}
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-cyan-400 font-bold text-xs w-5 text-center">
                            #{p.orderIndex ?? idx + 1}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              disabled={isMoving}
                              onClick={() => handleMoveProduct(p, 'up')}
                              className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                              title="Move product up inside category"
                            >
                              <ArrowUp className="h-2.5 w-2.5" />
                            </button>
                            <button
                              type="button"
                              disabled={isMoving}
                              onClick={() => handleMoveProduct(p, 'down')}
                              className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                              title="Move product down inside category"
                            >
                              <ArrowDown className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Product Brand Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.logo}
                            alt={p.name}
                            className="h-9 w-9 rounded-lg object-cover ring-1 ring-white/10"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div>
                            <p className="font-bold text-white flex items-center gap-1.5">
                              {p.name}
                              {p.isFeatured && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                                  FEATURED
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate max-w-[180px]">{p.tagline}</p>
                          </div>
                        </div>
                      </td>

                      {/* Product Type & Tasks Column with 1-Click Shift Option */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {p.productType === 'special' ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold text-[11px]">
                                  <Sparkles className="h-3 w-3 text-amber-400" />
                                  ⚡ Special ({p.specialConfig?.tasks?.length || 0} Tasks)
                                </span>
                                <button
                                  type="button"
                                  onClick={() => adminToggleProductType(p.id)}
                                  className="px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 hover:text-white border border-white/10 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                  title="Shift this special product back to a General Product"
                                >
                                  <ArrowRightLeft className="h-2.5 w-2.5" />
                                  <span>Shift to General</span>
                                </button>
                              </div>
                              {p.specialConfig?.campaignBadge && (
                                <p className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">
                                  {p.specialConfig.campaignBadge}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                General
                              </span>
                              <button
                                type="button"
                                onClick={() => adminToggleProductType(p.id)}
                                className="px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                title="Shift this product to Special Campaign Deal (Tasks Mission)"
                              >
                                <Sparkles className="h-2.5 w-2.5 text-amber-400" />
                                <span>Shift to Special</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="p-4 capitalize text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-slate-300 border border-white/5 font-medium">
                          {p.category}
                        </span>
                      </td>

                      {/* Storefront Status Toggle */}
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => adminToggleProductVisibility(p.id)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                            isHidden
                              ? 'bg-rose-950/60 text-rose-400 border-rose-500/30 hover:bg-rose-900'
                              : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900'
                          }`}
                          title="Click to toggle visibility on storefront"
                        >
                          {isHidden ? (
                            <>
                              <EyeOff className="h-3 w-3" />
                              <span>Hidden (Off)</span>
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3" />
                              <span>Live on Store</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Pricing Tiers in BDT */}
                      <td className="p-4 text-slate-300 font-mono text-[11px]">
                        {p.pricingTiers.map(t => formatPrice(t.price)).join(' · ')}
                      </td>

                      {/* Stock */}
                      <td className="p-4">
                        <span className={`font-bold font-mono ${p.stockCount < 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {p.stockCount}
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="p-4 text-yellow-400 font-bold">★ {p.rating}</td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => adminToggleProductType(p.id)}
                            className={`p-2 rounded-lg transition-colors cursor-pointer border ${
                              p.productType === 'special'
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-slate-400 hover:text-white border-white/5'
                            }`}
                            title={p.productType === 'special' ? 'Shift to General Product' : 'Shift to Special Campaign'}
                          >
                            <ArrowRightLeft className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-blue-400 transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          {deleteConfirm === p.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 rounded-lg bg-red-600 text-white text-[10px] font-bold px-2 cursor-pointer"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="p-1.5 rounded-lg bg-zinc-800 text-slate-400 cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(p.id)}
                              className="p-2 rounded-lg bg-zinc-800 hover:bg-red-950/60 text-red-400 transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

