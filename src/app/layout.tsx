import "@/app/globals.css";

import { getLocale, setRequestLocale } from "next-intl/server";
import { locales } from "@/i18n/locale";
import { cn } from "@/lib/utils";
import Analytics from "@/components/analytics";

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

        <link rel="icon" href="/favicon.ico" />

        {/* 注意：hreflang 改为在各页面的 generateMetadata 中按页面维度输出，避免全站指向语言首页的误配 */}
        
        {/* Google Analytics、Google Ads 和其他分析工具 - 放在 head 内以确保最佳跟踪性能 */}
        <Analytics />
      </head>
      <body className={cn("min-h-screen overflow-x-hidden dark")}>
        {/* 页面内容 */}
        {children}
      </body>
    </html>
  );
}
