# 生产环境监控和日志配置指南

## 概述

本指南详细说明如何为 Action Figure AI Generator 的 Creem 支付集成设置全面的监控、日志记录和告警系统，确保生产环境的稳定性和问题的快速发现与解决。

## 1. 监控架构概览

```
┌─────────────────────────────────────────────────────────┐
│                   监控数据流                            │
└─────────────────────────────────────────────────────────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
    v                      v                      v
┌─────────┐           ┌─────────┐           ┌─────────┐
│  应用层  │           │  系统层  │           │  业务层  │
│ 日志    │           │ 指标    │           │ 告警    │
└─────────┘           └─────────┘           └─────────┘
    │                      │                      │
    v                      v                      v
┌─────────┐           ┌─────────┐           ┌─────────┐
│ Winston │           │DataDog/ │           │PagerDuty│
│ Logger  │           │Grafana  │           │ /Slack  │
└─────────┘           └─────────┘           └─────────┘
```

## 2. 应用级监控配置

### 2.1 Winston 日志配置

```typescript
// src/lib/logger.ts
import winston from 'winston';
import 'winston-daily-rotate-file';

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// 支付相关日志记录器
export const paymentLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'actionfigure-payment',
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  },
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // 按日期轮转的文件日志
    new winston.transports.DailyRotateFile({
      filename: 'logs/payment-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '100m',
      maxFiles: '30d',
      zippedArchive: true
    }),
    
    // 错误日志单独记录
    new winston.transports.DailyRotateFile({
      level: 'error',
      filename: 'logs/payment-error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '100m',
      maxFiles: '90d',
      zippedArchive: true
    })
  ]
});

// Webhook 专用日志记录器
export const webhookLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: {
    service: 'creem-webhook',
    environment: process.env.NODE_ENV
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: 'logs/webhook-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '50m',
      maxFiles: '14d'
    })
  ]
});
```

### 2.2 支付事件日志记录

```typescript
// src/lib/payment-monitoring.ts
import { paymentLogger } from './logger';

export class PaymentMonitor {
  // 记录支付开始
  static logPaymentStart(data: {
    orderId: string;
    userId: string;
    amount: number;
    currency: string;
    provider: string;
  }) {
    paymentLogger.info('Payment initiated', {
      event: 'payment.start',
      order_id: data.orderId,
      user_id: data.userId,
      amount: data.amount,
      currency: data.currency,
      provider: data.provider,
      timestamp: new Date().toISOString()
    });
  }
  
  // 记录支付成功
  static logPaymentSuccess(data: {
    orderId: string;
    userId: string;
    amount: number;
    transactionId: string;
    processingTime: number;
  }) {
    paymentLogger.info('Payment completed successfully', {
      event: 'payment.success',
      order_id: data.orderId,
      user_id: data.userId,
      amount: data.amount,
      transaction_id: data.transactionId,
      processing_time_ms: data.processingTime,
      timestamp: new Date().toISOString()
    });
  }
  
  // 记录支付失败
  static logPaymentFailure(data: {
    orderId: string;
    userId: string;
    error: Error;
    failureReason: string;
    provider: string;
  }) {
    paymentLogger.error('Payment failed', {
      event: 'payment.failure',
      order_id: data.orderId,
      user_id: data.userId,
      error_message: data.error.message,
      error_stack: data.error.stack,
      failure_reason: data.failureReason,
      provider: data.provider,
      timestamp: new Date().toISOString()
    });
  }
  
  // 记录 Webhook 事件
  static logWebhookEvent(data: {
    eventId: string;
    eventType: string;
    provider: string;
    processingTime: number;
    success: boolean;
    orderId?: string;
    error?: Error;
  }) {
    const logLevel = data.success ? 'info' : 'error';
    const message = data.success ? 'Webhook processed successfully' : 'Webhook processing failed';
    
    paymentLogger.log(logLevel, message, {
      event: 'webhook.processed',
      event_id: data.eventId,
      event_type: data.eventType,
      provider: data.provider,
      processing_time_ms: data.processingTime,
      success: data.success,
      order_id: data.orderId,
      error_message: data.error?.message,
      timestamp: new Date().toISOString()
    });
  }
}
```

### 2.3 Webhook 监控中间件

```typescript
// src/middleware/webhook-monitor.ts
import { NextRequest } from 'next/server';
import { webhookLogger } from '@/lib/logger';

export function withWebhookMonitoring(handler: Function) {
  return async (req: NextRequest) => {
    const startTime = Date.now();
    const eventId = req.headers.get('x-creem-event-id') || 'unknown';
    const userIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    webhookLogger.info('Webhook request received', {
      event_id: eventId,
      ip_address: userIP,
      user_agent: req.headers.get('user-agent'),
      content_length: req.headers.get('content-length'),
      timestamp: new Date().toISOString()
    });
    
    try {
      const response = await handler(req);
      const processingTime = Date.now() - startTime;
      
      webhookLogger.info('Webhook request completed', {
        event_id: eventId,
        status_code: response.status,
        processing_time_ms: processingTime,
        success: response.status < 400,
        timestamp: new Date().toISOString()
      });
      
      return response;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      webhookLogger.error('Webhook request failed', {
        event_id: eventId,
        error_message: error.message,
        error_stack: error.stack,
        processing_time_ms: processingTime,
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  };
}
```

## 3. 指标收集和监控

### 3.1 DataDog 集成

```typescript
// src/lib/metrics.ts
import StatsD from 'node-statsd';

const statsd = new StatsD({
  host: process.env.DATADOG_AGENT_HOST || 'localhost',
  port: parseInt(process.env.DATADOG_AGENT_PORT || '8125'),
  prefix: 'actionfigure.payment.',
  global_tags: [
    `env:${process.env.NODE_ENV}`,
    `version:${process.env.npm_package_version}`
  ]
});

export class PaymentMetrics {
  // 支付计数器
  static incrementPaymentCounter(provider: string, status: 'success' | 'failure') {
    statsd.increment('payment.count', 1, [`provider:${provider}`, `status:${status}`]);
  }
  
  // 支付金额统计
  static recordPaymentAmount(amount: number, currency: string, provider: string) {
    statsd.histogram('payment.amount', amount, [`currency:${currency}`, `provider:${provider}`]);
  }
  
  // 处理时间统计
  static recordProcessingTime(timeMs: number, operation: string) {
    statsd.histogram('payment.processing_time', timeMs, [`operation:${operation}`]);
  }
  
  // Webhook 指标
  static recordWebhookMetrics(provider: string, eventType: string, success: boolean, timeMs: number) {
    statsd.increment('webhook.count', 1, [
      `provider:${provider}`,
      `event_type:${eventType}`,
      `success:${success}`
    ]);
    
    statsd.histogram('webhook.processing_time', timeMs, [
      `provider:${provider}`,
      `event_type:${eventType}`
    ]);
  }
  
  // 用户行为指标
  static recordUserAction(action: string, userId: string) {
    statsd.increment('user.action', 1, [`action:${action}`, `user_id:${userId}`]);
  }
  
  // 系统健康指标
  static recordHealthCheck(service: string, status: 'healthy' | 'unhealthy', responseTime: number) {
    statsd.increment('health.check', 1, [`service:${service}`, `status:${status}`]);
    statsd.histogram('health.response_time', responseTime, [`service:${service}`]);
  }
}
```

### 3.2 自定义指标仪表板

```json
{
  "dashboard_title": "Action Figure Payment System",
  "description": "监控支付系统的关键指标",
  "widgets": [
    {
      "title": "支付成功率",
      "type": "timeseries",
      "requests": [
        {
          "q": "sum:actionfigure.payment.payment.count{status:success} by {provider}",
          "display_type": "line"
        }
      ]
    },
    {
      "title": "支付处理时间",
      "type": "timeseries", 
      "requests": [
        {
          "q": "avg:actionfigure.payment.payment.processing_time by {operation}",
          "display_type": "line"
        }
      ]
    },
    {
      "title": "Webhook 成功率",
      "type": "query_value",
      "requests": [
        {
          "q": "sum:actionfigure.payment.webhook.count{success:true} / sum:actionfigure.payment.webhook.count{*} * 100",
          "aggregator": "avg"
        }
      ]
    },
    {
      "title": "每日收入",
      "type": "timeseries",
      "requests": [
        {
          "q": "sum:actionfigure.payment.payment.amount by {currency}",
          "display_type": "bars"
        }
      ]
    }
  ]
}
```

## 4. 实时告警系统

### 4.1 DataDog 监控器配置

```yaml
# datadog-monitors.yaml
monitors:
  - name: "支付失败率过高"
    type: metric alert
    query: "avg(last_10m):( sum:actionfigure.payment.payment.count{status:failure} / sum:actionfigure.payment.payment.count{*} ) * 100 > 5"
    message: |
      @pagerduty-payment-team
      支付失败率超过 5%，需要立即检查
      - 检查 Creem API 状态
      - 检查网络连接
      - 查看最新错误日志
    tags:
      - team:payment
      - severity:high
  
  - name: "Webhook 处理失败"
    type: metric alert
    query: "avg(last_5m):sum:actionfigure.payment.webhook.count{success:false} > 0"
    message: |
      @slack-payment-alerts
      Webhook 处理出现失败，请检查：
      - 签名验证
      - 数据库连接
      - 业务逻辑错误
  
  - name: "支付处理时间过长"
    type: metric alert
    query: "avg(last_15m):avg:actionfigure.payment.payment.processing_time{operation:checkout} > 30000"
    message: |
      @team-backend
      支付处理时间超过30秒，可能影响用户体验
      检查外部 API 响应时间
    
  - name: "数据库连接异常"
    type: log alert
    query: "logs(\"service:actionfigure-payment database connection failed\").index(\"payment\").rollup(\"count\").last(\"5m\") > 0"
    message: |
      @pagerduty-database-team
      数据库连接出现问题，支付功能可能受影响
```

### 4.2 PagerDuty 集成

```typescript
// src/lib/alerting.ts
import axios from 'axios';

export class AlertManager {
  private static pagerdutyIntegrationKey = process.env.PAGERDUTY_INTEGRATION_KEY;
  
  static async triggerAlert(severity: 'critical' | 'error' | 'warning', data: {
    summary: string;
    source: string;
    component: string;
    details?: any;
  }) {
    if (!this.pagerdutyIntegrationKey) {
      console.warn('PagerDuty integration key not configured');
      return;
    }
    
    const payload = {
      routing_key: this.pagerdutyIntegrationKey,
      event_action: 'trigger',
      dedup_key: `${data.component}-${Date.now()}`,
      payload: {
        summary: data.summary,
        source: data.source,
        severity: severity,
        component: data.component,
        group: 'payment-system',
        class: 'payment-failure',
        custom_details: data.details
      }
    };
    
    try {
      await axios.post('https://events.pagerduty.com/v2/enqueue', payload);
      console.log('PagerDuty alert triggered successfully');
    } catch (error) {
      console.error('Failed to trigger PagerDuty alert:', error);
    }
  }
  
  // 支付失败告警
  static async alertPaymentFailure(orderId: string, error: Error, provider: string) {
    await this.triggerAlert('critical', {
      summary: `Payment failure for order ${orderId}`,
      source: 'payment-system',
      component: 'checkout',
      details: {
        order_id: orderId,
        provider: provider,
        error_message: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
  
  // Webhook 失败告警
  static async alertWebhookFailure(eventId: string, error: Error) {
    await this.triggerAlert('error', {
      summary: `Webhook processing failure for event ${eventId}`,
      source: 'webhook-handler',
      component: 'creem-webhook',
      details: {
        event_id: eventId,
        error_message: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
}
```

## 5. 日志聚合和搜索

### 5.1 ELK Stack 配置

```yaml
# docker-compose.yml (ELK Stack)
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.10.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
      
  logstash:
    image: docker.elastic.co/logstash/logstash:8.10.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch
      
  kibana:
    image: docker.elastic.co/kibana/kibana:8.10.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200

volumes:
  elasticsearch_data:
```

### 5.2 Logstash 配置

```ruby
# logstash/pipeline/payment.conf
input {
  file {
    path => "/var/log/actionfigure/payment-*.log"
    start_position => "beginning"
    codec => "json"
    tags => ["payment"]
  }
  
  file {
    path => "/var/log/actionfigure/webhook-*.log"
    start_position => "beginning"
    codec => "json"
    tags => ["webhook"]
  }
}

filter {
  if "payment" in [tags] {
    mutate {
      add_field => { "log_type" => "payment" }
    }
  }
  
  if "webhook" in [tags] {
    mutate {
      add_field => { "log_type" => "webhook" }
    }
  }
  
  # 解析时间戳
  date {
    match => [ "timestamp", "ISO8601" ]
    target => "@timestamp"
  }
  
  # 添加地理位置信息（如果有 IP）
  if [ip_address] and [ip_address] != "unknown" {
    geoip {
      source => "ip_address"
      target => "geoip"
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "actionfigure-payment-%{+YYYY.MM.dd}"
  }
  
  # 调试输出
  stdout {
    codec => rubydebug
  }
}
```

### 5.3 Kibana 仪表板

```json
{
  "dashboard": {
    "title": "支付系统日志分析",
    "panels": [
      {
        "title": "支付事件时间线",
        "type": "histogram",
        "query": {
          "match": {
            "event": "payment.*"
          }
        }
      },
      {
        "title": "错误日志分布",
        "type": "pie",
        "query": {
          "match": {
            "level": "error"
          }
        }
      },
      {
        "title": "地理分布",
        "type": "map",
        "query": {
          "exists": {
            "field": "geoip"
          }
        }
      }
    ]
  }
}
```

## 6. 性能监控

### 6.1 APM 集成 (DataDog APM)

```typescript
// src/lib/apm.ts
import tracer from 'dd-trace';

// 初始化 DataDog APM
tracer.init({
  service: 'actionfigure-payment',
  env: process.env.NODE_ENV,
  version: process.env.npm_package_version,
  logInjection: true,
  runtimeMetrics: true
});

export { tracer };

// 支付操作追踪
export function tracePaymentOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const span = tracer.startSpan(`payment.${operationName}`, {
    tags: {
      'payment.operation': operationName,
      ...metadata
    }
  });
  
  return operation()
    .then((result) => {
      span.setTag('operation.success', true);
      return result;
    })
    .catch((error) => {
      span.setTag('operation.success', false);
      span.setTag('error.message', error.message);
      throw error;
    })
    .finally(() => {
      span.finish();
    });
}
```

### 6.2 数据库查询监控

```typescript
// src/lib/db-monitor.ts
import { PaymentMetrics } from './metrics';

export function withQueryMonitoring<T>(
  queryName: string,
  query: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  return query()
    .then((result) => {
      const duration = Date.now() - startTime;
      PaymentMetrics.recordProcessingTime(duration, `db.${queryName}`);
      return result;
    })
    .catch((error) => {
      const duration = Date.now() - startTime;
      PaymentMetrics.recordProcessingTime(duration, `db.${queryName}.error`);
      throw error;
    });
}

// 使用示例
export async function getOrderById(orderId: string) {
  return withQueryMonitoring('getOrder', async () => {
    return await db.orders.findUnique({
      where: { id: orderId }
    });
  });
}
```

## 7. 安全监控

### 7.1 安全事件检测

```typescript
// src/lib/security-monitor.ts
import { paymentLogger } from './logger';
import { AlertManager } from './alerting';

export class SecurityMonitor {
  // 检测可疑的 Webhook 请求
  static async detectSuspiciousWebhook(req: Request) {
    const userIP = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // IP 白名单检查
    const allowedIPs = process.env.CREEM_WEBHOOK_IPS?.split(',') || [];
    if (!allowedIPs.includes(userIP)) {
      paymentLogger.warn('Webhook request from unauthorized IP', {
        event: 'security.unauthorized_webhook',
        ip_address: userIP,
        user_agent: userAgent,
        timestamp: new Date().toISOString()
      });
      
      await AlertManager.triggerAlert('warning', {
        summary: `Unauthorized webhook request from IP ${userIP}`,
        source: 'security-monitor',
        component: 'webhook-security',
        details: { ip: userIP, userAgent }
      });
    }
  }
  
  // 检测异常支付模式
  static async detectAnomalousPayment(data: {
    userId: string;
    amount: number;
    frequency: number;
  }) {
    // 单笔金额异常检测
    if (data.amount > 10000) {
      paymentLogger.warn('Large payment amount detected', {
        event: 'security.large_payment',
        user_id: data.userId,
        amount: data.amount,
        timestamp: new Date().toISOString()
      });
    }
    
    // 频繁支付检测
    if (data.frequency > 10) {
      paymentLogger.warn('High frequency payments detected', {
        event: 'security.high_frequency_payment',
        user_id: data.userId,
        payment_count: data.frequency,
        timestamp: new Date().toISOString()
      });
    }
  }
}
```

## 8. 监控配置部署脚本

### 8.1 监控初始化脚本

```bash
#!/bin/bash
# scripts/setup-monitoring.sh

echo "🚀 设置生产环境监控系统..."

# 创建日志目录
mkdir -p logs
chmod 755 logs

# 安装监控依赖
echo "📦 安装监控依赖..."
npm install winston winston-daily-rotate-file node-statsd dd-trace

# 配置日志轮转
echo "⚙️ 配置日志轮转..."
sudo tee /etc/logrotate.d/actionfigure-payment << EOF
/var/log/actionfigure/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
EOF

# 设置 DataDog Agent
echo "📊 配置 DataDog Agent..."
if [ ! -f /etc/datadog-agent/datadog.yaml ]; then
    sudo cp /etc/datadog-agent/datadog.yaml.example /etc/datadog-agent/datadog.yaml
    sudo sed -i "s/api_key:.*/api_key: ${DD_API_KEY}/" /etc/datadog-agent/datadog.yaml
    sudo systemctl restart datadog-agent
fi

# 创建健康检查端点
echo "🏥 创建健康检查端点..."
mkdir -p src/app/api/health
cat > src/app/api/health/route.ts << 'EOF'
import { NextRequest } from 'next/server';
import { respData, respErr } from '@/lib/resp';
import { PaymentMetrics } from '@/lib/metrics';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 检查数据库连接
    // await checkDatabaseConnection();
    
    // 检查外部服务
    // await checkCreemAPIConnection();
    
    const responseTime = Date.now() - startTime;
    PaymentMetrics.recordHealthCheck('payment-system', 'healthy', responseTime);
    
    return respData({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      response_time: responseTime
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    PaymentMetrics.recordHealthCheck('payment-system', 'unhealthy', responseTime);
    
    return respErr('Health check failed: ' + error.message);
  }
}
EOF

echo "✅ 监控系统设置完成!"
echo ""
echo "下一步："
echo "1. 配置 DataDog API Key: DD_API_KEY=your_key"
echo "2. 配置 PagerDuty 集成: PAGERDUTY_INTEGRATION_KEY=your_key"
echo "3. 设置告警规则"
echo "4. 测试健康检查: curl https://yourdomain.com/api/health"
```

## 9. 监控检查清单

### 9.1 部署前检查

```bash
#!/bin/bash
# scripts/monitoring-checklist.sh

echo "🔍 监控系统检查清单"
echo "===================="

# 检查环境变量
check_env_var() {
    if [[ -z "${!1}" ]]; then
        echo "❌ 缺少环境变量: $1"
        return 1
    else
        echo "✅ $1 已配置"
        return 0
    fi
}

echo "📋 检查监控配置..."
check_env_var "DD_API_KEY"
check_env_var "PAGERDUTY_INTEGRATION_KEY"
check_env_var "LOG_LEVEL"

echo ""
echo "📊 检查监控服务..."

# 检查 DataDog Agent
if systemctl is-active --quiet datadog-agent; then
    echo "✅ DataDog Agent 运行正常"
else
    echo "❌ DataDog Agent 未运行"
fi

# 检查日志目录权限
if [ -w "logs/" ]; then
    echo "✅ 日志目录可写"
else
    echo "❌ 日志目录权限问题"
fi

echo ""
echo "🏥 检查健康检查端点..."
if curl -f -s https://yourdomain.com/api/health > /dev/null; then
    echo "✅ 健康检查端点正常"
else
    echo "❌ 健康检查端点无响应"
fi

echo ""
echo "📱 检查告警配置..."
# 这里可以添加更多告警配置检查

echo ""
echo "检查完成! 请修复所有 ❌ 项目后再部署。"
```

通过这个全面的监控和日志配置，您可以确保 Creem 支付系统在生产环境中的高可用性和问题的快速发现与解决。