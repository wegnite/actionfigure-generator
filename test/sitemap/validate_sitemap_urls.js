#!/usr/bin/env node

/**
 * 从实际sitemap验证URL状态
 */

// 从localhost:3004获取sitemap并验证每个URL
async function getSitemapUrls() {
  try {
    const response = await fetch('http://localhost:3004/sitemap.xml');
    const sitemapText = await response.text();
    
    // 提取所有<loc>标签中的URL
    const urlMatches = sitemapText.match(/<loc>(.*?)<\/loc>/g) || [];
    const urls = urlMatches.map(match => match.replace(/<\/?loc>/g, ''));
    
    return urls;
  } catch (error) {
    console.error('获取sitemap失败:', error.message);
    return [];
  }
}

async function testUrl(url) {
  try {
    // 将生产域名替换为localhost:3004进行测试
    const testUrl = url.replace('https://actionfigure-generator.com', 'http://localhost:3004');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(testUrl, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    return {
      originalUrl: url,
      testUrl: testUrl,
      status: response.status,
      success: response.status >= 200 && response.status < 400
    };
  } catch (error) {
    return {
      originalUrl: url,
      testUrl: url.replace('https://actionfigure-generator.com', 'http://localhost:3004'),
      status: null,
      success: false,
      error: error.name === 'AbortError' ? 'TIMEOUT' : error.message
    };
  }
}

async function validateSitemapUrls() {
  console.log('🔍 从sitemap获取URL列表...');
  
  const urls = await getSitemapUrls();
  if (urls.length === 0) {
    console.error('❌ 无法获取sitemap URL');
    return;
  }
  
  console.log(`📋 发现 ${urls.length} 个URL，开始验证...\n`);
  
  // 分类统计
  const results = {
    success: [],
    notFound: [],
    errors: [],
    redirects: []
  };
  
  // 分批处理
  const batchSize = 10;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchPromises = batch.map(url => testUrl(url));
    const batchResults = await Promise.all(batchPromises);
    
    batchResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const code = result.status || 'ERR';
      console.log(`${status} ${code} - ${result.originalUrl}`);
      
      if (result.success) {
        results.success.push(result);
      } else if (result.status === 404) {
        results.notFound.push(result);
      } else if (result.status >= 300 && result.status < 400) {
        results.redirects.push(result);
      } else {
        results.errors.push(result);
      }
    });
    
    // 小延迟避免过于频繁的请求
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n==========================================');
  console.log('📊 验证结果统计:');
  console.log(`✅ 正常访问: ${results.success.length}`);
  console.log(`🔄 重定向: ${results.redirects.length}`);
  console.log(`❌ 404错误: ${results.notFound.length}`);
  console.log(`💥 其他错误: ${results.errors.length}`);
  console.log(`📄 总计: ${urls.length}`);
  
  // 详细显示问题URL
  if (results.notFound.length > 0) {
    console.log('\n❌ 404 Not Found URLs:');
    results.notFound.forEach(result => {
      console.log(`   ${result.originalUrl}`);
    });
  }
  
  if (results.errors.length > 0) {
    console.log('\n💥 错误 URLs:');
    results.errors.forEach(result => {
      console.log(`   ${result.originalUrl} (${result.error})`);
    });
  }
  
  if (results.redirects.length > 0) {
    console.log('\n🔄 重定向 URLs:');
    results.redirects.forEach(result => {
      console.log(`   ${result.status} ${result.originalUrl}`);
    });
  }
  
  // 生成JSON报告
  const report = {
    timestamp: new Date().toISOString(),
    totalUrls: urls.length,
    summary: {
      success: results.success.length,
      redirects: results.redirects.length,
      notFound: results.notFound.length,
      errors: results.errors.length
    },
    problemUrls: [
      ...results.notFound,
      ...results.errors
    ]
  };
  
  // 保存报告
  const fs = require('fs');
  fs.writeFileSync('sitemap_validation_report.json', JSON.stringify(report, null, 2));
  console.log('\n📋 详细报告已保存: sitemap_validation_report.json');
  
  return report;
}

// 运行验证
if (require.main === module) {
  validateSitemapUrls().catch(console.error);
}

module.exports = { validateSitemapUrls };