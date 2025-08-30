# 测试文件说明

## 目录结构

```
test/
├── url-validation/          # URL验证测试
│   ├── test_local_urls.js   # 本地开发服务器URL测试
│   ├── test_working_urls.js # 工作URL测试
│   ├── validate_urls.js     # URL验证主脚本
│   └── validate_urls_fast.js# 快速URL验证
├── sitemap/                 # Sitemap相关测试
│   ├── validate_sitemap_urls.js  # Sitemap URL验证
│   ├── sitemap_urls.txt          # URL列表文件
│   └── sitemap_validation_report.json # 验证报告
├── __snapshots__/           # Jest快照测试
├── example.test.tsx         # 示例测试文件
├── setup.ts                 # 测试环境设置
└── README.md               # 此说明文件
```

## 测试文件作用

### URL验证测试
- **validate_urls.js**: 从sitemap_urls.txt读取URL列表，验证每个URL是否返回正确HTTP状态码
- **validate_urls_fast.js**: 快速版本的URL验证，用于CI/CD
- **test_local_urls.js**: 本地开发环境URL测试
- **test_working_urls.js**: 验证生产环境的URL可访问性

### Sitemap测试
- **validate_sitemap_urls.js**: 从实际sitemap.xml获取URL并验证状态
- **sitemap_urls.txt**: 手动维护的URL列表
- **sitemap_validation_report.json**: 验证结果报告

## 运行测试

```bash
# 运行所有测试
npm test

# URL验证测试
node test/url-validation/validate_urls.js

# Sitemap验证
node test/sitemap/validate_sitemap_urls.js

# 快速URL验证
node test/url-validation/validate_urls_fast.js
```

## 注意事项

1. 这些测试文件之前散布在项目根目录，现已整理到test目录
2. URL验证测试主要用于确保网站的所有页面都能正确访问
3. Sitemap测试用于SEO验证，确保搜索引擎能正确爬取
4. 这些是开发和部署过程中的质量保证工具