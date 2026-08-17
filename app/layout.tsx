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

export const metadata: Metadata = {
  title: 'Keyoon — World-Class Retail Subscription Platform | ChatGPT, Netflix, Gemini, Claude',
  description: 'Buy verified premium subscriptions including ChatGPT Plus, Google Gemini Advanced 2.0, Claude 3.5 Pro, Netflix 4K UHD, YouTube Premium, Adobe CC, and Spotify with instant automated bot delivery on Keyoon.',
  keywords: [
    'keyoon',
    'keyoon subscriptions',
    'retail subscription marketplace',
    'buy chatgpt plus cheap',
    'claude pro subscription',
    'gemini advanced discount',
    'netflix 4k uhd account',
    'youtube premium slot',
  ],
  openGraph: {
    title: 'Keyoon — Elite Retail Subscription Marketplace',
    description: 'Instant automated delivery for ChatGPT Plus, Claude Pro, Netflix 4K, Gemini Advanced, and 20+ top subscriptions at wholesale rates.',
    url: 'https://keyoon.com',
    siteName: 'Keyoon',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'Keyoon Subscription Vault',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
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
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800;900&display=swap"
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
