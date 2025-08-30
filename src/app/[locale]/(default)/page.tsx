/**
 * Character Figure AI Generator - 主页
 * 域名: characterfigure.com
 * 
 * SEO优化重点:
 * - 主关键词 "character figure" 高密度分布
 * - 清晰的H1-H3标题层级
 * - 优化的meta标签和结构化数据
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollToButton } from '@/components/ui/scroll-to-button';
import { ArrowRight, Sparkles, Zap, Star, Trophy, Users, Palette, Video, Download, Globe, CheckCircle2, Clock, Shield, ChevronDown, HelpCircle } from 'lucide-react';
import CharacterFigureGenerator from '@/components/character-figure/CharacterFigureGenerator';
import CharacterFigureGallery from '@/components/character-figure/CharacterFigureGallery';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  const titles = {
    en: 'Character Figure AI Generator | Create Stunning 3D Characters - CharacterFigure.com',
    zh: 'AI角色手办生成器 | 创建惊艳的3D角色 - CharacterFigure.com',
    ja: 'キャラクターフィギュアAIジェネレーター | 3Dキャラクター作成',
    es: 'Generador AI de Figuras | Crea Personajes 3D',
    fr: 'Générateur AI de Figurines | Créez des Personnages 3D',
    de: 'KI Figuren Generator | 3D Charaktere Erstellen',
  };
  
  const descriptions = {
    en: 'Transform ideas into amazing character figures with AI. Create anime, realistic, custom character figures in seconds. Free trial available.',
    zh: '用AI将创意转化为惊艳的角色手办。几秒内创建动漫、写实、自定义角色手办。免费试用。',
    ja: 'AIでアイデアをキャラクターフィギュアに変換。アニメ、リアル、カスタムフィギュアを数秒で作成。',
    es: 'Transforma ideas en figuras con IA. Crea figuras anime, realistas y personalizadas en segundos.',
    fr: 'Transformez vos idées en figurines avec l\'IA. Créez des figurines anime, réalistes en secondes.',
    de: 'Verwandeln Sie Ideen in Figuren mit KI. Erstellen Sie Anime, realistische Figuren in Sekunden.',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    keywords: 'character figure, AI generator, 3D characters, anime figure, character design, figure creator',
    alternates: {
      canonical: `https://characterfigure.com/${locale}`,
      languages: {
        'en': 'https://characterfigure.com/en',
        'zh': 'https://characterfigure.com/zh',
        'ja': 'https://characterfigure.com/ja',
        'es': 'https://characterfigure.com/es',
        'fr': 'https://characterfigure.com/fr',
        'de': 'https://characterfigure.com/de',
      },
    },
    openGraph: {
      title: 'Character Figure AI Generator',
      description: 'Create stunning character figures with AI technology',
      url: 'https://characterfigure.com',
      siteName: 'CharacterFigure',
      locale: locale === 'zh' ? 'zh_CN' : locale === 'ja' ? 'ja_JP' : 'en_US',
      type: 'website',
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
  } catch (error) {
    // 默认使用英文
    t = (await import(`@/i18n/pages/landing/en.json`)).default;
  }
  
  return (
    <main className="min-h-screen cf-gradient-light dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Hero Section with Generator - 精品工具页面 */}
      <section className="relative overflow-hidden py-12 lg:py-20">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[var(--cf-orange-300)]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[var(--cf-yellow-300)]/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* 简洁的标题区域 */}
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--cf-orange-100)] dark:bg-[var(--cf-orange-900)]/30 border border-[var(--cf-orange-300)] dark:border-[var(--cf-orange-700)] rounded-full mb-6">
              <Zap className="w-4 h-4 text-[var(--cf-orange-600)]" />
              <span className="text-sm text-[var(--cf-orange-600)] dark:text-[var(--cf-orange-400)]">{t.hero.badge}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-[var(--cf-orange-500)] to-[var(--cf-yellow-500)] bg-clip-text text-transparent">
                {t.hero.title}
              </span>
              <br />
              <span className="text-2xl md:text-4xl text-gray-900 dark:text-white/90">
                {t.hero.subtitle}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              {t.hero.description}
            </p>
            
            {/* 信任指标 */}
            <div className="flex flex-wrap justify-center gap-6 text-sm mb-12">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--cf-orange-500)]" />
                <span className="text-gray-600 dark:text-gray-300">
                  <strong className="text-[var(--cf-orange-600)] dark:text-[var(--cf-orange-400)]">{t.hero.stats.users.split(' ')[0]}</strong> {t.hero.stats.users.split(' ').slice(1).join(' ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-[var(--cf-yellow-500)]" />
                <span className="text-gray-600 dark:text-gray-300">
                  <strong className="text-[var(--cf-orange-600)] dark:text-[var(--cf-orange-400)]">{t.hero.stats.rating.split(' ')[0]}</strong> {t.hero.stats.rating.split(' ').slice(1).join(' ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[var(--cf-amber-500)]" />
                <span className="text-gray-600 dark:text-gray-300">
                  <strong className="text-[var(--cf-orange-600)] dark:text-[var(--cf-orange-400)]">{t.hero.stats.created.split(' ')[0]}</strong> {t.hero.stats.created.split(' ').slice(1).join(' ')}
                </span>
              </div>
            </div>
          </div>
          
          {/* 直接集成生成器 */}
          <div id="generator" className="mb-16">
            <CharacterFigureGenerator locale={locale} />
          </div>
        </div>
      </section>
      
      {/* What You Can Create - Rich SEO Landing Content */}
      <section className="py-20 bg-white/80 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              {t.whatYouCanCreate.title}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              {t.whatYouCanCreate.description}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {t.whatYouCanCreate.categories.map((category, index) => (
              <Card key={index} className="bg-white dark:bg-gray-900 border-[var(--cf-orange-200)] dark:border-[var(--cf-orange-800)] p-6 hover:border-[var(--cf-orange-400)] hover:shadow-xl transition-all">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{category.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {category.description}
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {category.features.map((feature, featureIndex) => (
                    <li key={featureIndex}>• {feature}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
          
          {/* Key Benefits */}
          <div className="grid md:grid-cols-3 gap-8">
            {t.whatYouCanCreate.benefits.map((benefit, index) => {
              const IconComponent = benefit.icon === 'Sparkles' ? Sparkles : benefit.icon === 'Clock' ? Clock : Shield;
              const gradientClass = index === 0 ? 'cf-gradient-primary' : index === 1 ? 'cf-gradient-secondary' : 'cf-gradient-accent';
              return (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 ${gradientClass} rounded-full flex items-center justify-center`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{benefit.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Features Grid */}
      <section id="feature" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
            {t.features.title}
          </h2>
          <p className="text-xl text-center text-gray-400 mb-16 max-w-3xl mx-auto">
            {t.features.description}
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 特性卡片 */}
            <Card className="bg-white/50 dark:bg-gray-900/50 border-[var(--cf-orange-200)] dark:border-[var(--cf-orange-800)] p-6 hover:border-[var(--cf-orange-400)] dark:hover:border-[var(--cf-orange-600)] hover:shadow-lg transition-all">
              <Palette className="h-12 w-12 text-[var(--cf-orange-500)] mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">10+ Character Figure Styles</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create diverse character figures including anime, realistic, fantasy styles
              </p>
            </Card>
            
            <Card className="bg-white/50 dark:bg-gray-900/50 border-[var(--cf-orange-200)] dark:border-[var(--cf-orange-800)] p-6 hover:border-[var(--cf-orange-400)] dark:hover:border-[var(--cf-orange-600)] hover:shadow-lg transition-all">
              <Video className="h-12 w-12 text-[var(--cf-amber-500)] mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Video Generation</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Transform static character figures into dynamic videos with AI
              </p>
            </Card>
            
            <Card className="bg-white/50 dark:bg-gray-900/50 border-[var(--cf-orange-200)] dark:border-[var(--cf-orange-800)] p-6 hover:border-[var(--cf-orange-400)] dark:hover:border-[var(--cf-orange-600)] hover:shadow-lg transition-all">
              <Zap className="h-12 w-12 text-[var(--cf-yellow-500)] mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generate character figures in under 10 seconds with nano-banana AI
              </p>
            </Card>
            
            <Card className="bg-white/50 dark:bg-gray-900/50 border-[var(--cf-orange-200)] dark:border-[var(--cf-orange-800)] p-6 hover:border-[var(--cf-orange-400)] dark:hover:border-[var(--cf-orange-600)] hover:shadow-lg transition-all">
              <Download className="h-12 w-12 text-[var(--cf-orange-600)] mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">HD Export</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Export character figures in high resolution for any use
              </p>
            </Card>
            
            <Card className="bg-white/50 dark:bg-gray-900/50 border-[var(--cf-orange-200)] dark:border-[var(--cf-orange-800)] p-6 hover:border-[var(--cf-orange-400)] dark:hover:border-[var(--cf-orange-600)] hover:shadow-lg transition-all">
              <Shield className="h-12 w-12 text-[var(--cf-amber-600)] mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Commercial License</h3>
              <p className="text-gray-600 dark:text-gray-400">
                All character figures include commercial usage rights
              </p>
            </Card>
            
            <Card className="bg-white/50 dark:bg-gray-900/50 border-[var(--cf-orange-200)] dark:border-[var(--cf-orange-800)] p-6 hover:border-[var(--cf-orange-400)] dark:hover:border-[var(--cf-orange-600)] hover:shadow-lg transition-all">
              <Globe className="h-12 w-12 text-[var(--cf-yellow-600)] mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Global Platform</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Available in 6 languages for creators worldwide
              </p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Results Showcase Gallery */}
      <section className="py-20 cf-gradient-light dark:bg-gray-950/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Character Figures Created by Our Community
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover the incredible diversity and quality of AI-generated character figures. From anime styles to realistic portraits, see what's possible with our advanced character figure generator.
            </p>
            <div className="flex justify-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-6">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--cf-orange-500)]" />
                <strong className="text-[var(--cf-orange-600)] dark:text-[var(--cf-orange-400)]">50,000+</strong> Creators
              </span>
              <span className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[var(--cf-amber-500)]" />
                <strong className="text-[var(--cf-orange-600)] dark:text-[var(--cf-orange-400)]">1M+</strong> Figures Generated
              </span>
            </div>
          </div>
          
          <CharacterFigureGallery />
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="py-20 cf-gradient-accent">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            {t.pricingTitle}
          </h2>
          <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-12">
            {t.pricingSubtitle}
          </p>
          
          {/* 定价卡片预览 - 根据PRD文档统一价格 */}
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="bg-white dark:bg-gray-900 border-[var(--cf-orange-200)] dark:border-gray-700 p-6 text-center">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Free</h3>
              <p className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">$0</p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">5 per day</p>
              <Button variant="outline" className="w-full border-[var(--cf-orange-300)] text-[var(--cf-orange-600)] hover:bg-[var(--cf-orange-50)]">Get Started</Button>
            </Card>
            
            <Card className="bg-white dark:bg-gray-900 border-[var(--cf-orange-500)] p-6 text-center relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 cf-gradient-primary text-white text-xs px-3 py-1 rounded-full">
                BEST VALUE
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Creator</h3>
              <p className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">$19</p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">100 per month</p>
              <Button className="w-full cf-gradient-primary hover:opacity-90 shadow-lg">Start Creating</Button>
            </Card>
            
            <Card className="bg-white dark:bg-gray-900 border-[var(--cf-orange-200)] dark:border-gray-700 p-6 text-center">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Professional</h3>
              <p className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">$49</p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">500 per month</p>
              <Button variant="outline" className="w-full border-[var(--cf-orange-300)] text-[var(--cf-orange-600)] hover:bg-[var(--cf-orange-50)]">Go Pro</Button>
            </Card>
            
            <Card className="bg-white dark:bg-gray-900 border-[var(--cf-orange-200)] dark:border-gray-700 p-6 text-center">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Enterprise</h3>
              <p className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">$199</p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Unlimited</p>
              <Button variant="outline" className="w-full border-[var(--cf-orange-300)] text-[var(--cf-orange-600)] hover:bg-[var(--cf-orange-50)]">Contact Sales</Button>
            </Card>
          </div>
          
          <div className="text-center mt-8">
            <Link href={`/${locale}/pricing`}>
              <Button variant="link" className="text-[var(--cf-orange-600)] hover:text-[var(--cf-orange-700)]">
                View detailed pricing →
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* How it Works Section - 更有价值的内容 */}
      <section className="py-20 bg-white/50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            How to Create Character Figures
          </h2>
          <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-16">
            Three simple steps to amazing character figure creation
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 cf-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Upload Your Image</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Upload any photo or use text description to start creating your character figure. Our AI works with any input.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 cf-gradient-secondary rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Choose Your Style</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Select from 10+ professional styles including anime, realistic, Ghibli, and more. Customize every detail.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 cf-gradient-accent rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Download & Share</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get your high-quality character figure in seconds. Perfect for social media, printing, or commercial use.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to know about creating character figures with AI
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                question: "What is a character figure generator?",
                answer: "Our AI character figure generator transforms photos, descriptions, or ideas into high-quality digital character figures. Using advanced nano-banana AI technology, it creates professional-grade figures in multiple styles including anime, realistic, fantasy, and more. Perfect for collectors, creators, and businesses."
              },
              {
                question: "How does AI character figure generation work?",
                answer: "Simply upload a photo or enter a description, choose your preferred style (anime, realistic, cyberpunk, etc.), and our AI analyzes the input to generate a unique character figure. The process takes under 10 seconds and uses machine learning models trained on millions of high-quality character designs."
              },
              {
                question: "What file formats do you support?",
                answer: "We accept JPEG, PNG, GIF, and WEBP files up to 20MB for input. Generated character figures are delivered as high-resolution PNG files optimized for printing, social media, or digital use. We also provide multiple aspect ratios including square (1:1), portrait (2:3), and landscape (3:2)."
              },
              {
                question: "Can I use generated character figures commercially?",
                answer: "Yes! All character figures created with our generator include full commercial usage rights. You can use them for business, resale, marketing, social media, merchandise, and any commercial purposes without additional licensing fees. This applies to all paid plans."
              },
              {
                question: "How long does character figure generation take?",
                answer: "Most character figures are generated in under 10 seconds. Complex requests or high-volume generations may take slightly longer, but our nano-banana AI is optimized for speed. There are no queues or waiting times - you get instant results."
              },
              {
                question: "What character figure styles are available?",
                answer: "We offer 10+ professional styles including: Anime, Realistic, Fantasy Warrior, Cyberpunk, Ghibli, Superhero, Funko Pop, Oil Painting, Watercolor, and Pixel Art. Each style is carefully optimized for different use cases from collectibles to social media content."
              },
              {
                question: "Do you offer refunds?",
                answer: "Yes, we offer a 30-day money-back guarantee for all paid subscriptions. If you're not completely satisfied with the quality of your character figures, contact our support team for a full refund. Free tier users can test the generator before upgrading."
              },
              {
                question: "How is pricing calculated?",
                answer: "Pricing is based on the number of character figures you can generate per month: Free (5/day), Creator ($19 for 100/month), Professional ($49 for 500/month), and Enterprise ($199 for unlimited). Each generation uses 1 credit regardless of style or complexity."
              },
              {
                question: "Can I cancel my subscription anytime?",
                answer: "Absolutely! You can cancel your subscription anytime from your account settings. There are no cancellation fees or long-term commitments. Your unused credits remain available until the end of your billing period."
              },
              {
                question: "What resolution are the character figure outputs?",
                answer: "All character figures are generated at high resolution (typically 1024x1024 or higher depending on aspect ratio). This ensures they're perfect for printing, social media, commercial use, or any professional application. We maintain consistent quality across all styles."
              },
              {
                question: "Is my data and character figures private?",
                answer: "Yes, your privacy is our priority. Uploaded images are processed securely and deleted after generation. Generated character figures belong to you and are private unless you choose to share them in our community gallery. We never use your content for training or other purposes."
              },
              {
                question: "Can I generate character figures for 3D printing?",
                answer: "Yes! Our character figures are optimized for various uses including 3D printing. While we generate 2D images, they're designed with proper geometry and printable details in mind. We provide guides for converting to 3D formats and optimizing for different printers."
              }
            ].map((faq, index) => (
              <Collapsible key={index} className="border border-[var(--cf-orange-200)] dark:border-[var(--cf-orange-800)] rounded-lg">
                <CollapsibleTrigger className="w-full p-6 text-left hover:bg-[var(--cf-orange-50)] dark:hover:bg-[var(--cf-orange-900)]/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                      {faq.question}
                    </h3>
                    <ChevronDown className="w-5 h-5 text-[var(--cf-orange-500)] transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-6 pb-6 pt-2">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
          
          {/* Contact Support */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--cf-orange-100)] dark:bg-[var(--cf-orange-900)]/30 border border-[var(--cf-orange-300)] dark:border-[var(--cf-orange-700)] rounded-full">
              <HelpCircle className="w-5 h-5 text-[var(--cf-orange-600)]" />
              <span className="text-[var(--cf-orange-600)] dark:text-[var(--cf-orange-400)] font-medium">
                Still have questions? 
              </span>
              <Link href="/contact" className="text-[var(--cf-orange-600)] dark:text-[var(--cf-orange-400)] font-semibold hover:underline">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="py-20 cf-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            Start Creating Character Figures Today
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Join thousands using our character figure generator to bring ideas to life
          </p>
          <ScrollToButton 
            targetId="generator"
            size="lg" 
            className="bg-white text-[var(--cf-orange-600)] hover:bg-gray-100 px-10 py-6 text-lg font-semibold shadow-xl"
          >
            Create Your First Character Figure Free
            <Sparkles className="ml-2 h-6 w-6" />
          </ScrollToButton>
        </div>
      </section>
    </main>
  );
}