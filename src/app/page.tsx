/**
 * Root Page (SSR)
 * 直接在根路径提供可索引内容，避免首页重定向带来的抓取与规范化问题。
 * 内容与英文默认首页一致，并设置自引用 canonical。
 */

import ActionFigureLanding from '@/components/blocks/action-figure-landing';
import StructuredData from '@/components/seo/StructuredData';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'AI Action Figure Generator | Create Professional Action Figures - ActionFigure.com',
  description:
    'Transform ideas into professional action figures with our advanced AI action figure generator. Create anime, realistic, and custom action figure designs in seconds. Free trial with commercial rights included.',
  keywords:
    'action figure generator, AI action figure, action figure creator, anime action figure maker, AI figure generator, collectible designer, 3D action figure creator, professional action figure design',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_WEB_URL || 'https://actionfigure-generator.com',
    languages: {
      en: process.env.NEXT_PUBLIC_WEB_URL || 'https://actionfigure-generator.com',
      zh: `${process.env.NEXT_PUBLIC_WEB_URL || 'https://actionfigure-generator.com'}/zh`,
      ja: `${process.env.NEXT_PUBLIC_WEB_URL || 'https://actionfigure-generator.com'}/ja`,
      'x-default': process.env.NEXT_PUBLIC_WEB_URL || 'https://actionfigure-generator.com',
    },
  },
  openGraph: {
    title:
      'AI Action Figure Generator | Create Professional Action Figures - ActionFigure.com',
    description:
      'Transform ideas into professional action figures with our advanced AI action figure generator. Create anime, realistic, and custom action figure designs in seconds.',
    url: process.env.NEXT_PUBLIC_WEB_URL || 'https://actionfigure-generator.com',
    siteName: 'Action Figure AI Generator',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_WEB_URL || 'https://actionfigure-generator.com'}/logo.png`,
        width: 1200,
        height: 630,
        alt: 'Action Figure AI Generator - Create Professional Action Figures',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'AI Action Figure Generator | Create Professional Action Figures - ActionFigure.com',
    description:
      'Transform ideas into professional action figures with our advanced AI action figure generator.',
    images: [
      `${process.env.NEXT_PUBLIC_WEB_URL || 'https://actionfigure-generator.com'}/logo.png`,
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootPage() {
  return (
    <>
      <StructuredData
        type="website"
        data={{
          name: 'Action Figure AI Generator',
          description:
            'Advanced AI-powered platform for creating professional action figures and collectibles',
          url: process.env.NEXT_PUBLIC_WEB_URL,
        }}
      />
      {/* 直接渲染英文默认首页内容，SSR 输出 */}
      <ActionFigureLanding locale="en" />
    </>
  );
}
