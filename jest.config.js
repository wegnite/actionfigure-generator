// Jest 配置文件 - 用于 Next.js + TypeScript 项目
const nextJest = require('next/jest')

// 创建 Next.js Jest 配置函数
const createJestConfig = nextJest({
  // 提供 Next.js 应用程序的路径，用于加载 next.config.js 和 .env 文件
  dir: './',
})

// 自定义 Jest 配置
const customJestConfig = {
  // 设置测试环境为 jsdom（用于 React 组件测试）
  testEnvironment: 'jsdom',
  
  // 设置文件和导入前需要运行的模块
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  
  // 模块路径映射（与 tsconfig.json 中的路径保持一致）
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/test/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  
  // 忽略的文件夹
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/.vercel/',
    '<rootDir>/dist/',
    '<rootDir>/.open-next/'
  ],
  
  // 需要转换的文件扩展名
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  // 覆盖率收集配置
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/app/**/loading.tsx',
    '!src/app/**/not-found.tsx',
    '!src/app/**/error.tsx',
    '!src/app/**/layout.tsx',
  ],
  
  // 覆盖率输出目录
  coverageDirectory: '<rootDir>/coverage',
  
  // 覆盖率报告格式
  coverageReporters: ['text', 'lcov', 'html'],
}

// 导出配置（createJestConfig 处理 Next.js 异步配置）
module.exports = createJestConfig(customJestConfig)