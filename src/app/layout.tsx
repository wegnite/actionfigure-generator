import "@/app/globals.css";

import { getLocale, setRequestLocale } from "next-intl/server";
import { locales } from "@/i18n/locale";
import { cn } from "@/lib/utils";
import Analytics from "@/components/analytics";
import type { Metadata } from "next";
import { getBaseUrl } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  // Ensure Next.js derives absolute URLs (canonical, OG, etc.) from the real host
  const base = getBaseUrl();
  return {
    metadataBase: new URL(base),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  setRequestLocale(locale);

  const webUrl = process.env.NEXT_PUBLIC_WEB_URL;
  const googleAdsenseCode = process.env.NEXT_PUBLIC_GOOGLE_ADCODE || "";

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="google" content="notranslate" />
        {googleAdsenseCode && (
          <meta name="google-adsense-account" content={googleAdsenseCode} />
        )}
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* 注意：hreflang 改为在各页面的 generateMetadata 中按页面维度输出，避免全站指向语言首页的误配 */}
      </head>
      <body className={cn("min-h-screen overflow-x-hidden dark")}>
        {/* Analytics: 放在 body 中，避免在 <head> 渲染 Client 组件引发运行时错误 */}
        <Analytics />
        {/* 页面内容 */}
        {children}
      </body>
    </html>
  );
}
