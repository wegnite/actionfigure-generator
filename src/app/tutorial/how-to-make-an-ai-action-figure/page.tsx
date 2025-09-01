/**
 * Tutorial: actionDesign Fundamentals for AI Action Figures
 * 角色设计基础教程
 */

import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, ArrowRight, Palette, User, Shapes, Eye } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'actionDesign Fundamentals for AI Action Figures',
  description: 'Learn the core principles of actiondesign to create compelling and memorable AI-generated action figures.',
  keywords: 'actiondesign, action figure design, AI actioncreation, design fundamentals',
};

export default function HowToMakeAnAIActionFigure() {
  return (
    <article className="max-w-4xl mx-auto">
      <header className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <Clock className="w-3 h-3 mr-1" />
            30 min read
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Users className="w-3 h-3 mr-1" />
            Intermediate
          </Badge>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          actionDesign <span className="bg-gradient-to-r from-[var(--cf-orange-500)] to-[var(--cf-yellow-500)] bg-clip-text text-transparent">Fundamentals</span>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
          Master the fundamental principles of actiondesign to create compelling, 
          memorable, and marketable AI action figures.
        </p>
      </header>

      <section className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Palette className="w-6 h-6 text-[var(--cf-orange-500)]" />
              <CardTitle>Color Theory & Palette Selection</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Learn how to choose colors that convey personality, mood, and appeal to your target audience.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-[var(--cf-orange-500)]" />
              <CardTitle>actionPersonality & Archetype</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Develop distinct personalities and choose archetypal traits that resonate with collectors.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shapes className="w-6 h-6 text-[var(--cf-orange-500)]" />
              <CardTitle>Proportions & Anatomy</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Understand how to balance realistic proportions with stylistic choices for maximum impact.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-[var(--cf-orange-500)]" />
              <CardTitle>Visual Storytelling</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Create characters that tell a story at first glance through pose, expression, and design elements.
            </p>
          </CardContent>
        </Card>
      </section>

      <Card className="mt-12 bg-gradient-to-r from-[var(--cf-orange-50)] to-[var(--cf-yellow-50)] dark:from-[var(--cf-orange-900)]/20 dark:to-[var(--cf-yellow-900)]/20">
        <CardContent className="text-center py-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Apply Design Principles to Your Creations
          </h3>
          <Link href="/character-figure">
            <Button size="lg" className="cf-gradient-primary text-white hover:opacity-90">
              Start Designing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </article>
  );
}