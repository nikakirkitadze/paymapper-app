'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/formatters';
import { countryCodeToFlag } from '@/lib/utils';

interface TopPayingTabsProps {
  topCountries: {
    name: string;
    slug: string;
    code: string;
    avgSalary: number;
  }[];
  topJobs: {
    title: string;
    slug: string;
    category: string;
    avgSalary: number;
    countryCount: number;
  }[];
}

export default function TopPayingTabs({
  topCountries,
  topJobs,
}: TopPayingTabsProps) {
  const [activeTab, setActiveTab] = useState<'countries' | 'jobs'>('countries');

  const maxCountrySalary = topCountries[0]?.avgSalary ?? 1;
  const maxJobSalary = topJobs[0]?.avgSalary ?? 1;

  return (
    <div>
      {/* Tab buttons */}
      <div className="mb-8 flex gap-2">
        <button
          onClick={() => setActiveTab('countries')}
          className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'countries'
              ? 'bg-[#3b82f6] text-white'
              : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          Top Paying Countries
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'jobs'
              ? 'bg-[#3b82f6] text-white'
              : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          Highest Paying Jobs
        </button>
      </div>

      {activeTab === 'countries' && (
        <div>
          {/* Ranked table */}
          <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Country
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Avg Salary
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {topCountries.map((country, i) => (
                  <tr
                    key={country.slug}
                    className="transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="px-6 py-3 text-sm font-bold text-[#3b82f6]">
                      #{i + 1}
                    </td>
                    <td className="px-6 py-3">
                      <Link
                        href={`/countries/${country.slug}`}
                        className="flex items-center gap-2 text-sm font-medium text-white hover:text-[#3b82f6]"
                      >
                        <span>{countryCodeToFlag(country.code)}</span>
                        {country.name}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-semibold text-white">
                      {formatCurrency(country.avgSalary)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bar chart */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-6 text-lg font-bold">
              Average Tech Salary by Country
            </h2>
            <div className="space-y-3">
              {topCountries.slice(0, 15).map((country) => {
                const pct =
                  (country.avgSalary / maxCountrySalary) * 100;
                return (
                  <div key={country.slug} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">
                        {countryCodeToFlag(country.code)} {country.name}
                      </span>
                      <span className="font-semibold text-white">
                        {formatCurrency(country.avgSalary, true)}
                      </span>
                    </div>
                    <div className="h-5 overflow-hidden rounded-lg bg-white/5">
                      <div
                        className="h-full rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] transition-all"
                        style={{ width: `${pct}%`, minWidth: '4px' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div>
          {/* Ranked table */}
          <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Avg Salary
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Countries
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {topJobs.map((job, i) => (
                  <tr
                    key={job.slug}
                    className="transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="px-6 py-3 text-sm font-bold text-[#3b82f6]">
                      #{i + 1}
                    </td>
                    <td className="px-6 py-3">
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="text-sm font-medium text-white hover:text-[#3b82f6]"
                      >
                        {job.title}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-400">
                      {job.category}
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-semibold text-white">
                      {formatCurrency(job.avgSalary)}
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-slate-400">
                      {job.countryCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bar chart */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-6 text-lg font-bold">
              Global Average Salary by Job
            </h2>
            <div className="space-y-3">
              {topJobs.slice(0, 15).map((job) => {
                const pct = (job.avgSalary / maxJobSalary) * 100;
                return (
                  <div key={job.slug} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{job.title}</span>
                      <span className="font-semibold text-white">
                        {formatCurrency(job.avgSalary, true)}
                      </span>
                    </div>
                    <div className="h-5 overflow-hidden rounded-lg bg-white/5">
                      <div
                        className="h-full rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
                        style={{ width: `${pct}%`, minWidth: '4px' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
