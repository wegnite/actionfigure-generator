#!/usr/bin/env node

/**
 * 快速URL测试 - 无需启动服务器的基础验证
 * 
 * 功能：
 * 1. 验证关键路由配置问题
 * 2. 检查文件是否存在
 * 3. 提供快速的修复验证
 */

const fs = require('fs');
const path = require('path');
const { generateSitemapUrls, scanActualPages } = require('./analyze_sitemap');

/**
 * 检查关键文件是否存在
 */
function checkCriticalFiles() {
  const criticalFiles = [
    'src/app/sitemap.ts',
    'src/middleware.ts',
    'src/i18n/locale.ts',
    'src/i18n/routing.ts'
  ];
  
  const results = [];
  
  criticalFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, '../..', filePath);
    const exists = fs.existsSync(fullPath);
    results.push({ file: filePath, exists, fullPath });
  });
  
  return results;
}

/**
 * 分析当前问题状态
 */
function analyzeCurrentState() {
  console.log('🔍 分析当前sitemap问题状态...\n');
  
  // 1. 检查关键文件
  console.log('📁 检查关键配置文件:');
  const fileCheck = checkCriticalFiles();
  fileCheck.forEach(({ file, exists }) => {
    const icon = exists ? '✅' : '❌';
    console.log(`   ${icon} ${file}`);
  });
  
  // 2. 生成URL分析
  console.log('\n📊 Sitemap URL分析:');
  const sitemapUrls = generateSitemapUrls();
  const actualPages = scanActualPages();
  
  console.log(`   📋 Sitemap生成URL数量: ${sitemapUrls.length}`);
  console.log(`   📁 实际页面文件数量: ${actualPages.length}`);
  
  // 3. 按类型统计URL
  const urlsByType = sitemapUrls.reduce((acc, url) => {
    acc[url.type] = (acc[url.type] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n📈 URL类型分布:');
  Object.entries(urlsByType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}个`);
  });
  
  // 4. 检查问题URL
  const problemUrls = sitemapUrls.filter(item => {
    const urlPath = new URL(item.url).pathname;
    
    // 检查英文默认URL是否有对应的[locale]页面
    if (item.locale === 'en' && item.type !== 'legal') {
      const expectedLocalePath = `/[locale]${urlPath || ''}`;
      return !actualPages.some(page => 
        page.path === expectedLocalePath ||
        (urlPath === '' && page.path === '/[locale]')
      );
    }
    
    return false;
  });
  
  console.log('\n❌ 识别的问题URL:');
  if (problemUrls.length === 0) {
    console.log('   🎉 未发现问题！');
  } else {
    problemUrls.forEach(item => {
      console.log(`   • ${item.url} (${item.type})`);
    });
  }
  
  return {
    totalUrls: sitemapUrls.length,
    problemUrls: problemUrls.length,
    successRate: ((sitemapUrls.length - problemUrls.length) / sitemapUrls.length * 100).toFixed(1)
  };
}

/**
 * 生成修复检查清单
 */
function generateFixChecklist() {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 修复检查清单');
  console.log('='.repeat(60));
  
  const checklist = [
    {
      item: '验证sitemap.ts生成逻辑',
      description: '确保英文URL不包含/en前缀，其他语言包含语言前缀',
      command: 'node test/sitemap/analyze_sitemap.js'
    },
    {
      item: '检查middleware.ts配置',
      description: '确保正确处理默认语言路由重写',
      command: '手动检查 src/middleware.ts 的matcher配置'
    },
    {
      item: '验证i18n配置',
      description: '确认localePrefix为"as-needed"且defaultLocale为"en"',
      command: '检查 src/i18n/locale.ts'
    },
    {
      item: '测试关键URL',
      description: '手动测试几个关键URL是否正常工作',
      urls: [
        'http://localhost:3000/',
        'http://localhost:3000/pricing',
        'http://localhost:3000/zh/pricing',
        'http://localhost:3000/tutorial/how-to-make-action-figure-ai'
      ]
    },
    {
      item: '运行完整URL测试',
      description: '使用自动化脚本测试所有sitemap URL',
      command: 'node test/sitemap/url_validator.js'
    }
  ];
  
  checklist.forEach((item, index) => {
    console.log(`${index + 1}. ${item.item}`);
    console.log(`   说明: ${item.description}`);
    if (item.command) {
      console.log(`   命令: ${item.command}`);
    }
    if (item.urls) {
      console.log(`   测试URL:`);
      item.urls.forEach(url => console.log(`     - ${url}`));
    }
    console.log('');
  });
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 Sitemap 404问题快速诊断\n');
  
  try {
    const analysis = analyzeCurrentState();
    
    console.log('\n' + '='.repeat(60));
    console.log('📈 诊断总结');
    console.log('='.repeat(60));
    console.log(`总URL数量:   ${analysis.totalUrls}`);
    console.log(`问题URL数量: ${analysis.problemUrls}`);
    console.log(`当前成功率: ${analysis.successRate}%`);
    
    if (analysis.problemUrls > 0) {
      console.log(`\n⚠️  仍有 ${analysis.problemUrls} 个URL存在问题`);
      console.log('   主要问题: 英文默认URL无法匹配到[locale]路由');
      console.log('   解决方法: 修复sitemap生成逻辑或middleware配置');
    } else {
      console.log('\n🎉 所有URL配置看起来正确！');
      console.log('   建议: 运行完整测试验证实际访问效果');
    }
    
    generateFixChecklist();
    
  } catch (error) {
    console.error('❌ 诊断过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { analyzeCurrentState, checkCriticalFiles };