import React from 'react';

export const JsonLd: React.FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://keyoon.com/#organization',
        'name': 'Keyoon Premium Retail Subscriptions',
        'url': 'https://keyoon.com',
        'logo': 'https://keyoon.com/logo.png',
        'description': 'Premier retail subscription marketplace for ChatGPT Plus, Claude 3.5 Pro, Gemini Advanced, Netflix 4K, YouTube Premium, and Adobe Creative Cloud with automated bot delivery.',
      },
      {
        '@type': 'WebSite',
        '@id': 'https://keyoon.com/#website',
        'url': 'https://keyoon.com',
        'name': 'Keyoon',
        'publisher': {
          '@id': 'https://keyoon.com/#organization',
        },
      },
      {
        '@type': 'SoftwareApplication',
        'name': 'Keyoon Subscription Vault',
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
