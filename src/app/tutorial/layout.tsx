/**
 * Tutorial Layout Component
 * 为tutorial页面提供统一的布局和导航
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'actionFigure AI Tutorials | Step-by-Step Guides',
  description: 'Learn how to create amazing AI-generated actionfigures with our comprehensive tutorials and guides.',
};

interface TutorialLayoutProps {
  children: React.ReactNode;
}

export default function TutorialLayout({ children }: TutorialLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Tutorial Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                actionFigure AI Tutorials
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Master the art of AI actionfigure creation
              </p>
            </div>
            <div className="bg-gradient-to-r from-[var(--cf-orange-500)] to-[var(--cf-yellow-500)] text-white px-4 py-2 rounded-full text-sm font-medium">
              Free Learning Path
            </div>
          </div>
        </div>
      </header>

      {/* Tutorial Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}