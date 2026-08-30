'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ArrowRight, Zap, ChevronLeft, ChevronRight, Pause, ExternalLink } from 'lucide-react';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { useApp } from '@/context/AppContext';
import { useIsLowEndDevice } from '@/hooks/useIsLowEndDevice';
import { FloatingLogo, HeroSlide } from '@/types';

const DEFAULT_BANGLA_SLIDES: (HeroSlide & { category?: string })[] = [
  {
    id: 'hero_special_offer',
    category: 'special_offer',
    order: 0,
    tagBangla: '🔥 KEYOON বিশেষ অফার',
    subBangla: 'সীমিত সময়ের মেগা কম্বো • শতভাগ লাইসেন্সড ও ইনস্ট্যান্ট ডেলিভারি',
    titleBangla: 'নেটফ্লিক্স একদম ফ্রি!',
    titleHighlight: 'Gemini Pro ১৮ মাস মাত্র ৳১৩০!',
    bgImage: '/images/offers/netflix-gemini-special.jpg',
    ctaTextBangla: '🎁 ফ্রি নেটফ্লিক্স নিন →',
    ctaLink: '#catalog',
    secondaryCtaTextBangla: '🤖 Gemini Pro নিন →',
    secondaryCtaLink: '#catalog',
    floatingLogos: [
      {
        name: 'Netflix 4K',
        badge: '১০০% ফ্রি',
        image: '/images/cards/netflix.svg',
        color: '#e50914',
        pos: { top: '18%', left: '13%' },
        floatDuration: 4.5,
        floatDelay: 0.2,
      },
      {
        name: 'Gemini Pro',
        badge: '১৮ মাস ৳১৩০',
        image: '/images/cards/gemini.svg',
        color: '#2563eb',
        pos: { top: '16%', right: '14%' },
        floatDuration: 5.0,
        floatDelay: 1.0,
      },
      {
        name: 'bKash / Nagad',
        badge: 'ইনস্ট্যান্ট',
        image: '/images/Fabicon.png',
        color: '#e2136e',
        pos: { bottom: '22%', left: '14%' },
        floatDuration: 4.3,
        floatDelay: 1.5,
      },
      {
        name: 'Keyoon Vault',
        badge: 'ভেরিফাইড',
        image: '/images/Fabicon.png',
        color: '#06b6d4',
        pos: { bottom: '20%', right: '14%' },
        floatDuration: 4.9,
        floatDelay: 0.6,
      },
    ],
  },
  {
    id: 'slide_ai',
    category: 'ai',
    order: 1,
    tagBangla: '⚡ ৩০ সেকেন্ডে ডেলিভারি • ১০০% রিপ্লেসমেন্ট ওয়ারেন্টি',
    subBangla: 'ChatGPT Plus, Claude 3.5 ও Midjourney-তে পান ৮০% পর্যন্ত আকর্ষণীয় ছাড়',
    titleBangla: 'হাতের মুঠোয় বিশ্বের শীর্ষ',
    titleHighlight: 'AI ও প্রোডাক্টিভিটি টুলস',
    bgImage: '/images/hero-vault.jpg',
    ctaTextBangla: 'AI টুলস এক্সপ্লোর করুন',
    ctaLink: '#catalog',
    floatingLogos: [
      {
        name: 'ChatGPT Plus',
        badge: 'GPT-4o',
        image: '/images/cards/chatgpt.svg',
        color: '#10a37f',
        pos: { top: '18%', left: '13%' },
        floatDuration: 4.2,
        floatDelay: 0,
      },
      {
        name: 'Claude 3.5',
        badge: 'Sonnet',
        image: '/images/cards/claude.svg',
        color: '#d97706',
        pos: { top: '16%', right: '14%' },
        floatDuration: 4.8,
        floatDelay: 0.8,
      },
      {
        name: 'Midjourney',
        badge: 'v6.1',
        image: '/images/cards/midjourney.svg',
        color: '#6366f1',
        pos: { bottom: '22%', left: '14%' },
        floatDuration: 5.1,
        floatDelay: 1.4,
      },
      {
        name: 'Google Gemini',
        badge: 'Advanced',
        image: '/images/cards/gemini.svg',
        color: '#2563eb',
        pos: { bottom: '20%', right: '14%' },
        floatDuration: 4.6,
        floatDelay: 0.5,
      },
    ],
  },
  {
    id: 'slide_streaming',
    category: 'streaming',
    order: 2,
    tagBangla: '🎬 ৪K আল্ট্রা এইচডি • ডেডিকেটেড পার্সোনাল প্রোফাইল',
    subBangla: 'Netflix, Spotify ও YouTube Premium এখন সবচেয়ে সাশ্রয়ী মূল্যে',
    titleBangla: 'আল্ট্রা এইচডি ৪K সিনেমা ও',
    titleHighlight: 'আনলিমিটেড মিউজিক স্ট্রিমিং',
    bgImage: '/images/hero-ai-cinema.jpg',
    ctaTextBangla: 'সিনেমা ও গান উপভোগ করুন',
    ctaLink: '#catalog',
    floatingLogos: [
      {
        name: 'Netflix 4K',
        badge: 'Ultra HD',
        image: '/images/cards/netflix.svg',
        color: '#e50914',
        pos: { top: '18%', left: '13%' },
        floatDuration: 4.5,
        floatDelay: 0.2,
      },
      {
        name: 'Spotify',
        badge: 'Premium',
        image: '/images/cards/spotify.svg',
        color: '#1db954',
        pos: { top: '16%', right: '14%' },
        floatDuration: 5.0,
        floatDelay: 1.0,
      },
      {
        name: 'YouTube',
        badge: 'Music + Pro',
        image: '/images/cards/youtube.svg',
        color: '#ff0000',
        pos: { bottom: '22%', left: '14%' },
        floatDuration: 4.3,
        floatDelay: 1.5,
      },
      {
        name: 'Prime Video',
        badge: 'HDR10+',
        image: '/images/cards/primevideo.svg',
        color: '#00a8e1',
        pos: { bottom: '20%', right: '14%' },
        floatDuration: 4.9,
        floatDelay: 0.6,
      },
    ],
  },
  {
    id: 'slide_dev',
    category: 'dev',
    order: 3,
    tagBangla: '💻 ১০০% অফিশিয়াল লাইসেন্স • ডেডিকেটেড সাপোর্ট',
    subBangla: 'Cursor Pro, GitHub Copilot ও Claude Code দিয়ে বাড়ান কাজের গতি',
    titleBangla: 'প্রফেশনাল ডেভেলপার ও',
    titleHighlight: 'ক্লাউড কোডিং ওয়ার্কস্পেস',
    bgImage: '/images/hero-dev-code.jpg',
    ctaTextBangla: 'ডেভ টুলস এক্সপ্লোর করুন',
    ctaLink: '#catalog',
    floatingLogos: [
      {
        name: 'Cursor Pro',
        badge: 'AI IDE',
        image: '/images/cards/cursor.svg',
        color: '#0284c7',
        pos: { top: '18%', left: '13%' },
        floatDuration: 4.4,
        floatDelay: 0.3,
      },
      {
        name: 'GitHub Copilot',
        badge: 'Enterprise',
        image: '/images/cards/copilot.svg',
        color: '#a855f7',
        pos: { top: '16%', right: '14%' },
        floatDuration: 5.2,
        floatDelay: 1.1,
      },
      {
        name: 'Claude Code',
        badge: 'CLI Agent',
        image: '/images/cards/claudecode.svg',
        color: '#d97706',
        pos: { bottom: '22%', left: '14%' },
        floatDuration: 4.7,
        floatDelay: 0.7,
      },
      {
        name: 'JetBrains',
        badge: 'All Products',
        image: '/images/cards/jetbrains.svg',
        color: '#ec4899',
        pos: { bottom: '20%', right: '14%' },
        floatDuration: 4.5,
        floatDelay: 1.3,
      },
    ],
  },
  {
    id: 'slide_security',
    category: 'security',
    order: 4,
    tagBangla: '🛡️ ১০০% জেনুইন প্রোডাক্ট • সুরক্ষিত ইন্টারনেট',
    subBangla: 'Adobe Creative Cloud, NordVPN ও Grammarly শতভাগ নিশ্চয়তায়',
    titleBangla: 'ক্রিয়েটিভ ডিজাইন ও',
    titleHighlight: 'ফুল-প্রটেকশন সাইবার সিকিউরিটি',
    bgImage: '/images/hero-creative-vpn.jpg',
    ctaTextBangla: 'সিকিউরিটি ও ডিজাইন অ্যাপস',
    ctaLink: '#catalog',
    floatingLogos: [
      {
        name: 'Adobe CC',
        badge: '20+ Apps',
        image: '/images/cards/adobe.svg',
        color: '#ef4444',
        pos: { top: '18%', left: '13%' },
        floatDuration: 4.7,
        floatDelay: 0.2,
      },
      {
        name: 'NordVPN',
        badge: 'Dedicated IP',
        image: '/images/cards/nordvpn.svg',
        color: '#3b82f6',
        pos: { top: '16%', right: '14%' },
        floatDuration: 5.1,
        floatDelay: 0.9,
      },
      {
        name: 'Grammarly',
        badge: 'Premium AI',
        image: '/images/cards/grammarly.svg',
        color: '#10b981',
        pos: { bottom: '22%', left: '14%' },
        floatDuration: 4.3,
        floatDelay: 1.4,
      },
      {
        name: 'Surfshark',
        badge: 'Unlimited',
        image: '/images/cards/surfshark.svg',
        color: '#06b6d4',
        pos: { bottom: '20%', right: '14%' },
        floatDuration: 4.8,
        floatDelay: 0.4,
      },
    ],
  },
];

// Official Telegram Icon SVG
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
  </svg>
);

interface HeroBannerProps {
  autoSwapIntervalMs?: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  autoSwapIntervalMs = 5000,
}) => {
  const { heroSlides, products, setSelectedProduct } = useApp();
  const isLowEnd = useIsLowEndDevice();
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { margin: '150px 0px 150px 0px', once: false });

  // Use Firestore slides if customized by admin, otherwise use enhanced Bangla slides
  const slides = (heroSlides && heroSlides.length > 0)
    ? heroSlides.map((hs, idx) => {
        const defaultMatch = DEFAULT_BANGLA_SLIDES.find(ds => ds.id === hs.id) || DEFAULT_BANGLA_SLIDES[idx % DEFAULT_BANGLA_SLIDES.length];
        return {
          ...hs,
          tagBangla: hs.tagBangla || hs.tag || defaultMatch?.tagBangla,
          subBangla: hs.subBangla || hs.sub || defaultMatch?.subBangla,
          titleBangla: hs.titleBangla || hs.title || defaultMatch?.titleBangla,
          titleHighlight: hs.titleHighlight || defaultMatch?.titleHighlight || '',
          ctaTextBangla: hs.ctaTextBangla || hs.ctaText || defaultMatch?.ctaTextBangla,
          secondaryCtaTextBangla: hs.secondaryCtaTextBangla || defaultMatch?.secondaryCtaTextBangla,
          secondaryCtaLink: hs.secondaryCtaLink || defaultMatch?.secondaryCtaLink,
          floatingLogos: (hs.floatingLogos && hs.floatingLogos.length > 0)
            ? hs.floatingLogos
            : (defaultMatch?.floatingLogos || []),
        };
      })
    : DEFAULT_BANGLA_SLIDES;

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setActiveSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-cycle timer with pause-on-hover
  useEffect(() => {
    if (!isInView || isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoSwapIntervalMs);

    return () => clearInterval(timer);
  }, [slides.length, isInView, isPaused, autoSwapIntervalMs, nextSlide]);

  const current = slides[activeSlide % slides.length];
  const floatingLogos = current.floatingLogos || DEFAULT_BANGLA_SLIDES[activeSlide % DEFAULT_BANGLA_SLIDES.length].floatingLogos || [];

  return (
    <section
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative min-h-[82vh] sm:min-h-[90vh] w-full flex flex-col justify-between overflow-hidden pt-6 sm:pt-10 pb-12 group/hero select-none"
      suppressHydrationWarning
    >
      {/* Dynamic Slides Background Carousel */}
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
              alt={slide.titleBangla || slide.title}
              loading={idx === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className={`w-full h-full object-center transform-gpu transition-all duration-500 ${
                slide.id === 'hero_special_offer'
                  ? 'object-contain sm:object-cover scale-100 brightness-110 contrast-105'
                  : 'object-cover scale-105'
              }`}
            />
          </div>
        ))}

        {/* Seamless Dark Overlays */}
        {current.id === 'hero_special_offer' ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/75 via-transparent to-black/35 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-black/80" suppressHydrationWarning />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-600/15 via-black/70 to-zinc-950" suppressHydrationWarning />
            <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-zinc-950 to-transparent" suppressHydrationWarning />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" suppressHydrationWarning />
          </>
        )}
      </div>

      {/* Floating Contextual Brand Logos Orbiting Around the Banner Text (Closer to Center) */}
      {!isLowEnd && current.id !== 'hero_special_offer' && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden hidden md:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={`logos-${activeSlide}`}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0"
            >
              {floatingLogos.map((logo, lIdx) => (
                <motion.div
                  key={logo.name + lIdx}
                  style={logo.pos}
                  animate={{
                    y: [-7, 7, -7],
                    x: [-3, 3, -3],
                    rotate: [-1.2, 1.2, -1.2],
                  }}
                  transition={{
                    duration: logo.floatDuration || 4.5,
                    delay: logo.floatDelay || 0,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute pointer-events-auto group/pill flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-zinc-950/80 hover:bg-zinc-900/95 border border-white/20 hover:border-cyan-400 backdrop-blur-lg shadow-2xl transition-all cursor-pointer hover:scale-105"
                >
                  <div className="relative h-8 w-8 rounded-xl overflow-hidden bg-zinc-800 border border-white/10 shrink-0 shadow-inner">
                    <img
                      src={logo.image}
                      alt={logo.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/Fabicon.png';
                      }}
                    />
                  </div>
                  <div className="pr-1 text-left">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white tracking-tight">{logo.name}</p>
                      <span
                        className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md font-mono"
                        style={{ backgroundColor: `${logo.color || '#06b6d4'}25`, color: logo.color || '#38bdf8' }}
                      >
                        {logo.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-medium font-['Hind_Siliguri',sans-serif]">ভেরিফাইড লাইসেন্স</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* High-Visibility Radiant Telegram Channel CTA Badge (Top Right of Hero) */}
      <div className="absolute top-5 sm:top-7 right-3 sm:right-8 z-30 pointer-events-auto">
        <a
          href="https://t.me/+2lQ2b-bIoI00NzA9"
          target="_blank"
          rel="noopener noreferrer"
          className="group/tg flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 border-2 border-sky-300/80 hover:border-white shadow-[0_0_30px_rgba(14,165,233,0.6)] hover:shadow-[0_0_40px_rgba(14,165,233,0.9)] text-white transition-all transform-gpu hover:scale-105 active:scale-95 cursor-pointer"
        >
          <div className="relative h-9 w-9 rounded-xl bg-white text-[#0088cc] flex items-center justify-center shrink-0 shadow-md group-hover/tg:rotate-6 transition-transform">
            <TelegramIcon className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white" />
            </span>
          </div>
          <div className="text-left font-['Hind_Siliguri',sans-serif]">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-amber-300 bg-black/45 px-2 py-0.2 rounded-full uppercase tracking-wider border border-amber-400/30">
                Keyoon টেলিগ্রাম
              </span>
              <span className="text-[10px] font-bold text-white/90">সরাসরি চ্যাট</span>
            </div>
            <p className="text-[13px] font-black text-white leading-tight mt-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              চ্যানেলে যুক্ত হোন ও কথা বলুন →
            </p>
          </div>
        </a>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-3 sm:left-6 z-20 flex items-center pointer-events-none">
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="pointer-events-auto h-11 w-11 rounded-2xl bg-zinc-950/70 hover:bg-zinc-900 border border-white/10 hover:border-cyan-500/40 text-zinc-300 hover:text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover/hero:opacity-100 shadow-xl cursor-pointer hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="absolute inset-y-0 right-3 sm:right-6 z-20 flex items-center pointer-events-none">
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next Slide"
          className="pointer-events-auto h-11 w-11 rounded-2xl bg-zinc-950/70 hover:bg-zinc-900 border border-white/10 hover:border-cyan-500/40 text-zinc-300 hover:text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover/hero:opacity-100 shadow-xl cursor-pointer hover:scale-105 active:scale-95"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Main Centered Content with High-Impact Bold Bangla Typography */}
      <div
        suppressHydrationWarning
        className={`relative z-20 mx-auto px-4 sm:px-6 text-center my-auto transition-all font-['Hind_Siliguri',sans-serif] ${
          current.id === 'hero_special_offer'
            ? 'max-w-2xl p-5 sm:p-7 rounded-3xl bg-zinc-950/80 border border-white/15 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-3 my-auto'
            : 'max-w-5xl space-y-6 pt-4'
        }`}
      >
        {/* Status Pill */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-sm backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
          <span>{current.tagBangla}</span>
          {isPaused && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-amber-300/80 bg-amber-950/40 px-1.5 py-0.2 rounded-full border border-amber-500/20">
              <Pause className="h-2.5 w-2.5" /> থামা হয়েছে
            </span>
          )}
        </div>

        {/* Subtitle with Bengali Typography */}
        <div className={current.id === 'hero_special_offer' ? 'min-h-[1.8rem] flex items-center justify-center' : 'min-h-[2.5rem] flex items-center justify-center'}>
          <AnimatePresence mode="wait">
            <motion.p
              key={`sub-${activeSlide}`}
              initial={{ opacity: 0, y: isLowEnd ? 0 : 8 * direction }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isLowEnd ? 0 : -8 * direction }}
              transition={{ duration: isLowEnd ? 0.2 : 0.35, ease: 'easeOut' }}
              className={current.id === 'hero_special_offer' ? 'text-sm sm:text-base text-cyan-300 font-semibold tracking-wide' : 'text-lg sm:text-2xl text-cyan-300 font-semibold tracking-wide'}
            >
              {current.subBangla}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Big Bold Bangla Headline */}
        <div className={current.id === 'hero_special_offer' ? 'min-h-[3rem] sm:min-h-[4rem] flex items-center justify-center' : 'min-h-[5.5rem] sm:min-h-[7.5rem] flex items-center justify-center'}>
          <AnimatePresence mode="wait">
            <motion.h1
              key={`title-${activeSlide}`}
              initial={{ opacity: 0, y: isLowEnd ? 0 : 10 * direction }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isLowEnd ? 0 : -10 * direction }}
              transition={{ duration: isLowEnd ? 0.22 : 0.38, ease: 'easeOut' }}
              className={`${
                current.id === 'hero_special_offer'
                  ? 'text-2xl sm:text-3xl md:text-4xl'
                  : 'text-3xl sm:text-5xl md:text-6xl lg:text-7xl'
              } font-black text-white max-w-4xl mx-auto leading-[1.18] tracking-tight`}
            >
              <span>{current.titleBangla} </span>
              {current.titleHighlight && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 drop-shadow-[0_4px_24px_rgba(6,182,212,0.4)]">
                  {current.titleHighlight}
                </span>
              )}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Centered Dual Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
          <MagneticButton strength={0.2}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                const el = document.getElementById('catalog');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-7 sm:px-8 py-3.5 rounded-2xl text-white font-black text-sm tracking-wide transition-all flex items-center gap-2 cursor-pointer shadow-xl ${
                current.id === 'hero_special_offer' || current.id === 'slide_netflix_gemini_special'
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-[0_0_30px_rgba(225,29,72,0.6)] border-2 border-red-400/60'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>{current.ctaTextBangla || 'সাবস্ক্রিপশন দেখুন'}</span>
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </MagneticButton>

          {current.secondaryCtaTextBangla ? (
            <>
              <span className="text-xs sm:text-sm font-black text-zinc-300 bg-zinc-900/80 px-2.5 py-1 rounded-full border border-white/10 font-['Hind_Siliguri',sans-serif]">
                অথবা
              </span>

              <MagneticButton strength={0.2}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    const geminiProd = products.find(p => p.id === 'gemini-advanced');
                    if (geminiProd) setSelectedProduct(geminiProd);
                    else {
                      const el = document.getElementById('catalog');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-7 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-2 border-cyan-400 font-black text-sm tracking-wide transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(37,99,235,0.6)] cursor-pointer"
                >
                  <span>{current.secondaryCtaTextBangla}</span>
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </MagneticButton>
            </>
          ) : (
            <MagneticButton strength={0.2}>
              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                href="https://t.me/+2lQ2b-bIoI00NzA9"
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white border-2 border-sky-300 font-bold text-sm tracking-wide transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(14,165,233,0.5)] cursor-pointer"
              >
                <TelegramIcon className="h-4 w-4 text-white" />
                <span>টেলিগ্রামে কথা বলুন</span>
              </motion.a>
            </MagneticButton>
          )}
        </div>
      </div>

      {/* Hero Carousel Indicators */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 w-full flex flex-col items-center gap-3">
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, idx) => {
            const isActive = idx === (activeSlide % slides.length);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setDirection(idx > activeSlide ? 1 : -1);
                  setActiveSlide(idx);
                }}
                className={`relative h-2 rounded-full transition-all duration-300 cursor-pointer overflow-hidden ${
                  isActive
                    ? 'w-12 bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)]'
                    : 'w-3 bg-white/25 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              >
                {isActive && !isPaused && (
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: autoSwapIntervalMs / 1000, ease: 'linear' }}
                    className="absolute inset-0 bg-white/40"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
