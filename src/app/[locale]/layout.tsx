import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Inter, Noto_Sans_SC } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { locales, type Locale } from '@/i18n/config';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ADSENSE_CLIENT_ID } from '@/lib/constants';
import PageEngagementTracker from '@/components/PageEngagementTracker';

const GA_MEASUREMENT_ID = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '').trim();
const GOOGLE_ADS_ID = (process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? '').trim();
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sc',
  display: 'swap',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = loc === routing.defaultLocale ? '/' : `/${loc}`;
  }

  return {
    title: {
      default: t('defaultTitle', { appName: 'PayMapper' }),
      template: `%s | PayMapper`,
    },
    description: t('defaultDescription'),
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paymapper.app',
    ),
    alternates: {
      languages,
    },
    openGraph: {
      title: t('defaultTitle', { appName: 'PayMapper' }),
      description: t('defaultDescription'),
      siteName: 'PayMapper',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('defaultTitle', { appName: 'PayMapper' }),
      description: t('defaultDescription'),
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0f1e',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${locale === 'zh' ? notoSansSC.variable : ''}`}>
      <head>
        {/* eslint-disable @next/next/no-sync-scripts */}
        {(GOOGLE_ADS_ID || GA_MEASUREMENT_ID) && (
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID || GA_MEASUREMENT_ID}`}
          />
        )}
        {(GOOGLE_ADS_ID || GA_MEASUREMENT_ID) && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${GA_MEASUREMENT_ID ? `gtag('config','${GA_MEASUREMENT_ID}',{page_path:window.location.pathname});` : ''}${GOOGLE_ADS_ID ? `gtag('config','${GOOGLE_ADS_ID}');gtag('event','conversion',{'send_to':'${GOOGLE_ADS_ID}/Pp_bCMXj1IocEL30mJJD','value':1.0,'currency':'USD'});` : ''}`,
            }}
          />
        )}
        {/* eslint-enable @next/next/no-sync-scripts */}
        {/* Use plain script tag to avoid Next.js data-nscript attribute that AdSense rejects */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className="overflow-x-hidden bg-[#0a0f1e] text-white min-h-screen font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="min-h-[calc(100vh-160px)]">{children}</main>
          <Footer />
          <PageEngagementTracker />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
