import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://actionfigure-generator.com'
  const locales = ['en', 'zh', 'ja', 'es', 'fr', 'de']
  
  // 静态页面（确保这些页面实际存在）
  const staticPages = [
    '',
    '/pricing', 
    '/showcase',
    '/character-figure',
    '/character-figure/video',
  ]
  
  // SEO教程页面 (仅英文，高优先级)
  const tutorialPages = [
    '/tutorial/how-to-make-action-figure-ai',
    '/tutorial/how-to-make-ai-action-figure', 
    '/tutorial/how-to-make-an-ai-action-figure',
    '/tutorial/how-to-make-the-action-figure-ai',
    '/tutorial/how-to-make-the-ai-action-figure',
  ]
  
  const sitemapEntries: MetadataRoute.Sitemap = []
  
  // 为每个语言和页面创建条目 (简化版本，去除可能导致序列化问题的复杂结构)
  locales.forEach(locale => {
    staticPages.forEach(page => {
      const url = locale === 'en' ? 
        `${baseUrl}${page}` : 
        `${baseUrl}/${locale}${page}`
      
      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      })
    })
  })
  
  // 添加SEO教程页面 (仅英文，高SEO价值)
  tutorialPages.forEach(page => {
    sitemapEntries.push({
      url: `${baseUrl}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    })
  })
  
  // 添加特殊页面
  sitemapEntries.push(
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    }
  )
  
  return sitemapEntries
}