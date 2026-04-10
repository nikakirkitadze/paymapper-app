import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { getAlternates } from '@/i18n/config';
import { APP_NAME } from '@/lib/constants';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('faqTitle', { appName: APP_NAME }),
    description: t('faqDescription'),
    alternates: getAlternates('/faq'),
  };
}

const QUESTIONS = Array.from({ length: 15 }, (_, i) => i + 1);

export default async function FaqPage() {
  const t = await getTranslations('faq');
  const tc = await getTranslations('common');

  const faqs = QUESTIONS.map((n) => ({
    q: t(`q${n}` as 'q1'),
    a: t(`a${n}` as 'a1'),
  }));

  // Structured data for Google rich results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/" className="hover:text-white">
          {tc('home')}
        </Link>
        <span>{tc('breadcrumbSeparator')}</span>
        <span className="text-white">{t('title')}</span>
      </nav>

      <h1 className="mb-4 text-3xl font-extrabold sm:text-4xl">{t('title')}</h1>
      <p className="mb-10 text-lg text-slate-400">{t('intro')}</p>

      <div className="space-y-4">
        {faqs.map((item, i) => (
          <details
            key={i}
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 open:border-[#3b82f6]/30 open:bg-white/[0.07]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-white">
              <span>{item.q}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5 flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              {item.a}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="mb-4 text-slate-300">
          Didn&apos;t find what you were looking for?
        </p>
        <Link
          href="/contact"
          className="inline-block rounded-xl bg-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb]"
        >
          Contact us
        </Link>
      </div>
    </div>
  );
}
