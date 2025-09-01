/**
 * Tutorial: How to Make Action Figure with AI
 * 核心教程页面 - 使用AI创建动作人偶的完整指南
 */

import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, Users, ArrowRight, CheckCircle, Lightbulb, Zap } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Make Action Figure with AI - Complete Guide 2024',
  description: 'Learn how to create stunning AI-generated action figures step by step. Complete tutorial with tips, tricks, and best practices for beginners.',
  keywords: 'action figure AI, how to make action figure, AI actioncreation, tutorial',
  openGraph: {
    title: 'How to Make Action Figure with AI - Complete Guide',
    description: 'Master AI action figure creation with our step-by-step tutorial',
    type: 'article',
  },
};

const steps = [
  {
    title: 'Choose Your actionConcept',
    description: 'Define your action figure\'s theme, style, and characteristics',
    icon: Lightbulb,
    duration: '5 min',
    tips: ['Think about personality traits', 'Consider the target audience', 'Gather reference images']
  },
  {
    title: 'Input Your Prompt',
    description: 'Craft the perfect AI prompt for your action figure design',
    icon: Zap,
    duration: '3 min',
    tips: ['Be specific about details', 'Include style references', 'Mention pose and expression']
  },
  {
    title: 'Generate and Refine',
    description: 'Generate your action figure and iterate until perfect',
    icon: Sparkles,
    duration: '10 min',
    tips: ['Try multiple variations', 'Adjust parameters', 'Compare different outputs']
  },
  {
    title: 'Finalize Your Design',
    description: 'Polish your action figure with final touches and enhancements',
    icon: CheckCircle,
    duration: '7 min',
    tips: ['Check proportions', 'Verify color scheme', 'Save high-resolution version']
  },
];

const commonMistakes = [
  'Using vague or generic prompts',
  'Not specifying the art style clearly',
  'Ignoring proportions and anatomy',
  'Rushing through the iteration process',
  'Forgetting to save intermediate versions'
];

export default function HowToMakeActionFigureAI() {
  return (
    <article className="max-w-4xl mx-auto">
      {/* Article Header */}
      <header className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <Clock className="w-3 h-3 mr-1" />
            25 min read
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Users className="w-3 h-3 mr-1" />
            Beginner Friendly
          </Badge>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          How to Make <span className="bg-gradient-to-r from-[var(--cf-orange-500)] to-[var(--cf-yellow-500)] bg-clip-text text-transparent">Action Figure with AI</span>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
          Learn the complete process of creating stunning action figures using AI technology. 
          This comprehensive guide covers everything from concept to final design.
        </p>
        
        <Link href="/character-figure">
          <Button size="lg" className="cf-gradient-primary text-white hover:opacity-90">
            <Sparkles className="mr-2 h-5 w-5" />
            Start Creating Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </header>

      {/* Introduction */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--cf-orange-500)]" />
            What You'll Learn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Core Skills</h3>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  AI prompt engineering for action figures
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  actiondesign principles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Style customization techniques
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Quality optimization methods
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Outcomes</h3>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Professional-quality action figures
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Consistent actiondesign
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Marketable collectible designs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Portfolio-ready artwork
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-step Guide */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Step-by-Step Process</h2>
        
        <div className="space-y-8">
          {steps.map((step, index) => (
            <Card key={index} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--cf-orange-500)] to-[var(--cf-yellow-500)]" />
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="bg-[var(--cf-orange-100)] dark:bg-[var(--cf-orange-900)]/30 p-3 rounded-lg">
                    <step.icon className="w-6 h-6 text-[var(--cf-orange-600)]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-[var(--cf-orange-500)] text-white text-sm font-bold px-3 py-1 rounded-full">
                        Step {index + 1}
                      </span>
                      <Badge variant="outline">{step.duration}</Badge>
                    </div>
                    <CardTitle className="text-xl mb-2">{step.title}</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="ml-16">
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Pro Tips:</h4>
                  <ul className="space-y-1">
                    {step.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Common Mistakes */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Common Mistakes to Avoid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {commonMistakes.map((mistake, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">{mistake}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-[var(--cf-orange-50)] to-[var(--cf-yellow-50)] dark:from-[var(--cf-orange-900)]/20 dark:to-[var(--cf-yellow-900)]/20 border-[var(--cf-orange-200)]">
        <CardContent className="text-center py-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Create Your First Action Figure?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Put your new knowledge to practice and start creating amazing action figures with our AI-powered generator.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/character-figure">
              <Button size="lg" className="cf-gradient-primary text-white hover:opacity-90">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Creating
              </Button>
            </Link>
            <Link href="/showcase">
              <Button size="lg" variant="outline">
                View Examples
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Related Tutorials */}
      <section className="mt-12">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Tutorials</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/tutorial/how-to-make-ai-action-figure" className="group">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="group-hover:text-[var(--cf-orange-500)] transition-colors">
                  Advanced AI Action Figure Techniques
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Take your skills to the next level with advanced prompting and styling techniques.
                </p>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/tutorial/how-to-make-an-ai-action-figure" className="group">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="group-hover:text-[var(--cf-orange-500)] transition-colors">
                  actionDesign Fundamentals
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Learn the core principles of actiondesign for action figures.
                </p>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>
    </article>
  );
}