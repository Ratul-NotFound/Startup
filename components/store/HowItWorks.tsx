'use client';

import React from 'react';
import { Layers, CreditCard, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { Interactive3DCard } from '@/components/ui/Interactive3DCard';
import { Scroll3DReveal } from '@/components/ui/Scroll3DReveal';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      icon: <Layers className="h-6 w-6 text-blue-400" />,
      title: 'Pick Your Plan & Duration',
      desc: 'Select 1m, 3m, 6m, or 1-year tier with wholesale discounts up to 80% off official rates.',
      badge: 'Step 1: Choose',
    },
    {
      num: '02',
      icon: <CreditCard className="h-6 w-6 text-cyan-400" />,
      title: 'Instant Secure Checkout',
      desc: 'Pay with Card, Apple Pay, Google Pay, or Crypto (USDT/BTC) through bank-grade encryption.',
      badge: 'Step 2: Pay',
    },
    {
      num: '03',
      icon: <Lock className="h-6 w-6 text-emerald-400" />,
      title: 'Automated 30s Vault Delivery',
      desc: 'Your credentials, PIN code, or direct invite link are immediately displayed in your dashboard.',
      badge: 'Step 3: Access',
    },
  ];

  return (
    <section className="space-y-8 pt-8">
      {/* Section Header with 3D Scroll Entrance */}
      <Scroll3DReveal>
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 text-cyan-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>HOW IT WORKS</span>
          </div>
          <h2
            className="text-2xl sm:text-3xl font-black tracking-tight text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Three Steps to <span className="text-cyan-400">Instant Access</span>
          </h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Our automated bot provisioning delivers your subscription in under 30 seconds with 100% replacement warranty.
          </p>
        </div>
      </Scroll3DReveal>

      {/* 3D Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, idx) => (
          <Interactive3DCard key={idx} index={idx} maxTilt={9}>
            <div
              style={{ transformStyle: 'preserve-3d' }}
              className="p-6 rounded-3xl bg-zinc-900/70 hover:bg-zinc-900/95 border border-white/[0.08] hover:border-cyan-500/40 backdrop-blur-xl flex flex-col justify-between space-y-6 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.85)] h-full"
            >
              <div className="flex items-center justify-between" style={{ transform: 'translateZ(20px)' }}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 border border-white/10 shadow-inner">
                  {step.icon}
                </div>
                <span className="text-2xl font-mono font-black text-zinc-700 select-none">
                  {step.num}
                </span>
              </div>

              <div className="space-y-2" style={{ transform: 'translateZ(16px)' }}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                  {step.badge}
                </span>
                <h3 className="text-base font-bold text-white font-sans">{step.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>

              <div className="pt-2 border-t border-white/[0.04] flex items-center gap-1.5 text-[11px] text-zinc-400" style={{ transform: 'translateZ(12px)' }}>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Verified & automated</span>
              </div>
            </div>
          </Interactive3DCard>
        ))}
      </div>
    </section>
  );
};
