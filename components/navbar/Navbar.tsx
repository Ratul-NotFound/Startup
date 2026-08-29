'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  ShoppingBag, Menu, X, User, LogOut, LayoutDashboard,
  Shield, ChevronDown,
} from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const {
    cart, setIsCartOpen,
    user, firebaseUser, isAdmin, isSuperAdmin,
    isAuthModalOpen, setIsAuthModalOpen,
    logout, brandSettings,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll detection (passive listener so it never blocks touch/scroll)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/#catalog', label: 'Catalog' },
    { href: '/dashboard', label: 'Customer Vault' },
    { href: '/#pricing', label: 'Pricing' },
    { href: '/#reviews', label: 'Reviews' },
  ];

  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=6366f1&color=fff&size=80`;

  return (
    <>
      <header className="sticky top-0 z-40 w-full" suppressHydrationWarning>
        {/* Top Navbar */}
        <div
          suppressHydrationWarning
          className={`w-full transition-all duration-300 ${
            scrolled
              ? 'bg-zinc-950/90 backdrop-blur-xl border-b border-white/[0.07] shadow-lg shadow-black/20'
              : 'bg-transparent border-b border-transparent'
          }`}
        >
          <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4" suppressHydrationWarning>

            {/* Brand Logo & Favicon Badge with Two-Tone Keyoon Typography */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group select-none" suppressHydrationWarning>
              <div className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 p-0.5 group-hover:border-cyan-500/40 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 flex items-center justify-center shrink-0">
                <img
                  src={brandSettings?.faviconUrl || '/images/Fabicon.png'}
                  alt="Keyoon"
                  className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/Fabicon.png';
                  }}
                />
              </div>

              <div className="flex items-center tracking-tight text-xl sm:text-2xl font-black font-sans leading-none select-none">
                <span className="text-white drop-shadow-sm group-hover:text-slate-100 transition-colors">Key</span>
                <span className="text-cyan-400">oon</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors hover:text-white ${
                    pathname === link.href ? 'text-white font-semibold' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-2.5" suppressHydrationWarning>

              {/* Theme Toggle Button */}
              <ThemeToggle />

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative h-9 w-9 rounded-full bg-zinc-900/60 hover:bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className="h-4 w-4" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white text-[10px] font-black text-zinc-950 px-1 shadow">
                    {totalCartItems}
                  </span>
                )}
              </button>

              {/* Auth / User */}
              {firebaseUser ? (
                <div className="relative" ref={dropdownRef} suppressHydrationWarning>
                  <button
                    onClick={() => setUserDropdownOpen(prev => !prev)}
                    className="flex items-center gap-2 py-1.5 pl-1.5 pr-3 rounded-full bg-zinc-900 border border-white/10 hover:border-white/20 transition-all"
                  >
                    {/* Avatar */}
                    <img
                      src={user.avatar || avatarFallback}
                      alt={user.name}
                      className="h-6 w-6 rounded-full object-cover ring-1 ring-white/10"
                      onError={e => { (e.target as HTMLImageElement).src = avatarFallback; }}
                    />
                    <span className="text-xs font-semibold text-white max-w-[80px] truncate hidden sm:block">
                      {user.name}
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-zinc-900 border border-white/[0.1] shadow-2xl shadow-black/40 p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150" suppressHydrationWarning>

                      {/* User info header */}
                      <div className="px-3 py-2.5 border-b border-white/[0.06] mb-1" suppressHydrationWarning>
                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5">{user.email}</p>
                        {isSuperAdmin ? (
                          <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-bold uppercase tracking-wider text-red-400 bg-red-950/60 border border-red-500/30 px-1.5 py-0.5 rounded-full">
                            <Shield className="h-2.5 w-2.5" /> Superadmin
                          </span>
                        ) : isAdmin ? (
                          <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 border border-blue-500/30 px-1.5 py-0.5 rounded-full">
                            <Shield className="h-2.5 w-2.5" /> Admin
                          </span>
                        ) : null}
                      </div>

                      {/* My Dashboard */}
                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          pathname === '/dashboard'
                            ? 'bg-white/10 text-white'
                            : 'text-zinc-300 hover:text-white hover:bg-white/[0.05]'
                        }`}
                      >
                        <LayoutDashboard className="h-3.5 w-3.5 text-cyan-400" />
                        My Dashboard
                      </Link>

                      {/* Admin Panel — ONLY for authorized admins or superadmin */}
                      {(isAdmin || isSuperAdmin) && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                            pathname === '/admin'
                              ? 'bg-red-950/60 text-red-300'
                              : 'text-red-400 hover:bg-red-950/40 hover:text-red-300'
                          }`}
                        >
                          <Shield className="h-3.5 w-3.5" />
                          Admin Control Panel
                        </Link>
                      )}

                      <div className="border-t border-white/[0.06] mt-1 pt-1" suppressHydrationWarning>
                        <button
                          onClick={async () => {
                            setUserDropdownOpen(false);
                            await logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 rounded-full bg-white text-zinc-950 hover:bg-zinc-100 text-xs font-bold transition-all shadow-sm"
                >
                  Sign In
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="md:hidden h-9 w-9 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/[0.08] bg-zinc-950/98 backdrop-blur-xl px-6 py-5 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200" suppressHydrationWarning>
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center py-2.5 text-sm font-medium border-b border-white/[0.04] last:border-0 transition-colors ${
                  pathname === link.href ? 'text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Theme Toggle row in Mobile Menu */}
            <div className="pt-2 pb-1 flex items-center justify-between border-b border-white/[0.04]">
              <span className="text-sm font-medium text-zinc-400">Theme</span>
              <ThemeToggle showLabel />
            </div>

            {/* Admin link — ONLY for admin or superadmin in mobile menu */}
            {(isAdmin || isSuperAdmin) && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 border-b border-white/[0.04]"
              >
                <Shield className="h-4 w-4" />
                Admin Control Panel
              </Link>
            )}

            {!firebaseUser && (
              <button
                onClick={() => { setMobileMenuOpen(false); setIsAuthModalOpen(true); }}
                className="w-full mt-3 py-2.5 rounded-xl bg-white text-zinc-950 font-bold text-sm"
              >
                Sign In / Create Account
              </button>
            )}

            {firebaseUser && (
              <button
                onClick={async () => { setMobileMenuOpen(false); await logout(); }}
                className="w-full mt-3 py-2.5 rounded-xl bg-zinc-800 text-rose-400 font-semibold text-sm flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            )}
          </div>
        )}
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
