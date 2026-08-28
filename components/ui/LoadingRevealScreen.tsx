'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const LoadingRevealScreen: React.FC = () => {
  const { brandSettings } = useApp();
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Securing connection...');

  useEffect(() => {
    // Stage 1: Fast start
    const t1 = setTimeout(() => {
      setProgress(40);
      setStatusText('Syncing catalog & vault...');
    }, 250);

    // Stage 2: Middle charge
    const t2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Preparing experience...');
    }, 650);

    // Stage 3: Complete
    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Ready');
    }, 1100);

    // Stage 4: Trigger cinematic reveal exit (1.35s total duration)
    const t4 = setTimeout(() => {
      setIsVisible(false);
    }, 1350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="keyoon-loading-screen"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: 'blur(14px)',
            transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#070709] text-white select-none pointer-events-auto"
          style={{ willChange: 'opacity, transform, filter' }}
        >
          {/* Ambient Lighting & Glow Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-blue-600/20 via-cyan-500/20 to-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-cyan-400/15 rounded-full blur-[80px]" />
          </div>

          {/* Center Brand Emblem & Typography */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full space-y-6">
            
            {/* Glowing Logo Icon */}
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing ring */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/30 via-cyan-400/30 to-indigo-500/30 blur-xl pointer-events-none"
              />

              {/* Logo Frame */}
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-zinc-900/90 border border-white/15 p-3.5 shadow-[0_0_50px_rgba(6,182,212,0.35)] flex items-center justify-center backdrop-blur-xl">
                <img
                  src={brandSettings?.faviconUrl || '/images/Fabicon.png'}
                  alt="Keyoon"
                  className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                />
              </div>
            </div>

            {/* Brand Name & Tagline */}
            <div className="space-y-1.5">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-2xl sm:text-3xl font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-blue-400 drop-shadow-sm font-outfit"
              >
                {brandSettings?.brandName || 'KEYOON'}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-xs text-slate-400 font-medium tracking-wide"
              >
                {brandSettings?.brandTagline || 'Premium Digital Subscriptions'}
              </motion.p>
            </div>

            {/* Progress Bar & Status Text */}
            <div className="w-full space-y-2.5 pt-2">
              {/* Progress Track */}
              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/10 p-[1px]">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-300 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>

              {/* Status Info Row */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>{statusText}</span>
                </span>
                <span className="font-mono text-cyan-300 font-bold">{progress}%</span>
              </div>
            </div>

            {/* Security Guarantee Pill */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/80 border border-white/10 text-[10px] text-zinc-400 shadow-sm"
            >
              <Shield className="h-3 w-3 text-emerald-400" />
              <span>Instant Automated Vault Delivery</span>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
