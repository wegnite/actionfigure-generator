#!/usr/bin/env node

/**
 * Sitemap分析器 - 诊断404问题
 * 
 * 功能：
 * 1. 模拟sitemap.ts逻辑生成URL列表
 * 2. 扫描实际存在的页面文件
 * 3. 对比找出不匹配的URL
 * 4. 生成详细的诊断报告
 */

const fs = require('fs');
const path = require('path');

// 从sitemap.ts复制的配置
const baseUrl = 'https://actionfigure-generator.com';
const locales = ['en', 'zh', 'ja', 'es', 'fr', 'de'];

// 静态页面配置
const staticPages = [
  '',
  '/pricing',
  '/showcase', 
  '/character-figure',
  '/character-figure/video',
];

// SEO教程页面配置
const tutorialPages = [
  '/tutorial/how-to-make-action-figure-ai',
  '/tutorial/how-to-make-ai-action-figure', 
  '/tutorial/how-to-make-an-ai-action-figure',
  '/tutorial/how-to-make-the-action-figure-ai',
  '/tutorial/how-to-make-the-ai-action-figure',
];

/**
 * 生成sitemap URL列表
 */
function generateSitemapUrls() {
  const urls = [];
  
  // 为每个语言和静态页面创建条目
  locales.forEach(locale => {
    staticPages.forEach(page => {
      const url = locale === 'en' ? 
        `${baseUrl}${page}` : 
        `${baseUrl}/${locale}${page}`;
      
      urls.push({
        url,
        locale,
        page,
        type: 'static',
        priority: page === '' ? 1.0 : 0.8
      });
    });
  });
  
  // 添加SEO教程页面 (仅英文)
  tutorialPages.forEach(page => {
    urls.push({
      url: `${baseUrl}${page}`,
      locale: 'en',
      page,
      type: 'tutorial',
      priority: 0.9
    });
  });
  
  // 添加法律页面
  urls.push(
    {
      url: `${baseUrl}/privacy-policy`,
      locale: 'none',
      page: '/privacy-policy',
      type: 'legal',
      priority: 0.3
    },
    {
      url: `${baseUrl}/terms-of-service`,
      locale: 'none', 
      page: '/terms-of-service',
      type: 'legal',
      priority: 0.3
    }
  );
  
  return urls;
}

/**
 * 扫描实际存在的页面文件
 */
function scanActualPages() {
  const appDir = path.join(__dirname, '../../src/app');
  const actualPages = [];
  
  function scanDirectory(dir, basePath = '') {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // 处理路由组和动态路由
        let routePath = basePath;
        
        if (item.startsWith('(') && item.endsWith(')')) {
          // 路由组，不影响URL
          scanDirectory(itemPath, basePath);
        } else if (item.startsWith('[') && item.endsWith(']')) {
          // 动态路由
          const paramName = item.slice(1, -1);
          routePath = `${basePath}/[${paramName}]`;
          scanDirectory(itemPath, routePath);
        } else {
          // 普通目录
          routePath = `${basePath}/${item}`;
          scanDirectory(itemPath, routePath);
        }
      } else if (item === 'page.tsx' || item === 'page.mdx') {
        // 找到页面文件
        actualPages.push({
          path: basePath || '/',
          file: itemPath,
          type: item.endsWith('.mdx') ? 'mdx' : 'tsx'
        });
      }
    });
  }
  
  scanDirectory(appDir);
  return actualPages;
}

/**
 * 将Next.js路由转换为实际URL
 */
function routeToUrl(route, locale = null) {
  // 处理动态路由参数
  let url = route.replace(/\[([^\]]+)\]/g, ':$1');
  
  // 处理locale路由
  if (locale && locale !== 'en') {
    url = `/${locale}${url === '/' ? '' : url}`;
  }
  
  return url === '/' ? '' : url;
}

/**
 * 检查URL是否匹配实际页面
 */
function checkUrlMatch(sitemapUrl, actualPages) {
  const urlPath = new URL(sitemapUrl).pathname;
  
  // 检查直接匹配（法律页面等）
  for (const page of actualPages) {
    if (page.path === urlPath) {
      return { match: true, page, matchType: 'direct' };
    }
  }
  
  // 检查locale路由匹配
  const localePattern = /^\/([a-z]{2})(.*)$/;
  const match = urlPath.match(localePattern);
  
  if (match) {
    // 有语言前缀的URL，如 /zh/pricing
    const [, locale, path] = match;
    const targetPath = path || '';
    
    // 检查是否存在对应的[locale]路由
    for (const page of actualPages) {
      if (page.path === `/[locale]${targetPath}` || 
          (targetPath === '' && page.path === '/[locale]')) {
        return { match: true, page, locale, matchType: 'locale' };
      }
    }
  } else {
    // 没有语言前缀的URL，需要检查是否应该匹配到[locale]路由
    // 这些是英文默认URL，如 /pricing -> /[locale]/pricing
    
    for (const page of actualPages) {
      // 检查根路径
      if ((urlPath === '' || urlPath === '/') && page.path === '/[locale]') {
        return { match: true, page, locale: 'en', matchType: 'default-locale' };
      }
      
      // 检查其他路径
      if (page.path === `/[locale]${urlPath}`) {
        return { match: true, page, locale: 'en', matchType: 'default-locale' };
      }
    }
  }
  
  return { match: false };
}

/**
 * 生成诊断报告
 */
function generateReport() {
  console.log('🔍 开始分析sitemap 404问题...\n');
  
  // 1. 生成sitemap URLs
  const sitemapUrls = generateSitemapUrls();
  console.log(`📋 Sitemap配置生成了 ${sitemapUrls.length} 个URL`);
  
  // 2. 扫描实际页面
  const actualPages = scanActualPages();
  console.log(`📁 实际存在 ${actualPages.length} 个页面文件`);
  
  // 3. 对比分析
  const results = {
    total: sitemapUrls.length,
    matched: 0,
    missing: [],
    problems: []
  };
  
  sitemapUrls.forEach(item => {
    const result = checkUrlMatch(item.url, actualPages);
    
    if (result.match) {
      results.matched++;
    } else {
      results.missing.push(item);
      results.problems.push({
        url: item.url,
        type: item.type,
        locale: item.locale,
        page: item.page,
        reason: 'Page file not found'
      });
    }
  });
  
  // 4. 生成报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalUrls: results.total,
      matched: results.matched,
      missing: results.missing.length,
      successRate: `${((results.matched / results.total) * 100).toFixed(1)}%`
    },
    actualPages: actualPages.map(p => ({
      route: p.path,
      file: path.relative(process.cwd(), p.file),
      type: p.type
    })),
    missingPages: results.missing,
    problems: results.problems,
    recommendations: generateRecommendations(results.problems, actualPages)
  };
  
  return report;
}

/**
 * 生成修复建议
 */
function generateRecommendations(problems, actualPages) {
  const recommendations = [];
  
  // 按类型分组问题
  const problemsByType = problems.reduce((acc, problem) => {
    acc[problem.type] = acc[problem.type] || [];
    acc[problem.type].push(problem);
    return acc;
  }, {});
  
  Object.entries(problemsByType).forEach(([type, typeProblems]) => {
    switch (type) {
      case 'static':
        recommendations.push({
          type: 'missing_static_pages',
          priority: 'HIGH',
          count: typeProblems.length,
          description: '缺失的静态页面',
          pages: typeProblems.map(p => p.page),
          action: '需要创建对应的page.tsx文件'
        });
        break;
        
      case 'tutorial':
        recommendations.push({
          type: 'missing_tutorial_pages',
          priority: 'HIGH', 
          count: typeProblems.length,
          description: 'SEO教程页面存在但路由可能不正确',
          pages: typeProblems.map(p => p.page),
          action: '检查tutorial页面的路由配置'
        });
        break;
        
      case 'legal':
        recommendations.push({
          type: 'missing_legal_pages',
          priority: 'MEDIUM',
          count: typeProblems.length, 
          description: '法律页面路由配置问题',
          pages: typeProblems.map(p => p.page),
          action: '检查(legal)路由组的配置'
        });
        break;
    }
  });
  
  return recommendations;
}

/**
 * 主函数
 */
function main() {
  try {
    const report = generateReport();
    
    // 输出控制台报告
    console.log('\n' + '='.repeat(60));
    console.log('📊 SITEMAP 404 诊断报告');
    console.log('='.repeat(60));
    
    console.log(`\n📈 总体情况:`);
    console.log(`   总URL数: ${report.summary.totalUrls}`);
    console.log(`   匹配成功: ${report.summary.matched}`);
    console.log(`   缺失页面: ${report.summary.missing}`);
    console.log(`   成功率: ${report.summary.successRate}`);
    
    if (report.problems.length > 0) {
      console.log(`\n❌ 问题URL列表:`);
      report.problems.forEach((problem, index) => {
        console.log(`   ${index + 1}. ${problem.url}`);
        console.log(`      类型: ${problem.type}, 原因: ${problem.reason}`);
      });
    }
    
    console.log(`\n💡 修复建议:`);
    report.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. [${rec.priority}] ${rec.description}`);
      console.log(`      影响页面: ${rec.count}个`);
      console.log(`      建议操作: ${rec.action}`);
    });
    
    // 保存详细报告到文件
    const reportPath = path.join(__dirname, 'sitemap_404_diagnosis.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ 分析过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { generateSitemapUrls, scanActualPages, generateReport };