'use client';

import React, { useState } from 'react';
import { useApp, SUPERADMIN_EMAIL } from '@/context/AppContext';
import {
  TrendingUp, DollarSign, Users, Package, Tag, Headphones, ShoppingBag,
  BarChart2, MessageSquare, Lock, Star, Sparkles, CreditCard, UserCheck,
  CheckCircle2, AlertCircle, RefreshCw, Gift, Activity,
} from 'lucide-react';
import { Product, Coupon, UserSubscription, Order, BangladeshPaymentMethod, SupportTicket, HeroSlide, QuickMessage, AdminActivityLog } from '@/types';

// Components
import { AdminHeader, AdminSidebar, AdminTab, NavSection } from '@/components/admin/AdminHeader';

// Tabs
import { OverviewTab } from '@/components/admin/tabs/OverviewTab';
import { OrdersTab } from '@/components/admin/tabs/OrdersTab';
import { PaymentsTab } from '@/components/admin/tabs/PaymentsTab';
import { ProductsTab } from '@/components/admin/tabs/ProductsTab';
import { UsersTab } from '@/components/admin/tabs/UsersTab';
import { AdminsTab } from '@/components/admin/tabs/AdminsTab';
import { SubscriptionsTab } from '@/components/admin/tabs/SubscriptionsTab';
import { CouponsTab } from '@/components/admin/tabs/CouponsTab';
import { TicketsTab } from '@/components/admin/tabs/TicketsTab';
import { ReviewsTab } from '@/components/admin/tabs/ReviewsTab';
import { AdminActivityLogsTab } from '@/components/admin/tabs/AdminActivityLogsTab';
import { HeroTab } from '@/components/admin/tabs/HeroTab';
import { BotTab } from '@/components/admin/tabs/BotTab';

// Modals
import { OrderApprovalModal } from '@/components/admin/modals/OrderApprovalModal';
import { ProductEditorModal } from '@/components/admin/modals/ProductEditorModal';
import { SubscriptionEditorModal } from '@/components/admin/modals/SubscriptionEditorModal';
import { DirectMessageModal } from '@/components/admin/modals/DirectMessageModal';
import { PaymentMethodModal } from '@/components/admin/modals/PaymentMethodModal';
import { HeroSlideModal } from '@/components/admin/modals/HeroSlideModal';
import { QuickMessageModal } from '@/components/admin/modals/QuickMessageModal';
import { ScreenshotPreviewModal } from '@/components/admin/modals/ScreenshotPreviewModal';

export default function AdminPortalPage() {
  const {
    firebaseUser, isAdmin, isSuperAdmin, setIsAuthModalOpen,
    products, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
    allOrders, adminUpdateOrderStatus, adminApproveAndDeliverOrder, adminVerifyPayment, adminRejectOrder,
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
    adminActivityLogs, brandSettings, updateBrandSettings,
  } = useApp();

  // Navigation & UI state
  const [tab, setTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Subscriptions state
  const [editingFullSubscription, setEditingFullSubscription] = useState<(Partial<UserSubscription> & { isNew?: boolean }) | null>(null);
  const [subDeleteConfirmId, setSubDeleteConfirmId] = useState<string | null>(null);
  const [subStatusFilter, setSubStatusFilter] = useState<'all' | 'active' | 'expiring_soon' | 'expired' | 'paused'>('all');
  const [showAdminVaultPassword, setShowAdminVaultPassword] = useState<Record<string, boolean>>({});
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);
  const [subSearch, setSubSearch] = useState('');

  // Quick Message Bot state
  const [editingQuickMessage, setEditingQuickMessage] = useState<(QuickMessage & { isNew?: boolean }) | null>(null);
  const [quickMessageDeleteConfirm, setQuickMessageDeleteConfirm] = useState<string | null>(null);

  // Orders & Approval Modal State
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'paid' | 'failed'>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);
  const [customProvisionOrder, setCustomProvisionOrder] = useState<Order | null>(null);
  const [perItemCreds, setPerItemCreds] = useState<Array<{ email: string; password: string; pinCode: string; profileName: string; notes: string }>>([]);
  const [approvalStep, setApprovalStep] = useState<'verify' | 'credentials' | 'confirm'>('verify');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [showItemPassword, setShowItemPassword] = useState<Record<number, boolean>>({});

  // Hero Slides state
  const [editingHeroSlide, setEditingHeroSlide] = useState<(HeroSlide & { isNew?: boolean }) | null>(null);
  const [heroDeleteConfirm, setHeroDeleteConfirm] = useState<string | null>(null);
  const [isCompressingHeroImg, setIsCompressingHeroImg] = useState(false);

  // Direct Message Modal state
  const [showDirectMessageModal, setShowDirectMessageModal] = useState(false);
  const [directMessageTarget, setDirectMessageTarget] = useState<{ id: string; name: string; email: string; avatar: string } | null>(null);
  const [directMessageSubject, setDirectMessageSubject] = useState('');
  const [directMessageCategory, setDirectMessageCategory] = useState<SupportTicket['category']>('general');
  const [directMessageBody, setDirectMessageBody] = useState('');
  const [directMessageImage, setDirectMessageImage] = useState<string | null>(null);
  const [isCompressingDmImage, setIsCompressingDmImage] = useState(false);
  const [isSendingDirectMessage, setIsSendingDirectMessage] = useState(false);

  // Payment Methods state
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<(BangladeshPaymentMethod & { isNew?: boolean }) | null>(null);
  const [isCompressingQr, setIsCompressingQr] = useState(false);

  // Reviews state
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
  const [productSearch, setProductSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Users state
  const [userSearch, setUserSearch] = useState('');

  // Admins state
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [adminRemoveConfirm, setAdminRemoveConfirm] = useState<string | null>(null);

  // Coupons state
  const [newCoupon, setNewCoupon] = useState<Coupon>({ code: '', discountPercent: 15, description: '' });
  const [showCouponForm, setShowCouponForm] = useState(false);

  // Tickets state
  const [ticketReply, setTicketReply] = useState('');
  const [ticketReplyImage, setTicketReplyImage] = useState<string | null>(null);
  const [isCompressingTicketImage, setIsCompressingTicketImage] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Chart range
  const [chartRange, setChartRange] = useState<'7d' | '30d' | '6m'>('6m');

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Revenue chart calculation
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
        const mStart = d.getTime();
        const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
        const mOrders = allOrders.filter(o => {
          const t = new Date(o.createdAt).getTime();
          return t >= mStart && t < mEnd && (o.paymentStatus === 'paid' || o.paymentStatus === 'pending' || o.deliveryStatus === 'delivered');
        });
        const rev = mOrders.reduce((acc, o) => acc + (o.total || 0), 0);
        result.push({ label: mName, revenue: parseFloat(rev.toFixed(2)), orders: mOrders.length });
      }
    }
    return result;
  }, [allOrders, chartRange]);

  // Customer info helper
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

  // Product Handlers
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

  // Hero Slide Handlers
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
    } catch { showFeedback('error', 'Failed to save hero slide.'); }
  };

  const handleDeleteHeroSlide = async (id: string) => {
    try {
      await adminDeleteHeroSlide(id);
      setHeroDeleteConfirm(null);
      showFeedback('success', 'Hero slide removed from storefront.');
    } catch { showFeedback('error', 'Failed to delete hero slide.'); }
  };

  // Quick Message Handlers
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
    } catch { showFeedback('error', 'Failed to save quick message.'); }
  };

  const handleDeleteQuickMessage = async (id: string) => {
    try {
      await adminDeleteQuickMessage(id);
      setQuickMessageDeleteConfirm(null);
      showFeedback('success', 'Quick message deleted.');
    } catch { showFeedback('error', 'Failed to delete quick message.'); }
  };

  const handleResetQuickMessages = async () => {
    if (confirm('Reset all bot quick messages and auto-answers to default recommended presets?')) {
      try {
        await adminResetQuickMessages();
        showFeedback('success', 'Quick messages reset to defaults.');
      } catch { showFeedback('error', 'Failed to reset quick messages.'); }
    }
  };

  // Direct Message Handler
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

  // Reply Ticket Handler
  const handleReplyTicket = async (ticketId: string) => {
    if (!ticketReply.trim() && !ticketReplyImage) return;
    try {
      await adminReplyToTicket(ticketId, ticketReply.trim(), ticketReplyImage || undefined);
      setTicketReply('');
      setTicketReplyImage(null);
      showFeedback('success', 'Reply dispatched.');
    } catch { showFeedback('error', 'Failed to send reply.'); }
  };

  // Admin Management Handlers
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;
    setIsAddingAdmin(true);
    try {
      await adminAddAdmin(newAdminEmail.trim(), newAdminName.trim() || undefined);
      setNewAdminEmail('');
      setNewAdminName('');
      showFeedback('success', `Admin access granted to ${newAdminEmail}`);
    } catch { showFeedback('error', 'Failed to add admin.'); }
    finally { setIsAddingAdmin(false); }
  };

  const handleRemoveAdmin = async (email: string) => {
    try {
      await adminRemoveAdmin(email);
      setAdminRemoveConfirm(null);
      showFeedback('success', `Admin access revoked for ${email}`);
    } catch { showFeedback('error', 'Failed to revoke admin.'); }
  };

  const handleCreateCoupon = async () => {
    if (!newCoupon.code.trim()) return;
    await adminCreateCoupon({ ...newCoupon, code: newCoupon.code.toUpperCase() });
    setNewCoupon({ code: '', discountPercent: 15, description: '' });
    setShowCouponForm(false);
    showFeedback('success', 'Coupon created and synced.');
  };

  // Navigation Items with Counters
  const pendingOrdersCount = allOrders.filter(o => o.paymentStatus === 'pending').length;
  const openTicketsCount = allTickets.filter(t => t.status !== 'closed').length;

  const navSections: NavSection[] = [
    {
      title: 'Analytics & Command',
      items: [
        { id: 'overview', label: 'Command Overview', icon: <BarChart2 className="h-4 w-4" />, count: null },
        { id: 'orders', label: 'Orders & Verification', icon: <ShoppingBag className="h-4 w-4" />, count: pendingOrdersCount, isUrgent: pendingOrdersCount > 0 },
        { id: 'payments', label: 'Bangladesh Payment Gateways', icon: <CreditCard className="h-4 w-4" />, count: paymentMethods.length },
        { id: 'logs', label: 'Admin Activity & Audit Trace', icon: <Activity className="h-4 w-4 text-emerald-400" />, count: adminActivityLogs.length },
      ],
    },
    {
      title: 'Storefront & Products',
      items: [
        { id: 'products', label: 'Product Catalog', icon: <Package className="h-4 w-4" />, count: products.length },
        { id: 'coupons', label: 'Special Offers, Giveaways & Coupons', icon: <Gift className="h-4 w-4 text-cyan-400" />, count: coupons.length },
        { id: 'reviews', label: 'Customer Reviews', icon: <Star className="h-4 w-4" />, count: reviews.length },
        { id: 'hero', label: 'Hero Carousel Slides', icon: <Sparkles className="h-4 w-4" />, count: heroSlides.length },
        { id: 'bot', label: 'Bot Answers & Chips', icon: <MessageSquare className="h-4 w-4" />, count: quickMessages.length },
      ],
    },
    {
      title: 'Vault & Customer Ops',
      items: [
        { id: 'subscriptions', label: 'Vault Subscriptions & Logins', icon: <Lock className="h-4 w-4 text-cyan-400" />, count: allSubscriptions.length },
        { id: 'users', label: 'Customer Accounts', icon: <Users className="h-4 w-4" />, count: allUsers.length },
        { id: 'tickets', label: 'Support Queue & DM', icon: <Headphones className="h-4 w-4" />, count: openTicketsCount, isUrgent: openTicketsCount > 0 },
        { id: 'admins', label: 'Administrator Access', icon: <UserCheck className="h-4 w-4 text-red-400" />, count: adminList.length },
      ],
    },
  ];

  if (!firebaseUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Lock className="h-12 w-12 text-slate-500" />
        <h2 className="text-xl font-bold text-white">Admin Authentication Required</h2>
        <p className="text-sm text-slate-400">Please sign in with an authorized admin account.</p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-center max-w-md mx-auto">
        <div className="h-14 w-14 rounded-2xl bg-red-950/60 border border-red-500/30 text-red-400 flex items-center justify-center">
          <Lock className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-black text-white">Access Restricted</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your account (<span className="font-mono text-white">{firebaseUser.email}</span>) does not have administrator privileges.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 space-y-6">

      {/* Admin Top Header Bar */}
      <AdminHeader
        firebaseUser={firebaseUser}
        isSuperAdmin={isSuperAdmin}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        refreshAllData={refreshAllData}
        isSyncing={isSyncing}
        showFeedback={showFeedback}
      />

      {/* Feedback Toast */}
      {feedback && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl border text-sm font-bold shadow-2xl animate-in slide-in-from-right duration-200 ${
          feedback.type === 'success' ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200' : 'bg-red-950/95 border-red-500/50 text-red-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-red-400" />}
          {feedback.msg}
        </div>
      )}

      {/* Layout Grid: Sidebar + Main Section */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* Sidebar */}
        <AdminSidebar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          navSections={navSections}
          tab={tab}
          setTab={setTab}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 w-full space-y-6">
          {tab === 'overview' && (
            <OverviewTab
              financialMetrics={financialMetrics}
              allOrders={allOrders}
              allUsers={allUsers}
              allSubscriptions={allSubscriptions}
              allTickets={allTickets}
              chartRange={chartRange}
              setChartRange={setChartRange}
              revenueChartData={revenueChartData}
              setTab={setTab}
              showFeedback={showFeedback}
            />
          )}

          {tab === 'orders' && (
            <OrdersTab
              allOrders={allOrders}
              orderStatusFilter={orderStatusFilter}
              setOrderStatusFilter={setOrderStatusFilter}
              orderSearch={orderSearch}
              setOrderSearch={setOrderSearch}
              getCustomerInfo={getCustomerInfo}
              setPreviewScreenshotUrl={setPreviewScreenshotUrl}
              approvingOrderId={approvingOrderId}
              setPerItemCreds={setPerItemCreds}
              setApprovalStep={setApprovalStep}
              setRejectionReason={setRejectionReason}
              setShowRejectionInput={setShowRejectionInput}
              setCustomProvisionOrder={setCustomProvisionOrder}
              showFeedback={showFeedback}
            />
          )}

          {tab === 'payments' && (
            <PaymentsTab
              paymentMethods={paymentMethods}
              adminResetPaymentMethods={adminResetPaymentMethods}
              setEditingPaymentMethod={setEditingPaymentMethod}
              adminUpdatePaymentMethod={adminUpdatePaymentMethod}
              adminDeletePaymentMethod={adminDeletePaymentMethod}
              setPreviewScreenshotUrl={setPreviewScreenshotUrl}
              showFeedback={showFeedback}
            />
          )}

          {tab === 'products' && (
            <ProductsTab
              products={products}
              productSearch={productSearch}
              setProductSearch={setProductSearch}
              setEditingProduct={setEditingProduct}
              deleteConfirm={deleteConfirm}
              setDeleteConfirm={setDeleteConfirm}
              handleDeleteProduct={handleDeleteProduct}
            />
          )}

          {tab === 'users' && (
            <UsersTab
              allUsers={allUsers}
              userSearch={userSearch}
              setUserSearch={setUserSearch}
              getCustomerInfo={getCustomerInfo}
              setDirectMessageTarget={setDirectMessageTarget}
              setDirectMessageSubject={setDirectMessageSubject}
              setDirectMessageBody={setDirectMessageBody}
              setShowDirectMessageModal={setShowDirectMessageModal}
              isSuperAdmin={isSuperAdmin}
              adminUpdateUserRole={adminUpdateUserRole}
              showFeedback={showFeedback}
            />
          )}

          {tab === 'admins' && (
            <AdminsTab
              isSuperAdmin={isSuperAdmin}
              adminList={adminList}
              newAdminEmail={newAdminEmail}
              setNewAdminEmail={setNewAdminEmail}
              newAdminName={newAdminName}
              setNewAdminName={setNewAdminName}
              isAddingAdmin={isAddingAdmin}
              handleAddAdmin={handleAddAdmin}
              adminRemoveConfirm={adminRemoveConfirm}
              setAdminRemoveConfirm={setAdminRemoveConfirm}
              handleRemoveAdmin={handleRemoveAdmin}
            />
          )}

          {tab === 'subscriptions' && (
            <SubscriptionsTab
              allSubscriptions={allSubscriptions}
              subSearch={subSearch}
              setSubSearch={setSubSearch}
              subStatusFilter={subStatusFilter}
              setSubStatusFilter={setSubStatusFilter}
              products={products}
              allUsers={allUsers}
              setEditingFullSubscription={setEditingFullSubscription}
              adminPurgeMockSubscriptions={adminPurgeMockSubscriptions}
              adminPurgeAllSubscriptions={adminPurgeAllSubscriptions}
              selectedSubIds={selectedSubIds}
              setSelectedSubIds={setSelectedSubIds}
              adminDeleteSubscription={adminDeleteSubscription}
              showAdminVaultPassword={showAdminVaultPassword}
              setShowAdminVaultPassword={setShowAdminVaultPassword}
              adminUpdateSubscriptionStatus={adminUpdateSubscriptionStatus}
              subDeleteConfirmId={subDeleteConfirmId}
              setSubDeleteConfirmId={setSubDeleteConfirmId}
              showFeedback={showFeedback}
            />
          )}

          {tab === 'coupons' && (
            <CouponsTab
              coupons={coupons}
              newCoupon={newCoupon}
              setNewCoupon={setNewCoupon}
              showCouponForm={showCouponForm}
              setShowCouponForm={setShowCouponForm}
              handleCreateCoupon={handleCreateCoupon}
              adminDeleteCoupon={adminDeleteCoupon}
              showFeedback={showFeedback}
            />
          )}

          {tab === 'tickets' && (
            <TicketsTab
              allTickets={allTickets}
              allUsers={allUsers}
              getCustomerInfo={getCustomerInfo}
              selectedTicketId={selectedTicketId}
              setSelectedTicketId={setSelectedTicketId}
              setDirectMessageTarget={setDirectMessageTarget}
              setDirectMessageSubject={setDirectMessageSubject}
              setDirectMessageBody={setDirectMessageBody}
              setShowDirectMessageModal={setShowDirectMessageModal}
              adminCloseTicket={adminCloseTicket}
              setPreviewScreenshotUrl={setPreviewScreenshotUrl}
              ticketReply={ticketReply}
              setTicketReply={setTicketReply}
              ticketReplyImage={ticketReplyImage}
              setTicketReplyImage={setTicketReplyImage}
              isCompressingTicketImage={isCompressingTicketImage}
              setIsCompressingTicketImage={setIsCompressingTicketImage}
              handleReplyTicket={handleReplyTicket}
              showFeedback={showFeedback}
            />
          )}

          {tab === 'reviews' && (
            <ReviewsTab
              reviews={reviews}
              products={products}
              reviewSearch={reviewSearch}
              setReviewSearch={setReviewSearch}
              showAdminReviewForm={showAdminReviewForm}
              setShowAdminReviewForm={setShowAdminReviewForm}
              newAdminReview={newAdminReview}
              setNewAdminReview={setNewAdminReview}
              adminCreateReview={adminCreateReview}
              adminResetReviews={adminResetReviews}
              deleteReview={deleteReview}
              showFeedback={showFeedback}
            />
          )}

          {tab === 'hero' && (
            <HeroTab
              heroSlides={heroSlides}
              adminResetHeroSlides={adminResetHeroSlides}
              setEditingHeroSlide={setEditingHeroSlide}
              heroDeleteConfirm={heroDeleteConfirm}
              setHeroDeleteConfirm={setHeroDeleteConfirm}
              handleDeleteHeroSlide={handleDeleteHeroSlide}
              showFeedback={showFeedback}
              brandSettings={brandSettings}
              updateBrandSettings={updateBrandSettings}
            />
          )}

          {tab === 'bot' && (
            <BotTab
              quickMessages={quickMessages}
              handleResetQuickMessages={handleResetQuickMessages}
              setEditingQuickMessage={setEditingQuickMessage}
              setQuickMessageDeleteConfirm={setQuickMessageDeleteConfirm}
              quickMessageDeleteConfirm={quickMessageDeleteConfirm}
              handleDeleteQuickMessage={handleDeleteQuickMessage}
            />
          )}

          {tab === 'logs' && (
            <AdminActivityLogsTab
              logs={adminActivityLogs}
              showFeedback={showFeedback}
            />
          )}
        </main>
      </div>

      {/* Global Modals Overlays */}
      <OrderApprovalModal
        customProvisionOrder={customProvisionOrder}
        setCustomProvisionOrder={setCustomProvisionOrder}
        approvalStep={approvalStep}
        setApprovalStep={setApprovalStep}
        perItemCreds={perItemCreds}
        setPerItemCreds={setPerItemCreds}
        showRejectionInput={showRejectionInput}
        setShowRejectionInput={setShowRejectionInput}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        showItemPassword={showItemPassword}
        setShowItemPassword={setShowItemPassword}
        approvingOrderId={approvingOrderId}
        setApprovingOrderId={setApprovingOrderId}
        adminVerifyPayment={adminVerifyPayment}
        adminRejectOrder={adminRejectOrder}
        adminApproveAndDeliverOrder={adminApproveAndDeliverOrder}
        showFeedback={showFeedback}
      />

      <ProductEditorModal
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        productEditorTab={productEditorTab}
        setProductEditorTab={setProductEditorTab}
        isCompressingProductLogo={isCompressingProductLogo}
        setIsCompressingProductLogo={setIsCompressingProductLogo}
        isCompressingProductBanner={isCompressingProductBanner}
        setIsCompressingProductBanner={setIsCompressingProductBanner}
        handleSaveProduct={handleSaveProduct}
        showFeedback={showFeedback}
      />

      <SubscriptionEditorModal
        editingFullSubscription={editingFullSubscription}
        setEditingFullSubscription={setEditingFullSubscription}
        allUsers={allUsers}
        products={products}
        adminCreateSubscription={adminCreateSubscription}
        adminUpdateSubscription={adminUpdateSubscription}
        showFeedback={showFeedback}
      />

      <DirectMessageModal
        showDirectMessageModal={showDirectMessageModal}
        setShowDirectMessageModal={setShowDirectMessageModal}
        directMessageTarget={directMessageTarget}
        directMessageSubject={directMessageSubject}
        setDirectMessageSubject={setDirectMessageSubject}
        directMessageCategory={directMessageCategory}
        setDirectMessageCategory={setDirectMessageCategory}
        directMessageBody={directMessageBody}
        setDirectMessageBody={setDirectMessageBody}
        directMessageImage={directMessageImage}
        setDirectMessageImage={setDirectMessageImage}
        isCompressingDmImage={isCompressingDmImage}
        setIsCompressingDmImage={setIsCompressingDmImage}
        isSendingDirectMessage={isSendingDirectMessage}
        handleSendDirectMessage={handleSendDirectMessage}
        showFeedback={showFeedback}
      />

      <PaymentMethodModal
        editingPaymentMethod={editingPaymentMethod}
        setEditingPaymentMethod={setEditingPaymentMethod}
        isCompressingQr={isCompressingQr}
        setIsCompressingQr={setIsCompressingQr}
        adminCreatePaymentMethod={adminCreatePaymentMethod}
        adminUpdatePaymentMethod={adminUpdatePaymentMethod}
        showFeedback={showFeedback}
      />

      <HeroSlideModal
        editingHeroSlide={editingHeroSlide}
        setEditingHeroSlide={setEditingHeroSlide}
        isCompressingHeroImg={isCompressingHeroImg}
        setIsCompressingHeroImg={setIsCompressingHeroImg}
        handleSaveHeroSlide={handleSaveHeroSlide}
      />

      <QuickMessageModal
        editingQuickMessage={editingQuickMessage}
        setEditingQuickMessage={setEditingQuickMessage}
        handleSaveQuickMessage={handleSaveQuickMessage}
      />

      <ScreenshotPreviewModal
        previewScreenshotUrl={previewScreenshotUrl}
        setPreviewScreenshotUrl={setPreviewScreenshotUrl}
      />

    </div>
  );
}
