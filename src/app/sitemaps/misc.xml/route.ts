import { NextResponse } from 'next/server'
import { getBaseUrl } from '@/lib/seo'

export const revalidate = 3600 // 1 hour

export async function GET() {
  const base = getBaseUrl()
  const urls: string[] = []

  // Include ads.txt entry as requested
  urls.push(
    `<url><loc>${base}/ads.txt</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>`
  )

  const body = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">${urls.join('')}\n</urlset>`

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
