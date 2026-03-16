'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import { formatCurrency } from '@/lib/formatters';
import { CHART_COLORS } from '@/lib/constants';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface CostOfLivingData {
  rent: number;
  groceries: number;
  transport: number;
  utilities: number;
  internet: number;
  dining: number;
}

interface CostOfLivingBreakdownProps {
  data: CostOfLivingData;
}

export default function CostOfLivingBreakdown({
  data,
}: CostOfLivingBreakdownProps) {
  const categories = [
    { label: 'Rent', value: data.rent },
    { label: 'Groceries', value: data.groceries },
    { label: 'Transport', value: data.transport },
    { label: 'Utilities', value: data.utilities },
    { label: 'Internet', value: data.internet },
    { label: 'Dining Out', value: data.dining },
  ];

  const totalMonthly = categories.reduce((sum, c) => sum + c.value, 0);

  const chartData = {
    labels: categories.map((c) => c.label),
    datasets: [
      {
        label: 'Monthly Cost (USD)',
        data: categories.map((c) => c.value),
        backgroundColor: CHART_COLORS.slice(0, categories.length),
        borderColor: CHART_COLORS.slice(0, categories.length),
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (ctx) => ` ${formatCurrency(ctx.parsed.x ?? 0)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8',
          callback: (value) => formatCurrency(Number(value), true),
        },
        grid: { color: 'rgba(148, 163, 184, 0.08)' },
        border: { color: 'rgba(148, 163, 184, 0.15)' },
      },
      y: {
        ticks: { color: '#e2e8f0', font: { size: 12 } },
        grid: { display: false },
        border: { display: false },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Cost of Living Breakdown
        </h3>
        <span className="rounded-full bg-[#3b82f6]/10 px-3 py-1 text-sm font-medium text-[#3b82f6]">
          {formatCurrency(totalMonthly)}/mo
        </span>
      </div>

      <div style={{ height: 280 }}>
        <Bar data={chartData} options={options} />
      </div>

      {/* Summary list */}
      <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-white/10 pt-4 sm:grid-cols-3">
        {categories.map((c, i) => (
          <li key={c.label} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: CHART_COLORS[i] }}
            />
            <span className="text-slate-400">{c.label}:</span>
            <span className="font-medium text-slate-200">
              {formatCurrency(c.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
