#!/usr/bin/env node

/**
 * 测试工作的URL列表
 */

const workingUrls = [
  'http://localhost:3004/',
  'http://localhost:3004/pricing',
  'http://localhost:3004/privacy-policy',
  'http://localhost:3004/terms-of-service',
  'http://localhost:3004/ads.txt',
  'http://localhost:3004/zh',
  'http://localhost:3004/zh/character-figure',
  'http://localhost:3004/zh/character-figure/video',
  'http://localhost:3004/zh/pricing',
  'http://localhost:3004/zh/posts',
  'http://localhost:3004/zh/showcase',
];

async function testWorkingUrls() {
  console.log('🔍 测试确认工作的URLs...\n');
  
  for (const url of workingUrls) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        timeout: 3000
      });
      
      const status = response.status >= 200 && response.status < 400 ? '✅' : '❌';
      console.log(`${status} ${response.status} - ${url}`);
    } catch (error) {
      console.log(`❌ ERR - ${url} (${error.message})`);
    }
  }
}

testWorkingUrls().catch(console.error);