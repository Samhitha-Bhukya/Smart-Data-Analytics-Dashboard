import React from 'react';
import { Plus, BarChart3 } from 'lucide-react';
import { ChartConfig, ColumnMeta } from '../types/analytics';
import { ChartCard } from './ChartCard';

interface ChartGridProps {
  charts: ChartConfig[];
  filteredData: Record<string, any>[];
  columns: ColumnMeta[];
  columnMetaMap: Map<string, ColumnMeta>;
  onUpdateChart: (chart: ChartConfig) => void;
  onRemoveChart: (id: string) => void;
  onAddChart: () => void;
  isDarkMode: boolean;
}

export const ChartGrid: React.FC<ChartGridProps> = ({
  charts,
  filteredData,
  columns,
  columnMetaMap,
  onUpdateChart,
  onRemoveChart,
  onAddChart,
  isDarkMode,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Interactive Visualizations
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            ({charts.length} active)
          </span>
        </div>

        <button
          onClick={onAddChart}
          className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-900/60 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Chart</span>
        </button>
      </div>

      {charts.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No charts currently displayed. Click "Add Custom Chart" to create a new chart.
          </p>
          <button
            onClick={onAddChart}
            className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Chart
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {charts.map((chart) => (
            <ChartCard
              key={chart.id}
              config={chart}
              filteredData={filteredData}
              columns={columns}
              columnMetaMap={columnMetaMap}
              onUpdateConfig={onUpdateChart}
              onRemove={onRemoveChart}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};
