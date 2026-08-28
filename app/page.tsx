'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HeroBanner } from '@/components/hero/HeroBanner';
import { BrandTicker } from '@/components/hero/BrandTicker';
import { ProductCatalog } from '@/components/store/ProductCatalog';
import { CustomerReviewsSection } from '@/components/reviews/CustomerReviewsSection';
import { TrustAndFaq } from '@/components/trust/TrustAndFaq';
import { SpecialOffersSection } from '@/components/store/SpecialOffersSection';
import { Scroll3DReveal } from '@/components/ui/Scroll3DReveal';

export default function HomePage() {
  return (
    <motion.div
      suppressHydrationWarning
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8 sm:space-y-12 pb-16 overflow-hidden"
    >
      {/* 1. Cinematic Full-Viewport Hero */}
      <Scroll3DReveal direction="up" delay={0.05}>
        <HeroBanner />
      </Scroll3DReveal>

      {/* 2. Floating Seamless Brand Marquee */}
      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 -mt-2" suppressHydrationWarning>
        <Scroll3DReveal direction="up" delay={0.08}>
          <BrandTicker />
        </Scroll3DReveal>
      </div>

      {/* 3. Special Offers, Giveaways & Promo Codes Hub */}
      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 pt-2" suppressHydrationWarning>
        <Scroll3DReveal direction="up" delay={0.08}>
          <SpecialOffersSection />
        </Scroll3DReveal>
      </div>

      {/* 4. Subscription Product Vault */}
      <div id="catalog" className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 scroll-mt-24" suppressHydrationWarning>
        <Scroll3DReveal direction="up" delay={0.08}>
          <ProductCatalog />
        </Scroll3DReveal>
      </div>

      {/* 5. Customer Reviews Section */}
      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 content-auto" suppressHydrationWarning>
        <Scroll3DReveal direction="up" delay={0.08}>
          <CustomerReviewsSection />
        </Scroll3DReveal>
      </div>

      {/* 6. Simple Clean FAQ */}
      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 content-auto" suppressHydrationWarning>
        <Scroll3DReveal direction="up" delay={0.08}>
          <TrustAndFaq />
        </Scroll3DReveal>
      </div>
    </motion.div>
  );
}
