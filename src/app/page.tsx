/**
 * Root Page (SSR)
 * 在根路径直接提供英文首页内容，作为默认语言页面。
 * - 不再重定向到 /en/
 * - canonical 指向根路径，配合 sitemap 仅提交根首页
 */

import type { Metadata } from 'next'
import { canonicalFor, getBaseUrl } from '@/lib/seo'
import StructuredData from '@/components/seo/StructuredData'
import ActionFigureLanding from '@/components/blocks/action-figure-landing'
import { NextIntlClientProvider } from 'next-intl'
import enMessages from '@/i18n/messages/en.json'
import { NextAuthSessionProvider } from '@/auth/session'
import { AppContextProvider } from '@/contexts/app'
import { ThemeProvider } from '@/providers/theme'
import { Toaster } from 'sonner'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const base = getBaseUrl()
  const title = 'AI Action Figure Generator – Create Pro Figures'
  const description = 'Create professional action figures in seconds with our AI generator. Design anime and realistic figures fast. Free trial. Commercial rights included.'

  return {
    title,
    description,
    keywords: 'ai action figure generator, action figure maker, ai figure creator',
    alternates: { canonical: canonicalFor('/') },
    openGraph: {
      title,
      description,
      url: canonicalFor('/'),
      siteName: 'Action Figure AI Generator',
      locale: 'en_US',
      type: 'website',
      images: [{ url: `${base}/og-image.jpg`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${base}/og-image.jpg`],
      site: '@actionfiguregen',
      creator: '@actionfiguregen',
    },
    robots: { index: true, follow: true },
  }
}

export default async function RootPage() {
  const locale = 'en'
  return (
    <>
      <StructuredData
        type="website"
        data={{
          name: 'Action Figure AI Generator',
          description:
            'Advanced AI-powered platform for creating professional action figures and collectibles',
          url: getBaseUrl(),
        }}
      />
      {/* Provide i18n + app contexts for the root (non-locale) tree */}
      <NextIntlClientProvider messages={enMessages as any} locale={locale}>
        <NextAuthSessionProvider>
          <AppContextProvider>
            <ThemeProvider>
              <ActionFigureLanding locale={locale} />
              <Toaster position="top-center" richColors />
            </ThemeProvider>
          </AppContextProvider>
        </NextAuthSessionProvider>
      </NextIntlClientProvider>
    </>
  )
}
