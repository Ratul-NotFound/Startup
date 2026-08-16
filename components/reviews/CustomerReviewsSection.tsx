'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import {
  Star,
  ShieldCheck,
  ThumbsUp,
  MessageSquarePlus,
  Trash2,
  Sparkles,
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
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // Simple clean stats
  const averageRating = useMemo(() => {
    if (!reviews.length) return '4.9';
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  // Clean filter categories
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

  const displayedReviews = filteredReviews.slice(0, visibleCount);

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
    <section className="relative w-full space-y-6 pt-4 pb-10" id="reviews-section" suppressHydrationWarning>
      
      {/* 1. Clean Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-cyan-400 text-[11px] font-semibold">
            <Sparkles className="h-3 w-3" />
            <span>CUSTOMER REVIEWS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Verified Experiences
          </h2>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              <span className="font-bold text-white text-sm">{averageRating}</span>
            </div>
            <span>·</span>
            <span>Based on {reviews.length} verified ratings</span>
            <span>·</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> 100% Real Buyers
            </span>
          </div>
        </div>

        {/* Write Review Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            setTargetReviewProduct(null);
            setIsWriteReviewOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm shrink-0"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
          <span>Write a Review</span>
        </motion.button>
      </div>

      {/* 2. Simple Filter Pills */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-zinc-800 text-white border border-white/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 5-Star toggle */}
        <button
          onClick={() => setStarFilter(starFilter === 5 ? 'all' : 5)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shrink-0 ${
            starFilter === 5
              ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
              : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-white/5'
          }`}
        >
          <Star className="h-3 w-3 fill-current" />
          <span>5 Stars</span>
        </button>
      </div>

      {/* 3. Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
        <AnimatePresence mode="popLayout">
          {displayedReviews.length > 0 ? (
            displayedReviews.map((rev) => {
              const currentUserId = user?.id || 'anonymous_user';
              const isLiked = rev.likedBy?.includes(currentUserId);

              return (
                <motion.div
                  key={rev.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="p-5 rounded-2xl bg-zinc-900 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Author Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={rev.userName}
                          loading="lazy"
                          decoding="async"
                          className="h-8 w-8 rounded-full object-cover border border-white/10"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white">{rev.userName}</span>
                            {rev.verifiedPurchase && (
                              <span className="text-[10px] text-emerald-400 font-medium">✓ Verified</span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500">{getRelativeTime(rev.createdAt)}</span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3 w-3 ${s <= rev.rating ? 'fill-amber-400' : 'text-zinc-700'}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Product Chip */}
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-zinc-800/80 border border-white/5 text-[11px] text-zinc-300">
                      {rev.productLogo && (
                        <img src={rev.productLogo} alt={rev.productName} loading="lazy" decoding="async" className="h-3.5 w-3.5 rounded object-cover" />
                      )}
                      <span className="font-semibold">{rev.productName}</span>
                      {rev.planDuration && (
                        <span className="text-zinc-500 text-[10px]">· {rev.planDuration}</span>
                      )}
                    </div>

                    {/* Headline & Text */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white leading-snug">{rev.title}</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">{rev.comment}</p>
                    </div>
                  </div>

                  {/* Footer: Helpful Button & Admin Delete */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                    <button
                      type="button"
                      onClick={() => likeReview(rev.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors text-[11px] ${
                        isLiked
                          ? 'text-cyan-400 font-bold bg-cyan-950/50'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>Helpful ({rev.likes || 0})</span>
                    </button>

                    {(isAdmin || isSuperAdmin || (user && user.id === rev.userId)) && (
                      <button
                        type="button"
                        onClick={() => deleteReview(rev.id)}
                        className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
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
            <div className="col-span-full py-10 text-center space-y-2 rounded-2xl bg-zinc-900 border border-white/[0.06]">
              <p className="text-xs text-zinc-400">No reviews found in this category.</p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setStarFilter('all');
                }}
                className="text-xs font-bold text-cyan-400 hover:underline"
              >
                Show all reviews
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Load More Button */}
      {filteredReviews.length > visibleCount && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 6)}
            className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-white/10 transition-colors"
          >
            Show more reviews
          </button>
        </div>
      )}
    </section>
  );
};
