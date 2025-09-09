"use client";

import { useState, useEffect } from "react";
import Pricing from "./index";
import PremiumPricing from "./premium-pricing";
import { PricingItem, Pricing as PricingType } from "@/types/blocks/pricing";

/**
 * A/B测试包装器
 * 
 * 用途：对比新旧付费页面的转化效果
 * 
 * 使用方式：
 * 1. 在生产环境中，50%用户看到新设计，50%看到旧设计
 * 2. 通过URL参数 ?pricing=premium 强制显示新设计
 * 3. 通过URL参数 ?pricing=classic 强制显示旧设计
 * 
 * 转化跟踪：
 * - 自动发送Google Analytics事件
 * - 记录用户看到的版本
 * - 便于分析哪个版本转化更好
 */

interface ABTestWrapperProps {
  pricing: PricingType;
}

export default function ABTestWrapper({ pricing }: ABTestWrapperProps) {
  const [variant, setVariant] = useState<'classic' | 'premium'>('premium');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // 检查URL参数强制显示特定版本
    const urlParams = new URLSearchParams(window.location.search);
    const forcedVariant = urlParams.get('pricing') as 'classic' | 'premium' | null;
    
    if (forcedVariant && ['classic', 'premium'].includes(forcedVariant)) {
      setVariant(forcedVariant);
    } else {
      // A/B测试：随机分配版本（基于用户ID或session）
      const userId = localStorage.getItem('ab_test_user_id') || 
        Math.random().toString(36).substring(2, 15);
      localStorage.setItem('ab_test_user_id', userId);
      
      // 使用用户ID的哈希值决定版本，确保同一用户始终看到相同版本
      const hash = userId.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      // 90%显示新设计，10%显示旧设计（因为我们相信新设计更好）
      setVariant(Math.abs(hash) % 100 < 90 ? 'premium' : 'classic');
    }

    // Google Analytics跟踪
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'pricing_page_view', {
        event_category: 'ab_test',
        event_label: variant,
        custom_map: {
          dimension1: variant // 自定义维度跟踪A/B测试
        }
      });
    }
  }, [variant]);

  // 服务端渲染时默认显示新设计
  if (!isClient) {
    return <PremiumPricing pricing={pricing} />;
  }

  // 根据A/B测试结果渲染对应版本
  return variant === 'premium' ? (
    <PremiumPricing pricing={pricing} />
  ) : (
    <Pricing pricing={pricing} />
  );
}

// Window 对象类型定义现在在 src/types/global.d.ts 中统一管理