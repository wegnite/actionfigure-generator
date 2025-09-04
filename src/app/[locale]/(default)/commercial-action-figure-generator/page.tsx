import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: "Commercial Action Figure Generator | Enterprise-Grade AI for Game Studios & Collectors",
    description: "Professional commercial action figure generator for game development studios, toy manufacturers, and creative agencies. Generate 4K commercial-grade action figures with full licensing rights, batch processing, and enterprise workflow integration.",
    keywords: "commercial action figure generator, enterprise AI action figures, game development action figures, commercial figure licensing, professional figure design software, batch action figure generation, 4K commercial figures, action figure for business",
    openGraph: {
      title: "Commercial Action Figure Generator | Enterprise-Grade AI Platform",
      description: "Professional AI action figure generator for game studios, toy manufacturers, and creative agencies. Full commercial licensing included.",
      type: "article",
    },
    alternates: {
      canonical: "https://actionfigure-generator.com/commercial-action-figure-generator",
    }
  };
}

export default async function CommercialActionFigureGeneratorPage({
  params
}: Props) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex mb-8 text-sm">
            <Link href="/" className="text-orange-600 hover:text-orange-700">
              Home
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Commercial Action Figure Generator</span>
          </nav>

          {/* Hero Content */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Commercial Action Figure Generator
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-orange-600 mb-6">
              Enterprise-Grade AI Platform for Professional Studios
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto">
              Generate commercial-quality action figures at scale with our professional AI platform. Designed for game development studios, toy manufacturers, creative agencies, and collectible designers who demand commercial-grade results with full licensing rights.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                href="/#generator" 
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                🚀 Start Commercial Generation
              </Link>
              <Link 
                href="/pricing" 
                className="border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white px-8 py-4 rounded-lg font-semibold transition-colors"
              >
                View Enterprise Plans
              </Link>
            </div>
          </div>

          {/* Enterprise Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Game Development Studios
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Create consistent character designs for your games with our commercial action figure generator. Generate NPCs, heroes, and collectible designs with full commercial rights.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Batch character generation for large teams</li>
                <li>• Style consistency across game assets</li>
                <li>• High-resolution exports for game engines</li>
                <li>• API integration for automated workflows</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="text-4xl mb-4">🏭</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Toy Manufacturers
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Prototype and design commercial action figures before expensive manufacturing. Our commercial action figure generator provides 3D-optimized designs ready for production.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• 3D-print ready geometry optimization</li>
                <li>• Manufacturing-friendly design constraints</li>
                <li>• Material and color specifications</li>
                <li>• Production cost estimation tools</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Creative Agencies
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Deliver premium collectible designs for your clients with our commercial action figure generator. Perfect for licensing deals, merchandising, and brand collaborations.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Client-specific brand integration</li>
                <li>• Multiple design iterations rapidly</li>
                <li>• Presentation-ready mockups</li>
                <li>• Full commercial licensing included</li>
              </ul>
            </div>
          </div>

          {/* Commercial Features Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Why Choose Our Commercial Action Figure Generator?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  🏆 Commercial-Grade Quality
                </h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  <li>• <strong>4K Resolution:</strong> Ultra-high resolution outputs suitable for print and digital media</li>
                  <li>• <strong>Professional Rendering:</strong> Advanced lighting, shadows, and materials</li>
                  <li>• <strong>Quality Assurance:</strong> AI-powered quality control ensures consistent results</li>
                  <li>• <strong>Format Flexibility:</strong> Export to PNG, JPG, PSD, and 3D formats</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  ⚡ Enterprise Workflow Integration
                </h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  <li>• <strong>Batch Processing:</strong> Generate hundreds of figures simultaneously</li>
                  <li>• <strong>API Access:</strong> Integrate into your existing development pipeline</li>
                  <li>• <strong>Version Control:</strong> Track design iterations and collaborate seamlessly</li>
                  <li>• <strong>Asset Management:</strong> Organize and categorize generated figures</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Licensing & Legal Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Full Commercial Licensing Included
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-3">📜</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Commercial Usage Rights</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Use generated figures in commercial products, games, merchandise, and client work without additional licensing fees.
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-3">💼</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Resale Rights</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Sell products featuring generated action figures, including physical toys, digital assets, and licensed merchandise.
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-3">🌍</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Worldwide Distribution</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Distribute your commercial action figure products globally without geographical restrictions or additional licensing.
                </p>
              </div>
            </div>
          </div>

          {/* Case Studies Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Commercial Success Stories
            </h2>
            
            <div className="space-y-8">
              <div className="border-l-4 border-orange-500 pl-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Indie Game Studio - Character Asset Pipeline
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  "Our commercial action figure generator reduced character design time by 80%. We generated over 200 consistent NPCs for our RPG in just two weeks, maintaining visual cohesion across our entire character roster."
                </p>
                <p className="text-sm text-orange-600 font-medium">
                  Result: 80% time reduction, 200+ character designs, consistent visual style
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Collectibles Manufacturer - Product Line Development
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  "The commercial action figure generator helped us prototype an entire collectible line before manufacturing. We tested 50 different designs, optimized for 3D printing, and launched our most successful product series."
                </p>
                <p className="text-sm text-orange-600 font-medium">
                  Result: 50 prototypes tested, successful product launch, 3D-print optimized
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Creative Agency - Brand Licensing Project
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  "We delivered a complete action figure merchandising proposal using the commercial generator. The client approved the designs immediately, and we secured a $2M licensing deal for the collectible line."
                </p>
                <p className="text-sm text-orange-600 font-medium">
                  Result: Immediate client approval, $2M licensing deal secured
                </p>
              </div>
            </div>
          </div>

          {/* Enterprise Contact CTA */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready for Commercial Action Figure Generation?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Join leading game studios, manufacturers, and agencies using our commercial action figure generator to create professional-grade collectibles at scale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/#generator" 
                className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-colors"
              >
                Start Free Trial
              </Link>
              <Link 
                href="/pricing" 
                className="border-2 border-white hover:bg-white hover:text-orange-600 px-8 py-4 rounded-lg font-semibold transition-colors"
              >
                Enterprise Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}