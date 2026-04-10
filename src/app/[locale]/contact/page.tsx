import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { getAlternates } from '@/i18n/config';
import { APP_NAME } from '@/lib/constants';

const CONTACT_EMAIL = 'contact@paymapper.app';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('contactTitle', { appName: APP_NAME }),
    description: t('contactDescription'),
    alternates: getAlternates('/contact'),
  };
}

export default async function ContactPage() {
  const t = await getTranslations('contact');
  const tc = await getTranslations('common');

  const reasons = [
    { title: t('reason1Title'), text: t('reason1Text') },
    { title: t('reason2Title'), text: t('reason2Text') },
    { title: t('reason3Title'), text: t('reason3Text') },
    { title: t('reason4Title'), text: t('reason4Text') },
    { title: t('reason5Title'), text: t('reason5Text') },
  ];

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

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-2 text-xl font-bold text-white">
            {t('emailTitle')}
          </h2>
          <p className="mb-4">{t('emailText')}</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
            {CONTACT_EMAIL}
          </a>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-white">
            {t('reasonsTitle')}
          </h2>
          <div className="space-y-4">
            {reasons.map((r) => (
              <div
                key={r.title}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
              >
                <h3 className="mb-1 text-base font-semibold text-white">
                  {r.title}
                </h3>
                <p className="text-sm text-slate-400">{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-white">
            {t('responseTitle')}
          </h2>
          <p>{t('responseText')}</p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-2 text-xl font-bold text-white">
            {t('beforeWritingTitle')}
          </h2>
          <p className="mb-4 text-slate-300">{t('beforeWritingText')}</p>
          <Link
            href="/faq"
            className="inline-block rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#3b82f6]/30 hover:bg-white/10"
          >
            {t('viewFaq')}
          </Link>
        </section>
      </div>
    </div>
  );
}
