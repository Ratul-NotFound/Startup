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
  Command,
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { label: 'Catalog', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Admin', href: '/admin' },
  ];

  return (
    <header className="sticky top-0 sm:top-3 z-50 w-full transition-all duration-300 px-0 sm:px-4 lg:px-8">
      <div
        className={`max-w-7xl mx-auto transition-all duration-300 ${
          scrolled
            ? 'bg-zinc-950/85 sm:rounded-2xl backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)]'
            : 'bg-zinc-950/50 sm:rounded-2xl backdrop-blur-xl'
        }`}
      >
        <div className="px-4 sm:px-6 flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo with Glowing Glyph */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-widest text-white uppercase font-mono leading-none">
                Sub<span className="text-cyan-400">Nexus</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase leading-tight mt-0.5">
                Subscription Vault
              </span>
            </div>
          </Link>

          {/* Centered Desktop Navigation Tabs - Borderless */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/50 rounded-full p-1 backdrop-blur-md">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    active
                      ? 'bg-white text-zinc-950 shadow-md font-black'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar - Borderless */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Interactive Search Bar - Borderless */}
            <div className="relative hidden lg:flex items-center">
              <Search className="absolute left-3.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={activeSearchQuery}
                onChange={(e) => setActiveSearchQuery(e.target.value)}
                placeholder="Search subscriptions..."
                className="w-56 pl-9 pr-8 py-1.5 bg-zinc-900/60 hover:bg-zinc-900/90 rounded-full text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition-all font-mono"
              />
              {activeSearchQuery ? (
                <button
                  onClick={() => setActiveSearchQuery('')}
                  className="absolute right-2.5 text-zinc-400 hover:text-white text-xs"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : (
                <div className="absolute right-2.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] font-mono text-zinc-400 pointer-events-none">
                  <Command className="h-2.5 w-2.5" />
                  <span>K</span>
                </div>
              )}
            </div>

            {/* Role Switcher Pill - Borderless */}
            <button
              onClick={toggleUserRole}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900/60 hover:bg-zinc-850 text-[11px] font-mono text-zinc-300 transition-colors shadow-sm"
              title="Click to toggle between Customer Vault and Admin Command Portal"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  user.role === 'admin'
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                    : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                }`}
              />
              <span className="capitalize font-bold">{user.role}</span>
            </button>

            {/* Cart Button - Borderless */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-zinc-900/60 hover:bg-zinc-850 text-zinc-300 hover:text-white transition-all hover:scale-105 shadow-sm"
              aria-label="Cart"
            >
              <ShoppingBag className="h-4 w-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-[10px] font-black text-white px-1 shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Glowing Blue Pill Login / Profile Button */}
            <Link
              href={user.role === 'admin' ? '/admin' : '/dashboard'}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-105"
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Vault Login</span>
              <span className="sm:hidden">Login</span>
            </Link>

            {/* Mobile Menu Button - Borderless */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-xl bg-zinc-900/60 text-zinc-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

          </div>
        </div>
      </div>

      {/* Interactive Mobile Glass Drawer - Borderless */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 mx-4 p-4 rounded-2xl bg-zinc-950/95 backdrop-blur-2xl space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Mobile Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={activeSearchQuery}
              onChange={(e) => setActiveSearchQuery(e.target.value)}
              placeholder="Search subscriptions..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
            />
          </div>

          {/* Navigation Links */}
          <div className="space-y-1 text-xs font-bold uppercase tracking-wider font-mono">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl transition-colors ${
                pathname === '/' ? 'bg-white text-zinc-950 font-black' : 'text-zinc-300 hover:bg-white/5'
              }`}
            >
              Catalog
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl transition-colors ${
                pathname === '/dashboard' ? 'bg-cyan-500 text-black font-black' : 'text-cyan-400 hover:bg-white/5'
              }`}
            >
              Customer Vault
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl transition-colors ${
                pathname === '/admin' ? 'bg-indigo-500 text-white font-black' : 'text-indigo-400 hover:bg-white/5'
              }`}
            >
              Admin Command Portal
            </Link>
          </div>

          {/* Role Switcher in Mobile Drawer */}
          <div className="pt-3 flex items-center justify-between border-t border-white/5">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className={`h-2 w-2 rounded-full ${user.role === 'admin' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className="capitalize font-mono">Active Role: <strong className="text-white">{user.role}</strong></span>
            </div>
            <button
              onClick={toggleUserRole}
              className="px-3 py-1 rounded-lg bg-zinc-900 text-xs font-bold text-cyan-400 hover:bg-zinc-800"
            >
              Switch Role
            </button>
          </div>

        </div>
      )}
    </header>
  );
};
