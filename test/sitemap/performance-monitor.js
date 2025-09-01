#!/usr/bin/env node

/**
 * Sitemap性能监控工具
 * 
 * 功能：
 * 1. 深度性能分析和基准测试
 * 2. 响应时间分布分析
 * 3. 并发负载测试
 * 4. 缓存效率检查
 * 5. SEO性能指标评估
 * 6. 性能回归检测
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// 性能监控配置
const PERFORMANCE_CONFIG = {
  // 测试配置
  WARMUP_REQUESTS: 3,          // 预热请求数
  TEST_ITERATIONS: 10,         // 测试迭代次数
  CONCURRENT_USERS: [1, 5, 10, 20], // 并发用户数
  TEST_DURATION: 30000,        // 测试持续时间(ms)
  
  // 阈值配置
  THRESHOLDS: {
    EXCELLENT: 500,    // 优秀响应时间
    GOOD: 1000,        // 良好响应时间
    ACCEPTABLE: 2000,  // 可接受响应时间
    POOR: 5000,        // 差响应时间
    P95_THRESHOLD: 2000, // 95百分位阈值
    P99_THRESHOLD: 5000  // 99百分位阈值
  },
  
  // 报告配置
  REPORT_DIR: path.join(__dirname, 'performance-reports'),
  ENABLE_CHARTS: true,
  SAVE_RAW_DATA: true
};

/**
 * 性能指标类
 */
class PerformanceMetrics {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.responseTimes = [];
    this.errors = [];
    this.startTime = null;
    this.endTime = null;
    this.totalRequests = 0;
    this.successfulRequests = 0;
  }
  
  recordRequest(responseTime, success, error = null) {
    this.totalRequests++;
    
    if (success) {
      this.responseTimes.push(responseTime);
      this.successfulRequests++;
    } else {
      this.errors.push({
        timestamp: Date.now(),
        error: error,
        responseTime: responseTime
      });
    }
  }
  
  calculatePercentile(percentile) {
    if (this.responseTimes.length === 0) return 0;
    
    const sorted = [...this.responseTimes].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * (percentile / 100)) - 1;
    return sorted[Math.max(0, index)];
  }
  
  getStatistics() {
    if (this.responseTimes.length === 0) {
      return {
        min: 0,
        max: 0,
        avg: 0,
        median: 0,
        p95: 0,
        p99: 0,
        successRate: 0,
        totalRequests: this.totalRequests,
        errors: this.errors.length
      };
    }
    
    const sorted = [...this.responseTimes].sort((a, b) => a - b);
    const sum = this.responseTimes.reduce((a, b) => a + b, 0);
    
    return {
      min: Math.min(...this.responseTimes),
      max: Math.max(...this.responseTimes),
      avg: Math.round(sum / this.responseTimes.length),
      median: this.calculatePercentile(50),
      p95: this.calculatePercentile(95),
      p99: this.calculatePercentile(99),
      successRate: (this.successfulRequests / this.totalRequests) * 100,
      totalRequests: this.totalRequests,
      errors: this.errors.length,
      distribution: this.getDistribution()
    };
  }
  
  getDistribution() {
    const { EXCELLENT, GOOD, ACCEPTABLE, POOR } = PERFORMANCE_CONFIG.THRESHOLDS;
    const distribution = {
      excellent: 0,  // < 500ms
      good: 0,       // 500ms - 1000ms
      acceptable: 0, // 1000ms - 2000ms
      poor: 0,       // 2000ms - 5000ms
      critical: 0    // > 5000ms
    };
    
    this.responseTimes.forEach(time => {
      if (time < EXCELLENT) distribution.excellent++;
      else if (time < GOOD) distribution.good++;
      else if (time < ACCEPTABLE) distribution.acceptable++;
      else if (time < POOR) distribution.poor++;
      else distribution.critical++;
    });
    
    // 转换为百分比
    const total = this.responseTimes.length;
    Object.keys(distribution).forEach(key => {
      distribution[key] = Math.round((distribution[key] / total) * 100);
    });
    
    return distribution;
  }
}

/**
 * 高级性能监控器
 */
class AdvancedPerformanceMonitor {
  constructor(logger) {
    this.logger = logger;
    this.ensureReportDirectory();
  }
  
  ensureReportDirectory() {
    if (!fs.existsSync(PERFORMANCE_CONFIG.REPORT_DIR)) {
      fs.mkdirSync(PERFORMANCE_CONFIG.REPORT_DIR, { recursive: true });
    }
  }
  
  /**
   * 执行全面性能测试
   */
  async runFullPerformanceTest(urls) {
    this.logger.info('开始全面性能测试...');
    
    const results = {
      timestamp: new Date().toISOString(),
      configuration: PERFORMANCE_CONFIG,
      tests: {}
    };
    
    // 1. 基础响应时间测试
    this.logger.info('执行基础响应时间测试...');
    results.tests.baseline = await this.runBaselineTest(urls);
    
    // 2. 并发负载测试
    this.logger.info('执行并发负载测试...');
    results.tests.loadTest = await this.runLoadTest(urls);
    
    // 3. 缓存效率测试
    this.logger.info('执行缓存效率测试...');
    results.tests.cacheTest = await this.runCacheTest(urls.slice(0, 5)); // 限制URL数量
    
    // 4. SEO性能指标
    this.logger.info('检查SEO性能指标...');
    results.tests.seoMetrics = await this.analyzeSeoMetrics(urls.slice(0, 10));
    
    // 5. 生成综合评估
    results.summary = this.generatePerformanceSummary(results.tests);
    
    return results;
  }
  
  /**
   * 基础响应时间测试
   */
  async runBaselineTest(urls) {
    const results = {};
    
    for (const url of urls) {
      this.logger.info(`测试基础性能: ${url}`);
      
      const metrics = new PerformanceMetrics();
      
      // 预热请求
      for (let i = 0; i < PERFORMANCE_CONFIG.WARMUP_REQUESTS; i++) {
        try {
          await fetch(url);
        } catch (error) {
          // 预热请求错误不计入统计
        }
        await this.sleep(100);
      }
      
      // 正式测试
      for (let i = 0; i < PERFORMANCE_CONFIG.TEST_ITERATIONS; i++) {
        const startTime = performance.now();
        
        try {
          const response = await fetch(url, {
            cache: 'no-cache',
            headers: {
              'User-Agent': 'PerformanceMonitor/1.0',
              'Cache-Control': 'no-cache'
            }
          });
          
          const endTime = performance.now();
          const responseTime = Math.round(endTime - startTime);
          
          metrics.recordRequest(responseTime, response.ok);
          
        } catch (error) {
          const endTime = performance.now();
          const responseTime = Math.round(endTime - startTime);
          
          metrics.recordRequest(responseTime, false, error.message);
        }
        
        await this.sleep(200); // 请求间隔
      }
      
      results[url] = {
        statistics: metrics.getStatistics(),
        rating: this.getRatingForUrl(metrics.getStatistics())
      };
    }
    
    return results;
  }
  
  /**
   * 并发负载测试
   */
  async runLoadTest(urls) {
    const results = {};
    
    // 选择几个代表性URL进行负载测试
    const testUrls = urls.slice(0, 5);
    
    for (const concurrency of PERFORMANCE_CONFIG.CONCURRENT_USERS) {
      this.logger.info(`执行并发测试: ${concurrency} 用户`);
      
      const testResults = {};
      
      for (const url of testUrls) {
        const metrics = new PerformanceMetrics();
        metrics.startTime = Date.now();
        
        // 创建并发请求
        const promises = [];
        for (let i = 0; i < concurrency; i++) {
          promises.push(this.loadTestWorker(url, metrics, PERFORMANCE_CONFIG.TEST_DURATION / concurrency));
        }
        
        await Promise.all(promises);
        
        metrics.endTime = Date.now();
        
        testResults[url] = {
          statistics: metrics.getStatistics(),
          duration: metrics.endTime - metrics.startTime,
          throughput: Math.round((metrics.totalRequests / (metrics.endTime - metrics.startTime)) * 1000)
        };
      }
      
      results[`${concurrency}_users`] = testResults;
    }
    
    return results;
  }
  
  /**
   * 负载测试工作线程
   */
  async loadTestWorker(url, metrics, duration) {
    const endTime = Date.now() + duration;
    
    while (Date.now() < endTime) {
      const startTime = performance.now();
      
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'LoadTest/1.0'
          }
        });
        
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        metrics.recordRequest(responseTime, response.ok);
        
      } catch (error) {
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        metrics.recordRequest(responseTime, false, error.message);
      }
      
      await this.sleep(Math.random() * 100); // 随机间隔模拟真实用户
    }
  }
  
  /**
   * 缓存效率测试
   */
  async runCacheTest(urls) {
    const results = {};
    
    for (const url of urls) {
      this.logger.info(`测试缓存效率: ${url}`);
      
      const cacheMetrics = {
        firstRequest: null,
        cachedRequest: null,
        cacheHitRatio: 0,
        cacheEfficiency: 0
      };
      
      // 第一次请求（缓存未命中）
      const firstStartTime = performance.now();
      try {
        const firstResponse = await fetch(url, {
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        cacheMetrics.firstRequest = {
          responseTime: Math.round(performance.now() - firstStartTime),
          status: firstResponse.status,
          headers: Object.fromEntries(firstResponse.headers.entries())
        };
      } catch (error) {
        cacheMetrics.firstRequest = {
          error: error.message,
          responseTime: Math.round(performance.now() - firstStartTime)
        };
      }
      
      // 等待一小段时间
      await this.sleep(100);
      
      // 第二次请求（可能缓存命中）
      const cachedStartTime = performance.now();
      try {
        const cachedResponse = await fetch(url);
        
        cacheMetrics.cachedRequest = {
          responseTime: Math.round(performance.now() - cachedStartTime),
          status: cachedResponse.status,
          headers: Object.fromEntries(cachedResponse.headers.entries())
        };
        
        // 计算缓存效率
        if (cacheMetrics.firstRequest.responseTime && cacheMetrics.cachedRequest.responseTime) {
          cacheMetrics.cacheEfficiency = Math.round(
            ((cacheMetrics.firstRequest.responseTime - cacheMetrics.cachedRequest.responseTime) / 
             cacheMetrics.firstRequest.responseTime) * 100
          );
        }
      } catch (error) {
        cacheMetrics.cachedRequest = {
          error: error.message,
          responseTime: Math.round(performance.now() - cachedStartTime)
        };
      }
      
      results[url] = cacheMetrics;
    }
    
    return results;
  }
  
  /**
   * SEO性能指标分析
   */
  async analyzeSeoMetrics(urls) {
    const results = {};
    
    for (const url of urls) {
      this.logger.info(`分析SEO性能: ${url}`);
      
      const startTime = performance.now();
      
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SEOAnalyzer/1.0)'
          }
        });
        
        const responseTime = Math.round(performance.now() - startTime);
        const contentLength = parseInt(response.headers.get('content-length') || '0');
        
        // 分析响应头
        const headers = Object.fromEntries(response.headers.entries());
        const hasEtag = !!headers.etag;
        const hasLastModified = !!headers['last-modified'];
        const hasCacheControl = !!headers['cache-control'];
        const hasCompression = headers['content-encoding'] === 'gzip' || headers['content-encoding'] === 'br';
        
        // 计算SEO性能得分
        let seoScore = 100;
        
        if (responseTime > 3000) seoScore -= 30;
        else if (responseTime > 2000) seoScore -= 20;
        else if (responseTime > 1000) seoScore -= 10;
        
        if (!hasEtag) seoScore -= 5;
        if (!hasLastModified) seoScore -= 5;
        if (!hasCacheControl) seoScore -= 10;
        if (!hasCompression) seoScore -= 15;
        
        if (contentLength > 500000) seoScore -= 10; // 页面过大
        
        results[url] = {
          responseTime,
          contentLength,
          compression: hasCompression,
          caching: {
            etag: hasEtag,
            lastModified: hasLastModified,
            cacheControl: hasCacheControl
          },
          seoScore: Math.max(0, seoScore),
          rating: this.getSeoRating(seoScore)
        };
        
      } catch (error) {
        results[url] = {
          error: error.message,
          responseTime: Math.round(performance.now() - startTime),
          seoScore: 0,
          rating: 'FAILED'
        };
      }
    }
    
    return results;
  }
  
  /**
   * 生成性能综合评估
   */
  generatePerformanceSummary(tests) {
    const summary = {
      overall: {
        score: 0,
        rating: 'UNKNOWN',
        issues: []
      },
      baseline: null,
      loadTest: null,
      cacheEfficiency: null,
      seoPerformance: null
    };
    
    // 基础性能评估
    if (tests.baseline) {
      const baselineUrls = Object.keys(tests.baseline);
      const avgResponseTimes = baselineUrls.map(url => tests.baseline[url].statistics.avg);
      const avgP95Times = baselineUrls.map(url => tests.baseline[url].statistics.p95);
      
      summary.baseline = {
        averageResponseTime: Math.round(avgResponseTimes.reduce((a, b) => a + b, 0) / avgResponseTimes.length),
        averageP95: Math.round(avgP95Times.reduce((a, b) => a + b, 0) / avgP95Times.length),
        fastestUrl: baselineUrls.reduce((fastest, url) => 
          tests.baseline[url].statistics.avg < tests.baseline[fastest].statistics.avg ? url : fastest
        ),
        slowestUrl: baselineUrls.reduce((slowest, url) => 
          tests.baseline[url].statistics.avg > tests.baseline[slowest].statistics.avg ? url : slowest
        )
      };
    }
    
    // 负载测试评估
    if (tests.loadTest) {
      const loadTestData = tests.loadTest;
      summary.loadTest = {
        scalability: this.analyzeScalability(loadTestData),
        performanceDegradation: this.analyzePerformanceDegradation(loadTestData)
      };
    }
    
    // 缓存效率评估
    if (tests.cacheTest) {
      const cacheData = Object.values(tests.cacheTest);
      const efficiencies = cacheData
        .map(cache => cache.cacheEfficiency)
        .filter(eff => eff > 0);
      
      summary.cacheEfficiency = {
        averageEfficiency: efficiencies.length > 0 ? 
          Math.round(efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length) : 0,
        cacheOptimizationOpportunities: cacheData.filter(cache => cache.cacheEfficiency < 30).length
      };
    }
    
    // SEO性能评估
    if (tests.seoMetrics) {
      const seoData = Object.values(tests.seoMetrics).filter(metric => !metric.error);
      const seoScores = seoData.map(metric => metric.seoScore);
      
      summary.seoPerformance = {
        averageSeoScore: seoScores.length > 0 ? 
          Math.round(seoScores.reduce((a, b) => a + b, 0) / seoScores.length) : 0,
        urlsNeedingOptimization: seoData.filter(metric => metric.seoScore < 80).length
      };
    }
    
    // 计算总体评分
    summary.overall = this.calculateOverallScore(summary);
    
    return summary;
  }
  
  /**
   * 分析可扩展性
   */
  analyzeScalability(loadTestData) {
    const concurrencyLevels = Object.keys(loadTestData).sort();
    const scalabilityMetrics = {};
    
    concurrencyLevels.forEach(level => {
      const testData = loadTestData[level];
      const urls = Object.keys(testData);
      const avgThroughput = urls.reduce((sum, url) => 
        sum + testData[url].throughput, 0) / urls.length;
      
      scalabilityMetrics[level] = avgThroughput;
    });
    
    // 检查吞吐量是否随并发数增加而合理增长
    const throughputValues = Object.values(scalabilityMetrics);
    const isScalable = throughputValues.every((value, index) => 
      index === 0 || value >= throughputValues[index - 1] * 0.8
    );
    
    return {
      metrics: scalabilityMetrics,
      scalable: isScalable,
      bottleneck: !isScalable ? this.identifyBottleneck(scalabilityMetrics) : null
    };
  }
  
  /**
   * 分析性能衰减
   */
  analyzePerformanceDegradation(loadTestData) {
    const concurrencyLevels = Object.keys(loadTestData).sort();
    const degradationData = {};
    
    concurrencyLevels.forEach(level => {
      const testData = loadTestData[level];
      const urls = Object.keys(testData);
      const avgResponseTime = urls.reduce((sum, url) => 
        sum + testData[url].statistics.avg, 0) / urls.length;
      
      degradationData[level] = avgResponseTime;
    });
    
    // 计算性能衰减率
    const baselineTime = degradationData[concurrencyLevels[0]];
    const maxConcurrencyTime = degradationData[concurrencyLevels[concurrencyLevels.length - 1]];
    const degradationRate = ((maxConcurrencyTime - baselineTime) / baselineTime) * 100;
    
    return {
      baselineResponseTime: baselineTime,
      maxConcurrencyResponseTime: maxConcurrencyTime,
      degradationRate: Math.round(degradationRate),
      acceptable: degradationRate < 200 // 响应时间增长不超过200%
    };
  }
  
  /**
   * 识别性能瓶颈
   */
  identifyBottleneck(scalabilityMetrics) {
    const levels = Object.keys(scalabilityMetrics).sort();
    
    for (let i = 1; i < levels.length; i++) {
      const current = scalabilityMetrics[levels[i]];
      const previous = scalabilityMetrics[levels[i - 1]];
      
      // 如果吞吐量下降超过20%，认为遇到瓶颈
      if (current < previous * 0.8) {
        return `在${levels[i]}并发用户时遇到性能瓶颈`;
      }
    }
    
    return null;
  }
  
  /**
   * 计算总体评分
   */
  calculateOverallScore(summary) {
    let totalScore = 100;
    const issues = [];
    
    // 基础性能评分（40%权重）
    if (summary.baseline) {
      const avgTime = summary.baseline.averageResponseTime;
      if (avgTime > 5000) {
        totalScore -= 30;
        issues.push({ type: 'performance', severity: 'high', message: '平均响应时间过长' });
      } else if (avgTime > 2000) {
        totalScore -= 20;
        issues.push({ type: 'performance', severity: 'medium', message: '响应时间需要优化' });
      } else if (avgTime > 1000) {
        totalScore -= 10;
        issues.push({ type: 'performance', severity: 'low', message: '响应时间有提升空间' });
      }
    }
    
    // 负载测试评分（25%权重）
    if (summary.loadTest && !summary.loadTest.performanceDegradation.acceptable) {
      totalScore -= 15;
      issues.push({ type: 'scalability', severity: 'medium', message: '并发性能衰减过大' });
    }
    
    // 缓存效率评分（20%权重）
    if (summary.cacheEfficiency && summary.cacheEfficiency.averageEfficiency < 30) {
      totalScore -= 15;
      issues.push({ type: 'caching', severity: 'medium', message: '缓存效率偏低' });
    }
    
    // SEO性能评分（15%权重）
    if (summary.seoPerformance && summary.seoPerformance.averageSeoScore < 80) {
      totalScore -= 10;
      issues.push({ type: 'seo', severity: 'low', message: 'SEO性能需要优化' });
    }
    
    const finalScore = Math.max(0, Math.round(totalScore));
    
    return {
      score: finalScore,
      rating: this.getPerformanceRating(finalScore),
      issues
    };
  }
  
  /**
   * 获取URL性能评级
   */
  getRatingForUrl(statistics) {
    const avgTime = statistics.avg;
    const p95Time = statistics.p95;
    const successRate = statistics.successRate;
    
    if (successRate < 95) return 'FAILED';
    if (avgTime < 500 && p95Time < 1000) return 'EXCELLENT';
    if (avgTime < 1000 && p95Time < 2000) return 'GOOD';
    if (avgTime < 2000 && p95Time < 4000) return 'ACCEPTABLE';
    if (avgTime < 5000) return 'POOR';
    return 'CRITICAL';
  }
  
  /**
   * 获取SEO评级
   */
  getSeoRating(score) {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 80) return 'GOOD';
    if (score >= 70) return 'ACCEPTABLE';
    if (score >= 50) return 'POOR';
    return 'CRITICAL';
  }
  
  /**
   * 获取性能总体评级
   */
  getPerformanceRating(score) {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 80) return 'GOOD';
    if (score >= 70) return 'ACCEPTABLE';
    if (score >= 50) return 'POOR';
    return 'CRITICAL';
  }
  
  /**
   * 保存性能报告
   */
  async savePerformanceReport(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `performance-report-${timestamp}.json`;
    const filepath = path.join(PERFORMANCE_CONFIG.REPORT_DIR, filename);
    
    // 保存完整报告
    fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
    
    // 创建最新报告的软链接
    const latestPath = path.join(PERFORMANCE_CONFIG.REPORT_DIR, 'latest-performance.json');
    if (fs.existsSync(latestPath)) {
      fs.unlinkSync(latestPath);
    }
    fs.linkSync(filepath, latestPath);
    
    // 生成HTML报告
    if (PERFORMANCE_CONFIG.ENABLE_CHARTS) {
      await this.generateHtmlReport(results, timestamp);
    }
    
    this.logger.success(`性能报告已保存: ${filepath}`);
    return filepath;
  }
  
  /**
   * 生成HTML性能报告
   */
  async generateHtmlReport(results, timestamp) {
    const htmlContent = this.generatePerformanceHtml(results);
    const htmlPath = path.join(PERFORMANCE_CONFIG.REPORT_DIR, `performance-report-${timestamp}.html`);
    
    fs.writeFileSync(htmlPath, htmlContent);
    
    // 创建最新HTML报告的软链接
    const latestHtmlPath = path.join(PERFORMANCE_CONFIG.REPORT_DIR, 'latest-performance.html');
    if (fs.existsSync(latestHtmlPath)) {
      fs.unlinkSync(latestHtmlPath);
    }
    fs.linkSync(htmlPath, latestHtmlPath);
    
    this.logger.success(`HTML性能报告已生成: ${htmlPath}`);
  }
  
  /**
   * 生成HTML报告内容
   */
  generatePerformanceHtml(results) {
    const { summary } = results;
    
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sitemap性能监控报告</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; }
        .card { background: white; border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .metric-label { font-size: 14px; color: #666; display: block; }
        .metric-value { font-size: 24px; font-weight: bold; color: #333; }
        .rating { padding: 5px 15px; border-radius: 20px; color: white; font-weight: bold; display: inline-block; }
        .rating-excellent { background: #4CAF50; }
        .rating-good { background: #2196F3; }
        .rating-acceptable { background: #FF9800; }
        .rating-poor { background: #F44336; }
        .rating-critical { background: #9C27B0; }
        .chart-container { position: relative; height: 400px; margin: 20px 0; }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .table th { background-color: #f8f9fa; font-weight: bold; }
        .issue { padding: 10px; margin: 5px 0; border-radius: 5px; }
        .issue-high { background: #ffebee; border-left: 4px solid #f44336; }
        .issue-medium { background: #fff3e0; border-left: 4px solid #ff9800; }
        .issue-low { background: #e8f5e8; border-left: 4px solid #4caf50; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Sitemap性能监控报告</h1>
            <p>生成时间: ${results.timestamp}</p>
        </div>
        
        <div class="card">
            <h2>📊 性能总览</h2>
            <div class="metric">
                <span class="metric-label">总体评分</span>
                <span class="metric-value">${summary.overall.score}/100</span>
                <span class="rating rating-${summary.overall.rating.toLowerCase()}">${summary.overall.rating}</span>
            </div>
            ${summary.baseline ? `
            <div class="metric">
                <span class="metric-label">平均响应时间</span>
                <span class="metric-value">${summary.baseline.averageResponseTime}ms</span>
            </div>
            <div class="metric">
                <span class="metric-label">95百分位响应时间</span>
                <span class="metric-value">${summary.baseline.averageP95}ms</span>
            </div>
            ` : ''}
        </div>
        
        ${summary.overall.issues.length > 0 ? `
        <div class="card">
            <h2>⚠️ 发现的问题</h2>
            ${summary.overall.issues.map(issue => `
                <div class="issue issue-${issue.severity}">
                    <strong>${issue.type.toUpperCase()}</strong>: ${issue.message}
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        <div class="card">
            <h2>📈 详细性能数据</h2>
            <div class="chart-container">
                <canvas id="performanceChart"></canvas>
            </div>
        </div>
        
        <div class="card">
            <h2>🔍 URL性能详情</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>URL</th>
                        <th>平均响应时间</th>
                        <th>P95响应时间</th>
                        <th>成功率</th>
                        <th>评级</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.tests.baseline ? Object.entries(results.tests.baseline).map(([url, data]) => `
                        <tr>
                            <td>${url}</td>
                            <td>${data.statistics.avg}ms</td>
                            <td>${data.statistics.p95}ms</td>
                            <td>${data.statistics.successRate.toFixed(1)}%</td>
                            <td><span class="rating rating-${data.rating.toLowerCase()}">${data.rating}</span></td>
                        </tr>
                    `).join('') : '<tr><td colspan="5">无基础性能数据</td></tr>'}
                </tbody>
            </table>
        </div>
    </div>
    
    <script>
        // 性能图表
        const ctx = document.getElementById('performanceChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ${results.tests.baseline ? JSON.stringify(Object.keys(results.tests.baseline).map(url => new URL(url).pathname)) : '[]'},
                datasets: [{
                    label: '平均响应时间 (ms)',
                    data: ${results.tests.baseline ? JSON.stringify(Object.values(results.tests.baseline).map(d => d.statistics.avg)) : '[]'},
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }, {
                    label: 'P95响应时间 (ms)',
                    data: ${results.tests.baseline ? JSON.stringify(Object.values(results.tests.baseline).map(d => d.statistics.p95)) : '[]'},
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '响应时间 (ms)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'URL路径'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'URL响应时间分布'
                    }
                }
            }
        });
    </script>
</body>
</html>`;
  }
  
  /**
   * 工具方法：等待指定时间
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const urlsFile = args[0] || path.join(__dirname, 'sitemap_urls.txt');
  const verbose = args.includes('--verbose') || args.includes('-v');
  
  // 简单的日志记录器
  const logger = {
    info: (message) => verbose && console.log(`[INFO] ${message}`),
    success: (message) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${message}`),
    warning: (message) => console.log(`\x1b[33m[WARNING]\x1b[0m ${message}`),
    error: (message) => console.error(`\x1b[31m[ERROR]\x1b[0m ${message}`)
  };
  
  try {
    // 读取URL列表
    let urls = [];
    if (fs.existsSync(urlsFile)) {
      const urlsContent = fs.readFileSync(urlsFile, 'utf8');
      urls = urlsContent.split('\n').filter(url => url.trim() && !url.startsWith('#'));
    } else {
      logger.error(`URL文件不存在: ${urlsFile}`);
      process.exit(1);
    }
    
    if (urls.length === 0) {
      logger.error('没有找到要测试的URL');
      process.exit(1);
    }
    
    logger.success(`开始对 ${urls.length} 个URL进行性能监控`);
    
    const monitor = new AdvancedPerformanceMonitor(logger);
    const results = await monitor.runFullPerformanceTest(urls);
    
    // 保存报告
    await monitor.savePerformanceReport(results);
    
    // 输出摘要
    console.log('\n' + '='.repeat(80));
    console.log('🚀 性能监控报告摘要');
    console.log('='.repeat(80));
    console.log(`📊 总体评分: ${results.summary.overall.score}/100 (${results.summary.overall.rating})`);
    
    if (results.summary.baseline) {
      console.log(`⚡ 平均响应时间: ${results.summary.baseline.averageResponseTime}ms`);
      console.log(`📈 95百分位响应时间: ${results.summary.baseline.averageP95}ms`);
    }
    
    if (results.summary.overall.issues.length > 0) {
      console.log(`\n⚠️  发现 ${results.summary.overall.issues.length} 个性能问题`);
    }
    
    console.log('\n' + '='.repeat(80));
    
    process.exit(results.summary.overall.score >= 70 ? 0 : 1);
    
  } catch (error) {
    logger.error(`性能监控失败: ${error.message}`);
    process.exit(1);
  }
}

// 导出模块
module.exports = {
  AdvancedPerformanceMonitor,
  PerformanceMetrics,
  PERFORMANCE_CONFIG
};

// 如果直接执行
if (require.main === module) {
  main().catch(error => {
    console.error(`程序执行失败: ${error.message}`);
    process.exit(1);
  });
}