import React, { useState } from 'react';
import { Search, Filter, RotateCcw, ChevronDown, ChevronUp, Calendar, Hash, Tag, X } from 'lucide-react';
import { ColumnMeta, FilterState } from '../types/analytics';

interface FilterPanelProps {
  columns: ColumnMeta[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClearAll: () => void;
  filteredCount: number;
  totalCount: number;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  columns,
  filters,
  onFilterChange,
  onClearAll,
  filteredCount,
  totalCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>(
    columns.find((c) => c.type === 'categorical')?.name || ''
  );

  const categoricalColumns = columns.filter((c) => c.type === 'categorical');
  const numericColumns = columns.filter((c) => c.type === 'numeric');
  const dateColumns = columns.filter((c) => c.type === 'date');

  // Count active filter conditions
  const activeCount =
    (filters.search ? 1 : 0) +
    Object.values(filters.categorical).reduce((acc, curr) => acc + (curr.length > 0 ? 1 : 0), 0) +
    Object.values(filters.numeric).reduce(
      (acc, curr) => acc + (curr.min !== undefined || curr.max !== undefined ? 1 : 0),
      0
    ) +
    Object.values(filters.dates).reduce(
      (acc, curr) => acc + (curr.start || curr.end ? 1 : 0),
      0
    );

  const handleSearchChange = (val: string) => {
    onFilterChange({
      ...filters,
      search: val,
    });
  };

  const handleToggleCategoryVal = (col: string, val: string) => {
    const currentList = filters.categorical[col] || [];
    const exists = currentList.includes(val);
    const updated = exists ? currentList.filter((v) => v !== val) : [...currentList, val];

    onFilterChange({
      ...filters,
      categorical: {
        ...filters.categorical,
        [col]: updated,
      },
    });
  };

  const handleNumericRangeChange = (col: string, type: 'min' | 'max', val: string) => {
    const num = val === '' ? undefined : Number(val);
    const currentRange = filters.numeric[col] || {};
    onFilterChange({
      ...filters,
      numeric: {
        ...filters.numeric,
        [col]: {
          ...currentRange,
          [type]: num,
        },
      },
    });
  };

  const handleDateRangeChange = (col: string, type: 'start' | 'end', val: string) => {
    const currentDate = filters.dates[col] || {};
    onFilterChange({
      ...filters,
      dates: {
        ...filters.dates,
        [col]: {
          ...currentDate,
          [type]: val || undefined,
        },
      },
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs transition-all">
      {/* Search & Top Action Bar */}
      <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Global Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search across all records..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Badges & Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            <span>{filteredCount.toLocaleString()}</span> of <span>{totalCount.toLocaleString()}</span> rows
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              activeCount > 0 || isExpanded
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                {activeCount}
              </span>
            )}
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {activeCount > 0 && (
            <button
              onClick={onClearAll}
              className="px-2.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors flex items-center gap-1"
              title="Clear all active filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Multi-Filter Panel */}
      {isExpanded && (
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-5 animate-in fade-in duration-100">
          {/* Categorical Filtering */}
          {categoricalColumns.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Tag className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Categorical Filters
                </span>
              </div>

              {/* Column Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {categoricalColumns.map((col) => {
                  const selCount = (filters.categorical[col.name] || []).length;
                  const isActive = activeCategoryTab === col.name;
                  return (
                    <button
                      key={col.name}
                      onClick={() => setActiveCategoryTab(col.name)}
                      className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{col.name}</span>
                      {selCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-current font-mono">
                          {selCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Values of selected column */}
              {activeCategoryTab && (
                <div className="mt-2.5 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200/80 dark:border-slate-700/80 max-h-36 overflow-y-auto">
                  <div className="flex flex-wrap gap-1.5">
                    {categoricalColumns
                      .find((c) => c.name === activeCategoryTab)
                      ?.distinctValues.map((val) => {
                        const isSelected = (filters.categorical[activeCategoryTab] || []).includes(val);
                        return (
                          <button
                            key={val}
                            onClick={() => handleToggleCategoryVal(activeCategoryTab, val)}
                            className={`px-2.5 py-1 text-xs rounded-md border transition-colors flex items-center gap-1 ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            <span>{val || '(Blank)'}</span>
                            {isSelected && <X className="w-3 h-3 ml-0.5" />}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Numeric Range Filters */}
          {numericColumns.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Hash className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Numeric Ranges
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {numericColumns.map((col) => {
                  const currentRange = filters.numeric[col.name] || {};
                  return (
                    <div
                      key={col.name}
                      className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {col.name}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                          [{col.min} – {col.max}]
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder={`Min (${col.min ?? 0})`}
                          value={currentRange.min ?? ''}
                          onChange={(e) => handleNumericRangeChange(col.name, 'min', e.target.value)}
                          className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono tabular-nums text-xs"
                        />
                        <input
                          type="number"
                          placeholder={`Max (${col.max ?? 100})`}
                          value={currentRange.max ?? ''}
                          onChange={(e) => handleNumericRangeChange(col.name, 'max', e.target.value)}
                          className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono tabular-nums text-xs"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date Range Filters */}
          {dateColumns.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Date Ranges
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {dateColumns.map((col) => {
                  const currentDates = filters.dates[col.name] || {};
                  return (
                    <div
                      key={col.name}
                      className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {col.name}
                        </span>
                        {col.dateMin && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {col.dateMin} → {col.dateMax}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={currentDates.start ?? ''}
                          onChange={(e) => handleDateRangeChange(col.name, 'start', e.target.value)}
                          className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white text-xs"
                        />
                        <input
                          type="date"
                          value={currentDates.end ?? ''}
                          onChange={(e) => handleDateRangeChange(col.name, 'end', e.target.value)}
                          className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
