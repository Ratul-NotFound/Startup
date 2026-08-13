'use client';

import React from 'react';
import { HeroBanner } from '@/components/hero/HeroBanner';
import { BrandTicker } from '@/components/hero/BrandTicker';
import { ProductCatalog } from '@/components/store/ProductCatalog';
import { TrustAndFaq } from '@/components/trust/TrustAndFaq';

export default function HomePage() {
  return (
    <div className="space-y-8 sm:space-y-12 pb-16">
      {/* 1. Cinematic Full-Viewport Hero */}
      <HeroBanner />

      {/* 2. Floating Seamless Brand Marquee */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        <BrandTicker />
      </div>

      {/* 3. Subscription Product Vault */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <ProductCatalog />
      </div>

      {/* 4. Simple Clean FAQ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <TrustAndFaq />
      </div>
    </div>
  );
}
