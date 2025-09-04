"use client"

import { Sparkles, Zap, Users, Star, Trophy, ArrowRight } from "lucide-react"
import CharacterFigureGenerator from "@/components/character-figure/CharacterFigureGenerator"
import CharacterFigureGallery from "@/components/character-figure/CharacterFigureGallery"
import { ScrollToButton } from '@/components/ui/scroll-to-button'
import { useTranslations } from 'next-intl'

interface Props {
  locale: string
  t: any
}

export default function ActionFigureLanding({ locale, t }: Props) {
  const tl = useTranslations('landing')

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="fixed inset-0 action-figure-bg"></div>

      {/* Animated background particles */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400 rounded-full action-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-yellow-400 rounded-full action-pulse" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-red-400 rounded-full animate-ping" style={{animationDelay: '0.7s'}}></div>
        <div className="absolute bottom-1/3 right-2/3 w-2 h-2 bg-purple-400 rounded-full action-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Noise texture overlay */}
      <div className="fixed inset-0 action-figure-noise"></div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-900/30 via-orange-900/20 to-yellow-900/30 border-b-2 border-orange-500/50 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10"></div>

          {/* Scanning line effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent action-scan"></div>

          <div className="relative container mx-auto px-6 py-16 text-center">
            <div className="relative">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100/10 border border-orange-300/30 rounded-full mb-6">
                <Zap className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-400 action-figure-body">{tl('hero.badge')}</span>
              </div>

              {/* Glowing backdrop for title */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-red-500/20 to-yellow-400/20 blur-3xl"></div>

              <h1 className="relative text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-orange-300 via-red-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-2xl">
                {tl('hero.title')}
              </h1>

              <h2 className="text-3xl md:text-5xl font-semibold mb-8 text-white drop-shadow-lg">
                {tl('hero.subtitle')}
              </h2>
            </div>

            <div className="relative max-w-3xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-sm"></div>
              <p className="relative text-lg md:text-xl text-gray-200 leading-relaxed font-medium whitespace-pre-line">
                {tl('hero.description')}
              </p>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm mt-12">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-500" />
                <span className="text-gray-300">
                  <strong className="text-orange-400">50,000+</strong> {tl('hero.stats.creators')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-gray-300">
                  <strong className="text-orange-400">4.9</strong> {tl('hero.stats.rating')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="text-gray-300">
                  <strong className="text-orange-400">1M+</strong> {tl('hero.stats.figuresCreated')}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-12">
              <ScrollToButton 
                targetId="generator"
                size="lg" 
                className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 hover:from-orange-500 hover:via-red-500 hover:to-orange-500 text-white font-bold py-6 px-10 text-lg shadow-2xl transform transition-all duration-300 hover:scale-105"
              >
                {tl('hero.cta')}
                <ArrowRight className="ml-2 h-6 w-6" />
              </ScrollToButton>
            </div>
          </div>
        </div>


        {/* Real Generator Section */}
        <section id="generator" className="py-20 bg-black/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                {tl('generatorSection.title')}
              </h2>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                {tl('generatorSection.description')}
              </p>
            </div>
            <CharacterFigureGenerator locale={locale} />
          </div>
        </section>


        {/* Tutorials Section - Learning Hub */}
        <section className="py-20 bg-gradient-to-b from-gray-900/80 to-black border-t border-orange-500/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                {tl('tutorialsSection.title')}
              </h2>
              <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                {tl('tutorialsSection.description')}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Primary Tutorial - How to make action figure AI */}
              <div className="bg-gradient-to-br from-orange-900/30 to-red-900/20 border-2 border-orange-500/50 rounded-lg p-8 hover:border-orange-400/70 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-white">1</span>
                  </div>
                  <div className="bg-orange-500/20 px-3 py-1 rounded-full">
                    <span className="text-xs text-orange-300 font-bold action-figure-body">MOST POPULAR</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-orange-300 mb-4 action-figure-title group-hover:text-orange-200 transition-colors">
                  How to Make Action Figure AI
                </h3>
                <p className="text-gray-300 action-figure-body leading-relaxed mb-6">
                  Complete beginner's guide to creating professional action figures with AI. Learn the fundamentals, best practices, and advanced techniques in this comprehensive 8-minute tutorial.
                </p>
                
                <div className="flex items-center gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400">⏱️</span>
                    <span className="text-gray-400 action-figure-body">8 min read</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">🎯</span>
                    <span className="text-gray-400 action-figure-body">Beginner</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400">👥</span>
                    <span className="text-gray-400 action-figure-body">25K+ readers</span>
                  </div>
                </div>

                <a 
                  href={`/${locale}/tutorial/how-to-make-action-figure-ai`}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 group-hover:scale-105 action-figure-title"
                >
                  &gt; START LEARNING
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>

              {/* Secondary Tutorial - How to make AI action figure */}
              <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 border-2 border-cyan-500/50 rounded-lg p-8 hover:border-cyan-400/70 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-white">2</span>
                  </div>
                  <div className="bg-cyan-500/20 px-3 py-1 rounded-full">
                    <span className="text-xs text-cyan-300 font-bold action-figure-body">ADVANCED</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-cyan-300 mb-4 action-figure-title group-hover:text-cyan-200 transition-colors">
                  How to Make AI Action Figure
                </h3>
                <p className="text-gray-300 action-figure-body leading-relaxed mb-6">
                  Advanced techniques for creating AI action figures with professional results. Dive deep into AI technology, prompting strategies, and workflow optimization.
                </p>
                
                <div className="flex items-center gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400">⏱️</span>
                    <span className="text-gray-400 action-figure-body">12 min read</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">🎯</span>
                    <span className="text-gray-400 action-figure-body">Advanced</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">⚡</span>
                    <span className="text-gray-400 action-figure-body">Pro tips</span>
                  </div>
                </div>

                <a 
                  href={`/${locale}/tutorial/how-to-make-ai-action-figure`}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 group-hover:scale-105 action-figure-title"
                >
                  &gt; ADVANCED GUIDE
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Additional Tutorial Links */}
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-12">
              <a 
                href={`/${locale}/tutorial/how-to-make-the-ai-action-figure`}
                className="block bg-gradient-to-br from-gray-800/50 to-black/80 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400/60 transition-all duration-300 group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">3</span>
                  </div>
                  <h4 className="text-lg font-bold text-purple-300 action-figure-title group-hover:text-purple-200">
                    How to Make THE AI Action Figure
                  </h4>
                </div>
                <p className="text-gray-400 action-figure-body text-sm">
                  Specific techniques for creating targeted AI action figures with precise control.
                </p>
              </a>

              <a 
                href={`/${locale}/tutorial/how-to-make-an-ai-action-figure`}
                className="block bg-gradient-to-br from-gray-800/50 to-black/80 border border-green-500/30 rounded-lg p-6 hover:border-green-400/60 transition-all duration-300 group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">4</span>
                  </div>
                  <h4 className="text-lg font-bold text-green-300 action-figure-title group-hover:text-green-200">
                    How to Make AN AI Action Figure
                  </h4>
                </div>
                <p className="text-gray-400 action-figure-body text-sm">
                  Universal methods for creating any AI action figure with consistent quality results.
                </p>
              </a>

              <a 
                href={`/${locale}/tutorial/how-to-make-the-action-figure-ai`}
                className="block bg-gradient-to-br from-gray-800/50 to-black/80 border border-amber-500/30 rounded-lg p-6 hover:border-amber-400/60 transition-all duration-300 group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">5</span>
                  </div>
                  <h4 className="text-lg font-bold text-amber-300 action-figure-title group-hover:text-amber-200">
                    How to Make The Action Figure AI
                  </h4>
                </div>
                <p className="text-gray-400 action-figure-body text-sm">
                  Technical deep-dive into action figure AI technology and implementation.
                </p>
              </a>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16">
              <p className="text-xl text-gray-300 mb-8 action-figure-body max-w-4xl mx-auto">
                &gt; MASTER THESE TUTORIALS AND BECOME A LEGENDARY ACTION FIGURE CREATOR_
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href={`/${locale}/tutorial/how-to-make-action-figure-ai`}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 action-figure-title"
                >
                  📚 START WITH TUTORIAL #1
                </a>
                <ScrollToButton 
                  targetId="generator"
                  className="inline-flex items-center gap-2 border-2 border-orange-500 hover:bg-orange-500 text-orange-300 hover:text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 action-figure-title"
                >
                  🚀 TRY GENERATOR FIRST
                </ScrollToButton>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-20 bg-gradient-to-b from-gray-900/50 to-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white action-figure-title">
                WARRIOR GALLERY
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto action-figure-body">
                &gt; DISCOVER LEGENDARY FIGURES CREATED BY THE COMMUNITY_
              </p>
            </div>
            <CharacterFigureGallery />
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-gradient-to-b from-black to-gray-900/80 border-t border-orange-500/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white action-figure-title">
                FORGE YOUR PATH
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto action-figure-body">
                &gt; CHOOSE YOUR WARRIOR TIER AND UNLOCK UNLIMITED CREATION POWER_
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Free Tier */}
              <div className="bg-gradient-to-br from-gray-800/50 to-black/80 border border-gray-600/50 rounded-lg p-6 text-center">
                <h3 className="text-2xl font-bold text-gray-300 mb-4 action-figure-title">FREE TRIAL</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm text-gray-300">
                  <li>• 5 figures daily</li>
                  <li>• Watermarked images</li>
                  <li>• Standard quality</li>
                  <li>• Basic styles only</li>
                </ul>
                <button className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 action-figure-title">
                  START FREE
                </button>
              </div>

              {/* Creator Tier - Popular */}
              <div className="bg-gradient-to-br from-orange-900/30 to-red-900/20 border-2 border-orange-500/50 rounded-lg p-6 text-center relative transform scale-105 shadow-xl">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-4 py-1 rounded-full font-semibold">
                  MOST POPULAR
                </div>
                <h3 className="text-2xl font-bold text-orange-300 mb-4 action-figure-title">CREATOR</h3>
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg text-gray-500 line-through">$29</span>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">34% OFF</span>
                  </div>
                  <span className="text-4xl font-bold text-white">$19</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm text-orange-200">
                  <li>• 100 figures/month</li>
                  <li>• No watermarks</li>
                  <li>• HD quality</li>
                  <li>• All art styles</li>
                  <li>• Commercial rights</li>
                </ul>
                <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 action-figure-title">
                  UPGRADE NOW
                </button>
              </div>

              {/* Pro Tier */}
              <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 border border-cyan-500/50 rounded-lg p-6 text-center">
                <h3 className="text-2xl font-bold text-cyan-300 mb-4 action-figure-title">PRO</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$49</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm text-cyan-200">
                  <li>• 500 figures/month</li>
                  <li>• Priority generation</li>
                  <li>• 4K resolution</li>
                  <li>• Advanced controls</li>
                  <li>• API access</li>
                </ul>
                <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 action-figure-title">
                  GO PRO
                </button>
              </div>

              {/* Enterprise Tier */}
              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-purple-500/50 rounded-lg p-6 text-center">
                <h3 className="text-2xl font-bold text-purple-300 mb-4 action-figure-title">ENTERPRISE</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$199</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm text-purple-200">
                  <li>• Unlimited figures</li>
                  <li>• White-label solution</li>
                  <li>• Custom training</li>
                  <li>• 24/7 support</li>
                  <li>• SLA guarantee</li>
                </ul>
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 action-figure-title">
                  CONTACT SALES
                </button>
              </div>
            </div>

            {/* Pricing Footer Note */}
            <div className="text-center mt-12">
              <p className="text-gray-400 action-figure-body text-sm">
                &gt; ALL PLANS INCLUDE 7-DAY FREE TRIAL • NO HIDDEN FEES • CANCEL ANYTIME_
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white action-figure-title">
              FORGE YOUR LEGEND TODAY
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90 action-figure-body">
              &gt; JOIN THE RANKS OF LEGENDARY CREATORS_
            </p>
            <ScrollToButton 
              targetId="generator"
              size="lg" 
              className="bg-white text-orange-600 hover:bg-gray-100 px-10 py-6 text-lg font-semibold shadow-xl action-figure-title tracking-wider"
            >
              CREATE YOUR FIRST WARRIOR FREE
              <Sparkles className="ml-2 h-6 w-6" />
            </ScrollToButton>
          </div>
        </section>
      </div>
    </main>
  )
}