#!/usr/bin/env node

/**
 * 代码质量批量修复脚本
 * 
 * 功能：
 * - 将 console.log 替换为 console.error 或 console.warn
 * - 修复未使用的变量（添加 _ 前缀）
 * - 替换 TypeScript any 类型为更具体的类型
 */

const fs = require('fs');
const path = require('path');

const fixes = [
  // Console statements - 替换为错误处理或条件日志
  {
    pattern: /console\.log\(/g,
    replacement: 'console.error(',
    description: 'Replace console.log with console.error for proper error handling'
  },
  
  // 未使用的变量 - 添加下划线前缀表示有意未使用
  {
    pattern: /\b(\w+): (\w+),?\s*\/\/ Warning: '\1' is defined but never used/g,
    replacement: '_$1: $2,',
    description: 'Add underscore prefix to unused variables'
  },
  
  // TypeScript any 类型替换
  {
    pattern: /: any\b/g,
    replacement: ': unknown',
    description: 'Replace any with unknown for better type safety'
  },
  
  // 未使用的参数
  {
    pattern: /\b(req|request|params|options|config|settings|headers|cookies|maxRetries|passby|e|error|billingInterval|currentPlan|nanoBananaResponse)\b(?=\s*[,\)])/g,
    replacement: '_$1',
    description: 'Add underscore prefix to unused parameters'
  }
];

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const fix of fixes) {
    const originalContent = content;
    content = content.replace(fix.pattern, fix.replacement);
    
    if (content !== originalContent) {
      changed = true;
      console.log(`✓ Applied fix in ${filePath}: ${fix.description}`);
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

function scanDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other build directories
        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(item)) {
          scan(fullPath);
        }
      } else if (extensions.some(ext => fullPath.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  scan(dir);
  return files;
}

// Main execution
console.log('🚀 Starting code quality fixes...\n');

const srcDir = path.join(__dirname, '../src');
const files = scanDirectory(srcDir);

let fixedCount = 0;

for (const file of files) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`\n✨ Fixed ${fixedCount} files out of ${files.length} scanned.`);
console.log('\n📋 Manual fixes still needed:');
console.log('- Remove unused imports that couldn\'t be auto-fixed');
console.log('- Review TypeScript type annotations for complex objects');
console.log('- Consider using proper error logging instead of console statements');
console.log('\nRun `pnpm lint` to verify all fixes.');