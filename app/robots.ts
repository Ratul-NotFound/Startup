import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all crawlers on public pages only
        userAgent: '*',
        allow: ['/', '/sitemap.xml'],
        disallow: [
          '/admin',
          '/admin/',
          '/dashboard',
          '/dashboard/',
          '/api/',
          '/_next/',
          '/checkout',
          '/cart',
        ],
      },
      {
        // Block GPTBot completely (OpenAI crawler) — don't train on customer data
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        // Block other AI training crawlers
        userAgent: 'CCBot',
        disallow: ['/'],
      },
      {
        userAgent: 'anthropic-ai',
        disallow: ['/'],
      },
      {
        userAgent: 'Google-Extended',
        disallow: ['/'],
      },
    ],
    sitemap: 'https://subnexus.io/sitemap.xml',
    host: 'https://subnexus.io',
  };
}
