import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { getAlternates } from '@/i18n/config';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('privacyTitle', { appName: 'PayMapper' }),
    description: t('privacyDescription'),
    alternates: getAlternates('/privacy'),
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations('privacy');
  const tc = await getTranslations('common');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/" className="hover:text-white">{tc('home')}</Link>
        <span>/</span>
        <span className="text-white">{t('title')}</span>
      </nav>

      <h1 className="mb-8 text-3xl font-extrabold sm:text-4xl">{t('title')}</h1>

      <div className="space-y-6 text-slate-300 leading-relaxed">
        <p className="text-slate-400 text-sm">{t('lastUpdated')}</p>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">{t('section1Title')}</h2>
          <p>{t('section1Intro')}</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>{t('section1Item1')}</li>
            <li>{t('section1Item2')}</li>
            <li>{t('section1Item3')}</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">{t('section2Title')}</h2>
          <p>{t('section2Intro')}</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>{t('section2Item1')}</li>
            <li>{t('section2Item2')}</li>
            <li>{t('section2Item3')}</li>
            <li>{t('section2Item4')}</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">{t('section3Title')}</h2>
          <p>{t('section3Intro')}</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>{t('section3Item1')}</li>
            <li>{t('section3Item2')}</li>
          </ul>
          <p className="mt-2">{t('section3Outro')}</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">{t('section4Title')}</h2>
          <p>{t('section4Text')}</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">{t('section5Title')}</h2>
          <p>{t('section5Text')}</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">{t('section6Title')}</h2>
          <p>{t('section6Intro')}</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>{t('section6Item1')}</li>
            <li>{t('section6Item2')}</li>
            <li>{t('section6Item3')}</li>
            <li>{t('section6Item4')}</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">{t('section7Title')}</h2>
          <p>{t('section7Text')}</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">{t('section8Title')}</h2>
          <p>{t('section8Text')}</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">{t('section9Title')}</h2>
          <p>
            {t('section9Text')}{' '}
            <a href="mailto:contact@paymapper.app" className="text-[#3b82f6] hover:underline">
              contact@paymapper.app
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
