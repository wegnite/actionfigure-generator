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
    en: 'Professional AI Action Figure Generator | 4K Commercial-Grade Design Platform',
    zh: '专业级AI手办生成器 | 4K商业级设计平台',
    ja: 'プロフェッショナルAIフィギュア生成器 | 4K商業グレードプラットフォーム',
    es: 'Generador Profesional AI de Figuras | Plataforma Comercial 4K',
    fr: 'Générateur Professionnel AI | Plateforme Commerciale 4K',
    de: 'Professioneller KI Figuren Generator | 4K Commercial Platform',
  };
  
  const descriptions = {
    en: 'Industry-leading AI action figure generator for game developers, collectors, and creative professionals. Generate 4K commercial-grade action figures with full licensing rights. Batch processing, workflow integration, and 3D-print optimization included.',
    zh: '面向游戏开发者、收藏家和创意专业人士的行业领先AI手办生成器。生成4K商业级手办，含完整授权。支持批处理、工作流集成和3D打印优化。',
    ja: 'ゲーム開発者、コレクター、クリエイティブ専門家向けの業界最先端AIフィギュア生成器。完全ライセンス付き4K商業品質フィギュアを生成。バッチ処理、ワークフロー統合、3D印刷最適化を含む。',
    es: 'Generador AI líder para desarrolladores de juegos, coleccionistas y profesionales creativos. Genera figuras comerciales 4K con derechos completos.',
    fr: 'Générateur AI leader pour développeurs de jeux, collectionneurs et professionnels créatifs. Génère des figurines commerciales 4K avec droits complets.',
    de: 'Branchenführender KI-Generator für Spieleentwickler, Sammler und Kreativprofis. Generiert 4K-kommerzielle Figuren mit vollständigen Rechten.',
  };

  const keywords = {
    en: 'professional action figure generator, commercial action figure AI, 4K action figure creator, game development action figures, collectible design software, action figure licensing rights, batch action figure processing, 3D printable action figures, action figure workflow tools, enterprise action figure generator',
    zh: '专业AI手办生成器, 商业级手办制作, 4K手办设计, 游戏开发手办, 收藏品设计软件, 手办版权授权, 批量手办处理, 3D打印手办, 手办工作流工具, 企业级手办生成器',
    ja: 'プロフェッショナルフィギュア生成器, 商業フィギュアAI, 4Kフィギュア作成, ゲーム開発フィギュア, コレクション品デザインソフト, フィギュアライセンス権利, バッチフィギュア処理, 3D印刷フィギュア',
    es: 'generador profesional de figuras, AI comercial figuras, creador 4K figuras, desarrollo juegos figuras, software diseño coleccionables',
    fr: 'générateur professionnel figurines, AI commercial figurines, créateur 4K figurines, développement jeux figurines, logiciel design collectibles',
    de: 'professioneller Figuren Generator, kommerzielle Figuren AI, 4K Figuren Ersteller, Spieleentwicklung Figuren, Sammlerobjekt Design Software',
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