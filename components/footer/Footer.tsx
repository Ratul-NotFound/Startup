'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, ShieldCheck, Zap, Lock, Globe, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.08] bg-zinc-950 text-xs text-zinc-400 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Column 1: Brand & Status */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white uppercase font-sans leading-none">
                  Sub<span className="text-cyan-400">Nexus</span>
                </span>
                <span className="text-[10px] text-zinc-500 uppercase leading-tight mt-0.5 font-medium">
                  Premium Subscriptions at Wholesale Rates
                </span>
              </div>
            </Link>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Your trusted marketplace for authentic digital subscriptions. Enjoy instant delivery in under 30 seconds, encrypted private accounts, and 100% full-term replacement warranty.
            </p>

            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-[11px] text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>99.98% System Uptime</span>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400 font-semibold">Instant Delivery Online</span>
            </div>
          </div>

          {/* Column 2: Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider uppercase text-white font-sans">
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
                  Cinema & 4K Streaming
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-cyan-400 transition-colors">
                  Developer Tools
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-cyan-400 transition-colors">
                  Design & Creative Apps
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

          {/* Column 4: Guarantee & Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider uppercase text-white font-sans">
              Guarantee & Safety
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400 font-medium">
              <li className="flex items-center gap-1.5 text-zinc-300">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>100% Replacement Warranty</span>
              </li>
              <li className="flex items-center gap-1.5 text-zinc-300">
                <Zap className="h-3.5 w-3.5 text-emerald-400" />
                <span>Under 30s Instant Delivery</span>
              </li>
              <li className="flex items-center gap-1.5 text-zinc-300">
                <Lock className="h-3.5 w-3.5 text-indigo-400" />
                <span>Encrypted & Safe Checkout</span>
              </li>
              <li className="flex items-center gap-1.5 text-zinc-300">
                <Globe className="h-3.5 w-3.5 text-blue-400" />
                <span>Global Multi-Device Access</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Payment & Copyright Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px]">
          <p>© {new Date().getFullYear()} SubNexus Platform Inc. All rights reserved.</p>

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
