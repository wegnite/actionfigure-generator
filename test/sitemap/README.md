# Sitemap 404 诊断工具包

## 📋 概述

这个工具包用于诊断和修复Next.js项目中的sitemap 404问题，特别是针对使用`next-intl`进行国际化的项目。

## 🛠 工具列表

### 1. `analyze_sitemap.js` - Sitemap分析器
**用途**: 静态分析sitemap配置与实际页面文件的匹配情况

**功能**:
- 模拟sitemap.ts生成URL列表
- 扫描src/app目录下的实际页面文件
- 对比分析，识别不匹配的URL
- 生成详细的诊断报告

**使用方法**:
```bash
node test/sitemap/analyze_sitemap.js
```

**输出文件**:
- `sitemap_404_diagnosis.json` - 详细的分析报告

### 2. `url_validator.js` - URL验证器
**用途**: 启动本地服务器，实际测试所有sitemap URL的HTTP状态

**功能**:
- 自动启动开发服务器
- 批量测试所有URL的HTTP状态码
- 识别404、重定向和其他错误
- 生成详细的测试报告

**使用方法**:
```bash
node test/sitemap/url_validator.js
```

**注意**:
- 会自动启动`pnpm dev`服务器
- 测试完成后自动关闭服务器
- 需要确保3000端口可用

**输出文件**:
- `url_validation_report.json` - 详细的测试报告

### 3. `quick_test.js` - 快速诊断
**用途**: 无需启动服务器的快速状态检查

**功能**:
- 检查关键配置文件是否存在
- 快速分析sitemap配置问题
- 提供修复检查清单
- 生成修复建议

**使用方法**:
```bash
node test/sitemap/quick_test.js
```

## 📊 诊断报告解读

### 分析报告结构

```json
{
  "summary": {
    "totalUrls": 37,
    "matched": 28,
    "missing": 9,
    "successRate": "75.7%"
  },
  "actualPages": [...],  // 实际存在的页面文件
  "missingPages": [...], // sitemap中但文件不存在的页面
  "problems": [...],     // 具体的问题URL
  "recommendations": [...] // 修复建议
}
```

### 常见问题类型

1. **英文默认URL匹配问题**
   - 现象: `/pricing` 无法匹配到 `/[locale]/pricing`
   - 原因: `localePrefix: "as-needed"` 配置下的路由处理
   - 解决: 修复middleware或sitemap配置

2. **多语言URL配置错误**
   - 现象: `/zh/pricing` 返回404
   - 原因: 页面文件不存在或路由配置错误
   - 解决: 检查[locale]路由下的页面文件

3. **Tutorial页面路由问题**
   - 现象: SEO教程页面访问404
   - 原因: 路由结构与sitemap生成不匹配
   - 解决: 调整sitemap配置或页面文件位置

## 🔧 修复流程

### 步骤1: 快速诊断
```bash
node test/sitemap/quick_test.js
```
获取当前问题概览和修复清单

### 步骤2: 详细分析
```bash
node test/sitemap/analyze_sitemap.js
```
深入分析具体的匹配问题

### 步骤3: 修复配置
根据分析报告修复以下文件:
- `src/app/sitemap.ts` - sitemap生成逻辑
- `src/middleware.ts` - 路由中间件配置
- `src/i18n/locale.ts` - 国际化配置

### 步骤4: 验证修复
```bash
node test/sitemap/url_validator.js
```
启动服务器实际测试所有URL

### 步骤5: 确认结果
检查验证报告，确保成功率达到100%

## 🐛 常见错误排查

### 错误: "服务器启动失败"
- 检查是否已有进程占用3000端口
- 尝试手动启动 `pnpm dev` 检查错误信息
- 确保项目依赖已正确安装

### 错误: "No such file or directory"
- 检查是否在项目根目录运行脚本
- 确保相对路径正确

### 错误: "fetch is not defined"
- 确保Node.js版本 >= 18
- 或安装node-fetch依赖

## 📈 预期结果

修复完成后应达到:
- **成功率**: 100% (37/37 URLs)
- **404错误**: 0个
- **重定向**: 符合预期的重定向策略
- **英文默认URL**: `/pricing`, `/character-figure` 等正常访问
- **多语言URL**: `/zh/pricing`, `/ja/showcase` 等正常访问
- **Tutorial页面**: 所有SEO教程页面正常访问

## 📝 修复记录

### 当前状态 (2025-09-01)
- 总URL数: 37
- 成功匹配: 28 (75.7%)
- 主要问题: 英文默认URL路由配置
- 需要修复: sitemap生成逻辑或middleware配置

### 修复计划
1. ✅ 创建诊断工具
2. ✅ 识别具体问题
3. ⏳ 修复sitemap配置
4. ⏳ 验证修复效果
5. ⏳ 部署到生产环境

## 🔗 相关文档

- [详细诊断报告](../../content/docs/development/sitemap-404-diagnosis-report.md)
- [Next.js App Router文档](https://nextjs.org/docs/app)
- [next-intl配置指南](https://next-intl-docs.vercel.app/)