'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Tag, Sparkles, Copy, Check, ArrowRight, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export function SpecialOffersSection() {
  const { coupons } = useApp();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Map to track completed tasks per coupon code: { [couponCode]: { [taskId]: boolean } }
  const [completedTasksMap, setCompletedTasksMap] = useState<Record<string, Record<string, boolean>>>({});

  // Filter coupons marked as special offers or fallback to all coupons
  const activeOffers = coupons.filter(c => c.isSpecialOffer);
  const displayOffers = activeOffers.length > 0 ? activeOffers : coupons;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCompleteTask = (code: string, taskId: string, url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    setCompletedTasksMap((prev) => ({
      ...prev,
      [code]: {
        ...(prev[code] || {}),
        [taskId]: true,
      },
    }));
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!displayOffers || displayOffers.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-4 sm:py-6">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-gradient-to-r from-blue-600/10 via-cyan-500/15 to-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Section Header with Left/Right Scroll Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-wide uppercase mb-1.5 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Special Offers &amp; Promo Hub</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Exclusive Deals &amp; Giveaways
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
              Swipe or scroll to claim promo codes, giveaways, and exclusive subscription discounts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => scroll('left')}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <Link
              href="#catalog"
              className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors ml-2"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Compact Horizontally Scrollable Offers Row */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-none py-2 px-1 snap-x snap-mandatory"
        >
          {displayOffers.map((offer) => {
            const isGiveaway = offer.type === 'giveaway' || offer.discountPercent >= 100 || offer.offerTag?.toLowerCase().includes('giveaway');
            const isCopied = copiedCode === offer.code;

            const tasks = offer.requiredTasks || [];
            const offerCompletedTasks = completedTasksMap[offer.code] || {};
            const isUnlocked = tasks.every((t) => !t.isRequired || offerCompletedTasks[t.id]);

            return (
              <div
                key={offer.code}
                className={`w-[280px] sm:w-[310px] shrink-0 snap-start relative rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 border shadow-lg hover:-translate-y-1 ${
                  isGiveaway
                    ? 'bg-gradient-to-br from-amber-950/40 via-zinc-900 to-amber-950/20 border-amber-500/40 hover:border-amber-400 shadow-amber-500/10'
                    : offer.discountPercent >= 40
                    ? 'bg-gradient-to-br from-blue-950/40 via-zinc-900 to-cyan-950/30 border-cyan-500/40 hover:border-cyan-400 shadow-cyan-500/10'
                    : 'bg-zinc-900/90 border-white/[0.08] hover:border-white/20'
                }`}
              >
                {/* Optional Compact Custom Picture Banner */}
                {offer.offerImage && (
                  <div className="relative h-28 w-full overflow-hidden">
                    <img
                      src={offer.offerImage}
                      alt={offer.offerTitle || offer.code}
                      className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/30 to-transparent" />

                    {/* Top Overlay Badge */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 z-10">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-md backdrop-blur-md ${
                        isGiveaway
                          ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                          : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
                      }`}>
                        {offer.offerTag || (isGiveaway ? '🎁 FREE GIVEAWAY' : `⚡ ${offer.discountPercent}% OFF`)}
                      </span>

                      <span className="text-[9px] font-mono text-white px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5 text-cyan-400" /> Limited
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-4 flex flex-col justify-between gap-3.5 flex-1">
                  {/* Top Badge Row (if no custom offerImage) */}
                  {!offer.offerImage && (
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm ${
                        isGiveaway
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      }`}>
                        {offer.offerTag || (isGiveaway ? '🎁 FREE GIVEAWAY' : `⚡ ${offer.discountPercent}% OFF`)}
                      </span>

                      <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5 text-cyan-400" /> Limited
                      </span>
                    </div>
                  )}

                  {/* Main Content */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-2xl sm:text-3xl font-black ${
                        isGiveaway ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {isGiveaway ? '100% FREE' : `${offer.discountPercent}% OFF`}
                      </span>
                      {offer.minOrderAmount && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          (Min ${offer.minOrderAmount})
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-1">
                      {offer.offerTitle || offer.description || `${offer.discountPercent}% Promo Code`}
                    </h3>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {offer.description}
                    </p>
                  </div>

                  {/* Dynamic Required Tasks Checklist (if any) */}
                  {tasks.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-amber-400" />
                          <span>Tasks ({Object.keys(offerCompletedTasks).length}/{tasks.length})</span>
                        </span>
                        {isUnlocked && (
                          <span className="text-[9px] text-emerald-400 font-bold">✓ Unlocked</span>
                        )}
                      </div>

                      <div className="space-y-1">
                        {tasks.map((task) => {
                          const isDone = Boolean(offerCompletedTasks[task.id]);
                          return (
                            <div
                              key={task.id}
                              className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-900 border border-white/5 text-[11px]"
                            >
                              <span className={`text-[10px] font-medium truncate max-w-[150px] ${isDone ? 'text-emerald-400 line-through' : 'text-slate-300'}`}>
                                {task.label}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCompleteTask(offer.code, task.id, task.url)}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all shrink-0 cursor-pointer ${
                                  isDone
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                                }`}
                              >
                                {isDone ? '✓ Done' : 'Visit ↗'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Coupon Code Copy & Claim Action Box */}
                  <div className="pt-2 border-t border-white/[0.08] space-y-1.5">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-white/10">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Tag className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span className="font-mono font-black text-white text-xs tracking-wider select-all truncate">
                          {isUnlocked ? offer.code : '••••••••'}
                        </span>
                      </div>

                      <button
                        onClick={() => isUnlocked && handleCopyCode(offer.code)}
                        disabled={!isUnlocked}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                          !isUnlocked
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/10'
                            : isCopied
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                        }`}
                      >
                        {!isUnlocked ? (
                          <span>🔒 Locked</span>
                        ) : isCopied ? (
                          <>
                            <Check className="h-3 w-3" />
                            <span>COPIED!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>COPY</span>
                          </>
                        )}
                      </button>
                    </div>

                    {isCopied && (
                      <p className="text-[9px] text-emerald-400 font-bold text-center animate-in fade-in duration-200">
                        ✓ Copied to clipboard!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
