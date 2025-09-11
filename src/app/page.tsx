/**
 * Root Page (SSR)
 * 直接在根路径提供可索引内容，避免首页重定向带来的抓取与规范化问题。
 * 内容与英文默认首页一致，并设置自引用 canonical。
 */

import { redirect } from 'next/navigation';
import { canonicalFor } from '@/lib/seo';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: canonicalFor('/') },
    robots: { index: true, follow: true },
  };
}

export default async function RootPage() {
  // 保持结尾斜杠的一致性
  redirect('/en/');
}
