'use client';

import React, { useState } from 'react';
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
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-black/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 font-bold text-sm">
              <Layers className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg font-black tracking-wider text-white uppercase font-sans">
                Sub<span className="text-cyan-400">Nexus</span>
              </span>
            </div>
          </Link>

          {/* Navigation Links - Clean Uppercase Centered */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-zinc-300">
            <Link
              href="/"
              className={`hover:text-white transition-colors ${
                pathname === '/' ? 'text-cyan-400' : 'text-zinc-300'
              }`}
            >
              Catalog
            </Link>
            <Link
              href="/dashboard"
              className={`hover:text-white transition-colors ${
                pathname === '/dashboard' ? 'text-cyan-400' : 'text-zinc-300'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin"
              className={`hover:text-white transition-colors ${
                pathname === '/admin' ? 'text-cyan-400' : 'text-zinc-300'
              }`}
            >
              Admin
            </Link>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Minimal Search Input */}
            <div className="relative hidden lg:block w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                value={activeSearchQuery}
                onChange={(e) => setActiveSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="h-4 w-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white px-1">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Role Switcher Pill */}
            <button
              onClick={toggleUserRole}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/10 bg-white/5 text-[11px] font-medium text-zinc-300 hover:bg-white/10 transition-colors"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${user.role === 'admin' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className="capitalize">{user.role}</span>
            </button>

            {/* Blue Pill Login / Profile Button */}
            <Link
              href={user.role === 'admin' ? '/admin' : '/dashboard'}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all hover:scale-105"
            >
              <User className="h-3.5 w-3.5" />
              <span>Login</span>
            </Link>

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg bg-white/5 border border-white/10 text-zinc-300"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/95 px-4 py-4 space-y-2 text-xs font-bold uppercase tracking-wider">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-zinc-300 hover:bg-white/5">
            Catalog
          </Link>
          <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-cyan-400 hover:bg-white/5">
            Dashboard Vault
          </Link>
          <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-indigo-400 hover:bg-white/5">
            Admin Portal
          </Link>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-zinc-400 lowercase text-[11px]">role: {user.role}</span>
            <button onClick={toggleUserRole} className="text-xs text-blue-400 font-bold">Switch Role</button>
          </div>
        </div>
      )}
    </header>
  );
};
