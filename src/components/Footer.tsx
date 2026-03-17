import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

export default async function Footer() {
  const t = await getTranslations('footer');

  const navigation = {
    explore: [
      { label: t('searchSalaries'), href: '/search' as const },
      { label: t('compare'), href: '/compare' as const },
      { label: t('worldMap'), href: '/map' as const },
      { label: t('jobs'), href: '/jobs' as const },
      { label: t('countries'), href: '/countries' as const },
      { label: t('calculator'), href: '/calculator' as const },
      { label: t('topPaying'), href: '/top-paying' as const },
    ],
    legal: [
      { label: t('privacyPolicy'), href: '/privacy' as const },
      { label: t('termsOfService'), href: '/terms' as const },
    ],
  };

  return (
    <footer className="relative mt-20">
      <div className="section-divider" />
      <div className="bg-[#060a16] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Company info */}
            <div>
              <Link href="/" className="flex items-center gap-2 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-[#3b82f6]"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="text-lg font-bold">PayMapper</span>
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {t('description')}
              </p>
            </div>

            {/* Explore */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                {t('explore')}
              </h3>
              <ul className="mt-4 space-y-2">
                {navigation.explore.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                {t('legal')}
              </h3>
              <ul className="mt-4 space-y-2">
                {navigation.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 border-t border-white/10 pt-6 text-center">
            <p className="text-xs text-slate-500">
              {t('copyright', { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
