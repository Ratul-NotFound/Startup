'use client';

import React from 'react';
import { HeroBanner } from '@/components/hero/HeroBanner';
import { BrandTicker } from '@/components/hero/BrandTicker';
import { ProductCatalog } from '@/components/store/ProductCatalog';
import { LiveMetricsTicker } from '@/components/sections/LiveMetricsTicker';
import { InteractiveSteps } from '@/components/sections/InteractiveSteps';
import { TrustAndFaq } from '@/components/trust/TrustAndFaq';
import { ScrollParallaxBackdrop } from '@/components/animations/ScrollParallaxBackdrop';

export default function HomePage() {
  return (
    <div className="relative space-y-10 sm:space-y-16 pb-16 overflow-hidden">
      
      {/* Dynamic 3D Parallax Floating Orbs */}
      <ScrollParallaxBackdrop />

      {/* 1. Cinematic Full-Viewport Hero */}
      <HeroBanner />

      {/* 2. Seamless Brand Marquee */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-6">
        <BrandTicker />
      </div>

      {/* 3. Live Animated Metrics on Scroll */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LiveMetricsTicker />
      </div>

      {/* 4. Subscription Product Catalog */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductCatalog />
      </div>

      {/* 5. 3D Interactive 3-Step Process */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InteractiveSteps />
      </div>

      {/* 6. Clean FAQ Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TrustAndFaq />
      </div>

    </div>
  );
}
