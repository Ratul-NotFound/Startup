'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Key, FileText, Headphones, Settings, CheckCircle2, AlertTriangle,
  Clock, Plus, RefreshCw, Send, Lock, Download, LogIn, ShoppingBag,
  User, X, Eye, EyeOff,
} from 'lucide-react';
import { calculateDaysRemaining } from '@/lib/utils';
import Link from 'next/link';

export default function CustomerDashboardPage() {
  const {
    user, firebaseUser, subscriptions, orders, toggleAutoRenew, extendSubscription,
    setActiveVaultSub, tickets, createSupportTicket, replyToTicket, setIsAuthModalOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'subscriptions' | 'orders' | 'support' | 'settings'>('subscriptions');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'credential_issue' | 'renewal_help' | 'payment_issue' | 'general'>('credential_issue');
  const [ticketMessage, setTicketMessage] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [viewingInvoice, setViewingInvoice] = useState<typeof orders[0] | null>(null);
  const [extendConfirm, setExtendConfirm] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});

  // ─── AUTH GATE ──────────────────────────────────────────────────────
  if (!firebaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-sm">
          <div className="h-20 w-20 mx-auto rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-center">
            <Lock className="h-9 w-9 text-zinc-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Your Dashboard</h1>
            <p className="text-sm text-slate-400 mt-2">
              Sign in to view your subscriptions, orders, and account details.
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-zinc-950 font-bold text-sm hover:bg-zinc-100 transition-all"
          >
            <LogIn className="h-4 w-4" />
            Sign In to Continue
          </button>
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <button onClick={() => setIsAuthModalOpen(true)} className="text-cyan-400 hover:underline">
              Create one free
            </button>
          </p>
        </div>
      </div>
    );
  }

  const activeCount = subscriptions.filter(s => s.status === 'active' || s.status === 'expiring_soon').length;
  const expiringSoon = subscriptions.filter(s => s.status === 'expiring_soon').length;
  const totalSpent = orders.reduce((acc, o) => acc + o.total, 0);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    const t = createSupportTicket(ticketSubject, ticketCategory, ticketMessage);
    setSelectedTicketId(t.id);
    setTicketSubject(''); setTicketMessage('');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyInput.trim()) return;
    replyToTicket(selectedTicketId, replyInput, 'user');
    setReplyInput('');
  };

  const activeTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0] || null;

  const tabs = [
    { id: 'subscriptions', label: 'My Subscriptions', count: subscriptions.length, icon: <Key className="h-4 w-4" /> },
    { id: 'orders', label: 'Orders', count: orders.length, icon: <FileText className="h-4 w-4" /> },
    { id: 'support', label: 'Support', count: tickets.length, icon: <Headphones className="h-4 w-4" /> },
    { id: 'settings', label: 'Settings', count: null, icon: <Settings className="h-4 w-4" /> },
  ] as const;

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

      {/* Profile Header */}
      <div className="rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/[0.08] p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover ring-2 ring-white/10"
              onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=200`; }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{user.name}</h1>
                {orders.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Verified Buyer
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>
              <p className="text-[11px] text-slate-600 mt-1">Member since {new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {[
              { label: 'Active Plans', value: activeCount, color: 'text-cyan-400' },
              { label: 'Orders', value: orders.length, color: 'text-white' },
              { label: 'Total Spent', value: `$${totalSpent.toFixed(2)}`, color: 'text-emerald-400' },
            ].map(m => (
              <div key={m.label} className="p-3.5 rounded-2xl bg-zinc-900 border border-white/[0.08] text-center min-w-[90px]">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">{m.label}</span>
                <p className={`text-xl font-black mt-0.5 ${m.color}`}>{m.value}</p>
              </div>
            ))}
            {expiringSoon > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/30 text-center min-w-[90px]">
                <span className="text-[10px] text-amber-400 uppercase font-bold block">Expiring Soon</span>
                <p className="text-xl font-black mt-0.5 text-amber-400">{expiringSoon}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/[0.08] pb-0 overflow-x-auto scrollbar-none">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-white text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== null && tab.count > 0 && (
              <span className="bg-white/10 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ─── SUBSCRIPTIONS TAB ──────────────────────────────────── */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">My Subscriptions</h2>
              <p className="text-xs text-slate-400">View credentials, manage renewals, and extend plans.</p>
            </div>
            <Link href="/" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all">
              <Plus className="h-4 w-4" /> Add Subscription
            </Link>
          </div>

          {subscriptions.length === 0 ? (
            <div className="py-20 text-center space-y-4 rounded-3xl border border-white/[0.06] bg-zinc-900/40">
              <ShoppingBag className="h-12 w-12 text-zinc-600 mx-auto" />
              <p className="text-lg font-bold text-zinc-400">No subscriptions yet</p>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto">Browse our catalog and buy your first subscription to see it here.</p>
              <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-all">
                Browse Subscriptions
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subscriptions.map(sub => {
                const daysLeft = calculateDaysRemaining(sub.expiryDate);
                const isUrgent = daysLeft <= 3;
                const isExpired = sub.status === 'expired' || daysLeft < 0;
                const showCreds = showCredentials[sub.id];

                return (
                  <div
                    key={sub.id}
                    className={`p-5 rounded-3xl bg-zinc-900 border flex flex-col gap-4 ${
                      isUrgent && !isExpired ? 'border-amber-500/40' : isExpired ? 'border-red-500/30' : 'border-white/[0.08]'
                    }`}
                  >
                    {/* Product header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={sub.productLogo} alt={sub.productName} className="h-11 w-11 rounded-xl object-cover ring-1 ring-white/10 shrink-0" />
                        <div>
                          <h3 className="text-sm font-bold text-white">{sub.productName}</h3>
                          <span className="text-[11px] text-slate-400">{sub.durationLabel}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                        isExpired ? 'bg-red-950/60 text-red-400 border-red-500/30' :
                        isUrgent ? 'bg-amber-950/60 text-amber-400 border-amber-500/30' :
                        'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {isExpired ? 'Expired' : isUrgent ? 'Expiring' : 'Active'}
                      </span>
                    </div>

                    {/* Days remaining */}
                    <div className="space-y-1.5 p-3 rounded-2xl bg-zinc-950 border border-white/[0.05]">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Expires</span>
                        <span className={`font-bold ${isExpired ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-white'}`}>
                          {isExpired ? 'Expired' : `${daysLeft} days left`}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isExpired ? 'bg-red-500' : isUrgent ? 'bg-amber-400' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`}
                          style={{ width: `${Math.max(0, Math.min(100, (daysLeft / 90) * 100))}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">Expires: {new Date(sub.expiryDate).toLocaleDateString()}</p>
                    </div>

                    {/* Credentials reveal */}
                    <div className="rounded-2xl bg-zinc-950 border border-white/[0.05] overflow-hidden">
                      <button
                        onClick={() => setShowCredentials(prev => ({ ...prev, [sub.id]: !prev[sub.id] }))}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                      >
                        <span className="flex items-center gap-2"><Lock className="h-3.5 w-3.5 text-cyan-400" /> Credentials</span>
                        {showCreds ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      {showCreds && (
                        <div className="px-3.5 pb-3 space-y-1.5 border-t border-white/[0.05] pt-2.5">
                          {sub.credentials.email && (
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">Email</span>
                              <span className="font-mono text-white">{sub.credentials.email}</span>
                            </div>
                          )}
                          {sub.credentials.password && (
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">Password</span>
                              <span className="font-mono text-cyan-300">{sub.credentials.password}</span>
                            </div>
                          )}
                          {sub.credentials.pinCode && (
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">PIN</span>
                              <span className="font-mono text-cyan-300">{sub.credentials.pinCode}</span>
                            </div>
                          )}
                          {sub.credentials.notes && (
                            <p className="text-[10px] text-slate-500 mt-1">{sub.credentials.notes}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => toggleAutoRenew(sub.id)}
                        className={`py-2 rounded-xl text-[11px] font-bold border transition-colors ${
                          sub.autoRenew ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300' : 'bg-zinc-800 border-white/[0.08] text-slate-400'
                        }`}
                      >
                        {sub.autoRenew ? '✓ Auto-Renew' : 'Auto-Renew Off'}
                      </button>

                      {extendConfirm === sub.id ? (
                        <button
                          onClick={() => { extendSubscription(sub.id, 30); setExtendConfirm(null); }}
                          className="py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-colors"
                        >
                          Confirm +30d
                        </button>
                      ) : (
                        <button
                          onClick={() => setExtendConfirm(sub.id)}
                          className="py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/[0.08] text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <RefreshCw className="h-3 w-3 text-cyan-400" /> Extend
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── ORDERS TAB ─────────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Order History & Payment Tracking</h2>
            <span className="text-xs text-slate-400 font-semibold">{orders.length} total orders</span>
          </div>

          {orders.length === 0 ? (
            <div className="py-20 text-center space-y-4 rounded-3xl border border-white/[0.06] bg-zinc-900/40">
              <FileText className="h-12 w-12 text-zinc-600 mx-auto" />
              <p className="text-lg font-bold text-zinc-400">No orders yet</p>
              <p className="text-sm text-zinc-500">Your purchase history will appear here.</p>
            </div>
          ) : (
            <div className="rounded-3xl bg-zinc-900 border border-white/[0.08] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950 text-slate-400 uppercase font-semibold border-b border-white/[0.06] text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Order #</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Payment Method</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">TrxID / Status</th>
                      <th className="p-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05] text-slate-300">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-mono font-bold text-white">#{order.orderNumber}</td>
                        <td className="p-4">
                          <div className="space-y-0.5">
                            {order.items.map((i, idx) => (
                              <div key={idx} className="text-slate-200">
                                <span className="font-semibold">{i.productName}</span> · <span className="text-cyan-400 text-[11px] font-mono">{i.durationLabel}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 capitalize font-bold text-white">
                          {order.paymentMethodName || order.paymentMethod.replace(/_/g, ' ')}
                        </td>
                        <td className="p-4 font-bold text-white font-mono">
                          {order.totalBdt ? `৳${order.totalBdt.toLocaleString()} BDT` : `$${order.total.toFixed(2)}`}
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border block w-fit ${
                              order.paymentStatus === 'paid'
                                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
                                : order.paymentStatus === 'pending'
                                ? 'bg-amber-950/80 text-amber-400 border-amber-500/30 animate-pulse'
                                : 'bg-red-950/80 text-red-400 border-red-500/30'
                            }`}>
                              {order.paymentStatus === 'pending' ? '● Pending Verification' : order.paymentStatus}
                            </span>
                            {order.transactionId && (
                              <span className="text-[10px] text-slate-500 font-mono block">
                                TrxID: {order.transactionId}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setViewingInvoice(order)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-slate-200 border border-white/[0.1] inline-flex items-center gap-1.5 transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5 text-cyan-400" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── SUPPORT TAB ────────────────────────────────────────── */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-3xl bg-zinc-900 border border-white/[0.08] space-y-4">
              <h3 className="text-base font-bold text-white">Open a Support Ticket</h3>
              <form onSubmit={handleCreateTicket} className="space-y-3">
                <select
                  value={ticketCategory}
                  onChange={e => setTicketCategory(e.target.value as typeof ticketCategory)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="credential_issue">Login / Credential Help</option>
                  <option value="renewal_help">Renewal Inquiry</option>
                  <option value="payment_issue">Payment Issue</option>
                  <option value="general">General Question</option>
                </select>
                <input
                  type="text" value={ticketSubject} onChange={e => setTicketSubject(e.target.value)}
                  placeholder="Brief subject…"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <textarea
                  rows={4} value={ticketMessage} onChange={e => setTicketMessage(e.target.value)}
                  placeholder="Describe your issue…"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
                <button type="submit" className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
                  <Send className="h-3.5 w-3.5" /> Submit Ticket
                </button>
              </form>
            </div>

            <div className="space-y-2">
              {tickets.map(t => (
                <div
                  key={t.id} onClick={() => setSelectedTicketId(t.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedTicketId === t.id ? 'bg-blue-950/40 border-blue-500/40' : 'bg-zinc-900 border-white/[0.06] hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{t.ticketNumber}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      t.status === 'open' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' :
                      t.status === 'in_progress' ? 'bg-blue-950/60 text-blue-400 border-blue-500/30' :
                      'bg-zinc-800 text-zinc-400 border-white/10'
                    }`}>{t.status.replace('_', ' ')}</span>
                  </div>
                  <p className="text-xs font-bold text-white truncate">{t.subject}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            {activeTicket ? (
              <div className="h-[550px] rounded-3xl bg-zinc-900 border border-white/[0.08] flex flex-col">
                <div className="p-4 border-b border-white/[0.06] bg-zinc-950 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{activeTicket.ticketNumber}</span>
                    <h4 className="text-sm font-bold text-white">{activeTicket.subject}</h4>
                  </div>
                  <span className="text-xs text-amber-400 font-bold capitalize">Priority: {activeTicket.priority}</span>
                </div>
                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                  {activeTicket.messages.map(msg => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                        <span className="text-[11px] text-slate-400 mb-1">{msg.senderName} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <div className={`p-3 rounded-2xl max-w-sm text-xs leading-relaxed ${
                          isUser ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-zinc-800 text-slate-200 border border-white/[0.06] rounded-tl-none'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={handleSendReply} className="p-4 bg-zinc-950 border-t border-white/[0.06] flex gap-2">
                  <input
                    type="text" value={replyInput} onChange={e => setReplyInput(e.target.value)}
                    placeholder="Type your reply…"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all">
                    Send
                  </button>
                </form>
              </div>
            ) : (
              <div className="h-64 rounded-3xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-slate-500 text-sm">
                Select a ticket to view messages.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── SETTINGS TAB ───────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <div className="max-w-xl space-y-4">
          <h2 className="text-xl font-bold text-white">Account Settings</h2>
          <div className="p-5 rounded-3xl bg-zinc-900 border border-white/[0.08] space-y-4">
            <div className="flex items-center gap-4">
              <img src={user.avatar} alt={user.name} className="h-14 w-14 rounded-2xl object-cover ring-1 ring-white/10"
                onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=200`; }} />
              <div>
                <p className="text-sm font-bold text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
            {[
              { label: 'Auto-Renew Enabled', value: user.autoRenewEnabled ? 'On' : 'Off', color: user.autoRenewEnabled ? 'text-emerald-400' : 'text-slate-400' },
              { label: 'Email Alerts', value: user.emailAlertsEnabled ? 'On' : 'Off', color: user.emailAlertsEnabled ? 'text-emerald-400' : 'text-slate-400' },
              { label: 'Preferred Currency', value: 'BDT (৳) / USD ($)', color: 'text-slate-300' },
              { label: 'Account Role', value: user.role === 'admin' ? 'Admin' : 'Customer', color: user.role === 'admin' ? 'text-blue-400' : 'text-slate-300' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center p-3.5 rounded-2xl bg-zinc-950 border border-white/[0.05]">
                <span className="text-xs text-slate-400">{item.label}</span>
                <span className={`text-xs font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl bg-zinc-900 border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">OFFICIAL RECEIPT</span>
                <h3 className="text-base font-black text-white">Invoice #{viewingInvoice.orderNumber}</h3>
              </div>
              <button onClick={() => setViewingInvoice(null)} className="p-1.5 rounded-lg bg-zinc-800 text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between p-2.5 rounded-xl bg-zinc-950 border border-white/[0.05]">
                <span className="text-slate-400">Customer</span>
                <span className="font-mono text-white truncate max-w-[200px]">{viewingInvoice.userEmail}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-zinc-950 border border-white/[0.05]">
                <span className="text-slate-400">Order Date</span>
                <span className="text-white">{new Date(viewingInvoice.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-zinc-950 border border-white/[0.05]">
                <span className="text-slate-400">Payment Gateway</span>
                <span className="font-bold text-white capitalize">{viewingInvoice.paymentMethodName || viewingInvoice.paymentMethod}</span>
              </div>
              {viewingInvoice.senderNumber && (
                <div className="flex justify-between p-2.5 rounded-xl bg-zinc-950 border border-white/[0.05]">
                  <span className="text-slate-400">Sender Phone</span>
                  <span className="font-mono font-bold text-emerald-400">{viewingInvoice.senderNumber}</span>
                </div>
              )}
              {viewingInvoice.transactionId && (
                <div className="flex justify-between p-2.5 rounded-xl bg-zinc-950 border border-white/[0.05]">
                  <span className="text-slate-400">TrxID / Reference</span>
                  <span className="font-mono font-bold text-cyan-400 uppercase">{viewingInvoice.transactionId}</span>
                </div>
              )}
              <div className="flex justify-between p-2.5 rounded-xl bg-zinc-950 border border-white/[0.05]">
                <span className="text-slate-400">Verification Status</span>
                <span className={`font-bold capitalize ${
                  viewingInvoice.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {viewingInvoice.paymentStatus === 'pending' ? 'Pending Admin Approval' : viewingInvoice.paymentStatus}
                </span>
              </div>
            </div>

            <div className="border-t border-white/[0.06] pt-3 space-y-1.5 text-xs">
              {viewingInvoice.items.map((item, i) => (
                <div key={i} className="flex justify-between text-slate-300">
                  <span>{item.productName} ({item.durationLabel}) ×{item.quantity}</span>
                  <span className="font-bold text-white">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-black text-white border-t border-white/[0.06] pt-2 mt-2">
                <span>Total Amount</span>
                <span className="text-emerald-400 font-mono">
                  {viewingInvoice.totalBdt ? `৳${viewingInvoice.totalBdt.toLocaleString()} BDT` : `$${viewingInvoice.total.toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
