'use client';

import React from 'react';
import { HeroBanner } from '@/components/hero/HeroBanner';
import { BrandTicker } from '@/components/hero/BrandTicker';
import { ProductCatalog } from '@/components/store/ProductCatalog';
import { TrustAndFaq } from '@/components/trust/TrustAndFaq';

export default function HomePage() {
  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* 1. Cinematic Hero */}
      <HeroBanner />

      {/* 2. Brand & Live Status Ticker */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BrandTicker />
      </div>

      {/* 3. Subscription Product Vault */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductCatalog />
      </div>

      {/* 4. Simple Clean FAQ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TrustAndFaq />
      </div>
    </div>
  );
}
