'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import {
  X, ShoppingBag, Zap, ShieldCheck, Star, CheckCircle2,
  Share2, Link2, BookOpen, Layers, MessageSquare, ThumbsUp,
  Monitor, Globe, Lock, AlertCircle, HelpCircle, Check,
  ChevronRight, Sparkles, UserCheck, Clock, ExternalLink
} from 'lucide-react';
import { Review } from '@/types';

type ModalTab = 'overview' | 'docs' | 'reviews';

export const ProductModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    cart,
    addToCart,
    setIsCartOpen,
    setIsCheckoutOpen,
    applyCoupon,
    coupons,
    reviews,
    likeReview,
    setIsWriteReviewOpen,
    setTargetReviewProduct,
    formatPrice,
    completedTasksMap,
    markTaskCompleted,
    isTaskCompleted,
    isEntityFullyUnlocked,
    isSpecialOfferClaimed,
    isCouponAlreadyUsed,
    user,
  } = useApp();

  const [activeTab, setActiveTab] = useState<ModalTab>('overview');
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(0);
  const [customEmail, setCustomEmail] = useState('');
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // Link to any active promo / special deal coupon tied to this product
  const linkedCoupon = useMemo(() => {
    if (!selectedProduct) return null;
    return (coupons || []).find(
      c => c.linkedProductId === selectedProduct.id ||
      (selectedProduct.specialConfig?.unlockedCouponCode && c.code.toUpperCase() === selectedProduct.specialConfig.unlockedCouponCode.toUpperCase())
    );
  }, [coupons, selectedProduct]);

  // Aggregate all tasks configured for this special product
  const specialTasks = useMemo(() => {
    if (!selectedProduct) return [];
    if (selectedProduct.specialConfig?.tasks && selectedProduct.specialConfig.tasks.length > 0) {
      return selectedProduct.specialConfig.tasks;
    }
    if (linkedCoupon?.requiredTasks && linkedCoupon.requiredTasks.length > 0) {
      return linkedCoupon.requiredTasks.map(t => ({
        id: t.id,
        title: t.label,
        url: t.url,
        type: t.type || 'custom_action',
        isRequired: t.isRequired ?? true,
      }));
    }
    return [];
  }, [selectedProduct, linkedCoupon]);

  const isSpecialProduct = useMemo(() => {
    if (!selectedProduct) return false;
    return (
      selectedProduct.productType === 'special' ||
      specialTasks.length > 0 ||
      !!selectedProduct.specialConfig ||
      !!selectedProduct.isFreeProduct ||
      !!linkedCoupon
    );
  }, [selectedProduct, specialTasks, linkedCoupon]);

  useEffect(() => {
    if (selectedProduct) {
      const popIdx = selectedProduct.pricingTiers.findIndex(t => t.isPopular);
      setSelectedPlanIndex(popIdx !== -1 ? popIdx : 0);
      setCustomEmail('');
      setAdded(false);
      setCopiedCoupon(false);
      setActiveImageIndex(0);
      setActiveTab('overview');
      setExpandedFaq(null);
    }
  }, [selectedProduct]);

  // Product-specific reviews
  const productReviews = useMemo(() => {
    if (!selectedProduct) return [];
    const directMatches = reviews.filter(
      r => r.productId === selectedProduct.id ||
      r.productName.toLowerCase() === selectedProduct.name.toLowerCase()
    );
    // If no direct reviews yet, show top verified reviews as social proof
    if (directMatches.length === 0) {
      return reviews.slice(0, 3);
    }
    return directMatches;
  }, [reviews, selectedProduct]);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/?product=${selectedProduct?.id}` : '';
    const shareData = {
      title: selectedProduct?.name ?? '',
      text: `${selectedProduct?.tagline ?? selectedProduct?.description ?? ''} — from Keyoon`,
      url,
    };
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share(shareData); } catch (_) {}
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentPlan = selectedProduct
    ? selectedProduct.pricingTiers[selectedPlanIndex] ?? selectedProduct.pricingTiers[0]
    : null;

  const handleAddToCart = () => {
    if (!selectedProduct || !currentPlan) return;
    addToCart(selectedProduct, currentPlan, customEmail || undefined);
    setAdded(true);
    setTimeout(() => {
      setSelectedProduct(null);
      setIsCartOpen(true);
    }, 500);
  };

  const handleOpenWriteReview = () => {
    if (!selectedProduct) return;
    setTargetReviewProduct(selectedProduct);
    setIsWriteReviewOpen(true);
  };

  if (!selectedProduct || !currentPlan) return null;

  const galleryImages = (selectedProduct.images && selectedProduct.images.length > 0)
    ? selectedProduct.images
    : [selectedProduct.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'];

  const currentImage = galleryImages[activeImageIndex] || galleryImages[0];

  // Dynamic FAQs based on product attributes
  const faqs = [
    {
      q: `How do I receive my ${selectedProduct.name} credentials?`,
      a: `Immediately after checkout confirmation, your credentials and activation guide are unlocked in your private Keyoon Vault under your account dashboard (${selectedProduct.deliveryTimeEstimate}).`,
    },
    {
      q: `What is the warranty and replacement policy?`,
      a: `Every subscription comes with a 100% Full-Term Replacement Warranty. If you ever experience issues, our automated auto-renewal & support engine resolves or replaces your slot immediately.`,
    },
    {
      q: `Can I use this on multiple devices?`,
      a: `Yes! Supported platforms include ${selectedProduct.specs.platforms.join(', ')}. ${selectedProduct.specs.screens ? `You can use up to ${selectedProduct.specs.screens} simultaneous screen(s)/profile(s).` : 'Standard personal multi-device login supported.'}`,
    },
    {
      q: `Will my personal history/playlists/chats be preserved?`,
      a: selectedProduct.accountType === 'direct_upgrade' || selectedProduct.accountType === 'private_account'
        ? 'Yes, this is an official dedicated license applied directly or allocated as a private master workspace.'
        : 'Yes, your dedicated slot or profile is strictly PIN-locked and isolated for your private use.',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setSelectedProduct(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ type: 'spring', damping: 28, stiffness: 360 }}
          className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-t-[28px] sm:rounded-[28px] bg-zinc-950/95 border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.9)] z-10 overflow-hidden"
        >
          {/* Top Header Banner */}
          <div className="relative shrink-0 h-44 sm:h-52 w-full bg-zinc-950 overflow-hidden">
            <img
              src={currentImage}
              alt={selectedProduct.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-60 transition-opacity duration-300"
              onError={e => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-zinc-950/80" />

            {/* Top Action Buttons (Share & Close) */}
            <div className="absolute top-3.5 right-3.5 flex items-center gap-2 z-20">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/15 backdrop-blur-md text-xs font-semibold shadow-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[11px]">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 text-zinc-300" />
                    <span className="text-[11px] text-zinc-200">Share</span>
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white border border-white/15 backdrop-blur-md shadow-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            {/* Identity & Badges overlay */}
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl overflow-hidden border border-white/20 bg-zinc-900 shadow-xl shrink-0 p-0.5">
                  <img
                    src={selectedProduct.logo}
                    alt={selectedProduct.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">{selectedProduct.name}</h2>
                    {selectedProduct.badge && (
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {selectedProduct.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors group cursor-pointer"
                    >
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-amber-300">{selectedProduct.rating.toFixed(2)}</span>
                      <span className="text-zinc-500 text-[11px]">·</span>
                      <span className="text-[11px] text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        {productReviews.length} Reviews
                      </span>
                    </button>

                    {(selectedProduct.stockCount ?? 0) <= 0 ? (
                      <span className="text-[11px] text-rose-400 font-medium flex items-center gap-1 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-500/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                        Out of Stock (0)
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        In Stock ({selectedProduct.stockCount})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Gallery Image Selector Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="hidden sm:flex items-center gap-1.5 bg-black/50 backdrop-blur-md p-1 rounded-xl border border-white/10">
                  {galleryImages.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`h-7 w-7 rounded-lg overflow-hidden border transition-all ${
                        activeImageIndex === idx
                          ? 'border-cyan-400 ring-2 ring-cyan-400/40 scale-105'
                          : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="shrink-0 flex items-center gap-2 px-4 sm:px-6 pt-3 pb-2 border-b border-white/[0.08] bg-zinc-950/80">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              Overview & Pricing
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'docs'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Docs & Guide
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'reviews'
                  ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Reviews ({productReviews.length})
            </button>
          </div>

          {/* Tab Content Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-h-[50vh] sm:max-h-[54vh] scrollbar-thin">
            
            {/* ═════════ TAB 1: OVERVIEW & PRICING ═════════ */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Tagline */}
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                  {selectedProduct.tagline || selectedProduct.description}
                </p>

                {/* ═════════ SPECIAL PRODUCT TASKS & MISSION REWARDS DRAWER ═════════ */}
                {isSpecialProduct && (
                  <div
                    id="special-tasks-section"
                    className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-zinc-900 to-zinc-950 border border-amber-500/30 shadow-lg shadow-amber-950/20 space-y-4"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
                          {selectedProduct.specialConfig?.campaignBadge || (selectedProduct.isFreeProduct ? '🎁 100% FREE SPECIAL CLAIM' : '⚡ SPECIAL MISSION DEAL')}
                        </span>
                        <span className="text-[11px] font-bold text-slate-300">
                          {selectedProduct.specialConfig?.campaignTitle || 'Complete Tasks to Unlock Special Access'}
                        </span>
                      </div>

                      {/* Tasks Completion Progress Badge */}
                      {(() => {
                        const tasks = specialTasks;
                        const completedCount = tasks.filter(t => {
                          if (t.type === 'write_review') {
                            const hasReviewed = reviews.some(r => r.productId === selectedProduct.id || (user?.email && r.userEmail === user.email));
                            return hasReviewed || isTaskCompleted(selectedProduct.id, t.id) || (linkedCoupon ? isTaskCompleted(linkedCoupon.code, t.id) : false);
                          }
                          return isTaskCompleted(selectedProduct.id, t.id) || (linkedCoupon ? isTaskCompleted(linkedCoupon.code, t.id) : false);
                        }).length;
                        const isUnlocked = tasks.length === 0 || completedCount === tasks.length;

                        return (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isUnlocked
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-zinc-800 text-amber-300 border border-white/10'
                          }`}>
                            {isUnlocked ? '🎉 ALL TASKS COMPLETED' : `${completedCount} of ${tasks.length} Tasks Done`}
                          </span>
                        );
                      })()}
                    </div>

                    {selectedProduct.specialConfig?.campaignDescription && (
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedProduct.specialConfig.campaignDescription}
                      </p>
                    )}

                    {/* Interactive Tasks Checklist */}
                    {specialTasks.length > 0 ? (
                      <div className="space-y-2">
                        {specialTasks.map((task, tIdx) => {
                          // Check review task completion
                          const isReviewType = task.type === 'write_review' || task.id.includes('rev');
                          const hasUserReviewed = isReviewType && (
                            reviews.some(r => r.productId === selectedProduct.id || (user?.email && r.userEmail === user.email)) ||
                            isTaskCompleted(selectedProduct.id, task.id) ||
                            (linkedCoupon ? isTaskCompleted(linkedCoupon.code, task.id) : false)
                          );
                          const isDone = isReviewType
                            ? hasUserReviewed
                            : (isTaskCompleted(selectedProduct.id, task.id) || (linkedCoupon ? isTaskCompleted(linkedCoupon.code, task.id) : false));

                          return (
                            <div
                              key={task.id || tIdx}
                              className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                                isDone
                                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                                  : 'bg-zinc-900/90 border-white/10 text-white hover:border-amber-500/30'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                                  isDone
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-zinc-800 text-amber-300 border border-white/10'
                                }`}>
                                  {isDone ? (
                                    <Check className="h-4 w-4 text-emerald-400" />
                                  ) : (
                                    <span>#{tIdx + 1}</span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold truncate flex items-center gap-1.5">
                                    <span>{task.title}</span>
                                    {task.isRequired && (
                                      <span className="text-[9px] text-amber-400 font-normal">(Required)</span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 block truncate">
                                    {task.type === 'join_telegram' && '📱 Join Official Telegram Channel'}
                                    {task.type === 'follow_facebook' && '👍 Follow Official Facebook Page'}
                                    {task.type === 'write_review' && '⭐ Write a verified review for this product'}
                                    {task.type === 'youtube_sub' && '🎬 Subscribe to YouTube Channel'}
                                    {task.type === 'discord_join' && '💬 Join Discord Community'}
                                    {task.type === 'custom_action' && '🔗 Complete promotional mission'}
                                    {!task.type && '🔗 Complete promotional task'}
                                  </span>
                                </div>
                              </div>

                              <div className="shrink-0">
                                {isDone ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                    <Check className="h-3 w-3" /> Verified
                                  </span>
                                ) : isReviewType ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTargetReviewProduct(selectedProduct);
                                      setIsWriteReviewOpen(true);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Star className="h-3 w-3 fill-zinc-950" />
                                    Write Review
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (task.url) {
                                        window.open(task.url, '_blank', 'noopener,noreferrer');
                                      }
                                      markTaskCompleted(selectedProduct.id, task.id);
                                      if (linkedCoupon) {
                                        markTaskCompleted(linkedCoupon.code, task.id);
                                      }
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <span>Complete</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 text-xs text-slate-300">
                        🎁 No external tasks required — this special deal is ready to claim directly!
                      </div>
                    )}

                    {/* Unlocked Reward Banner */}
                    {(() => {
                      const tasks = specialTasks;
                      const completedCount = tasks.filter(t => {
                        if (t.type === 'write_review') {
                          const hasReviewed = reviews.some(r => r.productId === selectedProduct.id || (user?.email && r.userEmail === user.email));
                          return hasReviewed || isTaskCompleted(selectedProduct.id, t.id) || (linkedCoupon ? isTaskCompleted(linkedCoupon.code, t.id) : false);
                        }
                        return isTaskCompleted(selectedProduct.id, t.id) || (linkedCoupon ? isTaskCompleted(linkedCoupon.code, t.id) : false);
                      }).length;
                      const isUnlocked = tasks.length > 0 && completedCount === tasks.length;
                      const unlockedCode = selectedProduct.specialConfig?.unlockedCouponCode || linkedCoupon?.code;

                      if (isUnlocked) {
                        return (
                          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between flex-wrap gap-2 animate-in fade-in duration-300">
                            <div>
                              <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                                Exclusive Reward Unlocked!
                              </span>
                              <p className="text-[11px] text-emerald-400/80">
                                All mission requirements completed! You can now claim your special access below.
                              </p>
                            </div>

                            {unlockedCode && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (!selectedProduct.specialConfig?.isPromoCodeHidden) {
                                    try { navigator.clipboard.writeText(unlockedCode); } catch {}
                                  }
                                  const targetCartItem = {
                                    product: selectedProduct,
                                    selectedPlan: currentPlan,
                                    quantity: 1,
                                    customEmail: customEmail || undefined,
                                  };
                                  const updatedCart = [...cart.filter(i => !(i.product.id === selectedProduct.id && i.selectedPlan.duration === currentPlan.duration)), targetCartItem];
                                  addToCart(selectedProduct, currentPlan, customEmail || undefined);
                                  applyCoupon(unlockedCode, updatedCart);
                                  setCopiedCoupon(true);
                                  setTimeout(() => setCopiedCoupon(false), 2500);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                              >
                                {copiedCoupon ? <Check className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                                <span>
                                  {copiedCoupon
                                    ? 'Applied to Cart!'
                                    : selectedProduct.specialConfig?.isPromoCodeHidden
                                    ? '🎁 Claim Unlocked Deal'
                                    : `Code: ${unlockedCode}`}
                                </span>
                              </button>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}

                {/* Key Features Pill Matrix */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Features Included</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedProduct.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2.5 rounded-xl bg-zinc-900/90 border border-white/[0.06] text-xs text-zinc-200"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Selection Duration Grid */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Select Duration</span>
                    <span className="text-[11px] text-cyan-400 font-semibold">Save up to {Math.max(...selectedProduct.pricingTiers.map(t => t.discountPercentage))}%</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {selectedProduct.pricingTiers.map((tier, idx) => {
                      const active = idx === selectedPlanIndex;
                      return (
                        <button
                          key={tier.duration}
                          type="button"
                          onClick={() => setSelectedPlanIndex(idx)}
                          className={`relative p-3 rounded-2xl text-left transition-all border ${
                            active
                              ? 'bg-zinc-800 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400'
                              : 'bg-zinc-900/80 border-white/[0.08] hover:bg-zinc-850 hover:border-white/20'
                          }`}
                        >
                          {tier.isPopular && (
                            <span className="absolute -top-2 right-2 text-[8px] font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-2 py-0.5 rounded-full shadow-md">
                              Popular
                            </span>
                          )}

                          <div className={`font-bold text-xs ${active ? 'text-white' : 'text-zinc-300'}`}>
                            {tier.label}
                          </div>

                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-sm font-black text-white">{formatPrice(tier.price)}</span>
                            {tier.originalPrice && (
                              <span className="text-[10px] text-zinc-500 line-through">{formatPrice(tier.originalPrice)}</span>
                            )}
                          </div>

                          {tier.discountPercentage > 0 && (
                            <div className="mt-1 text-[10px] font-semibold text-emerald-400">
                              Save {tier.discountPercentage}%
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Specs / Assurance Quick Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-white/[0.06]">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase font-bold">
                      <Zap className="h-3 w-3 text-emerald-400" />
                      Delivery
                    </div>
                    <div className="text-xs font-semibold text-white mt-1 truncate">{selectedProduct.deliveryTimeEstimate}</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-white/[0.06]">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase font-bold">
                      <ShieldCheck className="h-3 w-3 text-cyan-400" />
                      Warranty
                    </div>
                    <div className="text-xs font-semibold text-white mt-1 truncate">Full Replacement</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-white/[0.06]">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase font-bold">
                      <Globe className="h-3 w-3 text-indigo-400" />
                      Region
                    </div>
                    <div className="text-xs font-semibold text-white mt-1 truncate">{selectedProduct.specs.region || 'Global'}</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-white/[0.06]">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase font-bold">
                      <Lock className="h-3 w-3 text-purple-400" />
                      Account
                    </div>
                    <div className="text-xs font-semibold text-white mt-1 capitalize truncate">
                      {selectedProduct.accountType.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                {/* Custom Email Input (if direct upgrade) */}
                {(selectedProduct.accountType === 'direct_upgrade' || selectedProduct.deliveryType === 'custom_email') && (
                  <div className="space-y-1.5 p-3 rounded-2xl bg-zinc-900/90 border border-cyan-500/20">
                    <label className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" />
                      Direct Account Upgrade Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={customEmail}
                      onChange={e => setCustomEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.code === 'Space') {
                          e.stopPropagation();
                        }
                      }}
                      placeholder="Enter the email address you want upgraded"
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <p className="text-[10px] text-zinc-400">
                      Leave blank if you prefer receiving dedicated credentials in your private Vault instead.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ═════════ TAB 2: DOCUMENTATION & GUIDE ═════════ */}
            {activeTab === 'docs' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Step-by-Step Activation Guide */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                    <BookOpen className="h-4 w-4" />
                    Step-by-Step Activation Protocol
                  </div>

                  <div className="space-y-2.5">
                    {selectedProduct.instructions.map((inst, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-900/80 border border-white/[0.08]"
                      >
                        <div className="h-6 w-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-black text-xs flex items-center justify-center shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-zinc-200 leading-relaxed">{inst}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Specifications Matrix */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                    <Layers className="h-4 w-4 text-indigo-400" />
                    Product Specifications
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.06] flex items-center justify-between">
                      <span className="text-zinc-400">Supported Platforms:</span>
                      <span className="font-semibold text-white">{selectedProduct.specs.platforms.join(', ')}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.06] flex items-center justify-between">
                      <span className="text-zinc-400">Streaming / Quality:</span>
                      <span className="font-semibold text-white">{selectedProduct.specs.quality || 'Ultra HD / Max'}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.06] flex items-center justify-between">
                      <span className="text-zinc-400">Warranty Coverage:</span>
                      <span className="font-semibold text-emerald-400">{selectedProduct.specs.warranty}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.06] flex items-center justify-between">
                      <span className="text-zinc-400">Region Lock:</span>
                      <span className="font-semibold text-cyan-300">{selectedProduct.specs.region || 'Worldwide / No VPN Required'}</span>
                    </div>
                  </div>
                </div>

                {/* Important Rules & Best Practices */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    Account Safety & Usage Rules
                  </div>
                  <ul className="text-[11px] text-zinc-300 space-y-1.5 pl-5 list-disc">
                    <li>Always use the designated PIN or slot assigned in your Vault.</li>
                    <li>Do not change account recovery credentials or billing settings to protect warranty validity.</li>
                    <li>Our automated heartbeat monitor checks uptime 24/7; any credentials flagged for renewal are refreshed in under 60 seconds.</li>
                  </ul>
                </div>

                {/* FAQs Accordion */}
                <div className="space-y-2">
                  <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Frequently Asked Questions</div>
                  <div className="space-y-1.5">
                    {faqs.map((faq, idx) => {
                      const isOpen = expandedFaq === idx;
                      return (
                        <div key={idx} className="rounded-xl bg-zinc-900/70 border border-white/[0.06] overflow-hidden">
                          <button
                            onClick={() => setExpandedFaq(isOpen ? null : idx)}
                            className="w-full p-3 text-left flex items-center justify-between gap-2 text-xs font-semibold text-zinc-200 hover:text-white"
                          >
                            <span>{faq.q}</span>
                            <ChevronRight className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${isOpen ? 'rotate-90 text-cyan-400' : ''}`} />
                          </button>
                          {isOpen && (
                            <div className="px-3 pb-3 text-xs text-zinc-400 leading-relaxed border-t border-white/[0.04] pt-2">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═════════ TAB 3: CUSTOMER REVIEWS ═════════ */}
            {activeTab === 'reviews' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Rating Overview Header Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/20 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex flex-col items-center justify-center">
                      <span className="text-lg font-black text-amber-300 leading-none">{selectedProduct.rating.toFixed(1)}</span>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-2 w-2 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Verified Customer Rating</h4>
                      <p className="text-[11px] text-zinc-400">Based on {selectedProduct.reviewCount.toLocaleString()} verified customer checkouts</p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleOpenWriteReview}
                    className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs tracking-wide transition-all shadow-md shrink-0 flex items-center gap-1.5"
                  >
                    <Star className="h-3.5 w-3.5 fill-zinc-950" />
                    Write Review
                  </motion.button>
                </div>

                {/* Review Items List */}
                <div className="space-y-3">
                  {productReviews.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl bg-zinc-900/60 border border-white/[0.06] space-y-2">
                      <Star className="h-8 w-8 text-zinc-600 mx-auto" />
                      <p className="text-xs text-zinc-400">No written reviews for this tier yet. Be the first to leave one!</p>
                      <button
                        onClick={handleOpenWriteReview}
                        className="text-xs text-amber-400 font-bold hover:underline"
                      >
                        Write a Review now
                      </button>
                    </div>
                  ) : (
                    productReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-3.5 rounded-2xl bg-zinc-900/80 border border-white/[0.07] space-y-2 hover:border-white/15 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={rev.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.userName)}&background=27272a&color=f4f4f5`}
                              alt={rev.userName}
                              className="h-7 w-7 rounded-full object-cover border border-white/10"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-white">{rev.userName}</span>
                                {rev.verifiedPurchase && (
                                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-500/20">
                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                    Verified
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-2.5 w-2.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`}
                                  />
                                ))}
                                {rev.planDuration && (
                                  <span className="text-[10px] text-zinc-500 ml-1.5">· {rev.planDuration} Plan</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Likes Button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => likeReview(rev.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-white/[0.06] text-[11px] transition-colors"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            <span>{rev.likes || 0}</span>
                          </motion.button>
                        </div>

                        {rev.title && (
                          <h5 className="text-xs font-bold text-zinc-200 leading-snug">{rev.title}</h5>
                        )}

                        <p className="text-xs text-zinc-400 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

          </div>

          {/* Persistent Footer CTA Row */}
          {(() => {
            const isFreeReward = currentPlan.price === 0 || (isSpecialProduct && (selectedProduct.specialConfig?.isFreeProduct || selectedProduct.isFreeProduct));
            const isClaimedAlready = isSpecialProduct && isSpecialOfferClaimed(selectedProduct.id);
            const tasks = specialTasks;
            const completedCount = tasks.filter(t => {
              if (t.type === 'write_review' || t.id.includes('rev')) {
                const hasReviewed = reviews.some(r => r.productId === selectedProduct.id || (user?.email && r.userEmail === user.email));
                return hasReviewed || isTaskCompleted(selectedProduct.id, t.id) || (linkedCoupon ? isTaskCompleted(linkedCoupon.code, t.id) : false);
              }
              return isTaskCompleted(selectedProduct.id, t.id) || (linkedCoupon ? isTaskCompleted(linkedCoupon.code, t.id) : false);
            }).length;
            const isTasksCompleted = tasks.length === 0 || completedCount === tasks.length;
            const unlockedCode = selectedProduct.specialConfig?.unlockedCouponCode || linkedCoupon?.code;

            const handleScrollToTasks = () => {
              setActiveTab('overview');
              setTimeout(() => {
                const el = document.getElementById('special-tasks-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  el.classList.add('ring-2', 'ring-amber-400');
                  setTimeout(() => el.classList.remove('ring-2', 'ring-amber-400'), 1500);
                }
              }, 100);
            };

            return (
              <div className="shrink-0 p-4 sm:p-5 border-t border-white/[0.08] bg-zinc-950/95 flex items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-500">Plan: {currentPlan.label}</div>
                  <div className="flex items-baseline gap-2">
                    {isFreeReward ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-2xl font-black text-emerald-400 font-mono">0 ৳ BDT</span>
                        <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                          🎁 100% Free Claim
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className="text-2xl font-black text-white">{formatPrice(currentPlan.price)}</span>
                        {currentPlan.originalPrice && (
                          <span className="text-xs text-zinc-500 line-through">{formatPrice(currentPlan.originalPrice)}</span>
                        )}
                        {currentPlan.discountPercentage > 0 && (
                          <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            -{currentPlan.discountPercentage}%
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isClaimedAlready ? (
                    <button
                      type="button"
                      disabled
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide bg-zinc-800 text-zinc-400 border border-white/10 cursor-not-allowed opacity-80"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>✓ Already Claimed (1 Per User)</span>
                    </button>
                  ) : isFreeReward ? (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={(selectedProduct.stockCount ?? 0) <= 0}
                      onClick={() => {
                        if (!isTasksCompleted) {
                          handleScrollToTasks();
                          return;
                        }
                        const targetPlan = { ...currentPlan, price: 0 };
                        const targetCartItem = {
                          product: selectedProduct,
                          selectedPlan: targetPlan,
                          quantity: 1,
                          customEmail: customEmail || undefined,
                        };
                        const updatedCart = [...cart.filter(i => !(i.product.id === selectedProduct.id && i.selectedPlan.duration === targetPlan.duration)), targetCartItem];
                        addToCart(selectedProduct, targetPlan, customEmail || undefined);
                        if (unlockedCode) {
                          applyCoupon(unlockedCode, updatedCart);
                        }
                        setSelectedProduct(null);
                        setIsCheckoutOpen(true);
                      }}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-lg cursor-pointer ${
                        !isTasksCompleted
                          ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20 font-extrabold'
                          : 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-zinc-950 shadow-emerald-500/20 font-black'
                      }`}
                    >
                      {!isTasksCompleted ? (
                        <>
                          <Zap className="h-4 w-4" />
                          <span>⚡ Complete Tasks to Claim Free ({completedCount}/{tasks.length})</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 fill-zinc-950" />
                          <span>🎁 Claim 100% Free Access Now (0 ৳)</span>
                        </>
                      )}
                    </motion.button>
                  ) : isSpecialProduct && tasks.length > 0 && !isTasksCompleted ? (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleScrollToTasks}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-xs sm:text-sm tracking-wide transition-all bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20 cursor-pointer"
                    >
                      <Zap className="h-4 w-4" />
                      <span>⚡ Complete Tasks to Unlock Deal ({completedCount}/{tasks.length})</span>
                    </motion.button>
                  ) : isSpecialProduct && isTasksCompleted ? (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={(selectedProduct.stockCount ?? 0) <= 0}
                      onClick={() => {
                        const targetCartItem = {
                          product: selectedProduct,
                          selectedPlan: currentPlan,
                          quantity: 1,
                          customEmail: customEmail || undefined,
                        };
                        const updatedCart = [...cart.filter(i => !(i.product.id === selectedProduct.id && i.selectedPlan.duration === currentPlan.duration)), targetCartItem];
                        addToCart(selectedProduct, currentPlan, customEmail || undefined);
                        if (unlockedCode) {
                          applyCoupon(unlockedCode, updatedCart);
                        }
                        setSelectedProduct(null);
                        setIsCheckoutOpen(true);
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs sm:text-sm tracking-wide transition-all bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-zinc-950 shadow-lg shadow-cyan-500/20 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4 fill-zinc-950" />
                      <span>⚡ Claim Special Offer ({formatPrice(currentPlan.price)})</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={(selectedProduct.stockCount ?? 0) <= 0 ? {} : { scale: 1.03 }}
                      whileTap={(selectedProduct.stockCount ?? 0) <= 0 ? {} : { scale: 0.97 }}
                      disabled={(selectedProduct.stockCount ?? 0) <= 0}
                      onClick={() => (selectedProduct.stockCount ?? 0) > 0 && handleAddToCart()}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer ${
                        (selectedProduct.stockCount ?? 0) <= 0
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/10 opacity-70'
                          : 'bg-white text-zinc-950 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-zinc-100'
                      }`}
                    >
                      {(selectedProduct.stockCount ?? 0) <= 0 ? (
                        <span>Out of Stock</span>
                      ) : added ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-4 w-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            );
          })()}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
