'use client';

import React from 'react';
import Link from 'next/link';
import { Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 pt-12 pb-8 text-xs text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-zinc-800 text-white font-bold">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <span className="font-bold text-white text-sm">SubNexus</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-white transition-colors">Catalog</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-zinc-500 text-[11px]">
          <p>© {new Date().getFullYear()} SubNexus Platform. All rights reserved.</p>
          <p>Automated Provisioning & Subscription Management</p>
        </div>
      </div>
    </footer>
  );
};
