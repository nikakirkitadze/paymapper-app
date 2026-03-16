'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/formatters';

interface SalaryCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

function TrendIndicator({ trend }: { trend: 'up' | 'down' | 'neutral' }) {
  if (trend === 'up') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-3.5 w-3.5"
        >
          <path
            fillRule="evenodd"
            d="M8 3.293l4.354 4.353-.708.708L8.5 5.207V13h-1V5.207L4.354 8.354l-.708-.708L8 3.293z"
            clipRule="evenodd"
          />
        </svg>
        Above avg
      </span>
    );
  }

  if (trend === 'down') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-3.5 w-3.5 rotate-180"
        >
          <path
            fillRule="evenodd"
            d="M8 3.293l4.354 4.353-.708.708L8.5 5.207V13h-1V5.207L4.354 8.354l-.708-.708L8 3.293z"
            clipRule="evenodd"
          />
        </svg>
        Below avg
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className="h-3.5 w-3.5"
      >
        <path d="M2 8h12" stroke="currentColor" strokeWidth={2} />
      </svg>
      Average
    </span>
  );
}

export default function SalaryCard({
  title,
  value,
  subtitle,
  icon,
  trend,
}: SalaryCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 stat-glow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">
            {formatCurrency(value)}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-3">
              <TrendIndicator trend={trend} />
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#3b82f6]/10 text-[#3b82f6]">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
