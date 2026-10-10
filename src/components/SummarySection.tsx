import React from 'react';
import { ColumnMeta, Dataset } from '../types/analytics';
import { FileText, Sparkles, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';

interface SummarySectionProps {
  dataset: Dataset;
  filteredCount: number;
}

export const SummarySection: React.FC<SummarySectionProps> = ({ dataset, filteredCount }) => {
  const numericCols = dataset.columns.filter((c) => c.type === 'numeric');
  const catCols = dataset.columns.filter((c) => c.type === 'categorical');
  const dateCols = dataset.columns.filter((c) => c.type === 'date');

  return (
    <div className="space-y-6">
      {/* Human Narrative Summary Card */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 dark:from-slate-800/90 dark:via-slate-800/80 dark:to-slate-800/90 border border-blue-200/80 dark:border-slate-700 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-blue-800 dark:text-blue-300">
          <Sparkles className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Automated Dataset Analysis Narrative
          </h3>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
          {dataset.humanSummary}
        </p>
      </div>

      {/* Numeric Statistics Breakdown Table */}
      {numericCols.length > 0 && (
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Descriptive Statistics (Numeric Dimensions)
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {numericCols.length} quantitative measures
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60">
                <tr>
                  <th className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-300">Column Name</th>
                  <th className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-300 text-right">Sum</th>
                  <th className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-300 text-right">Mean (Avg)</th>
                  <th className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-300 text-right">Median</th>
                  <th className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-300 text-right">Min</th>
                  <th className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-300 text-right">Max</th>
                  <th className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-300 text-right">Missing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-800/90">
                {numericCols.map((col) => (
                  <tr key={col.name} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {col.name}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {col.sum?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {col.mean?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {col.median?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {col.min?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {col.max?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-500 whitespace-nowrap">
                      {col.missingCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categorical & Date Summaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Categorical Breakdown */}
        {catCols.length > 0 && (
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Categorical Attributes ({catCols.length})
            </h4>
            <div className="space-y-3">
              {catCols.map((col) => (
                <div key={col.name} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-200/60 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-900 dark:text-white">{col.name}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      {col.uniqueCount} distinct groups
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    Top values: {col.distinctValues.slice(0, 6).join(', ')}
                    {col.distinctValues.length > 6 ? ` (+${col.distinctValues.length - 6} more)` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Date Dimensions */}
        {dateCols.length > 0 ? (
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Temporal Dimensions ({dateCols.length})
            </h4>
            <div className="space-y-3">
              {dateCols.map((col) => (
                <div key={col.name} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-200/60 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 dark:text-white">{col.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">Date Field</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                    Time Span: {col.dateMin || '—'} → {col.dateMax || '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col justify-center">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
              Data Integrity & Quality
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              No calendar date fields detected in this dataset. All numeric dimensions and categorical labels are ready for cross-tabulation and drill-down.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
