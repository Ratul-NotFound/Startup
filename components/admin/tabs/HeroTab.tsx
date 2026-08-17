'use client';

import React from 'react';
import { Sparkles, Plus, Edit2, Trash2, ArrowUpRight } from 'lucide-react';
import { HeroSlide } from '@/types';

interface HeroTabProps {
  heroSlides: HeroSlide[];
  adminResetHeroSlides: () => Promise<void>;
  setEditingHeroSlide: (slide: (HeroSlide & { isNew?: boolean }) | null) => void;
  heroDeleteConfirm: string | null;
  setHeroDeleteConfirm: (id: string | null) => void;
  handleDeleteHeroSlide: (id: string) => Promise<void>;
  showFeedback: (type: 'success' | 'error', msg: string) => void;
}

export function HeroTab({
  heroSlides,
  adminResetHeroSlides,
  setEditingHeroSlide,
  heroDeleteConfirm,
  setHeroDeleteConfirm,
  handleDeleteHeroSlide,
  showFeedback,
}: HeroTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <span>Storefront Hero &amp; Cinematic Banners</span>
          </h2>
          <p className="text-xs text-slate-400">
            Customize the rotating hero slides, live status tags, cursive slogans, and background imagery on the homepage in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (confirm('Reset all hero slides to the default cinematic presets?')) {
                await adminResetHeroSlides();
                showFeedback('success', 'Hero slides reset to default presets.');
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Reset to Defaults
          </button>

          <button
            onClick={() => {
              setEditingHeroSlide({
                id: '',
                isNew: true,
                tag: 'NEW EXCLUSIVE DEAL',
                title: 'Ultimate Premium Suite at 80% Off',
                sub: 'Instant 30-Second Vault Delivery',
                bgImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80',
                ctaText: 'Explore Subscriptions',
                ctaLink: '#catalog',
                order: heroSlides.length + 1,
              });
            }}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Hero Slide</span>
          </button>
        </div>
      </div>

      {/* Slides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {heroSlides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            className="relative rounded-3xl bg-zinc-900 border border-white/[0.08] overflow-hidden shadow-xl flex flex-col justify-between group hover:border-cyan-500/40 transition-all"
          >
            {/* Background Image Preview */}
            <div className="relative h-44 w-full overflow-hidden bg-black">
              <img
                src={slide.bgImage}
                alt={slide.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-70"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

              {/* Order & Tag Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-mono font-bold text-cyan-300">
                  Slide #{idx + 1}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-bold text-cyan-300">
                  {slide.tag}
                </span>
              </div>

              {/* Actions overlay */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <button
                  onClick={() => setEditingHeroSlide({ ...slide, isNew: false })}
                  className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-slate-300 hover:text-white border border-white/10 transition-colors shadow-sm cursor-pointer"
                  title="Edit slide"
                >
                  <Edit2 className="h-3.5 w-3.5 text-cyan-400" />
                </button>

                {heroDeleteConfirm === slide.id ? (
                  <button
                    onClick={() => handleDeleteHeroSlide(slide.id)}
                    className="px-2.5 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                ) : (
                  <button
                    onClick={() => setHeroDeleteConfirm(slide.id)}
                    className="p-2 rounded-xl bg-zinc-900/90 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-white/10 transition-colors shadow-sm cursor-pointer"
                    title="Delete slide"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-5 space-y-3">
              <div>
                <p className="text-base text-cyan-400 font-bold" style={{ fontFamily: "'Caveat', cursive" }}>
                  {slide.sub}
                </p>
                <h3 className="text-base font-black text-white leading-snug mt-0.5">
                  {slide.title}
                </h3>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/[0.06]">
                <span className="font-mono">CTA: {slide.ctaText || 'Explore Subscriptions'} ({slide.ctaLink || '#catalog'})</span>
                <button
                  onClick={() => setEditingHeroSlide({ ...slide, isNew: false })}
                  className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Edit Content</span>
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
