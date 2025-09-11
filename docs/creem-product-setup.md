---
title: Creem 产品配置指南
description: Action Figure Generator 在 Creem 支付平台的产品配置文档
---

# Creem 产品配置指南

## 概述

本文档记录了 Action Figure Generator 在 Creem 支付平台上的生产环境产品配置。

## 当前生产环境产品 ID（已配置）

- **Creator Plan**: `prod_6Bwu1hiaUqZuXoaKSPGnfW` ($19/月)
- **Professional Plan**: `prod_PkcdhVfiehpffsGiT4CtJ` ($49/月)
- **Enterprise Plan**: `prod_5x8C4UcfsoJMIOFi1j3AH4` ($199/月)

**状态**: ⚠️ 产品 ID 已配置但需要在 Creem Dashboard 中验证产品是否已正确创建

## 产品配置建议

根据你的 Action Figure Generator 项目，建议创建以下三个产品：

### 1. Creator 产品配置

**Product Details:**
- **Name**: `Action Figure Creator Plan`
- **Return URL**: `https://actionfigure-generator.com/my-orders` (支付成功后跳转)
- **Description**: 
```
AI Action Figure Creator Plan - Professional quality figure generation with commercial rights.
- 100 premium action figures per month
- HD quality generation (5840x2160)
- 50+ exclusive character styles
- Advanced pose and expression control
- No watermarks or branding
- Priority 5x faster generation
- 24/7 priority support
- Custom style training (coming soon)
- Bulk download & organizer tools
- Commercial license included
```

**Payment Details:**
- **Payment Type**: `Subscription` (订阅制)
- **Currency**: `USD` (或根据你的主要市场选择)
- **Pricing**: `$19.00` (月付)
- **Tax Category**: `Digital goods or services`
- **Tax Behavior**: `Price includes tax` (勾选)

**Product Image:**
- 上传一个展示 AI 生成动作人偶的高质量图片
- 建议尺寸: 1200x800px
- 突出显示"Creator"等级的特色功能

### 2. Professional 产品配置

**Product Details:**
- **Name**: `Action Figure Professional Plan`
- **Return URL**: `https://actionfigure-generator.com/my-orders`
- **Description**:
```
AI Action Figure Professional Plan - Advanced features for serious creators.
- 500 premium action figures per month
- 4K Ultra HD quality generation
- Unlimited character styles
- Advanced AI controls & fine-tuning
- Priority generation queue
- API access for developers
- Batch processing tools
- White-label licensing options
- Premium support & training
- Commercial usage rights included
```

**Payment Details:**
- **Payment Type**: `Subscription`
- **Currency**: `USD`
- **Pricing**: `$49.00`
- **Tax Category**: `Digital goods or services`
- **Tax Behavior**: `Price includes tax`

### 3. Enterprise 产品配置

**Product Details:**
- **Name**: `Action Figure Enterprise Plan`
- **Return URL**: `https://actionfigure-generator.com/my-orders`
- **Description**:
```
AI Action Figure Enterprise Plan - Complete solution for businesses.
- Unlimited action figure generation
- Ultra 8K quality & custom resolutions
- White-label solution with your branding
- Custom AI model training
- Dedicated infrastructure
- 24/7 enterprise support with SLA
- Custom integrations & API
- Team management & collaboration
- Usage analytics & reporting
- Full commercial licensing
```

**Payment Details:**
- **Payment Type**: `Subscription`
- **Currency**: `USD`
- **Pricing**: `$199.00`
- **Tax Category**: `Digital goods or services`
- **Tax Behavior**: `Price includes tax`

## 环境变量配置

创建产品后，你会获得产品ID，需要在环境变量中配置：

### .env.local (开发环境)
```bash
# Creem 支付配置
CREEM_ENV=test
CREEM_API_KEY=creem_test_YOUR_TEST_API_KEY
CREEM_WEBHOOK_SECRET=whsec_YOUR_TEST_WEBHOOK_SECRET
CREEM_PRODUCTS={"creator": "prod_YOUR_CREATOR_ID", "professional": "prod_YOUR_PROFESSIONAL_ID", "enterprise": "prod_YOUR_ENTERPRISE_ID"}

# 支付回调URL
NEXT_PUBLIC_PAY_SUCCESS_URL=/my-orders
NEXT_PUBLIC_PAY_FAIL_URL=/pricing
NEXT_PUBLIC_PAY_CANCEL_URL=/pricing
```

### .env.production (生产环境)
```bash
# Creem 支付配置
CREEM_ENV=prod
CREEM_API_KEY=creem_YOUR_PRODUCTION_API_KEY
CREEM_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_WEBHOOK_SECRET
CREEM_PRODUCTS={"creator": "prod_YOUR_CREATOR_ID", "professional": "prod_YOUR_PROFESSIONAL_ID", "enterprise": "prod_YOUR_ENTERPRISE_ID"}

# 支付回调URL
NEXT_PUBLIC_PAY_SUCCESS_URL=/my-orders
NEXT_PUBLIC_PAY_FAIL_URL=/pricing
NEXT_PUBLIC_PAY_CANCEL_URL=/pricing
```

## 重要注意事项

### 1. Return URL 设置
确保所有产品的 Return URL 都指向：
- 成功: `https://actionfigure-generator.com/my-orders`
- 失败: `https://actionfigure-generator.com/pricing`
- 取消: `https://actionfigure-generator.com/pricing`

### 2. Webhook 配置
在 Creem Dashboard 中配置 Webhook URL：
- 开发环境: `http://localhost:3000/api/pay/notify/creem`
- 生产环境: `https://actionfigure-generator.com/api/pay/notify/creem`

### 3. 货币和定价
- 建议使用 USD 作为主要货币
- 价格与你现有的定价策略保持一致：
  - Creator: $19/月
  - Professional: $49/月  
  - Enterprise: $199/月

### 4. 产品状态
- 所有产品状态设置为 `Active`
- 确保产品在创建后立即可用

## 获取产品ID步骤

1. 在 Creem Dashboard 创建每个产品
2. 创建完成后，从产品列表中复制产品ID
3. 产品ID格式通常为: `prod_xxxxxxxxxxxxxxxxx`
4. 将这些ID更新到环境变量的 `CREEM_PRODUCTS` 配置中

## 测试建议

### 开发环境测试
1. 使用测试API密钥配置
2. 创建测试产品进行支付流程验证
3. 确保支付成功后正确跳转到 `/my-orders`

### 生产环境部署
1. 切换到生产API密钥
2. 使用真实产品ID
3. 进行小额测试确保支付流程完整

## 支持的支付方式

根据 Creem 平台，你的产品将支持：
- 信用卡/借记卡
- PayPal
- Apple Pay
- Google Pay
- 微信支付 (如果启用)
- 支付宝 (如果启用)

## 后续步骤

1. 在 Creem 中创建三个产品
2. 获取产品ID并更新环境变量
3. 测试支付流程
4. 部署到生产环境
5. 监控支付成功率和用户转化

---

创建完产品后，请将获得的产品ID提供给我，我将帮你更新环境变量配置。