import ABTestWrapper from "@/components/blocks/pricing/ab-test-wrapper";
import { getPricingPage } from "@/services/page";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getPricingPage(locale);

  // 使用A/B测试包装器，自动对比新旧设计转化效果
  // 访问 /pricing?pricing=premium 强制查看新设计
  // 访问 /pricing?pricing=classic 强制查看旧设计
  return <>{page.pricing && <ABTestWrapper pricing={page.pricing} />}</>;
}
