#!/usr/bin/env node

/**
 * 支付系统健康检查脚本
 * 用于生产环境的全面支付流程检查
 */

const https = require('https');
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_WEB_URL || 'https://yourdomain.com',
  timeout: 30000, // 30秒超时
  retryAttempts: 3,
  reportFile: 'payment-health-report.json',
  logLevel: process.env.LOG_LEVEL || 'info'
};

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// 日志记录
class Logger {
  static info(message) {
    console.log(`${colors.blue}[INFO]${colors.reset} ${message}`);
  }
  
  static success(message) {
    console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
  }
  
  static error(message) {
    console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
  }
  
  static warn(message) {
    console.log(`${colors.yellow}[WARN]${colors.reset} ${message}`);
  }
}

// 健康检查结果
class HealthCheckResult {
  constructor() {
    this.timestamp = new Date().toISOString();
    this.overallStatus = 'healthy';
    this.checks = {};
    this.metrics = {
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      totalResponseTime: 0
    };
  }
  
  addCheck(name, status, details = {}) {
    this.checks[name] = {
      status,
      timestamp: new Date().toISOString(),
      ...details
    };
    
    this.metrics.totalChecks++;
    if (status === 'healthy') {
      this.metrics.passedChecks++;
    } else {
      this.metrics.failedChecks++;
      this.overallStatus = 'unhealthy';
    }
    
    if (details.responseTime) {
      this.metrics.totalResponseTime += details.responseTime;
    }
  }
  
  getAverageResponseTime() {
    return this.metrics.totalResponseTime / this.metrics.totalChecks;
  }
  
  getSummary() {
    return {
      status: this.overallStatus,
      totalChecks: this.metrics.totalChecks,
      passedChecks: this.metrics.passedChecks,
      failedChecks: this.metrics.failedChecks,
      successRate: (this.metrics.passedChecks / this.metrics.totalChecks * 100).toFixed(2),
      averageResponseTime: this.getAverageResponseTime().toFixed(2)
    };
  }
}

// HTTP 请求工具
class HttpClient {
  static async request(options) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const protocol = options.protocol === 'https:' ? https : http;
      
      const req = protocol.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            responseTime: responseTime
          });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(CONFIG.timeout, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }
  
  static async get(url, headers = {}) {
    const urlObj = new URL(url);
    return this.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      protocol: urlObj.protocol,
      headers: headers
    });
  }
  
  static async post(url, body, headers = {}) {
    const urlObj = new URL(url);
    return this.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      protocol: urlObj.protocol,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...headers
      },
      body: body
    });
  }
}

// 支付系统健康检查器
class PaymentHealthChecker {
  constructor() {
    this.result = new HealthCheckResult();
  }
  
  // 检查基础健康端点
  async checkBasicHealth() {
    Logger.info('检查基础健康端点...');
    
    try {
      const response = await HttpClient.get(`${CONFIG.baseUrl}/api/health`);
      
      if (response.statusCode === 200) {
        const data = JSON.parse(response.data);
        this.result.addCheck('basic_health', 'healthy', {
          responseTime: response.responseTime,
          details: data
        });
        Logger.success(`基础健康检查通过 (${response.responseTime}ms)`);
      } else {
        this.result.addCheck('basic_health', 'unhealthy', {
          responseTime: response.responseTime,
          statusCode: response.statusCode,
          error: 'HTTP status code not 200'
        });
        Logger.error(`基础健康检查失败: HTTP ${response.statusCode}`);
      }
    } catch (error) {
      this.result.addCheck('basic_health', 'unhealthy', {
        error: error.message
      });
      Logger.error(`基础健康检查失败: ${error.message}`);
    }
  }
  
  // 检查 Webhook 端点可访问性
  async checkWebhookEndpoint() {
    Logger.info('检查 Creem Webhook 端点...');
    
    try {
      // 测试无效签名请求（应该返回400或500）
      const testBody = JSON.stringify({ test: 'webhook_health_check' });
      const invalidSignature = 'invalid_signature';
      
      const response = await HttpClient.post(
        `${CONFIG.baseUrl}/api/pay/notify/creem`,
        testBody,
        {
          'creem-signature': invalidSignature,
          'Content-Type': 'application/json'
        }
      );
      
      // Webhook 应该拒绝无效签名的请求
      if (response.statusCode >= 400 && response.statusCode < 600) {
        this.result.addCheck('webhook_endpoint', 'healthy', {
          responseTime: response.responseTime,
          statusCode: response.statusCode,
          details: 'Webhook correctly rejects invalid signatures'
        });
        Logger.success(`Webhook 端点正常 (${response.responseTime}ms) - 正确拒绝无效签名`);
      } else {
        this.result.addCheck('webhook_endpoint', 'unhealthy', {
          responseTime: response.responseTime,
          statusCode: response.statusCode,
          error: 'Webhook should reject invalid signatures'
        });
        Logger.error(`Webhook 端点异常: 应该拒绝无效签名`);
      }
    } catch (error) {
      this.result.addCheck('webhook_endpoint', 'unhealthy', {
        error: error.message
      });
      Logger.error(`Webhook 端点检查失败: ${error.message}`);
    }
  }
  
  // 检查数据库连接
  async checkDatabaseConnection() {
    Logger.info('检查数据库连接...');
    
    try {
      // 通过 API 端点检查数据库连接
      const response = await HttpClient.get(`${CONFIG.baseUrl}/api/ping`);
      
      if (response.statusCode === 200) {
        const data = JSON.parse(response.data);
        this.result.addCheck('database_connection', 'healthy', {
          responseTime: response.responseTime,
          details: data
        });
        Logger.success(`数据库连接正常 (${response.responseTime}ms)`);
      } else {
        this.result.addCheck('database_connection', 'unhealthy', {
          responseTime: response.responseTime,
          statusCode: response.statusCode,
          error: 'Database ping failed'
        });
        Logger.error(`数据库连接异常: HTTP ${response.statusCode}`);
      }
    } catch (error) {
      this.result.addCheck('database_connection', 'unhealthy', {
        error: error.message
      });
      Logger.error(`数据库连接检查失败: ${error.message}`);
    }
  }
  
  // 检查 Creem API 连接
  async checkCreemAPIConnection() {
    Logger.info('检查 Creem API 连接...');
    
    const creemEnv = process.env.CREEM_ENV || 'test';
    const apiKey = process.env.CREEM_API_KEY;
    
    if (!apiKey) {
      this.result.addCheck('creem_api', 'unhealthy', {
        error: 'CREEM_API_KEY not configured'
      });
      Logger.error('CREEM_API_KEY 未配置');
      return;
    }
    
    try {
      const baseUrl = creemEnv === 'prod' 
        ? 'https://api.creem.io' 
        : 'https://test-api.creem.io';
      
      // 测试 API 连接 - 尝试获取产品列表或账户信息
      const response = await HttpClient.get(`${baseUrl}/v1/products`, {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      });
      
      if (response.statusCode === 200) {
        this.result.addCheck('creem_api', 'healthy', {
          responseTime: response.responseTime,
          environment: creemEnv,
          details: 'Creem API accessible'
        });
        Logger.success(`Creem API 连接正常 (${response.responseTime}ms) - ${creemEnv} 环境`);
      } else {
        this.result.addCheck('creem_api', 'unhealthy', {
          responseTime: response.responseTime,
          statusCode: response.statusCode,
          environment: creemEnv,
          error: 'Creem API returned error'
        });
        Logger.error(`Creem API 连接异常: HTTP ${response.statusCode}`);
      }
    } catch (error) {
      this.result.addCheck('creem_api', 'unhealthy', {
        environment: creemEnv,
        error: error.message
      });
      Logger.error(`Creem API 连接检查失败: ${error.message}`);
    }
  }
  
  // 检查签名验证功能
  async checkSignatureValidation() {
    Logger.info('检查 Webhook 签名验证...');
    
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
    if (!webhookSecret) {
      this.result.addCheck('signature_validation', 'unhealthy', {
        error: 'CREEM_WEBHOOK_SECRET not configured'
      });
      Logger.error('CREEM_WEBHOOK_SECRET 未配置');
      return;
    }
    
    try {
      const testBody = JSON.stringify({
        id: 'test_event_' + Date.now(),
        type: 'checkout.session.completed',
        object: {
          id: 'test_checkout',
          customer: { email: 'test@example.com' },
          metadata: {
            order_no: 'test_order_' + Date.now(),
            user_email: 'test@example.com'
          }
        }
      });
      
      // 生成正确的签名
      const validSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(testBody)
        .digest('hex');
      
      // 测试有效签名
      const response = await HttpClient.post(
        `${CONFIG.baseUrl}/api/pay/notify/creem`,
        testBody,
        {
          'creem-signature': validSignature,
          'Content-Type': 'application/json'
        }
      );
      
      // 期望返回200或处理成功的状态码
      if (response.statusCode === 200) {
        this.result.addCheck('signature_validation', 'healthy', {
          responseTime: response.responseTime,
          details: 'Valid signature accepted'
        });
        Logger.success(`签名验证功能正常 (${response.responseTime}ms)`);
      } else {
        this.result.addCheck('signature_validation', 'warning', {
          responseTime: response.responseTime,
          statusCode: response.statusCode,
          details: 'Signature validation may have business logic errors'
        });
        Logger.warn(`签名验证功能可能有业务逻辑错误: HTTP ${response.statusCode}`);
      }
    } catch (error) {
      this.result.addCheck('signature_validation', 'unhealthy', {
        error: error.message
      });
      Logger.error(`签名验证检查失败: ${error.message}`);
    }
  }
  
  // 检查环境变量配置
  async checkEnvironmentConfiguration() {
    Logger.info('检查环境变量配置...');
    
    const requiredVars = [
      'CREEM_API_KEY',
      'CREEM_ENV',
      'CREEM_WEBHOOK_SECRET',
      'CREEM_PRODUCTS',
      'DATABASE_URL',
      'AUTH_SECRET'
    ];
    
    const missingVars = [];
    const configuredVars = [];
    
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        missingVars.push(varName);
      } else {
        configuredVars.push(varName);
      }
    });
    
    if (missingVars.length === 0) {
      this.result.addCheck('environment_config', 'healthy', {
        configuredVariables: configuredVars.length,
        details: 'All required environment variables configured'
      });
      Logger.success(`环境变量配置完整 (${configuredVars.length}/${requiredVars.length})`);
    } else {
      this.result.addCheck('environment_config', 'unhealthy', {
        missingVariables: missingVars,
        configuredVariables: configuredVars.length,
        error: `Missing ${missingVars.length} required variables`
      });
      Logger.error(`缺少 ${missingVars.length} 个必需环境变量: ${missingVars.join(', ')}`);
    }
  }
  
  // 检查产品配置映射
  async checkProductConfiguration() {
    Logger.info('检查产品配置映射...');
    
    try {
      const creemProductsJson = process.env.CREEM_PRODUCTS;
      if (!creemProductsJson) {
        throw new Error('CREEM_PRODUCTS not configured');
      }
      
      const creemProducts = JSON.parse(creemProductsJson);
      const productCount = Object.keys(creemProducts).length;
      
      if (productCount > 0) {
        this.result.addCheck('product_config', 'healthy', {
          productCount: productCount,
          products: Object.keys(creemProducts),
          details: 'Product mapping configuration valid'
        });
        Logger.success(`产品配置正常 (${productCount} 个产品)`);
      } else {
        this.result.addCheck('product_config', 'unhealthy', {
          error: 'No products configured in CREEM_PRODUCTS'
        });
        Logger.error('CREEM_PRODUCTS 中未配置产品');
      }
    } catch (error) {
      this.result.addCheck('product_config', 'unhealthy', {
        error: error.message
      });
      Logger.error(`产品配置检查失败: ${error.message}`);
    }
  }
  
  // 生成健康报告
  async generateReport() {
    Logger.info('生成健康检查报告...');
    
    const report = {
      ...this.result,
      summary: this.result.getSummary(),
      recommendations: this.generateRecommendations()
    };
    
    // 保存报告到文件
    try {
      fs.writeFileSync(
        path.join(process.cwd(), CONFIG.reportFile),
        JSON.stringify(report, null, 2)
      );
      Logger.success(`报告已保存到 ${CONFIG.reportFile}`);
    } catch (error) {
      Logger.error(`保存报告失败: ${error.message}`);
    }
    
    return report;
  }
  
  // 生成改进建议
  generateRecommendations() {
    const recommendations = [];
    
    Object.entries(this.result.checks).forEach(([checkName, check]) => {
      if (check.status === 'unhealthy') {
        switch (checkName) {
          case 'basic_health':
            recommendations.push('检查应用服务器状态和基础依赖');
            break;
          case 'webhook_endpoint':
            recommendations.push('检查 Webhook 端点配置和网络连接');
            break;
          case 'database_connection':
            recommendations.push('检查数据库服务器状态和连接配置');
            break;
          case 'creem_api':
            recommendations.push('验证 Creem API 密钥和网络连接');
            break;
          case 'signature_validation':
            recommendations.push('检查 Webhook 签名验证实现');
            break;
          case 'environment_config':
            recommendations.push('配置缺失的环境变量');
            break;
          case 'product_config':
            recommendations.push('检查产品映射配置格式');
            break;
        }
      }
    });
    
    if (this.result.getAverageResponseTime() > 5000) {
      recommendations.push('响应时间较长，考虑性能优化');
    }
    
    return recommendations;
  }
  
  // 运行所有检查
  async runAllChecks() {
    Logger.info('🚀 开始支付系统健康检查...');
    console.log('='.repeat(50));
    
    await this.checkEnvironmentConfiguration();
    await this.checkProductConfiguration();
    await this.checkBasicHealth();
    await this.checkDatabaseConnection();
    await this.checkWebhookEndpoint();
    await this.checkCreemAPIConnection();
    await this.checkSignatureValidation();
    
    const report = await this.generateReport();
    
    console.log('='.repeat(50));
    Logger.info('✅ 健康检查完成');
    
    // 输出摘要
    const summary = report.summary;
    console.log(`\n📊 检查摘要:`);
    console.log(`   状态: ${summary.status === 'healthy' ? '🟢 健康' : '🔴 异常'}`);
    console.log(`   总检查项: ${summary.totalChecks}`);
    console.log(`   通过: ${colors.green}${summary.passedChecks}${colors.reset}`);
    console.log(`   失败: ${colors.red}${summary.failedChecks}${colors.reset}`);
    console.log(`   成功率: ${summary.successRate}%`);
    console.log(`   平均响应时间: ${summary.averageResponseTime}ms`);
    
    if (report.recommendations.length > 0) {
      console.log(`\n💡 改进建议:`);
      report.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }
    
    // 如果有失败的检查，退出码为1
    if (summary.status !== 'healthy') {
      process.exit(1);
    }
  }
}

// 主执行函数
async function main() {
  try {
    const checker = new PaymentHealthChecker();
    await checker.runAllChecks();
  } catch (error) {
    Logger.error(`健康检查失败: ${error.message}`);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = PaymentHealthChecker;