/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ─── Images: explicit allowed hostnames instead of wildcard ────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google OAuth avatars
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'i.giphy.com' },
      { protocol: 'https', hostname: 'media.giphy.com' },
    ],
  },

  // ─── HTTP Security Headers ─────────────────────────────────────────
  async headers() {
    return [
      {
        // Apply to every route
        source: '/:path*',
        headers: [
          // Prevent clickjacking while allowing self/Firebase Auth frame communication
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // Prevent MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Control referrer info sent on navigation
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Force HTTPS for 1 year + include subdomains
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Permissions policy — disable unneeded browser APIs
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              // Default: only self
              "default-src 'self'",
              // Scripts: self + Next.js inline scripts + Firebase SDKs + Google APIs
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://www.googletagmanager.com https://*.firebaseapp.com",
              // Styles: self + inline (Tailwind needs this)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts: Google Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Images: allow self + known CDNs
              "img-src 'self' data: blob: https://images.unsplash.com https://ui-avatars.com https://lh3.googleusercontent.com https://firebasestorage.googleapis.com https://www.googletagmanager.com https://i.giphy.com https://media.giphy.com https://*.giphy.com",
              // Connect: Firebase, Google APIs, Google Analytics
              "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.google.com",
              // Frames: Google sign-in popup & auth handlers
              "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://subnexus.vercel.app",
              // Block all object embeds
              "object-src 'none'",
              // Block all base-tag overrides
              "base-uri 'self'",
              // Require HTTPS for all sub-resources
              "upgrade-insecure-requests",
            ].join('; '),
          },
          // X-XSS-Protection (legacy browser support)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Cross-origin policies
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
      // ─── Sensitive routes: no caching, no indexing ──────────────────
      {
        source: '/dashboard/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },

  // ─── Reverse proxy: serve Firebase auth handler under custom domain ─
  // This makes subnexus.vercel.app/__/auth/handler work instead of
  // showing 404 when authDomain is set to subnexus.vercel.app
  async rewrites() {
    return [
      {
        source: '/__/auth/:path*',
        destination: 'https://rflix-91ab8.firebaseapp.com/__/auth/:path*',
      },
      {
        source: '/__/firebase/:path*',
        destination: 'https://rflix-91ab8.firebaseapp.com/__/firebase/:path*',
      },
    ];
  },

  // ─── Redirects: secure admin access ───────────────────────────────
  async redirects() {
    return [];
  },
};

export default nextConfig;
