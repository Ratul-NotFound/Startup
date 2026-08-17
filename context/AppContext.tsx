'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Product, CartItem, Coupon, CustomerProfile, UserSubscription,
  Order, SupportTicket, FinancialMetric, EmailNotification, PlanPricing, PaymentMethod,
  AdminMember, Review, BangladeshPaymentMethod,
} from '@/types';
import {
  MOCK_PRODUCTS, MOCK_COUPONS, INITIAL_USER_PROFILE,
  INITIAL_FINANCIAL_METRICS, MOCK_REVIEWS, MOCK_PAYMENT_METHODS,
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

  // Admin: Order management & Approval
  allOrders: Order[];
  adminUpdateOrderStatus: (orderId: string, paymentStatus: Order['paymentStatus'], deliveryStatus: Order['deliveryStatus']) => Promise<void>;
  adminApproveAndDeliverOrder: (orderId: string) => Promise<void>;
  adminRejectOrder: (orderId: string, reason?: string) => Promise<void>;

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
  adminReplyToTicket: (ticketId: string, message: string, imageUrl?: string) => Promise<void>;
  adminCloseTicket: (ticketId: string) => Promise<void>;
  adminSendMessageToUser: (targetUserId: string, targetUserEmail: string, subject: string, content: string, category?: SupportTicket['category'], imageUrl?: string) => Promise<string>;

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

      // 5. Ensure superadmin doc exists in admins collection
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

    return () => {
      unsubProducts();
      unsubCoupons();
      unsubReviews();
      unsubPaymentMethods();
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

        // Live User Orders Listener (matches UID and Email)
        const unsubUserOrdersUid = onSnapshot(
          query(collection(db, 'orders'), where('userId', '==', fbUser.uid)),
          (snapshot) => {
            const uOrders = snapshot.docs.map(d => d.data() as Order);
            setOrders(prev => {
              const combined = [...uOrders, ...prev.filter(p => !uOrders.some(u => u.id === p.id))];
              return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            });
          }
        );

        let unsubUserOrdersEmail = () => {};
        if (fbUser.email) {
          unsubUserOrdersEmail = onSnapshot(
            query(collection(db, 'orders'), where('userEmail', '==', fbUser.email)),
            (snapshot) => {
              const uOrders = snapshot.docs.map(d => d.data() as Order);
              setOrders(prev => {
                const combined = [...uOrders, ...prev.filter(p => !uOrders.some(u => u.id === p.id))];
                return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              });
            }
          );
        }

        // Live User Subscriptions Listener (matches UID and Email)
        const unsubUserSubsUid = onSnapshot(
          query(collection(db, 'subscriptions'), where('userId', '==', fbUser.uid)),
          (snapshot) => {
            const uSubs = snapshot.docs.map(d => d.data() as UserSubscription);
            setSubscriptions(prev => {
              const combined = [...uSubs, ...prev.filter(p => !uSubs.some(u => u.id === p.id))];
              return combined;
            });
          }
        );

        let unsubUserSubsEmail = () => {};
        if (fbUser.email) {
          unsubUserSubsEmail = onSnapshot(
            query(collection(db, 'subscriptions'), where('credentials.email', '==', fbUser.email)),
            (snapshot) => {
              const uSubs = snapshot.docs.map(d => d.data() as UserSubscription);
              setSubscriptions(prev => {
                const combined = [...uSubs, ...prev.filter(p => !uSubs.some(u => u.id === p.id))];
                return combined;
              });
            }
          );
        }

        // Live User Tickets Listener
        const unsubUserTickets = onSnapshot(
          query(collection(db, 'support_tickets'), where('userId', '==', fbUser.uid)),
          (snapshot) => {
            const uTkts = snapshot.docs.map(d => d.data() as SupportTicket);
            setTickets(uTkts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          }
        );

        unsubscribersRef.current.push(
          unsubUserOrdersUid,
          unsubUserOrdersEmail,
          unsubUserSubsUid,
          unsubUserSubsEmail,
          unsubUserTickets
        );

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
    const orderId = generateRandomId('ord');
    const orderNum = generateOrderNumber();
    const isBangladesh = ['bkash', 'nagad', 'rocket', 'upay', 'custom'].includes(paymentMethod);

    const currentUid = firebaseUser ? firebaseUser.uid : user.id;
    const currentEmail = customEmail || (firebaseUser ? firebaseUser.email : user.email) || user.email;

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
          try { await setDoc(doc(db, 'subscriptions', subId), sub); } catch (err) { console.error(err); }
        }
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

    // Write order to Firestore
    try {
      await setDoc(doc(db, 'orders', orderId), newOrder);
    } catch (err) {
      console.error('[Firestore] Order creation error:', err);
    }

    // Optimistically update local orders list
    setOrders(prev => [newOrder, ...prev]);
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

  // ─── Admin: Order management & Verification ───────────────────────
  const adminUpdateOrderStatus = async (orderId: string, paymentStatus: Order['paymentStatus'], deliveryStatus: Order['deliveryStatus']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { paymentStatus, deliveryStatus });
      setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus, deliveryStatus } : o));
    } catch (err) {
      console.error('adminUpdateOrderStatus error:', err);
    }
  };

  const adminApproveAndDeliverOrder = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const snap = await getDoc(orderRef);
      if (!snap.exists()) return;
      const ord = snap.data() as Order;

      const generatedSubIds: string[] = [];
      const daysMap: Record<string, number> = { '1_month': 30, '3_months': 90, '6_months': 180, '12_months': 365, 'lifetime': 3650 };

      for (const item of ord.items) {
        for (let i = 0; i < (item.quantity || 1); i++) {
          const subId = generateRandomId('sub');
          generatedSubIds.push(subId);
          const durationDays = daysMap[item.duration] || 30;
          const startDate = new Date().toISOString();
          const expiryDate = new Date(Date.now() + durationDays * 86400000).toISOString();
          const creds = generateMockCredentials(item.productName, 'private_account', ord.userEmail);

          const sub: UserSubscription = {
            id: subId,
            orderId,
            productId: item.productId,
            productName: item.productName,
            productLogo: item.productLogo,
            planDuration: item.duration,
            durationLabel: item.durationLabel || '1 Month',
            pricePaid: item.price,
            status: 'active',
            startDate,
            expiryDate,
            autoRenew: true,
            autoRenewReminderDays: 3,
            accountType: 'private_account',
            warrantyValidUntil: expiryDate,
            paymentMethod: ord.paymentMethod,
            credentials: creds,
            userId: ord.userId,
            userEmail: ord.userEmail,
          };

          await setDoc(doc(db, 'subscriptions', subId), sub);
        }
      }

      await updateDoc(orderRef, {
        paymentStatus: 'paid',
        deliveryStatus: 'delivered',
        generatedSubscriptionIds: generatedSubIds,
        verifiedAt: new Date().toISOString(),
        verifiedBy: user.email || 'Admin',
      });

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

      // Update local state
      setAllOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        paymentStatus: 'paid',
        deliveryStatus: 'delivered',
        generatedSubscriptionIds: generatedSubIds,
      } : o));
    } catch (err) {
      console.error('adminApproveAndDeliverOrder error:', err);
    }
  };

  const adminRejectOrder = async (orderId: string, reason?: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        paymentStatus: 'failed',
        deliveryStatus: 'failed',
        adminNotes: reason || 'Payment not received or invalid TrxID.',
      });
      setAllOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        paymentStatus: 'failed',
        deliveryStatus: 'failed',
        adminNotes: reason || 'Payment not received or invalid TrxID.',
      } : o));
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
  const adminReplyToTicket = async (ticketId: string, message: string, imageUrl?: string) => {
    const msg = {
      id: generateRandomId('msg'),
      sender: 'agent' as const,
      senderName: user.name || 'SubNexus Support Ops',
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
          senderName: user.name || 'SubNexus Support Ops',
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
    user, setUser, toggleUserRole, firebaseUser, isAuthModalOpen, setIsAuthModalOpen,
    logout: async () => { try { await signOut(auth); } catch { } },
    isAdmin,
    isSuperAdmin,
    adminList,
    adminAddAdmin,
    adminRemoveAdmin,
    adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
    allOrders, adminUpdateOrderStatus, adminApproveAndDeliverOrder, adminRejectOrder,
    allUsers, adminUpdateUserRole,
    allSubscriptions, adminUpdateSubscriptionCredentials, adminUpdateSubscriptionStatus,
    coupons, adminCreateCoupon, adminDeleteCoupon,
    paymentMethods, adminCreatePaymentMethod, adminUpdatePaymentMethod, adminDeletePaymentMethod, adminResetPaymentMethods,
    allTickets, adminReplyToTicket, adminCloseTicket, adminSendMessageToUser,
    financialMetrics, emailNotifications, sendTestEmail,
    triggerRenewalCronSimulation, fastForwardSimulationDays,
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
    allOrders, allUsers, allSubscriptions, allTickets, coupons, paymentMethods,
    financialMetrics, emailNotifications, isSyncing,
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
    adminUpdateOrderStatus, adminApproveAndDeliverOrder, adminRejectOrder,
    adminUpdateUserRole, adminUpdateSubscriptionCredentials, adminUpdateSubscriptionStatus,
    adminCreateCoupon, adminDeleteCoupon,
    adminCreatePaymentMethod, adminUpdatePaymentMethod, adminDeletePaymentMethod, adminResetPaymentMethods,
    adminReplyToTicket, adminCloseTicket,
    sendTestEmail, triggerRenewalCronSimulation, fastForwardSimulationDays, refreshAllData,
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
