/**
 * Style Mixer Tool
 * 艺术风格混合工具
 */

import { Metadata } from 'next';
import StyleMixerTool from '@/components/tools/StyleMixerTool';

export const metadata: Metadata = {
  title: 'AI Style Mixer | Blend Artistic Styles for Action Figures',
  description: 'Professional style mixing tool for creating unique action figure art styles. Combine different artistic styles seamlessly.',
  keywords: 'style mixer, art style blending, action figure styles, AI art mixing',
  openGraph: {
    title: 'AI Style Mixer for Action Figures',
    description: 'Blend artistic styles to create unique action figure designs',
    type: 'website',
  },
};

export default function StyleMixerPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Style <span className="bg-gradient-to-r from-[var(--cf-orange-500)] to-[var(--cf-yellow-500)] bg-clip-text text-transparent">Mixer</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Blend different artistic styles to create unique and compelling action figure designs. 
          Professional style mixing made easy.
        </p>
      </header>

      {/* Tool Component */}
      <StyleMixerTool />
    </div>
  );
}