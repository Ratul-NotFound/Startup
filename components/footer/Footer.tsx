'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, ShieldCheck, Zap, Lock, Globe, ArrowUpRight, Mail, CreditCard, Shield } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const Footer: React.FC = () => {
  const { brandSettings } = useApp();

  return (
    <footer className="border-t border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-zinc-950 text-xs text-zinc-500 dark:text-zinc-400 pt-16 pb-12 transition-colors">
      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-10 space-y-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Column 1: Brand & Status */}
          <div className="lg:col-span-2 space-y-4">
            {/* Brand Logo with Favicon + Two-Tone Keyoon Typography */}
            <Link href="/" className="flex items-center gap-2.5 group w-fit select-none">
              <div className="relative h-9 w-9 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 p-0.5 group-hover:border-cyan-500/40 group-hover:scale-105 transition-all duration-300 flex items-center justify-center shrink-0">
                <img
                  src={brandSettings?.faviconUrl || '/images/Fabicon.png'}
                  alt="Keyoon"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/Fabicon.png';
                  }}
                />
              </div>

              <div className="flex items-center tracking-tight text-xl font-black font-sans leading-none select-none">
                <span className="text-[var(--text-primary)] transition-colors">Key</span>
                <span className="text-cyan-500 dark:text-cyan-400">oon</span>
              </div>
            </Link>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
              Your trusted marketplace for authentic digital subscriptions. Enjoy instant delivery in under 30 seconds, encrypted private accounts, and 100% full-term replacement warranty.
            </p>

            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200/70 dark:bg-zinc-900 border border-slate-300 dark:border-white/10 text-[11px] text-slate-700 dark:text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>99.98% System Uptime</span>
              <span className="text-zinc-400 dark:text-zinc-600">•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Instant Delivery Online</span>
            </div>
          </div>

          {/* Column 2: Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider uppercase text-[var(--text-primary)] font-sans">
              Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400 font-medium">
              <li>
                <Link href="/#catalog" className="hover:text-cyan-400 transition-colors">
                  AI & Productivity
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-cyan-400 transition-colors">
                  Streaming & Cinema
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-cyan-400 transition-colors">
                  Developer & Cloud
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-cyan-400 transition-colors">
                  VPN & Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider uppercase text-white font-sans">
              Customer Links
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400 font-medium">
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
                  My Subscriptions
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
                  View Login Details
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
                  Manage Renewals
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  <span>Admin Dashboard</span>
                  <ArrowUpRight className="h-3 w-3 text-zinc-500" />
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
                  24/7 Support Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Official Email Channels */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider uppercase text-white font-sans">
              Official Channels
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400 font-medium">
              <li>
                <a
                  href="mailto:support@keyoon.com"
                  className="flex items-center gap-2 hover:text-cyan-300 transition-colors group"
                >
                  <Mail className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold leading-tight">General Support</span>
                    <span className="text-zinc-300 group-hover:text-cyan-300 transition-colors font-mono">support@keyoon.com</span>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="mailto:billing@keyoon.com"
                  className="flex items-center gap-2 hover:text-emerald-300 transition-colors group"
                >
                  <CreditCard className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold leading-tight">Billing &amp; Payments</span>
                    <span className="text-zinc-300 group-hover:text-emerald-300 transition-colors font-mono">billing@keyoon.com</span>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="mailto:admin@keyoon.com"
                  className="flex items-center gap-2 hover:text-indigo-300 transition-colors group"
                >
                  <Shield className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold leading-tight">Administration</span>
                    <span className="text-zinc-300 group-hover:text-indigo-300 transition-colors font-mono">admin@keyoon.com</span>
                  </div>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Payment & Copyright Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px]">
          <p>© {new Date().getFullYear()} Keyoon Inc. (keyoon.com). All rights reserved.</p>

          <div className="flex items-center gap-4 text-zinc-400 font-medium">
            <span>Visa</span>
            <span>•</span>
            <span>Mastercard</span>
            <span>•</span>
            <span>Apple Pay</span>
            <span>•</span>
            <span>Bitcoin</span>
            <span>•</span>
            <span>USDT</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
