'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { useApp } from '@/context/AppContext';
import { HeroSlide } from '@/types';
import { useIsLowEndDevice } from '@/hooks/useIsLowEndDevice';

export const HeroBanner: React.FC = () => {
  const { heroSlides } = useApp();
  const isLowEnd = useIsLowEndDevice();
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { margin: '150px 0px 150px 0px', once: false });
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = heroSlides || [];

  useEffect(() => {
    if (!isInView || slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, isInView]);

  if (!slides || slides.length === 0) {
    return (
      <section ref={containerRef} className="relative min-h-[84vh] sm:min-h-[90vh] w-full flex flex-col justify-between overflow-hidden -mt-16 pt-24 pb-12 bg-zinc-950" suppressHydrationWarning>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-black pointer-events-none" />
      </section>
    );
  }

  const current = slides[activeSlide % slides.length] || slides[0];

  return (
    <section ref={containerRef} className="relative min-h-[84vh] sm:min-h-[90vh] w-full flex flex-col justify-between overflow-hidden -mt-16 pt-24 pb-12" suppressHydrationWarning>
      
      {/* Responsive Dynamic Slides Background Carousel */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" style={{ transform: 'translateZ(0)' }} suppressHydrationWarning>
        {slides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            suppressHydrationWarning
            className={`absolute inset-0 w-full h-full transition-opacity ${isLowEnd ? 'duration-300' : 'duration-700'} ease-in-out ${
              idx === (activeSlide % slides.length) ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.bgImage}
              alt="Cinematic Background"
              loading={idx === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}

        {/* Seamless Dark Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-black/75" suppressHydrationWarning />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-600/10 via-black/60 to-zinc-950" suppressHydrationWarning />
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-zinc-950 to-transparent" suppressHydrationWarning />
        
        {/* Subtle Light Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" suppressHydrationWarning />
      </div>

      {/* Main Centered Content */}
      <div
        suppressHydrationWarning
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center my-auto space-y-6"
      >
        
        {/* Live Status Pill with Radar Pulse Ring */}
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
          <span>{current.tag}</span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-300">FULL WARRANTY INCLUDED</span>
        </div>

        {/* Cursive Subtitle with Smooth Animated Transitions */}
        <div
          className="min-h-[2.5rem] flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={`sub-${activeSlide}`}
              initial={{ opacity: 0, y: isLowEnd ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isLowEnd ? 0 : -8 }}
              transition={{ duration: isLowEnd ? 0.2 : 0.35, ease: 'easeOut' }}
              className="text-2xl sm:text-4xl text-cyan-400 select-none font-bold"
              style={{
                fontFamily: "'Caveat', cursive",
                textShadow: isLowEnd ? '0 2px 10px rgba(6,182,212,0.5)' : undefined,
              }}
            >
              {current.sub}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Modern Headline with Smooth Fluidity */}
        <div
          className="min-h-[4rem] sm:min-h-[6rem] flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            <motion.h1
              key={`title-${activeSlide}`}
              initial={{ opacity: 0, y: isLowEnd ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isLowEnd ? 0 : -10 }}
              transition={{ duration: isLowEnd ? 0.22 : 0.38, ease: 'easeOut' }}
              className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]"
              style={{
                fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
                textShadow: '0 4px 20px rgba(0,0,0,0.8)',
              }}
            >
              {current.title}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Centered Dual Action Buttons with Magnetic Cursor Attraction */}
        <div
          className="flex flex-wrap items-center justify-center gap-4 pt-4"
        >
          <MagneticButton strength={0.2}>
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              href="#catalog"
              className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(37,99,235,0.35)] transition-colors flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              <span>Explore Subscriptions</span>
              <ArrowRight className="h-4 w-4" />
            </motion.a>
          </MagneticButton>

          <MagneticButton strength={0.2}>
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              href="#catalog"
              className="px-8 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 font-bold text-xs tracking-wider uppercase transition-colors block"
            >
              View All Plans
            </motion.a>
          </MagneticButton>
        </div>

      </div>

      {/* Hero Carousel Indicators with Smooth Transition */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full flex justify-center">
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`relative h-1.5 rounded-full transition-all duration-300 ${
                idx === (activeSlide % slides.length) ? 'w-10 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'w-2.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

    </section>
  );
};
