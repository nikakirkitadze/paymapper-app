import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { getAlternates } from '@/i18n/config';
import { APP_NAME } from '@/lib/constants';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('aboutTitle', { appName: APP_NAME }),
    description: t('aboutDescription'),
    alternates: getAlternates('/about'),
  };
}

export default async function AboutPage() {
  const t = await getTranslations('about');
  const tc = await getTranslations('common');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/" className="hover:text-white">
          {tc('home')}
        </Link>
        <span>{tc('breadcrumbSeparator')}</span>
        <span className="text-white">{t('title')}</span>
      </nav>

      <h1 className="mb-6 text-3xl font-extrabold sm:text-4xl">{t('title')}</h1>

      <div className="space-y-8 text-slate-300 leading-relaxed">
        <p className="text-lg">{t('intro')}</p>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-white">
            {t('missionTitle')}
          </h2>
          <p>{t('missionText')}</p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-white">
            {t('whatWeTrackTitle')}
          </h2>
          <p>{t('whatWeTrackIntro')}</p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>{t('whatWeTrackItem1')}</li>
            <li>{t('whatWeTrackItem2')}</li>
            <li>{t('whatWeTrackItem3')}</li>
            <li>{t('whatWeTrackItem4')}</li>
            <li>{t('whatWeTrackItem5')}</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-white">
            {t('dataSourcesTitle')}
          </h2>
          <p>{t('dataSourcesText')}</p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-white">
            {t('methodologyTitle')}
          </h2>
          <p>{t('methodologyText')}</p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-white">
            {t('accuracyTitle')}
          </h2>
          <p>{t('accuracyText')}</p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-white">
            {t('privacyTitle')}
          </h2>
          <p>
            {t('privacyText')}{' '}
            <Link
              href="/privacy"
              className="text-[#3b82f6] hover:underline"
            >
              Privacy Policy
            </Link>
            {' · '}
            <Link href="/terms" className="text-[#3b82f6] hover:underline">
              Terms of Service
            </Link>
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-2 text-xl font-bold text-white">
            {t('contactCtaTitle')}
          </h2>
          <p className="mb-4 text-slate-300">{t('contactCtaText')}</p>
          <Link
            href="/contact"
            className="inline-block rounded-xl bg-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb]"
          >
            {t('contactCtaButton')}
          </Link>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-white">
            {t('exploreCtaTitle')}
          </h2>
          <p className="mb-4">{t('exploreCtaText')}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/jobs"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#3b82f6]/30 hover:bg-white/10"
            >
              {t('browseJobs')}
            </Link>
            <Link
              href="/countries"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#3b82f6]/30 hover:bg-white/10"
            >
              {t('browseCountries')}
            </Link>
            <Link
              href="/calculator"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#3b82f6]/30 hover:bg-white/10"
            >
              {t('openCalculator')}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
