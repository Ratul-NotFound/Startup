'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  ShoppingBag,
  Search,
  Layers,
  Menu,
  X,
  User,
  ShieldAlert,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const {
    cart,
    setIsCartOpen,
    user,
    toggleUserRole,
    activeSearchQuery,
    setActiveSearchQuery,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const navLinks = [
    { label: 'Catalog', href: '/' },
    { label: 'My Vault', href: '/dashboard' },
    { label: 'Admin Command', href: '/admin' },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-3 sm:px-6 pt-3 transition-all duration-300 pointer-events-none">
      <div
        className={`max-w-7xl mx-auto rounded-2xl transition-all duration-300 pointer-events-auto ${
          isScrolled
            ? 'bg-zinc-950/90 border border-white/15 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-2.5 px-4 sm:px-6'
            : 'bg-zinc-950/60 border border-white/10 backdrop-blur-xl shadow-xl py-3 px-4 sm:px-6'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo with Glow Badge */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group select-none">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-md group-hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all group-hover:scale-105">
              <Layers className="h-5 w-5 text-white" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
              </span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-base font-black tracking-wider text-white uppercase font-sans leading-none">
                Sub<span className="text-cyan-400">Nexus</span>
              </span>
              <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-400 uppercase leading-none mt-1">
                Vault Platform
              </span>
            </div>
          </Link>

          {/* Interactive Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/60 p-1 rounded-full border border-white/5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-zinc-950 shadow-md font-black'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Interactive Action Group */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Interactive Search Bar */}
            <div
              className={`relative hidden lg:flex items-center transition-all duration-300 ${
                searchFocused ? 'w-60' : 'w-44'
              }`}
            >
              <Search className="absolute left-3 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={activeSearchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onChange={(e) => setActiveSearchQuery(e.target.value)}
                placeholder="Quick search..."
                className="w-full pl-8 pr-8 py-1.5 bg-zinc-900/80 border border-white/10 rounded-full text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
              />
              {activeSearchQuery && (
                <button
                  onClick={() => setActiveSearchQuery('')}
                  className="absolute right-2.5 text-zinc-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Role Switcher Pill */}
            <button
              onClick={toggleUserRole}
              title="Click to toggle between Customer & Admin view"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-zinc-900/80 hover:bg-zinc-850 text-[11px] font-mono font-semibold text-zinc-300 hover:text-white transition-all hover:scale-105 shadow-sm"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  user.role === 'admin'
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                    : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                }`}
              />
              <span className="capitalize">{user.role}</span>
            </button>

            {/* Interactive Cart Button with Total Preview */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-white/10 hover:border-cyan-500/40 text-zinc-200 hover:text-white transition-all hover:scale-105 shadow-sm"
              aria-label="Cart"
            >
              <ShoppingBag className="h-4 w-4 text-cyan-400" />
              {totalCartCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white px-1">
                    {totalCartCount}
                  </span>
                  <span className="hidden sm:inline text-xs font-mono font-bold text-emerald-400">
                    ${totalCartPrice.toFixed(2)}
                  </span>
                </div>
              )}
            </button>

            {/* Login / Vault Button */}
            <Link
              href={user.role === 'admin' ? '/admin' : '/dashboard'}
              className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-105"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Vault</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-8 w-8 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

          </div>

        </div>

        {/* Mobile Interactive Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-white/10 space-y-2 text-xs font-bold uppercase tracking-wider">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                  pathname === link.href
                    ? 'bg-white text-zinc-950 font-black'
                    : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <span>{link.label}</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-60" />
              </Link>
            ))}

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-400 lowercase">
                current role: <strong className="text-white uppercase">{user.role}</strong>
              </span>
              <button
                onClick={toggleUserRole}
                className="text-xs text-cyan-400 font-bold uppercase"
              >
                Switch Role
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
