/**
 * Tools Layout Component
 * 为tools工具页面提供统一的布局和导航
 */

import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Wrench, Sparkles, Palette, Layers } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Action Figure Tools | Professional Creation Suite',
  description: 'Professional tools for AI action figure creation. Prompt generators, style mixers, batch processors and more.',
  keywords: 'AI tools, action figure tools, prompt generator, style mixer, batch processor',
};

interface ToolsLayoutProps {
  children: React.ReactNode;
}

const toolsNavigation = [
  {
    href: '/tools/prompt-generator',
    title: 'Prompt Generator',
    description: 'Generate optimized prompts',
    icon: Sparkles,
  },
  {
    href: '/tools/style-mixer',
    title: 'Style Mixer',
    description: 'Blend artistic styles',
    icon: Palette,
  },
  {
    href: '/tools/batch-processor',
    title: 'Batch Processor',
    description: 'Process multiple figures',
    icon: Layers,
  },
];

export default function ToolsLayout({ children }: ToolsLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Tools Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[var(--cf-orange-100)] dark:bg-[var(--cf-orange-900)]/30 p-2 rounded-lg">
                <Wrench className="w-6 h-6 text-[var(--cf-orange-600)]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Professional Tools
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Advanced utilities for action figure creation
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              {toolsNavigation.map((tool) => (
                <Link key={tool.href} href={tool.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <tool.icon className="w-6 h-6 text-[var(--cf-orange-500)] mx-auto mb-2" />
                      <div className="font-medium text-sm">{tool.title}</div>
                      <div className="text-xs text-gray-500">{tool.description}</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Tools Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}