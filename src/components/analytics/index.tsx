import GoogleAnalytics from "./google-analytics";
import OpenPanelAnalytics from "./open-panel";
import Plausible from "./plausible";

/**
 * 统一分析组件 - 集成多个分析工具
 * 
 * 包含的分析工具：
 * 1. Google Analytics (GA4) - 主要网站分析
 * 2. OpenPanel - 开源分析平台
 * 3. Plausible - 隐私友好的分析工具
 * 
 * 功能：
 * - 仅在生产环境中加载分析脚本
 * - 支持多个分析平台同时运行
 * - 遵循隐私最佳实践
 * - 自动页面浏览跟踪
 * 
 * 配置所需环境变量：
 * - NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-B10KKVENLG"
 * - NEXT_PUBLIC_OPENPANEL_CLIENT_ID (可选)
 * - NEXT_PUBLIC_PLAUSIBLE_DOMAIN (可选)
 * 
 * 使用方式：
 * 在根 layout.tsx 中导入并使用：
 * <Analytics />
 */
export default function Analytics() {
  // 只在生产环境加载分析工具
  if (process.env.NODE_ENV !== "production") {
    console.log("🔍 分析工具已禁用 - 开发环境模式");
    return null;
  }

  return (
    <>
      {/* Google Analytics (GA4) - 主要分析工具 */}
      <GoogleAnalytics />
      
      {/* OpenPanel Analytics - 开源替代方案 */}
      <OpenPanelAnalytics />
      
      {/* Plausible Analytics - 隐私友好选项 */}
      <Plausible />
    </>
  );
}
