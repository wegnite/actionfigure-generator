#!/usr/bin/env node

/**
 * URL验证器 - 测试sitemap中的所有URL
 * 
 * 功能：
 * 1. 启动本地开发服务器
 * 2. 获取sitemap中的所有URL
 * 3. 测试每个URL的HTTP状态码
 * 4. 生成详细的验证报告
 * 5. 识别404、重定向和其他问题
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { generateSitemapUrls } = require('./analyze_sitemap');

// 配置
const BASE_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 30000; // 30秒
const SERVER_START_DELAY = 5000; // 等待服务器启动5秒

/**
 * 启动开发服务器
 */
function startDevServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 启动开发服务器...');
    
    const server = spawn('pnpm', ['dev'], {
      cwd: path.join(__dirname, '../..'),
      stdio: 'pipe'
    });
    
    let serverReady = false;
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('📄 Server:', output.trim());
      
      // 检查服务器是否就绪
      if (output.includes('Ready in') || output.includes('Local:')) {
        if (!serverReady) {
          serverReady = true;
          console.log('✅ 开发服务器启动成功');
          setTimeout(() => resolve(server), SERVER_START_DELAY);
        }
      }
    });
    
    server.stderr.on('data', (data) => {
      const output = data.toString();
      console.log('⚠️ Server Error:', output.trim());
      
      // 检查端口被占用
      if (output.includes('EADDRINUSE')) {
        console.log('ℹ️ 端口被占用，假设服务器已在运行');
        setTimeout(() => resolve(null), 1000);
      }
    });
    
    server.on('close', (code) => {
      if (!serverReady) {
        reject(new Error(`服务器启动失败，退出码: ${code}`));
      }
    });
    
    // 超时处理
    setTimeout(() => {
      if (!serverReady) {
        server.kill();
        reject(new Error('服务器启动超时'));
      }
    }, TEST_TIMEOUT);
  });
}

/**
 * 测试单个URL
 */
async function testUrl(url) {
  const testUrl = url.replace('https://actionfigure-generator.com', BASE_URL);
  
  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      redirect: 'manual', // 不自动跟随重定向
      signal: AbortSignal.timeout(5000) // 5秒超时
    });
    
    return {
      url: testUrl,
      originalUrl: url,
      status: response.status,
      statusText: response.statusText,
      redirectLocation: response.headers.get('location'),
      contentType: response.headers.get('content-type'),
      success: response.status >= 200 && response.status < 400,
      isRedirect: response.status >= 300 && response.status < 400
    };
  } catch (error) {
    return {
      url: testUrl,
      originalUrl: url,
      status: 0,
      statusText: 'Network Error',
      error: error.message,
      success: false,
      isRedirect: false
    };
  }
}

/**
 * 批量测试URL
 */
async function testUrls(urls) {
  console.log(`\n🧪 开始测试 ${urls.length} 个URL...\n`);
  
  const results = [];
  const batchSize = 5; // 并发数量
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchPromises = batch.map(urlInfo => testUrl(urlInfo.url));
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // 显示进度
    const progress = Math.min(i + batchSize, urls.length);
    console.log(`📊 进度: ${progress}/${urls.length} (${((progress/urls.length)*100).toFixed(1)}%)`);
    
    // 显示当前批次结果
    batchResults.forEach(result => {
      const icon = result.success ? '✅' : result.isRedirect ? '🔄' : '❌';
      const status = result.status || 'ERR';
      console.log(`   ${icon} [${status}] ${result.url}`);
      
      if (result.redirectLocation) {
        console.log(`      ↳ 重定向到: ${result.redirectLocation}`);
      }
      if (result.error) {
        console.log(`      ↳ 错误: ${result.error}`);
      }
    });
    
    // 短暂延迟，避免过载
    if (i + batchSize < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * 生成测试报告
 */
function generateReport(results, sitemapUrls) {
  const summary = {
    total: results.length,
    success: results.filter(r => r.success).length,
    redirects: results.filter(r => r.isRedirect).length,
    errors: results.filter(r => !r.success && !r.isRedirect).length,
    notFound: results.filter(r => r.status === 404).length
  };
  
  const report = {
    timestamp: new Date().toISOString(),
    testConfig: {
      baseUrl: BASE_URL,
      timeout: TEST_TIMEOUT,
      batchSize: 5
    },
    summary,
    results,
    problemUrls: results.filter(r => !r.success),
    redirectUrls: results.filter(r => r.isRedirect),
    analysis: analyzeResults(results, sitemapUrls),
    recommendations: generateRecommendations(results, summary)
  };
  
  return report;
}

/**
 * 分析结果
 */
function analyzeResults(results, sitemapUrls) {
  const analysis = {
    statusDistribution: {},
    contentTypeDistribution: {},
    problemPatterns: []
  };
  
  // 状态码分布
  results.forEach(result => {
    const status = result.status.toString();
    analysis.statusDistribution[status] = (analysis.statusDistribution[status] || 0) + 1;
  });
  
  // Content-Type分布
  results.forEach(result => {
    if (result.contentType) {
      const type = result.contentType.split(';')[0];
      analysis.contentTypeDistribution[type] = (analysis.contentTypeDistribution[type] || 0) + 1;
    }
  });
  
  // 问题模式分析
  const notFoundUrls = results.filter(r => r.status === 404);
  if (notFoundUrls.length > 0) {
    const patterns = {};
    notFoundUrls.forEach(result => {
      const path = new URL(result.url).pathname;
      const segments = path.split('/').filter(Boolean);
      const pattern = segments.length > 0 ? `/${segments[0]}/*` : '/';
      patterns[pattern] = (patterns[pattern] || 0) + 1;
    });
    
    analysis.problemPatterns = Object.entries(patterns)
      .sort((a, b) => b[1] - a[1])
      .map(([pattern, count]) => ({ pattern, count }));
  }
  
  return analysis;
}

/**
 * 生成修复建议
 */
function generateRecommendations(results, summary) {
  const recommendations = [];
  
  if (summary.notFound > 0) {
    recommendations.push({
      priority: 'HIGH',
      type: '404_errors',
      count: summary.notFound,
      description: '存在404错误的URL',
      action: '检查路由配置和页面文件是否存在'
    });
  }
  
  if (summary.redirects > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      type: 'redirects',
      count: summary.redirects,
      description: '存在重定向的URL',
      action: '确认重定向是否符合预期，考虑更新sitemap'
    });
  }
  
  if (summary.errors > 0) {
    recommendations.push({
      priority: 'HIGH', 
      type: 'network_errors',
      count: summary.errors,
      description: '存在网络错误或其他问题',
      action: '检查服务器配置和网络连接'
    });
  }
  
  const successRate = (summary.success / summary.total * 100);
  if (successRate < 95) {
    recommendations.push({
      priority: 'CRITICAL',
      type: 'low_success_rate',
      description: `成功率过低: ${successRate.toFixed(1)}%`,
      action: '需要全面检查路由配置和sitemap生成逻辑'
    });
  }
  
  return recommendations;
}

/**
 * 主函数
 */
async function main() {
  let server = null;
  
  try {
    console.log('🔍 URL验证器启动\n');
    
    // 1. 获取sitemap URLs
    console.log('📋 获取sitemap URL列表...');
    const sitemapUrls = generateSitemapUrls();
    console.log(`✅ 获取到 ${sitemapUrls.length} 个URL\n`);
    
    // 2. 启动开发服务器
    server = await startDevServer();
    
    // 3. 测试所有URL
    const results = await testUrls(sitemapUrls);
    
    // 4. 生成报告
    console.log('\n📊 生成测试报告...');
    const report = generateReport(results, sitemapUrls);
    
    // 5. 显示总结
    console.log('\n' + '='.repeat(60));
    console.log('📈 URL验证报告');
    console.log('='.repeat(60));
    console.log(`总URL数:    ${report.summary.total}`);
    console.log(`成功:       ${report.summary.success} (${(report.summary.success/report.summary.total*100).toFixed(1)}%)`);
    console.log(`重定向:     ${report.summary.redirects}`);
    console.log(`404错误:    ${report.summary.notFound}`);
    console.log(`其他错误:   ${report.summary.errors}`);
    
    if (report.problemUrls.length > 0) {
      console.log('\n❌ 问题URL:');
      report.problemUrls.forEach((result, index) => {
        console.log(`${index + 1}. [${result.status}] ${result.url}`);
        if (result.error) console.log(`   错误: ${result.error}`);
      });
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 修复建议:');
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.priority}] ${rec.description}`);
        console.log(`   建议: ${rec.action}`);
      });
    }
    
    // 6. 保存详细报告
    const reportPath = path.join(__dirname, 'url_validation_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    process.exit(1);
  } finally {
    // 清理：关闭开发服务器
    if (server) {
      console.log('\n🔄 关闭开发服务器...');
      server.kill();
    }
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testUrl, testUrls, generateReport };