'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import {
  Star,
  ShieldCheck,
  ThumbsUp,
  MessageSquarePlus,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const CustomerReviewsSection: React.FC = () => {
  const {
    reviews,
    products,
    likeReview,
    deleteReview,
    isAdmin,
    isSuperAdmin,
    user,
    setIsWriteReviewOpen,
    setTargetReviewProduct,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll carousel left or right
  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  // Simple clean stats
  const averageRating = useMemo(() => {
    if (!reviews.length) return '4.9';
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  // Filter categories
  const categories = [
    { id: 'all', label: 'All Reviews' },
    { id: 'ai', label: 'AI & GPT' },
    { id: 'streaming', label: 'Streaming' },
    { id: 'dev', label: 'Developer' },
    { id: 'vpn_security', label: 'Security & VPN' },
  ];

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (starFilter !== 'all' && r.rating !== starFilter) return false;
      if (activeCategory !== 'all') {
        const prod = products.find(p => p.id === r.productId);
        if (prod && prod.category !== activeCategory) return false;
      }
      return true;
    });
  }, [reviews, starFilter, activeCategory, products]);

  const getRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 30) return `${diffDays}d ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
      return `${Math.floor(diffDays / 365)}y ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <section className="relative w-full space-y-5 pt-4 pb-8" id="reviews-section" suppressHydrationWarning>
      
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-cyan-400 text-[11px] font-semibold">
            <Sparkles className="h-3 w-3" />
            <span>CUSTOMER REVIEWS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Verified Customer Experiences
          </h2>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              <span className="font-bold text-white text-sm">{averageRating}</span>
            </div>
            <span>·</span>
            <span>Based on {reviews.length} ratings</span>
            <span>·</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> 100% Real Buyers
            </span>
          </div>
        </div>

        {/* Actions Row: Navigation Arrows + Write Review Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Left/Right Scroll Arrows */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-colors shadow-sm cursor-pointer"
              title="Scroll Left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-colors shadow-sm cursor-pointer"
              title="Scroll Right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Write Review Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setTargetReviewProduct(null);
              setIsWriteReviewOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            <span>Write a Review</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-zinc-800 text-white border border-white/20 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80 border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 5-Star toggle */}
        <button
          onClick={() => setStarFilter(starFilter === 5 ? 'all' : 5)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
            starFilter === 5
              ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
              : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-white/5'
          }`}
        >
          <Star className="h-3 w-3 fill-current" />
          <span>5 Stars Only</span>
        </button>
      </div>

      {/* 3. Compact Horizontally Scrollable Review Cards Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3.5 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scroll-smooth scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <AnimatePresence mode="popLayout">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((rev) => {
              const currentUserId = user?.id || 'anonymous_user';
              const isLiked = rev.likedBy?.includes(currentUserId);

              return (
                <motion.div
                  key={rev.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.22 }}
                  className="w-[290px] sm:w-[320px] shrink-0 snap-start p-4 rounded-2xl bg-zinc-900/95 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(6,182,212,0.12)] flex flex-col justify-between space-y-3 contain-card"
                >
                  <div className="space-y-2.5">
                    {/* Top Row: User Avatar, Name, Verified & Star Rating */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={rev.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.userName || 'Customer')}&background=06b6d4&color=fff&size=100`}
                          alt={rev.userName}
                          loading="lazy"
                          decoding="async"
                          className="h-7 w-7 rounded-full object-cover border border-white/10 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.userName || 'Customer')}&background=06b6d4&color=fff&size=100`;
                          }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-xs text-white truncate">{rev.userName}</span>
                            {rev.verifiedPurchase && (
                              <span className="text-[10px] text-emerald-400 font-semibold shrink-0">✓</span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500 block leading-tight">{getRelativeTime(rev.createdAt)}</span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3 w-3 ${s <= rev.rating ? 'fill-amber-400' : 'text-zinc-700'}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Product Chip */}
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-800/80 border border-white/5 text-[10px] text-zinc-300 max-w-full truncate">
                      {rev.productLogo && (
                        <img src={rev.productLogo} alt={rev.productName} loading="lazy" decoding="async" className="h-3 w-3 rounded object-cover shrink-0" />
                      )}
                      <span className="font-semibold truncate">{rev.productName}</span>
                      {rev.planDuration && (
                        <span className="text-zinc-500 text-[9px] shrink-0">· {rev.planDuration}</span>
                      )}
                    </div>

                    {/* Review Title & Comment */}
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white line-clamp-1 leading-snug">{rev.title}</h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{rev.comment}</p>
                    </div>
                  </div>

                  {/* Footer: Helpful Button & Admin Delete */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                    <button
                      type="button"
                      onClick={() => likeReview(rev.id)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg transition-colors text-[10px] cursor-pointer ${
                        isLiked
                          ? 'text-cyan-400 font-bold bg-cyan-950/50 border border-cyan-500/30'
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <ThumbsUp className="h-2.5 w-2.5" />
                      <span>Helpful ({rev.likes || 0})</span>
                    </button>

                    {(isAdmin || isSuperAdmin || (user && user.id === rev.userId)) && (
                      <button
                        type="button"
                        onClick={() => deleteReview(rev.id)}
                        className="p-1 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="w-full py-8 text-center space-y-2 rounded-2xl bg-zinc-900 border border-white/[0.06]">
              <p className="text-xs text-zinc-400">No reviews found in this category.</p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setStarFilter('all');
                }}
                className="text-xs font-bold text-cyan-400 hover:underline cursor-pointer"
              >
                Show all reviews
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
