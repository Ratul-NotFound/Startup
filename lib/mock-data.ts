import { Product, Coupon, CustomerProfile, UserSubscription, Order, SupportTicket, FinancialMetric } from '@/types';

export const MOCK_COUPONS: Coupon[] = [
  {
    code: 'NEXUS20',
    discountPercent: 20,
    description: '20% discount',
  },
  {
    code: 'VIP50',
    discountPercent: 50,
    description: '50% discount on annual plans',
    minOrderAmount: 40,
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'chatgpt-plus',
    name: 'ChatGPT Plus',
    slug: 'chatgpt-plus',
    category: 'ai',
    tagline: 'GPT-4o, Canvas, DALL-E & Advanced Voice',
    description: 'Official OpenAI Plus with priority access and full model capabilities.',
    logo: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80',
    bannerGradient: 'from-emerald-600/30 to-zinc-900',
    rating: 4.98,
    reviewCount: 4120,
    deliveryType: 'instant_bot',
    accountType: 'private_account',
    deliveryTimeEstimate: 'Instant (< 30s)',
    features: ['GPT-4o & Canvas access', 'Advanced Voice Mode', 'Full term warranty'],
    specs: {
      screens: 2,
      quality: 'Ultra High Speed',
      warranty: 'Full Period Replacement',
      platforms: ['Web', 'iOS', 'Android', 'macOS'],
      region: 'Global'
    },
    pricingTiers: [
      { duration: '1_month', label: '1 Month', price: 7.99, originalPrice: 20.00, discountPercentage: 60 },
      { duration: '3_months', label: '3 Months', price: 21.99, originalPrice: 60.00, discountPercentage: 63, isPopular: true },
      { duration: '6_months', label: '6 Months', price: 39.99, originalPrice: 120.00, discountPercentage: 66 },
      { duration: '12_months', label: '12 Months', price: 69.99, originalPrice: 240.00, discountPercentage: 70 },
    ],
    stockCount: 84,
    instructions: [
      'Copy credentials from your Vault.',
      'Log in at chatgpt.com.',
      'Start using GPT-4o Plus immediately.'
    ]
  },
  {
    id: 'gemini-advanced',
    name: 'Gemini Advanced',
    slug: 'gemini-advanced',
    category: 'ai',
    tagline: 'Gemini 2.0 Pro + 2TB Google One Storage',
    description: 'Google next-gen AI with 2M token context window and 2TB cloud storage.',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    bannerGradient: 'from-blue-600/30 to-zinc-900',
    rating: 4.95,
    reviewCount: 2840,
    deliveryType: 'instant_bot',
    accountType: 'direct_upgrade',
    deliveryTimeEstimate: 'Instant (< 30s)',
    features: ['Gemini 2.0 Flash & Pro', '2 Million token context', '2TB Google One Storage'],
    specs: {
      screens: 5,
      quality: '2M Token Context',
      warranty: 'Full Period Replacement',
      platforms: ['Web', 'Android', 'iOS', 'Workspace'],
      region: 'Global'
    },
    pricingTiers: [
      { duration: '1_month', label: '1 Month', price: 6.99, originalPrice: 19.99, discountPercentage: 65 },
      { duration: '3_months', label: '3 Months', price: 18.99, originalPrice: 59.97, discountPercentage: 68 },
      { duration: '6_months', label: '6 Months', price: 34.99, originalPrice: 119.94, discountPercentage: 70, isPopular: true },
      { duration: '12_months', label: '12 Months', price: 59.99, originalPrice: 239.88, discountPercentage: 75 },
    ],
    stockCount: 62,
    instructions: [
      'Click invitation link in your Vault.',
      'Accept Google One membership.',
      'Verify Advanced status at gemini.google.com.'
    ]
  },
  {
    id: 'claude-pro',
    name: 'Claude 3.5 Pro',
    slug: 'claude-pro',
    category: 'ai',
    tagline: 'Anthropic Claude 3.5 Sonnet & Artifacts',
    description: 'Premier AI assistant for engineering, architecture, and coding.',
    logo: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80',
    bannerGradient: 'from-amber-600/30 to-zinc-900',
    rating: 4.99,
    reviewCount: 3950,
    deliveryType: 'instant_bot',
    accountType: 'private_account',
    deliveryTimeEstimate: 'Instant (< 30s)',
    features: ['Claude 3.5 Sonnet model', '5x peak usage limits', 'Interactive Artifacts workspace'],
    specs: {
      screens: 2,
      quality: 'Artifacts Enabled',
      warranty: 'Full Replacement',
      platforms: ['Web', 'iOS', 'Android'],
      region: 'Global'
    },
    pricingTiers: [
      { duration: '1_month', label: '1 Month', price: 8.49, originalPrice: 20.00, discountPercentage: 58 },
      { duration: '3_months', label: '3 Months', price: 23.99, originalPrice: 60.00, discountPercentage: 60, isPopular: true },
      { duration: '6_months', label: '6 Months', price: 44.99, originalPrice: 120.00, discountPercentage: 62 },
      { duration: '12_months', label: '12 Months', price: 79.99, originalPrice: 240.00, discountPercentage: 66 },
    ],
    stockCount: 45,
    instructions: [
      'Get login details from Vault.',
      'Sign in at claude.ai.',
      'Enjoy Claude 3.5 Pro.'
    ]
  },
  {
    id: 'netflix-4k-uhd',
    name: 'Netflix 4K UHD',
    slug: 'netflix-4k-uhd',
    category: 'streaming',
    tagline: '4K Ultra HD, Dolby Atmos & Dedicated Profile',
    description: 'Watch all films and series in 4K HDR with dedicated PIN-locked profile.',
    logo: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80',
    bannerGradient: 'from-red-600/30 to-zinc-900',
    rating: 4.94,
    reviewCount: 9240,
    deliveryType: 'instant_bot',
    accountType: 'private_account',
    deliveryTimeEstimate: 'Instant (< 30s)',
    features: ['4K Ultra HD & Dolby Atmos', 'Dedicated PIN profile', 'TV & mobile compatible'],
    specs: {
      screens: 4,
      quality: '4K Ultra HD',
      warranty: 'Full Period Replacement',
      platforms: ['Smart TV', 'Apple TV', 'Mobile', 'Web'],
      region: 'Global'
    },
    pricingTiers: [
      { duration: '1_month', label: '1 Month', price: 4.99, originalPrice: 22.99, discountPercentage: 78 },
      { duration: '3_months', label: '3 Months', price: 13.99, originalPrice: 68.97, discountPercentage: 80, isPopular: true },
      { duration: '6_months', label: '6 Months', price: 25.99, originalPrice: 137.94, discountPercentage: 81 },
      { duration: '12_months', label: '12 Months', price: 46.99, originalPrice: 275.88, discountPercentage: 83 },
    ],
    stockCount: 120,
    instructions: [
      'Check profile name and PIN in Vault.',
      'Log into Netflix.',
      'Select designated profile.'
    ]
  },
  {
    id: 'youtube-premium',
    name: 'YouTube Premium',
    slug: 'youtube-premium',
    category: 'streaming',
    tagline: 'Zero Ads, Background Play & YouTube Music',
    description: 'Ad-free playback across all devices plus high-fidelity music streaming.',
    logo: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
    bannerGradient: 'from-rose-600/30 to-zinc-900',
    rating: 4.97,
    reviewCount: 6510,
    deliveryType: 'slot_invite',
    accountType: 'direct_upgrade',
    deliveryTimeEstimate: 'Instant (< 30s)',
    features: ['100% Ad-free viewing', 'Background audio playback', 'YouTube Music included'],
    specs: {
      screens: 10,
      quality: 'Ad-Free 4K',
      warranty: 'Full Term Warranty',
      platforms: ['TV', 'Mobile', 'Web'],
      region: 'Global'
    },
    pricingTiers: [
      { duration: '3_months', label: '3 Months', price: 9.99, originalPrice: 41.97, discountPercentage: 76 },
      { duration: '6_months', label: '6 Months', price: 17.99, originalPrice: 83.94, discountPercentage: 78, isPopular: true },
      { duration: '12_months', label: '12 Months', price: 29.99, originalPrice: 167.88, discountPercentage: 82 },
    ],
    stockCount: 95,
    instructions: [
      'Enter Google email at checkout.',
      'Accept invitation link.',
      'Enjoy YouTube Premium.'
    ]
  },
  {
    id: 'spotify-premium',
    name: 'Spotify Premium',
    slug: 'spotify-premium',
    category: 'streaming',
    tagline: 'Ad-Free 320kbps & Offline Downloads',
    description: 'Unlimited skips and offline music on your personal account.',
    logo: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=600&auto=format&fit=crop&q=80',
    bannerGradient: 'from-emerald-600/30 to-zinc-900',
    rating: 4.96,
    reviewCount: 5200,
    deliveryType: 'slot_invite',
    accountType: 'direct_upgrade',
    deliveryTimeEstimate: 'Instant (< 30s)',
    features: ['Ad-free music streaming', 'Offline downloads', 'Keeps existing playlists'],
    specs: {
      screens: 3,
      quality: '320kbps Audio',
      warranty: 'Full Term Warranty',
      platforms: ['Mobile', 'Desktop', 'Web'],
      region: 'Global'
    },
    pricingTiers: [
      { duration: '3_months', label: '3 Months', price: 8.99, originalPrice: 35.97, discountPercentage: 75 },
      { duration: '6_months', label: '6 Months', price: 15.99, originalPrice: 71.94, discountPercentage: 77 },
      { duration: '12_months', label: '12 Months', price: 26.99, originalPrice: 143.88, discountPercentage: 81, isPopular: true },
    ],
    stockCount: 88,
    instructions: [
      'Click invite link in Vault.',
      'Upgrade your personal account.'
    ]
  },
  {
    id: 'adobe-creative-cloud',
    name: 'Adobe Creative Cloud',
    slug: 'adobe-creative-cloud',
    category: 'productivity',
    tagline: '20+ Desktop Apps + Firefly AI Credits',
    description: 'Full suite including Photoshop, Illustrator, Premiere Pro, and 100GB Cloud.',
    logo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&auto=format&fit=crop&q=80',
    bannerGradient: 'from-purple-600/30 to-zinc-900',
    rating: 4.93,
    reviewCount: 3100,
    deliveryType: 'custom_email',
    accountType: 'direct_upgrade',
    deliveryTimeEstimate: 'Instant (< 45s)',
    features: ['Photoshop, Illustrator, Premiere', 'Firefly Generative AI', '100GB Cloud Storage'],
    specs: {
      screens: 2,
      quality: 'Official Apps',
      warranty: 'Full Term Guarantee',
      platforms: ['macOS', 'Windows', 'iPadOS'],
      region: 'Global'
    },
    pricingTiers: [
      { duration: '3_months', label: '3 Months', price: 29.99, originalPrice: 179.97, discountPercentage: 83 },
      { duration: '6_months', label: '6 Months', price: 49.99, originalPrice: 359.94, discountPercentage: 86, isPopular: true },
      { duration: '12_months', label: '12 Months', price: 79.99, originalPrice: 719.88, discountPercentage: 88 },
    ],
    stockCount: 38,
    instructions: [
      'Provide Adobe ID email.',
      'Accept team invitation.',
      'Install desktop applications.'
    ]
  },
  {
    id: 'cursor-pro',
    name: 'Cursor Pro',
    slug: 'cursor-pro',
    category: 'dev',
    tagline: 'Fast Claude 3.5 & GPT-4o Code Editor',
    description: 'AI code editor with multi-file composer and full codebase indexing.',
    logo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    bannerGradient: 'from-indigo-600/30 to-zinc-900',
    rating: 4.98,
    reviewCount: 3670,
    deliveryType: 'instant_bot',
    accountType: 'private_account',
    deliveryTimeEstimate: 'Instant (< 30s)',
    features: ['500 Fast Claude 3.5 requests', 'Multi-file Composer', 'Full codebase indexing'],
    specs: {
      screens: 2,
      quality: 'Pro Tier',
      warranty: 'Full Replacement',
      platforms: ['macOS', 'Windows', 'Linux'],
      region: 'Global'
    },
    pricingTiers: [
      { duration: '1_month', label: '1 Month', price: 8.99, originalPrice: 20.00, discountPercentage: 55 },
      { duration: '3_months', label: '3 Months', price: 24.99, originalPrice: 60.00, discountPercentage: 58, isPopular: true },
      { duration: '6_months', label: '6 Months', price: 46.99, originalPrice: 120.00, discountPercentage: 60 },
      { duration: '12_months', label: '12 Months', price: 79.99, originalPrice: 240.00, discountPercentage: 66 },
    ],
    stockCount: 52,
    instructions: [
      'Open Cursor settings.',
      'Sign in with Vault credentials.'
    ]
  },
  {
    id: 'nordvpn-complete',
    name: 'NordVPN Complete',
    slug: 'nordvpn-complete',
    category: 'vpn_security',
    tagline: '6000+ Servers, Ad-Block & Threat Defense',
    description: 'High-speed WireGuard VPN with 10 device connections.',
    logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
    bannerGradient: 'from-blue-600/30 to-zinc-900',
    rating: 4.92,
    reviewCount: 3890,
    deliveryType: 'instant_bot',
    accountType: 'private_account',
    deliveryTimeEstimate: 'Instant (< 30s)',
    features: ['6,000+ global servers', 'Threat Protection', '10 devices supported'],
    specs: {
      screens: 10,
      quality: '10Gbps Speed',
      warranty: 'Full Replacement',
      platforms: ['Windows', 'macOS', 'iOS', 'Android'],
      region: 'Global'
    },
    pricingTiers: [
      { duration: '6_months', label: '6 Months', price: 16.99, originalPrice: 71.94, discountPercentage: 76 },
      { duration: '12_months', label: '12 Months', price: 29.99, originalPrice: 143.88, discountPercentage: 79, isPopular: true },
    ],
    stockCount: 75,
    instructions: [
      'Log into NordVPN with Vault credentials.',
      'Connect to any server.'
    ]
  }
];

export const INITIAL_USER_PROFILE: CustomerProfile = {
  id: 'usr-9941',
  name: 'Alex Vance',
  email: 'alex.vance@techcorp.io',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  role: 'customer',
  joinedDate: '2024-03-15T00:00:00.000Z',
  lifetimeSpend: 289.45,
  activeSubscriptionsCount: 3,
  preferredCurrency: 'USD',
  emailAlertsEnabled: true,
  autoRenewEnabled: true,
};

export const INITIAL_USER_SUBSCRIPTIONS: UserSubscription[] = [
  {
    id: 'sub-881',
    orderId: 'ord-1092',
    productId: 'chatgpt-plus',
    productName: 'ChatGPT Plus',
    productLogo: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80',
    planDuration: '3_months',
    durationLabel: '3 Months',
    pricePaid: 21.99,
    status: 'active',
    startDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: true,
    autoRenewReminderDays: 3,
    accountType: 'private_account',
    warrantyValidUntil: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'crypto_usdt',
    credentials: {
      email: 'gpt.nexus.user881@openai-vault.net',
      password: 'NexusAI#9941*SecretKey!',
      notes: 'Private account - warranty active.',
    },
  },
  {
    id: 'sub-882',
    orderId: 'ord-1075',
    productId: 'netflix-4k-uhd',
    productName: 'Netflix 4K UHD',
    productLogo: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80',
    planDuration: '6_months',
    durationLabel: '6 Months',
    pricePaid: 25.99,
    status: 'active',
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: true,
    autoRenewReminderDays: 3,
    accountType: 'shared_profile',
    warrantyValidUntil: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'card_stripe',
    credentials: {
      email: 'stream.master.vip44@subnet-stream.com',
      password: 'Cinema#4K@UltraDolby2025',
      profileName: 'Profile #3 (Alex)',
      pinCode: '7482',
      notes: 'Profile 3 with PIN 7482.',
    },
  },
  {
    id: 'sub-883',
    orderId: 'ord-1044',
    productId: 'claude-pro',
    productName: 'Claude 3.5 Pro',
    productLogo: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80',
    planDuration: '1_month',
    durationLabel: '1 Month',
    pricePaid: 8.49,
    status: 'expiring_soon',
    startDate: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: false,
    autoRenewReminderDays: 3,
    accountType: 'private_account',
    warrantyValidUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod: 'crypto_usdt',
    credentials: {
      email: 'anthropic.pro.alex88@claude-vip.org',
      password: 'Claude#DevGod#98124',
      notes: 'Expiring in 3 days.',
    },
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1092',
    orderNumber: 'SN-1092',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'usr-9941',
    userEmail: 'alex.vance@techcorp.io',
    items: [
      {
        productId: 'chatgpt-plus',
        productName: 'ChatGPT Plus',
        productLogo: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80',
        duration: '3_months',
        durationLabel: '3 Months',
        price: 21.99,
        quantity: 1,
      },
    ],
    subtotal: 21.99,
    discount: 0,
    total: 21.99,
    paymentMethod: 'crypto_usdt',
    paymentStatus: 'paid',
    transactionHash: '0x8f2a74c1094ba4817dce92bf394a4c58102eb9297298a0ef93c5d8a98b1',
    deliveryStatus: 'delivered',
    generatedSubscriptionIds: ['sub-881'],
  },
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-401',
    ticketNumber: 'TKT-401',
    userId: 'usr-9941',
    userEmail: 'alex.vance@techcorp.io',
    subject: 'Netflix TV Profile PIN help',
    category: 'general',
    priority: 'medium',
    status: 'resolved',
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 49 * 24 * 60 * 60 * 1000).toISOString(),
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        senderName: 'Alex Vance',
        content: 'How do I set the PIN on my TV profile?',
        timestamp: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg-2',
        sender: 'agent',
        senderName: 'Support (Elena)',
        content: 'Use PIN 7482 under Profile Lock settings.',
        timestamp: new Date(Date.now() - 49 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

export const INITIAL_FINANCIAL_METRICS: FinancialMetric = {
  mrr: 48920.00,
  arr: 587040.00,
  netRevenueToday: 3410.50,
  activeSubscribers: 4280,
  churnRate: 1.4,
  averageOrderValue: 34.80,
  growthMoM: 28.4,
  lifetimeValue: 142.50,
};
