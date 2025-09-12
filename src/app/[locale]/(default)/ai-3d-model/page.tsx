import Link from "next/link";
import type { Metadata } from "next";
import { canonicalFor, getBaseUrl } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base = getBaseUrl();
  const homePath = locale === "en" ? "/" : `/${locale}`;

  const titles: Record<string, string> = {
    en: "AI 3D Model",
    zh: "AI 3D 模型",
    ja: "AI 3Dモデル",
    es: "Modelo 3D con IA",
    fr: "Modèle 3D IA",
    de: "KI 3D‑Modell",
    it: "Modello 3D IA",
    ar: "نموذج ثلاثي الأبعاد بالذكاء الاصطناعي",
  };

  const descriptions: Record<string, string> = {
    en: "This page guides users to the homepage for the best experience.",
    zh: "此页面用于引导访问首页以获得最佳体验。",
    ja: "最適な体験のため、ホームページへ案内します。",
    es: "Esta página dirige a los usuarios a la página de inicio para una mejor experiencia.",
    fr: "Cette page redirige vers la page d’accueil pour une meilleure expérience.",
    de: "Diese Seite führt zur Startseite für das beste Erlebnis.",
    it: "Questa pagina guida alla homepage per la migliore esperienza.",
    ar: "توجه هذه الصفحة المستخدم إلى الصفحة الرئيسية للحصول على أفضل تجربة.",
  };

  const title = titles[locale] || titles.en;
  const description = descriptions[locale] || descriptions.en;

  return {
    title,
    description,
    alternates: { canonical: canonicalFor(homePath) },
    openGraph: {
      title,
      description,
      url: canonicalFor(homePath),
      siteName: "Action Figure AI Generator",
      type: "website",
      images: [{ url: `${base}/og-image.jpg`, width: 1200, height: 630 }],
    },
    robots: { index: false, follow: true },
  };
}

export default async function Ai3DModelRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const homeHref = locale === "en" ? "/" : `/${locale}/`;

  const h1: Record<string, string> = {
    en: "AI 3D Model",
    zh: "AI 3D 模型",
    ja: "AI 3Dモデル",
    es: "Modelo 3D con IA",
    fr: "Modèle 3D IA",
    de: "KI 3D‑Modell",
    it: "Modello 3D IA",
    ar: "نموذج ثلاثي الأبعاد بالذكاء الاصطناعي",
  };
  const lead: Record<string, string> = {
    en: "For the latest features and best experience, please visit our homepage.",
    zh: "获取最新功能与最佳体验，请访问我们的首页。",
    ja: "最新機能と最適な体験のため、ホームページへお進みください。",
    es: "Para la mejor experiencia, visita nuestra página de inicio.",
    fr: "Pour une meilleure expérience, visitez notre page d’accueil.",
    de: "Für das beste Erlebnis besuchen Sie bitte unsere Startseite.",
    it: "Per la migliore esperienza, visita la nostra home page.",
    ar: "لأفضل تجربة، يُرجى زيارة صفحتنا الرئيسية.",
  };
  const cta: Record<string, string> = {
    en: "Go to Homepage",
    zh: "前往首页",
    ja: "ホームへ",
    es: "Ir a inicio",
    fr: "Aller à l’accueil",
    de: "Zur Startseite",
    it: "Vai alla home",
    ar: "اذهب إلى الرئيسية",
  };

  return (
    <main className="container max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{h1[locale] || h1.en}</h1>
      <p className="text-muted-foreground mb-8">{lead[locale] || lead.en}</p>
      <div className="flex justify-center">
        <Button asChild size="lg">
          <Link href={homeHref}>{cta[locale] || cta.en}</Link>
        </Button>
      </div>
    </main>
  );
}
