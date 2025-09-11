import ABTestWrapper from "@/components/blocks/pricing/ab-test-wrapper";
import type { Metadata } from "next";
import { canonicalFor, getBaseUrl } from "@/lib/seo";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base = getBaseUrl();
  const url = canonicalFor(`${locale === 'en' ? '' : `${locale}/`}pricing`);

  return {
    title: "Pricing | AI Action Figure Generator",
    description:
      "Simple pricing to use the AI Action Figure Generator with commercial rights included.",
    alternates: { canonical: url },
    openGraph: {
      title: "Pricing | AI Action Figure Generator",
      description:
        "Choose a plan and start creating with the AI Action Figure Generator.",
      url,
      type: "website",
      images: [
        { url: `${base}/logo.png`, width: 1200, height: 630, alt: "AI Action Figure Generator Pricing" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Pricing | AI Action Figure Generator",
      description:
        "Pick a plan for the AI Action Figure Generator and start creating.",
      images: [`${base}/logo.png`],
    },
  };
}
