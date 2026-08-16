'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Product, CartItem, Coupon, CustomerProfile, UserSubscription,
  Order, SupportTicket, FinancialMetric, EmailNotification, PlanPricing, PaymentMethod,
  AdminMember,
} from '@/types';
import {
  MOCK_PRODUCTS, MOCK_COUPONS, INITIAL_USER_PROFILE,
  INITIAL_FINANCIAL_METRICS,
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
  processCheckout: (paymentMethod: PaymentMethod, customEmail?: string) => Promise<Order>;
  orders: Order[];
  latestOrder: Order | null;
  setLatestOrder: (order: Order | null) => void;

  // Subscriptions
  subscriptions: UserSubscription[];
  toggleAutoRenew: (subId: string) => void;
  extendSubscription: (subId: string, additionalDays: number) => void;
  activeVaultSub: UserSubscription | null;
  setActiveVaultSub: (sub: UserSubscription | null) => void;

  // Auth & User
  user: CustomerProfile;
  setUser: React.Dispatch<React.SetStateAction<CustomerProfile>>;
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

  // Admin: Product CRUD
  adminCreateProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  adminUpdateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  adminDeleteProduct: (id: string) => Promise<void>;

  // Admin: Order management
  allOrders: Order[];
  adminUpdateOrderStatus: (orderId: string, paymentStatus: Order['paymentStatus'], deliveryStatus: Order['deliveryStatus']) => Promise<void>;

  // Admin: User management
  allUsers: CustomerProfile[];
  adminUpdateUserRole: (userId: string, role: 'customer' | 'admin') => Promise<void>;

  // Admin: Subscription management
  allSubscriptions: UserSubscription[];
  adminUpdateSubscriptionCredentials: (subId: string, credentials: Partial<UserSubscription['credentials']>) => Promise<void>;
  adminUpdateSubscriptionStatus: (subId: string, status: UserSubscription['status']) => Promise<void>;

  // Admin: Coupon CRUD
  coupons: Coupon[];
  adminCreateCoupon: (coupon: Coupon) => Promise<void>;
  adminDeleteCoupon: (code: string) => Promise<void>;

  // Admin: Support tickets
  allTickets: SupportTicket[];
  adminReplyToTicket: (ticketId: string, message: string) => Promise<void>;
  adminCloseTicket: (ticketId: string) => Promise<void>;

  // Analytics & Admin
  financialMetrics: FinancialMetric;
  emailNotifications: EmailNotification[];
  sendTestEmail: (recipient: string, templateType: EmailNotification['templateType']) => void;
  triggerRenewalCronSimulation: () => { renewedCount: number; notifiedCount: number };
  fastForwardSimulationDays: (days: number) => void;
  refreshAllData: () => Promise<void>;
  isSyncing: boolean;

  // User Support
  tickets: SupportTicket[];
  createSupportTicket: (subject: string, category: SupportTicket['category'], initialMessage: string) => SupportTicket;
  replyToTicket: (ticketId: string, content: string, sender: 'user' | 'agent') => void;

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
  const [isSyncing, setIsSyncing] = useState(false);

  // Analytics
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetric>(INITIAL_FINANCIAL_METRICS);
  const [emailNotifications, setEmailNotifications] = useState<EmailNotification[]>([]);

  // Global UI
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  // Active unsubs ref to clean up on unmount or user change
  const unsubscribersRef = useRef<(() => void)[]>([]);

  // ─── Analytics init ────────────────────────────────────────────────
  useEffect(() => { initAnalytics(); }, []);

  // ─── Handle Google redirect sign-in result ─────────────────────────
  // getRedirectResult MUST run at the top level (not inside the modal)
  // because after signInWithRedirect the page reloads and the modal is closed.
  useEffect(() => {
    getRedirectResult(auth).catch(() => {
      // No redirect in progress — ignore silently
    });
    // onAuthStateChanged below will pick up the signed-in user automatically
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        // Ensure all existing Firestore product docs have latest topic-relevant images array
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

      // 3. Ensure superadmin doc exists in admins collection
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

  // ─── Global Real-time Listeners (Products & Coupons & Admin List) ─
  useEffect(() => {
    seedFirestoreIfEmpty();

    // 1. Real-time products listener (available to all users)
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (!snapshot.empty) {
        const prods = snapshot.docs.map(d => {
          const data = d.data() as Product;
          const fallback = MOCK_PRODUCTS.find(p => p.id === d.id || p.slug === data.slug);
          const gallery = (fallback?.images && fallback.images.length > 0)
            ? fallback.images
            : (data.images && data.images.length > 0)
              ? data.images
              : [data.logo || fallback?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'];

          return {
            ...data,
            id: d.id,
            images: gallery,
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

    // 3. Real-time admin list listener (only if authenticated/permitted)
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
      // Unauthenticated visitors do not have permission to view internal admins list
      setAdminList([{
        id: 'superadmin',
        email: SUPERADMIN_EMAIL,
        name: 'Owner',
        role: 'superadmin',
        addedBy: 'System',
        addedAt: new Date().toISOString(),
      }]);
    });

    return () => {
      unsubProducts();
      unsubCoupons();
      unsubAdmins();
    };
  }, [seedFirestoreIfEmpty]);

  // ─── Real-time Admin Data Listeners ─────────────────────────────────
  const setupAdminRealtimeListeners = useCallback(() => {
    // Clear any previous listeners
    unsubscribersRef.current.forEach(u => u());
    unsubscribersRef.current = [];

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
    unsubscribersRef.current.push(unsubOrders);

    // All users listener
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usrs = snapshot.docs.map(d => d.data() as CustomerProfile);
      setAllUsers(usrs);
    });
    unsubscribersRef.current.push(unsubUsers);

    // All subscriptions listener
    const unsubSubs = onSnapshot(collection(db, 'subscriptions'), (snapshot) => {
      const sbs = snapshot.docs.map(d => d.data() as UserSubscription);
      setAllSubscriptions(sbs);
    });
    unsubscribersRef.current.push(unsubSubs);

    // All support tickets listener
    const unsubTickets = onSnapshot(collection(db, 'support_tickets'), (snapshot) => {
      const tkts = snapshot.docs.map(d => d.data() as SupportTicket).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAllTickets(tkts);
    });
    unsubscribersRef.current.push(unsubTickets);
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

        // Live User Orders Listener
        const unsubUserOrders = onSnapshot(
          query(collection(db, 'orders'), where('userId', '==', fbUser.uid)),
          (snapshot) => {
            const uOrders = snapshot.docs.map(d => d.data() as Order);
            setOrders(uOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          }
        );

        // Live User Subscriptions Listener
        const unsubUserSubs = onSnapshot(
          query(collection(db, 'subscriptions'), where('userId', '==', fbUser.uid)),
          (snapshot) => {
            const uSubs = snapshot.docs.map(d => d.data() as UserSubscription);
            setSubscriptions(uSubs);
          }
        );

        // Live User Tickets Listener
        const unsubUserTickets = onSnapshot(
          query(collection(db, 'support_tickets'), where('userId', '==', fbUser.uid)),
          (snapshot) => {
            const uTkts = snapshot.docs.map(d => d.data() as SupportTicket);
            setTickets(uTkts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          }
        );

        unsubscribersRef.current.push(unsubUserOrders, unsubUserSubs, unsubUserTickets);

        // If admin or superadmin, activate full real-time database listeners
        if (isUserAdmin) {
          setupAdminRealtimeListeners();
        }

        setIsAuthModalOpen(false);
      } else {
        // Signed out
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

        // Clean up listeners
        unsubscribersRef.current.forEach(u => u());
        unsubscribersRef.current = [];
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribersRef.current.forEach(u => u());
      unsubscribersRef.current = [];
    };
  }, [setupAdminRealtimeListeners]);

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

      // Refresh admins
      const aSnap = await getDocs(collection(db, 'admins'));
      if (!aSnap.empty) {
        setAdminList(aSnap.docs.map(d => d.data() as AdminMember));
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
        setAllSubscriptions(subSnap.docs.map(d => d.data() as UserSubscription));
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
  }, [isAdmin, isSuperAdmin]);

  // ─── Cart persistence ──────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem('subnexus_cart');
      if (saved) setCart(JSON.parse(saved));
    } catch { }
  }, []);
  useEffect(() => {
    try { localStorage.setItem('subnexus_cart', JSON.stringify(cart)); } catch { }
  }, [cart]);

  // ─── Computed cart values ──────────────────────────────────────────
  const cartSubtotal = cart.reduce((acc, i) => acc + i.selectedPlan.price * i.quantity, 0);
  const cartDiscount = appliedCoupon ? (cartSubtotal * appliedCoupon.discountPercent) / 100 : 0;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount);

  // ─── Cart actions ──────────────────────────────────────────────────
  const addToCart = (product: Product, selectedPlan: PlanPricing, customEmail?: string) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id && i.selectedPlan.duration === selectedPlan.duration);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += 1;
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

  const applyCoupon = (code: string) => {
    const found = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!found) return { success: false, message: 'Invalid promo code.' };
    if (found.minOrderAmount && cartSubtotal < found.minOrderAmount)
      return { success: false, message: `Minimum order $${found.minOrderAmount} required.` };
    setAppliedCoupon(found);
    return { success: true, message: `${found.discountPercent}% discount applied!` };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  // ─── Checkout ──────────────────────────────────────────────────────
  const processCheckout = async (paymentMethod: PaymentMethod, customEmail?: string): Promise<Order> => {
    const orderId = generateRandomId('ord');
    const orderNum = generateOrderNumber();
    const newSubs: UserSubscription[] = [];
    const generatedSubIds: string[] = [];

    for (const item of cart) {
      for (let i = 0; i < item.quantity; i++) {
        const subId = generateRandomId('sub');
        generatedSubIds.push(subId);
        const daysMap: Record<string, number> = { '1_month': 30, '3_months': 90, '6_months': 180, '12_months': 365, 'lifetime': 3650 };
        const durationDays = daysMap[item.selectedPlan.duration] || 30;
        const startDate = new Date().toISOString();
        const expiryDate = new Date(Date.now() + durationDays * 86400000).toISOString();
        const creds = generateMockCredentials(item.product.name, item.product.accountType, customEmail || user.email);
        const sub: UserSubscription = {
          id: subId, orderId,
          productId: item.product.id, productName: item.product.name, productLogo: item.product.logo,
          planDuration: item.selectedPlan.duration, durationLabel: item.selectedPlan.label,
          pricePaid: item.selectedPlan.price, status: 'active', startDate, expiryDate,
          autoRenew: true, autoRenewReminderDays: 3, accountType: item.product.accountType,
          warrantyValidUntil: expiryDate, paymentMethod, credentials: creds,
          // @ts-ignore – store userId for Firestore queries
          userId: user.id,
        };
        newSubs.push(sub);
        // Write to Firestore
        try { await setDoc(doc(db, 'subscriptions', subId), sub); } catch (err) { console.error(err); }
      }
    }

    const newOrder: Order = {
      id: orderId, orderNumber: orderNum, createdAt: new Date().toISOString(),
      userId: user.id, userEmail: customEmail || user.email,
      items: cart.map(item => ({
        productId: item.product.id, productName: item.product.name, productLogo: item.product.logo,
        duration: item.selectedPlan.duration, durationLabel: item.selectedPlan.label,
        price: item.selectedPlan.price, quantity: item.quantity,
      })),
      subtotal: cartSubtotal, discount: cartDiscount, total: cartTotal, paymentMethod,
      paymentStatus: 'paid',
      transactionHash: paymentMethod.startsWith('crypto')
        ? `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`
        : `ch_${Math.random().toString(36).substring(2, 14)}`,
      deliveryStatus: 'delivered',
      generatedSubscriptionIds: generatedSubIds,
    };

    // Write order to Firestore
    try { await setDoc(doc(db, 'orders', orderId), newOrder); } catch (err) { console.error(err); }

    // Update user stats in Firestore
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        lifetimeSpend: (user.lifetimeSpend || 0) + cartTotal,
        activeSubscriptionsCount: (user.activeSubscriptionsCount || 0) + newSubs.length,
      });
    } catch { }

    setLatestOrder(newOrder);
    clearCart();
    return newOrder;
  };

  // ─── Subscription management ───────────────────────────────────────
  const toggleAutoRenew = async (subId: string) => {
    const sub = subscriptions.find(s => s.id === subId);
    if (!sub) return;
    const newAutoRenew = !sub.autoRenew;
    try {
      await updateDoc(doc(db, 'subscriptions', subId), { autoRenew: newAutoRenew });
    } catch { }
  };

  const extendSubscription = async (subId: string, additionalDays: number) => {
    const sub = subscriptions.find(s => s.id === subId) || allSubscriptions.find(s => s.id === subId);
    if (!sub) return;
    const base = Math.max(new Date(sub.expiryDate).getTime(), Date.now());
    const newExp = new Date(base + additionalDays * 86400000).toISOString();
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

  // ─── Admin: Order management ───────────────────────────────────────
  const adminUpdateOrderStatus = async (orderId: string, paymentStatus: Order['paymentStatus'], deliveryStatus: Order['deliveryStatus']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { paymentStatus, deliveryStatus });
    } catch (err) {
      console.error('adminUpdateOrderStatus error:', err);
    }
  };

  // ─── Admin: User management ────────────────────────────────────────
  const adminUpdateUserRole = async (userId: string, role: 'customer' | 'admin') => {
    try {
      await updateDoc(doc(db, 'users', userId), { role });
      const targetUser = allUsers.find(u => u.id === userId);
      if (targetUser?.email) {
        if (role === 'admin') {
          await adminAddAdmin(targetUser.email, targetUser.name);
        } else {
          await adminRemoveAdmin(targetUser.email);
        }
      }
    } catch (err) {
      console.error('adminUpdateUserRole error:', err);
    }
  };

  // ─── Admin: Subscription management ───────────────────────────────
  const adminUpdateSubscriptionCredentials = async (subId: string, credentials: Partial<UserSubscription['credentials']>) => {
    try {
      const subRef = doc(db, 'subscriptions', subId);
      const subSnap = await getDoc(subRef);
      const existing = subSnap.exists() ? (subSnap.data() as UserSubscription).credentials : {};
      await updateDoc(subRef, { credentials: { ...existing, ...credentials } });
    } catch (err) {
      console.error('adminUpdateSubscriptionCredentials error:', err);
    }
  };

  const adminUpdateSubscriptionStatus = async (subId: string, status: UserSubscription['status']) => {
    try {
      await updateDoc(doc(db, 'subscriptions', subId), { status });
    } catch (err) {
      console.error('adminUpdateSubscriptionStatus error:', err);
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
  const adminReplyToTicket = async (ticketId: string, message: string) => {
    const msg = {
      id: generateRandomId('msg'), sender: 'agent' as const,
      senderName: user.name || 'SubNexus Support Ops', content: message, timestamp: new Date().toISOString(),
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

  // ─── User: Create ticket ───────────────────────────────────────────
  const createSupportTicket = (subject: string, category: SupportTicket['category'], initialMessage: string): SupportTicket => {
    const ticketId = generateRandomId('tkt');
    const newTicket: SupportTicket = {
      id: ticketId, ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: user.id, userEmail: user.email, subject, category,
      priority: 'high', status: 'open', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      messages: [{ id: generateRandomId('msg'), sender: 'user', senderName: user.name, content: initialMessage, timestamp: new Date().toISOString() }],
    };
    try { setDoc(doc(db, 'support_tickets', ticketId), newTicket); } catch { }
    return newTicket;
  };

  const replyToTicket = async (ticketId: string, content: string, sender: 'user' | 'agent') => {
    const msg = { id: generateRandomId('msg'), sender, senderName: sender === 'user' ? user.name : 'Support', content, timestamp: new Date().toISOString() };
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
    let renewed = 0, notified = 0;
    const now = Date.now();
    for (const sub of allSubscriptions.length > 0 ? allSubscriptions : subscriptions) {
      const diff = (new Date(sub.expiryDate).getTime() - now) / 86400000;
      if (diff <= 0 && sub.autoRenew) {
        renewed++;
        const exp = new Date(now + 30 * 86400000).toISOString();
        try { updateDoc(doc(db, 'subscriptions', sub.id), { expiryDate: exp, status: 'active' }); } catch { }
      }
      if (diff > 0 && diff <= 3) {
        notified++;
        try { updateDoc(doc(db, 'subscriptions', sub.id), { status: 'expiring_soon' }); } catch { }
      }
    }
    return { renewedCount: renewed, notifiedCount: notified };
  };

  const fastForwardSimulationDays = (days: number) => {
    const targetSubs = allSubscriptions.length > 0 ? allSubscriptions : subscriptions;
    for (const sub of targetSubs) {
      const newExp = new Date(new Date(sub.expiryDate).getTime() - days * 86400000).toISOString();
      const newStatus = new Date(newExp).getTime() < Date.now() ? 'expired' : 'active';
      try { updateDoc(doc(db, 'subscriptions', sub.id), { expiryDate: newExp, status: newStatus }); } catch { }
    }
  };

  return (
    <AppContext.Provider value={{
      products, selectedProduct, setSelectedProduct,
      cart, addToCart, removeFromCart, updateCartItemQuantity, clearCart,
      appliedCoupon, applyCoupon, removeCoupon, cartSubtotal, cartDiscount, cartTotal,
      isCartOpen, setIsCartOpen, isCheckoutOpen, setIsCheckoutOpen,
      processCheckout, orders, latestOrder, setLatestOrder,
      subscriptions, toggleAutoRenew, extendSubscription, activeVaultSub, setActiveVaultSub,
      user, setUser, toggleUserRole, firebaseUser, isAuthModalOpen, setIsAuthModalOpen,
      logout: async () => { try { await signOut(auth); } catch { } },
      isAdmin,
      isSuperAdmin,
      adminList,
      adminAddAdmin,
      adminRemoveAdmin,
      adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
      allOrders, adminUpdateOrderStatus,
      allUsers, adminUpdateUserRole,
      allSubscriptions, adminUpdateSubscriptionCredentials, adminUpdateSubscriptionStatus,
      coupons, adminCreateCoupon, adminDeleteCoupon,
      allTickets, adminReplyToTicket, adminCloseTicket,
      financialMetrics, emailNotifications, sendTestEmail,
      triggerRenewalCronSimulation, fastForwardSimulationDays,
      refreshAllData, isSyncing,
      tickets, createSupportTicket, replyToTicket,
      activeSearchQuery, setActiveSearchQuery, activeCategoryFilter, setActiveCategoryFilter,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
