'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const backgroundSlides = [
    {
      sub: 'Save Up to 80% on Top Subscriptions',
      title: 'PREMIUM ACCESS',
      outline: 'WHOLESALE',
      tag: 'INSTANT 30S DELIVERY',
      bgImage: '/images/hero-vault.jpg',
    },
    {
      sub: 'ChatGPT Plus, Gemini Advanced & 4K Cinema',
      title: 'AI & STREAMING',
      outline: 'ENTERTAINMENT',
      tag: 'VERIFIED OFFICIAL PLANS',
      bgImage: '/images/hero-ai-cinema.jpg',
    },
    {
      sub: 'Cursor Pro, Claude 3.5 & Developer Tools',
      title: 'DEV WORKSPACE',
      outline: 'PRO SUITES',
      tag: 'FAST REASONING ENGINES',
      bgImage: '/images/hero-dev-code.jpg',
    },
    {
      sub: 'Adobe Creative Cloud & NordVPN Complete',
      title: 'CREATIVE & VPN',
      outline: 'SECURE SUITE',
      tag: '100% SAFE & GUARANTEED',
      bgImage: '/images/hero-creative-vpn.jpg',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % backgroundSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [backgroundSlides.length]);

  const current = backgroundSlides[activeSlide];

  return (
    <section className="relative min-h-[92vh] sm:min-h-screen w-full flex flex-col justify-between overflow-hidden -mt-20 pt-24 pb-12">
      
      {/* 100% Full-Viewport Responsive 4-Slide Background Carousel */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {backgroundSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
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

        {/* Seamless Dark Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-black/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-600/10 via-black/60 to-zinc-950" />
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-zinc-950 to-transparent" />
        
        {/* Subtle Light Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      </div>

      {/* Main Centered Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center my-auto space-y-6">
        
        {/* Live Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 text-cyan-300 text-xs font-semibold backdrop-blur-md shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>{current.tag}</span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-300">FULL WARRANTY INCLUDED</span>
        </div>

        {/* Cursive Subtitle in Caveat script */}
        <p
          className="text-2xl sm:text-4xl text-cyan-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.7)] select-none transition-all duration-700 font-bold"
          style={{ fontFamily: "'Caveat', cursive" }}
        >
          {current.sub}
        </p>

        {/* Giant Bold Title in Space Grotesk / Orbitron */}
        <div className="relative py-2 select-none">
          <span
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl sm:text-7xl md:text-[110px] font-black tracking-widest text-transparent opacity-10 pointer-events-none transition-all duration-700 whitespace-nowrap"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              WebkitTextStroke: '2px rgba(255,255,255,0.8)',
            }}
          >
            {current.outline}
          </span>

          <h1
            className="relative text-3xl sm:text-5xl md:text-7xl font-black tracking-wide text-white uppercase drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {current.title}
          </h1>
        </div>

        {/* Centered Dual Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a
            href="#catalog"
            className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wider uppercase shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all hover:scale-105 flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            <span>Explore Subscriptions</span>
            <ArrowRight className="h-4 w-4" />
          </a>

          <a
            href="#catalog"
            className="px-8 py-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 font-bold text-xs tracking-wider uppercase backdrop-blur-md transition-all hover:scale-105"
          >
            View All Plans
          </a>
        </div>

      </div>

      {/* Hero Carousel Indicators (4 Slides) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full flex justify-center">
        <div className="flex items-center justify-center gap-2">
          {backgroundSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === activeSlide ? 'w-10 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'w-2.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

    </section>
  );
};
