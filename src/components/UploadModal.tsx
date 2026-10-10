import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle2, X, Sparkles, ArrowRight } from 'lucide-react';
import { parseFile, analyzeDataset } from '../utils/dataProcessor';
import { SAMPLE_DATASETS, SampleOption } from '../utils/sampleData';
import { Dataset } from '../types/analytics';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetLoaded: (dataset: Dataset) => void;
  isInitialScreen?: boolean;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDatasetLoaded,
  isInitialScreen = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    fileName: string;
    fileSize: number;
    rows: number;
    cols: number;
    sampleRows: Record<string, any>[];
    headers: string[];
    rawFileResult?: { data: Record<string, any>[]; fileName: string; fileSize: number };
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen && !isInitialScreen) return null;

  const handleProcessFile = async (file: File) => {
    setError(null);
    setLoading(true);
    setPreview(null);

    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const lowerName = file.name.toLowerCase();
    const isValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isValidExt) {
      setError('Unsupported file type. Please upload a CSV (.csv) or Excel spreadsheet (.xlsx, .xls).');
      setLoading(false);
      return;
    }

    if (file.size === 0) {
      setError('The selected file is empty (0 bytes). Please upload a valid dataset.');
      setLoading(false);
      return;
    }

    try {
      const parsed = await parseFile(file);
      if (parsed.data.length === 0) {
        throw new Error('Spreadsheet has no rows or data content.');
      }

      const headers = Object.keys(parsed.data[0] || {});
      setPreview({
        fileName: parsed.fileName,
        fileSize: parsed.fileSize,
        rows: parsed.data.length,
        cols: headers.length,
        sampleRows: parsed.data.slice(0, 5),
        headers,
        rawFileResult: parsed,
      });
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to read spreadsheet. Ensure file is not corrupted.');
      setLoading(false);
    }
  };

  const handleConfirmPreview = () => {
    if (!preview?.rawFileResult) return;
    try {
      const dataset = analyzeDataset(
        preview.rawFileResult.data,
        preview.rawFileResult.fileName,
        preview.rawFileResult.fileSize
      );
      onDatasetLoaded(dataset);
      setPreview(null);
      if (!isInitialScreen) onClose();
    } catch (err: any) {
      setError(err.message || 'Analysis failed.');
    }
  };

  const handleSelectSample = (sample: SampleOption) => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      try {
        const rawData = sample.getData();
        const dataset = analyzeDataset(rawData, `${sample.title}.csv`, rawData.length * 95);
        onDatasetLoaded(dataset);
        setLoading(false);
        if (!isInitialScreen) onClose();
      } catch (err: any) {
        setError(err.message || 'Sample loading failed.');
        setLoading(false);
      }
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const content = (
    <div className="w-full">
      {/* Header bar if modal */}
      {!isInitialScreen && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Upload New Spreadsheet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Replace current dataset with a new CSV, XLSX, or XLS file.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-sm text-red-700 dark:text-red-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-xs">Upload Error</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* File Preview Card */}
      {preview ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50/70 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {preview.fileName}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>{formatFileSize(preview.fileSize)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{preview.rows.toLocaleString()} rows</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{preview.cols} columns</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreview(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Choose Different File
                </button>
                <button
                  onClick={handleConfirmPreview}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Analyze Dataset</span>
                </button>
              </div>
            </div>

            {/* Preview sample rows */}
            <div className="mt-4 pt-3 border-t border-blue-200/60 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">
                Quick Preview (First 5 Rows):
              </p>
              <div className="overflow-x-auto max-h-48 border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-900">
                    <tr>
                      {preview.headers.map((h, i) => (
                        <th key={i} className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                    {preview.sampleRows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {preview.headers.map((h, cIdx) => (
                          <td key={cIdx} className="px-3 py-1.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {String(row[h] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Drag and Drop Box */
        <div className="space-y-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              {loading ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>

            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              {loading ? 'Processing Spreadsheet...' : 'Drop CSV or Excel files here, or click to browse'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Supports .csv, .xlsx, and .xls spreadsheets. Instantly detects types, builds KPI cards, and visualizes charts.
            </p>

            <button
              type="button"
              disabled={loading}
              className="mt-4 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm transition-colors"
            >
              Browse Local Files
            </button>
          </div>

          {/* Sample Datasets Showcase */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Or explore instantly with prepared datasets
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SAMPLE_DATASETS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="group p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl cursor-pointer transition-all hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                        {sample.badge}
                      </span>
                      <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                        {sample.rows} rows · {sample.columns} cols
                      </div>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {sample.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {sample.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end text-[11px] font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Load Dataset</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isInitialScreen) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Data Analytics & Visualization Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Smart Data Analytics Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Upload any CSV or Excel spreadsheet to immediately unlock automated column type detection,
            multivariate filtering, interactive Chart.js visualizations, statistical summaries, and clean data exports.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto">
        {content}
      </div>
    </div>
  );
};
