'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { MOCK_COUPONS } from '@/lib/mock-data';
import { Tag, Sparkles, Copy, Check, ArrowRight, Clock, ChevronLeft, ChevronRight, Flame, Gift, Zap } from 'lucide-react';
import Link from 'next/link';

export function SpecialOffersSection() {
  const { coupons, applyCoupon, setIsCartOpen } = useApp();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Map to track completed tasks per coupon code: { [couponCode]: { [taskId]: boolean } }
  const [completedTasksMap, setCompletedTasksMap] = useState<Record<string, Record<string, boolean>>>({});

  // Ensure we always have rich display offers (from Firestore or MOCK_COUPONS fallback)
  const availableCoupons = (coupons && coupons.length > 0) ? coupons : MOCK_COUPONS;
  const activeOffers = availableCoupons.filter(c => c.isSpecialOffer);
  const displayOffers = activeOffers.length > 0 ? activeOffers : availableCoupons;

  const handleCopyCode = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
    } catch { }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleApplyAndClaim = (code: string) => {
    applyCoupon(code);
    setAppliedCode(code);
    handleCopyCode(code);
    setTimeout(() => setAppliedCode(null), 3000);
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
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="exclusive-deals" className="relative overflow-hidden py-6 sm:py-8 scroll-mt-20">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-gradient-to-r from-blue-600/15 via-cyan-500/20 to-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Section Header with Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-wide uppercase mb-1.5 shadow-sm">
              <Flame className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>Limited Time Promos &amp; Offers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Exclusive Deals &amp; Giveaways</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                LIVE
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Claim verified coupon codes, flash discounts, and 100% free community giveaways for premium digital suites.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-white/10 shadow-md">
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
              className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors px-3 py-2 rounded-xl bg-cyan-950/50 border border-cyan-500/20 hover:border-cyan-500/40"
            >
              <span>View Catalog</span>
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
            const isApplied = appliedCode === offer.code;

            const tasks = offer.requiredTasks || [];
            const offerCompletedTasks = completedTasksMap[offer.code] || {};
            const isUnlocked = tasks.every((t) => !t.isRequired || offerCompletedTasks[t.id]);

            return (
              <div
                key={offer.code}
                className={`w-[290px] sm:w-[325px] shrink-0 snap-start relative rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 border shadow-xl hover:-translate-y-1 ${
                  isGiveaway
                    ? 'bg-gradient-to-br from-amber-950/50 via-zinc-900 to-amber-950/30 border-amber-500/40 hover:border-amber-400 shadow-amber-500/10'
                    : offer.discountPercent >= 40
                    ? 'bg-gradient-to-br from-blue-950/50 via-zinc-900 to-cyan-950/40 border-cyan-500/40 hover:border-cyan-400 shadow-cyan-500/10'
                    : 'bg-zinc-900/90 border-white/[0.12] hover:border-white/25'
                }`}
              >
                {/* Optional Custom Picture Banner */}
                {offer.offerImage && (
                  <div className="relative h-32 w-full overflow-hidden">
                    <img
                      src={offer.offerImage}
                      alt={offer.offerTitle || offer.code}
                      className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />

                    {/* Top Overlay Badge */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1 z-10">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-md backdrop-blur-md ${
                        isGiveaway
                          ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                          : 'bg-cyan-950/90 text-cyan-300 border-cyan-500/50'
                      }`}>
                        {offer.offerTag || (isGiveaway ? '🎁 FREE GIVEAWAY' : `⚡ ${offer.discountPercent}% OFF`)}
                      </span>

                      <span className="text-[9px] font-mono text-white px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md flex items-center gap-1 border border-white/10">
                        <Clock className="h-2.5 w-2.5 text-cyan-400" /> Limited
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-4 sm:p-5 flex flex-col justify-between gap-4 flex-1">
                  {/* Top Badge Row (if no custom offerImage) */}
                  {!offer.offerImage && (
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                        isGiveaway
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      }`}>
                        {offer.offerTag || (isGiveaway ? '🎁 FREE GIVEAWAY' : `⚡ ${offer.discountPercent}% OFF`)}
                      </span>

                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-cyan-400" /> Limited Deal
                      </span>
                    </div>
                  )}

                  {/* Main Content */}
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl sm:text-3xl font-black ${
                        isGiveaway ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {isGiveaway ? '100% FREE' : `${offer.discountPercent}% OFF`}
                      </span>
                      {offer.minOrderAmount && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          (Min ${offer.minOrderAmount})
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-1">
                      {offer.offerTitle || offer.description || `${offer.discountPercent}% Promo Code`}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {offer.description}
                    </p>
                  </div>

                  {/* Dynamic Required Tasks Checklist (if any) */}
                  {tasks.length > 0 && (
                    <div className="p-3 rounded-2xl bg-zinc-950/90 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                          <Gift className="h-3 w-3 text-amber-400" />
                          <span>Required Steps ({Object.keys(offerCompletedTasks).length}/{tasks.length})</span>
                        </span>
                        {isUnlocked && (
                          <span className="text-[10px] text-emerald-400 font-bold">✓ Ready to Claim</span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {tasks.map((task) => {
                          const isDone = Boolean(offerCompletedTasks[task.id]);
                          return (
                            <div
                              key={task.id}
                              className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-white/5 text-xs"
                            >
                              <span className={`text-[11px] font-medium truncate max-w-[160px] ${isDone ? 'text-emerald-400 line-through' : 'text-slate-300'}`}>
                                {task.label}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCompleteTask(offer.code, task.id, task.url)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                                  isDone
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                                }`}
                              >
                                {isDone ? '✓ Completed' : 'Unlock ↗'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Coupon Code Copy & Claim Action Box */}
                  <div className="pt-2 border-t border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-2xl bg-zinc-950 border border-white/10">
                      <div className="flex items-center gap-2 min-w-0 pl-1">
                        <Tag className="h-4 w-4 text-cyan-400 shrink-0" />
                        <span className="font-mono font-black text-white text-xs tracking-wider select-all truncate">
                          {isUnlocked ? offer.code : '••••••••'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => isUnlocked && handleCopyCode(offer.code)}
                          disabled={!isUnlocked}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                            !isUnlocked
                              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/10'
                              : isCopied
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-slate-200 border border-white/10'
                          }`}
                          title="Copy promo code"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>COPIED</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>COPY</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => isUnlocked && handleApplyAndClaim(offer.code)}
                          disabled={!isUnlocked}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                            !isUnlocked
                              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                              : isApplied
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md'
                          }`}
                          title="Apply coupon directly to cart"
                        >
                          <Zap className="h-3.5 w-3.5" />
                          <span>{isApplied ? 'APPLIED!' : 'APPLY'}</span>
                        </button>
                      </div>
                    </div>

                    {(isCopied || isApplied) && (
                      <p className="text-[10px] text-emerald-400 font-bold text-center animate-in fade-in duration-200">
                        {isApplied ? '✓ Coupon applied to your checkout cart!' : '✓ Promo code copied to clipboard!'}
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
