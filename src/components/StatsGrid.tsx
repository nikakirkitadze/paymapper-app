'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatItem {
  label: string;
  value: string;
  icon?: ReactNode;
  change?: string;
}

interface StatsGridProps {
  stats: StatItem[];
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={item}
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">{stat.label}</p>
            {stat.icon && (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3b82f6]/10 text-[#3b82f6]">
                {stat.icon}
              </div>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white">
            {stat.value}
          </p>
          {stat.change && (
            <p
              className={`mt-1 text-xs font-medium ${
                stat.change.startsWith('+')
                  ? 'text-emerald-400'
                  : stat.change.startsWith('-')
                    ? 'text-red-400'
                    : 'text-slate-500'
              }`}
            >
              {stat.change}
            </p>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
