/**
 * Action Figure AI Generator - 主页
 * 域名: characterfigure.com
 * 
 * SEO优化重点:
 * - 主关键词 "actionfigure" 高密度分布
 * - 清晰的H1-H3标题层级
 * - 优化的meta标签和结构化数据
 */

import ActionFigureLanding from '@/components/blocks/action-figure-landing';
import StructuredData from '@/components/seo/StructuredData';
import { canonicalFor, getBaseUrl } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  const titles = {
    en: 'AI Action Figure Generator – Create Pro Figures',
    zh: 'AI手办生成器 – 快速生成专业手办',
    ja: 'AIフィギュア ジェネレーター – プロ品質を生成',
    es: 'Generador de Figuras AI – Crea figuras pro',
    fr: 'Générateur de Figurines IA – Créez des modèles pro',
    de: 'KI Figuren Generator – Profi-Figuren erstellen',
  };
  
  const descriptions = {
    en: 'Create professional action figures in seconds with our AI generator. Design anime and realistic figures fast. Free trial. Commercial rights included.',
    zh: '使用 AI 手办生成器，数秒生成专业手办。支持动漫与写实风格。免费试用，含商用授权。',
    ja: 'AIで数秒でプロ品質のフィギュアを生成。アニメ/リアル対応。無料体験、商用利用可。',
    es: 'Crea figuras profesionales en segundos con IA. Gratis y con derechos comerciales.',
    fr: 'Créez des figurines pro en quelques secondes avec l’IA. Essai gratuit et droits commerciaux.',
    de: 'In Sekunden Profi‑Figuren mit KI erstellen. Kostenlose Testversion, kommerzielle Rechte inklusive.',
  };

  const keywords = {
    en: 'ai action figure generator, action figure maker, ai figure creator',
    zh: 'ai 手办生成器, 手办制作, ai figure 生成',
    ja: 'ai action figure generator, フィギュア作成',
    es: 'generador de figuras ai, creador',
    fr: 'générateur de figurines ia, créateur',
    de: 'ki figuren generator, figuren ersteller',
  };

  const base = getBaseUrl();

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    keywords: keywords[locale as keyof typeof keywords] || keywords.en,
    alternates: {
      canonical: canonicalFor(locale === 'en' ? '/' : `/${locale}`),
      languages: {
        'en': `${base}`,
        'zh': `${base}/zh`,
        'ja': `${base}/ja`,
        'es': `${base}/es`,
        'fr': `${base}/fr`,
        'de': `${base}/de`,
        'x-default': `${base}`,
      },
    },
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.en,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
      url: canonicalFor(locale === 'en' ? '/' : `/${locale}`),
      siteName: 'Action Figure AI Generator',
      locale: locale === 'zh' ? 'zh_CN' : locale === 'ja' ? 'ja_JP' : 'en_US',
      type: 'website',
      images: [
        {
          url: `${base}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Action Figure AI Generator - Create Professional Action Figures',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale as keyof typeof titles] || titles.en,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
      images: [`${base}/og-image.jpg`],
      creator: '@actionfiguregen',
      site: '@actionfiguregen',
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
}

export default async function CharacterFigurePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  return (
    <>
      <StructuredData 
        type="website" 
        data={{
          name: "Action Figure AI Generator",
          description: "Advanced AI-powered platform for creating professional action figures and collectibles",
          url: getBaseUrl()
        }} 
      />
      <ActionFigureLanding locale={locale} />
    </>
  );
}
