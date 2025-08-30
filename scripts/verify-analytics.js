#!/usr/bin/env node

/**
 * Google Analytics 集成验证脚本
 * 
 * 验证项目中的 Google Analytics 配置是否正确
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Google Analytics 集成验证开始...\n');

// 验证项目
const checks = [
  {
    name: '环境变量配置',
    check: () => {
      const envLocal = path.join(__dirname, '../.env.local');
      const envProduction = path.join(__dirname, '../.env.production');
      
      let localOk = false;
      let prodOk = false;
      
      try {
        const localContent = fs.readFileSync(envLocal, 'utf8');
        localOk = localContent.includes('NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-B10KKVENLG"');
      } catch (e) {
        // 文件可能不存在
      }
      
      try {
        const prodContent = fs.readFileSync(envProduction, 'utf8');
        prodOk = prodContent.includes('NEXT_PUBLIC_GOOGLE_ANALYTICS_ID = "G-B10KKVENLG"');
      } catch (e) {
        // 文件可能不存在
      }
      
      return {
        passed: localOk && prodOk,
        message: `开发环境: ${localOk ? '✅' : '❌'}, 生产环境: ${prodOk ? '✅' : '❌'}`
      };
    }
  },
  
  {
    name: 'Google Analytics 组件',
    check: () => {
      const componentPath = path.join(__dirname, '../src/components/analytics/google-analytics.tsx');
      
      try {
        const content = fs.readFileSync(componentPath, 'utf8');
        const hasNextGoogleAnalytics = content.includes('@next/third-parties/google');
        const hasAnalyticsId = content.includes('NEXT_PUBLIC_GOOGLE_ANALYTICS_ID');
        const hasGDPRCompliance = content.includes('consent');
        
        return {
          passed: hasNextGoogleAnalytics && hasAnalyticsId && hasGDPRCompliance,
          message: `Next.js组件: ${hasNextGoogleAnalytics ? '✅' : '❌'}, 环境变量使用: ${hasAnalyticsId ? '✅' : '❌'}, GDPR合规: ${hasGDPRCompliance ? '✅' : '❌'}`
        };
      } catch (e) {
        return {
          passed: false,
          message: '❌ 组件文件不存在'
        };
      }
    }
  },
  
  {
    name: 'Analytics 统一组件',
    check: () => {
      const indexPath = path.join(__dirname, '../src/components/analytics/index.tsx');
      
      try {
        const content = fs.readFileSync(indexPath, 'utf8');
        const importsGA = content.includes('from "./google-analytics"');
        const rendersGA = content.includes('<GoogleAnalytics />');
        const productionCheck = content.includes('process.env.NODE_ENV !== "production"');
        
        return {
          passed: importsGA && rendersGA && productionCheck,
          message: `导入GA: ${importsGA ? '✅' : '❌'}, 渲染GA: ${rendersGA ? '✅' : '❌'}, 生产环境检查: ${productionCheck ? '✅' : '❌'}`
        };
      } catch (e) {
        return {
          passed: false,
          message: '❌ 统一组件文件不存在'
        };
      }
    }
  },
  
  {
    name: 'Layout 集成',
    check: () => {
      const layoutPath = path.join(__dirname, '../src/app/layout.tsx');
      
      try {
        const content = fs.readFileSync(layoutPath, 'utf8');
        const importsAnalytics = content.includes('from "@/components/analytics"');
        const rendersAnalytics = content.includes('<Analytics />');
        
        return {
          passed: importsAnalytics && rendersAnalytics,
          message: `导入Analytics: ${importsAnalytics ? '✅' : '❌'}, 渲染Analytics: ${rendersAnalytics ? '✅' : '❌'}`
        };
      } catch (e) {
        return {
          passed: false,
          message: '❌ Layout文件不存在'
        };
      }
    }
  },
  
  {
    name: '工具函数库',
    check: () => {
      const utilsPath = path.join(__dirname, '../src/lib/analytics.ts');
      
      try {
        const content = fs.readFileSync(utilsPath, 'utf8');
        const hasTrackEvent = content.includes('trackEvent');
        const hasTrackConversion = content.includes('trackConversion');
        const hasAnalyticsExport = content.includes('export default analytics');
        
        return {
          passed: hasTrackEvent && hasTrackConversion && hasAnalyticsExport,
          message: `事件跟踪: ${hasTrackEvent ? '✅' : '❌'}, 转化跟踪: ${hasTrackConversion ? '✅' : '❌'}, 默认导出: ${hasAnalyticsExport ? '✅' : '❌'}`
        };
      } catch (e) {
        return {
          passed: false,
          message: '❌ 工具函数库不存在'
        };
      }
    }
  }
];

// 运行检查
let allPassed = true;
checks.forEach((test, index) => {
  const result = test.check();
  const status = result.passed ? '✅ PASS' : '❌ FAIL';
  
  console.log(`${index + 1}. ${test.name}: ${status}`);
  console.log(`   ${result.message}\n`);
  
  if (!result.passed) {
    allPassed = false;
  }
});

// 总结
console.log('==========================================');
if (allPassed) {
  console.log('🎉 Google Analytics 集成验证完成！');
  console.log('✅ 所有检查项目均通过');
  console.log('\n下一步：');
  console.log('1. 部署到生产环境');
  console.log('2. 在 Google Analytics 中验证数据接收');
  console.log('3. 检查 Real-time 报告');
} else {
  console.log('❌ 部分检查项目未通过');
  console.log('请修复上述问题后重新运行验证');
  process.exit(1);
}

console.log('\n📊 Google Analytics ID: G-B10KKVENLG');
console.log('🌐 Analytics URL: https://analytics.google.com/analytics/web/');
console.log('==========================================');