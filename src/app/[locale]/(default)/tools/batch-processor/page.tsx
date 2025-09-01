/**
 * Batch Processor Tool
 * 批量处理工具
 */

import { Metadata } from 'next';
import BatchProcessorTool from '@/components/tools/BatchProcessorTool';

export const metadata: Metadata = {
  title: 'AI Batch Processor | Mass Create Action Figures',
  description: 'Professional batch processing tool for creating multiple action figures efficiently. Perfect for production workflows.',
  keywords: 'batch processor, mass creation, action figure production, AI batch processing',
  openGraph: {
    title: 'AI Batch Processor for Action Figures',
    description: 'Create multiple action figures efficiently with batch processing',
    type: 'website',
  },
};

export default function BatchProcessorPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Batch <span className="bg-gradient-to-r from-[var(--cf-orange-500)] to-[var(--cf-yellow-500)] bg-clip-text text-transparent">Processor</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Process multiple action figures efficiently with our professional batch processing tool. 
          Perfect for production workflows and bulk creation.
        </p>
      </header>

      {/* Tool Component */}
      <BatchProcessorTool />
    </div>
  );
}