import { MetadataRoute } from 'next';

const BASE_URL = 'https://subnexus.io';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  return [
    // ─── Public pages only ─────────────────────────────────────
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // NOTE: /dashboard and /admin are intentionally excluded —
    // they are private, auth-gated, and marked noindex in headers.
  ];
}
