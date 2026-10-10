import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { UploadModal } from './components/UploadModal';
import { KpiCards } from './components/KpiCards';
import { FilterPanel } from './components/FilterPanel';
import { ChartGrid } from './components/ChartGrid';
import { DataTable } from './components/DataTable';
import { SummarySection } from './components/SummarySection';
import { ExportModal } from './components/ExportModal';
import { Dataset, FilterState, ChartConfig, ChartType } from './types/analytics';
import { filterDataset } from './utils/dataProcessor';
import { SAMPLE_DATASETS } from './utils/sampleData';
import { analyzeDataset } from './utils/dataProcessor';
import * as XLSX from 'xlsx';
import {
  BarChart3,
  PieChart,
  Table2,
  FileText,
  Download,
  Share2,
  Plus,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [currentTab, setCurrentTab] = useState<'overview' | 'charts' | 'table' | 'summary'>('overview');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categorical: {},
    numeric: {},
    dates: {},
  });

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Compute filtered dataset
  const filteredData = useMemo(() => {
    if (!dataset) return [];
    return filterDataset(dataset.data, filters, dataset.columns);
  }, [dataset, filters]);

  // Map of column metadata for O(1) lookups
  const columnMetaMap = useMemo(() => {
    if (!dataset) return new Map();
    return new Map(dataset.columns.map((c) => [c.name, c]));
  }, [dataset]);

  const handleDatasetLoaded = (newDataset: Dataset) => {
    setDataset(newDataset);
    // Reset filters
    setFilters({
      search: '',
      categorical: {},
      numeric: {},
      dates: {},
    });
    setCurrentTab('overview');
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // Ignore if canvas confetti fails in sandbox
    }
  };

  const handleLoadSample = () => {
    const sample = SAMPLE_DATASETS[0];
    const rawData = sample.getData();
    const newDataset = analyzeDataset(rawData, `${sample.title}.csv`, rawData.length * 95);
    handleDatasetLoaded(newDataset);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      categorical: {},
      numeric: {},
      dates: {},
    });
  };

  const handleUpdateChart = (updatedChart: ChartConfig) => {
    if (!dataset) return;
    setDataset({
      ...dataset,
      charts: dataset.charts.map((c) => (c.id === updatedChart.id ? updatedChart : c)),
    });
  };

  const handleRemoveChart = (id: string) => {
    if (!dataset) return;
    setDataset({
      ...dataset,
      charts: dataset.charts.filter((c) => c.id !== id),
    });
  };

  const handleAddChart = () => {
    if (!dataset || dataset.columns.length === 0) return;
    const catCol = dataset.columns.find((c) => c.type === 'categorical') || dataset.columns[0];
    const numCol = dataset.columns.find((c) => c.type === 'numeric');

    const newChart: ChartConfig = {
      id: `custom_chart_${Date.now()}`,
      title: numCol ? `${numCol.name} by ${catCol.name}` : `Distribution of ${catCol.name}`,
      type: 'bar',
      xColumn: catCol.name,
      yColumn: numCol ? numCol.name : undefined,
      aggregation: numCol ? 'sum' : 'count',
    };

    setDataset({
      ...dataset,
      charts: [...dataset.charts, newChart],
    });
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the current dashboard?')) {
      setDataset(null);
      setFilters({ search: '', categorical: {}, numeric: {}, dates: {} });
    }
  };

  const handleExportCsv = () => {
    if (!dataset || filteredData.length === 0) return;
    const cleanName = dataset.fileName.replace(/\.[^/.]+$/, '');
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${cleanName}_filtered.csv`;
    link.click();
  };

  const handleExportExcel = () => {
    if (!dataset || filteredData.length === 0) return;
    const cleanName = dataset.fileName.replace(/\.[^/.]+$/, '');
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Filtered Data');
    XLSX.writeFile(wb, `${cleanName}_filtered.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onLoadSample={handleLoadSample}
        onReset={handleReset}
        hasData={!!dataset}
        fileName={dataset?.fileName}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {!dataset ? (
          /* Landing Screen with File Upload and Sample Dataset Selector */
          <UploadModal
            isOpen={false}
            onClose={() => {}}
            onDatasetLoaded={handleDatasetLoaded}
            isInitialScreen={true}
          />
        ) : (
          /* Populated Analytics Dashboard */
          <>
            {/* Top Context Subheader */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800 no-print">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {dataset.fileName}
                  </h2>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    ({dataset.rowCount.toLocaleString()} rows · {dataset.columnCount} columns)
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time analytics engine active · Changes update dynamically across charts and tables
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExportOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Export & Report</span>
                </button>
              </div>
            </div>

            {/* KPI Stat Cards */}
            <KpiCards
              dataset={dataset}
              filteredCount={filteredData.length}
              filteredData={filteredData}
            />

            {/* Interactive Filters Panel */}
            <div className="no-print">
              <FilterPanel
                columns={dataset.columns}
                filters={filters}
                onFilterChange={setFilters}
                onClearAll={handleClearFilters}
                filteredCount={filteredData.length}
                totalCount={dataset.rowCount}
              />
            </div>

            {/* Tab Views */}
            {currentTab === 'overview' && (
              <div className="space-y-6">
                {/* Visualizations Section */}
                <ChartGrid
                  charts={dataset.charts}
                  filteredData={filteredData}
                  columns={dataset.columns}
                  columnMetaMap={columnMetaMap}
                  onUpdateChart={handleUpdateChart}
                  onRemoveChart={handleRemoveChart}
                  onAddChart={handleAddChart}
                  isDarkMode={isDarkMode}
                />

                {/* Data Exploration Table Section */}
                <div>
                  <div className="flex items-center justify-between mb-3 no-print">
                    <div className="flex items-center gap-2">
                      <Table2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Data Records Preview
                      </h3>
                    </div>
                  </div>
                  <DataTable
                    data={filteredData}
                    totalRowsCount={dataset.rowCount}
                    columns={dataset.columns}
                    onExportCsv={handleExportCsv}
                    onExportExcel={handleExportExcel}
                  />
                </div>

                {/* Statistical Narrative */}
                <SummarySection
                  dataset={dataset}
                  filteredCount={filteredData.length}
                />
              </div>
            )}

            {currentTab === 'charts' && (
              <div className="space-y-6">
                <ChartGrid
                  charts={dataset.charts}
                  filteredData={filteredData}
                  columns={dataset.columns}
                  columnMetaMap={columnMetaMap}
                  onUpdateChart={handleUpdateChart}
                  onRemoveChart={handleRemoveChart}
                  onAddChart={handleAddChart}
                  isDarkMode={isDarkMode}
                />
              </div>
            )}

            {currentTab === 'table' && (
              <div className="space-y-4">
                <DataTable
                  data={filteredData}
                  totalRowsCount={dataset.rowCount}
                  columns={dataset.columns}
                  onExportCsv={handleExportCsv}
                  onExportExcel={handleExportExcel}
                />
              </div>
            )}

            {currentTab === 'summary' && (
              <div className="space-y-6">
                <SummarySection
                  dataset={dataset}
                  filteredCount={filteredData.length}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Upload Modal (when opened from navigation button) */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDatasetLoaded={handleDatasetLoaded}
      />

      {/* Export Modal */}
      {dataset && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          filteredData={filteredData}
          fileName={dataset.fileName}
          onPrintReport={handlePrint}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-4 no-print transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Smart Data Analytics Dashboard</span>
            <span aria-hidden="true">·</span>
            <span>Client-side secure spreadsheet processing</span>
          </div>
          <div className="flex items-center gap-3">
            <span>CSV, XLSX, XLS supported</span>
            <span aria-hidden="true">·</span>
            <span>Chart.js visualization engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
