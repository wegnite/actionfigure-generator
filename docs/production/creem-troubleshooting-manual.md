# Creem 支付系统故障排查手册

## 概述

本手册为 Action Figure AI Generator 的 Creem 支付集成提供完整的故障诊断和解决方案，帮助技术团队快速定位和解决生产环境中的支付相关问题。

## 🚨 1. 紧急故障响应流程

### 1.1 故障分级

| 级别 | 描述 | 响应时间 | 处理团队 |
|------|------|----------|----------|
| P0 - 严重 | 支付完全不可用 | 15分钟内 | 全员响应 |
| P1 - 高 | 支付成功率 < 90% | 1小时内 | 技术主管 + 开发 |
| P2 - 中 | 部分功能异常 | 4小时内 | 开发团队 |
| P3 - 低 | 性能问题或非关键功能 | 24小时内 | 日常维护 |

### 1.2 故障响应步骤

```bash
#!/bin/bash
# scripts/emergency-response.sh

echo "🚨 启动紧急故障响应流程..."

# 1. 快速健康检查
node scripts/payment-health-check.js --emergency

# 2. 收集关键信息
./scripts/collect-diagnostic-info.sh

# 3. 通知相关团队
./scripts/notify-incident-team.sh

# 4. 启动临时缓解措施
./scripts/emergency-mitigation.sh

echo "✅ 紧急响应流程启动完成"
```

**标准响应流程：**

1. **立即评估** - 确定故障级别和影响范围
2. **收集信息** - 运行诊断脚本收集关键数据
3. **通知团队** - 根据级别通知相应人员
4. **临时缓解** - 实施临时解决方案减少影响
5. **根因分析** - 深入调查故障原因
6. **永久修复** - 实施长期解决方案
7. **总结改进** - 更新文档和预防措施

## 🔍 2. 常见故障场景及解决方案

### 2.1 支付创建失败

**症状表现：**
- 用户无法创建支付会话
- 返回错误："checkout failed: create creem session failed"
- Webhook 未收到支付事件

**诊断步骤：**

```bash
# 1. 检查 Creem API 连接
curl -H "x-api-key: $CREEM_API_KEY" \
  -H "Content-Type: application/json" \
  https://api.creem.io/v1/products

# 2. 检查产品配置
echo "CREEM_PRODUCTS: $CREEM_PRODUCTS" | jq .

# 3. 查看最近的错误日志
tail -n 100 logs/payment-error-$(date +%Y-%m-%d).log | grep -i "checkout"

# 4. 测试支付创建
node scripts/test-checkout-creation.js
```

**常见原因及解决方案：**

| 原因 | 解决方案 |
|------|----------|
| API 密钥无效 | 1. 检查 `CREEM_API_KEY` 是否正确<br>2. 验证 API 密钥在 Creem 控制台中是否有效<br>3. 检查是否使用了正确环境的密钥 |
| 产品映射错误 | 1. 验证 `CREEM_PRODUCTS` JSON 格式<br>2. 确认产品 ID 在 Creem 中存在<br>3. 检查产品状态是否为活跃 |
| 网络连接问题 | 1. 检查服务器到 Creem API 的网络连通性<br>2. 验证 DNS 解析是否正常<br>3. 检查防火墙设置 |
| 请求格式错误 | 1. 检查请求参数格式<br>2. 验证必需字段是否完整<br>3. 检查数据类型匹配 |

### 2.2 Webhook 处理失败

**症状表现：**
- 支付成功但订单状态未更新
- Webhook 返回 500 错误
- 日志中出现签名验证失败

**诊断步骤：**

```bash
# 1. 检查 Webhook 端点状态
curl -X POST https://yourdomain.com/api/pay/notify/creem \
  -H "Content-Type: application/json" \
  -H "creem-signature: test_sig" \
  -d '{"test": "connectivity"}'

# 2. 验证签名配置
echo "CREEM_WEBHOOK_SECRET length: ${#CREEM_WEBHOOK_SECRET}"

# 3. 查看 Webhook 日志
tail -n 50 logs/webhook-$(date +%Y-%m-%d).log

# 4. 测试签名验证
node scripts/test-webhook-signature.js
```

**解决方案矩阵：**

```javascript
// scripts/diagnose-webhook.js
const diagnosticSteps = {
  signatureValidationFailed: {
    symptoms: ['Invalid signature', '签名验证失败'],
    solutions: [
      '检查 CREEM_WEBHOOK_SECRET 是否与 Creem 控制台一致',
      '验证签名算法实现是否正确 (HMAC SHA256)',
      '确认请求体编码格式匹配',
      '检查时间戳同步问题'
    ]
  },
  
  databaseConnectionFailed: {
    symptoms: ['Database connection failed', '数据库连接失败'],
    solutions: [
      '检查数据库服务器状态',
      '验证连接池配置',
      '检查网络连通性',
      '确认数据库权限'
    ]
  },
  
  businessLogicError: {
    symptoms: ['Order not found', '订单处理失败'],
    solutions: [
      '检查订单号格式和存在性',
      '验证用户权限',
      '检查业务规则配置',
      '确认数据一致性'
    ]
  }
};
```

### 2.3 支付状态同步异常

**症状表现：**
- Creem 显示支付成功，但系统中订单状态为待支付
- 用户积分未正确发放
- 支付通知邮件未发送

**诊断和修复：**

```bash
#!/bin/bash
# scripts/fix-payment-sync.sh

echo "🔄 开始修复支付状态同步异常..."

# 1. 查找异常订单
node scripts/find-sync-issues.js --days 7

# 2. 从 Creem API 获取真实状态
node scripts/reconcile-payment-status.js

# 3. 修复数据不一致
node scripts/repair-payment-data.js --confirm

# 4. 重新发放积分和通知
node scripts/retry-payment-processing.js
```

```javascript
// scripts/reconcile-payment-status.js
const creem = require('./creem-client');
const db = require('../src/db');

async function reconcilePaymentStatus() {
  console.log('🔍 开始对账...');
  
  // 获取最近7天的待处理订单
  const pendingOrders = await db.orders.findMany({
    where: {
      status: 'created',
      created_at: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    }
  });
  
  for (const order of pendingOrders) {
    try {
      // 从 Creem 获取真实状态
      const creemStatus = await creem.getPaymentStatus(order.session_id);
      
      if (creemStatus.status === 'paid' && order.status !== 'paid') {
        console.log(`🔧 修复订单 ${order.order_no}: ${order.status} -> paid`);
        
        // 更新订单状态
        await handleOrderPaid(order.order_no, creemStatus, order.user_email);
      }
    } catch (error) {
      console.error(`❌ 处理订单 ${order.order_no} 失败:`, error.message);
    }
  }
  
  console.log('✅ 对账完成');
}
```

### 2.4 高错误率问题

**症状表现：**
- 支付成功率低于正常水平 (< 90%)
- 大量用户反馈支付失败
- 监控告警触发

**根因分析流程：**

```javascript
// scripts/analyze-payment-failures.js
async function analyzePaymentFailures() {
  const timeRange = '24h';
  
  // 1. 统计错误分布
  const errorStats = await analyzeErrorDistribution(timeRange);
  console.log('错误分布:', errorStats);
  
  // 2. 分析错误模式
  const patterns = await identifyErrorPatterns(timeRange);
  console.log('错误模式:', patterns);
  
  // 3. 地理分布分析
  const geoDistribution = await analyzeGeographicDistribution(timeRange);
  console.log('地理分布:', geoDistribution);
  
  // 4. 时间趋势分析
  const timeTrends = await analyzeTimeTrends(timeRange);
  console.log('时间趋势:', timeTrends);
  
  // 5. 生成分析报告
  await generateAnalysisReport({
    errorStats,
    patterns,
    geoDistribution,
    timeTrends
  });
}
```

## 🛠️ 3. 诊断工具和脚本

### 3.1 综合诊断工具

```bash
#!/bin/bash
# scripts/comprehensive-diagnosis.sh

echo "🔍 开始全面诊断..."

# 基础环境检查
echo "=== 环境配置检查 ==="
./scripts/check-env-vars.sh

# 网络连接检查
echo "=== 网络连接检查 ==="
./scripts/test-external-connections.sh

# 数据库状态检查
echo "=== 数据库状态检查 ==="
./scripts/check-database-health.sh

# 支付系统检查
echo "=== 支付系统检查 ==="
node scripts/payment-health-check.js

# 日志分析
echo "=== 最近错误分析 ==="
./scripts/analyze-recent-errors.sh

# 性能指标检查
echo "=== 性能指标检查 ==="
./scripts/check-performance-metrics.sh

# 生成诊断报告
echo "=== 生成诊断报告 ==="
node scripts/generate-diagnosis-report.js

echo "✅ 诊断完成，查看报告: diagnosis-report-$(date +%Y%m%d-%H%M%S).html"
```

### 3.2 实时监控脚本

```javascript
// scripts/real-time-monitor.js
const WebSocket = require('ws');
const EventEmitter = require('events');

class PaymentMonitor extends EventEmitter {
  constructor() {
    super();
    this.metrics = {
      successCount: 0,
      failureCount: 0,
      lastUpdate: Date.now()
    };
  }
  
  async startMonitoring() {
    console.log('🚀 启动实时支付监控...');
    
    // 监控支付成功率
    setInterval(async () => {
      const stats = await this.getPaymentStats();
      this.checkPaymentHealth(stats);
    }, 30000); // 每30秒检查一次
    
    // 监控 Webhook 响应时间
    setInterval(async () => {
      const responseTime = await this.checkWebhookResponseTime();
      this.checkWebhookHealth(responseTime);
    }, 60000); // 每分钟检查一次
    
    // 监控系统资源
    setInterval(async () => {
      const resources = await this.getSystemResources();
      this.checkResourceHealth(resources);
    }, 120000); // 每2分钟检查一次
  }
  
  checkPaymentHealth(stats) {
    const successRate = stats.successCount / (stats.successCount + stats.failureCount);
    
    if (successRate < 0.9) {
      this.emit('alert', {
        type: 'payment_health',
        severity: 'high',
        message: `支付成功率降至 ${(successRate * 100).toFixed(2)}%`,
        stats
      });
    }
  }
}

// 启动监控
if (require.main === module) {
  const monitor = new PaymentMonitor();
  
  monitor.on('alert', (alert) => {
    console.error(`🚨 告警: ${alert.message}`);
    // 发送告警通知
    // await sendAlert(alert);
  });
  
  monitor.startMonitoring();
}
```

### 3.3 数据修复工具

```javascript
// scripts/data-repair-toolkit.js
class DataRepairToolkit {
  // 修复订单状态不一致
  async repairOrderStatusInconsistency(orderId) {
    console.log(`🔧 修复订单状态: ${orderId}`);
    
    try {
      const order = await db.orders.findUnique({
        where: { order_no: orderId }
      });
      
      if (!order) {
        throw new Error(`订单 ${orderId} 不存在`);
      }
      
      // 从 Creem API 获取真实状态
      const creemStatus = await creem.getPaymentStatus(order.session_id);
      
      if (creemStatus.status === 'paid' && order.status !== 'paid') {
        // 执行支付完成流程
        await handleOrderPaid(orderId, creemStatus, order.user_email);
        console.log(`✅ 订单 ${orderId} 状态已修复`);
      }
      
      return { success: true, message: '修复完成' };
    } catch (error) {
      console.error(`❌ 修复订单 ${orderId} 失败:`, error.message);
      return { success: false, error: error.message };
    }
  }
  
  // 重新发放积分
  async reissueCredits(userId, orderId) {
    console.log(`🪙 重新发放积分: 用户 ${userId}, 订单 ${orderId}`);
    
    try {
      const order = await db.orders.findUnique({
        where: { order_no: orderId }
      });
      
      if (!order || order.status !== 'paid') {
        throw new Error('订单状态无效');
      }
      
      // 检查是否已发放积分
      const existingCredit = await db.credits.findFirst({
        where: {
          user_uuid: userId,
          order_no: orderId,
          type: 'OrderPay'
        }
      });
      
      if (existingCredit) {
        console.log('积分已存在，跳过发放');
        return { success: true, message: '积分已存在' };
      }
      
      // 发放积分
      await addUserCredits(userId, order.credits, 'OrderPay', orderId);
      console.log(`✅ 已为用户 ${userId} 发放 ${order.credits} 积分`);
      
      return { success: true, credits: order.credits };
    } catch (error) {
      console.error(`❌ 重新发放积分失败:`, error.message);
      return { success: false, error: error.message };
    }
  }
  
  // 批量数据修复
  async batchRepair(operations) {
    console.log(`🔄 开始批量修复 ${operations.length} 项操作...`);
    
    const results = [];
    for (const operation of operations) {
      try {
        let result;
        switch (operation.type) {
          case 'order_status':
            result = await this.repairOrderStatusInconsistency(operation.orderId);
            break;
          case 'credits':
            result = await this.reissueCredits(operation.userId, operation.orderId);
            break;
          default:
            result = { success: false, error: 'Unknown operation type' };
        }
        
        results.push({ operation, result });
      } catch (error) {
        results.push({ 
          operation, 
          result: { success: false, error: error.message } 
        });
      }
    }
    
    const successCount = results.filter(r => r.result.success).length;
    console.log(`✅ 批量修复完成: ${successCount}/${operations.length} 成功`);
    
    return results;
  }
}
```

## 📊 4. 日志分析和调试

### 4.1 日志分析工具

```bash
#!/bin/bash
# scripts/analyze-logs.sh

echo "📊 开始日志分析..."

LOG_DIR="logs"
TODAY=$(date +%Y-%m-%d)

# 分析支付错误
echo "=== 支付错误分析 ==="
grep -h "payment.*failed\|error" $LOG_DIR/payment-*$TODAY*.log | \
  jq -r '.error_message' | sort | uniq -c | sort -nr

# 分析 Webhook 问题
echo "=== Webhook 问题分析 ==="
grep -h "webhook.*failed\|error" $LOG_DIR/webhook-*$TODAY*.log | \
  jq -r '{timestamp: .timestamp, error: .error_message, event_id: .event_id}'

# 响应时间统计
echo "=== 响应时间统计 ==="
grep -h "processing_time_ms" $LOG_DIR/*$TODAY*.log | \
  jq -r '.processing_time_ms' | \
  awk '{sum+=$1; n++} END {print "平均响应时间: " sum/n "ms"}'

# 错误率统计
echo "=== 错误率统计 ==="
total=$(grep -c "." $LOG_DIR/payment-*$TODAY*.log)
errors=$(grep -c "error\|failed" $LOG_DIR/payment-*$TODAY*.log)
echo "总请求数: $total"
echo "错误数量: $errors"
echo "错误率: $(echo "scale=2; $errors * 100 / $total" | bc)%"
```

### 4.2 性能分析工具

```javascript
// scripts/performance-analyzer.js
class PerformanceAnalyzer {
  async analyzePaymentPerformance(timeRange = '24h') {
    console.log(`📈 分析最近 ${timeRange} 的支付性能...`);
    
    // 查询性能数据
    const performanceData = await this.getPerformanceData(timeRange);
    
    const analysis = {
      averageResponseTime: this.calculateAverage(performanceData.responseTimes),
      p95ResponseTime: this.calculatePercentile(performanceData.responseTimes, 95),
      p99ResponseTime: this.calculatePercentile(performanceData.responseTimes, 99),
      successRate: this.calculateSuccessRate(performanceData.outcomes),
      throughput: this.calculateThroughput(performanceData.requests, timeRange),
      bottlenecks: this.identifyBottlenecks(performanceData)
    };
    
    // 生成性能报告
    await this.generatePerformanceReport(analysis);
    
    return analysis;
  }
  
  identifyBottlenecks(data) {
    const bottlenecks = [];
    
    // 数据库查询性能
    if (data.dbQueryTimes.some(t => t > 1000)) {
      bottlenecks.push({
        type: 'database',
        description: '数据库查询时间过长',
        suggestion: '优化索引或查询语句'
      });
    }
    
    // 外部 API 调用
    if (data.apiCallTimes.some(t => t > 5000)) {
      bottlenecks.push({
        type: 'external_api',
        description: 'Creem API 响应时间过长',
        suggestion: '检查网络连接或 Creem 服务状态'
      });
    }
    
    // 内存使用
    if (data.memoryUsage > 0.8) {
      bottlenecks.push({
        type: 'memory',
        description: '内存使用率过高',
        suggestion: '检查内存泄漏或增加服务器内存'
      });
    }
    
    return bottlenecks;
  }
}
```

## 🎯 5. 故障预防措施

### 5.1 预防性监控

```javascript
// scripts/preventive-monitoring.js
class PreventiveMonitoring {
  constructor() {
    this.thresholds = {
      responseTime: 2000,      // 2秒
      errorRate: 0.05,         // 5%
      memoryUsage: 0.8,        // 80%
      cpuUsage: 0.7,           // 70%
      diskSpace: 0.9           // 90%
    };
  }
  
  async startPreventiveChecks() {
    console.log('🔮 启动预防性监控...');
    
    // 每5分钟检查一次系统健康状态
    setInterval(() => {
      this.checkSystemHealth();
    }, 5 * 60 * 1000);
    
    // 每15分钟检查支付趋势
    setInterval(() => {
      this.analyzePaymentTrends();
    }, 15 * 60 * 1000);
    
    // 每30分钟预测性能问题
    setInterval(() => {
      this.predictPerformanceIssues();
    }, 30 * 60 * 1000);
  }
  
  async checkSystemHealth() {
    const health = await this.getSystemHealth();
    
    // 检查各项指标
    Object.entries(health).forEach(([metric, value]) => {
      if (value > this.thresholds[metric]) {
        this.triggerPreventiveAlert(metric, value);
      }
    });
  }
  
  async predictPerformanceIssues() {
    const trends = await this.getPerformanceTrends('6h');
    
    // 使用简单的线性回归预测
    const prediction = this.predictNextHourPerformance(trends);
    
    if (prediction.expectedErrorRate > this.thresholds.errorRate) {
      console.warn(`⚠️ 预测下一小时错误率可能达到 ${(prediction.expectedErrorRate * 100).toFixed(2)}%`);
      // 触发预防性告警
    }
  }
}
```

### 5.2 自动恢复机制

```bash
#!/bin/bash
# scripts/auto-recovery.sh

echo "🔄 启动自动恢复机制..."

# 检查服务状态并自动重启
check_and_restart_service() {
    local service_name=$1
    local check_cmd=$2
    
    if ! eval $check_cmd; then
        echo "⚠️ $service_name 异常，尝试重启..."
        systemctl restart $service_name
        sleep 10
        
        if eval $check_cmd; then
            echo "✅ $service_name 重启成功"
        else
            echo "❌ $service_name 重启失败，需要人工干预"
            # 发送紧急告警
            ./scripts/send-emergency-alert.sh "$service_name restart failed"
        fi
    fi
}

# 检查并修复数据库连接
fix_database_connections() {
    local max_connections=$(psql -t -c "SHOW max_connections;" | xargs)
    local current_connections=$(psql -t -c "SELECT count(*) FROM pg_stat_activity;" | xargs)
    
    if [ $current_connections -gt $((max_connections * 8 / 10)) ]; then
        echo "⚠️ 数据库连接数过高: $current_connections/$max_connections"
        
        # 终止长时间运行的查询
        psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '5 minutes';"
        
        echo "✅ 已清理长时间运行的数据库连接"
    fi
}

# 清理磁盘空间
cleanup_disk_space() {
    local disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ $disk_usage -gt 85 ]; then
        echo "⚠️ 磁盘使用率过高: ${disk_usage}%"
        
        # 清理旧日志文件
        find logs/ -name "*.log" -mtime +7 -delete
        
        # 清理临时文件
        find /tmp -name "creem_*" -mtime +1 -delete
        
        echo "✅ 已清理磁盘空间"
    fi
}

# 主恢复流程
main_recovery() {
    # 检查应用服务
    check_and_restart_service "actionfigure-app" "curl -f http://localhost:3000/api/health"
    
    # 检查数据库
    check_and_restart_service "postgresql" "pg_isready"
    
    # 修复数据库连接
    fix_database_connections
    
    # 清理磁盘空间
    cleanup_disk_space
    
    # 运行健康检查
    node scripts/payment-health-check.js --auto-fix
}

# 设置定时执行
if [ "$1" = "--daemon" ]; then
    while true; do
        main_recovery
        sleep 300  # 每5分钟检查一次
    done
else
    main_recovery
fi
```

## 📞 6. 升级和联系指南

### 6.1 升级矩阵

| 问题类型 | 初始联系 | 升级时间 | 升级对象 |
|----------|----------|----------|----------|
| 支付完全不可用 | 开发团队 | 15分钟 | 技术总监 |
| 支付成功率 < 50% | 值班工程师 | 30分钟 | 技术主管 |
| Webhook 大量失败 | 系统管理员 | 1小时 | 开发团队负责人 |
| 性能严重下降 | 运维团队 | 2小时 | 技术主管 |
| 数据不一致 | 数据库管理员 | 4小时 | 架构师 |

### 6.2 联系方式配置

```bash
# scripts/emergency-contacts.sh

CONTACTS='{
  "dev_team": {
    "slack": "#payment-alerts",
    "pagerduty": "payment-team-escalation",
    "email": "dev-team@yourdomain.com"
  },
  "tech_lead": {
    "phone": "+86-xxx-xxxx-xxxx",
    "email": "tech-lead@yourdomain.com",
    "wechat": "tech_lead_wx"
  },
  "ops_team": {
    "slack": "#ops-alerts", 
    "email": "ops@yourdomain.com"
  }
}'

# 发送紧急告警
send_emergency_alert() {
    local severity=$1
    local message=$2
    
    case $severity in
        "critical")
            # 立即通知所有人
            curl -X POST $SLACK_WEBHOOK -d "{\"text\":\"🚨 CRITICAL: $message\"}"
            curl -X POST $PAGERDUTY_API -d "{\"incident_key\":\"payment-critical\", \"description\":\"$message\"}"
            ;;
        "high")
            # 通知技术团队
            curl -X POST $SLACK_WEBHOOK -d "{\"text\":\"⚠️ HIGH: $message\"}"
            ;;
        "medium")
            # 记录到日志
            echo "[$(date)] MEDIUM: $message" >> alerts.log
            ;;
    esac
}
```

## 📋 7. 故障处理记录模板

### 7.1 事故报告模板

```markdown
# 支付系统故障报告

## 基本信息
- **故障 ID**: INC-YYYY-MM-DD-XXX
- **发生时间**: YYYY-MM-DD HH:MM:SS UTC
- **发现时间**: YYYY-MM-DD HH:MM:SS UTC
- **影响时长**: X 小时 Y 分钟
- **故障级别**: P0/P1/P2/P3
- **影响范围**: 描述受影响的功能和用户

## 故障症状
- [ ] 支付创建失败
- [ ] Webhook 处理异常
- [ ] 支付状态同步错误
- [ ] 性能严重下降
- [ ] 其他：_______

## 影响评估
- **受影响用户数**: 约 X 人
- **失败支付数量**: X 笔
- **预估损失**: $X.XX
- **用户投诉数**: X 条

## 根因分析
### 直接原因
[描述导致故障的直接技术原因]

### 根本原因
[描述系统性问题或流程缺陷]

### 贡献因素
- 因素1：描述
- 因素2：描述

## 解决方案
### 临时缓解措施
1. 措施1：描述和执行时间
2. 措施2：描述和执行时间

### 永久修复方案
1. 修复1：描述、负责人、完成时间
2. 修复2：描述、负责人、完成时间

## 预防措施
1. 监控改进：具体措施
2. 流程优化：具体措施
3. 技术改进：具体措施
4. 培训计划：具体内容

## 经验教训
[总结从此次故障中学到的经验教训]

## 后续行动项
- [ ] 行动项1 - 负责人 - 截止日期
- [ ] 行动项2 - 负责人 - 截止日期

## 审核批准
- 技术负责人：姓名 - 日期
- 产品负责人：姓名 - 日期
```

### 7.2 故障处理清单

```yaml
# incident-response-checklist.yml
incident_response_phases:
  detection:
    - name: "确认故障"
      description: "通过监控告警或用户反馈确认故障存在"
      responsible: "值班工程师"
      max_time: "5分钟"
    
    - name: "评估影响"
      description: "快速评估故障级别和影响范围"
      responsible: "值班工程师"
      max_time: "10分钟"
  
  response:
    - name: "启动响应流程"
      description: "根据故障级别启动相应的响应流程"
      responsible: "值班工程师"
      max_time: "5分钟"
      
    - name: "组建处理团队"
      description: "通知相关人员组建故障处理团队"
      responsible: "技术主管"
      max_time: "15分钟"
  
  mitigation:
    - name: "实施临时缓解措施"
      description: "快速实施措施减少故障影响"
      responsible: "处理团队"
      max_time: "30分钟"
      
    - name: "验证缓解效果"
      description: "确认临时措施有效减少了故障影响"
      responsible: "处理团队"
      max_time: "10分钟"
  
  resolution:
    - name: "根因分析"
      description: "深入分析故障的根本原因"
      responsible: "技术专家"
      
    - name: "实施永久修复"
      description: "根据根因分析实施永久性修复方案"
      responsible: "开发团队"
      
    - name: "验证修复效果"
      description: "确认永久修复方案有效解决问题"
      responsible: "测试团队"
  
  recovery:
    - name: "服务恢复"
      description: "确认所有受影响的服务完全恢复正常"
      responsible: "运维团队"
      
    - name: "通知用户"
      description: "向用户通报故障已解决"
      responsible: "客服团队"
  
  post_incident:
    - name: "编写故障报告"
      description: "详细记录故障处理过程和经验教训"
      responsible: "技术主管"
      deadline: "24小时内"
      
    - name: "改进措施跟进"
      description: "确保所有改进措施按计划实施"
      responsible: "项目经理"
      deadline: "30天内"
```

## 🔧 8. 快速修复命令集

```bash
# 常用故障修复命令快速参考

# 重启应用服务
sudo systemctl restart actionfigure-app

# 清理数据库连接
psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction' AND query_start < now() - interval '10 minutes';"

# 清理 Redis 缓存
redis-cli FLUSHDB

# 检查 Creem API 连通性
curl -H "x-api-key: $CREEM_API_KEY" https://api.creem.io/v1/products

# 手动同步支付状态
node scripts/reconcile-payment-status.js --order-id ORDER_ID

# 重新发放积分
node scripts/reissue-credits.js --user-id USER_ID --order-id ORDER_ID

# 清理磁盘空间
find logs/ -name "*.log" -mtime +7 -delete

# 检查系统资源
free -h && df -h && top -bn1 | head -20

# 查看最新错误
tail -f logs/payment-error-$(date +%Y-%m-%d).log

# 测试 Webhook 端点
curl -X POST https://yourdomain.com/api/pay/notify/creem -H "Content-Type: application/json" -d '{"test":"health"}'
```

---

通过这个全面的故障排查手册，技术团队可以快速诊断和解决 Creem 支付系统的各种问题，确保生产环境的稳定运行和用户体验的持续优化。