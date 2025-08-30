// 优化版定价组件示例
// 基于SaaS定价页面最佳实践的改进实现

"use client";

import { Check, Loader, X, Zap, Crown, Users } from "lucide-react";
import { PricingItem, Pricing as PricingType } from "@/types/blocks/pricing";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/icon";
import { Label } from "@/components/ui/label";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/app";
import { useLocale } from "next-intl";

// 社会证明数据
const socialProof = {
  userCount: "50,000+",
  dailyGeneration: "200,000+",
  satisfaction: "99.9%",
  companies: "500+"
};

// 信任标识
const trustBadges = [
  { name: "30天退款保证", icon: "shield" },
  { name: "企业级安全", icon: "lock" },
  { name: "24/7客服支持", icon: "headphones" }
];

// 改进的定价卡片样式
const getCardStyles = (item: PricingItem, isLoading: boolean, productId: string | null) => {
  const baseStyles = "relative rounded-2xl p-8 transition-all duration-300 hover:shadow-xl";
  
  if (item.is_featured) {
    return `${baseStyles} border-2 border-primary bg-gradient-to-br from-primary/5 via-white to-primary/5 shadow-xl transform scale-105 z-20`;
  }
  
  return `${baseStyles} border border-gray-200 bg-white shadow-lg hover:border-primary/50`;
};

// 价格显示组件
const PriceDisplay = ({ item }: { item: PricingItem }) => {
  const hasDiscount = item.original_price && item.original_price !== item.price;
  const discountPercent = hasDiscount ? 
    Math.round(((parseFloat(item.original_price.replace('$', '')) - parseFloat(item.price.replace('$', ''))) / parseFloat(item.original_price.replace('$', ''))) * 100) : 0;

  return (
    <div className="text-center mb-8 relative">
      {/* 折扣标识 */}
      {hasDiscount && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg z-10">
          节省 {discountPercent}%
        </div>
      )}
      
      {/* 原价 */}
      {item.original_price && (
        <div className="text-2xl font-medium text-gray-500 line-through mb-2">
          {item.original_price}
        </div>
      )}
      
      {/* 主价格 */}
      <div className="flex items-baseline justify-center gap-2 mb-4">
        <span className="text-7xl font-bold tracking-tight text-gray-900">
          {item.price}
        </span>
        {item.unit && (
          <span className="text-xl font-medium text-gray-600">
            /{item.unit}
          </span>
        )}
      </div>
      
      {/* 价值说明 */}
      {item.credits > 0 && (
        <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-full inline-block">
          每张图仅 ${(parseFloat(item.price.replace('$', '')) / item.credits).toFixed(3)}
        </div>
      )}
    </div>
  );
};

// 功能列表组件
const FeatureList = ({ item }: { item: PricingItem }) => {
  return (
    <div className="space-y-4">
      {item.features_title && (
        <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">
          {item.features_title}
        </h4>
      )}
      
      <ul className="space-y-3">
        {item.features?.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <span className="text-gray-700 leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// CTA按钮组件
const CTAButton = ({ 
  item, 
  isLoading, 
  productId, 
  onCheckout 
}: { 
  item: PricingItem;
  isLoading: boolean;
  productId: string | null;
  onCheckout: (item: PricingItem) => void;
}) => {
  const getButtonStyles = () => {
    if (item.product_id === 'free') {
      return "w-full bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300";
    }
    
    if (item.is_featured) {
      return "w-full bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105";
    }
    
    if (item.product_id === 'enterprise') {
      return "w-full bg-gray-900 text-white hover:bg-gray-800 transition-all duration-300";
    }
    
    return "w-full bg-primary text-white hover:bg-primary/90 transition-all duration-300";
  };

  const getButtonIcon = () => {
    if (item.product_id === 'free') return <Zap className="w-4 h-4" />;
    if (item.product_id === 'enterprise') return <Crown className="w-4 h-4" />;
    return <Users className="w-4 h-4" />;
  };

  return (
    <Button
      className={getButtonStyles()}
      disabled={isLoading}
      onClick={() => onCheckout(item)}
    >
      {isLoading && productId === item.product_id ? (
        <>
          <Loader className="w-4 h-4 animate-spin mr-2" />
          处理中...
        </>
      ) : (
        <>
          {getButtonIcon()}
          {item.button?.title}
        </>
      )}
    </Button>
  );
};

// 主定价组件
function OptimizedPricing({ pricing }: { pricing: PricingType }) {
  const locale = useLocale();
  const { user, setShowSignModal } = useAppContext();
  const [group, setGroup] = useState(pricing.groups?.[0]?.name);
  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);

  useEffect(() => {
    if (pricing.items) {
      setGroup(pricing.items[0].group);
      setProductId(pricing.items[0].product_id);
      setIsLoading(false);
    }
  }, [pricing.items]);

  if (pricing.disabled) {
    return null;
  }

  const handleCheckout = async (item: PricingItem, cn_pay: boolean = false) => {
    try {
      if (!user && item.product_id !== 'free') {
        setShowSignModal(true);
        return;
      }

      // 免费方案直接跳转
      if (item.product_id === 'free') {
        window.location.href = '/character-figure';
        return;
      }

      const params = {
        product_id: item.product_id,
        product_name: item.product_name,
        credits: item.credits,
        interval: item.interval,
        amount: cn_pay ? item.cn_amount : item.amount,
        currency: cn_pay ? "cny" : item.currency,
        valid_months: item.valid_months,
        locale: locale || "en",
      };

      setIsLoading(true);
      setProductId(item.product_id);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (response.status === 401) {
        setIsLoading(false);
        setProductId(null);
        setShowSignModal(true);
        return;
      }

      const { code, message, data } = await response.json();
      if (code !== 0) {
        toast.error(message);
        return;
      }

      if (data.provider === "creem" && data.url) {
        window.location.href = data.url;
        return;
      }

      const { public_key, session_id } = data;
      const stripe = await loadStripe(public_key);
      
      if (!stripe) {
        toast.error("支付初始化失败");
        return;
      }

      const result = await stripe.redirectToCheckout({
        sessionId: session_id,
      });

      if (result.error) {
        toast.error(result.error.message);
      }
    } catch (e) {
      console.error("支付处理失败:", e);
      toast.error("支付处理失败，请重试");
    } finally {
      setIsLoading(false);
      setProductId(null);
    }
  };

  return (
    <section id={pricing.name} className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container">
        {/* 页面标题和社会证明 */}
        <div className="mx-auto mb-16 text-center max-w-4xl">
          <h2 className="mb-6 text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent lg:text-6xl">
            {pricing.title}
          </h2>
          <p className="text-xl text-gray-600 mb-8 lg:text-2xl">
            {pricing.description}
          </p>
          
          {/* 社会证明统计 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{socialProof.userCount}</div>
              <div className="text-sm text-gray-600">创作者用户</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{socialProof.dailyGeneration}</div>
              <div className="text-sm text-gray-600">日生成数量</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{socialProof.satisfaction}</div>
              <div className="text-sm text-gray-600">客户满意度</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{socialProof.companies}</div>
              <div className="text-sm text-gray-600">企业客户</div>
            </div>
          </div>

          {/* 信任标识 */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center gap-2">
                <Icon name={badge.icon} className="w-4 h-4" />
                {badge.name}
              </div>
            ))}
          </div>
        </div>

        {/* 定价方案组选择 */}
        <div className="w-full flex flex-col items-center gap-2">
          {pricing.groups && pricing.groups.length > 0 && (
            <div className="flex h-12 mb-12 items-center rounded-xl bg-gray-100 p-1 text-lg shadow-inner">
              <RadioGroup
                value={group}
                className={`h-full grid-cols-${pricing.groups.length}`}
                onValueChange={(value) => setGroup(value)}
              >
                {pricing.groups.map((item, i) => (
                  <div
                    key={i}
                    className='h-full rounded-lg transition-all has-[button[data-state="checked"]]:bg-white has-[button[data-state="checked"]]:shadow-md'
                  >
                    <RadioGroupItem
                      value={item.name || ""}
                      id={item.name}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={item.name}
                      className="flex h-full cursor-pointer items-center justify-center px-8 font-semibold text-gray-600 peer-data-[state=checked]:text-primary transition-all"
                    >
                      {item.title}
                      {item.label && (
                        <Badge
                          variant="outline"
                          className="border-primary bg-primary px-2 ml-2 text-primary-foreground"
                        >
                          {item.label}
                        </Badge>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* 定价卡片网格 */}
          <div className="w-full max-w-7xl grid gap-8 md:grid-cols-2 lg:grid-cols-4 relative">
            {pricing.items?.map((item, index) => {
              if (item.group && item.group !== group) {
                return null;
              }

              return (
                <div
                  key={index}
                  className={getCardStyles(item, isLoading, productId)}
                >
                  {/* 特色标签 */}
                  {item.is_featured && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg z-30">
                      ⭐ 最受欢迎
                    </div>
                  )}

                  <div className="flex h-full flex-col">
                    {/* 标题区域 */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {item.title}
                        </h3>
                        {item.label && !item.is_featured && (
                          <Badge variant="outline" className="border-primary text-primary">
                            {item.label}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* 价格展示 */}
                    <PriceDisplay item={item} />

                    {/* 功能列表 */}
                    <div className="flex-1 mb-8">
                      <FeatureList item={item} />
                    </div>

                    {/* CTA按钮区域 */}
                    <div className="space-y-4">
                      <CTAButton 
                        item={item}
                        isLoading={isLoading}
                        productId={productId}
                        onCheckout={handleCheckout}
                      />

                      {/* 人民币支付选项 */}
                      {item.cn_amount && item.cn_amount > 0 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <span className="text-sm text-gray-600">人民币支付</span>
                          <button
                            className="inline-flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => handleCheckout(item, true)}
                            disabled={isLoading}
                          >
                            <img
                              src="/imgs/cnpay.png"
                              alt="人民币支付"
                              className="w-16 h-8 rounded object-contain"
                            />
                          </button>
                        </div>
                      )}

                      {/* 提示信息 */}
                      {item.tip && (
                        <p className="text-center text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                          💡 {item.tip}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部保障信息 */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 px-8 py-4 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icon name="shield" className="w-4 h-4 text-green-500" />
              30天无理由退款
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icon name="creditCard" className="w-4 h-4 text-blue-500" />
              安全支付保障
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icon name="headphones" className="w-4 h-4 text-purple-500" />
              24/7专业客服
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

OptimizedPricing.displayName = 'OptimizedPricing';

export default OptimizedPricing;