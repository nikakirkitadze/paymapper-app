'use client';

import { useState, useEffect, useRef, useCallback, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { SearchResult } from '@/lib/types';

interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
}

export default function SearchAutocomplete({
  placeholder = 'Search jobs or countries...',
  className = '',
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ------------------------------------------------------------------
  // Debounced fetch
  // ------------------------------------------------------------------

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data: SearchResult[] = await res.json();
        setResults(data);
        setIsOpen(data.length > 0);
        setActiveIndex(-1);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchResults]);

  // ------------------------------------------------------------------
  // Close dropdown when clicking outside
  // ------------------------------------------------------------------

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ------------------------------------------------------------------
  // Navigate to selected result
  // ------------------------------------------------------------------

  function navigateTo(result: SearchResult) {
    setIsOpen(false);
    setQuery('');
    if (result.type === 'job') {
      router.push(`/jobs/${result.slug}`);
    } else {
      router.push(`/countries/${result.slug}`);
    }
  }

  // ------------------------------------------------------------------
  // Keyboard navigation
  // ------------------------------------------------------------------

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0,
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1,
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < results.length) {
          navigateTo(results[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  }

  // ------------------------------------------------------------------
  // Group results by type
  // ------------------------------------------------------------------

  const jobs = results.filter((r) => r.type === 'job');
  const countries = results.filter((r) => r.type === 'country');

  // Build flat ordered list for keyboard index tracking
  const flatResults = [...jobs, ...countries];

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
        <input
          ref={inputRef}
          id="search-autocomplete"
          name="search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition-colors focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="search-listbox"
        />
        {isLoading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-[#3b82f6]" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && flatResults.length > 0 && (
          <motion.ul
            ref={listRef}
            id="search-listbox"
            role="listbox"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#1e293b] py-2 shadow-xl"
          >
            {jobs.length > 0 && (
              <>
                <li className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Jobs
                </li>
                {jobs.map((result) => {
                  const idx = flatResults.indexOf(result);
                  return (
                    <li
                      key={`job-${result.slug}`}
                      role="option"
                      aria-selected={idx === activeIndex}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => navigateTo(result)}
                      className={`cursor-pointer px-4 py-2 text-sm transition-colors ${
                        idx === activeIndex
                          ? 'bg-[#3b82f6]/15 text-white'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span>{result.title}</span>
                      {result.category && (
                        <span className="ml-2 text-xs text-slate-500">
                          {result.category}
                        </span>
                      )}
                    </li>
                  );
                })}
              </>
            )}

            {countries.length > 0 && (
              <>
                <li className="mt-1 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Countries
                </li>
                {countries.map((result) => {
                  const idx = flatResults.indexOf(result);
                  return (
                    <li
                      key={`country-${result.slug}`}
                      role="option"
                      aria-selected={idx === activeIndex}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => navigateTo(result)}
                      className={`cursor-pointer px-4 py-2 text-sm transition-colors ${
                        idx === activeIndex
                          ? 'bg-[#3b82f6]/15 text-white'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      {result.countryCode && (
                        <span className="mr-2 text-xs">{result.countryCode}</span>
                      )}
                      <span>{result.title}</span>
                    </li>
                  );
                })}
              </>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
