'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Home, RefreshCw, Menu, X } from 'lucide-react';
import { User } from 'firebase/auth';
import { useApp } from '@/context/AppContext';

export type AdminTab =
  | 'overview'
  | 'orders'
  | 'payments'
  | 'products'
  | 'users'
  | 'admins'
  | 'subscriptions'
  | 'coupons'
  | 'tickets'
  | 'reviews'
  | 'hero'
  | 'bot'
  | 'logs';

export interface NavSection {
  title: string;
  items: {
    id: AdminTab;
    label: string;
    icon: React.ReactNode;
    count: number | string | null;
    isUrgent?: boolean;
  }[];
}

interface AdminHeaderProps {
  firebaseUser: User;
  isSuperAdmin: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refreshAllData: () => Promise<void>;
  isSyncing: boolean;
  showFeedback: (type: 'success' | 'error', msg: string) => void;
}

export function AdminHeader({
  firebaseUser,
  isSuperAdmin,
  mobileMenuOpen,
  setMobileMenuOpen,
  refreshAllData,
  isSyncing,
  showFeedback,
}: AdminHeaderProps) {
  const { brandSettings } = useApp();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-white/[0.08] backdrop-blur-xl shadow-sm dark:shadow-2xl">
      <div className="flex items-center justify-between w-full sm:w-auto">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-white/15 p-1 shadow-sm shrink-0 flex items-center justify-center">
            <img
              src={brandSettings?.faviconUrl || '/images/Fabicon.png'}
              alt="Keyoon"
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/Fabicon.png';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="flex items-center tracking-tight text-lg font-black font-sans leading-tight select-none">
                <span className="text-slate-900 dark:text-white">Key</span>
                <span className="text-cyan-500 dark:text-cyan-400">oon</span>
                <span className="text-slate-600 dark:text-slate-300 ml-1.5 font-bold text-sm">Command Hub</span>
              </div>
              {isSuperAdmin ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-300">
                  Superadmin
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-500/40 text-blue-700 dark:text-blue-300">
                  Administrator
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">{firebaseUser?.email}</p>
          </div>
        </div>

        {/* Mobile Menu Button (< lg) */}
        <button
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className="lg:hidden p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X className="h-5 w-5 text-red-500 dark:text-red-400" /> : <Menu className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />}
          <span className="text-xs font-bold">{mobileMenuOpen ? 'Close' : 'Menu'}</span>
        </button>
      </div>

      <div className="flex items-center gap-2.5">
        <Link
          href="/"
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-750 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Home className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>Storefront</span>
        </Link>

        <button
          onClick={async () => {
            await refreshAllData();
            showFeedback('success', 'Database re-synced successfully.');
          }}
          disabled={isSyncing}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-bold flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Live Data'}</span>
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar({
  mobileMenuOpen,
  setMobileMenuOpen,
  navSections,
  tab,
  setTab,
}: {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  navSections: NavSection[];
  tab: AdminTab;
  setTab: (tab: AdminTab) => void;
}) {
  return (
    <aside className={`w-full lg:w-72 shrink-0 space-y-5 bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-white/[0.08] p-4 rounded-3xl backdrop-blur-xl shadow-sm dark:shadow-2xl lg:sticky lg:top-6 ${
      mobileMenuOpen ? 'block' : 'hidden lg:block'
    }`}>
      {navSections.map(section => (
        <div key={section.title} className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 block mb-1">
            {section.title}
          </span>
          {section.items.map(item => {
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-50 to-indigo-100/60 dark:from-indigo-600/30 dark:via-indigo-500/20 dark:to-transparent text-indigo-600 dark:text-white border border-indigo-200 dark:border-indigo-500/40 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </div>

                {item.count !== null && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold shrink-0 ${
                    item.isUrgent
                      ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 animate-pulse'
                      : isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
