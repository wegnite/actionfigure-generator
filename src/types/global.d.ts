declare module "google-one-tap";

/**
 * 全局类型定义 
 * 统一管理全局窗口对象的扩展类型
 */
declare global {
  interface Window {
    // Google Analytics gtag 函数 - 统一类型定义
    gtag?: (...args: any[]) => void;
    
    // Google Ads 转化跟踪函数
    trackConversion?: (label: string, value?: number, currency?: string) => void;
  }
}
