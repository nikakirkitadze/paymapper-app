'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { countryCodeToFlag } from '@/lib/utils';
import { trackCompareUsage } from '@/lib/analytics';

interface CompareBuilderProps {
  jobs: { slug: string; title: string }[];
  countries: { slug: string; name: string; code: string }[];
}

export default function CompareBuilder({ jobs, countries }: CompareBuilderProps) {
  const router = useRouter();
  const t = useTranslations('compare');
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const addCountry = (slug: string) => {
    if (slug && !selectedCountries.includes(slug) && selectedCountries.length < 5) {
      setSelectedCountries([...selectedCountries, slug]);
    }
  };

  const removeCountry = (slug: string) => {
    setSelectedCountries(selectedCountries.filter((s) => s !== slug));
  };

  const handleCompare = () => {
    if (selectedJob && selectedCountries.length >= 2) {
      trackCompareUsage(selectedJob, selectedCountries);
      router.push(`/compare/${selectedJob}/${selectedCountries.join('-vs-')}`);
    }
  };

  const canCompare = selectedJob && selectedCountries.length >= 2;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <h2 className="mb-6 text-xl font-bold text-white">{t('buildComparison')}</h2>

      {/* Step 1: Job select */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-slate-400">
          {t('selectJob')}
        </label>
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/30"
        >
          <option value="">{t('chooseJob')}</option>
          {jobs.map((j) => (
            <option key={j.slug} value={j.slug}>
              {j.title}
            </option>
          ))}
        </select>
      </div>

      {/* Step 2: Country multi-select */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-slate-400">
          {t('selectCountries')}
        </label>

        {selectedCountries.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedCountries.map((slug) => {
              const c = countries.find((co) => co.slug === slug);
              if (!c) return null;
              return (
                <span
                  key={slug}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#3b82f6]/10 px-3 py-1.5 text-sm text-[#3b82f6]"
                >
                  {countryCodeToFlag(c.code)} {c.name}
                  <button
                    onClick={() => removeCountry(slug)}
                    className="ml-0.5 text-[#3b82f6]/60 hover:text-white"
                  >
                    &times;
                  </button>
                </span>
              );
            })}
          </div>
        )}

        <select
          value=""
          onChange={(e) => {
            addCountry(e.target.value);
          }}
          disabled={selectedCountries.length >= 5}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/30 disabled:opacity-40"
        >
          <option value="">
            {selectedCountries.length >= 5
              ? t('maxCountries')
              : t('addCountry')}
          </option>
          {countries
            .filter((c) => !selectedCountries.includes(c.slug))
            .map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
        </select>
      </div>

      {/* Compare button */}
      <button
        onClick={handleCompare}
        disabled={!canCompare}
        className="w-full rounded-xl bg-[#3b82f6] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {!selectedJob
          ? t('selectJobToContinue')
          : selectedCountries.length < 2
            ? t('selectMore', { count: 2 - selectedCountries.length })
            : t('compareSalaries')}
      </button>
    </div>
  );
}
