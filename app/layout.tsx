import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { Navbar } from '@/components/navbar/Navbar';
import { Footer } from '@/components/footer/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductModal } from '@/components/store/ProductModal';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { CredentialVaultModal } from '@/components/vault/CredentialVaultModal';
import { JsonLd } from '@/components/seo/JsonLd';
import { ScrollProgress } from '@/components/ui/ScrollProgress';

export const metadata: Metadata = {
  title: 'SubNexus — World-Class Retail Subscription Platform | ChatGPT, Netflix, Gemini, Claude',
  description: 'Buy verified premium subscriptions including ChatGPT Plus, Google Gemini Advanced 2.0, Claude 3.5 Pro, Netflix 4K UHD, YouTube Premium, Adobe CC, and Spotify with instant automated bot delivery.',
  keywords: [
    'retail subscription marketplace',
    'buy chatgpt plus cheap',
    'claude pro subscription',
    'gemini advanced discount',
    'netflix 4k uhd account',
    'youtube premium slot',
  ],
  openGraph: {
    title: 'SubNexus — Elite Retail Subscription Marketplace',
    description: 'Instant automated delivery for ChatGPT Plus, Claude Pro, Netflix 4K, Gemini Advanced, and 20+ top subscriptions at wholesale rates.',
    url: 'https://subnexus.io',
    siteName: 'SubNexus',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'SubNexus Subscription Vault',
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
      </head>
      <body className="min-h-screen bg-zinc-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600/30 selection:text-cyan-200" suppressHydrationWarning>
        <AppProvider>
          <ScrollProgress />
          <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />

            {/* Global Reactive Slide-overs & Modals */}
            <CartDrawer />
            <ProductModal />
            <CheckoutModal />
            <CredentialVaultModal />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
