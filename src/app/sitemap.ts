import { MetadataRoute } from 'next'
import { getIncludedLocales, getTrafficAllowlist } from '@/lib/sitemapConfig'

/**
 * 精简版 sitemap：仅保留核心、有价值的页面
 * - 仅包含英文（可通过环境变量覆盖）
 * - 去掉教程类和低价值页面
 * - 默认不包含法律类页面（仍可被发现，不必在sitemap占配额）
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // 生产环境主域名
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || 'https://actionfigure-generator.com'

  // 语言集：默认仅英文，可被环境变量或allowlist覆写/收紧
  const includedLocales = getIncludedLocales(['en'])

  // 核心业务页面（请确保这些路由存在）
  let corePages = [
    '',
    '/pricing',
    '/showcase',
    '/character-figure',
    '/character-figure/video',
  ]

  // 若提供了基于流量的白名单，则仅保留白名单中的页面（始终保留首页）
  const allow = getTrafficAllowlist()
  if (allow) {
    const allowed = new Set(allow.paths)
    corePages = corePages.filter((p) => p === '' || allowed.has(p))
  }

  const entries: MetadataRoute.Sitemap = []

  // 仅为指定语言输出核心页面
  includedLocales.forEach((locale) => {
    corePages.forEach((page) => {
      const url = locale === 'en' ? `${baseUrl}${page}` : `${baseUrl}/${locale}${page}`
      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      })
    })
  })

  // 如需保留法律页面，可通过环境变量开启（默认关闭）
  if (process.env.NEXT_PUBLIC_SITEMAP_INCLUDE_LEGAL === 'true') {
    entries.push(
      {
        url: `${baseUrl}/privacy-policy`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.2,
      },
      {
        url: `${baseUrl}/terms-of-service`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.2,
      }
    )
  }

  return entries
}
