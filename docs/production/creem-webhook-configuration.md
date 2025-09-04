# Creem Webhook 配置指南

## 概述

本指南详细说明如何在生产环境中正确配置 Creem 支付系统的 Webhook，确保支付通知的安全性、可靠性和性能。

## 1. Webhook 端点配置

### 1.1 生产环境 Webhook URL

```
https://yourdomain.com/api/pay/notify/creem
```

### 1.2 Creem 控制台配置步骤

1. **登录 Creem 控制台**
   - 访问：https://dashboard.creem.io
   - 使用生产环境账户登录

2. **配置 Webhook 端点**
   ```bash
   # Webhook 配置
   URL: https://yourdomain.com/api/pay/notify/creem
   方法: POST
   内容类型: application/json
   超时: 30 秒
   重试: 3 次
   ```

3. **事件订阅**
   选择以下事件类型：
   ```
   ✅ checkout.session.completed
   ✅ checkout.session.expired
   ✅ payment.payment_intent.succeeded
   ✅ payment.payment_intent.payment_failed
   ✅ subscription.created
   ✅ subscription.updated
   ✅ subscription.deleted
   ```

## 2. 安全配置

### 2.1 Webhook 签名验证

生产环境必须启用并正确配置签名验证：

```typescript
// 签名验证配置
const webhookSecret = process.env.CREEM_WEBHOOK_SECRET; // 从 Creem 控制台获取
const signature = req.headers.get("creem-signature");

// HMAC SHA256 验证
const expectedSig = crypto
  .createHmac("sha256", webhookSecret)
  .update(body)
  .digest("hex");

if (signature !== expectedSig) {
  throw new Error("Invalid signature");
}
```

### 2.2 生成 Webhook Secret

```bash
# 生成安全的 Webhook Secret (推荐 32 字符以上)
openssl rand -base64 32
```

### 2.3 IP 白名单配置

配置防火墙或 CDN 只允许来自 Creem 的 IP 访问：

```
# Creem 生产环境 IP 地址 (示例，请从官方获取最新)
52.89.214.238
34.212.75.30
54.218.53.128
```

## 3. Webhook 处理逻辑

### 3.1 核心处理流程

```typescript
// /src/app/api/pay/notify/creem/route.ts
export async function POST(req: Request) {
  try {
    // 1. 签名验证
    await verifyWebhookSignature(req);
    
    // 2. 解析事件数据
    const event = await parseWebhookEvent(req);
    
    // 3. 幂等性检查
    if (await isEventProcessed(event.id)) {
      return respOk(); // 已处理过
    }
    
    // 4. 业务逻辑处理
    await processPaymentEvent(event);
    
    // 5. 标记事件已处理
    await markEventProcessed(event.id);
    
    return respOk();
  } catch (error) {
    // 记录错误并返回适当状态码
    console.error("Webhook processing failed:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### 3.2 幂等性处理

```typescript
// 防止重复处理同一事件
const processedEvents = new Set();

async function isEventProcessed(eventId: string): Promise<boolean> {
  // 检查数据库或缓存
  const processed = await redis.get(`creem_event:${eventId}`);
  return !!processed;
}

async function markEventProcessed(eventId: string): Promise<void> {
  // 标记为已处理 (TTL 24小时)
  await redis.setex(`creem_event:${eventId}`, 86400, 'processed');
}
```

## 4. 错误处理和重试机制

### 4.1 错误分类处理

```typescript
class WebhookError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly retryable: boolean = false
  ) {
    super(message);
  }
}

// 处理不同类型的错误
function handleWebhookError(error: unknown): Response {
  if (error instanceof WebhookError) {
    return Response.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }
  
  // 未知错误，返回 500 触发重试
  return Response.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

### 4.2 Creem 重试策略

Creem 会对失败的 Webhook 进行重试：

```
重试间隔: 2, 4, 8, 16, 32 秒
最大重试: 5 次
超时时间: 30 秒
```

对于以下 HTTP 状态码会进行重试：
- `500` Internal Server Error
- `502` Bad Gateway  
- `503` Service Unavailable
- `504` Gateway Timeout

## 5. 监控和日志

### 5.1 Webhook 监控指标

```typescript
// 关键指标监控
const webhookMetrics = {
  totalRequests: 0,
  successRequests: 0,
  failedRequests: 0,
  averageProcessingTime: 0,
  signatureVerificationFailures: 0,
  duplicateEvents: 0,
};

// 记录指标
function recordWebhookMetrics(event: string, duration: number, success: boolean) {
  webhookMetrics.totalRequests++;
  
  if (success) {
    webhookMetrics.successRequests++;
  } else {
    webhookMetrics.failedRequests++;
  }
  
  // 发送到监控系统 (DataDog, CloudWatch 等)
  sendMetrics('webhook.creem', {
    event_type: event,
    duration: duration,
    success: success
  });
}
```

### 5.2 结构化日志记录

```typescript
// 使用结构化日志
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'webhook.log' }),
    new winston.transports.Console()
  ]
});

// Webhook 事件日志
logger.info('Webhook received', {
  event_id: event.id,
  event_type: event.type,
  customer_email: event.customer?.email,
  amount: event.amount,
  processing_time: duration,
  ip_address: getClientIP(req),
  timestamp: new Date().toISOString()
});
```

## 6. 测试和验证

### 6.1 Webhook 端点测试

```bash
# 测试 Webhook 端点可访问性
curl -X POST https://yourdomain.com/api/pay/notify/creem \
  -H "Content-Type: application/json" \
  -H "creem-signature: test_signature" \
  -d '{"test": "webhook_test"}'

# 预期响应: 500 (签名验证失败)
```

### 6.2 签名验证测试

```typescript
// 测试签名生成
function testWebhookSignature() {
  const secret = "test_webhook_secret";
  const body = JSON.stringify({ test: "data" });
  
  const signature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
    
  console.log("Test signature:", signature);
  return signature;
}
```

### 6.3 生产环境验证清单

```
✅ Webhook URL 可正常访问
✅ 签名验证正常工作
✅ SSL/TLS 证书有效
✅ 防火墙规则正确配置
✅ 日志记录功能正常
✅ 监控指标收集正常
✅ 错误处理机制工作
✅ 幂等性检查有效
✅ 数据库连接稳定
✅ 缓存系统可用
```

## 7. 性能优化

### 7.1 数据库连接优化

```typescript
// 使用连接池
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10, // 最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 60000,
});
```

### 7.2 异步处理

```typescript
// 对于耗时操作，使用队列异步处理
import Queue from 'bull';

const webhookQueue = new Queue('webhook processing', {
  redis: process.env.REDIS_URL
});

// 快速响应，异步处理
export async function POST(req: Request) {
  try {
    await verifyWebhookSignature(req);
    const event = await parseWebhookEvent(req);
    
    // 添加到处理队列
    await webhookQueue.add('process-payment', event);
    
    // 立即返回成功
    return respOk();
  } catch (error) {
    return handleWebhookError(error);
  }
}
```

## 8. 安全最佳实践

### 8.1 访问控制

```nginx
# Nginx 配置示例
location /api/pay/notify/creem {
    # IP 白名单
    allow 52.89.214.238;
    allow 34.212.75.30;
    allow 54.218.53.128;
    deny all;
    
    # 速率限制
    limit_req zone=webhook burst=10 nodelay;
    
    # 请求体大小限制
    client_max_body_size 1m;
    
    proxy_pass http://localhost:3000;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

### 8.2 请求验证

```typescript
// 严格的请求验证
function validateWebhookRequest(req: Request): void {
  // 检查 Content-Type
  const contentType = req.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new WebhookError('Invalid content type', 400);
  }
  
  // 检查请求方法
  if (req.method !== 'POST') {
    throw new WebhookError('Method not allowed', 405);
  }
  
  // 检查 User-Agent
  const userAgent = req.headers.get('user-agent');
  if (!userAgent?.includes('Creem-Webhook')) {
    throw new WebhookError('Invalid user agent', 403);
  }
}
```

## 9. 故障恢复

### 9.1 失败事件处理

```typescript
// 处理失败的 Webhook 事件
class FailedWebhookHandler {
  async handleFailedEvent(event: any, error: Error): Promise<void> {
    // 记录失败事件
    await this.logFailedEvent(event, error);
    
    // 尝试恢复处理
    if (this.isRecoverable(error)) {
      await this.scheduleRetry(event);
    } else {
      await this.sendAlert(event, error);
    }
  }
  
  private async scheduleRetry(event: any): Promise<void> {
    // 添加到重试队列
    await retryQueue.add('retry-webhook', event, {
      delay: 60000, // 1分钟后重试
      attempts: 3,
      backoff: 'exponential'
    });
  }
}
```

### 9.2 数据一致性检查

```typescript
// 定期检查支付状态一致性
async function reconcilePayments(): Promise<void> {
  const pendingOrders = await getPendingOrders();
  
  for (const order of pendingOrders) {
    try {
      // 从 Creem API 获取最新状态
      const creemStatus = await creem.getPaymentStatus(order.session_id);
      
      // 比较状态并修复不一致
      if (creemStatus.status !== order.status) {
        await updateOrderStatus(order.id, creemStatus.status);
        logger.info('Order status reconciled', {
          order_id: order.id,
          old_status: order.status,
          new_status: creemStatus.status
        });
      }
    } catch (error) {
      logger.error('Failed to reconcile order', {
        order_id: order.id,
        error: error.message
      });
    }
  }
}

// 每小时运行一次对账
setInterval(reconcilePayments, 60 * 60 * 1000);
```

## 10. 部署检查清单

### 10.1 配置检查

```bash
# 检查环境变量
echo "Checking Creem configuration..."

# 必需的环境变量
required_vars=(
  "CREEM_API_KEY"
  "CREEM_ENV"
  "CREEM_WEBHOOK_SECRET"
  "CREEM_PRODUCTS"
)

for var in "${required_vars[@]}"; do
  if [[ -z "${!var}" ]]; then
    echo "❌ Missing required variable: $var"
    exit 1
  else
    echo "✅ $var is set"
  fi
done

echo "All Creem configuration variables are set!"
```

### 10.2 连接测试

```bash
#!/bin/bash
# test-webhook-connectivity.sh

# 测试 Webhook 端点
echo "Testing webhook endpoint..."

response=$(curl -s -w "%{http_code}" -X POST \
  https://yourdomain.com/api/pay/notify/creem \
  -H "Content-Type: application/json" \
  -d '{"test":"connectivity"}')

if [[ "$response" == "500" ]]; then
  echo "✅ Webhook endpoint is accessible (expected 500 for invalid signature)"
else
  echo "❌ Unexpected response: $response"
  exit 1
fi

echo "Webhook connectivity test passed!"
```

这个配置指南提供了完整的 Creem Webhook 生产环境配置方案，确保支付系统的安全性、可靠性和高性能运行。