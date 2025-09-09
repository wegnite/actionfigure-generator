#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { URL } = require('url');

const DOMAIN = process.env.NEXT_PUBLIC_WEB_URL || 'https://actionfigure-generator.com';

// 关键页面列表
const criticalPages = [
  '/',
  '/pricing',
  '/showcase',
  '/character-figure',
  '/tutorial/how-to-make-action-figure-ai',
];

// SEO检查项目
const seoChecks = {
  // 技术SEO
  robotsTxt: '/robots.txt',
  sitemap: '/sitemap.xml',
  // 性能指标
  loadTime: 3000, // 3秒
  // Meta标签
  metaTags: ['title', 'description', 'og:title', 'og:description'],
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(type, message) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };
  
  const colorMap = {
    success: colors.green,
    error: colors.red,
    warning: colors.yellow,
    info: colors.blue,
  };
  
  console.log(`${colorMap[type]}${icons[type]} ${message}${colors.reset}`);
}

async function checkUrl(url) {
  return new Promise((resolve) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const startTime = Date.now();
    
    const req = protocol.get(url, { timeout: 10000 }, (res) => {
      const loadTime = Date.now() - startTime;
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          loadTime,
          headers: res.headers,
          body: data.substring(0, 5000), // 只取前5000字符
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url,
        status: 0,
        error: error.message,
        loadTime: 0,
      });
    });
    
    req.on('timeout', () => {
      req.abort();
      resolve({
        url,
        status: 0,
        error: 'Timeout',
        loadTime: 10000,
      });
    });
  });
}

async function checkSEOHealth() {
  console.log(`${colors.bright}🔍 SEO Health Check for ${DOMAIN}${colors.reset}\n`);
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    issues: [],
  };
  
  // 1. 检查关键页面可访问性
  console.log(`${colors.bright}📄 Checking Critical Pages...${colors.reset}`);
  for (const page of criticalPages) {
    const url = `${DOMAIN}${page}`;
    const result = await checkUrl(url);
    
    if (result.status === 200) {
      log('success', `${page} - ${result.status} (${result.loadTime}ms)`);
      results.passed++;
      
      // 检查加载时间
      if (result.loadTime > seoChecks.loadTime) {
        log('warning', `  Slow load time: ${result.loadTime}ms > ${seoChecks.loadTime}ms`);
        results.warnings++;
        results.issues.push(`Slow page: ${page} (${result.loadTime}ms)`);
      }
      
      // 检查基本meta标签
      const hasTitle = result.body.includes('<title>');
      const hasDescription = result.body.includes('name="description"');
      
      if (!hasTitle || !hasDescription) {
        log('error', `  Missing meta tags: ${!hasTitle ? 'title' : ''} ${!hasDescription ? 'description' : ''}`);
        results.failed++;
        results.issues.push(`Missing meta tags on ${page}`);
      }
    } else {
      log('error', `${page} - ${result.status || 'FAILED'} ${result.error || ''}`);
      results.failed++;
      results.issues.push(`Page not accessible: ${page}`);
    }
  }
  
  // 2. 检查robots.txt
  console.log(`\n${colors.bright}🤖 Checking Technical SEO Files...${colors.reset}`);
  const robotsResult = await checkUrl(`${DOMAIN}/robots.txt`);
  if (robotsResult.status === 200) {
    log('success', 'robots.txt found');
    results.passed++;
    
    // 检查是否允许爬虫
    if (robotsResult.body.includes('Disallow: /')) {
      log('warning', '  robots.txt may be blocking crawlers');
      results.warnings++;
      results.issues.push('robots.txt may be too restrictive');
    }
  } else {
    log('error', 'robots.txt not found');
    results.failed++;
    results.issues.push('Missing robots.txt');
  }
  
  // 3. 检查sitemap.xml
  const sitemapResult = await checkUrl(`${DOMAIN}/sitemap.xml`);
  if (sitemapResult.status === 200) {
    log('success', 'sitemap.xml found');
    results.passed++;
    
    // 计算sitemap中的URL数量
    const urlCount = (sitemapResult.body.match(/<url>/g) || []).length;
    log('info', `  Sitemap contains ${urlCount} URLs`);
    
    if (urlCount < 10) {
      log('warning', '  Sitemap contains very few URLs');
      results.warnings++;
      results.issues.push(`Sitemap only has ${urlCount} URLs`);
    }
  } else {
    log('error', 'sitemap.xml not found');
    results.failed++;
    results.issues.push('Missing sitemap.xml');
  }
  
  // 4. 总结报告
  console.log(`\n${colors.bright}📊 SEO Health Summary${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${results.warnings}${colors.reset}`);
  
  if (results.issues.length > 0) {
    console.log(`\n${colors.bright}🔧 Issues to Fix:${colors.reset}`);
    results.issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
  }
  
  // 5. 建议
  console.log(`\n${colors.bright}💡 Recommendations:${colors.reset}`);
  
  if (results.failed > 0) {
    console.log('1. Fix critical issues immediately:');
    console.log('   - Ensure all pages return 200 status');
    console.log('   - Add missing meta tags');
    console.log('   - Create robots.txt and sitemap.xml if missing');
  }
  
  if (results.warnings > 0) {
    console.log('2. Optimize performance:');
    console.log('   - Improve page load times (target < 3s)');
    console.log('   - Optimize images and assets');
    console.log('   - Enable caching and CDN');
  }
  
  console.log('3. Content optimization:');
  console.log('   - Create more high-quality content pages');
  console.log('   - Target long-tail keywords');
  console.log('   - Build internal linking structure');
  
  // 返回状态码
  process.exit(results.failed > 0 ? 1 : 0);
}

// 运行检查
checkSEOHealth().catch(console.error);