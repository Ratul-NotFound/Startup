'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, ShieldCheck, Zap, Lock, Globe, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.08] bg-zinc-950 text-xs text-zinc-400 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Column 1: Brand & Status (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-widest text-white uppercase font-mono leading-none">
                  Sub<span className="text-cyan-400">Nexus</span>
                </span>
                <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase leading-tight mt-0.5">
                  Automated Subscription Vault
                </span>
              </div>
            </Link>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Next-generation wholesale subscription platform providing instant automated bot credential provisioning, AES-256 encrypted vaults, and 100% full-term replacement warranty.
            </p>

            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-[11px] font-mono text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>99.98% System Uptime</span>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400 font-bold">Bot Node Active</span>
            </div>
          </div>

          {/* Column 2: Subscription Vault */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-white">
              Vault Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400 font-medium">
              <li>
                <Link href="/#catalog" className="hover:text-cyan-400 transition-colors">
                  AI & Intelligence
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-cyan-400 transition-colors">
                  Cinema 4K Streaming
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-cyan-400 transition-colors">
                  Developer Tools
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-cyan-400 transition-colors">
                  Design & Creative
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-cyan-400 transition-colors">
                  VPN & Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Vault */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-white">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400 font-medium">
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
                  Customer Vault
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
                  Credential Decryption
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
                  Auto-Renewal Manager
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  <span>Admin Command Portal</span>
                  <ArrowUpRight className="h-3 w-3 text-zinc-500" />
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
                  Support Ticket Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Security & Protocols */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-white">
              Security & Guarantee
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400 font-medium">
              <li className="flex items-center gap-1.5 text-zinc-300">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>100% Full-Term Warranty</span>
              </li>
              <li className="flex items-center gap-1.5 text-zinc-300">
                <Zap className="h-3.5 w-3.5 text-emerald-400" />
                <span>&lt; 30s Bot Provisioning</span>
              </li>
              <li className="flex items-center gap-1.5 text-zinc-300">
                <Lock className="h-3.5 w-3.5 text-indigo-400" />
                <span>AES-256 Vault Encryption</span>
              </li>
              <li className="flex items-center gap-1.5 text-zinc-300">
                <Globe className="h-3.5 w-3.5 text-blue-400" />
                <span>Global Multi-Region Nodes</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Payment & Copyright Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px] font-mono">
          <p>© {new Date().getFullYear()} SubNexus Platform Inc. All rights reserved.</p>

          <div className="flex items-center gap-4 text-zinc-400">
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
