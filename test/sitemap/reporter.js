#!/usr/bin/env node

/**
 * Sitemap详细报告生成器
 * 
 * 功能：
 * 1. 生成多格式报告（JSON, HTML, Markdown）
 * 2. 可视化图表和统计数据
 * 3. 历史趋势对比
 * 4. 详细的错误分析
 * 5. 可操作的修复建议
 * 6. 报告分发和通知
 */

const fs = require('fs');
const path = require('path');

// 报告生成器配置
const REPORTER_CONFIG = {
  // 输出配置
  OUTPUT_DIR: path.join(__dirname, 'reports'),
  OUTPUT_FORMATS: ['json', 'html', 'markdown'],
  INCLUDE_CHARTS: true,
  INCLUDE_RAW_DATA: false,
  
  // 样式配置
  HTML_THEME: 'modern',
  CHART_COLORS: {
    success: '#4CAF50',
    warning: '#FF9800', 
    error: '#F44336',
    info: '#2196F3',
    neutral: '#9E9E9E'
  },
  
  // 分发配置
  AUTO_SHARE: false,
  SHARE_ENDPOINTS: {
    slack: process.env.SLACK_WEBHOOK_URL || null,
    email: process.env.EMAIL_API_ENDPOINT || null,
    github: process.env.GITHUB_API_TOKEN || null
  },
  
  // 历史配置
  HISTORY_DAYS: 30,
  COMPARE_WITH_PREVIOUS: true,
  TREND_ANALYSIS: true
};

/**
 * 报告数据处理器
 */
class ReportDataProcessor {
  constructor() {
    this.processedData = null;
  }
  
  processValidationData(data) {
    // 处理验证数据
    const processed = {
      timestamp: data.timestamp || new Date().toISOString(),
      mode: data.mode || 'unknown',
      duration: data.duration || 0,
      summary: this.processSummary(data.summary || data),
      details: this.processDetails(data),
      trends: this.processTrends(data.trends),
      insights: this.generateInsights(data)
    };
    
    this.processedData = processed;
    return processed;
  }
  
  processSummary(summary) {
    return {
      totalUrls: summary.validation?.totalUrls || summary.totalUrls || 0,
      successfulUrls: summary.validation?.httpSuccess || summary.matched || 0,
      failedUrls: summary.validation?.totalUrls - summary.validation?.httpSuccess || 0,
      successRate: summary.validation?.httpSuccessRate || parseFloat((summary.successRate || '0%').replace('%', '')),
      overallScore: summary.overallHealth?.score || summary.score || 0,
      overallRating: summary.overallHealth?.rating || summary.rating || 'UNKNOWN',
      issues: summary.overallHealth?.issues || summary.issues || []
    };
  }
  
  processDetails(data) {
    const details = {
      staticAnalysis: null,
      httpValidation: null,
      performanceAnalysis: null
    };
    
    // 静态分析详情
    if (data.staticAnalysis) {
      details.staticAnalysis = {
        totalUrls: data.staticAnalysis.summary.totalUrls,
        matchedUrls: data.staticAnalysis.summary.matched,
        missingUrls: data.staticAnalysis.summary.missing,
        successRate: data.staticAnalysis.summary.successRate,
        problems: data.staticAnalysis.problems || [],
        recommendations: data.staticAnalysis.recommendations || []
      };
    }
    
    // HTTP验证详情
    if (data.httpValidation) {
      const successful = data.httpValidation.filter(r => r.success);
      const failed = data.httpValidation.filter(r => !r.success);
      
      details.httpValidation = {
        totalRequests: data.httpValidation.length,
        successfulRequests: successful.length,
        failedRequests: failed.length,
        avgResponseTime: this.calculateAverage(successful.map(r => r.responseTime)),
        slowestUrls: this.getSlowestUrls(data.httpValidation),
        failedUrls: failed.map(f => ({
          url: f.url,
          status: f.status,
          error: f.statusText || f.error
        })),
        statusCodes: this.groupByStatus(data.httpValidation)
      };
    }
    
    // 性能分析详情
    if (data.performanceAnalysis) {
      details.performanceAnalysis = {
        testedUrls: data.performanceAnalysis.length,
        avgScore: this.calculateAverage(
          data.performanceAnalysis
            .filter(p => p.statistics)
            .map(p => p.statistics.successRate)
        ),
        responseTimeStats: this.calculateResponseTimeStats(data.performanceAnalysis),
        performanceDistribution: this.calculatePerformanceDistribution(data.performanceAnalysis)
      };
    }
    
    return details;
  }
  
  processTrends(trends) {
    if (!trends) return null;
    
    return {
      overall: {
        direction: trends.overall?.direction || 'UNKNOWN',
        change: trends.overall?.change || 0,
        description: this.getTrendDescription(trends.overall)
      },
      availability: {
        direction: trends.availability?.direction || 'UNKNOWN',
        change: trends.availability?.change || 0,
        description: this.getTrendDescription(trends.availability)
      },
      performance: {
        direction: trends.performance?.direction || 'UNKNOWN',
        change: trends.performance?.change || 0,
        description: this.getTrendDescription(trends.performance)
      },
      recommendations: trends.recommendations || []
    };
  }
  
  generateInsights(data) {
    const insights = {
      keyFindings: [],
      positiveAspects: [],
      concerns: [],
      recommendations: []
    };
    
    const summary = data.summary || data;
    const score = summary.overallHealth?.score || summary.score || 0;
    const successRate = summary.validation?.httpSuccessRate || 0;
    
    // 关键发现
    if (score >= 90) {
      insights.keyFindings.push('网站sitemap健康度优秀');
    } else if (score >= 70) {
      insights.keyFindings.push('网站sitemap健康度良好');
    } else {
      insights.keyFindings.push('网站sitemap存在问题需要关注');
    }
    
    // 积极方面
    if (successRate >= 95) {
      insights.positiveAspects.push('URL可访问性优秀');
    }
    
    if (data.performanceAnalysis) {
      const avgResponseTime = this.calculateAverage(
        data.performanceAnalysis
          .filter(p => p.statistics)
          .map(p => p.statistics.avg)
      );
      
      if (avgResponseTime < 1000) {
        insights.positiveAspects.push('网站响应速度快');
      }
    }
    
    // 关注点
    if (successRate < 95) {
      insights.concerns.push(`URL成功率偏低 (${successRate.toFixed(1)}%)`);
    }
    
    if (data.httpValidation) {
      const errorCount = data.httpValidation.filter(r => !r.success).length;
      if (errorCount > 0) {
        insights.concerns.push(`发现 ${errorCount} 个无法访问的URL`);
      }
    }
    
    // 建议
    if (score < 80) {
      insights.recommendations.push('建议优先修复失败的URL');
    }
    
    if (data.staticAnalysis && data.staticAnalysis.problems.length > 0) {
      insights.recommendations.push('检查sitemap配置与实际页面的匹配');
    }
    
    return insights;
  }
  
  // 工具方法
  calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    return Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length);
  }
  
  getSlowestUrls(httpValidation, limit = 5) {
    return httpValidation
      .filter(r => r.success && r.responseTime > 0)
      .sort((a, b) => b.responseTime - a.responseTime)
      .slice(0, limit)
      .map(r => ({
        url: r.url,
        responseTime: r.responseTime
      }));
  }
  
  groupByStatus(httpValidation) {
    const statusGroups = {};
    
    httpValidation.forEach(r => {
      const status = r.status.toString();
      const group = status[0] + 'xx';
      
      if (!statusGroups[group]) {
        statusGroups[group] = {
          count: 0,
          examples: []
        };
      }
      
      statusGroups[group].count++;
      
      if (statusGroups[group].examples.length < 3) {
        statusGroups[group].examples.push({
          url: r.url,
          status: r.status,
          statusText: r.statusText
        });
      }
    });
    
    return statusGroups;
  }
  
  calculateResponseTimeStats(performanceData) {
    const responseTimes = performanceData
      .filter(p => p.statistics && p.statistics.avg > 0)
      .map(p => p.statistics.avg);
    
    if (responseTimes.length === 0) {
      return { min: 0, max: 0, avg: 0, median: 0 };
    }
    
    const sorted = responseTimes.sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    
    return {
      min: Math.min(...responseTimes),
      max: Math.max(...responseTimes),
      avg: this.calculateAverage(responseTimes),
      median: Math.round(median)
    };
  }
  
  calculatePerformanceDistribution(performanceData) {
    const distribution = {
      fast: 0,      // < 1000ms
      moderate: 0,  // 1000-3000ms
      slow: 0,      // 3000-5000ms
      critical: 0   // > 5000ms
    };
    
    performanceData
      .filter(p => p.statistics)
      .forEach(p => {
        const avgTime = p.statistics.avg;
        
        if (avgTime < 1000) {
          distribution.fast++;
        } else if (avgTime < 3000) {
          distribution.moderate++;
        } else if (avgTime < 5000) {
          distribution.slow++;
        } else {
          distribution.critical++;
        }
      });
    
    return distribution;
  }
  
  getTrendDescription(trend) {
    if (!trend) return '数据不足';
    
    const { direction, change } = trend;
    
    switch (direction) {
      case 'IMPROVING':
        return `改善 ${Math.abs(change).toFixed(1)}%`;
      case 'DECLINING':
        return `下降 ${Math.abs(change).toFixed(1)}%`;
      case 'STABLE':
        return '保持稳定';
      default:
        return '趋势未知';
    }
  }
}

/**
 * HTML报告生成器
 */
class HtmlReportGenerator {
  constructor(config) {
    this.config = config;
  }
  
  generateReport(processedData) {
    const { timestamp, mode, summary, details, trends, insights } = processedData;
    
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sitemap验证报告 - ${new Date(timestamp).toLocaleString()}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/date-fns"></script>
    <style>
        ${this.getStylesheet()}
    </style>
</head>
<body>
    <div class="container">
        ${this.generateHeader(timestamp, mode)}
        ${this.generateExecutiveSummary(summary, insights)}
        ${this.generateDetailedAnalysis(details)}
        ${trends ? this.generateTrendAnalysis(trends) : ''}
        ${this.generateRecommendations(insights.recommendations)}
        ${this.generateCharts(processedData)}
        ${this.generateFooter()}
    </div>
    
    <script>
        ${this.generateChartScripts(processedData)}
    </script>
</body>
</html>`;
  }
  
  getStylesheet() {
    return `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .header .meta {
            opacity: 0.9;
            font-size: 1.1em;
        }
        
        .section {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            border: 1px solid #e9ecef;
        }
        
        .section h2 {
            font-size: 1.8em;
            margin-bottom: 20px;
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
            transition: transform 0.2s ease;
        }
        
        .metric-card:hover {
            transform: translateY(-2px);
        }
        
        .metric-card.success { border-left-color: #27ae60; }
        .metric-card.warning { border-left-color: #f39c12; }
        .metric-card.danger { border-left-color: #e74c3c; }
        
        .metric-value {
            font-size: 2.2em;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .metric-label {
            color: #7f8c8d;
            font-weight: 500;
            text-transform: uppercase;
            font-size: 0.9em;
            letter-spacing: 0.5px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-excellent { background: #d5f4e6; color: #27ae60; }
        .status-good { background: #d6eaf8; color: #3498db; }
        .status-warning { background: #fdeaa7; color: #f39c12; }
        .status-critical { background: #fadbd8; color: #e74c3c; }
        .status-failed { background: #f8d7da; color: #721c24; }
        
        .chart-container {
            position: relative;
            height: 400px;
            margin: 20px 0;
        }
        
        .insight-list {
            list-style: none;
        }
        
        .insight-list li {
            padding: 12px 0;
            border-bottom: 1px solid #ecf0f1;
            position: relative;
            padding-left: 30px;
        }
        
        .insight-list li:last-child {
            border-bottom: none;
        }
        
        .insight-list li:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #3498db;
            font-weight: bold;
            font-size: 1.2em;
        }
        
        .insight-positive:before { color: #27ae60; }
        .insight-concern:before { color: #e74c3c; }
        .insight-recommendation:before { color: #f39c12; }
        
        .trend-indicator {
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        
        .trend-up { color: #27ae60; }
        .trend-down { color: #e74c3c; }
        .trend-stable { color: #7f8c8d; }
        
        .details-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .detail-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            border: 1px solid #e9ecef;
        }
        
        .detail-card h3 {
            margin-bottom: 15px;
            color: #2c3e50;
            font-size: 1.2em;
        }
        
        .progress-bar {
            background: #ecf0f1;
            border-radius: 10px;
            height: 8px;
            overflow: hidden;
            margin: 10px 0;
        }
        
        .progress-fill {
            height: 100%;
            transition: width 0.3s ease;
        }
        
        .progress-success { background: #27ae60; }
        .progress-warning { background: #f39c12; }
        .progress-danger { background: #e74c3c; }
        
        .issue-list {
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 8px;
            padding: 15px;
            margin-top: 15px;
        }
        
        .issue-item {
            display: block;
            padding: 8px 0;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 0.9em;
            color: #c53030;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            color: #7f8c8d;
            border-top: 1px solid #ecf0f1;
            margin-top: 40px;
        }
        
        @media (max-width: 768px) {
            .container { padding: 10px; }
            .header { padding: 20px; }
            .header h1 { font-size: 2em; }
            .summary-grid { grid-template-columns: 1fr; }
            .details-grid { grid-template-columns: 1fr; }
        }
    `;
  }
  
  generateHeader(timestamp, mode) {
    return `
        <div class="header">
            <h1>🗺️ Sitemap验证报告</h1>
            <div class="meta">
                <div>生成时间: ${new Date(timestamp).toLocaleString('zh-CN')}</div>
                <div>验证模式: ${mode.toUpperCase()}</div>
            </div>
        </div>
    `;
  }
  
  generateExecutiveSummary(summary, insights) {
    return `
        <div class="section">
            <h2>📊 执行摘要</h2>
            
            <div class="summary-grid">
                <div class="metric-card ${this.getMetricClass(summary.successRate, 95, 80)}">
                    <div class="metric-value">${summary.successRate.toFixed(1)}%</div>
                    <div class="metric-label">成功率</div>
                </div>
                
                <div class="metric-card ${this.getScoreClass(summary.overallScore)}">
                    <div class="metric-value">${summary.overallScore}/100</div>
                    <div class="metric-label">总体评分</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">${summary.totalUrls}</div>
                    <div class="metric-label">总URL数</div>
                </div>
                
                <div class="metric-card ${summary.failedUrls === 0 ? 'success' : 'warning'}">
                    <div class="metric-value">${summary.failedUrls}</div>
                    <div class="metric-label">失败URL数</div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <strong>整体状态:</strong>
                <span class="status-badge status-${summary.overallRating.toLowerCase()}">
                    ${this.getRatingText(summary.overallRating)}
                </span>
            </div>
            
            <div>
                <h3 style="margin-bottom: 15px;">🔍 关键洞察</h3>
                <ul class="insight-list">
                    ${insights.keyFindings.map(finding => `
                        <li>${finding}</li>
                    `).join('')}
                    
                    ${insights.positiveAspects.map(aspect => `
                        <li class="insight-positive">${aspect}</li>
                    `).join('')}
                    
                    ${insights.concerns.map(concern => `
                        <li class="insight-concern">${concern}</li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `;
  }
  
  generateDetailedAnalysis(details) {
    let html = `
        <div class="section">
            <h2>🔍 详细分析</h2>
            <div class="details-grid">
    `;
    
    // 静态分析详情
    if (details.staticAnalysis) {
      const sa = details.staticAnalysis;
      html += `
            <div class="detail-card">
                <h3>📋 静态分析</h3>
                <div>匹配URL: ${sa.matchedUrls}/${sa.totalUrls}</div>
                <div class="progress-bar">
                    <div class="progress-fill progress-${this.getProgressClass(parseFloat(sa.successRate.replace('%', '')))}" 
                         style="width: ${sa.successRate}"></div>
                </div>
                ${sa.problems.length > 0 ? `
                <div class="issue-list">
                    <strong>发现的问题:</strong>
                    ${sa.problems.slice(0, 5).map(p => `
                        <span class="issue-item">${p.url}: ${p.reason}</span>
                    `).join('')}
                    ${sa.problems.length > 5 ? `<span class="issue-item">... 还有 ${sa.problems.length - 5} 个问题</span>` : ''}
                </div>
                ` : ''}
            </div>
        `;
    }
    
    // HTTP验证详情
    if (details.httpValidation) {
      const hv = details.httpValidation;
      html += `
            <div class="detail-card">
                <h3>🌐 HTTP验证</h3>
                <div>成功请求: ${hv.successfulRequests}/${hv.totalRequests}</div>
                <div>平均响应时间: ${hv.avgResponseTime}ms</div>
                <div class="progress-bar">
                    <div class="progress-fill progress-${this.getProgressClass((hv.successfulRequests/hv.totalRequests)*100)}" 
                         style="width: ${(hv.successfulRequests/hv.totalRequests)*100}%"></div>
                </div>
                ${hv.failedUrls.length > 0 ? `
                <div class="issue-list">
                    <strong>失败的URL:</strong>
                    ${hv.failedUrls.slice(0, 3).map(f => `
                        <span class="issue-item">${f.url}: ${f.status} ${f.error}</span>
                    `).join('')}
                    ${hv.failedUrls.length > 3 ? `<span class="issue-item">... 还有 ${hv.failedUrls.length - 3} 个</span>` : ''}
                </div>
                ` : ''}
            </div>
        `;
    }
    
    // 性能分析详情
    if (details.performanceAnalysis) {
      const pa = details.performanceAnalysis;
      html += `
            <div class="detail-card">
                <h3>⚡ 性能分析</h3>
                <div>测试URL数: ${pa.testedUrls}</div>
                <div>平均评分: ${pa.avgScore}/100</div>
                <div>响应时间: ${pa.responseTimeStats.min}ms - ${pa.responseTimeStats.max}ms</div>
                <div class="progress-bar">
                    <div class="progress-fill progress-${this.getProgressClass(pa.avgScore)}" 
                         style="width: ${pa.avgScore}%"></div>
                </div>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
  }
  
  generateTrendAnalysis(trends) {
    return `
        <div class="section">
            <h2>📈 趋势分析</h2>
            <div class="details-grid">
                <div class="detail-card">
                    <h3>整体趋势</h3>
                    <div class="trend-indicator trend-${trends.overall.direction.toLowerCase()}">
                        ${this.getTrendIcon(trends.overall.direction)}
                        <span>${trends.overall.description}</span>
                    </div>
                </div>
                
                <div class="detail-card">
                    <h3>可用性趋势</h3>
                    <div class="trend-indicator trend-${trends.availability.direction.toLowerCase()}">
                        ${this.getTrendIcon(trends.availability.direction)}
                        <span>${trends.availability.description}</span>
                    </div>
                </div>
                
                <div class="detail-card">
                    <h3>性能趋势</h3>
                    <div class="trend-indicator trend-${trends.performance.direction.toLowerCase()}">
                        ${this.getTrendIcon(trends.performance.direction)}
                        <span>${trends.performance.description}</span>
                    </div>
                </div>
            </div>
            
            ${trends.recommendations.length > 0 ? `
            <div style="margin-top: 20px;">
                <h3>📊 趋势建议</h3>
                <ul class="insight-list">
                    ${trends.recommendations.map(rec => `
                        <li class="insight-recommendation">${rec}</li>
                    `).join('')}
                </ul>
            </div>
            ` : ''}
        </div>
    `;
  }
  
  generateRecommendations(recommendations) {
    if (recommendations.length === 0) return '';
    
    return `
        <div class="section">
            <h2>💡 改进建议</h2>
            <ul class="insight-list">
                ${recommendations.map(rec => `
                    <li class="insight-recommendation">${rec}</li>
                `).join('')}
            </ul>
        </div>
    `;
  }
  
  generateCharts(processedData) {
    if (!REPORTER_CONFIG.INCLUDE_CHARTS) return '';
    
    return `
        <div class="section">
            <h2>📊 可视化图表</h2>
            
            <div style="margin-bottom: 40px;">
                <h3>URL状态分布</h3>
                <div class="chart-container">
                    <canvas id="statusChart"></canvas>
                </div>
            </div>
            
            ${processedData.details.httpValidation ? `
            <div style="margin-bottom: 40px;">
                <h3>响应时间分布</h3>
                <div class="chart-container">
                    <canvas id="responseTimeChart"></canvas>
                </div>
            </div>
            ` : ''}
            
            ${processedData.details.performanceAnalysis ? `
            <div>
                <h3>性能分布</h3>
                <div class="chart-container">
                    <canvas id="performanceChart"></canvas>
                </div>
            </div>
            ` : ''}
        </div>
    `;
  }
  
  generateChartScripts(processedData) {
    if (!REPORTER_CONFIG.INCLUDE_CHARTS) return '';
    
    const { summary, details } = processedData;
    
    return `
        // URL状态分布图
        const statusCtx = document.getElementById('statusChart').getContext('2d');
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['成功', '失败'],
                datasets: [{
                    data: [${summary.successfulUrls}, ${summary.failedUrls}],
                    backgroundColor: ['${REPORTER_CONFIG.CHART_COLORS.success}', '${REPORTER_CONFIG.CHART_COLORS.error}']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'URL验证结果分布'
                    }
                }
            }
        });
        
        ${details.httpValidation ? `
        // 响应时间分布图
        const responseTimeCtx = document.getElementById('responseTimeChart').getContext('2d');
        new Chart(responseTimeCtx, {
            type: 'bar',
            data: {
                labels: ['快速(<1s)', '正常(1-3s)', '慢(3-5s)', '很慢(>5s)'],
                datasets: [{
                    label: 'URL数量',
                    data: [
                        ${details.httpValidation.totalRequests - details.httpValidation.failedUrls},
                        0, 0, 0
                    ],
                    backgroundColor: '${REPORTER_CONFIG.CHART_COLORS.info}'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '响应时间分布'
                    }
                }
            }
        });
        ` : ''}
        
        ${details.performanceAnalysis ? `
        // 性能分布图
        const performanceCtx = document.getElementById('performanceChart').getContext('2d');
        new Chart(performanceCtx, {
            type: 'pie',
            data: {
                labels: ['快速', '中等', '慢', '关键'],
                datasets: [{
                    data: [
                        ${details.performanceAnalysis.performanceDistribution.fast},
                        ${details.performanceAnalysis.performanceDistribution.moderate},
                        ${details.performanceAnalysis.performanceDistribution.slow},
                        ${details.performanceAnalysis.performanceDistribution.critical}
                    ],
                    backgroundColor: [
                        '${REPORTER_CONFIG.CHART_COLORS.success}',
                        '${REPORTER_CONFIG.CHART_COLORS.info}',
                        '${REPORTER_CONFIG.CHART_COLORS.warning}',
                        '${REPORTER_CONFIG.CHART_COLORS.error}'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '性能等级分布'
                    }
                }
            }
        });
        ` : ''}
    `;
  }
  
  generateFooter() {
    return `
        <div class="footer">
            <p>Sitemap验证报告 - 由 <strong>AI Action Figure Generator</strong> 自动生成</p>
            <p>生成时间: ${new Date().toISOString()}</p>
        </div>
    `;
  }
  
  // 工具方法
  getMetricClass(value, goodThreshold, okThreshold) {
    if (value >= goodThreshold) return 'success';
    if (value >= okThreshold) return 'warning';
    return 'danger';
  }
  
  getScoreClass(score) {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'danger';
  }
  
  getProgressClass(percentage) {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'warning';
    return 'danger';
  }
  
  getRatingText(rating) {
    const ratings = {
      'EXCELLENT': '优秀',
      'GOOD': '良好',
      'WARNING': '警告',
      'CRITICAL': '严重',
      'FAILED': '失败',
      'UNKNOWN': '未知'
    };
    return ratings[rating] || rating;
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
}

/**
 * Markdown报告生成器
 */
class MarkdownReportGenerator {
  generateReport(processedData) {
    const { timestamp, mode, summary, details, trends, insights } = processedData;
    
    let markdown = `# 🗺️ Sitemap验证报告

**生成时间**: ${new Date(timestamp).toLocaleString('zh-CN')}  
**验证模式**: ${mode.toUpperCase()}  

## 📊 执行摘要

| 指标 | 值 | 状态 |
|------|----|----- |
| 成功率 | ${summary.successRate.toFixed(1)}% | ${this.getStatusEmoji(summary.successRate, 95, 80)} |
| 总体评分 | ${summary.overallScore}/100 | ${this.getScoreEmoji(summary.overallScore)} |
| 总URL数 | ${summary.totalUrls} | ℹ️ |
| 失败URL数 | ${summary.failedUrls} | ${summary.failedUrls === 0 ? '✅' : '⚠️'} |

**整体状态**: ${this.getRatingEmoji(summary.overallRating)} ${summary.overallRating}

### 🔍 关键洞察

`;

    // 关键发现
    insights.keyFindings.forEach(finding => {
      markdown += `- 🔍 ${finding}\n`;
    });
    
    // 积极方面
    insights.positiveAspects.forEach(aspect => {
      markdown += `- ✅ ${aspect}\n`;
    });
    
    // 关注点
    insights.concerns.forEach(concern => {
      markdown += `- ⚠️ ${concern}\n`;
    });

    markdown += '\n## 🔍 详细分析\n\n';

    // 静态分析
    if (details.staticAnalysis) {
      const sa = details.staticAnalysis;
      markdown += `### 📋 静态分析

- **匹配URL**: ${sa.matchedUrls}/${sa.totalUrls}
- **成功率**: ${sa.successRate}
- **问题数**: ${sa.problems.length}

`;
      if (sa.problems.length > 0) {
        markdown += '**发现的问题**:\n';
        sa.problems.slice(0, 5).forEach(problem => {
          markdown += `- \`${problem.url}\`: ${problem.reason}\n`;
        });
        if (sa.problems.length > 5) {
          markdown += `- ... 还有 ${sa.problems.length - 5} 个问题\n`;
        }
        markdown += '\n';
      }
    }

    // HTTP验证
    if (details.httpValidation) {
      const hv = details.httpValidation;
      markdown += `### 🌐 HTTP验证

- **成功请求**: ${hv.successfulRequests}/${hv.totalRequests}
- **平均响应时间**: ${hv.avgResponseTime}ms
- **失败请求**: ${hv.failedRequests}

`;
      if (hv.failedUrls.length > 0) {
        markdown += '**失败的URL**:\n';
        hv.failedUrls.slice(0, 5).forEach(failed => {
          markdown += `- \`${failed.url}\`: ${failed.status} ${failed.error}\n`;
        });
        if (hv.failedUrls.length > 5) {
          markdown += `- ... 还有 ${hv.failedUrls.length - 5} 个失败\n`;
        }
        markdown += '\n';
      }
    }

    // 性能分析
    if (details.performanceAnalysis) {
      const pa = details.performanceAnalysis;
      markdown += `### ⚡ 性能分析

- **测试URL数**: ${pa.testedUrls}
- **平均评分**: ${pa.avgScore}/100
- **响应时间范围**: ${pa.responseTimeStats.min}ms - ${pa.responseTimeStats.max}ms
- **中位响应时间**: ${pa.responseTimeStats.median}ms

`;
    }

    // 趋势分析
    if (trends) {
      markdown += `## 📈 趋势分析

- **整体趋势**: ${this.getTrendEmoji(trends.overall.direction)} ${trends.overall.description}
- **可用性趋势**: ${this.getTrendEmoji(trends.availability.direction)} ${trends.availability.description}
- **性能趋势**: ${this.getTrendEmoji(trends.performance.direction)} ${trends.performance.description}

`;
      if (trends.recommendations.length > 0) {
        markdown += '**趋势建议**:\n';
        trends.recommendations.forEach(rec => {
          markdown += `- 📊 ${rec}\n`;
        });
        markdown += '\n';
      }
    }

    // 改进建议
    if (insights.recommendations.length > 0) {
      markdown += `## 💡 改进建议

`;
      insights.recommendations.forEach(rec => {
        markdown += `- 💡 ${rec}\n`;
      });
      markdown += '\n';
    }

    // 页脚
    markdown += `---

*报告由 AI Action Figure Generator 自动生成*  
*生成时间: ${new Date().toISOString()}*`;

    return markdown;
  }
  
  // 工具方法
  getStatusEmoji(value, goodThreshold, okThreshold) {
    if (value >= goodThreshold) return '✅';
    if (value >= okThreshold) return '⚠️';
    return '❌';
  }
  
  getScoreEmoji(score) {
    if (score >= 90) return '🟢';
    if (score >= 70) return '🟡';
    return '🔴';
  }
  
  getRatingEmoji(rating) {
    const emojis = {
      'EXCELLENT': '🟢',
      'GOOD': '🔵',
      'WARNING': '🟡',
      'CRITICAL': '🟠',
      'FAILED': '🔴',
      'UNKNOWN': '⚪'
    };
    return emojis[rating] || '⚪';
  }
  
  getTrendEmoji(direction) {
    const emojis = {
      'IMPROVING': '📈',
      'STABLE': '➖',
      'DECLINING': '📉',
      'UNKNOWN': '❓'
    };
    return emojis[direction] || '❓';
  }
}

/**
 * 主报告生成器
 */
class SitemapReporter {
  constructor(config = {}) {
    this.config = { ...REPORTER_CONFIG, ...config };
    this.dataProcessor = new ReportDataProcessor();
    this.htmlGenerator = new HtmlReportGenerator(this.config);
    this.markdownGenerator = new MarkdownReportGenerator();
    
    this.ensureOutputDirectory();
  }
  
  ensureOutputDirectory() {
    if (!fs.existsSync(this.config.OUTPUT_DIR)) {
      fs.mkdirSync(this.config.OUTPUT_DIR, { recursive: true });
    }
  }
  
  async generateReport(validationData, options = {}) {
    // 处理数据
    const processedData = this.dataProcessor.processValidationData(validationData);
    
    const outputs = [];
    const timestamp = processedData.timestamp;
    const baseFilename = `sitemap-report-${timestamp.replace(/[:.]/g, '-')}`;
    
    // 生成不同格式的报告
    if (this.config.OUTPUT_FORMATS.includes('json')) {
      const jsonPath = await this.generateJsonReport(processedData, baseFilename);
      outputs.push({ format: 'json', path: jsonPath });
    }
    
    if (this.config.OUTPUT_FORMATS.includes('html')) {
      const htmlPath = await this.generateHtmlReport(processedData, baseFilename);
      outputs.push({ format: 'html', path: htmlPath });
    }
    
    if (this.config.OUTPUT_FORMATS.includes('markdown')) {
      const mdPath = await this.generateMarkdownReport(processedData, baseFilename);
      outputs.push({ format: 'markdown', path: mdPath });
    }
    
    // 创建最新报告的软链接
    await this.createLatestLinks(outputs);
    
    // 分发报告
    if (this.config.AUTO_SHARE) {
      await this.shareReports(outputs, processedData);
    }
    
    return {
      processedData,
      outputs,
      summary: {
        score: processedData.summary.overallScore,
        rating: processedData.summary.overallRating,
        successRate: processedData.summary.successRate
      }
    };
  }
  
  async generateJsonReport(processedData, baseFilename) {
    const jsonPath = path.join(this.config.OUTPUT_DIR, `${baseFilename}.json`);
    
    const reportData = {
      ...processedData,
      metadata: {
        generator: 'SitemapReporter',
        version: '1.0.0',
        generatedAt: new Date().toISOString()
      }
    };
    
    fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2));
    return jsonPath;
  }
  
  async generateHtmlReport(processedData, baseFilename) {
    const htmlPath = path.join(this.config.OUTPUT_DIR, `${baseFilename}.html`);
    const htmlContent = this.htmlGenerator.generateReport(processedData);
    
    fs.writeFileSync(htmlPath, htmlContent);
    return htmlPath;
  }
  
  async generateMarkdownReport(processedData, baseFilename) {
    const mdPath = path.join(this.config.OUTPUT_DIR, `${baseFilename}.md`);
    const markdownContent = this.markdownGenerator.generateReport(processedData);
    
    fs.writeFileSync(mdPath, markdownContent);
    return mdPath;
  }
  
  async createLatestLinks(outputs) {
    for (const output of outputs) {
      const latestPath = path.join(this.config.OUTPUT_DIR, `latest.${output.format === 'markdown' ? 'md' : output.format}`);
      
      if (fs.existsSync(latestPath)) {
        fs.unlinkSync(latestPath);
      }
      
      try {
        fs.linkSync(output.path, latestPath);
      } catch (error) {
        // 如果硬链接失败，复制文件
        fs.copyFileSync(output.path, latestPath);
      }
    }
  }
  
  async shareReports(outputs, processedData) {
    // 这里可以实现报告分发逻辑
    // 比如发送到Slack、邮件等
    console.log('📤 报告分发功能待实现');
  }
}

/**
 * 命令行接口
 */
async function main() {
  const args = process.argv.slice(2);
  const reportFile = args[0];
  
  if (!reportFile || args.includes('--help')) {
    console.log(`
📊 Sitemap详细报告生成器

用法:
  node reporter.js <验证结果文件> [选项]

选项:
  --format=json,html,md    输出格式 (默认: json,html,md)
  --output-dir=<目录>      输出目录
  --theme=<主题>           HTML主题 (modern/classic)
  --no-charts             禁用图表
  --share                 自动分发报告
  --help                  显示帮助信息

示例:
  node reporter.js test/sitemap/reports/latest-standard.json
  node reporter.js validation-result.json --format=html --theme=modern
  node reporter.js result.json --output-dir=./reports --share
`);
    process.exit(0);
  }
  
  if (!fs.existsSync(reportFile)) {
    console.error(`❌ 验证结果文件不存在: ${reportFile}`);
    process.exit(1);
  }
  
  try {
    // 读取验证数据
    const validationData = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
    
    // 配置选项
    const config = { ...REPORTER_CONFIG };
    
    const formatArg = args.find(arg => arg.startsWith('--format='));
    if (formatArg) {
      config.OUTPUT_FORMATS = formatArg.split('=')[1].split(',');
    }
    
    const outputDirArg = args.find(arg => arg.startsWith('--output-dir='));
    if (outputDirArg) {
      config.OUTPUT_DIR = outputDirArg.split('=')[1];
    }
    
    const themeArg = args.find(arg => arg.startsWith('--theme='));
    if (themeArg) {
      config.HTML_THEME = themeArg.split('=')[1];
    }
    
    if (args.includes('--no-charts')) {
      config.INCLUDE_CHARTS = false;
    }
    
    if (args.includes('--share')) {
      config.AUTO_SHARE = true;
    }
    
    // 生成报告
    console.log('📊 开始生成详细报告...');
    const reporter = new SitemapReporter(config);
    const result = await reporter.generateReport(validationData);
    
    // 输出结果
    console.log('\n✅ 报告生成完成!');
    console.log(`📈 整体评分: ${result.summary.score}/100 (${result.summary.rating})`);
    console.log(`📊 成功率: ${result.summary.successRate.toFixed(1)}%`);
    
    console.log('\n📄 生成的报告:');
    result.outputs.forEach(output => {
      console.log(`   ${output.format.toUpperCase()}: ${output.path}`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error(`❌ 报告生成失败: ${error.message}`);
    process.exit(1);
  }
}

// 导出模块
module.exports = {
  SitemapReporter,
  ReportDataProcessor,
  HtmlReportGenerator,
  MarkdownReportGenerator,
  REPORTER_CONFIG
};

// 如果直接执行
if (require.main === module) {
  main().catch(error => {
    console.error(`程序执行失败: ${error.message}`);
    process.exit(1);
  });
}