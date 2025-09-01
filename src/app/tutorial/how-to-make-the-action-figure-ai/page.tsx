/**
 * Tutorial: Mastering Action Figure AI Generation
 * AI生成动作人偶的精通指南
 */

import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, ArrowRight, Cpu, Zap, Target } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mastering Action Figure AI Generation - Expert Guide',
  description: 'Become an expert in AI-powered action figure generation with advanced techniques and professional workflows.',
  keywords: 'action figure AI mastery, expert AI generation, professional actioncreation',
};

export default function HowToMakeTheActionFigureAI() {
  return (
    <article className="max-w-4xl mx-auto">
      <header className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <Clock className="w-3 h-3 mr-1" />
            60 min read
          </Badge>
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            <Users className="w-3 h-3 mr-1" />
            Expert
          </Badge>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Mastering <span className="bg-gradient-to-r from-[var(--cf-orange-500)] to-[var(--cf-yellow-500)] bg-clip-text text-transparent">Action Figure AI</span> Generation
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
          The complete expert guide to mastering AI action figure generation, 
          including advanced workflows and professional production techniques.
        </p>
      </header>

      <section className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Cpu className="w-6 h-6 text-[var(--cf-orange-500)]" />
              <CardTitle>AI Model Understanding</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Deep dive into how AI models work and how to leverage their strengths for optimal results.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-[var(--cf-orange-500)]" />
              <CardTitle>Professional Workflows</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Establish efficient, scalable workflows for professional action figure production.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-[var(--cf-orange-500)]" />
              <CardTitle>Quality Assurance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Implement systematic quality control processes to ensure consistent, professional results.
            </p>
          </CardContent>
        </Card>
      </section>

      <Card className="mt-12 bg-gradient-to-r from-red-50 to-purple-50 dark:from-red-900/20 dark:to-purple-900/20">
        <CardContent className="text-center py-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Master Professional AI Generation
          </h3>
          <Link href="/character-figure">
            <Button size="lg" className="cf-gradient-primary text-white hover:opacity-90">
              Start Expert Project
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </article>
  );
}