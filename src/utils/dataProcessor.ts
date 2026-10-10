import * as XLSX from 'xlsx';
import { ColumnMeta, ColumnType, Dataset, ChartConfig, FilterState, AggregationType } from '../types/analytics';

export function isNumeric(val: any): boolean {
  if (val === null || val === undefined || val === '') return false;
  if (typeof val === 'number') return !isNaN(val) && isFinite(val);
  if (typeof val === 'string') {
    const cleaned = val.replace(/[$,% ]/g, '').trim();
    if (cleaned === '') return false;
    return !isNaN(Number(cleaned)) && isFinite(Number(cleaned));
  }
  return false;
}

export function parseNumeric(val: any): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[$,% ]/g, '').trim();
    return Number(cleaned);
  }
  return 0;
}

export function isDate(val: any): boolean {
  if (val === null || val === undefined || val === '') return false;
  if (val instanceof Date) return !isNaN(val.getTime());
  if (typeof val === 'string') {
    // Check if it's a date-like pattern (YYYY-MM-DD, MM/DD/YYYY, etc.)
    const datePattern = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}|^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/;
    if (datePattern.test(val.trim())) {
      const parsed = Date.parse(val);
      return !isNaN(parsed);
    }
  }
  return false;
}

export function normalizeDate(val: any): string {
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  if (typeof val === 'string') {
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }
  return String(val);
}

export function analyzeDataset(
  rawData: Record<string, any>[],
  fileName: string,
  fileSize: number
): Dataset {
  if (!rawData || rawData.length === 0) {
    throw new Error('Dataset is empty or has no rows.');
  }

  // Extract and normalize unique column names
  const rawKeys = Object.keys(rawData[0] || {});
  if (rawKeys.length === 0) {
    throw new Error('Dataset has no valid column headers.');
  }

  const columns: ColumnMeta[] = [];
  const rowCount = rawData.length;

  // Track duplicate rows
  const rowSignatures = new Set<string>();
  let duplicateRows = 0;
  for (const row of rawData) {
    const sig = JSON.stringify(row);
    if (rowSignatures.has(sig)) {
      duplicateRows++;
    } else {
      rowSignatures.add(sig);
    }
  }

  let missingTotal = 0;

  for (const colName of rawKeys) {
    let missingCount = 0;
    let numericCount = 0;
    let dateCount = 0;
    const values: any[] = [];
    const distinctSet = new Set<string>();

    for (const row of rawData) {
      const val = row[colName];
      if (val === null || val === undefined || val === '' || String(val).trim() === '') {
        missingCount++;
        missingTotal++;
      } else {
        values.push(val);
        distinctSet.add(String(val).trim());
        if (isNumeric(val)) numericCount++;
        if (isDate(val)) dateCount++;
      }
    }

    const nonMissingCount = values.length;
    let colType: ColumnType = 'text';

    if (nonMissingCount > 0 && numericCount / nonMissingCount >= 0.75) {
      colType = 'numeric';
    } else if (nonMissingCount > 0 && dateCount / nonMissingCount >= 0.75) {
      colType = 'date';
    } else if (distinctSet.size <= Math.min(100, Math.max(5, rowCount * 0.3))) {
      colType = 'categorical';
    }

    const distinctValues = Array.from(distinctSet).slice(0, 50);

    const meta: ColumnMeta = {
      name: colName,
      type: colType,
      uniqueCount: distinctSet.size,
      missingCount,
      distinctValues,
    };

    if (colType === 'numeric') {
      const numVals = values
        .filter(isNumeric)
        .map(parseNumeric)
        .sort((a, b) => a - b);
      if (numVals.length > 0) {
        meta.min = numVals[0];
        meta.max = numVals[numVals.length - 1];
        const sum = numVals.reduce((acc, curr) => acc + curr, 0);
        meta.sum = sum;
        meta.mean = Number((sum / numVals.length).toFixed(2));
        const mid = Math.floor(numVals.length / 2);
        meta.median =
          numVals.length % 2 !== 0
            ? numVals[mid]
            : Number(((numVals[mid - 1] + numVals[mid]) / 2).toFixed(2));
      }
    } else if (colType === 'date') {
      const sortedDates = values
        .filter(isDate)
        .map((d) => normalizeDate(d))
        .sort();
      if (sortedDates.length > 0) {
        meta.dateMin = sortedDates[0];
        meta.dateMax = sortedDates[sortedDates.length - 1];
      }
    }

    columns.push(meta);
  }

  // Generate default intelligent chart suggestions
  const charts = generateDefaultCharts(columns, rawData);

  // Generate narrative summary
  const humanSummary = generateNarrativeSummary(
    fileName,
    rowCount,
    columns,
    missingTotal,
    duplicateRows
  );

  return {
    fileName,
    fileSize,
    rowCount,
    columnCount: columns.length,
    missingTotal,
    duplicateRows,
    columns,
    data: rawData,
    charts,
    humanSummary,
  };
}

export function generateDefaultCharts(columns: ColumnMeta[], data: Record<string, any>[]): ChartConfig[] {
  const charts: ChartConfig[] = [];
  const numericCols = columns.filter((c) => c.type === 'numeric');
  const categoricalCols = columns.filter((c) => c.type === 'categorical');
  const dateCols = columns.filter((c) => c.type === 'date');

  // Chart 1: Categorical Bar Chart (Primary category by key metric or count)
  if (categoricalCols.length > 0 && numericCols.length > 0) {
    const primaryCat = categoricalCols[0];
    const primaryNum = numericCols[0];
    charts.push({
      id: 'chart_1',
      title: `${primaryNum.name} by ${primaryCat.name}`,
      type: 'bar',
      xColumn: primaryCat.name,
      yColumn: primaryNum.name,
      aggregation: 'sum',
    });
  } else if (categoricalCols.length > 0) {
    charts.push({
      id: 'chart_1',
      title: `Distribution of ${categoricalCols[0].name}`,
      type: 'bar',
      xColumn: categoricalCols[0].name,
      aggregation: 'count',
    });
  }

  // Chart 2: Time Trend or Second Category
  if (dateCols.length > 0 && numericCols.length > 0) {
    charts.push({
      id: 'chart_2',
      title: `${numericCols[0].name} Trend over Time`,
      type: 'line',
      xColumn: dateCols[0].name,
      yColumn: numericCols[0].name,
      aggregation: 'sum',
    });
  } else if (categoricalCols.length > 1 && numericCols.length > 0) {
    charts.push({
      id: 'chart_2',
      title: `${numericCols[0].name} by ${categoricalCols[1].name}`,
      type: 'bar',
      xColumn: categoricalCols[1].name,
      yColumn: numericCols[0].name,
      aggregation: 'avg',
    });
  } else if (numericCols.length >= 2) {
    charts.push({
      id: 'chart_2',
      title: `${numericCols[0].name} vs ${numericCols[1].name}`,
      type: 'scatter',
      xColumn: numericCols[0].name,
      yColumn: numericCols[1].name,
      aggregation: 'count',
    });
  }

  // Chart 3: Doughnut / Pie Chart (Categorical breakdown)
  const lowCardCat = categoricalCols.find((c) => c.uniqueCount >= 2 && c.uniqueCount <= 10) || categoricalCols[0];
  if (lowCardCat) {
    charts.push({
      id: 'chart_3',
      title: `Share by ${lowCardCat.name}`,
      type: 'doughnut',
      xColumn: lowCardCat.name,
      yColumn: numericCols.length > 0 ? numericCols[0].name : undefined,
      aggregation: numericCols.length > 0 ? 'sum' : 'count',
    });
  }

  // Chart 4: Numeric Distribution (Histogram or Area)
  if (numericCols.length > 0) {
    const targetNum = numericCols.length > 1 ? numericCols[1] : numericCols[0];
    charts.push({
      id: 'chart_4',
      title: `Distribution of ${targetNum.name}`,
      type: 'histogram',
      xColumn: targetNum.name,
      aggregation: 'count',
    });
  }

  return charts;
}

function generateNarrativeSummary(
  fileName: string,
  rowCount: number,
  columns: ColumnMeta[],
  missingTotal: number,
  duplicateRows: number
): string {
  const numericCount = columns.filter((c) => c.type === 'numeric').length;
  const catCount = columns.filter((c) => c.type === 'categorical').length;
  const dateCount = columns.filter((c) => c.type === 'date').length;
  const textCount = columns.filter((c) => c.type === 'text').length;

  const totalCells = rowCount * columns.length;
  const completeness = totalCells > 0 ? (((totalCells - missingTotal) / totalCells) * 100).toFixed(1) : '100';

  let summary = `Dataset "${fileName}" comprises ${rowCount.toLocaleString()} records across ${columns.length} columns `;
  summary += `(${numericCount} numeric, ${catCount} categorical, ${dateCount} date, and ${textCount} text fields). `;
  summary += `Data completeness is ${completeness}% with ${missingTotal} missing entries `;
  summary += duplicateRows > 0 ? `and ${duplicateRows} duplicate rows identified. ` : 'and zero duplicate records detected. ';

  const keyNumeric = columns.find((c) => c.type === 'numeric' && c.sum !== undefined);
  if (keyNumeric && keyNumeric.sum !== undefined && keyNumeric.mean !== undefined) {
    summary += `Primary quantitative measure "${keyNumeric.name}" registers a cumulative sum of ${keyNumeric.sum.toLocaleString(undefined, { maximumFractionDigits: 2 })} (mean: ${keyNumeric.mean.toLocaleString(undefined, { maximumFractionDigits: 2 })}, range: ${keyNumeric.min?.toLocaleString()} to ${keyNumeric.max?.toLocaleString()}). `;
  }

  const keyCat = columns.find((c) => c.type === 'categorical');
  if (keyCat) {
    summary += `Primary categorical dimension "${keyCat.name}" encompasses ${keyCat.uniqueCount} distinct groups.`;
  }

  return summary;
}

export function filterDataset(data: Record<string, any>[], filters: FilterState, columns: ColumnMeta[]): Record<string, any>[] {
  const colMap = new Map(columns.map((c) => [c.name, c]));

  return data.filter((row) => {
    // 1. Global search
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      const match = Object.values(row).some((val) => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      });
      if (!match) return false;
    }

    // 2. Categorical filters
    for (const [col, selectedVals] of Object.entries(filters.categorical)) {
      if (selectedVals && selectedVals.length > 0) {
        const rowVal = String(row[col] ?? '').trim();
        if (!selectedVals.includes(rowVal)) {
          return false;
        }
      }
    }

    // 3. Numeric filters
    for (const [col, range] of Object.entries(filters.numeric)) {
      if (range) {
        const val = row[col];
        if (!isNumeric(val)) return false;
        const numVal = parseNumeric(val);
        if (range.min !== undefined && numVal < range.min) return false;
        if (range.max !== undefined && numVal > range.max) return false;
      }
    }

    // 4. Date filters
    for (const [col, range] of Object.entries(filters.dates)) {
      if (range) {
        const val = row[col];
        const dateStr = normalizeDate(val);
        if (range.start && dateStr < range.start) return false;
        if (range.end && dateStr > range.end) return false;
      }
    }

    return true;
  });
}

export interface ChartDataResult {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }[];
}

const PALETTE = [
  '#2563EB', // Blue 600
  '#7C3AED', // Purple 600
  '#059669', // Emerald 600
  '#D97706', // Amber 600
  '#DC2626', // Red 600
  '#0891B2', // Cyan 600
  '#4F46E5', // Indigo 600
  '#DB2777', // Pink 600
  '#65A30D', // Lime 600
  '#EA580C', // Orange 600
  '#9333EA', // Purple
  '#0284C7', // Sky
];

export function computeChartData(
  filteredData: Record<string, any>[],
  config: ChartConfig,
  columnMetaMap: Map<string, ColumnMeta>
): ChartDataResult {
  const { type, xColumn, yColumn, aggregation } = config;

  if (filteredData.length === 0) {
    return {
      labels: [],
      datasets: [{ label: config.title, data: [] }],
    };
  }

  // Handle Histogram
  if (type === 'histogram') {
    const values = filteredData
      .map((r) => r[xColumn])
      .filter(isNumeric)
      .map(parseNumeric)
      .sort((a, b) => a - b);

    if (values.length === 0) {
      return { labels: [], datasets: [{ label: 'Frequency', data: [] }] };
    }

    const min = values[0];
    const max = values[values.length - 1];
    const binCount = Math.min(10, Math.max(4, Math.floor(Math.sqrt(values.length))));
    const step = (max - min) / binCount || 1;

    const bins: number[] = new Array(binCount).fill(0);
    const binLabels: string[] = [];

    for (let i = 0; i < binCount; i++) {
      const start = min + i * step;
      const end = i === binCount - 1 ? max : min + (i + 1) * step;
      binLabels.push(`${start.toFixed(1)} - ${end.toFixed(1)}`);
    }

    for (const v of values) {
      let idx = Math.floor((v - min) / step);
      if (idx >= binCount) idx = binCount - 1;
      if (idx < 0) idx = 0;
      bins[idx]++;
    }

    return {
      labels: binLabels,
      datasets: [
        {
          label: `Frequency of ${xColumn}`,
          data: bins,
          backgroundColor: '#3B82F6',
          borderColor: '#1D4ED8',
          borderWidth: 1,
        },
      ],
    };
  }

  // Handle Scatter Plot
  if (type === 'scatter') {
    // For scatter, we format x & y pairs
    const pairs: { x: number; y: number }[] = [];
    for (const r of filteredData) {
      if (isNumeric(r[xColumn]) && yColumn && isNumeric(r[yColumn])) {
        pairs.push({
          x: parseNumeric(r[xColumn]),
          y: parseNumeric(r[yColumn]),
        });
      }
    }
    return {
      labels: pairs.map((_, i) => `Point ${i + 1}`),
      datasets: [
        {
          label: `${yColumn || 'Value'} vs ${xColumn}`,
          data: pairs as any,
          backgroundColor: '#7C3AED',
          borderColor: '#6D28D9',
        },
      ],
    };
  }

  // Grouping aggregation for Bar, Line, Pie, Doughnut, Area
  const groups = new Map<string, number[]>();

  for (const row of filteredData) {
    const rawX = row[xColumn];
    const key = rawX !== null && rawX !== undefined && String(rawX).trim() !== ''
      ? String(rawX).trim()
      : '(Empty)';

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    if (yColumn) {
      const rawY = row[yColumn];
      if (isNumeric(rawY)) {
        groups.get(key)!.push(parseNumeric(rawY));
      }
    } else {
      groups.get(key)!.push(1);
    }
  }

  // Calculate aggregation
  const calculatedMap = new Map<string, number>();

  for (const [key, vals] of groups.entries()) {
    if (vals.length === 0) {
      calculatedMap.set(key, 0);
      continue;
    }

    let result = 0;
    if (aggregation === 'count') {
      result = vals.length;
    } else if (aggregation === 'sum') {
      result = vals.reduce((a, b) => a + b, 0);
    } else if (aggregation === 'avg') {
      result = vals.reduce((a, b) => a + b, 0) / vals.length;
    } else if (aggregation === 'min') {
      result = Math.min(...vals);
    } else if (aggregation === 'max') {
      result = Math.max(...vals);
    }

    calculatedMap.set(key, Number(result.toFixed(2)));
  }

  // Sort labels: if date, sort chronologically; otherwise if bar/doughnut with many items, top 12 by value or natural
  let sortedKeys = Array.from(calculatedMap.keys());
  const xColMeta = columnMetaMap.get(xColumn);

  if (xColMeta?.type === 'date') {
    sortedKeys.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  } else if (sortedKeys.length > 15) {
    // Sort descending by value to show top 15 categories for clean visualization
    sortedKeys.sort((a, b) => (calculatedMap.get(b) || 0) - (calculatedMap.get(a) || 0));
    sortedKeys = sortedKeys.slice(0, 15);
  }

  const values = sortedKeys.map((k) => calculatedMap.get(k) || 0);

  const isCircular = type === 'pie' || type === 'doughnut';
  const colors = isCircular
    ? sortedKeys.map((_, i) => PALETTE[i % PALETTE.length])
    : type === 'area'
    ? '#3B82F6'
    : '#2563EB';

  const borderColors = isCircular
    ? sortedKeys.map((_, i) => PALETTE[i % PALETTE.length])
    : '#1D4ED8';

  return {
    labels: sortedKeys,
    datasets: [
      {
        label: `${aggregation.toUpperCase()} of ${yColumn || 'Records'}`,
        data: values,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1.5,
        fill: type === 'area',
      },
    ],
  };
}

// File parser utility supporting CSV, XLSX, XLS
export async function parseFile(file: File): Promise<{ data: Record<string, any>[]; fileName: string; fileSize: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) {
          throw new Error('Failed to read file buffer.');
        }

        const workbook = XLSX.read(buffer, {
          type: 'binary',
          cellDates: true,
          dateNF: 'yyyy-mm-dd',
        });

        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('No worksheets found in uploaded file.');
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, {
          defval: '',
          raw: false,
        });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('The spreadsheet contains no data or rows.');
        }

        resolve({
          data: rawJson,
          fileName: file.name,
          fileSize: file.size,
        });
      } catch (err: any) {
        reject(new Error(err.message || 'Error processing spreadsheet file.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('File reading failed. Please ensure file is valid.'));
    };

    reader.readAsBinaryString(file);
  });
}
