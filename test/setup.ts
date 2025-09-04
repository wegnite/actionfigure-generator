// Jest 测试环境初始化文件
import '@testing-library/jest-dom'

// 全局测试配置
// 模拟 window.matchMedia（用于响应式组件测试）
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // 向后兼容
    removeListener: jest.fn(), // 向后兼容
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// 模拟 ResizeObserver（用于 UI 组件测试）
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// 模拟 IntersectionObserver（用于懒加载测试）
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// 模拟环境变量（测试环境专用）
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
//process.env.NODE_ENV = 'test' // NODE_ENV is read-only in production builds

// 控制台警告过滤（减少测试输出噪音）
const originalConsoleWarn = console.warn
console.warn = (...args) => {
  // 过滤 React 和 Next.js 的测试警告
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
     args[0].includes('Warning: validateDOMNesting'))
  ) {
    return
  }
  originalConsoleWarn.apply(console, args)
}