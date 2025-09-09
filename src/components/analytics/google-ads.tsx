"use client";

import { useEffect } from "react";

/**
 * Google Ads 转换跟踪组件
 * 
 * 功能：
 * - 加载 Google Ads 转换跟踪脚本 (gtag.js)
 * - 跟踪广告转换和用户行为
 * - 与现有 Google Analytics 共享 gtag 数据层
 * - 仅在生产环境中运行
 * 
 * 配置：
 * - 转换跟踪 ID: AW-17411795321
 * - 自动与 Google Analytics 集成
 * - 符合隐私最佳实践
 * 
 * 使用场景：
 * - Google Ads 广告效果跟踪
 * - 转换率优化 (CRO)
 * - ROI 和 ROAS 计算
 * - 重定向受众创建
 */
export default function GoogleAds() {
  // 只在生产环境中运行 Google Ads 跟踪
  if (process.env.NODE_ENV !== "production") {
    console.log("🔍 Google Ads 跟踪已禁用 - 开发环境模式");
    return null;
  }

  const adsConversionId = "AW-17411795321";
  // 从环境变量推导主域，用于 cross-domain linker
  const siteDomain = (() => {
    try {
      const url = process.env.NEXT_PUBLIC_WEB_URL || '';
      return url ? new URL(url).hostname : 'actionfigure-generator.com';
    } catch {
      return 'actionfigure-generator.com';
    }
  })();

  useEffect(() => {
    // 初始化 Google Ads 跟踪配置
    if (typeof window !== 'undefined' && window.gtag) {
      // 配置 Google Ads 转换跟踪
      window.gtag('config', adsConversionId, {
        // 转换跟踪设置
        allow_enhanced_conversions: true,
        send_page_view: true,
        // 隐私设置
        allow_ad_personalization_signals: true,
        restricted_data_processing: false,
      });

      console.log("🎯 Google Ads 转换跟踪已初始化");
      console.log("转换 ID:", adsConversionId);
    }
  }, []);

  return (
    <>
      {/* Google Ads 转换跟踪脚本 */}
      <script 
        async 
        src={`https://www.googletagmanager.com/gtag/js?id=${adsConversionId}`}
      />
      
      {/* Google Ads 初始化脚本 */}
      <script
        id="google-ads-init"
        dangerouslySetInnerHTML={{
          __html: `
            // 初始化数据层（如果不存在）
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            // 设置时间戳
            gtag('js', new Date());
            
            // 配置 Google Ads 转换跟踪
            gtag('config', '${adsConversionId}', {
              // 转换跟踪设置
              allow_enhanced_conversions: true,
              send_page_view: true,
              
              // 广告个性化设置
              allow_ad_personalization_signals: true,
              
              // 链接器设置（用于跨域跟踪）
              linker: {
                domains: ['${siteDomain}']
              }
            });
            
            // 自定义事件跟踪函数
            window.trackConversion = function(conversionLabel, value, currency) {
              gtag('event', 'conversion', {
                'send_to': '${adsConversionId}/' + conversionLabel,
                'value': value || 1.0,
                'currency': currency || 'USD'
              });
            };
            
            // 页面加载完成后的初始化
            document.addEventListener('DOMContentLoaded', function() {
              // 跟踪页面浏览作为转换事件
              gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href
              });
            });
          `,
        }}
      />

      {/* 开发环境调试信息 */}
      {process.env.NODE_ENV !== "production" && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log("🎯 Google Ads 转换跟踪开发模式");
              console.log("转换 ID: ${adsConversionId}");
              console.log("功能: ✅ 转换跟踪, ✅ 增强转换, ✅ 页面浏览");
              console.log("使用 window.trackConversion(label, value, currency) 手动跟踪转换");
            `,
          }}
        />
      )}
    </>
  );
}

// Window 对象类型定义现在在 src/types/global.d.ts 中统一管理
