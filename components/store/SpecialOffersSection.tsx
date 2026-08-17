'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Tag, Sparkles, Copy, Check, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

export function SpecialOffersSection() {
  const { coupons } = useApp();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filter coupons marked as special offers or fallback to all coupons
  const activeOffers = coupons.filter(c => c.isSpecialOffer);
  const displayOffers = activeOffers.length > 0 ? activeOffers : coupons;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  if (!displayOffers || displayOffers.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-6 sm:py-8">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-gradient-to-r from-blue-600/10 via-cyan-500/15 to-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-wide uppercase mb-2 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Special Offers, Giveaways &amp; Promo Codes</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Exclusive Deals &amp; Claimable Coupon Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Copy promo codes instantly, unlock free giveaways, and save up to 80% on official digital subscriptions.
            </p>
          </div>

          <Link
            href="#catalog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Explore All Catalog Deals</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayOffers.map((offer) => {
            const isGiveaway = offer.type === 'giveaway' || offer.discountPercent >= 100 || offer.offerTag?.toLowerCase().includes('giveaway');
            const isCopied = copiedCode === offer.code;

            return (
              <div
                key={offer.code}
                className={`relative rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 border shadow-xl hover:-translate-y-1 ${
                  isGiveaway
                    ? 'bg-gradient-to-br from-amber-950/40 via-zinc-900 to-amber-950/20 border-amber-500/40 hover:border-amber-400 shadow-amber-500/10'
                    : offer.discountPercent >= 40
                    ? 'bg-gradient-to-br from-blue-950/40 via-zinc-900 to-cyan-950/30 border-cyan-500/40 hover:border-cyan-400 shadow-cyan-500/10'
                    : 'bg-zinc-900/90 border-white/[0.08] hover:border-white/20'
                }`}
              >
                {/* Optional Custom Offer Picture Banner */}
                {offer.offerImage && (
                  <div className="relative h-36 w-full overflow-hidden">
                    <img
                      src={offer.offerImage}
                      alt={offer.offerTitle || offer.code}
                      className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />

                    {/* Top Overlay Badge */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-md backdrop-blur-md ${
                        isGiveaway
                          ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                          : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
                      }`}>
                        {offer.offerTag || (isGiveaway ? '🎁 FREE GIVEAWAY' : `⚡ ${offer.discountPercent}% OFF DEAL`)}
                      </span>

                      <span className="text-[10px] font-mono text-white px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md flex items-center gap-1">
                        <Clock className="h-3 w-3 text-cyan-400" /> Limited Time
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6 flex flex-col justify-between gap-5 flex-1">
                  {/* Top Badge Row (if no custom offerImage) */}
                  {!offer.offerImage && (
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                        isGiveaway
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      }`}>
                        {offer.offerTag || (isGiveaway ? '🎁 FREE GIVEAWAY' : `⚡ ${offer.discountPercent}% OFF DEAL`)}
                      </span>

                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-cyan-400" /> Limited Time
                      </span>
                    </div>
                  )}

                  {/* Main Content */}
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl sm:text-4xl font-black ${
                        isGiveaway ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {isGiveaway ? '100% FREE' : `${offer.discountPercent}% OFF`}
                      </span>
                      {offer.minOrderAmount && (
                        <span className="text-xs text-slate-400 font-medium">
                          (Min order ${offer.minOrderAmount})
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">
                      {offer.offerTitle || offer.description || `${offer.discountPercent}% Promo Discount Code`}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {offer.description}
                    </p>
                  </div>

                  {/* Coupon Code Copy & Claim Action Box */}
                  <div className="pt-3 border-t border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-950 border border-white/10">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-cyan-400 shrink-0" />
                        <span className="font-mono font-black text-white text-sm tracking-wider select-all">
                          {offer.code}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyCode(offer.code)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>COPIED!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>COPY CODE</span>
                          </>
                        )}
                      </button>
                    </div>

                    {isCopied && (
                      <p className="text-[10px] text-emerald-400 font-bold text-center animate-in fade-in duration-200">
                        ✓ Promo code copied to clipboard! Paste at checkout.
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
