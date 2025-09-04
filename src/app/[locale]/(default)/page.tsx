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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  const titles = {
    en: 'AI Action Figure Generator | Create Professional Action Figures - ActionFigure.com',
    zh: 'AI手办生成器 | 创建专业角色收藏品 - CharacterFigure.com',
    ja: 'AIフィギュア生成器 | プロ品質キャラクター作成 - CharacterFigure.com',
    es: 'Generador AI de Figuras | Crea Coleccionables Profesionales',
    fr: 'Générateur AI de Figurines | Créez des Collectibles Professionnels',
    de: 'KI Figuren Generator | Professionelle Sammlerfiguren Erstellen',
  };
  
  const descriptions = {
    en: 'Transform ideas into professional action figures with our advanced AI action figure generator. Create anime, realistic, and custom action figure designs in seconds. Free trial with commercial rights included.',
    zh: '用先进AI将创意转化为专业角色手办。几秒内创建动漫、写实和自定义收藏品设计。免费试用包含商业版权。',
    ja: '高度なAIでアイデアをプロ品質のキャラクターフィギュアに変換。アニメ、リアル、カスタムコレクションデザインを数秒で作成。',
    es: 'Transforma ideas en figuras profesionales con IA avanzada. Crea diseños anime, realistas y coleccionables en segundos.',
    fr: 'Transformez vos idées en figurines professionnelles avec l\'IA avancée. Créez des designs anime, réalistes et collectibles.',
    de: 'Verwandeln Sie Ideen in professionelle Figuren mit fortschrittlicher KI. Erstellen Sie Anime, realistische Sammlerfiguren.',
  };

  const keywords = {
    en: 'action figure generator, AI action figure, action figure creator, anime action figure maker, AI figure generator, collectible designer, 3D action figure creator, professional action figure design',
    zh: 'AI手办生成器, 角色手办制作, 动漫手办设计, 收藏品制作, 3D角色创建, 手办定制',
    ja: 'AIフィギュア生成器, キャラクターフィギュア作成, アニメフィギュア制作, コレクション品デザイン',
    es: 'generador de figuras AI, creador de personajes, figuras anime, coleccionables',
    fr: 'générateur de figurines AI, créateur de personnages, figurines anime',
    de: 'KI Figuren Generator, Charakter Ersteller, Anime Figuren, Sammlerfiguren',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    keywords: keywords[locale as keyof typeof keywords] || keywords.en,
    alternates: {
      canonical: `https://actionfigure-generator.com/${locale === 'en' ? '' : locale}`,
      languages: {
        'en': 'https://actionfigure-generator.com',
        'zh': 'https://actionfigure-generator.com/zh',
        'ja': 'https://actionfigure-generator.com/ja',
        'es': 'https://actionfigure-generator.com/es',
        'fr': 'https://actionfigure-generator.com/fr',
        'de': 'https://actionfigure-generator.com/de',
        'x-default': 'https://actionfigure-generator.com',
      },
    },
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.en,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
      url: `https://actionfigure-generator.com/${locale === 'en' ? '' : locale}`,
      siteName: 'Action Figure AI Generator',
      locale: locale === 'zh' ? 'zh_CN' : locale === 'ja' ? 'ja_JP' : 'en_US',
      type: 'website',
      images: [
        {
          url: 'https://actionfigure-generator.com/og-image.jpg',
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
      images: ['https://actionfigure-generator.com/og-image.jpg'],
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
  
  // 加载落地页翻译
  let t;
  try {
    t = (await import(`@/i18n/pages/landing/${locale}.json`)).default;
  } catch {
    // 默认使用英文
    t = (await import(`@/i18n/pages/landing/en.json`)).default;
  }
  
  return (
    <>
      <StructuredData 
        type="website" 
        data={{
          name: "Action Figure AI Generator",
          description: "Advanced AI-powered platform for creating professional action figures and collectibles",
          url: "https://actionfigure-generator.com"
        }} 
      />
      <ActionFigureLanding locale={locale} t={t} />
    </>
  );
}