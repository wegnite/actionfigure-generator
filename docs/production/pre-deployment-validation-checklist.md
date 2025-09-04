# 生产环境部署前验证清单

## 概述

本清单确保 Action Figure AI Generator 的 Creem 支付集成在生产环境部署前完成所有必要的验证步骤，保证系统的安全性、可靠性和性能。

## 🔧 1. 环境配置验证

### 1.1 环境变量配置

```bash
# 运行环境变量检查脚本
./scripts/check-env-vars.sh

# 手动检查清单
```

**必需环境变量：**

- [ ] `NEXT_PUBLIC_WEB_URL` - 生产域名 (https://yourdomain.com)
- [ ] `DATABASE_URL` - 生产数据库连接字符串
- [ ] `AUTH_SECRET` - 新生成的认证密钥（不同于开发环境）
- [ ] `CREEM_API_KEY` - 生产环境 Creem API 密钥
- [ ] `CREEM_ENV` - 设置为 "prod"
- [ ] `CREEM_WEBHOOK_SECRET` - 生产 Webhook 密钥
- [ ] `CREEM_PRODUCTS` - 生产产品映射 JSON
- [ ] `STRIPE_PUBLIC_KEY` - 生产 Stripe 公钥（如双支付）
- [ ] `STRIPE_PRIVATE_KEY` - 生产 Stripe 私钥（如双支付）
- [ ] `STRIPE_WEBHOOK_SECRET` - 生产 Stripe Webhook 密钥

**安全配置：**

- [ ] `NODE_ENV="production"`
- [ ] `ADMIN_EMAILS` - 管理员邮箱列表
- [ ] `CORS_ORIGINS` - 允许的跨域源
- [ ] `WEBHOOK_RATE_LIMIT` - Webhook 速率限制
- [ ] `CREEM_WEBHOOK_IPS` - Creem IP 白名单

### 1.2 密钥安全验证

```bash
#!/bin/bash
# scripts/check-env-vars.sh

echo "🔐 检查环境变量安全性..."

# 检查是否使用了生产环境密钥
check_production_keys() {
    local test_patterns=("test_" "sk_test_" "pk_test_" "dev_" "localhost")
    local issues=0
    
    for pattern in "${test_patterns[@]}"; do
        if env | grep -i "$pattern"; then
            echo "❌ 发现测试环境密钥: $pattern"
            ((issues++))
        fi
    done
    
    if [ $issues -eq 0 ]; then
        echo "✅ 未发现测试环境密钥"
    fi
    
    return $issues
}

# 检查密钥长度
check_key_lengths() {
    if [ ${#AUTH_SECRET} -lt 32 ]; then
        echo "❌ AUTH_SECRET 长度不足（建议32字符以上）"
        return 1
    fi
    
    if [ ${#CREEM_WEBHOOK_SECRET} -lt 24 ]; then
        echo "❌ CREEM_WEBHOOK_SECRET 长度不足（建议24字符以上）"
        return 1
    fi
    
    echo "✅ 密钥长度检查通过"
    return 0
}

check_production_keys
check_key_lengths
```

**验证项目：**

- [ ] 所有密钥都是为生产环境新生成的
- [ ] 没有使用测试环境密钥 (test_, dev_, localhost 等)
- [ ] `AUTH_SECRET` 至少 32 字符
- [ ] `CREEM_WEBHOOK_SECRET` 至少 24 字符
- [ ] 密钥已安全存储在环境变量中
- [ ] 不同环境使用不同的密钥

## 🏗️ 2. 基础设施验证

### 2.1 数据库准备

```sql
-- 运行生产数据库检查
-- scripts/check-database.sql

-- 检查必需表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'users', 'orders', 'credits', 
    'apikeys', 'feedback', 'affiliates'
  );

-- 检查索引
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN ('orders', 'users', 'credits');

-- 检查约束
SELECT conname, contype, conrelid::regclass 
FROM pg_constraint 
WHERE contype IN ('p', 'f', 'u');
```

**数据库验证清单：**

- [ ] 数据库连接正常（SSL 连接）
- [ ] 所有必需表已创建
- [ ] 外键约束正确设置
- [ ] 索引已优化配置
- [ ] 数据库用户权限最小化
- [ ] 备份策略已配置
- [ ] 连接池设置合理

### 2.2 服务器配置

```bash
# 服务器健康检查
./scripts/server-health-check.sh
```

**服务器验证清单：**

- [ ] SSL 证书有效且自动更新
- [ ] 防火墙规则正确配置
- [ ] 负载均衡器配置就绪
- [ ] CDN 配置完成
- [ ] 域名 DNS 解析正确
- [ ] 服务器时间同步
- [ ] 磁盘空间充足
- [ ] 内存和 CPU 资源合理

## 💳 3. 支付系统验证

### 3.1 Creem 集成验证

```bash
# 运行支付系统健康检查
node scripts/payment-health-check.js

# 或使用测试脚本
npm run test:payment-production
```

**Creem 配置验证：**

- [ ] Creem 控制台配置完成
- [ ] 产品映射配置正确
- [ ] Webhook URL 配置正确
- [ ] 签名验证密钥匹配
- [ ] IP 白名单配置完成
- [ ] 支付方式配置完整
- [ ] 税务设置正确配置

### 3.2 支付流程测试

```javascript
// scripts/test-payment-flow.js
const PaymentFlowTester = require('./payment-flow-tester');

async function testProductionPaymentFlow() {
  const tester = new PaymentFlowTester({
    baseUrl: process.env.NEXT_PUBLIC_WEB_URL,
    environment: 'production'
  });
  
  // 测试创建支付会话
  await tester.testCheckoutCreation();
  
  // 测试 Webhook 处理
  await tester.testWebhookProcessing();
  
  // 测试错误处理
  await tester.testErrorScenarios();
}
```

**支付流程验证清单：**

- [ ] 支付会话创建成功
- [ ] 支付金额计算正确
- [ ] 订单状态更新正常
- [ ] 积分发放功能正常
- [ ] 邮件通知发送正常
- [ ] 错误处理机制工作
- [ ] 重复支付防护有效
- [ ] 退款流程可用

### 3.3 Webhook 安全验证

```bash
# Webhook 安全测试
./scripts/test-webhook-security.sh
```

**Webhook 安全清单：**

- [ ] 签名验证正确实现
- [ ] IP 白名单限制生效
- [ ] HTTPS 强制使用
- [ ] 速率限制配置正确
- [ ] 幂等性处理正常
- [ ] 错误日志记录完整
- [ ] 超时处理合理
- [ ] 重试机制工作

## 🔍 4. 安全验证

### 4.1 应用安全扫描

```bash
# 运行安全扫描
npm audit --production
npm run security:scan

# OWASP ZAP 扫描
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://yourdomain.com
```

**安全验证清单：**

- [ ] 依赖包漏洞扫描通过
- [ ] SQL 注入防护测试通过
- [ ] XSS 攻击防护测试通过
- [ ] CSRF 保护机制启用
- [ ] 输入验证实现完整
- [ ] 输出编码正确处理
- [ ] 敏感数据加密存储
- [ ] 会话管理安全配置

### 4.2 数据保护验证

```bash
# 数据保护检查
./scripts/check-data-protection.sh
```

**数据保护清单：**

- [ ] 个人信息处理合规
- [ ] 数据传输加密 (TLS 1.3)
- [ ] 数据库访问控制
- [ ] 日志敏感信息脱敏
- [ ] 数据备份加密
- [ ] 数据清理策略实施
- [ ] GDPR 合规检查
- [ ] 数据访问审计启用

## 📊 5. 性能和可扩展性验证

### 5.1 性能测试

```bash
# 负载测试
artillery run --target https://yourdomain.com \
  performance-tests/payment-flow.yml

# 内存泄漏检查
node --inspect scripts/memory-leak-test.js
```

**性能指标验证：**

- [ ] 页面加载时间 < 3 秒
- [ ] API 响应时间 < 500ms
- [ ] Webhook 处理时间 < 2 秒
- [ ] 数据库查询优化
- [ ] 内存使用稳定
- [ ] CPU 使用率合理
- [ ] 并发处理能力满足需求
- [ ] 缓存策略有效

### 5.2 可扩展性测试

```javascript
// scripts/scalability-test.js
async function testScalability() {
  // 模拟并发支付请求
  const concurrentPayments = 50;
  const promises = Array.from({ length: concurrentPayments }, () =>
    simulatePaymentFlow()
  );
  
  const results = await Promise.allSettled(promises);
  const successRate = results.filter(r => r.status === 'fulfilled').length / concurrentPayments;
  
  console.log(`并发支付成功率: ${successRate * 100}%`);
}
```

**可扩展性验证清单：**

- [ ] 水平扩展配置就绪
- [ ] 数据库连接池配置
- [ ] 缓存层配置完成
- [ ] 静态资源 CDN 部署
- [ ] 微服务通信优化
- [ ] 队列处理系统就绪
- [ ] 自动扩容策略配置
- [ ] 容错机制实现

## 📈 6. 监控和告警验证

### 6.1 监控系统配置

```bash
# 监控系统健康检查
./scripts/check-monitoring.sh
```

**监控配置清单：**

- [ ] DataDog/Grafana 配置完成
- [ ] 关键指标收集正常
- [ ] 仪表板配置完整
- [ ] 日志聚合系统运行
- [ ] APM 追踪配置正确
- [ ] 错误追踪系统启用
- [ ] 用户行为分析配置
- [ ] 业务指标监控启用

### 6.2 告警系统验证

```yaml
# 告警规则测试配置
test_alerts:
  - name: "支付失败率测试"
    condition: "payment_failure_rate > 1%"
    expected: "应触发告警"
  
  - name: "Webhook 延迟测试"
    condition: "webhook_processing_time > 5s"
    expected: "应发送通知"
    
  - name: "数据库连接测试"
    condition: "database_connection_failed"
    expected: "应立即告警"
```

**告警验证清单：**

- [ ] 告警规则配置正确
- [ ] 告警阈值设置合理
- [ ] 通知渠道配置完成
- [ ] 告警优先级分级
- [ ] 告警静默机制配置
- [ ] 升级策略实施
- [ ] 告警测试通过
- [ ] 值班制度建立

## 🧪 7. 端到端测试验证

### 7.1 用户流程测试

```bash
# 自动化端到端测试
npm run test:e2e:production
```

**用户流程验证清单：**

- [ ] 用户注册登录流程
- [ ] 产品浏览和选择
- [ ] 支付流程完整测试
- [ ] 订单确认和通知
- [ ] 积分系统功能
- [ ] 用户界面响应式
- [ ] 多语言功能正常
- [ ] 客户服务流程

### 7.2 边界情况测试

```javascript
// scripts/edge-case-tests.js
const edgeCaseTests = [
  {
    name: '网络中断恢复',
    test: () => testNetworkInterruption(),
  },
  {
    name: '大额支付处理',
    test: () => testLargePayment(50000),
  },
  {
    name: '并发支付冲突',
    test: () => testConcurrentPayments(),
  },
  {
    name: '恶意请求防护',
    test: () => testMaliciousRequests(),
  }
];
```

**边界情况验证清单：**

- [ ] 网络异常恢复机制
- [ ] 高峰期负载处理
- [ ] 异常数据处理
- [ ] 恶意请求防护
- [ ] 服务降级策略
- [ ] 数据一致性保证
- [ ] 事务回滚机制
- [ ] 错误恢复流程

## 📋 8. 法规和合规验证

### 8.1 支付合规检查

```bash
# 合规性检查
./scripts/compliance-check.sh
```

**合规验证清单：**

- [ ] PCI DSS 合规要求
- [ ] 反洗钱 (AML) 检查
- [ ] 知己客户 (KYC) 流程
- [ ] GDPR 数据保护
- [ ] 消费者保护法规
- [ ] 税务合规配置
- [ ] 地区法规遵循
- [ ] 行业标准符合

### 8.2 审计准备

**审计准备清单：**

- [ ] 访问日志完整记录
- [ ] 数据变更审计追踪
- [ ] 系统配置文档化
- [ ] 安全策略文档完整
- [ ] 应急预案文档化
- [ ] 人员权限记录
- [ ] 第三方集成文档
- [ ] 风险评估报告

## 🚀 9. 部署流程验证

### 9.1 CI/CD 管道测试

```yaml
# .github/workflows/production-deployment.yml
name: Production Deployment Validation
on:
  workflow_dispatch:
  
jobs:
  pre-deployment-checks:
    runs-on: ubuntu-latest
    steps:
      - name: Environment Validation
        run: ./scripts/validate-production-env.sh
        
      - name: Security Scan
        run: npm run security:scan
        
      - name: Performance Tests
        run: npm run test:performance
        
      - name: Integration Tests
        run: npm run test:integration:production
```

**部署流程清单：**

- [ ] CI/CD 管道配置正确
- [ ] 自动化测试通过
- [ ] 代码质量检查通过
- [ ] 安全扫描通过
- [ ] 数据库迁移脚本准备
- [ ] 回滚计划制定
- [ ] 蓝绿部署策略
- [ ] 金丝雀发布配置

### 9.2 发布准备

```bash
# 发布准备检查清单
./scripts/release-readiness-check.sh
```

**发布准备清单：**

- [ ] 发布计划文档完成
- [ ] 团队角色分工明确
- [ ] 通讯计划建立
- [ ] 回滚触发条件定义
- [ ] 监控增强配置
- [ ] 客服团队培训完成
- [ ] 用户通知计划
- [ ] 营销活动协调

## ✅ 10. 最终验证

### 10.1 生产环境冒烟测试

```bash
#!/bin/bash
# 生产环境冒烟测试
echo "🔥 开始生产环境冒烟测试..."

# 基础功能测试
curl -f https://yourdomain.com/api/health || exit 1
echo "✅ 健康检查通过"

# 支付系统测试
node scripts/payment-health-check.js || exit 1
echo "✅ 支付系统检查通过"

# 数据库连接测试
node scripts/db-connection-test.js || exit 1
echo "✅ 数据库连接通过"

echo "🎉 冒烟测试全部通过!"
```

**最终验证清单：**

- [ ] 所有检查项目通过
- [ ] 性能指标达标
- [ ] 安全要求满足
- [ ] 监控告警正常
- [ ] 团队准备就绪
- [ ] 文档资料完整
- [ ] 应急预案就位
- [ ] 发布授权获得

### 10.2 上线决策

**上线决策标准：**

- [ ] 所有 P0/P1 问题已解决
- [ ] 关键功能测试通过率 100%
- [ ] 性能指标满足 SLA 要求
- [ ] 安全风险评估通过
- [ ] 业务方确认准备就绪
- [ ] 技术团队签字确认
- [ ] 应急响应团队就位

## 📚 附录：验证脚本

### A.1 完整验证脚本

```bash
#!/bin/bash
# scripts/full-production-validation.sh

echo "🚀 开始完整的生产环境验证..."

# 设置严格的错误处理
set -euo pipefail

# 检查环境变量
./scripts/check-env-vars.sh

# 检查数据库
./scripts/check-database.sh

# 运行支付系统健康检查
node scripts/payment-health-check.js

# 运行安全扫描
npm run security:scan

# 运行性能测试
npm run test:performance

# 运行端到端测试
npm run test:e2e:production

# 检查监控系统
./scripts/check-monitoring.sh

# 生成验证报告
node scripts/generate-validation-report.js

echo "✅ 生产环境验证完成!"
echo "📊 查看详细报告: validation-report.html"
```

### A.2 持续验证

```bash
# crontab 配置 - 每小时运行一次
0 * * * * /path/to/scripts/payment-health-check.js > /var/log/health-check.log 2>&1

# 每日深度检查
0 2 * * * /path/to/scripts/full-production-validation.sh > /var/log/daily-validation.log 2>&1
```

---

## 🎯 总结

这个验证清单确保了 Creem 支付集成在生产环境中的：

1. **安全性** - 全面的安全配置和测试
2. **可靠性** - 完整的错误处理和恢复机制  
3. **性能** - 优化的响应时间和处理能力
4. **监控** - 全面的监控和告警系统
5. **合规性** - 满足法规和行业标准

**重要提醒：**
- 严格按照清单逐项检查
- 所有 P0/P1 问题必须解决
- 保留验证记录用于审计
- 定期更新清单内容

完成所有验证项目后，您的支付系统即可安全地部署到生产环境！