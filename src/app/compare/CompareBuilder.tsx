'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { countryCodeToFlag } from '@/lib/utils';

interface CompareBuilderProps {
  jobs: { slug: string; title: string }[];
  countries: { slug: string; name: string; code: string }[];
}

export default function CompareBuilder({ jobs, countries }: CompareBuilderProps) {
  const router = useRouter();
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
      router.push(`/compare/${selectedJob}/${selectedCountries.join('-vs-')}`);
    }
  };

  const canCompare = selectedJob && selectedCountries.length >= 2;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <h2 className="mb-6 text-xl font-bold text-white">Build Your Comparison</h2>

      {/* Step 1: Job select */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-slate-400">
          1. Select a job title
        </label>
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/30"
        >
          <option value="">Choose a job...</option>
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
          2. Select countries to compare (2-5)
        </label>

        {/* Selected chips */}
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
              ? 'Maximum 5 countries selected'
              : 'Add a country...'}
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
          ? 'Select a job to continue'
          : selectedCountries.length < 2
            ? `Select ${2 - selectedCountries.length} more ${selectedCountries.length === 1 ? 'country' : 'countries'}`
            : 'Compare Salaries'}
      </button>
    </div>
  );
}
