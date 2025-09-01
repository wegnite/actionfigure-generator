/**
 * Root Page Redirect
 * 根页面重定向，确保Next.js i18n路由正常工作
 * 在"as-needed"模式下，根URL需要通过middleware处理
 */

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function RootPage() {
  // 在Next.js 13+ App Router中，根页面需要被i18n中间件处理
  // 对于"as-needed"配置，这个页面不应该直接渲染
  // 中间件会自动重定向到适当的locale路由
  
  // 如果由于某种原因绕过了中间件，手动重定向到英文版本
  redirect('/en');
}