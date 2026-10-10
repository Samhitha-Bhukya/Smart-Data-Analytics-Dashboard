import React from 'react';
import { Download, FileSpreadsheet, FileText, Printer, X, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredData: Record<string, any>[];
  fileName: string;
  onPrintReport: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  filteredData,
  fileName,
  onPrintReport,
}) => {
  if (!isOpen) return null;

  const baseCleanName = fileName.replace(/\.[^/.]+$/, '');

  const handleExportCsv = () => {
    if (filteredData.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${baseCleanName}_filtered.csv`;
    link.click();
    onClose();
  };

  const handleExportExcel = () => {
    if (filteredData.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered Data');

    XLSX.writeFile(workbook, `${baseCleanName}_filtered.xlsx`);
    onClose();
  };

  const handleTriggerPrint = () => {
    onClose();
    setTimeout(() => {
      onPrintReport();
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Export Filtered Dataset & Reports
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Includes {filteredData.length.toLocaleString()} records reflecting current filters.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-3">
          {/* CSV Export Option */}
          <div
            onClick={handleExportCsv}
            className="p-3.5 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl cursor-pointer hover:bg-blue-50/40 dark:hover:bg-slate-800/80 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Export as CSV (.csv)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Standard comma-separated format compatible with any analytical tool.
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </div>

          {/* Excel Export Option */}
          <div
            onClick={handleExportExcel}
            className="p-3.5 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl cursor-pointer hover:bg-emerald-50/40 dark:hover:bg-slate-800/80 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  Export as Excel (.xlsx)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Native Microsoft Excel spreadsheet workbook with parsed schema.
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
          </div>

          {/* Printable / PDF Report */}
          <div
            onClick={handleTriggerPrint}
            className="p-3.5 border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 rounded-xl cursor-pointer hover:bg-purple-50/40 dark:hover:bg-slate-800/80 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  Print / Export as PDF Report
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Generates print-optimized layout with KPI cards, charts, and summary tables.
                </p>
              </div>
            </div>
            <Printer className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
