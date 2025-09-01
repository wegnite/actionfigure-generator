#!/usr/bin/env node

/**
 * Sitemap持续验证主脚本
 * 
 * 功能：
 * 1. 集成现有的诊断和验证工具
 * 2. 提供全面的sitemap健康检查
 * 3. 支持多种运行模式（快速、完整、监控）
 * 4. 生成详细的验证报告和修复建议
 * 5. 支持CI/CD集成和本地开发
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const { generateReport } = require('./analyze_sitemap');

// 配置参数
const CONFIG = {
  // 服务器配置
  SERVER_HOST: 'localhost',
  SERVER_PORT: 3000,
  SERVER_STARTUP_TIMEOUT: 30000,
  REQUEST_TIMEOUT: 10000,
  
  // 验证配置
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  PARALLEL_REQUESTS: 5,
  
  // 阈值配置
  SUCCESS_THRESHOLD: 95, // 成功率阈值
  RESPONSE_TIME_THRESHOLD: 5000, // 响应时间阈值(ms)
  
  // 报告配置
  REPORT_DIR: path.join(__dirname, 'reports'),
  ARCHIVE_REPORTS: true,
  MAX_ARCHIVED_REPORTS: 50
};

/**
 * 验证模式枚举
 */
const VALIDATION_MODES = {
  QUICK: 'quick',       // 快速验证：仅静态分析
  STANDARD: 'standard', // 标准验证：静态分析 + HTTP测试
  FULL: 'full',         // 完整验证：包含性能监控
  MONITOR: 'monitor'    // 监控模式：持续监控
};

/**
 * 日志工具类
 */
class Logger {
  constructor(verbose = false) {
    this.verbose = verbose;
    this.startTime = Date.now();
  }
  
  info(message, force = false) {
    if (this.verbose || force) {
      const timestamp = new Date().toISOString();
      console.log(`[INFO ${timestamp}] ${message}`);
    }
  }
  
  success(message) {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[32m[SUCCESS ${timestamp}] ${message}\x1b[0m`);
  }
  
  warning(message) {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[33m[WARNING ${timestamp}] ${message}\x1b[0m`);
  }
  
  error(message) {
    const timestamp = new Date().toISOString();
    console.error(`\x1b[31m[ERROR ${timestamp}] ${message}\x1b[0m`);
  }
  
  getElapsedTime() {
    return Date.now() - this.startTime;
  }
}

/**
 * 服务器管理器
 */
class ServerManager {
  constructor(logger) {
    this.logger = logger;
    this.serverProcess = null;
    this.isRunning = false;
  }
  
  async start() {
    if (this.isRunning) {
      this.logger.info('服务器已在运行');
      return true;
    }
    
    this.logger.info('启动开发服务器...');
    
    return new Promise((resolve, reject) => {
      // 启动服务器进程
      this.serverProcess = spawn('pnpm', ['dev'], {
        stdio: 'pipe',
        detached: false
      });
      
      let serverReady = false;
      const timeout = setTimeout(() => {
        if (!serverReady) {
          this.logger.error('服务器启动超时');
          this.stop();
          reject(new Error('服务器启动超时'));
        }
      }, CONFIG.SERVER_STARTUP_TIMEOUT);
      
      // 监听服务器输出
      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        this.logger.info(`服务器: ${output.trim()}`);
        
        // 检查服务器是否准备就绪
        if (output.includes('Ready') || output.includes('localhost:3000')) {
          if (!serverReady) {
            serverReady = true;
            this.isRunning = true;
            clearTimeout(timeout);
            this.logger.success('开发服务器启动成功');
            
            // 等待一段时间确保服务器完全启动
            setTimeout(() => resolve(true), 2000);
          }
        }
      });
      
      this.serverProcess.stderr.on('data', (data) => {
        const error = data.toString();
        this.logger.warning(`服务器错误: ${error.trim()}`);
      });
      
      this.serverProcess.on('error', (error) => {
        this.logger.error(`服务器进程错误: ${error.message}`);
        clearTimeout(timeout);
        reject(error);
      });
      
      this.serverProcess.on('exit', (code) => {
        this.logger.info(`服务器进程退出，代码: ${code}`);
        this.isRunning = false;
        clearTimeout(timeout);
        if (!serverReady) {
          reject(new Error(`服务器启动失败，退出代码: ${code}`));
        }
      });
    });
  }
  
  async stop() {
    if (!this.serverProcess || !this.isRunning) {
      return;
    }
    
    this.logger.info('关闭开发服务器...');
    
    return new Promise((resolve) => {
      this.serverProcess.on('exit', () => {
        this.logger.success('开发服务器已关闭');
        this.isRunning = false;
        resolve();
      });
      
      // 优雅关闭
      this.serverProcess.kill('SIGTERM');
      
      // 强制关闭的备选方案
      setTimeout(() => {
        if (this.isRunning) {
          this.logger.warning('强制关闭服务器进程');
          this.serverProcess.kill('SIGKILL');
          this.isRunning = false;
          resolve();
        }
      }, 5000);
    });
  }
}

/**
 * HTTP验证器
 */
class HttpValidator {
  constructor(logger) {
    this.logger = logger;
  }
  
  async validateUrl(url, retries = CONFIG.MAX_RETRIES) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const startTime = Date.now();
        
        // 创建请求配置
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
        
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'SitemapValidator/1.0'
          }
        });
        
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        const result = {
          url,
          status: response.status,
          statusText: response.statusText,
          responseTime,
          contentType: response.headers.get('content-type') || 'unknown',
          timestamp: new Date().toISOString(),
          attempt,
          success: response.status >= 200 && response.status < 400
        };
        
        // 检查响应时间是否超过阈值
        if (responseTime > CONFIG.RESPONSE_TIME_THRESHOLD) {
          result.warning = `响应时间过长: ${responseTime}ms`;
        }
        
        this.logger.info(`${url} - ${response.status} (${responseTime}ms)`);
        return result;
        
      } catch (error) {
        this.logger.warning(`验证 ${url} 失败 (尝试 ${attempt}/${retries}): ${error.message}`);
        
        if (attempt === retries) {
          return {
            url,
            status: 0,
            statusText: 'Request Failed',
            responseTime: 0,
            error: error.message,
            timestamp: new Date().toISOString(),
            attempt,
            success: false
          };
        }
        
        // 重试延迟
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
      }
    }
  }
  
  async validateUrls(urls) {
    this.logger.info(`开始验证 ${urls.length} 个URL...`);
    const results = [];
    
    // 分批并发处理
    for (let i = 0; i < urls.length; i += CONFIG.PARALLEL_REQUESTS) {
      const batch = urls.slice(i, i + CONFIG.PARALLEL_REQUESTS);
      const batchPromises = batch.map(url => this.validateUrl(url));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }
}

/**
 * 性能监控器
 */
class PerformanceMonitor {
  constructor(logger) {
    this.logger = logger;
  }
  
  async measurePerformance(urls) {
    this.logger.info('开始性能监控...');
    const results = [];
    
    for (const url of urls) {
      try {
        const measurements = await this.measureUrlPerformance(url);
        results.push(measurements);
      } catch (error) {
        this.logger.error(`性能测试失败 ${url}: ${error.message}`);
        results.push({
          url,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return results;
  }
  
  async measureUrlPerformance(url) {
    const measurements = [];
    const iterations = 3;
    
    for (let i = 0; i < iterations; i++) {
      const startTime = process.hrtime.bigint();
      
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'PerformanceMonitor/1.0'
          }
        });
        
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // 转换为毫秒
        
        measurements.push({
          iteration: i + 1,
          responseTime: Math.round(duration),
          status: response.status,
          contentLength: parseInt(response.headers.get('content-length') || '0')
        });
        
      } catch (error) {
        measurements.push({
          iteration: i + 1,
          error: error.message
        });
      }
      
      // 测试间隔
      if (i < iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // 计算统计数据
    const validMeasurements = measurements.filter(m => !m.error);
    const responseTimes = validMeasurements.map(m => m.responseTime);
    
    return {
      url,
      measurements,
      statistics: responseTimes.length > 0 ? {
        avg: Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length),
        min: Math.min(...responseTimes),
        max: Math.max(...responseTimes),
        successRate: (validMeasurements.length / iterations) * 100
      } : null,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 报告生成器
 */
class ReportGenerator {
  constructor(logger) {
    this.logger = logger;
    this.ensureReportDirectory();
  }
  
  ensureReportDirectory() {
    if (!fs.existsSync(CONFIG.REPORT_DIR)) {
      fs.mkdirSync(CONFIG.REPORT_DIR, { recursive: true });
    }
  }
  
  generateSummary(staticAnalysis, httpResults, performanceResults) {
    const totalUrls = staticAnalysis.summary.totalUrls;
    const httpSuccessCount = httpResults ? httpResults.filter(r => r.success).length : 0;
    const httpSuccessRate = httpResults ? (httpSuccessCount / httpResults.length) * 100 : 0;
    
    return {
      timestamp: new Date().toISOString(),
      validation: {
        totalUrls,
        staticAnalysisSuccess: staticAnalysis.summary.matched,
        staticAnalysisRate: parseFloat(staticAnalysis.summary.successRate.replace('%', '')),
        httpSuccess: httpSuccessCount,
        httpSuccessRate: Math.round(httpSuccessRate * 10) / 10
      },
      performance: performanceResults ? this.calculatePerformanceMetrics(performanceResults) : null,
      overallHealth: this.calculateOverallHealth(staticAnalysis, httpResults, performanceResults)
    };
  }
  
  calculatePerformanceMetrics(performanceResults) {
    const validResults = performanceResults.filter(r => r.statistics);
    if (validResults.length === 0) return null;
    
    const allAvgTimes = validResults.map(r => r.statistics.avg);
    const allSuccessRates = validResults.map(r => r.statistics.successRate);
    
    return {
      averageResponseTime: Math.round(allAvgTimes.reduce((a, b) => a + b, 0) / allAvgTimes.length),
      medianResponseTime: this.calculateMedian(allAvgTimes),
      averageSuccessRate: Math.round(allSuccessRates.reduce((a, b) => a + b, 0) / allSuccessRates.length * 10) / 10,
      slowestUrls: validResults
        .sort((a, b) => b.statistics.avg - a.statistics.avg)
        .slice(0, 5)
        .map(r => ({
          url: r.url,
          avgTime: r.statistics.avg
        }))
    };
  }
  
  calculateMedian(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
      : sorted[mid];
  }
  
  calculateOverallHealth(staticAnalysis, httpResults, performanceResults) {
    let score = 100;
    const issues = [];
    
    // 静态分析评分
    const staticRate = parseFloat(staticAnalysis.summary.successRate.replace('%', ''));
    if (staticRate < CONFIG.SUCCESS_THRESHOLD) {
      const penalty = (CONFIG.SUCCESS_THRESHOLD - staticRate) * 2;
      score -= penalty;
      issues.push({
        type: 'static_analysis',
        severity: 'high',
        message: `静态分析成功率过低: ${staticRate}%`,
        impact: penalty
      });
    }
    
    // HTTP测试评分
    if (httpResults) {
      const httpRate = (httpResults.filter(r => r.success).length / httpResults.length) * 100;
      if (httpRate < CONFIG.SUCCESS_THRESHOLD) {
        const penalty = (CONFIG.SUCCESS_THRESHOLD - httpRate) * 2;
        score -= penalty;
        issues.push({
          type: 'http_validation',
          severity: 'high',
          message: `HTTP验证成功率过低: ${Math.round(httpRate * 10) / 10}%`,
          impact: penalty
        });
      }
    }
    
    // 性能评分
    if (performanceResults) {
      const perfMetrics = this.calculatePerformanceMetrics(performanceResults);
      if (perfMetrics && perfMetrics.averageResponseTime > CONFIG.RESPONSE_TIME_THRESHOLD) {
        const penalty = 10;
        score -= penalty;
        issues.push({
          type: 'performance',
          severity: 'medium',
          message: `平均响应时间过长: ${perfMetrics.averageResponseTime}ms`,
          impact: penalty
        });
      }
    }
    
    return {
      score: Math.max(0, Math.round(score)),
      rating: this.getHealthRating(score),
      issues
    };
  }
  
  getHealthRating(score) {
    if (score >= 95) return 'EXCELLENT';
    if (score >= 85) return 'GOOD';
    if (score >= 70) return 'FAIR';
    if (score >= 50) return 'POOR';
    return 'CRITICAL';
  }
  
  async saveReport(report, mode) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `sitemap-validation-${mode}-${timestamp}.json`;
    const filepath = path.join(CONFIG.REPORT_DIR, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    
    // 创建最新报告的软链接
    const latestPath = path.join(CONFIG.REPORT_DIR, `latest-${mode}.json`);
    if (fs.existsSync(latestPath)) {
      fs.unlinkSync(latestPath);
    }
    fs.linkSync(filepath, latestPath);
    
    this.logger.success(`报告已保存: ${filepath}`);
    
    // 清理旧报告
    if (CONFIG.ARCHIVE_REPORTS) {
      await this.cleanupOldReports(mode);
    }
    
    return filepath;
  }
  
  async cleanupOldReports(mode) {
    try {
      const files = fs.readdirSync(CONFIG.REPORT_DIR)
        .filter(f => f.includes(`sitemap-validation-${mode}-`) && f.endsWith('.json'))
        .map(f => ({
          name: f,
          path: path.join(CONFIG.REPORT_DIR, f),
          mtime: fs.statSync(path.join(CONFIG.REPORT_DIR, f)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);
      
      if (files.length > CONFIG.MAX_ARCHIVED_REPORTS) {
        const filesToDelete = files.slice(CONFIG.MAX_ARCHIVED_REPORTS);
        for (const file of filesToDelete) {
          fs.unlinkSync(file.path);
          this.logger.info(`已删除旧报告: ${file.name}`);
        }
      }
    } catch (error) {
      this.logger.warning(`清理旧报告失败: ${error.message}`);
    }
  }
}

/**
 * 主验证器类
 */
class SitemapValidator {
  constructor(options = {}) {
    this.logger = new Logger(options.verbose);
    this.serverManager = new ServerManager(this.logger);
    this.httpValidator = new HttpValidator(this.logger);
    this.performanceMonitor = new PerformanceMonitor(this.logger);
    this.reportGenerator = new ReportGenerator(this.logger);
  }
  
  async validate(mode = VALIDATION_MODES.STANDARD, options = {}) {
    this.logger.success(`开始 ${mode.toUpperCase()} 模式验证`);
    
    try {
      const results = {
        mode,
        startTime: new Date().toISOString(),
        options
      };
      
      // 1. 静态分析（所有模式都需要）
      this.logger.info('执行静态分析...');
      results.staticAnalysis = generateReport();
      
      if (mode === VALIDATION_MODES.QUICK) {
        // 快速模式只做静态分析
        results.summary = this.reportGenerator.generateSummary(results.staticAnalysis);
      } else {
        // 标准和完整模式需要HTTP验证
        await this.serverManager.start();
        
        try {
          // 提取URL列表
          const urls = results.staticAnalysis.missingPages.length === 0 
            ? await this.extractUrlsFromSitemap()
            : results.staticAnalysis.missingPages.map(p => p.url);
          
          // 2. HTTP验证
          this.logger.info('执行HTTP验证...');
          results.httpValidation = await this.httpValidator.validateUrls(urls);
          
          // 3. 性能监控（仅完整模式）
          if (mode === VALIDATION_MODES.FULL) {
            const successfulUrls = results.httpValidation
              .filter(r => r.success)
              .map(r => r.url)
              .slice(0, 10); // 限制性能测试的URL数量
            
            if (successfulUrls.length > 0) {
              this.logger.info('执行性能监控...');
              results.performanceAnalysis = await this.performanceMonitor.measurePerformance(successfulUrls);
            }
          }
          
          results.summary = this.reportGenerator.generateSummary(
            results.staticAnalysis,
            results.httpValidation,
            results.performanceAnalysis
          );
          
        } finally {
          await this.serverManager.stop();
        }
      }
      
      results.endTime = new Date().toISOString();
      results.duration = this.logger.getElapsedTime();
      
      // 保存报告
      const reportPath = await this.reportGenerator.saveReport(results, mode);
      
      // 输出摘要
      this.outputSummary(results);
      
      return {
        success: true,
        report: results,
        reportPath
      };
      
    } catch (error) {
      this.logger.error(`验证过程中发生错误: ${error.message}`);
      
      // 确保服务器被关闭
      try {
        await this.serverManager.stop();
      } catch (stopError) {
        this.logger.warning(`关闭服务器时出错: ${stopError.message}`);
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async extractUrlsFromSitemap() {
    try {
      const sitemapUrl = `http://${CONFIG.SERVER_HOST}:${CONFIG.SERVER_PORT}/sitemap.xml`;
      const response = await fetch(sitemapUrl);
      const sitemapXml = await response.text();
      
      // 简单的XML解析提取URL
      const urlMatches = sitemapXml.match(/<loc>(.*?)<\/loc>/g) || [];
      return urlMatches.map(match => match.replace(/<\/?loc>/g, ''));
    } catch (error) {
      this.logger.warning(`提取sitemap URL失败: ${error.message}`);
      return [];
    }
  }
  
  outputSummary(results) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 SITEMAP 持续验证报告');
    console.log('='.repeat(80));
    
    const { summary, mode, duration } = results;
    
    console.log(`\n🔍 验证模式: ${mode.toUpperCase()}`);
    console.log(`⏱️  执行时间: ${Math.round(duration / 1000)}秒`);
    console.log(`🌐 总URL数: ${summary.validation.totalUrls}`);
    
    if (results.staticAnalysis) {
      console.log(`\n📋 静态分析:`);
      console.log(`   ✅ 匹配成功: ${summary.validation.staticAnalysisSuccess}/${summary.validation.totalUrls}`);
      console.log(`   📈 成功率: ${summary.validation.staticAnalysisRate}%`);
    }
    
    if (results.httpValidation) {
      console.log(`\n🌍 HTTP验证:`);
      console.log(`   ✅ 请求成功: ${summary.validation.httpSuccess}/${results.httpValidation.length}`);
      console.log(`   📈 成功率: ${summary.validation.httpSuccessRate}%`);
      
      const failures = results.httpValidation.filter(r => !r.success);
      if (failures.length > 0) {
        console.log(`\n❌ 失败的URL:`);
        failures.forEach(f => {
          console.log(`   ${f.url} - ${f.status} ${f.statusText}`);
        });
      }
    }
    
    if (summary.performance) {
      console.log(`\n⚡ 性能监控:`);
      console.log(`   平均响应时间: ${summary.performance.averageResponseTime}ms`);
      console.log(`   中位响应时间: ${summary.performance.medianResponseTime}ms`);
      
      if (summary.performance.slowestUrls.length > 0) {
        console.log(`\n🐌 最慢的URL:`);
        summary.performance.slowestUrls.forEach(u => {
          console.log(`   ${u.url} - ${u.avgTime}ms`);
        });
      }
    }
    
    console.log(`\n🎯 整体健康度: ${summary.overallHealth.score}/100 (${summary.overallHealth.rating})`);
    
    if (summary.overallHealth.issues.length > 0) {
      console.log(`\n⚠️  发现的问题:`);
      summary.overallHealth.issues.forEach(issue => {
        const emoji = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';
        console.log(`   ${emoji} ${issue.message}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
  }
  
  async monitor(interval = 60000, duration = null) {
    this.logger.success('开始监控模式');
    
    const endTime = duration ? Date.now() + duration : null;
    let iteration = 1;
    
    while (!endTime || Date.now() < endTime) {
      this.logger.info(`监控迭代 ${iteration}`);
      
      const result = await this.validate(VALIDATION_MODES.STANDARD, { 
        iteration, 
        monitorMode: true 
      });
      
      if (!result.success) {
        this.logger.error(`监控迭代 ${iteration} 失败: ${result.error}`);
      } else {
        const health = result.report.summary.overallHealth;
        this.logger.success(`监控迭代 ${iteration} 完成 - 健康度: ${health.score}/100`);
        
        // 如果健康度过低，发出警告
        if (health.score < 70) {
          this.logger.warning(`健康度过低！当前评级: ${health.rating}`);
        }
      }
      
      iteration++;
      
      // 等待下一次检查
      if (!endTime || Date.now() + interval < endTime) {
        this.logger.info(`等待 ${interval/1000} 秒后进行下一次检查...`);
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
    
    this.logger.success('监控模式结束');
  }
}

/**
 * 命令行接口
 */
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || VALIDATION_MODES.STANDARD;
  const verbose = args.includes('--verbose') || args.includes('-v');
  
  if (!Object.values(VALIDATION_MODES).includes(mode) && mode !== 'monitor') {
    console.error(`无效的验证模式: ${mode}`);
    console.error(`可用模式: ${Object.values(VALIDATION_MODES).join(', ')}, monitor`);
    process.exit(1);
  }
  
  const validator = new SitemapValidator({ verbose });
  
  try {
    if (mode === 'monitor') {
      const interval = parseInt(args.find(arg => arg.startsWith('--interval='))?.split('=')[1] || '60000');
      const duration = args.find(arg => arg.startsWith('--duration='))?.split('=')[1];
      const durationMs = duration ? parseInt(duration) * 1000 : null;
      
      await validator.monitor(interval, durationMs);
    } else {
      const result = await validator.validate(mode);
      process.exit(result.success ? 0 : 1);
    }
  } catch (error) {
    console.error(`执行失败: ${error.message}`);
    process.exit(1);
  }
}

// 导出模块
module.exports = {
  SitemapValidator,
  VALIDATION_MODES,
  CONFIG
};

// 如果直接执行
if (require.main === module) {
  main().catch(error => {
    console.error(`程序执行失败: ${error.message}`);
    process.exit(1);
  });
}