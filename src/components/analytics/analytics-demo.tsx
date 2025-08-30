/**
 * Google Analytics 使用演示组件
 * 
 * 展示如何在React组件中使用Google Analytics跟踪函数
 * 仅用于演示和开发参考，生产环境中可删除此文件
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import analytics from "@/lib/analytics";

export default function AnalyticsDemo() {
  // 只在开发环境显示
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <Card className="p-6 m-4 border-dashed border-2 border-orange-300 bg-orange-50 dark:bg-orange-900/20">
      <h3 className="text-lg font-bold mb-4 text-orange-800 dark:text-orange-200">
        🔍 Google Analytics 演示面板 (仅开发环境)
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 页面浏览跟踪 */}
        <Button
          onClick={() => {
            analytics.pageView({
              page_title: "演示页面",
              content_group: "demo",
            });
          }}
          variant="outline"
          className="text-sm"
        >
          跟踪页面浏览
        </Button>

        {/* AI生成事件 */}
        <Button
          onClick={() => {
            analytics.aiGeneration("character", "FLUX.1-schnell");
          }}
          variant="outline"
          className="text-sm"
        >
          AI角色生成
        </Button>

        {/* 用户注册 */}
        <Button
          onClick={() => {
            analytics.userSignup("google");
          }}
          variant="outline"
          className="text-sm"
        >
          用户注册
        </Button>

        {/* 购买转化 */}
        <Button
          onClick={() => {
            analytics.purchase(19, "USD", "Creator Plan");
          }}
          variant="outline"
          className="text-sm"
        >
          购买转化
        </Button>

        {/* 按钮点击 */}
        <Button
          onClick={() => {
            analytics.buttonClick("demo_button", "analytics_demo");
          }}
          variant="outline"
          className="text-sm"
        >
          按钮交互
        </Button>

        {/* 错误跟踪 */}
        <Button
          onClick={() => {
            analytics.error("演示错误消息", "demo_error");
          }}
          variant="outline"
          className="text-sm"
        >
          错误跟踪
        </Button>

        {/* 自定义事件 */}
        <Button
          onClick={() => {
            analytics.custom({
              action: "demo_action",
              category: "demo_category",
              label: "custom_demo",
              value: 42,
            });
          }}
          variant="outline"
          className="text-sm"
        >
          自定义事件
        </Button>

        {/* 用户属性 */}
        <Button
          onClick={() => {
            analytics.setUser({
              user_type: "demo_user",
              subscription_plan: "free",
            });
          }}
          variant="outline"
          className="text-sm"
        >
          设置用户属性
        </Button>
      </div>

      <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          💡 <strong>提示:</strong> 点击上方按钮会触发相应的 Google Analytics 事件。
          打开浏览器开发者工具控制台查看跟踪日志。
        </p>
        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
          注意：在开发环境中，分析数据可能不会发送到 Google Analytics。
        </p>
      </div>
    </Card>
  );
}