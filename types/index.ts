export type SubscriptionCategory = 
  | 'all'
  | 'ai'
  | 'streaming'
  | 'dev'
  | 'productivity'
  | 'vpn_security';

export type PlanDuration = '1_month' | '3_months' | '6_months' | '12_months' | 'lifetime';

export type DeliveryType = 'instant_bot' | 'custom_email' | 'slot_invite';

export type AccountType = 'private_account' | 'shared_profile' | 'family_slot' | 'direct_upgrade';

export interface PlanPricing {
  duration: PlanDuration;
  label: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  isPopular?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: SubscriptionCategory;
  tagline: string;
  description: string;
  logo: string;
  bannerGradient: string;
  badge?: string;
  rating: number;
  reviewCount: number;
  deliveryType: DeliveryType;
  accountType: AccountType;
  deliveryTimeEstimate: string; // e.g. "Instant (< 30s)"
  features: string[];
  specs: {
    screens?: number;
    quality?: string;
    warranty: string; // e.g. "Full Term Replacement Warranty"
    platforms: string[];
    region: string;
  };
  pricingTiers: PlanPricing[];
  stockCount: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  instructions: string[];
}

export interface CartItem {
  product: Product;
  selectedPlan: PlanPricing;
  quantity: number;
  customEmail?: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  description: string;
  minOrderAmount?: number;
}

export type PaymentMethod = 'crypto_usdt' | 'crypto_btc' | 'card_stripe' | 'paypal' | 'apple_pay';

export type SubscriptionStatus = 'active' | 'expiring_soon' | 'expired' | 'renewing' | 'paused';

export interface AccountCredentials {
  email: string;
  password?: string;
  profileName?: string;
  pinCode?: string;
  activationKey?: string;
  inviteLink?: string;
  backupCodes?: string[];
  notes?: string;
}

export interface UserSubscription {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productLogo: string;
  planDuration: PlanDuration;
  durationLabel: string;
  pricePaid: number;
  status: SubscriptionStatus;
  startDate: string; // ISO date
  expiryDate: string; // ISO date
  autoRenew: boolean;
  autoRenewReminderDays: number;
  credentials: AccountCredentials;
  accountType: AccountType;
  warrantyValidUntil: string;
  assignedSlot?: string;
  paymentMethod: PaymentMethod;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  userId: string;
  userEmail: string;
  items: {
    productId: string;
    productName: string;
    productLogo: string;
    duration: PlanDuration;
    durationLabel: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  transactionHash?: string;
  deliveryStatus: 'delivered' | 'processing' | 'failed';
  generatedSubscriptionIds: string[];
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'customer' | 'admin';
  joinedDate: string;
  lifetimeSpend: number;
  activeSubscriptionsCount: number;
  preferredCurrency: 'USD' | 'EUR' | 'GBP' | 'CAD';
  emailAlertsEnabled: boolean;
  autoRenewEnabled: boolean;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userEmail: string;
  subject: string;
  category: 'credential_issue' | 'renewal_help' | 'payment_issue' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    sender: 'user' | 'agent' | 'system';
    senderName: string;
    content: string;
    timestamp: string;
  }[];
}

export interface EmailNotification {
  id: string;
  recipientEmail: string;
  subject: string;
  templateType: 'order_fulfillment' | 'renewal_reminder' | 'auto_renewal_success' | 'security_alert' | 'invoice_receipt';
  sentAt: string;
  status: 'sent' | 'queued' | 'failed';
  previewHtml: string;
}

export interface FinancialMetric {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Run Rate
  netRevenueToday: number;
  activeSubscribers: number;
  churnRate: number; // e.g. 1.8%
  averageOrderValue: number;
  growthMoM: number; // e.g. +24.6%
  lifetimeValue: number;
}
