'use client';

import React from 'react';
import { Search, Plus, X, Star, ThumbsUp, Trash2 } from 'lucide-react';
import { Review, Product } from '@/types';

interface ReviewsTabProps {
  reviews: Review[];
  products: Product[];
  reviewSearch: string;
  setReviewSearch: (q: string) => void;
  showAdminReviewForm: boolean;
  setShowAdminReviewForm: (show: boolean) => void;
  newAdminReview: {
    userName: string;
    productId: string;
    rating: number;
    title: string;
    comment: string;
    planDuration: string;
  };
  setNewAdminReview: React.Dispatch<React.SetStateAction<{
    userName: string;
    productId: string;
    rating: number;
    title: string;
    comment: string;
    planDuration: string;
  }>>;
  adminCreateReview: (rev: Omit<Review, 'id' | 'createdAt' | 'likes' | 'likedBy'>) => Promise<void>;
  adminResetReviews: () => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  showFeedback: (type: 'success' | 'error', msg: string) => void;
}

export function ReviewsTab({
  reviews,
  products,
  reviewSearch,
  setReviewSearch,
  showAdminReviewForm,
  setShowAdminReviewForm,
  newAdminReview,
  setNewAdminReview,
  adminCreateReview,
  adminResetReviews,
  deleteReview,
  showFeedback,
}: ReviewsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, product, review title…"
            value={reviewSearch}
            onChange={e => setReviewSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              await adminResetReviews();
              showFeedback('success', 'Reset reviews to 8 default verified reviews.');
            }}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-slate-300 text-xs font-bold border border-white/10 transition-colors cursor-pointer"
            title="Reset to 8 default mock reviews"
          >
            Reset Default Reviews
          </button>

          <button
            onClick={() => {
              setNewAdminReview({
                userName: '',
                productId: products[0]?.id || 'chatgpt-plus',
                rating: 5,
                title: '',
                comment: '',
                planDuration: '12 Months',
              });
              setShowAdminReviewForm(true);
            }}
            className="px-4 py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-100 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Review</span>
          </button>
        </div>
      </div>

      {/* Admin Add Review Inline Form */}
      {showAdminReviewForm && (
        <div className="p-5 rounded-3xl bg-zinc-900 border border-white/15 space-y-4 max-w-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Create New Customer / Mock Review</h3>
            <button onClick={() => setShowAdminReviewForm(false)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Customer Name</label>
              <input
                type="text"
                placeholder="e.g. Jordan Reed"
                value={newAdminReview.userName}
                onChange={e => setNewAdminReview(prev => ({ ...prev, userName: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Product</label>
              <select
                value={newAdminReview.productId}
                onChange={e => setNewAdminReview(prev => ({ ...prev, productId: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white cursor-pointer"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Star Rating (1-5)</label>
              <select
                value={newAdminReview.rating}
                onChange={e => setNewAdminReview(prev => ({ ...prev, rating: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white cursor-pointer"
              >
                <option value={5}>5 Stars ★★★★★</option>
                <option value={4}>4 Stars ★★★★☆</option>
                <option value={3}>3 Stars ★★★☆☆</option>
                <option value={2}>2 Stars ★★☆☆☆</option>
                <option value={1}>1 Star ★☆☆☆☆</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Plan Duration</label>
              <select
                value={newAdminReview.planDuration}
                onChange={e => setNewAdminReview(prev => ({ ...prev, planDuration: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white cursor-pointer"
              >
                <option value="1 Month">1 Month</option>
                <option value="3 Months">3 Months</option>
                <option value="6 Months">6 Months</option>
                <option value="12 Months">12 Months</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-300">Review Headline</label>
            <input
              type="text"
              placeholder="e.g. Instant credentials and flawless streaming"
              value={newAdminReview.title}
              onChange={e => setNewAdminReview(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white"
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-300">Review Text</label>
            <textarea
              rows={3}
              placeholder="Write the detailed review body…"
              value={newAdminReview.comment}
              onChange={e => setNewAdminReview(prev => ({ ...prev, comment: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 text-xs">
            <button
              onClick={() => setShowAdminReviewForm(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (!newAdminReview.title || !newAdminReview.comment) return;
                const prod = products.find(p => p.id === newAdminReview.productId) || products[0];
                await adminCreateReview({
                  userId: 'usr_admin_gen',
                  userName: newAdminReview.userName.trim() || 'Verified Customer',
                  userAvatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 50)}?w=150&auto=format&fit=crop&q=80`,
                  productId: prod.id,
                  productName: prod.name,
                  productLogo: prod.logo,
                  rating: newAdminReview.rating,
                  title: newAdminReview.title.trim(),
                  comment: newAdminReview.comment.trim(),
                  verifiedPurchase: true,
                  planDuration: newAdminReview.planDuration,
                });
                setShowAdminReviewForm(false);
                showFeedback('success', 'New review created and published live.');
              }}
              className="px-5 py-2 rounded-xl bg-white text-zinc-950 font-bold hover:bg-zinc-100 cursor-pointer"
            >
              Publish Review
            </button>
          </div>
        </div>
      )}

      <div className="rounded-3xl bg-zinc-900 border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 border-b border-white/[0.06] text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Rating</th>
                <th className="px-5 py-3.5">Review Headline &amp; Feedback</th>
                <th className="px-5 py-3.5">Likes</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {reviews
                .filter(r =>
                  r.userName.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                  r.productName.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                  r.title.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                  r.comment.toLowerCase().includes(reviewSearch.toLowerCase())
                )
                .map(rev => (
                  <tr key={rev.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={rev.userName}
                          className="h-8 w-8 rounded-full object-cover border border-white/10"
                        />
                        <div>
                          <p className="font-bold text-white text-xs">{rev.userName}</p>
                          {rev.verifiedPurchase && (
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1 py-0.2 rounded-full">
                              Verified Buyer
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-200">
                      <div className="flex items-center gap-1.5">
                        {rev.productLogo && (
                          <img src={rev.productLogo} alt={rev.productName} className="h-4 w-4 rounded object-cover" />
                        )}
                        <span>{rev.productName}</span>
                      </div>
                      {rev.planDuration && (
                        <span className="text-[10px] text-cyan-400 font-medium">{rev.planDuration}</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`h-3.5 w-3.5 ${s <= rev.rating ? 'fill-amber-400' : 'text-zinc-700'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-bold text-white text-xs line-clamp-1">{rev.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{rev.comment}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-slate-300 font-bold text-xs">
                        <ThumbsUp className="h-3 w-3 text-cyan-400" />
                        <span>{rev.likes || 0}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[11px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={async () => {
                          await deleteReview(rev.id);
                          showFeedback('success', 'Review deleted from database.');
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-all cursor-pointer"
                        title="Delete review"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
