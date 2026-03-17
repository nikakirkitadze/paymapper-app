'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/formatters';
import { countryCodeToFlag } from '@/lib/utils';
import WorldMap from '@/components/WorldMap';
import type { MapMarker } from '@/components/WorldMap';

interface MapClientProps {
  jobs: { slug: string; title: string }[];
}

interface ApiMarker {
  countryCode: string;
  countryName: string;
  lat: number;
  lng: number;
  salary: number;
  slug: string;
}

export default function MapClient({ jobs }: MapClientProps) {
  const t = useTranslations('map');
  const [selectedJob, setSelectedJob] = useState(jobs[0]?.slug ?? '');
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedJob) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/map-data?job=${encodeURIComponent(selectedJob)}`,
        );
        if (res.ok) {
          const data = await res.json();
          const apiMarkers: ApiMarker[] = data.markers ?? [];

          setMarkers(
            apiMarkers.map((m) => ({
              lat: m.lat,
              lng: m.lng,
              label: m.countryName,
              value: m.salary,
              countryCode: m.countryCode,
            })),
          );
        }
      } catch {
        // Silently handle fetch errors
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedJob]);

  const sorted = [...markers].sort((a, b) => b.value - a.value);
  const maxSalary = sorted[0]?.value ?? 1;

  return (
    <div>
      {/* Job selector */}
      <div className="mb-6">
        <label
          htmlFor="job-select"
          className="mb-2 block text-sm font-medium text-slate-400"
        >
          {t('selectJobTitle')}
        </label>
        <select
          id="job-select"
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#3b82f6]/50 focus:ring-2 focus:ring-[#3b82f6]/20"
        >
          {jobs.map((job) => (
            <option key={job.slug} value={job.slug} className="bg-[#0a0f1e]">
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {/* Map area */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0f1e]/80">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#3b82f6]" />
          </div>
        )}

        <div className="h-[500px]">
          {markers.length > 0 ? (
            <WorldMap markers={markers} />
          ) : (
            !loading && (
              <div className="flex h-full items-center justify-center text-slate-500">
                {jobs.length > 0
                  ? t('selectJobPrompt')
                  : t('noJobData')}
              </div>
            )
          )}
        </div>
      </div>

      {/* Ranked list below the map */}
      {sorted.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-400">
            {t('salaryRanking')}
          </h3>
          <div className="space-y-2">
            {sorted.map((d, i) => {
              const pct = maxSalary > 0 ? (d.value / maxSalary) * 100 : 0;
              return (
                <div key={d.countryCode} className="flex items-center gap-3">
                  <span className="w-5 shrink-0 text-right text-xs font-bold text-slate-500">
                    {i + 1}
                  </span>
                  <span className="w-6 shrink-0 text-center text-lg">
                    {countryCodeToFlag(d.countryCode)}
                  </span>
                  <span className="w-28 shrink-0 truncate text-sm text-slate-300">
                    {d.label}
                  </span>
                  <div className="flex-1">
                    <div className="h-5 overflow-hidden rounded bg-white/5">
                      <div
                        className="h-full rounded bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] transition-all"
                        style={{
                          width: `${pct}%`,
                          minWidth: '4px',
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-20 shrink-0 text-right text-sm font-semibold text-white">
                    {formatCurrency(d.value, true)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
