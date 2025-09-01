/**
 * Tutorial: How to Make AI Action Figure - Advanced Techniques
 * 进阶教程 - AI动作人偶制作的高级技巧
 */

import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, ArrowRight, CheckCircle, Target, Layers, Palette, Settings } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Make AI Action Figure - Advanced Techniques 2024',
  description: 'Master advanced AI action figure creation with professional techniques, prompt engineering, and style customization methods.',
  keywords: 'AI action figure advanced, professional actiondesign, prompt engineering, AI art techniques',
};

const advancedTechniques = [
  {
    title: 'Advanced Prompt Engineering',
    description: 'Master the art of crafting detailed, effective prompts for professional results',
    icon: Target,
    techniques: [
      'Negative prompting for quality control',
      'Style mixing and blending',
      'Parameter fine-tuning',
      'Seed management for consistency'
    ]
  },
  {
    title: 'Multi-Layer Composition',
    description: 'Create complex scenes with multiple elements and characters',
    icon: Layers,
    techniques: [
      'Background-foreground separation',
      'actioninteraction poses',
      'Environmental storytelling',
      'Compositional balance'
    ]
  },
  {
    title: 'Professional Color Theory',
    description: 'Apply color theory principles for striking visual impact',
    icon: Palette,
    techniques: [
      'Complementary color schemes',
      'Mood-based palette selection',
      'Brand color integration',
      'Cultural color significance'
    ]
  },
  {
    title: 'Production Optimization',
    description: 'Streamline your workflow for efficient batch production',
    icon: Settings,
    techniques: [
      'Template-based generation',
      'Automated quality checking',
      'Batch processing workflows',
      'Version control systems'
    ]
  }
];

export default function HowToMakeAIActionFigure() {
  return (
    <article className="max-w-4xl mx-auto">
      {/* Header */}
      <header className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            <Clock className="w-3 h-3 mr-1" />
            45 min read
          </Badge>
          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            <Users className="w-3 h-3 mr-1" />
            Advanced
          </Badge>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Advanced <span className="bg-gradient-to-r from-[var(--cf-orange-500)] to-[var(--cf-yellow-500)] bg-clip-text text-transparent">AI Action Figure</span> Creation
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
          Take your AI action figure creation skills to the professional level with advanced techniques, 
          optimization strategies, and industry best practices.
        </p>
      </header>

      {/* Prerequisites */}
      <Card className="mb-8 border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle>Prerequisites</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This tutorial assumes you have completed the basic action figure creation guide and are familiar with:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Basic prompt writing
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Style selection
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Parameter adjustment
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Quality evaluation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Iteration process
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Export formats
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Techniques */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Advanced Techniques</h2>
        
        <div className="space-y-8">
          {advancedTechniques.map((technique, index) => (
            <Card key={index} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500" />
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                    <technique.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{technique.title}</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">{technique.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="ml-16">
                  <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Key Techniques:</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {technique.techniques.map((tech, techIndex) => (
                      <div key={techIndex} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">{tech}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Professional Tips */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-blue-600 dark:text-blue-400">Professional Production Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Consistency is Key</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Maintain consistent actionfeatures across multiple generations by using seed values and detailed style guides.
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Quality Control</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Implement systematic quality checks including anatomy verification, color balance, and resolution standards.
              </p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Market Research</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Study current market trends and popular actionarchetypes to create commercially viable designs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardContent className="text-center py-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready for Professional-Level Creation?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Apply these advanced techniques to create studio-quality action figures.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/character-figure">
              <Button size="lg" className="cf-gradient-primary text-white hover:opacity-90">
                Start Advanced Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </article>
  );
}