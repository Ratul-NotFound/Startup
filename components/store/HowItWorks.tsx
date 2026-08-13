'use client';

import React from 'react';
import { Layers, CreditCard, Lock } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      icon: <Layers className="h-5 w-5 text-blue-400" />,
      title: 'Pick Plan & Duration',
      desc: 'Select 1m, 3m, 6m, or 1yr tier with wholesale discounts up to 85%.',
    },
    {
      num: '02',
      icon: <CreditCard className="h-5 w-5 text-cyan-400" />,
      title: 'Instant Checkout',
      desc: 'Pay with USDT, Stripe card, or Bitcoin with zero hidden fees.',
    },
    {
      num: '03',
      icon: <Lock className="h-5 w-5 text-emerald-400" />,
      title: 'Automated Vault Reveal',
      desc: 'Credentials and invite links are instantly dispatched to your Vault (<30s).',
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">How It Works</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Three simple steps to instant, guaranteed access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 border border-zinc-800">
                {step.icon}
              </div>
              <span className="text-xs font-mono font-bold text-zinc-500">{step.num}</span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">{step.title}</h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
