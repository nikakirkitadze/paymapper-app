'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { slugify } from '@/lib/formatters';
import { trackSearchUsage } from '@/lib/analytics';

const countries = [
  { name: 'United States', slug: 'united-states' },
  { name: 'United Kingdom', slug: 'united-kingdom' },
  { name: 'Germany', slug: 'germany' },
  { name: 'France', slug: 'france' },
  { name: 'Canada', slug: 'canada' },
  { name: 'Australia', slug: 'australia' },
  { name: 'Netherlands', slug: 'netherlands' },
  { name: 'Switzerland', slug: 'switzerland' },
  { name: 'Sweden', slug: 'sweden' },
  { name: 'Norway', slug: 'norway' },
  { name: 'Denmark', slug: 'denmark' },
  { name: 'Ireland', slug: 'ireland' },
  { name: 'Spain', slug: 'spain' },
  { name: 'Italy', slug: 'italy' },
  { name: 'Portugal', slug: 'portugal' },
  { name: 'Poland', slug: 'poland' },
  { name: 'Japan', slug: 'japan' },
  { name: 'South Korea', slug: 'south-korea' },
  { name: 'Singapore', slug: 'singapore' },
  { name: 'India', slug: 'india' },
  { name: 'Brazil', slug: 'brazil' },
  { name: 'Mexico', slug: 'mexico' },
  { name: 'Argentina', slug: 'argentina' },
  { name: 'Chile', slug: 'chile' },
  { name: 'Israel', slug: 'israel' },
  { name: 'UAE', slug: 'uae' },
  { name: 'New Zealand', slug: 'new-zealand' },
  { name: 'Belgium', slug: 'belgium' },
  { name: 'Austria', slug: 'austria' },
  { name: 'Finland', slug: 'finland' },
  { name: 'Czech Republic', slug: 'czech-republic' },
  { name: 'Romania', slug: 'romania' },
];

export default function HeroSearch() {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState('');
  const [countrySlug, setCountrySlug] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!jobTitle.trim() || !countrySlug) return;

    const jobSlug = slugify(jobTitle.trim());
    trackSearchUsage(jobTitle.trim(), 'hero_search');
    router.push(`/salary/${jobSlug}-${countrySlug}`);
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0f1e] via-[#0f172a] to-[#0a0f1e] py-24 sm:py-32">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#3b82f6]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[400px] w-[400px] rounded-full bg-[#8b5cf6]/10 blur-[100px]" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          Explore Salaries{' '}
          <span className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">
            Worldwide
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          className="mx-auto mt-5 max-w-2xl text-lg text-slate-400 sm:text-xl"
        >
          Compare salaries, cost of living, and purchasing power across 30+
          countries
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
          className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Job title (e.g. Software Engineer)"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-white placeholder-slate-500 backdrop-blur-sm transition-colors focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
            required
          />

          <select
            value={countrySlug}
            onChange={(e) => setCountrySlug(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-white backdrop-blur-sm transition-colors focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] sm:w-52"
            required
          >
            <option value="" disabled className="bg-[#0f172a]">
              Select country
            </option>
            {countries.map((c) => (
              <option
                key={c.slug}
                value={c.slug}
                className="bg-[#0f172a] text-white"
              >
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-xl bg-[#3b82f6] px-8 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-[#2563eb] hover:shadow-blue-500/40 active:scale-[0.98]"
          >
            Search
          </button>
        </motion.form>
      </div>
    </section>
  );
}
