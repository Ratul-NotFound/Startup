'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Search, Shield, Key, Headphones, ShoppingBag, Zap,
  Sparkles, ExternalLink, ArrowRight, X, Clock, Check
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Product } from '@/types';
import { playMicroClickSound } from '@/lib/sound-effects';

export const CommandMenu: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const {
    products,
    setSelectedProduct,
    setIsChatOpen,
    isAdmin,
    isSuperAdmin,
    formatPrice,
    subscriptions,
  } = useApp();

  // Keyboard shortcut listener (Cmd+K / Ctrl+K / Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-cmdk', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-cmdk', handleCustomOpen);
    };
  }, [isOpen]);

  const handleSelectProduct = (product: Product) => {
    playMicroClickSound();
    setSelectedProduct(product);
    setIsOpen(false);
  };

  const handleOpenChat = () => {
    playMicroClickSound();
    setIsChatOpen(true);
    setIsOpen(false);
  };

  const handleNavigate = (path: string) => {
    playMicroClickSound();
    setIsOpen(false);
    router.push(path);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <Command className="w-full">
          {/* Top Search Input Bar */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/50 dark:bg-zinc-900/50">
            <Search className="h-4 w-4 text-slate-400 dark:text-zinc-500 shrink-0" />
            <Command.Input
              autoFocus
              onKeyDown={(e) => {
                if (e.key === ' ' || e.code === 'Space') {
                  e.stopPropagation();
                }
              }}
              placeholder="Search subscriptions, AI tools, vault, or help... (টুলস খুঁজুন)"
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none font-['Hind_Siliguri',sans-serif]"
            />
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search Content List */}
          <Command.List className="max-h-[60vh] overflow-y-auto p-3 space-y-4 scrollbar-thin">
            <Command.Empty className="py-10 text-center text-xs text-slate-500 dark:text-zinc-400">
              No matching products or commands found. Try searching for &quot;ChatGPT&quot;, &quot;Netflix&quot;, or &quot;Vault&quot;.
            </Command.Empty>

            {/* Quick Actions Group */}
            <Command.Group heading="Quick Navigation & Actions" className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2 mb-2">
              <Command.Item
                onSelect={() => handleNavigate('/dashboard')}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                    <Key className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Customer Vault & My Subscriptions</p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">View your credentials, passwords and PINs ({subscriptions.length} active)</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Command.Item>

              <Command.Item
                onSelect={handleOpenChat}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Headphones className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">24/7 Live Support Messenger</p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">Ask a specialist or claim your replacement warranty</p>
                  </div>
                </div>
                <Zap className="h-3.5 w-3.5 text-blue-400" />
              </Command.Item>

              {(isAdmin || isSuperAdmin) && (
                <Command.Item
                  onSelect={() => handleNavigate('/admin')}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                      <Shield className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-red-600 dark:text-red-300">Admin Control Hub</p>
                      <p className="text-[10px] text-red-500/80">Manage orders, verify TrxID payments, and live customer chat</p>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Command.Item>
              )}
            </Command.Group>

            {/* Popular Subscriptions Group */}
            <Command.Group heading="Top Digital Subscriptions" className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2">
              {products.map(product => {
                const startingPrice = product.pricingTiers?.[0]?.price || 0;

                return (
                  <Command.Item
                    key={product.id}
                    value={`${product.name} ${product.category} ${product.tagline}`}
                    onSelect={() => handleSelectProduct(product)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-800 dark:text-zinc-200 text-xs font-semibold cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={product.logo}
                        alt={product.name}
                        className="h-8 w-8 rounded-xl object-cover border border-slate-200 dark:border-white/10 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/Fabicon.png';
                        }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{product.name}</p>
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-extrabold bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 shrink-0">
                            {product.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">{product.tagline}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pl-2">
                      <div className="text-right">
                        <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                          {formatPrice(startingPrice)}
                        </p>
                        <p className="text-[9px] text-slate-400">from</p>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        View →
                      </span>
                    </div>
                  </Command.Item>
                );
              })}
            </Command.Group>
          </Command.List>

          {/* Command Footer */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-zinc-900/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
            <div className="flex items-center gap-3">
              <span>Navigation: <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 font-mono text-[9px]">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 font-mono text-[9px]">↓</kbd></span>
              <span>Select: <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 font-mono text-[9px]">↵</kbd></span>
              <span>Close: <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 font-mono text-[9px]">ESC</kbd></span>
            </div>
            <span className="font-medium text-cyan-500">Keyoon Instant Search</span>
          </div>
        </Command>
      </div>
    </div>
  );
};
