import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { getAlternates } from '@/i18n/config';
import MapClient from './MapClient';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('mapTitle', { appName: 'PayMapper' }),
    description: t('mapDescription'),
    alternates: getAlternates('/map'),
  };
}

export default async function MapPage() {
  const t = await getTranslations('map');

  let jobs: { slug: string; title: string }[] = [];

  try {
    jobs = await prisma.job.findMany({
      select: { slug: true, title: true },
      orderBy: { title: 'asc' },
    });
  } catch {
    // Continue with empty jobs
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-extrabold">{t('title')}</h1>
      <p className="mb-8 text-slate-400">
        {t('subtitle')}
      </p>
      <MapClient jobs={jobs} />

      {/* Explanatory content */}
      <div className="mt-12 max-w-3xl">
        <h2 className="mb-4 text-xl font-bold">{t('aboutMapTitle')}</h2>
        <div className="space-y-3 text-sm leading-relaxed text-slate-400">
          <p>{t('aboutMapP1')}</p>
          <p>{t('aboutMapP2')}</p>
          <p>{t('aboutMapP3')}</p>
        </div>
      </div>
    </div>
  );
}
