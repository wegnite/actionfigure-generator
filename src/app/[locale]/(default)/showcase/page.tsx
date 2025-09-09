import Showcase from "@/components/blocks/showcase";
import type { Metadata } from "next";
import { getShowcasePage } from "@/services/page";

export default async function ShowcasePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getShowcasePage(locale);

  return <>{page.showcase && <Showcase section={page.showcase} />}</>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base = process.env.NEXT_PUBLIC_WEB_URL || "https://actionfigure-generator.com";
  const url = `${base}/${locale === 'en' ? '' : `${locale}/`}showcase`;

  return {
    title: "Showcase | AI Action Figure Generator",
    description:
      "See what creators build with the AI Action Figure Generator — anime, realistic and custom styles.",
    alternates: { canonical: url },
    openGraph: {
      title: "Showcase | AI Action Figure Generator",
      description:
        "Explore creations made using the AI Action Figure Generator.",
      url,
      type: "website",
      images: [
        { url: `${base}/logo.png`, width: 1200, height: 630, alt: "AI Action Figure Generator Showcase" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Showcase | AI Action Figure Generator",
      description: "Explore creations made using the AI Action Figure Generator.",
      images: [`${base}/logo.png`],
    },
  };
}
