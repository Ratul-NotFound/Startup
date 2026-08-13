'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  Shield,
  Key,
  CreditCard,
  History,
  Headphones,
  Settings,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Plus,
  RefreshCw,
  FileText,
  Send,
  Lock,
  ChevronRight,
  Download,
} from 'lucide-react';
import { calculateDaysRemaining, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function CustomerDashboardPage() {
  const {
    user,
    subscriptions,
    orders,
    toggleAutoRenew,
    extendSubscription,
    setActiveVaultSub,
    tickets,
    createSupportTicket,
    replyToTicket,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'subscriptions' | 'invoices' | 'settings' | 'support'>('subscriptions');

  // Support ticket form states
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'credential_issue' | 'renewal_help' | 'payment_issue' | 'general'>('credential_issue');
  const [ticketMessage, setTicketMessage] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(tickets[0]?.id || null);
  const [replyInput, setReplyInput] = useState('');

  // Invoice view modal
  const [viewingInvoiceOrder, setViewingInvoiceOrder] = useState<any | null>(null);

  const activeCount = subscriptions.filter((s) => s.status === 'active' || s.status === 'expiring_soon').length;
  const expiringSoonCount = subscriptions.filter((s) => s.status === 'expiring_soon').length;
  const totalSpent = orders.reduce((acc, o) => acc + o.total, 0);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    const t = createSupportTicket(ticketSubject, ticketCategory, ticketMessage);
    setSelectedTicketId(t.id);
    setTicketSubject('');
    setTicketMessage('');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyInput.trim()) return;
    replyToTicket(selectedTicketId, replyInput, 'user');
    setReplyInput('');
  };

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Banner Profile Summary */}
      <div className="rounded-3xl bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-brand-950/40 border border-white/[0.08] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover ring-4 ring-brand-500/40 shadow-glow"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{user.name}</h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  VIP Verified
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{user.email}</p>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">Customer ID: {user.id}</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-1">
            <div className="p-3.5 rounded-2xl bg-obsidian-950/80 border border-white/[0.08] text-center min-w-28">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Active Subs</span>
              <p className="text-xl font-black text-cyan-400 mt-0.5">{activeCount}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-obsidian-950/80 border border-white/[0.08] text-center min-w-28">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Expiring Soon</span>
              <p className={`text-xl font-black mt-0.5 ${expiringSoonCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                {expiringSoonCount}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-obsidian-950/80 border border-white/[0.08] text-center min-w-28">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Saved</span>
              <p className="text-xl font-black text-emerald-400 mt-0.5">$840+</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'subscriptions'
              ? 'bg-brand-600 text-white shadow-glow border border-brand-400/40'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Key className="h-4 w-4 text-cyan-400" />
          <span>My Subscriptions Vault ({subscriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'invoices'
              ? 'bg-brand-600 text-white shadow-glow border border-brand-400/40'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <FileText className="h-4 w-4 text-indigo-400" />
          <span>Billing & Invoices ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'support'
              ? 'bg-brand-600 text-white shadow-glow border border-brand-400/40'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Headphones className="h-4 w-4 text-amber-400" />
          <span>AI Support Concierge ({tickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-brand-600 text-white shadow-glow border border-brand-400/40'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Settings className="h-4 w-4 text-slate-400" />
          <span>Renewal Settings</span>
        </button>
      </div>

      {/* TAB 1: SUBSCRIPTIONS VAULT & AUTO-RENEWALS */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Active Subscription Vault</h2>
              <p className="text-xs text-slate-400">
                Reveal decrypted passwords, setup codes, profile slots, and manage automated renewal cycles.
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-glow transition-all flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Subscription</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((sub) => {
              const daysRemaining = calculateDaysRemaining(sub.expiryDate);
              const isUrgent = daysRemaining <= 3;

              return (
                <div
                  key={sub.id}
                  className={`p-6 rounded-3xl bg-obsidian-900 border transition-all flex flex-col justify-between relative overflow-hidden ${
                    isUrgent
                      ? 'border-amber-500/50 shadow-amber-500/10 shadow-lg'
                      : 'border-white/[0.08] hover:border-brand-500/40'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={sub.productLogo}
                          alt={sub.productName}
                          className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/10"
                        />
                        <div>
                          <h3 className="text-sm font-bold text-white leading-snug">{sub.productName}</h3>
                          <span className="text-xs font-medium text-slate-400">{sub.durationLabel} Plan</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isUrgent
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {isUrgent ? 'Expiring Soon' : 'Active'}
                      </span>
                    </div>

                    {/* Progress Bar for Expiry */}
                    <div className="space-y-1.5 my-4 p-3.5 rounded-2xl bg-obsidian-950 border border-white/[0.05]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-cyan-400" />
                          Time Remaining
                        </span>
                        <span className={`font-bold ${isUrgent ? 'text-amber-400' : 'text-white'}`}>
                          {daysRemaining} Days
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-obsidian-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isUrgent ? 'bg-amber-400' : 'bg-gradient-to-r from-brand-500 to-cyan-400'
                          }`}
                          style={{ width: `${Math.min(100, (daysRemaining / 90) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Started: {new Date(sub.startDate).toLocaleDateString()}</span>
                        <span>Renews: {new Date(sub.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Account Type & Slot Info */}
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-4 px-1">
                      <span className="capitalize text-slate-400">
                        Type: <strong className="text-white">{sub.accountType.replace('_', ' ')}</strong>
                      </span>
                      <span className="text-emerald-400 font-medium">100% Warranty</span>
                    </div>
                  </div>

                  {/* Vault Actions */}
                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    <button
                      onClick={() => setActiveVaultSub(sub)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white text-xs font-bold shadow-glow transition-all flex items-center justify-center gap-2"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>Open Decrypted Vault</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => toggleAutoRenew(sub.id)}
                        className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-colors ${
                          sub.autoRenew
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                            : 'bg-obsidian-850 border-white/[0.08] text-slate-400'
                        }`}
                      >
                        {sub.autoRenew ? '✓ Auto-Renew ON' : 'Auto-Renew OFF'}
                      </button>

                      <button
                        onClick={() => extendSubscription(sub.id, 30)}
                        className="py-2 px-2 rounded-xl bg-obsidian-850 hover:bg-obsidian-800 border border-white/[0.08] text-slate-200 text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3 text-cyan-400" />
                        <span>+30 Days</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: BILLING HISTORY & INVOICES */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Billing History & Tax Invoices</h2>
              <p className="text-xs text-slate-400">
                View cryptographic order receipts, transaction hashes, and download tax invoices.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-obsidian-900 border border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-obsidian-950 text-slate-400 uppercase font-semibold border-b border-white/[0.06]">
                  <tr>
                    <th className="p-4">Invoice #</th>
                    <th className="p-4">Subscriptions Purchased</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-slate-300">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-mono font-bold text-white">{order.orderNumber}</td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {order.items.map((i, idx) => (
                            <div key={idx} className="font-semibold text-slate-200">
                              {i.productName} ({i.durationLabel})
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 font-mono uppercase text-slate-300">{order.paymentMethod.replace('_', ' ')}</td>
                      <td className="p-4 font-bold text-white">${order.total.toFixed(2)}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setViewingInvoiceOrder(order)}
                          className="px-3 py-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-slate-200 text-xs font-bold border border-white/[0.1] inline-flex items-center gap-1.5 transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5 text-cyan-400" />
                          <span>View Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 24/7 AI SUPPORT CONCIERGE & TICKETS */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Create New Ticket */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-obsidian-900 border border-white/[0.08] space-y-4">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold">Open Priority Support Ticket</h3>
              </div>
              <p className="text-xs text-slate-400">
                Need slot refresh, password update, or TV setup help? Our AI agent & human technicians reply within minutes.
              </p>

              <form onSubmit={handleCreateTicket} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Issue Category</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-obsidian-850 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="credential_issue">Credential Refresh & Login Help</option>
                    <option value="renewal_help">Automated Renewal Inquiry</option>
                    <option value="payment_issue">Payment & Invoicing</option>
                    <option value="general">General Support</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Subject</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Netflix TV PIN confirmation"
                    className="w-full px-3.5 py-2 rounded-xl bg-obsidian-850 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Detailed Message</label>
                  <textarea
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe your issue or request..."
                    className="w-full px-3.5 py-2 rounded-xl bg-obsidian-850 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-glow transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Ticket to Concierge</span>
                </button>
              </form>
            </div>

            {/* Ticket List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Your Support Tickets ({tickets.length})
              </h4>
              {tickets.map((tkt) => (
                <div
                  key={tkt.id}
                  onClick={() => setSelectedTicketId(tkt.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedTicketId === tkt.id
                      ? 'bg-brand-950/50 border-brand-500/50 shadow-md'
                      : 'bg-obsidian-900 border-white/[0.06] hover:bg-obsidian-850 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{tkt.ticketNumber}</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                      {tkt.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-white truncate">{tkt.subject}</h5>
                  <p className="text-[10px] text-slate-500 mt-1">{new Date(tkt.updatedAt).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Message Thread */}
          <div className="lg:col-span-7">
            {activeTicket ? (
              <div className="h-[600px] rounded-3xl bg-obsidian-900 border border-white/[0.08] flex flex-col justify-between overflow-hidden">
                
                {/* Header */}
                <div className="p-5 border-b border-white/[0.06] bg-obsidian-950 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{activeTicket.ticketNumber}</span>
                    <h4 className="text-sm font-bold text-white">{activeTicket.subject}</h4>
                  </div>
                  <span className="text-xs font-medium text-slate-400 capitalize">
                    Priority: <strong className="text-amber-400">{activeTicket.priority}</strong>
                  </span>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                  {activeTicket.messages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-bold text-slate-300">{msg.senderName}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div
                          className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed ${
                            isUser
                              ? 'bg-brand-600 text-white rounded-tr-none'
                              : 'bg-obsidian-850 text-slate-200 border border-white/[0.08] rounded-tl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Input */}
                <form onSubmit={handleSendReply} className="p-4 bg-obsidian-950 border-t border-white/[0.06] flex gap-2">
                  <input
                    type="text"
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    placeholder="Type your reply message..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-obsidian-850 border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-glow transition-all flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send</span>
                  </button>
                </form>

              </div>
            ) : (
              <div className="h-96 rounded-3xl bg-obsidian-900 border border-white/[0.08] flex items-center justify-center text-slate-500 text-xs">
                Select or create a ticket to view the conversation.
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 4: RENEWAL PREFERENCES */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="p-6 rounded-3xl bg-obsidian-900 border border-white/[0.08] space-y-6">
            <h3 className="text-lg font-bold text-white">Automated Renewal Configuration</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-obsidian-850 border border-white/[0.06]">
                <div>
                  <h4 className="text-xs font-bold text-white">Master Auto-Renew Feature</h4>
                  <p className="text-[11px] text-slate-400">Automatically renew expiring subscriptions to prevent slot loss</p>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  ENABLED
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-obsidian-850 border border-white/[0.06]">
                <div>
                  <h4 className="text-xs font-bold text-white">Email Expiry Notification Threshold</h4>
                  <p className="text-[11px] text-slate-400">Receive SMTP transactional warnings before renewal billing</p>
                </div>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                  3 Days Prior
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-obsidian-850 border border-white/[0.06]">
                <div>
                  <h4 className="text-xs font-bold text-white">Fallback Payment Source</h4>
                  <p className="text-[11px] text-slate-400">Primary gateway charged during auto-renew cycles</p>
                </div>
                <span className="text-xs font-bold text-slate-300 bg-obsidian-950 px-2.5 py-1 rounded-lg border border-white/[0.1]">
                  Crypto USDT / Stripe Card
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE VIEW MODAL */}
      {viewingInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl bg-obsidian-900 border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-black text-white">Tax Invoice #{viewingInvoiceOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setViewingInvoiceOrder(null)}
                className="p-1.5 rounded-lg bg-obsidian-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-obsidian-950 border border-white/[0.06] space-y-3 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Customer:</span>
                <span className="font-bold text-white">{viewingInvoiceOrder.userEmail}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Issue Date:</span>
                <span className="text-white">{new Date(viewingInvoiceOrder.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Tx Hash:</span>
                <span className="font-mono text-cyan-400 truncate max-w-[200px]">{viewingInvoiceOrder.transactionHash}</span>
              </div>
            </div>

            <div className="space-y-2 border-y border-white/[0.06] py-3 text-xs">
              {viewingInvoiceOrder.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-slate-300">
                  <span>{item.productName} ({item.durationLabel}) x{item.quantity}</span>
                  <span className="font-bold text-white">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-white/[0.04]">
                <span>Total Paid</span>
                <span className="text-emerald-400 font-mono">${viewingInvoiceOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setViewingInvoiceOrder(null)}
                className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-glow transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="h-4 w-4" />
                <span>Print / Download PDF Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
