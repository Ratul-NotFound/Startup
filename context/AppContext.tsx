'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Coupon,
  CustomerProfile,
  UserSubscription,
  Order,
  SupportTicket,
  FinancialMetric,
  EmailNotification,
  PlanPricing,
  PaymentMethod,
} from '@/types';
import {
  MOCK_PRODUCTS,
  MOCK_COUPONS,
  INITIAL_USER_PROFILE,
  INITIAL_USER_SUBSCRIPTIONS,
  INITIAL_ORDERS,
  INITIAL_TICKETS,
  INITIAL_FINANCIAL_METRICS,
} from '@/lib/mock-data';
import { generateOrderNumber, generateRandomId, generateMockCredentials } from '@/lib/utils';

interface AppContextType {
  // Products
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

  // Subscriptions & Vault
  subscriptions: UserSubscription[];
  toggleAutoRenew: (subId: string) => void;
  extendSubscription: (subId: string, additionalDays: number) => void;
  activeVaultSub: UserSubscription | null;
  setActiveVaultSub: (sub: UserSubscription | null) => void;

  // Customer Profile & Role Switcher
  user: CustomerProfile;
  setUser: React.Dispatch<React.SetStateAction<CustomerProfile>>;
  toggleUserRole: () => void;

  // Admin & Renewal Simulator
  financialMetrics: FinancialMetric;
  emailNotifications: EmailNotification[];
  sendTestEmail: (recipient: string, templateType: EmailNotification['templateType']) => void;
  triggerRenewalCronSimulation: () => { renewedCount: number; notifiedCount: number };
  fastForwardSimulationDays: (days: number) => void;

  // Support
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

  // User & Subscriptions
  const [user, setUser] = useState<CustomerProfile>(INITIAL_USER_PROFILE);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>(INITIAL_USER_SUBSCRIPTIONS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [activeVaultSub, setActiveVaultSub] = useState<UserSubscription | null>(null);

  // Analytics & Admin
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetric>(INITIAL_FINANCIAL_METRICS);
  const [emailNotifications, setEmailNotifications] = useState<EmailNotification[]>([
    {
      id: 'eml-101',
      recipientEmail: 'alex.vance@techcorp.io',
      subject: '🔐 Your ChatGPT Plus Credentials & Access Vault',
      templateType: 'order_fulfillment',
      sentAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'sent',
      previewHtml: '<h1>Welcome to SubNexus VIP</h1><p>Your subscription is active. Credentials revealed in secure vault.</p>',
    },
    {
      id: 'eml-102',
      recipientEmail: 'alex.vance@techcorp.io',
      subject: '⚠️ Reminder: Claude 3.5 Pro Renews in 3 Days',
      templateType: 'renewal_reminder',
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'sent',
      previewHtml: '<h1>Renewal Notice</h1><p>Your Claude 3.5 Pro plan expires in 3 days. Extend now to keep continuous access.</p>',
    },
  ]);

  // Support
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);

  // Filters & Search
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  // Sync to local storage for persistence across reloads
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('subnexus_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
      const savedSubs = localStorage.getItem('subnexus_subs');
      if (savedSubs) setSubscriptions(JSON.parse(savedSubs));
      const savedOrders = localStorage.getItem('subnexus_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('subnexus_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('subnexus_subs', JSON.stringify(subscriptions));
    } catch {
      // ignore
    }
  }, [subscriptions]);

  useEffect(() => {
    try {
      localStorage.setItem('subnexus_orders', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  // Cart Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.selectedPlan.price * item.quantity, 0);
  const cartDiscount = appliedCoupon ? (cartSubtotal * appliedCoupon.discountPercent) / 100 : 0;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount);

  const addToCart = (product: Product, selectedPlan: PlanPricing, customEmail?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedPlan.duration === selectedPlan.duration
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, { product, selectedPlan, quantity: 1, customEmail }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, duration: string) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.selectedPlan.duration === duration)));
  };

  const updateCartItemQuantity = (productId: string, duration: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, duration);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.selectedPlan.duration === duration
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = MOCK_COUPONS.find((c) => c.code === cleanCode);
    if (!found) {
      return { success: false, message: 'Invalid promo code. Try NEXUS20 or VIP50' };
    }
    if (found.minOrderAmount && cartSubtotal < found.minOrderAmount) {
      return { success: false, message: `Coupon requires minimum order of $${found.minOrderAmount}` };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Applied ${found.discountPercent}% OFF coupon!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const toggleUserRole = () => {
    setUser((prev) => ({
      ...prev,
      role: prev.role === 'customer' ? 'admin' : 'customer',
    }));
  };

  const toggleAutoRenew = (subId: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) => (sub.id === subId ? { ...sub, autoRenew: !sub.autoRenew } : sub))
    );
  };

  const extendSubscription = (subId: string, additionalDays: number) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id !== subId) return sub;
        const currentExp = new Date(sub.expiryDate).getTime();
        const baseTime = currentExp > Date.now() ? currentExp : Date.now();
        const newExp = new Date(baseTime + additionalDays * 24 * 60 * 60 * 1000).toISOString();
        return {
          ...sub,
          expiryDate: newExp,
          warrantyValidUntil: newExp,
          status: 'active',
        };
      })
    );
  };

  const processCheckout = async (paymentMethod: PaymentMethod, customEmail?: string): Promise<Order> => {
    const orderId = generateRandomId('ord');
    const orderNum = generateOrderNumber();
    const generatedSubIds: string[] = [];

    const newSubs: UserSubscription[] = [];

    cart.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        const subId = generateRandomId('sub');
        generatedSubIds.push(subId);

        let durationDays = 30;
        if (item.selectedPlan.duration === '3_months') durationDays = 90;
        if (item.selectedPlan.duration === '6_months') durationDays = 180;
        if (item.selectedPlan.duration === '12_months') durationDays = 365;
        if (item.selectedPlan.duration === 'lifetime') durationDays = 730;

        const startDate = new Date().toISOString();
        const expiryDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

        const creds = generateMockCredentials(item.product.name, item.product.accountType, customEmail || user.email);

        const sub: UserSubscription = {
          id: subId,
          orderId: orderId,
          productId: item.product.id,
          productName: item.product.name,
          productLogo: item.product.logo,
          planDuration: item.selectedPlan.duration,
          durationLabel: item.selectedPlan.label,
          pricePaid: item.selectedPlan.price,
          status: 'active',
          startDate,
          expiryDate,
          autoRenew: true,
          autoRenewReminderDays: 3,
          accountType: item.product.accountType,
          warrantyValidUntil: expiryDate,
          paymentMethod,
          credentials: creds,
        };

        newSubs.push(sub);
      }
    });

    const newOrder: Order = {
      id: orderId,
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
      userId: user.id,
      userEmail: customEmail || user.email,
      items: cart.map((item) => ({
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
      paymentMethod,
      paymentStatus: 'paid',
      transactionHash: paymentMethod.startsWith('crypto') 
        ? `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`
        : `ch_${Math.random().toString(36).substring(2, 14)}`,
      deliveryStatus: 'delivered',
      generatedSubscriptionIds: generatedSubIds,
    };

    // Update state
    setSubscriptions((prev) => [...newSubs, ...prev]);
    setOrders((prev) => [newOrder, ...prev]);
    setLatestOrder(newOrder);
    setUser((prev) => ({
      ...prev,
      lifetimeSpend: prev.lifetimeSpend + cartTotal,
      activeSubscriptionsCount: prev.activeSubscriptionsCount + newSubs.length,
    }));

    // Update financial metrics
    setFinancialMetrics((prev) => ({
      ...prev,
      netRevenueToday: prev.netRevenueToday + cartTotal,
      mrr: prev.mrr + cartTotal * 0.4,
      activeSubscribers: prev.activeSubscribers + 1,
    }));

    // Generate email dispatch notification
    const emailNotif: EmailNotification = {
      id: generateRandomId('eml'),
      recipientEmail: customEmail || user.email,
      subject: `🎉 Order #${orderNum} Delivered: Your ${cart[0]?.product.name} Credentials`,
      templateType: 'order_fulfillment',
      sentAt: new Date().toISOString(),
      status: 'sent',
      previewHtml: `<h3>Order #${orderNum} Completed</h3><p>Total Paid: $${cartTotal.toFixed(2)}</p><p>Check your Vault for instant login credentials.</p>`,
    };
    setEmailNotifications((prev) => [emailNotif, ...prev]);

    clearCart();
    setIsCheckoutOpen(false);

    return newOrder;
  };

  const sendTestEmail = (recipient: string, templateType: EmailNotification['templateType']) => {
    const templateTitles = {
      order_fulfillment: '🔐 Immediate Account Credentials & Activation Link',
      renewal_reminder: '⚠️ 3-Day Upcoming Renewal & Expiry Notice',
      auto_renewal_success: '✅ Subscription Auto-Renewal Payment Successful',
      security_alert: '🛡️ Security Alert: New Device Login Detected',
      invoice_receipt: '🧾 Tax Invoice & Payment Receipt (PDF Attached)',
    };

    const newEmail: EmailNotification = {
      id: generateRandomId('eml'),
      recipientEmail: recipient,
      subject: templateTitles[templateType],
      templateType,
      sentAt: new Date().toISOString(),
      status: 'sent',
      previewHtml: `<div style="font-family:sans-serif;padding:20px;background:#0f172a;color:#f8fafc;border-radius:8px;">
        <h2 style="color:#6366f1;">SubNexus VIP Notification</h2>
        <p>This is a live transactional preview generated by the SubNexus SMTP Engine for <strong>${recipient}</strong>.</p>
        <p style="padding:10px;background:#1e293b;border-left:4px solid #06b6d4;">Template: <code>${templateType}</code></p>
      </div>`,
    };

    setEmailNotifications((prev) => [newEmail, ...prev]);
  };

  const triggerRenewalCronSimulation = () => {
    let renewedCount = 0;
    let notifiedCount = 0;

    setSubscriptions((prev) =>
      prev.map((sub) => {
        const remaining = (new Date(sub.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (remaining <= 3 && sub.autoRenew) {
          renewedCount++;
          const newExp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          return {
            ...sub,
            expiryDate: newExp,
            warrantyValidUntil: newExp,
            status: 'active',
          };
        } else if (remaining <= 3 && !sub.autoRenew) {
          notifiedCount++;
          return {
            ...sub,
            status: 'expiring_soon',
          };
        }
        return sub;
      })
    );

    return { renewedCount, notifiedCount };
  };

  const fastForwardSimulationDays = (days: number) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        const newExpiry = new Date(new Date(sub.expiryDate).getTime() - days * 24 * 60 * 60 * 1000).toISOString();
        const remaining = (new Date(newExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        let status: UserSubscription['status'] = 'active';
        if (remaining <= 0) status = 'expired';
        else if (remaining <= 3) status = 'expiring_soon';

        return {
          ...sub,
          expiryDate: newExpiry,
          status,
        };
      })
    );
  };

  const createSupportTicket = (subject: string, category: SupportTicket['category'], initialMessage: string): SupportTicket => {
    const newTkt: SupportTicket = {
      id: generateRandomId('tkt'),
      ticketNumber: `TKT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
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
          timestamp: new Date().toISOString(),
        },
      ],
    };

    setTickets((prev) => [newTkt, ...prev]);

    // AI automated assistant reply simulation after 1.5s
    setTimeout(() => {
      setTickets((curr) =>
        curr.map((t) =>
          t.id === newTkt.id
            ? {
                ...t,
                status: 'in_progress',
                messages: [
                  ...t.messages,
                  {
                    id: generateRandomId('msg'),
                    sender: 'agent',
                    senderName: 'SubNexus AI Rapid Assistant',
                    content: `Hello ${user.name}! We received your request regarding "${subject}". Our automated warranty system is checking your subscription status. If credentials need refreshing, a new secure slot is ready in your Vault!`,
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : t
        )
      );
    }, 1200);

    return newTkt;
  };

  const replyToTicket = (ticketId: string, content: string, sender: 'user' | 'agent') => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              updatedAt: new Date().toISOString(),
              messages: [
                ...t.messages,
                {
                  id: generateRandomId('msg'),
                  sender,
                  senderName: sender === 'user' ? user.name : 'SubNexus Support Agent',
                  content,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : t
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        products,
        selectedProduct,
        setSelectedProduct,
        cart,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        cartSubtotal,
        cartDiscount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        processCheckout,
        orders,
        latestOrder,
        setLatestOrder,
        subscriptions,
        toggleAutoRenew,
        extendSubscription,
        activeVaultSub,
        setActiveVaultSub,
        user,
        setUser,
        toggleUserRole,
        financialMetrics,
        emailNotifications,
        sendTestEmail,
        triggerRenewalCronSimulation,
        fastForwardSimulationDays,
        tickets,
        createSupportTicket,
        replyToTicket,
        activeSearchQuery,
        setActiveSearchQuery,
        activeCategoryFilter,
        setActiveCategoryFilter,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
