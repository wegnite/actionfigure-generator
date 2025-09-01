#!/usr/bin/env node

/**
 * Pre-commit Sitemap验证钩子
 * 
 * 功能：
 * 1. 在git commit前自动验证sitemap相关更改
 * 2. 检测路由文件的变动
 * 3. 快速验证新页面的sitemap兼容性
 * 4. 防止破坏性更改被提交
 * 5. 提供修复建议
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置参数
const PRE_COMMIT_CONFIG = {
  // 监控的文件模式
  WATCHED_PATTERNS: [
    'src/app/**/page.tsx',
    'src/app/**/page.mdx', 
    'src/app/sitemap.ts',
    'src/middleware.ts',
    'src/i18n/**/*.ts',
    'src/i18n/**/*.json'
  ],
  
  // 验证阈值
  MIN_SUCCESS_RATE: 95,        // 最低成功率
  MAX_EXECUTION_TIME: 30000,   // 最大执行时间(ms)
  BLOCK_ON_FAILURE: true,      // 失败时阻止提交
  
  // 输出配置
  VERBOSE: false,              // 详细输出
  SAVE_REPORTS: true,          // 保存报告
  REPORT_DIR: path.join(__dirname, '../pre-commit-reports')
};

/**
 * Git工具类
 */
class GitUtils {
  static getStagedFiles() {
    try {
      const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
      return output.trim().split('\n').filter(file => file.trim());
    } catch (error) {
      return [];
    }
  }
  
  static getChangedLines(filepath) {
    try {
      const output = execSync(`git diff --cached --unified=0 "${filepath}"`, { encoding: 'utf8' });
      const lines = output.split('\n');
      const changes = {
        added: [],
        removed: [],
        modified: []
      };
      
      let currentFile = null;
      for (const line of lines) {
        if (line.startsWith('+++')) {
          currentFile = line.substring(4);
        } else if (line.startsWith('+') && !line.startsWith('+++')) {
          changes.added.push(line.substring(1));
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          changes.removed.push(line.substring(1));
        }
      }
      
      return changes;
    } catch (error) {
      return { added: [], removed: [], modified: [] };
    }
  }
  
  static isRelevantChange(filepath) {
    return PRE_COMMIT_CONFIG.WATCHED_PATTERNS.some(pattern => {
      const regexPattern = pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\./g, '\\.');
      return new RegExp(regexPattern).test(filepath);
    });
  }
  
  static getCommitMessage() {
    try {
      // 尝试从COMMIT_EDITMSG文件读取
      const commitMsgPath = path.join(process.cwd(), '.git', 'COMMIT_EDITMSG');
      if (fs.existsSync(commitMsgPath)) {
        return fs.readFileSync(commitMsgPath, 'utf8').split('\n')[0];
      }
    } catch (error) {
      // 忽略错误
    }
    return '';
  }
}

/**
 * 变更分析器
 */
class ChangeAnalyzer {
  constructor(logger) {
    this.logger = logger;
  }
  
  analyzeChanges(stagedFiles) {
    const analysis = {
      relevantChanges: [],
      riskLevel: 'LOW',
      suggestedActions: [],
      requiresValidation: false
    };
    
    const relevantFiles = stagedFiles.filter(file => GitUtils.isRelevantChange(file));
    
    if (relevantFiles.length === 0) {
      this.logger.info('没有发现sitemap相关的文件变更');
      return analysis;
    }
    
    this.logger.info(`发现 ${relevantFiles.length} 个相关文件变更`);
    analysis.requiresValidation = true;
    
    // 分析每个文件的变更
    for (const file of relevantFiles) {
      const fileAnalysis = this.analyzeFileChange(file);
      analysis.relevantChanges.push(fileAnalysis);
      
      // 更新风险级别
      if (fileAnalysis.risk === 'HIGH') {
        analysis.riskLevel = 'HIGH';
      } else if (fileAnalysis.risk === 'MEDIUM' && analysis.riskLevel === 'LOW') {
        analysis.riskLevel = 'MEDIUM';
      }
    }
    
    // 生成建议
    analysis.suggestedActions = this.generateSuggestions(analysis);
    
    return analysis;
  }
  
  analyzeFileChange(filepath) {
    const fileAnalysis = {
      filepath,
      exists: fs.existsSync(filepath),
      type: this.getFileType(filepath),
      risk: 'LOW',
      changes: GitUtils.getChangedLines(filepath),
      issues: []
    };
    
    // 分析不同类型文件的风险
    switch (fileAnalysis.type) {
      case 'sitemap':
        fileAnalysis.risk = 'HIGH';
        fileAnalysis.issues.push('sitemap配置变更可能影响所有URL');
        break;
        
      case 'middleware':
        fileAnalysis.risk = 'HIGH';
        fileAnalysis.issues.push('中间件变更可能影响路由解析');
        break;
        
      case 'i18n-config':
        fileAnalysis.risk = 'MEDIUM';
        fileAnalysis.issues.push('国际化配置变更可能影响多语言URL');
        break;
        
      case 'page':
        if (!fileAnalysis.exists) {
          fileAnalysis.risk = 'MEDIUM';
          fileAnalysis.issues.push('页面文件被删除，可能产生404');
        } else {
          fileAnalysis.risk = 'LOW';
        }
        break;
        
      case 'i18n-messages':
        fileAnalysis.risk = 'LOW';
        break;
    }
    
    // 检查新增页面
    if (fileAnalysis.type === 'page' && fileAnalysis.changes.added.length > 0) {
      fileAnalysis.issues.push('新增页面需要验证sitemap包含');
    }
    
    return fileAnalysis;
  }
  
  getFileType(filepath) {
    if (filepath.includes('sitemap.ts')) return 'sitemap';
    if (filepath.includes('middleware.ts')) return 'middleware';
    if (filepath.includes('i18n') && filepath.endsWith('.ts')) return 'i18n-config';
    if (filepath.includes('i18n') && filepath.endsWith('.json')) return 'i18n-messages';
    if (filepath.includes('page.tsx') || filepath.includes('page.mdx')) return 'page';
    return 'unknown';
  }
  
  generateSuggestions(analysis) {
    const suggestions = [];
    
    if (analysis.riskLevel === 'HIGH') {
      suggestions.push('建议运行完整的sitemap验证');
      suggestions.push('考虑在提交后检查生产环境URL状态');
    }
    
    if (analysis.relevantChanges.some(c => c.type === 'page' && !c.exists)) {
      suggestions.push('删除的页面可能需要设置301重定向');
    }
    
    if (analysis.relevantChanges.some(c => c.type === 'sitemap')) {
      suggestions.push('sitemap配置变更需要重新生成URL列表');
      suggestions.push('建议测试所有语言版本的URL');
    }
    
    if (analysis.relevantChanges.length > 5) {
      suggestions.push('大量文件变更，建议分批验证');
    }
    
    return suggestions;
  }
}

/**
 * 快速验证器
 */
class QuickValidator {
  constructor(logger) {
    this.logger = logger;
  }
  
  async runQuickValidation() {
    this.logger.info('开始快速sitemap验证...');
    
    const startTime = Date.now();
    let validationResult = {
      success: false,
      errors: [],
      warnings: [],
      duration: 0,
      checkedUrls: 0,
      successRate: 0
    };
    
    try {
      // 检查基础配置文件
      await this.checkConfigFiles();
      
      // 运行静态分析
      const staticResult = await this.runStaticAnalysis();
      
      validationResult = {
        ...validationResult,
        ...staticResult,
        duration: Date.now() - startTime
      };
      
      // 如果静态分析成功率低于阈值，进行快速HTTP检查
      if (staticResult.successRate < PRE_COMMIT_CONFIG.MIN_SUCCESS_RATE) {
        this.logger.warning('静态分析成功率偏低，执行快速HTTP检查...');
        const httpResult = await this.runQuickHttpCheck();
        validationResult.httpCheck = httpResult;
      }
      
    } catch (error) {
      validationResult.errors.push(`验证过程出错: ${error.message}`);
      this.logger.error(`验证失败: ${error.message}`);
    }
    
    return validationResult;
  }
  
  async checkConfigFiles() {
    const requiredFiles = [
      'src/app/sitemap.ts',
      'src/middleware.ts',
      'src/i18n/locale.ts'
    ];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`必需的配置文件不存在: ${file}`);
      }
    }
    
    this.logger.info('配置文件检查通过');
  }
  
  async runStaticAnalysis() {
    try {
      // 运行现有的静态分析脚本
      const { generateReport } = require('../analyze_sitemap');
      const report = generateReport();
      
      return {
        success: report.summary.missing === 0,
        successRate: parseFloat(report.summary.successRate.replace('%', '')),
        checkedUrls: report.summary.totalUrls,
        errors: report.problems.map(p => `${p.url}: ${p.reason}`),
        warnings: report.recommendations.map(r => r.description)
      };
      
    } catch (error) {
      return {
        success: false,
        successRate: 0,
        checkedUrls: 0,
        errors: [`静态分析失败: ${error.message}`],
        warnings: []
      };
    }
  }
  
  async runQuickHttpCheck() {
    // 这里实现一个简化的HTTP检查
    // 只检查几个关键URL
    const keyUrls = [
      'http://localhost:3000',
      'http://localhost:3000/pricing',
      'http://localhost:3000/character-figure'
    ];
    
    const results = [];
    let serverStarted = false;
    
    try {
      // 尝试启动服务器（如果需要）
      try {
        await fetch('http://localhost:3000/api/health');
        serverStarted = true;
      } catch {
        this.logger.info('启动开发服务器进行快速检查...');
        // 这里应该启动服务器，但为了简化，我们跳过
      }
      
      for (const url of keyUrls) {
        try {
          const response = await fetch(url, { timeout: 3000 });
          results.push({
            url,
            status: response.status,
            success: response.ok
          });
        } catch (error) {
          results.push({
            url,
            status: 0,
            success: false,
            error: error.message
          });
        }
      }
      
    } catch (error) {
      this.logger.warning(`HTTP检查失败: ${error.message}`);
    }
    
    const successCount = results.filter(r => r.success).length;
    return {
      results,
      successRate: (successCount / results.length) * 100,
      serverWasRunning: serverStarted
    };
  }
}

/**
 * 报告生成器
 */
class PreCommitReporter {
  constructor(logger) {
    this.logger = logger;
    this.ensureReportDirectory();
  }
  
  ensureReportDirectory() {
    if (!fs.existsSync(PRE_COMMIT_CONFIG.REPORT_DIR)) {
      fs.mkdirSync(PRE_COMMIT_CONFIG.REPORT_DIR, { recursive: true });
    }
  }
  
  generateReport(analysis, validationResult) {
    const report = {
      timestamp: new Date().toISOString(),
      commit: {
        message: GitUtils.getCommitMessage(),
        changedFiles: analysis.relevantChanges.length
      },
      analysis,
      validation: validationResult,
      recommendations: this.generateRecommendations(analysis, validationResult)
    };
    
    if (PRE_COMMIT_CONFIG.SAVE_REPORTS) {
      this.saveReport(report);
    }
    
    return report;
  }
  
  generateRecommendations(analysis, validationResult) {
    const recommendations = [...analysis.suggestedActions];
    
    if (!validationResult.success) {
      recommendations.push('修复验证错误后再次提交');
      
      if (validationResult.successRate < 90) {
        recommendations.push('建议运行完整的URL验证测试');
      }
    }
    
    if (analysis.riskLevel === 'HIGH' && validationResult.success) {
      recommendations.push('虽然验证通过，但建议部署后进行生产环境检查');
    }
    
    return recommendations;
  }
  
  saveReport(report) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `pre-commit-${timestamp}.json`;
      const filepath = path.join(PRE_COMMIT_CONFIG.REPORT_DIR, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
      
      // 创建最新报告的软链接
      const latestPath = path.join(PRE_COMMIT_CONFIG.REPORT_DIR, 'latest.json');
      if (fs.existsSync(latestPath)) {
        fs.unlinkSync(latestPath);
      }
      fs.linkSync(filepath, latestPath);
      
      this.logger.info(`Pre-commit报告已保存: ${filepath}`);
    } catch (error) {
      this.logger.warning(`保存报告失败: ${error.message}`);
    }
  }
}

/**
 * 主钩子类
 */
class PreCommitHook {
  constructor(options = {}) {
    this.logger = {
      info: (msg) => (PRE_COMMIT_CONFIG.VERBOSE || options.verbose) && console.log(`[INFO] ${msg}`),
      warning: (msg) => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`),
      error: (msg) => console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
      success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`)
    };
    
    this.changeAnalyzer = new ChangeAnalyzer(this.logger);
    this.quickValidator = new QuickValidator(this.logger);
    this.reporter = new PreCommitReporter(this.logger);
  }
  
  async run() {
    console.log('\n🗺️  Sitemap Pre-commit验证');
    console.log('='.repeat(50));
    
    const startTime = Date.now();
    
    try {
      // 1. 获取暂存文件
      const stagedFiles = GitUtils.getStagedFiles();
      this.logger.info(`检查 ${stagedFiles.length} 个暂存文件`);
      
      if (stagedFiles.length === 0) {
        this.logger.warning('没有暂存文件，跳过验证');
        return 0;
      }
      
      // 2. 分析变更
      const analysis = this.changeAnalyzer.analyzeChanges(stagedFiles);
      
      if (!analysis.requiresValidation) {
        this.logger.success('没有sitemap相关变更，跳过验证');
        return 0;
      }
      
      // 3. 显示变更摘要
      this.displayChangeSummary(analysis);
      
      // 4. 执行快速验证
      const validationResult = await this.quickValidator.runQuickValidation();
      
      // 5. 生成报告
      const report = this.reporter.generateReport(analysis, validationResult);
      
      // 6. 显示结果
      this.displayResults(report);
      
      // 7. 决定是否阻止提交
      const shouldBlock = this.shouldBlockCommit(analysis, validationResult);
      const duration = Date.now() - startTime;
      
      console.log(`\n⏱️  验证耗时: ${Math.round(duration / 1000)}秒`);
      
      if (shouldBlock) {
        console.log('\n❌ 提交被阻止');
        console.log('请修复上述问题后重新提交');
        return 1;
      } else {
        console.log('\n✅ 验证通过，允许提交');
        return 0;
      }
      
    } catch (error) {
      this.logger.error(`Pre-commit钩子执行失败: ${error.message}`);
      return PRE_COMMIT_CONFIG.BLOCK_ON_FAILURE ? 1 : 0;
    }
  }
  
  displayChangeSummary(analysis) {
    console.log(`\n📋 变更摘要:`);
    console.log(`   风险级别: ${this.getRiskIcon(analysis.riskLevel)} ${analysis.riskLevel}`);
    console.log(`   相关文件: ${analysis.relevantChanges.length}个`);
    
    if (PRE_COMMIT_CONFIG.VERBOSE) {
      analysis.relevantChanges.forEach(change => {
        console.log(`   - ${change.filepath} (${change.type}, ${change.risk})`);
        if (change.issues.length > 0) {
          change.issues.forEach(issue => {
            console.log(`     ⚠️  ${issue}`);
          });
        }
      });
    }
  }
  
  displayResults(report) {
    const { validation } = report;
    
    console.log(`\n📊 验证结果:`);
    console.log(`   状态: ${validation.success ? '✅ 成功' : '❌ 失败'}`);
    console.log(`   成功率: ${Math.round(validation.successRate)}%`);
    console.log(`   检查URL数: ${validation.checkedUrls}`);
    
    if (validation.errors.length > 0) {
      console.log(`\n❌ 错误 (${validation.errors.length}):`);
      validation.errors.slice(0, 5).forEach(error => {
        console.log(`   - ${error}`);
      });
      if (validation.errors.length > 5) {
        console.log(`   ... 还有 ${validation.errors.length - 5} 个错误`);
      }
    }
    
    if (validation.warnings.length > 0) {
      console.log(`\n⚠️  警告 (${validation.warnings.length}):`);
      validation.warnings.slice(0, 3).forEach(warning => {
        console.log(`   - ${warning}`);
      });
    }
    
    if (report.recommendations.length > 0) {
      console.log(`\n💡 建议:`);
      report.recommendations.forEach(rec => {
        console.log(`   - ${rec}`);
      });
    }
  }
  
  shouldBlockCommit(analysis, validationResult) {
    if (!PRE_COMMIT_CONFIG.BLOCK_ON_FAILURE) {
      return false;
    }
    
    // 验证失败
    if (!validationResult.success) {
      return true;
    }
    
    // 成功率过低
    if (validationResult.successRate < PRE_COMMIT_CONFIG.MIN_SUCCESS_RATE) {
      return true;
    }
    
    // 高风险变更但验证有问题
    if (analysis.riskLevel === 'HIGH' && validationResult.errors.length > 0) {
      return true;
    }
    
    return false;
  }
  
  getRiskIcon(riskLevel) {
    switch (riskLevel) {
      case 'HIGH': return '🔴';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🟢';
      default: return '⚪';
    }
  }
}

/**
 * 安装脚本
 */
function installHook() {
  const hookPath = path.join(process.cwd(), '.git', 'hooks', 'pre-commit');
  const hookContent = `#!/bin/sh
# Sitemap验证 pre-commit钩子
node test/sitemap/hooks/pre-commit-sitemap.js
`;

  try {
    // 检查.git目录是否存在
    if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
      console.error('错误: 不是git仓库');
      return 1;
    }
    
    // 创建或更新pre-commit钩子
    if (fs.existsSync(hookPath)) {
      const existing = fs.readFileSync(hookPath, 'utf8');
      if (existing.includes('pre-commit-sitemap.js')) {
        console.log('✅ Sitemap pre-commit钩子已存在');
        return 0;
      } else {
        // 备份现有钩子
        fs.writeFileSync(hookPath + '.backup', existing);
        console.log('📦 已备份现有pre-commit钩子');
      }
    }
    
    fs.writeFileSync(hookPath, hookContent);
    fs.chmodSync(hookPath, '755');
    
    console.log('✅ Sitemap pre-commit钩子安装成功');
    console.log('📍 钩子位置:', hookPath);
    return 0;
    
  } catch (error) {
    console.error('❌ 安装钩子失败:', error.message);
    return 1;
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--install')) {
    return installHook();
  }
  
  if (args.includes('--help')) {
    console.log(`
Sitemap Pre-commit验证钩子

用法:
  node pre-commit-sitemap.js [选项]
  
选项:
  --install     安装Git pre-commit钩子
  --verbose     详细输出
  --help        显示帮助信息
  
环境变量:
  PRE_COMMIT_VERBOSE=1    启用详细输出
  PRE_COMMIT_BLOCK=0      禁用提交阻止
`);
    return 0;
  }
  
  // 设置环境变量配置
  if (process.env.PRE_COMMIT_VERBOSE) {
    PRE_COMMIT_CONFIG.VERBOSE = true;
  }
  
  if (process.env.PRE_COMMIT_BLOCK === '0') {
    PRE_COMMIT_CONFIG.BLOCK_ON_FAILURE = false;
  }
  
  const verbose = args.includes('--verbose') || PRE_COMMIT_CONFIG.VERBOSE;
  
  const hook = new PreCommitHook({ verbose });
  return await hook.run();
}

// 导出模块
module.exports = {
  PreCommitHook,
  GitUtils,
  ChangeAnalyzer,
  QuickValidator,
  PRE_COMMIT_CONFIG
};

// 如果直接执行
if (require.main === module) {
  main().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error(`程序执行失败: ${error.message}`);
    process.exit(1);
  });
}