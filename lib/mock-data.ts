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
    logo: '/images/cards/chatgpt-plus.jpg',
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
    logo: '/images/cards/claude-pro.jpg',
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
    logo: '/images/cards/netflix-4k.jpg',
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
    logo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    bannerGradient: 'from-emerald-600/30 to-zinc-900',
    rating: 4.96,
    reviewCount: 8120,
    deliveryType: 'slot_invite',
    accountType: 'direct_upgrade',
    deliveryTimeEstimate: 'Instant (< 30s)',
    features: ['High bitrate audio', 'No ads between songs', 'Offline download support'],
    specs: {
      screens: 3,
      quality: '320kbps Extreme Audio',
      warranty: 'Full Period Replacement',
      platforms: ['Mobile', 'Desktop', 'Speaker'],
      region: 'Global'
    },
    pricingTiers: [
      { duration: '3_months', label: '3 Months', price: 8.99, originalPrice: 35.97, discountPercentage: 75 },
      { duration: '6_months', label: '6 Months', price: 15.99, originalPrice: 71.94, discountPercentage: 77, isPopular: true },
      { duration: '12_months', label: '12 Months', price: 26.99, originalPrice: 143.88, discountPercentage: 81 },
    ],
    stockCount: 88,
    instructions: [
      'Receive Spotify invite link.',
      'Join designated family plan.',
      'Verify Premium benefits on Spotify.'
    ]
  },
  {
    id: 'cursor-pro',
    name: 'Cursor Pro',
    slug: 'cursor-pro',
    category: 'dev',
    tagline: 'Fast Claude 3.5 & GPT-4o Code Editor',
    description: 'AI-first code editor with multi-file reasoning, fast completions, and full workspace context.',
    logo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    bannerGradient: 'from-cyan-600/30 to-zinc-900',
    rating: 4.99,
    reviewCount: 2150,
    deliveryType: 'instant_bot',
    accountType: 'private_account',
    deliveryTimeEstimate: 'Instant (< 30s)',
    features: ['500 Fast Claude 3.5 requests', 'Multi-file Composer', 'Unlimited slow requests'],
    specs: {
      screens: 2,
      quality: 'Fast Claude 3.5 Sonnet',
      warranty: 'Full Period Replacement',
      platforms: ['macOS', 'Windows', 'Linux'],
      region: 'Global'
    },
    pricingTiers: [
      { duration: '1_month', label: '1 Month', price: 8.99, originalPrice: 20.00, discountPercentage: 55 },
      { duration: '3_months', label: '3 Months', price: 24.99, originalPrice: 60.00, discountPercentage: 58, isPopular: true },
      { duration: '6_months', label: '6 Months', price: 46.99, originalPrice: 120.00, discountPercentage: 60 },
      { duration: '12_months', label: '12 Months', price: 84.99, originalPrice: 240.00, discountPercentage: 64 },
    ],
    stockCount: 38,
    instructions: [
      'Copy Cursor Pro credentials from Vault.',
      'Log into Cursor IDE.',
      'Start using unlimited fast completions.'
    ]
  },
  {
    id: 'adobe-creative-cloud',
    name: 'Adobe Creative Cloud',
    slug: 'adobe-creative-cloud',
    category: 'productivity',
    tagline: '20+ Desktop Apps + Firefly AI Credits',
    description: 'Full Creative Cloud suite with Photoshop, Illustrator, Premiere Pro, After Effects, and 100GB cloud storage.',
    logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    bannerGradient: 'from-red-600/30 to-zinc-900',
    rating: 4.93,
    reviewCount: 1980,
    deliveryType: 'slot_invite',
    accountType: 'direct_upgrade',
    deliveryTimeEstimate: 'Instant (< 45s)',
    features: ['Photoshop, Illustrator, Premiere', 'Firefly Generative AI', '100GB Adobe Cloud'],
    specs: {
      screens: 2,
      quality: 'All 20+ Desktop Apps',
      warranty: 'Full Replacement',
      platforms: ['macOS', 'Windows', 'iPad'],
      region: 'Global'
    },
    pricingTiers: [
      { duration: '3_months', label: '3 Months', price: 29.99, originalPrice: 179.97, discountPercentage: 83 },
      { duration: '6_months', label: '6 Months', price: 54.99, originalPrice: 359.94, discountPercentage: 84, isPopular: true },
      { duration: '12_months', label: '12 Months', price: 94.99, originalPrice: 719.88, discountPercentage: 86 },
    ],
    stockCount: 29,
    instructions: [
      'Provide your Adobe ID at checkout.',
      'Accept team organization invitation.',
      'All apps will activate automatically in Creative Cloud desktop app.'
    ]
  },
  {
    id: 'nordvpn-complete',
    name: 'NordVPN Complete',
    slug: 'nordvpn-complete',
    category: 'vpn_security',
    tagline: 'Encrypted VPN + Threat Protection + 1TB Cloud',
    description: 'High-speed encrypted VPN across 111 countries with malware protection and cross-platform password manager.',
    logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
    bannerGradient: 'from-blue-600/30 to-zinc-900',
    rating: 4.97,
    reviewCount: 4200,
    deliveryType: 'instant_bot',
    accountType: 'private_account',
    deliveryTimeEstimate: 'Instant (< 30s)',
    features: ['6,000+ Fast Servers in 111 Countries', 'Threat Protection Pro', '10 simultaneous devices'],
    specs: {
      screens: 10,
      quality: 'Ultra 10Gbps Speed',
      warranty: 'Full Period Replacement',
      platforms: ['Windows', 'macOS', 'Linux', 'iOS', 'Android'],
      region: 'Global'
    },
    pricingTiers: [
      { duration: '6_months', label: '6 Months', price: 16.99, originalPrice: 71.94, discountPercentage: 76 },
      { duration: '12_months', label: '12 Months', price: 28.99, originalPrice: 143.88, discountPercentage: 80, isPopular: true },
    ],
    stockCount: 65,
    instructions: [
      'Copy NordVPN login from Vault.',
      'Sign in at nordvpn.com or in NordVPN app.',
      'Connect to any server worldwide.'
    ]
  }
];

export const INITIAL_USER_PROFILE: CustomerProfile = {
  id: 'usr_88231',
  name: 'Alex Vance',
  email: 'alex.vance@subnexus.dev',
  role: 'customer',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  walletBalance: 45.00,
  joinedDate: '2026-01-15',
};

export const INITIAL_USER_SUBSCRIPTIONS: UserSubscription[] = [
  {
    id: 'sub_chatgpt_01',
    productId: 'chatgpt-plus',
    productName: 'ChatGPT Plus',
    logo: '/images/cards/chatgpt-plus.jpg',
    category: 'ai',
    duration: '3_months',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    autoRenew: true,
    pricePaid: 21.99,
    accountCredentials: {
      email: 'alex.vance+ai@subnexus-vault.io',
      password: 'NxP$92!kL8mQw1',
      pin: '8492',
      notes: 'Private Dedicated Account. Direct login at chatgpt.com',
    },
  },
  {
    id: 'sub_netflix_02',
    productId: 'netflix-4k-uhd',
    productName: 'Netflix 4K UHD',
    logo: '/images/cards/netflix-4k.jpg',
    category: 'streaming',
    duration: '6_months',
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 165 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    autoRenew: false,
    pricePaid: 25.99,
    accountCredentials: {
      email: 'nf-pool-881@subnexus-vip.com',
      password: 'Nflx*99$Vault!',
      pin: '4401',
      profileSlotName: 'Slot 3 - Alex',
      notes: 'Use Profile: Slot 3 - Alex with PIN 4401. 4K HDR enabled.',
    },
  },
  {
    id: 'sub_cursor_03',
    productId: 'cursor-pro',
    productName: 'Cursor Pro',
    logo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    category: 'dev',
    duration: '1_month',
    startDate: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'expiring_soon',
    autoRenew: true,
    pricePaid: 8.99,
    accountCredentials: {
      email: 'alex.vance+dev@subnexus-vault.io',
      password: 'Dev*Cursor$2026',
      notes: 'Sign into Cursor IDE with these credentials to activate fast requests.',
    },
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_9901',
    orderNumber: 'SNX-89124',
    userId: 'usr_88231',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        product: MOCK_PRODUCTS[0],
        selectedPlan: MOCK_PRODUCTS[0].pricingTiers[1],
        quantity: 1,
      },
    ],
    subtotal: 21.99,
    discount: 0,
    total: 21.99,
    paymentMethod: 'stripe_card',
    paymentStatus: 'paid',
    deliveryStatus: 'delivered',
  },
  {
    id: 'ord_9902',
    orderNumber: 'SNX-89155',
    userId: 'usr_88231',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        product: MOCK_PRODUCTS[3],
        selectedPlan: MOCK_PRODUCTS[3].pricingTiers[2],
        quantity: 1,
      },
    ],
    subtotal: 25.99,
    discount: 0,
    total: 25.99,
    paymentMethod: 'crypto_usdt',
    paymentStatus: 'paid',
    deliveryStatus: 'delivered',
  },
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt_101',
    userId: 'usr_88231',
    userEmail: 'alex.vance@subnexus.dev',
    subject: 'Requesting extra OpenAI workspace seats',
    category: 'custom_order',
    status: 'open',
    priority: 'high',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    messages: [
      {
        id: 'msg_1',
        sender: 'user',
        content: 'Hi! Can I upgrade my ChatGPT Plus tier to a team pool for 5 seats?',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg_2',
        sender: 'agent',
        content: 'Hello Alex! Absolutely. We can allocate a dedicated 5-seat workspace from our enterprise pool at $32.99/mo. Let us know if you want us to provision it.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

export const INITIAL_FINANCIAL_METRICS: FinancialMetric = {
  totalRevenue: 48920.50,
  monthlyRecurringRevenue: 14250.00,
  activeSubscribers: 1840,
  autoRenewalRate: 78.4,
  churnRate: 3.2,
  renewalProjections: [
    { day: 'Day 1-7', count: 142, revenue: 2980 },
    { day: 'Day 8-14', count: 210, revenue: 4410 },
    { day: 'Day 15-21', count: 185, revenue: 3890 },
    { day: 'Day 22-30', count: 320, revenue: 6720 },
  ],
};
