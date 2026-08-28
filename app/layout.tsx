import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { Navbar } from '@/components/navbar/Navbar';
import { Footer } from '@/components/footer/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductModal } from '@/components/store/ProductModal';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { CredentialVaultModal } from '@/components/vault/CredentialVaultModal';
import { WriteReviewModal } from '@/components/reviews/WriteReviewModal';
import { FloatingLiveChat } from '@/components/chat/FloatingLiveChat';
import { JsonLd } from '@/components/seo/JsonLd';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { InteractiveCursorGlow } from '@/components/ui/InteractiveCursorGlow';
import { HydrationGuard } from '@/components/ui/HydrationGuard';
import { LoadingRevealScreen } from '@/components/ui/LoadingRevealScreen';

export const metadata: Metadata = {
  metadataBase: new URL('https://keyoon.com'),
  title: {
    default: 'Keyoon — Premium Digital Subscriptions & Retail Marketplace | ChatGPT, Netflix, Claude, Gemini',
    template: '%s | Keyoon — Premium Subscriptions',
  },
  description: 'Buy 100% genuine digital subscriptions on Keyoon. Instant 30-second automated vault delivery for ChatGPT Plus, Claude Pro, Netflix 4K UHD, Gemini Advanced, YouTube Premium, Adobe Creative Cloud, and NordVPN with bKash, Nagad & Rocket. 100% replacement warranty.',
  keywords: [
    'Keyoon',
    'Keyoon subscriptions',
    'keyoon.com',
    'Keyoon Bangladesh',
    'buy chatgpt plus in bangladesh',
    'chatgpt plus bkash',
    'claude 3.5 pro subscription',
    'netflix 4k uhd account bd',
    'google gemini advanced buy',
    'youtube premium cheap subscription',
    'adobe creative cloud discount bd',
    'midjourney subscription bangladesh',
    'nordvpn premium license',
    'spotify premium family slot',
    'digital subscription marketplace',
    'automated subscription delivery',
    'buy premium accounts bd',
    'verified subscription seller',
  ],
  authors: [{ name: 'Keyoon Inc.', url: 'https://keyoon.com' }],
  creator: 'Keyoon',
  publisher: 'Keyoon',
  applicationName: 'Keyoon Marketplace',
  category: 'ecommerce',
  alternates: {
    canonical: 'https://keyoon.com',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://keyoon.com',
    siteName: 'Keyoon — Premium Subscriptions Marketplace',
    title: 'Keyoon — World-Class Retail Subscription Platform',
    description: 'Instant 30s automated delivery for ChatGPT Plus, Claude Pro, Netflix 4K, Gemini Advanced, and 20+ top subscriptions with full replacement warranty.',
    images: [
      {
        url: 'https://keyoon.com/images/Fabicon.png',
        width: 1024,
        height: 1024,
        alt: 'Keyoon Subscription Platform Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Keyoon — World-Class Retail Subscription Platform',
    description: 'Instant automated delivery for ChatGPT Plus, Claude Pro, Netflix 4K, Gemini Advanced with bKash, Nagad, and Rocket.',
    images: ['https://keyoon.com/images/Fabicon.png'],
    creator: '@keyoon',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/images/Fabicon.png',
    shortcut: '/images/Fabicon.png',
    apple: '/images/Fabicon.png',
  },
  verification: {
    google: 'googlee00d45a9bd1652d0',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <JsonLd />
        {/* Favicon links */}
        <link rel="icon" type="image/png" href="/images/Fabicon.png" />
        <link rel="shortcut icon" type="image/png" href="/images/Fabicon.png" />
        <link rel="apple-touch-icon" href="/images/Fabicon.png" />
        {/* Security meta tags */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        {/* Prevent phone/email detection */}
        <meta name="format-detection" content="telephone=no, email=no, address=no" />
        {/* Canonical URL */}
        <link rel="canonical" href="https://subnexus.io" />
        {/* Fonts — preconnect first, then load with swap to prevent FOIT */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Pre-hydration filter for browser extensions injecting arbitrary attributes like bis_skin_checked */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(typeof window!=='undefined'){var o=console.error;console.error=function(){if(arguments[0]&&typeof arguments[0]==='string'&&arguments[0].indexOf('bis_skin_checked')!==-1){return;}o.apply(console,arguments);};}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-zinc-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600/30 selection:text-cyan-200" suppressHydrationWarning>
        <HydrationGuard />
        <AppProvider>
          <LoadingRevealScreen />
          <ScrollProgress />
          <InteractiveCursorGlow />
          <div className="relative min-h-screen flex flex-col" suppressHydrationWarning>
            <Navbar />
            <main className="flex-1" suppressHydrationWarning>{children}</main>
            <Footer />

            {/* Global Reactive Slide-overs & Modals */}
            <CartDrawer />
            <ProductModal />
            <CheckoutModal />
            <CredentialVaultModal />
            <WriteReviewModal />
            <FloatingLiveChat />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
