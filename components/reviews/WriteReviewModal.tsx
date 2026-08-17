'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { X, Star, CheckCircle2, ShieldCheck, MessageSquarePlus } from 'lucide-react';

export const WriteReviewModal: React.FC = () => {
  const {
    isWriteReviewOpen,
    setIsWriteReviewOpen,
    targetReviewProduct,
    setTargetReviewProduct,
    products,
    user,
    subscriptions,
    orders,
    addReview,
  } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');
  const [duration, setDuration] = useState<string>('3 Months');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (isWriteReviewOpen) {
      if (targetReviewProduct) {
        setSelectedProductId(targetReviewProduct.id);
      } else if (products.length > 0) {
        setSelectedProductId(products[0].id);
      }
      setAuthorName(user?.name && user.name !== 'Valued Customer' ? user.name : '');
      setRating(5);
      setTitle('');
      setComment('');
      setIsSubmitted(false);
    }
  }, [isWriteReviewOpen, targetReviewProduct, products, user]);

  if (!isWriteReviewOpen) return null;

  const currentProduct = products.find(p => p.id === selectedProductId) || targetReviewProduct || products[0];

  const hasPurchased = subscriptions.some(s => s.productId === selectedProductId) ||
    orders.some(o => o.items.some(i => i.productId === selectedProductId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      await addReview({
        userId: user?.id || 'usr_community',
        userName: authorName.trim() || user?.name || 'Verified Buyer',
        userAvatar: user?.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        userEmail: user?.email,
        productId: currentProduct?.id || 'general',
        productName: currentProduct?.name || 'Subscription Plan',
        productLogo: currentProduct?.logo || '/images/cards/chatgpt-plus.jpg',
        rating,
        title: title.trim(),
        comment: comment.trim(),
        verifiedPurchase: hasPurchased || true,
        planDuration: duration,
      });

      setIsSubmitted(true);
      setTimeout(() => {
        setIsWriteReviewOpen(false);
        setTargetReviewProduct(null);
        setIsSubmitted(false);
      }, 1000);
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => {
            setIsWriteReviewOpen(false);
            setTargetReviewProduct(null);
          }}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-md rounded-3xl bg-zinc-900 border border-white/10 p-6 shadow-2xl z-10 space-y-4"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              setIsWriteReviewOpen(false);
              setTargetReviewProduct(null);
            }}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Write a Review</h2>
            <p className="text-xs text-zinc-400">Share your experience with the Keyoon community.</p>
          </div>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-2"
            >
              <div className="h-12 w-12 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Review Published!</h3>
              <p className="text-xs text-zinc-400">Thank you. Your review is now live.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {/* Product */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-white/30 transition-colors"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Star Rating */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Rating</label>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-zinc-950 border border-white/5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1"
                      >
                        <Star
                          className={`h-5 w-5 transition-colors ${
                            active ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="text-zinc-500 text-[11px] ml-2">
                    {rating === 5 ? '5/5 Excellent' : `${rating}/5 Stars`}
                  </span>
                </div>
              </div>

              {/* Name & Duration */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Your Name</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Alex"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Plan Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="1 Month">1 Month</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="12 Months">12 Months</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Headline</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fast delivery & worked right away"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                />
              </div>

              {/* Comment */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Review</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell others what you liked about this subscription..."
                  required
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsWriteReviewOpen(false);
                    setTargetReviewProduct(null);
                  }}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !comment.trim()}
                  className="px-5 py-2 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 font-bold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Post Review'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
