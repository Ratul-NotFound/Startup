export type SubscriptionCategory = 
  | 'all'
  | 'ai'
  | 'streaming'
  | 'dev'
  | 'productivity'
  | 'vpn_security';

export type PlanDuration = '1_month' | '3_months' | '6_months' | '12_months' | 'lifetime' | (string & {});

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

export interface CategoryConfig {
  id: SubscriptionCategory;
  label: string;
  description: string;
  isHidden?: boolean;
  orderIndex: number;
}

export type ProductType = 'general' | 'special';

export type SpecialProductTaskType = 
  | 'join_telegram' 
  | 'follow_facebook' 
  | 'write_review' 
  | 'youtube_sub' 
  | 'discord_join' 
  | 'custom_action';

export interface SpecialProductTask {
  id: string;
  type: SpecialProductTaskType;
  title: string;          // e.g. "Join our Telegram Channel", "Follow on Facebook", "Write a Review"
  description?: string;
  url?: string;            // e.g. "https://t.me/keyoon", "https://facebook.com/keyoon"
  isRequired?: boolean;
}

export interface SpecialProductConfig {
  campaignTitle?: string;          // e.g. "Community Flash Reward Deal"
  campaignBadge?: string;          // e.g. "⚡ Exclusive Mission Deal"
  campaignDescription?: string;    // e.g. "Complete all tasks to unlock 25% OFF this product"
  unlockedCouponCode?: string;     // e.g. "SPECIAL25" (unlocked upon completing tasks)
  discountPercent?: number;        // e.g. 25 or 100 for 100% Free
  isSpecialOfferSynced?: boolean;  // Automatically sync and display in Special Offers & Deals hub
  isPromoCodeHidden?: boolean;     // Hide / unhide promo code banner or offer from storefront
  isFreeProduct?: boolean;         // 100% Free Claim Mode (Tasks required, no payment needed)
  noPaymentRequired?: boolean;     // Explicit flag allowing 0 payment instant checkout
  claimSuccessMessage?: string;    // Custom instant allocation message
  tasks: SpecialProductTask[];
}


export interface Product {
  id: string;
  name: string;
  slug: string;
  category: SubscriptionCategory;
  tagline: string;
  description: string;
  logo: string;
  images?: string[];
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
  isHidden?: boolean;
  orderIndex?: number;
  instructions: string[];
  productType?: ProductType; // 'general' | 'special'
  isFreeProduct?: boolean;   // Directly marked as 100% free claimable product
  specialConfig?: SpecialProductConfig;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  selectedPlan: PlanPricing;
  quantity: number;
  customEmail?: string;
}

export interface GiveawayTask {
  id: string;
  label: string;      // e.g. "Join Telegram Channel", "Follow Facebook Page"
  url: string;        // e.g. "https://t.me/keyoon_deals", "https://facebook.com/keyoon"
  isRequired?: boolean;
  type?: SpecialProductTaskType;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  description: string;
  minOrderAmount?: number;
  applicableProductIds?: string[]; // Empty/undefined = all products
  applicableCategory?: SubscriptionCategory | 'all'; // Restricted to specific category
  expiryDate?: string; // ISO date format (YYYY-MM-DD)
  maxUses?: number; // Maximum total usage limit
  usedCount?: number; // Times redeemed so far
  isSpecialOffer?: boolean;
  offerTag?: string;
  offerTitle?: string;
  offerImage?: string;
  type?: 'discount' | 'giveaway' | 'special_deal' | 'bundle_offer';
  isRecurringDiscount?: boolean;
  requiredTasks?: GiveawayTask[]; // Social tasks required to unlock code
  isHidden?: boolean; // Hide deal/coupon from Storefront Deals Hub
  orderIndex?: number; // Display sequence order on Storefront Deals Hub
  linkedProductId?: string; // Bidirectional link to a special product
  usedByUsers?: string[];   // User IDs / emails who have already redeemed this promo code (1 use per user)
}

export interface SpecialOffersSettings {
  isSectionHidden?: boolean; // Toggle entire Deals & Offers section on/off
  badgeTitle?: string;       // e.g. "Special Offers & Promo Hub"
  sectionHeading?: string;   // e.g. "Exclusive Deals & Giveaways"
  sectionSubtitle?: string;  // Subtitle description text
  updatedAt?: string;
}

export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'upay' | 'crypto_usdt' | 'card_stripe' | 'free_claim' | 'custom';

export interface BangladeshPaymentMethod {
  id: string;
  name: string; // e.g. "bKash Personal", "Nagad Personal", "Rocket"
  type: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'custom';
  accountNumber: string; // e.g. "017XXXXXXXX"
  accountType: 'Personal' | 'Merchant' | 'Agent';
  qrCodeImage?: string; // image URL or compressed Base64
  instructions?: string; // e.g. "Send Money (Personal) to this number and enter your Transaction ID"
  bdtRate: number; // e.g. 125 BDT per USD
  isActive: boolean;
  showQrCode?: boolean; // toggle to show/hide QR code on checkout
  color?: string; // Brand accent color e.g. "#e2136e" for bkash, "#f7931e" for nagad, "#8c3494" for rocket
  updatedAt?: string;
}

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
  orderNumber?: string;
  productId: string;
  productName: string;
  productLogo: string;
  planDuration: PlanDuration;
  durationLabel: string;
  pricePaid: number;
  renewalPrice?: number;
  appliedCouponCode?: string;
  initialDiscountPercent?: number;
  isGiveaway?: boolean;
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
  userId?: string;
  userEmail?: string;
  claimEmail?: string; // Target email where credentials/offer are delivered
  credentialsConfigured?: boolean; // false = admin needs to set real credentials
}


export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  userId: string;
  userEmail: string;
  claimEmail?: string; // Target email where user wants to claim/receive subscription
  items: {
    productId: string;
    productName: string;
    productLogo: string;
    duration: PlanDuration;
    durationLabel: string;
    price: number;
    quantity: number;
    accountType?: AccountType;
  }[];
  subtotal: number;
  discount: number;
  couponCode?: string;        // Coupon code used (if any)
  couponDiscount?: number;    // Discount amount from coupon in BDT/USD
  total: number;
  totalBdt?: number;
  paymentMethod: PaymentMethod;
  paymentMethodName?: string;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  deliveryStatus: 'delivered' | 'processing' | 'failed';
  generatedSubscriptionIds: string[];
  // Bangladesh Payment Verification Fields
  senderNumber?: string;      // Phone number from which money was sent
  transactionId?: string;     // TrxID from bKash/Nagad/Rocket SMS
  screenshotUrl?: string;     // Compressed screenshot proof
  adminNotes?: string;
  rejectionReason?: string;   // Reason if order was rejected
  verifiedAt?: string;
  verifiedBy?: string;
  paymentVerifiedAt?: string; // When payment was marked verified (before delivery)
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
  preferredCurrency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'BDT';
  emailAlertsEnabled: boolean;
  autoRenewEnabled: boolean;
  isEmailVerified?: boolean;
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
    imageUrl?: string;
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

export interface AdminMember {
  id: string;
  email: string;
  name?: string;
  role: 'superadmin' | 'admin';
  addedBy: string;
  addedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userEmail?: string;
  productId: string;
  productName: string;
  productLogo?: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string; // ISO date
  likes: number;
  likedBy?: string[];
  planDuration?: string;
}

export interface FloatingLogo {
  id?: string;
  name: string;
  badge: string;
  image: string;
  color: string;
  pos?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  floatDuration?: number;
  floatDelay?: number;
}

export interface HeroSlide {
  id: string;
  tag?: string;
  title?: string;
  sub?: string;
  bgImage: string;
  ctaText?: string;
  ctaLink?: string;
  order?: number;
  // Bangla Fields
  tagBangla?: string;
  titleBangla?: string;
  titleHighlight?: string;
  subBangla?: string;
  ctaTextBangla?: string;
  secondaryCtaTextBangla?: string;
  secondaryCtaLink?: string;
  // Floating Brand Logos
  floatingLogos?: FloatingLogo[];
}

export interface QuickMessage {
  id: string;
  label: string;
  query: string;
  answer: string;
  keywords?: string[];
  order?: number;
  isActive: boolean;
}

export interface AdminActivityLog {
  id: string;
  adminEmail: string;
  adminName?: string;
  action: string;
  category: 'orders' | 'vault' | 'catalog' | 'coupons' | 'payments' | 'admins' | 'system';
  details: string;
  targetId?: string;
  timestamp: string;
}

export interface BrandSettings {
  brandName?: string;
  brandTagline?: string;
  navbarLogoUrl?: string;
  faviconUrl?: string;
  updatedAt?: string;
}

export interface CurrencySettings {
  bdtEnabled: boolean;         // Master toggle — if false, all users see USD
  bdtCountries: string[];      // ISO-3166 country codes that get BDT, e.g. ["BD"]
  bdtRate: number;             // 1 USD = X BDT, e.g. 125
  updatedAt?: string;
  updatedBy?: string;
}

export interface ChatMessageMetadata {
  type?: 'warranty_claim' | 'credential_issue' | 'order_inquiry' | 'general';
  subscriptionId?: string;
  productName?: string;
  orderNumber?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system' | 'bot';
  senderName: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  metadata?: ChatMessageMetadata;
}

export interface CustomerChatThread {
  id: string; // userId or userEmail
  userId: string;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  lastMessageText: string;
  lastMessageSender: 'user' | 'agent' | 'system' | 'bot';
  lastMessageTimestamp: string;
  updatedAt: string;
  createdAt: string;
  unreadCountAdmin: number;
  unreadCountUser: number;
  messages: ChatMessage[];
  metadata?: ChatMessageMetadata;
  isUserTyping?: boolean;
  isAdminTyping?: boolean;
  lastUserActive?: string;
  lastAdminActive?: string;
  assignedAgentId?: number | string;
  assignedAgentName?: string;
  assignedAgentUsername?: string;
  claimedAt?: string;
  telegramGroupMessageId?: number;
}
