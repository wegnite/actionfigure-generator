import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { AppContextProvider } from "@/contexts/app";
import { Metadata } from "next";
import { NextAuthSessionProvider } from "@/auth/session";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@/providers/theme";
import AttributionTracker from "@/components/attribution/tracker";
import { Toaster } from "sonner";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  
  // Build hreflang alternates (keep in sync with sitemap locales)
  const baseUrl = 'https://actionfigure-generator.com';
  const alternates: Metadata["alternates"] = {
    canonical: locale === 'en' ? baseUrl : `${baseUrl}/${locale}`,
    languages: {
      en: baseUrl,
      zh: `${baseUrl}/zh`,
      'x-default': baseUrl,
    },
  };

  return {
    title: {
      template: `%s`,
      default: t("metadata.title") || "",
    },
    description: t("metadata.description") || "",
    keywords: t("metadata.keywords") || "",
    alternates,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <NextAuthSessionProvider>
        <AppContextProvider>
          <ThemeProvider>
            <AttributionTracker />
            {children}
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </AppContextProvider>
      </NextAuthSessionProvider>
    </NextIntlClientProvider>
  );
}
