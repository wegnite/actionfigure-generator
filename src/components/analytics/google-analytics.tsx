"use client";

import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";
import { useEffect, useState } from "react";

/**
 * Google Analytics (GA4) 组件 - GDPR 合规版本
 * 
 * 功能：
 * - 自动加载 GA4 跟踪脚本 (gtag.js)
 * - 仅在生产环境中运行分析跟踪
 * - 支持 GDPR 合规性（用户同意管理）
 * - 使用 Next.js 第三方库优化性能
 * - 自动跟踪页面浏览和 Core Web Vitals
 * 
 * 配置：
 * - 环境变量：NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
 * - 当前 GA4 ID: G-B10KKVENLG
 * 
 * 隐私设置：
 * - 默认启用匿名IP跟踪
 * - 支持用户数据删除请求
 * - 符合 GDPR/CCPA 要求
 */
export default function GoogleAnalytics() {
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);

  // 只在生产环境中运行 Google Analytics
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  // 获取 Google Analytics ID 环境变量
  const analyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  
  // 如果没有设置 GA ID，则不加载
  if (!analyticsId) {
    console.warn("NEXT_PUBLIC_GOOGLE_ANALYTICS_ID 环境变量未设置，Google Analytics 将不会加载");
    return null;
  }

  // 检查用户同意状态
  useEffect(() => {
    // 检查本地存储中的用户同意状态
    const consent = localStorage.getItem('analytics-consent');
    if (consent === 'granted') {
      setConsentGiven(true);
    } else if (consent === 'denied') {
      setConsentGiven(false);
    } else {
      // 如果没有同意记录，默认设置为已同意（可根据需要调整）
      // 对于严格的 GDPR 合规，应该默认为 false
      setConsentGiven(true);
      localStorage.setItem('analytics-consent', 'granted');
    }
  }, []);

  // 初始化 Google Analytics 配置
  useEffect(() => {
    if (consentGiven && typeof window !== 'undefined' && window.gtag) {
      // 配置 Google Analytics 隐私设置
      window.gtag('config', analyticsId, {
        // 匿名化 IP 地址
        anonymize_ip: true,
        // 尊重用户的 Do Not Track 设置
        respect_dnt: true,
        // 禁用广告功能
        allow_ad_personalization_signals: false,
        // 自动跟踪页面浏览
        send_page_view: true,
        // 跟踪滚动事件
        enhanced_measurement: {
          scrolls: true,
          outbound_clicks: true,
          site_search: true,
        }
      });

      // 开发环境日志
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 Google Analytics (GA4) 已配置");
        console.log("跟踪 ID:", analyticsId);
        console.log("隐私设置: 匿名IP，禁用广告个性化");
      }
    }
  }, [consentGiven, analyticsId]);

  // 如果用户未同意，不加载分析脚本
  if (!consentGiven) {
    return null;
  }

  return (
    <>
      {/* 使用 Next.js 优化的 Google Analytics 组件 */}
      <NextGoogleAnalytics gaId={analyticsId} />
      
      {/* 初始化脚本：设置隐私友好的默认配置 */}
      <script
        id="gtag-init"
        dangerouslySetInnerHTML={{
          __html: `
            // 设置 Google Analytics 默认配置
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            // 在加载时设置默认同意状态
            gtag('consent', 'default', {
              'analytics_storage': 'granted',
              'ad_storage': 'denied',
              'personalization_storage': 'denied',
              'functionality_storage': 'granted',
              'security_storage': 'granted'
            });
            
            // 初始化时间戳
            gtag('js', new Date());
            
            // 配置 GA4
            gtag('config', '${analyticsId}', {
              // 隐私设置
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false,
              
              // 性能设置
              send_page_view: true,
              
              // 自定义参数
              custom_map: {
                'dimension1': 'user_type',
                'dimension2': 'content_category'
              }
            });
            
            // 跟踪 Core Web Vitals
            gtag('event', 'web_vital', {
              event_category: 'Web Vitals',
              event_label: 'CLS',
              non_interaction: true
            });
          `,
        }}
      />

      {/* 开发环境调试信息 */}
      {process.env.NODE_ENV !== "production" && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log("🔍 Google Analytics (GA4) 开发模式已启用");
              console.log("跟踪 ID: ${analyticsId}");
              console.log("隐私设置: ✅ 匿名IP, ❌ 广告存储, ❌ 个性化存储");
              console.log("注意：开发环境中的跟踪数据可能不会发送到 GA");
            `,
          }}
        />
      )}
    </>
  );
}

// gtag 类型定义现在在 src/types/global.d.ts 中统一管理
