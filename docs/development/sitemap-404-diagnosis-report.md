---
title: Sitemap 404 问题诊断报告
description: Complete diagnosis report for sitemap 404 issues in actionfigure-generator project
---

# Sitemap 404 问题诊断报告

## 📊 问题概述

**时间**: 2025-09-01  
**项目**: actionfigure-generator (Next.js 15 + App Router)  
**问题**: sitemap.xml 中大量URL返回404错误  
**成功率**: 75.7% (28/37 URL匹配成功)

## 🔍 核心问题分析

### 问题1: 英文默认URL路由配置不匹配

**影响URL数量**: 4个  
**优先级**: 🔴 **HIGH**

#### 问题详情
根据 `next-intl` 的 `localePrefix: "as-needed"` 配置：
- 英文作为默认语言，URL不应包含语言前缀
- 例如: `/pricing` 而不是 `/en/pricing`

但实际页面文件都位于 `[locale]` 动态路由下：
- `/src/app/[locale]/(default)/pricing/page.tsx`
- `/src/app/[locale]/(default)/showcase/page.tsx`
- `/src/app/[locale]/(default)/character-figure/page.tsx`
- `/src/app/[locale]/(default)/character-figure/video/page.tsx`

#### 问题URL列表
```
✗ https://actionfigure-generator.com/pricing
✗ https://actionfigure-generator.com/showcase  
✗ https://actionfigure-generator.com/character-figure
✗ https://actionfigure-generator.com/character-figure/video
```

### 问题2: Tutorial页面路由配置

**影响URL数量**: 5个  
**优先级**: 🔴 **HIGH**

#### 问题详情
Tutorial页面文件存在于正确位置，但sitemap生成的英文URL无法正确匹配：

**实际文件位置**:
```
✓ /src/app/[locale]/tutorial/how-to-make-action-figure-ai/page.tsx
✓ /src/app/[locale]/tutorial/how-to-make-ai-action-figure/page.tsx
✓ /src/app/[locale]/tutorial/how-to-make-an-ai-action-figure/page.tsx
✓ /src/app/[locale]/tutorial/how-to-make-the-action-figure-ai/page.tsx
✓ /src/app/[locale]/tutorial/how-to-make-the-ai-action-figure/page.tsx
```

**Sitemap生成的URL**:
```
✗ https://actionfigure-generator.com/tutorial/how-to-make-action-figure-ai
✗ https://actionfigure-generator.com/tutorial/how-to-make-ai-action-figure
✗ https://actionfigure-generator.com/tutorial/how-to-make-an-ai-action-figure
✗ https://actionfigure-generator.com/tutorial/how-to-make-the-action-figure-ai
✗ https://actionfigure-generator.com/tutorial/how-to-make-the-ai-action-figure
```

## 📁 实际页面文件结构分析

### 成功匹配的页面类型

#### 1. 法律页面 (直接匹配)
```
✓ /privacy-policy → /src/app/(legal)/privacy-policy/page.mdx
✓ /terms-of-service → /src/app/(legal)/terms-of-service/page.mdx
```

#### 2. 多语言URL (正确匹配到[locale]路由)
```
✓ /zh → /src/app/[locale]/(default)/page.tsx
✓ /ja → /src/app/[locale]/(default)/page.tsx
✓ /zh/pricing → /src/app/[locale]/(default)/pricing/page.tsx
✓ /fr/showcase → /src/app/[locale]/(default)/showcase/page.tsx
```

#### 3. 根路径 (默认语言匹配)
```
✓ / → /src/app/[locale]/(default)/page.tsx
```

### 存在的全部页面文件 (31个)

<details>
<summary>点击查看完整列表</summary>

```
1.  /privacy-policy → src/app/(legal)/privacy-policy/page.mdx
2.  /terms-of-service → src/app/(legal)/terms-of-service/page.mdx
3.  /[locale]/admin/feedbacks → src/app/[locale]/(admin)/admin/feedbacks/page.tsx
4.  /[locale]/admin/orders → src/app/[locale]/(admin)/admin/orders/page.tsx
5.  /[locale]/admin → src/app/[locale]/(admin)/admin/page.tsx
6.  /[locale]/admin/posts/[uuid]/edit → src/app/[locale]/(admin)/admin/posts/[uuid]/edit/page.tsx
7.  /[locale]/admin/posts/add → src/app/[locale]/(admin)/admin/posts/add/page.tsx
8.  /[locale]/admin/posts → src/app/[locale]/(admin)/admin/posts/page.tsx
9.  /[locale]/admin/users → src/app/[locale]/(admin)/admin/users/page.tsx
10. /[locale]/api-keys/create → src/app/[locale]/(default)/(console)/api-keys/create/page.tsx
11. /[locale]/api-keys → src/app/[locale]/(default)/(console)/api-keys/page.tsx
12. /[locale]/my-credits → src/app/[locale]/(default)/(console)/my-credits/page.tsx
13. /[locale]/my-invites → src/app/[locale]/(default)/(console)/my-invites/page.tsx
14. /[locale]/my-orders → src/app/[locale]/(default)/(console)/my-orders/page.tsx
15. /[locale]/character-figure → src/app/[locale]/(default)/character-figure/page.tsx ⚠️
16. /[locale]/character-figure/video → src/app/[locale]/(default)/character-figure/video/page.tsx ⚠️
17. /[locale]/i/[code] → src/app/[locale]/(default)/i/[code]/page.tsx
18. /[locale]/ja-landing → src/app/[locale]/(default)/ja-landing/page.tsx
19. /[locale] → src/app/[locale]/(default)/page.tsx ⚠️
20. /[locale]/posts/[slug] → src/app/[locale]/(default)/posts/[slug]/page.tsx
21. /[locale]/posts → src/app/[locale]/(default)/posts/page.tsx
22. /[locale]/pricing → src/app/[locale]/(default)/pricing/page.tsx ⚠️
23. /[locale]/showcase → src/app/[locale]/(default)/showcase/page.tsx ⚠️
24. /[locale]/docs/[[...slug]] → src/app/[locale]/(docs)/docs/[[...slug]]/page.tsx
25. /[locale]/auth/signin → src/app/[locale]/auth/signin/page.tsx
26. /[locale]/tutorial/how-to-make-action-figure-ai → src/app/[locale]/tutorial/how-to-make-action-figure-ai/page.tsx ⚠️
27. /[locale]/tutorial/how-to-make-ai-action-figure → src/app/[locale]/tutorial/how-to-make-ai-action-figure/page.tsx ⚠️
28. /[locale]/tutorial/how-to-make-an-ai-action-figure → src/app/[locale]/tutorial/how-to-make-an-ai-action-figure/page.tsx ⚠️
29. /[locale]/tutorial/how-to-make-the-action-figure-ai → src/app/[locale]/tutorial/how-to-make-the-action-figure-ai/page.tsx ⚠️
30. /[locale]/tutorial/how-to-make-the-ai-action-figure → src/app/[locale]/tutorial/how-to-make-the-ai-action-figure/page.tsx ⚠️
31. / → src/app/page.tsx
```

⚠️ 标记的页面是sitemap中未能正确匹配的页面
</details>

## ⚙️ 配置文件分析

### 1. Sitemap配置 (`/src/app/sitemap.ts`)

```typescript
// 静态页面配置
const staticPages = [
  '',
  '/pricing',         // ❌ 应该生成: /pricing 和 /en/pricing
  '/showcase',        // ❌ 应该生成: /showcase 和 /en/showcase  
  '/character-figure', // ❌ 应该生成: /character-figure 和 /en/character-figure
  '/character-figure/video',
]

// SEO教程页面 (仅英文，高优先级)
const tutorialPages = [
  '/tutorial/how-to-make-action-figure-ai',  // ❌ 应该是: /tutorial/... 和 /en/tutorial/...
  // ... 其他4个tutorial页面
]
```

**问题**: sitemap配置没有考虑到英文作为默认语言在`localePrefix: "as-needed"`模式下的特殊处理。

### 2. i18n配置 (`/src/i18n/locale.ts`)

```typescript
export const locales = ["en", "zh", "de", "ja", "es", "ar", "fr", "it"];
export const defaultLocale = "en";
export const localePrefix = "as-needed";  // 🔑 关键配置
```

**说明**: 
- `localePrefix: "as-needed"` 意味着默认语言(en)不显示前缀
- `/pricing` (英文) vs `/zh/pricing` (中文)

### 3. Middleware配置 (`/src/middleware.ts`)

```typescript
export const config = {
  matcher: [
    "/",
    "/(en|en-US|zh|zh-CN|zh-TW|zh-HK|zh-MO|ja|ko|ru|fr|de|ar|es|it)/:path*",
    "/((?!privacy-policy|terms-of-service|api/|_next|_vercel|.*\\..*).*)",
  ],
};
```

**分析**: Middleware配置看起来是正确的，应该能处理默认语言的路由。

## 🚨 根本原因分析

### 核心问题: Sitemap与路由架构不匹配

1. **架构设计**: 所有页面都在 `[locale]` 路由下，这是正确的i18n设计
2. **Sitemap配置**: 生成的英文URL假设存在非locale路由，这是错误的
3. **中间件处理**: 应该将 `/pricing` 内部重写为 `/en/pricing`，但sitemap生成时没有考虑这个映射

### 技术细节

在 `localePrefix: "as-needed"` 模式下：
- **用户访问**: `/pricing` 
- **中间件处理**: 内部重写为 `/en/pricing`
- **实际匹配**: `/src/app/[locale]/(default)/pricing/page.tsx` (其中locale='en')
- **Sitemap应该生成**: `/pricing` URL是正确的，但需要确保中间件正确处理

## 🔧 解决方案

### 方案1: 修复Sitemap配置 (推荐)

**目标**: 让sitemap生成符合实际路由结构的URL

```typescript
// 修改 /src/app/sitemap.ts
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://actionfigure-generator.com'
  const locales = ['en', 'zh', 'ja', 'es', 'fr', 'de']
  
  const staticPages = [
    '',
    '/pricing',
    '/showcase',
    '/character-figure',
    '/character-figure/video',
  ]
  
  const sitemapEntries: MetadataRoute.Sitemap = []
  
  // 为每个语言和页面创建条目
  locales.forEach(locale => {
    staticPages.forEach(page => {
      // ✅ 正确处理默认语言
      const url = locale === 'en' ? 
        `${baseUrl}${page}` :           // 英文: /pricing
        `${baseUrl}/${locale}${page}`   // 其他: /zh/pricing
      
      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
        alternates: {
          languages: locales.reduce((acc, loc) => {
            const altUrl = loc === 'en' ? 
              `${baseUrl}${page}` : 
              `${baseUrl}/${loc}${page}`
            acc[loc] = altUrl
            return acc
          }, {} as Record<string, string>)
        }
      })
    })
  })
  
  // ✅ Tutorial页面也需要同样处理
  tutorialPages.forEach(page => {
    sitemapEntries.push({
      url: `${baseUrl}${page}`,  // 英文默认不加前缀
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    })
  })
  
  return sitemapEntries
}
```

### 方案2: 验证中间件配置

确保中间件正确处理默认语言路由：

```typescript
// 检查 /src/middleware.ts 是否正确处理
// 用户访问 /pricing -> 应该内部重写为 /en/pricing -> 匹配到 [locale]/pricing
```

### 方案3: 创建URL验证测试

```javascript
// 创建自动化测试验证所有sitemap URL
const testUrls = [
  'http://localhost:3000/pricing',
  'http://localhost:3000/zh/pricing', 
  'http://localhost:3000/tutorial/how-to-make-action-figure-ai'
]
// 测试每个URL是否返回200而不是404
```

## 📋 修复优先级

### 🔴 立即修复 (Critical)
1. **修复Sitemap生成逻辑** - 确保生成的URL与路由架构匹配
2. **验证中间件配置** - 确保默认语言URL正确重写

### 🟡 后续改进 (Important) 
3. **创建URL测试套件** - 自动化验证所有sitemap URL
4. **完善错误监控** - 监控404错误并及时发现问题

### 🟢 优化建议 (Nice to have)
5. **SEO优化** - 确保hreflang标签正确设置
6. **缓存优化** - 优化sitemap生成性能

## 📊 预期结果

修复后预期达到：
- **成功率**: 100% (37/37 URLs)
- **英文默认URL**: 正确访问 `/pricing`, `/character-figure` 等
- **多语言URL**: 正确访问 `/zh/pricing`, `/ja/showcase` 等
- **Tutorial页面**: 正确访问所有SEO教程页面

## 🛠 测试计划

1. **本地测试**: 启动开发服务器，手动测试关键URL
2. **Sitemap验证**: 访问 `/sitemap.xml` 确认生成正确
3. **自动化测试**: 运行URL验证脚本
4. **生产部署**: 部署后验证线上环境

---

**报告生成时间**: 2025-09-01  
**下一步行动**: 立即修复sitemap配置，然后进行全面测试