'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Check, Zap, Calculator, Sparkles, TrendingDown } from 'lucide-react';
import { Interactive3DCard } from '@/components/ui/Interactive3DCard';
import { Scroll3DReveal } from '@/components/ui/Scroll3DReveal';

interface CalculatorItem {
  id: string;
  name: string;
  officialMonthly: number;
  subnexusMonthly: number;
  selected: boolean;
  category: string;
}

export const SavingsCalculator: React.FC = () => {
  const { products, addToCart } = useApp();

  const [items, setItems] = useState<CalculatorItem[]>([
    { id: 'chatgpt-plus', name: 'ChatGPT Plus', officialMonthly: 20.00, subnexusMonthly: 5.83, selected: true, category: 'AI Tools' },
    { id: 'netflix-4k-uhd', name: 'Netflix 4K UHD', officialMonthly: 22.99, subnexusMonthly: 3.91, selected: true, category: 'Streaming' },
    { id: 'claude-pro', name: 'Claude 3.5 Pro', officialMonthly: 20.00, subnexusMonthly: 6.66, selected: true, category: 'AI Tools' },
    { id: 'youtube-premium', name: 'YouTube Premium', officialMonthly: 13.99, subnexusMonthly: 2.49, selected: true, category: 'Streaming' },
    { id: 'cursor-pro', name: 'Cursor Pro', officialMonthly: 20.00, subnexusMonthly: 6.25, selected: false, category: 'Developer' },
    { id: 'gemini-advanced', name: 'Gemini Advanced 2.0', officialMonthly: 19.99, subnexusMonthly: 4.99, selected: false, category: 'AI Tools' },
    { id: 'spotify-premium', name: 'Spotify Premium', officialMonthly: 11.99, subnexusMonthly: 2.29, selected: false, category: 'Music' },
    { id: 'nordvpn-ultimate', name: 'NordVPN Ultimate', officialMonthly: 14.99, subnexusMonthly: 2.99, selected: false, category: 'Security' },
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
  const savingsPercent = officialAnnual > 0 ? Math.round((annualSavings / officialAnnual) * 100) : 0;

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
    <section id="calculator" className="space-y-8 pt-8">
      
      {/* Section Header with 3D Scroll Entrance */}
      <Scroll3DReveal>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 text-cyan-300 text-xs font-semibold backdrop-blur-md">
              <Calculator className="h-3.5 w-3.5 text-cyan-400" />
              <span>LIVE INTERACTIVE COMPARISON</span>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-black tracking-tight text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Subscription <span className="text-cyan-400">Savings Calculator</span>
            </h2>
            <p className="text-xs text-zinc-400 max-w-lg">
              Select your favorite apps to calculate your instant annual cash savings compared to official retail prices.
            </p>
          </div>

          {/* Dynamic Annual Savings Widget */}
          <div className="flex items-center gap-4 text-xs bg-zinc-900/80 p-3 rounded-2xl border border-white/[0.08] backdrop-blur-xl">
            <div>
              <span className="text-zinc-400 block text-[11px] font-medium flex items-center gap-1">
                <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
                Annual Cash Saved ({savingsPercent}%)
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                ${annualSavings.toFixed(2)} <span className="text-xs text-zinc-400 font-sans">/ yr</span>
              </span>
            </div>
            <button
              onClick={handleBundleCheckout}
              disabled={selectedItems.length === 0}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-105"
            >
              <Zap className="h-4 w-4" />
              <span>Bundle Selected ({selectedItems.length})</span>
            </button>
          </div>
        </div>
      </Scroll3DReveal>

      {/* 3D Grid of Selectable Subscription Cards with Interactive Tilt & Parallax */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((item, idx) => (
          <Interactive3DCard key={item.id} index={idx} maxTilt={8}>
            <div
              onClick={() => toggleItem(item.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 backdrop-blur-xl select-none flex flex-col justify-between h-full ${
                item.selected
                  ? 'border-cyan-500/50 bg-zinc-900/90 text-white shadow-[0_10px_25px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                  : 'border-white/[0.06] bg-zinc-900/40 text-zinc-400 hover:border-white/20 hover:bg-zinc-900/70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{item.category}</span>
                  <div
                    className={`h-5 w-5 rounded-lg flex items-center justify-center transition-all ${
                      item.selected ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/40' : 'border border-zinc-700 bg-zinc-950'
                    }`}
                  >
                    {item.selected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white truncate">{item.name}</h3>
              </div>

              <div className="text-xs space-y-1 pt-3 border-t border-white/[0.04] mt-2">
                <div className="flex justify-between items-center text-[11px] text-zinc-500">
                  <span>Official:</span>
                  <span className="line-through">${item.officialMonthly.toFixed(2)}/mo</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">SubNexus:</span>
                  <span className="text-cyan-400 font-bold font-mono">${item.subnexusMonthly.toFixed(2)}/mo</span>
                </div>
              </div>
            </div>
          </Interactive3DCard>
        ))}
      </div>

    </section>
  );
};
