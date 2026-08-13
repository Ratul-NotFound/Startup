import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/internal/'],
    },
    sitemap: 'https://subnexus.io/sitemap.xml',
  };
}
