import { headers } from 'next/headers'

/**
 * Resolve the public base URL robustly across environments.
 * - Prefer NEXT_PUBLIC_WEB_URL
 * - Fallback to request headers (works on Cloudflare, Vercel, Node)
 * - Final fallback to production domain
 */
export function getBaseUrl() {
  try {
    // Next.js 15: headers() returns a Promise, but仍支持同步属性读取（迁移期特性）。
    const h: any = (headers as unknown as () => any)()
    const proto = h?.get?.('x-forwarded-proto') || 'https'
    const host = h?.get?.('x-forwarded-host') || h?.get?.('host')
    if (host) return `${proto}://${host}`.replace(/\/$/, '')
  } catch (_) {
    // headers() 不可用时忽略
  }

  const envUrl = process.env.NEXT_PUBLIC_WEB_URL?.trim()
  if (envUrl) return envUrl.replace(/\/$/, '')

  return 'https://actionfigure-generator.com'
}

export function canonicalFor(pathname: string = '/') {
  const base = getBaseUrl()
  let p = pathname.startsWith('/') ? pathname : `/${pathname}`
  // 对页面路由统一添加结尾斜杠；文件型资源（.xml/.txt/.ico等）不强制
  if (!/\.[a-z0-9]+$/i.test(p)) {
    if (!p.endsWith('/')) p += '/'
  }
  return `${base}${p}`
}
