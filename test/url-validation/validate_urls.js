#!/usr/bin/env node

/**
 * Sitemap URL验证脚本
 * 验证所有sitemap中的URL是否返回正确的HTTP状态码
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

// 验证单个URL
async function validateUrl(url, baseUrl = 'http://localhost:3000') {
  try {
    // 将生产域名替换为本地开发服务器
    const testUrl = url.replace('https://actionfigure-generator.com', baseUrl);
    
    const response = await fetch(testUrl, {
      method: 'HEAD', // 使用HEAD请求减少传输量
      timeout: 10000, // 10秒超时
    });
    
    return {
      url: url,
      testUrl: testUrl,
      status: response.status,
      statusText: response.statusText,
      success: response.status >= 200 && response.status < 400
    };
  } catch (error) {
    return {
      url: url,
      testUrl: url.replace('https://actionfigure-generator.com', baseUrl),
      status: null,
      statusText: error.message,
      success: false,
      error: true
    };
  }
}

// 批量验证URLs
async function validateAllUrls() {
  const urls = getUrlsFromFile();
  console.log(`🔍 开始验证 ${urls.length} 个URLs...`);
  console.log('==========================================');
  
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  let warningCount = 0;
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`[${i + 1}/${urls.length}] 检查: ${url}`);
    
    const result = await validateUrl(url);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.status} - ${url}`);
      successCount++;
    } else if (result.error) {
      console.log(`❌ ERROR - ${url} (${result.statusText})`);
      errorCount++;
    } else if (result.status >= 400) {
      console.log(`⚠️  ${result.status} - ${url}`);
      warningCount++;
    }
    
    // 添加小延迟避免过于频繁的请求
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('==========================================');
  console.log(`📊 验证完成！`);
  console.log(`✅ 成功: ${successCount}`);
  console.log(`⚠️  警告: ${warningCount}`);
  console.log(`❌ 错误: ${errorCount}`);
  console.log(`📄 总计: ${urls.length}`);
  
  // 生成详细报告
  generateReport(results);
  
  return {
    total: urls.length,
    success: successCount,
    warnings: warningCount,
    errors: errorCount,
    results: results
  };
}

// 生成验证报告
function generateReport(results) {
  const reportPath = path.join(__dirname, 'url_validation_report.json');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      success: results.filter(r => r.success).length,
      warnings: results.filter(r => !r.success && !r.error && r.status >= 400).length,
      errors: results.filter(r => r.error).length,
    },
    failed_urls: results.filter(r => !r.success),
    all_results: results
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📋 详细报告已保存: ${reportPath}`);
  
  // 打印失败的URLs
  if (report.failed_urls.length > 0) {
    console.log('\n❌ 失败的URLs:');
    report.failed_urls.forEach(result => {
      console.log(`   ${result.status || 'ERROR'} - ${result.url}`);
      if (result.error) {
        console.log(`      错误: ${result.statusText}`);
      }
    });
  }
}

// 运行验证
if (require.main === module) {
  validateAllUrls().catch(console.error);
}

module.exports = { validateAllUrls, validateUrl };