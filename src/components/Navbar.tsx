import React from 'react';
import { BarChart3, Moon, Sun, UploadCloud, Sparkles, RefreshCw, Table2, PieChart, FileText } from 'lucide-react';

interface NavbarProps {
  currentTab: 'overview' | 'charts' | 'table' | 'summary';
  onSelectTab: (tab: 'overview' | 'charts' | 'table' | 'summary') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenUpload: () => void;
  onLoadSample: () => void;
  onReset: () => void;
  hasData: boolean;
  fileName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  isDarkMode,
  onToggleDarkMode,
  onOpenUpload,
  onLoadSample,
  onReset,
  hasData,
  fileName,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                Smart Data Analytics
              </span>
              {fileName && (
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px] sm:max-w-[260px]">
                  {fileName}
                </span>
              )}
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          {hasData && (
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onSelectTab('overview')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'overview'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => onSelectTab('charts')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'charts'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                <span>Charts Studio</span>
              </button>
              <button
                onClick={() => onSelectTab('table')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'table'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Data Table</span>
              </button>
              <button
                onClick={() => onSelectTab('summary')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  currentTab === 'summary'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Statistics</span>
              </button>
            </nav>
          )}

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {!hasData ? (
              <>
                <button
                  onClick={onLoadSample}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Sample Data</span>
                </button>
                <button
                  onClick={onOpenUpload}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors whitespace-nowrap flex items-center gap-1.5"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Spreadsheet</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onOpenUpload}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
                  title="Upload another dataset"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Upload New</span>
                </button>
                <button
                  onClick={onReset}
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Reset dashboard"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
