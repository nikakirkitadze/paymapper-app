import { formatCurrency, formatPercent } from '@/lib/formatters';

interface ComparisonRow {
  country: string;
  gross: number;
  taxRate: number;
  net: number;
  rent: number;
  savings: number;
}

interface ComparisonTableProps {
  rows: ComparisonRow[];
}

/** Find the index of the best (highest or lowest) value for a given column. */
function bestIndex(
  rows: ComparisonRow[],
  key: keyof ComparisonRow,
  mode: 'max' | 'min',
): number {
  if (rows.length === 0) return -1;

  let bestIdx = 0;
  let bestVal = rows[0][key] as number;

  for (let i = 1; i < rows.length; i++) {
    const val = rows[i][key] as number;
    if (mode === 'max' ? val > bestVal : val < bestVal) {
      bestVal = val;
      bestIdx = i;
    }
  }

  return bestIdx;
}

export default function ComparisonTable({ rows }: ComparisonTableProps) {
  const bestGross = bestIndex(rows, 'gross', 'max');
  const bestTax = bestIndex(rows, 'taxRate', 'min');
  const bestNet = bestIndex(rows, 'net', 'max');
  const bestRent = bestIndex(rows, 'rent', 'min');
  const bestSavings = bestIndex(rows, 'savings', 'max');

  function highlightClass(rowIdx: number, bestIdx: number): string {
    return rowIdx === bestIdx ? 'text-emerald-400 font-semibold' : '';
  }

  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No comparison data available.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
      {/* Mobile card view */}
      <div className="md:hidden">
        {rows.map((row, idx) => (
          <div
            key={row.country}
            className={`border-b border-white/5 p-4 ${idx % 2 === 1 ? 'bg-white/[0.02]' : ''}`}
          >
            <p className="mb-2 text-sm font-medium text-white">{row.country}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-slate-400">Gross: </span>
                <span className={`text-slate-300 ${highlightClass(idx, bestGross)}`}>
                  {formatCurrency(row.gross)}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Tax: </span>
                <span className={`text-slate-300 ${highlightClass(idx, bestTax)}`}>
                  {formatPercent(row.taxRate)}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Net: </span>
                <span className={`text-slate-300 ${highlightClass(idx, bestNet)}`}>
                  {formatCurrency(row.net)}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Savings: </span>
                <span className={`text-slate-300 ${highlightClass(idx, bestSavings)}`}>
                  {formatCurrency(row.savings)}/yr
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <table className="hidden w-full min-w-[640px] text-left text-sm md:table">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.02]">
            <th className="px-5 py-3.5 font-semibold text-slate-400">
              Country
            </th>
            <th className="px-5 py-3.5 font-semibold text-slate-400">
              Gross Salary
            </th>
            <th className="px-5 py-3.5 font-semibold text-slate-400">
              Tax Rate
            </th>
            <th className="px-5 py-3.5 font-semibold text-slate-400">
              Net Salary
            </th>
            <th className="px-5 py-3.5 font-semibold text-slate-400">
              Avg Rent
            </th>
            <th className="px-5 py-3.5 font-semibold text-slate-400">
              Est. Savings
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.country}
              className={
                idx % 2 === 0
                  ? ''
                  : 'bg-white/[0.02]'
              }
            >
              <td className="px-5 py-3.5 font-medium text-white">
                {row.country}
              </td>
              <td
                className={`px-5 py-3.5 text-slate-300 ${highlightClass(idx, bestGross)}`}
              >
                {formatCurrency(row.gross)}
              </td>
              <td
                className={`px-5 py-3.5 text-slate-300 ${highlightClass(idx, bestTax)}`}
              >
                {formatPercent(row.taxRate)}
              </td>
              <td
                className={`px-5 py-3.5 text-slate-300 ${highlightClass(idx, bestNet)}`}
              >
                {formatCurrency(row.net)}
              </td>
              <td
                className={`px-5 py-3.5 text-slate-300 ${highlightClass(idx, bestRent)}`}
              >
                {formatCurrency(row.rent)}/mo
              </td>
              <td
                className={`px-5 py-3.5 text-slate-300 ${highlightClass(idx, bestSavings)}`}
              >
                {formatCurrency(row.savings)}/yr
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
