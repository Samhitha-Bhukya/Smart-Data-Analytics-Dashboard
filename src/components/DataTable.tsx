import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Search,
  Filter,
} from 'lucide-react';
import { ColumnMeta } from '../types/analytics';
import { parseNumeric, isNumeric } from '../utils/dataProcessor';

interface DataTableProps {
  data: Record<string, any>[];
  totalRowsCount: number;
  columns: ColumnMeta[];
  onExportCsv: () => void;
  onExportExcel: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  totalRowsCount,
  columns,
  onExportCsv,
  onExportExcel,
}) => {
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [localSearch, setLocalSearch] = useState<string>('');

  // Local search filter
  const searchedData = useMemo(() => {
    if (!localSearch.trim()) return data;
    const q = localSearch.toLowerCase().trim();
    return data.filter((row) =>
      Object.values(row).some((val) => val !== null && val !== undefined && String(val).toLowerCase().includes(q))
    );
  }, [data, localSearch]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return searchedData;
    const colMeta = columns.find((c) => c.name === sortColumn);
    const isNum = colMeta?.type === 'numeric';

    return [...searchedData].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined || valA === '') return 1;
      if (valB === null || valB === undefined || valB === '') return -1;

      if (isNum && isNumeric(valA) && isNumeric(valB)) {
        const diff = parseNumeric(valA) - parseNumeric(valB);
        return sortDirection === 'asc' ? diff : -diff;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      const comp = strA.localeCompare(strB);
      return sortDirection === 'asc' ? comp : -comp;
    });
  }, [searchedData, sortColumn, sortDirection, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, safePage, pageSize]);

  const handleSort = (colName: string) => {
    if (sortColumn === colName) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(colName);
      setSortDirection('asc');
    }
  };

  const startRow = sortedData.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endRow = Math.min(safePage * pageSize, sortedData.length);

  return (
    <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden flex flex-col">
      {/* Table Action Controls */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Table Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Quick search in table..."
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Rows per page & Export */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono text-xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onExportCsv}
              className="px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-1"
              title="Export filtered records as CSV"
            >
              <Download className="w-3 h-3 text-blue-500" />
              <span>CSV</span>
            </button>
            <button
              onClick={onExportExcel}
              className="px-2.5 py-1.5 font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
              title="Export filtered records as Excel (.xlsx)"
            >
              <Download className="w-3 h-3" />
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Container with Horizontal Scrolling */}
      <div className="overflow-x-auto flex-1 max-h-[560px]">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900/80 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-12 text-center">
                #
              </th>
              {columns.map((col) => {
                const isSorted = sortColumn === col.name;
                const isNum = col.type === 'numeric';
                return (
                  <th
                    key={col.name}
                    onClick={() => handleSort(col.name)}
                    className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none whitespace-nowrap ${
                      isSorted
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                        : 'text-slate-700 dark:text-slate-300'
                    } ${isNum ? 'text-right' : 'text-left'}`}
                  >
                    <div className={`flex items-center gap-1.5 ${isNum ? 'justify-end' : 'justify-start'}`}>
                      <span>{col.name}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-500 font-mono">
                        {col.type}
                      </span>
                      {isSorted ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-40 shrink-0" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800/90 divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-xs text-slate-400">
                  No records matching current filters or search term.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rIdx) => {
                const rowNum = (safePage - 1) * pageSize + rIdx + 1;
                return (
                  <tr
                    key={rIdx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    <td className="px-3 py-2 text-[11px] font-mono tabular-nums text-slate-400 text-center">
                      {rowNum}
                    </td>
                    {columns.map((col) => {
                      const val = row[col.name];
                      const isNum = col.type === 'numeric';
                      const isNull = val === null || val === undefined || val === '';
                      return (
                        <td
                          key={col.name}
                          className={`px-3 py-2 whitespace-nowrap text-slate-800 dark:text-slate-200 ${
                            isNum ? 'text-right font-mono tabular-nums' : 'text-left'
                          } ${isNull ? 'text-slate-400 dark:text-slate-600 italic' : ''}`}
                        >
                          {isNull ? '(empty)' : String(val)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
          Showing <span>{startRow}</span> to <span>{endRow}</span> of <span>{sortedData.length.toLocaleString()}</span> filtered rows
          {sortedData.length !== totalRowsCount && (
            <span className="text-slate-400"> (from {totalRowsCount.toLocaleString()} total)</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={safePage <= 1}
            className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-2 text-xs font-mono tabular-nums text-slate-700 dark:text-slate-300">
            Page {safePage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={safePage >= totalPages}
            className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
