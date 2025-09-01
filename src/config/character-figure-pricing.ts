/**
 * actionFigure 专用定价配置
 * 
 * 功能说明：
 * - 定义actionFigure平台的订阅定价结构
 * - 支持多语言显示和货币
 * - 包含价值感知和营销信息
 * - 与Stripe产品ID映射
 * 
 * 设计原则：
 * - Trial计划突出超值感，建立价值认知
 * - Pro计划作为主推，平衡价格和功能
 * - Ultra计划面向专业用户，提供商用授权
 * 
 * @module config/character-figure-pricing
 */

import { SubscriptionPlan, BillingInterval } from "@/services/subscription";

/**
 * 定价计划接口
 */
export interface CharacterPricingPlan {
  // 基础信息
  planId: SubscriptionPlan;
  planName: string;
  planNameEn: string;
  description: string;
  descriptionEn: string;
  
  // 价格信息
  monthlyPrice: number;    // 美分为单位
  yearlyPrice: number;     // 美分为单位
  currency: string;
  
  // 显示价格（用于UI展示）
  displayMonthlyPrice: string;  // "$3.99"
  displayYearlyPrice: string;   // "$39.90"
  
  // Stripe 产品配置
  stripeMonthlyPriceId?: string;  // Stripe月付价格ID
  stripeYearlyPriceId?: string;   // Stripe年付价格ID
  stripeProductId?: string;       // Stripe产品ID
  
  // 功能特性
  features: string[];
  featuresEn: string[];
  
  // 使用限制
  monthlyLimit: number | null;    // 月度生成限制
  dailyLimit: number | null;      // 日度生成限制（仅Free用）
  creditsPerGeneration: number;   // 每次生成消耗积分
  
  // 权限配置
  allowedStyles: string[];        // 允许的风格
  allowedQualities: string[];     // 允许的质量
  maxBatchSize: number;           // 最大批量生成数
  priorityQueue: boolean;         // 是否优先队列
  apiAccess: boolean;             // API访问权限
  
  // UI显示配置
  isPopular: boolean;             // 是否标记为热门
  isRecommended: boolean;         // 是否推荐
  badge?: string;                 // 徽章文字
  badgeColor?: string;            // 徽章颜色
  sortOrder: number;              // 排序权重
  
  // 营销信息
  valueHighlight?: string;        // 价值突出文案
  originalPrice?: string;         // 原价（用于划线显示）
  discountPercent?: number;       // 折扣百分比
  urgencyText?: string;           // 紧迫感文案
  
  // 年付优惠
  annualSavings?: string;         // 年付节省金额
  annualDiscountMonths?: number;  // 年付相当于免费月数
  
  // 特殊标记
  isOneTime?: boolean;            // 是否一次性购买
  isLimitedTime?: boolean;        // 是否限时优惠
  
  // 商用信息
  commercialLicense?: boolean;    // 是否包含商用许可
  supportLevel: string;           // 支持级别
}

/**
 * actionFigure 完整定价配置 - 基于PRD文档定价策略
 * 
 * 定价结构（根据PRD文档）：
 * 1. Free: 每日5次免费体验，建立使用习惯
 * 2. Creator: $19/月=100次，单次$0.19，内容创作者首选
 * 3. Professional: $49/月=500次，单次$0.098，小企业和开发者
 * 4. Enterprise: $199/月=无限次，企业级解决方案
 * 
 * 价值递进策略：
 * - 免费版：导流获客，基础质量，带水印
 * - 创作者版：商业授权，高清质量，内容创作者
 * - 专业版：3D文件，API访问，小企业和游戏开发者
 * - 企业版：无限生成，定制训练，白标方案，玩具公司和工作室
 */
export const CHARACTER_PRICING_PLANS: CharacterPricingPlan[] = [
  // ===== FREE 计划 =====
  {
    planId: SubscriptionPlan.FREE,
    planName: "免费体验",
    planNameEn: "Free",
    description: "每日免费体验，探索角色生成魅力",
    descriptionEn: "Daily free access to explore actioncreation",
    
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: "USD",
    displayMonthlyPrice: "免费",
    displayYearlyPrice: "免费",
    
    features: [
      "✨ 每日5次免费生成",
      "🎨 3种基础风格（动漫、写实、卡通）",
      "📱 标准画质输出 (1024x1024)",
      "🖼️ 社区画廊浏览",
      "💬 社区支持"
    ],
    featuresEn: [
      "✨ 5 free generations daily",
      "🎨 3 basic styles (Anime, Realistic, Cartoon)",
      "📱 Standard quality (1024x1024)",
      "🖼️ Community gallery access",
      "💬 Community support"
    ],
    
    monthlyLimit: null, // Free不按月计算
    dailyLimit: 5, // 根据PRD文档调整为每日5次
    creditsPerGeneration: 1,
    
    allowedStyles: ["anime", "realistic", "cartoon"],
    allowedQualities: ["standard"],
    maxBatchSize: 1,
    priorityQueue: false,
    apiAccess: false,
    
    isPopular: false,
    isRecommended: false,
    sortOrder: 1,
    supportLevel: "community",
  },
  
  // ===== CREATOR 计划 - 对应PRD文档的创作者版 =====
  {
    planId: SubscriptionPlan.TRIAL, // 重用现有枚举，但语义改为Creator
    planName: "创作者版",
    planNameEn: "Creator",
    description: "适合内容创作者和爱好者，每月100次生成",
    descriptionEn: "Perfect for content creators and hobbyists, 100 generations monthly",
    
    monthlyPrice: 1900,   // $19/month 根据PRD文档
    yearlyPrice: 19000,   // $190/year (相当于10个月价格)
    currency: "USD", 
    displayMonthlyPrice: "$19",
    displayYearlyPrice: "$190",
    
    // Stripe 产品配置
    stripeProductId: "prod_character_creator",
    stripeMonthlyPriceId: "price_character_creator_monthly",
    stripeYearlyPriceId: "price_character_creator_yearly",
    
    features: [
      "🎨 每月100次角色生成",
      "🌟 高清画质输出",
      "📋 商业授权许可",
      "✨ 无水印导出",
      "🚀 优先生成队列",
      "📧 邮件客服支持",
      "🎭 高级风格选项"
    ],
    featuresEn: [
      "🎨 100 actiongenerations monthly",
      "🌟 High-definition quality output",
      "📋 Commercial license included",
      "✨ Watermark-free export",
      "🚀 Priority generation queue",
      "📧 Email customer support",
      "🎭 Advanced style options"
    ],
    
    monthlyLimit: 100,   // 每月100次，符合PRD
    dailyLimit: null,    // 无日限制
    creditsPerGeneration: 1,
    
    allowedStyles: ["*"], // 所有风格
    allowedQualities: ["standard", "hd"],
    maxBatchSize: 4,
    priorityQueue: true,
    apiAccess: false,
    
    isPopular: true,
    isRecommended: true,
    badge: "热门选择",
    badgeColor: "bg-blue-500",
    sortOrder: 2,
    
    // 价值感知营销
    valueHighlight: "内容创作者的热门选择",
    originalPrice: "$29",
    discountPercent: 34,
    
    commercialLicense: true, // 包含商用许可
    supportLevel: "email",
  },
  
  // ===== PRO 计划 - 对应PRD文档的专业版 =====
  {
    planId: SubscriptionPlan.PRO,
    planName: "专业版",
    planNameEn: "Professional",
    description: "适合小企业和游戏开发者，每月500次生成",
    descriptionEn: "For small businesses and game developers, 500 generations monthly",
    
    monthlyPrice: 4900,  // $49/month 根据PRD文档
    yearlyPrice: 49000,  // $490/year (相当于10个月价格)
    currency: "USD",
    displayMonthlyPrice: "$49",
    displayYearlyPrice: "$490",
    
    stripeProductId: "prod_character_professional",
    stripeMonthlyPriceId: "price_character_professional_monthly",
    stripeYearlyPriceId: "price_character_professional_yearly",
    
    features: [
      "🎨 每月500次专业生成",
      "📁 3D文件导出功能",
      "🔌 API访问权限",
      "🤖 自定义训练选项",
      "🛠️ 高级编辑工具",
      "📸 批量生成工具",
      "👥 团队协作功能",
      "📧 优先技术支持",
      "☁️ 无限云端存储"
    ],
    featuresEn: [
      "🎨 500 professional generations monthly",
      "📁 3D file export capability",
      "🔌 API access included",
      "🤖 Custom training options",
      "🛠️ Advanced editing tools",
      "📸 Bulk generation tools",
      "👥 Team collaboration features",
      "📧 Priority technical support",
      "☁️ Unlimited cloud storage"
    ],
    
    monthlyLimit: 500,  // 根据PRD文档调整
    dailyLimit: null,
    creditsPerGeneration: 1,
    
    allowedStyles: ["*"],
    allowedQualities: ["standard", "hd", "uhd"],
    maxBatchSize: 10,   // 专业版支持更大批量
    priorityQueue: true,
    apiAccess: true,
    
    isPopular: false,
    isRecommended: true,
    badge: "小企业首选",
    badgeColor: "bg-green-500",
    sortOrder: 3,
    
    // 价值对比
    valueHighlight: "小企业和开发者的最佳选择",
    originalPrice: "$69",
    discountPercent: 29,
    annualSavings: "$98",
    annualDiscountMonths: 2,
    
    supportLevel: "priority",
  },
  
  // ===== ULTRA 计划 - 对应PRD文档的企业版 =====
  {
    planId: SubscriptionPlan.ULTRA,
    planName: "企业版",
    planNameEn: "Enterprise",
    description: "玩具公司和专业工作室，无限生成+定制方案",
    descriptionEn: "For toy companies and professional studios, unlimited generations + custom solutions",
    
    monthlyPrice: 19900,  // $199/month 根据PRD文档
    yearlyPrice: 199000,  // $1990/year (相当于10个月价格)
    currency: "USD",
    displayMonthlyPrice: "$199",
    displayYearlyPrice: "$1990",
    
    stripeProductId: "prod_character_enterprise",
    stripeMonthlyPriceId: "price_character_enterprise_monthly", 
    stripeYearlyPriceId: "price_character_enterprise_yearly",
    
    features: [
      "🚀 无限角色生成",
      "🤖 定制模型训练",
      "🏢 白标解决方案",
      "👤 专属客户经理",
      "📊 SLA服务保证",
      "🔌 定制集成服务",
      "🔒 企业级安全保障",
      "📋 完整商用授权",
      "🎧 24/7专属客服",
      "📊 详细使用分析",
      "⚡ 专用服务器资源",
      "🛠️ 私有部署选项"
    ],
    featuresEn: [
      "🚀 Unlimited actiongenerations",
      "🤖 Custom model training",
      "🏢 White-label solutions",
      "👤 Dedicated account manager",
      "📊 SLA guarantee",
      "🔌 Custom integrations",
      "🔒 Enterprise-grade security",
      "📋 Full commercial license",
      "🎧 24/7 dedicated support",
      "📊 Detailed usage analytics",
      "⚡ Dedicated server resources",
      "🛠️ Private deployment options"
    ],
    
    monthlyLimit: -1, // 无限生成
    dailyLimit: null,
    creditsPerGeneration: 1,
    
    allowedStyles: ["*"],
    allowedQualities: ["standard", "hd", "uhd", "8k"],
    maxBatchSize: -1, // 无限批量
    priorityQueue: true,
    apiAccess: true,
    
    isPopular: false,
    isRecommended: false,
    badge: "企业级",
    badgeColor: "bg-purple-500",
    sortOrder: 4,
    
    // 价值对比
    valueHighlight: "企业级需求的完整解决方案",
    originalPrice: "$299",
    discountPercent: 33,
    annualSavings: "$398",
    annualDiscountMonths: 2,
    
    commercialLicense: true,
    supportLevel: "dedicated",
  }
];

/**
 * 根据计划ID获取定价配置
 * 
 * @param planId 订阅计划ID
 * @returns 定价配置对象
 */
export function getCharacterPricingPlan(planId: SubscriptionPlan): CharacterPricingPlan | null {
  return CHARACTER_PRICING_PLANS.find(plan => plan.planId === planId) || null;
}

/**
 * 获取所有可购买的计划（排除Free）
 * 
 * @returns 可购买的定价计划数组
 */
export function getPurchasableCharacterPlans(): CharacterPricingPlan[] {
  return CHARACTER_PRICING_PLANS.filter(plan => plan.planId !== SubscriptionPlan.FREE);
}

/**
 * 根据Stripe价格ID反查计划信息
 * 
 * @param stripePriceId Stripe价格ID
 * @returns 匹配的计划和计费周期
 */
export function findPlanByStripePriceId(stripePriceId: string): {
  plan: CharacterPricingPlan;
  interval: BillingInterval;
} | null {
  for (const plan of CHARACTER_PRICING_PLANS) {
    if (plan.stripeMonthlyPriceId === stripePriceId) {
      return { plan, interval: BillingInterval.MONTHLY };
    }
    if (plan.stripeYearlyPriceId === stripePriceId) {
      return { plan, interval: BillingInterval.YEARLY };
    }
  }
  return null;
}

/**
 * 价值感知计算工具
 * 
 * @param plan 定价计划
 * @returns 价值感知数据
 */
export function calculateValuePerception(plan: CharacterPricingPlan): {
  pricePerGeneration: number;      // 单次生成成本（美分）
  formattedPricePerGeneration: string;  // 格式化显示
  savingsVsTrial?: string;         // 相比Trial的节省
  totalAnnualValue?: number;       // 年度总价值
} {
  const monthlyLimit = plan.monthlyLimit || 1;
  const pricePerGeneration = plan.monthlyPrice / monthlyLimit;
  const formattedPrice = `$${(pricePerGeneration / 100).toFixed(3)}`;
  
  // 与Trial计划对比（Trial为39.9美分每次）
  const trialPricePerGeneration = 39.9; // 美分
  const savingsPercent = ((trialPricePerGeneration - pricePerGeneration) / trialPricePerGeneration * 100).toFixed(0);
  
  let savingsVsTrial: string | undefined;
  if (plan.planId !== SubscriptionPlan.TRIAL && plan.planId !== SubscriptionPlan.FREE) {
    savingsVsTrial = `相比Trial节省${savingsPercent}%`;
  }
  
  // 年度价值计算
  const totalAnnualValue = plan.monthlyPrice * 12;
  
  return {
    pricePerGeneration,
    formattedPricePerGeneration: formattedPrice,
    savingsVsTrial,
    totalAnnualValue,
  };
}

/**
 * 获取推荐升级路径
 * 
 * @param currentPlan 当前计划
 * @returns 推荐的下一个计划
 */
export function getRecommendedUpgrade(currentPlan: SubscriptionPlan): CharacterPricingPlan | null {
  const upgradeMap: Record<SubscriptionPlan, SubscriptionPlan | null> = {
    [SubscriptionPlan.FREE]: SubscriptionPlan.TRIAL,
    [SubscriptionPlan.TRIAL]: SubscriptionPlan.PRO,
    [SubscriptionPlan.PRO]: SubscriptionPlan.ULTRA,
    [SubscriptionPlan.ULTRA]: null, // 已是最高级
  };
  
  const nextPlanId = upgradeMap[currentPlan];
  return nextPlanId ? getCharacterPricingPlan(nextPlanId) : null;
}