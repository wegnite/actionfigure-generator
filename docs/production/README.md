# Creem 支付系统生产环境部署指南

## 📋 概述

本指南提供了 Action Figure AI Generator 项目中 Creem 支付集成的完整生产环境部署方案，确保支付系统的安全性、可靠性和高性能运行。

## 🎯 部署目标

- **安全性**: 确保所有支付数据和用户信息的安全传输和存储
- **可靠性**: 达到 99.9% 的支付系统可用性
- **性能**: 支付响应时间 < 2秒，Webhook 处理时间 < 1秒
- **可扩展性**: 支持高并发支付处理和水平扩展
- **监控性**: 全面的监控、日志记录和告警机制

## 📁 文档结构

```
docs/production/
├── README.md                              # 主部署指南 (本文件)
├── creem-webhook-configuration.md         # Webhook 配置详细指南
├── monitoring-logging-setup.md           # 监控和日志系统配置
├── pre-deployment-validation-checklist.md # 上线前完整验证清单
└── creem-troubleshooting-manual.md       # 故障排查手册

scripts/
└── payment-health-check.js               # 支付系统健康检查脚本

.env.production.template                   # 生产环境配置模板
```

## 🚀 快速开始

### 1. 环境准备

```bash
# 1. 克隆项目并安装依赖
git clone <repository-url>
cd actionfigure-generator
pnpm install

# 2. 复制生产环境配置模板
cp .env.production.template .env.production

# 3. 配置生产环境变量
nano .env.production
```

### 2. 配置生产环境变量

参考 [`.env.production.template`](../../.env.production.template) 文件，配置以下关键变量：

```bash
# Creem 支付配置 (必需)
CREEM_API_KEY="your_production_api_key"
CREEM_ENV="prod"
CREEM_WEBHOOK_SECRET="your_webhook_secret"
CREEM_PRODUCTS='{"creator":"prod_xxx","professional":"prod_yyy","enterprise":"prod_zzz"}'

# 数据库配置
DATABASE_URL="postgresql://..."

# 域名和 URL
NEXT_PUBLIC_WEB_URL="https://yourdomain.com"
```

### 3. 运行健康检查

```bash
# 检查所有配置是否正确
node scripts/payment-health-check.js

# 如果所有检查都通过，可以进行部署
```

## 🔧 详细部署步骤

### Step 1: 基础设施准备

1. **服务器配置**
   - 确保 SSL 证书已配置
   - 防火墙规则允许 HTTPS 流量
   - 配置负载均衡器（如需要）

2. **数据库准备**
   - 运行数据库迁移
   - 配置连接池
   - 设置备份策略

3. **环境变量配置**
   - 使用 `.env.production.template` 作为模板
   - 确保所有密钥都是生产环境专用的

### Step 2: Webhook 配置

详细配置步骤请参考：[Webhook 配置指南](./creem-webhook-configuration.md)

1. **在 Creem 控制台中配置 Webhook**
   ```
   URL: https://yourdomain.com/api/pay/notify/creem
   事件: checkout.session.completed, payment.payment_intent.succeeded
   签名秘钥: [从环境变量获取]
   ```

2. **验证 Webhook 端点**
   ```bash
   curl -X POST https://yourdomain.com/api/pay/notify/creem \
     -H "Content-Type: application/json" \
     -H "creem-signature: test_signature" \
     -d '{"test": "connectivity"}'
   ```

### Step 3: 监控和日志配置

详细配置步骤请参考：[监控和日志配置指南](./monitoring-logging-setup.md)

1. **配置监控系统**
   - DataDog/Grafana 仪表板
   - 关键指标收集
   - 告警规则设置

2. **配置日志系统**
   - 结构化日志记录
   - 日志轮转和归档
   - 错误追踪集成

### Step 4: 部署验证

详细验证步骤请参考：[上线前验证清单](./pre-deployment-validation-checklist.md)

1. **运行完整验证**
   ```bash
   # 运行所有检查
   npm run validation:production
   
   # 或者逐项检查
   node scripts/payment-health-check.js
   npm run test:integration:production
   npm run security:scan
   ```

2. **性能测试**
   ```bash
   # 负载测试
   npm run test:load
   
   # 并发支付测试
   npm run test:concurrent-payments
   ```

## 📊 监控和告警

### 关键监控指标

| 指标类别 | 指标名称 | 正常范围 | 告警阈值 |
|----------|----------|----------|----------|
| 可用性 | 支付成功率 | > 95% | < 90% |
| 性能 | 支付响应时间 | < 2秒 | > 5秒 |
| 性能 | Webhook 处理时间 | < 1秒 | > 3秒 |
| 错误 | 错误率 | < 5% | > 10% |
| 资源 | CPU 使用率 | < 70% | > 85% |
| 资源 | 内存使用率 | < 80% | > 90% |

### 告警配置

```yaml
alerts:
  - name: "支付失败率过高"
    condition: "payment_failure_rate > 10%"
    severity: "critical"
    notification: "pagerduty + slack"
  
  - name: "Webhook 处理异常"
    condition: "webhook_error_count > 5 in 5min"
    severity: "high"
    notification: "slack"
```

## 🔍 故障排查

如果遇到问题，请按以下顺序进行排查：

### 1. 快速诊断

```bash
# 运行健康检查
node scripts/payment-health-check.js

# 查看最新错误日志
tail -f logs/payment-error-$(date +%Y-%m-%d).log

# 检查系统资源
free -h && df -h
```

### 2. 常见问题及解决方案

详细故障排查步骤请参考：[故障排查手册](./creem-troubleshooting-manual.md)

| 问题类型 | 常见原因 | 快速解决方案 |
|----------|----------|--------------|
| 支付创建失败 | API 密钥错误 | 检查 `CREEM_API_KEY` |
| Webhook 处理失败 | 签名验证失败 | 检查 `CREEM_WEBHOOK_SECRET` |
| 订单状态不同步 | 网络问题 | 运行状态同步脚本 |
| 性能下降 | 数据库连接池满 | 重启应用服务 |

### 3. 紧急联系

- **P0 故障**: 立即联系技术总监
- **P1 故障**: 联系技术主管和值班工程师
- **P2 故障**: 联系开发团队

## 🛠️ 维护和更新

### 日常维护清单

```bash
# 每日检查 (自动化)
0 9 * * * /path/to/scripts/daily-health-check.sh

# 每周检查
- 审查错误日志和告警
- 检查支付数据一致性
- 更新监控仪表板

# 每月检查
- 性能趋势分析
- 安全扫描更新
- 容量规划评估
```

### 更新流程

1. **准备阶段**
   - 在测试环境验证更新
   - 准备回滚计划
   - 通知相关团队

2. **部署阶段**
   - 使用蓝绿部署或金丝雀发布
   - 实时监控关键指标
   - 准备紧急回滚

3. **验证阶段**
   - 运行冒烟测试
   - 检查支付流程
   - 确认监控正常

## 📈 性能优化

### 数据库优化

```sql
-- 创建必要的索引
CREATE INDEX CONCURRENTLY idx_orders_status_created_at 
ON orders(status, created_at) WHERE status IN ('created', 'paid');

CREATE INDEX CONCURRENTLY idx_credits_user_uuid_type 
ON credits(user_uuid, type);

-- 定期清理旧数据
DELETE FROM sessions WHERE expires_at < NOW() - INTERVAL '7 days';
```

### 应用优化

```javascript
// 连接池优化
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 60000,
});

// 缓存优化
const redis = new Redis({
  host: process.env.REDIS_HOST,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100
});
```

## 🔐 安全最佳实践

### 1. 环境变量安全

```bash
# 使用强密码生成器
openssl rand -base64 32  # 生成 AUTH_SECRET
openssl rand -base64 24  # 生成 WEBHOOK_SECRET

# 定期轮换密钥
# - 每90天轮换 API 密钥
# - 每180天轮换 Webhook 密钥
```

### 2. 网络安全

```nginx
# Nginx 安全配置
location /api/pay/notify/creem {
    # IP 白名单
    allow 52.89.214.238;
    allow 34.212.75.30;
    allow 54.218.53.128;
    deny all;
    
    # 速率限制
    limit_req zone=webhook burst=10 nodelay;
    
    proxy_pass http://localhost:3000;
}
```

### 3. 数据保护

- 所有敏感数据传输使用 HTTPS
- 数据库连接使用 SSL
- 定期备份并加密存储
- 遵守 GDPR 和相关法规

## 📚 参考资料

### 官方文档

- [Creem API 文档](https://docs.creem.io)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Supabase 生产环境配置](https://supabase.com/docs/guides/hosting/production)

### 监控工具

- [DataDog APM 集成](https://docs.datadoghq.com/apm/)
- [Grafana 仪表板配置](https://grafana.com/docs/)
- [PagerDuty 告警配置](https://support.pagerduty.com/)

### 安全工具

- [OWASP ZAP 安全扫描](https://owasp.org/www-project-zap/)
- [npm audit 依赖检查](https://docs.npmjs.com/cli/v8/commands/npm-audit)

## 🎉 部署成功确认

完成部署后，请确认以下项目：

- [ ] 支付流程端到端测试通过
- [ ] Webhook 处理正常工作
- [ ] 监控和告警系统运行正常
- [ ] 健康检查脚本定期运行
- [ ] 错误日志级别适当
- [ ] 备份策略已实施
- [ ] 团队成员熟悉故障响应流程
- [ ] 文档已更新到最新版本

## 📞 支持联系

如需技术支持，请联系：

- **技术团队**: dev-team@yourdomain.com
- **运维团队**: ops@yourdomain.com
- **紧急联系**: 通过 PagerDuty 或 Slack #payment-alerts

---

**最后更新**: 2025年9月4日
**文档版本**: v1.0.0
**维护者**: 技术团队

> 🚀 祝您部署顺利！如有任何问题，请及时联系技术团队。