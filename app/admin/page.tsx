'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Shield,
  TrendingUp,
  DollarSign,
  Users,
  Repeat,
  Package,
  Mail,
  Play,
  FastForward,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Server,
  Layers,
  Database,
  ArrowUpRight,
  Eye,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { EmailNotification } from '@/types';

export default function AdminPortalPage() {
  const {
    financialMetrics,
    products,
    subscriptions,
    orders,
    emailNotifications,
    sendTestEmail,
    triggerRenewalCronSimulation,
    fastForwardSimulationDays,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'analytics' | 'renewals' | 'inventory' | 'smtp' | 'orders'>('analytics');

  // Renewal Cron Status state
  const [cronFeedback, setCronFeedback] = useState<string | null>(null);

  // SMTP Testing state
  const [smtpRecipient, setSmtpRecipient] = useState('customer.vip@example.com');
  const [smtpTemplate, setSmtpTemplate] = useState<EmailNotification['templateType']>('order_fulfillment');
  const [smtpFeedback, setSmtpFeedback] = useState<string | null>(null);

  // Stock update modal state
  const [selectedProductForStock, setSelectedProductForStock] = useState<string>(products[0]?.id || '');
  const [stockAddAmount, setStockAddAmount] = useState<number>(20);
  const [stockFeedback, setStockFeedback] = useState<string | null>(null);

  // Search orders
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Sample analytics chart data
  const revenueChartData = [
    { month: 'Jan', mrr: 31200, orders: 840 },
    { month: 'Feb', mrr: 34500, orders: 960 },
    { month: 'Mar', mrr: 38900, orders: 1120 },
    { month: 'Apr', mrr: 41800, orders: 1250 },
    { month: 'May', mrr: 45200, orders: 1390 },
    { month: 'Jun', mrr: 48920, orders: 1540 },
  ];

  const categoryShareData = [
    { name: 'AI & LLMs', revenue: 24800, fill: '#8b5cf6' },
    { name: 'Streaming 4K', revenue: 14200, fill: '#f43f5e' },
    { name: 'Dev Tools', revenue: 6400, fill: '#06b6d4' },
    { name: 'Design / Pro', revenue: 3520, fill: '#10b981' },
  ];

  const handleRunRenewalCron = () => {
    const res = triggerRenewalCronSimulation();
    setCronFeedback(`Cron executed successfully: ${res.renewedCount} subscriptions auto-renewed, ${res.notifiedCount} expiry notices queued.`);
    setTimeout(() => setCronFeedback(null), 5000);
  };

  const handleFastForward = (days: number) => {
    fastForwardSimulationDays(days);
    setCronFeedback(`Simulated time advanced by +${days} days. Checked renewal expirations.`);
    setTimeout(() => setCronFeedback(null), 5000);
  };

  const handleSendSmtpTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpRecipient.trim()) return;
    sendTestEmail(smtpRecipient, smtpTemplate);
    setSmtpFeedback(`✓ SMTP Transactional Email dispatched to ${smtpRecipient}`);
    setTimeout(() => setSmtpFeedback(null), 4000);
  };

  const filteredOrders = orders.filter((o) => {
    if (!orderSearchQuery.trim()) return true;
    const q = orderSearchQuery.toLowerCase();
    return o.orderNumber.toLowerCase().includes(q) || o.userEmail.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-obsidian-900 via-brand-950/40 to-obsidian-900 border border-brand-500/30 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 shadow-glow">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">Master Admin Command Center</h1>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Live Production Ops
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Recurring revenue growth monitoring, wholesale credential provisioning & automated renewal cron controller.
            </p>
          </div>
        </div>

        {/* Quick Simulation Triggers */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRunRenewalCron}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-emerald transition-all flex items-center gap-1.5"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Run Renewal Engine</span>
          </button>
          <button
            onClick={() => handleFastForward(7)}
            className="px-3.5 py-2 rounded-xl bg-obsidian-850 hover:bg-obsidian-800 text-slate-200 border border-white/[0.1] text-xs font-semibold transition-all flex items-center gap-1"
          >
            <FastForward className="h-3.5 w-3.5 text-cyan-400" />
            <span>+7 Days Sim</span>
          </button>
        </div>
      </div>

      {/* Cron Notification Alert */}
      {cronFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-xs font-semibold text-emerald-300 flex items-center gap-2 shadow-glow-emerald">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{cronFeedback}</span>
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveAdminTab('analytics')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeAdminTab === 'analytics'
              ? 'bg-brand-600 text-white shadow-glow border border-brand-400/40'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <TrendingUp className="h-4 w-4 text-cyan-400" />
          <span>MRR & Revenue Analytics</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('renewals')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeAdminTab === 'renewals'
              ? 'bg-brand-600 text-white shadow-glow border border-brand-400/40'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Repeat className="h-4 w-4 text-emerald-400" />
          <span>Auto-Renewal Engine ({subscriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('inventory')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeAdminTab === 'inventory'
              ? 'bg-brand-600 text-white shadow-glow border border-brand-400/40'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Package className="h-4 w-4 text-amber-400" />
          <span>Wholesale Stock & Pool</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('orders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeAdminTab === 'orders'
              ? 'bg-brand-600 text-white shadow-glow border border-brand-400/40'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <DollarSign className="h-4 w-4 text-blue-400" />
          <span>Customer Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('smtp')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeAdminTab === 'smtp'
              ? 'bg-brand-600 text-white shadow-glow border border-brand-400/40'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Mail className="h-4 w-4 text-purple-400" />
          <span>SMTP Notifications & Templates</span>
        </button>
      </div>

      {/* TAB 1: MRR & RECURRING REVENUE ANALYTICS */}
      {activeAdminTab === 'analytics' && (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            <div className="p-5 rounded-3xl bg-obsidian-900 border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Monthly Recurring (MRR)</span>
                <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                  <ArrowUpRight className="h-3.5 w-3.5" /> +28.4%
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white font-mono">
                ${financialMetrics.mrr.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-500">Run-rate ARR: ${(financialMetrics.mrr * 12).toLocaleString()}</p>
            </div>

            <div className="p-5 rounded-3xl bg-obsidian-900 border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Active Subscribers</span>
                <span className="text-cyan-400 font-bold">98.6% Retained</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
                {financialMetrics.activeSubscribers.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500">Avg Life Time Value: $142.50</p>
            </div>

            <div className="p-5 rounded-3xl bg-obsidian-900 border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Today Gross Inflow</span>
                <span className="text-brand-400 font-bold">Realtime Bot</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                ${financialMetrics.netRevenueToday.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-500">Avg Order Value: $34.80</p>
            </div>

            <div className="p-5 rounded-3xl bg-obsidian-900 border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Monthly Churn Rate</span>
                <span className="text-emerald-400 font-bold">Ultra Low</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                {financialMetrics.churnRate}%
              </p>
              <p className="text-[11px] text-slate-500">Benchmark Industry: 5.2%</p>
            </div>

          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Area Chart: MRR Velocity */}
            <div className="lg:col-span-8 p-6 rounded-3xl bg-obsidian-900 border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">MRR Growth & Recurring Revenue Velocity</h3>
                  <p className="text-xs text-slate-400">Cumulative Monthly Recurring Inflow (USD)</p>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  +56% Q/Q
                </span>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2742" />
                    <XAxis dataKey="month" stroke="#64748b" textAnchor="end" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d14', borderColor: '#312e81', borderRadius: '12px' }}
                      formatter={(val: number) => [`$${val.toLocaleString()}`, 'MRR']}
                    />
                    <Area type="monotone" dataKey="mrr" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart: Revenue by Category */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-obsidian-900 border border-white/[0.08] space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Revenue By Category</h3>
                <p className="text-xs text-slate-400">AI Models leading retail demand</p>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryShareData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2742" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} interval={0} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d14', borderColor: '#312e81', borderRadius: '12px' }}
                      formatter={(val: number) => [`$${val.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: AUTO-RENEWAL ENGINE CONTROLLER */}
      {activeAdminTab === 'renewals' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-obsidian-900 border border-white/[0.08]">
            <div>
              <h3 className="text-lg font-bold text-white">Automated Renewal Queue</h3>
              <p className="text-xs text-slate-400">
                Subscriptions scheduled for auto-charge, email reminders, and cryptographic credential renewal.
              </p>
            </div>
            <button
              onClick={handleRunRenewalCron}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-obsidian-950 font-black text-xs shadow-glow-emerald transition-all flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              <span>Trigger Cron Job Now</span>
            </button>
          </div>

          <div className="rounded-3xl bg-obsidian-900 border border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-obsidian-950 text-slate-400 uppercase font-semibold border-b border-white/[0.06]">
                  <tr>
                    <th className="p-4">Sub ID</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Account User</th>
                    <th className="p-4">Renewal Expiry</th>
                    <th className="p-4">Auto-Renew</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-slate-300">
                  {subscriptions.map((sub) => {
                    const days = Math.ceil((new Date(sub.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={sub.id} className="hover:bg-white/[0.02]">
                        <td className="p-4 font-mono font-bold text-white">{sub.id}</td>
                        <td className="p-4 font-semibold text-slate-200">{sub.productName}</td>
                        <td className="p-4 font-mono text-slate-400">{sub.credentials.email}</td>
                        <td className="p-4">
                          <span className={`font-bold ${days <= 3 ? 'text-amber-400' : 'text-slate-200'}`}>
                            {new Date(sub.expiryDate).toLocaleDateString()} ({days}d left)
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sub.autoRenew ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' : 'bg-obsidian-950 text-slate-500'
                          }`}>
                            {sub.autoRenew ? 'ACTIVE' : 'MANUAL'}
                          </span>
                        </td>
                        <td className="p-4 uppercase font-bold text-[10px] text-cyan-400">
                          {sub.status.replace('_', ' ')}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => fastForwardSimulationDays(3)}
                            className="px-2.5 py-1 rounded bg-obsidian-800 hover:bg-obsidian-700 text-[10px] font-bold text-slate-300"
                          >
                            Simulate -3d
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WHOLESALE STOCK & INVENTORY POOL */}
      {activeAdminTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => (
              <div key={prod.id} className="p-6 rounded-3xl bg-obsidian-900 border border-white/[0.08] space-y-4">
                <div className="flex items-center gap-3">
                  <img src={prod.logo} alt={prod.name} className="h-12 w-12 rounded-xl object-cover" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{prod.name}</h4>
                    <span className="text-xs text-slate-400 capitalize">{prod.deliveryType.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/[0.05] flex items-center justify-between">
                  <span className="text-xs text-slate-400">Remaining Bot Slots:</span>
                  <span className="text-base font-black text-emerald-400 font-mono">{prod.stockCount} Available</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      prod.stockCount += 25;
                      setStockFeedback(`✓ Added +25 wholesale slots to ${prod.name}`);
                      setTimeout(() => setStockFeedback(null), 3000);
                    }}
                    className="flex-1 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-xs font-bold text-slate-200 border border-white/[0.1] transition-colors"
                  >
                    +25 Batch Replenish
                  </button>
                </div>
              </div>
            ))}
          </div>

          {stockFeedback && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 font-bold">
              {stockFeedback}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CUSTOMER ORDERS TABLE */}
      {activeAdminTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Search orders by number or email..."
                className="w-full pl-10 pr-4 py-2 bg-obsidian-900 border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="rounded-3xl bg-obsidian-900 border border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-obsidian-950 text-slate-400 uppercase font-semibold border-b border-white/[0.06]">
                  <tr>
                    <th className="p-4">Order #</th>
                    <th className="p-4">Customer Email</th>
                    <th className="p-4">Item Details</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-slate-300">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-mono font-bold text-white">{o.orderNumber}</td>
                      <td className="p-4 font-medium text-slate-200">{o.userEmail}</td>
                      <td className="p-4">
                        {o.items.map((i, idx) => (
                          <div key={idx} className="text-slate-300">
                            {i.productName} ({i.durationLabel})
                          </div>
                        ))}
                      </td>
                      <td className="p-4 font-black text-emerald-400 font-mono">${o.total.toFixed(2)}</td>
                      <td className="p-4 font-mono uppercase text-[10px] text-cyan-400">{o.paymentMethod.replace('_', ' ')}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                          {o.deliveryStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SMTP NOTIFICATIONS & LIVE PREVIEWS */}
      {activeAdminTab === 'smtp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Dispatcher Form */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-obsidian-900 border border-white/[0.08] space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-400" />
                <span>SMTP Transactional Engine</span>
              </h3>
              <p className="text-xs text-slate-400">
                Trigger simulated live SMTP transactional emails to verify template rendering and delivery webhooks.
              </p>

              <form onSubmit={handleSendSmtpTest} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Target Recipient</label>
                  <input
                    type="email"
                    value={smtpRecipient}
                    onChange={(e) => setSmtpRecipient(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-obsidian-850 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Select Email Template</label>
                  <select
                    value={smtpTemplate}
                    onChange={(e) => setSmtpTemplate(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-obsidian-850 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="order_fulfillment">Order Credentials Delivered</option>
                    <option value="renewal_reminder">3-Day Expiration Renewal Notice</option>
                    <option value="auto_renewal_success">Auto-Renew Payment Confirmed</option>
                    <option value="security_alert">New Device Login Alert</option>
                    <option value="invoice_receipt">Tax Invoice PDF Receipt</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-glow-purple transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Live SMTP Preview</span>
                </button>
              </form>

              {smtpFeedback && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 font-bold">
                  {smtpFeedback}
                </div>
              )}
            </div>

            {/* Email Dispatch History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent SMTP Dispatches ({emailNotifications.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {emailNotifications.map((eml) => (
                  <div key={eml.id} className="p-3 rounded-xl bg-obsidian-900 border border-white/[0.06] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white truncate max-w-[200px]">{eml.subject}</span>
                      <span className="text-[9px] uppercase font-bold text-emerald-400">{eml.status}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">To: {eml.recipientEmail}</p>
                    <p className="text-[9px] text-slate-500">{new Date(eml.sentAt).toLocaleTimeString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Live HTML Template Preview Frame */}
          <div className="lg:col-span-7">
            <div className="p-6 rounded-3xl bg-obsidian-900 border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Live HTML Render Preview
                </span>
                <span className="text-xs font-mono text-cyan-400 font-bold">{smtpTemplate}.html</span>
              </div>

              {/* Mock rendered email body */}
              <div className="rounded-2xl bg-obsidian-950 border border-white/[0.1] p-6 text-slate-200 space-y-4 font-sans text-xs">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold">
                      SN
                    </div>
                    <span className="font-black text-sm text-white">SubNexus VIP Fulfillment</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">SMTP 250 OK</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white">
                    {smtpTemplate === 'order_fulfillment' && 'Your Subscription Credentials Have Been Allocated'}
                    {smtpTemplate === 'renewal_reminder' && 'Reminder: Your Subscription Renews in 3 Days'}
                    {smtpTemplate === 'auto_renewal_success' && 'Auto-Renewal Payment Successfully Settled'}
                    {smtpTemplate === 'security_alert' && 'Security Notice: New Session Initiated'}
                    {smtpTemplate === 'invoice_receipt' && 'Tax Invoice & Proof of Payment'}
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Hello Alex Vance, this is an automated dispatch from the SubNexus Enterprise Gateway regarding your account.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-obsidian-900 border border-brand-500/30 space-y-2 font-mono text-[11px]">
                  <p className="text-cyan-400 font-bold">Account Vault Snapshot:</p>
                  <p className="text-slate-300">Target Email: {smtpRecipient}</p>
                  <p className="text-slate-300">AES-256 Vault Token: enc_9941_vip_active</p>
                  <p className="text-emerald-400">Warranty: 100% Term Protected</p>
                </div>

                <p className="text-[10px] text-slate-500 pt-2 border-t border-white/[0.06]">
                  SubNexus Inc. 256-Bit SSL Automated Retail Vault. Reply directly to this email for assistance.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
