#!/usr/bin/env node

/**
 * 网络连通性测试脚本
 * 用于诊断 NextAuth.js Google OAuth 的网络问题
 */

const https = require('https');
const { URL } = require('url');

// 测试端点列表
const endpoints = [
  'https://accounts.google.com/o/oauth2/v2/auth',
  'https://oauth2.googleapis.com/token',
  'https://openidconnect.googleapis.com/v1/userinfo',
  'https://www.googleapis.com/.well-known/openid_configuration'
];

// 代理配置检查
function checkProxyConfig() {
  const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
  const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  
  console.log('🔍 代理配置检查:');
  console.log(`HTTP_PROXY: ${httpProxy || '未设置'}`);
  console.log(`HTTPS_PROXY: ${httpsProxy || '未设置'}`);
  console.log('');
  
  return { httpProxy, httpsProxy };
}

// 测试单个端点
function testEndpoint(url, timeout = 10000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const parsedUrl = new URL(url);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      timeout: timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NextAuth-NetworkTest/1.0)'
      }
    };

    const req = https.request(options, (res) => {
      const duration = Date.now() - startTime;
      resolve({
        url,
        success: true,
        statusCode: res.statusCode,
        duration,
        headers: res.headers
      });
    });

    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      resolve({
        url,
        success: false,
        error: error.message,
        duration,
        code: error.code
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        success: false,
        error: 'Request timeout',
        duration: timeout,
        code: 'TIMEOUT'
      });
    });

    req.end();
  });
}

// 主测试函数
async function runNetworkTest() {
  console.log('🌐 NextAuth.js 网络连通性测试');
  console.log('================================\n');
  
  // 检查代理配置
  checkProxyConfig();
  
  console.log('📡 测试 Google OAuth 端点连通性:\n');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    console.log(`测试: ${endpoint}`);
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ 成功 (${result.statusCode}) - ${result.duration}ms\n`);
    } else {
      console.log(`❌ 失败: ${result.error} (${result.code}) - ${result.duration}ms\n`);
    }
  }
  
  // 汇总报告
  console.log('📊 测试结果汇总:');
  console.log('==================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => r.success === false).length;
  
  console.log(`成功: ${successful}/${results.length}`);
  console.log(`失败: ${failed}/${results.length}`);
  
  if (failed > 0) {
    console.log('\n🔧 故障排除建议:');
    console.log('==================');
    
    const timeoutErrors = results.filter(r => r.code === 'TIMEOUT').length;
    const connectionErrors = results.filter(r => r.code && r.code.includes('CONNECT')).length;
    
    if (timeoutErrors > 0) {
      console.log('• 检测到连接超时，可能原因:');
      console.log('  - 防火墙阻止访问');
      console.log('  - 需要配置代理服务器');
      console.log('  - 网络连接不稳定');
    }
    
    if (connectionErrors > 0) {
      console.log('• 检测到连接被拒绝，可能原因:');
      console.log('  - DNS 解析问题');
      console.log('  - 端口被阻止');
      console.log('  - 需要 VPN 或代理');
    }
    
    console.log('\n💡 解决方案:');
    console.log('1. 设置代理环境变量:');
    console.log('   export HTTPS_PROXY=http://your-proxy:port');
    console.log('2. 切换网络环境（如使用手机热点）');
    console.log('3. 联系网络管理员开放必要端点');
    console.log('4. 考虑使用 VPN 服务');
  } else {
    console.log('\n🎉 所有端点连接正常！NextAuth.js 应该能正常工作。');
  }
}

// 运行测试
if (require.main === module) {
  runNetworkTest().catch(console.error);
}

module.exports = { testEndpoint, runNetworkTest };