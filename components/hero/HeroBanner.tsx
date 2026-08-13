'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ArrowRight, Zap } from 'lucide-react';
import { SubscriptionCategory } from '@/types';

export const HeroBanner: React.FC = () => {
  const { activeCategoryFilter, setActiveCategoryFilter, products } = useApp();
  const [activeSlide, setActiveSlide] = useState(0);

  const backgroundSlides = [
    {
      sub: "Master the Art of Premium Access",
      title: 'SUBNEXUS',
      outline: 'ENTERPRISE',
      tag: 'AUTOMATED BOT DISPATCH',
      bgImage: '/images/hero-vault.jpg',
    },
    {
      sub: 'Next-Gen AI & Cinema 4K Infrastructure',
      title: 'AI & CINEMA',
      outline: 'INTELLIGENCE',
      tag: 'OFFICIAL WHOLESALE POOL',
      bgImage: '/images/hero-ai-cinema.jpg',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % backgroundSlides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [backgroundSlides.length]);

  const categories: {
    id: SubscriptionCategory;
    label: string;
    count: number;
  }[] = [
    {
      id: 'all',
      label: 'All Vaults',
      count: products.length,
    },
    {
      id: 'ai',
      label: 'AI Models',
      count: products.filter((p) => p.category === 'ai').length,
    },
    {
      id: 'streaming',
      label: 'Cinema 4K',
      count: products.filter((p) => p.category === 'streaming').length,
    },
    {
      id: 'dev',
      label: 'Developer',
      count: products.filter((p) => p.category === 'dev').length,
    },
    {
      id: 'productivity',
      label: 'Design & Pro',
      count: products.filter((p) => p.category === 'productivity').length,
    },
    {
      id: 'vpn_security',
      label: 'VPN Privacy',
      count: products.filter((p) => p.category === 'vpn_security').length,
    },
  ];

  const current = backgroundSlides[activeSlide];

  return (
    <section className="relative min-h-[85vh] sm:min-h-[88vh] flex flex-col justify-between overflow-hidden -mt-16 pt-24 pb-8">
      
      {/* Live Animated Concept Background with Smooth Ken Burns Slow Motion */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {backgroundSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === activeSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.bgImage}
              alt="Cinematic Background"
              className={`w-full h-full object-cover object-center transition-transform duration-[8000ms] ease-out ${
                idx === activeSlide ? 'scale-108' : 'scale-100'
              }`}
            />
          </div>
        ))}

        {/* Ambient Dark Atmospheric Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-600/10 via-black/65 to-zinc-950" />
        
        {/* Subtle Light Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      </div>

      {/* Main Centered Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center my-auto space-y-6">
        
        {/* Live Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/50 text-cyan-300 text-xs font-mono font-medium backdrop-blur-md shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>{current.tag}</span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-300">AUTO-PROVISION READY</span>
        </div>

        {/* Cursive Subtitle in Caveat script */}
        <p
          className="text-2xl sm:text-4xl text-cyan-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.7)] select-none transition-all duration-700 font-bold"
          style={{ fontFamily: "'Caveat', cursive" }}
        >
          {current.sub}
        </p>

        {/* Giant Bold Futuristic Title with Ghost Watermark in Orbitron Font */}
        <div className="relative py-2 select-none">
          <span
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl sm:text-8xl md:text-[130px] font-black tracking-widest text-transparent opacity-10 pointer-events-none transition-all duration-700 whitespace-nowrap"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              WebkitTextStroke: '2px rgba(255,255,255,0.8)',
            }}
          >
            {current.outline}
          </span>

          <h1
            className="relative text-4xl sm:text-6xl md:text-8xl font-black tracking-widest text-white uppercase drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)]"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {current.title}
          </h1>
        </div>

        {/* Centered Dual Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a
            href="#catalog"
            className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-widest uppercase shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all hover:scale-105 flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            <span>Explore Vault</span>
            <ArrowRight className="h-4 w-4" />
          </a>

          <a
            href="#catalog"
            className="px-8 py-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 font-bold text-xs tracking-widest uppercase border border-white/15 backdrop-blur-md transition-all hover:scale-105"
          >
            Browse Plans
          </a>
        </div>

      </div>

      {/* Floating Dock: Combined Slide Dots & Clean Segmented Category Bar */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full flex flex-col items-center gap-3">
        
        {/* Slider Indicator */}
        <div className="flex items-center justify-center gap-2 pb-1">
          {backgroundSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-1 rounded-full transition-all duration-500 ${
                idx === activeSlide ? 'w-8 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Unified Glassmorphic Category Segment Dock */}
        <div className="p-1.5 rounded-2xl bg-zinc-950/80 border border-white/[0.12] backdrop-blur-2xl shadow-2xl flex items-center gap-1 overflow-x-auto max-w-full scrollbar-none">
          {categories.map((cat) => {
            const active = activeCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center gap-2 shrink-0 ${
                  active
                    ? 'bg-zinc-100 text-zinc-950 font-black shadow-md scale-[1.02]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono transition-colors ${
                    active ? 'bg-zinc-300 text-zinc-950 font-black' : 'bg-white/[0.08] text-zinc-500'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

    </section>
  );
};
