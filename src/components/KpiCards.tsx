import React, { useState } from 'react';
import { Database, Columns3, AlertTriangle, CopyCheck, Calculator, ChevronDown } from 'lucide-react';
import { Dataset, ColumnMeta, AggregationType } from '../types/analytics';
import { parseNumeric, isNumeric } from '../utils/dataProcessor';

interface KpiCardsProps {
  dataset: Dataset;
  filteredCount: number;
  filteredData: Record<string, any>[];
}

export const KpiCards: React.FC<KpiCardsProps> = ({ dataset, filteredCount, filteredData }) => {
  const numericColumns = dataset.columns.filter((c) => c.type === 'numeric');
  
  const [selectedColumn, setSelectedColumn] = useState<string>(
    numericColumns.length > 0 ? numericColumns[0].name : ''
  );
  const [aggType, setAggType] = useState<AggregationType>('sum');

  // Compute metric for selected column based on currently filtered rows
  let calculatedMetric: number | null = null;
  if (selectedColumn && filteredData.length > 0) {
    const values = filteredData
      .map((r) => r[selectedColumn])
      .filter(isNumeric)
      .map(parseNumeric);

    if (values.length > 0) {
      if (aggType === 'sum') {
        calculatedMetric = values.reduce((a, b) => a + b, 0);
      } else if (aggType === 'avg') {
        calculatedMetric = values.reduce((a, b) => a + b, 0) / values.length;
      } else if (aggType === 'min') {
        calculatedMetric = Math.min(...values);
      } else if (aggType === 'max') {
        calculatedMetric = Math.max(...values);
      } else if (aggType === 'count') {
        calculatedMetric = values.length;
      }
    }
  }

  const numericCount = dataset.columns.filter((c) => c.type === 'numeric').length;
  const categoricalCount = dataset.columns.filter((c) => c.type === 'categorical').length;
  const dateCount = dataset.columns.filter((c) => c.type === 'date').length;
  const totalCells = dataset.rowCount * dataset.columnCount;
  const missingRate = totalCells > 0 ? ((dataset.missingTotal / totalCells) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Records Card */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-medium">Dataset Records</span>
          <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {filteredCount.toLocaleString()}
          </span>
          {filteredCount !== dataset.rowCount && (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              / {dataset.rowCount.toLocaleString()}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          {filteredCount === dataset.rowCount ? 'All records active' : 'Filters currently active'}
        </p>
      </div>

      {/* 2. Total Columns Card */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-medium">Total Columns</span>
          <Columns3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
          {dataset.columnCount}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
          {numericCount} num · {categoricalCount} cat · {dateCount} date
        </p>
      </div>

      {/* 3. Missing Data Card */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-medium">Missing Values</span>
          <AlertTriangle className={`w-4 h-4 ${dataset.missingTotal > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
          {dataset.missingTotal.toLocaleString()}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          {missingRate}% of total cells
        </p>
      </div>

      {/* 4. Duplicate Records Card */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-medium">Duplicates</span>
          <CopyCheck className={`w-4 h-4 ${dataset.duplicateRows > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
          {dataset.duplicateRows.toLocaleString()}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          {dataset.duplicateRows === 0 ? 'Clean unique rows' : 'Duplicate rows identified'}
        </p>
      </div>

      {/* 5. Dynamic Metric Calculation Card */}
      <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-blue-900 dark:text-blue-300 mb-2">
          <div className="flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <select
              value={aggType}
              onChange={(e) => setAggType(e.target.value as AggregationType)}
              className="text-xs font-semibold bg-transparent text-blue-700 dark:text-blue-300 border-none focus:outline-none cursor-pointer"
            >
              <option value="sum" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Sum</option>
              <option value="avg" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Average</option>
              <option value="min" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Min</option>
              <option value="max" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Max</option>
              <option value="count" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Count</option>
            </select>
          </div>
          {numericColumns.length > 0 && (
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="text-xs font-medium bg-transparent text-slate-600 dark:text-slate-300 border-none focus:outline-none truncate max-w-[100px] cursor-pointer"
            >
              {numericColumns.map((col) => (
                <option key={col.name} value={col.name} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {col.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-blue-900 dark:text-blue-200 truncate">
          {calculatedMetric !== null
            ? calculatedMetric.toLocaleString(undefined, { maximumFractionDigits: 2 })
            : '—'}
        </div>
        <p className="text-[11px] text-blue-700/80 dark:text-blue-400/80 mt-1 truncate">
          {selectedColumn ? `${aggType.toUpperCase()} of ${selectedColumn}` : 'No numeric measure'}
        </p>
      </div>
    </div>
  );
};
