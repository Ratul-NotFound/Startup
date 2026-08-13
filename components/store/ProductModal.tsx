'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  Check,
  ShoppingBag,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const ProductModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart } = useApp();
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(0);
  const [customEmail, setCustomEmail] = useState('');

  if (!selectedProduct) return null;

  const currentPlan = selectedProduct.pricingTiers[selectedPlanIndex] || selectedProduct.pricingTiers[0];

  const handleAddToCart = () => {
    addToCart(selectedProduct, currentPlan, customEmail ? customEmail : undefined);
    setSelectedProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-5 my-6">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <img
            src={selectedProduct.logo}
            alt={selectedProduct.name}
            className="h-12 w-12 rounded-xl object-cover border border-zinc-800 shrink-0"
          />
          <div>
            <h2 className="text-base font-bold text-white">{selectedProduct.name}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">{selectedProduct.description}</p>
          </div>
        </div>

        {/* Duration Selector */}
        <div>
          <label className="text-xs font-semibold text-zinc-400 block mb-2">Duration</label>
          <div className="grid grid-cols-4 gap-1.5">
            {selectedProduct.pricingTiers.map((tier, idx) => {
              const active = idx === selectedPlanIndex;
              return (
                <button
                  key={tier.duration}
                  onClick={() => setSelectedPlanIndex(idx)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    active
                      ? 'border-indigo-500 bg-zinc-800 text-white font-semibold'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <p className="text-xs">{tier.label.replace(' Months', 'mo').replace(' Month', 'mo').replace(' (1 Year)', 'yr')}</p>
                  <p className="text-sm font-bold text-white mt-0.5">${tier.price.toFixed(2)}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Email if direct upgrade */}
        {(selectedProduct.accountType === 'direct_upgrade' || selectedProduct.deliveryType === 'custom_email') && (
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              Personal Email (Optional for direct invite)
            </label>
            <input
              type="email"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="e.g. yourname@gmail.com"
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>
        )}

        {/* Specifications */}
        <div className="space-y-2 py-3 border-y border-zinc-800/80 text-xs text-zinc-300">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-zinc-500 block text-[11px]">Delivery</span>
              <span className="font-semibold text-emerald-400">{selectedProduct.deliveryTimeEstimate}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[11px]">Warranty</span>
              <span className="font-semibold text-zinc-200">{selectedProduct.specs.warranty}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[11px] text-zinc-500 block">Total</span>
            <span className="text-xl font-bold text-white">${currentPlan.price.toFixed(2)}</span>
          </div>
          <button
            onClick={handleAddToCart}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Add to Cart</span>
          </button>
        </div>

      </div>
    </div>
  );
};
