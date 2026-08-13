'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Zap, KeyRound, ArrowRight } from 'lucide-react';
import { Interactive3DCard } from '@/components/ui/Interactive3DCard';

export const InteractiveSteps: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Choose Your Plan',
      desc: 'Pick your desired duration (1, 3, 6, or 12 months) with discounts up to 80% off retail pricing.',
      icon: <ShoppingCart className="h-6 w-6 text-cyan-400" />,
      accent: 'from-cyan-500/20 to-transparent border-cyan-500/30',
    },
    {
      num: '02',
      title: 'Instant 30s Provisioning',
      desc: 'Our automated system instantly prepares dedicated credentials or issues your family invitation.',
      icon: <Zap className="h-6 w-6 text-emerald-400" />,
      accent: 'from-emerald-500/20 to-transparent border-emerald-500/30',
    },
    {
      num: '03',
      title: 'Instant Access & Login',
      desc: 'View private login details and PINs directly in your account dashboard and email with 100% replacement warranty.',
      icon: <KeyRound className="h-6 w-6 text-indigo-400" />,
      accent: 'from-indigo-500/20 to-transparent border-indigo-500/30',
    },
  ];

  return (
    <section className="py-8 space-y-8">
      
      {/* Header with Scroll Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center space-y-2 max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 text-cyan-300 text-xs font-semibold backdrop-blur-md">
          <span>HOW IT WORKS</span>
        </div>

        <h2
          className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Instant Access in <span className="text-cyan-400">3 Easy Steps</span>
        </h2>

        <p className="text-xs sm:text-sm text-zinc-400">
          No complicated setup or waiting. Your subscription is activated in under 30 seconds.
        </p>
      </motion.div>

      {/* 3D Interactive Step Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: idx * 0.15, ease: 'easeOut' }}
          >
            <Interactive3DCard maxTilt={8} className="h-full">
              <div
                className={`h-full p-6 rounded-3xl bg-gradient-to-b ${step.accent} bg-zinc-900/70 border backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:shadow-xl`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-2xl bg-zinc-800/90 border border-white/10 shadow-md">
                      {step.icon}
                    </div>
                    <span className="text-2xl sm:text-3xl font-black font-mono text-zinc-600/50">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-white/5 flex items-center text-xs font-semibold text-cyan-400 gap-1">
                  <span>Seamless Process</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Interactive3DCard>
          </motion.div>
        ))}
      </div>

    </section>
  );
};
