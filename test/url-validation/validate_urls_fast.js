#!/usr/bin/env node

/**
 * 快速Sitemap URL验证脚本
 * 并行验证所有sitemap中的URL
 */

const fs = require('fs');
const path = require('path');

// 从sitemap_urls.txt读取URL列表
function getUrlsFromFile() {
  const filePath = path.join(__dirname, '../sitemap/sitemap_urls.txt');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const urls = content
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => line.trim());
    
  return urls;
}

// 验证单个URL - 快速版本
async function validateUrl(url, baseUrl = 'http://localhost:3000') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
  
  try {
    // 将生产域名替换为本地开发服务器
    const testUrl = url.replace('https://actionfigure-generator.com', baseUrl);
    
    const response = await fetch(testUrl, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'URL-Validator/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    return {
      url: url,
      testUrl: testUrl,
      status: response.status,
      success: response.status >= 200 && response.status < 400
    };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      url: url,
      testUrl: url.replace('https://actionfigure-generator.com', baseUrl),
      status: null,
      success: false,
      error: error.name === 'AbortError' ? 'TIMEOUT' : error.message
    };
  }
}

// 并行批量验证URLs
async function validateAllUrls() {
  const urls = getUrlsFromFile();
  console.log(`🔍 开始并行验证 ${urls.length} 个URLs...`);
  
  // 分批处理，每批10个URL
  const batchSize = 10;
  const results = [];
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    console.log(`处理批次 ${Math.floor(i/batchSize) + 1}/${Math.ceil(urls.length/batchSize)} (${batch.length} URLs)`);
    
    const batchPromises = batch.map(url => validateUrl(url));
    const batchResults = await Promise.all(batchPromises);
    
    results.push(...batchResults);
    
    // 显示此批次结果
    batchResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const code = result.status || 'ERR';
      console.log(`  ${status} ${code} - ${result.url}`);
    });
  }
  
  // 统计结果
  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;
  
  console.log('==========================================');
  console.log(`📊 验证完成！`);
  console.log(`✅ 成功: ${successCount}`);
  console.log(`❌ 失败: ${errorCount}`);
  console.log(`📄 总计: ${urls.length}`);
  
  // 显示失败的URLs
  const failedUrls = results.filter(r => !r.success);
  if (failedUrls.length > 0) {
    console.log('\n❌ 失败的URLs:');
    failedUrls.forEach(result => {
      console.log(`   ${result.status || 'ERR'} - ${result.url} (${result.error || 'HTTP Error'})`);
    });
  }
  
  return {
    total: urls.length,
    success: successCount,
    errors: errorCount,
    results: results,
    failedUrls: failedUrls
  };
}

// 运行验证
if (require.main === module) {
  validateAllUrls().catch(console.error);
}

module.exports = { validateAllUrls, validateUrl };