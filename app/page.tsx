'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HeroBanner } from '@/components/hero/HeroBanner';
import { BrandTicker } from '@/components/hero/BrandTicker';
import { ProductCatalog } from '@/components/store/ProductCatalog';
import { TrustAndFaq } from '@/components/trust/TrustAndFaq';
import { Scroll3DReveal } from '@/components/ui/Scroll3DReveal';

export default function HomePage() {
  return (
    <motion.div
      suppressHydrationWarning
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 sm:space-y-12 pb-16 overflow-hidden"
    >
      {/* 1. Cinematic Full-Viewport Hero with 3D Swoop */}
      <Scroll3DReveal direction="up" rotateXAmount={12} scaleAmount={0.96} delay={0.1}>
        <HeroBanner />
      </Scroll3DReveal>

      {/* 2. Floating Seamless Brand Marquee with Horizon Tilt */}
      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 -mt-2" suppressHydrationWarning>
        <Scroll3DReveal direction="up" rotateXAmount={16} delay={0.15}>
          <BrandTicker />
        </Scroll3DReveal>
      </div>

      {/* 3. Subscription Product Vault */}
      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 pt-4" suppressHydrationWarning>
        <Scroll3DReveal direction="up" rotateXAmount={14} delay={0.1}>
          <ProductCatalog />
        </Scroll3DReveal>
      </div>

      {/* 4. Simple Clean FAQ */}
      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 pt-4" suppressHydrationWarning>
        <Scroll3DReveal direction="up" rotateXAmount={18} delay={0.1}>
          <TrustAndFaq />
        </Scroll3DReveal>
      </div>
    </motion.div>
  );
}
