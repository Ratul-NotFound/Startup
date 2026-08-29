'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Key, FileText, Headphones, Settings, CheckCircle2, AlertTriangle,
  Clock, Plus, RefreshCw, Send, Lock, Download, LogIn, ShoppingBag,
  User, X, Eye, EyeOff, Copy, Check, ExternalLink, ShieldCheck,
  CreditCard, Sparkles, Image as ImageIcon, Loader2, ArrowUpRight,
  Bell, Globe, LogOut, Phone, Shield, Search, CheckCircle, Upload, Camera,
} from 'lucide-react';
import { calculateDaysRemaining, calculateExpiryProgress } from '@/lib/utils';
import { compressImageToDataUrl } from '@/lib/image-compression';
import { printCleanInvoice } from '@/lib/invoice-printer';
import Link from 'next/link';

// Quick service portal resolver
const getServiceUrl = (productName: string): string => {
  const p = productName.toLowerCase();
  if (p.includes('chatgpt') || p.includes('openai')) return 'https://chatgpt.com';
  if (p.includes('claude') || p.includes('anthropic')) return 'https://claude.ai';
  if (p.includes('midjourney')) return 'https://midjourney.com';
  if (p.includes('netflix')) return 'https://netflix.com/login';
  if (p.includes('spotify')) return 'https://spotify.com/login';
  if (p.includes('youtube')) return 'https://youtube.com/premium';
  if (p.includes('prime') || p.includes('amazon')) return 'https://amazon.com';
  if (p.includes('adobe') || p.includes('creative')) return 'https://adobe.com';
  if (p.includes('canva')) return 'https://canva.com/login';
  if (p.includes('nord') || p.includes('vpn') || p.includes('surfshark')) return 'https://nordvpn.com';
  if (p.includes('grammarly')) return 'https://grammarly.com/signin';
  return 'https://google.com';
};

export default function CustomerDashboardPage() {
  const {
    user, setUser, updateUserProfile, firebaseUser, subscriptions, orders, toggleAutoRenew, extendSubscription,
    tickets, createSupportTicket, replyToTicket, setIsAuthModalOpen, logout, refreshAllData, isSyncing,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'subscriptions' | 'orders' | 'support' | 'settings'>('subscriptions');
  const [subFilter, setSubFilter] = useState<'all' | 'active' | 'expiring'>('all');
  const [subSearch, setSubSearch] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [viewingInvoice, setViewingInvoice] = useState<typeof orders[0] | null>(null);

  // Support ticket form state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'credential_issue' | 'renewal_help' | 'payment_issue' | 'general'>('credential_issue');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketImage, setTicketImage] = useState<string | null>(null);
  const [isCompressingTicketImg, setIsCompressingTicketImg] = useState(false);
  const ticketFileInputRef = useRef<HTMLInputElement>(null);

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [isCompressingReplyImg, setIsCompressingReplyImg] = useState(false);
  const replyFileInputRef = useRef<HTMLInputElement>(null);

  // Settings State
  const [editName, setEditName] = useState(user?.name || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.name) setEditName(user.name);
    if (user?.avatar) setEditAvatar(user.avatar);
  }, [user]);

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setSaveSuccessMsg('Image size exceeds 5MB limit. Please choose a smaller file.');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const compressedDataUrl = await compressImageToDataUrl(file, 400, 400, 0.85);
      setEditAvatar(compressedDataUrl);
      await updateUserProfile({
        avatar: compressedDataUrl,
      });
      setSaveSuccessMsg('✓ Profile photo uploaded and updated!');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch {
      setSaveSuccessMsg('Failed to compress avatar image file.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Copy helper with visual feedback
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ─── AUTH GATE ──────────────────────────────────────────────────────
  if (!firebaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="text-center space-y-6 max-w-sm p-8 rounded-3xl bg-zinc-900/80 border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg">
            <Lock className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Customer Portal</h1>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Sign in with your Google account to access your vault credentials, order tracking, and subscriptions.
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-bold text-sm hover:bg-zinc-100 transition-all shadow-lg cursor-pointer"
          >
            <LogIn className="h-4 w-4" />
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  const activeCount = subscriptions.filter(s => (s.status === 'active' || s.status === 'expiring_soon') && calculateDaysRemaining(s.expiryDate) > 0).length;
  const expiringSoon = subscriptions.filter(s => s.status !== 'expired' && calculateDaysRemaining(s.expiryDate) > 0 && (s.status === 'expiring_soon' || calculateDaysRemaining(s.expiryDate) <= 3)).length;
  const totalSpentUsd = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalSpentBdt = orders.reduce((acc, o) => acc + (o.totalBdt || (o.total * 125)), 0);

  // Filtered subscriptions
  const filteredSubscriptions = subscriptions.filter(s => {
    const q = subSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      s.productName.toLowerCase().includes(q) ||
      (s.credentials?.email && s.credentials.email.toLowerCase().includes(q)) ||
      (s.orderId && s.orderId.toLowerCase().includes(q));
    if (!matchesSearch) return false;
    const daysLeft = calculateDaysRemaining(s.expiryDate);
    if (subFilter === 'active') return (s.status === 'active' || s.status === 'expiring_soon') && daysLeft > 3;
    if (subFilter === 'expiring') return s.status !== 'expired' && daysLeft <= 3 && daysLeft > 0;
    return true;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || (!ticketMessage.trim() && !ticketImage)) return;
    const t = createSupportTicket(ticketSubject, ticketCategory, ticketMessage || 'Sent screenshot', ticketImage || undefined);
    setSelectedTicketId(t.id);
    setTicketSubject('');
    setTicketMessage('');
    setTicketImage(null);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || (!replyInput.trim() && !replyImage)) return;
    replyToTicket(selectedTicketId, replyInput.trim(), 'user', replyImage || undefined);
    setReplyInput('');
    setReplyImage(null);
  };

  const handleClaimWarranty = (sub: typeof subscriptions[0]) => {
    const subject = `Warranty Claim: ${sub.productName}`;
    const initialMsg = `Hi Keyoon Team, I am requesting a warranty replacement check for my ${sub.productName} plan (${sub.durationLabel}).`;
    const t = createSupportTicket(subject, 'renewal_help', initialMsg);
    setSelectedTicketId(t.id);
    setActiveTab('support');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setIsSavingSettings(true);
    try {
      await updateUserProfile({
        name: editName.trim(),
        avatar: editAvatar.trim() || undefined,
      });
      setSaveSuccessMsg('Profile updated and synced to database.');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch {
      setSaveSuccessMsg('Failed to update profile.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const activeTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0] || null;

  const tabs = [
    { id: 'subscriptions', label: 'My Subscriptions & Vault', count: subscriptions.length, icon: <Key className="h-4 w-4" /> },
    { id: 'orders', label: 'Order History & Status', count: orders.length, icon: <FileText className="h-4 w-4" /> },
    { id: 'support', label: 'Live Support & Tickets', count: tickets.length, icon: <Headphones className="h-4 w-4" /> },
    { id: 'settings', label: 'Account Settings', count: null, icon: <Settings className="h-4 w-4" /> },
  ] as const;

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

      {/* ─── Profile & Live Metric Banner ─────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-white/[0.08] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=200`}
              alt={user.name}
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover ring-2 ring-white/15 shadow-xl shrink-0"
              onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=200`; }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{user.name}</h1>
                {orders.length > 0 && (
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ✓ Verified Customer
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Member since {new Date(user.joinedDate || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {[
              { label: 'Active Plans', value: activeCount, color: 'text-cyan-400' },
              { label: 'Total Orders', value: orders.length, color: 'text-white' },
              { label: 'Total Invested', value: totalSpentBdt > 0 ? `৳${totalSpentBdt.toLocaleString()}` : `$${totalSpentUsd.toFixed(2)}`, color: 'text-emerald-400' },
            ].map(m => (
              <div key={m.label} className="p-3.5 rounded-2xl bg-zinc-900/90 border border-white/[0.08] text-center min-w-[100px] shadow-sm">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">{m.label}</span>
                <p className={`text-xl font-black mt-0.5 ${m.color}`}>{m.value}</p>
              </div>
            ))}
            {expiringSoon > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/30 text-center min-w-[100px]">
                <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block">Expiring Soon</span>
                <p className="text-xl font-black mt-0.5 text-amber-400">{expiringSoon}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Dashboard Navigation Tabs ────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-0 overflow-x-auto scrollbar-none">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold transition-all whitespace-nowrap border-b-2 -mb-px cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-500 text-white bg-indigo-950/20 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== null && tab.count > 0 && (
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-extrabold ${
                activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 1. SUBSCRIPTIONS & VAULT TAB                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Active Subscriptions & Vault</h2>
              <p className="text-xs text-slate-400">Decrypt credentials, manage auto-renewals, launch apps, or claim warranty.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={subSearch}
                  onChange={e => setSubSearch(e.target.value)}
                  placeholder="Search subscriptions..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={async () => {
                  await refreshAllData();
                }}
                disabled={isSyncing}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer disabled:opacity-50"
                title="Re-synchronize subscriptions and vault credentials with database"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Vault'}</span>
              </button>

              <Link
                href="/"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shrink-0"
              >
                <Plus className="h-4 w-4" /> Add Plan
              </Link>
            </div>
          </div>

          {/* Subscriptions Filter Chips */}
          {subscriptions.length > 0 && (
            <div className="flex items-center gap-2">
              {[
                { id: 'all', label: `All (${subscriptions.length})` },
                { id: 'active', label: `Active (${activeCount})` },
                { id: 'expiring', label: `Expiring Soon (${expiringSoon})` },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSubFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    subFilter === f.id
                      ? 'bg-zinc-800 text-white border border-white/20'
                      : 'bg-zinc-950 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {filteredSubscriptions.length === 0 ? (
            <div className="py-20 text-center space-y-4 rounded-3xl border border-white/[0.06] bg-zinc-900/40 p-8">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-slate-500">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-white">No subscriptions found</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  When you purchase a subscription or when our admins approve your TrxID, your credentials will appear here instantly.
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-all shadow-lg"
              >
                Browse Storefront Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSubscriptions.map(sub => {
                const daysLeft = calculateDaysRemaining(sub.expiryDate);
                const percentRemaining = calculateExpiryProgress(sub.startDate, sub.expiryDate, sub.planDuration);
                const isUrgent = daysLeft <= 3 && daysLeft > 0;
                const isExpired = sub.status === 'expired' || daysLeft <= 0;
                const showCreds = showCredentials[sub.id];
                const serviceUrl = getServiceUrl(sub.productName);

                return (
                  <div
                    key={sub.id}
                    className={`p-5 rounded-3xl bg-zinc-900 border flex flex-col justify-between gap-4 shadow-lg transition-all ${
                      isUrgent ? 'border-amber-500/40 shadow-amber-500/5' :
                      isExpired ? 'border-red-500/30 shadow-red-500/5' :
                      'border-white/[0.08]'
                    }`}
                  >
                    {/* Product Header */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={sub.productLogo}
                            alt={sub.productName}
                            className="h-12 w-12 rounded-2xl object-cover ring-1 ring-white/10 shadow-md shrink-0"
                          />
                          <div>
                            <h3 className="text-sm font-bold text-white">{sub.productName}</h3>
                            <span className="text-[11px] text-cyan-400 font-mono font-semibold">{sub.durationLabel}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${
                          isExpired ? 'bg-red-950/60 text-red-400 border-red-500/30' :
                          isUrgent ? 'bg-amber-950/60 text-amber-400 border-amber-500/30' :
                          'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {isExpired ? 'Expired' : isUrgent ? 'Expiring Soon' : 'Active'}
                        </span>
                      </div>

                      {/* Expiry Countdown & Synced Progress Bar */}
                      <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-950 border border-white/[0.05]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">Subscription Health:</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`font-bold ${sub.planDuration === 'lifetime' ? 'text-emerald-400' : isExpired ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-white'}`}>
                              {sub.planDuration === 'lifetime' ? '♾️ Lifetime Access' : isExpired ? 'Expired' : `${daysLeft} days remaining`}
                            </span>
                            {!isExpired && (
                              <span className="text-[10px] font-mono text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
                                {sub.planDuration === 'lifetime' ? '100%' : `${percentRemaining}%`}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Accurate Dynamic Sync Bar */}
                        <div className="w-full h-2 rounded-full bg-zinc-800/80 p-0.5 border border-white/5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                              sub.planDuration === 'lifetime'
                                ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-emerald-500/30'
                                : isExpired
                                ? 'bg-red-500 shadow-red-500/50'
                                : isUrgent
                                ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-amber-500/50'
                                : percentRemaining > 50
                                ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 shadow-cyan-500/30'
                                : 'bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-cyan-500/30'
                            }`}
                            style={{ width: `${sub.planDuration === 'lifetime' ? 100 : isExpired ? 100 : Math.max(3, percentRemaining)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 font-mono">
                          <span>{sub.planDuration === 'lifetime' ? 'Expires: Never (Lifetime)' : `Expires: ${new Date(sub.expiryDate).toLocaleDateString()}`}</span>
                          <span className="text-slate-400">{sub.planDuration?.replace('_', ' ').toUpperCase() || 'PLAN'}</span>
                        </div>
                      </div>

                      {/* Credential Reveal Section */}
                      <div className="rounded-2xl bg-zinc-950 border border-white/[0.06] overflow-hidden">
                        <button
                          onClick={() => setShowCredentials(prev => ({ ...prev, [sub.id]: !prev[sub.id] }))}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Lock className="h-3.5 w-3.5 text-cyan-400" /> Decrypted Vault Credentials
                          </span>
                          {showCreds ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>

                        {showCreds && (
                          <div className="px-3.5 pb-3 space-y-2 border-t border-white/[0.05] pt-2.5">
                            {(!sub.credentials?.email && !sub.credentials?.password) ? (
                              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                                <div className="font-bold flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5 animate-spin text-amber-400" />
                                  <span>Credentials Being Provisioned</span>
                                </div>
                                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                                  Our operations team is preparing and verifying your subscription login details. They will be dispatched directly to your email and revealed here in your vault shortly.
                                </p>
                              </div>
                            ) : (
                              <>
                                {sub.credentials?.email && (
                                  <div className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-zinc-900/80">
                                    <span className="text-slate-400">Email:</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono text-white select-all">{sub.credentials.email}</span>
                                      <button
                                        onClick={() => handleCopy(sub.credentials?.email || '', `${sub.id}-email`)}
                                        className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                                        title="Copy Email"
                                      >
                                        {copiedKey === `${sub.id}-email` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {sub.credentials?.password && (
                                  <div className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-zinc-900/80">
                                    <span className="text-slate-400">Password:</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono text-cyan-300 font-bold select-all">{sub.credentials.password}</span>
                                      <button
                                        onClick={() => handleCopy(sub.credentials?.password || '', `${sub.id}-pwd`)}
                                        className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                                        title="Copy Password"
                                      >
                                        {copiedKey === `${sub.id}-pwd` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {sub.credentials?.pinCode && (
                                  <div className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-zinc-900/80">
                                    <span className="text-slate-400">Profile PIN:</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono text-amber-300 font-bold">{sub.credentials.pinCode}</span>
                                      <button
                                        onClick={() => handleCopy(sub.credentials?.pinCode || '', `${sub.id}-pin`)}
                                        className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                                        title="Copy PIN"
                                      >
                                        {copiedKey === `${sub.id}-pin` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {sub.credentials?.notes && (
                                  <p className="text-[10px] text-slate-400 leading-tight bg-zinc-900/40 p-2 rounded-lg border border-white/[0.04]">
                                    ℹ️ {sub.credentials.notes}
                                  </p>
                                )}

                                {/* Service portal link */}
                                <a
                                  href={serviceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 w-full py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3" /> Launch Service Portal
                                </a>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions: Warranty & Support */}
                    <div className="space-y-2 pt-2 border-t border-white/[0.05]">
                      <button
                        onClick={() => handleClaimWarranty(sub)}
                        className="w-full py-2 rounded-xl bg-zinc-950 hover:bg-zinc-850 border border-white/[0.08] hover:border-cyan-500/30 text-slate-300 hover:text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Claim 100% Replacement Warranty</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 2. ORDERS & PAYMENT VERIFICATION TAB                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'orders' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Order History & Payment Processing</h2>
              <p className="text-xs text-slate-400">Track bKash / Nagad verification, view official receipts, and decrypt subscriptions.</p>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{orders.length} total orders</span>
          </div>

          {orders.length === 0 ? (
            <div className="py-20 text-center space-y-4 rounded-3xl border border-white/[0.06] bg-zinc-900/40 p-8">
              <FileText className="h-12 w-12 text-zinc-600 mx-auto" />
              <p className="text-lg font-bold text-white">No orders recorded</p>
              <p className="text-xs text-slate-400">Your completed purchases and TrxID submissions will appear here.</p>
            </div>
          ) : (
            <div className="rounded-3xl bg-zinc-900 border border-white/[0.08] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950 text-slate-400 uppercase font-bold border-b border-white/[0.06] text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Order #</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Payment Method</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">TrxID / Status</th>
                      <th className="p-4 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-slate-300">
                    {orders.map(order => {
                      const isPending = order.paymentStatus === 'pending';
                      const isPaid = order.paymentStatus === 'paid';
                      const isDelivered = order.deliveryStatus === 'delivered';

                      return (
                        <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <div className="font-mono font-bold text-white text-xs">#{order.orderNumber}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{order.id}</div>
                          </td>

                          <td className="p-4 max-w-xs">
                            <div className="space-y-1">
                              {order.items.map((i, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-slate-200">
                                  <span className="font-bold text-white">{i.quantity}x</span>
                                  <span className="truncate">{i.productName}</span>
                                  <span className="text-[10px] text-cyan-400 font-mono">({i.durationLabel})</span>
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="p-4 text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>

                          <td className="p-4">
                            <span className="font-bold text-white capitalize">
                              {order.paymentMethodName || order.paymentMethod.replace(/_/g, ' ')}
                            </span>
                            {order.senderNumber && (
                              <span className="block text-[10px] text-slate-400 font-mono">Sender: {order.senderNumber}</span>
                            )}
                          </td>

                          <td className="p-4 font-bold text-white font-mono">
                            {order.totalBdt ? `৳${order.totalBdt.toLocaleString()} BDT` : `$${order.total.toFixed(2)}`}
                          </td>

                          <td className="p-4">
                            <div className="space-y-1">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border inline-flex items-center gap-1.5 ${
                                isDelivered ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30' :
                                isPaid ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30' :
                                isPending ? 'bg-amber-950/80 text-amber-400 border-amber-500/30 animate-pulse' :
                                'bg-red-950/80 text-red-400 border-red-500/30'
                              }`}>
                                {isPending ? '● Verifying TrxID' : isDelivered ? '✓ Delivered & Active' : isPaid ? '⚡ Payment Verified' : order.paymentStatus}
                              </span>

                              {order.transactionId && (
                                <span className="text-[10px] text-slate-400 font-mono block">
                                  TrxID: {order.transactionId}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-4 text-right">
                            <button
                              onClick={() => setViewingInvoice(order)}
                              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-xs font-bold text-slate-200 border border-white/[0.08] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <FileText className="h-3.5 w-3.5 text-cyan-400" />
                              <span>Receipt</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 3. SUPPORT & LIVE CHAT TICKETS TAB                          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Create New Ticket Form */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-3xl bg-zinc-900 border border-white/[0.08] space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Create Support Ticket</h3>
                <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                  24/7 SLA
                </span>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Inquiry Category</label>
                  <select
                    value={ticketCategory}
                    onChange={e => setTicketCategory(e.target.value as typeof ticketCategory)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="credential_issue">Login / Credential Help</option>
                    <option value="renewal_help">Warranty Claim & Renewal Help</option>
                    <option value="payment_issue">bKash / Nagad TrxID Verification</option>
                    <option value="general">General Question</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Subject</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={e => setTicketSubject(e.target.value)}
                    placeholder="Brief description of the request…"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Message Details</label>
                  <textarea
                    rows={4}
                    value={ticketMessage}
                    onChange={e => setTicketMessage(e.target.value)}
                    placeholder="Explain your question or paste relevant details..."
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                    required={!ticketImage}
                  />
                </div>

                {/* Screenshot upload */}
                <div>
                  <input
                    ref={ticketFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setIsCompressingTicketImg(true);
                      try {
                        const dataUrl = await compressImageToDataUrl(f, 750, 750, 0.65);
                        setTicketImage(dataUrl);
                      } finally {
                        setIsCompressingTicketImg(false);
                        if (ticketFileInputRef.current) ticketFileInputRef.current.value = '';
                      }
                    }}
                    className="hidden"
                  />

                  {ticketImage ? (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-white/10">
                      <img src={ticketImage} alt="Attachment" className="h-10 w-10 object-cover rounded-lg" />
                      <span className="flex-1 text-[10px] text-slate-400">Compressed image attached</span>
                      <button
                        type="button"
                        onClick={() => setTicketImage(null)}
                        className="p-1 rounded text-slate-400 hover:text-red-400 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isCompressingTicketImg}
                      onClick={() => ticketFileInputRef.current?.click()}
                      className="w-full py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-850 border border-white/10 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      {isCompressingTicketImg ? <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" /> : <ImageIcon className="h-3.5 w-3.5" />}
                      <span>Attach Error Screenshot</span>
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!ticketSubject.trim() || (!ticketMessage.trim() && !ticketImage)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Ticket</span>
                </button>
              </form>
            </div>

            {/* List of user tickets */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400">Your Ticket Threads ({tickets.length})</h4>
              {tickets.map(t => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-1 ${
                    selectedTicketId === t.id
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md'
                      : 'bg-zinc-900 border-white/[0.06] hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{t.ticketNumber}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      t.status === 'open' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' :
                      t.status === 'in_progress' ? 'bg-blue-950/60 text-blue-400 border-blue-500/30' :
                      'bg-zinc-800 text-zinc-400 border-white/10'
                    }`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white truncate">{t.subject}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Ticket Conversation */}
          <div className="lg:col-span-7">
            {activeTicket ? (
              <div className="h-[580px] rounded-3xl bg-zinc-900 border border-white/[0.08] flex flex-col shadow-xl">
                <div className="p-4 border-b border-white/[0.06] bg-zinc-950 flex justify-between items-center rounded-t-3xl">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{activeTicket.ticketNumber}</span>
                    <h4 className="text-sm font-bold text-white">{activeTicket.subject}</h4>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    activeTicket.status === 'open' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' :
                    activeTicket.status === 'in_progress' ? 'bg-blue-950/60 text-blue-400 border-blue-500/30' :
                    'bg-zinc-800 text-zinc-400 border-white/10'
                  }`}>
                    {activeTicket.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-thin">
                  {activeTicket.messages.map(msg => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                        <span className="text-[11px] text-slate-400 mb-1">
                          {msg.senderName} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className={`p-3.5 rounded-2xl max-w-sm text-xs leading-relaxed space-y-2 ${
                          isUser
                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                            : 'bg-zinc-800 text-slate-200 border border-white/[0.06] rounded-tl-none shadow-sm'
                        }`}>
                          {msg.imageUrl && (
                            <img src={msg.imageUrl} alt="Attachment" className="rounded-xl max-h-44 object-cover border border-white/15" />
                          )}
                          {msg.content && <p>{msg.content}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply bar with image attachment */}
                <div className="p-3.5 bg-zinc-950 border-t border-white/[0.06] rounded-b-3xl space-y-2">
                  {replyImage && (
                    <div className="flex items-center gap-2 px-1">
                      <img src={replyImage} alt="Preview" className="h-10 w-10 object-cover rounded-lg border border-white/10" />
                      <span className="text-[10px] text-slate-400 flex-1">Image attached</span>
                      <button onClick={() => setReplyImage(null)} className="p-1 text-slate-400 hover:text-red-400 cursor-pointer">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSendReply} className="flex gap-2">
                    <input
                      ref={replyFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        setIsCompressingReplyImg(true);
                        try {
                          const dataUrl = await compressImageToDataUrl(f, 750, 750, 0.65);
                          setReplyImage(dataUrl);
                        } finally {
                          setIsCompressingReplyImg(false);
                          if (replyFileInputRef.current) replyFileInputRef.current.value = '';
                        }
                      }}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={isCompressingReplyImg}
                      onClick={() => replyFileInputRef.current?.click()}
                      className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                      title="Attach image"
                    >
                      {isCompressingReplyImg ? <Loader2 className="h-4 w-4 animate-spin text-cyan-400" /> : <ImageIcon className="h-4 w-4" />}
                    </button>

                    <input
                      type="text"
                      value={replyInput}
                      onChange={e => setReplyInput(e.target.value)}
                      placeholder="Type your reply to support ops…"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!replyInput.trim() && !replyImage}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="h-64 rounded-3xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-slate-500 text-sm">
                Select a ticket thread to view messages.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 4. ACCOUNT SETTINGS & PREFERENCES TAB                       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl space-y-6">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Account Settings & Customization</h2>
            <p className="text-xs text-slate-400">Manage profile identity, notification preferences, default auto-renewal, and security.</p>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900 border border-white/[0.08] space-y-6 shadow-xl">
            {/* Hidden Avatar File Input */}
            <input
              ref={avatarFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFileUpload}
              className="hidden"
            />

            {/* User Identity Header with Upload Avatar Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950/80 border border-white/[0.06]">
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  <img
                    src={editAvatar || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=200`}
                    alt={user.name}
                    className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/15 shadow-lg"
                    onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=200`; }}
                  />
                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center text-white transition-opacity cursor-pointer"
                    title="Upload profile picture"
                  >
                    {isUploadingAvatar ? <Loader2 className="h-5 w-5 animate-spin text-cyan-400" /> : <Camera className="h-5 w-5 text-white" />}
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-base font-bold text-white">{user.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                      {user.role === 'admin' ? '🛡️ Administrator' : 'Standard Customer'}
                    </span>
                    {orders.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ✓ Verified Buyer
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => avatarFileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shrink-0"
              >
                {isUploadingAvatar ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Upload Profile Image</span>
                  </>
                )}
              </button>
            </div>

            {/* Profile Edit Form */}
            <form onSubmit={handleSaveProfile} className="space-y-4 pt-3 border-t border-white/[0.06]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <User className="h-4 w-4 text-cyan-400" /> Personal Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Profile Picture (URL or File Upload)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={editAvatar}
                      onChange={e => setEditAvatar(e.target.value)}
                      placeholder="https://... or upload photo"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                      title="Choose image file from device"
                    >
                      <Upload className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Upload File</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {saveSuccessMsg && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" /> {saveSuccessMsg}
                  </span>
                )}
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="ml-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingSettings ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>

            {/* Account Preferences Switches */}
            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Bell className="h-4 w-4 text-cyan-400" /> Notifications & Automation
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-white/[0.05]">
                  <div>
                    <p className="text-xs font-bold text-white">Instant Email & Order Alerts</p>
                    <p className="text-[11px] text-slate-400">Receive instant confirmation emails when TrxID is verified and credentials delivered.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateUserProfile({ emailAlertsEnabled: !user.emailAlertsEnabled })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      user.emailAlertsEnabled
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                        : 'bg-zinc-800 border-white/10 text-slate-400'
                    }`}
                  >
                    {user.emailAlertsEnabled ? '✓ Enabled' : 'Disabled'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-white/[0.05]">
                  <div>
                    <p className="text-xs font-bold text-white">Preferred Currency</p>
                    <p className="text-[11px] text-slate-400">Display catalog and invoices in Bangladeshi Taka (৳ BDT) or USD ($).</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateUserProfile({ preferredCurrency: user.preferredCurrency === 'BDT' ? 'USD' : 'BDT' })}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-white/10 text-xs font-bold text-cyan-300 cursor-pointer transition-colors"
                  >
                    {user.preferredCurrency === 'BDT' ? '৳ BDT (Active)' : '$ USD (Active)'}
                  </button>
                </div>
              </div>
            </div>

            {/* Account Security & Sign Out */}
            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div className="text-xs text-slate-400 space-y-0.5">
                <p>Google Authenticated User ID: <span className="font-mono text-slate-300">{firebaseUser.uid.slice(0, 12)}...</span></p>
                <p>Security Status: <span className="text-emerald-400 font-bold">Encrypted & Protected</span></p>
              </div>

              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-red-950/60 border border-white/10 text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── INVOICE & OFFICIAL RECEIPT MODAL ──────────────────────── */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-white/15 p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider block">OFFICIAL RECEIPT</span>
                <h3 className="text-base font-black text-white">Invoice #{viewingInvoice.orderNumber}</h3>
              </div>
              <button
                onClick={() => setViewingInvoice(null)}
                className="p-1.5 rounded-lg bg-zinc-900 text-slate-400 hover:text-white border border-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between p-2.5 rounded-xl bg-zinc-900 border border-white/[0.05]">
                <span className="text-slate-400">Customer</span>
                <span className="font-mono text-white truncate max-w-[200px]">{viewingInvoice.userEmail}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-zinc-900 border border-white/[0.05]">
                <span className="text-slate-400">Order Date</span>
                <span className="text-white">{new Date(viewingInvoice.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-zinc-900 border border-white/[0.05]">
                <span className="text-slate-400">Payment Method</span>
                <span className="font-bold text-white capitalize">{viewingInvoice.paymentMethodName || viewingInvoice.paymentMethod}</span>
              </div>
              {viewingInvoice.senderNumber && (
                <div className="flex justify-between p-2.5 rounded-xl bg-zinc-900 border border-white/[0.05]">
                  <span className="text-slate-400">Sender Phone</span>
                  <span className="font-mono font-bold text-emerald-400">{viewingInvoice.senderNumber}</span>
                </div>
              )}
              {viewingInvoice.transactionId && (
                <div className="flex justify-between p-2.5 rounded-xl bg-zinc-900 border border-white/[0.05]">
                  <span className="text-slate-400">TrxID / Reference</span>
                  <span className="font-mono font-bold text-cyan-400 uppercase">{viewingInvoice.transactionId}</span>
                </div>
              )}
              <div className="flex justify-between p-2.5 rounded-xl bg-zinc-900 border border-white/[0.05]">
                <span className="text-slate-400">Delivery Status</span>
                <span className={`font-bold capitalize ${
                  viewingInvoice.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {viewingInvoice.paymentStatus === 'pending' ? 'Verifying TrxID' : 'Delivered to Vault'}
                </span>
              </div>
            </div>

            {/* Item Breakdown */}
            <div className="border-t border-white/[0.06] pt-3 space-y-1.5 text-xs">
              {viewingInvoice.items.map((item, i) => (
                <div key={i} className="flex justify-between text-slate-300">
                  <span>{item.productName} ({item.durationLabel}) ×{item.quantity}</span>
                  <span className="font-bold text-white font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-black text-white border-t border-white/[0.06] pt-2 mt-2">
                <span>Total Paid</span>
                <span className="text-emerald-400 font-mono">
                  {viewingInvoice.totalBdt ? `৳${viewingInvoice.totalBdt.toLocaleString()} BDT` : `$${viewingInvoice.total.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => printCleanInvoice(viewingInvoice)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" /> Download / Print Clean Invoice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
