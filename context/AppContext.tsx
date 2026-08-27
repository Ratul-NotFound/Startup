'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Product, CartItem, Coupon, CustomerProfile, UserSubscription,
  Order, SupportTicket, FinancialMetric, EmailNotification, PlanPricing, PaymentMethod,
  AdminMember, Review, BangladeshPaymentMethod, HeroSlide, QuickMessage, AdminActivityLog, BrandSettings, CurrencySettings,
  CategoryConfig, SubscriptionCategory,
} from '@/types';
import { detectVisitorCountry } from '@/lib/geo-currency';
import {
  MOCK_PRODUCTS, MOCK_COUPONS, INITIAL_USER_PROFILE,
  INITIAL_FINANCIAL_METRICS, MOCK_REVIEWS, MOCK_PAYMENT_METHODS, MOCK_HERO_SLIDES,
} from '@/lib/mock-data';
import { generateOrderNumber, generateRandomId, generateMockCredentials } from '@/lib/utils';
import { auth, db, initAnalytics } from '@/lib/firebase';
import {
  onAuthStateChanged, signOut, User as FirebaseUser, getRedirectResult,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, collection, getDocs, addDoc, updateDoc,
  deleteDoc, query, where, orderBy, onSnapshot, writeBatch,
} from 'firebase/firestore';

// ─── Superadmin email ───────────────────────────────────────────────
export const SUPERADMIN_EMAIL = 'm.h.ratul18@gmail.com';

// ─── Default Category Configuration ────────────────────────────────
export const DEFAULT_CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    id: 'ai',
    label: 'AI & Productivity',
    description: 'Top AI models, coding assistants & intelligent tools',
    isHidden: false,
    orderIndex: 0,
  },
  {
    id: 'streaming',
    label: 'Movies & Music Streaming',
    description: '4K Ultra HD video, movies, music & ad-free entertainment',
    isHidden: false,
    orderIndex: 1,
  },
  {
    id: 'dev',
    label: 'Developer Tools',
    description: 'AI code editors, coding workspaces & fast requests',
    isHidden: false,
    orderIndex: 2,
  },
  {
    id: 'productivity',
    label: 'Design & Creative Apps',
    description: 'Full creative suites for graphic design, photo & video editing',
    isHidden: false,
    orderIndex: 3,
  },
  {
    id: 'vpn_security',
    label: 'VPN & Online Security',
    description: 'Encrypted privacy tunnels, threat protection & fast proxies',
    isHidden: false,
    orderIndex: 4,
  },
];

export const DEFAULT_QUICK_MESSAGES: QuickMessage[] = [
  {
    id: 'qm_credentials',
    label: '🔑 Get Credentials',
    query: 'Where do I find my account login credentials after ordering?',
    answer: '🔑 Hello {CUSTOMER_NAME}! Your credentials are automatically unlocked in your personal Keyoon Vault. Click the "Vault" button in the top navigation bar or go to your customer dashboard to copy your email, password, and PIN.',
    keywords: ['credential', 'credentials', 'password', 'vault', 'login', 'account', 'email', 'pin', 'key'],
    order: 1,
    isActive: true,
  },
  {
    id: 'qm_bkash_nagad',
    label: '💳 bKash / Nagad Help',
    query: 'How do I complete payment using bKash, Nagad, or Rocket?',
    answer: '💳 Official Mobile Payment Numbers:\n• bKash: {BKASH_NUMBER}\n• Nagad: {NAGAD_NUMBER}\n\nSend the exact amount and submit your TrxID in the checkout popup for instant 2-minute verification!',
    keywords: ['bkash', 'nagad', 'rocket', 'upay', 'payment', 'pay', 'send money', 'trxid', 'transaction', 'cashout', 'send', 'number'],
    order: 2,
    isActive: true,
  },
  {
    id: 'qm_order_status',
    label: '⚡ Order Status',
    query: 'Can you help me check the status of my latest order?',
    answer: '📦 Latest Order: {ORDER_NUMBER}\n• Status: [{ORDER_STATUS}]\n• Items: {ORDER_ITEMS}\n• Total: {ORDER_TOTAL}\n• TrxID: {TRX_ID}\n\nInstant orders are delivered to your Vault within 30 seconds!',
    keywords: ['order', 'track', 'status', 'delivery', 'pending', 'deliver', 'when', 'delay', 'process'],
    order: 3,
    isActive: true,
  },
  {
    id: 'qm_warranty',
    label: '🛡️ Warranty Claim',
    query: 'How does the full replacement warranty work?',
    answer: '🛡️ All subscriptions include a 100% Full-Term Replacement Warranty. If any login experiences an interruption, our automated monitoring engine or 24/7 support ops resolves or replaces your slot immediately.',
    keywords: ['warranty', 'replacement', 'renew', 'not working', 'fix', 'broken', 'issue', 'expired', 'down', 'problem', 'screen limit'],
    order: 4,
    isActive: true,
  },
  {
    id: 'qm_direct_upgrade',
    label: '✨ Direct Email Upgrade',
    query: 'Can I upgrade my existing personal email account instead of getting a new one?',
    answer: '✨ Yes! For tiers marked as "Direct Upgrade" or "Custom Email", provide your email address in the checkout box, and we will apply the official premium subscription directly to your existing account without changing your password.',
    keywords: ['upgrade', 'my email', 'personal email', 'existing account', 'custom email', 'direct', 'own account', 'invite'],
    order: 5,
    isActive: true,
  },
];

interface AppContextType {
  products: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, selectedPlan: PlanPricing, customEmail?: string) => void;
  removeFromCart: (productId: string, duration: string) => void;
  updateCartItemQuantity: (productId: string, duration: string, quantity: number) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Checkout & Orders
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  processCheckout: (
    paymentMethod: PaymentMethod,
    customEmail?: string,
    paymentProof?: {
      senderNumber: string;
      transactionId: string;
      screenshotUrl?: string;
      paymentMethodName?: string;
      totalBdt?: number;
    }
  ) => Promise<Order>;
  orders: Order[];
  latestOrder: Order | null;
  setLatestOrder: (order: Order | null) => void;

  // Bangladesh Dynamic Payment Methods
  paymentMethods: BangladeshPaymentMethod[];
  adminCreatePaymentMethod: (pm: Omit<BangladeshPaymentMethod, 'id' | 'updatedAt'>) => Promise<string>;
  adminUpdatePaymentMethod: (id: string, updates: Partial<BangladeshPaymentMethod>) => Promise<void>;
  adminDeletePaymentMethod: (id: string) => Promise<void>;
  adminResetPaymentMethods: () => Promise<void>;

  // Subscriptions
  subscriptions: UserSubscription[];
  toggleAutoRenew: (subId: string) => void;
  extendSubscription: (subId: string, additionalDays: number) => void;
  activeVaultSub: UserSubscription | null;
  setActiveVaultSub: (sub: UserSubscription | null) => void;

  // Auth & User
  user: CustomerProfile;
  setUser: React.Dispatch<React.SetStateAction<CustomerProfile>>;
  updateUserProfile: (updates: Partial<CustomerProfile>) => Promise<void>;
  toggleUserRole: () => void;
  firebaseUser: FirebaseUser | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;

  // Admin Team Management
  adminList: AdminMember[];
  adminAddAdmin: (email: string, name?: string) => Promise<{ success: boolean; message: string }>;
  adminRemoveAdmin: (email: string) => Promise<{ success: boolean; message: string }>;

  // Admin: Product CRUD & Customization
  adminCreateProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  adminUpdateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  adminDeleteProduct: (id: string) => Promise<void>;
  adminToggleProductVisibility: (productId: string) => Promise<void>;
  adminReorderProduct: (productId: string, newOrderIndex: number) => Promise<void>;

  // Admin: Category Configuration & Sequencing
  categoryConfigs: CategoryConfig[];
  adminUpdateCategoryConfigs: (configs: CategoryConfig[]) => Promise<void>;
  adminToggleCategoryVisibility: (catId: SubscriptionCategory) => Promise<void>;
  adminReorderCategories: (newOrder: CategoryConfig[]) => Promise<void>;

  // Admin: Order management & Approval
  allOrders: Order[];
  adminUpdateOrderStatus: (orderId: string, paymentStatus: Order['paymentStatus'], deliveryStatus: Order['deliveryStatus']) => Promise<void>;
  adminApproveAndDeliverOrder: (
    orderId: string,
    perItemCreds: Array<{ email: string; password: string; pinCode?: string; profileName?: string; notes?: string }>
  ) => Promise<void>;
  adminVerifyPayment: (orderId: string) => Promise<void>;
  adminRejectOrder: (orderId: string, reason: string) => Promise<void>;

  // Admin: User management
  allUsers: CustomerProfile[];
  adminUpdateUserRole: (userId: string, role: 'customer' | 'admin') => Promise<void>;

  // Admin: Subscription management
  allSubscriptions: UserSubscription[];
  adminCreateSubscription: (sub: Omit<UserSubscription, 'id'>) => Promise<string>;
  adminUpdateSubscription: (id: string, updates: Partial<UserSubscription>) => Promise<void>;
  adminDeleteSubscription: (id: string) => Promise<void>;
  adminPurgeMockSubscriptions: () => Promise<void>;
  adminPurgeAllSubscriptions: () => Promise<void>;
  adminUpdateSubscriptionCredentials: (subId: string, credentials: Partial<UserSubscription['credentials']>) => Promise<void>;
  adminUpdateSubscriptionStatus: (subId: string, status: UserSubscription['status']) => Promise<void>;

  // Admin: Coupon CRUD
  coupons: Coupon[];
  adminCreateCoupon: (coupon: Coupon) => Promise<void>;
  adminDeleteCoupon: (code: string) => Promise<void>;

  // Admin: Support tickets
  allTickets: SupportTicket[];
  adminReplyToTicket: (ticketId: string, message: string, imageUrl?: string) => Promise<void>;
  adminCloseTicket: (ticketId: string) => Promise<void>;
  adminSendMessageToUser: (targetUserId: string, targetUserEmail: string, subject: string, content: string, category?: SupportTicket['category'], imageUrl?: string) => Promise<string>;

  // Analytics & Admin
  financialMetrics: FinancialMetric;
  emailNotifications: EmailNotification[];
  sendTestEmail: (recipient: string, templateType: EmailNotification['templateType']) => void;
  triggerRenewalCronSimulation: () => { renewedCount: number; notifiedCount: number; expiredCount: number };
  fastForwardSimulationDays: (days: number) => void;
  adminActivityLogs: AdminActivityLog[];
  logAdminActivity: (action: string, category: AdminActivityLog['category'], details: string, targetId?: string) => Promise<void>;
  brandSettings: BrandSettings;
  updateBrandSettings: (settings: Partial<BrandSettings>) => Promise<void>;

  // Currency Detection (admin-controlled, auto-applied per IP)
  currencySettings: CurrencySettings;
  updateCurrencySettings: (settings: Partial<CurrencySettings>) => Promise<void>;
  detectedCurrency: 'BDT' | 'USD';
  bdtRate: number;
  formatPrice: (amountUSD: number) => string;

  refreshAllData: () => Promise<void>;
  isSyncing: boolean;

  // User Support
  tickets: SupportTicket[];
  createSupportTicket: (subject: string, category: SupportTicket['category'], initialMessage: string, imageUrl?: string) => SupportTicket;
  replyToTicket: (ticketId: string, content: string, sender: 'user' | 'agent', imageUrl?: string) => void;

  // Reviews System
  reviews: Review[];
  addReview: (reviewData: Omit<Review, 'id' | 'createdAt' | 'likes' | 'likedBy'>) => Promise<string>;
  likeReview: (reviewId: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  adminCreateReview: (reviewData: Omit<Review, 'id' | 'createdAt' | 'likes' | 'likedBy'>) => Promise<void>;
  adminUpdateReview: (reviewId: string, updates: Partial<Review>) => Promise<void>;
  adminResetReviews: () => Promise<void>;
  isWriteReviewOpen: boolean;
  setIsWriteReviewOpen: (open: boolean) => void;
  targetReviewProduct: Product | null;
  setTargetReviewProduct: (p: Product | null) => void;

  // Hero Banner Dynamic Customization
  heroSlides: HeroSlide[];
  adminCreateHeroSlide: (slide: Omit<HeroSlide, 'id'>) => Promise<string>;
  adminUpdateHeroSlide: (id: string, updates: Partial<HeroSlide>) => Promise<void>;
  adminDeleteHeroSlide: (id: string) => Promise<void>;
  adminResetHeroSlides: () => Promise<void>;

  // Quick Messages & Bot Auto-Replies CRUD
  quickMessages: QuickMessage[];
  adminCreateQuickMessage: (qm: Omit<QuickMessage, 'id'>) => Promise<string>;
  adminUpdateQuickMessage: (id: string, updates: Partial<QuickMessage>) => Promise<void>;
  adminDeleteQuickMessage: (id: string) => Promise<void>;
  adminResetQuickMessages: () => Promise<void>;

  // Global UI
  activeSearchQuery: string;
  setActiveSearchQuery: (query: string) => void;
  activeCategoryFilter: string;
  setActiveCategoryFilter: (category: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [targetReviewProduct, setTargetReviewProduct] = useState<Product | null>(null);

  // Bangladesh Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<BangladeshPaymentMethod[]>(MOCK_PAYMENT_METHODS);

  // Hero Slides State
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(MOCK_HERO_SLIDES);

  // Quick Messages & Bot Auto-Replies State
  const [quickMessages, setQuickMessages] = useState<QuickMessage[]>(DEFAULT_QUICK_MESSAGES);

  // Auth & Roles
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminList, setAdminList] = useState<AdminMember[]>([]);

  // User data
  const [user, setUser] = useState<CustomerProfile>(INITIAL_USER_PROFILE);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [activeVaultSub, setActiveVaultSub] = useState<UserSubscription | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Admin data (all users' data)
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<CustomerProfile[]>([]);
  const [allSubscriptions, setAllSubscriptions] = useState<UserSubscription[]>([]);
  const [allTickets, setAllTickets] = useState<SupportTicket[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);
  const [adminActivityLogs, setAdminActivityLogs] = useState<AdminActivityLog[]>([]);
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    brandName: 'Keyoon',
    brandTagline: 'Premium Digital Subscriptions',
    faviconUrl: '/images/Fabicon.png',
    navbarLogoUrl: '/images/One_Row_logo.png',
  });

  // Currency detection state — fully automatic, no user controls
  const DEFAULT_CURRENCY_SETTINGS: CurrencySettings = {
    bdtEnabled: true,
    bdtCountries: ['BD'],
    bdtRate: 125,
  };
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(DEFAULT_CURRENCY_SETTINGS);
  const [detectedCurrency, setDetectedCurrency] = useState<'BDT' | 'USD'>('USD');

  const [isSyncing, setIsSyncing] = useState(false);

  const updateBrandSettings = async (updates: Partial<BrandSettings>) => {
    const nextSettings = { ...brandSettings, ...updates, updatedAt: new Date().toISOString() };
    setBrandSettings(nextSettings);

    try {
      await setDoc(doc(db, 'settings', 'brand'), nextSettings, { merge: true });
      await logAdminActivity('BRAND_SETTINGS_UPDATED', 'system', 'Updated brand logos, favicon icon, and navbar branding');
    } catch (err) {
      console.warn('[AppContext] Error updating brand settings in Firestore:', err);
    }
  };

  // Admin-callable function to update currency detection settings in Firestore
  const updateCurrencySettings = async (updates: Partial<CurrencySettings>) => {
    const nextSettings: CurrencySettings = {
      ...currencySettings,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: firebaseUser?.email || 'admin',
    };
    setCurrencySettings(nextSettings);
    try {
      await setDoc(doc(db, 'settings', 'currency'), nextSettings, { merge: true });
      await logAdminActivity('CURRENCY_SETTINGS_UPDATED', 'system', `BDT: ${nextSettings.bdtEnabled}, Rate: ${nextSettings.bdtRate}, Countries: ${nextSettings.bdtCountries.join(', ')}`);
    } catch (err) {
      console.warn('[AppContext] Error updating currency settings in Firestore:', err);
    }
  };

  // Category Configuration state (admin-controlled sequence & visibility)
  const [categoryConfigs, setCategoryConfigs] = useState<CategoryConfig[]>(DEFAULT_CATEGORY_CONFIGS);

  const adminUpdateCategoryConfigs = async (configs: CategoryConfig[]) => {
    setCategoryConfigs(configs);
    try {
      await setDoc(doc(db, 'settings', 'categories'), { categories: configs, updatedAt: new Date().toISOString() }, { merge: true });
      await logAdminActivity('CATEGORY_SETTINGS_UPDATED', 'catalog', 'Updated category sequence & visibility in storefront');
    } catch (err) {
      console.warn('[AppContext] Error saving category settings to Firestore:', err);
    }
  };

  const adminToggleCategoryVisibility = async (catId: SubscriptionCategory) => {
    const updated = categoryConfigs.map(c => c.id === catId ? { ...c, isHidden: !c.isHidden } : c);
    await adminUpdateCategoryConfigs(updated);
  };

  const adminReorderCategories = async (newOrder: CategoryConfig[]) => {
    const updated = newOrder.map((c, idx) => ({ ...c, orderIndex: idx }));
    await adminUpdateCategoryConfigs(updated);
  };

  const adminToggleProductVisibility = async (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const newHidden = !prod.isHidden;
    await adminUpdateProduct(productId, { isHidden: newHidden });
    await logAdminActivity(newHidden ? 'PRODUCT_HIDDEN' : 'PRODUCT_VISIBLE', 'catalog', `${newHidden ? 'Hidden' : 'Shown'} product: ${prod.name}`, productId);
  };

  const adminReorderProduct = async (productId: string, newOrderIndex: number) => {
    await adminUpdateProduct(productId, { orderIndex: newOrderIndex });
  };

  // Derived: the BDT exchange rate to use everywhere
  const bdtRate = currencySettings.bdtRate || 125;

  // formatPrice: takes an amount in BDT (Taka) and returns the correctly formatted string.
  // If the user is from Bangladesh (detectedCurrency === 'BDT'), displays directly in Bengali Taka (৳).
  // If the user is from another country (detectedCurrency === 'USD'), converts BDT to USD ($) using bdtRate.
  const formatPrice = useCallback((amount: number): string => {
    if (typeof amount !== 'number' || isNaN(amount)) return '৳0';

    // Backward-compatibility: if amount is less than 100 (legacy USD price), scale to BDT
    const amountBDT = amount < 100 ? amount * bdtRate : amount;

    if (detectedCurrency === 'BDT') {
      const inBdt = Math.round(amountBDT);
      return `৳${inBdt.toLocaleString('en-BD')}`;
    }

    const convertedUSD = amountBDT / bdtRate;
    return `$${convertedUSD.toFixed(2)}`;
  }, [detectedCurrency, bdtRate]);

  // Dynamically update browser tab favicon icon whenever brandSettings updates
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const faviconUrl = brandSettings?.faviconUrl || '/images/Fabicon.png';
    const iconLinks = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");

    if (iconLinks.length > 0) {
      iconLinks.forEach(link => {
        link.href = faviconUrl;
      });
    } else {
      const link = document.createElement('link');
      link.rel = 'shortcut icon';
      link.type = 'image/png';
      link.href = faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [brandSettings?.faviconUrl]);

  // Helper to record admin activity log to Firestore
  const logAdminActivity = async (
    action: string,
    category: AdminActivityLog['category'],
    details: string,
    targetId?: string
  ) => {
    const logId = generateRandomId('log');
    const newLog: AdminActivityLog = {
      id: logId,
      adminEmail: firebaseUser?.email || 'admin@subnexus.com',
      adminName: user?.name || 'Admin Officer',
      action,
      category,
      details,
      targetId,
      timestamp: new Date().toISOString(),
    };

    setAdminActivityLogs(prev => [newLog, ...prev]);

    try {
      await setDoc(doc(db, 'admin_activity_logs', logId), newLog);
    } catch (err) {
      console.warn('[AppContext] Failed to write admin activity log to Firestore:', err);
    }
  };

  // Analytics
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetric>(INITIAL_FINANCIAL_METRICS);
  const [emailNotifications, setEmailNotifications] = useState<EmailNotification[]>([]);

  // Global UI
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  // Active unsubs ref to clean up on unmount or user change
  const unsubscribersRef = useRef<(() => void)[]>([]);
  // Separate ref for admin-wide global listeners (never cleared on user sub updates)
  const adminUnsubscribersRef = useRef<(() => void)[]>([]);

  // ─── Analytics init ────────────────────────────────────────────────
  useEffect(() => { initAnalytics(); }, []);

  // ─── Handle Google redirect sign-in result ─────────────────────────
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          // User just came back from Google redirect — onAuthStateChanged will
          // fire and set the user automatically, nothing else needed here.
          console.log('[Auth] Redirect sign-in successful:', result.user.email);
        }
      })
      .catch((err) => {
        // Ignore errors silently (e.g. no redirect was in progress)
        if (err?.code !== 'auth/no-auth-event') {
          console.warn('[Auth] getRedirectResult error:', err?.code);
        }
      });
  }, []);

  // ─── Auto-seed Firestore if empty on startup ──────────────────────
  const seedFirestoreIfEmpty = useCallback(async () => {
    try {
      // 1. Seed products if empty
      const prodSnap = await getDocs(collection(db, 'products'));
      if (prodSnap.empty) {
        console.log('[Firestore] Seeding initial products...');
        const batch = writeBatch(db);
        for (const prod of MOCK_PRODUCTS) {
          const docRef = doc(db, 'products', prod.id);
          batch.set(docRef, prod);
        }
        await batch.commit();
      } else {
        for (const docSnap of prodSnap.docs) {
          const fallback = MOCK_PRODUCTS.find(p => p.id === docSnap.id);
          if (fallback?.images) {
            setDoc(doc(db, 'products', docSnap.id), { images: fallback.images }, { merge: true }).catch(() => {});
          }
        }
      }

      // 2. Seed coupons if empty
      const couponSnap = await getDocs(collection(db, 'coupons'));
      if (couponSnap.empty) {
        console.log('[Firestore] Seeding initial coupons...');
        const batch = writeBatch(db);
        for (const c of MOCK_COUPONS) {
          const docRef = doc(db, 'coupons', c.code);
          batch.set(docRef, c);
        }
        await batch.commit();
      }

      // 3. Seed reviews if empty
      const reviewSnap = await getDocs(collection(db, 'reviews'));
      if (reviewSnap.empty) {
        console.log('[Firestore] Seeding initial customer reviews...');
        const batch = writeBatch(db);
        for (const rev of MOCK_REVIEWS) {
          const docRef = doc(db, 'reviews', rev.id);
          batch.set(docRef, rev);
        }
        await batch.commit();
      }

      // 4. Seed Bangladesh payment methods if empty
      const pmSnap = await getDocs(collection(db, 'payment_methods'));
      if (pmSnap.empty) {
        console.log('[Firestore] Seeding initial Bangladesh payment methods...');
        const batch = writeBatch(db);
        for (const pm of MOCK_PAYMENT_METHODS) {
          const docRef = doc(db, 'payment_methods', pm.id);
          batch.set(docRef, pm);
        }
        await batch.commit();
      }

      // 5. Seed Hero Slides if empty
      const heroSnap = await getDocs(collection(db, 'hero_slides'));
      if (heroSnap.empty) {
        console.log('[Firestore] Seeding initial hero slides...');
        const batch = writeBatch(db);
        for (const s of MOCK_HERO_SLIDES) {
          const docRef = doc(db, 'hero_slides', s.id);
          batch.set(docRef, s);
        }
        await batch.commit();
      }

      // 6. Seed Quick Messages if empty
      const qmSnap = await getDocs(collection(db, 'quick_messages'));
      if (qmSnap.empty) {
        console.log('[Firestore] Seeding initial quick messages...');
        const batch = writeBatch(db);
        for (const qm of DEFAULT_QUICK_MESSAGES) {
          const docRef = doc(db, 'quick_messages', qm.id);
          batch.set(docRef, qm);
        }
        await batch.commit();
      }

      // 6. Ensure superadmin doc exists in admins collection
      const superAdminRef = doc(db, 'admins', SUPERADMIN_EMAIL.toLowerCase().replace(/[^a-z0-9]/g, '_'));
      const superAdminSnap = await getDoc(superAdminRef);
      if (!superAdminSnap.exists()) {
        await setDoc(superAdminRef, {
          id: superAdminRef.id,
          email: SUPERADMIN_EMAIL.toLowerCase(),
          name: 'Owner (Superadmin)',
          role: 'superadmin',
          addedBy: 'System',
          addedAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      if (err?.code !== 'permission-denied') {
        console.info('[Firestore] Seed check note:', err?.message || err);
      }
    }
  }, []);

  // ─── Global Real-time Listeners (Products & Coupons & Reviews & Payment Methods & Admin List) ─
  useEffect(() => {
    seedFirestoreIfEmpty();

    // 1. Real-time products listener (available to all users)
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (!snapshot.empty) {
        const prods = snapshot.docs.map(d => {
          const data = d.data() as Product;
          const fallback = MOCK_PRODUCTS.find(p => p.id === d.id || p.slug === data.slug);
          const gallery = (data.images && data.images.length > 0)
            ? data.images
            : (fallback?.images && fallback.images.length > 0)
              ? fallback.images
              : [data.logo || fallback?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'];

          return {
            ...fallback,
            ...data,
            id: d.id,
            images: gallery,
            features: (data.features && data.features.length > 0) ? data.features : (fallback?.features || ['Full access included', 'Fast reliable delivery', 'Replacement warranty']),
            instructions: (data.instructions && data.instructions.length > 0) ? data.instructions : (fallback?.instructions || ['Log in with credentials from your Vault.', 'Start using the premium service immediately.']),
            specs: {
              screens: data.specs?.screens ?? fallback?.specs?.screens ?? 1,
              quality: data.specs?.quality || fallback?.specs?.quality || 'Ultra High Definition',
              warranty: data.specs?.warranty || fallback?.specs?.warranty || 'Full Period Replacement Warranty',
              platforms: (data.specs?.platforms && data.specs.platforms.length > 0) ? data.specs.platforms : (fallback?.specs?.platforms || ['Web', 'iOS', 'Android', 'macOS', 'Windows']),
              region: data.specs?.region || fallback?.specs?.region || 'Global / Region-free',
            },
          } as Product;
        });
        setProducts(prods);
      }
    }, (err) => {
      if (err?.code !== 'permission-denied') {
        console.warn('[Firestore] Products listener error:', err);
      }
    });

    // 2. Real-time coupons listener (available to all users)
    const unsubCoupons = onSnapshot(collection(db, 'coupons'), (snapshot) => {
      if (!snapshot.empty) {
        const cps = snapshot.docs.map(d => d.data() as Coupon);
        setCoupons(cps);
      }
    }, (err) => {
      if (err?.code !== 'permission-denied') {
        console.warn('[Firestore] Coupons listener error:', err);
      }
    });

    // 3. Real-time customer reviews listener (available to all users)
    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      if (!snapshot.empty) {
        const revs = snapshot.docs.map(d => ({
          ...d.data(),
          id: d.id,
        } as Review));
        revs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReviews(revs);
      }
    }, (err) => {
      if (err?.code !== 'permission-denied') {
        console.warn('[Firestore] Reviews listener error:', err);
      }
    });

    // 4. Real-time Bangladesh payment methods listener (available to all users)
    const unsubPaymentMethods = onSnapshot(collection(db, 'payment_methods'), (snapshot) => {
      if (!snapshot.empty) {
        const pms = snapshot.docs.map(d => ({
          ...d.data(),
          id: d.id,
        } as BangladeshPaymentMethod));
        setPaymentMethods(pms);
      }
    }, (err) => {
      if (err?.code !== 'permission-denied') {
        console.warn('[Firestore] Payment methods listener error:', err);
      }
    });

    // 5. Real-time admin list listener (only if authenticated/permitted)
    const unsubAdmins = onSnapshot(collection(db, 'admins'), (snapshot) => {
      if (!snapshot.empty) {
        const admins = snapshot.docs.map(d => d.data() as AdminMember);
        setAdminList(admins);
      } else {
        setAdminList([{
          id: 'superadmin',
          email: SUPERADMIN_EMAIL,
          name: 'Owner',
          role: 'superadmin',
          addedBy: 'System',
          addedAt: new Date().toISOString(),
        }]);
      }
    }, (_err) => {
      setAdminList([{
        id: 'superadmin',
        email: SUPERADMIN_EMAIL,
        name: 'Owner',
        role: 'superadmin',
        addedBy: 'System',
        addedAt: new Date().toISOString(),
      }]);
    });

    // 6. Real-time Hero Slides listener (available to all users)
    const unsubHeroSlides = onSnapshot(collection(db, 'hero_slides'), (snapshot) => {
      if (!snapshot.empty) {
        const slides = snapshot.docs.map(d => ({
          ...d.data(),
          id: d.id,
        } as HeroSlide));
        slides.sort((a, b) => (a.order || 0) - (b.order || 0));
        setHeroSlides(slides);
      } else {
        setHeroSlides(MOCK_HERO_SLIDES);
      }
    }, (err) => {
      if (err?.code !== 'permission-denied') {
        console.warn('[Firestore] Hero slides listener error:', err);
      }
      setHeroSlides(MOCK_HERO_SLIDES);
    });

    // 7. Real-time Quick Messages listener (available to all visitors/users)
    const unsubQuickMessages = onSnapshot(collection(db, 'quick_messages'), (snapshot) => {
      if (!snapshot.empty) {
        const qms = snapshot.docs.map(d => ({
          ...d.data(),
          id: d.id,
        } as QuickMessage));
        qms.sort((a, b) => (a.order || 0) - (b.order || 0));
        setQuickMessages(qms);
      } else {
        setQuickMessages(DEFAULT_QUICK_MESSAGES);
      }
    }, (err) => {
      if (err?.code !== 'permission-denied') {
        console.warn('[Firestore] Quick messages listener error:', err);
      }
      setQuickMessages(DEFAULT_QUICK_MESSAGES);
    });

    // 8. Real-time Brand Settings & Favicon listener
    const unsubBrandSettings = onSnapshot(doc(db, 'settings', 'brand'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as BrandSettings;
        const validFavicon = (data.faviconUrl && !data.faviconUrl.startsWith('data:image/jpeg')) ? data.faviconUrl : '/images/Fabicon.png';
        const validNavbarLogo = (data.navbarLogoUrl && !data.navbarLogoUrl.startsWith('data:image/jpeg')) ? data.navbarLogoUrl : '/images/One_Row_logo.png';

        setBrandSettings({
          brandName: data.brandName || 'Keyoon',
          brandTagline: data.brandTagline || 'Premium Digital Subscriptions',
          faviconUrl: validFavicon,
          navbarLogoUrl: validNavbarLogo,
          updatedAt: data.updatedAt,
        });
      }
    });

    // 9. Real-time Currency Settings listener (admin-controlled)
    const unsubCurrencySettings = onSnapshot(doc(db, 'settings', 'currency'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as CurrencySettings;
        setCurrencySettings({
          bdtEnabled: data.bdtEnabled ?? true,
          bdtCountries: Array.isArray(data.bdtCountries) && data.bdtCountries.length > 0
            ? data.bdtCountries.map((c: string) => c.toUpperCase().trim())
            : ['BD'],
          bdtRate: typeof data.bdtRate === 'number' && data.bdtRate > 0 ? data.bdtRate : 125,
          updatedAt: data.updatedAt,
          updatedBy: data.updatedBy,
        });
      }
      // If doc doesn't exist yet, keep the default state
    }, (err) => {
      if (err?.code !== 'permission-denied') {
        console.warn('[AppContext] Currency settings listener error:', err);
      }
    });

    // 10. Real-time Category Configuration listener (admin-controlled sequence & visibility)
    const unsubCategorySettings = onSnapshot(doc(db, 'settings', 'categories'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.categories) && data.categories.length > 0) {
          const loaded: CategoryConfig[] = data.categories;
          const merged = DEFAULT_CATEGORY_CONFIGS.map(def => {
            const found = loaded.find(l => l.id === def.id);
            return found ? { ...def, ...found } : def;
          });
          merged.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
          setCategoryConfigs(merged);
        } else {
          setCategoryConfigs(DEFAULT_CATEGORY_CONFIGS);
        }
      } else {
        setCategoryConfigs(DEFAULT_CATEGORY_CONFIGS);
      }
    }, (err) => {
      if (err?.code !== 'permission-denied') {
        console.warn('[AppContext] Category settings listener error:', err);
      }
      setCategoryConfigs(DEFAULT_CATEGORY_CONFIGS);
    });

    return () => {
      unsubProducts();
      unsubCoupons();
      unsubReviews();
      unsubPaymentMethods();
      unsubAdmins();
      unsubHeroSlides();
      unsubQuickMessages();
      unsubBrandSettings();
      unsubCurrencySettings();
      unsubCategorySettings();
    };
  }, [seedFirestoreIfEmpty]);

  // ─── IP-based currency detection on mount (runs once per session) ────
  useEffect(() => {
    let cancelled = false;
    detectVisitorCountry().then((country) => {
      if (cancelled) return;
      // We derive the currency from the latest currencySettings
      // but we must use a functional update to read the latest state
      setCurrencySettings((prev) => {
        if (!prev.bdtEnabled) {
          setDetectedCurrency('USD');
          return prev;
        }
        const isBDT = country ? prev.bdtCountries.includes(country.toUpperCase()) : false;
        setDetectedCurrency(isBDT ? 'BDT' : 'USD');
        return prev;
      });
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally runs once on mount

  // Re-evaluate currency whenever currencySettings changes (e.g. admin toggles BDT)
  useEffect(() => {
    if (!currencySettings.bdtEnabled) {
      setDetectedCurrency('USD');
      return;
    }
    // Re-read cached country to re-apply settings without another API call
    try {
      const cached = sessionStorage.getItem('subnexus_detected_country');
      if (cached) {
        const isBDT = currencySettings.bdtCountries.includes(cached.toUpperCase());
        setDetectedCurrency(isBDT ? 'BDT' : 'USD');
      }
    } catch {
      // sessionStorage not available
    }
  }, [currencySettings]);

  // ─── Real-time Admin Data Listeners ─────────────────────────────────
  const setupAdminRealtimeListeners = useCallback(() => {
    // Clear ONLY previous admin-wide listeners (never touch user-specific ones)
    adminUnsubscribersRef.current.forEach(u => u());
    adminUnsubscribersRef.current = [];

    // All orders listener
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const ords = snapshot.docs.map(d => d.data() as Order).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAllOrders(ords);

      // Recompute financial metrics live
      const totalRev = ords.reduce((acc, o) => acc + (o.total || 0), 0);
      const todayStr = new Date().toDateString();
      const todayRev = ords
        .filter(o => new Date(o.createdAt).toDateString() === todayStr)
        .reduce((acc, o) => acc + (o.total || 0), 0);

      setFinancialMetrics(prev => ({
        ...prev,
        mrr: totalRev,
        arr: totalRev * 12,
        netRevenueToday: todayRev,
        activeSubscribers: ords.length,
        averageOrderValue: ords.length > 0 ? totalRev / ords.length : 0,
      }));
    });
    adminUnsubscribersRef.current.push(unsubOrders);

    // All users listener
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usrs = snapshot.docs.map(d => d.data() as CustomerProfile);
      setAllUsers(usrs);
    });
    adminUnsubscribersRef.current.push(unsubUsers);

    // All subscriptions listener
    const unsubSubs = onSnapshot(collection(db, 'subscriptions'), (snapshot) => {
      const sbs = snapshot.docs.map(d => d.data() as UserSubscription);
      setAllSubscriptions(sbs);
    });
    adminUnsubscribersRef.current.push(unsubSubs);

    // All support tickets listener
    const unsubTickets = onSnapshot(collection(db, 'support_tickets'), (snapshot) => {
      const tkts = snapshot.docs.map(d => d.data() as SupportTicket).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAllTickets(tkts);
    });
    adminUnsubscribersRef.current.push(unsubTickets);

    // All admin activity logs listener
    const unsubActivityLogs = onSnapshot(collection(db, 'admin_activity_logs'), (snapshot) => {
      const logs = snapshot.docs.map(d => d.data() as AdminActivityLog).sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setAdminActivityLogs(logs);
    });
    adminUnsubscribersRef.current.push(unsubActivityLogs);
  }, []);

  // ─── Auth state listener & User-specific live listeners ─────────────
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        const userEmailLower = (fbUser.email || '').toLowerCase().trim();
        const isSuper = userEmailLower === SUPERADMIN_EMAIL.toLowerCase();
        setIsSuperAdmin(isSuper);

        // Check if user is an admin in the adminList or has admin role in Firestore
        let isUserAdmin = isSuper;
        try {
          const adminDocId = userEmailLower.replace(/[^a-z0-9]/g, '_');
          const adminDocSnap = await getDoc(doc(db, 'admins', adminDocId));
          if (adminDocSnap.exists()) {
            isUserAdmin = true;
          }
        } catch { }

        setIsAdmin(isUserAdmin);

        // Base user profile
        const profile: CustomerProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || userEmailLower.split('@')[0] || 'User',
          email: fbUser.email || '',
          avatar: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'User')}&background=6366f1&color=fff&size=200`,
          role: isUserAdmin ? 'admin' : 'customer',
          joinedDate: new Date().toISOString().split('T')[0],
          lifetimeSpend: 0,
          activeSubscriptionsCount: 0,
          preferredCurrency: 'USD',
          emailAlertsEnabled: true,
          autoRenewEnabled: true,
        };

        // Sync user in Firestore
        try {
          const userRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data() as CustomerProfile;
            const updatedRole = isUserAdmin ? 'admin' : (data.role || 'customer');
            setUser({ ...profile, ...data, role: updatedRole });
            if (data.role !== updatedRole) {
              await updateDoc(userRef, { role: updatedRole });
            }
          } else {
            await setDoc(userRef, profile);
            setUser(profile);
          }
        } catch {
          setUser(profile);
        }

        // Live User Orders Listener (matches UID and Email)
        let uidOrders: Order[] = [];
        let emailOrders: Order[] = [];

        const updateCombinedOrders = () => {
          const map = new Map<string, Order>();
          uidOrders.forEach(o => map.set(o.id, o));
          emailOrders.forEach(o => map.set(o.id, o));
          const list = Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrders(list);
        };

        const unsubUserOrdersUid = onSnapshot(
          query(collection(db, 'orders'), where('userId', '==', fbUser.uid)),
          (snapshot) => {
            uidOrders = snapshot.docs.map(d => d.data() as Order);
            updateCombinedOrders();
          }
        );

        let unsubUserOrdersEmail = () => {};
        if (fbUser.email) {
          unsubUserOrdersEmail = onSnapshot(
            query(collection(db, 'orders'), where('userEmail', '==', fbUser.email)),
            (snapshot) => {
              emailOrders = snapshot.docs.map(d => d.data() as Order);
              updateCombinedOrders();
            }
          );
        }

        // Live User Subscriptions Listener (matches UID and Email)
        let uidSubs: UserSubscription[] = [];
        let emailSubs: UserSubscription[] = [];

        const updateCombinedSubs = () => {
          const map = new Map<string, UserSubscription>();
          uidSubs.forEach(s => map.set(s.id, s));
          emailSubs.forEach(s => map.set(s.id, s));
          const list = Array.from(map.values());
          setSubscriptions(list);
        };

        const unsubUserSubsUid = onSnapshot(
          query(collection(db, 'subscriptions'), where('userId', '==', fbUser.uid)),
          (snapshot) => {
            uidSubs = snapshot.docs.map(d => d.data() as UserSubscription);
            updateCombinedSubs();
          }
        );

        let unsubUserSubsEmail = () => {};
        if (fbUser.email) {
          const cleanEmail = fbUser.email.toLowerCase().trim();
          const emailVariants = Array.from(new Set([fbUser.email, cleanEmail])).filter(Boolean);
          unsubUserSubsEmail = onSnapshot(
            query(collection(db, 'subscriptions'), where('userEmail', 'in', emailVariants)),
            (snapshot) => {
              emailSubs = snapshot.docs.map(d => d.data() as UserSubscription);
              updateCombinedSubs();
            }
          );
        }

        // Live User Tickets Listener (matches UID and Email)
        let uidTickets: SupportTicket[] = [];
        let emailTickets: SupportTicket[] = [];

        const updateCombinedTickets = () => {
          const map = new Map<string, SupportTicket>();
          uidTickets.forEach(t => map.set(t.id, t));
          emailTickets.forEach(t => map.set(t.id, t));
          const list = Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setTickets(list);
        };

        const unsubUserTicketsUid = onSnapshot(
          query(collection(db, 'support_tickets'), where('userId', '==', fbUser.uid)),
          (snapshot) => {
            uidTickets = snapshot.docs.map(d => d.data() as SupportTicket);
            updateCombinedTickets();
          }
        );

        let unsubUserTicketsEmail = () => {};
        if (fbUser.email) {
          unsubUserTicketsEmail = onSnapshot(
            query(collection(db, 'support_tickets'), where('userEmail', '==', fbUser.email)),
            (snapshot) => {
              emailTickets = snapshot.docs.map(d => d.data() as SupportTicket);
              updateCombinedTickets();
            }
          );
        }

        unsubscribersRef.current.push(
          unsubUserOrdersUid,
          unsubUserOrdersEmail,
          unsubUserSubsUid,
          unsubUserSubsEmail,
          unsubUserTicketsUid,
          unsubUserTicketsEmail
        );

        // If admin or superadmin, activate full real-time database listeners
        if (isUserAdmin) {
          setupAdminRealtimeListeners();
        }

        setIsAuthModalOpen(false);
      } else {
        // Signed out — clear everything
        setIsSuperAdmin(false);
        setIsAdmin(false);
        setUser(INITIAL_USER_PROFILE);
        setOrders([]);
        setSubscriptions([]);
        setTickets([]);
        setAllOrders([]);
        setAllUsers([]);
        setAllSubscriptions([]);
        setAllTickets([]);

        // Clean up user-specific listeners
        unsubscribersRef.current.forEach(u => u());
        unsubscribersRef.current = [];
        // Clean up admin-wide listeners
        adminUnsubscribersRef.current.forEach(u => u());
        adminUnsubscribersRef.current = [];
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribersRef.current.forEach(u => u());
      adminUnsubscribersRef.current.forEach(u => u());
      unsubscribersRef.current = [];
    };
  }, [setupAdminRealtimeListeners]);

  // ─── Reactive Sync for Logged-In User Data ────────────────────────
  useEffect(() => {
    if (!firebaseUser?.email) return;
    const myEmail = (firebaseUser.email || '').toLowerCase().trim();
    const myUid = firebaseUser.uid;

    if (allOrders.length > 0) {
      const myOrders = allOrders.filter(o =>
        (o.userId && (o.userId === myUid || o.userId === user.id)) ||
        (o.userEmail && o.userEmail.toLowerCase() === myEmail)
      );
      if (myOrders.length > 0) {
        setOrders(myOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    }

    if (allSubscriptions.length > 0) {
      const mySubs = allSubscriptions.filter(s =>
        (s.userId && (s.userId === myUid || s.userId === user.id)) ||
        (s.userEmail && s.userEmail.toLowerCase() === myEmail)
      );
      if (mySubs.length > 0) {
        setSubscriptions(mySubs);
      }
    }

    if (allTickets.length > 0) {
      const myTkts = allTickets.filter(t =>
        (t.userId && (t.userId === myUid || t.userId === user.id)) ||
        (t.userEmail && t.userEmail.toLowerCase() === myEmail)
      );
      if (myTkts.length > 0) {
        setTickets(myTkts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    }
  }, [allOrders, allSubscriptions, allTickets, firebaseUser?.email, firebaseUser?.uid, user.id]);

  // ─── Manual Refresh All Data ──────────────────────────────────────
  const refreshAllData = useCallback(async () => {
    setIsSyncing(true);
    try {
      // Refresh products
      const pSnap = await getDocs(collection(db, 'products'));
      if (!pSnap.empty) {
        setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
      }

      // Refresh coupons
      const cSnap = await getDocs(collection(db, 'coupons'));
      if (!cSnap.empty) {
        setCoupons(cSnap.docs.map(d => d.data() as Coupon));
      }

      // Refresh logged-in user specific data (Orders, Subscriptions Vault, Tickets)
      if (firebaseUser?.uid) {
        const myUid = firebaseUser.uid;
        const myEmail = (firebaseUser.email || '').toLowerCase().trim();

        // 1. Fetch user orders
        const [ordUidSnap, ordEmailSnap] = await Promise.all([
          getDocs(query(collection(db, 'orders'), where('userId', '==', myUid))),
          myEmail ? getDocs(query(collection(db, 'orders'), where('userEmail', '==', myEmail))) : Promise.resolve({ docs: [] }),
        ]);

        const ordsMap = new Map<string, Order>();
        ordUidSnap.docs.forEach(d => ordsMap.set(d.id, d.data() as Order));
        ordEmailSnap.docs.forEach(d => ordsMap.set(d.id, d.data() as Order));
        const userOrds = Array.from(ordsMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(userOrds);

        // 2. Fetch user subscriptions & vault credentials directly from actual Firestore
        const [subUidSnap, subEmailSnap] = await Promise.all([
          getDocs(query(collection(db, 'subscriptions'), where('userId', '==', myUid))),
          myEmail ? getDocs(query(collection(db, 'subscriptions'), where('userEmail', 'in', Array.from(new Set([firebaseUser.email, myEmail])).filter(Boolean)))) : Promise.resolve({ docs: [] }),
        ]);

        const subsMap = new Map<string, UserSubscription>();
        subUidSnap.docs.forEach(d => subsMap.set(d.id, d.data() as UserSubscription));
        subEmailSnap.docs.forEach(d => subsMap.set(d.id, d.data() as UserSubscription));
        const userSubs = Array.from(subsMap.values());
        // Always set user subscriptions regardless of admin role
        setSubscriptions(userSubs);
      }

      // If admin, refresh all collections
      if (isAdmin || isSuperAdmin) {
        const [ordSnap, usrSnap, subSnap, tktSnap] = await Promise.all([
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'subscriptions')),
          getDocs(collection(db, 'support_tickets')),
        ]);

        const ords = ordSnap.docs.map(d => d.data() as Order).sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAllOrders(ords);
        setAllUsers(usrSnap.docs.map(d => d.data() as CustomerProfile));
        const allSubsList = subSnap.docs.map(d => d.data() as UserSubscription);
        setAllSubscriptions(allSubsList);

        if (firebaseUser?.email) {
          const myEmail = (firebaseUser.email || '').toLowerCase().trim();
          const myUid = firebaseUser.uid || '';
          const myAdminSubs = allSubsList.filter(s =>
            (s.userId && (s.userId === myUid || s.userId === user.id)) ||
            (s.userEmail && s.userEmail.toLowerCase().trim() === myEmail)
          );
          // Always update user-facing subscriptions for admin panel owner too
          setSubscriptions(myAdminSubs);
        }
        setAllTickets(tktSnap.docs.map(d => d.data() as SupportTicket).sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));

        const totalRev = ords.reduce((acc, o) => acc + (o.total || 0), 0);
        setFinancialMetrics(prev => ({
          ...prev,
          mrr: totalRev,
          arr: totalRev * 12,
          activeSubscribers: ords.length,
        }));
      }
    } catch (err) {
      console.error('[AppContext] Manual sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isAdmin, isSuperAdmin, firebaseUser?.email, firebaseUser?.uid]);

  // ─── Cart persistence ──────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem('keyoon_cart') || localStorage.getItem('subnexus_cart');
      if (saved) setCart(JSON.parse(saved));
    } catch { }
  }, []);
  useEffect(() => {
    try { localStorage.setItem('keyoon_cart', JSON.stringify(cart)); } catch { }
  }, [cart]);

  // Helper: check if a cart item is eligible for a given coupon
  const isItemEligibleForCoupon = useCallback((item: CartItem, coupon: Coupon): boolean => {
    // Check specific product ID restriction
    if (coupon.applicableProductIds && coupon.applicableProductIds.length > 0) {
      if (!coupon.applicableProductIds.includes(item.product.id)) return false;
    }
    // Check category restriction
    if (coupon.applicableCategory && coupon.applicableCategory !== 'all') {
      if (item.product.category !== coupon.applicableCategory) return false;
    }
    return true;
  }, []);

  // Subtotal of only items in cart eligible for the applied coupon
  const eligibleSubtotal = useMemo(() => {
    if (!appliedCoupon) return 0;
    return cart.reduce((acc, item) => {
      if (isItemEligibleForCoupon(item, appliedCoupon)) {
        return acc + (item.selectedPlan.price * item.quantity);
      }
      return acc;
    }, 0);
  }, [cart, appliedCoupon, isItemEligibleForCoupon]);

  const cartSubtotal = cart.reduce((acc, i) => acc + i.selectedPlan.price * i.quantity, 0);
  const cartDiscount = appliedCoupon ? (eligibleSubtotal * appliedCoupon.discountPercent) / 100 : 0;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount);

  // ─── Cart actions ──────────────────────────────────────────────────
  const addToCart = (product: Product, selectedPlan: PlanPricing, customEmail?: string) => {
    if ((product.stockCount ?? 0) <= 0) {
      return; // Do not allow adding out-of-stock products
    }
    setCart(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id && i.selectedPlan.duration === selectedPlan.duration);
      if (idx > -1) {
        const updated = [...prev];
        const currentQty = updated[idx].quantity;
        // Cap quantity at product.stockCount
        if (currentQty < product.stockCount) {
          updated[idx].quantity += 1;
        }
        return updated;
      }
      return [...prev, { product, selectedPlan, quantity: 1, customEmail }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, duration: string) =>
    setCart(prev => prev.filter(i => !(i.product.id === productId && i.selectedPlan.duration === duration)));

  const updateCartItemQuantity = (productId: string, duration: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId, duration); return; }
    setCart(prev => prev.map(i =>
      i.product.id === productId && i.selectedPlan.duration === duration ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => { setCart([]); setAppliedCoupon(null); };

  // Auto-invalidate applied coupon if cart no longer contains any eligible items
  useEffect(() => {
    if (appliedCoupon) {
      const hasEligible = cart.some(item => isItemEligibleForCoupon(item, appliedCoupon));
      if (!hasEligible) {
        setAppliedCoupon(null);
      }
    }
  }, [cart, appliedCoupon, isItemEligibleForCoupon]);

  const applyCoupon = (code: string) => {
    const found = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!found) return { success: false, message: 'Invalid promo code.' };

    // 1. Expiry Check
    if (found.expiryDate) {
      const expTime = new Date(found.expiryDate).getTime();
      // Set to end of expiry day
      if (!isNaN(expTime) && (expTime + 86400000) < Date.now()) {
        return { success: false, message: 'This promo code has expired.' };
      }
    }

    // 2. Maximum Redemptions Check
    if (typeof found.maxUses === 'number' && (found.usedCount || 0) >= found.maxUses) {
      return { success: false, message: 'This promo code has reached its maximum redemption limit.' };
    }

    // 3. Minimum Order Amount Check
    if (found.minOrderAmount && cartSubtotal < found.minOrderAmount) {
      return { success: false, message: `Minimum order amount of $${found.minOrderAmount} is required for this code.` };
    }

    // 4. Product / Category Eligibility Check
    const hasEligibleItems = cart.some(item => isItemEligibleForCoupon(item, found));
    if (!hasEligibleItems) {
      if (found.applicableProductIds && found.applicableProductIds.length > 0) {
        return { success: false, message: 'This promo code is only valid for specific products not currently in your cart.' };
      }
      if (found.applicableCategory && found.applicableCategory !== 'all') {
        return { success: false, message: `This promo code is only valid for ${found.applicableCategory.toUpperCase()} category items.` };
      }
    }

    setAppliedCoupon(found);
    return { success: true, message: `${found.discountPercent}% discount applied to eligible items!` };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  // ─── Checkout ──────────────────────────────────────────────────────
  const processCheckout = async (
    paymentMethod: PaymentMethod,
    customEmail?: string,
    paymentProof?: {
      senderNumber: string;
      transactionId: string;
      screenshotUrl?: string;
      paymentMethodName?: string;
      totalBdt?: number;
    }
  ): Promise<Order> => {
    if (cart.length === 0) {
      throw new Error('Your cart is empty. Please add items to checkout.');
    }

    if (paymentProof?.transactionId) {
      const cleanTrx = paymentProof.transactionId.trim().toUpperCase();
      
      // Check local state first (user orders & admin allOrders)
      const localDuplicate =
        orders.some(o => o.transactionId && o.transactionId.trim().toUpperCase() === cleanTrx && o.paymentStatus !== 'failed') ||
        allOrders.some(o => o.transactionId && o.transactionId.trim().toUpperCase() === cleanTrx && o.paymentStatus !== 'failed');

      if (localDuplicate) {
        throw new Error(`Transaction ID "${cleanTrx}" has already been submitted for a previous order.`);
      }

      // Query Firestore database to ensure system-wide duplicate TrxID detection
      try {
        const trxQuery = query(collection(db, 'orders'), where('transactionId', '==', cleanTrx));
        const trxSnap = await getDocs(trxQuery);
        const hasExisting = trxSnap.docs.some(d => (d.data() as Order).paymentStatus !== 'failed');
        if (hasExisting) {
          throw new Error(`Transaction ID "${cleanTrx}" has already been submitted for a previous order.`);
        }
      } catch (err: any) {
        if (err?.message?.includes('already been submitted')) {
          throw err;
        }
        console.warn('[Firestore] Transaction ID verification check note:', err);
      }
    }

    const orderId = generateRandomId('ord');
    const orderNum = generateOrderNumber();
    const isBangladesh = ['bkash', 'nagad', 'rocket', 'upay', 'custom'].includes(paymentMethod);

    const currentUid = firebaseUser ? firebaseUser.uid : user.id;
    const currentEmail = (customEmail || (firebaseUser ? firebaseUser.email : user.email) || user.email || '').toLowerCase().trim();

    const newOrder: Order = {
      id: orderId,
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
      userId: currentUid,
      userEmail: currentEmail,
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productLogo: item.product.logo,
        duration: item.selectedPlan.duration,
        durationLabel: item.selectedPlan.label,
        price: item.selectedPlan.price,
        quantity: item.quantity,
      })),
      subtotal: cartSubtotal,
      discount: cartDiscount,
      couponCode: appliedCoupon?.code,
      couponDiscount: cartDiscount,
      total: cartTotal,
      totalBdt: paymentProof?.totalBdt || (cartTotal * 125),
      paymentMethod,
      paymentMethodName: paymentProof?.paymentMethodName || paymentMethod.toUpperCase(),
      paymentStatus: isBangladesh ? 'pending' : 'paid',
      deliveryStatus: isBangladesh ? 'processing' : 'delivered',
      generatedSubscriptionIds: [],
      senderNumber: paymentProof?.senderNumber || '',
      transactionId: paymentProof?.transactionId || '',
      screenshotUrl: paymentProof?.screenshotUrl || '',
    };

    // If auto-verified / instant test card
    if (!isBangladesh) {
      const generatedSubIds: string[] = [];
      // ONE subscription per cart LINE ITEM (not per unit quantity)
      for (const item of cart) {
        const subId = generateRandomId('sub');
        generatedSubIds.push(subId);
        const daysMap: Record<string, number> = { '1_month': 30, '3_months': 90, '6_months': 180, '12_months': 365, 'lifetime': 3650 };
        const durationDays = daysMap[item.selectedPlan.duration] || 30;
        const startDate = new Date().toISOString();
        const expiryDate = new Date(Date.now() + durationDays * 86400000).toISOString();
        const sub: UserSubscription = {
          id: subId, orderId,
          orderNumber: orderNum,
          productId: item.product.id, productName: item.product.name, productLogo: item.product.logo,
          planDuration: item.selectedPlan.duration, durationLabel: item.selectedPlan.label,
          pricePaid: item.selectedPlan.price * item.quantity, status: 'active', startDate, expiryDate,
          autoRenew: true, autoRenewReminderDays: 3, accountType: item.product.accountType,
          warrantyValidUntil: expiryDate, paymentMethod,
          credentials: {
            email: '',
            password: '',
            pinCode: '',
            notes: 'Admin will provision credentials shortly.',
          },
          credentialsConfigured: false,
          userId: currentUid,
          userEmail: currentEmail,
        };
        try { await setDoc(doc(db, 'subscriptions', subId), sub); } catch (err) { console.error(err); }
      }
      newOrder.generatedSubscriptionIds = generatedSubIds;

      // Update user stats in Firestore for instant payment
      try {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, {
          lifetimeSpend: (user.lifetimeSpend || 0) + cartTotal,
          activeSubscriptionsCount: (user.activeSubscriptionsCount || 0) + generatedSubIds.length,
        });
      } catch { }
    }

    // Write order to Firestore & propagate error if saving fails
    try {
      await setDoc(doc(db, 'orders', orderId), newOrder);
      if (appliedCoupon?.code) {
        const couponRef = doc(db, 'coupons', appliedCoupon.code);
        await updateDoc(couponRef, {
          usedCount: (appliedCoupon.usedCount || 0) + 1,
        }).catch(() => {});
      }

      // Decrement product stock in Firestore
      for (const item of cart) {
        try {
          const prodRef = doc(db, 'products', item.product.id);
          const pSnap = await getDoc(prodRef);
          if (pSnap.exists()) {
            const currentStock = pSnap.data().stockCount ?? 100;
            const newStock = Math.max(0, currentStock - item.quantity);
            await updateDoc(prodRef, { stockCount: newStock });
          }
        } catch { }
      }
    } catch (err: any) {
      console.error('[Firestore] Order creation error:', err);
      throw new Error(`Failed to place order: ${err?.message || 'Database write failed. Please check your connection and try again.'}`);
    }

    // Optimistically update local orders list
    setOrders(prev => [newOrder, ...prev]);
    setLatestOrder(newOrder);
    clearCart();
    return newOrder;
  };

  // ─── User Profile management ───────────────────────────────────────
  const updateUserProfile = async (updates: Partial<CustomerProfile>) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    if (firebaseUser?.uid) {
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        await updateDoc(userRef, updates as Record<string, unknown>);
      } catch {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          await setDoc(userRef, updated, { merge: true });
        } catch (err) {
          console.error('Error updating user profile in Firestore:', err);
        }
      }
    }
  };

  // ─── Subscription management ───────────────────────────────────────
  const toggleAutoRenew = async (subId: string) => {
    const sub = subscriptions.find(s => s.id === subId) || allSubscriptions.find(s => s.id === subId);
    if (!sub) return;
    const newAutoRenew = !sub.autoRenew;
    setSubscriptions(prev => prev.map(s => s.id === subId ? { ...s, autoRenew: newAutoRenew } : s));
    setAllSubscriptions(prev => prev.map(s => s.id === subId ? { ...s, autoRenew: newAutoRenew } : s));
    try {
      await updateDoc(doc(db, 'subscriptions', subId), { autoRenew: newAutoRenew });
    } catch { }
  };

  const extendSubscription = async (subId: string, additionalDays: number) => {
    const sub = subscriptions.find(s => s.id === subId) || allSubscriptions.find(s => s.id === subId);
    if (!sub) return;
    const base = Math.max(new Date(sub.expiryDate).getTime(), Date.now());
    const newExp = new Date(base + additionalDays * 86400000).toISOString();
    setSubscriptions(prev => prev.map(s => s.id === subId ? { ...s, expiryDate: newExp, warrantyValidUntil: newExp, status: 'active' } : s));
    setAllSubscriptions(prev => prev.map(s => s.id === subId ? { ...s, expiryDate: newExp, warrantyValidUntil: newExp, status: 'active' } : s));
    try {
      await updateDoc(doc(db, 'subscriptions', subId), { expiryDate: newExp, warrantyValidUntil: newExp, status: 'active' });
    } catch { }
  };

  // ─── Admin Team Management (Add/Remove Admins) ──────────────────────
  const adminAddAdmin = async (email: string, name?: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    try {
      const docId = cleanEmail.replace(/[^a-z0-9]/g, '_');
      const adminRef = doc(db, 'admins', docId);

      const newAdmin: AdminMember = {
        id: docId,
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        role: 'admin',
        addedBy: user.email || SUPERADMIN_EMAIL,
        addedAt: new Date().toISOString(),
      };

      await setDoc(adminRef, newAdmin);

      // Also if user is already in `users` collection, promote their role
      try {
        const userQ = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const userSnap = await getDocs(userQ);
        for (const uDoc of userSnap.docs) {
          await updateDoc(uDoc.ref, { role: 'admin' });
        }
      } catch { }

      return { success: true, message: `Admin ${cleanEmail} added successfully.` };
    } catch (err: any) {
      console.error('adminAddAdmin error:', err);
      return { success: false, message: err.message || 'Failed to add admin.' };
    }
  };

  const adminRemoveAdmin = async (email: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === SUPERADMIN_EMAIL.toLowerCase()) {
      return { success: false, message: 'Cannot remove the primary Superadmin.' };
    }

    try {
      const docId = cleanEmail.replace(/[^a-z0-9]/g, '_');
      await deleteDoc(doc(db, 'admins', docId));

      // Also demote in `users` collection
      try {
        const userQ = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const userSnap = await getDocs(userQ);
        for (const uDoc of userSnap.docs) {
          await updateDoc(uDoc.ref, { role: 'customer' });
        }
      } catch { }

      return { success: true, message: `Admin privileges removed for ${cleanEmail}.` };
    } catch (err: any) {
      console.error('adminRemoveAdmin error:', err);
      return { success: false, message: err.message || 'Failed to remove admin.' };
    }
  };

  // ─── Admin: Product CRUD ───────────────────────────────────────────
  const adminCreateProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
    const id = generateRandomId('prod');
    const newProduct: Product = { ...product, id };
    try {
      await setDoc(doc(db, 'products', id), newProduct);
    } catch (err) {
      console.error('adminCreateProduct error:', err);
    }
    return id;
  };

  const adminUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', id), updates as Record<string, unknown>);
    } catch (err) {
      console.error('adminUpdateProduct error:', err);
    }
  };

  const adminDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      console.error('adminDeleteProduct error:', err);
    }
  };

  // ─── Admin: Order management & Verification ───────────────────────
  const adminUpdateOrderStatus = async (orderId: string, paymentStatus: Order['paymentStatus'], deliveryStatus: Order['deliveryStatus']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { paymentStatus, deliveryStatus });
      setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus, deliveryStatus } : o));
    } catch (err) {
      console.error('adminUpdateOrderStatus error:', err);
    }
  };

  // Mark payment verified without delivering (intermediate step)
  const adminVerifyPayment = async (orderId: string) => {
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'orders', orderId), { paymentVerifiedAt: now, verifiedBy: user.email || 'Admin' });
      setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentVerifiedAt: now } : o));
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentVerifiedAt: now } : o));
    } catch (err) {
      console.error('adminVerifyPayment error:', err);
    }
  };

  const adminApproveAndDeliverOrder = async (
    orderId: string,
    perItemCreds: Array<{ email: string; password: string; pinCode?: string; profileName?: string; notes?: string }>
  ) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      let ord: Order | undefined;
      try {
        const snap = await getDoc(orderRef);
        if (snap.exists()) {
          ord = snap.data() as Order;
        }
      } catch { }

      if (!ord) {
        ord = allOrders.find(o => o.id === orderId);
      }
      if (!ord) return;

      const generatedSubIds: string[] = [];
      const generatedSubs: UserSubscription[] = [];
      const daysMap: Record<string, number> = { '1_month': 30, '3_months': 90, '6_months': 180, '12_months': 365, 'lifetime': 3650 };

      // Create ONE subscription per order LINE ITEM with per-item credentials
      for (let idx = 0; idx < ord.items.length; idx++) {
        const item = ord.items[idx];
        const creds = perItemCreds[idx] || perItemCreds[0] || { email: '', password: '' };
        const subId = generateRandomId('sub');
        generatedSubIds.push(subId);
        const durationDays = daysMap[item.duration] || 30;
        const startDate = new Date().toISOString();
        const expiryDate = new Date(Date.now() + durationDays * 86400000).toISOString();

        const pricePaid = item.price * (item.quantity || 1);
        const isGiveaway = pricePaid === 0 || (ord.discount > 0 && ord.total === 0);
        const renewalPrice = isGiveaway ? (item.price > 0 ? item.price : 9.99) : pricePaid;

        const sub: UserSubscription = {
          id: subId,
          orderId,
          orderNumber: ord.orderNumber,
          productId: item.productId,
          productName: item.productName,
          productLogo: item.productLogo,
          planDuration: item.duration,
          durationLabel: item.durationLabel || '1 Month',
          pricePaid,
          renewalPrice,
          isGiveaway,
          status: 'active',
          startDate,
          expiryDate,
          autoRenew: !isGiveaway,
          autoRenewReminderDays: 3,
          accountType: item.accountType || 'private_account',
          warrantyValidUntil: expiryDate,
          paymentMethod: ord.paymentMethod,
          credentials: {
            email: creds.email || '',
            password: creds.password || '',
            pinCode: creds.pinCode || '',
            profileName: creds.profileName || '',
            notes: creds.notes || '',
          },
          userId: ord.userId,
          userEmail: (ord.userEmail || '').toLowerCase().trim(),
          credentialsConfigured: !!(creds.email && creds.password),
        };

        generatedSubs.push(sub);
        try {
          await setDoc(doc(db, 'subscriptions', subId), sub);
        } catch (err) {
          console.error('Error writing subscription:', err);
        }
      }


      try {
        await updateDoc(orderRef, {
          paymentStatus: 'paid',
          deliveryStatus: 'delivered',
          generatedSubscriptionIds: generatedSubIds,
          verifiedAt: new Date().toISOString(),
          verifiedBy: user.email || 'Admin',
        });
      } catch (err) {
        console.error('Error updating order doc:', err);
      }

      // Update user lifetime spend and subscription count
      try {
        const usrRef = doc(db, 'users', ord.userId);
        const usrSnap = await getDoc(usrRef);
        if (usrSnap.exists()) {
          const uData = usrSnap.data();
          await updateDoc(usrRef, {
            lifetimeSpend: (uData.lifetimeSpend || 0) + ord.total,
            activeSubscriptionsCount: (uData.activeSubscriptionsCount || 0) + generatedSubIds.length,
          });
        }
      } catch {}

      // Update local state for orders and subscriptions
      setAllSubscriptions(prev => [...generatedSubs, ...prev.filter(s => !generatedSubs.some(g => g.id === s.id))]);
      setSubscriptions(prev => [...generatedSubs, ...prev.filter(s => !generatedSubs.some(g => g.id === s.id))]);

      setAllOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        paymentStatus: 'paid',
        deliveryStatus: 'delivered',
        generatedSubscriptionIds: generatedSubIds,
      } : o));

      setOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        paymentStatus: 'paid',
        deliveryStatus: 'delivered',
        generatedSubscriptionIds: generatedSubIds,
      } : o));

      // Automated ticket / notification dispatch to customer
      try {
        await adminSendMessageToUser(
          ord.userId,
          ord.userEmail,
          `Order #${ord.orderNumber} Approved & Delivered`,
          `🎉 Your payment for Order #${ord.orderNumber} (${ord.items.map(i => i.productName).join(', ')}) has been verified and approved! Your credentials have been provisioned to your Customer Dashboard Vault.`
        );
      } catch {}

      // Record audit activity log
      try {
        await logAdminActivity(
          'ORDER_APPROVED',
          'orders',
          `Approved order #${ord.orderNumber} for ${ord.userEmail} ($${ord.total.toFixed(2)}) and provisioned ${generatedSubs.length} subscription credentials`,
          String(ord.orderNumber)
        );
      } catch {}
    } catch (err) {
      console.error('adminApproveAndDeliverOrder error:', err);
    }
  };

  const adminRejectOrder = async (orderId: string, reason: string) => {
    try {
      const updates = {
        paymentStatus: 'failed' as const,
        deliveryStatus: 'failed' as const,
        rejectionReason: reason,
        adminNotes: reason,
        verifiedAt: new Date().toISOString(),
        verifiedBy: user.email || 'Admin',
      };
      await updateDoc(doc(db, 'orders', orderId), updates);
      setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
      // Notify customer
      const ord = allOrders.find(o => o.id === orderId);
      if (ord) {
        try {
          await adminSendMessageToUser(
            ord.userId, ord.userEmail,
            `Order #${ord.orderNumber} — Payment Rejected`,
            `❌ Your order #${ord.orderNumber} could not be verified. Reason: ${reason}. Please contact support or resubmit with correct payment details.`
          );
        } catch {}
      }
    } catch (err) {
      console.error('adminRejectOrder error:', err);
    }
  };

  // ─── Admin: Payment Methods CRUD ───────────────────────────────────
  const adminCreatePaymentMethod = async (pm: Omit<BangladeshPaymentMethod, 'id' | 'updatedAt'>): Promise<string> => {
    const id = generateRandomId('pm');
    const newPm: BangladeshPaymentMethod = {
      ...pm,
      id,
      updatedAt: new Date().toISOString(),
    };
    setPaymentMethods(prev => [...prev, newPm]);
    try {
      await setDoc(doc(db, 'payment_methods', id), newPm);
    } catch (err) {
      console.error('adminCreatePaymentMethod error:', err);
    }
    return id;
  };

  const adminUpdatePaymentMethod = async (id: string, updates: Partial<BangladeshPaymentMethod>) => {
    setPaymentMethods(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
    try {
      await updateDoc(doc(db, 'payment_methods', id), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('adminUpdatePaymentMethod error:', err);
    }
  };

  const adminDeletePaymentMethod = async (id: string) => {
    setPaymentMethods(prev => prev.filter(p => p.id !== id));
    try {
      await deleteDoc(doc(db, 'payment_methods', id));
    } catch (err) {
      console.error('adminDeletePaymentMethod error:', err);
    }
  };

  const adminResetPaymentMethods = async () => {
    setPaymentMethods(MOCK_PAYMENT_METHODS);
    try {
      const snap = await getDocs(collection(db, 'payment_methods'));
      const batch = writeBatch(db);
      for (const d of snap.docs) {
        batch.delete(d.ref);
      }
      for (const pm of MOCK_PAYMENT_METHODS) {
        batch.set(doc(db, 'payment_methods', pm.id), pm);
      }
      await batch.commit();
    } catch (err) {
      console.error('adminResetPaymentMethods error:', err);
    }
  };

  // ─── Admin: User management ────────────────────────────────────────
  const adminUpdateUserRole = async (userId: string, role: 'customer' | 'admin') => {
    const currentUid = firebaseUser?.uid || user.id;
    if (userId === currentUid && role === 'customer') {
      throw new Error('Security Error: You cannot demote yourself to a customer.');
    }
    const targetUser = allUsers.find(u => u.id === userId);
    if (targetUser?.email?.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase() && role === 'customer') {
      throw new Error('Security Error: Primary SuperAdmin role cannot be modified.');
    }

    try {
      await updateDoc(doc(db, 'users', userId), { role });
      if (targetUser?.email) {
        if (role === 'admin') {
          await adminAddAdmin(targetUser.email, targetUser.name);
        } else {
          await adminRemoveAdmin(targetUser.email);
        }
      }
    } catch (err) {
      console.error('adminUpdateUserRole error:', err);
      throw err;
    }
  };

  const adminCreateSubscription = async (subData: Omit<UserSubscription, 'id'>): Promise<string> => {
    const id = generateRandomId('sub');
    const newSub: UserSubscription = {
      ...subData,
      id,
      userEmail: (subData.userEmail || '').toLowerCase().trim(),
    };
    setAllSubscriptions(prev => [newSub, ...prev]);
    setSubscriptions(prev => [newSub, ...prev]);
    try {
      await setDoc(doc(db, 'subscriptions', id), newSub);
      if (newSub.userId) {
        const uRef = doc(db, 'users', newSub.userId);
        const uSnap = await getDoc(uRef);
        if (uSnap.exists()) {
          const count = (uSnap.data().activeSubscriptionsCount || 0) + 1;
          await updateDoc(uRef, { activeSubscriptionsCount: count });
        }
      }
    } catch (err) {
      console.error('adminCreateSubscription error:', err);
    }
    return id;
  };

  const adminUpdateSubscription = async (id: string, updates: Partial<UserSubscription>) => {
    const hasRealCreds = updates.credentials &&
      (updates.credentials.email || updates.credentials.password);
    const cleanUpdates = {
      ...updates,
      ...(updates.userEmail ? { userEmail: updates.userEmail.toLowerCase().trim() } : {}),
      ...(hasRealCreds ? { credentialsConfigured: true } : {}),
    };
    setAllSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...cleanUpdates } : s));
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...cleanUpdates } : s));
    try {
      await updateDoc(doc(db, 'subscriptions', id), cleanUpdates as Record<string, unknown>);
    } catch (err) {
      console.error('adminUpdateSubscription error:', err);
    }
  };

  const adminDeleteSubscription = async (id: string) => {
    setAllSubscriptions(prev => prev.filter(s => s.id !== id));
    setSubscriptions(prev => prev.filter(s => s.id !== id));
    try {
      await deleteDoc(doc(db, 'subscriptions', id));
    } catch (err) {
      console.error('adminDeleteSubscription error:', err);
    }
  };

  const adminUpdateSubscriptionCredentials = async (subId: string, credentials: Partial<UserSubscription['credentials']>) => {
    const hasRealCreds = !!(credentials?.email || credentials?.password);
    setAllSubscriptions(prev => prev.map(s => s.id === subId ? { ...s, credentials: { ...s.credentials, ...credentials }, ...(hasRealCreds ? { credentialsConfigured: true } : {}) } : s));
    setSubscriptions(prev => prev.map(s => s.id === subId ? { ...s, credentials: { ...s.credentials, ...credentials }, ...(hasRealCreds ? { credentialsConfigured: true } : {}) } : s));
    try {
      const subRef = doc(db, 'subscriptions', subId);
      const subSnap = await getDoc(subRef);
      const existing = subSnap.exists() ? (subSnap.data() as UserSubscription).credentials : {};
      await updateDoc(subRef, {
        credentials: { ...existing, ...credentials },
        ...(hasRealCreds ? { credentialsConfigured: true } : {}),
      });
    } catch (err) {
      console.error('adminUpdateSubscriptionCredentials error:', err);
    }
  };

  const adminUpdateSubscriptionStatus = async (subId: string, status: UserSubscription['status']) => {
    setAllSubscriptions(prev => prev.map(s => s.id === subId ? { ...s, status } : s));
    setSubscriptions(prev => prev.map(s => s.id === subId ? { ...s, status } : s));
    try {
      await updateDoc(doc(db, 'subscriptions', subId), { status });
    } catch (err) {
      console.error('adminUpdateSubscriptionStatus error:', err);
    }
  };

  const adminPurgeMockSubscriptions = async () => {
    try {
      const [subSnap, ordSnap] = await Promise.all([
        getDocs(collection(db, 'subscriptions')),
        getDocs(collection(db, 'orders')),
      ]);
      const validOrderSubIds = new Set<string>();
      ordSnap.docs.forEach(d => {
        const o = d.data() as Order;
        if (o.generatedSubscriptionIds) {
          o.generatedSubscriptionIds.forEach(id => validOrderSubIds.add(id));
        }
      });

      const batch = writeBatch(db);
      let count = 0;
      for (const d of subSnap.docs) {
        const data = d.data() as UserSubscription;
        const isLinkedToOrder = validOrderSubIds.has(d.id) || (data.orderId && ordSnap.docs.some(od => od.id === data.orderId));
        const isMockEmail = !data.userEmail ||
                            data.credentials?.email?.includes('@keyoon-vault.com') ||
                            data.credentials?.email?.includes('customer@service.io');

        if (!isLinkedToOrder || isMockEmail) {
          batch.delete(d.ref);
          count++;
        }
      }
      if (count > 0) {
        await batch.commit();
      }
      const cleanSnap = await getDocs(collection(db, 'subscriptions'));
      const cleanSubs = cleanSnap.docs.map(d => d.data() as UserSubscription);
      setAllSubscriptions(cleanSubs);
      if (firebaseUser?.email) {
        const myEmail = (firebaseUser.email || '').toLowerCase().trim();
        setSubscriptions(cleanSubs.filter(s => s.userEmail && s.userEmail.toLowerCase() === myEmail));
      }
    } catch (err) {
      console.error('adminPurgeMockSubscriptions error:', err);
    }
  };

  const adminPurgeAllSubscriptions = async () => {
    try {
      const snap = await getDocs(collection(db, 'subscriptions'));
      const batch = writeBatch(db);
      for (const d of snap.docs) {
        batch.delete(d.ref);
      }
      await batch.commit();
      setAllSubscriptions([]);
      setSubscriptions([]);
    } catch (err) {
      console.error('adminPurgeAllSubscriptions error:', err);
    }
  };

  // ─── Admin: Coupon CRUD ────────────────────────────────────────────
  const adminCreateCoupon = async (coupon: Coupon) => {
    try {
      await setDoc(doc(db, 'coupons', coupon.code.toUpperCase()), {
        ...coupon,
        code: coupon.code.toUpperCase(),
      });
    } catch (err) {
      console.error('adminCreateCoupon error:', err);
    }
  };

  const adminDeleteCoupon = async (code: string) => {
    try {
      await deleteDoc(doc(db, 'coupons', code.toUpperCase()));
    } catch (err) {
      console.error('adminDeleteCoupon error:', err);
    }
  };

  // ─── Admin: Ticket management ──────────────────────────────────────
  const adminReplyToTicket = async (ticketId: string, message: string, imageUrl?: string) => {
    const msg = {
      id: generateRandomId('msg'),
      sender: 'agent' as const,
      senderName: user.name || 'Keyoon Support Ops',
      content: message,
      ...(imageUrl ? { imageUrl } : {}),
      timestamp: new Date().toISOString(),
    };

    try {
      const snap = await getDoc(doc(db, 'support_tickets', ticketId));
      if (snap.exists()) {
        const data = snap.data() as SupportTicket;
        await updateDoc(doc(db, 'support_tickets', ticketId), {
          status: 'in_progress',
          updatedAt: msg.timestamp,
          messages: [...data.messages, msg],
        });
      }
    } catch (err) {
      console.error('adminReplyToTicket error:', err);
    }
  };

  const adminCloseTicket = async (ticketId: string) => {
    try {
      await updateDoc(doc(db, 'support_tickets', ticketId), { status: 'closed' });
    } catch (err) {
      console.error('adminCloseTicket error:', err);
    }
  };

  const adminSendMessageToUser = async (
    targetUserId: string,
    targetUserEmail: string,
    subject: string,
    content: string,
    category: SupportTicket['category'] = 'general',
    imageUrl?: string
  ): Promise<string> => {
    const ticketId = generateRandomId('tkt');
    const newTicket: SupportTicket = {
      id: ticketId,
      ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: targetUserId || 'usr_direct',
      userEmail: targetUserEmail,
      subject: subject || 'Direct Admin Message',
      category,
      priority: 'high',
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: generateRandomId('msg'),
          sender: 'agent',
          senderName: user.name || 'Keyoon Support Ops',
          content,
          ...(imageUrl ? { imageUrl } : {}),
          timestamp: new Date().toISOString(),
        },
      ],
    };

    try {
      await setDoc(doc(db, 'support_tickets', ticketId), newTicket);
      setAllTickets(prev => [newTicket, ...prev.filter(t => t.id !== ticketId)]);
    } catch (err) {
      console.error('adminSendMessageToUser error:', err);
    }
    return ticketId;
  };

  // ─── User: Create ticket ───────────────────────────────────────────
  const createSupportTicket = (
    subject: string,
    category: SupportTicket['category'],
    initialMessage: string,
    imageUrl?: string
  ): SupportTicket => {
    const ticketId = generateRandomId('tkt');
    const newTicket: SupportTicket = {
      id: ticketId,
      ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: user.id,
      userEmail: user.email,
      subject,
      category,
      priority: 'high',
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: generateRandomId('msg'),
          sender: 'user',
          senderName: user.name,
          content: initialMessage,
          ...(imageUrl ? { imageUrl } : {}),
          timestamp: new Date().toISOString(),
        },
      ],
    };
    try { setDoc(doc(db, 'support_tickets', ticketId), newTicket); } catch { }
    return newTicket;
  };

  const replyToTicket = async (ticketId: string, content: string, sender: 'user' | 'agent', imageUrl?: string) => {
    const msg = {
      id: generateRandomId('msg'),
      sender,
      senderName: sender === 'user' ? user.name : 'Support',
      content,
      ...(imageUrl ? { imageUrl } : {}),
      timestamp: new Date().toISOString(),
    };
    try {
      const snap = await getDoc(doc(db, 'support_tickets', ticketId));
      if (snap.exists()) {
        const data = snap.data() as SupportTicket;
        await updateDoc(doc(db, 'support_tickets', ticketId), {
          updatedAt: msg.timestamp,
          messages: [...data.messages, msg],
        });
      }
    } catch { }
  };

  // ─── Admin simulation utilities ────────────────────────────────────
  const toggleUserRole = () => setUser(prev => ({ ...prev, role: prev.role === 'customer' ? 'admin' : 'customer' }));

  const sendTestEmail = (recipient: string, templateType: EmailNotification['templateType']) => {
    setEmailNotifications(prev => [{
      id: generateRandomId('eml'), recipientEmail: recipient,
      subject: `Test: ${templateType}`, templateType,
      sentAt: new Date().toISOString(), status: 'sent', previewHtml: `<p>Test ${templateType} sent to ${recipient}</p>`,
    }, ...prev]);
  };

  const triggerRenewalCronSimulation = () => {
    let renewed = 0, notified = 0, expired = 0;
    const now = Date.now();
    const daysMap: Record<string, number> = { '1_month': 30, '3_months': 90, '6_months': 180, '12_months': 365, 'lifetime': 3650 };
    const targetSubs = allSubscriptions.length > 0 ? allSubscriptions : subscriptions;

    for (const sub of targetSubs) {
      const expiryMs = new Date(sub.expiryDate).getTime();
      const diffDays = (expiryMs - now) / 86400000;

      if (diffDays <= 0) {
        if (sub.autoRenew) {
          renewed++;
          const durationDays = daysMap[sub.planDuration] || 30;
          const baseMs = Math.max(expiryMs, now);
          const newExp = new Date(baseMs + durationDays * 86400000).toISOString();

          // 1. Update subscription in Firestore & local state
          try {
            updateDoc(doc(db, 'subscriptions', sub.id), {
              expiryDate: newExp,
              warrantyValidUntil: newExp,
              status: 'active',
            });
          } catch { }

          // 2. Auto-generate Renewal Order record in Firestore
          const renewalOrderId = generateRandomId('ord_renew');
          const renewalOrderNumber = `RNW-${Math.floor(100000 + Math.random() * 900000)}`;
          const targetUserId = sub.userId || user.id || 'usr_auto';
          const targetUserEmail = sub.userEmail || user.email || 'customer@subnexus.com';

          const renewalAmount = sub.renewalPrice ?? (sub.pricePaid > 0 ? sub.pricePaid : 9.99);

          const renewalOrder: Order = {
            id: renewalOrderId,
            orderNumber: renewalOrderNumber,
            userId: targetUserId,
            userEmail: targetUserEmail,
            items: [
              {
                productId: sub.productId,
                productName: sub.productName,
                productLogo: sub.productLogo,
                duration: sub.planDuration,
                durationLabel: sub.durationLabel,
                price: renewalAmount,
                quantity: 1,
              },
            ],
            subtotal: renewalAmount,
            discount: 0,
            total: renewalAmount,
            totalBdt: Math.round(renewalAmount * 125),
            paymentMethod: sub.paymentMethod || 'bKash',
            paymentStatus: 'paid',
            deliveryStatus: 'delivered',
            createdAt: new Date().toISOString(),
            generatedSubscriptionIds: [sub.id],
            verifiedAt: new Date().toISOString(),
            verifiedBy: 'Auto-Renewal Engine',
          };

          try {
            setDoc(doc(db, 'orders', renewalOrderId), renewalOrder);
          } catch { }

          // 3. Dispatch automated ticket notification to user
          try {
            adminSendMessageToUser(
              targetUserId,
              targetUserEmail,
              `Auto-Renewal Successful: ${sub.productName}`,
              `🎉 Your ${sub.productName} plan (${sub.durationLabel}) has been automatically renewed until ${new Date(newExp).toLocaleDateString()} at $${renewalAmount.toFixed(2)} (৳${Math.round(renewalAmount * 125).toLocaleString()}). Your vault credentials remain active.`
            );
          } catch { }
        } else {
          expired++;
          try {
            updateDoc(doc(db, 'subscriptions', sub.id), { status: 'expired' });
          } catch { }

          const targetUserId = sub.userId || user.id || 'usr_auto';
          const targetUserEmail = sub.userEmail || user.email || 'customer@subnexus.com';

          try {
            adminSendMessageToUser(
              targetUserId,
              targetUserEmail,
              `Plan Expired: ${sub.productName}`,
              `⚠️ Your ${sub.productName} plan has expired. Enable Auto-Renew or add a new plan to keep your vault access active.`
            );
          } catch { }
        }
      } else if (diffDays > 0 && diffDays <= 3) {
        notified++;
        if (sub.status !== 'expiring_soon') {
          try {
            updateDoc(doc(db, 'subscriptions', sub.id), { status: 'expiring_soon' });
          } catch { }

          const targetUserId = sub.userId || user.id || 'usr_auto';
          const targetUserEmail = sub.userEmail || user.email || 'customer@subnexus.com';

          try {
            adminSendMessageToUser(
              targetUserId,
              targetUserEmail,
              `Auto-Renewal Notice: ${sub.productName}`,
              `⏰ Your ${sub.productName} plan will expire in ${Math.ceil(diffDays)} days. Auto-Renew is currently ${sub.autoRenew ? 'ENABLED' : 'DISABLED'}.`
            );
          } catch { }
        }
      }
    }

    return { renewedCount: renewed, notifiedCount: notified, expiredCount: expired };
  };

  const fastForwardSimulationDays = (days: number) => {
    const targetSubs = allSubscriptions.length > 0 ? allSubscriptions : subscriptions;
    for (const sub of targetSubs) {
      const newExp = new Date(new Date(sub.expiryDate).getTime() - days * 86400000).toISOString();
      const newStatus = new Date(newExp).getTime() < Date.now() ? 'expired' : 'active';
      try { updateDoc(doc(db, 'subscriptions', sub.id), { expiryDate: newExp, status: newStatus }); } catch { }
    }
  };

  // ─── Customer Reviews System Methods ──────────────────────────────
  const addReview = async (reviewData: Omit<Review, 'id' | 'createdAt' | 'likes' | 'likedBy'>): Promise<string> => {
    const revId = generateRandomId('rev');
    const newRev: Review = {
      ...reviewData,
      id: revId,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
    };

    // Optimistic local update
    setReviews(prev => [newRev, ...prev]);

    try {
      await setDoc(doc(db, 'reviews', revId), newRev);
    } catch (err) {
      console.warn('[Firestore] Error adding review to firestore:', err);
    }

    return revId;
  };

  const likeReview = async (reviewId: string) => {
    const currentUserId = user.id || 'anonymous_user';
    setReviews(prev => prev.map(rev => {
      if (rev.id === reviewId) {
        const alreadyLiked = rev.likedBy?.includes(currentUserId);
        const newLikes = alreadyLiked ? Math.max(0, rev.likes - 1) : rev.likes + 1;
        const newLikedBy = alreadyLiked
          ? (rev.likedBy || []).filter(id => id !== currentUserId)
          : [...(rev.likedBy || []), currentUserId];
        return { ...rev, likes: newLikes, likedBy: newLikedBy };
      }
      return rev;
    }));

    try {
      const revRef = doc(db, 'reviews', reviewId);
      const snap = await getDoc(revRef);
      if (snap.exists()) {
        const data = snap.data() as Review;
        const alreadyLiked = data.likedBy?.includes(currentUserId);
        const newLikes = alreadyLiked ? Math.max(0, (data.likes || 0) - 1) : (data.likes || 0) + 1;
        const newLikedBy = alreadyLiked
          ? (data.likedBy || []).filter(id => id !== currentUserId)
          : [...(data.likedBy || []), currentUserId];
        await updateDoc(revRef, { likes: newLikes, likedBy: newLikedBy });
      }
    } catch (err) {
      console.warn('[Firestore] Error toggling review like:', err);
    }
  };

  const deleteReview = async (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (err) {
      console.warn('[Firestore] Error deleting review:', err);
    }
  };

  const adminCreateReview = async (reviewData: Omit<Review, 'id' | 'createdAt' | 'likes' | 'likedBy'>) => {
    const revId = generateRandomId('rev');
    const newRev: Review = {
      ...reviewData,
      id: revId,
      createdAt: new Date().toISOString(),
      likes: Math.floor(10 + Math.random() * 40),
      likedBy: [],
    };
    setReviews(prev => [newRev, ...prev]);
    try {
      await setDoc(doc(db, 'reviews', revId), newRev);
    } catch (err) {
      console.warn('[Firestore] Admin review create error:', err);
    }
  };

  const adminUpdateReview = async (reviewId: string, updates: Partial<Review>) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, ...updates } : r));
    try {
      await updateDoc(doc(db, 'reviews', reviewId), updates);
    } catch (err) {
      console.warn('[Firestore] Admin review update error:', err);
    }
  };

  const adminResetReviews = async () => {
    setReviews(MOCK_REVIEWS);
    try {
      const snap = await getDocs(collection(db, 'reviews'));
      const batch = writeBatch(db);
      for (const d of snap.docs) {
        batch.delete(d.ref);
      }
      for (const rev of MOCK_REVIEWS) {
        batch.set(doc(db, 'reviews', rev.id), rev);
      }
      await batch.commit();
    } catch (err) {
      console.warn('[Firestore] Admin reset reviews error:', err);
    }
  };

  // ─── Admin Hero Slides Dynamic Customization ────────────────────────
  const adminCreateHeroSlide = async (slideData: Omit<HeroSlide, 'id'>): Promise<string> => {
    const slideId = generateRandomId('hero');
    const newSlide: HeroSlide = {
      ...slideData,
      id: slideId,
      order: slideData.order ?? (heroSlides.length + 1),
    };
    setHeroSlides(prev => [...prev, newSlide]);
    try {
      await setDoc(doc(db, 'hero_slides', slideId), newSlide);
    } catch (err) {
      console.warn('[Firestore] Admin hero slide create error:', err);
    }
    return slideId;
  };

  const adminUpdateHeroSlide = async (id: string, updates: Partial<HeroSlide>) => {
    setHeroSlides(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    try {
      await updateDoc(doc(db, 'hero_slides', id), updates);
    } catch (err) {
      console.warn('[Firestore] Admin hero slide update error:', err);
    }
  };

  const adminDeleteHeroSlide = async (id: string) => {
    setHeroSlides(prev => prev.filter(s => s.id !== id));
    try {
      await deleteDoc(doc(db, 'hero_slides', id));
    } catch (err) {
      console.warn('[Firestore] Admin hero slide delete error:', err);
    }
  };

  const adminResetHeroSlides = async () => {
    setHeroSlides(MOCK_HERO_SLIDES);
    try {
      const snap = await getDocs(collection(db, 'hero_slides'));
      const batch = writeBatch(db);
      for (const d of snap.docs) {
        batch.delete(d.ref);
      }
      for (const s of MOCK_HERO_SLIDES) {
        batch.set(doc(db, 'hero_slides', s.id), s);
      }
      await batch.commit();
    } catch (err) {
      console.warn('[Firestore] Admin reset hero slides error:', err);
    }
  };

  // ─── Admin Quick Messages & Bot Auto-Replies CRUD ───────────────────
  const adminCreateQuickMessage = async (qmData: Omit<QuickMessage, 'id'>): Promise<string> => {
    const qmId = generateRandomId('qm');
    const newQm: QuickMessage = {
      ...qmData,
      id: qmId,
      order: qmData.order ?? (quickMessages.length + 1),
      isActive: qmData.isActive ?? true,
    };
    setQuickMessages(prev => [...prev, newQm]);
    try {
      await setDoc(doc(db, 'quick_messages', qmId), newQm);
    } catch (err) {
      console.warn('[Firestore] Admin quick message create error:', err);
    }
    return qmId;
  };

  const adminUpdateQuickMessage = async (id: string, updates: Partial<QuickMessage>) => {
    setQuickMessages(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
    try {
      await updateDoc(doc(db, 'quick_messages', id), updates);
    } catch (err) {
      console.warn('[Firestore] Admin quick message update error:', err);
    }
  };

  const adminDeleteQuickMessage = async (id: string) => {
    setQuickMessages(prev => prev.filter(q => q.id !== id));
    try {
      await deleteDoc(doc(db, 'quick_messages', id));
    } catch (err) {
      console.warn('[Firestore] Admin quick message delete error:', err);
    }
  };

  const adminResetQuickMessages = async () => {
    setQuickMessages(DEFAULT_QUICK_MESSAGES);
    try {
      const snap = await getDocs(collection(db, 'quick_messages'));
      const batch = writeBatch(db);
      for (const d of snap.docs) {
        batch.delete(d.ref);
      }
      for (const qm of DEFAULT_QUICK_MESSAGES) {
        batch.set(doc(db, 'quick_messages', qm.id), qm);
      }
      await batch.commit();
    } catch (err) {
      console.warn('[Firestore] Admin reset quick messages error:', err);
    }
  };

  // ─── Memoize context value to prevent all-consumer re-renders ────────
  // Without this, every setState call in AppProvider re-creates the value
  // object and forces ALL useApp() consumers to re-render simultaneously.
  const contextValue = useMemo(() => ({
    products, selectedProduct, setSelectedProduct,
    cart, addToCart, removeFromCart, updateCartItemQuantity, clearCart,
    appliedCoupon, applyCoupon, removeCoupon, cartSubtotal, cartDiscount, cartTotal,
    isCartOpen, setIsCartOpen, isCheckoutOpen, setIsCheckoutOpen,
    processCheckout, orders, latestOrder, setLatestOrder,
    subscriptions, toggleAutoRenew, extendSubscription, activeVaultSub, setActiveVaultSub,
    user, setUser, updateUserProfile, toggleUserRole, firebaseUser, isAuthModalOpen, setIsAuthModalOpen,
    logout: async () => { try { await signOut(auth); } catch { } },
    isAdmin,
    isSuperAdmin,
    adminList,
    adminAddAdmin,
    adminRemoveAdmin,
    adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
    adminToggleProductVisibility, adminReorderProduct,
    categoryConfigs, adminUpdateCategoryConfigs, adminToggleCategoryVisibility, adminReorderCategories,
    allOrders, adminUpdateOrderStatus, adminApproveAndDeliverOrder, adminVerifyPayment, adminRejectOrder,
    allUsers, adminUpdateUserRole,
    allSubscriptions, adminCreateSubscription, adminUpdateSubscription, adminDeleteSubscription, adminPurgeMockSubscriptions, adminPurgeAllSubscriptions, adminUpdateSubscriptionCredentials, adminUpdateSubscriptionStatus,
    coupons, adminCreateCoupon, adminDeleteCoupon,
    paymentMethods, adminCreatePaymentMethod, adminUpdatePaymentMethod, adminDeletePaymentMethod, adminResetPaymentMethods,
    heroSlides, adminCreateHeroSlide, adminUpdateHeroSlide, adminDeleteHeroSlide, adminResetHeroSlides,
    quickMessages, adminCreateQuickMessage, adminUpdateQuickMessage, adminDeleteQuickMessage, adminResetQuickMessages,
    allTickets, adminReplyToTicket, adminCloseTicket, adminSendMessageToUser,
    financialMetrics, emailNotifications, sendTestEmail,
    triggerRenewalCronSimulation, fastForwardSimulationDays,
    adminActivityLogs, logAdminActivity,
    brandSettings, updateBrandSettings,
    currencySettings, updateCurrencySettings, detectedCurrency, bdtRate, formatPrice,
    refreshAllData, isSyncing,
    tickets, createSupportTicket, replyToTicket,
    reviews, addReview, likeReview, deleteReview,
    adminCreateReview, adminUpdateReview, adminResetReviews,
    isWriteReviewOpen, setIsWriteReviewOpen,
    targetReviewProduct, setTargetReviewProduct,
    activeSearchQuery, setActiveSearchQuery, activeCategoryFilter, setActiveCategoryFilter,
  }), [
    products, selectedProduct, cart, appliedCoupon, isCartOpen, isCheckoutOpen,
    orders, latestOrder, subscriptions, activeVaultSub,
    user, firebaseUser, isAuthModalOpen, isAdmin, isSuperAdmin, adminList,
    allOrders, allUsers, allSubscriptions, allTickets, coupons, paymentMethods, heroSlides, quickMessages, adminActivityLogs, brandSettings, categoryConfigs,
    financialMetrics, emailNotifications, isSyncing,
    currencySettings, detectedCurrency, bdtRate,
    tickets, reviews, isWriteReviewOpen, targetReviewProduct,
    activeSearchQuery, activeCategoryFilter,
    cartSubtotal, cartDiscount, cartTotal,
    // stable function refs (useCallback) don't need to be in deps
    addToCart, removeFromCart, updateCartItemQuantity, clearCart,
    applyCoupon, removeCoupon, setSelectedProduct, setIsCartOpen,
    setIsCheckoutOpen, processCheckout, setLatestOrder,
    toggleAutoRenew, extendSubscription, setActiveVaultSub,
    setUser, toggleUserRole, setIsAuthModalOpen,
    adminAddAdmin, adminRemoveAdmin,
    adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
    adminToggleProductVisibility, adminReorderProduct,
    adminUpdateCategoryConfigs, adminToggleCategoryVisibility, adminReorderCategories,
    adminUpdateOrderStatus, adminApproveAndDeliverOrder, adminVerifyPayment, adminRejectOrder,
    adminUpdateUserRole, adminUpdateSubscriptionCredentials, adminUpdateSubscriptionStatus,
    adminCreateCoupon, adminDeleteCoupon,
    adminCreatePaymentMethod, adminUpdatePaymentMethod, adminDeletePaymentMethod, adminResetPaymentMethods,
    adminReplyToTicket, adminCloseTicket,
    sendTestEmail, triggerRenewalCronSimulation, fastForwardSimulationDays, refreshAllData,
    updateCurrencySettings, formatPrice,
    createSupportTicket, replyToTicket,
    addReview, likeReview, deleteReview,
    adminCreateReview, adminUpdateReview, adminResetReviews,
    setIsWriteReviewOpen, setTargetReviewProduct,
    setActiveSearchQuery, setActiveCategoryFilter,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
