---
title: Google Analytics (GA4) 集成指南
description: 本项目的Google Analytics GA4完整集成文档
---

# Google Analytics (GA4) 集成指南

本项目已完成Google Analytics GA4的完整集成，遵循Next.js最佳实践和GDPR隐私要求。

## 📋 集成概览

### 已配置组件
- ✅ Google Analytics组件 (`src/components/analytics/google-analytics.tsx`)
- ✅ 统一Analytics组件 (`src/components/analytics/index.tsx`)
- ✅ 分析工具函数库 (`src/lib/analytics.ts`)
- ✅ 环境变量配置
- ✅ 根Layout集成

### Google Analytics ID
```
G-B10KKVENLG
```

## 🚀 快速开始

### 1. 环境变量配置

已在以下文件中配置GA ID：

**`.env.local` (开发环境)**
```bash
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-B10KKVENLG"
```

**`.env.production` (生产环境)**
```bash
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-B10KKVENLG"
```

### 2. 组件集成

Analytics组件已集成在根layout中：

```tsx
// src/app/layout.tsx
import Analytics from "@/components/analytics";

export default async function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Analytics /> {/* 已集成 */}
        {children}
      </body>
    </html>
  );
}
```

## 📊 功能特性

### 自动跟踪
- ✅ 页面浏览 (Page Views)
- ✅ 滚动深度 (Scroll Depth)
- ✅ 外链点击 (Outbound Links)
- ✅ 站内搜索 (Site Search)
- ✅ Core Web Vitals 指标

### 隐私合规
- ✅ 匿名IP跟踪 (`anonymize_ip: true`)
- ✅ 禁用广告个性化 (`allow_ad_personalization_signals: false`)
- ✅ 遵循Do Not Track设置
- ✅ GDPR同意管理
- ✅ 本地存储同意状态

### 环境控制
- ✅ 仅在生产环境加载GA脚本
- ✅ 开发环境显示调试信息
- ✅ 环境变量验证

## 🛠️ 使用方法

### 基础事件跟踪

```tsx
import analytics from "@/lib/analytics";

// 跟踪页面浏览
analytics.pageView({
  page_title: "角色生成页面",
  content_group: "ai_generation"
});

// 跟踪AI生成事件
analytics.aiGeneration("character", "FLUX.1-schnell");

// 跟踪用户注册
analytics.userSignup("google");

// 跟踪购买转化
analytics.purchase(19, "USD", "Creator Plan");

// 跟踪按钮点击
analytics.buttonClick("generate_character", "hero_section");

// 跟踪错误
analytics.error("API调用失败", "ai_generation");
```

### 自定义事件

```tsx
analytics.custom({
  action: "video_generation_start",
  category: "ai_generation",
  label: "kling_v1.5",
  value: 1,
  custom_parameters: {
    model_type: "video",
    duration_seconds: 5,
    style: "anime"
  }
});
```

### 设置用户属性

```tsx
analytics.setUser({
  user_type: "premium",
  subscription_plan: "creator",
  registration_method: "google"
});
```

## 📈 跟踪的关键指标

### 转化事件
- `generate_character` - 角色生成完成
- `video_generate` - 视频生成完成
- `user_signup` - 用户注册
- `purchase_credits` - 付费转化

### 用户交互
- 按钮点击
- 表单提交
- 功能使用
- 错误发生

### 页面指标
- 页面浏览量
- 跳出率
- 会话时长
- Core Web Vitals (CLS, FCP, LCP)

## 🔧 验证集成

### 1. 开发环境验证
```bash
# 启动开发服务器
pnpm dev

# 在浏览器控制台查看日志
# 应该看到: "🔍 分析工具已禁用 - 开发环境模式"
```

### 2. 生产环境验证
```bash
# 构建并启动生产版本
pnpm build
pnpm start

# 检查Network面板是否加载了Google Analytics脚本
# 应该看到对 googletagmanager.com 的请求
```

### 3. 使用Google Analytics调试器

1. 安装[Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)扩展
2. 访问生产站点并启用调试器
3. 检查控制台是否显示GA事件

### 4. 使用GA4实时报告

1. 访问[Google Analytics](https://analytics.google.com)
2. 选择属性 G-B10KKVENLG
3. 查看实时报告验证数据接收

## 🔒 隐私设置

### 默认同意配置
```javascript
gtag('consent', 'default', {
  'analytics_storage': 'granted',     // 分析存储：允许
  'ad_storage': 'denied',            // 广告存储：拒绝
  'personalization_storage': 'denied', // 个性化存储：拒绝
  'functionality_storage': 'granted',   // 功能存储：允许
  'security_storage': 'granted'         // 安全存储：允许
});
```

### GA4配置参数
```javascript
gtag('config', 'G-B10KKVENLG', {
  anonymize_ip: true,                    // 匿名化IP
  allow_google_signals: false,           // 禁用Google信号
  allow_ad_personalization_signals: false, // 禁用广告个性化
  send_page_view: true,                  // 自动发送页面浏览
});
```

## 📱 移动端优化

- ✅ 响应式跟踪
- ✅ 触摸事件支持
- ✅ 移动端性能优化
- ✅ 离线时延迟发送

## 🚨 故障排查

### GA不加载
1. 检查环境变量是否正确设置
2. 确认在生产环境（非开发环境）
3. 检查网络连接和防火墙设置

### 事件不发送
1. 确保GA脚本已加载 (`window.gtag` 存在)
2. 检查控制台错误信息
3. 验证事件参数格式正确

### 数据延迟
- GA4实时报告：几分钟内出现
- 标准报告：24-48小时处理时间

## 📚 相关资源

- [Google Analytics 4 文档](https://developers.google.com/analytics/devguides/collection/ga4)
- [Next.js Third Parties](https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries)
- [GDPR合规指南](https://developers.google.com/analytics/devguides/collection/ga4/consent)

## 🔄 未来改进

### 计划中的功能
- [ ] Cookie横幅集成
- [ ] 用户同意管理界面
- [ ] A/B测试集成
- [ ] 增强型电子商务跟踪
- [ ] 自定义维度配置

### 性能优化
- [ ] 条件加载（基于用户位置）
- [ ] 离线事件缓存
- [ ] 批量事件发送

---

**配置完成时间:** 2025-01-30  
**GA4 Property ID:** G-B10KKVENLG  
**集成状态:** ✅ 完整集成，生产就绪