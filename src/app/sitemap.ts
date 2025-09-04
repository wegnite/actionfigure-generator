import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://actionfigure-generator.com'
  
  // 只保留最重要的语言版本 - 避免内容稀释
  const primaryLocales = ['en', 'zh'] // 主要市场语言
  
  // 核心高价值页面
  const corePages = [
    '',                    // 主页 - 最重要
    '/pricing',           // 价格页 - 商业价值高
    '/character-figure',  // 核心功能页
  ]
  
  // 次要但仍有价值的页面
  const secondaryPages = [
    '/showcase',          // 展示页面
    '/character-figure/video', // 视频功能
    '/commercial-action-figure-generator', // 高价值B2B页面
  ]
  
  // 只保留最有价值的SEO教程页面 (只选择主关键词页面)
  const tutorialPages = [
    '/tutorial/how-to-make-action-figure-ai',  // 主关键词 880/月
    '/tutorial/how-to-make-ai-action-figure',  // 次要关键词 720/月
  ]
  
  const sitemapEntries: MetadataRoute.Sitemap = []
  
  // 核心页面 - 多语言版本
  primaryLocales.forEach(locale => {
    corePages.forEach(page => {
      const url = locale === 'en' ? 
        `${baseUrl}${page}` : 
        `${baseUrl}/${locale}${page}`
      
      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.9,
      })
    })
  })
  
  // 次要页面 - 仅英文版本避免稀释
  secondaryPages.forEach(page => {
    sitemapEntries.push({
      url: `${baseUrl}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  })
  
  // 高质量SEO教程页面 (仅英文)
  tutorialPages.forEach(page => {
    sitemapEntries.push({
      url: `${baseUrl}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })
  
  // 法律页面 - 必需但低优先级
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