import { NextResponse } from 'next/server'

export const revalidate = 3600 // 1 hour

export async function GET() {
  const base = process.env.NEXT_PUBLIC_WEB_URL || 'https://actionfigure-generator.com'
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${base}/sitemaps/pages.xml</loc></sitemap>
  <sitemap><loc>${base}/sitemaps/misc.xml</loc></sitemap>
</sitemapindex>`

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}

