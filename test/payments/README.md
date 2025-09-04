# Creem 支付集成测试

本目录包含 Creem 支付系统的完整测试套件，确保支付流程的可靠性和安全性。

## 测试文件结构

```
test/payments/
├── creem-payment.test.ts      # Creem API 核心功能测试
├── README.md                  # 测试说明文档
```

```
test/api/
├── checkout-creem.test.ts     # 支付创建 API 测试
├── webhook-creem.test.ts      # Webhook 处理测试
```

## 测试覆盖范围

### 1. Creem API 核心功能测试 (`creem-payment.test.ts`)
- ✅ Creem Checkout 会话创建
- ✅ 客户信息获取
- ✅ Webhook 签名验证 (HMAC SHA256)
- ✅ 环境配置验证
- ✅ 错误处理和异常情况
- ✅ 数据格式验证
- ✅ 支付流程集成测试

### 2. 支付创建 API 测试 (`checkout-creem.test.ts`)
- ✅ 成功支付创建流程
- ✅ 参数验证和价格检查
- ✅ 用户认证和权限验证
- ✅ 产品映射和配置
- ✅ 多语言和多货币支持
- ✅ 订单归因数据处理
- ✅ URL 生成和重定向

### 3. Webhook 处理测试 (`webhook-creem.test.ts`)
- ✅ Webhook 通知处理
- ✅ 支付回调重定向
- ✅ 签名验证安全性
- ✅ 幂等性保证
- ✅ 错误处理和日志记录
- ✅ 多语言重定向

## 运行测试

### 运行所有 Creem 相关测试
```bash
# 运行支付相关的所有测试
pnpm test test/payments test/api/checkout-creem.test.ts test/api/webhook-creem.test.ts

# 或者使用模式匹配
pnpm test -- --testPathPattern="(payments|creem)"
```

### 运行单个测试文件
```bash
# 核心功能测试
pnpm test test/payments/creem-payment.test.ts

# 支付创建测试
pnpm test test/api/checkout-creem.test.ts

# Webhook 处理测试
pnpm test test/api/webhook-creem.test.ts
```

### 运行特定测试用例
```bash
# 运行签名验证相关测试
pnpm test -- --testNamePattern="签名验证"

# 运行错误处理相关测试
pnpm test -- --testNamePattern="错误处理"
```

### 生成覆盖率报告
```bash
# 生成完整覆盖率报告
pnpm test -- --coverage test/payments test/api/checkout-creem.test.ts test/api/webhook-creem.test.ts

# 查看 HTML 覆盖率报告
open coverage/lcov-report/index.html
```

## 测试环境配置

测试需要以下环境变量（在测试中会自动设置）：

```bash
# Creem API 配置
CREEM_API_KEY=test_creem_api_key
CREEM_ENV=test
CREEM_WEBHOOK_SECRET=test_webhook_secret

# 产品映射配置
CREEM_PRODUCTS={"basic_plan":"creem_basic_123","premium_plan":"creem_premium_456"}

# 应用配置
NEXT_PUBLIC_WEB_URL=https://test.example.com
NEXT_PUBLIC_PAY_SUCCESS_URL=/pay-success
NEXT_PUBLIC_PAY_FAIL_URL=/pay-failed
PAY_PROVIDER=creem
```

## 测试数据

### 模拟 Creem API 响应
```javascript
// Checkout 创建响应
{
  id: 'checkout_test_123',
  checkout_url: 'https://checkout.creem.io/test-123',
  customer_id: 'customer_test_456',
  status: 'created'
}

// Webhook 事件
{
  type: 'checkout.completed',
  object: {
    id: 'checkout_test_123',
    status: 'completed',
    customer: { email: 'test@example.com' },
    metadata: { order_no: 'order_test_123456' }
  }
}
```

## 测试重点

### 安全性测试
1. **签名验证**: 确保所有 Webhook 请求都经过 HMAC SHA256 签名验证
2. **时间安全比较**: 防止时间攻击
3. **数据完整性**: 防止请求体篡改
4. **输入验证**: 严格验证所有输入参数

### 业务逻辑测试
1. **支付流程**: 从创建到完成的完整流程
2. **订单处理**: 状态更新和积分充值
3. **用户验证**: 认证和权限检查
4. **价格验证**: 防止价格篡改

### 错误处理测试
1. **网络错误**: API 调用失败处理
2. **数据错误**: 无效数据格式处理
3. **业务错误**: 订单状态异常处理
4. **系统错误**: 数据库操作失败处理

### 性能和可靠性测试
1. **幂等性**: 重复请求处理
2. **并发性**: 并发支付处理
3. **回滚机制**: 失败情况下的数据一致性

## 调试指南

### 查看测试日志
```bash
# 详细输出模式
pnpm test -- --verbose test/payments/creem-payment.test.ts

# 显示测试覆盖的代码行
pnpm test -- --verbose --coverage
```

### 调试特定测试
```bash
# 只运行失败的测试
pnpm test -- --onlyFailures

# 监听模式（文件变化时自动重新运行）
pnpm test -- --watch test/payments
```

### 测试失败排查

1. **签名验证失败**
   - 检查 `CREEM_WEBHOOK_SECRET` 配置
   - 验证请求体格式是否正确
   - 确保签名算法一致 (HMAC SHA256)

2. **API 调用失败**
   - 检查 `CREEM_API_KEY` 和 `CREEM_ENV` 配置
   - 验证请求 URL 和参数格式
   - 检查网络模拟是否正确设置

3. **订单处理失败**
   - 检查数据库模拟设置
   - 验证订单状态流转逻辑
   - 确保用户数据完整性

## 持续集成

这些测试应该在以下情况下运行：

1. **提交前检查**: 每次代码提交前
2. **合并请求**: Pull Request 自动测试
3. **发布前验证**: 生产部署前的完整测试
4. **定期回归**: 定期执行完整测试套件

```yaml
# GitHub Actions 示例
- name: Run Creem Payment Tests
  run: |
    pnpm test test/payments test/api/checkout-creem.test.ts test/api/webhook-creem.test.ts
    pnpm test -- --coverage --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80,"statements":80}}'
```

## 测试数据管理

### 测试数据隔离
- 每个测试用例使用独立的测试数据
- 测试前重置所有模拟状态
- 避免测试用例之间的相互影响

### 模拟数据一致性
- 保持模拟数据与实际 API 响应格式一致
- 定期更新模拟数据以反映 API 变化
- 使用类型检查确保数据结构正确

## 注意事项

1. **不要使用真实的 API 密钥**: 测试中只使用测试密钥
2. **不要调用真实 API**: 所有 API 调用都应该被模拟
3. **保持测试独立性**: 每个测试用例都应该能够独立运行
4. **及时更新测试**: API 变化时同步更新测试用例