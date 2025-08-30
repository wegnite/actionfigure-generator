#!/usr/bin/env node

/**
 * 本地URL测试脚本
 */

// 测试几个关键URLs
const testUrls = [
  'http://localhost:3004/',
  'http://localhost:3004/pricing',
  'http://localhost:3004/zh',
  'http://localhost:3004/privacy-policy',
  'http://localhost:3004/terms-of-service',
  'http://localhost:3004/sitemap.xml'
];

async function testUrl(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      timeout: 3000
    });
    
    return {
      url,
      status: response.status,
      success: response.status >= 200 && response.status < 400
    };
  } catch (error) {
    return {
      url,
      status: null,
      success: false,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('🔍 测试本地开发服务器URLs...\n');
  
  for (const url of testUrls) {
    const result = await testUrl(url);
    const status = result.success ? '✅' : '❌';
    const code = result.status || 'ERR';
    
    console.log(`${status} ${code} - ${url}`);
    if (!result.success && result.error) {
      console.log(`      错误: ${result.error}`);
    }
  }
}

runTests().catch(console.error);