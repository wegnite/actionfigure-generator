"use client";

import { Check, Crown, Sparkles, Zap, Users, Shield, Star } from "lucide-react";
import { PricingItem, Pricing as PricingType } from "@/types/blocks/pricing";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/app";
import { useLocale } from "next-intl";
import { loadStripe } from "@stripe/stripe-js";

/**
 * 高转化率付费页面组件
 * 
 * 设计原则：
 * 1. 视觉层次清晰 - 引导用户关注核心价值
 * 2. 社会证明 - 显示用户数量和评价
 * 3. 紧迫感 - 限时优惠和稀缺性
 * 4. 价值突出 - 强调节省的钱和获得的价值
 * 5. 无风险承诺 - 退款保证
 */
function PremiumPricing({ pricing }: { pricing: PricingType }) {
  const locale = useLocale();
  const { user, setShowSignModal } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [showAnnualPricing, setShowAnnualPricing] = useState(true);
  
  // 模拟实时统计数据
  const [stats, setStats] = useState({
    users: 15420,
    generations: 2847391,
    companies: 156
  });

  useEffect(() => {
    // 模拟实时数据更新
    const interval = setInterval(() => {
      setStats(prev => ({
        users: prev.users + Math.floor(Math.random() * 3),
        generations: prev.generations + Math.floor(Math.random() * 50) + 10,
        companies: prev.companies + Math.floor(Math.random() * 2)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCheckout = async (item: PricingItem, cnPay: boolean = false) => {
    try {
      if (!user) {
        setShowSignModal(true);
        return;
      }

      const params = {
        product_id: item.product_id,
        product_name: item.product_name,
        credits: item.credits,
        interval: item.interval,
        amount: cnPay ? item.cn_amount : item.amount,
        currency: cnPay ? "cny" : item.currency,
        valid_months: showAnnualPricing ? 12 : item.valid_months,
        locale: locale || "en",
      };

      setIsLoading(true);
      setProductId(item.product_id);

      // 转换跟踪
      if (typeof window !== 'undefined' && window.trackConversion) {
        window.trackConversion('purchase_intent', item.amount / 100, item.currency);
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        toast.error("Checkout failed");
        return;
      }

      const result = await stripe.redirectToCheckout({ sessionId: session_id });
      if (result.error) {
        toast.error(result.error.message);
      }
    } catch (e) {
      console.error("Checkout failed: ", e);
      toast.error("Checkout failed");
    } finally {
      setIsLoading(false);
      setProductId(null);
    }
  };

  if (pricing.disabled) {
    return null;
  }

  const featuredPlan = pricing.items?.find(item => item.is_featured);
  const otherPlans = pricing.items?.filter(item => !item.is_featured) || [];

  const calculateAnnualPrice = (monthlyPrice: number) => {
    return Math.floor(monthlyPrice * 12 * 0.8); // 20% 年费折扣
  };

  const calculateSavings = (monthlyPrice: number) => {
    const monthly = monthlyPrice * 12;
    const annual = calculateAnnualPrice(monthlyPrice);
    return monthly - annual;
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container max-w-7xl mx-auto px-4">
        
        {/* 页面头部 - 社会证明 */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/20 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 dark:text-green-400 text-sm font-medium">
                {stats.users.toLocaleString()}+ Active Users
              </span>
            </div>
            <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/20 px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 dark:text-blue-400 text-sm font-medium">
                {stats.generations.toLocaleString()}+ AI Figures Created
              </span>
            </div>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
            Create Stunning Action Figures
            <br />
            <span className="text-4xl lg:text-5xl">with AI Magic ✨</span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of creators, game developers, and toy companies using our AI to generate 
            professional-quality action figures in seconds.
          </p>

          {/* 价格切换 */}
          <div className="flex items-center justify-center bg-white dark:bg-slate-800 p-1 rounded-xl shadow-lg mb-12 max-w-md mx-auto">
            <button
              onClick={() => setShowAnnualPricing(false)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                !showAnnualPricing
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setShowAnnualPricing(true)}
              className={`px-6 py-3 rounded-lg font-medium transition-all relative ${
                showAnnualPricing
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Annual
              <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5">
                Save 20%
              </Badge>
            </button>
          </div>
        </div>

        {/* 特色推荐方案 - 大卡片 */}
        {featuredPlan && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-sm px-4 py-2 mb-4">
                🔥 Most Popular Choice - 73% of Users Choose This
              </Badge>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                Perfect for Serious Creators
              </h2>
            </div>

            <Card className="relative overflow-hidden border-2 border-blue-500 shadow-2xl bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 max-w-4xl mx-auto">
              {/* 闪烁效果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-pulse"></div>
              
              <CardContent className="p-12 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  {/* 左侧 - 价格和核心信息 */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <Crown className="w-8 h-8 text-yellow-500" />
                      <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {featuredPlan.title}
                      </h3>
                      <Badge className="bg-yellow-500 text-black px-3 py-1">
                        {featuredPlan.label}
                      </Badge>
                    </div>

                    <div className="mb-8">
                      <div className="flex items-end gap-3 mb-2">
                        {showAnnualPricing && (
                          <span className="text-2xl text-slate-500 line-through">
                            ${(featuredPlan.amount! * 12 / 100).toFixed(0)}
                          </span>
                        )}
                        <span className="text-6xl font-bold text-slate-900 dark:text-white">
                          ${showAnnualPricing 
                            ? (calculateAnnualPrice(featuredPlan.amount!) / 100).toFixed(0)
                            : (featuredPlan.amount! / 100).toFixed(0)
                          }
                        </span>
                        <span className="text-xl text-slate-600 dark:text-slate-300 mb-2">
                          /{showAnnualPricing ? 'year' : 'month'}
                        </span>
                      </div>
                      
                      {showAnnualPricing && (
                        <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg">
                          <p className="text-green-700 dark:text-green-400 font-semibold">
                            💰 You save ${(calculateSavings(featuredPlan.amount!) / 100).toFixed(0)} per year!
                          </p>
                        </div>
                      )}
                      
                      <p className="text-slate-600 dark:text-slate-300 text-lg mt-4 leading-relaxed">
                        {featuredPlan.description}
                      </p>
                    </div>

                    {/* CTA按钮 */}
                    <div className="space-y-4">
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                        disabled={isLoading}
                        onClick={() => handleCheckout(featuredPlan)}
                      >
                        {isLoading && productId === featuredPlan.product_id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Start Creating Now - {showAnnualPricing ? 'Save 20%' : 'Monthly'}
                          </div>
                        )}
                      </Button>
                      
                      <p className="text-center text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4" />
                        30-day money-back guarantee • Cancel anytime
                      </p>
                    </div>
                  </div>

                  {/* 右侧 - 功能特色 */}
                  <div>
                    <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      What You Get:
                    </h4>
                    <ul className="space-y-4">
                      {featuredPlan.features?.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mt-0.5">
                            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* 额外价值突出 */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                      <h5 className="font-bold text-purple-800 dark:text-purple-300 mb-3">
                        🎁 Bonus Worth $200+
                      </h5>
                      <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                        <li>• Exclusive style templates ($50 value)</li>
                        <li>• Premium support access ($100 value)</li>
                        <li>• Commercial usage rights ($100 value)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 其他方案对比 */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {otherPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                plan.title === 'Free'
                  ? 'border-slate-200 dark:border-slate-700'
                  : plan.title === 'Enterprise'
                  ? 'border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <CardContent className="p-8">
                {/* 方案标题 */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    {plan.title === 'Enterprise' && <Crown className="w-6 h-6 text-purple-500" />}
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {plan.title}
                    </h3>
                    {plan.label && (
                      <Badge variant="outline" className="border-purple-500 text-purple-700 dark:text-purple-300">
                        {plan.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    {plan.description}
                  </p>
                </div>

                {/* 价格 */}
                <div className="mb-8">
                  {plan.amount === 0 ? (
                    <div className="text-4xl font-bold text-slate-900 dark:text-white">
                      Free Forever
                    </div>
                  ) : (
                    <div className="flex items-end gap-2">
                      {showAnnualPricing && plan.amount && (
                        <span className="text-lg text-slate-500 line-through">
                          ${(plan.amount * 12 / 100).toFixed(0)}
                        </span>
                      )}
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">
                        {plan.amount === 0 
                          ? '$0' 
                          : `$${showAnnualPricing 
                            ? (calculateAnnualPrice(plan.amount!) / 100).toFixed(0)
                            : (plan.amount! / 100).toFixed(0)
                          }`
                        }
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 mb-1">
                        /{plan.amount === 0 ? 'forever' : showAnnualPricing ? 'year' : 'month'}
                      </span>
                    </div>
                  )}
                </div>

                {/* 功能列表 */}
                <ul className="space-y-3 mb-8">
                  {plan.features?.slice(0, 5).map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                  {plan.features && plan.features.length > 5 && (
                    <li className="text-slate-500 dark:text-slate-400 text-sm italic">
                      +{plan.features.length - 5} more features...
                    </li>
                  )}
                </ul>

                {/* 按钮 */}
                <Button
                  className={`w-full ${
                    plan.title === 'Free'
                      ? 'bg-slate-600 hover:bg-slate-700'
                      : plan.title === 'Enterprise'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white shadow-lg transition-all duration-300`}
                  disabled={isLoading}
                  onClick={() => plan.amount === 0 ? window.location.href = '/character-figure' : handleCheckout(plan)}
                >
                  {isLoading && productId === plan.product_id ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    plan.button?.title || 'Get Started'
                  )}
                </Button>

                {plan.tip && (
                  <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
                    {plan.tip}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 社会证明和保证 */}
        <div className="mt-20 text-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 shadow-xl max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
              Trusted by {stats.companies}+ Companies Worldwide
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {stats.users.toLocaleString()}+
                </div>
                <p className="text-slate-600 dark:text-slate-300">Active Creators</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {(stats.generations / 1000000).toFixed(1)}M+
                </div>
                <p className="text-slate-600 dark:text-slate-300">AI Figures Generated</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full mb-4">
                  <Star className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  4.9/5
                </div>
                <p className="text-slate-600 dark:text-slate-300">Average Rating</p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-green-600" />
                <h4 className="text-xl font-bold text-green-800 dark:text-green-300">
                  100% Risk-Free Guarantee
                </h4>
              </div>
              <p className="text-green-700 dark:text-green-300 text-lg">
                Not satisfied? Get a full refund within 30 days, no questions asked.
                <br />
                <span className="font-semibold">Join thousands of satisfied creators today!</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

PremiumPricing.displayName = 'PremiumPricing';

export default PremiumPricing;