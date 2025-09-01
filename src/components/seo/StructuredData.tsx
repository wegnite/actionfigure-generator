/**
 * 结构化数据组件 - Action Figure AI Generator
 * 实施Schema.org标记以增强SEO表现
 */

import React from 'react';

interface StructuredDataProps {
  type: 'website' | 'product' | 'faq' | 'breadcrumb' | 'article';
  data: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const generateSchema = () => {
    switch (type) {
      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Action Figure AI Generator",
          "description": "Advanced AI-powered platform for creating professional action figures and collectibles",
          "url": "https://actionfigure-generator.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://actionfigure-generator.com/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          },
          "sameAs": [
            "https://twitter.com/actionfiguregen",
            "https://discord.gg/actionfiguregen",
            "https://github.com/actionfigure-generator",
            "https://youtube.com/@actionfiguregen"
          ]
        };

      case 'product':
        return {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Action Figure AI Generator",
          "applicationCategory": "Design Application",
          "description": "AI-powered action figure creation platform with professional-grade results",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "priceValidUntil": "2025-12-31",
            "availability": "https://schema.org/InStock",
            "url": "https://actionfigure-generator.com/pricing"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "2847",
            "bestRating": "5",
            "worstRating": "1"
          },
          "author": {
            "@type": "Organization",
            "name": "Action Figure AI"
          }
        };

      case 'faq':
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": data.items?.map((item: any) => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": item.answer
            }
          })) || []
        };

      case 'breadcrumb':
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": data.map((item: any, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
          }))
        };

      case 'article':
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": data.title,
          "description": data.description,
          "image": data.image,
          "datePublished": data.publishedAt,
          "dateModified": data.updatedAt || data.publishedAt,
          "author": {
            "@type": "Organization",
            "name": "actionFigure AI Team"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Action Figure AI",
            "logo": {
              "@type": "ImageObject",
              "url": "https://actionfigure-generator.com/logo.svg"
            }
          }
        };

      default:
        return null;
    }
  };

  const schema = generateSchema();
  
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2)
      }}
    />
  );
}

export default StructuredData;