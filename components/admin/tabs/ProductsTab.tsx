'use client';

import React from 'react';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import { Product } from '@/types';

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
  stockCount: 50, instructions: ['Log in with credentials provided in your vault.', 'Enjoy your premium subscription.'],
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
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            value={productSearch}
            onChange={e => setProductSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-zinc-500"
            placeholder="Search products…"
          />
        </div>
        <button
          onClick={() => setEditingProduct({ ...blankProduct(), id: '', isNew: true } as Product & { isNew: boolean })}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add New Product
        </button>
      </div>

      <div className="rounded-3xl bg-zinc-900 border border-white/[0.08] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-950 text-slate-400 uppercase font-semibold border-b border-white/[0.06]">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Pricing Tiers (৳ BDT)</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Rating</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredProducts.map(p => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.logo}
                      alt={p.name}
                      className="h-9 w-9 rounded-lg object-cover ring-1 ring-white/10"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'; }}
                    />
                    <div>
                      <p className="font-bold text-white">{p.name}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[180px]">{p.tagline}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 capitalize text-slate-300">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-slate-300 border border-white/5">
                    {p.category}
                  </span>
                </td>
                <td className="p-4 text-slate-300 font-mono">
                  {p.pricingTiers.map(t => `৳${t.price < 100 ? Math.round(t.price * 125) : t.price}`).join(' · ')}
                </td>
                <td className="p-4">
                  <span className={`font-bold ${p.stockCount < 20 ? 'text-amber-400' : 'text-emerald-400'}`}>{p.stockCount}</span>
                </td>
                <td className="p-4 text-yellow-400 font-bold">★ {p.rating}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingProduct(p)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-blue-400 transition-colors cursor-pointer"
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
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
