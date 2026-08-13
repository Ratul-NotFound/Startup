import React from 'react';

export const JsonLd: React.FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://subnexus.io/#organization',
        'name': 'SubNexus Premium Retail Subscriptions',
        'url': 'https://subnexus.io',
        'logo': 'https://subnexus.io/logo.png',
        'description': 'Premier retail subscription marketplace for ChatGPT Plus, Claude 3.5 Pro, Gemini Advanced, Netflix 4K, YouTube Premium, and Adobe Creative Cloud with automated bot delivery.',
      },
      {
        '@type': 'WebSite',
        '@id': 'https://subnexus.io/#website',
        'url': 'https://subnexus.io',
        'name': 'SubNexus',
        'publisher': {
          '@id': 'https://subnexus.io/#organization',
        },
      },
      {
        '@type': 'SoftwareApplication',
        'name': 'SubNexus Subscription Vault',
        'operatingSystem': 'All',
        'applicationCategory': 'BusinessApplication',
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '4.98',
          'reviewCount': '52400',
        },
        'offers': {
          '@type': 'AggregateOffer',
          'priceCurrency': 'USD',
          'lowPrice': '4.99',
          'highPrice': '129.99',
          'offerCount': '12',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
