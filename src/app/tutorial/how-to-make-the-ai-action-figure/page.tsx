/**
 * Tutorial: The Complete AI Action Figure Production Guide
 * 完整的AI动作人偶制作指南
 */

import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, ArrowRight, Factory, Layers, Settings } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'The Complete AI Action Figure Production Guide',
  description: 'Comprehensive guide covering the entire production pipeline for creating AI action figures from concept to final product.',
  keywords: 'AI action figure production, complete guide, production pipeline, professional creation',
};

export default function HowToMakeTheAIActionFigure() {
  return (
    <article className="max-w-4xl mx-auto">
      <header className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
            <Clock className="w-3 h-3 mr-1" />
            90 min read
          </Badge>
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            <Users className="w-3 h-3 mr-1" />
            Complete Guide
          </Badge>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          The Complete <span className="bg-gradient-to-r from-[var(--cf-orange-500)] to-[var(--cf-yellow-500)] bg-clip-text text-transparent">AI Action Figure</span> Guide
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
          The comprehensive guide covering every aspect of AI action figure production, 
          from initial concept to final marketable product.
        </p>
      </header>

      <section className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Factory className="w-6 h-6 text-[var(--cf-orange-500)]" />
              <CardTitle>Production Pipeline</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Learn the complete production pipeline from concept development to final delivery.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Layers className="w-6 h-6 text-[var(--cf-orange-500)]" />
              <CardTitle>Multi-Stage Refinement</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Master the iterative refinement process to achieve professional-grade results.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-[var(--cf-orange-500)]" />
              <CardTitle>Production Optimization</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Optimize your production workflow for efficiency, consistency, and scalability.
            </p>
          </CardContent>
        </Card>
      </section>

      <Card className="mt-12 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
        <CardContent className="text-center py-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Start Your Production Journey
          </h3>
          <Link href="/character-figure">
            <Button size="lg" className="cf-gradient-primary text-white hover:opacity-90">
              Begin Production
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </article>
  );
}