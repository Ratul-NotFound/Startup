'use client';

import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Edit2, Trash2, X, Eye, EyeOff, ArrowUp, ArrowDown,
  Layers, CheckCircle2, Sliders, ChevronDown, ChevronUp, Sparkles, Check,
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
    adminToggleCategoryVisibility,
    adminReorderCategories,
    adminToggleProductVisibility,
    adminReorderProduct,
    formatPrice,
  } = useApp();

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<SubscriptionCategory | 'all'>('all');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [movingProductId, setMovingProductId] = useState<string | null>(null);

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategoryFilter !== 'all') {
      list = list.filter(p => p.category === selectedCategoryFilter);
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
  }, [products, selectedCategoryFilter, productSearch]);

  // Handle move category Up / Down
  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categoryConfigs.length) return;

    const newConfigs = [...categoryConfigs];
    const temp = newConfigs[index];
    newConfigs[index] = newConfigs[targetIndex];
    newConfigs[targetIndex] = temp;

    await adminReorderCategories(newConfigs);
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
                Rearrange which category appears 1st, 2nd, 3rd on the storefront, or hide categories completely.
              </p>
            </div>
            <button
              onClick={() => setShowCategoryManager(false)}
              className="self-end sm:self-auto p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryConfigs.map((cat, idx) => {
              const count = products.filter(p => p.category === cat.id).length;
              const isHidden = !!cat.isHidden;

              return (
                <div
                  key={cat.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isHidden
                      ? 'bg-zinc-900/40 border-white/5 opacity-60'
                      : 'bg-zinc-900/90 border-white/10 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-950 text-cyan-400 border border-white/10">
                          #{idx + 1}
                        </span>
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
                        onClick={() => handleMoveCategory(idx, 'up')}
                        className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-slate-300 disabled:opacity-30 border border-white/5 transition-colors cursor-pointer"
                        title="Move Category Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === categoryConfigs.length - 1}
                        onClick={() => handleMoveCategory(idx, 'down')}
                        className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-slate-300 disabled:opacity-30 border border-white/5 transition-colors cursor-pointer"
                        title="Move Category Down"
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
                          ? 'bg-rose-950/60 text-rose-300 border-rose-500/30 hover:bg-rose-900'
                          : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900'
                      }`}
                    >
                      {isHidden ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          <span>Hidden (Off)</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          <span>Live (Visible)</span>
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

      {/* 3. Category Filter Tabs */}
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

        {categoryConfigs.map((cat) => {
          const count = products.filter(p => p.category === cat.id).length;
          const active = selectedCategoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                active
                  ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/30'
                  : cat.isHidden
                    ? 'bg-zinc-900/60 text-slate-500 border border-white/5 line-through'
                    : 'bg-zinc-900 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${active ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Products Table with In-Category Sequence & Instant Visibility Toggle */}
      <div className="rounded-3xl bg-zinc-900 border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-slate-400 uppercase font-semibold border-b border-white/[0.06]">
              <tr>
                <th className="p-4 w-20">Sequence</th>
                <th className="p-4">Product</th>
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
                        <div className="flex items-center justify-end gap-2">
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

