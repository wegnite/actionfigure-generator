#!/usr/bin/env node

/**
 * Sitemap健康检查脚本
 * 
 * 功能：
 * 1. 一键式健康检查命令
 * 2. 支持多种检查模式（快速、标准、深度）
 * 3. 生产环境监控兼容
 * 4. 智能报警和通知
 * 5. 历史趋势分析
 * 6. 自动修复建议
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 健康检查配置
const HEALTH_CHECK_CONFIG = {
  // 检查模式
  MODES: {
    QUICK: 'quick',       // 快速检查：基础URL验证
    STANDARD: 'standard', // 标准检查：完整sitemap验证
    DEEP: 'deep',         // 深度检查：包含性能和SEO分析
    MONITOR: 'monitor'    // 监控模式：持续健康检查
  },
  
  // 环境配置
  ENVIRONMENTS: {
    LOCAL: {
      name: 'local',
      baseUrl: 'http://localhost:3000',
      requiresServer: true
    },
    STAGING: {
      name: 'staging',
      baseUrl: 'https://staging.actionfigure-generator.com',
      requiresServer: false
    },
    PRODUCTION: {
      name: 'production',
      baseUrl: 'https://actionfigure-generator.com',
      requiresServer: false
    }
  },
  
  // 健康检查阈值
  THRESHOLDS: {
    SUCCESS_RATE: 95,           // URL成功率阈值
    RESPONSE_TIME: 3000,        // 响应时间阈值(ms)
    AVAILABILITY: 99.9,         // 可用性阈值(%)
    ERROR_RATE: 0.1,           // 错误率阈值(%)
    PERFORMANCE_SCORE: 80       // 性能评分阈值
  },
  
  // 报警配置
  ALERTS: {
    ENABLED: true,
    WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL || null,
    EMAIL_ENDPOINT: process.env.EMAIL_API_ENDPOINT || null,
    CRITICAL_THRESHOLD: 50,     // 关键问题阈值
    WARNING_THRESHOLD: 80       // 警告阈值
  },
  
  // 报告配置
  REPORTS: {
    SAVE_RESULTS: true,
    REPORT_DIR: path.join(__dirname, '../test/sitemap/health-reports'),
    HISTORY_RETENTION: 30,      // 保留历史记录天数
    TREND_ANALYSIS: true        // 趋势分析
  }
};

/**
 * 健康检查结果类
 */
class HealthCheckResult {
  constructor() {
    this.timestamp = new Date().toISOString();
    this.environment = null;
    this.mode = null;
    this.duration = 0;
    this.overall = {
      status: 'UNKNOWN',
      score: 0,
      issues: []
    };
    this.checks = {};
    this.recommendations = [];
    this.alerts = [];
  }
  
  addCheck(name, result) {
    this.checks[name] = {
      ...result,
      timestamp: new Date().toISOString()
    };
  }
  
  calculateOverallScore() {
    const checkResults = Object.values(this.checks);
    if (checkResults.length === 0) return 0;
    
    const weights = {
      availability: 0.3,
      sitemap: 0.25,
      performance: 0.25,
      seo: 0.2
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    checkResults.forEach(check => {
      const weight = weights[check.type] || 0.1;
      totalScore += check.score * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }
  
  updateOverallStatus() {
    this.overall.score = this.calculateOverallScore();
    
    if (this.overall.score >= 95) {
      this.overall.status = 'EXCELLENT';
    } else if (this.overall.score >= 85) {
      this.overall.status = 'GOOD';
    } else if (this.overall.score >= 70) {
      this.overall.status = 'WARNING';
    } else if (this.overall.score >= 50) {
      this.overall.status = 'CRITICAL';
    } else {
      this.overall.status = 'FAILED';
    }
    
    // 收集问题
    this.overall.issues = Object.values(this.checks)
      .filter(check => check.issues && check.issues.length > 0)
      .flatMap(check => check.issues);
  }
}

/**
 * 可用性检查器
 */
class AvailabilityChecker {
  constructor(logger) {
    this.logger = logger;
  }
  
  async checkAvailability(baseUrl) {
    const result = {
      type: 'availability',
      score: 0,
      details: {},
      issues: []
    };
    
    const criticalUrls = [
      '/',
      '/pricing',
      '/character-figure',
      '/sitemap.xml'
    ];
    
    const checks = [];
    
    for (const urlPath of criticalUrls) {
      const url = baseUrl + urlPath;
      const checkResult = await this.checkSingleUrl(url);
      checks.push(checkResult);
      
      this.logger.info(`${url} - ${checkResult.status} (${checkResult.responseTime}ms)`);
    }
    
    result.details = {
      totalChecks: checks.length,
      successful: checks.filter(c => c.success).length,
      failed: checks.filter(c => !c.success).length,
      avgResponseTime: Math.round(
        checks.filter(c => c.responseTime > 0)
          .reduce((sum, c) => sum + c.responseTime, 0) / checks.length
      ),
      checks
    };
    
    // 计算可用性评分
    const successRate = (result.details.successful / result.details.totalChecks) * 100;
    const avgResponseTime = result.details.avgResponseTime;
    
    result.score = Math.round(successRate);
    
    // 响应时间惩罚
    if (avgResponseTime > HEALTH_CHECK_CONFIG.THRESHOLDS.RESPONSE_TIME) {
      result.score -= Math.min(20, Math.round((avgResponseTime - HEALTH_CHECK_CONFIG.THRESHOLDS.RESPONSE_TIME) / 1000) * 5);
    }
    
    // 收集问题
    checks.forEach(check => {
      if (!check.success) {
        result.issues.push(`${check.url}: ${check.error || 'Request failed'}`);
      }
      if (check.responseTime > HEALTH_CHECK_CONFIG.THRESHOLDS.RESPONSE_TIME) {
        result.issues.push(`${check.url}: 响应时间过长 (${check.responseTime}ms)`);
      }
    });
    
    result.score = Math.max(0, result.score);
    return result;
  }
  
  async checkSingleUrl(url) {
    const startTime = Date.now();
    
    try {
      const response = await this.fetch(url, { timeout: 10000 });
      const responseTime = Date.now() - startTime;
      
      return {
        url,
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        responseTime,
        headers: Object.fromEntries(response.headers.entries()),
        size: parseInt(response.headers.get('content-length') || '0')
      };
      
    } catch (error) {
      return {
        url,
        success: false,
        status: 0,
        statusText: 'Request Failed',
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }
  
  async fetch(url, options = {}) {
    // 使用 fetch API 或回退到 node-fetch
    if (typeof fetch === 'undefined') {
      // Node.js 18+ should have fetch, but fallback just in case
      const { default: fetch } = await import('node-fetch');
      return fetch(url, options);
    }
    return fetch(url, options);
  }
}

/**
 * Sitemap验证器
 */
class SitemapChecker {
  constructor(logger) {
    this.logger = logger;
  }
  
  async checkSitemap(baseUrl) {
    const result = {
      type: 'sitemap',
      score: 0,
      details: {},
      issues: []
    };
    
    try {
      // 获取sitemap.xml
      const sitemapUrl = `${baseUrl}/sitemap.xml`;
      const sitemapResponse = await this.fetchSitemap(sitemapUrl);
      
      if (!sitemapResponse.success) {
        result.issues.push(`Sitemap无法访问: ${sitemapResponse.error}`);
        return result;
      }
      
      // 解析URL
      const urls = this.parseSitemapUrls(sitemapResponse.content);
      this.logger.info(`发现 ${urls.length} 个URL`);
      
      // 验证URL样本
      const sampleUrls = this.selectSampleUrls(urls, 10);
      const validationResults = await this.validateUrls(sampleUrls);
      
      result.details = {
        sitemapUrl,
        totalUrls: urls.length,
        testedUrls: sampleUrls.length,
        validUrls: validationResults.filter(r => r.success).length,
        invalidUrls: validationResults.filter(r => !r.success).length,
        avgResponseTime: Math.round(
          validationResults
            .filter(r => r.responseTime > 0)
            .reduce((sum, r) => sum + r.responseTime, 0) / validationResults.length || 0
        ),
        validationResults
      };
      
      // 计算评分
      const successRate = (result.details.validUrls / result.details.testedUrls) * 100;
      result.score = Math.round(successRate);
      
      // 收集问题
      validationResults.forEach(validation => {
        if (!validation.success) {
          result.issues.push(`${validation.url}: ${validation.error || 'Failed'}`);
        }
      });
      
      if (result.details.totalUrls === 0) {
        result.issues.push('Sitemap为空');
        result.score = 0;
      }
      
    } catch (error) {
      result.issues.push(`Sitemap检查失败: ${error.message}`);
      result.score = 0;
    }
    
    return result;
  }
  
  async fetchSitemap(url) {
    try {
      const response = await fetch(url, { timeout: 10000 });
      
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
      
      const content = await response.text();
      return {
        success: true,
        content,
        contentType: response.headers.get('content-type'),
        size: content.length
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  parseSitemapUrls(xmlContent) {
    // 简单的XML解析
    const urlMatches = xmlContent.match(/<loc>(.*?)<\/loc>/g) || [];
    return urlMatches.map(match => match.replace(/<\/?loc>/g, ''));
  }
  
  selectSampleUrls(urls, maxSample = 10) {
    if (urls.length <= maxSample) {
      return urls;
    }
    
    // 智能采样：包含关键页面
    const priorityPatterns = [
      '/$',                    // 首页
      '/pricing',              // 定价页
      '/character-figure',     // 核心功能页
      '/showcase',             // 展示页
    ];
    
    const priorityUrls = [];
    const regularUrls = [];
    
    urls.forEach(url => {
      const isPriority = priorityPatterns.some(pattern => 
        new RegExp(pattern).test(url)
      );
      
      if (isPriority) {
        priorityUrls.push(url);
      } else {
        regularUrls.push(url);
      }
    });
    
    // 先选择优先级URL，然后随机选择其他URL
    const sampleUrls = [...priorityUrls];
    const remainingSlots = maxSample - sampleUrls.length;
    
    if (remainingSlots > 0) {
      const shuffled = regularUrls.sort(() => 0.5 - Math.random());
      sampleUrls.push(...shuffled.slice(0, remainingSlots));
    }
    
    return sampleUrls;
  }
  
  async validateUrls(urls) {
    const results = [];
    
    for (const url of urls) {
      const startTime = Date.now();
      
      try {
        const response = await fetch(url, {
          timeout: 8000,
          headers: {
            'User-Agent': 'HealthChecker/1.0'
          }
        });
        
        results.push({
          url,
          success: response.ok,
          status: response.status,
          responseTime: Date.now() - startTime,
          contentType: response.headers.get('content-type')
        });
        
      } catch (error) {
        results.push({
          url,
          success: false,
          status: 0,
          responseTime: Date.now() - startTime,
          error: error.message
        });
      }
    }
    
    return results;
  }
}

/**
 * 性能检查器
 */
class PerformanceChecker {
  constructor(logger) {
    this.logger = logger;
  }
  
  async checkPerformance(baseUrl) {
    const result = {
      type: 'performance',
      score: 0,
      details: {},
      issues: []
    };
    
    const testUrls = [
      baseUrl + '/',
      baseUrl + '/pricing',
      baseUrl + '/character-figure'
    ];
    
    const performanceResults = [];
    
    for (const url of testUrls) {
      this.logger.info(`性能测试: ${url}`);
      const perfResult = await this.measurePerformance(url);
      performanceResults.push(perfResult);
    }
    
    result.details = {
      testedUrls: testUrls.length,
      results: performanceResults,
      avgResponseTime: Math.round(
        performanceResults.reduce((sum, r) => sum + r.avgResponseTime, 0) / performanceResults.length
      ),
      minResponseTime: Math.min(...performanceResults.map(r => r.minResponseTime)),
      maxResponseTime: Math.max(...performanceResults.map(r => r.maxResponseTime))
    };
    
    // 计算性能评分
    const avgTime = result.details.avgResponseTime;
    if (avgTime < 500) {
      result.score = 100;
    } else if (avgTime < 1000) {
      result.score = 90;
    } else if (avgTime < 2000) {
      result.score = 80;
    } else if (avgTime < 3000) {
      result.score = 70;
    } else if (avgTime < 5000) {
      result.score = 50;
    } else {
      result.score = 20;
    }
    
    // 收集性能问题
    performanceResults.forEach(perf => {
      if (perf.avgResponseTime > HEALTH_CHECK_CONFIG.THRESHOLDS.RESPONSE_TIME) {
        result.issues.push(`${perf.url}: 平均响应时间过长 (${perf.avgResponseTime}ms)`);
      }
      
      if (perf.errors > 0) {
        result.issues.push(`${perf.url}: ${perf.errors} 个请求失败`);
      }
    });
    
    return result;
  }
  
  async measurePerformance(url, iterations = 3) {
    const measurements = [];
    let errors = 0;
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      
      try {
        const response = await fetch(url, {
          timeout: 10000,
          cache: 'no-cache'
        });
        
        const responseTime = Date.now() - startTime;
        measurements.push(responseTime);
        
        if (!response.ok) {
          errors++;
        }
        
      } catch (error) {
        errors++;
        measurements.push(10000); // 超时作为最大响应时间
      }
      
      // 测试间隔
      if (i < iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return {
      url,
      measurements,
      avgResponseTime: Math.round(measurements.reduce((a, b) => a + b, 0) / measurements.length),
      minResponseTime: Math.min(...measurements),
      maxResponseTime: Math.max(...measurements),
      errors,
      reliability: ((iterations - errors) / iterations) * 100
    };
  }
}

/**
 * 报警管理器
 */
class AlertManager {
  constructor(logger) {
    this.logger = logger;
  }
  
  async processAlerts(healthResult) {
    if (!HEALTH_CHECK_CONFIG.ALERTS.ENABLED) {
      return;
    }
    
    const alerts = this.generateAlerts(healthResult);
    
    for (const alert of alerts) {
      await this.sendAlert(alert);
      healthResult.alerts.push(alert);
    }
  }
  
  generateAlerts(healthResult) {
    const alerts = [];
    const score = healthResult.overall.score;
    const status = healthResult.overall.status;
    
    // 关键级别报警
    if (score < HEALTH_CHECK_CONFIG.ALERTS.CRITICAL_THRESHOLD) {
      alerts.push({
        level: 'CRITICAL',
        message: `Sitemap健康检查关键问题！评分: ${score}/100`,
        details: healthResult.overall.issues.slice(0, 5),
        timestamp: new Date().toISOString(),
        environment: healthResult.environment
      });
    }
    
    // 警告级别报警
    else if (score < HEALTH_CHECK_CONFIG.ALERTS.WARNING_THRESHOLD) {
      alerts.push({
        level: 'WARNING',
        message: `Sitemap健康检查发现问题，评分: ${score}/100`,
        details: healthResult.overall.issues.slice(0, 3),
        timestamp: new Date().toISOString(),
        environment: healthResult.environment
      });
    }
    
    // 可用性报警
    const availabilityCheck = healthResult.checks.availability;
    if (availabilityCheck && availabilityCheck.score < 95) {
      alerts.push({
        level: 'CRITICAL',
        message: `网站可用性异常！成功率: ${availabilityCheck.details.successful}/${availabilityCheck.details.totalChecks}`,
        details: availabilityCheck.issues,
        timestamp: new Date().toISOString(),
        environment: healthResult.environment
      });
    }
    
    return alerts;
  }
  
  async sendAlert(alert) {
    this.logger.warning(`🚨 ${alert.level}: ${alert.message}`);
    
    // Slack通知
    if (HEALTH_CHECK_CONFIG.ALERTS.WEBHOOK_URL) {
      await this.sendSlackAlert(alert);
    }
    
    // 邮件通知
    if (HEALTH_CHECK_CONFIG.ALERTS.EMAIL_ENDPOINT) {
      await this.sendEmailAlert(alert);
    }
  }
  
  async sendSlackAlert(alert) {
    try {
      const color = alert.level === 'CRITICAL' ? 'danger' : 'warning';
      const emoji = alert.level === 'CRITICAL' ? '🚨' : '⚠️';
      
      const payload = {
        text: `${emoji} Sitemap健康检查报警`,
        attachments: [{
          color,
          fields: [
            {
              title: '级别',
              value: alert.level,
              short: true
            },
            {
              title: '环境',
              value: alert.environment || 'Unknown',
              short: true
            },
            {
              title: '消息',
              value: alert.message,
              short: false
            },
            {
              title: '详情',
              value: alert.details.join('\n'),
              short: false
            }
          ],
          ts: Math.floor(Date.now() / 1000)
        }]
      };
      
      await fetch(HEALTH_CHECK_CONFIG.ALERTS.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      this.logger.info('Slack报警发送成功');
      
    } catch (error) {
      this.logger.warning(`发送Slack报警失败: ${error.message}`);
    }
  }
  
  async sendEmailAlert(alert) {
    try {
      const emailData = {
        to: process.env.ALERT_EMAIL || 'admin@actionfigure-generator.com',
        subject: `🚨 Sitemap健康检查报警 - ${alert.level}`,
        html: this.generateEmailHtml(alert)
      };
      
      await fetch(HEALTH_CHECK_CONFIG.ALERTS.EMAIL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });
      
      this.logger.info('邮件报警发送成功');
      
    } catch (error) {
      this.logger.warning(`发送邮件报警失败: ${error.message}`);
    }
  }
  
  generateEmailHtml(alert) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Sitemap健康检查报警</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
        .header { background: #f44336; color: white; padding: 20px; border-radius: 5px; }
        .content { padding: 20px; background: #f9f9f9; margin-top: 10px; border-radius: 5px; }
        .alert-critical { border-left: 4px solid #f44336; }
        .alert-warning { border-left: 4px solid #ff9800; }
        .details { background: white; padding: 15px; margin-top: 10px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚨 Sitemap健康检查报警</h1>
        <p>级别: ${alert.level} | 时间: ${alert.timestamp}</p>
    </div>
    
    <div class="content alert-${alert.level.toLowerCase()}">
        <h2>报警信息</h2>
        <p><strong>环境:</strong> ${alert.environment || 'Unknown'}</p>
        <p><strong>消息:</strong> ${alert.message}</p>
        
        <div class="details">
            <h3>详细信息</h3>
            <ul>
                ${alert.details.map(detail => `<li>${detail}</li>`).join('')}
            </ul>
        </div>
        
        <h3>建议操作</h3>
        <ol>
            <li>检查网站可用性</li>
            <li>验证sitemap配置</li>
            <li>检查服务器状态</li>
            <li>运行完整的健康检查</li>
        </ol>
    </div>
</body>
</html>`;
  }
}

/**
 * 历史趋势分析器
 */
class TrendAnalyzer {
  constructor(logger) {
    this.logger = logger;
  }
  
  async analyzeTrends(currentResult) {
    if (!HEALTH_CHECK_CONFIG.REPORTS.TREND_ANALYSIS) {
      return null;
    }
    
    const historyData = await this.loadHistoryData();
    
    if (historyData.length < 2) {
      this.logger.info('历史数据不足，无法进行趋势分析');
      return null;
    }
    
    const trends = {
      overall: this.analyzeTrend(historyData.map(h => h.overall.score)),
      availability: this.analyzeTrend(historyData.map(h => h.checks.availability?.score || 0)),
      performance: this.analyzeTrend(historyData.map(h => h.checks.performance?.score || 0)),
      recommendations: []
    };
    
    // 生成趋势建议
    if (trends.overall.direction === 'DECLINING') {
      trends.recommendations.push('整体健康度呈下降趋势，需要关注');
    }
    
    if (trends.performance.direction === 'DECLINING') {
      trends.recommendations.push('性能指标下降，建议优化响应时间');
    }
    
    return trends;
  }
  
  analyzeTrend(values) {
    if (values.length < 2) {
      return { direction: 'UNKNOWN', change: 0 };
    }
    
    const recent = values.slice(-5); // 最近5次
    const older = values.slice(-10, -5); // 之前5次
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.length > 0 ? 
      older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
    
    const change = recentAvg - olderAvg;
    const changePercent = olderAvg > 0 ? (change / olderAvg) * 100 : 0;
    
    let direction;
    if (Math.abs(changePercent) < 5) {
      direction = 'STABLE';
    } else if (changePercent > 0) {
      direction = 'IMPROVING';
    } else {
      direction = 'DECLINING';
    }
    
    return {
      direction,
      change: Math.round(changePercent * 10) / 10,
      recentAverage: Math.round(recentAvg),
      previousAverage: Math.round(olderAvg)
    };
  }
  
  async loadHistoryData() {
    try {
      const reportDir = HEALTH_CHECK_CONFIG.REPORTS.REPORT_DIR;
      if (!fs.existsSync(reportDir)) {
        return [];
      }
      
      const files = fs.readdirSync(reportDir)
        .filter(f => f.startsWith('health-check-') && f.endsWith('.json'))
        .sort()
        .slice(-30); // 最近30次记录
      
      const historyData = [];
      
      for (const file of files) {
        const filePath = path.join(reportDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        historyData.push(data);
      }
      
      return historyData;
      
    } catch (error) {
      this.logger.warning(`加载历史数据失败: ${error.message}`);
      return [];
    }
  }
}

/**
 * 主健康检查器
 */
class SitemapHealthChecker {
  constructor(options = {}) {
    this.logger = {
      info: (msg) => options.verbose && console.log(`[INFO] ${msg}`),
      warning: (msg) => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`),
      error: (msg) => console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
      success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`)
    };
    
    this.availabilityChecker = new AvailabilityChecker(this.logger);
    this.sitemapChecker = new SitemapChecker(this.logger);
    this.performanceChecker = new PerformanceChecker(this.logger);
    this.alertManager = new AlertManager(this.logger);
    this.trendAnalyzer = new TrendAnalyzer(this.logger);
    
    this.ensureReportDirectory();
  }
  
  ensureReportDirectory() {
    if (!fs.existsSync(HEALTH_CHECK_CONFIG.REPORTS.REPORT_DIR)) {
      fs.mkdirSync(HEALTH_CHECK_CONFIG.REPORTS.REPORT_DIR, { recursive: true });
    }
  }
  
  async runHealthCheck(mode = 'standard', environment = 'production') {
    const startTime = Date.now();
    const result = new HealthCheckResult();
    result.mode = mode;
    result.environment = environment;
    
    const envConfig = HEALTH_CHECK_CONFIG.ENVIRONMENTS[environment.toUpperCase()] || 
                     HEALTH_CHECK_CONFIG.ENVIRONMENTS.PRODUCTION;
    
    console.log(`\n🏥 Sitemap健康检查 - ${mode.toUpperCase()}模式`);
    console.log(`🌍 环境: ${envConfig.name} (${envConfig.baseUrl})`);
    console.log('='.repeat(60));
    
    try {
      // 1. 可用性检查（所有模式）
      this.logger.info('检查网站可用性...');
      const availabilityResult = await this.availabilityChecker.checkAvailability(envConfig.baseUrl);
      result.addCheck('availability', availabilityResult);
      
      // 2. Sitemap检查（标准模式及以上）
      if (mode !== 'quick') {
        this.logger.info('检查Sitemap完整性...');
        const sitemapResult = await this.sitemapChecker.checkSitemap(envConfig.baseUrl);
        result.addCheck('sitemap', sitemapResult);
      }
      
      // 3. 性能检查（深度模式）
      if (mode === 'deep') {
        this.logger.info('执行性能检查...');
        const performanceResult = await this.performanceChecker.checkPerformance(envConfig.baseUrl);
        result.addCheck('performance', performanceResult);
      }
      
      // 4. 计算总体状态
      result.updateOverallStatus();
      result.duration = Date.now() - startTime;
      
      // 5. 生成建议
      result.recommendations = await this.generateRecommendations(result);
      
      // 6. 趋势分析
      const trends = await this.trendAnalyzer.analyzeTrends(result);
      if (trends) {
        result.trends = trends;
      }
      
      // 7. 处理报警
      await this.alertManager.processAlerts(result);
      
      // 8. 保存报告
      if (HEALTH_CHECK_CONFIG.REPORTS.SAVE_RESULTS) {
        await this.saveReport(result);
      }
      
      // 9. 显示结果
      this.displayResults(result);
      
      return result;
      
    } catch (error) {
      this.logger.error(`健康检查失败: ${error.message}`);
      result.overall.status = 'FAILED';
      result.overall.issues.push(`系统错误: ${error.message}`);
      result.duration = Date.now() - startTime;
      
      return result;
    }
  }
  
  async generateRecommendations(result) {
    const recommendations = [];
    const score = result.overall.score;
    
    // 基于评分的建议
    if (score < 50) {
      recommendations.push('🚨 关键问题需要立即解决');
      recommendations.push('建议检查服务器状态和网络连接');
    } else if (score < 70) {
      recommendations.push('⚠️  存在多个问题需要解决');
      recommendations.push('建议优化网站性能和可用性');
    } else if (score < 90) {
      recommendations.push('💡 有改进空间');
      recommendations.push('考虑优化响应时间和缓存策略');
    }
    
    // 基于具体检查的建议
    const checks = result.checks;
    
    if (checks.availability && checks.availability.score < 95) {
      recommendations.push('🔧 修复不可用的URL');
    }
    
    if (checks.sitemap && checks.sitemap.score < 95) {
      recommendations.push('📋 修复sitemap中的无效URL');
    }
    
    if (checks.performance && checks.performance.score < 80) {
      recommendations.push('⚡ 优化网站性能，减少响应时间');
      recommendations.push('考虑启用CDN和压缩');
    }
    
    return recommendations;
  }
  
  displayResults(result) {
    console.log(`\n📊 健康检查结果:`);
    console.log(`   状态: ${this.getStatusIcon(result.overall.status)} ${result.overall.status}`);
    console.log(`   评分: ${result.overall.score}/100`);
    console.log(`   耗时: ${Math.round(result.duration / 1000)}秒`);
    
    // 显示各项检查结果
    Object.entries(result.checks).forEach(([name, check]) => {
      console.log(`\n🔍 ${name.toUpperCase()}检查:`);
      console.log(`   评分: ${check.score}/100`);
      
      if (check.issues && check.issues.length > 0) {
        console.log(`   问题: ${check.issues.length}个`);
        check.issues.slice(0, 3).forEach(issue => {
          console.log(`   - ${issue}`);
        });
        if (check.issues.length > 3) {
          console.log(`   ... 还有${check.issues.length - 3}个问题`);
        }
      }
    });
    
    // 显示建议
    if (result.recommendations.length > 0) {
      console.log(`\n💡 建议操作:`);
      result.recommendations.forEach(rec => {
        console.log(`   ${rec}`);
      });
    }
    
    // 显示趋势
    if (result.trends) {
      console.log(`\n📈 趋势分析:`);
      console.log(`   整体趋势: ${this.getTrendIcon(result.trends.overall.direction)} ${result.trends.overall.direction}`);
      if (result.trends.overall.change !== 0) {
        console.log(`   变化幅度: ${result.trends.overall.change}%`);
      }
    }
    
    // 显示报警
    if (result.alerts.length > 0) {
      console.log(`\n🚨 发送了${result.alerts.length}个报警`);
    }
    
    console.log('\n' + '='.repeat(60));
  }
  
  getStatusIcon(status) {
    const icons = {
      'EXCELLENT': '🟢',
      'GOOD': '🔵',
      'WARNING': '🟡',
      'CRITICAL': '🟠',
      'FAILED': '🔴'
    };
    return icons[status] || '⚪';
  }
  
  getTrendIcon(direction) {
    const icons = {
      'IMPROVING': '📈',
      'STABLE': '➖',
      'DECLINING': '📉',
      'UNKNOWN': '❓'
    };
    return icons[direction] || '❓';
  }
  
  async saveReport(result) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `health-check-${result.environment}-${timestamp}.json`;
      const filepath = path.join(HEALTH_CHECK_CONFIG.REPORTS.REPORT_DIR, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
      
      // 创建最新报告的软链接
      const latestPath = path.join(HEALTH_CHECK_CONFIG.REPORTS.REPORT_DIR, `latest-${result.environment}.json`);
      if (fs.existsSync(latestPath)) {
        fs.unlinkSync(latestPath);
      }
      fs.linkSync(filepath, latestPath);
      
      this.logger.success(`健康检查报告已保存: ${filepath}`);
      
      // 清理旧报告
      await this.cleanupOldReports();
      
    } catch (error) {
      this.logger.warning(`保存报告失败: ${error.message}`);
    }
  }
  
  async cleanupOldReports() {
    try {
      const files = fs.readdirSync(HEALTH_CHECK_CONFIG.REPORTS.REPORT_DIR)
        .filter(f => f.startsWith('health-check-') && f.endsWith('.json'))
        .map(f => ({
          name: f,
          path: path.join(HEALTH_CHECK_CONFIG.REPORTS.REPORT_DIR, f),
          mtime: fs.statSync(path.join(HEALTH_CHECK_CONFIG.REPORTS.REPORT_DIR, f)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - HEALTH_CHECK_CONFIG.REPORTS.HISTORY_RETENTION);
      
      const filesToDelete = files.filter(f => f.mtime < cutoffDate);
      
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
        this.logger.info(`已删除旧报告: ${file.name}`);
      }
      
    } catch (error) {
      this.logger.warning(`清理旧报告失败: ${error.message}`);
    }
  }
  
  async runMonitorMode(interval = 300000, duration = null) {
    console.log(`\n🔄 开始监控模式 (间隔: ${interval/1000}秒)`);
    
    const endTime = duration ? Date.now() + duration : null;
    let iteration = 1;
    
    while (!endTime || Date.now() < endTime) {
      console.log(`\n📊 监控迭代 ${iteration}`);
      
      try {
        const result = await this.runHealthCheck('standard', 'production');
        
        // 如果健康度过低，增加检查频率
        if (result.overall.score < 70) {
          console.log(`⚠️  健康度低，${Math.round(interval/2/1000)}秒后再次检查...`);
          await new Promise(resolve => setTimeout(resolve, interval / 2));
          continue;
        }
        
      } catch (error) {
        this.logger.error(`监控迭代 ${iteration} 失败: ${error.message}`);
      }
      
      iteration++;
      
      // 等待下一次检查
      if (!endTime || Date.now() + interval < endTime) {
        console.log(`⏱️  等待 ${interval/1000} 秒...`);
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
    
    console.log('🏁 监控模式结束');
  }
}

/**
 * 命令行接口
 */
async function main() {
  const args = process.argv.slice(2);
  
  // 解析参数
  const mode = args.find(arg => ['quick', 'standard', 'deep', 'monitor'].includes(arg)) || 'standard';
  const environment = args.find(arg => ['local', 'staging', 'production'].includes(arg)) || 'production';
  const verbose = args.includes('--verbose') || args.includes('-v');
  
  if (args.includes('--help')) {
    console.log(`
🏥 Sitemap健康检查工具

用法:
  node sitemap-health-check.js [模式] [环境] [选项]

模式:
  quick      快速检查 - 仅基础可用性
  standard   标准检查 - 可用性 + sitemap验证 (默认)
  deep       深度检查 - 包含性能分析
  monitor    监控模式 - 持续监控

环境:
  local      本地环境 (localhost:3000)
  staging    预发布环境
  production 生产环境 (默认)

选项:
  --verbose, -v    详细输出
  --help           显示帮助信息

示例:
  node sitemap-health-check.js quick local -v
  node sitemap-health-check.js deep production
  node sitemap-health-check.js monitor

环境变量:
  SLACK_WEBHOOK_URL     Slack报警Webhook
  EMAIL_API_ENDPOINT    邮件API端点
  ALERT_EMAIL          报警接收邮箱
`);
    process.exit(0);
  }
  
  const checker = new SitemapHealthChecker({ verbose });
  
  try {
    if (mode === 'monitor') {
      const interval = parseInt(args.find(arg => arg.startsWith('--interval='))?.split('=')[1] || '300') * 1000;
      const duration = args.find(arg => arg.startsWith('--duration='))?.split('=')[1];
      const durationMs = duration ? parseInt(duration) * 1000 : null;
      
      await checker.runMonitorMode(interval, durationMs);
    } else {
      const result = await checker.runHealthCheck(mode, environment);
      
      // 根据健康度决定退出代码
      const exitCode = result.overall.score >= 70 ? 0 : 1;
      process.exit(exitCode);
    }
    
  } catch (error) {
    console.error(`健康检查失败: ${error.message}`);
    process.exit(1);
  }
}

// 导出模块
module.exports = {
  SitemapHealthChecker,
  HEALTH_CHECK_CONFIG
};

// 如果直接执行
if (require.main === module) {
  main().catch(error => {
    console.error(`程序执行失败: ${error.message}`);
    process.exit(1);
  });
}