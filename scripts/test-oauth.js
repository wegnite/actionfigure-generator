#!/usr/bin/env node

/**
 * Google OAuth 配置测试脚本
 * 用于验证环境变量和 OAuth 流程配置
 */

require('dotenv').config({ path: '.env.local' });

function testOAuthConfig() {
  console.log('🔐 Google OAuth 配置测试');
  console.log('=========================\n');
  
  // 检查必要的环境变量
  const requiredVars = {
    'AUTH_GOOGLE_ID': process.env.AUTH_GOOGLE_ID,
    'AUTH_GOOGLE_SECRET': process.env.AUTH_GOOGLE_SECRET,
    'NEXT_PUBLIC_AUTH_GOOGLE_ID': process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID,
    'NEXT_PUBLIC_AUTH_GOOGLE_ENABLED': process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED,
    'AUTH_URL': process.env.AUTH_URL,
    'AUTH_SECRET': process.env.AUTH_SECRET
  };
  
  console.log('📋 环境变量检查:');
  console.log('==================');
  
  let missingVars = [];
  
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value || value.trim() === '') {
      console.log(`❌ ${key}: 未设置`);
      missingVars.push(key);
    } else {
      // 脱敏显示敏感信息
      const displayValue = key.includes('SECRET') 
        ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
        : value;
      console.log(`✅ ${key}: ${displayValue}`);
    }
  }
  
  console.log('');
  
  // 检查代理配置
  console.log('🌐 网络代理配置:');
  console.log('==================');
  const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
  const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  
  if (httpProxy || httpsProxy) {
    console.log(`✅ HTTP_PROXY: ${httpProxy || '未设置'}`);
    console.log(`✅ HTTPS_PROXY: ${httpsProxy || '未设置'}`);
  } else {
    console.log('ℹ️  未配置代理 (如果在企业网络中可能需要配置)');
  }
  
  console.log('');
  
  // 生成 OAuth URL 进行基础验证
  if (requiredVars.AUTH_GOOGLE_ID && requiredVars.AUTH_URL) {
    console.log('🔗 OAuth 配置验证:');
    console.log('==================');
    
    const clientId = requiredVars.AUTH_GOOGLE_ID;
    const redirectUri = `${requiredVars.AUTH_URL}/callback/google`;
    const scope = 'openid email profile';
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('state', 'test-state');
    
    console.log(`✅ Client ID: ${clientId.substring(0, 12)}...`);
    console.log(`✅ Redirect URI: ${redirectUri}`);
    console.log(`✅ 完整 OAuth URL:`);
    console.log(`   ${authUrl.toString()}`);
    console.log('');
  }
  
  // 总结和建议
  console.log('📝 配置状态总结:');
  console.log('==================');
  
  if (missingVars.length > 0) {
    console.log('❌ 配置不完整，缺少以下环境变量:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('');
    console.log('💡 请在 .env.local 文件中设置这些变量');
  } else {
    console.log('✅ 环境变量配置完整');
    
    // 检查网络连通性状态
    console.log('');
    console.log('🔍 下一步操作建议:');
    console.log('==================');
    console.log('1. 运行网络测试: node scripts/network-test.js');
    console.log('2. 如果网络测试失败，请配置代理或切换网络');
    console.log('3. 启动开发服务器: npm run dev');
    console.log('4. 访问: http://localhost:3000/auth/signin');
    console.log('5. 测试 Google OAuth 登录');
  }
}

// 运行测试
if (require.main === module) {
  testOAuthConfig();
}

module.exports = { testOAuthConfig };