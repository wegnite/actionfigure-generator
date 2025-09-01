/**
 * AI Prompt Generator Tool
 * 专业的AI提示词生成工具
 */

import { Metadata } from 'next';
import PromptGeneratorTool from '@/components/tools/PromptGeneratorTool';

export const metadata: Metadata = {
  title: 'AI Action Figure Prompt Generator | Professional Tool',
  description: 'Generate optimized AI prompts for creating stunning action figures. Professional-grade prompt engineering tool with templates and customization.',
  keywords: 'AI prompt generator, action figure prompts, prompt engineering, AI art prompts',
  openGraph: {
    title: 'AI Action Figure Prompt Generator',
    description: 'Create perfect prompts for AI action figure generation',
    type: 'website',
  },
};

export default function PromptGeneratorPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          AI Prompt <span className="bg-gradient-to-r from-[var(--cf-orange-500)] to-[var(--cf-yellow-500)] bg-clip-text text-transparent">Generator</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Generate optimized prompts for creating stunning action figures with AI. 
          Professional-grade prompt engineering made simple.
        </p>
      </header>

      {/* Tool Component */}
      <PromptGeneratorTool />
    </div>
  );
}