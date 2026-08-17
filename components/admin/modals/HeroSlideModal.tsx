'use client';

import React, { useRef } from 'react';
import { HeroSlide } from '@/types';
import { compressImageToDataUrl } from '@/lib/image-compression';
import { X, Sparkles, Loader2, ImageIcon, Save } from 'lucide-react';

interface HeroSlideModalProps {
  editingHeroSlide: (HeroSlide & { isNew?: boolean }) | null;
  setEditingHeroSlide: React.Dispatch<React.SetStateAction<(HeroSlide & { isNew?: boolean }) | null>>;
  isCompressingHeroImg: boolean;
  setIsCompressingHeroImg: (val: boolean) => void;
  handleSaveHeroSlide: () => Promise<void>;
}

export function HeroSlideModal({
  editingHeroSlide,
  setEditingHeroSlide,
  isCompressingHeroImg,
  setIsCompressingHeroImg,
  handleSaveHeroSlide,
}: HeroSlideModalProps) {
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  if (!editingHeroSlide) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={() => setEditingHeroSlide(null)}
    >
      <div
        className="relative w-full max-w-xl rounded-3xl bg-zinc-950 border border-white/15 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {editingHeroSlide.isNew ? 'Create New Hero Slide' : `Edit Hero Slide #${editingHeroSlide.order || 1}`}
              </h3>
              <p className="text-[11px] text-slate-400">Updates the storefront live carousel immediately</p>
            </div>
          </div>
          <button
            onClick={() => setEditingHeroSlide(null)}
            className="p-1.5 rounded-xl bg-zinc-900 text-slate-400 hover:text-white border border-white/10 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveHeroSlide();
          }}
          className="space-y-4 text-xs"
        >
          {/* Status Pill Tag */}
          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">Top Status Tag</label>
            <input
              type="text"
              value={editingHeroSlide.tag}
              onChange={e => setEditingHeroSlide(prev => prev ? ({ ...prev, tag: e.target.value }) : null)}
              placeholder="e.g. INSTANT 30S DELIVERY"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono uppercase tracking-wider"
              required
            />
          </div>

          {/* Cursive Subtitle */}
          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">Cursive Animated Subtitle</label>
            <input
              type="text"
              value={editingHeroSlide.sub}
              onChange={e => setEditingHeroSlide(prev => prev ? ({ ...prev, sub: e.target.value }) : null)}
              placeholder="e.g. Save Up to 80% on Official Digital Plans"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-cyan-400 font-bold"
              required
            />
          </div>

          {/* Main Headline Title */}
          <div className="space-y-1">
            <label className="font-bold text-slate-300 block">Main Headline Title</label>
            <input
              type="text"
              value={editingHeroSlide.title}
              onChange={e => setEditingHeroSlide(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
              placeholder="e.g. Premium Subscriptions at Wholesale Rates"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white font-bold text-sm"
              required
            />
          </div>

          {/* Background Image URL & Uploader */}
          <div className="space-y-2">
            <label className="font-bold text-slate-300 block">Cinematic Background Image</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editingHeroSlide.bgImage}
                onChange={e => setEditingHeroSlide(prev => prev ? ({ ...prev, bgImage: e.target.value }) : null)}
                placeholder="Image URL (e.g. /images/hero-vault.jpg or https://...)"
                className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono text-[11px]"
                required
              />

              <input
                ref={heroFileInputRef}
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setIsCompressingHeroImg(true);
                  try {
                    const dataUrl = await compressImageToDataUrl(f, 1600, 900, 0.75);
                    setEditingHeroSlide(prev => prev ? ({ ...prev, bgImage: dataUrl }) : null);
                  } finally {
                    setIsCompressingHeroImg(false);
                    if (heroFileInputRef.current) heroFileInputRef.current.value = '';
                  }
                }}
                className="hidden"
              />

              <button
                type="button"
                disabled={isCompressingHeroImg}
                onClick={() => heroFileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-cyan-400 font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {isCompressingHeroImg ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
                <span>Upload</span>
              </button>
            </div>

            {/* Preview Thumbnail */}
            {editingHeroSlide.bgImage && (
              <div className="relative h-28 w-full rounded-2xl overflow-hidden border border-white/10 bg-black">
                <img
                  src={editingHeroSlide.bgImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-3 text-center">
                  <p className="text-white font-bold text-xs drop-shadow">{editingHeroSlide.title}</p>
                </div>
              </div>
            )}
          </div>

          {/* CTA Text & Link */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">Button CTA Text</label>
              <input
                type="text"
                value={editingHeroSlide.ctaText || ''}
                onChange={e => setEditingHeroSlide(prev => prev ? ({ ...prev, ctaText: e.target.value }) : null)}
                placeholder="e.g. Explore Subscriptions"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">Button CTA Link / Anchor</label>
              <input
                type="text"
                value={editingHeroSlide.ctaLink || ''}
                onChange={e => setEditingHeroSlide(prev => prev ? ({ ...prev, ctaLink: e.target.value }) : null)}
                placeholder="e.g. #catalog"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setEditingHeroSlide(null)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{editingHeroSlide.isNew ? 'Create Slide' : 'Save & Publish Live'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
