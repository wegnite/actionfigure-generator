#!/usr/bin/env node

/**
 * Favicon 测试和故障排除脚本
 */

const fs = require('fs');
const path = require('path');

function testFaviconSetup() {
  console.log('🔍 Favicon 配置检查');
  console.log('==================\n');
  
  const publicDir = path.join(__dirname, '..', 'public');
  const faviconFiles = [
    'favicon.ico',
    'favicon.svg',
    'favicon-backup.ico'
  ];
  
  console.log('📁 检查 favicon 文件存在性:');
  console.log('==============================');
  
  faviconFiles.forEach(filename => {
    const filePath = path.join(publicDir, filename);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`✅ ${filename} - ${(stats.size / 1024).toFixed(2)} KB`);
    } else {
      console.log(`❌ ${filename} - 文件不存在`);
    }
  });
  
  console.log('\n🔧 检查 favicon.ico 文件头:');
  console.log('=============================');
  
  const faviconPath = path.join(publicDir, 'favicon.ico');
  if (fs.existsSync(faviconPath)) {
    const buffer = fs.readFileSync(faviconPath);
    const header = buffer.slice(0, 4);
    
    // ICO 文件头应该是: 00 00 01 00
    if (header[0] === 0 && header[1] === 0 && header[2] === 1 && header[3] === 0) {
      console.log('✅ favicon.ico 文件格式正确 (ICO 格式)');
    } else if (header.toString('utf8', 0, 4) === '<svg') {
      console.log('❌ favicon.ico 是 SVG 格式，应该是 ICO 格式');
      console.log('💡 建议: cp public/favicon-backup.ico public/favicon.ico');
    } else {
      console.log('⚠️ favicon.ico 格式未知');
      console.log('文件头:', Array.from(header).map(b => b.toString(16).padStart(2, '0')).join(' '));
    }
  }
  
  console.log('\n📋 Next.js Layout 配置检查:');
  console.log('===========================');
  
  const layoutPath = path.join(__dirname, '..', 'src', 'app', 'layout.tsx');
  if (fs.existsSync(layoutPath)) {
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    const faviconConfigs = [
      { pattern: /rel="icon".*href="\/favicon\.ico"/, description: 'ICO favicon 链接' },
      { pattern: /rel="icon".*href="\/favicon\.svg"/, description: 'SVG favicon 链接' },
      { pattern: /rel="apple-touch-icon"/, description: 'Apple touch icon' },
      { pattern: /name="theme-color"/, description: '主题颜色' }
    ];
    
    faviconConfigs.forEach(config => {
      if (config.pattern.test(layoutContent)) {
        console.log(`✅ ${config.description} - 已配置`);
      } else {
        console.log(`❌ ${config.description} - 未配置`);
      }
    });
  } else {
    console.log('❌ layout.tsx 文件不存在');
  }
  
  console.log('\n🗂️  浏览器缓存清理建议:');
  console.log('=======================');
  console.log('1. 硬刷新页面 (Ctrl+Shift+R 或 Cmd+Shift+R)');
  console.log('2. 清空浏览器缓存和 Cookie');
  console.log('3. 在开发者工具中禁用缓存');
  console.log('4. 重启 Next.js 开发服务器');
  console.log('5. 尝试无痕模式浏览');
  
  console.log('\n🚀 测试步骤:');
  console.log('============');
  console.log('1. 启动开发服务器: npm run dev');
  console.log('2. 打开浏览器访问: http://localhost:3000');
  console.log('3. 检查浏览器标签页是否显示 favicon');
  console.log('4. 直接访问: http://localhost:3000/favicon.ico');
  console.log('5. 查看开发者工具 Network 面板中 favicon 请求状态');
}

// 运行测试
if (require.main === module) {
  testFaviconSetup();
}

module.exports = { testFaviconSetup };