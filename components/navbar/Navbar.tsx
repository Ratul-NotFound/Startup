'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ShoppingBag, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { cart, setIsCartOpen, user } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      <div
        className={`w-full transition-all duration-300 ${
          scrolled
            ? 'bg-zinc-950/80 backdrop-blur-md border-b border-white/[0.06]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo - Clean & Human */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:border-white/25 transition-colors">
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-white font-sans">
              SubNexus
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link
              href="/"
              className={`transition-colors hover:text-white ${
                pathname === '/' ? 'text-white font-semibold' : ''
              }`}
            >
              Subscriptions
            </Link>
            <Link
              href="/dashboard"
              className={`transition-colors hover:text-white ${
                pathname === '/dashboard' ? 'text-white font-semibold' : ''
              }`}
            >
              My Orders
            </Link>
            <Link
              href="/admin"
              className={`transition-colors hover:text-white ${
                pathname === '/admin' ? 'text-white font-semibold' : ''
              }`}
            >
              Admin
            </Link>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            
            {/* Minimalist Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative h-9 w-9 rounded-full bg-zinc-900/60 hover:bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="h-4 w-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-zinc-950 px-1 shadow-sm">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Clean My Account Button */}
            <Link
              href={user.role === 'admin' ? '/admin' : '/dashboard'}
              className="px-4 py-2 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 text-xs sm:text-sm font-semibold transition-all shadow-sm"
            >
              My Account
            </Link>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden h-9 w-9 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

          </div>

        </div>
      </div>

      {/* Clean Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-zinc-950/95 backdrop-blur-xl px-6 py-5 space-y-4 animate-in fade-in duration-200">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-zinc-300">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white transition-colors"
            >
              All Subscriptions
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white transition-colors"
            >
              My Orders & Login Details
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white transition-colors"
            >
              Admin Dashboard
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
