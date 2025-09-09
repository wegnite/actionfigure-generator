"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Timer, Users, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * 高转化率弹窗组件
 * 
 * 触发条件：
 * - 用户在页面停留30秒后
 * - 用户尝试离开页面时
 * - 滚动到页面底部时
 * 
 * 转化技巧：
 * - 限时优惠创造紧迫感
 * - 社会证明显示受欢迎程度
 * - 风险逆转（免费试用）
 */

interface ConversionModalProps {
  onClose: () => void;
  onUpgrade: (plan: string) => void;
}

export default function ConversionModal({ onClose, onUpgrade }: ConversionModalProps) {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15分钟倒计时
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 延迟显示动画
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 倒计时逻辑
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Card className={`max-w-2xl w-full relative transform transition-all duration-300 ${isVisible ? 'scale-100' : 'scale-95'} bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 border-2 border-blue-500 shadow-2xl`}>
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <CardContent className="p-8">
          {/* 闪烁效果背景 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-pulse rounded-lg"></div>
          
          <div className="relative z-10">
            {/* 头部 - 限时优惠 */}
            <div className="text-center mb-6">
              <Badge className="bg-red-500 text-white text-sm px-4 py-2 mb-4 animate-bounce">
                🔥 Limited Time Offer
              </Badge>
              
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Don't Miss Out!
              </h2>
              
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Get 50% off your first month + bonus credits
              </p>
            </div>

            {/* 倒计时 */}
            <div className="flex items-center justify-center mb-8">
              <div className="bg-red-100 dark:bg-red-900/30 px-6 py-3 rounded-xl flex items-center gap-2">
                <Timer className="w-5 h-5 text-red-600" />
                <span className="text-red-700 dark:text-red-400 font-mono text-xl font-bold">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-red-600 dark:text-red-400 font-medium">
                  left
                </span>
              </div>
            </div>

            {/* 特别优惠内容 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-8 h-8 text-yellow-500" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Creator Plan Special Deal
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Everything you need to create amazing action figures
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* 价格对比 */}
                <div>
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-2xl text-slate-500 line-through">$39</span>
                    <span className="text-4xl font-bold text-green-600">$19</span>
                    <span className="text-slate-600 dark:text-slate-300">/month</span>
                  </div>
                  
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg mb-4">
                    <p className="text-green-700 dark:text-green-400 font-semibold text-sm">
                      💰 You save $20/month = $240/year!
                    </p>
                  </div>

                  <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <li>✨ 100 premium action figures/month</li>
                    <li>🎨 4K Ultra HD quality</li>
                    <li>⚡ 5x faster generation</li>
                    <li>👑 Commercial license included</li>
                    <li>🎁 Bonus: 50 extra credits ($25 value)</li>
                  </ul>
                </div>

                {/* 社会证明 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      11,247 creators upgraded this week
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-yellow-400">
                        ★★★★★
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">4.9/5</span>
                    </div>
                    <blockquote className="text-sm text-slate-700 dark:text-slate-300 italic">
                      "This is exactly what I needed for my game project. The quality is incredible and the speed is amazing!"
                    </blockquote>
                    <cite className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                      - Sarah K., Game Developer
                    </cite>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    🔒 30-day money-back guarantee • Cancel anytime
                  </p>
                </div>
              </div>
            </div>

            {/* CTA按钮 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg py-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                onClick={() => onUpgrade('creator')}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Claim 50% Discount Now
                </div>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="sm:w-auto border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                onClick={onClose}
              >
                Maybe Later
              </Button>
            </div>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
              This offer expires when the timer runs out. No coupon code needed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}