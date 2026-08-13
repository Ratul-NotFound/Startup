'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Check, Zap } from 'lucide-react';

interface CalculatorItem {
  id: string;
  name: string;
  officialMonthly: number;
  subnexusMonthly: number;
  selected: boolean;
}

export const SavingsCalculator: React.FC = () => {
  const { products, addToCart } = useApp();

  const [items, setItems] = useState<CalculatorItem[]>([
    { id: 'chatgpt-plus', name: 'ChatGPT Plus', officialMonthly: 20.00, subnexusMonthly: 5.83, selected: true },
    { id: 'netflix-4k-uhd', name: 'Netflix 4K', officialMonthly: 22.99, subnexusMonthly: 3.91, selected: true },
    { id: 'claude-pro', name: 'Claude 3.5 Pro', officialMonthly: 20.00, subnexusMonthly: 6.66, selected: true },
    { id: 'youtube-premium', name: 'YouTube Premium', officialMonthly: 13.99, subnexusMonthly: 2.49, selected: true },
  ]);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const selectedItems = items.filter((i) => i.selected);
  const officialAnnual = selectedItems.reduce((acc, i) => acc + i.officialMonthly, 0) * 12;
  const subnexusAnnual = selectedItems.reduce((acc, i) => acc + i.subnexusMonthly, 0) * 12;
  const annualSavings = Math.max(0, officialAnnual - subnexusAnnual);

  const handleBundleCheckout = () => {
    selectedItems.forEach((calcItem) => {
      const prod = products.find((p) => p.id === calcItem.id);
      if (prod) {
        const annualPlan = prod.pricingTiers.find((t) => t.duration === '12_months') || prod.pricingTiers[prod.pricingTiers.length - 1];
        addToCart(prod, annualPlan);
      }
    });
  };

  return (
    <section id="calculator" className="space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Savings Calculator</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Compare official retail prices against SubNexus wholesale pool rates.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-zinc-500 block text-[11px]">Total Annual Savings</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              ${annualSavings.toFixed(2)} / yr
            </span>
          </div>
          <button
            onClick={handleBundleCheckout}
            disabled={selectedItems.length === 0}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Zap className="h-4 w-4" />
            <span>Bundle Selected ({selectedItems.length})</span>
          </button>
        </div>
      </div>

      {/* Grid of selectable services */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              item.selected
                ? 'border-zinc-700 bg-zinc-900 text-white shadow-md'
                : 'border-zinc-800/80 bg-zinc-950/60 text-zinc-500 hover:border-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold truncate">{item.name}</span>
              <div
                className={`h-4 w-4 rounded flex items-center justify-center ${
                  item.selected ? 'bg-blue-600 text-white' : 'border border-zinc-700'
                }`}
              >
                {item.selected && <Check className="h-3 w-3" />}
              </div>
            </div>
            <div className="text-xs text-zinc-400 space-y-0.5">
              <p className="text-[11px] line-through text-zinc-600">Official: ${item.officialMonthly}/mo</p>
              <p className="text-emerald-400 font-bold font-mono">SubNexus: ${item.subnexusMonthly}/mo</p>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};
