'use client';

import React, { useState } from 'react';
import { useApp, SUPERADMIN_EMAIL } from '@/context/AppContext';
import {
  Shield, TrendingUp, DollarSign, Users, Package, Tag,
  Headphones, ShoppingBag, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, Clock, Search, RefreshCw, Eye, EyeOff,
  BarChart2, MessageSquare, Lock, LogIn, UserPlus, UserCheck,
  UserX, Sparkles, AlertTriangle, ArrowUpRight, Star, ThumbsUp,
  CreditCard, QrCode, Image as ImageIcon, Check,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Product, Coupon, UserSubscription, Order, AdminMember, Review, BangladeshPaymentMethod } from '@/types';

// ─── Blank product template ─────────────────────────────────────────
const blankProduct = (): Omit<Product, 'id'> => ({
  name: '', slug: '', category: 'ai', tagline: '', description: '',
  logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
  bannerGradient: 'from-blue-600/30 to-zinc-900',
  rating: 4.9, reviewCount: 120, deliveryType: 'instant_bot',
  accountType: 'private_account', deliveryTimeEstimate: 'Instant (< 30s)',
  features: ['Full access included', 'Fast reliable server pool', 'Replacement warranty'],
  specs: { screens: 1, quality: 'Premium HD/4K', warranty: 'Full Period Replacement', platforms: ['Web', 'iOS', 'Android'], region: 'Global' },
  pricingTiers: [
    { duration: '1_month', label: '1 Month', price: 9.99, originalPrice: 20.00, discountPercentage: 50, isPopular: false },
    { duration: '3_months', label: '3 Months', price: 24.99, originalPrice: 60.00, discountPercentage: 58, isPopular: true },
    { duration: '12_months', label: '12 Months', price: 79.99, originalPrice: 240.00, discountPercentage: 66 },
  ],
  stockCount: 50, instructions: ['Log in with credentials provided in your vault.', 'Enjoy your premium subscription.'],
});

export default function AdminPortalPage() {
  const {
    firebaseUser, isAdmin, isSuperAdmin, setIsAuthModalOpen,
    products, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
    allOrders, adminUpdateOrderStatus, adminApproveAndDeliverOrder, adminRejectOrder,
    allUsers, adminUpdateUserRole,
    allSubscriptions, adminUpdateSubscriptionCredentials, adminUpdateSubscriptionStatus,
    coupons, adminCreateCoupon, adminDeleteCoupon,
    paymentMethods, adminCreatePaymentMethod, adminUpdatePaymentMethod, adminDeletePaymentMethod, adminResetPaymentMethods,
    allTickets, adminReplyToTicket, adminCloseTicket,
    adminList, adminAddAdmin, adminRemoveAdmin,
    financialMetrics, triggerRenewalCronSimulation, fastForwardSimulationDays,
    refreshAllData, isSyncing,
    reviews, deleteReview, adminCreateReview, adminResetReviews,
  } = useApp();

  const [tab, setTab] = useState<'overview' | 'orders' | 'payments' | 'products' | 'users' | 'admins' | 'subscriptions' | 'coupons' | 'tickets' | 'reviews'>('overview');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'paid' | 'failed'>('all');
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<(BangladeshPaymentMethod & { isNew?: boolean }) | null>(null);
  const [reviewSearch, setReviewSearch] = useState('');
  const [showAdminReviewForm, setShowAdminReviewForm] = useState(false);
  const [newAdminReview, setNewAdminReview] = useState<{
    userName: string;
    productId: string;
    rating: number;
    title: string;
    comment: string;
    planDuration: string;
  }>({
    userName: '',
    productId: '',
    rating: 5,
    title: '',
    comment: '',
    planDuration: '12 Months',
  });

  // Products state
  const [editingProduct, setEditingProduct] = useState<(Product & { isNew?: boolean }) | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Orders state
  const [orderSearch, setOrderSearch] = useState('');
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  // Users state
  const [userSearch, setUserSearch] = useState('');

  // Admins state
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [adminRemoveConfirm, setAdminRemoveConfirm] = useState<string | null>(null);

  // Subscriptions state
  const [subSearch, setSubSearch] = useState('');
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [subCredEdit, setSubCredEdit] = useState<Record<string, string>>({});

  // Coupons state
  const [newCoupon, setNewCoupon] = useState<Coupon>({ code: '', discountPercent: 15, description: '' });
  const [showCouponForm, setShowCouponForm] = useState(false);

  // Tickets state
  const [ticketReply, setTicketReply] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  const revenueChartData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = months[d.getMonth()];
      const year = d.getFullYear();
      const monthOrders = allOrders.filter(o => {
        const od = new Date(o.createdAt);
        return od.getMonth() === d.getMonth() && od.getFullYear() === year && o.paymentStatus === 'paid';
      });
      const rev = monthOrders.reduce((acc, o) => acc + (o.total || 0), 0);
      result.push({ month: mName, revenue: rev, orders: monthOrders.length });
    }
    return result;
  }, [allOrders]);

  // ─── AUTH GATES ─────────────────────────────────────────────────────
  if (!firebaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-sm">
          <div className="h-20 w-20 mx-auto rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-center">
            <Shield className="h-9 w-9 text-zinc-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Admin Access</h1>
            <p className="text-sm text-slate-400 mt-1">Sign in with an authorized admin account to continue.</p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-zinc-950 font-bold text-sm hover:bg-zinc-100 transition-all"
          >
            <LogIn className="h-4 w-4" /> Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md p-8 rounded-3xl bg-zinc-900 border border-red-500/30">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-red-950/60 border border-red-500/30 flex items-center justify-center">
            <Lock className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Access Restricted</h1>
            <p className="text-sm text-slate-400 mt-2">
              The account <strong className="text-white font-mono">{firebaseUser.email}</strong> does not have administrator privileges.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Contact the superadmin at <strong className="text-cyan-400">{SUPERADMIN_EMAIL}</strong> to grant you access.
            </p>
          </div>
          <button
            onClick={async () => {
              setIsAuthModalOpen(true);
            }}
            className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-200 text-xs font-bold transition-all"
          >
            Switch Account
          </button>
        </div>
      </div>
    );
  }

  const pendingOrdersCount = allOrders.filter(o => o.paymentStatus === 'pending').length;

  // ─── ADMIN TAB NAVIGATION ─────────────────────────────────────────
  const navTabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 className="h-4 w-4" /> },
    {
      id: 'orders',
      label: pendingOrdersCount > 0 ? `Orders (${pendingOrdersCount} Pending)` : `Orders (${allOrders.length})`,
      icon: <ShoppingBag className={`h-4 w-4 ${pendingOrdersCount > 0 ? 'text-amber-400 animate-pulse' : ''}`} />,
    },
    { id: 'payments', label: `Payment Gateways (${paymentMethods.length})`, icon: <CreditCard className="h-4 w-4 text-emerald-400" /> },
    { id: 'products', label: `Products (${products.length})`, icon: <Package className="h-4 w-4" /> },
    { id: 'users', label: `Users (${allUsers.length})`, icon: <Users className="h-4 w-4" /> },
    { id: 'admins', label: `Admin Team (${adminList.length})`, icon: <Shield className="h-4 w-4 text-red-400" /> },
    { id: 'subscriptions', label: `Subscriptions (${allSubscriptions.length})`, icon: <Shield className="h-4 w-4" /> },
    { id: 'coupons', label: `Coupons (${coupons.length})`, icon: <Tag className="h-4 w-4" /> },
    { id: 'tickets', label: `Tickets (${allTickets.length})`, icon: <Headphones className="h-4 w-4" /> },
    { id: 'reviews', label: `Reviews (${reviews.length})`, icon: <Star className="h-4 w-4 text-amber-400" /> },
  ] as const;

  // ─── PRODUCT HANDLERS ─────────────────────────────────────────────
  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    try {
      if (editingProduct.isNew) {
        const { isNew, id, ...rest } = editingProduct as Product & { isNew: boolean };
        await adminCreateProduct(rest);
        showFeedback('success', 'Product created and synced to database.');
      } else {
        await adminUpdateProduct(editingProduct.id, editingProduct);
        showFeedback('success', 'Product updated in database.');
      }
      setEditingProduct(null);
    } catch { showFeedback('error', 'Failed to save product.'); }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await adminDeleteProduct(id);
      setDeleteConfirm(null);
      showFeedback('success', 'Product deleted from database.');
    } catch { showFeedback('error', 'Failed to delete product.'); }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  // ─── ORDER HANDLERS ───────────────────────────────────────────────
  const filteredOrders = allOrders.filter(o =>
    o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.userEmail.toLowerCase().includes(orderSearch.toLowerCase())
  );

  // ─── SUBSCRIPTION HANDLERS ────────────────────────────────────────
  const filteredSubs = allSubscriptions.filter(s =>
    s.productName.toLowerCase().includes(subSearch.toLowerCase()) ||
    s.credentials?.email?.toLowerCase().includes(subSearch.toLowerCase())
  );

  const handleSaveSubCreds = async (subId: string) => {
    await adminUpdateSubscriptionCredentials(subId, subCredEdit);
    setEditingSubId(null);
    setSubCredEdit({});
    showFeedback('success', 'Credentials updated in database.');
  };

  // ─── ADMIN TEAM HANDLERS ──────────────────────────────────────────
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;
    setIsAddingAdmin(true);
    const res = await adminAddAdmin(newAdminEmail.trim(), newAdminName.trim() || undefined);
    setIsAddingAdmin(false);
    if (res.success) {
      showFeedback('success', res.message);
      setNewAdminEmail('');
      setNewAdminName('');
    } else {
      showFeedback('error', res.message);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    const res = await adminRemoveAdmin(email);
    setAdminRemoveConfirm(null);
    if (res.success) {
      showFeedback('success', res.message);
    } else {
      showFeedback('error', res.message);
    }
  };

  // ─── COUPON HANDLERS ──────────────────────────────────────────────
  const handleCreateCoupon = async () => {
    if (!newCoupon.code.trim()) return;
    await adminCreateCoupon({ ...newCoupon, code: newCoupon.code.toUpperCase() });
    setNewCoupon({ code: '', discountPercent: 15, description: '' });
    setShowCouponForm(false);
    showFeedback('success', 'Coupon created and synced.');
  };

  // ─── TICKET HANDLERS ──────────────────────────────────────────────
  const handleReplyTicket = async (ticketId: string) => {
    if (!ticketReply.trim()) return;
    await adminReplyToTicket(ticketId, ticketReply);
    setTicketReply('');
    showFeedback('success', 'Reply sent to user.');
  };

  const activeTicket = allTickets.find(t => t.id === selectedTicketId) || allTickets[0] || null;

  return (
    <div className="min-h-screen py-8 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-900 border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-950/50">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">Admin Management Hub</h1>
              {isSuperAdmin ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-950 border border-red-500/40 text-red-300">
                  Superadmin
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-950 border border-blue-500/40 text-blue-300">
                  Administrator
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Logged in as {firebaseUser.email} · Real-time Firestore Sync Active</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={async () => {
              await refreshAllData();
              showFeedback('success', 'Database re-synced successfully.');
            }}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 border border-white/10 text-xs text-slate-200 hover:text-white font-bold flex items-center gap-2 hover:bg-zinc-750 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Live Data'}</span>
          </button>
        </div>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl border text-sm font-bold shadow-2xl animate-in slide-in-from-right duration-200 ${
          feedback.type === 'success' ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200' : 'bg-red-950/95 border-red-500/50 text-red-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-red-400" />}
          {feedback.msg}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-white/[0.08] overflow-x-auto scrollbar-none pb-0">
        {navTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 -mb-px transition-all ${
              tab === t.id ? 'border-white text-white bg-white/[0.03]' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* OVERVIEW TAB */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: `$${financialMetrics.mrr.toFixed(2)}`, sub: `${allOrders.length} total orders`, icon: <DollarSign className="h-5 w-5 text-emerald-400" />, color: 'text-emerald-400' },
              { label: 'Active Users', value: allUsers.length.toString(), sub: `${allSubscriptions.length} subscriptions`, icon: <Users className="h-5 w-5 text-blue-400" />, color: 'text-blue-400' },
              { label: "Today's Revenue", value: `$${financialMetrics.netRevenueToday.toFixed(2)}`, sub: 'Live automated checkout', icon: <TrendingUp className="h-5 w-5 text-cyan-400" />, color: 'text-cyan-400' },
              { label: 'Open Support Tickets', value: allTickets.filter(t => t.status !== 'closed').length.toString(), sub: `${allTickets.length} total tickets`, icon: <Headphones className="h-5 w-5 text-amber-400" />, color: 'text-amber-400' },
            ].map(kpi => (
              <div key={kpi.label} className="p-5 rounded-3xl bg-zinc-900 border border-white/[0.08] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">{kpi.label}</span>
                  <div className="h-8 w-8 rounded-xl bg-zinc-800 flex items-center justify-center">{kpi.icon}</div>
                </div>
                <div>
                  <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{kpi.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts & Quick Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-zinc-900 border border-white/[0.08] space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Revenue Performance</h3>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Real-time Data
                </span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12 }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#a5b4fc' }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900 border border-white/[0.08] space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Recent Store Orders</h3>
                <button onClick={() => setTab('orders')} className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
                  View All <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                {allOrders.slice(0, 6).map(o => (
                  <div key={o.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-950 border border-white/[0.04] text-xs">
                    <div>
                      <span className="font-mono text-cyan-400 font-bold">{o.orderNumber}</span>
                      <p className="text-slate-400 text-[11px] truncate max-w-[180px]">{o.userEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">${o.total.toFixed(2)}</p>
                      <span className="text-[10px] text-emerald-400 font-semibold">{o.paymentStatus}</span>
                    </div>
                  </div>
                ))}
                {allOrders.length === 0 && (
                  <p className="text-slate-500 text-xs text-center py-10">No orders recorded in Firestore yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Simulation & Maintenance Tools */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-white/[0.08] space-y-4">
            <h3 className="text-sm font-bold text-white">Automated Engine & Tools</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const res = triggerRenewalCronSimulation();
                  showFeedback('success', `Cron executed: ${res.renewedCount} renewed, ${res.notifiedCount} notices sent.`);
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Run Auto-Renewal Engine
              </button>
              {[7, 14, 30].map(d => (
                <button
                  key={d}
                  onClick={() => {
                    fastForwardSimulationDays(d);
                    showFeedback('success', `Simulated time forward by +${d} days.`);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 border border-white/10 text-xs font-bold text-slate-200 hover:bg-zinc-700 transition-all"
                >
                  Fast Forward +{d} Days
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ADMIN TEAM TAB */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === 'admins' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Administrator Access Control</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Grant team members access to the SubNexus Admin Control Panel.
                </p>
              </div>
            </div>

            {/* Add New Admin Form */}
            {isSuperAdmin && (
              <form onSubmit={handleAddAdmin} className="p-5 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-cyan-400" /> Add New Administrator
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <input
                      type="email"
                      required
                      value={newAdminEmail}
                      onChange={e => setNewAdminEmail(e.target.value)}
                      placeholder="admin.email@domain.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={newAdminName}
                      onChange={e => setNewAdminName(e.target.value)}
                      placeholder="Display Name (optional)"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={isAddingAdmin}
                      className="w-full h-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" /> Grant Access
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  When this user signs in with Google or Email, they will immediately have administrator panel access.
                </p>
              </form>
            )}

            {/* Admin Members List */}
            <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-slate-400 uppercase font-semibold border-b border-white/[0.06]">
                  <tr>
                    <th className="p-4">Admin</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Added On</th>
                    <th className="p-4">Granted By</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {adminList.map(admin => {
                    const isOwner = admin.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();

                    return (
                      <tr key={admin.id || admin.email} className="hover:bg-white/[0.02]">
                        <td className="p-4 font-bold text-white flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-cyan-400">
                            {(admin.name || admin.email)[0].toUpperCase()}
                          </div>
                          <span>{admin.name || 'Admin'}</span>
                        </td>
                        <td className="p-4 font-mono text-slate-300">{admin.email}</td>
                        <td className="p-4">
                          {isOwner ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-950/80 text-red-300 border border-red-500/40">
                              Superadmin (Owner)
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-950/80 text-blue-300 border border-blue-500/40">
                              Admin
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-400">{admin.addedAt ? new Date(admin.addedAt).toLocaleDateString() : 'System'}</td>
                        <td className="p-4 text-slate-400">{admin.addedBy || 'Owner'}</td>
                        <td className="p-4 text-right">
                          {isOwner ? (
                            <span className="text-[10px] text-slate-500 italic">Primary Account</span>
                          ) : isSuperAdmin ? (
                            adminRemoveConfirm === admin.email ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleRemoveAdmin(admin.email)}
                                  className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold transition-all"
                                >
                                  Confirm Revoke
                                </button>
                                <button
                                  onClick={() => setAdminRemoveConfirm(null)}
                                  className="p-1 rounded-lg bg-zinc-800 text-slate-400"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setAdminRemoveConfirm(admin.email)}
                                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-red-950/60 text-slate-300 hover:text-red-300 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                              >
                                <UserX className="h-3.5 w-3.5 text-red-400" /> Revoke
                              </button>
                            )
                          ) : (
                            <span className="text-[10px] text-slate-500">Superadmin only</span>
                          )}
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

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PRODUCTS TAB */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === 'products' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input value={productSearch} onChange={e => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-zinc-500"
                placeholder="Search products…" />
            </div>
            <button
              onClick={() => setEditingProduct({ ...blankProduct(), id: '', isNew: true } as Product & { isNew: boolean })}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <Plus className="h-4 w-4" /> Add New Product
            </button>
          </div>

          <div className="rounded-3xl bg-zinc-900 border border-white/[0.08] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-slate-400 uppercase font-semibold border-b border-white/[0.06]">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Pricing Tiers</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.logo} alt={p.name} className="h-9 w-9 rounded-lg object-cover ring-1 ring-white/10"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'; }} />
                        <div>
                          <p className="font-bold text-white">{p.name}</p>
                          <p className="text-[10px] text-slate-500 truncate max-w-[180px]">{p.tagline}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 capitalize text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-slate-300 border border-white/5">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 font-mono">
                      {p.pricingTiers.map(t => `$${t.price}`).join(' · ')}
                    </td>
                    <td className="p-4">
                      <span className={`font-bold ${p.stockCount < 20 ? 'text-amber-400' : 'text-emerald-400'}`}>{p.stockCount}</span>
                    </td>
                    <td className="p-4 text-yellow-400 font-bold">★ {p.rating}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditingProduct(p)}
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-blue-400 transition-colors">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {deleteConfirm === p.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 rounded-lg bg-red-600 text-white text-[10px] font-bold px-2">Delete</button>
                            <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-lg bg-zinc-800 text-slate-400"><X className="h-3 w-3" /></button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(p.id)} className="p-2 rounded-lg bg-zinc-800 hover:bg-red-950/60 text-red-400 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Product Edit / Create Modal */}
          {editingProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
              <div className="w-full max-w-2xl rounded-3xl bg-zinc-900 border border-white/10 p-6 my-6 space-y-5 shadow-2xl">
                <div className="flex justify-between items-center border-b border-white/[0.08] pb-4">
                  <h3 className="text-lg font-black text-white">{(editingProduct as any).isNew ? 'Create New Product' : `Edit Product: ${editingProduct.name}`}</h3>
                  <button onClick={() => setEditingProduct(null)} className="p-1.5 rounded-lg bg-zinc-800 text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  {[
                    { label: 'Product Name', key: 'name', type: 'text' },
                    { label: 'Slug (URL identifier)', key: 'slug', type: 'text' },
                    { label: 'Logo Image URL', key: 'logo', type: 'text' },
                    { label: 'Stock Count', key: 'stockCount', type: 'number' },
                    { label: 'Rating (0-5)', key: 'rating', type: 'number' },
                    { label: 'Review Count', key: 'reviewCount', type: 'number' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="text-slate-400 block mb-1 font-semibold">{field.label}</label>
                      <input
                        type={field.type}
                        value={(editingProduct as any)[field.key] ?? ''}
                        onChange={e => setEditingProduct(prev => prev ? { ...prev, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value } : null)}
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}

                  <div className="col-span-2">
                    <label className="text-slate-400 block mb-1 font-semibold">Tagline / Key Highlight</label>
                    <input
                      value={editingProduct.tagline}
                      onChange={e => setEditingProduct(prev => prev ? { ...prev, tagline: e.target.value } : null)}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-slate-400 block mb-1 font-semibold">Description</label>
                    <textarea
                      rows={3} value={editingProduct.description}
                      onChange={e => setEditingProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Category</label>
                    <select
                      value={editingProduct.category}
                      onChange={e => setEditingProduct(prev => prev ? { ...prev, category: e.target.value as any } : null)}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                    >
                      {['ai', 'streaming', 'dev', 'productivity', 'vpn_security'].map(c => (
                        <option key={c} value={c}>{c.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Account Provision Type</label>
                    <select
                      value={editingProduct.accountType}
                      onChange={e => setEditingProduct(prev => prev ? { ...prev, accountType: e.target.value as any } : null)}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                    >
                      {['private_account', 'shared_profile', 'family_slot', 'direct_upgrade'].map(t => (
                        <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pricing Tiers */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.06] space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-200">Pricing Durations</label>
                    <button
                      type="button"
                      onClick={() => setEditingProduct(prev => prev ? { ...prev, pricingTiers: [...prev.pricingTiers, { duration: '1_month', label: '1 Month', price: 9.99, originalPrice: 20, discountPercentage: 50 }] } : null)}
                      className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Tier
                    </button>
                  </div>
                  <div className="space-y-2">
                    {editingProduct.pricingTiers.map((tier, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 text-xs">
                        <div className="col-span-4">
                          <input value={tier.label} onChange={e => {
                            const tiers = [...editingProduct.pricingTiers];
                            tiers[i] = { ...tiers[i], label: e.target.value };
                            setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                          }} placeholder="Label (e.g. 1 Month)" className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none" />
                        </div>
                        <div className="col-span-3">
                          <input type="number" step="0.01" value={tier.price} onChange={e => {
                            const tiers = [...editingProduct.pricingTiers];
                            tiers[i] = { ...tiers[i], price: Number(e.target.value) };
                            setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                          }} placeholder="Price ($)" className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none" />
                        </div>
                        <div className="col-span-3">
                          <input type="number" step="0.01" value={tier.originalPrice} onChange={e => {
                            const tiers = [...editingProduct.pricingTiers];
                            tiers[i] = { ...tiers[i], originalPrice: Number(e.target.value) };
                            setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                          }} placeholder="Original ($)" className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none" />
                        </div>
                        <div className="col-span-2 flex items-center justify-center">
                          <button type="button" onClick={() => {
                            const tiers = editingProduct.pricingTiers.filter((_, idx) => idx !== i);
                            setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                          }} className="p-1.5 rounded-lg bg-red-950/60 text-red-400 hover:bg-red-950 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
                  <button onClick={() => setEditingProduct(null)} className="px-5 py-2.5 rounded-xl bg-zinc-800 text-slate-300 text-xs font-bold">Cancel</button>
                  <button onClick={handleSaveProduct} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all">
                    <Save className="h-3.5 w-3.5" /> Save to Database
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ORDERS & PAYMENT VERIFICATION TAB                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === 'orders' && (
        <div className="space-y-5">
          {/* Top Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(['all', 'pending', 'paid', 'failed'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                    orderStatusFilter === st
                      ? 'bg-white text-zinc-950 shadow-sm'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-slate-400'
                  }`}
                >
                  {st === 'pending' ? 'Pending Proofs' : st === 'paid' ? 'Paid & Delivered' : st === 'failed' ? 'Rejected' : 'All Orders'}
                  {st === 'pending' && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                      {allOrders.filter(o => o.paymentStatus === 'pending').length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30 placeholder-zinc-500"
                placeholder="Search TrxID, sender number, email, order #…"
              />
            </div>
          </div>

          <div className="rounded-3xl bg-zinc-900 border border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-slate-400 uppercase border-b border-white/[0.06] text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Order & Customer</th>
                    <th className="p-4">Items</th>
                    <th className="p-4">Amount & Method</th>
                    <th className="p-4">Sender Phone</th>
                    <th className="p-4">TrxID / Reference</th>
                    <th className="p-4">Screenshot Proof</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {allOrders
                    .filter(o => {
                      if (orderStatusFilter !== 'all' && o.paymentStatus !== orderStatusFilter) return false;
                      const q = orderSearch.toLowerCase();
                      return (
                        o.orderNumber.toLowerCase().includes(q) ||
                        o.userEmail.toLowerCase().includes(q) ||
                        (o.transactionId && o.transactionId.toLowerCase().includes(q)) ||
                        (o.senderNumber && o.senderNumber.toLowerCase().includes(q))
                      );
                    })
                    .map(o => {
                      const isPending = o.paymentStatus === 'pending';

                      return (
                        <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <div className="font-mono font-bold text-white text-xs">#{o.orderNumber}</div>
                            <div className="text-[11px] text-slate-400">{o.userEmail}</div>
                            <div className="text-[10px] text-slate-500">{new Date(o.createdAt).toLocaleString()}</div>
                          </td>

                          <td className="p-4 max-w-[200px]">
                            <div className="space-y-1">
                              {o.items.map((i, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-slate-200">
                                  <span className="font-bold">{i.quantity}x</span>
                                  <span className="truncate">{i.productName}</span>
                                  <span className="text-[10px] text-cyan-400 font-mono">({i.durationLabel})</span>
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="font-black text-white font-mono text-xs">
                              {o.totalBdt ? `৳${o.totalBdt.toLocaleString()} BDT` : `$${o.total.toFixed(2)}`}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium capitalize">
                              {o.paymentMethodName || o.paymentMethod}
                            </div>
                          </td>

                          <td className="p-4">
                            {o.senderNumber ? (
                              <span className="font-mono text-emerald-400 font-bold text-xs bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                                {o.senderNumber}
                              </span>
                            ) : (
                              <span className="text-slate-600 italic text-[11px]">N/A</span>
                            )}
                          </td>

                          <td className="p-4">
                            {o.transactionId ? (
                              <span className="font-mono text-cyan-300 font-bold text-xs bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-500/20 uppercase tracking-wider">
                                {o.transactionId}
                              </span>
                            ) : (
                              <span className="text-slate-600 italic text-[11px]">N/A</span>
                            )}
                          </td>

                          <td className="p-4">
                            {o.screenshotUrl ? (
                              <button
                                onClick={() => setPreviewScreenshotUrl(o.screenshotUrl!)}
                                className="group relative rounded-xl overflow-hidden border border-white/15 block hover:border-cyan-400 transition-all"
                                title="Click to view full screenshot proof"
                              >
                                <img
                                  src={o.screenshotUrl}
                                  alt="Proof"
                                  className="h-10 w-10 object-cover group-hover:scale-110 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Eye className="h-3.5 w-3.5 text-white" />
                                </div>
                              </button>
                            ) : (
                              <span className="text-slate-600 text-[11px]">No image</span>
                            )}
                          </td>

                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              o.paymentStatus === 'paid'
                                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
                                : o.paymentStatus === 'pending'
                                ? 'bg-amber-950/80 text-amber-400 border-amber-500/30 animate-pulse'
                                : 'bg-red-950/80 text-red-400 border-red-500/30'
                            }`}>
                              {o.paymentStatus}
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={async () => {
                                    await adminApproveAndDeliverOrder(o.id);
                                    showFeedback('success', `Order #${o.orderNumber} approved and credentials delivered to Vault!`);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-md"
                                  title="Approve payment and automatically provision subscriptions"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Approve & Deliver</span>
                                </button>
                                <button
                                  onClick={async () => {
                                    const reason = prompt('Reason for rejection (e.g. Invalid TrxID or amount mismatch):');
                                    if (reason !== null) {
                                      await adminRejectOrder(o.id, reason);
                                      showFeedback('error', `Order #${o.orderNumber} rejected.`);
                                    }
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 font-bold text-xs transition-colors"
                                  title="Reject order"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-500 font-semibold">
                                {o.deliveryStatus === 'delivered' ? '✓ Delivered' : o.deliveryStatus}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  {allOrders.length === 0 && (
                    <tr><td colSpan={8} className="p-8 text-center text-slate-500">No orders recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* BANGLADESH PAYMENT METHODS MANAGEMENT TAB                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === 'payments' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white">Bangladesh Payment Gateways</h2>
              <p className="text-xs text-slate-400">Configure bKash, Nagad, Rocket numbers, QR codes, and BDT exchange rates.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  await adminResetPaymentMethods();
                  showFeedback('success', 'Reset payment methods to defaults.');
                }}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-slate-300 text-xs font-bold border border-white/10 transition-colors"
              >
                Reset Default Methods
              </button>

              <button
                onClick={() => setEditingPaymentMethod({
                  id: '',
                  name: 'bKash Merchant',
                  type: 'bkash',
                  accountNumber: '01700-000000',
                  accountType: 'Personal',
                  qrCodeImage: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=01700000000',
                  instructions: 'Send Money to this number and copy TrxID.',
                  bdtRate: 125,
                  isActive: true,
                  color: '#e2136e',
                  isNew: true,
                })}
                className="px-4 py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-100 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" /> Add Payment Gateway
              </button>
            </div>
          </div>

          {/* Payment Methods Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.map(pm => (
              <div
                key={pm.id}
                className="p-5 rounded-3xl bg-zinc-900 border border-white/10 space-y-4 relative flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: pm.color || '#06b6d4' }} />
                      <h3 className="font-bold text-sm text-white">{pm.name}</h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      pm.isActive
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-slate-500'
                    }`}>
                      {pm.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-950 border border-white/5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Account Number:</span>
                      <span className="font-mono font-bold text-white">{pm.accountNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Account Type:</span>
                      <span className="font-bold text-cyan-400">{pm.accountType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Exchange Rate:</span>
                      <span className="font-mono font-bold text-emerald-400">1 USD = ৳{pm.bdtRate} BDT</span>
                    </div>
                  </div>

                  {pm.qrCodeImage && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-950/60 border border-white/5">
                      <img src={pm.qrCodeImage} alt="QR Code" className="h-12 w-12 rounded-lg bg-white p-0.5 object-contain" />
                      <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {pm.instructions}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                  <button
                    onClick={async () => {
                      await adminUpdatePaymentMethod(pm.id, { isActive: !pm.isActive });
                      showFeedback('success', `Payment method ${pm.isActive ? 'disabled' : 'activated'}.`);
                    }}
                    className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    {pm.isActive ? 'Turn Off' : 'Turn On'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingPaymentMethod(pm)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 transition-colors"
                      title="Edit method"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete ${pm.name}?`)) {
                          await adminDeletePaymentMethod(pm.id);
                          showFeedback('success', 'Payment method deleted.');
                        }
                      }}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete method"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Edit / Create Payment Method Modal */}
          {editingPaymentMethod && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-white/15 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-white">
                    {editingPaymentMethod.isNew ? 'Add Payment Gateway' : `Edit ${editingPaymentMethod.name}`}
                  </h3>
                  <button onClick={() => setEditingPaymentMethod(null)} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Method Name</label>
                    <input
                      type="text"
                      value={editingPaymentMethod.name}
                      onChange={e => setEditingPaymentMethod(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Provider Type</label>
                    <select
                      value={editingPaymentMethod.type}
                      onChange={e => setEditingPaymentMethod(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white"
                    >
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="rocket">Rocket</option>
                      <option value="upay">Upay</option>
                      <option value="custom">Custom Bank</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Account Number</label>
                    <input
                      type="text"
                      value={editingPaymentMethod.accountNumber}
                      onChange={e => setEditingPaymentMethod(prev => prev ? { ...prev, accountNumber: e.target.value } : null)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Account Type</label>
                    <select
                      value={editingPaymentMethod.accountType}
                      onChange={e => setEditingPaymentMethod(prev => prev ? { ...prev, accountType: e.target.value as any } : null)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white"
                    >
                      <option value="Personal">Personal</option>
                      <option value="Merchant">Merchant</option>
                      <option value="Agent">Agent</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">BDT Rate (1 USD = ? BDT)</label>
                    <input
                      type="number"
                      value={editingPaymentMethod.bdtRate}
                      onChange={e => setEditingPaymentMethod(prev => prev ? { ...prev, bdtRate: Number(e.target.value) } : null)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Brand Color Hex</label>
                    <input
                      type="text"
                      value={editingPaymentMethod.color || '#06b6d4'}
                      onChange={e => setEditingPaymentMethod(prev => prev ? { ...prev, color: e.target.value } : null)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-300">QR Code Image URL</label>
                  <input
                    type="text"
                    value={editingPaymentMethod.qrCodeImage || ''}
                    onChange={e => setEditingPaymentMethod(prev => prev ? { ...prev, qrCodeImage: e.target.value } : null)}
                    placeholder="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-300">Customer Payment Instructions</label>
                  <textarea
                    rows={2}
                    value={editingPaymentMethod.instructions || ''}
                    onChange={e => setEditingPaymentMethod(prev => prev ? { ...prev, instructions: e.target.value } : null)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingPaymentMethod(null)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!editingPaymentMethod) return;
                      if (editingPaymentMethod.isNew) {
                        const { isNew, id, ...rest } = editingPaymentMethod;
                        await adminCreatePaymentMethod(rest);
                        showFeedback('success', 'Payment gateway created.');
                      } else {
                        await adminUpdatePaymentMethod(editingPaymentMethod.id, editingPaymentMethod);
                        showFeedback('success', 'Payment gateway updated.');
                      }
                      setEditingPaymentMethod(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-white text-zinc-950 font-bold hover:bg-zinc-100"
                  >
                    Save Gateway
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Screenshot Full Lightbox Modal */}
      {previewScreenshotUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setPreviewScreenshotUrl(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] rounded-3xl overflow-hidden bg-zinc-900 border border-white/20 p-2 shadow-2xl">
            <button
              onClick={() => setPreviewScreenshotUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/80 text-white hover:bg-zinc-800 z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewScreenshotUrl}
              alt="Proof Full View"
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* USERS TAB */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === 'users' && (
        <div className="space-y-5">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-zinc-500"
              placeholder="Search users by name or email…" />
          </div>
          <div className="rounded-3xl bg-zinc-900 border border-white/[0.08] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-slate-400 uppercase border-b border-white/[0.06]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4">Lifetime Spend</th>
                  <th className="p-4 text-right">Role Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {allUsers.filter(u => u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())).map(u => {
                  const isOwner = u.email?.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02]">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff&size=40`} className="h-8 w-8 rounded-full object-cover" alt={u.name} />
                          <span className="font-bold text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400 font-mono">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isOwner ? 'bg-red-950/80 text-red-300 border-red-500/40' :
                          u.role === 'admin' ? 'bg-blue-950/60 text-blue-400 border-blue-500/30' : 'bg-zinc-800 text-slate-300 border-white/10'
                        }`}>{isOwner ? 'Superadmin' : u.role}</span>
                      </td>
                      <td className="p-4 text-slate-400">{u.joinedDate ? new Date(u.joinedDate).toLocaleDateString() : '—'}</td>
                      <td className="p-4 font-bold text-emerald-400">${(u.lifetimeSpend || 0).toFixed(2)}</td>
                      <td className="p-4 text-right">
                        {isOwner ? (
                          <span className="text-[10px] text-slate-500 italic">Primary Superadmin</span>
                        ) : isSuperAdmin ? (
                          <select
                            value={u.role}
                            onChange={e => adminUpdateUserRole(u.id, e.target.value as any).then(() => showFeedback('success', 'User role updated.'))}
                            className="px-2.5 py-1.5 rounded-xl bg-zinc-800 border border-white/10 text-xs text-white focus:outline-none"
                          >
                            <option value="customer">Customer</option>
                            <option value="admin">Administrator</option>
                          </select>
                        ) : (
                          <span className="text-[10px] text-slate-500">Superadmin required</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {allUsers.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">No users registered yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SUBSCRIPTIONS TAB */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === 'subscriptions' && (
        <div className="space-y-5">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input value={subSearch} onChange={e => setSubSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-zinc-500"
              placeholder="Search subscriptions…" />
          </div>
          <div className="rounded-3xl bg-zinc-900 border border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-slate-400 uppercase border-b border-white/[0.06]">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Plan Duration</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Expires On</th>
                    <th className="p-4">Assigned Credential</th>
                    <th className="p-4 text-right">Edit Credentials</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredSubs.map(s => (
                    <React.Fragment key={s.id}>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <img src={s.productLogo} className="h-8 w-8 rounded-lg object-cover ring-1 ring-white/10" alt={s.productName} />
                            <span className="font-bold text-white">{s.productName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-300">{s.durationLabel}</td>
                        <td className="p-4">
                          <select value={s.status}
                            onChange={e => adminUpdateSubscriptionStatus(s.id, e.target.value as any).then(() => showFeedback('success', 'Status updated.'))}
                            className={`px-2 py-1 rounded-lg border text-[10px] font-bold focus:outline-none bg-zinc-900 ${
                              s.status === 'active' ? 'text-emerald-400 border-emerald-500/30' :
                              s.status === 'expired' ? 'text-red-400 border-red-500/30' :
                              'text-amber-400 border-amber-500/30'
                            }`}>
                            {['active', 'expiring_soon', 'expired', 'paused'].map(st => <option key={st} value={st}>{st}</option>)}
                          </select>
                        </td>
                        <td className="p-4 text-slate-400">{new Date(s.expiryDate).toLocaleDateString()}</td>
                        <td className="p-4 font-mono text-xs text-slate-300 max-w-[180px] truncate">{s.credentials?.email || 'N/A'}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => {
                            setEditingSubId(editingSubId === s.id ? null : s.id);
                            setSubCredEdit({
                              email: s.credentials?.email || '',
                              password: s.credentials?.password || '',
                              notes: s.credentials?.notes || '',
                            });
                          }} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-blue-400">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                      {editingSubId === s.id && (
                        <tr>
                          <td colSpan={6} className="px-4 pb-4 bg-zinc-950/80">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                              {[
                                { k: 'email', label: 'Account Login Email' },
                                { k: 'password', label: 'Account Password' },
                                { k: 'notes', label: 'Vault Note / PIN / Instructions' },
                              ].map(f => (
                                <div key={f.k}>
                                  <label className="text-[11px] text-slate-400 font-bold block mb-1">{f.label}</label>
                                  <input value={subCredEdit[f.k] || ''}
                                    onChange={e => setSubCredEdit(prev => ({ ...prev, [f.k]: e.target.value }))}
                                    className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                                  />
                                </div>
                              ))}
                            </div>
                            <button onClick={() => handleSaveSubCreds(s.id)}
                              className="mt-3 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5">
                              <Save className="h-3.5 w-3.5" /> Save Credentials
                            </button>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {filteredSubs.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">No subscriptions created yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* COUPONS TAB */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === 'coupons' && (
        <div className="space-y-5 max-w-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white">Promotional Coupons</h2>
              <p className="text-xs text-slate-400">Manage promo discount codes synced in Firestore.</p>
            </div>
            <button onClick={() => setShowCouponForm(!showCouponForm)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Coupon
            </button>
          </div>

          {showCouponForm && (
            <div className="p-5 rounded-3xl bg-zinc-900 border border-white/[0.08] space-y-4">
              <h3 className="text-sm font-bold text-white">Create Promo Code</h3>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Code</label>
                  <input value={newCoupon.code} onChange={e => setNewCoupon(p => ({ ...p, code: e.target.value }))}
                    placeholder="e.g. VIP40"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white uppercase focus:outline-none focus:border-blue-500 font-mono" />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Discount %</label>
                  <input type="number" value={newCoupon.discountPercent} onChange={e => setNewCoupon(p => ({ ...p, discountPercent: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Min Order ($)</label>
                  <input type="number" value={newCoupon.minOrderAmount || ''} onChange={e => setNewCoupon(p => ({ ...p, minOrderAmount: Number(e.target.value) || undefined }))}
                    placeholder="Optional"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-3">
                  <label className="text-slate-400 font-bold block mb-1">Description</label>
                  <input value={newCoupon.description} onChange={e => setNewCoupon(p => ({ ...p, description: e.target.value }))}
                    placeholder="e.g. 40% off summer promo"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCreateCoupon} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2">
                  <Save className="h-3.5 w-3.5" /> Save Coupon
                </button>
                <button onClick={() => setShowCouponForm(false)} className="px-5 py-2.5 rounded-xl bg-zinc-800 text-slate-300 text-xs font-bold">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {coupons.map(c => (
              <div key={c.code} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900 border border-white/[0.08]">
                <div className="flex items-center gap-4">
                  <div className="px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30">
                    <span className="font-mono font-black text-emerald-400 text-sm">{c.code}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{c.discountPercent}% OFF</p>
                    <p className="text-[11px] text-slate-400">{c.description}{c.minOrderAmount ? ` · Min order $${c.minOrderAmount}` : ''}</p>
                  </div>
                </div>
                <button onClick={() => adminDeleteCoupon(c.code).then(() => showFeedback('success', `Coupon ${c.code} deleted.`))}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-red-950/60 text-red-400 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TICKETS TAB */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Ticket list */}
          <div className="lg:col-span-4 space-y-2">
            <h2 className="text-sm font-bold text-white mb-3">All Customer Tickets ({allTickets.length})</h2>
            {allTickets.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-10">No support tickets found.</p>
            ) : allTickets.map(t => (
              <div key={t.id} onClick={() => setSelectedTicketId(t.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  (activeTicket?.id === t.id) ? 'bg-blue-950/50 border-blue-500/50 shadow-lg' : 'bg-zinc-900 border-white/[0.06] hover:bg-zinc-800'
                }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">{t.ticketNumber}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    t.status === 'open' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' :
                    t.status === 'in_progress' ? 'bg-blue-950/60 text-blue-400 border-blue-500/30' :
                    'bg-zinc-800 text-zinc-400 border-white/10'
                  }`}>{t.status.replace('_', ' ')}</span>
                </div>
                <p className="text-xs font-bold text-white truncate">{t.subject}</p>
                <p className="text-[10px] text-slate-400 mt-1">{t.userEmail}</p>
              </div>
            ))}
          </div>

          {/* Right: Ticket thread & reply */}
          <div className="lg:col-span-8">
            {activeTicket ? (
              <div className="rounded-3xl bg-zinc-900 border border-white/[0.08] flex flex-col" style={{ height: 600 }}>
                <div className="p-4 border-b border-white/[0.06] bg-zinc-950 flex items-center justify-between rounded-t-3xl">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{activeTicket.ticketNumber}</span>
                    <h4 className="text-sm font-bold text-white">{activeTicket.subject}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{activeTicket.userEmail} · Category: <span className="text-slate-200 capitalize">{activeTicket.category.replace('_', ' ')}</span></p>
                  </div>
                  {activeTicket.status !== 'closed' && (
                    <button onClick={() => adminCloseTicket(activeTicket.id).then(() => showFeedback('success', 'Ticket closed.'))}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-800 border border-white/10 text-xs text-slate-300 hover:text-white font-bold transition-all">
                      Close Ticket
                    </button>
                  )}
                </div>

                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                  {activeTicket.messages.map(msg => {
                    const isAgent = msg.sender === 'agent';
                    return (
                      <div key={msg.id} className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}>
                        <span className="text-[11px] text-slate-400 mb-1">{msg.senderName} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <div className={`p-3.5 rounded-2xl max-w-sm text-xs leading-relaxed ${
                          isAgent ? 'bg-blue-600 text-white rounded-tr-none shadow-md' : 'bg-zinc-800 text-slate-200 border border-white/[0.06] rounded-tl-none'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {activeTicket.status !== 'closed' ? (
                  <div className="p-4 border-t border-white/[0.06] bg-zinc-950 flex gap-2 rounded-b-3xl">
                    <input value={ticketReply} onChange={e => setTicketReply(e.target.value)}
                      placeholder="Type official admin reply to customer…"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReplyTicket(activeTicket.id); } }}
                    />
                    <button onClick={() => handleReplyTicket(activeTicket.id)}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all">
                      Send Reply
                    </button>
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-slate-500 bg-zinc-950 border-t border-white/[0.06] rounded-b-3xl">
                    This support ticket is closed.
                  </div>
                )}
              </div>
            ) : (
              <div className="h-60 rounded-3xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-slate-500 text-sm">
                Select a ticket to view the conversation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 9. REVIEWS MODERATION TAB                                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer name, product, review title…"
                value={reviewSearch}
                onChange={e => setReviewSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  await adminResetReviews();
                  showFeedback('success', 'Reset reviews to 8 default verified reviews.');
                }}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-slate-300 text-xs font-bold border border-white/10 transition-colors"
                title="Reset to 8 default mock reviews"
              >
                Reset Default Reviews
              </button>

              <button
                onClick={() => {
                  setNewAdminReview({
                    userName: '',
                    productId: products[0]?.id || 'chatgpt-plus',
                    rating: 5,
                    title: '',
                    comment: '',
                    planDuration: '12 Months',
                  });
                  setShowAdminReviewForm(true);
                }}
                className="px-4 py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-100 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Review</span>
              </button>
            </div>
          </div>

          {/* Admin Add Review Inline Modal */}
          {showAdminReviewForm && (
            <div className="p-5 rounded-3xl bg-zinc-900 border border-white/15 space-y-4 max-w-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">Create New Customer / Mock Review</h3>
                <button onClick={() => setShowAdminReviewForm(false)} className="text-slate-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Customer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jordan Reed"
                    value={newAdminReview.userName}
                    onChange={e => setNewAdminReview(prev => ({ ...prev, userName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Product</label>
                  <select
                    value={newAdminReview.productId}
                    onChange={e => setNewAdminReview(prev => ({ ...prev, productId: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Star Rating (1-5)</label>
                  <select
                    value={newAdminReview.rating}
                    onChange={e => setNewAdminReview(prev => ({ ...prev, rating: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                    <option value={2}>2 Stars ★★☆☆☆</option>
                    <option value={1}>1 Star ★☆☆☆☆</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Plan Duration</label>
                  <select
                    value={newAdminReview.planDuration}
                    onChange={e => setNewAdminReview(prev => ({ ...prev, planDuration: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white"
                  >
                    <option value="1 Month">1 Month</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="12 Months">12 Months</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-300">Review Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Instant credentials and flawless streaming"
                  value={newAdminReview.title}
                  onChange={e => setNewAdminReview(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-300">Review Text</label>
                <textarea
                  rows={3}
                  placeholder="Write the detailed review body…"
                  value={newAdminReview.comment}
                  onChange={e => setNewAdminReview(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <button
                  onClick={() => setShowAdminReviewForm(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!newAdminReview.title || !newAdminReview.comment) return;
                    const prod = products.find(p => p.id === newAdminReview.productId) || products[0];
                    await adminCreateReview({
                      userId: 'usr_admin_gen',
                      userName: newAdminReview.userName.trim() || 'Verified Customer',
                      userAvatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 50)}?w=150&auto=format&fit=crop&q=80`,
                      productId: prod.id,
                      productName: prod.name,
                      productLogo: prod.logo,
                      rating: newAdminReview.rating,
                      title: newAdminReview.title.trim(),
                      comment: newAdminReview.comment.trim(),
                      verifiedPurchase: true,
                      planDuration: newAdminReview.planDuration,
                    });
                    setShowAdminReviewForm(false);
                    showFeedback('success', 'New review created and published live.');
                  }}
                  className="px-5 py-2 rounded-xl bg-white text-zinc-950 font-bold hover:bg-zinc-100"
                >
                  Publish Review
                </button>
              </div>
            </div>
          )}

          <div className="rounded-3xl bg-zinc-900 border border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 border-b border-white/[0.06] text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Product</th>
                    <th className="px-5 py-3.5">Rating</th>
                    <th className="px-5 py-3.5">Review Headline & Feedback</th>
                    <th className="px-5 py-3.5">Likes</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {reviews
                    .filter(r =>
                      r.userName.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                      r.productName.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                      r.title.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                      r.comment.toLowerCase().includes(reviewSearch.toLowerCase())
                    )
                    .map(rev => (
                      <tr key={rev.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                              alt={rev.userName}
                              className="h-8 w-8 rounded-full object-cover border border-white/10"
                            />
                            <div>
                              <p className="font-bold text-white text-xs">{rev.userName}</p>
                              {rev.verifiedPurchase && (
                                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1 py-0.2 rounded-full">
                                  Verified Buyer
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-200">
                          <div className="flex items-center gap-1.5">
                            {rev.productLogo && (
                              <img src={rev.productLogo} alt={rev.productName} className="h-4 w-4 rounded object-cover" />
                            )}
                            <span>{rev.productName}</span>
                          </div>
                          {rev.planDuration && (
                            <span className="text-[10px] text-cyan-400 font-medium">{rev.planDuration}</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`h-3.5 w-3.5 ${s <= rev.rating ? 'fill-amber-400' : 'text-zinc-700'}`} />
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4 max-w-xs">
                          <p className="font-bold text-white text-xs line-clamp-1">{rev.title}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{rev.comment}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 text-slate-300 font-bold text-xs">
                            <ThumbsUp className="h-3 w-3 text-cyan-400" />
                            <span>{rev.likes || 0}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[11px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={async () => {
                              await deleteReview(rev.id);
                              showFeedback('success', 'Review deleted from database.');
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-all"
                            title="Delete review"
                          >
                            <Trash2 className="h-4 w-4" />
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

    </div>
  );
}
