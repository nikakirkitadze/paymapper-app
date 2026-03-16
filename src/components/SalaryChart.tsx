'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';

// Register all necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface SalaryChartProps {
  data: ChartData<'bar'> | ChartData<'line'> | ChartData<'doughnut'>;
  type: 'bar' | 'line' | 'doughnut';
  height?: number;
}

const baseOptions: ChartOptions<'bar' | 'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#e2e8f0',
        font: { size: 12 },
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f8fafc',
      bodyColor: '#cbd5e1',
      borderColor: '#334155',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
    },
  },
  scales: {
    x: {
      ticks: { color: '#94a3b8', font: { size: 11 } },
      grid: { color: 'rgba(148, 163, 184, 0.08)' },
      border: { color: 'rgba(148, 163, 184, 0.15)' },
    },
    y: {
      ticks: { color: '#94a3b8', font: { size: 11 } },
      grid: { color: 'rgba(148, 163, 184, 0.08)' },
      border: { color: 'rgba(148, 163, 184, 0.15)' },
    },
  },
};

const doughnutOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#e2e8f0',
        font: { size: 12 },
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f8fafc',
      bodyColor: '#cbd5e1',
      borderColor: '#334155',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
    },
  },
};

export default function SalaryChart({
  data,
  type,
  height = 350,
}: SalaryChartProps) {
  return (
    <div
      className="w-full rounded-2xl border border-white/10 bg-[#0f172a] p-4 sm:p-6"
      style={{ height }}
    >
      {type === 'bar' && (
        <Bar data={data as ChartData<'bar'>} options={baseOptions as ChartOptions<'bar'>} />
      )}
      {type === 'line' && (
        <Line data={data as ChartData<'line'>} options={baseOptions as ChartOptions<'line'>} />
      )}
      {type === 'doughnut' && (
        <Doughnut
          data={data as ChartData<'doughnut'>}
          options={doughnutOptions}
        />
      )}
    </div>
  );
}
