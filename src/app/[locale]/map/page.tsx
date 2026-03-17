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
    </div>
  );
}
