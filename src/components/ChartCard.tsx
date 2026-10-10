import React, { useEffect, useRef, useState } from 'react';
import {
  Chart,
  registerables,
  ChartConfiguration,
} from 'chart.js';
import {
  Download,
  Settings2,
  Trash2,
  Maximize2,
  BarChart2,
  LineChart,
  PieChart as PieIcon,
  CircleDot,
  ScatterChart,
  Layers,
  ChevronDown,
  X,
} from 'lucide-react';
import { ChartConfig, ChartType, AggregationType, ColumnMeta } from '../types/analytics';
import { computeChartData } from '../utils/dataProcessor';

Chart.register(...registerables);

interface ChartCardProps {
  config: ChartConfig;
  filteredData: Record<string, any>[];
  columns: ColumnMeta[];
  columnMetaMap: Map<string, ColumnMeta>;
  onUpdateConfig: (updated: ChartConfig) => void;
  onRemove: (id: string) => void;
  isDarkMode: boolean;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  config,
  filteredData,
  columns,
  columnMetaMap,
  onUpdateConfig,
  onRemove,
  isDarkMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(config.title);

  const numericCols = columns.filter((c) => c.type === 'numeric');

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const chartData = computeChartData(filteredData, config, columnMetaMap);
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const textColor = isDarkMode ? '#94A3B8' : '#64748B';
    const gridColor = isDarkMode ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';

    let chartJsType: any = 'bar';
    if (config.type === 'line' || config.type === 'area') {
      chartJsType = 'line';
    } else if (config.type === 'pie') {
      chartJsType = 'pie';
    } else if (config.type === 'doughnut') {
      chartJsType = 'doughnut';
    } else if (config.type === 'scatter') {
      chartJsType = 'scatter';
    } else if (config.type === 'histogram') {
      chartJsType = 'bar';
    }

    const options: any = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 350,
      },
      plugins: {
        legend: {
          display: config.type === 'pie' || config.type === 'doughnut',
          position: 'bottom',
          labels: {
            color: textColor,
            font: { family: 'Plus Jakarta Sans', size: 11 },
            boxWidth: 12,
            padding: 10,
          },
        },
        tooltip: {
          backgroundColor: isDarkMode ? '#0F172A' : '#1E293B',
          titleColor: '#FFFFFF',
          bodyColor: '#E2E8F0',
          titleFont: { family: 'Plus Jakarta Sans', weight: 'bold', size: 12 },
          bodyFont: { family: 'JetBrains Mono', size: 11 },
          padding: 10,
          cornerRadius: 8,
        },
      },
      scales:
        config.type === 'pie' || config.type === 'doughnut'
          ? {}
          : {
              x: {
                grid: { color: gridColor },
                ticks: {
                  color: textColor,
                  font: { family: 'Plus Jakarta Sans', size: 10 },
                  maxRotation: 45,
                  minRotation: 0,
                },
              },
              y: {
                grid: { color: gridColor },
                ticks: {
                  color: textColor,
                  font: { family: 'JetBrains Mono', size: 10 },
                },
              },
            },
    };

    try {
      const newChart = new Chart(ctx, {
        type: chartJsType,
        data: chartData,
        options,
      });
      chartInstanceRef.current = newChart;
    } catch (e) {
      console.error('Error rendering chart', e);
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [config, filteredData, isDarkMode, columnMetaMap]);

  const handleDownloadImage = () => {
    if (!chartInstanceRef.current) return;
    const url = chartInstanceRef.current.toBase64Image();
    const link = document.createElement('a');
    link.download = `${config.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
    link.href = url;
    link.click();
  };

  const handleSaveTitle = () => {
    onUpdateConfig({ ...config, title: tempTitle });
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden flex flex-col transition-all print-break-inside-avoid">
      {/* Chart Header Bar */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="px-2 py-0.5 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
              />
              <button
                onClick={handleSaveTitle}
                className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setTempTitle(config.title);
                  setIsEditing(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h4
                onClick={() => setIsEditing(true)}
                className="text-xs font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                title="Click to rename"
              >
                {config.title}
              </h4>
              <span className="text-[10px] text-slate-400 font-mono uppercase">
                {config.type} · {config.aggregation}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0 no-print">
          {/* Quick Type switcher */}
          <select
            value={config.type}
            onChange={(e) => onUpdateConfig({ ...config, type: e.target.value as ChartType })}
            className="text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="area">Area</option>
            <option value="pie">Pie</option>
            <option value="doughnut">Doughnut</option>
            <option value="histogram">Histogram</option>
            <option value="scatter">Scatter</option>
          </select>

          {/* Download PNG */}
          <button
            onClick={handleDownloadImage}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Download PNG image"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Remove Card */}
          <button
            onClick={() => onRemove(config.id)}
            className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Remove chart"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Axis & Aggregation Configuration Bar */}
      <div className="px-4 py-2 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-3 text-[11px] no-print">
        {/* X-Axis */}
        <div className="flex items-center gap-1">
          <span className="text-slate-500 font-medium">X:</span>
          <select
            value={config.xColumn}
            onChange={(e) => onUpdateConfig({ ...config, xColumn: e.target.value })}
            className="bg-transparent font-medium text-slate-700 dark:text-slate-300 border-none focus:outline-none cursor-pointer max-w-[130px] truncate"
          >
            {columns.map((col) => (
              <option key={col.name} value={col.name} className="bg-white dark:bg-slate-900">
                {col.name} ({col.type})
              </option>
            ))}
          </select>
        </div>

        {/* Y-Axis (if applicable) */}
        {config.type !== 'histogram' && (
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Y:</span>
            <select
              value={config.yColumn || ''}
              onChange={(e) => onUpdateConfig({ ...config, yColumn: e.target.value || undefined })}
              className="bg-transparent font-medium text-slate-700 dark:text-slate-300 border-none focus:outline-none cursor-pointer max-w-[130px] truncate"
            >
              <option value="" className="bg-white dark:bg-slate-900">(Record Count)</option>
              {numericCols.map((col) => (
                <option key={col.name} value={col.name} className="bg-white dark:bg-slate-900">
                  {col.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Aggregation */}
        {config.type !== 'scatter' && config.type !== 'histogram' && (
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Agg:</span>
            <select
              value={config.aggregation}
              onChange={(e) => onUpdateConfig({ ...config, aggregation: e.target.value as AggregationType })}
              className="bg-transparent font-semibold text-blue-600 dark:text-blue-400 border-none focus:outline-none cursor-pointer uppercase"
            >
              <option value="sum" className="bg-white dark:bg-slate-900">SUM</option>
              <option value="avg" className="bg-white dark:bg-slate-900">AVG</option>
              <option value="count" className="bg-white dark:bg-slate-900">COUNT</option>
              <option value="min" className="bg-white dark:bg-slate-900">MIN</option>
              <option value="max" className="bg-white dark:bg-slate-900">MAX</option>
            </select>
          </div>
        )}
      </div>

      {/* Chart Canvas Area */}
      <div className="p-4 flex-1 min-h-[280px] relative">
        {filteredData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
            No matching rows for active filters.
          </div>
        ) : (
          <canvas ref={canvasRef} className="w-full h-full" />
        )}
      </div>
    </div>
  );
};
