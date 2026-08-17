'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useApp, SUPERADMIN_EMAIL } from '@/context/AppContext';
import { compressImageToDataUrl } from '@/lib/image-compression';
import { printCleanInvoice } from '@/lib/invoice-printer';
import { calculateDaysRemaining } from '@/lib/utils';
import {
  Shield, TrendingUp, DollarSign, Users, Package, Tag,
  Headphones, ShoppingBag, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, Clock, Search, RefreshCw, Eye, EyeOff,
  BarChart2, MessageSquare, Lock, LogIn, UserPlus, UserCheck,
  UserX, Sparkles, AlertTriangle, ArrowUpRight, Star, ThumbsUp,
  CreditCard, QrCode, Image as ImageIcon, Check, Send, Loader2,
  Menu, Home, LayoutDashboard, ChevronRight, Zap, BookOpen, Upload, FileText,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Product, Coupon, UserSubscription, Order, AdminMember, Review, BangladeshPaymentMethod, SupportTicket, HeroSlide, QuickMessage } from '@/types';

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
    allSubscriptions, adminCreateSubscription, adminUpdateSubscription, adminDeleteSubscription, adminPurgeMockSubscriptions, adminPurgeAllSubscriptions, adminUpdateSubscriptionCredentials, adminUpdateSubscriptionStatus,
    coupons, adminCreateCoupon, adminDeleteCoupon,
    paymentMethods, adminCreatePaymentMethod, adminUpdatePaymentMethod, adminDeletePaymentMethod, adminResetPaymentMethods,
    allTickets, adminReplyToTicket, adminCloseTicket, adminSendMessageToUser,
    adminList, adminAddAdmin, adminRemoveAdmin,
    financialMetrics, triggerRenewalCronSimulation, fastForwardSimulationDays,
    refreshAllData, isSyncing,
    reviews, deleteReview, adminCreateReview, adminResetReviews,
    heroSlides, adminCreateHeroSlide, adminUpdateHeroSlide, adminDeleteHeroSlide, adminResetHeroSlides,
    quickMessages, adminCreateQuickMessage, adminUpdateQuickMessage, adminDeleteQuickMessage, adminResetQuickMessages,
  } = useApp();

  const [tab, setTab] = useState<'overview' | 'orders' | 'payments' | 'products' | 'users' | 'admins' | 'subscriptions' | 'coupons' | 'tickets' | 'reviews' | 'hero' | 'bot'>('overview');
  const [editingFullSubscription, setEditingFullSubscription] = useState<(Partial<UserSubscription> & { isNew?: boolean }) | null>(null);
  const [subDeleteConfirmId, setSubDeleteConfirmId] = useState<string | null>(null);
  const [subStatusFilter, setSubStatusFilter] = useState<'all' | 'active' | 'expiring_soon' | 'expired' | 'paused'>('all');
  const [showAdminVaultPassword, setShowAdminVaultPassword] = useState<Record<string, boolean>>({});
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);
  const [editingQuickMessage, setEditingQuickMessage] = useState<(QuickMessage & { isNew?: boolean }) | null>(null);
  const [quickMessageDeleteConfirm, setQuickMessageDeleteConfirm] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'paid' | 'failed'>('all');
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);
  const [customProvisionOrder, setCustomProvisionOrder] = useState<Order | null>(null);
  const [provisionCreds, setProvisionCreds] = useState({ email: '', password: '', pinCode: '', notes: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hero Slides state
  const [editingHeroSlide, setEditingHeroSlide] = useState<(HeroSlide & { isNew?: boolean }) | null>(null);
  const [heroDeleteConfirm, setHeroDeleteConfirm] = useState<string | null>(null);
  const [isCompressingHeroImg, setIsCompressingHeroImg] = useState(false);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  // Direct Message Modal state
  const [showDirectMessageModal, setShowDirectMessageModal] = useState(false);
  const [directMessageTarget, setDirectMessageTarget] = useState<{ id: string; name: string; email: string; avatar: string } | null>(null);
  const [directMessageSubject, setDirectMessageSubject] = useState('');
  const [directMessageCategory, setDirectMessageCategory] = useState<SupportTicket['category']>('general');
  const [directMessageBody, setDirectMessageBody] = useState('');
  const [directMessageImage, setDirectMessageImage] = useState<string | null>(null);
  const [isCompressingDmImage, setIsCompressingDmImage] = useState(false);
  const dmFileInputRef = useRef<HTMLInputElement>(null);
  const [isSendingDirectMessage, setIsSendingDirectMessage] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<(BangladeshPaymentMethod & { isNew?: boolean }) | null>(null);
  const [isCompressingQr, setIsCompressingQr] = useState(false);
  const qrFileInputRef = useRef<HTMLInputElement>(null);
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
  const [productEditorTab, setProductEditorTab] = useState<'basic' | 'pricing' | 'delivery' | 'features' | 'specs' | 'docs'>('basic');
  const [isCompressingProductLogo, setIsCompressingProductLogo] = useState(false);
  const [isCompressingProductBanner, setIsCompressingProductBanner] = useState(false);
  const productLogoInputRef = useRef<HTMLInputElement>(null);
  const productBannerInputRef = useRef<HTMLInputElement>(null);
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
  const [ticketReplyImage, setTicketReplyImage] = useState<string | null>(null);
  const [isCompressingTicketImage, setIsCompressingTicketImage] = useState(false);
  const ticketFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  const [chartRange, setChartRange] = useState<'7d' | '30d' | '6m'>('6m');

  const revenueChartData = React.useMemo(() => {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result: { label: string; revenue: number; orders: number }[] = [];

    if (chartRange === '7d') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const dayEnd = dayStart + 86400000;
        const dayOrders = allOrders.filter(o => {
          const t = new Date(o.createdAt).getTime();
          return t >= dayStart && t < dayEnd && (o.paymentStatus === 'paid' || o.paymentStatus === 'pending' || o.deliveryStatus === 'delivered');
        });
        const rev = dayOrders.reduce((acc, o) => acc + (o.total || 0), 0);
        result.push({ label: dayStr, revenue: parseFloat(rev.toFixed(2)), orders: dayOrders.length });
      }
    } else if (chartRange === '30d') {
      for (let i = 28; i >= 0; i -= 4) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dayStr = `${d.getMonth() + 1}/${d.getDate()}`;
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const dayEnd = dayStart + 4 * 86400000;
        const chunkOrders = allOrders.filter(o => {
          const t = new Date(o.createdAt).getTime();
          return t >= dayStart && t < dayEnd && (o.paymentStatus === 'paid' || o.paymentStatus === 'pending' || o.deliveryStatus === 'delivered');
        });
        const rev = chunkOrders.reduce((acc, o) => acc + (o.total || 0), 0);
        result.push({ label: dayStr, revenue: parseFloat(rev.toFixed(2)), orders: chunkOrders.length });
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mName = months[d.getMonth()];
        const year = d.getFullYear();
        const monthOrders = allOrders.filter(o => {
          const od = new Date(o.createdAt);
          return od.getMonth() === d.getMonth() && od.getFullYear() === year && (o.paymentStatus === 'paid' || o.paymentStatus === 'pending' || o.deliveryStatus === 'delivered');
        });
        const rev = monthOrders.reduce((acc, o) => acc + (o.total || 0), 0);
        result.push({ label: mName, revenue: parseFloat(rev.toFixed(2)), orders: monthOrders.length });
      }
    }
    return result;
  }, [allOrders, chartRange]);

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

  // ─── ADMIN SIDEBAR SECTIONS NAVIGATION ─────────────────────────────
  const navSections = [
    {
      title: 'Core Operations',
      items: [
        { id: 'overview', label: 'Command Overview', icon: <BarChart2 className="h-4 w-4 text-cyan-400" />, count: null },
        {
          id: 'orders',
          label: 'Orders & Verification',
          icon: <ShoppingBag className={`h-4 w-4 ${pendingOrdersCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />,
          count: pendingOrdersCount > 0 ? `${pendingOrdersCount} Pending` : `${allOrders.length}`,
          isUrgent: pendingOrdersCount > 0,
        },
        { id: 'payments', label: 'Payment Gateways', icon: <CreditCard className="h-4 w-4 text-emerald-400" />, count: paymentMethods.length },
        { id: 'products', label: 'Products & Pricing', icon: <Package className="h-4 w-4 text-indigo-400" />, count: products.length },
        { id: 'subscriptions', label: 'Subscriptions Vault', icon: <Shield className="h-4 w-4 text-cyan-400" />, count: allSubscriptions.length },
      ],
    },
    {
      title: 'Storefront & Growth',
      items: [
        { id: 'hero', label: 'Hero & Banners', icon: <Sparkles className="h-4 w-4 text-amber-300" />, count: heroSlides.length },
        { id: 'reviews', label: 'Customer Reviews', icon: <Star className="h-4 w-4 text-amber-400" />, count: reviews.length },
        { id: 'coupons', label: 'Promo Coupons', icon: <Tag className="h-4 w-4 text-rose-400" />, count: coupons.length },
      ],
    },
    {
      title: 'Customers & Team',
      items: [
        { id: 'users', label: 'Registered Customers', icon: <Users className="h-4 w-4 text-blue-400" />, count: allUsers.length },
        { id: 'tickets', label: 'Live Support Tickets', icon: <Headphones className="h-4 w-4 text-purple-400" />, count: allTickets.length },
        { id: 'bot', label: 'Bot & Quick Replies', icon: <MessageSquare className="h-4 w-4 text-cyan-400" />, count: quickMessages.length },
        { id: 'admins', label: 'Admin Privileges', icon: <Shield className="h-4 w-4 text-red-400" />, count: adminList.length },
      ],
    },
  ];

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

  // ─── HERO SLIDE HANDLERS ──────────────────────────────────────────
  const handleSaveHeroSlide = async () => {
    if (!editingHeroSlide) return;
    try {
      if (editingHeroSlide.isNew) {
        const { isNew, id, ...rest } = editingHeroSlide;
        await adminCreateHeroSlide(rest);
        showFeedback('success', 'Hero slide created and published live on storefront.');
      } else {
        await adminUpdateHeroSlide(editingHeroSlide.id, editingHeroSlide);
        showFeedback('success', 'Hero slide updated and published live.');
      }
      setEditingHeroSlide(null);
    } catch {
      showFeedback('error', 'Failed to save hero slide.');
    }
  };

  const handleDeleteHeroSlide = async (id: string) => {
    try {
      await adminDeleteHeroSlide(id);
      setHeroDeleteConfirm(null);
      showFeedback('success', 'Hero slide removed from storefront.');
    } catch {
      showFeedback('error', 'Failed to delete hero slide.');
    }
  };

  // ─── QUICK MESSAGE & BOT AUTO-REPLY HANDLERS ──────────────────────
  const handleSaveQuickMessage = async () => {
    if (!editingQuickMessage) return;
    try {
      if (editingQuickMessage.isNew) {
        const { isNew, id, ...rest } = editingQuickMessage;
        await adminCreateQuickMessage(rest);
        showFeedback('success', 'Bot quick question and auto-response created!');
      } else {
        await adminUpdateQuickMessage(editingQuickMessage.id, editingQuickMessage);
        showFeedback('success', 'Bot quick message updated live!');
      }
      setEditingQuickMessage(null);
    } catch {
      showFeedback('error', 'Failed to save quick message.');
    }
  };

  const handleDeleteQuickMessage = async (id: string) => {
    try {
      await adminDeleteQuickMessage(id);
      setQuickMessageDeleteConfirm(null);
      showFeedback('success', 'Quick message deleted.');
    } catch {
      showFeedback('error', 'Failed to delete quick message.');
    }
  };

  const handleResetQuickMessages = async () => {
    if (confirm('Reset all bot quick messages and auto-answers to default recommended presets?')) {
      try {
        await adminResetQuickMessages();
        showFeedback('success', 'Quick messages reset to defaults.');
      } catch {
        showFeedback('error', 'Failed to reset quick messages.');
      }
    }
  };

  // ─── CUSTOMER LOOKUP HELPER ──────────────────────────────────────
  const getCustomerInfo = (userId?: string, userEmail?: string, fallbackName?: string) => {
    const byId = allUsers.find(u => u.id === userId);
    if (byId && byId.name) return { name: byId.name, avatar: byId.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(byId.name)}&background=6366f1&color=fff`, email: byId.email };
    const byEmail = allUsers.find(u => u.email?.toLowerCase() === userEmail?.toLowerCase());
    if (byEmail && byEmail.name) return { name: byEmail.name, avatar: byEmail.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(byEmail.name)}&background=6366f1&color=fff`, email: byEmail.email };
    const name = fallbackName || (userEmail ? userEmail.split('@')[0].replace(/[._-]/g, ' ') : 'Customer');
    return {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: userEmail || '',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
    };
  };

  // ─── DIRECT MESSAGE HANDLER ──────────────────────────────────────
  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directMessageTarget || (!directMessageBody.trim() && !directMessageImage)) return;

    setIsSendingDirectMessage(true);
    try {
      const tktId = await adminSendMessageToUser(
        directMessageTarget.id,
        directMessageTarget.email,
        directMessageSubject.trim() || 'Direct Support Message from Admin',
        directMessageBody.trim(),
        directMessageCategory,
        directMessageImage || undefined
      );
      showFeedback('success', `Message dispatched to ${directMessageTarget.name} (${directMessageTarget.email}).`);
      setShowDirectMessageModal(false);
      setDirectMessageBody('');
      setDirectMessageSubject('');
      setDirectMessageImage(null);
      setSelectedTicketId(tktId);
      setTab('tickets');
    } catch {
      showFeedback('error', 'Failed to send direct message.');
    } finally {
      setIsSendingDirectMessage(false);
    }
  };

  const handleReplyTicket = async (ticketId: string) => {
    if (!ticketReply.trim() && !ticketReplyImage) return;
    try {
      await adminReplyToTicket(ticketId, ticketReply.trim(), ticketReplyImage || undefined);
      setTicketReply('');
      setTicketReplyImage(null);
      showFeedback('success', 'Reply dispatched.');
    } catch {
      showFeedback('error', 'Failed to send reply.');
    }
  };

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

  const activeTicket = allTickets.find(t => t.id === selectedTicketId) || allTickets[0] || null;

  return (
    <div className="min-h-screen py-6 max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 space-y-6">

      {/* Admin Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-900/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-950/50">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white">SubNexus Command Hub</h1>
                {isSuperAdmin ? (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-300">
                    Superadmin
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300">
                    Administrator
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{firebaseUser.email}</p>
            </div>
          </div>

          {/* Mobile Menu Button (< lg) */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="lg:hidden p-2.5 rounded-2xl bg-zinc-800 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-red-400" /> : <Menu className="h-5 w-5 text-cyan-400" />}
            <span className="text-xs font-bold">{mobileMenuOpen ? 'Close' : 'Menu'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-750 border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Home className="h-3.5 w-3.5 text-cyan-400" />
            <span>Storefront</span>
          </Link>

          <button
            onClick={async () => {
              await refreshAllData();
              showFeedback('success', 'Database re-synced successfully.');
            }}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 border border-white/10 text-xs text-slate-200 hover:text-white font-bold flex items-center gap-2 hover:bg-zinc-750 transition-all disabled:opacity-50 cursor-pointer"
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

      {/* Main Responsive Grid Layout (Sidebar + Content) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* Responsive Sidebar Navigation */}
        <aside className={`w-full lg:w-72 shrink-0 space-y-5 bg-zinc-900/90 border border-white/[0.08] p-4 rounded-3xl backdrop-blur-xl shadow-2xl lg:sticky lg:top-6 ${
          mobileMenuOpen ? 'block' : 'hidden lg:block'
        }`}>
          {navSections.map(section => (
            <div key={section.title} className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-1">
                {section.title}
              </span>
              {section.items.map(item => {
                const isActive = tab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTab(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600/30 via-indigo-500/20 to-transparent text-white border border-indigo-500/40 shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-zinc-800/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.count !== null && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold shrink-0 ${
                        (item as any).isUrgent
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : isActive
                            ? 'bg-indigo-600 text-white'
                            : 'bg-zinc-800 text-slate-400'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 w-full space-y-6">

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
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">Revenue Performance</h3>
                  <p className="text-[11px] text-slate-400">Live gross volume from verified checkouts</p>
                </div>
                <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-white/[0.08]">
                  {(['7d', '30d', '6m'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setChartRange(r)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        chartRange === r
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '6 Months'}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => {
                      if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
                      return `$${v}`;
                    }}
                  />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(v: any) => [
                      `$${Number(v).toFixed(2)} (৳${Math.round(Number(v) * 125).toLocaleString()})`,
                      'Revenue Volume',
                    ]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad)" />
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

          {/* Product Edit / Create Modal (Section by Section Dynamic Editor) */}
          {editingProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
              <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-zinc-900 border border-white/15 my-4 shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden">
                
                {/* Modal Top Header */}
                <div className="shrink-0 flex items-center justify-between p-5 border-b border-white/[0.08] bg-zinc-950/80">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">
                        {(editingProduct as any).isNew ? 'Create New Product' : `Edit Product: ${editingProduct.name}`}
                      </h3>
                      <p className="text-[11px] text-slate-400">Every single line and element syncs dynamically to storefront popups.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Section Navigation Tabs */}
                <div className="shrink-0 flex items-center gap-1.5 p-2 px-4 sm:px-6 bg-zinc-950 border-b border-white/[0.06] overflow-x-auto scrollbar-none">
                  {[
                    { id: 'basic', label: '1. General & Visuals', icon: <ImageIcon className="h-3.5 w-3.5" /> },
                    { id: 'pricing', label: '2. Pricing Durations', icon: <DollarSign className="h-3.5 w-3.5" /> },
                    { id: 'delivery', label: '3. Delivery & Stock', icon: <Zap className="h-3.5 w-3.5" /> },
                    { id: 'features', label: '4. Features Matrix', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
                    { id: 'specs', label: '5. Technical Specs', icon: <Shield className="h-3.5 w-3.5" /> },
                    { id: 'docs', label: '6. Docs & Guide', icon: <BookOpen className="h-3.5 w-3.5" /> },
                  ].map(sec => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setProductEditorTab(sec.id as any)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        productEditorTab === sec.id
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-zinc-900'
                      }`}
                    >
                      {sec.icon}
                      <span>{sec.label}</span>
                    </button>
                  ))}
                </div>

                {/* Hidden File Inputs for Product Assets */}
                <input
                  type="file"
                  ref={productLogoInputRef}
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsCompressingProductLogo(true);
                    try {
                      const compressed = await compressImageToDataUrl(file, 400, 400, 0.85);
                      setEditingProduct(prev => prev ? { ...prev, logo: compressed } : null);
                      showFeedback('success', 'Product logo compressed and attached.');
                    } catch {
                      showFeedback('error', 'Failed to compress logo.');
                    } finally {
                      setIsCompressingProductLogo(false);
                      if (productLogoInputRef.current) productLogoInputRef.current.value = '';
                    }
                  }}
                  className="hidden"
                />

                <input
                  type="file"
                  ref={productBannerInputRef}
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsCompressingProductBanner(true);
                    try {
                      const compressed = await compressImageToDataUrl(file, 1200, 800, 0.80);
                      setEditingProduct(prev => {
                        if (!prev) return null;
                        const currImages = prev.images || [];
                        return { ...prev, images: [compressed, ...currImages.filter(img => img !== compressed)] };
                      });
                      showFeedback('success', 'Banner image compressed and added to gallery.');
                    } catch {
                      showFeedback('error', 'Failed to compress banner.');
                    } finally {
                      setIsCompressingProductBanner(false);
                      if (productBannerInputRef.current) productBannerInputRef.current.value = '';
                    }
                  }}
                  className="hidden"
                />

                {/* Modal Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 max-h-[62vh]">
                  
                  {/* ═════════ SECTION 1: GENERAL & BRAND VISUALS ═════════ */}
                  {productEditorTab === 'basic' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-300">Product Name</label>
                          <input
                            type="text"
                            value={editingProduct.name}
                            onChange={e => {
                              const val = e.target.value;
                              setEditingProduct(prev => {
                                if (!prev) return null;
                                const autoSlug = (prev as any).isNew && !prev.slug
                                  ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                                  : prev.slug;
                                return { ...prev, name: val, slug: autoSlug };
                              });
                            }}
                            placeholder="e.g. ChatGPT Plus Official"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-300">URL Slug Identifier</label>
                          <input
                            type="text"
                            value={editingProduct.slug}
                            onChange={e => setEditingProduct(prev => prev ? { ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') } : null)}
                            placeholder="e.g. chatgpt-plus"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-cyan-300 font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-300">Category</label>
                          <select
                            value={editingProduct.category}
                            onChange={e => setEditingProduct(prev => prev ? { ...prev, category: e.target.value as any } : null)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-medium"
                          >
                            <option value="ai">AI Tools (ChatGPT, Claude, Midjourney)</option>
                            <option value="streaming">Streaming & Cinema (Netflix, Spotify, Prime)</option>
                            <option value="dev">Developer & Cloud (GitHub Copilot, Cursor, JetBrains)</option>
                            <option value="productivity">Productivity (Canva Pro, Office 365, Notion)</option>
                            <option value="vpn_security">VPN & Security (NordVPN, ExpressVPN, Surfshark)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-300">Highlight Badge (Optional)</label>
                          <input
                            type="text"
                            value={editingProduct.badge || ''}
                            onChange={e => setEditingProduct(prev => prev ? { ...prev, badge: e.target.value.toUpperCase() } : null)}
                            placeholder="e.g. POPULAR, BEST DEAL, 4K ULTRA, EXCLUSIVE"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white uppercase font-bold"
                          />
                        </div>

                        <div className="col-span-1 sm:col-span-2 space-y-1">
                          <label className="font-bold text-slate-300">Tagline / Key Highlight</label>
                          <input
                            type="text"
                            value={editingProduct.tagline}
                            onChange={e => setEditingProduct(prev => prev ? { ...prev, tagline: e.target.value } : null)}
                            placeholder="e.g. Full GPT-4o, Canvas & Voice with instant dedicated access"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white"
                          />
                        </div>

                        <div className="col-span-1 sm:col-span-2 space-y-1">
                          <label className="font-bold text-slate-300">Detailed Description</label>
                          <textarea
                            rows={3}
                            value={editingProduct.description}
                            onChange={e => setEditingProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                            placeholder="Provide detailed description of what the user receives..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white resize-none leading-relaxed"
                          />
                        </div>
                      </div>

                      {/* Logo Asset Box */}
                      <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200 flex items-center gap-1.5">
                            <ImageIcon className="h-4 w-4 text-cyan-400" />
                            Product Logo Icon
                          </span>
                          <span className="text-[10px] text-emerald-400 font-semibold">Auto-compressed for instant loading</span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-white/20 overflow-hidden shrink-0 shadow-md p-0.5">
                            <img
                              src={editingProduct.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'}
                              alt="Logo preview"
                              className="h-full w-full object-cover rounded-xl"
                            />
                          </div>

                          <div className="flex-1 w-full space-y-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => productLogoInputRef.current?.click()}
                                disabled={isCompressingProductLogo}
                                className="px-4 py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                              >
                                {isCompressingProductLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                <span>Upload Logo from Device</span>
                              </button>
                            </div>
                            <input
                              type="text"
                              value={editingProduct.logo}
                              onChange={e => setEditingProduct(prev => prev ? { ...prev, logo: e.target.value } : null)}
                              placeholder="Or paste direct logo URL..."
                              className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono text-[11px]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Gallery & Cover Banners */}
                      <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200 flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-amber-400" />
                            Cover Banner & Gallery Images
                          </span>
                          <button
                            type="button"
                            onClick={() => productBannerInputRef.current?.click()}
                            disabled={isCompressingProductBanner}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
                          >
                            {isCompressingProductBanner ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                            <span>Upload Banner Image</span>
                          </button>
                        </div>

                        {editingProduct.images && editingProduct.images.length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {editingProduct.images.map((imgUrl, imgIdx) => (
                              <div key={imgIdx} className="relative group rounded-xl overflow-hidden border border-white/10 h-16 bg-zinc-900">
                                <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingProduct(prev => {
                                      if (!prev) return null;
                                      return { ...prev, images: (prev.images || []).filter((_, idx) => idx !== imgIdx) };
                                    });
                                  }}
                                  className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Remove image"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 block font-semibold">Gallery Image / GIF URLs (1 per line)</label>
                          <textarea
                            rows={2}
                            value={(editingProduct.images || []).join('\n')}
                            onChange={e => {
                              const urls = e.target.value.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
                              setEditingProduct(prev => prev ? { ...prev, images: urls } : null);
                            }}
                            placeholder="https://images.unsplash.com/...&#10;https://i.giphy.com/..."
                            className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono text-[11px] resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ═════════ SECTION 2: PRICING DURATIONS BUILDER ═════════ */}
                  {productEditorTab === 'pricing' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-white/[0.08]">
                        <div>
                          <h4 className="font-bold text-white text-sm">Subscription Pricing Tiers</h4>
                          <p className="text-slate-400 text-[11px]">Customers can select between these durations on the storefront card & modal.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(prev => {
                              if (!prev) return null;
                              return {
                                ...prev,
                                pricingTiers: [
                                  ...prev.pricingTiers,
                                  { duration: '1_month', label: '1 Month', price: 9.99, originalPrice: 19.99, discountPercentage: 50, isPopular: false }
                                ]
                              };
                            });
                          }}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <Plus className="h-4 w-4" /> Add Pricing Tier
                        </button>
                      </div>

                      <div className="space-y-3">
                        {editingProduct.pricingTiers.map((tier, tIdx) => (
                          <div key={tIdx} className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3 relative group">
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                              
                              <div className="space-y-1">
                                <label className="text-slate-400 font-semibold block">Duration Identifier</label>
                                <select
                                  value={tier.duration}
                                  onChange={e => {
                                    const tiers = [...editingProduct.pricingTiers];
                                    tiers[tIdx] = { ...tiers[tIdx], duration: e.target.value as any };
                                    setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                                  }}
                                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono"
                                >
                                  <option value="1_month">1 Month</option>
                                  <option value="3_months">3 Months</option>
                                  <option value="6_months">6 Months</option>
                                  <option value="12_months">12 Months (1 Year)</option>
                                  <option value="lifetime">Lifetime Access</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-slate-400 font-semibold block">Display Label</label>
                                <input
                                  type="text"
                                  value={tier.label}
                                  onChange={e => {
                                    const tiers = [...editingProduct.pricingTiers];
                                    tiers[tIdx] = { ...tiers[tIdx], label: e.target.value };
                                    setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                                  }}
                                  placeholder="e.g. 1 Month"
                                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-bold"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-slate-400 font-semibold block">Sale Price ($ USD)</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={tier.price}
                                  onChange={e => {
                                    const p = Number(e.target.value);
                                    const tiers = [...editingProduct.pricingTiers];
                                    const orig = tiers[tIdx].originalPrice || (p * 2);
                                    const disc = orig > p ? Math.round(((orig - p) / orig) * 100) : 0;
                                    tiers[tIdx] = { ...tiers[tIdx], price: p, discountPercentage: disc };
                                    setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                                  }}
                                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-emerald-400 font-mono font-bold"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-slate-400 font-semibold block">Original Price ($ USD)</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={tier.originalPrice || ''}
                                  onChange={e => {
                                    const orig = Number(e.target.value);
                                    const tiers = [...editingProduct.pricingTiers];
                                    const p = tiers[tIdx].price;
                                    const disc = orig > p ? Math.round(((orig - p) / orig) * 100) : 0;
                                    tiers[tIdx] = { ...tiers[tIdx], originalPrice: orig, discountPercentage: disc };
                                    setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                                  }}
                                  placeholder="e.g. 20.00"
                                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-slate-400 font-mono line-through"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-slate-400 font-semibold block">Discount %</label>
                                <input
                                  type="number"
                                  value={tier.discountPercentage}
                                  onChange={e => {
                                    const tiers = [...editingProduct.pricingTiers];
                                    tiers[tIdx] = { ...tiers[tIdx], discountPercentage: Number(e.target.value) };
                                    setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                                  }}
                                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-cyan-300 font-mono font-bold"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                              <button
                                type="button"
                                onClick={() => {
                                  const tiers = editingProduct.pricingTiers.map((t, idx) => ({
                                    ...t,
                                    isPopular: idx === tIdx ? !t.isPopular : false,
                                  }));
                                  setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                                }}
                                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  tier.isPopular
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                                    : 'bg-zinc-900 text-slate-400 border border-white/10 hover:text-white'
                                }`}
                              >
                                <Star className={`h-3.5 w-3.5 ${tier.isPopular ? 'fill-amber-400 text-amber-400' : ''}`} />
                                <span>{tier.isPopular ? '⭐ Marked as Popular (Highlighted on Store)' : 'Mark as Popular Tier'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const tiers = editingProduct.pricingTiers.filter((_, idx) => idx !== tIdx);
                                  setEditingProduct(prev => prev ? { ...prev, pricingTiers: tiers } : null);
                                }}
                                disabled={editingProduct.pricingTiers.length <= 1}
                                className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 disabled:opacity-30 transition-colors"
                                title="Delete Tier"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ═════════ SECTION 3: DELIVERY & STOCK METRICS ═════════ */}
                  {productEditorTab === 'delivery' && (
                    <div className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        <div className="space-y-1">
                          <label className="font-bold text-slate-300">Available Stock Count</label>
                          <input
                            type="number"
                            value={editingProduct.stockCount}
                            onChange={e => setEditingProduct(prev => prev ? { ...prev, stockCount: Number(e.target.value) } : null)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-emerald-400 font-mono font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-300">Delivery Time Estimate</label>
                          <input
                            type="text"
                            value={editingProduct.deliveryTimeEstimate || 'Instant (< 30s)'}
                            onChange={e => setEditingProduct(prev => prev ? { ...prev, deliveryTimeEstimate: e.target.value } : null)}
                            placeholder="e.g. Instant (< 30s), Under 5 Mins, 1-2 Hours"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-300">Delivery Mechanism</label>
                          <select
                            value={editingProduct.deliveryType}
                            onChange={e => setEditingProduct(prev => prev ? { ...prev, deliveryType: e.target.value as any } : null)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-medium"
                          >
                            <option value="instant_bot">Instant Bot (Automated Vault Credential Allocation)</option>
                            <option value="custom_email">Direct Email Upgrade (Requires user email)</option>
                            <option value="slot_invite">Family / Team Slot Invite Link</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-300">Account Provisioning Type</label>
                          <select
                            value={editingProduct.accountType}
                            onChange={e => setEditingProduct(prev => prev ? { ...prev, accountType: e.target.value as any } : null)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-medium"
                          >
                            <option value="private_account">Private Dedicated Account (Master Email + Password)</option>
                            <option value="shared_profile">Shared Profile / Screen (PIN-Locked Slot)</option>
                            <option value="family_slot">Family / Workspace Member Slot</option>
                            <option value="direct_upgrade">Direct Account Upgrade (Applied to customer's personal email)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-300">Customer Rating (0.0 to 5.0)</label>
                          <input
                            type="number"
                            step="0.1"
                            max="5.0"
                            min="1.0"
                            value={editingProduct.rating}
                            onChange={e => setEditingProduct(prev => prev ? { ...prev, rating: Number(e.target.value) } : null)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-amber-300 font-mono font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-300">Verified Review Count</label>
                          <input
                            type="number"
                            value={editingProduct.reviewCount}
                            onChange={e => setEditingProduct(prev => prev ? { ...prev, reviewCount: Number(e.target.value) } : null)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono"
                          />
                        </div>
                      </div>

                      {/* Storefront Feature Toggles */}
                      <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-3">
                        <span className="font-bold text-slate-200">Promotional Placement Flags</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-white/5 cursor-pointer hover:bg-zinc-850 transition-colors">
                            <input
                              type="checkbox"
                              checked={!!editingProduct.isFeatured}
                              onChange={e => setEditingProduct(prev => prev ? { ...prev, isFeatured: e.target.checked } : null)}
                              className="h-4 w-4 rounded bg-zinc-950 text-blue-600 focus:ring-0"
                            />
                            <div>
                              <span className="font-bold text-white block">Featured Product</span>
                              <span className="text-[10px] text-slate-400">Highlights item in Featured Carousel</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-white/5 cursor-pointer hover:bg-zinc-850 transition-colors">
                            <input
                              type="checkbox"
                              checked={!!editingProduct.isTrending}
                              onChange={e => setEditingProduct(prev => prev ? { ...prev, isTrending: e.target.checked } : null)}
                              className="h-4 w-4 rounded bg-zinc-950 text-cyan-500 focus:ring-0"
                            />
                            <div>
                              <span className="font-bold text-white block">Trending Deal</span>
                              <span className="text-[10px] text-slate-400">Shows hot flame icon on storefront cards</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ═════════ SECTION 4: FEATURES MATRIX ═════════ */}
                  {productEditorTab === 'features' && (
                    <div className="space-y-4 text-xs">
                      <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-white text-sm">Included Features & Perks List</h4>
                            <p className="text-slate-400 text-[11px]">These bullet points appear in the product detail card & modal overview.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(prev => {
                                if (!prev) return null;
                                return { ...prev, features: [...(prev.features || []), 'New premium feature'] };
                              });
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" /> Add Feature
                          </button>
                        </div>

                        <div className="space-y-2">
                          {(editingProduct.features || []).map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                              <input
                                type="text"
                                value={feat}
                                onChange={e => {
                                  const list = [...(editingProduct.features || [])];
                                  list[fIdx] = e.target.value;
                                  setEditingProduct(prev => prev ? { ...prev, features: list } : null);
                                }}
                                placeholder="e.g. GPT-4o & Canvas access included"
                                className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-medium"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const list = (editingProduct.features || []).filter((_, idx) => idx !== fIdx);
                                  setEditingProduct(prev => prev ? { ...prev, features: list } : null);
                                }}
                                className="p-2 rounded-xl bg-zinc-900 hover:bg-red-950 text-slate-500 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Batch Textarea Mode */}
                        <div className="pt-3 border-t border-white/5 space-y-1">
                          <label className="text-[11px] text-slate-400 font-semibold block">Or paste full list (1 per line):</label>
                          <textarea
                            rows={3}
                            value={(editingProduct.features || []).join('\n')}
                            onChange={e => {
                              const items = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
                              setEditingProduct(prev => prev ? { ...prev, features: items } : null);
                            }}
                            className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-sans text-xs resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ═════════ SECTION 5: TECHNICAL SPECIFICATIONS ═════════ */}
                  {productEditorTab === 'specs' && (
                    <div className="space-y-4 text-xs">
                      <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-4">
                        <div>
                          <h4 className="font-bold text-white text-sm">Product Specifications & Compatibility</h4>
                          <p className="text-slate-400 text-[11px]">Displays in the technical spec matrix inside the customer modal.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-300">Streaming / Performance Quality</label>
                            <input
                              type="text"
                              value={editingProduct.specs?.quality || ''}
                              onChange={e => {
                                setEditingProduct(prev => prev ? {
                                  ...prev,
                                  specs: { ...(prev.specs || { warranty: 'Full Replacement', region: 'Global', platforms: [] }), quality: e.target.value }
                                } : null);
                              }}
                              placeholder="e.g. 4K Ultra HD / Max Bitrate, Dedicated Server Pool"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-300">Warranty Coverage Policy</label>
                            <input
                              type="text"
                              value={editingProduct.specs?.warranty || ''}
                              onChange={e => {
                                setEditingProduct(prev => prev ? {
                                  ...prev,
                                  specs: { ...(prev.specs || { quality: 'HD', region: 'Global', platforms: [] }), warranty: e.target.value }
                                } : null);
                              }}
                              placeholder="e.g. 100% Full-Term Replacement Warranty"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-emerald-400 font-semibold"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-300">Region & VPN Status</label>
                            <input
                              type="text"
                              value={editingProduct.specs?.region || ''}
                              onChange={e => {
                                setEditingProduct(prev => prev ? {
                                  ...prev,
                                  specs: { ...(prev.specs || { warranty: 'Full', quality: 'HD', platforms: [] }), region: e.target.value }
                                } : null);
                              }}
                              placeholder="e.g. Worldwide / No VPN Required, Bangladesh Profile"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-cyan-300 font-semibold"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-300">Allowed Screens / Concurrent Devices</label>
                            <input
                              type="number"
                              value={editingProduct.specs?.screens || 1}
                              onChange={e => {
                                setEditingProduct(prev => prev ? {
                                  ...prev,
                                  specs: { ...(prev.specs || { warranty: 'Full', quality: 'HD', platforms: [], region: 'Global' }), screens: Number(e.target.value) }
                                } : null);
                              }}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono"
                            />
                          </div>

                          <div className="col-span-1 sm:col-span-2 space-y-2">
                            <label className="font-bold text-slate-300 block">Supported Platforms & Ecosystems (Comma-separated)</label>
                            <input
                              type="text"
                              value={(editingProduct.specs?.platforms || []).join(', ')}
                              onChange={e => {
                                const plats = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                setEditingProduct(prev => prev ? {
                                  ...prev,
                                  specs: { ...(prev.specs || { warranty: 'Full Replacement', quality: 'HD/4K', region: 'Global', platforms: [] }), platforms: plats }
                                } : null);
                              }}
                              placeholder="e.g. Web, iOS, Android, macOS, Windows, Smart TV, Apple TV, Linux"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white font-medium"
                            />

                            {/* Quick Platform Badges */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {['Web', 'iOS', 'Android', 'macOS', 'Windows', 'Smart TV', 'Linux', 'Apple TV'].map(pTag => {
                                const isAdded = (editingProduct.specs?.platforms || []).includes(pTag);
                                return (
                                  <button
                                    key={pTag}
                                    type="button"
                                    onClick={() => {
                                      const current = editingProduct.specs?.platforms || [];
                                      const updated = isAdded ? current.filter(x => x !== pTag) : [...current, pTag];
                                      setEditingProduct(prev => prev ? {
                                        ...prev,
                                        specs: { ...(prev.specs || { warranty: 'Full Replacement', quality: 'HD', region: 'Global', platforms: [] }), platforms: updated }
                                      } : null);
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                                      isAdded
                                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                        : 'bg-zinc-900 text-slate-400 border-white/10 hover:text-white'
                                    }`}
                                  >
                                    {isAdded ? `✓ ${pTag}` : `+ ${pTag}`}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ═════════ SECTION 6: ACTIVATION GUIDE & DOCS ═════════ */}
                  {productEditorTab === 'docs' && (
                    <div className="space-y-4 text-xs">
                      <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.08] space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-white text-sm">Step-by-Step Activation Protocol (Docs Tab)</h4>
                            <p className="text-slate-400 text-[11px]">Customers follow these exact ordered steps in their Vault & modal docs tab.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(prev => {
                                if (!prev) return null;
                                return { ...prev, instructions: [...(prev.instructions || []), 'New instruction step'] };
                              });
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" /> Add Step
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {(editingProduct.instructions || []).map((inst, iIdx) => (
                            <div key={iIdx} className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-900 border border-white/10">
                              <div className="h-6 w-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {iIdx + 1}
                              </div>
                              <textarea
                                rows={2}
                                value={inst}
                                onChange={e => {
                                  const steps = [...(editingProduct.instructions || [])];
                                  steps[iIdx] = e.target.value;
                                  setEditingProduct(prev => prev ? { ...prev, instructions: steps } : null);
                                }}
                                placeholder={`Step ${iIdx + 1} instructions...`}
                                className="flex-1 p-2 rounded-lg bg-zinc-950 border border-white/10 text-white text-xs resize-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const steps = (editingProduct.instructions || []).filter((_, idx) => idx !== iIdx);
                                  setEditingProduct(prev => prev ? { ...prev, instructions: steps } : null);
                                }}
                                className="p-2 rounded-xl bg-zinc-950 hover:bg-red-950 text-slate-500 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Batch Textarea Mode */}
                        <div className="pt-3 border-t border-white/5 space-y-1">
                          <label className="text-[11px] text-slate-400 font-semibold block">Or paste full steps (1 step per line):</label>
                          <textarea
                            rows={3}
                            value={(editingProduct.instructions || []).join('\n')}
                            onChange={e => {
                              const items = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
                              setEditingProduct(prev => prev ? { ...prev, instructions: items } : null);
                            }}
                            className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-sans text-xs resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Modal Footer Actions */}
                <div className="shrink-0 flex items-center justify-between p-4 px-6 border-t border-white/[0.08] bg-zinc-950">
                  <span className="text-[11px] text-slate-400">
                    Category: <span className="font-mono text-cyan-400 font-bold uppercase">{editingProduct.category}</span> · Tiers: <span className="text-white font-bold">{editingProduct.pricingTiers.length}</span>
                  </span>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProduct}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save & Publish Product</span>
                    </button>
                  </div>
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
                            {(() => {
                              const cust = getCustomerInfo(o.userId, o.userEmail);
                              return (
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={cust.avatar}
                                    alt={cust.name}
                                    className="h-8 w-8 rounded-full object-cover border border-white/15 shrink-0 shadow-sm"
                                  />
                                  <div>
                                    <div className="font-bold text-white text-xs">{cust.name}</div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="font-mono text-[10px] text-cyan-400 font-bold">#{o.orderNumber}</span>
                                      <span className="text-[10px] text-slate-500">·</span>
                                      <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{o.userEmail}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
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
                                    setApprovingOrderId(o.id);
                                    try {
                                      await adminApproveAndDeliverOrder(o.id);
                                      showFeedback('success', `Order #${o.orderNumber} approved and credentials delivered to Vault!`);
                                    } finally {
                                      setApprovingOrderId(null);
                                    }
                                  }}
                                  disabled={approvingOrderId === o.id}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                                  title="1-Click Instant Auto-Provision & Deliver"
                                >
                                  {approvingOrderId === o.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5" />
                                  )}
                                  <span>Approve & Deliver</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setProvisionCreds({ email: o.userEmail || '', password: '', pinCode: '', notes: '' });
                                    setCustomProvisionOrder(o);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 hover:text-white font-bold text-xs transition-colors"
                                  title="Enter specific custom account credentials"
                                >
                                  <Lock className="h-3.5 w-3.5 text-cyan-400" />
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
                              <div className="flex items-center justify-end gap-2 text-[11px] text-slate-500 font-semibold">
                                <button
                                  type="button"
                                  onClick={() => printCleanInvoice(o)}
                                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-400 hover:text-cyan-300 border border-white/10 flex items-center gap-1 font-bold text-[10px] cursor-pointer"
                                  title="Print Clean Tax Invoice"
                                >
                                  <FileText className="h-3 w-3" />
                                  <span>Invoice</span>
                                </button>
                                <span className="text-emerald-400">✓</span>
                                <span>{o.deliveryStatus === 'delivered' ? 'Delivered' : o.deliveryStatus}</span>
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
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950/80 border border-white/5">
                      <div
                        onClick={() => setPreviewScreenshotUrl(pm.qrCodeImage!)}
                        className="h-20 w-20 rounded-xl bg-white p-1.5 shrink-0 flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform"
                        title="Click to view full size QR"
                      >
                        <img src={pm.qrCodeImage} alt="QR Code" className="h-full w-full object-contain" />
                      </div>
                      <div className="text-[11px] text-slate-400 leading-relaxed space-y-1">
                        <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Scannable QR Code</div>
                        <div className="line-clamp-2">{pm.instructions}</div>
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

          {/* Edit / Create Payment Method Modal with Image Upload & Compression */}
          {editingPaymentMethod && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-zinc-900 border border-white/15 p-6 space-y-4">
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

                {/* QR Code Upload / Compressed Attachment */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-300 flex items-center gap-1.5">
                      <QrCode className="h-4 w-4 text-cyan-400" />
                      <span>QR Code Image (Upload & Auto-Compress)</span>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-semibold">Auto-compressed to clean data text</span>
                  </div>

                  <input
                    type="file"
                    ref={qrFileInputRef}
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsCompressingQr(true);
                      try {
                        const compressed = await compressImageToDataUrl(file, 600, 600, 0.85);
                        setEditingPaymentMethod(prev => prev ? { ...prev, qrCodeImage: compressed } : null);
                        showFeedback('success', 'QR Code image compressed and attached.');
                      } catch (err) {
                        showFeedback('error', 'Failed to process QR image.');
                      } finally {
                        setIsCompressingQr(false);
                        if (qrFileInputRef.current) qrFileInputRef.current.value = '';
                      }
                    }}
                    className="hidden"
                  />

                  {editingPaymentMethod.qrCodeImage ? (
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-20 w-20 rounded-xl bg-white p-1.5 shadow-lg shrink-0 flex items-center justify-center">
                          <img
                            src={editingPaymentMethod.qrCodeImage}
                            alt="QR Preview"
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">QR Code Attached</p>
                          <p className="text-[10px] text-emerald-400 mt-0.5 font-medium">✓ Ready to display on checkout</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => qrFileInputRef.current?.click()}
                          disabled={isCompressingQr}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Replace Image
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPaymentMethod(prev => prev ? { ...prev, qrCodeImage: '' } : null)}
                          className="p-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-400 transition-colors"
                          title="Remove QR Image"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => qrFileInputRef.current?.click()}
                      disabled={isCompressingQr}
                      className="w-full py-6 rounded-2xl border-2 border-dashed border-white/15 hover:border-cyan-500/50 bg-zinc-950/60 hover:bg-zinc-950 transition-all flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white cursor-pointer group"
                    >
                      {isCompressingQr ? (
                        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Compressing QR Image...</span>
                        </div>
                      ) : (
                        <>
                          <div className="p-2.5 rounded-xl bg-zinc-900 text-cyan-400 group-hover:scale-110 transition-transform">
                            <QrCode className="h-6 w-6" />
                          </div>
                          <div className="text-center">
                            <span className="font-bold text-xs text-white block">Click to Upload QR Image from Device</span>
                            <span className="text-[10px] text-slate-500">Supports PNG, JPG, WebP (Automatically compressed)</span>
                          </div>
                        </>
                      )}
                    </button>
                  )}

                  {/* Or Manual URL input */}
                  <div className="pt-1">
                    <input
                      type="text"
                      value={editingPaymentMethod.qrCodeImage || ''}
                      onChange={e => setEditingPaymentMethod(prev => prev ? { ...prev, qrCodeImage: e.target.value } : null)}
                      placeholder="Or paste QR image URL directly..."
                      className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono text-[11px]"
                    />
                  </div>
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
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
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
                    className="px-5 py-2 rounded-xl bg-white text-zinc-950 font-bold hover:bg-zinc-100 cursor-pointer shadow-md"
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              const cust = getCustomerInfo(u.id, u.email, u.name);
                              setDirectMessageTarget({ id: u.id, name: cust.name, email: u.email, avatar: cust.avatar });
                              setDirectMessageSubject('');
                              setDirectMessageBody('');
                              setShowDirectMessageModal(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all flex items-center gap-1.5 text-xs font-bold"
                            title="Direct message user"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>Message</span>
                          </button>

                          {isOwner ? (
                            <span className="text-[10px] text-slate-500 italic">Superadmin</span>
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
                        </div>
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
      {/* 7. SUBSCRIPTIONS & VAULT CREDENTIALS STUDIO TAB             */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === 'subscriptions' && (() => {
        const filteredSubsList = allSubscriptions.filter(s => {
          const matchQuery =
            s.productName.toLowerCase().includes(subSearch.toLowerCase()) ||
            (s.userEmail && s.userEmail.toLowerCase().includes(subSearch.toLowerCase())) ||
            (s.credentials?.email && s.credentials.email.toLowerCase().includes(subSearch.toLowerCase())) ||
            (s.orderId && s.orderId.toLowerCase().includes(subSearch.toLowerCase()));
          if (!matchQuery) return false;

          if (subStatusFilter === 'all') return true;
          if (subStatusFilter === 'expiring_soon') {
            const days = calculateDaysRemaining(s.expiryDate);
            return s.status === 'expiring_soon' || (days <= 3 && days >= 0);
          }
          return s.status === subStatusFilter;
        });

        const activeSubsCount = allSubscriptions.filter(s => s.status === 'active').length;
        const expiringCount = allSubscriptions.filter(s => calculateDaysRemaining(s.expiryDate) <= 3 && calculateDaysRemaining(s.expiryDate) >= 0).length;

        return (
          <div className="space-y-6">
            {/* Header with Search, Filter Chips & Add Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Lock className="h-5 w-5 text-cyan-400" />
                  <span>Customer Subscriptions & Vault Credentials</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full dynamic CRUD control over customer logins, decrypted passwords, profile PINs, warranty, and expiry dates.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const firstProd = products[0];
                    setEditingFullSubscription({
                      isNew: true,
                      productId: firstProd?.id || 'prod_1',
                      productName: firstProd?.name || 'ChatGPT Plus',
                      productLogo: firstProd?.logo || '',
                      planDuration: '1_month',
                      durationLabel: '1 Month',
                      pricePaid: firstProd?.pricingTiers?.[0]?.price || 19.99,
                      status: 'active',
                      startDate: new Date().toISOString(),
                      expiryDate: new Date(Date.now() + 30 * 86400000).toISOString(),
                      warrantyValidUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
                      autoRenew: true,
                      autoRenewReminderDays: 3,
                      accountType: 'private_account',
                      userEmail: allUsers[0]?.email || '',
                      userId: allUsers[0]?.id || '',
                      credentials: {
                        email: allUsers[0]?.email || 'customer@service.io',
                        password: `Keyoon#${Math.floor(100000 + Math.random() * 900000)}`,
                        pinCode: `${Math.floor(1000 + Math.random() * 9000)}`,
                        profileName: 'VIP Profile 1',
                        notes: '100% Full replacement warranty verified.',
                      },
                    });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Provision New Subscription</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm('Purge all unlinked demo mock subscriptions from database? Only real customer subscriptions will remain.')) {
                      await adminPurgeMockSubscriptions();
                      setSelectedSubIds([]);
                      showFeedback('success', 'All demo subscriptions purged from database.');
                    }
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-amber-950/60 text-slate-300 hover:text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all border border-white/10 cursor-pointer"
                  title="Purge mock demo subscriptions from Firestore"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Purge Demo Subscriptions</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm('⚠️ Are you sure you want to delete ALL subscriptions in the database for a fresh clean start?')) {
                      await adminPurgeAllSubscriptions();
                      setSelectedSubIds([]);
                      showFeedback('success', 'All subscriptions purged. Database is now clean.');
                    }
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 font-bold text-xs flex items-center gap-1.5 transition-all border border-red-500/30 cursor-pointer"
                  title="Wipe entire subscriptions collection"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Purge All (Reset)</span>
                </button>

                {selectedSubIds.length > 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm(`Delete ${selectedSubIds.length} selected subscription(s)?`)) {
                        for (const id of selectedSubIds) {
                          await adminDeleteSubscription(id);
                        }
                        setSelectedSubIds([]);
                        showFeedback('success', `Deleted ${selectedSubIds.length} subscriptions.`);
                      }
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer animate-pulse"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Selected ({selectedSubIds.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'all', label: `All (${allSubscriptions.length})` },
                  { id: 'active', label: `Active (${activeSubsCount})` },
                  { id: 'expiring_soon', label: `Expiring Soon (${expiringCount})` },
                  { id: 'expired', label: `Expired (${allSubscriptions.filter(s => s.status === 'expired').length})` },
                  { id: 'paused', label: `Paused (${allSubscriptions.filter(s => s.status === 'paused').length})` },
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSubStatusFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      subStatusFilter === f.id
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'bg-zinc-900 text-slate-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  value={subSearch}
                  onChange={e => setSubSearch(e.target.value)}
                  placeholder="Search user, product, email..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-zinc-500"
                />
              </div>
            </div>

            {/* Subscriptions Table */}
            <div className="rounded-3xl bg-zinc-900 border border-white/[0.08] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950 text-slate-400 uppercase border-b border-white/[0.06] text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="p-4 w-10">
                        <input
                          type="checkbox"
                          checked={filteredSubsList.length > 0 && selectedSubIds.length === filteredSubsList.length}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedSubIds(filteredSubsList.map(s => s.id));
                            } else {
                              setSelectedSubIds([]);
                            }
                          }}
                          className="h-3.5 w-3.5 rounded accent-cyan-500 cursor-pointer"
                        />
                      </th>
                      <th className="p-4">Product / Plan</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Vault Credentials</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Expires On</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredSubsList.map(s => {
                      const daysLeft = calculateDaysRemaining(s.expiryDate);
                      const isExpired = s.status === 'expired' || daysLeft < 0;
                      const isExpiring = daysLeft <= 3 && !isExpired;
                      const isPwdVisible = showAdminVaultPassword[s.id];
                      const isSelected = selectedSubIds.includes(s.id);

                      return (
                        <tr key={s.id} className={`hover:bg-white/[0.02] transition-colors ${isSelected ? 'bg-cyan-950/20' : ''}`}>
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSelectedSubIds(prev => [...prev, s.id]);
                                } else {
                                  setSelectedSubIds(prev => prev.filter(id => id !== s.id));
                                }
                              }}
                              className="h-3.5 w-3.5 rounded accent-cyan-500 cursor-pointer"
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={s.productLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'}
                                className="h-9 w-9 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
                                alt={s.productName}
                              />
                              <div>
                                <span className="font-bold text-white block">{s.productName}</span>
                                <span className="text-[11px] text-cyan-400 font-mono font-semibold">{s.durationLabel}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="space-y-0.5">
                              <span className="font-mono text-white text-xs block font-bold truncate max-w-[180px]">
                                {s.userEmail || 'Guest Customer'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Ref: #{s.orderId ? s.orderId.replace('ord_', '') : s.id.slice(0, 8)}
                              </span>
                            </div>
                          </td>

                          <td className="p-4">
                            {(!s.credentials?.email && !s.credentials?.password) || s.credentialsConfigured === false ? (
                              <button
                                type="button"
                                onClick={() => setEditingFullSubscription({ ...s, isNew: false })}
                                className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 hover:border-amber-400/70 transition-all cursor-pointer group"
                                title="Click to set real credentials for this customer"
                              >
                                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                                <div className="text-left">
                                  <div className="text-amber-400 font-bold text-[11px]">⚠️ Credentials Needed</div>
                                  <div className="text-slate-500 text-[10px]">Click Edit to configure real login</div>
                                </div>
                              </button>
                            ) : (
                              <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.06] space-y-1.5 max-w-[260px]">
                                <div className="flex items-center justify-between text-[11px] font-mono">
                                  <span className="text-slate-400">User:</span>
                                  <span className="text-white font-bold truncate max-w-[160px] select-all">{s.credentials?.email || '—'}</span>
                                </div>
                                {s.credentials?.password && (
                                  <div className="flex items-center justify-between text-[11px] font-mono">
                                    <span className="text-slate-400">Pass:</span>
                                    <div className="flex items-center gap-1">
                                      <span className="text-cyan-300 font-bold select-all">
                                        {isPwdVisible ? s.credentials.password : '••••••••'}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setShowAdminVaultPassword(prev => ({ ...prev, [s.id]: !prev[s.id] }))}
                                        className="text-slate-500 hover:text-white p-0.5 cursor-pointer"
                                      >
                                        {isPwdVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                      </button>
                                    </div>
                                  </div>
                                )}
                                {(s.credentials?.pinCode || s.credentials?.profileName) && (
                                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 border-t border-white/[0.04]">
                                    <span>{s.credentials.profileName || 'Slot'}</span>
                                    <span className="text-amber-400 font-mono font-bold">PIN: {s.credentials.pinCode || 'None'}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>


                          <td className="p-4">
                            <select
                              value={s.status}
                              onChange={e => adminUpdateSubscriptionStatus(s.id, e.target.value as any).then(() => showFeedback('success', 'Status updated.'))}
                              className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold focus:outline-none bg-zinc-900 cursor-pointer ${
                                s.status === 'active' ? 'text-emerald-400 border-emerald-500/30' :
                                s.status === 'expired' ? 'text-red-400 border-red-500/30' :
                                'text-amber-400 border-amber-500/30'
                              }`}
                            >
                              <option value="active">Active</option>
                              <option value="expiring_soon">Expiring Soon</option>
                              <option value="expired">Expired</option>
                              <option value="paused">Paused</option>
                            </select>
                          </td>

                          <td className="p-4">
                            <div className="space-y-0.5">
                              <span className={`text-xs font-bold block ${isExpired ? 'text-red-400' : isExpiring ? 'text-amber-400' : 'text-slate-200'}`}>
                                {new Date(s.expiryDate).toLocaleDateString()}
                              </span>
                              <span className={`text-[10px] font-semibold ${isExpired ? 'text-red-400' : isExpiring ? 'text-amber-400' : 'text-slate-500'}`}>
                                {isExpired ? 'Expired' : `${daysLeft} days left`}
                              </span>
                            </div>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingFullSubscription({ ...s, isNew: false })}
                                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer border border-white/10"
                                title="Edit full credentials & subscription"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={async () => {
                                  const newPwd = `Keyoon#${Math.floor(100000 + Math.random() * 900000)}`;
                                  await adminUpdateSubscriptionCredentials(s.id, { password: newPwd });
                                  showFeedback('success', `New password generated: ${newPwd}`);
                                }}
                                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-amber-950/60 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer border border-white/10"
                                title="Regenerate & rotate password"
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={async () => {
                                  const base = Math.max(new Date(s.expiryDate).getTime(), Date.now());
                                  const newExp = new Date(base + 30 * 86400000).toISOString();
                                  await adminUpdateSubscription(s.id, { expiryDate: newExp, warrantyValidUntil: newExp, status: 'active' });
                                  showFeedback('success', `Subscription extended by +30 days (New expiry: ${new Date(newExp).toLocaleDateString()})`);
                                }}
                                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer border border-white/10"
                                title="Extend by +30 Days"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setSubDeleteConfirmId(s.id)}
                                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors cursor-pointer border border-white/10"
                                title="Delete / Revoke Subscription"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredSubsList.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-slate-500 space-y-2">
                          <Lock className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                          <p className="font-bold text-slate-300">No subscriptions matching query</p>
                          <p className="text-xs">Click "+ Provision New Subscription" above to allocate credentials to any customer.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

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
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white">All Customer Tickets ({allTickets.length})</h2>
              <button
                onClick={() => {
                  const defaultTarget = allUsers.length > 0 ? getCustomerInfo(allUsers[0].id, allUsers[0].email, allUsers[0].name) : null;
                  setDirectMessageTarget(defaultTarget ? { id: defaultTarget.email, name: defaultTarget.name, email: defaultTarget.email, avatar: defaultTarget.avatar } : null);
                  setDirectMessageSubject('');
                  setDirectMessageBody('');
                  setShowDirectMessageModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Message User</span>
              </button>
            </div>
            {allTickets.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-10">No support tickets found.</p>
            ) : allTickets.map(t => {
              const cust = getCustomerInfo(t.userId, t.userEmail, t.messages[0]?.senderName);
              const isSelected = activeTicket?.id === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                    isSelected
                      ? 'bg-blue-950/50 border-blue-500/50 shadow-lg ring-1 ring-blue-500/40'
                      : 'bg-zinc-900 border-white/[0.06] hover:bg-zinc-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                      {t.ticketNumber}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      t.status === 'open' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' :
                      t.status === 'in_progress' ? 'bg-blue-950/60 text-blue-400 border-blue-500/30' :
                      'bg-zinc-800 text-zinc-400 border-white/10'
                    }`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Customer Identity: Name & Avatar */}
                  <div className="flex items-center gap-2.5">
                    <img
                      src={cust.avatar}
                      alt={cust.name}
                      className="h-8 w-8 rounded-full object-cover border border-white/15 shrink-0 shadow-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{cust.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{t.userEmail}</p>
                    </div>
                  </div>

                  {/* Subject Tag */}
                  <div className="text-xs font-medium text-slate-300 truncate bg-zinc-950/70 px-2.5 py-1.5 rounded-xl border border-white/[0.04]">
                    {t.subject}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Ticket thread & reply */}
          <div className="lg:col-span-8">
            {activeTicket ? (
              (() => {
                const activeCust = getCustomerInfo(activeTicket.userId, activeTicket.userEmail, activeTicket.messages[0]?.senderName);

                return (
                  <div className="rounded-3xl bg-zinc-900 border border-white/[0.08] flex flex-col" style={{ height: 600 }}>
                    {/* Customer Identity Header */}
                    <div className="p-4 border-b border-white/[0.06] bg-zinc-950 flex items-center justify-between rounded-t-3xl gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={activeCust.avatar}
                          alt={activeCust.name}
                          className="h-11 w-11 rounded-2xl object-cover border border-white/20 shadow-md shrink-0 ring-2 ring-white/10"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-white">{activeCust.name}</h4>
                            <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-500/30">
                              {activeTicket.ticketNumber}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>{activeTicket.userEmail}</span>
                            <span>·</span>
                            <span className="text-slate-200 capitalize font-medium">{activeTicket.category.replace('_', ' ')}</span>
                          </p>
                        </div>
                      </div>

                      {activeTicket.status !== 'closed' && (
                        <button
                          onClick={() => adminCloseTicket(activeTicket.id).then(() => showFeedback('success', 'Ticket closed.'))}
                          className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-xs text-slate-300 hover:text-white font-bold transition-all shrink-0"
                        >
                          Close Ticket
                        </button>
                      )}
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-thin">
                      {activeTicket.messages.map(msg => {
                        const isAgent = msg.sender === 'agent';
                        const avatarUrl = isAgent
                          ? 'https://ui-avatars.com/api/?name=SubNexus+Ops&background=2563eb&color=fff'
                          : activeCust.avatar;

                        return (
                          <div
                            key={msg.id}
                            className={`flex items-start gap-2.5 ${isAgent ? 'flex-row-reverse' : 'flex-row'}`}
                          >
                            <img
                              src={avatarUrl}
                              alt={msg.senderName}
                              className="h-7 w-7 rounded-full object-cover border border-white/10 shrink-0 mt-0.5 shadow-sm"
                            />
                            <div className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}>
                              <div className="flex items-center gap-1.5 mb-1 px-1">
                                <span className="text-[11px] font-bold text-slate-300">{msg.senderName}</span>
                                <span className="text-[9px] text-slate-600">·</span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed space-y-2 ${
                                isAgent
                                  ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                                  : 'bg-zinc-800 text-slate-200 border border-white/[0.08] rounded-tl-none shadow-sm'
                              }`}>
                                {msg.imageUrl && (
                                  <div
                                    onClick={() => setPreviewScreenshotUrl(msg.imageUrl!)}
                                    className="rounded-xl overflow-hidden border border-white/20 cursor-pointer group/img relative"
                                  >
                                    <img
                                      src={msg.imageUrl}
                                      alt="Attachment"
                                      className="w-full max-h-52 object-cover group-hover/img:scale-105 transition-transform"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white">
                                      Click to enlarge proof
                                    </div>
                                  </div>
                                )}
                                {msg.content && <p>{msg.content}</p>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Admin Reply Bar with Image Attachment */}
                    {activeTicket.status !== 'closed' ? (
                      <div className="p-3.5 border-t border-white/[0.06] bg-zinc-950 rounded-b-3xl space-y-2">
                        {ticketReplyImage && (
                          <div className="flex items-center gap-2 px-1">
                            <div className="relative inline-block rounded-xl overflow-hidden border border-white/20">
                              <img src={ticketReplyImage} alt="Attachment Preview" className="h-12 w-12 object-cover" />
                              <button
                                type="button"
                                onClick={() => setTicketReplyImage(null)}
                                className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/80 text-white hover:bg-red-600 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="text-[11px] text-slate-400">Compressed image attached</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <input
                            ref={ticketFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              setIsCompressingTicketImage(true);
                              try {
                                const dataUrl = await compressImageToDataUrl(f, 750, 750, 0.65);
                                setTicketReplyImage(dataUrl);
                              } finally {
                                setIsCompressingTicketImage(false);
                                if (ticketFileInputRef.current) ticketFileInputRef.current.value = '';
                              }
                            }}
                            className="hidden"
                          />
                          <button
                            type="button"
                            disabled={isCompressingTicketImage}
                            onClick={() => ticketFileInputRef.current?.click()}
                            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-white border border-white/10 transition-colors shrink-0"
                            title="Attach compressed image / screenshot"
                          >
                            {isCompressingTicketImage ? <Loader2 className="h-4 w-4 animate-spin text-cyan-400" /> : <ImageIcon className="h-4 w-4" />}
                          </button>

                          <input
                            value={ticketReply}
                            onChange={e => setTicketReply(e.target.value)}
                            placeholder={ticketReplyImage ? "Add a message or send image..." : "Type official admin reply to customer…"}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReplyTicket(activeTicket.id); } }}
                          />
                          <button
                            onClick={() => handleReplyTicket(activeTicket.id)}
                            disabled={!ticketReply.trim() && !ticketReplyImage}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5"
                          >
                            <Send className="h-3.5 w-3.5" />
                            <span>Send Reply</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-500 bg-zinc-950 border-t border-white/[0.06] rounded-b-3xl">
                        This support ticket is closed.
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="h-60 rounded-3xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-slate-500 text-sm">
                Select a ticket to view the conversation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* BOT & QUICK AUTO-REPLIES TAB                              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === 'bot' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-cyan-400" />
                <span>Bot Quick Questions & Smart Auto-Replies</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Full CRUD control over clickable chat prompt chips and automated AI intelligence answers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetQuickMessages}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-bold transition-colors border border-white/10"
              >
                Reset to Defaults
              </button>
              <button
                type="button"
                onClick={() => setEditingQuickMessage({
                  id: '',
                  label: '',
                  query: '',
                  answer: '',
                  keywords: [],
                  order: quickMessages.length + 1,
                  isActive: true,
                  isNew: true,
                })}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Quick Question & Answer</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickMessages.map((qm) => (
              <div
                key={qm.id}
                className={`p-5 rounded-3xl bg-zinc-900 border transition-all space-y-3.5 ${
                  qm.isActive ? 'border-white/10' : 'border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 font-bold text-xs">
                        {qm.label}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        qm.isActive
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-500 border-white/5'
                      }`}>
                        {qm.isActive ? 'Active Chip' : 'Hidden'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white pt-1">
                      &quot;{qm.query}&quot;
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingQuickMessage({ ...qm, isNew: false })}
                      className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Edit Quick Message"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickMessageDeleteConfirm(qm.id)}
                      className="p-1.5 rounded-xl bg-zinc-800 hover:bg-red-950/50 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete Quick Message"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-950/80 border border-white/[0.04] text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">Automated Answer:</span>
                  {qm.answer}
                </div>

                {qm.keywords && qm.keywords.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-500 font-medium">Keywords:</span>
                    {qm.keywords.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] text-slate-300 font-mono">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
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

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO & CINEMATIC BANNERS TAB                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {tab === 'hero' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                <span>Storefront Hero & Cinematic Banners</span>
              </h2>
              <p className="text-xs text-slate-400">
                Customize the rotating hero slides, live status tags, cursive slogans, and background imagery on the homepage in real-time.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  if (confirm('Reset all hero slides to the default cinematic presets?')) {
                    await adminResetHeroSlides();
                    showFeedback('success', 'Hero slides reset to default presets.');
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Reset to Defaults
              </button>

              <button
                onClick={() => {
                  setEditingHeroSlide({
                    id: '',
                    isNew: true,
                    tag: 'NEW EXCLUSIVE DEAL',
                    title: 'Ultimate Premium Suite at 80% Off',
                    sub: 'Instant 30-Second Vault Delivery',
                    bgImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80',
                    ctaText: 'Explore Subscriptions',
                    ctaLink: '#catalog',
                    order: heroSlides.length + 1,
                  });
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Hero Slide</span>
              </button>
            </div>
          </div>

          {/* Slides Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {heroSlides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className="relative rounded-3xl bg-zinc-900 border border-white/[0.08] overflow-hidden shadow-xl flex flex-col justify-between group hover:border-cyan-500/40 transition-all"
              >
                {/* Background Image Preview */}
                <div className="relative h-44 w-full overflow-hidden bg-black">
                  <img
                    src={slide.bgImage}
                    alt={slide.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-70"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                  {/* Order & Tag Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-mono font-bold text-cyan-300">
                      Slide #{idx + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-bold text-cyan-300">
                      {slide.tag}
                    </span>
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingHeroSlide({ ...slide, isNew: false })}
                      className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-slate-300 hover:text-white border border-white/10 transition-colors shadow-sm"
                      title="Edit slide"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-cyan-400" />
                    </button>

                    {heroDeleteConfirm === slide.id ? (
                      <button
                        onClick={() => handleDeleteHeroSlide(slide.id)}
                        className="px-2.5 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md"
                      >
                        Confirm Delete
                      </button>
                    ) : (
                      <button
                        onClick={() => setHeroDeleteConfirm(slide.id)}
                        className="p-2 rounded-xl bg-zinc-900/90 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-white/10 transition-colors shadow-sm"
                        title="Delete slide"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <p className="text-base text-cyan-400 font-bold" style={{ fontFamily: "'Caveat', cursive" }}>
                      {slide.sub}
                    </p>
                    <h3 className="text-base font-black text-white leading-snug mt-0.5">
                      {slide.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/[0.06]">
                    <span className="font-mono">CTA: {slide.ctaText || 'Explore Subscriptions'} ({slide.ctaLink || '#catalog'})</span>
                    <button
                      onClick={() => setEditingHeroSlide({ ...slide, isNew: false })}
                      className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Edit Content</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* EDIT / CREATE HERO SLIDE MODAL */}
          {editingHeroSlide && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              onClick={() => setEditingHeroSlide(null)}
            >
              <div
                className="relative w-full max-w-xl rounded-3xl bg-zinc-950 border border-white/15 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">
                        {editingHeroSlide.isNew ? 'Create New Hero Slide' : `Edit Hero Slide #${editingHeroSlide.order || 1}`}
                      </h3>
                      <p className="text-[11px] text-slate-400">Updates the storefront live carousel immediately</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingHeroSlide(null)}
                    className="p-1.5 rounded-xl bg-zinc-900 text-slate-400 hover:text-white border border-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveHeroSlide();
                  }}
                  className="space-y-4 text-xs"
                >
                  {/* Status Pill Tag */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 block">Top Status Tag</label>
                    <input
                      type="text"
                      value={editingHeroSlide.tag}
                      onChange={e => setEditingHeroSlide(prev => prev ? ({ ...prev, tag: e.target.value }) : null)}
                      placeholder="e.g. INSTANT 30S DELIVERY"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono uppercase tracking-wider"
                      required
                    />
                  </div>

                  {/* Cursive Subtitle */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 block">Cursive Animated Subtitle</label>
                    <input
                      type="text"
                      value={editingHeroSlide.sub}
                      onChange={e => setEditingHeroSlide(prev => prev ? ({ ...prev, sub: e.target.value }) : null)}
                      placeholder="e.g. Save Up to 80% on Official Digital Plans"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-cyan-400 font-bold"
                      required
                    />
                  </div>

                  {/* Main Headline Title */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 block">Main Headline Title</label>
                    <input
                      type="text"
                      value={editingHeroSlide.title}
                      onChange={e => setEditingHeroSlide(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                      placeholder="e.g. Premium Subscriptions at Wholesale Rates"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white font-bold text-sm"
                      required
                    />
                  </div>

                  {/* Background Image URL & Uploader */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-300 block">Cinematic Background Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingHeroSlide.bgImage}
                        onChange={e => setEditingHeroSlide(prev => prev ? ({ ...prev, bgImage: e.target.value }) : null)}
                        placeholder="Image URL (e.g. /images/hero-vault.jpg or https://...)"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono text-[11px]"
                        required
                      />

                      <input
                        ref={heroFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          setIsCompressingHeroImg(true);
                          try {
                            const dataUrl = await compressImageToDataUrl(f, 1600, 900, 0.75);
                            setEditingHeroSlide(prev => prev ? ({ ...prev, bgImage: dataUrl }) : null);
                          } finally {
                            setIsCompressingHeroImg(false);
                            if (heroFileInputRef.current) heroFileInputRef.current.value = '';
                          }
                        }}
                        className="hidden"
                      />

                      <button
                        type="button"
                        disabled={isCompressingHeroImg}
                        onClick={() => heroFileInputRef.current?.click()}
                        className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-cyan-400 font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        {isCompressingHeroImg ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
                        <span>Upload</span>
                      </button>
                    </div>

                    {/* Preview Thumbnail */}
                    {editingHeroSlide.bgImage && (
                      <div className="relative h-28 w-full rounded-2xl overflow-hidden border border-white/10 bg-black">
                        <img
                          src={editingHeroSlide.bgImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-3 text-center">
                          <p className="text-white font-bold text-xs drop-shadow">{editingHeroSlide.title}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CTA Text & Link */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300 block">Button CTA Text</label>
                      <input
                        type="text"
                        value={editingHeroSlide.ctaText || ''}
                        onChange={e => setEditingHeroSlide(prev => prev ? ({ ...prev, ctaText: e.target.value }) : null)}
                        placeholder="e.g. Explore Subscriptions"
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300 block">Button CTA Link / Anchor</label>
                      <input
                        type="text"
                        value={editingHeroSlide.ctaLink || ''}
                        onChange={e => setEditingHeroSlide(prev => prev ? ({ ...prev, ctaLink: e.target.value }) : null)}
                        placeholder="e.g. #catalog"
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setEditingHeroSlide(null)}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>{editingHeroSlide.isNew ? 'Create Slide' : 'Save & Publish Live'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* DIRECT MESSAGE MODAL (Admin to any User)                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {showDirectMessageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setShowDirectMessageModal(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-white/15 p-6 shadow-2xl space-y-5"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Send Direct Message to Customer</h3>
                  <p className="text-[11px] text-slate-400">Dispatches an instant live ticket message to the user</p>
                </div>
              </div>
              <button
                onClick={() => setShowDirectMessageModal(false)}
                className="p-1.5 rounded-xl bg-zinc-900 text-slate-400 hover:text-white border border-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendDirectMessage} className="space-y-4">
              {/* Recipient User Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Select Recipient Customer</label>
                <select
                  value={directMessageTarget?.email || ''}
                  onChange={e => {
                    const selected = allUsers.find(u => u.email === e.target.value);
                    if (selected) {
                      const cust = getCustomerInfo(selected.id, selected.email, selected.name);
                      setDirectMessageTarget({ id: selected.id, name: cust.name, email: selected.email, avatar: cust.avatar });
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value="" disabled>Choose a registered user…</option>
                  {allUsers.map(u => {
                    const cust = getCustomerInfo(u.id, u.email, u.name);
                    return (
                      <option key={u.id} value={u.email}>
                        {cust.name} ({u.email})
                      </option>
                    );
                  })}
                </select>

                {/* Recipient Preview Card */}
                {directMessageTarget && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/80 border border-white/[0.06] mt-2">
                    <img
                      src={directMessageTarget.avatar}
                      alt={directMessageTarget.name}
                      className="h-9 w-9 rounded-full object-cover border border-white/15 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">{directMessageTarget.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{directMessageTarget.email}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Inquiry Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">Topic / Category</label>
                <select
                  value={directMessageCategory}
                  onChange={e => setDirectMessageCategory(e.target.value as SupportTicket['category'])}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="general">General Support / Update</option>
                  <option value="credential_issue">Account Credentials & Login Help</option>
                  <option value="payment_issue">Payment & Transaction Verification</option>
                  <option value="renewal_help">Warranty & Renewal Assistance</option>
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">Message Subject</label>
                <input
                  type="text"
                  value={directMessageSubject}
                  onChange={e => setDirectMessageSubject(e.target.value)}
                  placeholder="e.g. Update regarding your ChatGPT Plus subscription"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Message Content & Image Attachment */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">Message Content</label>
                <textarea
                  rows={3}
                  value={directMessageBody}
                  onChange={e => setDirectMessageBody(e.target.value)}
                  placeholder="Type your official admin message to this customer..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                  required={!directMessageImage}
                />
              </div>

              {/* Image Attachment in DM */}
              <div className="space-y-1.5">
                <input
                  ref={dmFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setIsCompressingDmImage(true);
                    try {
                      const dataUrl = await compressImageToDataUrl(f, 750, 750, 0.65);
                      setDirectMessageImage(dataUrl);
                    } finally {
                      setIsCompressingDmImage(false);
                      if (dmFileInputRef.current) dmFileInputRef.current.value = '';
                    }
                  }}
                  className="hidden"
                />

                {directMessageImage ? (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-white/10">
                    <img src={directMessageImage} alt="Attachment" className="h-12 w-12 object-cover rounded-lg" />
                    <div className="flex-1 text-[11px] text-slate-400">Compressed image attached</div>
                    <button
                      type="button"
                      onClick={() => setDirectMessageImage(null)}
                      className="p-1 rounded-lg bg-zinc-800 text-slate-400 hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isCompressingDmImage}
                    onClick={() => dmFileInputRef.current?.click()}
                    className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-white/10 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {isCompressingDmImage ? <Loader2 className="h-4 w-4 animate-spin text-cyan-400" /> : <ImageIcon className="h-4 w-4" />}
                    <span>Attach Screenshot / Image</span>
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowDirectMessageModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingDirectMessage || !directMessageTarget || (!directMessageBody.trim() && !directMessageImage)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSendingDirectMessage ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* CUSTOM CREDENTIAL PROVISIONING MODAL                       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {customProvisionOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setCustomProvisionOrder(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-white/15 p-6 shadow-2xl space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Provision Credentials for #{customProvisionOrder.orderNumber}</h3>
                  <p className="text-[11px] text-slate-400">Customer: {customProvisionOrder.userEmail}</p>
                </div>
              </div>
              <button
                onClick={() => setCustomProvisionOrder(null)}
                className="p-1.5 rounded-xl bg-zinc-900 text-slate-400 hover:text-white border border-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-white/[0.06] text-xs text-slate-300 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Ordered Items</span>
              {customProvisionOrder.items.map((it, idx) => (
                <div key={idx} className="font-bold text-white">
                  {it.quantity}x {it.productName} ({it.durationLabel})
                </div>
              ))}
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setApprovingOrderId(customProvisionOrder.id);
                try {
                  await adminApproveAndDeliverOrder(customProvisionOrder.id, {
                    email: provisionCreds.email.trim(),
                    password: provisionCreds.password.trim(),
                    pinCode: provisionCreds.pinCode.trim(),
                    notes: provisionCreds.notes.trim(),
                  });
                  showFeedback('success', `Order #${customProvisionOrder.orderNumber} custom credentials provisioned and delivered!`);
                  setCustomProvisionOrder(null);
                } finally {
                  setApprovingOrderId(null);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Account Login Email</label>
                <input
                  type="email"
                  value={provisionCreds.email}
                  onChange={e => setProvisionCreds(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="e.g. premium.user@service.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Account Password</label>
                <input
                  type="text"
                  value={provisionCreds.password}
                  onChange={e => setProvisionCreds(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter decrypted password or auto-generate"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Profile PIN (Optional)</label>
                  <input
                    type="text"
                    value={provisionCreds.pinCode}
                    onChange={e => setProvisionCreds(prev => ({ ...prev, pinCode: e.target.value }))}
                    placeholder="e.g. 1234"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Quick Auto-Fill</label>
                  <button
                    type="button"
                    onClick={() => {
                      setProvisionCreds({
                        email: customProvisionOrder.userEmail || 'customer@service.io',
                        password: `Nexus#${Math.floor(100000 + Math.random() * 900000)}`,
                        pinCode: `${Math.floor(1000 + Math.random() * 9000)}`,
                        notes: 'Official verified subscription provided with 100% warranty.',
                      });
                    }}
                    className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-cyan-400 text-xs font-bold transition-colors cursor-pointer"
                  >
                    ⚡ Auto-Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Notes / Instructions for Customer</label>
                <textarea
                  rows={2}
                  value={provisionCreds.notes}
                  onChange={e => setProvisionCreds(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g. Please do not change profile name. Use Profile 1."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setCustomProvisionOrder(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={approvingOrderId === customProvisionOrder.id || !provisionCreds.email || !provisionCreds.password}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  {approvingOrderId === customProvisionOrder.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  <span>Save & Deliver to Customer Vault</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* QUICK MESSAGE & BOT AUTO-REPLY EDITOR MODAL               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {editingQuickMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setEditingQuickMessage(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-white/15 p-6 shadow-2xl space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {editingQuickMessage.isNew ? 'New Bot Quick Question & Answer' : 'Edit Quick Question & Answer'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Manage live chat suggested button & instant response</p>
                </div>
              </div>
              <button
                onClick={() => setEditingQuickMessage(null)}
                className="p-1.5 rounded-xl bg-zinc-900 text-slate-400 hover:text-white border border-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveQuickMessage();
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Button Chip Label (with emoji)
                </label>
                <input
                  type="text"
                  value={editingQuickMessage.label}
                  onChange={e => setEditingQuickMessage(prev => prev ? ({ ...prev, label: e.target.value }) : null)}
                  placeholder="e.g. 🔑 Get Credentials, 💳 bKash Help"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Customer Prompt Text (sent in chat when clicked)
                </label>
                <input
                  type="text"
                  value={editingQuickMessage.query}
                  onChange={e => setEditingQuickMessage(prev => prev ? ({ ...prev, query: e.target.value }) : null)}
                  placeholder="e.g. Where do I find my account login credentials after ordering?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    Automated Instant Response (Bot Answer)
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono font-semibold">
                    Live Data Variables Supported
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={editingQuickMessage.answer}
                  onChange={e => setEditingQuickMessage(prev => prev ? ({ ...prev, answer: e.target.value }) : null)}
                  placeholder="Type the exact helpful instructions or support answer..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                  required
                />
                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px] text-slate-400">
                  <span>Click to insert live data:</span>
                  {[
                    '{ORDER_NUMBER}', '{ORDER_STATUS}', '{ORDER_ITEMS}', '{ORDER_TOTAL}',
                    '{TRX_ID}', '{BKASH_NUMBER}', '{NAGAD_NUMBER}', '{CUSTOMER_NAME}', '{ACTIVE_SERVICES}'
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setEditingQuickMessage(prev => prev ? ({ ...prev, answer: `${prev.answer} ${tag}` }) : null)}
                      className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-cyan-300 font-mono border border-white/10 cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Trigger Keywords (comma-separated for smart AI matching)
                </label>
                <input
                  type="text"
                  value={(editingQuickMessage.keywords || []).join(', ')}
                  onChange={e => {
                    const kws = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setEditingQuickMessage(prev => prev ? ({ ...prev, keywords: kws }) : null);
                  }}
                  placeholder="e.g. credential, password, vault, login, pin"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Sort Order Rank</label>
                  <input
                    type="number"
                    value={editingQuickMessage.order || 1}
                    onChange={e => setEditingQuickMessage(prev => prev ? ({ ...prev, order: parseInt(e.target.value) || 1 }) : null)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="qmActiveToggle"
                    checked={editingQuickMessage.isActive}
                    onChange={e => setEditingQuickMessage(prev => prev ? ({ ...prev, isActive: e.target.checked }) : null)}
                    className="h-4 w-4 rounded accent-cyan-500 cursor-pointer"
                  />
                  <label htmlFor="qmActiveToggle" className="text-xs font-bold text-slate-200 cursor-pointer">
                    Show on Live Chat Chips
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setEditingQuickMessage(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Quick Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Message Delete Confirm */}
      {quickMessageDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-950 border border-white/15 p-6 shadow-2xl text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-red-950/60 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-black text-white text-sm">Delete Quick Message?</h3>
              <p className="text-xs text-slate-400 mt-1">This quick chip will be removed from customer live chat.</p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setQuickMessageDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-slate-300 text-xs font-bold hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteQuickMessage(quickMessageDeleteConfirm)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FULL SUBSCRIPTION & VAULT CREDENTIALS MODAL EDITOR         */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {editingFullSubscription && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
          onClick={() => setEditingFullSubscription(null)}
        >
          <div
            className="relative w-full max-w-xl rounded-3xl bg-zinc-950 border border-white/15 p-6 shadow-2xl space-y-5 my-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {editingFullSubscription.isNew ? 'Provision New Subscription & Credentials' : `Edit Credentials for ${editingFullSubscription.productName}`}
                  </h3>
                  <p className="text-[11px] text-slate-400">Directly syncs to customer dashboard vault in real-time</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingFullSubscription(null)}
                className="p-1.5 rounded-xl bg-zinc-900 text-slate-400 hover:text-white border border-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editingFullSubscription.userEmail || !editingFullSubscription.productName) {
                  showFeedback('error', 'Please specify a customer email and product.');
                  return;
                }

                try {
                  if (editingFullSubscription.isNew) {
                    const { isNew, id, ...newSubData } = editingFullSubscription as UserSubscription & { isNew: boolean };
                    await adminCreateSubscription(newSubData);
                    showFeedback('success', `Subscription & Credentials provisioned to ${editingFullSubscription.userEmail}'s Vault!`);
                  } else {
                    await adminUpdateSubscription(editingFullSubscription.id!, editingFullSubscription);
                    showFeedback('success', 'Subscription & Vault credentials updated in database.');
                  }
                  setEditingFullSubscription(null);
                } catch {
                  showFeedback('error', 'Failed to save subscription.');
                }
              }}
              className="space-y-4 text-xs"
            >
              {/* Recipient User Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">Customer Email / Account</label>
                <div className="flex gap-2">
                  <select
                    value={editingFullSubscription.userEmail || ''}
                    onChange={e => {
                      const sel = allUsers.find(u => u.email.toLowerCase() === e.target.value.toLowerCase());
                      setEditingFullSubscription(prev => prev ? ({
                        ...prev,
                        userEmail: e.target.value,
                        userId: sel?.id || prev.userId || 'usr_guest',
                      }) : null);
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="" disabled>Select registered customer…</option>
                    {allUsers.map(u => (
                      <option key={u.id} value={u.email}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                  <input
                    type="email"
                    placeholder="Or enter custom email"
                    value={editingFullSubscription.userEmail || ''}
                    onChange={e => setEditingFullSubscription(prev => prev ? ({ ...prev, userEmail: e.target.value }) : null)}
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Product Selection & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Product</label>
                  <select
                    value={editingFullSubscription.productId || ''}
                    onChange={e => {
                      const prod = products.find(p => p.id === e.target.value);
                      if (prod) {
                        setEditingFullSubscription(prev => prev ? ({
                          ...prev,
                          productId: prod.id,
                          productName: prod.name,
                          productLogo: prod.logo,
                          pricePaid: prod.pricingTiers?.[0]?.price || prev.pricePaid || 19.99,
                        }) : null);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Plan Duration</label>
                  <select
                    value={editingFullSubscription.planDuration || '1_month'}
                    onChange={e => {
                      const dur = e.target.value;
                      const labels: Record<string, string> = {
                        '1_month': '1 Month',
                        '3_months': '3 Months',
                        '6_months': '6 Months',
                        '12_months': '12 Months',
                        'lifetime': 'Lifetime Access',
                      };
                      const daysMap: Record<string, number> = { '1_month': 30, '3_months': 90, '6_months': 180, '12_months': 365, 'lifetime': 3650 };
                      const dCount = daysMap[dur] || 30;
                      const newExp = new Date(Date.now() + dCount * 86400000).toISOString();

                      setEditingFullSubscription(prev => prev ? ({
                        ...prev,
                        planDuration: dur as any,
                        durationLabel: labels[dur] || dur,
                        expiryDate: newExp,
                        warrantyValidUntil: newExp,
                      }) : null);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="1_month">1 Month</option>
                    <option value="3_months">3 Months</option>
                    <option value="6_months">6 Months</option>
                    <option value="12_months">12 Months (1 Year)</option>
                    <option value="lifetime">Lifetime Access</option>
                  </select>
                </div>
              </div>

              {/* Account Login Credentials */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-cyan-500/20 space-y-3">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Vault Account Login Credentials
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Account Login Email / ID</label>
                    <input
                      type="text"
                      value={editingFullSubscription.credentials?.email || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setEditingFullSubscription(prev => prev ? ({
                          ...prev,
                          credentials: { ...(prev.credentials || {}), email: val } as any,
                        }) : null);
                      }}
                      placeholder="e.g. premium.user@service.com"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-300">Account Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          const autoPwd = `Keyoon#${Math.floor(100000 + Math.random() * 900000)}`;
                          setEditingFullSubscription(prev => prev ? ({
                            ...prev,
                            credentials: { ...(prev.credentials || {}), password: autoPwd } as any,
                          }) : null);
                        }}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                      >
                        ⚡ Generate
                      </button>
                    </div>
                    <input
                      type="text"
                      value={editingFullSubscription.credentials?.password || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setEditingFullSubscription(prev => prev ? ({
                          ...prev,
                          credentials: { ...(prev.credentials || {}), password: val } as any,
                        }) : null);
                      }}
                      placeholder="Password"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Profile Name (Optional)</label>
                    <input
                      type="text"
                      value={editingFullSubscription.credentials?.profileName || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setEditingFullSubscription(prev => prev ? ({
                          ...prev,
                          credentials: { ...(prev.credentials || {}), profileName: val } as any,
                        }) : null);
                      }}
                      placeholder="e.g. VIP Profile 1"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Profile Lock PIN (Optional)</label>
                    <input
                      type="text"
                      value={editingFullSubscription.credentials?.pinCode || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setEditingFullSubscription(prev => prev ? ({
                          ...prev,
                          credentials: { ...(prev.credentials || {}), pinCode: val } as any,
                        }) : null);
                      }}
                      placeholder="e.g. 1234"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">VIP Invite Link / Direct URL (Optional)</label>
                  <input
                    type="url"
                    value={editingFullSubscription.credentials?.inviteLink || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingFullSubscription(prev => prev ? ({
                        ...prev,
                        credentials: { ...(prev.credentials || {}), inviteLink: val } as any,
                      }) : null);
                    }}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Setup Instructions / Vault Notes</label>
                  <textarea
                    rows={2}
                    value={editingFullSubscription.credentials?.notes || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingFullSubscription(prev => prev ? ({
                        ...prev,
                        credentials: { ...(prev.credentials || {}), notes: val } as any,
                      }) : null);
                    }}
                    placeholder="e.g. 100% replacement warranty active. Do not change profile name."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Expiry Date, Status & Quick Extension Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">Plan Expiry Date</label>
                    <span className="text-[10px] text-cyan-400 font-bold">
                      {calculateDaysRemaining(editingFullSubscription.expiryDate || new Date().toISOString())}d left
                    </span>
                  </div>
                  <input
                    type="date"
                    value={editingFullSubscription.expiryDate ? editingFullSubscription.expiryDate.split('T')[0] : ''}
                    onChange={e => {
                      const d = e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString();
                      setEditingFullSubscription(prev => prev ? ({
                        ...prev,
                        expiryDate: d,
                        warrantyValidUntil: d,
                      }) : null);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none font-mono"
                    required
                  />
                  <div className="flex items-center gap-1 pt-1">
                    {[
                      { label: '+30d', days: 30 },
                      { label: '+90d', days: 90 },
                      { label: '+1y', days: 365 },
                      { label: 'Lifetime', days: 3650 },
                    ].map(btn => (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={() => {
                          const base = Math.max(new Date(editingFullSubscription.expiryDate || Date.now()).getTime(), Date.now());
                          const newExp = new Date(base + btn.days * 86400000).toISOString();
                          setEditingFullSubscription(prev => prev ? ({
                            ...prev,
                            expiryDate: newExp,
                            warrantyValidUntil: newExp,
                          }) : null);
                        }}
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-slate-300 border border-white/5 cursor-pointer"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Subscription Status</label>
                  <select
                    value={editingFullSubscription.status || 'active'}
                    onChange={e => setEditingFullSubscription(prev => prev ? ({
                      ...prev,
                      status: e.target.value as any,
                    }) : null)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none"
                  >
                    <option value="active">Active (Full Access)</option>
                    <option value="expiring_soon">Expiring Soon</option>
                    <option value="expired">Expired</option>
                    <option value="paused">Paused / Under Maintenance</option>
                  </select>

                  <div className="flex items-center gap-2 pt-3">
                    <input
                      type="checkbox"
                      id="subAutoRenewToggle"
                      checked={editingFullSubscription.autoRenew ?? true}
                      onChange={e => setEditingFullSubscription(prev => prev ? ({
                        ...prev,
                        autoRenew: e.target.checked,
                      }) : null)}
                      className="h-4 w-4 rounded accent-cyan-500 cursor-pointer"
                    />
                    <label htmlFor="subAutoRenewToggle" className="text-xs font-bold text-slate-300 cursor-pointer">
                      Auto-Renewal Engine Enabled
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setEditingFullSubscription(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save & Sync to Customer Vault</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Delete Confirmation Modal */}
      {subDeleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-950 border border-white/15 p-6 shadow-2xl text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-red-950/60 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-black text-white text-sm">Revoke & Delete Subscription?</h3>
              <p className="text-xs text-slate-400 mt-1">This will remove the credentials from the customer&apos;s vault.</p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setSubDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-slate-300 text-xs font-bold hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await adminDeleteSubscription(subDeleteConfirmId);
                  setSubDeleteConfirmId(null);
                  showFeedback('success', 'Subscription revoked and deleted.');
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
