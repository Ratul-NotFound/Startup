import React from 'react';

export const JsonLd: React.FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. Organization Schema
      {
        '@type': 'Organization',
        '@id': 'https://keyoon.com/#organization',
        'name': 'Keyoon',
        'alternateName': ['Keyoon Subscriptions', 'Keyoon Bangladesh', 'Keyoon.com'],
        'url': 'https://keyoon.com',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://keyoon.com/images/One_Row_logo.png',
          'caption': 'Keyoon Official Logo',
        },
        'image': 'https://keyoon.com/images/One_Row_logo.png',
        'description': 'Bangladesh & worldwide premier retail digital subscription marketplace. Buy genuine ChatGPT Plus, Claude 3.5 Pro, Netflix 4K UHD, Google Gemini Advanced, YouTube Premium, Adobe Creative Cloud, and NordVPN with instant 30-second automated vault delivery and 100% replacement warranty.',
        'email': 'support@keyoon.com',
        'contactPoint': [
          {
            '@type': 'ContactPoint',
            'contactType': 'Customer Support',
            'email': 'support@keyoon.com',
            'availableLanguage': ['English', 'Bengali'],
            'areaServed': ['BD', 'US', 'GB', 'CA', 'AU', 'IN', 'AE'],
          },
        ],
        'sameAs': [
          'https://facebook.com/keyoonofficial',
          'https://twitter.com/keyoonofficial',
          'https://instagram.com/keyoonofficial',
          'https://t.me/keyoonofficial',
        ],
      },

      // 2. WebSite Schema with Sitelinks Searchbox
      {
        '@type': 'WebSite',
        '@id': 'https://keyoon.com/#website',
        'url': 'https://keyoon.com',
        'name': 'Keyoon — Premium Digital Subscriptions & Retail Marketplace',
        'description': 'Buy verified ChatGPT Plus, Claude Pro, Netflix 4K UHD, Gemini Advanced, YouTube Premium, Adobe CC, and NordVPN with bKash, Nagad, and Rocket.',
        'publisher': {
          '@id': 'https://keyoon.com/#organization',
        },
        'potentialAction': {
          '@type': 'SearchAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': 'https://keyoon.com/?search={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
        'inLanguage': 'en-US',
      },

      // 3. Online Store / E-Commerce Schema
      {
        '@type': 'OnlineStore',
        '@id': 'https://keyoon.com/#store',
        'name': 'Keyoon Marketplace',
        'url': 'https://keyoon.com',
        'description': 'Verified digital subscription store with instant automated credential delivery, warranty guarantee, and 24/7 priority live support.',
        'paymentAccepted': 'bKash, Nagad, Rocket, Upay, Visa, MasterCard, American Express, Crypto, Bank Transfer',
        'currenciesAccepted': 'BDT, USD',
        'priceRange': '৳299 - ৳15,000 / $2.99 - $129.99',
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '4.98',
          'bestRating': '5',
          'worstRating': '1',
          'ratingCount': '5420',
          'reviewCount': '5420',
        },
      },

      // 4. ItemList of Core Subscriptions
      {
        '@type': 'ItemList',
        '@id': 'https://keyoon.com/#catalog',
        'name': 'Featured Digital Subscriptions',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'item': {
              '@type': 'Product',
              'name': 'ChatGPT Plus (GPT-4o & Canvas)',
              'description': 'Genuine OpenAI ChatGPT Plus subscription with GPT-4o, DALL-E 3 image generation, Code Interpreter, and Canvas mode with instant vault credentials.',
              'image': 'https://keyoon.com/images/cards/chatgpt.jpg',
              'offers': {
                '@type': 'Offer',
                'price': '8.99',
                'priceCurrency': 'USD',
                'availability': 'https://schema.org/InStock',
                'priceValidUntil': '2027-12-31',
                'url': 'https://keyoon.com',
                'seller': {
                  '@type': 'Organization',
                  'name': 'Keyoon',
                },
              },
              'aggregateRating': {
                '@type': 'AggregateRating',
                'ratingValue': '4.99',
                'reviewCount': '2140',
              },
            },
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'item': {
              '@type': 'Product',
              'name': 'Claude 3.5 Sonnet Pro',
              'description': 'Anthropic Claude 3.5 Sonnet Pro subscription with 5x higher usage limits, Artifacts workspace, and fast reasoning speeds.',
              'image': 'https://keyoon.com/images/cards/claude.jpg',
              'offers': {
                '@type': 'Offer',
                'price': '9.49',
                'priceCurrency': 'USD',
                'availability': 'https://schema.org/InStock',
                'priceValidUntil': '2027-12-31',
                'url': 'https://keyoon.com',
                'seller': {
                  '@type': 'Organization',
                  'name': 'Keyoon',
                },
              },
              'aggregateRating': {
                '@type': 'AggregateRating',
                'ratingValue': '4.97',
                'reviewCount': '1890',
              },
            },
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'item': {
              '@type': 'Product',
              'name': 'Netflix 4K UHD Premium Plan',
              'description': 'Ultra HD 4K Dolby Atmos private or shared profile slot with pin lock and 100% full-term replacement warranty.',
              'image': 'https://keyoon.com/images/cards/netflix.jpg',
              'offers': {
                '@type': 'Offer',
                'price': '3.99',
                'priceCurrency': 'USD',
                'availability': 'https://schema.org/InStock',
                'priceValidUntil': '2027-12-31',
                'url': 'https://keyoon.com',
                'seller': {
                  '@type': 'Organization',
                  'name': 'Keyoon',
                },
              },
              'aggregateRating': {
                '@type': 'AggregateRating',
                'ratingValue': '4.96',
                'reviewCount': '3420',
              },
            },
          },
          {
            '@type': 'ListItem',
            'position': 4,
            'item': {
              '@type': 'Product',
              'name': 'Google Gemini Advanced 2.0',
              'description': 'Google One AI Premium tier with 2TB cloud storage, Gemini 1.5 Pro deep reasoning, and workspace integration.',
              'image': 'https://keyoon.com/images/cards/gemini.jpg',
              'offers': {
                '@type': 'Offer',
                'price': '6.99',
                'priceCurrency': 'USD',
                'availability': 'https://schema.org/InStock',
                'priceValidUntil': '2027-12-31',
                'url': 'https://keyoon.com',
                'seller': {
                  '@type': 'Organization',
                  'name': 'Keyoon',
                },
              },
              'aggregateRating': {
                '@type': 'AggregateRating',
                'ratingValue': '4.95',
                'reviewCount': '1120',
              },
            },
          },
        ],
      },

      // 5. Rich FAQPage Schema (Google Search Expandable Rich Snippets)
      {
        '@type': 'FAQPage',
        '@id': 'https://keyoon.com/#faq',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How fast do I receive my subscription credentials after ordering on Keyoon?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Delivery is automated and instantaneous! Within 30 seconds of verifying your payment Transaction ID (TrxID) via bKash, Nagad, or Rocket, your encrypted login credentials, profile PIN, and master recovery details appear directly inside your secure Keyoon Customer Vault.',
            },
          },
          {
            '@type': 'Question',
            'name': 'What payment methods does Keyoon accept?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'We support all major local Bangladeshi payment gateways including bKash (Personal/Merchant), Nagad, Rocket, and Upay, as well as international Visa, MasterCard, and cryptocurrency payments.',
            },
          },
          {
            '@type': 'Question',
            'name': 'What is Keyoon 100% Replacement Warranty Policy?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'All subscriptions purchased through Keyoon come with a full 100% replacement warranty for the entire duration of your plan. If any account encounters a credential or slot issue, click Claim Warranty in your vault and our automated dispatcher will instantly issue a new verified replacement login slot.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Are ChatGPT Plus, Claude Pro, and Netflix accounts on Keyoon genuine?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes, 100%. All accounts are genuine retail subscriptions provisioned directly from official service providers, ensuring zero downtime, full feature access, and complete security.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Can I use Keyoon outside Bangladesh?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes! Keyoon serves customers across the globe including USA, UK, Canada, Australia, India, and UAE. You can switch currency between USD ($) and BDT (৳) anytime.',
            },
          },
        ],
      },

      // 6. BreadcrumbList Schema
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://keyoon.com/#breadcrumbs',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://keyoon.com',
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Store Catalog',
            'item': 'https://keyoon.com/#catalog',
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': 'Customer Vault & Dashboard',
            'item': 'https://keyoon.com/dashboard',
          },
        ],
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
