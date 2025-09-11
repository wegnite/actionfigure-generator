import { NextResponse } from 'next/server'
import { getIncludedLocales, getTrafficAllowlist } from '@/lib/sitemapConfig'
import { getBaseUrl } from '@/lib/seo'

export const revalidate = 3600 // 1 hour

export async function GET() {
  const base = getBaseUrl()

  // base core pages
  let corePages = ['', '/character-figure', '/character-figure/video', '/pricing', '/showcase']

  // allowlist to tighten focus if provided
  const allow = getTrafficAllowlist()
  if (allow) {
    const allowed = new Set(allow.paths)
    corePages = corePages.filter((p) => p === '' || allowed.has(p))
  }

  const locales = getIncludedLocales(['en'])

  const urls: string[] = []
  // Home without locale
  urls.push(`<url><loc>${base}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`) 

  // Localized core pages
  for (const locale of locales) {
    const prefix = locale === 'en' ? '' : `/${locale}`
    // 避免重复首页：已输出根首页，这里仅为非 EN 语言输出其语言首页
    if (locale !== 'en') {
      urls.push(
        `<url><loc>${base}${prefix}/</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`
      )
    }
    for (const page of corePages) {
      if (page === '') continue
      const priority = page.startsWith('/character-figure') ? '0.8' : '0.7'
      urls.push(
        `<url><loc>${base}${prefix}${page}/</loc><changefreq>weekly</changefreq><priority>${priority}</priority></url>`
      )
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}\n</urlset>`

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
